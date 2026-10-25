<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Camera, ChevronLeft, ChevronRight, Images, Loader2, Trash2, X } from 'lucide-vue-next'
import { api, photoUrl } from '@/api'
import { useAction } from '@/composables'
import { compressImage } from '@/utils/image'
import { PHOTO_PHASES } from '@/utils/format'

const props = defineProps({
  jobId: { type: Number, required: true },
  photos: { type: Array, required: true },
})
const emit = defineEmits(['changed'])

const byPhase = computed(() => {
  const groups = { before: [], during: [], after: [] }
  for (const p of props.photos) groups[p.phase]?.push(p)
  return groups
})
// Viewer order: before, during, after.
const ordered = computed(() => [...byPhase.value.before, ...byPhase.value.during, ...byPhase.value.after])

// --- Upload ---
const phase = ref('before')
const progress = ref('')
const cameraInput = ref(null)
const galleryInput = ref(null)

const upload = useAction(async (event) => {
  const files = [...event.target.files]
  event.target.value = ''
  if (!files.length) return
  try {
    // One request per photo: keeps each request small and gives visible progress.
    for (const [i, file] of files.entries()) {
      progress.value = files.length > 1 ? `Envoi ${i + 1}/${files.length}…` : 'Envoi…'
      const form = new FormData()
      form.append('phase', phase.value)
      form.append('files', await compressImage(file))
      await api.post(`/jobs/${props.jobId}/photos`, form)
    }
  } finally {
    progress.value = ''
    emit('changed')
  }
})

// --- Full-screen viewer ---
// Tracked by id: moving a photo to another phase changes its position in `ordered`.
const currentId = ref(null)
const current = computed(() => ordered.value.find((p) => p.id === currentId.value) ?? null)
const index = computed(() => ordered.value.indexOf(current.value))
const caption = ref('')

watch(current, (p, old) => p?.id !== old?.id && (caption.value = p?.caption ?? ''))
watch(currentId, (id) => (document.body.style.overflow = id === null ? '' : 'hidden'))
onBeforeUnmount(() => (document.body.style.overflow = ''))

const open = (photo) => (currentId.value = photo.id)
const close = () => (currentId.value = null)
const neighbour = (delta) => {
  const n = ordered.value.length
  return ordered.value[(index.value + delta + n) % n]
}
const go = (delta) => (currentId.value = neighbour(delta).id)

let touchX = null
const onTouchStart = (e) => (touchX = e.touches[0].clientX)
function onTouchEnd(e) {
  if (touchX === null) return
  const dx = e.changedTouches[0].clientX - touchX
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  touchX = null
}

const save = useAction(async (patch) => {
  await api.put(`/photos/${current.value.id}`, { phase: current.value.phase, caption: caption.value, ...patch })
  emit('changed')
})

const remove = useAction(async () => {
  if (!confirm('Supprimer définitivement cette photo ?')) return
  const next = ordered.value.length > 1 ? neighbour(1).id : null
  await api.del(`/photos/${current.value.id}`)
  currentId.value = next
  emit('changed')
})
</script>

<template>
  <section class="card">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="section-title mb-0">Photos</h3>
      <span class="text-sm text-slate-500">{{ photos.length }}</span>
    </div>

    <!-- Before / after side by side -->
    <div class="grid grid-cols-2 gap-3">
      <div v-for="ph in ['before', 'after']" :key="ph">
        <p class="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {{ PHOTO_PHASES[ph] }} <span class="font-normal">({{ byPhase[ph].length }})</span>
        </p>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button v-for="p in byPhase[ph]" :key="p.id" class="block overflow-hidden rounded-lg" @click="open(p)">
            <img :src="photoUrl(p.id)" :alt="p.caption ?? ''" loading="lazy" class="aspect-[4/3] w-full bg-slate-100 object-cover" />
          </button>
          <div
            v-if="!byPhase[ph].length"
            class="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400"
          >
            Aucune photo
          </div>
        </div>
      </div>
    </div>

    <div v-if="byPhase.during.length" class="mt-4">
      <p class="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Pendant <span class="font-normal">({{ byPhase.during.length }})</span>
      </p>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <button v-for="p in byPhase.during" :key="p.id" class="overflow-hidden rounded-lg" @click="open(p)">
          <img :src="photoUrl(p.id)" :alt="p.caption ?? ''" loading="lazy" class="aspect-square w-full bg-slate-100 object-cover" />
        </button>
      </div>
    </div>

    <!-- Upload controls -->
    <div class="no-print mt-4 space-y-2 border-t border-slate-100 pt-4">
      <p class="text-xs text-slate-500">Ajouter des photos :</p>
      <div class="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
        <button
          v-for="(label, value) in PHOTO_PHASES"
          :key="value"
          type="button"
          class="rounded-md py-2 text-sm font-medium"
          :class="phase === value ? 'bg-white shadow-sm' : 'text-slate-500'"
          @click="phase = value"
        >
          {{ label }}
        </button>
      </div>
      <div class="grid grid-cols-[1fr_auto] gap-2">
        <button class="btn btn-primary py-3" :disabled="upload.busy.value" @click="cameraInput.click()">
          <Loader2 v-if="upload.busy.value" class="size-5 animate-spin" />
          <Camera v-else class="size-5" />
          {{ progress || 'Prendre une photo' }}
        </button>
        <button class="btn px-4 py-3" :disabled="upload.busy.value" aria-label="Choisir dans la galerie" @click="galleryInput.click()">
          <Images class="size-5" />
        </button>
      </div>
      <input ref="cameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="upload.run" />
      <input ref="galleryInput" type="file" accept="image/*" multiple class="hidden" @change="upload.run" />
      <p v-if="upload.error.value" class="text-sm text-red-600">{{ upload.error.value }}</p>
    </div>

    <Teleport to="body">
      <div v-if="current" class="fixed inset-0 z-50 flex flex-col bg-black text-white">
        <div class="flex items-center justify-between px-2 pt-[env(safe-area-inset-top)]">
          <span class="px-2 text-sm text-white/70">
            {{ PHOTO_PHASES[current.phase] }} · {{ index + 1 }}/{{ ordered.length }}
          </span>
          <button class="rounded-full p-3 active:bg-white/10" aria-label="Fermer" @click="close"><X class="size-6" /></button>
        </div>

        <div class="relative flex min-h-0 flex-1 items-center justify-center" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
          <img :key="current.id" :src="photoUrl(current.id)" :alt="current.caption ?? ''" class="max-h-full max-w-full object-contain" />
          <template v-if="ordered.length > 1">
            <button class="absolute left-1 rounded-full bg-black/40 p-2 active:bg-white/20" aria-label="Précédente" @click="go(-1)">
              <ChevronLeft class="size-6" />
            </button>
            <button class="absolute right-1 rounded-full bg-black/40 p-2 active:bg-white/20" aria-label="Suivante" @click="go(1)">
              <ChevronRight class="size-6" />
            </button>
          </template>
        </div>

        <div class="space-y-2 bg-black/80 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div class="grid grid-cols-3 gap-1 rounded-lg bg-white/10 p-1">
            <button
              v-for="(label, value) in PHOTO_PHASES"
              :key="value"
              class="rounded-md py-1.5 text-sm"
              :class="current.phase === value ? 'bg-white font-medium text-black' : 'text-white/70'"
              :disabled="save.busy.value"
              @click="value !== current.phase && save.run({ phase: value })"
            >
              {{ label }}
            </button>
          </div>
          <form class="flex gap-2" @submit.prevent="save.run()">
            <input
              v-model="caption"
              class="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2.5 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Légende…"
            />
            <button v-if="caption !== (current.caption ?? '')" type="submit" class="rounded-lg bg-white px-4 text-sm font-medium text-black">OK</button>
            <button type="button" class="rounded-lg bg-red-600/90 px-3" aria-label="Supprimer la photo" :disabled="remove.busy.value" @click="remove.run">
              <Trash2 class="size-5" />
            </button>
          </form>
          <p v-if="save.error.value || remove.error.value" class="text-sm text-red-400">{{ save.error.value || remove.error.value }}</p>
        </div>
      </div>
    </Teleport>
  </section>
</template>

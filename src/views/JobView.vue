<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Calendar, CalendarCheck, Check, ChevronRight, Pencil, Printer } from 'lucide-vue-next'
import { api } from '@/api'
import { useAction, useLoader } from '@/composables'
import { toast } from '@/stores/toast'
import { JOB_STATUSES, STATUS_FLOW, formatDate, formatMoney, today, vehicleTitle } from '@/utils/format'
import { VEHICLE_ICONS } from '@/utils/icons'
import AppModal from '@/components/AppModal.vue'
import AppSpinner from '@/components/AppSpinner.vue'
import ContactButtons from '@/components/ContactButtons.vue'
import JobForm from '@/components/JobForm.vue'
import JobItems from '@/components/JobItems.vue'
import PhotoGallery from '@/components/PhotoGallery.vue'
import PlateBadge from '@/components/PlateBadge.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const job = useLoader(() => api.get(`/jobs/${props.id}`))
const editing = ref(false)
const print = () => window.print()

watch(() => props.id, job.load)
onMounted(job.load)

const stepIndex = computed(() => STATUS_FLOW.indexOf(job.data.value?.status))

async function update(data) {
  await api.put(`/jobs/${props.id}`, data)
  editing.value = false
  toast('Passage enregistré')
  await job.load()
}

const setStatus = useAction(async (status) => {
  if (status === job.data.value.status) return
  if (status === 'cancelled' && !confirm('Annuler ce passage ?')) return
  const data = { status }
  // Fill the exit date automatically when the job is finished, unless already set.
  if (status === 'done' && !job.data.value.date_out) data.date_out = today()
  await api.put(`/jobs/${props.id}`, data)
  toast(`Statut : ${JOB_STATUSES[status].label}`)
  await job.load()
})

const remove = useAction(async () => {
  if (!confirm('Supprimer ce passage, ses lignes et toutes ses photos ? Cette action est irréversible.')) return
  const vehicleId = job.data.value.vehicle_id
  await api.del(`/jobs/${props.id}`)
  toast('Passage supprimé')
  router.replace({ name: 'vehicle', params: { id: vehicleId } })
})
</script>

<template>
  <div>
    <p v-if="job.error.value" class="text-sm text-red-600">{{ job.error.value }}</p>
    <AppSpinner v-if="!job.data.value && job.loading.value" />
    <div v-if="job.data.value" class="space-y-3">
      <section class="hero space-y-4">
        <div class="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-blue-500/20 blur-2xl" />
        <div class="relative flex items-start gap-3">
          <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <component :is="VEHICLE_ICONS[job.data.value.vehicle_type]" class="size-6 text-blue-200" />
          </span>
          <div class="min-w-0 flex-1">
            <RouterLink :to="{ name: 'vehicle', params: { id: job.data.value.vehicle_id } }" class="line-clamp-2 block text-xl leading-tight font-bold tracking-tight">
              {{ vehicleTitle(job.data.value) }}
            </RouterLink>
            <RouterLink
              :to="{ name: 'customer', params: { id: job.data.value.customer_id } }"
              class="inline-flex items-center gap-0.5 text-sm text-slate-300"
            >
              {{ job.data.value.customer_name }} <ChevronRight class="size-3.5" />
            </RouterLink>
          </div>
          <PlateBadge :plate="job.data.value.plate" />
        </div>
        <div class="relative flex items-end justify-between">
          <div class="flex gap-4 text-xs text-slate-400">
            <span class="flex items-center gap-1"><Calendar class="size-3.5" /> {{ formatDate(job.data.value.date_in) }}</span>
            <span v-if="job.data.value.date_out" class="flex items-center gap-1">
              <CalendarCheck class="size-3.5" /> {{ formatDate(job.data.value.date_out) }}
            </span>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-400">{{ job.data.value.final_price !== null ? 'Prix final' : 'Total travaux' }}</p>
            <p class="text-2xl font-bold tracking-tight">{{ formatMoney(job.data.value.final_price ?? job.data.value.items_total) }}</p>
          </div>
        </div>
        <ContactButtons class="relative" :phone="job.data.value.customer_phone" dark />
      </section>

      <!-- Status stepper -->
      <section class="no-print card">
        <div v-if="job.data.value.status === 'cancelled'" class="flex items-center justify-between">
          <span class="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">Passage annulé</span>
          <button class="btn px-3 py-1.5" @click="setStatus.run('quote')">Réactiver</button>
        </div>
        <template v-else>
          <ol class="grid grid-cols-3">
            <li v-for="(s, i) in STATUS_FLOW" :key="s" class="relative">
              <span
                v-if="i > 0"
                class="absolute top-[1.125rem] right-[calc(50%+1.25rem)] h-1 w-[calc(100%-2.5rem)] rounded-full transition-colors"
                :class="i <= stepIndex ? 'bg-blue-500' : 'bg-slate-200'"
              />
              <button
                class="relative flex w-full flex-col items-center gap-1.5 text-xs font-semibold"
                :class="i <= stepIndex ? 'text-slate-900' : 'text-slate-400'"
                :disabled="setStatus.busy.value"
                @click="setStatus.run(s)"
              >
                <span
                  class="flex size-9 items-center justify-center rounded-full transition-all"
                  :class="
                    i < stepIndex
                      ? 'bg-blue-500 text-white'
                      : i === stepIndex
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                  "
                >
                  <Check v-if="i < stepIndex" class="size-4" stroke-width="3" />
                  <span v-else>{{ i + 1 }}</span>
                </span>
                {{ JOB_STATUSES[s].label }}
              </button>
            </li>
          </ol>
          <button class="mt-3 w-full text-center text-xs font-medium text-slate-400" @click="setStatus.run('cancelled')">Annuler le passage</button>
        </template>
        <p v-if="setStatus.error.value" class="mt-2 text-sm text-red-600">{{ setStatus.error.value }}</p>
      </section>

      <!-- Details -->
      <section class="card">
        <div class="flex items-center justify-between">
          <h3 class="section-title mb-0">Dommage constaté</h3>
          <button class="no-print -m-1 rounded-full p-2 text-slate-400 active:bg-slate-100" aria-label="Modifier" @click="editing = true">
            <Pencil class="size-4" />
          </button>
        </div>
        <p class="mt-2 text-[15px] leading-relaxed whitespace-pre-line" :class="{ 'text-slate-400 italic': !job.data.value.description }">
          {{ job.data.value.description || 'Aucune description — touchez le crayon pour en ajouter une.' }}
        </p>
        <dl v-if="job.data.value.estimate !== null || job.data.value.final_price !== null" class="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div class="rounded-xl bg-slate-50 p-2.5">
            <dt class="text-xs text-slate-500">Estimation</dt>
            <dd class="font-semibold">{{ formatMoney(job.data.value.estimate) }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-2.5">
            <dt class="text-xs text-slate-500">Prix final</dt>
            <dd class="font-semibold">{{ formatMoney(job.data.value.final_price) }}</dd>
          </div>
        </dl>
        <p v-if="job.data.value.notes" class="no-print mt-3 rounded-xl bg-amber-50 p-3 text-sm whitespace-pre-line text-amber-900 ring-1 ring-amber-200/60">
          {{ job.data.value.notes }}
        </p>
      </section>

      <JobItems :job-id="job.data.value.id" :items="job.data.value.items" @changed="job.load" />
      <PhotoGallery :job-id="job.data.value.id" :photos="job.data.value.photos" @changed="job.load" />

      <div class="no-print flex items-center justify-between pt-2">
        <button class="btn" @click="print"><Printer class="size-4" /> Imprimer</button>
        <button class="text-sm font-medium text-red-600" :disabled="remove.busy.value" @click="remove.run">Supprimer ce passage</button>
      </div>
      <p v-if="remove.error.value" class="text-sm text-red-600">{{ remove.error.value }}</p>

      <AppModal v-if="editing" title="Modifier le passage" @close="editing = false">
        <JobForm :job="job.data.value" :submit="update" @cancel="editing = false" />
      </AppModal>
    </div>
  </div>
</template>

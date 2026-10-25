<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Camera, Plus, Search, X } from 'lucide-vue-next'
import { api } from '@/api'
import { useLoader } from '@/composables'
import { JOB_STATUSES, daysSince, formatMoney, vehicleTitle } from '@/utils/format'
import AppSpinner from '@/components/AppSpinner.vue'
import PlateBadge from '@/components/PlateBadge.vue'

const TABS = ['in_progress', 'quote', 'done']
const tab = ref('in_progress')

// Open jobs are loaded together so their tabs show a count; finished ones (they pile up) only on demand.
const open = useLoader(() => api.get('/jobs?status=quote,in_progress'))
const done = useLoader(() => api.get('/jobs?status=done'))

const counts = computed(() => {
  const c = { quote: 0, in_progress: 0 }
  for (const j of open.data.value ?? []) c[j.status]++
  return c
})
const current = computed(() => (tab.value === 'done' ? done : open))
const jobs = computed(() => {
  const rows = current.value.data.value ?? []
  return tab.value === 'done' ? rows : rows.filter((j) => j.status === tab.value)
})

watch(tab, (t) => t === 'done' && done.load())
onMounted(open.load)

const jobAmount = (j) => j.final_price ?? (j.items_total || j.estimate)
function stayLabel(j) {
  const d = daysSince(j.date_in)
  if (d === null || j.status === 'done') return null
  return d === 0 ? "Entré aujourd'hui" : `Depuis ${d} j`
}

// --- Quick search ---
const q = ref('')
const results = ref(null)
let timer
watch(q, (value) => {
  clearTimeout(timer)
  if (value.trim().length < 2) return (results.value = null)
  timer = setTimeout(async () => {
    results.value = await api.get(`/vehicles?q=${encodeURIComponent(value.trim())}`)
  }, 250)
})
</script>

<template>
  <div class="space-y-3">
    <div class="relative">
      <Search class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
      <input v-model="q" class="input pr-10 pl-10" type="text" enterkeyhint="search" placeholder="Plaque, modèle ou client…" />
      <button v-if="q" class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-slate-400" aria-label="Effacer" @click="q = ''">
        <X class="size-4" />
      </button>
    </div>

    <!-- Search results replace the dashboard while searching -->
    <template v-if="results">
      <div class="card divide-y divide-slate-100 p-0">
        <div v-if="!results.length" class="p-4 text-center text-sm text-slate-500">
          <p>Aucun véhicule trouvé.</p>
          <RouterLink to="/nouveau" class="btn btn-primary mt-3"><Plus class="size-4" /> Nouvelle entrée</RouterLink>
        </div>
        <RouterLink
          v-for="v in results"
          :key="v.id"
          :to="{ name: 'vehicle', params: { id: v.id } }"
          class="flex items-center justify-between gap-3 px-4 py-3 active:bg-slate-50"
        >
          <span class="min-w-0">
            <span class="block truncate font-medium">{{ vehicleTitle(v) }}</span>
            <span class="text-sm text-slate-500">{{ v.customer_name }}</span>
          </span>
          <PlateBadge :plate="v.plate" />
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <div class="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <button
          v-for="t in TABS"
          :key="t"
          class="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1"
          :class="tab === t ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200'"
          @click="tab = t"
        >
          {{ JOB_STATUSES[t].label }}
          <span
            v-if="t !== 'done'"
            class="rounded-full px-1.5 text-xs"
            :class="tab === t ? 'bg-white/20' : 'bg-slate-100 text-slate-500'"
          >
            {{ counts[t] }}
          </span>
        </button>
      </div>

      <p v-if="current.error.value" class="text-sm text-red-600">{{ current.error.value }}</p>
      <AppSpinner v-if="current.loading.value && !jobs.length" />
      <div v-else-if="!jobs.length" class="py-12 text-center">
        <p class="text-sm text-slate-400">Aucun véhicule « {{ JOB_STATUSES[tab].label.toLowerCase() }} ».</p>
        <RouterLink v-if="tab !== 'done'" to="/nouveau" class="btn btn-primary mt-4"><Plus class="size-4" /> Nouvelle entrée</RouterLink>
      </div>

      <RouterLink
        v-for="j in jobs"
        :key="j.id"
        :to="{ name: 'job', params: { id: j.id } }"
        class="card relative block overflow-hidden py-3 pl-5 active:bg-slate-50"
      >
        <span class="absolute inset-y-0 left-0 w-1.5" :class="JOB_STATUSES[j.status]?.bar" />
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ vehicleTitle(j) }}</p>
            <p class="truncate text-sm text-slate-500">{{ j.customer_name }}</p>
          </div>
          <PlateBadge :plate="j.plate" />
        </div>
        <p v-if="j.description" class="mt-1.5 line-clamp-2 text-sm text-slate-700">{{ j.description }}</p>
        <div class="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span v-if="stayLabel(j)">{{ stayLabel(j) }}</span>
          <span v-if="j.photo_count" class="flex items-center gap-1"><Camera class="size-3.5" /> {{ j.photo_count }}</span>
          <span class="ml-auto text-sm font-semibold text-slate-800">{{ formatMoney(jobAmount(j)) }}</span>
        </div>
      </RouterLink>
    </template>
  </div>
</template>

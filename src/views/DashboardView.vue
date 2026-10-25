<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Camera, CarFront, ChevronRight, Clock, FileText, Plus, Search, TrendingUp, Wrench, X } from 'lucide-vue-next'
import { api } from '@/api'
import { useLoader } from '@/composables'
import { JOB_STATUSES, daysSince, formatMoney, greeting, vehicleTitle } from '@/utils/format'
import { VEHICLE_ICONS } from '@/utils/icons'
import AppSpinner from '@/components/AppSpinner.vue'
import PlateBadge from '@/components/PlateBadge.vue'

const TABS = ['in_progress', 'quote', 'done']
const tab = ref('in_progress')
const hi = greeting()

// Open jobs are loaded together so their tabs show a count; finished ones (they pile up) only on demand.
const open = useLoader(() => api.get('/jobs?status=quote,in_progress'))
const done = useLoader(() => api.get('/jobs?status=done'))
const stats = useLoader(() => api.get('/stats'))

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
onMounted(() => {
  open.load()
  stats.load()
})

const jobAmount = (j) => j.final_price ?? (j.items_total || j.estimate)
function stayLabel(j) {
  const d = daysSince(j.date_in)
  if (d === null || j.status === 'done') return null
  return d === 0 ? "Aujourd'hui" : `${d} j`
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
  <div class="space-y-4">
    <!-- Greeting + key figures -->
    <section class="hero">
      <div class="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-blue-500/25 blur-2xl" />
      <p class="relative text-xl font-bold tracking-tight">{{ hi.hello }} 👋</p>
      <p class="relative text-sm text-slate-400 first-letter:uppercase">{{ hi.date }}</p>

      <div class="relative mt-4 grid grid-cols-2 gap-2">
        <button class="rounded-xl bg-white/10 p-3 text-left ring-1 ring-white/10 active:bg-white/15" @click="tab = 'in_progress'">
          <Wrench class="mb-2 size-4 text-blue-300" />
          <p class="text-2xl font-bold">{{ stats.data.value?.in_progress ?? '–' }}</p>
          <p class="text-xs text-slate-400">En atelier</p>
        </button>
        <button class="rounded-xl bg-white/10 p-3 text-left ring-1 ring-white/10 active:bg-white/15" @click="tab = 'quote'">
          <FileText class="mb-2 size-4 text-amber-300" />
          <p class="text-2xl font-bold">{{ stats.data.value?.quote ?? '–' }}</p>
          <p class="text-xs text-slate-400">Devis en attente</p>
        </button>
        <div class="col-span-2 flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 p-3 ring-1 ring-emerald-400/20">
          <span class="flex size-9 items-center justify-center rounded-lg bg-emerald-400/20"><TrendingUp class="size-5 text-emerald-300" /></span>
          <div class="min-w-0 flex-1">
            <p class="text-xs text-slate-400">Chiffre du mois</p>
            <p class="truncate text-lg font-bold">{{ stats.data.value ? formatMoney(stats.data.value.revenue_month) : '–' }}</p>
          </div>
          <p class="text-right text-xs text-slate-400">
            <span class="block text-base font-bold text-white">{{ stats.data.value?.done_month ?? '–' }}</span>
            terminés
          </p>
        </div>
      </div>
    </section>

    <div class="relative">
      <Search class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400" />
      <input v-model="q" class="input bg-white pr-10 pl-11 shadow-card" type="text" enterkeyhint="search" placeholder="Rechercher plaque, modèle, client…" />
      <button v-if="q" class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-slate-400" aria-label="Effacer" @click="q = ''">
        <X class="size-4" />
      </button>
    </div>

    <!-- Search results replace the job list while searching -->
    <template v-if="results">
      <div class="card divide-y divide-slate-100 p-0">
        <div v-if="!results.length" class="p-6 text-center text-sm text-slate-500">
          <p>Aucun véhicule trouvé.</p>
          <RouterLink to="/nouveau" class="btn btn-primary mt-3"><Plus class="size-4" /> Nouvelle entrée</RouterLink>
        </div>
        <RouterLink
          v-for="v in results"
          :key="v.id"
          :to="{ name: 'vehicle', params: { id: v.id } }"
          class="flex items-center gap-3 px-4 py-3 active:bg-slate-50"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <component :is="VEHICLE_ICONS[v.type]" class="size-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold">{{ vehicleTitle(v) }}</span>
            <span class="text-sm text-slate-500">{{ v.customer_name }}</span>
          </span>
          <PlateBadge :plate="v.plate" />
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <div class="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1">
        <button
          v-for="t in TABS"
          :key="t"
          class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold"
          :class="tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'"
          @click="tab = t"
        >
          <span class="size-2 rounded-full" :class="JOB_STATUSES[t].bar" />
          {{ JOB_STATUSES[t].label }}
          <span v-if="t !== 'done'" class="text-xs font-medium text-slate-400">{{ counts[t] }}</span>
        </button>
      </div>

      <p v-if="current.error.value" class="text-sm text-red-600">{{ current.error.value }}</p>
      <AppSpinner v-if="current.loading.value && !jobs.length" />
      <div v-else-if="!jobs.length" class="flex flex-col items-center py-10 text-center">
        <span class="mb-3 flex size-16 items-center justify-center rounded-2xl bg-white shadow-card">
          <CarFront class="size-8 text-slate-300" />
        </span>
        <p class="font-semibold text-slate-600">Rien ici pour l'instant</p>
        <p class="text-sm text-slate-400">Aucun véhicule « {{ JOB_STATUSES[tab].label.toLowerCase() }} ».</p>
        <RouterLink v-if="tab !== 'done'" to="/nouveau" class="btn btn-primary mt-4"><Plus class="size-4" /> Nouvelle entrée</RouterLink>
      </div>

      <TransitionGroup tag="div" class="space-y-2.5" enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-y-1">
        <RouterLink
          v-for="j in jobs"
          :key="j.id"
          :to="{ name: 'job', params: { id: j.id } }"
          class="card flex gap-3 p-3 active:scale-[0.99]"
        >
          <span class="flex size-12 shrink-0 items-center justify-center rounded-xl" :class="JOB_STATUSES[j.status]?.tile">
            <component :is="VEHICLE_ICONS[j.vehicle_type]" class="size-6" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-semibold">{{ vehicleTitle(j) }}</p>
                <p class="truncate text-sm text-slate-500">{{ j.customer_name }}</p>
              </div>
              <PlateBadge :plate="j.plate" />
            </div>
            <p v-if="j.description" class="mt-1 line-clamp-1 text-sm text-slate-600">{{ j.description }}</p>
            <div class="mt-2 flex items-center gap-3 text-xs font-medium text-slate-400">
              <span v-if="stayLabel(j)" class="flex items-center gap-1"><Clock class="size-3.5" /> {{ stayLabel(j) }}</span>
              <span v-if="j.photo_count" class="flex items-center gap-1"><Camera class="size-3.5" /> {{ j.photo_count }}</span>
              <span class="ml-auto text-sm font-bold text-slate-800">{{ formatMoney(jobAmount(j)) }}</span>
            </div>
          </div>
          <ChevronRight class="size-4 shrink-0 self-center text-slate-300" />
        </RouterLink>
      </TransitionGroup>
    </template>
  </div>
</template>

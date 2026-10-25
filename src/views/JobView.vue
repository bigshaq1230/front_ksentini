<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Check, Pencil, Printer } from 'lucide-vue-next'
import { api } from '@/api'
import { useAction, useLoader } from '@/composables'
import { JOB_STATUSES, STATUS_FLOW, formatDate, formatMoney, today, vehicleTitle } from '@/utils/format'
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
  await job.load()
}

const setStatus = useAction(async (status) => {
  if (status === job.data.value.status) return
  if (status === 'cancelled' && !confirm('Annuler ce passage ?')) return
  const data = { status }
  // Fill the exit date automatically when the job is finished, unless already set.
  if (status === 'done' && !job.data.value.date_out) data.date_out = today()
  await api.put(`/jobs/${props.id}`, data)
  await job.load()
})

const remove = useAction(async () => {
  if (!confirm('Supprimer ce passage, ses lignes et toutes ses photos ? Cette action est irréversible.')) return
  const vehicleId = job.data.value.vehicle_id
  await api.del(`/jobs/${props.id}`)
  router.replace({ name: 'vehicle', params: { id: vehicleId } })
})
</script>

<template>
  <p v-if="job.error.value" class="text-sm text-red-600">{{ job.error.value }}</p>
  <AppSpinner v-if="!job.data.value && job.loading.value" />
  <div v-if="job.data.value" class="space-y-3">
    <section class="card space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <RouterLink :to="{ name: 'vehicle', params: { id: job.data.value.vehicle_id } }" class="block truncate text-xl font-semibold">
            {{ vehicleTitle(job.data.value) }}
          </RouterLink>
          <RouterLink :to="{ name: 'customer', params: { id: job.data.value.customer_id } }" class="text-sm text-blue-700">
            {{ job.data.value.customer_name }}
          </RouterLink>
        </div>
        <PlateBadge :plate="job.data.value.plate" />
      </div>
      <ContactButtons :phone="job.data.value.customer_phone" />
    </section>

    <!-- Status stepper -->
    <section class="no-print card">
      <div v-if="job.data.value.status === 'cancelled'" class="flex items-center justify-between">
        <span class="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">Passage annulé</span>
        <button class="btn px-3 py-1.5" @click="setStatus.run('quote')">Réactiver</button>
      </div>
      <template v-else>
        <ol class="grid grid-cols-3">
          <li v-for="(s, i) in STATUS_FLOW" :key="s" class="relative">
            <span v-if="i > 0" class="absolute top-4 right-1/2 h-0.5 w-full" :class="i <= stepIndex ? 'bg-blue-600' : 'bg-slate-200'" />
            <button
              class="relative flex w-full flex-col items-center gap-1 text-xs font-medium"
              :class="i <= stepIndex ? 'text-blue-700' : 'text-slate-400'"
              :disabled="setStatus.busy.value"
              @click="setStatus.run(s)"
            >
              <span
                class="flex size-8 items-center justify-center rounded-full ring-2"
                :class="
                  i < stepIndex
                    ? 'bg-blue-600 text-white ring-blue-600'
                    : i === stepIndex
                      ? 'bg-white text-blue-700 ring-blue-600'
                      : 'bg-white text-slate-400 ring-slate-200'
                "
              >
                <Check v-if="i < stepIndex" class="size-4" />
                <span v-else>{{ i + 1 }}</span>
              </span>
              {{ JOB_STATUSES[s].label }}
            </button>
          </li>
        </ol>
        <button class="mt-3 w-full text-center text-xs text-slate-400" @click="setStatus.run('cancelled')">Annuler le passage</button>
      </template>
      <p v-if="setStatus.error.value" class="mt-2 text-sm text-red-600">{{ setStatus.error.value }}</p>
    </section>

    <!-- Details -->
    <section class="card">
      <div class="flex items-center justify-between">
        <h3 class="section-title mb-0">Détails</h3>
        <button class="no-print -m-1 rounded-full p-2 text-slate-500 active:bg-slate-100" aria-label="Modifier" @click="editing = true">
          <Pencil class="size-4" />
        </button>
      </div>
      <p class="mt-2 text-sm whitespace-pre-line" :class="{ 'text-slate-400': !job.data.value.description }">
        {{ job.data.value.description || 'Aucune description du dommage.' }}
      </p>
      <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div><dt class="text-xs text-slate-500">Entrée</dt><dd>{{ formatDate(job.data.value.date_in) }}</dd></div>
        <div><dt class="text-xs text-slate-500">Sortie</dt><dd>{{ formatDate(job.data.value.date_out) }}</dd></div>
        <div><dt class="text-xs text-slate-500">Estimation</dt><dd>{{ formatMoney(job.data.value.estimate) }}</dd></div>
        <div><dt class="text-xs text-slate-500">Prix final</dt><dd class="font-semibold">{{ formatMoney(job.data.value.final_price) }}</dd></div>
      </dl>
      <p v-if="job.data.value.notes" class="no-print mt-3 rounded-lg bg-amber-50 p-2 text-sm whitespace-pre-line text-amber-900">
        {{ job.data.value.notes }}
      </p>
    </section>

    <JobItems :job-id="job.data.value.id" :items="job.data.value.items" @changed="job.load" />
    <PhotoGallery :job-id="job.data.value.id" :photos="job.data.value.photos" @changed="job.load" />

    <div class="no-print flex items-center justify-between pt-4">
      <button class="btn" @click="print"><Printer class="size-4" /> Imprimer</button>
      <button class="text-sm text-red-600" :disabled="remove.busy.value" @click="remove.run">Supprimer ce passage</button>
    </div>
    <p v-if="remove.error.value" class="text-sm text-red-600">{{ remove.error.value }}</p>

    <AppModal v-if="editing" title="Modifier le passage" @close="editing = false">
      <JobForm :job="job.data.value" :submit="update" @cancel="editing = false" />
    </AppModal>
  </div>
</template>

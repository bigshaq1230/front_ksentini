<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Camera, ChevronRight, Pencil, Plus } from 'lucide-vue-next'
import { api } from '@/api'
import { useAction, useLoader } from '@/composables'
import { toast } from '@/stores/toast'
import { VEHICLE_ICONS } from '@/utils/icons'
import AppAvatar from '@/components/AppAvatar.vue'
import { JOB_STATUSES, VEHICLE_TYPES, formatDate, formatMoney, today, vehicleTitle } from '@/utils/format'
import AppModal from '@/components/AppModal.vue'
import AppSpinner from '@/components/AppSpinner.vue'
import PlateBadge from '@/components/PlateBadge.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import VehicleForm from '@/components/VehicleForm.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const vehicle = useLoader(() => api.get(`/vehicles/${props.id}`))
const editing = ref(false)

watch(() => props.id, vehicle.load)
onMounted(vehicle.load)

async function update(data) {
  await api.put(`/vehicles/${props.id}`, data)
  editing.value = false
  toast('Véhicule enregistré')
  await vehicle.load()
}

const newJob = useAction(async () => {
  const job = await api.post('/jobs', { vehicle_id: Number(props.id), date_in: today() })
  router.push({ name: 'job', params: { id: job.id } })
})

const remove = useAction(async () => {
  if (!confirm('Supprimer ce véhicule, tous ses travaux et toutes les photos ? Cette action est irréversible.')) return
  const customerId = vehicle.data.value.customer_id
  await api.del(`/vehicles/${props.id}`)
  router.replace({ name: 'customer', params: { id: customerId } })
})
</script>

<template>
  <div>
    <p v-if="vehicle.error.value" class="text-sm text-red-600">{{ vehicle.error.value }}</p>
    <AppSpinner v-if="!vehicle.data.value && vehicle.loading.value" />
    <div v-if="vehicle.data.value" class="space-y-3">
      <section class="hero space-y-4">
        <div class="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-blue-500/20 blur-2xl" />
        <div class="relative flex items-start gap-3">
          <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <component :is="VEHICLE_ICONS[vehicle.data.value.type]" class="size-6 text-blue-200" />
          </span>
          <div class="min-w-0 flex-1">
            <h2 class="line-clamp-2 text-xl leading-tight font-bold tracking-tight">{{ vehicleTitle(vehicle.data.value) }}</h2>
            <p class="text-sm text-slate-400">
              {{ VEHICLE_TYPES[vehicle.data.value.type] }}<span v-if="vehicle.data.value.color"> · {{ vehicle.data.value.color }}</span>
            </p>
          </div>
          <button class="-m-1 rounded-full p-2 text-slate-300 active:bg-white/10" aria-label="Modifier" @click="editing = true">
            <Pencil class="size-5" />
          </button>
        </div>
        <PlateBadge class="relative" :plate="vehicle.data.value.plate" size="lg" />
        <RouterLink
          :to="{ name: 'customer', params: { id: vehicle.data.value.customer_id } }"
          class="relative flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10 active:bg-white/15"
        >
          <AppAvatar :name="vehicle.data.value.customer_name" />
          <span class="min-w-0 flex-1">
            <span class="block text-xs text-slate-400">Propriétaire</span>
            <span class="block truncate font-semibold">{{ vehicle.data.value.customer_name }}</span>
          </span>
          <ChevronRight class="size-4 text-slate-400" />
        </RouterLink>
        <p v-if="vehicle.data.value.notes" class="relative text-sm whitespace-pre-line text-slate-300">{{ vehicle.data.value.notes }}</p>
      </section>

      <button class="btn btn-primary w-full py-3.5 text-base" :disabled="newJob.busy.value" @click="newJob.run">
        <Plus class="size-5" /> Nouveau passage
      </button>
      <p v-if="newJob.error.value" class="text-sm text-red-600">{{ newJob.error.value }}</p>

      <section>
        <h3 class="section-title px-1">Historique</h3>
        <p v-if="!vehicle.data.value.jobs.length" class="card text-center text-sm text-slate-400">Aucun passage.</p>
        <div class="space-y-2">
          <RouterLink
            v-for="j in vehicle.data.value.jobs"
            :key="j.id"
            :to="{ name: 'job', params: { id: j.id } }"
            class="card relative block overflow-hidden py-3 pl-5 active:scale-[0.99]"
          >
            <span class="absolute inset-y-0 left-0 w-1.5" :class="JOB_STATUSES[j.status]?.bar" />
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ formatDate(j.date_in || j.created_at) }}</span>
              <StatusBadge :status="j.status" />
            </div>
            <p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ j.description || 'Sans description' }}</p>
            <div class="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
              <span v-if="j.photo_count" class="flex items-center gap-1"><Camera class="size-3.5" /> {{ j.photo_count }}</span>
              <span class="ml-auto text-sm font-semibold text-slate-800">{{ formatMoney(j.final_price ?? (j.items_total || j.estimate)) }}</span>
            </div>
          </RouterLink>
        </div>
      </section>

      <div class="pt-6 text-center">
        <button class="text-sm text-red-600" :disabled="remove.busy.value" @click="remove.run">Supprimer ce véhicule</button>
        <p v-if="remove.error.value" class="text-sm text-red-600">{{ remove.error.value }}</p>
      </div>

      <AppModal v-if="editing" title="Modifier le véhicule" @close="editing = false">
        <VehicleForm :vehicle="vehicle.data.value" :submit="update" @cancel="editing = false" />
      </AppModal>
    </div>
  </div>
</template>

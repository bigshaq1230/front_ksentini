<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ChevronRight, Pencil, Plus } from 'lucide-vue-next'
import { api } from '@/api'
import { useAction, useLoader } from '@/composables'
import { VEHICLE_TYPES, formatDate, vehicleTitle } from '@/utils/format'
import AppModal from '@/components/AppModal.vue'
import AppSpinner from '@/components/AppSpinner.vue'
import ContactButtons from '@/components/ContactButtons.vue'
import CustomerForm from '@/components/CustomerForm.vue'
import PlateBadge from '@/components/PlateBadge.vue'
import VehicleForm from '@/components/VehicleForm.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const customer = useLoader(() => api.get(`/customers/${props.id}`))
const modal = ref(null) // 'edit' | 'vehicle'

watch(() => props.id, customer.load)
onMounted(customer.load)

async function update(data) {
  await api.put(`/customers/${props.id}`, data)
  modal.value = null
  await customer.load()
}

async function addVehicle(data) {
  const vehicle = await api.post('/vehicles', { ...data, customer_id: Number(props.id) })
  router.push({ name: 'vehicle', params: { id: vehicle.id } })
}

const remove = useAction(async () => {
  if (!confirm('Supprimer ce client, ses véhicules, leurs travaux et toutes les photos ? Cette action est irréversible.')) return
  await api.del(`/customers/${props.id}`)
  router.replace({ name: 'customers' })
})
</script>

<template>
  <p v-if="customer.error.value" class="text-sm text-red-600">{{ customer.error.value }}</p>
  <AppSpinner v-if="!customer.data.value && customer.loading.value" />
  <div v-if="customer.data.value" class="space-y-3">
    <section class="card space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h2 class="text-xl font-semibold">{{ customer.data.value.name }}</h2>
          <p class="text-sm text-slate-500">
            {{ customer.data.value.phone || 'Pas de téléphone' }}
            <span v-if="customer.data.value.email"> · {{ customer.data.value.email }}</span>
          </p>
          <p class="text-xs text-slate-400">Client depuis le {{ formatDate(customer.data.value.created_at) }}</p>
        </div>
        <button class="rounded-full p-2 text-slate-500 active:bg-slate-100" aria-label="Modifier" @click="modal = 'edit'">
          <Pencil class="size-5" />
        </button>
      </div>
      <p v-if="customer.data.value.notes" class="rounded-lg bg-slate-50 p-2 text-sm whitespace-pre-line text-slate-700">
        {{ customer.data.value.notes }}
      </p>
      <ContactButtons :phone="customer.data.value.phone" />
    </section>

    <section>
      <div class="mb-2 flex items-center justify-between px-1">
        <h3 class="section-title mb-0">Véhicules</h3>
        <button class="btn px-3 py-1.5" @click="modal = 'vehicle'"><Plus class="size-4" /> Véhicule</button>
      </div>
      <p v-if="!customer.data.value.vehicles.length" class="card text-center text-sm text-slate-400">Aucun véhicule.</p>
      <div v-else class="card divide-y divide-slate-100 p-0">
        <RouterLink
          v-for="v in customer.data.value.vehicles"
          :key="v.id"
          :to="{ name: 'vehicle', params: { id: v.id } }"
          class="flex items-center gap-3 px-4 py-3 active:bg-slate-50"
        >
          <span class="min-w-0 flex-1">
            <span class="block truncate font-medium">{{ vehicleTitle(v) }}</span>
            <span class="text-sm text-slate-500">{{ VEHICLE_TYPES[v.type] }} · {{ v.job_count }} passage(s)</span>
          </span>
          <PlateBadge :plate="v.plate" />
          <ChevronRight class="size-4 text-slate-300" />
        </RouterLink>
      </div>
    </section>

    <div class="pt-6 text-center">
      <button class="text-sm text-red-600" :disabled="remove.busy.value" @click="remove.run">Supprimer ce client</button>
      <p v-if="remove.error.value" class="text-sm text-red-600">{{ remove.error.value }}</p>
    </div>

    <AppModal v-if="modal === 'edit'" title="Modifier le client" @close="modal = null">
      <CustomerForm :customer="customer.data.value" :submit="update" @cancel="modal = null" />
    </AppModal>
    <AppModal v-if="modal === 'vehicle'" title="Nouveau véhicule" @close="modal = null">
      <VehicleForm :submit="addVehicle" @cancel="modal = null" />
    </AppModal>
  </div>
</template>

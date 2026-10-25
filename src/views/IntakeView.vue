<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ChevronRight, Plus, Search, UserPlus, X } from 'lucide-vue-next'
import { api } from '@/api'
import { useAction, useLoader } from '@/composables'
import { formatPlate, parsePlate, vehicleTitle } from '@/utils/format'
import { VEHICLE_ICONS } from '@/utils/icons'
import AppAvatar from '@/components/AppAvatar.vue'
import AppModal from '@/components/AppModal.vue'
import AppSpinner from '@/components/AppSpinner.vue'
import PlateBadge from '@/components/PlateBadge.vue'
import PlateInput from '@/components/PlateInput.vue'
import VehicleFields from '@/components/VehicleFields.vue'
import VehicleForm from '@/components/VehicleForm.vue'

const router = useRouter()
const openVehicle = (id) => router.push({ name: 'vehicle', params: { id } })

// --- Search: owners with their vehicles ---
const q = ref('')
const results = useLoader(() => api.get(`/search?q=${encodeURIComponent(q.value.trim())}`))
let timer
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(results.load, 250)
})
onMounted(results.load)

// --- Add a vehicle to an existing owner ---
const addingFor = ref(null) // customer row
async function addVehicle(data) {
  const vehicle = await api.post('/vehicles', { ...data, customer_id: addingFor.value.id })
  openVehicle(vehicle.id)
}

// --- New customer + vehicle ---
const creating = ref(false)
const customer = reactive({ name: '', phone: '' })
const vehicle = reactive({ type: 'car', plate: '', make: '', model: '', year: '', color: '' })
let createdCustomer = null // kept so a retry after a failed vehicle step doesn't duplicate the customer

function startCreate() {
  // Prefill from what was searched: a plate, a phone number, or a name.
  const term = q.value.trim()
  const plate = parsePlate(term)
  Object.assign(customer, { name: '', phone: '' })
  Object.assign(vehicle, { type: 'car', plate: '', make: '', model: '', year: '', color: '' })
  if (plate.kind !== 'other' && term) vehicle.plate = formatPlate(plate)
  else if (/^[\d\s+]{8,}$/.test(term)) customer.phone = term
  else customer.name = term
  createdCustomer = null
  create.error.value = ''
  creating.value = true
}

const create = useAction(async () => {
  if (!customer.name.trim()) throw new Error('Indiquez le nom du client.')
  createdCustomer ??= await api.post('/customers', { ...customer })
  const v = await api.post('/vehicles', { ...vehicle, customer_id: createdCustomer.id })
  openVehicle(v.id)
})
</script>

<template>
  <div class="space-y-3">
    <div class="relative">
      <Search class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400" />
      <input
        v-model="q"
        class="input bg-white pr-10 pl-11 shadow-card"
        type="text"
        enterkeyhint="search"
        placeholder="Plaque, modèle, client ou téléphone…"
        autofocus
      />
      <button v-if="q" class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-slate-400" aria-label="Effacer" @click="q = ''">
        <X class="size-4" />
      </button>
    </div>

    <button class="btn btn-primary w-full justify-start py-3.5" @click="startCreate">
      <span class="flex size-8 items-center justify-center rounded-lg bg-white/20"><UserPlus class="size-5" /></span>
      <span class="text-base">Nouveau client et véhicule</span>
    </button>

    <p v-if="results.error.value" class="text-sm text-red-600">{{ results.error.value }}</p>
    <AppSpinner v-if="results.loading.value && !results.data.value" />

    <template v-else-if="results.data.value">
      <p class="px-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {{ q.trim() ? `${results.data.value.length} client(s) trouvé(s)` : 'Clients récents' }}
      </p>
      <p v-if="!results.data.value.length" class="card text-center text-sm text-slate-500">
        Aucun résultat pour « {{ q }} ».
      </p>

      <section v-for="owner in results.data.value" :key="owner.id" class="card overflow-hidden p-0">
        <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <AppAvatar :name="owner.name" />
          <RouterLink :to="{ name: 'customer', params: { id: owner.id } }" class="min-w-0 flex-1">
            <span class="block truncate font-semibold">{{ owner.name }}</span>
            <span v-if="owner.phone" class="text-sm text-slate-500">{{ owner.phone }}</span>
          </RouterLink>
          <button class="btn px-2.5 py-1.5 text-xs" @click="addingFor = owner"><Plus class="size-4" /> Véhicule</button>
        </div>

        <button
          v-for="v in owner.vehicles"
          :key="v.id"
          class="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-slate-50"
          :class="{ 'bg-blue-50/50': q.trim() && v.matched }"
          @click="openVehicle(v.id)"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="v.open_job_id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'">
            <component :is="VEHICLE_ICONS[v.type]" class="size-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-medium">{{ vehicleTitle(v) }}</span>
            <span v-if="v.open_job_id" class="text-xs font-medium text-blue-700">En atelier</span>
          </span>
          <PlateBadge :plate="v.plate" />
          <ChevronRight class="size-4 shrink-0 text-slate-300" />
        </button>
        <p v-if="!owner.vehicles.length" class="px-4 py-3 text-sm text-slate-400">Aucun véhicule.</p>
      </section>
    </template>

    <AppModal v-if="addingFor" :title="`Véhicule de ${addingFor.name}`" @close="addingFor = null">
      <VehicleForm :submit="addVehicle" @cancel="addingFor = null" />
    </AppModal>

    <AppModal v-if="creating" title="Nouveau client" @close="creating = false">
      <form class="space-y-4" @submit.prevent="create.run">
        <div class="space-y-3">
          <div>
            <label class="label" for="n-name">Nom *</label>
            <input id="n-name" v-model="customer.name" class="input" autocomplete="off" required />
          </div>
          <div>
            <label class="label" for="n-phone">Téléphone</label>
            <input id="n-phone" v-model="customer.phone" class="input" type="tel" inputmode="tel" placeholder="98 123 456" />
          </div>
        </div>
        <div class="space-y-3 border-t border-slate-100 pt-4">
          <p class="section-title mb-0">Véhicule</p>
          <PlateInput v-model="vehicle.plate" />
          <VehicleFields :form="vehicle" />
        </div>
        <p v-if="create.error.value" class="text-sm text-red-600">{{ create.error.value }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn" @click="creating = false">Annuler</button>
          <button type="submit" class="btn btn-primary" :disabled="create.busy.value">Enregistrer</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

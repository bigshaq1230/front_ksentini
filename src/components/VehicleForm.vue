<script setup>
import { reactive } from 'vue'
import { useAction } from '@/composables'
import PlateInput from './PlateInput.vue'
import VehicleFields from './VehicleFields.vue'

const props = defineProps({
  vehicle: { type: Object, default: () => ({}) },
  submit: { type: Function, required: true },
})
const emit = defineEmits(['cancel'])

const form = reactive({
  type: props.vehicle.type ?? 'car',
  plate: props.vehicle.plate ?? '',
  make: props.vehicle.make ?? '',
  model: props.vehicle.model ?? '',
  year: props.vehicle.year ?? '',
  color: props.vehicle.color ?? '',
  notes: props.vehicle.notes ?? '',
})
const { run, busy, error } = useAction(() => props.submit({ ...form }))
</script>

<template>
  <form class="space-y-4" @submit.prevent="run">
    <div>
      <span class="label">Plaque</span>
      <PlateInput v-model="form.plate" />
    </div>
    <VehicleFields :form="form" />
    <div>
      <label class="label" for="v-notes">Notes</label>
      <textarea id="v-notes" v-model="form.notes" class="input" rows="2" />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <div class="grid grid-cols-2 gap-2 pt-1">
      <button type="button" class="btn" @click="emit('cancel')">Annuler</button>
      <button type="submit" class="btn btn-primary" :disabled="busy">Enregistrer</button>
    </div>
  </form>
</template>

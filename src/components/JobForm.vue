<script setup>
import { reactive } from 'vue'
import { useAction } from '@/composables'

const props = defineProps({
  job: { type: Object, required: true },
  submit: { type: Function, required: true },
})
const emit = defineEmits(['cancel'])

const form = reactive({
  description: props.job.description ?? '',
  date_in: props.job.date_in ?? '',
  date_out: props.job.date_out ?? '',
  estimate: props.job.estimate ?? '',
  final_price: props.job.final_price ?? '',
  notes: props.job.notes ?? '',
})
const { run, busy, error } = useAction(() => props.submit({ ...form }))
</script>

<template>
  <form class="space-y-3" @submit.prevent="run">
    <div>
      <label class="label" for="j-desc">Dommage constaté</label>
      <textarea id="j-desc" v-model="form.description" class="input" rows="3" />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label" for="j-in">Date d'entrée</label>
        <input id="j-in" v-model="form.date_in" class="input" type="date" />
      </div>
      <div>
        <label class="label" for="j-out">Date de sortie</label>
        <input id="j-out" v-model="form.date_out" class="input" type="date" />
      </div>
      <div>
        <label class="label" for="j-est">Estimation (DT)</label>
        <input id="j-est" v-model="form.estimate" class="input" inputmode="decimal" />
      </div>
      <div>
        <label class="label" for="j-final">Prix final (DT)</label>
        <input id="j-final" v-model="form.final_price" class="input" inputmode="decimal" />
      </div>
    </div>
    <div>
      <label class="label" for="j-notes">Notes internes</label>
      <textarea id="j-notes" v-model="form.notes" class="input" rows="2" />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <div class="grid grid-cols-2 gap-2 pt-1">
      <button type="button" class="btn" @click="emit('cancel')">Annuler</button>
      <button type="submit" class="btn btn-primary" :disabled="busy">Enregistrer</button>
    </div>
  </form>
</template>

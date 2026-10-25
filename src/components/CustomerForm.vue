<script setup>
import { reactive } from 'vue'
import { useAction } from '@/composables'

const props = defineProps({
  customer: { type: Object, default: () => ({}) },
  submit: { type: Function, required: true },
})
const emit = defineEmits(['cancel'])

const form = reactive({
  name: props.customer.name ?? '',
  phone: props.customer.phone ?? '',
  email: props.customer.email ?? '',
  notes: props.customer.notes ?? '',
})
const { run, busy, error } = useAction(() => props.submit({ ...form }))
</script>

<template>
  <form class="space-y-3" @submit.prevent="run">
    <div>
      <label class="label" for="c-name">Nom *</label>
      <input id="c-name" v-model="form.name" class="input" required autocomplete="off" />
    </div>
    <div>
      <label class="label" for="c-phone">Téléphone</label>
      <input id="c-phone" v-model="form.phone" class="input" type="tel" inputmode="tel" placeholder="98 123 456" />
    </div>
    <div>
      <label class="label" for="c-email">Courriel</label>
      <input id="c-email" v-model="form.email" class="input" type="email" />
    </div>
    <div>
      <label class="label" for="c-notes">Notes</label>
      <textarea id="c-notes" v-model="form.notes" class="input" rows="3" />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <div class="grid grid-cols-2 gap-2 pt-1">
      <button type="button" class="btn" @click="emit('cancel')">Annuler</button>
      <button type="submit" class="btn btn-primary" :disabled="busy">Enregistrer</button>
    </div>
  </form>
</template>

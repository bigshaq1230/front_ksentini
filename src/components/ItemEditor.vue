<script setup>
import { onMounted, ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { ITEM_KINDS } from '@/utils/format'

// Inline editor for one work line; `form` is the parent's reactive object.
const props = defineProps({
  form: { type: Object, required: true },
  isNew: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'cancel', 'remove'])

const priceInput = ref(null)
onMounted(() => props.isNew && priceInput.value?.focus())
</script>

<template>
  <form class="space-y-3 px-4 py-3" :class="isNew ? 'bg-blue-50/60' : 'bg-slate-50'" @submit.prevent="emit('submit')">
    <div class="grid grid-cols-4 gap-1">
      <button
        v-for="(label, value) in ITEM_KINDS"
        :key="value"
        type="button"
        class="rounded-md px-1 py-1.5 text-[11px] font-medium ring-1"
        :class="form.kind === value ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-600 ring-slate-300'"
        @click="form.kind = value"
      >
        {{ label }}
      </button>
    </div>
    <input v-model="form.label" class="input" placeholder="Description (facultatif)" aria-label="Description" />
    <div class="grid grid-cols-[5rem_1fr] gap-2">
      <input v-model="form.quantity" class="input text-center" inputmode="decimal" aria-label="Quantité" placeholder="Qté" />
      <div class="relative">
        <input ref="priceInput" v-model="form.unit_price" class="input pr-10" inputmode="decimal" aria-label="Prix unitaire" placeholder="Prix" />
        <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">DT</span>
      </div>
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <div class="flex gap-2">
      <button v-if="!isNew" type="button" class="btn btn-danger px-3" aria-label="Supprimer la ligne" @click="emit('remove')">
        <Trash2 class="size-4" />
      </button>
      <button type="button" class="btn flex-1" @click="emit('cancel')">Annuler</button>
      <button type="submit" class="btn btn-primary flex-1" :disabled="busy">{{ isNew ? 'Ajouter' : 'OK' }}</button>
    </div>
  </form>
</template>

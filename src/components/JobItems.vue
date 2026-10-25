<script setup>
import { computed, reactive, ref } from 'vue'
import { CircleHelp, Hammer, Package, Paintbrush, Pencil, Plus } from 'lucide-vue-next'
import { api } from '@/api'
import { useAction } from '@/composables'
import { toast } from '@/stores/toast'
import { ITEM_KINDS, formatMoney } from '@/utils/format'
import ItemEditor from './ItemEditor.vue'

const props = defineProps({
  jobId: { type: Number, required: true },
  items: { type: Array, required: true },
})
const emit = defineEmits(['changed'])

const KIND_STYLE = {
  labor: { icon: Hammer, color: 'bg-blue-100 text-blue-700' },
  part: { icon: Package, color: 'bg-amber-100 text-amber-700' },
  paint: { icon: Paintbrush, color: 'bg-purple-100 text-purple-700' },
  other: { icon: CircleHelp, color: 'bg-slate-100 text-slate-600' },
}

const total = computed(() => props.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0))
const lineTotal = (i) => i.quantity * i.unit_price
const qty = (n) => Number(n).toLocaleString('fr-TN')

// Only one line is edited at a time: an item id, 'new', or null.
const editing = ref(null)
const form = reactive({ label: '', kind: 'labor', quantity: 1, unit_price: '' })

function edit(item) {
  editing.value = item.id
  Object.assign(form, { label: item.label ?? '', kind: item.kind ?? 'other', quantity: item.quantity, unit_price: item.unit_price })
  save.error.value = ''
}

function add(kind) {
  editing.value = 'new'
  Object.assign(form, { label: '', kind, quantity: 1, unit_price: '' })
  save.error.value = ''
}

const save = useAction(async () => {
  const body = { ...form, quantity: form.quantity === '' ? 1 : form.quantity, unit_price: form.unit_price === '' ? 0 : form.unit_price }
  const isNew = editing.value === 'new'
  if (isNew) await api.post(`/jobs/${props.jobId}/items`, body)
  else await api.put(`/items/${editing.value}`, body)
  toast(isNew ? 'Ligne ajoutée' : 'Ligne modifiée')
  editing.value = null
  emit('changed')
})

const remove = useAction(async () => {
  if (!confirm('Supprimer cette ligne ?')) return
  await api.del(`/items/${editing.value}`)
  toast('Ligne supprimée')
  editing.value = null
  emit('changed')
})
</script>

<template>
  <section class="card overflow-hidden p-0">
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <h3 class="section-title mb-0">Travaux</h3>
      <span class="text-sm text-slate-500">{{ items.length }} ligne(s)</span>
    </div>

    <ul class="divide-y divide-slate-100">
      <li v-for="item in items" :key="item.id">
        <ItemEditor
          v-if="editing === item.id"
          :form="form"
          :busy="save.busy.value || remove.busy.value"
          :error="save.error.value || remove.error.value"
          @submit="save.run"
          @cancel="editing = null"
          @remove="remove.run"
        />
        <!-- Display row -->
        <button v-else class="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-slate-50" @click="edit(item)">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="KIND_STYLE[item.kind ?? 'other'].color">
            <component :is="KIND_STYLE[item.kind ?? 'other'].icon" class="size-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate" :class="{ 'text-slate-500': !item.label }">{{ item.label || ITEM_KINDS[item.kind] || 'Autre' }}</span>
            <span v-if="item.quantity !== 1" class="text-xs text-slate-500">{{ qty(item.quantity) }} × {{ formatMoney(item.unit_price) }}</span>
          </span>
          <span class="font-medium whitespace-nowrap">{{ formatMoney(lineTotal(item)) }}</span>
          <Pencil class="no-print size-4 shrink-0 text-slate-400" />
        </button>
      </li>

      <!-- New line -->
      <li v-if="editing === 'new'">
        <ItemEditor :form="form" is-new :busy="save.busy.value" :error="save.error.value" @submit="save.run" @cancel="editing = null" />
      </li>
    </ul>

    <p v-if="!items.length && editing !== 'new'" class="px-4 pb-2 text-sm text-slate-400">Aucune ligne. Ajoutez des travaux :</p>

    <div v-if="editing === null" class="no-print grid grid-cols-2 gap-2 px-4 py-3">
      <button v-for="(label, value) in ITEM_KINDS" :key="value" class="btn justify-start px-3" @click="add(value)">
        <Plus class="size-4 text-slate-400" />
        {{ label }}
      </button>
    </div>

    <div class="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3.5 text-white">
      <span class="text-sm font-medium text-slate-300">Total travaux</span>
      <span class="text-xl font-bold tracking-tight">{{ formatMoney(total) }}</span>
    </div>
  </section>
</template>

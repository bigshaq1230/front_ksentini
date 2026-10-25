<script setup>
import { reactive, ref, watch } from 'vue'
import { formatPlate, parsePlate } from '@/utils/format'

const model = defineModel({ type: String, default: '' })
const state = reactive(parsePlate(model.value))
const numberInput = ref(null)

const KINDS = { tun: '123 TUN 4567', tn: 'TN 12345', other: 'Autre' }

watch(state, () => (model.value = formatPlate(state)))
// Keep in sync if the parent replaces the value (e.g. resets the form).
watch(model, (v) => {
  if (v !== formatPlate(state)) Object.assign(state, parsePlate(v))
})

function digits(field, max) {
  state[field] = state[field].replace(/\D/g, '').slice(0, max)
  if (field === 'series' && state.series.length === 3) numberInput.value?.focus()
}
</script>

<template>
  <div class="space-y-2">
    <div class="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
      <button
        v-for="(label, kind) in KINDS"
        :key="kind"
        type="button"
        class="rounded-md py-1.5 text-xs font-medium"
        :class="state.kind === kind ? 'bg-white shadow-sm' : 'text-slate-500'"
        @click="state.kind = kind"
      >
        {{ label }}
      </button>
    </div>

    <div
      class="flex h-14 items-center justify-center gap-2 rounded-lg bg-black px-3 font-mono text-2xl font-bold text-white ring-1 ring-slate-400 outline-2 -outline-offset-5 outline-white/80"
    >
      <template v-if="state.kind === 'tun'">
        <input
          v-model="state.series"
          class="w-[3.5ch] bg-transparent text-center outline-none placeholder:text-white/25"
          inputmode="numeric"
          placeholder="123"
          aria-label="Série"
          @input="digits('series', 3)"
        />
        <span class="font-sans text-base tracking-widest text-white/80">TUN</span>
        <input
          ref="numberInput"
          v-model="state.number"
          class="w-[4.5ch] bg-transparent text-center outline-none placeholder:text-white/25"
          inputmode="numeric"
          placeholder="4567"
          aria-label="Numéro"
          @input="digits('number', 4)"
        />
      </template>
      <template v-else-if="state.kind === 'tn'">
        <span class="font-sans text-base tracking-widest text-white/80">TN</span>
        <input
          v-model="state.number"
          class="w-[6.5ch] bg-transparent text-center outline-none placeholder:text-white/25"
          inputmode="numeric"
          placeholder="12345"
          aria-label="Numéro"
          @input="digits('number', 6)"
        />
      </template>
      <input
        v-else
        v-model="state.text"
        class="w-full bg-transparent text-center uppercase outline-none placeholder:text-white/25"
        placeholder="Plaque"
        aria-label="Plaque"
        autocomplete="off"
      />
    </div>
  </div>
</template>

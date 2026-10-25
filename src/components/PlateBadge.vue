<script setup>
import { computed } from 'vue'
import { parsePlate } from '@/utils/format'

const props = defineProps({
  plate: { type: String, default: '' },
  size: { type: String, default: 'sm' }, // sm | lg
})
const p = computed(() => parsePlate(props.plate))
</script>

<template>
  <span
    v-if="plate"
    class="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-black font-mono font-bold whitespace-nowrap text-white ring-1 ring-slate-400 outline-2 -outline-offset-4 outline-white/80"
    :class="size === 'lg' ? 'px-3.5 py-1.5 text-lg' : 'px-2 py-0.5 text-xs'"
  >
    <template v-if="p.kind === 'tun'">
      <span>{{ p.series }}</span>
      <span class="font-sans text-[0.7em] tracking-wide opacity-80">TUN</span>
      <span>{{ p.number }}</span>
    </template>
    <template v-else-if="p.kind === 'tn'">
      <span class="font-sans text-[0.7em] tracking-wide opacity-80">TN</span>
      <span>{{ p.number }}</span>
    </template>
    <span v-else>{{ p.text }}</span>
  </span>
</template>

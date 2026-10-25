<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' }, // md | lg
})

const COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-sky-600',
  'from-fuchsia-400 to-pink-600',
]
// Stable color per name.
const color = computed(() => COLORS[[...props.name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % COLORS.length])
const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm"
    :class="[color, size === 'lg' ? 'size-14 text-lg' : 'size-10 text-sm']"
  >
    {{ initials }}
  </span>
</template>

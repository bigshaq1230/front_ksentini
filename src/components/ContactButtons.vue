<script setup>
import { computed } from 'vue'
import { MessageCircle, Phone } from 'lucide-vue-next'
import { whatsappUrl } from '@/utils/format'

const props = defineProps({
  phone: { type: String, default: '' },
  dark: { type: Boolean, default: false }, // on a .hero background
})
const wa = computed(() => whatsappUrl(props.phone))
const base = computed(() =>
  props.dark
    ? 'flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold ring-1 ring-white/15 active:bg-white/20'
    : 'btn flex-1',
)
</script>

<template>
  <div v-if="phone" class="no-print flex gap-2">
    <a :href="`tel:${phone.replace(/\s/g, '')}`" :class="base"><Phone class="size-4" /> Appeler</a>
    <a v-if="wa" :href="wa" target="_blank" rel="noopener" :class="[base, dark ? 'text-emerald-300' : 'text-emerald-700']">
      <MessageCircle class="size-4" /> WhatsApp
    </a>
  </div>
</template>

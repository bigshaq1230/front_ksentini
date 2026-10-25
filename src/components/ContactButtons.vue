<script setup>
import { computed } from 'vue'
import { MessageCircle, Phone } from 'lucide-vue-next'
import { whatsappUrl } from '@/utils/format'

const props = defineProps({ phone: { type: String, default: '' } })
const wa = computed(() => whatsappUrl(props.phone))
</script>

<template>
  <div v-if="phone" class="no-print flex gap-2">
    <a :href="`tel:${phone.replace(/\s/g, '')}`" class="btn flex-1"><Phone class="size-4" /> Appeler</a>
    <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="btn flex-1 text-green-700"><MessageCircle class="size-4" /> WhatsApp</a>
  </div>
</template>

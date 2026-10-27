<script setup>
import { onMounted } from 'vue'
import { Printer } from 'lucide-vue-next'
import { api } from '@/api'
import { useLoader } from '@/composables'
import AppSpinner from '@/components/AppSpinner.vue'
import QuoteDocument from '@/components/QuoteDocument.vue'

// Opened by the customer from the link sent by WhatsApp or e-mail: no login.
const props = defineProps({ token: { type: String, required: true } })
const data = useLoader(() => api.get(`/public/quotes/${encodeURIComponent(props.token)}`))
onMounted(data.load)
const print = () => window.print()
</script>

<template>
  <div class="space-y-3">
    <AppSpinner v-if="!data.data.value && data.loading.value" />
    <p v-if="data.error.value" class="card text-center text-sm text-slate-600">Ce devis est introuvable ou n'est plus disponible.</p>
    <template v-if="data.data.value">
      <QuoteDocument :job="data.data.value.job" :company="data.data.value.company" />
      <button class="no-print btn btn-primary w-full" @click="print"><Printer class="size-4" /> Imprimer / Enregistrer en PDF</button>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Building2, Copy, Mail, MessageCircle, Printer, Share2 } from 'lucide-vue-next'
import { api } from '@/api'
import { useLoader } from '@/composables'
import { toast } from '@/stores/toast'
import { formatMoney, quoteNumber, quoteTotals, vehicleTitle, whatsappUrl } from '@/utils/format'
import AppSpinner from '@/components/AppSpinner.vue'
import QuoteDocument from '@/components/QuoteDocument.vue'

const props = defineProps({ id: { type: String, required: true } })

const data = useLoader(async () => {
  const [job, company, share] = await Promise.all([
    api.get(`/jobs/${props.id}`),
    api.get('/settings/company'),
    api.post(`/jobs/${props.id}/share`),
  ])
  return { job, company, link: `${location.origin}/devis/${share.token}` }
})
onMounted(data.load)

const message = computed(() => {
  const { job, company, link } = data.data.value
  const total = quoteTotals(job.items, Number(company.vat_rate) || 0).total
  return [
    `Bonjour ${job.customer_name},`,
    '',
    `Voici votre devis N° ${quoteNumber(job)} pour ${vehicleTitle(job)}${job.plate ? ` (${job.plate})` : ''} : ${formatMoney(total)}.`,
    '',
    link,
    '',
    company.name || 'Atelier carrosserie',
  ].join('\n')
})

const waLink = computed(() => {
  const base = whatsappUrl(data.data.value.job.customer_phone) ?? 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message.value)}`
})
const mailLink = computed(() => {
  const { job, company } = data.data.value
  const subject = `Devis N° ${quoteNumber(job)}${company.name ? ` — ${company.name}` : ''}`
  return `mailto:${job.customer_email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message.value)}`
})

const canShare = typeof navigator !== 'undefined' && !!navigator.share
async function share() {
  try {
    await navigator.share({ title: `Devis ${quoteNumber(data.data.value.job)}`, text: message.value })
  } catch {
    // Share sheet dismissed
  }
}
async function copy() {
  try {
    await navigator.clipboard.writeText(data.data.value.link)
    toast('Lien copié')
  } catch {
    toast('Copie impossible', 'error')
  }
}
const print = () => window.print()
</script>

<template>
  <div>
    <p v-if="data.error.value" class="text-sm text-red-600">{{ data.error.value }}</p>
    <AppSpinner v-if="!data.data.value && data.loading.value" />
    <div v-if="data.data.value" class="space-y-3">
      <RouterLink
        v-if="!data.data.value.company.name"
        to="/parametres"
        class="no-print flex items-center gap-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200"
      >
        <Building2 class="size-5 shrink-0" />
        <span>Ajoutez le nom, l'adresse et le matricule fiscal de l'atelier pour qu'ils apparaissent sur le devis.</span>
      </RouterLink>

      <section class="no-print card space-y-2">
        <h3 class="section-title">Envoyer au client</h3>
        <div class="grid grid-cols-2 gap-2">
          <a :href="waLink" target="_blank" rel="noopener" class="btn bg-emerald-600 text-white ring-emerald-600 active:bg-emerald-700">
            <MessageCircle class="size-4" /> WhatsApp
          </a>
          <a :href="mailLink" class="btn"><Mail class="size-4" /> E-mail</a>
          <button v-if="canShare" class="btn" @click="share"><Share2 class="size-4" /> Partager</button>
          <button class="btn" @click="copy"><Copy class="size-4" /> Copier le lien</button>
          <button class="btn" :class="!canShare && 'col-span-2'" @click="print"><Printer class="size-4" /> Imprimer / PDF</button>
        </div>
        <p class="text-xs text-slate-500">Le client reçoit un lien pour consulter le devis, l'imprimer ou l'enregistrer en PDF.</p>
      </section>

      <QuoteDocument :job="data.data.value.job" :company="data.data.value.company" />
    </div>
  </div>
</template>

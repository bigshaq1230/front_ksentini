<script setup>
import { computed } from 'vue'
import { ITEM_KINDS, addDays, formatDate, formatMoney, quoteNumber, quoteTotals, today, vehicleTitle } from '@/utils/format'

// The quote as the customer sees it: on screen, printed, or opened from the shared link.
const props = defineProps({
  job: { type: Object, required: true },
  company: { type: Object, default: () => ({}) },
})

const vatRate = computed(() => Number(props.company.vat_rate) || 0)
const totals = computed(() => quoteTotals(props.job.items, vatRate.value))
const date = computed(() => props.job.date_in ?? props.job.created_at?.slice(0, 10) ?? today())
const validUntil = computed(() => addDays(date.value, props.company.validity_days || 30))
const qty = (n) => Number(n).toLocaleString('fr-TN')
const rate = computed(() => vatRate.value.toLocaleString('fr-TN'))
</script>

<template>
  <article class="quote rounded-2xl bg-white p-5 text-[13px] leading-snug text-slate-800 shadow-card ring-1 ring-slate-900/5 sm:p-8">
    <header class="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
      <div class="min-w-0">
        <p class="text-lg font-bold text-slate-900">{{ company.name || 'Atelier carrosserie' }}</p>
        <p v-if="company.activity" class="text-slate-500">{{ company.activity }}</p>
        <p v-if="company.address" class="mt-1 whitespace-pre-line">{{ company.address }}</p>
        <p v-if="company.phone">Tél. {{ company.phone }}</p>
        <p v-if="company.email">{{ company.email }}</p>
        <p v-if="company.tax_id" class="text-slate-500">MF : {{ company.tax_id }}</p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-extrabold tracking-wide text-slate-900">DEVIS</p>
        <p class="font-semibold">N° {{ quoteNumber(job) }}</p>
        <p>Date : {{ formatDate(date) }}</p>
        <p class="text-slate-500">Valable jusqu'au {{ formatDate(validUntil) }}</p>
      </div>
    </header>

    <div class="grid gap-3 py-4 sm:grid-cols-2">
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="mb-1 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Client</p>
        <p class="font-semibold text-slate-900">{{ job.customer_name }}</p>
        <p v-if="job.customer_phone">{{ job.customer_phone }}</p>
        <p v-if="job.customer_email">{{ job.customer_email }}</p>
      </div>
      <div class="rounded-lg bg-slate-50 p-3">
        <p class="mb-1 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Véhicule</p>
        <p class="font-semibold text-slate-900">{{ vehicleTitle(job) }}</p>
        <p v-if="job.plate">Immatriculation : {{ job.plate }}</p>
        <p v-if="job.color">Couleur : {{ job.color }}</p>
      </div>
    </div>

    <div v-if="job.description" class="pb-4">
      <p class="mb-1 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Travaux à réaliser</p>
      <p class="whitespace-pre-line">{{ job.description }}</p>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-slate-900 text-left text-[11px] tracking-wider text-white uppercase">
          <th class="rounded-l-md px-2 py-2 font-semibold">Désignation</th>
          <th class="px-2 py-2 text-right font-semibold">Qté</th>
          <th class="px-2 py-2 text-right font-semibold">P.U.</th>
          <th class="rounded-r-md px-2 py-2 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in job.items" :key="item.id" class="border-b border-slate-100">
          <td class="px-2 py-2">
            {{ item.label || ITEM_KINDS[item.kind] || 'Autre' }}
            <span v-if="item.label && item.kind" class="block text-[11px] text-slate-400">{{ ITEM_KINDS[item.kind] }}</span>
          </td>
          <td class="px-2 py-2 text-right whitespace-nowrap">{{ qty(item.quantity) }}</td>
          <td class="px-2 py-2 text-right whitespace-nowrap">{{ formatMoney(item.unit_price) }}</td>
          <td class="px-2 py-2 text-right font-medium whitespace-nowrap">{{ formatMoney(item.quantity * item.unit_price) }}</td>
        </tr>
        <tr v-if="!job.items.length">
          <td colspan="4" class="px-2 py-4 text-center text-slate-400">Aucune ligne</td>
        </tr>
      </tbody>
    </table>

    <dl class="mt-3 ml-auto w-full max-w-64 space-y-1">
      <template v-if="vatRate">
        <div class="flex justify-between"><dt>Total HT</dt><dd>{{ formatMoney(totals.subtotal) }}</dd></div>
        <div class="flex justify-between"><dt>TVA {{ rate }} %</dt><dd>{{ formatMoney(totals.vat) }}</dd></div>
      </template>
      <div class="flex justify-between rounded-md bg-slate-900 px-2 py-2 text-base font-bold text-white">
        <dt>{{ vatRate ? 'Total TTC' : 'Total' }}</dt>
        <dd>{{ formatMoney(totals.total) }}</dd>
      </div>
    </dl>

    <footer class="mt-6 space-y-3 border-t border-slate-200 pt-4 text-[12px] text-slate-600">
      <p v-if="company.terms" class="whitespace-pre-line">{{ company.terms }}</p>
      <p v-if="company.rib">RIB : <span class="font-medium text-slate-800">{{ company.rib }}</span></p>
      <div class="grid grid-cols-2 gap-4 pt-2">
        <div class="h-20 rounded-lg border border-dashed border-slate-300 p-2">Cachet de l'atelier</div>
        <div class="h-20 rounded-lg border border-dashed border-slate-300 p-2">Bon pour accord (client)</div>
      </div>
    </footer>
  </article>
</template>

<style scoped>
@media print {
  .quote {
    box-shadow: none;
    border-radius: 0;
    padding: 0;
    --tw-ring-shadow: 0 0 #0000;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>

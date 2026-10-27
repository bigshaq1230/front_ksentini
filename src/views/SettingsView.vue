<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from '@/api'
import { useAction } from '@/composables'
import { toast } from '@/stores/toast'
import AppSpinner from '@/components/AppSpinner.vue'

const FIELDS = { name: '', activity: '', address: '', phone: '', email: '', tax_id: '', rib: '', vat_rate: '', validity_days: '', terms: '' }
const form = reactive({ ...FIELDS })
const loaded = ref(false)

const load = useAction(async () => {
  const company = await api.get('/settings/company')
  for (const k in FIELDS) form[k] = company[k] ?? ''
  loaded.value = true
})
onMounted(load.run)

const save = useAction(async () => {
  await api.put('/settings/company', { ...form })
  toast('Informations enregistrées')
})
</script>

<template>
  <div>
    <p v-if="load.error.value" class="text-sm text-red-600">{{ load.error.value }}</p>
    <AppSpinner v-if="!loaded && load.busy.value" />
    <form v-if="loaded" class="space-y-3" @submit.prevent="save.run">
      <section class="card space-y-3">
        <h3 class="section-title">Atelier (en-tête des devis)</h3>
        <div>
          <label class="label" for="s-name">Nom de l'atelier</label>
          <input id="s-name" v-model="form.name" class="input" placeholder="Carrosserie Ksentini" />
        </div>
        <div>
          <label class="label" for="s-activity">Activité</label>
          <input id="s-activity" v-model="form.activity" class="input" placeholder="Tôlerie — Peinture" />
        </div>
        <div>
          <label class="label" for="s-address">Adresse</label>
          <textarea id="s-address" v-model="form.address" class="input" rows="2" />
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="label" for="s-phone">Téléphone</label>
            <input id="s-phone" v-model="form.phone" class="input" type="tel" inputmode="tel" />
          </div>
          <div>
            <label class="label" for="s-email">Courriel</label>
            <input id="s-email" v-model="form.email" class="input" type="email" />
          </div>
        </div>
        <div>
          <label class="label" for="s-mf">Matricule fiscal</label>
          <input id="s-mf" v-model="form.tax_id" class="input" placeholder="1234567/A/M/000" />
        </div>
        <div>
          <label class="label" for="s-rib">RIB</label>
          <input id="s-rib" v-model="form.rib" class="input" inputmode="numeric" />
        </div>
      </section>

      <section class="card space-y-3">
        <h3 class="section-title">Devis</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="s-vat">TVA (%)</label>
            <input id="s-vat" v-model="form.vat_rate" class="input" inputmode="decimal" placeholder="0" />
          </div>
          <div>
            <label class="label" for="s-valid">Validité (jours)</label>
            <input id="s-valid" v-model="form.validity_days" class="input" inputmode="numeric" placeholder="30" />
          </div>
        </div>
        <p class="text-xs text-slate-500">Avec une TVA, les prix des lignes sont considérés hors taxe et le devis affiche HT, TVA et TTC.</p>
        <div>
          <label class="label" for="s-terms">Conditions (bas du devis)</label>
          <textarea id="s-terms" v-model="form.terms" class="input" rows="3" placeholder="Acompte de 30 % à la commande. Pièces garanties 6 mois." />
        </div>
      </section>

      <p v-if="save.error.value" class="text-sm text-red-600">{{ save.error.value }}</p>
      <button type="submit" class="btn btn-primary w-full" :disabled="save.busy.value">Enregistrer</button>
    </form>
  </div>
</template>

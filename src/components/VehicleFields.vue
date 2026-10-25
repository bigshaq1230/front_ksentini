<script setup>
import { VEHICLE_TYPES } from '@/utils/format'
import { VEHICLE_ICONS as ICONS } from '@/utils/icons'

// Shared by the vehicle form and the intake screen; mutates the parent's reactive form.
defineProps({ form: { type: Object, required: true } })
</script>

<template>
  <div>
    <span class="label">Type</span>
    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="(label, value) in VEHICLE_TYPES"
        :key="value"
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-semibold ring-1"
        :class="form.type === value ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500' : 'bg-white text-slate-500 ring-slate-200'"
        @click="form.type = value"
      >
        <component :is="ICONS[value]" class="size-5" />
        {{ label }}
      </button>
    </div>
  </div>
  <div class="grid grid-cols-2 gap-3">
    <div>
      <label class="label" for="v-make">Marque</label>
      <input id="v-make" v-model="form.make" class="input" autocomplete="off" placeholder="Peugeot" />
    </div>
    <div>
      <label class="label" for="v-model">Modèle</label>
      <input id="v-model" v-model="form.model" class="input" autocomplete="off" placeholder="208" />
    </div>
    <div>
      <label class="label" for="v-year">Année</label>
      <input id="v-year" v-model="form.year" class="input" inputmode="numeric" maxlength="4" pattern="\d{4}" />
    </div>
    <div>
      <label class="label" for="v-color">Couleur</label>
      <input id="v-color" v-model="form.color" class="input" autocomplete="off" />
    </div>
  </div>
</template>

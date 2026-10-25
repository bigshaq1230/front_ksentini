<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ChevronRight, Search, UserPlus } from 'lucide-vue-next'
import { api } from '@/api'
import { useLoader } from '@/composables'
import AppAvatar from '@/components/AppAvatar.vue'
import AppModal from '@/components/AppModal.vue'
import AppSpinner from '@/components/AppSpinner.vue'
import CustomerForm from '@/components/CustomerForm.vue'

const router = useRouter()
const q = ref('')
const list = useLoader(() => api.get(`/customers?q=${encodeURIComponent(q.value.trim())}`))
const creating = ref(false)

let timer
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(list.load, 250)
})
onMounted(list.load)

async function create(data) {
  const customer = await api.post('/customers', data)
  router.push({ name: 'customer', params: { id: customer.id } })
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400" />
        <input v-model="q" class="input bg-white pl-11 shadow-card" type="text" enterkeyhint="search" placeholder="Nom ou téléphone…" />
      </div>
      <button class="btn btn-primary shrink-0 px-3" aria-label="Nouveau client" @click="creating = true">
        <UserPlus class="size-5" />
      </button>
    </div>

    <p v-if="list.error.value" class="text-sm text-red-600">{{ list.error.value }}</p>
    <AppSpinner v-if="list.loading.value && !list.data.value" />
    <p v-else-if="list.data.value && !list.data.value.length" class="py-12 text-center text-sm text-slate-400">Aucun client.</p>

    <div v-if="list.data.value?.length" class="card divide-y divide-slate-100 p-0">
      <RouterLink
        v-for="c in list.data.value"
        :key="c.id"
        :to="{ name: 'customer', params: { id: c.id } }"
        class="flex items-center gap-3 px-4 py-3 active:bg-slate-50"
      >
        <AppAvatar :name="c.name" />
        <span class="min-w-0 flex-1">
          <span class="block truncate font-semibold">{{ c.name }}</span>
          <span class="text-sm text-slate-500">{{ c.phone || c.email || '—' }}</span>
        </span>
        <span class="text-xs text-slate-400">{{ c.vehicle_count }} véh.</span>
        <ChevronRight class="size-4 text-slate-300" />
      </RouterLink>
    </div>

    <AppModal v-if="creating" title="Nouveau client" @close="creating = false">
      <CustomerForm :submit="create" @cancel="creating = false" />
    </AppModal>
  </div>
</template>

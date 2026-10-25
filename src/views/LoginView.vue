<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAction } from '@/composables'

const MAX_LEN = 12
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const pin = ref('')

const { run: submit, busy, error } = useAction(async () => {
  try {
    await auth.login(pin.value)
    router.replace(typeof route.query.next === 'string' ? route.query.next : '/')
  } finally {
    pin.value = ''
  }
})

function press(d) {
  if (pin.value.length < MAX_LEN) pin.value += d
}

function onKey(e) {
  if (/^\d$/.test(e.key)) press(e.key)
  else if (e.key === 'Backspace') pin.value = pin.value.slice(0, -1)
  else if (e.key === 'Enter' && pin.value.length >= 4) submit()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="flex min-h-[85dvh] flex-col items-center justify-center">
    <h1 class="mb-1 text-xl font-semibold">Atelier carrosserie</h1>
    <p class="mb-6 text-sm text-slate-500">Entrez votre code</p>

    <div class="mb-3 flex h-6 items-center gap-2">
      <span v-for="i in Math.max(6, pin.length)" :key="i" class="size-3.5 rounded-full" :class="i <= pin.length ? 'bg-slate-800' : 'bg-slate-300'" />
    </div>
    <p class="mb-4 h-5 text-sm text-red-600">{{ error }}</p>

    <div class="grid w-full max-w-xs grid-cols-3 gap-3">
      <button
        v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
        :key="d"
        class="h-16 rounded-xl bg-white text-2xl font-medium shadow-sm ring-1 ring-slate-200 active:bg-slate-100"
        @click="press(d)"
      >
        {{ d }}
      </button>
      <button class="h-16 rounded-xl text-sm text-slate-500 active:bg-slate-200" aria-label="Effacer" @click="pin = pin.slice(0, -1)">⌫</button>
      <button class="h-16 rounded-xl bg-white text-2xl font-medium shadow-sm ring-1 ring-slate-200 active:bg-slate-100" @click="press('0')">0</button>
      <button
        class="h-16 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 disabled:opacity-40"
        :disabled="pin.length < 4 || busy"
        @click="submit"
      >
        OK
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowRight, Delete } from 'lucide-vue-next'
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

// Re-mounting the dots replays the shake animation on each failed attempt.
const attempt = ref(0)
watch(error, (e) => e && attempt.value++)

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
  <div class="fixed inset-0 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white">
    <div class="pointer-events-none absolute -top-32 -right-24 size-80 rounded-full bg-blue-600/30 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-indigo-600/20 blur-3xl" />

    <div class="relative flex min-h-full flex-col items-center justify-center px-6 py-[max(2rem,env(safe-area-inset-top))]">
      <img src="/icons/icon.svg" alt="" class="mb-4 size-16 rounded-2xl shadow-lg shadow-blue-900/50" />
      <h1 class="text-2xl font-bold tracking-tight">Atelier carrosserie</h1>
      <p class="mt-1 mb-8 text-sm text-slate-400">Entrez votre code d'accès</p>

      <div :key="attempt" class="mb-3 flex h-4 items-center gap-3" :class="{ 'animate-[shake_0.35s]': attempt }">
        <span
          v-for="i in Math.max(6, pin.length)"
          :key="i"
          class="size-3.5 rounded-full transition-all"
          :class="i <= pin.length ? 'scale-110 bg-white' : 'bg-white/20'"
        />
      </div>
      <p class="mb-6 h-5 text-sm font-medium text-red-400">{{ error }}</p>

      <div class="grid w-full max-w-xs grid-cols-3 gap-4">
        <button
          v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
          :key="d"
          class="aspect-square rounded-full bg-white/10 text-2xl font-medium ring-1 ring-white/10 backdrop-blur active:scale-95 active:bg-white/25"
          @click="press(d)"
        >
          {{ d }}
        </button>
        <button class="flex aspect-square items-center justify-center rounded-full text-slate-400 active:bg-white/10" aria-label="Effacer" @click="pin = pin.slice(0, -1)">
          <Delete class="size-6" />
        </button>
        <button class="aspect-square rounded-full bg-white/10 text-2xl font-medium ring-1 ring-white/10 backdrop-blur active:scale-95 active:bg-white/25" @click="press('0')">
          0
        </button>
        <button
          class="flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-600/40 active:scale-95 disabled:opacity-30 disabled:shadow-none"
          :disabled="pin.length < 4 || busy"
          aria-label="OK"
          @click="submit"
        >
          <ArrowRight class="size-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
</style>

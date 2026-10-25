<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, LogOut, Plus, Users, Wrench } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const showNav = computed(() => !route.meta.public)

function back() {
  // Go back in history when we came from inside the app, otherwise to the dashboard.
  if (window.history.state?.back) router.back()
  else router.push('/')
}

async function logout() {
  if (!confirm('Se déconnecter ?')) return
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]">
    <header v-if="showNav" class="no-print sticky top-0 z-20 bg-slate-900 pt-[env(safe-area-inset-top)] text-white">
      <div class="mx-auto flex h-14 max-w-3xl items-center gap-2 px-2">
        <button v-if="route.meta.back" class="rounded-full p-2 active:bg-white/10" aria-label="Retour" @click="back">
          <ArrowLeft class="size-6" />
        </button>
        <span v-else class="flex size-10 items-center justify-center"><Wrench class="size-5 text-blue-400" /></span>
        <h1 class="flex-1 truncate text-lg font-semibold">{{ route.meta.title }}</h1>
        <button v-if="!route.meta.back" class="rounded-full p-2 text-slate-400 active:bg-white/10" aria-label="Déconnexion" @click="logout">
          <LogOut class="size-5" />
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
      <RouterView />
    </main>

    <nav
      v-if="showNav"
      class="no-print fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div class="mx-auto grid h-16 max-w-3xl grid-cols-3 items-center">
        <RouterLink to="/" class="flex flex-col items-center gap-0.5 text-xs font-medium text-slate-500" exact-active-class="!text-blue-600">
          <Wrench class="size-6" />
          Atelier
        </RouterLink>
        <div class="flex justify-center">
          <RouterLink
            to="/nouveau"
            class="-mt-6 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-slate-100 active:bg-blue-700"
            aria-label="Nouvelle entrée"
          >
            <Plus class="size-7" />
          </RouterLink>
        </div>
        <RouterLink to="/clients" class="flex flex-col items-center gap-0.5 text-xs font-medium text-slate-500" active-class="!text-blue-600">
          <Users class="size-6" />
          Clients
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

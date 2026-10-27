<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, LogOut, Plus, Settings, Users, WifiOff, Wrench } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { canInstall, install, online } from '@/pwa'
import AppToasts from '@/components/AppToasts.vue'

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

const tabs = [
  { to: '/', label: 'Atelier', icon: Wrench, exact: true },
  { to: '/clients', label: 'Clients', icon: Users },
]
</script>

<template>
  <div class="min-h-dvh pb-[calc(6rem+env(safe-area-inset-bottom))]">
    <header
      v-if="showNav"
      class="no-print sticky top-0 z-30 bg-gradient-to-r from-slate-900 to-slate-800 pt-[env(safe-area-inset-top)] text-white shadow-lg shadow-slate-900/10"
    >
      <div class="mx-auto flex h-14 max-w-3xl items-center gap-1 px-2">
        <button v-if="route.meta.back" class="rounded-full p-2 active:bg-white/10" aria-label="Retour" @click="back">
          <ArrowLeft class="size-6" />
        </button>
        <span v-else class="mx-1.5 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 shadow-inner">
          <Wrench class="size-4" />
        </span>
        <h1 class="flex-1 truncate px-1 text-lg font-semibold tracking-tight">{{ route.meta.title }}</h1>
        <button
          v-if="canInstall && !route.meta.back"
          class="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold active:bg-white/20"
          @click="install"
        >
          <Download class="size-4" /> Installer
        </button>
        <RouterLink v-if="!route.meta.back" to="/parametres" class="rounded-full p-2 text-slate-400 active:bg-white/10" aria-label="Mon atelier">
          <Settings class="size-5" />
        </RouterLink>
        <button v-if="!route.meta.back" class="rounded-full p-2 text-slate-400 active:bg-white/10" aria-label="Déconnexion" @click="logout">
          <LogOut class="size-5" />
        </button>
      </div>
      <div v-if="!online" class="flex items-center justify-center gap-2 bg-amber-500 py-1 text-xs font-semibold text-amber-950">
        <WifiOff class="size-3.5" /> Hors ligne — les données ne peuvent pas être chargées
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="r.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <nav v-if="showNav" class="no-print fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div class="relative mx-auto grid h-16 max-w-md grid-cols-3 items-center rounded-2xl bg-white/90 shadow-float ring-1 ring-slate-900/5 backdrop-blur-lg">
        <RouterLink
          v-for="(tab, i) in tabs"
          :key="tab.to"
          :to="tab.to"
          class="group flex flex-col items-center gap-0.5 text-[11px] font-semibold text-slate-400"
          :class="i === 1 && 'col-start-3'"
          :exact-active-class="tab.exact ? 'is-active' : undefined"
          :active-class="tab.exact ? undefined : 'is-active'"
        >
          <span class="flex h-7 w-12 items-center justify-center rounded-full group-[.is-active]:bg-blue-100 group-[.is-active]:text-blue-600">
            <component :is="tab.icon" class="size-5" />
          </span>
          <span class="group-[.is-active]:text-blue-600">{{ tab.label }}</span>
        </RouterLink>
        <RouterLink
          to="/nouveau"
          class="absolute left-1/2 -top-5 flex size-14 -translate-x-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/40 ring-4 ring-slate-100 active:scale-95"
          aria-label="Nouvelle entrée"
        >
          <Plus class="size-7" stroke-width="2.5" />
        </RouterLink>
      </div>
    </nav>

    <AppToasts />
  </div>
</template>

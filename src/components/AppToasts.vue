<script setup>
import { CircleAlert, CircleCheck } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'

const store = useToastStore()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4rem)] z-50 flex flex-col items-center gap-2 px-4">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-3 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in store.toasts"
        :key="t.id"
        class="flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2.5 text-sm font-medium text-white shadow-float backdrop-blur"
      >
        <CircleCheck v-if="t.type === 'success'" class="size-4 text-green-400" />
        <CircleAlert v-else class="size-4 text-red-400" />
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

defineProps({ title: { type: String, required: true } })
const emit = defineEmits(['close'])

const onKey = (e) => e.key === 'Escape' && emit('close')
onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" @click.self="emit('close')">
      <div
        class="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl sm:pt-5"
      >
        <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button class="-m-2 rounded-full p-2 text-slate-400 active:bg-slate-100" aria-label="Fermer" @click="emit('close')">
            <X class="size-5" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

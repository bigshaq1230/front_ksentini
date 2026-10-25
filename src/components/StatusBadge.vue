<script setup>
import { JOB_STATUSES } from '@/utils/format'

defineProps({ status: { type: String, required: true } })
</script>

<template>
  <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" :class="JOB_STATUSES[status]?.color">
    {{ JOB_STATUSES[status]?.label ?? status }}
  </span>
</template>

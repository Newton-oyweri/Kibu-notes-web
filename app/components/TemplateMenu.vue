
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const items: DropdownMenuItem[] = [
  { label: 'Computer Science' },
  { label: 'Information Technology' },
  { label: 'Software Engineering' },
  { label: 'Business Information Technology' },
  { label: 'Mathematics' },
  { label: 'Statistics' },
  { label: 'Physics' },
  { label: 'Chemistry' },
  { label: 'Biology' },
  { label: 'Agriculture' },
  { label: 'Nursing' },
  { label: 'Public Health' },
  { label: 'Education Science' },
  { label: 'Education Arts' },
  { label: 'Economics' },
  { label: 'Commerce' },
  { label: 'Accounting' },
  { label: 'Human Resource Management' },
  { label: 'Procurement and Supply Chain' },
  { label: 'Criminology' },
  { label: 'Communication and Media' },
  { label: 'Environmental Science' },
  { label: 'Hospitality and Tourism' }
]
</script>

<template>
  <UDropdownMenu
    v-slot="{ open }"
    :modal="false"
    :items="items"
    :content="{ align: 'start' }"
    :ui="{ content: 'min-w-fit' }"
    size="xs"
  >
    <UButton
      label="Choose course"
      variant="subtle"
      trailing-icon="i-lucide-chevron-down"
      size="xs"
      class="-mb-1.5 font-semibold rounded-full truncate"
      :class="[open && 'bg-primary/15']"
      :ui="{
        trailingIcon: ['transition-transform duration-200', open ? 'rotate-180' : undefined].filter(Boolean).join(' ')
      }"
    />
  </UDropdownMenu>
</template>

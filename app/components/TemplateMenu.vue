
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { $supabase } = useNuxtApp()

interface Programme {
  id: string
  title: string
  code: string
  duration_years: number
}

const selectedCourse = ref('Choose course')

const { data: programmes, error } = await useAsyncData(
  'kibu-programmes',
  async () => {
    const { data, error } = await $supabase
      .from('programmes')
      .select('id, title, code, duration_years')
      .order('title')

    if (error) throw error

    return data as Programme[]
  }
)

const items = computed<DropdownMenuItem[]>(() =>
  (programmes.value ?? []).map(programme => ({
    label: programme.title,
    onSelect: () => {
      selectedCourse.value = programme.title
    }
  }))
)
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
      :label="selectedCourse"
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

  <UAlert
    v-if="error"
    color="error"
    title="Could not load programmes"
    :description="error.message"
  />
</template>

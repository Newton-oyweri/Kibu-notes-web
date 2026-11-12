import { slugify } from '~/utils/slugify'
<script setup lang="ts">
interface School {
  id: string
  name: string
  code: string
}

const { $supabase } = useNuxtApp()

const { data: schools, error } = await useAsyncData(
  'kibu-schools',
  async () => {
    const { data, error } = await $supabase
      .from('schools')
      .select('id, name, code')
      .order('name')

    if (error) throw error

    return data as School[]
  }
)

useSeoMeta({
  title: 'Kibu Notes | Kibabii University Student Resources',
  description: 'Explore Kibabii University schools, academic programmes, notes and past examination papers.'
})
</script>

<template>
  <UContainer class="py-10 space-y-8">
    <section class="space-y-3">
      <p class="text-sm font-medium text-primary">
        Learn. Share. Grow.
      </p>

      <h1 class="text-3xl font-bold">
        Find your academic resources
      </h1>

      <p class="text-muted max-w-2xl">
        Explore schools, programmes, notes and past papers at Kibabii University.
      </p>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        Explore schools
      </h2>

      <UAlert
        v-if="error"
        color="error"
        title="Could not load schools"
        :description="error.message"
      />

      <div
        v-else-if="schools?.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="school in schools"
          :key="school.id"
          :to="`/schools/${encodeURIComponent(slugify(school.name))}`"
          class="rounded-xl border border-default p-5 hover:border-primary transition-colors"
        >
          <h3 class="font-semibold">
            {{ school.name }}
          </h3>

          <p class="text-sm text-muted mt-2">
            {{ school.code }}
          </p>

          <p class="text-sm text-primary mt-4">
            Explore programmes →
          </p>
        </NuxtLink>
      </div>

      <p v-else-if="schools" class="text-muted">
        No schools have been added yet.
      </p>
    </section>
  </UContainer>
</template>

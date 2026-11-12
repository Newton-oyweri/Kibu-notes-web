import { slugify } from '~/utils/slugify'

<script setup lang="ts">
interface School {
  id: string
  name: string
  code: string
}

interface Programme {
  id: string
  title: string
  code: string
  duration_years: number
}


const route = useRoute()
const { $supabase } = useNuxtApp()

const slug = String(route.params.slug)

const { data: school, error : schoolError } = await useAsyncData(
  `school-${slug}`,
  async () => {
    const { data, error } = await $supabase
      .from('schools')
      .select('id, name, code')

    if (error) throw error

    const school = data.find(
      item => slugify(item.name) === slug
    )

    if (!school) {
      throw createError({
        statusCode: 404,
        statusMessage: 'School not found'
      })
    }

    return school
  }
)
const { data: programmes, error: programmesError } = await useAsyncData(
  `school-programmes-${slug}`,
  async () => {
    if (!school.value) return []

    const { data, error } = await $supabase
      .from('programmes')
      .select('id, title, code, duration_years')
      .eq('school_id', school.value.id)
      .order('title')

    if (error) throw error

    return data as Programme[]
  }
)

useSeoMeta({
  title: () => school.value
    ? `${school.value.name} | Kibu Notes`
    : 'Kibabii University Schools | Kibu Notes',
  description: () => school.value
    ? `Explore academic programmes, notes and past papers from ${school.value.name} at Kibabii University.`
    : 'Explore Kibabii University academic schools and programmes.'
})
</script>

<template>
  <UContainer class="py-10 space-y-8">
    <div class="space-y-3">
      <NuxtLink to="/" class="text-sm text-primary">
        ← All schools
      </NuxtLink>

      <template v-if="school">
        <p class="text-sm text-primary font-medium">
          {{ school.code }}
        </p>

        <h1 class="text-3xl font-bold">
          {{ school.name }}
        </h1>

        <p class="text-muted">
          Explore programmes offered by this school.
        </p>
      </template>
    </div>

    <UAlert
      v-if="schoolError || programmesError"
      color="error"
      title="Unable to load this page"
      :description="schoolError?.message || programmesError?.message"
    />

    <section v-else-if="school" class="space-y-4">
      <h2 class="text-xl font-semibold">
        Academic programmes
      </h2>

      <div
        v-if="programmes?.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="programme in programmes"
          :key="programme.id"
          :to="`/programmes/${programme.code}`"
          class="rounded-xl border border-default p-5 hover:border-primary transition-colors"
        >
          <h3 class="font-semibold">
            {{ programme.title }}
          </h3>

          <p class="text-sm text-muted mt-2">
            {{ programme.code }} · {{ programme.duration_years }} years
          </p>

          <p class="text-sm text-primary mt-4">
            Explore programme →
          </p>
        </NuxtLink>
      </div>

      <p v-else class="text-muted">
        No programmes have been added to this school yet.
      </p>
    </section>
  </UContainer>
</template>

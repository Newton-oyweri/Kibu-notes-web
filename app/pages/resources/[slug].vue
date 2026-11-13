
<script setup lang="ts">
interface Resource {
  id: string
  unit_id: string
  title: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  visibility: string
  created_at: string
  category: string
  slug: string | null
  description: string | null
  topics: string[] | null
  page_count: number | null
  updated_at: string | null
}

interface Unit {
  id: string
  title: string
  code: string
  description: string | null
}

const route = useRoute()
const { $supabase } = useNuxtApp()

const slug = computed(() => String(route.params.slug))

// Fetch resource
const {
  data: resource,
  error: resourceError
} = await useAsyncData(
  () => `resource-${slug.value}`,
  async () => {
    const { data, error } = await $supabase
      .from('resources')
      .select(`
        id,
        unit_id,
        title,
        file_name,
        file_path,
        file_size,
        mime_type,
        visibility,
        created_at,
        category,
        slug,
        description,
        topics,
        page_count,
        updated_at
      `)
      .eq('slug', slug.value)
      .eq('visibility', 'public')
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resource not found'
      })
    }

    return data as Resource
  }
)

if (resourceError.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Resource not found'
  })
}

// Fetch associated unit
const { data: unit } = await useAsyncData(
  () => `resource-unit-${resource.value?.unit_id}`,
  async () => {
    if (!resource.value) return null

    const { data, error } = await $supabase
      .from('units')
      .select('id, title, code, description')
      .eq('id', resource.value.unit_id)
      .maybeSingle()

    if (error) throw error

    return data as Unit | null
  }
)

// SEO
const description = computed(() =>
  resource.value?.description ||
  `${resource.value?.title || 'Study resource'} - learning materials and notes for Kibabii University students.`
)

const topics = computed(() => resource.value?.topics ?? [])

useSeoMeta({
  title: () => resource.value
    ? `${resource.value.title} | Kibu Notes`
    : 'Resource | Kibu Notes',

  description: () => description.value,

  ogTitle: () => resource.value
    ? `${resource.value.title} | Kibu Notes`
    : 'Kibu Notes',

  ogDescription: () => description.value,

  ogType: 'article',

  twitterCard: 'summary'
})

// Helpers
const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Unknown size'

  const units = ['Bytes', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`
}

const formattedDate = computed(() => {
  if (!resource.value?.created_at) return ''

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(resource.value.created_at))
})

const categoryLabel = computed(() => {
  const category = resource.value?.category

  if (!category) return 'Study resource'

  return category === 'past_papers'
    ? 'Past Paper'
    : 'Study Notes'
})
</script>

<template>
  <div v-if="resource" class="mx-auto max-w-5xl px-4 py-8 space-y-8">

    <!-- Resource heading -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge color="primary" variant="subtle">
          {{ categoryLabel }}
        </UBadge>

        <UBadge color="neutral" variant="outline">
          {{ resource.mime_type.split('/').pop()?.toUpperCase() }}
        </UBadge>
      </div>

      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        {{ resource.title }}
      </h1>

      <p
        v-if="resource.description"
        class="text-base leading-7 text-muted"
      >
        {{ resource.description }}
      </p>

      <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
        <span v-if="unit" class="flex items-center gap-1.5">
          <UIcon name="i-lucide-book-open" />
          {{ unit.code }} - {{ unit.title }}
        </span>

        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-file" />
          {{ formatFileSize(resource.file_size) }}
        </span>

        <span v-if="resource.page_count" class="flex items-center gap-1.5">
          <UIcon name="i-lucide-files" />
          {{ resource.page_count }} pages
        </span>

        <span v-if="formattedDate" class="flex items-center gap-1.5">
          <UIcon name="i-lucide-calendar" />
          {{ formattedDate }}
        </span>
      </div>
    </section>

    <USeparator />

    <!-- Document -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        Document
      </h2>

      <UCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <div class="rounded-lg bg-primary/10 p-3">
              <UIcon
                name="i-lucide-file-text"
                class="size-7 text-primary"
              />
            </div>

            <div class="min-w-0">
              <p class="truncate font-medium">
                {{ resource.file_name }}
              </p>
              <p class="text-sm text-muted">
                {{ formatFileSize(resource.file_size) }}
              </p>
            </div>
          </div>

          <UButton
            :to="resource.file_path"
            target="_blank"
            rel="noopener noreferrer"
            icon="i-lucide-external-link"
            trailing
          >
            Open document
          </UButton>
        </div>
      </UCard>
    </section>

    <!-- Topics -->
    <section v-if="topics.length" class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold">
          Topics covered
        </h2>

        <p class="mt-1 text-sm text-muted">
          Explore the concepts covered in this learning resource.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(topic, index) in topics"
          :key="`${topic}-${index}`"
          color="neutral"
          variant="subtle"
          size="lg"
        >
          {{ topic }}
        </UBadge>
      </div>
    </section>

    <!-- Unit information -->
    <section v-if="unit?.description" class="space-y-3">
      <USeparator />

      <h2 class="text-xl font-semibold">
        About {{ unit.title }}
      </h2>

      <p class="leading-7 text-muted">
        {{ unit.description }}
      </p>
    </section>

    <!-- Attribution -->
    <USeparator />

    <footer class="text-sm text-muted">
      <p>
        Shared for learning purposes on Kibu Notes.
      </p>

      <p class="mt-1">
        Kibu Notes – Learn. Share. Grow.
      </p>
    </footer>

  </div>
</template>

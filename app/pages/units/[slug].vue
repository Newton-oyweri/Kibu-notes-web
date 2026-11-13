
<script setup lang="ts">
interface Unit {
  id: string
  title: string
  code: string
  description: string | null
}

interface Resource {
  id: string
  title: string
  slug: string | null
  description: string | null
  topics: string[] | null
  file_name: string
  file_size: number
  mime_type: string
  category: string
  page_count: number | null
  created_at: string
}

interface Programme {
  id: string
  title: string
  code: string
}

const route = useRoute()
const { $supabase } = useNuxtApp()

const searchQuery = ref('')
const selectedCategory = ref('all')

const { data: unit, error: unitError } = await useAsyncData(
  () => `unit-${route.params.slug}`,
  async () => {
    const { data, error } = await $supabase
      .from('units')
      .select('id, title, code, description')
      .eq('code', String(route.params.slug))
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Unit not found'
      })
    }

    return data as Unit
  }
)

if (unitError.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Unit not found'
  })
}

// Fetch public resources and associated programmes
const { data: unitData, error: dataError } = await useAsyncData(
  () => `unit-resources-${route.params.slug}`,
  async () => {
    if (!unit.value) return {
      resources: [] as Resource[],
      programmes: [] as Programme[]
    }

    const [resourcesResult, programmeUnitsResult] = await Promise.all([
      $supabase
        .from('resources')
        .select(`
          id,
          title,
          slug,
          description,
          topics,
          file_name,
          file_size,
          mime_type,
          category,
          page_count,
          created_at
        `)
        .eq('unit_id', unit.value.id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false }),

      $supabase
        .from('programme_units')
        .select('programme_id')
        .eq('unit_id', unit.value.id)
    ])

    if (resourcesResult.error) throw resourcesResult.error
    if (programmeUnitsResult.error) throw programmeUnitsResult.error

    const programmeIds = [
      ...new Set(
        (programmeUnitsResult.data ?? []).map(item => item.programme_id)
      )
    ]

    let programmes: Programme[] = []

    if (programmeIds.length) {
      const { data, error } = await $supabase
        .from('programmes')
        .select('id, title, code')
        .in('id', programmeIds)
        .order('title')

      if (error) throw error

      programmes = (data ?? []) as Programme[]
    }

    return {
      resources: (resourcesResult.data ?? []) as Resource[],
      programmes
    }
  }
)

if (dataError.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Unable to load unit resources'
  })
}

const resources = computed(() => unitData.value?.resources ?? [])
const programmes = computed(() => unitData.value?.programmes ?? [])

const filteredResources = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return resources.value.filter(resource => {
    const matchesCategory =
      selectedCategory.value === 'all' ||
      resource.category === selectedCategory.value

    const searchableText = [
      resource.title,
      resource.description,
      resource.file_name,
      ...(resource.topics ?? [])
    ].filter(Boolean).join(' ').toLowerCase()

    const matchesSearch =
      !query || searchableText.includes(query)

    return matchesCategory && matchesSearch
  })
})

const studyNotes = computed(() =>
  filteredResources.value.filter(item => item.category === 'topics')
)

const pastPapers = computed(() =>
  filteredResources.value.filter(item => item.category === 'past_papers')
)

const notesCount = computed(() =>
  resources.value.filter(item => item.category === 'topics').length
)

const pastPapersCount = computed(() =>
  resources.value.filter(item => item.category === 'past_papers').length
)

const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Unknown size'

  const units = ['Bytes', 'KB', 'MB', 'GB']
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))

useSeoMeta({
  title: () => unit.value
    ? `${unit.value.title} (${unit.value.code}) Notes and Past Papers | Kibu Notes`
    : 'Unit Resources | Kibu Notes',

  description: () => unit.value
    ? `Find study notes, past papers and learning resources for ${unit.value.title} (${unit.value.code}) at Kibabii University.`
    : 'Browse academic resources on Kibu Notes.',

  ogTitle: () => unit.value
    ? `${unit.value.title} | Kibu Notes`
    : 'Kibu Notes',

  ogDescription: () => unit.value?.description ||
    `Study notes and past papers for ${unit.value?.code ?? 'this unit'}.`,

  ogType: 'website'
})
</script>

<template>
  <main v-if="unit" class="mx-auto max-w-5xl px-4 py-8 space-y-8">

    <!-- Unit heading -->
    <section class="space-y-3">
      <UBadge color="primary" variant="subtle">
        {{ unit.code }}
      </UBadge>

      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        {{ unit.title }}
      </h1>

      <p v-if="unit.description" class="text-muted leading-7">
        {{ unit.description }}
      </p>

      <p v-else class="text-muted">
        Study notes, past papers and learning materials for {{ unit.code }}.
      </p>
    </section>

    <!-- Associated programmes -->
    <section v-if="programmes.length" class="space-y-3">
      <h2 class="text-sm font-semibold">
        Programmes offering this unit
      </h2>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="programme in programmes"
          :key="programme.id"
          :to="`/programmes/${programme.code}`"
          variant="outline"
          color="neutral"
          size="sm"
        >
          {{ programme.title }}
        </UButton>
      </div>
    </section>

    <USeparator />

    <!-- Resource statistics -->
    <section class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <UCard>
        <p class="text-2xl font-bold tabular-nums">
          {{ resources.length }}
        </p>
        <p class="text-sm text-muted">Total resources</p>
      </UCard>

      <UCard>
        <p class="text-2xl font-bold tabular-nums">
          {{ notesCount }}
        </p>
        <p class="text-sm text-muted">Study notes</p>
      </UCard>

      <UCard class="col-span-2 sm:col-span-1">
        <p class="text-2xl font-bold tabular-nums">
          {{ pastPapersCount }}
        </p>
        <p class="text-sm text-muted">Past papers</p>
      </UCard>
    </section>

    <!-- Resource discovery -->
    <section class="space-y-5">
      <div class="space-y-1">
        <h2 class="text-2xl font-semibold">
          Learning resources
        </h2>
        <p class="text-sm text-muted">
          Find notes and past papers for this unit.
        </p>
      </div>

      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Search titles, topics or descriptions..."
        size="lg"
        class="w-full"
      />

      <div class="flex flex-wrap gap-2">
        <UButton
          :variant="selectedCategory === 'all' ? 'solid' : 'outline'"
          :color="selectedCategory === 'all' ? 'primary' : 'neutral'"
          @click="selectedCategory = 'all'"
        >
          All resources
        </UButton>

        <UButton
          :variant="selectedCategory === 'topics' ? 'solid' : 'outline'"
          :color="selectedCategory === 'topics' ? 'primary' : 'neutral'"
          @click="selectedCategory = 'topics'"
        >
          Study notes
        </UButton>

        <UButton
          :variant="selectedCategory === 'past_papers' ? 'solid' : 'outline'"
          :color="selectedCategory === 'past_papers' ? 'primary' : 'neutral'"
          @click="selectedCategory = 'past_papers'"
        >
          Past papers
        </UButton>
      </div>

      <!-- Study notes -->
      <div
        v-if="selectedCategory !== 'past_papers' && studyNotes.length"
        class="space-y-3"
      >
        <h3 class="text-lg font-semibold">
          Study notes
          <span class="text-sm text-muted font-normal">
            ({{ studyNotes.length }})
          </span>
        </h3>

        <div class="grid gap-3">
          <UCard
            v-for="resource in studyNotes"
            :key="resource.id"
            class="hover:border-primary/50 transition-colors"
          >
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-file-text"
                  class="size-6 text-primary shrink-0 mt-1"
                />

                <div class="min-w-0 flex-1 space-y-1">
                  <h4 class="font-semibold leading-snug">
                    {{ resource.title }}
                  </h4>

                  <p
                    v-if="resource.description"
                    class="text-sm text-muted line-clamp-2"
                  >
                    {{ resource.description }}
                  </p>

                  <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{{ formatFileSize(resource.file_size) }}</span>

                    <span v-if="resource.page_count">
                      {{ resource.page_count }} pages
                    </span>

                    <span>{{ formatDate(resource.created_at) }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="resource.topics?.length"
                class="flex flex-wrap gap-1.5"
              >
                <UBadge
                  v-for="topic in resource.topics.slice(0, 4)"
                  :key="topic"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ topic }}
                </UBadge>
              </div>

              <div class="flex justify-end">
                <UButton
                  v-if="resource.slug"
                  :to="`/resources/${resource.slug}`"
                  icon="i-lucide-eye"
                  variant="outline"
                  size="sm"
                >
                  View resource
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Past papers -->
      <div
        v-if="selectedCategory !== 'topics' && pastPapers.length"
        class="space-y-3"
      >
        <h3 class="text-lg font-semibold">
          Past papers
          <span class="text-sm text-muted font-normal">
            ({{ pastPapers.length }})
          </span>
        </h3>

        <div class="grid gap-3">
          <UCard
            v-for="resource in pastPapers"
            :key="resource.id"
            class="hover:border-primary/50 transition-colors"
          >
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-file-check"
                class="size-6 text-primary shrink-0 mt-1"
              />

              <div class="min-w-0 flex-1 space-y-1">
                <h4 class="font-semibold">
                  {{ resource.title }}
                </h4>

                <p
                  v-if="resource.description"
                  class="text-sm text-muted line-clamp-2"
                >
                  {{ resource.description }}
                </p>

                <div class="flex flex-wrap gap-x-3 text-xs text-muted">
                  <span>{{ formatFileSize(resource.file_size) }}</span>

                  <span v-if="resource.page_count">
                    {{ resource.page_count }} pages
                  </span>

                  <span>{{ formatDate(resource.created_at) }}</span>
                </div>

                <div class="flex justify-end pt-2">
                  <UButton
                    v-if="resource.slug"
                    :to="`/resources/${resource.slug}`"
                    icon="i-lucide-eye"
                    variant="outline"
                    size="sm"
                  >
                    View resource
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Empty state -->
      <UCard
        v-if="filteredResources.length === 0"
        class="text-center py-8"
      >
        <UIcon
          name="i-lucide-folder-search"
          class="size-10 text-muted mx-auto mb-3"
        />

        <h3 class="font-semibold">
          No resources found
        </h3>

        <p class="text-sm text-muted mt-1">
          {{
            searchQuery
              ? 'Try another search term.'
              : 'There are currently no resources in this category.'
          }}
        </p>

        <UButton
          v-if="searchQuery || selectedCategory !== 'all'"
          class="mt-4"
          variant="outline"
          color="neutral"
          @click="searchQuery = ''; selectedCategory = 'all'"
        >
          Clear filters
        </UButton>
      </UCard>
    </section>

    <footer class="text-sm text-muted">
      Kibu Notes – Learn. Share. Grow.
    </footer>

  </main>
</template>

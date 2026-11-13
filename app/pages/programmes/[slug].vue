<script setup lang="ts">
interface Programme {
  id: string
  title: string
  code: string
  duration_years: number
}

interface ProgrammeUnit {
  unit_id: string
  academic_year: number | null
  semester: number | null
}

interface Unit {
  id: string
  title: string
  code: string
  description: string | null
}

interface Resource {
  id: string
  unit_id: string
  title: string
  slug: string | null
  description: string | null
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  category: string
  topics: string[] | null
  page_count: number | null
  created_at: string
}

interface UnitWithResources extends Unit {
  academic_year: number | null
  semester: number | null
  resources: Resource[]
}

const route = useRoute()
const { $supabase } = useNuxtApp()

const slug = computed(() => String(route.params.slug))

// Filters
const searchQuery = ref('')
const selectedCategory = ref('all')

// Fetch programme and all its resources
const {
  data: programmeData,
  error,
  status,
  refresh
} = await useAsyncData(
  () => `programme-resources-${slug.value}`,
  async () => {
    // 1. Fetch programme
    const { data: programme, error: programmeError } = await $supabase
      .from('programmes')
      .select('id, title, code, duration_years')
      .eq('code', slug.value)
      .single()

    if (programmeError) {
      if (programmeError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Programme not found'
        })
      }

      throw programmeError
    }

    // 2. Fetch programme-unit relationships
    const { data: programmeUnits, error: relationshipError } =
      await $supabase
        .from('programme_units')
        .select('unit_id, academic_year, semester')
        .eq('programme_id', programme.id)

    if (relationshipError) throw relationshipError

    const relationships = (programmeUnits ?? []) as ProgrammeUnit[]

    const unitIds = relationships.map(item => item.unit_id)

    if (!unitIds.length) {
      return {
        programme: programme as Programme,
        units: [] as UnitWithResources[]
      }
    }

    // 3. Fetch units
    const { data: units, error: unitsError } = await $supabase
      .from('units')
      .select('id, title, code, description')
      .in('id', unitIds)
      .order('title')

    if (unitsError) throw unitsError

    // 4. Fetch public resources belonging to these units
    const { data: resources, error: resourcesError } = await $supabase
      .from('resources')
      .select(`
        id,
        unit_id,
        title,
        slug,
        description,
        file_name,
        file_path,
        file_size,
        mime_type,
        category,
        topics,
        page_count,
        created_at
      `)
      .in('unit_id', unitIds)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (resourcesError) throw resourcesError

    // 5. Combine units, academic information and resources
    const unitData = (units ?? []) as Unit[]

    const resourceData = (resources ?? []) as Resource[]

    const result: UnitWithResources[] = unitData.map(unit => {
      const relationship = relationships.find(
        item => item.unit_id === unit.id
      )

      return {
        ...unit,
        academic_year: relationship?.academic_year ?? null,
        semester: relationship?.semester ?? null,
        resources: resourceData.filter(
          resource => resource.unit_id === unit.id
        )
      }
    })

    return {
      programme: programme as Programme,
      units: result
    }
  }
)

const programme = computed(() => programmeData.value?.programme)

const units = computed(() => programmeData.value?.units ?? [])

const totalResources = computed(() =>
  units.value.reduce((total, unit) => total + unit.resources.length, 0)
)

// Filter units and resources
const filteredUnits = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return units.value
    .map(unit => {
      const resources = unit.resources.filter(resource => {
        const matchesCategory =
          selectedCategory.value === 'all' ||
          resource.category === selectedCategory.value

        const searchableText = [
          resource.title,
          resource.description ?? '',
          resource.file_name,
          unit.title,
          unit.code,
          ...(resource.topics ?? [])
        ].join(' ').toLowerCase()

        const matchesSearch =
          !query || searchableText.includes(query)

        return matchesCategory && matchesSearch
      })

      return {
        ...unit,
        resources
      }
    })
    .filter(unit => unit.resources.length > 0)
})

// Resource counts by category
const topicCount = computed(() =>
  units.value.reduce(
    (total, unit) =>
      total + unit.resources.filter(r => r.category === 'topics').length,
    0
  )
)

const pastPaperCount = computed(() =>
  units.value.reduce(
    (total, unit) =>
      total + unit.resources.filter(r => r.category === 'past_papers').length,
    0
  )
)

// Formatting helpers
function formatFileSize(bytes: number) {
  if (!bytes) return 'Unknown size'

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function categoryLabel(category: string) {
  switch (category) {
    case 'topics':
      return 'Topic'
    case 'past_papers':
      return 'Past Paper'
    default:
      return category.replace(/_/g, ' ')
  }
}

// SEO
useSeoMeta({
  title: () => programme.value
    ? `${programme.value.title} | Kibu Notes`
    : 'Academic Resources | Kibu Notes',

  description: () => programme.value
    ? `Access notes, past papers and academic resources for ${programme.value.title} (${programme.value.code}) at Kibabii University.`
    : 'Explore academic resources at Kibabii University.',

  ogTitle: () => programme.value
    ? `${programme.value.title} | Kibu Notes`
    : 'Kibu Notes',

  ogDescription: () => programme.value
    ? `Study materials and past papers for ${programme.value.title}.`
    : 'Kibabii University student resources.'
})
</script>

<template>
  <UContainer class="py-8 md:py-12 space-y-8">

    <!-- Programme header -->
    <section class="space-y-4">

      <NuxtLink
        to="/"
        class="text-sm text-primary hover:underline"
      >
        ← All schools
      </NuxtLink>

      <div v-if="programme" class="space-y-3">

        <UBadge color="primary" variant="subtle">
          {{ programme.code }}
        </UBadge>

        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">
          {{ programme.title }}
        </h1>

        <p class="text-muted max-w-2xl">
          Explore notes, past papers and learning materials
          for this academic programme at Kibabii University.
        </p>

        <div class="flex flex-wrap gap-3 text-sm text-muted">
          <span>{{ programme.duration_years }} years</span>
          <span>·</span>
          <span>{{ units.length }} units</span>
          <span>·</span>
          <span>{{ totalResources }} resources</span>
        </div>

      </div>

    </section>

    <!-- Loading -->
    <div
      v-if="status === 'pending'"
      class="flex flex-col items-center justify-center py-20 gap-3"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-primary"
      />
      <p class="text-sm text-muted">
        Loading academic resources...
      </p>
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      title="Unable to load programme"
      :description="error.message"
    >
      <template #actions>
        <UButton
          color="error"
          variant="outline"
          size="sm"
          @click="refresh()"
        >
          Try again
        </UButton>
      </template>
    </UAlert>

    <template v-else-if="programme">

      <!-- Statistics -->
      <section class="grid grid-cols-2 sm:grid-cols-3 gap-3">

        <UCard>
          <p class="text-2xl font-bold">
            {{ units.length }}
          </p>
          <p class="text-sm text-muted">Academic units</p>
        </UCard>

        <UCard>
          <p class="text-2xl font-bold">
            {{ totalResources }}
          </p>
          <p class="text-sm text-muted">Total resources</p>
        </UCard>

        <UCard class="col-span-2 sm:col-span-1">
          <p class="text-2xl font-bold">
            {{ pastPaperCount }}
          </p>
          <p class="text-sm text-muted">Past papers</p>
        </UCard>

      </section>

      <!-- Resource search and filters -->
      <section class="space-y-4">

        <div class="flex flex-col sm:flex-row gap-3">

          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Search resources, topics or units..."
            size="lg"
            class="flex-1"
          />

          <USelect
            v-model="selectedCategory"
            :items="[
              { label: 'All resources', value: 'all' },
              { label: 'Topics', value: 'topics' },
              { label: 'Past papers', value: 'past_papers' }
            ]"
            value-key="value"
            size="lg"
            class="sm:w-48"
          />

        </div>

        <div class="flex flex-wrap gap-2 text-xs text-muted">
          <span>{{ topicCount }} topic resources</span>
          <span>·</span>
          <span>{{ pastPaperCount }} past papers</span>
        </div>

      </section>

      <!-- Resources grouped by unit -->
      <section class="space-y-8">

        <div
          v-if="filteredUnits.length"
          v-for="unit in filteredUnits"
          :key="unit.id"
          class="space-y-4"
        >

          <!-- Unit heading -->
          <div class="flex flex-wrap items-start justify-between gap-3">

            <div class="space-y-1">

              <h2 class="text-lg font-semibold">
                {{ unit.title }}
              </h2>

              <p class="text-sm text-muted">
                {{ unit.code }}

                <template v-if="unit.academic_year">
                  · Year {{ unit.academic_year }}
                </template>

                <template v-if="unit.semester">
                  · Semester {{ unit.semester }}
                </template>
              </p>

            </div>

            <UBadge color="neutral" variant="subtle">
              {{ unit.resources.length }}
              {{ unit.resources.length === 1 ? 'resource' : 'resources' }}
            </UBadge>

          </div>

          <!-- Individual resources -->
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <UCard
              v-for="resource in unit.resources"
              :key="resource.id"
              class="hover:border-primary/50 transition-colors"
              :ui="{ body: 'p-4 sm:p-4' }"
            >

              <div class="flex flex-col gap-3 h-full">

                <div class="flex items-start justify-between gap-2">

                  <div class="flex items-center gap-2 min-w-0">

                    <UIcon
                      name="i-lucide-file-text"
                      class="size-6 text-primary shrink-0"
                    />

                    <UBadge
                      :color="resource.category === 'past_papers' ? 'warning' : 'info'"
                      variant="subtle"
                    >
                      {{ categoryLabel(resource.category) }}
                    </UBadge>

                  </div>

                  <UIcon
                    v-if="resource.mime_type === 'application/pdf'"
                    name="i-lucide-file-pdf"
                    class="size-5 text-muted shrink-0"
                  />

                </div>

                <div class="space-y-1 flex-1">

                  <h3 class="font-semibold leading-snug">
                    {{ resource.title }}
                  </h3>

                  <p
                    v-if="resource.description"
                    class="text-sm text-muted line-clamp-2"
                  >
                    {{ resource.description }}
                  </p>

                </div>

                <!-- Topics -->
                <div
                  v-if="resource.topics?.length"
                  class="flex flex-wrap gap-1"
                >
                  <UBadge
                    v-for="topic in resource.topics.slice(0, 3)"
                    :key="topic"
                    color="neutral"
                    variant="outline"
                    size="xs"
                  >
                    {{ topic }}
                  </UBadge>
                </div>

                <!-- File information -->
                <div class="flex flex-wrap gap-2 text-xs text-muted">
                  <span>{{ formatFileSize(resource.file_size) }}</span>

                  <template v-if="resource.page_count">
                    <span>·</span>
                    <span>{{ resource.page_count }} pages</span>
                  </template>
                </div>

                <UButton
                  v-if="resource.slug"
                  block
                  color="primary"
                  variant="soft"
                  :to="`/resources/${resource.slug}`"
                  icon="i-lucide-eye"
                >
                  View resource
                </UButton>

              </div>

            </UCard>

          </div>

        </div>

        <!-- Empty search results -->
        <UCard v-else class="text-center py-12">

          <UIcon
            name="i-lucide-search-x"
            class="size-10 text-muted mx-auto mb-3"
          />

          <h3 class="font-semibold">
            No resources found
          </h3>

          <p class="text-sm text-muted mt-1">
            Try a different search term or category.
          </p>

          <UButton
            variant="link"
            color="primary"
            @click="searchQuery = ''; selectedCategory = 'all'"
          >
            Clear filters
          </UButton>

        </UCard>

      </section>

    </template>

  </UContainer>
</template>
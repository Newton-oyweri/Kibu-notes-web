<script setup lang="ts">
interface Programme {
  id: string
  title: string
  code: string
  duration_years: number
}

interface Unit {
  id: string
  title: string
  code: string
  description: string | null
}

interface UnitWithCount extends Unit {
  academic_year: number | null
  semester: number | null
  resource_count: number
}

const route = useRoute()
const { $supabase } = useNuxtApp()

const slug = computed(() => String(route.params.slug))
const searchQuery = ref('')

const {
  data: programmeData,
  error,
  status,
  refresh
} = await useAsyncData(
  () => `programme-units-${slug.value}`,
  async () => {
    // 1. Programme
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

    // 2. Programme-unit relationships
    const { data: links, error: linksError } = await $supabase
      .from('programme_units')
      .select('unit_id, academic_year, semester')
      .eq('programme_id', programme.id)

    if (linksError) throw linksError

    const relationships = links ?? []
    const unitIds = relationships.map(l => l.unit_id)

    if (!unitIds.length) {
      return { programme: programme as Programme, units: [] as UnitWithCount[] }
    }

    // 3. Units
    const { data: units, error: unitsError } = await $supabase
      .from('units')
      .select('id, title, code, description')
      .in('id', unitIds)
      .order('code')

    if (unitsError) throw unitsError

    // 4. Public resources (unit_id only, counted client-side)
    const { data: resources, error: resourcesError } = await $supabase
      .from('resources')
      .select('unit_id')
      .in('unit_id', unitIds)
      .eq('visibility', 'public')

    if (resourcesError) throw resourcesError

    const counts = new Map<string, number>()
    for (const r of resources ?? []) {
      counts.set(r.unit_id, (counts.get(r.unit_id) ?? 0) + 1)
    }

    const result: UnitWithCount[] = ((units ?? []) as Unit[]).map(unit => {
      const rel = relationships.find(l => l.unit_id === unit.id)
      return {
        ...unit,
        academic_year: rel?.academic_year ?? null,
        semester: rel?.semester ?? null,
        resource_count: counts.get(unit.id) ?? 0
      }
    })

    return { programme: programme as Programme, units: result }
  }
)

const programme = computed(() => programmeData.value?.programme)
const units = computed(() => programmeData.value?.units ?? [])

const totalResources = computed(() =>
  units.value.reduce((sum, u) => sum + u.resource_count, 0)
)

// Search by unit code or title
const filteredUnits = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return units.value
  return units.value.filter(u =>
    `${u.code} ${u.title}`.toLowerCase().includes(q)
  )
})

// Group by year + semester; units with no year/semester go last
const groups = computed(() => {
  const map = new Map<string, { label: string; order: number; units: UnitWithCount[] }>()

  for (const unit of filteredUnits.value) {
    const hasInfo = unit.academic_year !== null
    const key = hasInfo ? `${unit.academic_year}-${unit.semester ?? 0}` : 'other'
    const label = hasInfo
      ? `Year ${unit.academic_year}${unit.semester ? ` · Semester ${unit.semester}` : ''}`
      : 'Other units'
    const order = hasInfo
      ? (unit.academic_year ?? 0) * 10 + (unit.semester ?? 0)
      : Number.MAX_SAFE_INTEGER

    const existing = map.get(key)
    if (existing) existing.units.push(unit)
    else map.set(key, { label, order, units: [unit] })
  }

  return [...map.values()].sort((a, b) => a.order - b.order)
})

// SEO
useSeoMeta({
  title: () => programme.value
    ? `${programme.value.title} | Kibu Notes`
    : 'Programme | Kibu Notes',
  description: () => programme.value
    ? `Browse units, notes and past papers for ${programme.value.title} (${programme.value.code}) at Kibabii University.`
    : 'Explore academic resources at Kibabii University.',
  ogTitle: () => programme.value
    ? `${programme.value.title} | Kibu Notes`
    : 'Kibu Notes',
  ogDescription: () => programme.value
    ? `Units and study materials for ${programme.value.title}.`
    : 'Kibabii University student resources.'
})
</script>

<template>
  <UContainer class="py-8 md:py-12 space-y-8">

    <!-- Header -->
    <section v-if="programme" class="space-y-3">
      <UBadge color="primary" variant="subtle">
        {{ programme.code }}
      </UBadge>

      <h1 class="text-3xl md:text-4xl font-bold tracking-tight">
        {{ programme.title }}
      </h1>

      <p class="text-muted max-w-2xl">
        Browse learning materials by academic unit.
      </p>

      <div class="flex flex-wrap gap-3 text-sm text-muted">
        <span>{{ programme.duration_years }} years</span>
        <span>·</span>
        <span>{{ units.length }} units</span>
        <span>·</span>
        <span>{{ totalResources }} resources</span>
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
      <p class="text-sm text-muted">Loading units...</p>
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
        <UButton color="error" variant="outline" size="sm" @click="refresh()">
          Try again
        </UButton>
      </template>
    </UAlert>

    <template v-else-if="programme">

      <!-- Search within programme -->
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Search unit code or unit name..."
        size="lg"
      />

      <!-- Units grouped by year / semester -->
      <section v-if="groups.length" class="space-y-8">
        <div
          v-for="group in groups"
          :key="group.label"
          class="space-y-3"
        >
          <h2 class="text-lg font-semibold">{{ group.label }}</h2>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UCard
              v-for="unit in group.units"
              :key="unit.id"
              class="hover:border-primary/50 transition-colors"
              :ui="{ body: 'p-4 sm:p-4' }"
            >
              <div class="flex flex-col gap-3 h-full">
                <div class="space-y-1 flex-1">
                  <p class="text-sm font-medium text-primary">
                    {{ unit.code }}
                  </p>
                  <h3 class="font-semibold leading-snug">
                    {{ unit.title }}
                  </h3>
                </div>

                <p class="text-sm text-muted">
                  {{ unit.resource_count }}
                  {{ unit.resource_count === 1 ? 'resource' : 'resources' }}
                </p>

                <UButton
                  block
                  color="primary"
                  variant="soft"
                  :to="`/units/${unit.code}`"
                  trailing-icon="i-lucide-arrow-right"
                >
                  View unit resources
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </section>

      <!-- Empty state -->
      <UCard v-else class="text-center py-12">
        <UIcon
          name="i-lucide-search-x"
          class="size-10 text-muted mx-auto mb-3"
        />
        <h3 class="font-semibold">No units found</h3>
        <p class="text-sm text-muted mt-1">
          Try a different unit code or name.
        </p>
        <UButton variant="link" color="primary" @click="searchQuery = ''">
          Clear search
        </UButton>
      </UCard>

    </template>

  </UContainer>
</template>
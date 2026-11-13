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

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg'
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

// Load the document through the proxy, then hand it to the viewer
const file = ref<File | null>(null)
const downloadUrl = ref('')
const loadError = ref('')

onMounted(async () => {
  if (!resource.value) return

  try {
    const { file_path, file_name, mime_type } = resource.value
    const ext = file_name.split('.').pop()?.toLowerCase() || ''

    const res = await fetch(`/api/file?url=${encodeURIComponent(file_path)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const blob = await res.blob()
    file.value = new File([blob], file_name, {
      type: MIME[ext] || mime_type || blob.type
    })
    downloadUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    loadError.value = String(e)
  }
})

onBeforeUnmount(() => {
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
})

// SEO
const origin = useRequestURL().origin
const canonicalUrl = computed(() => `${origin}/resources/${slug.value}`)

const description = computed(() => {
  const r = resource.value
  if (r?.description) return r.description
  const unitPart = unit.value ? ` for ${unit.value.code} ${unit.value.title}` : ''
  return `${r?.title || 'Study resource'}${unitPart} - notes and past papers for Kibabii University students.`
})

const topics = computed(() => resource.value?.topics ?? [])

const seoTitle = computed(() => {
  if (!resource.value) return 'Resource | Kibu Notes'
  const code = unit.value ? ` (${unit.value.code})` : ''
  return `${resource.value.title}${code} | Kibu Notes`
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => description.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => description.value,
  ogUrl: () => canonicalUrl.value,
  ogType: 'article',
  ogSiteName: 'Kibu Notes',
  twitterCard: 'summary',
  articleModifiedTime: () => resource.value?.updated_at ?? undefined
})

const jsonLd = computed(() => {
  const r = resource.value
  if (!r) return ''
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LearningResource',
        name: r.title,
        description: description.value,
        url: canonicalUrl.value,
        inLanguage: 'en',
        learningResourceType: r.category === 'past_papers' ? 'Past paper' : 'Study notes',
        keywords: topics.value.join(', ') || undefined,
        datePublished: r.created_at,
        dateModified: r.updated_at ?? r.created_at,
        provider: { '@type': 'Organization', name: 'Kibu Notes' },
        ...(unit.value && {
          isPartOf: {
            '@type': 'Course',
            name: unit.value.title,
            courseCode: unit.value.code
          }
        })
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
          ...(unit.value
            ? [{ '@type': 'ListItem', position: 2, name: `${unit.value.code} ${unit.value.title}`, item: `${origin}/units/${unit.value.code}` }]
            : []),
          { '@type': 'ListItem', position: unit.value ? 3 : 2, name: r.title, item: canonicalUrl.value }
        ]
      }
    ]
  }).replace(/</g, '\\u003c')
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{ type: 'application/ld+json', innerHTML: jsonLd }]
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
  <div v-if="resource" class="mx-auto max-w-5xl px-4 py-8 space-y-6">

    <!-- Resource heading + doc info -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="primary" variant="subtle">
            {{ categoryLabel }}
          </UBadge>

          <UBadge color="neutral" variant="outline">
            {{ resource.mime_type.split('/').pop()?.toUpperCase() }}
          </UBadge>
        </div>

        <UButton
          v-if="downloadUrl"
          :href="downloadUrl"
          :download="resource.file_name"
          icon="i-lucide-download"
          label="Download"
        />
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

    <!-- Topics covered -->
    <section v-if="topics.length" class="space-y-3">
      <h2 class="text-lg font-semibold">
        Topics covered
      </h2>

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

    <USeparator />

    <!-- Document viewer -->
    <section>
      <UAlert
        v-if="loadError"
        color="error"
        title="Failed to load file"
        :description="loadError"
      />

      <p v-else-if="!file" class="text-muted">
        Loading document...
      </p>

      <NotesViewer v-else :file="file" />
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

  </div>
</template>
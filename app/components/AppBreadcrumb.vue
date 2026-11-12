
<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)

  if (!segments.length) return []

  const items = [
    {
      label: 'Home',
      to: '/'
    }
  ]

  let currentPath = ''

  for (const segment of segments) {
    currentPath += `/${segment}`

    const label = decodeURIComponent(segment)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())

    items.push({
      label,
      to: currentPath
    })
  }

  // Schools are listed on the homepage, not on a /schools page.
  if (segments[0] === 'schools') {
    items.splice(1, 1)
  }

  return items.map((item, index) => ({
    ...item,
    to: index === items.length - 1 ? undefined : item.to
  }))
})
</script>

<template>
  <UBreadcrumb
    v-if="breadcrumbs.length"
    :items="breadcrumbs"
    separator="i-lucide-chevron-right"
    class="px-4 py-3"
  />
</template>

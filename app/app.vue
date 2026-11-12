```vue
<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Kibu Notes'
const description = 'Kibabii University student resources. Access notes, past papers and academic materials.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const downloadUrl = '/downloads/kibu-notes.apk'
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
        >
          <AppLogo class="w-auto h-9 shrink-0" />
        </NuxtLink>

        <TemplateMenu />
      </template>

      <template #right>
        <UColorModeButton />

        <a
          :href="downloadUrl"
          download
          class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-primary hover:bg-primary/10 transition-colors"
        >
          <UIcon name="i-lucide-download" class="size-5" />
          <span class="text-xs font-semibold">Get App</span>
        </a>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Kibu Notes • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <a
          :href="downloadUrl"
          download
          class="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <UIcon name="i-lucide-download" class="size-4" />
          Get App
        </a>
      </template>
    </UFooter>
  </UApp>
</template>
```
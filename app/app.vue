```vue
<script setup>
const colorMode = useColorMode()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      name: 'theme-color',
      content: computed(() =>
        colorMode.value === 'dark' ? '#020617' : '#ffffff'
      )
    }
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
  <UHeader :toggle="false">
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
    <AppBreadcrumb />
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
```
<script setup lang="ts">
const DEFAULT_SOURCE = 'https://pub-937848871caa438bb7b53c74c18ed261.r2.dev/uploads/a2222100-2222-2222-2222-000000000210_58d6536f-3c20-4901-9875-8157b28c465d_chap16java4th.ppt'

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

const file = ref<File | null>(null)
const downloadUrl = ref('')
const filename = ref('')
const error = ref('')

onMounted(async () => {
  try {
    const source = new URLSearchParams(location.search).get('url') || DEFAULT_SOURCE
    const name = decodeURIComponent(new URL(source).pathname.split('/').pop() || 'file')
    const ext = name.split('.').pop()?.toLowerCase() || ''
    filename.value = name

    const res = await fetch(`/api/file?url=${encodeURIComponent(source)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    file.value = new File([blob], name, { type: MIME[ext] || blob.type })
    downloadUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = String(e)
  }
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h1 class="text-xl font-semibold">
        Kibu Notes
      </h1>
      <UButton
        v-if="downloadUrl"
        :href="downloadUrl"
        :download="filename"
        icon="i-lucide-download"
        label="Download"
      />
    </div>

    <UAlert
      v-if="error"
      color="error"
      title="Failed to load file"
      :description="error"
    />
    <p v-else-if="!file" class="text-muted">
      Loading...
    </p>
    <NotesViewer v-else :file="file" />
  </UContainer>
</template>

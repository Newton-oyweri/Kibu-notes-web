cat > app/pages/index.vue << 'EOF'
<script setup lang="ts">
const SOURCE = 'https://pub-937848871caa438bb7b53c74c18ed261.r2.dev/uploads/5b43fa04-2009-483a-b727-d2a35a9c837b_01ce6677-9b99-452c-87e0-585aa1a729a9_Natural%20language%20processing%20evaluation%20metrics.pdf'
const FILENAME = 'Natural language processing evaluation metrics.pdf'

const file = ref<File | null>(null)
const downloadUrl = ref('')
const error = ref('')

onMounted(async () => {
  try {
    const res = await fetch(`/api/file?url=${encodeURIComponent(SOURCE)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    file.value = new File([blob], FILENAME, { type: 'application/pdf' })
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
        :download="FILENAME"
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
EOF

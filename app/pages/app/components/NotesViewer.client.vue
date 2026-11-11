<script setup lang="ts">
import { FileViewer } from '@file-viewer/vue3'
import officePreset from '@file-viewer/preset-office'
import litePreset from '@file-viewer/preset-lite'

defineProps<{ file: File }>()

const options = {
  preset: [officePreset, litePreset],
  theme: 'light'
}
</script>

<template>
  <div class="viewer-box">
    <FileViewer :file="file" :options="options" />
  </div>
</template>

<style scoped>
.viewer-box {
  height: 80vh;
  min-height: 0;
}
</style>

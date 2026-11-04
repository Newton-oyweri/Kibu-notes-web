<script setup>
import { ref } from 'vue';
const title = ref('KIBU SEO Masterclass | Learn Modern Optimization');
const description = ref('Master technical and on-page SEO with modular documentation, smart search navigation, and practical notes.');
</script>

<template>
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
    <h3 class="text-lg font-bold text-slate-900">Live SERP Preview Simulator</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Meta Title ({{ title.length }}/60)</label>
          <input v-model="title" type="text" class="w-full px-3 py-2 border rounded-md text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Meta Description ({{ description.length }}/160)</label>
          <textarea v-model="description" rows="3" class="w-full px-3 py-2 border rounded-md text-sm"></textarea>
        </div>
      </div>

      <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
        <span class="text-xs text-slate-400 mb-2">Google Search Result Preview</span>
        <div class="space-y-1">
          <p class="text-blue-800 text-lg hover:underline cursor-pointer truncate">{{ title }}</p>
          <p class="text-emerald-700 text-xs">https://kibu.notes/seo-masterclass</p>
          <p class="text-slate-600 text-xs line-clamp-2">{{ description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>


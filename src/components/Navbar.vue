<script setup>
import { ref } from 'vue';

const emit = defineEmits(['search']);
const searchQuery = ref('');

const handleSearch = () => {
  emit('search', searchQuery.value.toLowerCase().trim());
};
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-4 flex items-center justify-between shadow-xs">
    <div class="flex items-center gap-4 w-96">
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search notes or subtopics (e.g., thumb)..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
    
    <div class="flex items-center gap-3">
      <span class="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-200">
        SEO Optimized v1.0
      </span>
    </div>
  </header>
</template>


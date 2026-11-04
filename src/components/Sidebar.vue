<script setup>
defineProps({
  activeTopic: String
});
defineEmits(['select']);

const menuItems = [
  {
    category: 'Getting Started',
    items: [
      { id: 'intro', label: 'Introduction to SEO' },
      { id: 'how-search-works', label: 'How Search Engines Work' }
    ]
  },
  {
    category: 'On-Page SEO',
    items: [
      { id: 'what-is-a-thumb', label: 'What is a Thumb?' },
      { id: 'title-tags', label: 'Optimizing Title Tags' },
      { id: 'meta-descriptions', label: 'Writing Meta Descriptions' }
    ]
  },
  {
    category: 'Technical SEO',
    items: [
      { id: 'site-speed', label: 'Core Web Vitals & Speed' },
      { id: 'canonical-tags', label: 'Canonical URLs' }
    ]
  }
];
</script>

<template>
  <aside class="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-slate-800">
    <div class="flex items-center gap-2 mb-8">
      <span class="bg-indigo-600 text-white font-bold p-2 rounded-lg text-sm">KIBU</span>
      <h1 class="text-white font-bold text-lg tracking-wide">SEO Masterclass</h1>
    </div>

    <nav class="space-y-6 flex-1">
      <div v-for="section in menuItems" :key="section.category">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {{ section.category }}
        </h3>
        <ul class="space-y-1">
          <li v-for="sub in section.items" :key="sub.id">
            <button
              @click="$emit('select', sub.id)"
              :class="[
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150',
                activeTopic === sub.id 
                  ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              ]"
            >
              {{ sub.label }}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>


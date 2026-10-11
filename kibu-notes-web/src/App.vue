<script setup>
import { ref, nextTick } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import DocContent from './components/DocContent.vue';
import MetaSimulator from './components/MetaSimulator.vue';

const activeTopic = ref('intro');

const handleSelectTopic = (topicId) => {
  activeTopic.value = topicId;
  nextTick(() => {
    const el = document.getElementById(topicId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};

const handleSearchQuery = (query) => {
  if (query.includes('thumb')) {
    handleSelectTopic('what-is-a-thumb');
  } else if (query.includes('title')) {
    handleSelectTopic('title-tags');
  } else if (query.includes('intro')) {
    handleSelectTopic('intro');
  }
};
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 font-sans">
    <Sidebar :activeTopic="activeTopic" @select="handleSelectTopic" />
    <div class="flex-1 flex flex-col min-w-0">
      <Navbar @search="handleSearchQuery" />
      <div class="p-8 space-y-8">
        <DocContent :activeTopic="activeTopic" />
        <MetaSimulator />
      </div>
    </div>
  </div>
</template>


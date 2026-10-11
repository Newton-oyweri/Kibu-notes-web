<script setup>
defineProps({
  activeTopic: String
});
</script>

<template>
  <main class="flex-1 p-10 max-w-4xl mx-auto space-y-12">
    <!-- Introduction -->
    <section id="intro" class="space-y-4">
      <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Introduction to SEO</h2>
      <p class="text-slate-600 leading-relaxed text-base">
        Search Engine Optimization (SEO) is the practice of increasing both the quality and quantity of website traffic, as well as exposure to your brand, through organic search engine results.
      </p>
    </section>

    <!-- What is a Thumb -->
    <section 
      id="what-is-a-thumb" 
      :class="['space-y-4 p-6 rounded-xl transition-all duration-300', activeTopic === 'what-is-a-thumb' ? 'bg-indigo-50/60 border-2 border-indigo-500 shadow-md' : 'border border-transparent']"
    >
      <div class="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded">On-Page Concept</div>
      <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">What is a Thumb?</h2>
      <p class="text-slate-600 leading-relaxed text-base">
        In modern mobile SEO and UX design, a **thumb zone** refers to the natural arc where a user’s thumb can comfortably reach across a smartphone screen. Optimizing for the thumb zone ensures that key Call-to-Actions (CTAs), navigation bars, and important links are easily tappable with one hand, directly influencing mobile bounce rates and dwell time.
      </p>
      <ul class="list-disc pl-5 space-y-2 text-slate-600">
        <li><strong>Natural Zone:</strong> The center area where users interact 75% of the time.</li>
        <li><strong>Hard-to-Reach Zone:</strong> The top corners of modern tall screens.</li>
      </ul>
    </section>

    <!-- Title Tags -->
    <section id="title-tags" class="space-y-4">
      <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Optimizing Title Tags</h2>
      <p class="text-slate-600 leading-relaxed text-base">
        Title tags are HTML elements that specify the title of a web page. They are displayed on search engine result pages (SERPs) as the clickable headline for a given result. Keep them between 50-60 characters.
      </p>
    </section>
  </main>
</template>


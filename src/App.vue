<template>
  <div class="min-h-screen flex flex-col pb-20 md:pb-10 transition-colors duration-200 bg-slate-100 text-slate-800 dark:bg-[#0c0f0d] dark:text-gray-100" :class="{ dark: isDark }">
    <!-- TOP NAVBAR -->
    <header class="sticky top-0 z-30 bg-white/90 dark:bg-[#121614]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#1f2923] px-4 py-3 transition-colors">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo / Header Left -->
        <div class="flex items-center gap-3">
          <button
            v-show="currentView === 'detail'"
            @click="showUnitsList"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1f2923] text-gray-700 dark:text-gray-200 transition"
          >
            <i class="fa-solid fa-arrow-left text-lg"></i>
          </button>

          <div class="flex items-center gap-2.5 cursor-pointer" @click="showUnitsList">
            <div class="w-10 h-10 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <i class="fa-solid fa-graduation-cap text-lg"></i>
            </div>
            <div>
              <h1 class="font-bold text-lg leading-tight tracking-tight text-gray-900 dark:text-white">Kibu Notes</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Shared student notes</p>
            </div>
          </div>
        </div>

        <!-- Search Bar (Desktop/Tablet) -->
        <div class="hidden sm:flex flex-1 max-w-md mx-4 relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            :value="searchQuery"
            @input="handleSearch($event.target.value)"
            placeholder="Search units, topics or files..."
            class="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#1c2420] border border-transparent dark:border-[#27352d] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <!-- Header Action Icons -->
        <div class="flex items-center gap-1 sm:gap-2">
          <button
            @click="toggleMobileSearch"
            class="sm:hidden p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2420] text-gray-600 dark:text-gray-300"
          >
            <i class="fa-solid fa-magnifying-glass text-lg"></i>
          </button>
          <button
            @click="toggleDarkMode"
            class="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2420] text-gray-600 dark:text-gray-300 transition"
            title="Toggle Theme"
          >
            <i :class="isDark ? 'fa-regular fa-sun text-lg' : 'fa-regular fa-moon text-lg'"></i>
          </button>
          <button
            @click="openUploadModal"
            class="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-full transition shadow-sm"
          >
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <span>Upload</span>
          </button>
          <button class="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2420] text-gray-600 dark:text-gray-300">
            <i class="fa-solid fa-ellipsis-vertical text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Search Dropdown -->
      <div v-show="mobileSearchOpen" class="sm:hidden pt-3 px-1">
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            :value="searchQuery"
            @input="handleSearch($event.target.value)"
            placeholder="Search units, topics or files..."
            class="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#1c2420] border border-transparent dark:border-[#27352d] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </header>

    <!-- MAIN WRAPPER CONTAINER -->
    <main class="max-w-4xl w-full mx-auto px-3 sm:px-4 pt-4 flex-1">
      <!-- VIEW 1: UNITS LIST VIEW -->
      <section v-show="currentView === 'units'" class="space-y-4">
        <!-- Course Banner Card -->
        <div
          @click="toggleCourseDropdown"
          class="bg-white dark:bg-[#141a17] border border-gray-200 dark:border-[#1e2923] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition shadow-sm group"
        >
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">My course / program</span>
            <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              Bachelor of Science in Computer Science
            </h2>
            <p class="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Year 2, Semester 1</p>
          </div>
          <div class="p-2 rounded-full text-gray-400 group-hover:text-gray-200">
            <i class="fa-solid fa-chevron-right text-sm"></i>
          </div>
        </div>

        <!-- Top Level Tabs -->
        <div class="border-b border-gray-200 dark:border-[#1e2923] flex gap-6 text-sm font-semibold px-2">
          <button
            v-for="tab in mainTabs"
            :key="tab.id"
            @click="switchMainTab(tab.id)"
            :class="[
              'pb-3 border-b-2 transition',
              activeMainTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Semester Heading -->
        <div class="pt-2">
          <h3 class="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">Year 2, Semester 1</h3>
        </div>

        <!-- Course Units Cards List Container -->
        <div class="space-y-3 pb-8">
          <template v-if="filteredUnits.length > 0">
            <div
              v-for="unit in filteredUnits"
              :key="unit.id"
              @click="openUnitDetail(unit.id)"
              class="bg-white dark:bg-[#131815] border border-gray-200 dark:border-[#1d2721] rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-emerald-500/50 dark:hover:border-emerald-500/40 cursor-pointer transition shadow-sm group"
            >
              <div class="pr-3">
                <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-emerald-500 transition-colors">
                  {{ unit.code }} - {{ unit.title }}
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {{ unit.hasMaterials ? `${unit.materialsCount} study material${unit.materialsCount > 1 ? 's' : ''} available` : 'No study materials available yet' }}
                </p>
              </div>
              <div class="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                <i class="fa-solid fa-chevron-right text-xs sm:text-sm"></i>
              </div>
            </div>
          </template>
          <div v-else class="text-center py-10 text-gray-500">
            <i class="fa-solid fa-folder-open text-3xl mb-2"></i>
            <p class="text-sm">No course units found matching "{{ searchQuery }}"</p>
          </div>
        </div>
      </section>

      <!-- VIEW 2: UNIT DETAIL VIEW -->
      <section v-show="currentView === 'detail'" class="space-y-4">
        <!-- Detail Header Bar -->
        <div class="flex items-center gap-3">
          <button
            @click="showUnitsList"
            class="p-2 rounded-full bg-gray-200 dark:bg-[#1b231f] hover:bg-gray-300 dark:hover:bg-[#25312b] text-gray-700 dark:text-gray-200 transition"
          >
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
            {{ detailUnitTitle }}
          </h2>
        </div>

        <!-- Sub-tabs: Topics | Past papers | Shared -->
        <div class="border-b border-gray-200 dark:border-[#1e2923] flex gap-8 text-sm font-semibold px-2">
          <button
            v-for="tab in detailTabs"
            :key="tab.id"
            @click="switchDetailTab(tab.id)"
            :class="[
              'pb-3 border-b-2 transition',
              activeDetailTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Main Files Container Box -->
        <div class="bg-white dark:bg-[#131815] border border-gray-200 dark:border-[#1c2620] rounded-2xl p-2 sm:p-4 shadow-sm">
          <div class="divide-y divide-gray-100 dark:divide-[#1c2620]">
            <template v-if="filteredFiles.length > 0">
              <div
                v-for="file in filteredFiles"
                :key="file.id"
                class="py-3.5 px-2 sm:px-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-[#18201b] rounded-xl transition"
              >
                <!-- Left: File Badge & Info -->
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    :class="[
                      'px-2.5 py-2 rounded-xl text-xs font-black tracking-wider shadow-sm flex items-center justify-center shrink-0 w-12 h-10',
                      file.type === 'PDF'
                        ? 'bg-red-600 dark:bg-[#c02626] text-white'
                        : 'bg-blue-600 dark:bg-[#0284c7] text-white'
                    ]"
                  >
                    {{ file.type }}
                  </div>
                  <div class="min-w-0">
                    <h5 class="font-bold text-sm text-gray-900 dark:text-gray-100 truncate tracking-tight">
                      {{ file.title }}
                    </h5>
                    <p class="text-xs text-gray-400 font-medium mt-0.5">{{ file.size }}</p>
                  </div>
                </div>

                <!-- Right: Pill Download Button -->
                <button
                  @click.stop="downloadFile(file.title)"
                  class="bg-[#bbf7d0] hover:bg-[#99f6e4] text-[#14532d] dark:bg-[#86efac] dark:hover:bg-[#4ade80] dark:text-[#052e16] font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-95"
                >
                  <i class="fa-solid fa-chevron-down text-[10px]"></i>
                  <span>Download</span>
                </button>
              </div>
            </template>
            <div v-else class="text-center py-12 text-gray-400">
              <i class="fa-solid fa-file-circle-exclamation text-3xl mb-2"></i>
              <p class="text-sm">No notes available in this category yet.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- FLOATING ACTION BUTTON (FAB) -->
    <div class="fixed bottom-6 right-6 z-20">
      <button
        @click="openUploadModal"
        class="flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] dark:bg-[#05401d] dark:hover:bg-[#075226] text-white dark:text-emerald-300 font-semibold px-5 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition transform active:scale-95 border border-emerald-500/30"
      >
        <i :class="currentView === 'detail' ? 'fa-solid fa-chevron-up text-xs' : 'fa-solid fa-folder-open text-base'"></i>
        <span class="text-sm">{{ currentView === 'detail' ? 'Share more notes' : 'Open a file' }}</span>
      </button>
    </div>

    <!-- MODAL: UPLOAD / SHARE NOTES -->
    <div
      v-if="uploadModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeUploadModal"
    >
      <div class="bg-white dark:bg-[#161c18] border border-gray-200 dark:border-[#222e27] rounded-3xl max-w-md w-full p-6 shadow-2xl relative transform transition-all">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#222e27]">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i class="fa-solid fa-cloud-arrow-up text-emerald-500"></i>
            <span>Share / Upload Notes</span>
          </h3>
          <button @click="closeUploadModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleUploadSubmit" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Target Course Unit</label>
            <select
              v-model="uploadForm.unit"
              class="w-full bg-gray-50 dark:bg-[#1d2520] border border-gray-300 dark:border-[#2b3830] rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-white"
            >
              <option value="CSC 210">CSC 210 - Object-Oriented Programming II</option>
              <option value="CSC 2250">CSC 2250 - DATA STRUCTURES</option>
              <option value="CSC 212">CSC 212 - Computer organization and architecture</option>
              <option value="CSC 216">CSC 216 - Analog and digital communication systems</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Document Title</label>
            <input
              v-model="uploadForm.title"
              type="text"
              required
              placeholder="e.g. Chapter 4 - Polymorphism & Interfaces"
              class="w-full bg-gray-50 dark:bg-[#1d2520] border border-gray-300 dark:border-[#2b3830] rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">File Type</label>
              <select
                v-model="uploadForm.type"
                class="w-full bg-gray-50 dark:bg-[#1d2520] border border-gray-300 dark:border-[#2b3830] rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-white"
              >
                <option value="PDF">PDF Document</option>
                <option value="DOC">Word Document (DOC)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Category</label>
              <select
                v-model="uploadForm.category"
                class="w-full bg-gray-50 dark:bg-[#1d2520] border border-gray-300 dark:border-[#2b3830] rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-white"
              >
                <option value="topics">Topics</option>
                <option value="past-papers">Past papers</option>
                <option value="shared">Shared</option>
              </select>
            </div>
          </div>

          <!-- Drag & Drop File Box -->
          <div class="border-2 border-dashed border-gray-300 dark:border-[#2b3a31] rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-[#18201b]/50 hover:border-emerald-500/50 transition cursor-pointer">
            <i class="fa-solid fa-file-arrow-up text-3xl text-emerald-500 mb-2"></i>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">Click to select file or drag & drop</p>
            <p class="text-[10px] text-gray-400 mt-1">PDF, DOC, DOCX up to 25MB</p>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="closeUploadModal"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222e27]"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              Upload Notes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- TOAST NOTIFICATION CONTAINER -->
    <div class="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-2.5 bg-gray-900/90 text-white dark:bg-emerald-950/90 dark:text-emerald-100 border border-gray-700 dark:border-emerald-700/50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold backdrop-blur-md transition transform"
        :class="toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
      >
        <i :class="['fa-solid text-sm', toast.type === 'success' ? 'fa-circle-check text-emerald-400' : 'fa-circle-info text-blue-400']"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// State
const isDark = ref(false);
const mobileSearchOpen = ref(false);
const currentView = ref('units');
const currentUnitId = ref('csc210');
const activeMainTab = ref('units');
const activeDetailTab = ref('topics');
const searchQuery = ref('');
const uploadModalOpen = ref(false);

// Upload form state
const uploadForm = ref({
  unit: 'CSC 210',
  title: '',
  type: 'PDF',
  category: 'topics',
});

// Toast state
const toasts = ref([]);
let toastId = 0;

// Tabs configuration
const mainTabs = [
  { id: 'units', label: 'My Units' },
  { id: 'recent', label: 'Recent Files' },
  { id: 'folders', label: 'Folders' },
];

const detailTabs = [
  { id: 'topics', label: 'Topics' },
  { id: 'past-papers', label: 'Past papers' },
  { id: 'shared', label: 'Shared' },
];

// Units data
const unitsData = ref([
  {
    id: 'csc2250',
    code: 'CSC2250',
    title: 'DATA STRUCTURES',
    materialsCount: 1,
    hasMaterials: true,
  },
  {
    id: 'csc210',
    code: 'CSC 210',
    title: 'Object-Oriented Programming II',
    materialsCount: 44,
    hasMaterials: true,
  },
  {
    id: 'csc2110',
    code: 'CSC2110',
    title: 'Digital Logic Circuits',
    materialsCount: 0,
    hasMaterials: false,
  },
  {
    id: 'csc2150',
    code: 'CSC2150',
    title: 'System Analysis and Design',
    materialsCount: 0,
    hasMaterials: false,
  },
  {
    id: 'csc212',
    code: 'CSC 212',
    title: 'Computer organization and architecture',
    materialsCount: 20,
    hasMaterials: true,
  },
  {
    id: 'csc2220',
    code: 'CSC2220',
    title: 'Assembly Language Programming',
    materialsCount: 0,
    hasMaterials: false,
  },
  {
    id: 'csc216',
    code: 'CSC 216',
    title: 'Analog and digital communication systems',
    materialsCount: 21,
    hasMaterials: true,
  },
]);

// Files data
const filesData = ref({
  csc210: {
    topics: [
      { id: 1, title: 'BIT 210 LECTURE NOTES - Copy', size: '7.5 MB', type: 'PDF' },
      { id: 2, title: 'BIT 210 LECTURE NOTES', size: '7.8 MB', type: 'PDF' },
      { id: 3, title: 'JP_1_1', size: '384 kB', type: 'PDF' },
      { id: 4, title: 'JP_1_2_Practice', size: '14 MB', type: 'PDF' },
      { id: 5, title: 'JP_1_2', size: '628 kB', type: 'PDF' },
      { id: 6, title: 'JavaBank explanation', size: '17 kB', type: 'DOC' },
      { id: 7, title: 'BIT 210 LECTURE NOTES-1-', size: '7.8 MB', type: 'PDF' },
      { id: 8, title: 'BIT 211-CSC 210 CAT 1-1', size: '35 kB', type: 'DOC' },
    ],
    'past-papers': [
      { id: 9, title: 'CSC 210 Main Exam - 2023/2024', size: '1.2 MB', type: 'PDF' },
      { id: 10, title: 'CSC 210 CAT 2 Solution', size: '450 kB', type: 'PDF' },
    ],
    shared: [
      { id: 11, title: 'Student OOP Cheatsheet Summary', size: '120 kB', type: 'DOC' },
      { id: 12, title: 'Inheritance vs Composition Diagram', size: '2.1 MB', type: 'PDF' },
    ],
  },
});

// Computed properties
const filteredUnits = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return unitsData.value.filter(
    (u) => u.title.toLowerCase().includes(q) || u.code.toLowerCase().includes(q)
  );
});

const detailUnitTitle = computed(() => {
  const unit = unitsData.value.find((u) => u.id === currentUnitId.value);
  return unit ? `${unit.code} - ${unit.title}` : '';
});

const filteredFiles = computed(() => {
  const unitFiles = filesData.value[currentUnitId.value] || { topics: [], 'past-papers': [], shared: [] };
  const list = unitFiles[activeDetailTab.value] || [];
  const q = searchQuery.value.toLowerCase();
  return list.filter((f) => f.title.toLowerCase().includes(q));
});

// Methods
const toggleDarkMode = () => {
  isDark.value = !isDark.value;
};

const toggleMobileSearch = () => {
  mobileSearchOpen.value = !mobileSearchOpen.value;
};

const handleSearch = (val) => {
  searchQuery.value = val;
};

const openUnitDetail = (unitId) => {
  currentUnitId.value = unitId;
  currentView.value = 'detail';
  activeDetailTab.value = 'topics';
  searchQuery.value = '';
};

const showUnitsList = () => {
  currentView.value = 'units';
  searchQuery.value = '';
};

const switchMainTab = (tab) => {
  activeMainTab.value = tab;
  if (tab !== 'units') {
    showToast(`Switched to ${tab.charAt(0).toUpperCase() + tab.slice(1)} view`);
  }
};

const switchDetailTab = (tab) => {
  activeDetailTab.value = tab;
};

const downloadFile = (filename) => {
  showToast(`Downloading "${filename}"...`, 'success');
};

const toggleCourseDropdown = () => {
  showToast('Course Selector: Bachelor of Science in Computer Science');
};

const openUploadModal = () => {
  uploadModalOpen.value = true;
};

const closeUploadModal = () => {
  uploadModalOpen.value = false;
  uploadForm.value = {
    unit: 'CSC 210',
    title: '',
    type: 'PDF',
    category: 'topics',
  };
};

const handleUploadSubmit = () => {
  const { title, type, category } = uploadForm.value;

  if (!filesData.value[currentUnitId.value]) {
    filesData.value[currentUnitId.value] = { topics: [], 'past-papers': [], shared: [] };
  }
  if (!filesData.value[currentUnitId.value][category]) {
    filesData.value[currentUnitId.value][category] = [];
  }

  filesData.value[currentUnitId.value][category].unshift({
    id: Date.now(),
    title: title,
    size: (Math.random() * 5 + 0.5).toFixed(1) + ' MB',
    type: type,
  });

  closeUploadModal();
  showToast(`"${title}" uploaded successfully!`, 'success');

  if (currentView.value === 'detail') {
    activeDetailTab.value = category;
  }
};

const showToast = (message, type = 'info') => {
  const id = toastId++;
  toasts.value.push({ id, message, type, visible: false });

  setTimeout(() => {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast) toast.visible = true;
  }, 10);

  setTimeout(() => {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast) toast.visible = false;
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 300);
  }, 3000);
};

// Initialize dark mode from system preference
onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true;
  }
});
</script>

<style>
/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 9999px;
}
.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.4);
}
</style>
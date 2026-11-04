<template>
  <div :class="['min-h-screen font-sans transition-colors duration-200', isDarkMode ? 'bg-[#0d1110] text-[#e1e7e4]' : 'bg-gray-100 text-gray-900']">
    
    <!-- Top Navigation Bar -->
    <header :class="['sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between shadow-md', isDarkMode ? 'bg-[#121815] border-[#1e2723]' : 'bg-white border-gray-200']">
      <div class="flex items-center gap-3">
        <!-- Back Button (Shown when inside a unit) -->
        <button 
          v-if="currentView === 'unit-detail'" 
          @click="currentView = 'units'"
          class="p-1.5 rounded-full hover:bg-emerald-500/10 text-emerald-500 transition-colors"
          title="Back to units"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <!-- Brand Logo & Title -->
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black shadow-lg">
            🎓
          </div>
          <div>
            <h1 class="text-base font-bold leading-tight flex items-center gap-1.5">
              <span>Kibu Notes</span>
            </h1>
            <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-500']">
              {{ currentView === 'unit-detail' ? selectedUnit?.code + ' - ' + selectedUnit?.title : 'Shared student notes' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action Icons -->
      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <button 
          @click="toggleTheme" 
          class="p-2 rounded-full hover:bg-emerald-500/10 transition-colors"
          :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <span class="text-lg">{{ isDarkMode ? '☀️' : '🌙' }}</span>
        </button>

        <!-- Search Bar Toggle / Input -->
        <div class="relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search..." 
            :class="['pl-8 pr-3 py-1 rounded-full text-xs transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500', isDarkMode ? 'bg-[#1a231f] border border-[#27352f] text-white' : 'bg-gray-100 border border-gray-300']"
          />
          <svg class="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto p-4 pb-24">
      
      <!-- ================= MAIN UNITS LIST VIEW ================= -->
      <div v-if="currentView === 'units'" class="space-y-4">
        <!-- Program Banner Card -->
        <div :class="['p-4 rounded-xl border flex items-center justify-between shadow-sm', isDarkMode ? 'bg-[#141b18] border-[#222d28]' : 'bg-white border-gray-200']">
          <div>
            <p :class="['text-xs uppercase tracking-wider font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-500']">My course/program</p>
            <h2 class="text-sm font-bold mt-0.5 text-emerald-400">Bachelor of Science in Computer Science</h2>
            <p class="text-xs text-gray-400 mt-0.5">Year 2, Semester 1</p>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <!-- Main Category Navigation Tabs -->
        <div class="flex border-b border-gray-800 text-sm font-medium gap-6">
          <button 
            @click="activeMainTab = 'my-units'" 
            :class="['pb-2 transition-colors border-b-2', activeMainTab === 'my-units' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-200']"
          >
            My Units
          </button>
          <button 
            @click="activeMainTab = 'recent'" 
            :class="['pb-2 transition-colors border-b-2', activeMainTab === 'recent' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-200']"
          >
            Recent Files
          </button>
          <button 
            @click="activeMainTab = 'folders'" 
            :class="['pb-2 transition-colors border-b-2', activeMainTab === 'folders' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-200']"
          >
            Folders
          </button>
        </div>

        <!-- Section Title -->
        <h3 class="text-lg font-bold text-emerald-400 pt-1">Year 2, Semester 1</h3>

        <!-- Course Units List -->
        <div class="space-y-2.5">
          <div 
            v-for="unit in filteredUnits" 
            :key="unit.id"
            @click="openUnitDetail(unit)"
            :class="['p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-md', isDarkMode ? 'bg-[#141c18] border-[#1e2924]' : 'bg-white border-gray-200']"
          >
            <div class="space-y-1">
              <h4 class="font-bold text-sm leading-snug">{{ unit.code }} - {{ unit.title }}</h4>
              <p :class="['text-xs', unit.count > 0 ? 'text-gray-400' : 'text-gray-500 italic']">
                {{ unit.count > 0 ? `${unit.count} study material${unit.count > 1 ? 's' : ''} available` : 'No study materials available yet' }}
              </p>
            </div>
            <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- ================= UNIT DETAIL / FILES VIEW ================= -->
      <div v-if="currentView === 'unit-detail'" class="space-y-4">
        <!-- Sub-Tabs Navigation (Topics, Past papers, Shared) -->
        <div class="flex border-b border-gray-800 text-sm font-medium gap-8 justify-around sm:justify-start">
          <button 
            v-for="tab in ['Topics', 'Past papers', 'Shared']" 
            :key="tab"
            @click="activeSubTab = tab"
            :class="['pb-2.5 transition-colors border-b-2 relative', activeSubTab === tab ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-200']"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Documents List -->
        <div class="space-y-3">
          <div 
            v-for="doc in filteredDocs" 
            :key="doc.id"
            :class="['p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-sm', isDarkMode ? 'bg-[#131b17] border-[#1c2722]' : 'bg-white border-gray-200']"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- Document Format Badge -->
              <div 
                :class="['w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black uppercase text-white shadow-inner flex-shrink-0', doc.type === 'pdf' ? 'bg-red-600' : 'bg-blue-600']"
              >
                {{ doc.type }}
              </div>

              <!-- Document Metadata -->
              <div class="min-w-0">
                <h4 class="font-bold text-xs sm:text-sm text-gray-100 truncate leading-tight">{{ doc.name }}</h4>
                <p class="text-[11px] text-gray-400 mt-0.5">{{ doc.size }}</p>
              </div>
            </div>

            <!-- Action / Download Button -->
            <button 
              @click="downloadFile(doc)"
              class="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 flex-shrink-0"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating Action Button (FAB) -->
    <div class="fixed bottom-5 right-5 z-30">
      <button 
        @click="showUploadModal = true"
        class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 transition-transform active:scale-95 border border-emerald-400/30 text-xs sm:text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        <span>{{ currentView === 'unit-detail' ? 'Share more notes' : 'Open a file' }}</span>
      </button>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div :class="['w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4', isDarkMode ? 'bg-[#141c18] border-[#25352c] text-white' : 'bg-white text-gray-900']">
        <div class="flex justify-between items-center border-b pb-3 border-gray-700/50">
          <h3 class="font-bold text-base">Upload Study Notes</h3>
          <button @click="showUploadModal = false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block mb-1 text-gray-400">Document Title</label>
            <input 
              v-model="newDoc.name" 
              type="text" 
              placeholder="e.g. BIT 210 LECTURE NOTES"
              :class="['w-full p-2.5 rounded-lg border focus:ring-1 focus:ring-emerald-500 outline-none', isDarkMode ? 'bg-[#0d1110] border-gray-700' : 'bg-gray-50 border-gray-300']" 
            />
          </div>

          <div>
            <label class="block mb-1 text-gray-400">File Format</label>
            <select 
              v-model="newDoc.type"
              :class="['w-full p-2.5 rounded-lg border focus:ring-1 focus:ring-emerald-500 outline-none', isDarkMode ? 'bg-[#0d1110] border-gray-700' : 'bg-gray-50 border-gray-300']"
            >
              <option value="pdf">PDF Document</option>
              <option value="doc">Word Document (DOC/DOCX)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showUploadModal = false" class="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:bg-gray-800">
            Cancel
          </button>
          <button @click="handleUpload" class="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black">
            Upload Note
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div 
      v-if="toastMessage" 
      class="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-2 rounded-full font-semibold text-xs shadow-lg transition-all"
    >
      {{ toastMessage }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- State ---
const isDarkMode = ref(true)
const currentView = ref('units') // 'units' | 'unit-detail'
const activeMainTab = ref('my-units')
const activeSubTab = ref('Topics')
const searchQuery = ref('')
const selectedUnit = ref(null)
const showUploadModal = ref(false)
const toastMessage = ref('')

// New Document Form State
const newDoc = ref({
  name: '',
  type: 'pdf'
})

// --- Mock Data ---
const units = ref([
  { id: 1, code: 'CSC2250', title: 'DATA STRUCTURES', count: 1 },
  { id: 2, code: 'CSC 210', title: 'Object-Oriented Programming II', count: 44 },
  { id: 3, code: 'CSC2110', title: 'Digital Logic Circuits', count: 0 },
  { id: 4, code: 'CSC2150', title: 'System Analysis and Design', count: 0 },
  { id: 5, code: 'CSC 212', title: 'Computer organization and architecture', count: 20 },
  { id: 6, code: 'CSC2220', title: 'Assembly Language Programming', count: 0 },
  { id: 7, code: 'CSC 216', title: 'Analog and digital communication systems', count: 21 }
])

const documents = ref([
  { id: 101, name: 'BIT 210 LECTURE NOTES - Copy', size: '7.5 MB', type: 'pdf', category: 'Topics' },
  { id: 102, name: 'BIT 210 LECTURE NOTES', size: '7.8 MB', type: 'pdf', category: 'Topics' },
  { id: 103, name: 'JP_1_1', size: '384 kB', type: 'pdf', category: 'Topics' },
  { id: 104, name: 'JP_1_2_Practice', size: '14 MB', type: 'pdf', category: 'Topics' },
  { id: 105, name: 'JP_1_2', size: '628 kB', type: 'pdf', category: 'Topics' },
  { id: 106, name: 'JavaBank explanation', size: '17 kB', type: 'doc', category: 'Topics' },
  { id: 107, name: 'BIT 210 LECTURE NOTES-1-', size: '7.8 MB', type: 'pdf', category: 'Topics' },
  { id: 108, name: 'BIT 211-CSC 210 CAT 1-1', size: '35 kB', type: 'doc', category: 'Past papers' }
])

// --- Computed Properties ---
const filteredUnits = computed(() => {
  if (!searchQuery.value) return units.value
  const query = searchQuery.value.toLowerCase()
  return units.value.filter(u => 
    u.code.toLowerCase().includes(query) || 
    u.title.toLowerCase().includes(query)
  )
})

const filteredDocs = computed(() => {
  return documents.value.filter(doc => {
    const matchesTab = doc.category === activeSubTab.value
    const matchesSearch = !searchQuery.value || doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTab && matchesSearch
  })
})

// --- Methods ---
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

const openUnitDetail = (unit) => {
  selectedUnit.value = unit
  currentView.value = 'unit-detail'
}

const downloadFile = (doc) => {
  showToast(`Downloading "${doc.name}"...`)
}

const handleUpload = () => {
  if (!newDoc.value.name.trim()) return

  documents.value.unshift({
    id: Date.now(),
    name: newDoc.value.name,
    size: '1.2 MB',
    type: newDoc.value.type,
    category: activeSubTab.value
  })

  showToast('Notes successfully uploaded!')
  newDoc.value.name = ''
  showUploadModal.value = false
}

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}
</script>

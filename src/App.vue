<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import HeroSection from './components/HeroSection.vue'
import LetterWizard from './components/LetterWizard.vue'
import LetterPreview from './components/LetterPreview.vue'
import { useLetterStore } from './stores/letter'
import { Eye, X } from 'lucide-vue-next'
// @ts-ignore
import html2pdf from 'html2pdf.js'

const store = useLetterStore()
const started = ref(false)
const showPreview = ref(false)
const previewScale = ref(1)
const isGenerating = ref(false)


const handleStart = (role: 'landlord' | 'tenant', type?: 'letter' | 'contract') => {
  store.userRole = role
  if (type) store.documentType = type
  
  // Set default category based on role to avoid mismatch
  if (role === 'landlord') {
    store.category = '欠繳租金'
  } else {
    store.category = '押金返還'
  }
  
  started.value = true
}

const openPreview = () => {
  showPreview.value = true
  nextTick(() => {
    // 210mm is approx 794px. Mobile screen has padding.
    // Calculate scale to fit width with some margin (e.g. 32px padding)
    const availableWidth = window.innerWidth - 32
    const targetWidth = 800 // slightly larger than 794 to be safe
    const scale =  Math.min(availableWidth / targetWidth, 1)
    previewScale.value = scale
  })
}

const handleDownload = async () => {
  const element = document.getElementById('pdf-content-source')
  if (!element || isGenerating.value) return

  isGenerating.value = true
  const filename = `${store.documentType === 'contract' ? '租賃契約' : '存證信函'}.pdf`

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  // Detect Desktop (>= 1024px) logic
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  if (isDesktop) {
    // Desktop: Direct Download (Legacy behavior)
    try {
      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('Download failed:', err)
      alert('下載失敗，請稍後再試。')
    } finally {
      isGenerating.value = false
    }
    return
  }

  // Mobile: Blob + Share Sheet
  try {
    // Generate Blob
    const blob = await html2pdf().set(opt).from(element).output('blob')
    
    // Check if Web Share API is supported for files
    // @ts-ignore
    if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'application/pdf' })
        const shareData = {
           files: [file],
           title: filename,
           text: '這是您的法律文件。'
        }
        
        // @ts-ignore
        if (navigator.canShare(shareData)) {
           // @ts-ignore
           await navigator.share(shareData)
           isGenerating.value = false
           return
        }
    }

    // Fallback: Standard Download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

  } catch (err) {
    console.error('Download/Share failed:', err)
    alert('產生文件失敗，請稍後再試。')
  } finally {
    isGenerating.value = false
  }
}

// Mobile FAB Dragging Logic
const fabBottom = ref(24)
const isDragging = ref(false)
const hasMoved = ref(false)

onMounted(() => {
  // Initial position: Near top (approx 120px from top edge) to avoid bottom buttons
  if (typeof window !== 'undefined') {
    fabBottom.value = window.innerHeight - 120
  }
})

const handleTouchStart = () => {
  isDragging.value = true
  hasMoved.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  if (!e.touches || e.touches.length === 0) return
  const touch = e.touches[0]
  if (!touch) return
  // Calculate bottom distance: Window Height - Touch Y
  // Subtracting half the button height (28px) roughly keeps finger in center relative to bottom
  const bottom = window.innerHeight - touch.clientY - 28
  
  // Clamp between 24px and window height - 100px
  fabBottom.value = Math.max(24, Math.min(window.innerHeight - 100, bottom))
  hasMoved.value = true
}

const handleTouchEnd = () => {
  isDragging.value = false
}

const handleFabClick = () => {
  if (!hasMoved.value) openPreview()
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 font-sans text-slate-800">
    <!-- PDF Source (Off-screen but visible for generation) -->
    <div class="fixed left-[-9999px] top-0 overflow-visible no-print" aria-hidden="true">
       <div id="pdf-content-source" class="w-[210mm] min-h-[297mm] bg-white">
          <LetterPreview hide-shadow />
       </div>
    </div>

    <transition name="fade" mode="out-in">
      <HeroSection v-if="!started" @start="handleStart" class="no-print" />
      
      <div v-else class="flex flex-col lg:flex-row h-screen overflow-hidden animate-slide-in relative">
        <!-- Left: Wizard -->
        <div class="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 h-full overflow-hidden border-r border-gray-200 bg-white shadow-2xl z-20 flex flex-col no-print">
          <div class="flex-1 overflow-hidden p-6 relative">
             <LetterWizard @home="started = false" @download="handleDownload" :is-generating="isGenerating" />
          </div>
        </div>

        <!-- Mobile Preview FAB -->
        <button 
          @click="handleFabClick"
          @touchstart="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend="handleTouchEnd"
          :style="{ bottom: `${fabBottom}px` }"
          class="lg:hidden fixed right-6 w-14 h-14 bg-legal-navy text-white rounded-full shadow-xl z-30 flex items-center justify-center hover:bg-blue-900 transition-colors hover:scale-105 active:scale-95 touch-none no-print"
          aria-label="預覽信函"
        >
          <div v-if="hasMoved" class="absolute inset-0 bg-black/10 rounded-full"></div>
          <Eye class="w-6 h-6" />
        </button>
        
        <!-- Mobile Preview Overlay (Modal) -->
        <div 
          v-if="showPreview"
          class="lg:hidden fixed inset-0 z-50 bg-slate-100/95 backdrop-blur-sm flex flex-col animate-fade-in-up no-print"
        >
           <!-- Header / Close Bar -->
           <div class="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm shrink-0">
             <h3 class="font-bold text-slate-700">信函預覽</h3>
             <button 
               @click="showPreview = false"
               class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
             >
               <X class="w-6 h-6 text-slate-600" />
             </button>
           </div>
           
           <!-- Scrollable Content -->
           <div class="flex-1 overflow-auto p-4 flex justify-center items-start">
              <LetterPreview 
                class="origin-top transition-transform duration-300" 
                :style="{ transform: `scale(${previewScale})`, marginBottom: `-${(1 - previewScale) * 100}%` }"
              />
           </div>
        </div>
        
        <!-- Desktop Preview (Visible on Desktop) -->
        <div class="hidden lg:flex print-only flex-1 h-full bg-slate-100/50 relative overflow-y-auto overflow-x-auto justify-center items-start p-8">
           <LetterPreview />
        </div>
      </div>
    </transition>
  </main>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-in {
  animation: slideIn 0.6s ease-out forwards;
}
</style>

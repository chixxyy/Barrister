<script setup lang="ts">
import { useLetterStore } from '../stores/letter'

const store = useLetterStore()
</script>

<template>
  <div class="relative w-full flex justify-center py-8">
    <div class="paper-shadow bg-white relative w-[210mm] min-h-[297mm] overflow-hidden shrink-0">
      <!-- Taiwan Post Attest Letter Grid Background -->
      <!-- Green grids usually 20x20 squares? -->
      <div v-if="store.documentType === 'letter'" class="absolute inset-0 pointer-events-none" 
           style="background-image: 
              linear-gradient(0deg, transparent 23px, #eef7f2 24px),
              linear-gradient(90deg, transparent 23px, #eef7f2 24px);
              background-size: 24px 24px;">
      </div>
      
      <!-- Border lines mimicking the specific Taiwan green paper lines if desired, or just simple grid -->
      <!-- Using a more subtle grid for modern look but keeping the vibe -->
      <div v-if="store.documentType === 'letter'" class="absolute inset-[20px] border-2 border-green-800/20 pointer-events-none z-0"></div>

      <!-- Watermark text (background) -->
      <div v-if="store.documentType === 'letter'" class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
         <span class="text-9xl font-serif font-bold rotate-[-45deg] select-none">LEGAL EASE</span>
      </div>

      <!-- Content -->
      <div class="relative z-10 px-[2.5cm] py-[2.5cm] h-full flex flex-col font-serif text-slate-900 leading-relaxed whitespace-pre-wrap text-[12pt]">
        {{ store.generatedContent }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.paper-shadow {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>

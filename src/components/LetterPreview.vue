<script setup lang="ts">
import { useLetterStore } from '../stores/letter'

const store = useLetterStore()
defineProps<{ hideShadow?: boolean }>()
</script>

<template>
  <div 
    :class="[
      'bg-white relative w-[210mm] min-h-[297mm] overflow-hidden shrink-0 mx-auto',
      { 'paper-shadow': !hideShadow }
    ]"
  >
    <!-- Taiwan Post Attest Letter Grid Background -->
    <!-- Green grids usually 20x20 squares? -->
      <div v-if="store.documentType === 'letter'" class="absolute inset-0 pointer-events-none" 
           style="background-image: 
              linear-gradient(0deg, transparent 23px, #f8fcf9 24px),
              linear-gradient(90deg, transparent 23px, #f8fcf9 24px);
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
    <div class="relative z-10 px-[2.5cm] py-[2.5cm] min-h-[297mm] flex flex-col font-serif text-slate-900 leading-relaxed text-[12pt]">
      <div class="flex-1 whitespace-pre-wrap">{{ store.generatedContent }}</div>
      
      <div class="mt-12 pt-4 border-t border-slate-100/50 text-center text-[10px] text-slate-400 font-sans select-none">
        免責聲明 (Disclaimer)：本工具生成之文件僅供參考，不代表律師正式法律意見
      </div>

      <!-- Appendix: Inventory Check -->
      <div v-if="store.documentType === 'contract' && store.inventoryItems.length > 0" class="break-before-page mt-8">
         <div class="text-center mb-8 pt-8 border-t-2 border-slate-800">
           <h2 class="text-2xl font-bold mb-2">【附件】房屋現況確認書</h2>
           <p class="text-sm text-slate-500">此附件為租賃契約之一部分，記載交屋時之現況。</p>
         </div>
         
         <div class="grid grid-cols-2 gap-8">
           <div v-for="item in store.inventoryItems" :key="item.id" class="space-y-2 break-inside-avoid">
             <div class="aspect-[4/3] border border-slate-300 bg-slate-50 relative">
               <img :src="item.image" class="w-full h-full object-contain" />
             </div>
             <div class="text-center font-medium text-slate-700 bg-slate-100 py-1 rounded">
               {{ item.label }}
             </div>
           </div>
         </div>
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

.break-before-page {
  page-break-before: always;
}
</style>

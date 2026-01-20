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


      <!-- Content -->
    <div class="relative z-10 px-[2.5cm] py-[2.5cm] min-h-[297mm] flex flex-col font-serif text-slate-900 leading-relaxed text-[12pt]">
      <h1 class="text-3xl font-bold text-center mb-10 pb-4 border-b-2 border-slate-800 tracking-widest break-after-avoid">
        {{ store.documentType === 'contract' ? '住宅租賃契約書' : '存 證 信 函' }}
      </h1>
      <div class="flex-1 whitespace-pre-wrap">{{ store.generatedContent }}</div>
      
      <div class="mt-12 pt-4 border-t border-slate-100/50 text-center text-[10px] text-slate-400 font-sans select-none">
        免責聲明 (Disclaimer)：本工具生成之文件僅供參考，不代表律師正式法律意見
      </div>

      <!-- Appendix: Inventory Check -->
      <div v-if="store.documentType === 'contract' && store.inventoryItems.length > 0" class="break-before-page mt-4 flex flex-col min-h-[297mm] pb-[2.5cm]">
         <div class="text-center mb-6 pt-6 border-t border-slate-800/20 font-sans shrink-0">
           <h2 class="text-xl font-bold mb-1 text-slate-900">【附件】房屋現況確認書</h2>
           <p class="text-xs text-slate-500">此附件為租賃契約之一部分，記載交屋時之現況。</p>
         </div>
         
         <div class="grid grid-cols-2 gap-x-4 gap-y-6 flex-1 content-start">
           <div v-for="item in store.inventoryItems" :key="item.id" class="break-inside-avoid flex flex-col items-center space-y-2">
             <div class="w-full aspect-[4/3] border border-slate-200 bg-white p-1 relative shadow-sm">
               <img :src="item.image" class="w-full h-full object-contain" />
             </div>
             <div class="text-center font-bold text-slate-700 text-sm border-b-2 border-slate-100 pb-1 px-4">
               {{ item.label }}
             </div>
           </div>
         </div>

         <!-- Repeated Disclaimer for Appendix -->
         <div class="mt-auto pt-4 border-t border-slate-100/50 text-center text-[10px] text-slate-400 font-sans select-none shrink-0 break-before-avoid">
           免責聲明 (Disclaimer)：本工具生成之文件僅供參考，不代表律師正式法律意見
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

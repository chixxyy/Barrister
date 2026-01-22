<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
</script>

<template>
  <footer class="w-full py-12 px-4 border-t border-slate-200 bg-white/50 backdrop-blur-md mt-auto relative z-20">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      
      <!-- Copyright -->
      <p class="text-sm text-slate-500 font-medium tracking-wide">
        &copy; {{ new Date().getFullYear() }} Barrister. 版權所有。
      </p>

      <!-- Disclaimer & Links -->
      <div class="flex flex-col md:flex-row items-center gap-6 md:gap-8">
         <p class="text-xs text-slate-400 max-w-sm leading-relaxed">
           本網站提供之文件僅供參考，不構成法律建議。<br class="md:hidden">使用即同意自行承擔風險。
         </p>
         
         <!-- Contact -->
         <a href="https://github.com/chixxyy" class="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors text-sm font-medium p-2 hover:bg-slate-100 rounded-lg" target="_blank">
            <Mail class="w-4 h-4" />
            <span>聯絡我</span>
         </a>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
</script>

<template>
  <footer class="w-full py-8 px-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm mt-auto">
    <div class="max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-4">
      
      <!-- Disclaimer -->
      <p class="text-xs text-slate-400 max-w-2xl leading-relaxed">
        免責申明：本網站提供的所有文件與資訊僅供參考，不構成法律建議。使用本網站即表示您同意自行承擔風險。若有具體法律問題，建議諮詢專業律師。
      </p>

      <!-- Divider -->
      <div class="w-12 h-px bg-slate-200"></div>

      <!-- Links/Contact -->
      <div class="flex items-center gap-6">
         <!-- Contact -->
         <a href="https://github.com/chixxyy" class="flex items-center gap-2 text-slate-500 hover:text-legal-navy transition-colors text-sm font-medium" target="_blank">
            <Mail class="w-4 h-4" />
            <span>聯絡我</span>
         </a>
      </div>

      <!-- Copyright -->
      <p class="text-xs text-slate-300 mt-2">
        &copy; {{ new Date().getFullYear() }} Barrister. 版權所有。
      </p>

    </div>
  </footer>
</template>

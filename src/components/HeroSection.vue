<script setup lang="ts">
import { Key, Home, Calculator } from 'lucide-vue-next'
import SiteFooter from './SiteFooter.vue'
defineEmits(['start', 'start-tools'])
</script>

<template>
  <div class="flex flex-col min-h-screen text-center px-4 relative z-10">
    <div class="flex-1 flex flex-col items-center justify-center w-full pb-12 md:pb-24 pt-10">
    
    <div class="mb-12 animate-fade-in-down relative">
      <div class="w-32 h-32 bg-gradient-to-br from-primary-800 to-primary-950 rounded-[2.5rem] flex items-center justify-center shadow-glow animate-float relative z-10 mx-auto">
        <svg class="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      </div>
      <!-- Glow behind icon -->
      <div class="absolute inset-0 bg-primary-500/30 blur-2xl rounded-full transform translate-y-4 -z-10"></div>
    </div>
    
    <div class="max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in-up delay-100">
      <h1 class="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
        法律事務，<br class="md:hidden" />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-accent-DEFAULT">操之在握</span>
      </h1>
      <p class="text-lg md:text-xl text-slate-500 font-light tracking-wide">
         賦予您處理租賃爭議的強大工具，簡單、快速、專業。
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-8 w-full max-w-5xl animate-fade-in-up delay-200 px-4">
      <!-- Landlord Card -->
      <div class="glass-card rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center group">
        <div class="bg-primary-50 p-5 rounded-2xl mb-6 group-hover:bg-primary-100 transition-colors duration-300">
          <Key class="w-10 h-10 text-primary-700" />
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-2">我是房東</h3>
        <p class="text-slate-500 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
          處理租客欠租、違約或簽訂新約，自動生成專業法律文件。
        </p>
        
        <div class="w-full space-y-4 mt-auto">
          <button 
            @click="$emit('start', 'landlord', 'letter')"
            class="btn-primary w-full"
          >
            <span>產生存證信函</span>
            <span class="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button 
            @click="$emit('start', 'landlord', 'contract')"
            class="btn-secondary w-full"
          >
            <span>建立租賃契約</span>
          </button>
        </div>
      </div>

      <!-- Tenant Card -->
      <div class="glass-card rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center group">
        <div class="bg-emerald-50 p-5 rounded-2xl mb-6 group-hover:bg-emerald-100 transition-colors duration-300">
          <Home class="w-10 h-10 text-emerald-600" />
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-2">我是房客</h3>
        <p class="text-slate-500 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
          保障居住權益、退還押金或簽約，輕鬆維護自身權益。
        </p>

        <div class="w-full space-y-4 mt-auto">
          <button 
            @click="$emit('start', 'tenant', 'letter')"
            class="btn-primary w-full !bg-emerald-600 hover:!bg-emerald-700 hover:!shadow-emerald-500/30"
          >
            <span>產生存證信函</span>
            <span class="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button 
            @click="$emit('start', 'tenant', 'contract')"
            class="btn-secondary w-full hover:!border-emerald-200 hover:!text-emerald-700"
          >
            <span>建立租賃契約</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Utility Tools Section -->
    <div class="mt-10 w-full max-w-5xl animate-fade-in-up delay-200 px-4 mb-20">
       <button 
         @click="$emit('start-tools')"
         class="glass-panel w-full rounded-[2rem] p-6 pr-8 hover:border-accent-light/50 transition-all duration-300 flex items-center justify-between group text-left relative overflow-hidden"
       >
         <!-- Decorative gradient bg on hover -->
         <div class="absolute inset-0 bg-gradient-to-r from-accent-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

         <div class="flex items-center gap-6 relative z-10">
            <div class="bg-accent-light/10 p-5 rounded-2xl group-hover:bg-accent-light/20 transition-colors">
                <Calculator class="w-8 h-8 text-accent-dark" />
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-900 mb-1">實用小工具</h3>
                <p class="text-slate-500 text-sm">租屋補助試算、違約金計算機</p>
            </div>
         </div>
         
         <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-accent-DEFAULT group-hover:text-white transition-all shadow-sm group-hover:shadow-glow relative z-10">
             <span class="text-lg group-hover:translate-x-0.5 transition-transform">→</span>
         </div>
       </button>
    </div>
    </div>

    <SiteFooter />
  </div>
</template>

<style scoped>
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
.animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; opacity: 0; }
</style>

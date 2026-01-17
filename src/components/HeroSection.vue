<script setup lang="ts">
import { Key, Home, Calculator } from 'lucide-vue-next'
import SiteFooter from './SiteFooter.vue'
defineEmits(['start', 'start-tools'])
</script>

<template>
  <div class="flex flex-col min-h-screen text-center px-4 bg-gradient-to-b from-legal-navy/5 to-white">
    <div class="flex-1 flex flex-col items-center justify-center w-full">
    <div class="mb-16 animate-fade-in-down">
      <div class="w-28 h-28 bg-gradient-to-br from-legal-navy to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl mt-4">
        <svg class="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      </div>
    </div>
    
    <p class="text-lg md:text-xl text-slate-500 font-light mb-12 tracking-wide animate-fade-in-up delay-100 max-w-2xl mx-auto">
       賦予您處理租賃爭議的法律力量，<br class="md:hidden" />簡單、快速、專業。
    </p>
    <div class="grid md:grid-cols-2 gap-6 w-full max-w-5xl animate-fade-in-up delay-200 px-4">
      <!-- Landlord Card -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border hover:border-legal-navy/30 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col items-center text-center group">
        <div class="bg-blue-50 p-4 rounded-2xl mb-4 group-hover:bg-blue-100 transition-colors">
          <Key class="w-10 h-10 text-legal-navy" />
        </div>
        <h3 class="text-2xl font-bold text-slate-800 mb-2">我是房東</h3>
        <p class="text-slate-500 mb-8 text-sm leading-relaxed">
          處理租客欠租、違約或簽訂新約
        </p>
        
        <div class="w-full space-y-3">
          <button 
            @click="$emit('start', 'landlord', 'letter')"
            class="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-legal-navy hover:text-white text-slate-700 font-medium transition-all flex items-center justify-between group/btn border border-slate-100"
          >
            <span>產生存證信函</span>
            <span class="text-slate-400 group-hover/btn:text-white/70 text-sm">→</span>
          </button>
          <button 
            @click="$emit('start', 'landlord', 'contract')"
            class="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-medium transition-all flex items-center justify-between group/btn border border-slate-100"
          >
            <span>建立租賃契約</span>
            <span class="text-slate-400 group-hover/btn:text-white/70 text-sm">→</span>
          </button>
        </div>
      </div>

      <!-- Tenant Card -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border hover:border-emerald-500/30 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col items-center text-center group">
        <div class="bg-emerald-50 p-4 rounded-2xl mb-4 group-hover:bg-emerald-100 transition-colors">
          <Home class="w-10 h-10 text-emerald-600" />
        </div>
        <h3 class="text-2xl font-bold text-slate-800 mb-2">我是房客</h3>
        <p class="text-slate-500 mb-8 text-sm leading-relaxed">
          保障居住權益、退還押金或簽約
        </p>

        <div class="w-full space-y-3">
          <button 
            @click="$emit('start', 'tenant', 'letter')"
            class="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-legal-navy hover:text-white text-slate-700 font-medium transition-all flex items-center justify-between group/btn border border-slate-100"
          >
            <span>產生存證信函</span>
            <span class="text-slate-400 group-hover/btn:text-white/70 text-sm">→</span>
          </button>
          <button 
            @click="$emit('start', 'tenant', 'contract')"
            class="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-medium transition-all flex items-center justify-between group/btn border border-slate-100"
          >
            <span>建立租賃契約</span>
            <span class="text-slate-400 group-hover/btn:text-white/70 text-sm">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Utility Tools Section -->
    <!-- Utility Tools Section -->
    <div class="mt-8 w-full max-w-5xl animate-fade-in-up delay-200 px-4">
       <button 
         @click="$emit('start-tools')"
         class="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 border hover:border-indigo-500/30 shadow-xl transition-all duration-300 hover:shadow-2xl flex items-center justify-between group text-left px-8"
       >
         <div class="flex items-center gap-6">
            <div class="bg-indigo-50 p-4 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                <Calculator class="w-8 h-8 text-indigo-600" />
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-800 mb-1">實用小工具</h3>
                <p class="text-slate-500 text-sm">租屋補助試算、違約金計算機</p>
            </div>
         </div>
         
         <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
             <span class="text-lg">→</span>
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

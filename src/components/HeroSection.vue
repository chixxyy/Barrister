<script setup lang="ts">
import { Key, Home } from 'lucide-vue-next'
defineEmits(['start'])
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-b from-legal-navy/5 to-white">
    <div class="bg-legal-navy/10 p-4 rounded-full mb-6 animate-fade-in-down">
      <FileText class="w-12 h-12 text-legal-navy" />
    </div>
    <h1 class="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-legal-navy to-slate-700 mb-6 tracking-tight animate-fade-in-up">
      LegalEase Taiwan
      <span class="block text-3xl md:text-4xl mt-4 font-medium text-slate-600">法律文件生成助手</span>
    </h1>
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

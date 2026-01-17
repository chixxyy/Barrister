<script setup lang="ts">
import { ref, computed } from 'vue'
import { Banknote, AlertTriangle, ArrowLeft } from 'lucide-vue-next'
import SiteFooter from './SiteFooter.vue'

const activeTab = ref<'subsidy' | 'penalty'>('subsidy')

// --- Rent Subsidy Calculator Logic ---
const subsidyCity = ref('taipei')
const subsidyIdentity = ref('tier3')

const subsidyCities = [
  { value: 'taipei', label: '台北市' },
  { value: 'new_taipei', label: '新北市' },
  { value: 'taoyuan', label: '桃園市' },
  { value: 'taichung', label: '台中市' },
  { value: 'tainan', label: '台南市' },
  { value: 'kaohsiung', label: '高雄市' }
]

const subsidyIdentities = [
  { value: 'tier1', label: '第一級 (家庭成員/弱勢)', desc: '家庭成員二人以上，且成員中具有低收入戶身分者；或家庭成員三人以上，且成員中具有中低收入戶身分者。' },
  { value: 'tier2', label: '第二級 (單身/婚育)', desc: '非屬第一級及第三級條件者（例如：弱勢、特殊境遇家庭、育有未成年子女等）。' },
  { value: 'tier3', label: '第三級 (一般單身)', desc: '家庭成員一人且未滿 40 歲，且未具有經濟或社會弱勢身分者。' },
]

// Simplified data based on 300B Subsidy Project (Approximate 2024 figures)
// Format: { city: [Tier 1, Tier 2, Tier 3] }
const subsidyData: Record<string, number[]> = {
  'taipei': [8000, 5000, 3000],
  'new_taipei': [4800, 3200, 2400], // Using Banqiao/Sanchong/etc tier
  'taoyuan': [4000, 3200, 2400],
  'taichung': [4000, 3200, 2400], // Central districts
  'tainan': [3200, 3200, 2200],
  'kaohsiung': [3200, 3200, 2200]
}

const subsidyResult = computed(() => {
  const amounts = subsidyData[subsidyCity.value] || [0, 0, 0]
  let amount = 0
  
  if (subsidyIdentity.value === 'tier1') amount = amounts[0] ?? 0
  else if (subsidyIdentity.value === 'tier2') amount = amounts[1] ?? 0
  else amount = amounts[2] ?? 0

  // Add multiplier logic if needed (e.g. 1.2x for young singles, but keeping simple for MVP)
  // For Tier 3 (Singles < 40), they often get 1.2x multiplier in 2.0 project
  if (subsidyIdentity.value === 'tier3') {
      amount = Math.round(amount * 1.2)
  }

  return amount
})

// --- Penalty Calculator Logic ---
const rentAmount = ref<number>(0)
const hasAdvanceNotice = ref('yes') // yes | no
// noticeDays is reserved for future detailed calculation logic
// const noticeDays = ref<number>(30)

const penaltyResult = computed(() => {
  if (!rentAmount.value) return 0
  
  // Scenario 1: Tenant gives required advance notice
  // Result: Usually 0 penalty legally, but liable for rent during notice period
  if (hasAdvanceNotice.value === 'yes') {
    return 0
  } 
  
  // Scenario 2: No / Insufficient notice
  // Result: Max 1 month rent penalty (Residential Tenancy Act Art. 11 & Standard Contract)
  // Or pro-rated rent for insufficient notice period
  return Math.round(rentAmount.value * 1) // Max 1 month
})

</script>

<template>
  <div class="min-h-screen flex flex-col animate-fade-in-up">
    <div class="max-w-4xl mx-auto w-full flex-1 flex flex-col p-4 md:p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Banknote class="w-6 h-6 text-legal-navy" /> 實用租屋試算
        </h2>
        <p class="text-slate-500 text-sm mt-1">快速計算補助金額與解約違約金</p>
      </div>
      <button 
        @click="$emit('home')"
        class="flex items-center text-slate-500 hover:text-legal-navy transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
      >
        <ArrowLeft class="w-4 h-4 mr-1" /> 回首頁
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex p-1 bg-slate-100 rounded-xl mb-6 w-full max-w-md mx-auto">
      <button 
        v-for="tab in [{ id: 'subsidy', label: '租金補貼試算' }, { id: 'penalty', label: '提前解約計算機' }]"
        :key="tab.id"
        @click="activeTab = tab.id as any"
        :class="[
          'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
          activeTab === tab.id ? 'bg-white text-legal-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Card -->
    <div class="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 flex-1 overflow-y-auto">
      
      <!-- Subsidy Calculator -->
      <div v-if="activeTab === 'subsidy'" class="max-w-xl mx-auto space-y-8">
        <div class="space-y-6">
           <div class="space-y-2">
             <label class="block text-sm font-medium text-slate-700">租屋地區</label>
             <select v-model="subsidyCity" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-legal-navy/20 outline-none">
               <option v-for="city in subsidyCities" :key="city.value" :value="city.value">{{ city.label }}</option>
             </select>
           </div>

           <div class="space-y-2">
             <label class="block text-sm font-medium text-slate-700">身份條件</label>
             <div class="grid gap-3">
               <button 
                  v-for="tier in subsidyIdentities"
                  :key="tier.value"
                  @click="subsidyIdentity = tier.value"
                  :class="[
                    'text-left p-4 rounded-xl border-2 transition-all hover:bg-slate-50 relative',
                    subsidyIdentity === tier.value ? 'border-legal-navy bg-blue-50/30' : 'border-slate-100'
                  ]"
               >
                 <div class="font-bold text-slate-800 mb-1 flex items-center justify-between">
                    {{ tier.label }}
                    <div v-if="subsidyIdentity === tier.value" class="w-3 h-3 rounded-full bg-legal-navy"></div>
                 </div>
                 <div class="text-xs text-slate-500 leading-relaxed">{{ tier.desc }}</div>
               </button>
             </div>
           </div>
        </div>

        <div class="pt-8 border-t border-slate-100 text-center">
           <div class="text-slate-500 text-sm mb-2">預估每月補貼金額</div>
           <div class="text-3xl md:text-4xl font-black text-legal-navy flex items-center justify-center gap-1">
             <span class="text-xl md:text-2xl">$</span>
             {{ subsidyResult.toLocaleString() }}
             <span class="text-base font-medium text-slate-400 self-end mb-1">元 / 月</span>
           </div>
           <div class="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800 leading-relaxed text-left">
             <AlertTriangle class="w-4 h-4 inline mr-1 mb-0.5" />
             <strong>註：</strong>此試算僅供參考 (以300億專案試算，單身青年已加碼1.2倍)。<br>實際金額依內政部營建署審核及各縣市分區標準為準。
           </div>
        </div>
      </div>

      <!-- Penalty Calculator -->
      <div v-if="activeTab === 'penalty'" class="max-w-xl mx-auto space-y-8">
         <div class="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 text-orange-900 text-sm">
             <AlertTriangle class="w-5 h-5 shrink-0" />
             <div>
               <strong>法律小知識：</strong>
               <p class="mt-1 opacity-90">依《住宅租賃契約應約定及不得約定事項》，若租約有約定可提前終止，違約金最高不得超過「一個月租金」。若未約定，則原則上應履行租期，或雙方協議。</p>
             </div>
         </div>

         <div class="space-y-6">
            <div class="space-y-2">
               <label class="block text-sm font-medium text-slate-700">每月租金</label>
               <input v-model.number="rentAmount" type="number" placeholder="請輸入金額" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-legal-navy/20 outline-none" />
            </div>

            <div class="space-y-2">
               <label class="block text-sm font-medium text-slate-700">是否提前通知房東？</label>
               <div class="flex gap-4">
                 <label class="flex-1 cursor-pointer">
                   <input type="radio" v-model="hasAdvanceNotice" value="yes" class="peer sr-only">
                   <div class="p-3 text-center rounded-xl border-2 peer-checked:border-legal-navy peer-checked:bg-blue-50 peer-checked:text-legal-navy text-slate-500 border-slate-100 hover:bg-slate-50 transition-all font-medium">
                     有，依照合約期限
                   </div>
                 </label>
                 <label class="flex-1 cursor-pointer">
                   <input type="radio" v-model="hasAdvanceNotice" value="no" class="peer sr-only">
                   <div class="p-3 text-center rounded-xl border-2 peer-checked:border-legal-navy peer-checked:bg-blue-50 peer-checked:text-legal-navy text-slate-500 border-slate-100 hover:bg-slate-50 transition-all font-medium">
                     無 / 臨時告知
                   </div>
                 </label>
               </div>
            </div>
         </div>

         <div class="pt-8 border-t border-slate-100 text-center">
            <template v-if="rentAmount > 0">
              <div class="text-slate-500 text-sm mb-2">最高違約金上限</div>
              <div class="text-4xl font-black text-slate-800 flex items-center justify-center gap-1">
                <span class="text-2xl">$</span>
                {{ penaltyResult.toLocaleString() }}
              </div>
              <p v-if="hasAdvanceNotice === 'yes'" class="text-green-600 font-medium text-sm mt-2">
                 🎉 依規定提前通知，通常無需支付違約金。
              </p>
              <p v-else class="text-orange-600 font-medium text-sm mt-2">
                 ⚠️ 未依期限通知，最高可收取一個月租金作為賠償，並應補足不足通知期之租金。
              </p>
            </template>
            <template v-else>
               <div class="text-slate-300 font-bold text-2xl py-4">請輸入租金開始試算</div>
            </template>
         </div>
      </div>

    </div>
  </div>
    <SiteFooter />
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<script setup lang="ts">
import { useLetterStore } from '../stores/letter'
import { ref, computed } from 'vue'
import { User, MapPin, Briefcase, FileText, ChevronRight, ChevronLeft, Home } from 'lucide-vue-next'

const store = useLetterStore()
const currentStep = ref(1)

defineEmits(['home'])

const steps = computed(() => [
  { id: 1, title: '基本資料', icon: User },
  { id: 2, title: store.documentType === 'contract' ? '合約細節' : '租約背景', icon: Briefcase },
  { id: 3, title: '補充說明', icon: FileText },
])

// Date & Amount Validation
const dateErrors = ref<{ leaseStart?: string, leaseEnd?: string }>({})
const amountErrors = ref<{ rentAmount?: string, depositAmount?: string }>({})

const hasErrors = computed(() => !!(
  dateErrors.value.leaseStart || 
  dateErrors.value.leaseEnd ||
  amountErrors.value.rentAmount ||
  amountErrors.value.depositAmount
))

const validateAmount = (field: 'rentAmount' | 'depositAmount') => {
  if (!store[field]) {
    amountErrors.value[field] = '請輸入金額'
    return
  }
  if (Number(store[field]) < 0) {
    amountErrors.value[field] = '金額不能為負'
    return
  }
  delete amountErrors.value[field]
}

const next = () => {
  if (currentStep.value === 2) {
    validateDate('leaseStart')
    validateDate('leaseEnd')
    validateAmount('rentAmount')
    validateAmount('depositAmount')
    if (hasErrors.value) return
  }
  currentStep.value++
}
const prev = () => currentStep.value--

const validateDate = (field: 'leaseStart' | 'leaseEnd') => {
  const val = store[field]
  if (!val) {
    dateErrors.value[field] = '請輸入日期'
    return
  }

  // Remove non-digit characters to check raw numbers first
  const clean = val.replace(/[^0-9]/g, '')
  
  // Logic to handle user input
  let y, m, d
  
  // specific regex for yyy/mm/dd, yyy.mm.dd, yyy-mm-dd
  const separatorMatch = val.match(/^(\d{2,3})[\.\-\/](\d{1,2})[\.\-\/](\d{1,2})$/)
  
  if (separatorMatch) {
     [, y, m, d] = separatorMatch
  } else if (clean.length >= 6 && clean.length <= 7) {
     // Try parsing 1120101 or 990101
     if (clean.length === 7) {
       y = clean.substring(0, 3)
       m = clean.substring(3, 5)
       d = clean.substring(5, 7)
     } else {
       y = clean.substring(0, 2)
       m = clean.substring(2, 4)
       d = clean.substring(4, 6)
     }
  } else {
    dateErrors.value[field] = '格式範例：112/01/01'
    return
  }

  // Ensure we have values before parsing
  if (!y || !m || !d) {
    dateErrors.value[field] = '格式錯誤'
    return
  }

  const yearNum = parseInt(y)
  
  // Foolproofing: Check if user entered Gregorian year
  if (yearNum > 1900) {
    dateErrors.value[field] = `請輸入民國年份 (是 ${yearNum - 1911} 年嗎？)`
    return
  }

  // Validate Month and Day
  const monNum = parseInt(m)
  const dayNum = parseInt(d)
  if (monNum < 1 || monNum > 12 || dayNum < 1 || dayNum > 31) {
    dateErrors.value[field] = '日期不正確'
    return
  }

  // Auto-format to standardized string
  store[field] = `${yearNum}/${monNum}/${dayNum}`
  delete dateErrors.value[field]
}

const handleDateInput = (event: Event, field: 'leaseStart' | 'leaseEnd') => {
  const input = event.target as HTMLInputElement
  const inputType = (event as InputEvent).inputType
  const isDeleting = inputType && inputType.startsWith('delete')
  
  let val = input.value
  
  if (isDeleting) {
    store[field] = val
    return
  }
  
  // Logic: 
  // If 3 digits (e.g. 112), add / -> 112/
  // If 5 digits (e.g. 11201), add / -> 112/01/

  // If user typed 3rd digit and no slash yet
  if (val.length === 3 && !val.includes('/')) {
     val = val + '/'
  }
  // If user typed 6th char (e.g. 112/01) and it's not a slash
  else if (val.length === 6 && (val.match(/\//g) || []).length === 1) {
     val = val + '/'
  }
  
  // Update store and input value
  store[field] = val
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-8 h-full flex flex-col">
    <!-- Header -->
    <div class="mb-2 shrink-0">
      <button 
        @click="$emit('home')" 
        class="mb-4 text-slate-500 hover:text-legal-navy flex items-center text-sm font-medium transition-colors group"
      >
         <Home class="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 回首頁
      </button>

      <div class="flex items-center justify-between mb-2">
         <h2 class="text-2xl font-bold text-legal-navy">
           {{ store.documentType === 'contract' ? '建立租賃契約' : '產生存證信函' }}
         </h2>
      </div>

      <div class="flex items-center space-x-2 text-sm text-slate-500">
        <span class="font-medium text-legal-navy">步驟 {{ currentStep }}</span>
        <span>/</span>
        <span>{{ steps.length }}</span>
      </div>
      <!-- Progress Bar -->
      <div class="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
        <div 
          class="bg-legal-navy h-full transition-all duration-500 ease-out"
          :style="{ width: `${(currentStep / steps.length) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto px-1 py-2">
      <!-- Step 1: Category & Parties -->
      <div v-if="currentStep === 1" class="space-y-8 animate-fade-in-up">
        
        <!-- Category Selection (Only for Letter) -->
        <div v-if="store.documentType === 'letter'" class="space-y-2">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center">
            <Briefcase class="w-5 h-5 mr-2 text-legal-navy" /> 案件類型
          </h3>
          <div class="relative">
             <select v-model="store.category" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-legal-navy outline-none appearance-none cursor-pointer font-medium text-lg">
              <option>租金欠繳</option>
              <option>提前解約</option>
              <option>押金返還</option>
              <option>修繕責任</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <span class="text-slate-400">▼</span>
            </div>
          </div>
        </div>
        
        <hr v-if="store.documentType === 'letter'" class="border-slate-100" />

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center">
            <User class="w-5 h-5 mr-2 text-legal-navy" /> 
            <span v-if="store.documentType === 'contract'">
              {{ store.userRole === 'landlord' ? '出租人（甲方 - 您）' : '承租人（乙方 - 您）' }}
            </span>
            <span v-else>
              寄件人（您）
            </span>
          </h3>
          <div class="grid grid-cols-1 gap-3">
             <input v-model="store.sender.name" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '甲方姓名' : '乙方姓名') : '姓名 / 公司名稱'" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-legal-navy focus:ring-2 focus:ring-legal-navy/20 transition-all outline-none" />
             <input v-model="store.sender.address" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '甲方戶籍地址' : '乙方戶籍地址') : '聯絡地址'" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-legal-navy focus:ring-2 focus:ring-legal-navy/20 transition-all outline-none" />
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center">
            <MapPin class="w-5 h-5 mr-2 text-legal-navy" /> 
            <span v-if="store.documentType === 'contract'">
              {{ store.userRole === 'landlord' ? '承租人（乙方）' : '出租人（甲方）' }}
            </span>
            <span v-else>
              收件人（{{ store.userRole === 'landlord' ? '房客' : '房東' }}）
            </span>
          </h3>
          <div class="grid grid-cols-1 gap-3">
             <input v-model="store.receiver.name" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '乙方姓名' : '甲方姓名') : '對方姓名'" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-legal-navy focus:ring-2 focus:ring-legal-navy/20 transition-all outline-none" />
             <input v-model="store.receiver.address" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '乙方戶籍地址' : '甲方戶籍地址') : '對方地址'" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-legal-navy focus:ring-2 focus:ring-legal-navy/20 transition-all outline-none" />
          </div>
        </div>
      </div>

      <!-- Step 2: Lease Details (Contracts) -->
      <div v-if="currentStep === 2" class="space-y-6 animate-fade-in-up">
        <h3 class="text-lg font-semibold text-slate-800">
          {{ store.documentType === 'contract' ? '租賃契約內容' : '原租約資訊' }}
        </h3>
        <p class="text-sm text-slate-500">{{ store.documentType === 'contract' ? '填寫租約細節。' : '填寫合約重點，系統將自動帶入信函內容。' }}</p>

        <div class="space-y-4">
           <div>
             <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">租賃標的（房屋地址）</label>
             <input v-model="store.propertyAddress" type="text" placeholder="若同收件地址可留空" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-legal-navy focus:ring-2 focus:ring-legal-navy/20 transition-all outline-none" />
           </div>

           <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">租約起日</label>
                <input 
                  v-model="store.leaseStart" 
                  @input="(e) => handleDateInput(e, 'leaseStart')"
                  @blur="validateDate('leaseStart')"
                  type="text" 
                  placeholder="例：112/01/01" 
                  :class="[
                    'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 transition-all outline-none',
                    dateErrors.leaseStart 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 focus:border-legal-navy focus:ring-legal-navy/20'
                  ]" 
                />
                <p v-if="dateErrors.leaseStart" class="text-sm text-red-500 mt-1 font-medium">{{ dateErrors.leaseStart }}</p>
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">租約訖日</label>
                <input 
                  v-model="store.leaseEnd" 
                  @input="(e) => handleDateInput(e, 'leaseEnd')"
                  @blur="validateDate('leaseEnd')"
                  type="text" 
                  placeholder="例：113/01/01" 
                  :class="[
                    'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 transition-all outline-none',
                    dateErrors.leaseEnd 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 focus:border-legal-navy focus:ring-legal-navy/20'
                  ]" 
                />
                <p v-if="dateErrors.leaseEnd" class="text-sm text-red-500 mt-1 font-medium">{{ dateErrors.leaseEnd }}</p>
             </div>
           </div>

           <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">每月租金</label>
                <input 
                  v-model="store.rentAmount" 
                  @blur="validateAmount('rentAmount')"
                  type="number" 
                  placeholder="金額" 
                  :class="[
                    'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 transition-all outline-none',
                    amountErrors.rentAmount
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 focus:border-legal-navy focus:ring-legal-navy/20'
                  ]" 
                />
                <p v-if="amountErrors.rentAmount" class="text-sm text-red-500 mt-1 font-medium">{{ amountErrors.rentAmount }}</p>
             </div>
             <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">押金金額</label>
                <input 
                  v-model="store.depositAmount" 
                  @blur="validateAmount('depositAmount')"
                  type="number" 
                  placeholder="金額" 
                  :class="[
                    'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 transition-all outline-none',
                    amountErrors.depositAmount
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 focus:border-legal-navy focus:ring-legal-navy/20'
                  ]" 
                />
                <p v-if="amountErrors.depositAmount" class="text-sm text-red-500 mt-1 font-medium">{{ amountErrors.depositAmount }}</p>
             </div>
           </div>
        </div>
      </div>

      <!-- Step 3: Additional Facts -->
      <div v-if="currentStep === 3" class="space-y-6 animate-fade-in-up">
        <h3 class="text-lg font-semibold text-slate-800">補充說明 / 爭議詳情</h3>
        <div class="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
           {{ store.documentType === 'contract' ? '💡 您可在此新增其他約定條款（如：不可轉租、寵物條款等）。' : '💡 系統已根據前述資料自動生成第一段。您可在此補充：「積欠月份」、「具體修繕項目」或「違約情事」。' }}
        </div>
        <textarea 
          v-model="store.facts" 
          rows="12" 
          class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-legal-navy focus:ring-2 focus:ring-legal-navy/20 transition-all outline-none resize-none"
          :placeholder="store.documentType === 'contract' ? '例如：乙方不得將房屋轉租於他人...' : '例如：台端自民國113年5月起即未按時繳納租金，經多次催告仍不履行......'"
        ></textarea>
      </div>
    </div>

    <!-- Navigation Footer -->
    <!-- Navigation Footer -->
    <div class="flex justify-between pt-8 shrink-0 mt-auto bg-white border-t border-slate-50 sticky bottom-0 z-50">
      <button 
        v-if="currentStep > 1" 
        @click="prev"
        type="button"
        class="px-6 py-2 text-slate-600 font-medium hover:text-legal-navy flex items-center transition-colors hover:bg-slate-50 rounded-lg"
      >
        <ChevronLeft class="w-4 h-4 mr-1" /> 上一步
      </button>
      <div v-else></div>

      <button 
        v-if="currentStep < steps.length" 
        @click="next"
        type="button"
        :disabled="currentStep === 2 && hasErrors"
        :class="[
          'px-8 py-3 rounded-xl shadow-lg transition-all flex items-center transform',
          (currentStep === 2 && hasErrors)
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-legal-navy text-white shadow-legal-navy/30 hover:bg-blue-900 hover:-translate-y-0.5'
        ]"
      >
        下一步 <ChevronRight class="w-4 h-4 ml-1" />
      </button>
      <button 
        v-else 
        type="button"
        class="px-8 py-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all font-medium flex items-center transform hover:-translate-y-0.5"
      >
         <FileText class="w-4 h-4 mr-2" /> {{ store.documentType === 'contract' ? '下載契約 PDF' : '下載信函 PDF' }}
      </button>
    </div>
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

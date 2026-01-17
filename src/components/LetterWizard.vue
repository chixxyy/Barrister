<script setup lang="ts">
import { useLetterStore } from '../stores/letter'
import { ref, computed } from 'vue'
import { User, MapPin, Briefcase, FileText, ChevronRight, ChevronLeft, Home, Banknote, FileX, Coins, Hammer, Lightbulb, DoorOpen, AlertTriangle, Zap } from 'lucide-vue-next'

const store = useLetterStore()
const currentStep = ref(1)



const steps = computed(() => [
  { id: 1, title: '基本資料', icon: User },
  { id: 2, title: store.documentType === 'contract' ? '合約細節' : '租約背景', icon: Briefcase },
  { id: 3, title: '補充說明', icon: FileText },
])

// Date & Amount Validation
const dateErrors = ref<{ 
  leaseStart?: string, 
  leaseEnd?: string,
  repairNotifyDate?: string,
  moveOutDate?: string,
  arrearsStart?: string,
  evictionDeadline?: string,
  intrusionDate?: string
}>({})
const amountErrors = ref<{ 
  rentAmount?: string, 
  depositAmount?: string,
  arrearsTotal?: string
}>({})

const step2HasErrors = computed(() => !!(
  dateErrors.value.leaseStart || 
  dateErrors.value.leaseEnd ||
  amountErrors.value.rentAmount ||
  amountErrors.value.depositAmount
))

const validateAmount = (field: 'rentAmount' | 'depositAmount' | 'arrearsTotal') => {
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
    if (step2HasErrors.value) return
  }
  // Step 3 validation is optional/soft or strictly enforced? 
  // User didn't ask for strict blocking on Step 3, but if they enter bad data we should flag it.
  // We can leave blocking off for step 3 for now, or just validate if they entered something.
  currentStep.value++
}
const prev = () => currentStep.value--

const validateDate = (field: 'leaseStart' | 'leaseEnd' | 'repairNotifyDate' | 'moveOutDate' | 'arrearsStart' | 'evictionDeadline' | 'intrusionDate') => {
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

const handleDateInput = (event: Event, field: 'leaseStart' | 'leaseEnd' | 'repairNotifyDate' | 'moveOutDate' | 'arrearsStart' | 'evictionDeadline' | 'intrusionDate') => {
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

const emit = defineEmits(['home', 'download'])

// ... (existing code)

const printPDF = () => {
  emit('download')
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-8 h-full flex flex-col">
    <!-- Header -->
    <div class="mb-2 shrink-0">
      <button 
        @click="$emit('home')" 
        class="mb-2 px-4 py-2 -ml-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center text-sm font-medium transition-all group"
      >
         <Home class="w-4 h-4 mr-2" /> 回首頁
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
        <div v-if="store.documentType === 'letter'" class="space-y-3">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center">
            <Briefcase class="w-5 h-5 mr-2 text-legal-navy" /> 案件類型
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <template v-if="store.userRole === 'landlord'">
              <button
                 v-for="cat in [
                   { label: '欠繳租金', icon: Banknote, desc: '催告給付欠租' },
                   { label: '租約終止', icon: DoorOpen, desc: '租期屆滿/遷讓' },
                   { label: '損害賠償', icon: Hammer, desc: '房屋損壞求償' },
                   { label: '違約行為', icon: AlertTriangle, desc: '轉租/寵物/違法' }
                 ]"
                 :key="cat.label"
                 @click="store.category = cat.label"
                 :class="[
                   'relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 group overflow-hidden text-center h-full w-full aspect-square',
                   store.category === cat.label
                     ? 'border-legal-navy bg-blue-50/50 text-legal-navy shadow-md scale-[1.02] z-10'
                     : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                 ]"
              >
                 <div :class="['p-3 rounded-full mb-3 transition-colors', store.category === cat.label ? 'bg-white' : 'bg-slate-100 group-hover:bg-slate-200']">
                   <component :is="cat.icon" class="w-8 h-8" />
                 </div>
                 <span class="font-bold text-sm block mb-1">{{ cat.label }}</span>
                 <span class="text-[11px] leading-tight opacity-70 block">{{ cat.desc }}</span>
                 <div v-if="store.category === cat.label" class="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-legal-navy"></div>
              </button>
            </template>
            <template v-else>
               <button
                 v-for="cat in [
                   { label: '押金返還', icon: Coins, desc: '請求返還押金' },
                   { label: '修繕責任', icon: Hammer, desc: '要求履行修繕' },
                   { label: '提前解約', icon: FileX, desc: '終止租賃契約' },
                   { label: '居住安寧', icon: Zap, desc: '房東擅闖/干擾' }
                 ]"
                 :key="cat.label"
                 @click="store.category = cat.label"
                 :class="[
                   'relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 group overflow-hidden text-center h-full w-full aspect-square',
                   store.category === cat.label
                     ? 'border-legal-navy bg-blue-50/50 text-legal-navy shadow-md scale-[1.02] z-10'
                     : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                 ]"
              >
                 <div :class="['p-3 rounded-full mb-3 transition-colors', store.category === cat.label ? 'bg-white' : 'bg-slate-100 group-hover:bg-slate-200']">
                   <component :is="cat.icon" class="w-8 h-8" />
                 </div>
                 <span class="font-bold text-sm block mb-1">{{ cat.label }}</span>
                 <span class="text-[11px] leading-tight opacity-70 block">{{ cat.desc }}</span>
                 <div v-if="store.category === cat.label" class="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-legal-navy"></div>
              </button>
            </template>
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
        
        <!-- Legal Insight Banner -->
        <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
          <Lightbulb class="w-5 h-5 text-legal-navy shrink-0 mt-0.5" />
          <div class="text-sm text-blue-900 leading-relaxed">
             <template v-if="store.documentType === 'letter'">
               <p v-if="store.category === '欠繳租金'"><strong>民法第440條：</strong>承租人租金支付有遲延者，出租人得定相當期限，催告承租人支付租金，如承租人於其期限內不為支付，出租人得終止契約。</p>
               <p v-if="store.category === '租約終止'"><strong>民法第450條/455條：</strong>租賃定有期限者，其租賃關係，於期限屆滿時消滅...租賃關係消滅後，承租人應返還租賃物。</p>
               <p v-if="store.category === '損害賠償'"><strong>民法第432條：</strong>承租人應以善良管理人之注意，保管租賃物。租賃物有生產力者，並應保持其生產狀態。承租人違反前項義務，致租賃物毀損、滅失者，負損害賠償責任。</p>
               <p v-if="store.category === '違約行為'"><strong>民法第438條：</strong>承租人應依約定方法，為租賃物之使用、收益...承租人違反規定...經出租人阻止而仍繼續為之者，出租人得終止契約。</p>
               
               <p v-if="store.category === '押金返還'"><strong>民法第448條：</strong>租賃關係消滅時，承租人於返還租賃物後，得請求出租人返還押金。</p>
               <p v-if="store.category === '修繕責任'"><strong>民法第423條/429條：</strong>出租人應保持租賃物合於約定使用狀態...租賃物之修繕，除契約另有訂定或另有習慣外，由出租人負擔。</p>
               <p v-if="store.category === '提前解約'"><strong>民法第450條/453條：</strong>未定期限者，各當事人得隨時終止契約...定有期限者，如約定當事人之一方於期限屆滿前，得終止契約者，其終止契約，應先期通知。</p>
               <p v-if="store.category === '居住安寧'"><strong>刑法第306條：</strong>無故侵入他人住宅、建築物或附連圍繞之土地或船艦者，處一年以下有期徒刑、拘役或九千元以下罰金。</p>
             </template>
             <p v-if="store.documentType === 'contract'"><strong>租約小提醒：</strong>請務必確認租賃期間、租金及押金金額，並載明修繕責任歸屬。</p>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-slate-800">事實經過與補充</h3>
        
        <!-- Structured Inputs for Letter -->
        <div v-if="store.documentType === 'letter'" class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
           <!-- Arrears (Banknote) -->
           <div v-if="store.category === '欠繳租金'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">欠租明細</h4>
             <div class="grid grid-cols-2 gap-3">
               <div>
                  <label class="text-xs text-slate-500 mb-1 block">欠租起始年月</label>
                  <input 
                    v-model="store.arrearsStart" 
                    @blur="validateDate('arrearsStart')"
                    @input="(e) => handleDateInput(e, 'arrearsStart')"
                    type="text" 
                    placeholder="例：112/05" 
                    :class="['w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors bg-white text-slate-900', dateErrors.arrearsStart ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-legal-navy']"
                  />
                  <p v-if="dateErrors.arrearsStart" class="text-xs text-red-500 mt-1">{{ dateErrors.arrearsStart }}</p>
               </div>
               <div>
                  <label class="text-xs text-slate-500 mb-1 block">欠租月數</label>
                  <input v-model="store.arrearsCount" type="number" placeholder="例：3" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900" />
               </div>
               <div class="col-span-2">
                  <label class="text-xs text-slate-500 mb-1 block">欠租總金額</label>
                  <input 
                    v-model="store.arrearsTotal" 
                    @blur="validateAmount('arrearsTotal')"
                    type="number" 
                    placeholder="例：45000" 
                    :class="['w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors bg-white text-slate-900', amountErrors.arrearsTotal ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-legal-navy']" 
                  />
                  <p v-if="amountErrors.arrearsTotal" class="text-xs text-red-500 mt-1">{{ amountErrors.arrearsTotal }}</p>
               </div>
             </div>
           </div>

           <!-- Eviction (DoorOpen) -->
           <div v-if="store.category === '租約終止'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">終止詳情</h4>
             <div>
                <label class="text-xs text-slate-500 mb-1 block">限期遷讓日期</label>
                <input 
                  v-model="store.evictionDeadline" 
                  @blur="validateDate('evictionDeadline')"
                  @input="(e) => handleDateInput(e, 'evictionDeadline')"
                  type="text" 
                  placeholder="例：112/12/31" 
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900" 
                />
             </div>
           </div>

           <!-- Damages (Hammer) -->
           <div v-if="store.category === '損害賠償'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">損害情形</h4>
             <div class="space-y-3">
               <div>
                  <label class="text-xs text-slate-500 mb-1 block">損壞項目</label>
                  <input v-model="store.repairItem" type="text" placeholder="例：客廳地板、浴室門" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900" />
               </div>
               <div>
                  <label class="text-xs text-slate-500 mb-1 block">預估修復/賠償金額</label>
                  <input v-model="store.arrearsTotal" type="number" placeholder="例：5000" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900" />
               </div>
             </div>
           </div>
           
           <!-- Breach (AlertTriangle) -->
           <div v-if="store.category === '違約行為'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">違約詳情</h4>
             <div>
                <label class="text-xs text-slate-500 mb-1 block">違約事由</label>
                <input v-model="store.breachDetails" type="text" placeholder="例：未經同意飼養寵物、違法轉租" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900" />
             </div>
           </div>

           <!-- Repairs (Hammer) - Tenant -->
           <div v-if="store.category === '修繕責任'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">損壞情形</h4>
             <div class="grid grid-cols-2 gap-3">
               <div class="col-span-2">
                  <label class="text-xs text-slate-500 mb-1 block">待修繕項目</label>
                  <input v-model="store.repairItem" type="text" placeholder="例：浴室熱水器、臥室冷氣" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900" />
               </div>
               <div class="col-span-2">
                  <label class="text-xs text-slate-500 mb-1 block">已通知房東日期</label>
                  <input 
                    v-model="store.repairNotifyDate" 
                    @blur="validateDate('repairNotifyDate')"
                    @input="(e) => handleDateInput(e, 'repairNotifyDate')"
                    type="text" 
                    placeholder="例：112/03/15" 
                    :class="['w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors bg-white text-slate-900', dateErrors.repairNotifyDate ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-legal-navy']"  
                  />
                  <p v-if="dateErrors.repairNotifyDate" class="text-xs text-red-500 mt-1">{{ dateErrors.repairNotifyDate }}</p>
               </div>
             </div>
           </div>
           
           <!-- Intrusion (Zap) - Tenant -->
           <div v-if="store.category === '居住安寧'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">妨害詳情</h4>
             <div>
                <label class="text-xs text-slate-500 mb-1 block">發生日期</label>
                <input 
                  v-model="store.intrusionDate" 
                  @blur="validateDate('intrusionDate')"
                  @input="(e) => handleDateInput(e, 'intrusionDate')"
                  type="text" 
                  placeholder="例：112/08/20" 
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900"  
                />
             </div>
           </div>
           
           <!-- Deposit (Coins) - Tenant -->
           <div v-if="store.category === '押金返還'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">搬離資訊</h4>
             <div class="grid grid-cols-2 gap-3">
               <div>
                  <label class="text-xs text-slate-500 mb-1 block">搬離/點交日期</label>
                  <input 
                    v-model="store.moveOutDate" 
                    @blur="validateDate('moveOutDate')"
                    @input="(e) => handleDateInput(e, 'moveOutDate')"
                    type="text" 
                    placeholder="例：112/06/30" 
                    :class="['w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors bg-white text-slate-900', dateErrors.moveOutDate ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-legal-navy']"  
                  />
                  <p v-if="dateErrors.moveOutDate" class="text-xs text-red-500 mt-1">{{ dateErrors.moveOutDate }}</p>
               </div>
               <div>
                  <label class="text-xs text-slate-500 mb-1 block">押金金額</label>
                  <input v-model="store.depositAmount" type="number" placeholder="例：30000" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900" />
               </div>
             </div>
           </div>
           
           <!-- Early Termination (FileX) - Tenant -->
           <div v-if="store.category === '提前解約'" class="space-y-3">
             <h4 class="font-medium text-slate-700 text-sm">解約規劃</h4>
             <div>
                <label class="text-xs text-slate-500 mb-1 block">預計終止/搬離日期</label>
                <input 
                  v-model="store.moveOutDate" 
                  @blur="validateDate('moveOutDate')"
                  @input="(e) => handleDateInput(e, 'moveOutDate')"
                  type="text" 
                  placeholder="例：112/09/30" 
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-legal-navy outline-none transition-colors bg-white text-slate-900"  
                />
             </div>
           </div>
        </div>

        <div class="relative">
          <textarea 
            v-model="store.facts" 
            rows="8" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-legal-navy focus:ring-2 focus:ring-legal-navy/20 transition-all outline-none resize-none"
            :placeholder="store.documentType === 'contract' ? '例如：乙方不得將房屋轉租於他人...' : '請填寫其他補充事項（上方欄位已填寫者無需重複）...'"
          ></textarea>
          
          <!-- Quick Phrases -->
          <div v-if="store.documentType === 'letter'" class="mt-3 flex flex-wrap gap-2">
            <span class="text-xs text-slate-400 font-medium self-center mr-1">快速插入：</span>
            <button 
              v-for="phrase in [
                '經多次電話聯絡未果',
                '已寄發簡訊通知',
                '請於期限內回覆',
                '嚴重影響居住品質'
              ]"
              @click="store.facts += (store.facts ? '\n' : '') + phrase"
              class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors flex items-center"
            >
              <span class="mr-1 text-slate-400">+</span> {{ phrase }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Footer -->
    <!-- Navigation Footer -->
    <div class="flex justify-between pt-8 shrink-0 mt-auto bg-white border-t border-slate-50 sticky bottom-0 z-50">
      <button 
        v-if="currentStep > 1" 
        @click="prev"
        type="button"
        class="px-6 py-2 bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 hover:text-slate-800 flex items-center transition-colors rounded-lg group"
      >
        <ChevronLeft class="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 上一步
      </button>
      <div v-else></div>

      <button 
        v-if="currentStep < steps.length" 
        @click="next"
        type="button"
        :disabled="currentStep === 2 && step2HasErrors"
        :class="[
          'px-8 py-3 rounded-xl shadow-lg transition-all flex items-center transform',
          (currentStep === 2 && step2HasErrors)
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-legal-navy text-white shadow-legal-navy/30 hover:bg-blue-900 hover:-translate-y-0.5'
        ]"
      >
        下一步 <ChevronRight class="w-4 h-4 ml-1" />
      </button>
      <button 
        v-else 
        type="button"
        @click="printPDF"
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

<script setup lang="ts">
import { useLetterStore } from '../stores/letter'
import { ref, computed } from 'vue'
import { User, MapPin, Briefcase, FileText, ChevronRight, ChevronLeft, Home, Banknote, FileX, Coins, Hammer, Lightbulb, DoorOpen, AlertTriangle, Zap, Camera, Trash2, Plus } from 'lucide-vue-next'

const store = useLetterStore()
const currentStep = ref(1)
defineProps<{ isGenerating?: boolean }>()
const steps = computed(() => {
  const base = [
    { id: 1, title: '基本資料', icon: User },
    { id: 2, title: store.documentType === 'contract' ? '合約細節' : '租約背景', icon: Briefcase },
    { id: 3, title: '補充說明', icon: FileText },
  ]
  if (store.documentType === 'contract') {
    base.push({ id: 4, title: '房屋現況', icon: Camera })
  }
  return base
})

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

const emit = defineEmits(['home', 'download', 'download-word'])

// ... (existing code)

const showConfirmModal = ref(false)

const confirmDownload = (type: 'pdf' | 'word') => {
  showConfirmModal.value = false
  if (type === 'word') {
    emit('download-word')
  } else {
    emit('download')
  }
}

const printPDF = () => {
  showConfirmModal.value = true
}

// --- Inventory Photo Logic ---
const showCustomLabelInput = ref(false)
const customLabel = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const presetLabels = ['客廳現況', '廚房現況', '浴室現況', '臥室現況', '陽台/窗台', '冷氣設備', '熱水器', '鑰匙/磁扣']

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const file = input.files[0]
  if (!file) return

  const reader = new FileReader()
  
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      // Canvas for resizing and watermarking
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // Resize logic (Max width 800px)
      const MAX_WIDTH = 800
      let width = img.width
      let height = img.height
      
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width
        width = MAX_WIDTH
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw image
      ctx.drawImage(img, 0, 0, width, height)
      
      // Draw Watermark
      const now = new Date()
      const dateStr = `拍攝日期：${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`
      
      ctx.font = 'bold 24px sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      // Draw shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      ctx.fillText(dateStr, width - 20, height - 20)
      
      // Save Base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      // Add to store
      const label = customLabel.value || '房屋現況'
      store.inventoryItems.push({
        id: Date.now().toString(),
        label: label,
        image: dataUrl
      })
      
      // Reset
      customLabel.value = ''
      showCustomLabelInput.value = false
      if (fileInput.value) fileInput.value.value = ''
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removePhoto = (id: string) => {
  store.inventoryItems = store.inventoryItems.filter(item => item.id !== id)
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
         <h2 class="text-2xl font-bold text-primary-700">
           {{ store.documentType === 'contract' ? '建立租賃契約' : '產生存證信函' }}
         </h2>
      </div>

      <div class="flex items-center space-x-2 text-sm text-slate-500">
        <span class="font-medium text-primary-700">步驟 {{ currentStep }}</span>
        <span>/</span>
        <span>{{ steps.length }}</span>
      </div>
      <!-- Progress Bar -->
      <div class="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
        <div 
          class="bg-primary-900 h-full transition-all duration-500 ease-out"
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
            <Briefcase class="w-5 h-5 mr-2 text-primary-700" /> 案件類型
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
                     ? 'border-legal-navy bg-primary-50/50 text-primary-700 shadow-md scale-[1.02] z-10'
                     : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                 ]"
              >
                 <div :class="['p-3 rounded-full mb-3 transition-colors', store.category === cat.label ? 'bg-white' : 'bg-slate-100 group-hover:bg-slate-200']">
                   <component :is="cat.icon" class="w-8 h-8" />
                 </div>
                 <span class="font-bold text-sm block mb-1">{{ cat.label }}</span>
                 <span class="text-[11px] leading-tight opacity-70 block">{{ cat.desc }}</span>
                 <div v-if="store.category === cat.label" class="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary-900"></div>
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
                     ? 'border-legal-navy bg-primary-50/50 text-primary-700 shadow-md scale-[1.02] z-10'
                     : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                 ]"
              >
                 <div :class="['p-3 rounded-full mb-3 transition-colors', store.category === cat.label ? 'bg-white' : 'bg-slate-100 group-hover:bg-slate-200']">
                   <component :is="cat.icon" class="w-8 h-8" />
                 </div>
                 <span class="font-bold text-sm block mb-1">{{ cat.label }}</span>
                 <span class="text-[11px] leading-tight opacity-70 block">{{ cat.desc }}</span>
                 <div v-if="store.category === cat.label" class="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary-900"></div>
              </button>
            </template>
          </div>

        </div>
        
        <hr v-if="store.documentType === 'letter'" class="border-slate-100" />

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center">
            <User class="w-5 h-5 mr-2 text-primary-700" /> 
            <span v-if="store.documentType === 'contract'">
              {{ store.userRole === 'landlord' ? '出租人（甲方 - 您）' : '承租人（乙方 - 您）' }}
            </span>
            <span v-else>
              寄件人（您）
            </span>
          </h3>
          <div class="grid grid-cols-1 gap-3">
             <input v-model="store.sender.name" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '甲方姓名' : '乙方姓名') : '姓名 / 公司名稱'" class="input-field" />
             <input v-model="store.sender.idNumber" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '甲方身分證字號' : '乙方身分證字號') : '身分證字號 (選填)'" class="input-field" />
             <input v-model="store.sender.address" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '甲方戶籍地址' : '乙方戶籍地址') : '聯絡地址'" class="input-field" />
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center">
            <MapPin class="w-5 h-5 mr-2 text-primary-700" /> 
            <span v-if="store.documentType === 'contract'">
              {{ store.userRole === 'landlord' ? '承租人（乙方）' : '出租人（甲方）' }}
            </span>
            <span v-else>
              收件人（{{ store.userRole === 'landlord' ? '房客' : '房東' }}）
            </span>
          </h3>
          <div class="grid grid-cols-1 gap-3">
             <input v-model="store.receiver.name" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '乙方姓名' : '甲方姓名') : '對方姓名'" class="input-field" />
             <input v-model="store.receiver.idNumber" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '乙方身分證字號' : '甲方身分證字號') : '對方身分證字號 (選填)'" class="input-field" />
             <input v-model="store.receiver.address" type="text" :placeholder="store.documentType === 'contract' ? (store.userRole === 'landlord' ? '乙方戶籍地址' : '甲方戶籍地址') : '對方地址'" class="input-field" />
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
             <input v-model="store.propertyAddress" type="text" placeholder="若同收件地址可留空" class="input-field" />
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
        <div class="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
          <Lightbulb class="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
          <div class="text-sm text-primary-900 leading-relaxed">
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
            class="input-field resize-none"
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

      <!-- Step 4: Inventory Check (Contracts) -->
      <div v-if="currentStep === 4 && store.documentType === 'contract'" class="space-y-6 animate-fade-in-up">
         <div class="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
           <Camera class="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
           <div class="text-sm text-primary-900 leading-relaxed">
             <strong>保存證據：</strong>退租糾紛常源於對「原狀」認知不同。建議在此上傳交屋時的現況照片（如牆面、地板、設備），系統將自動壓上日期浮水印並附於合約後，保障雙方權益。
           </div>
         </div>

         <div class="space-y-4">
           <h3 class="text-lg font-semibold text-slate-800 flex items-center justify-between">
             <span>現況照片</span>
             <span class="text-sm font-normal text-slate-500">{{ store.inventoryItems.length }} 張照片</span>
           </h3>

           <!-- Photo Grid -->
           <div class="grid grid-cols-2 gap-4">
             <div v-for="item in store.inventoryItems" :key="item.id" class="relative group aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
               <img :src="item.image" class="w-full h-full object-cover" />
               <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <span class="text-white text-sm font-medium truncate">{{ item.label }}</span>
               </div>
               <button 
                 @click="removePhoto(item.id)"
                 class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm"
               >
                 <Trash2 class="w-4 h-4" />
               </button>
             </div>

             <!-- Add Button -->
             <button 
               @click="showCustomLabelInput = true" 
               class="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-legal-navy hover:bg-primary-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-primary-700 transition-all group"
             >
               <div class="p-3 rounded-full bg-slate-100 group-hover:bg-white mb-2 transition-colors">
                 <Plus class="w-6 h-6" />
               </div>
               <span class="text-sm font-medium">新增照片</span>
             </button>
           </div>
         </div>
      </div>
    </div>

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
            : 'btn-primary shadow-xl'
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
         <FileText class="w-4 h-4 mr-2" /> {{ store.documentType === 'contract' ? '儲存契約 PDF' : '儲存信函 PDF' }}
      </button>
    </div>
  </div>


  <!-- Confirmation Modal -->
  <div v-if="showConfirmModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-scale-up">
      <div class="p-6 text-center space-y-4">
        <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 ring-4 ring-green-50/50">
          <FileText class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-800">選擇下載格式</h3>
        <p class="text-slate-500 text-sm leading-relaxed">
          請確認目前填寫的內容皆正確無誤。<br>PDF 適合列印/分享，Word 適合後續編輯。
        </p>
      </div>
      <div class="grid grid-cols-1 gap-px bg-slate-100 border-t border-slate-100">
         <!-- PDF Option -->
        <button 
          @click="confirmDownload('pdf')"
          :disabled="isGenerating"
          class="py-4 px-6 text-left hover:bg-slate-50 transition-colors bg-white active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center group w-full"
        >
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors shrink-0">
             <FileText class="w-5 h-5 text-red-600" />
          </div>
          <div class="flex-1">
             <div class="font-bold text-slate-800 flex items-center">
               下載 PDF 檔
               <span v-if="isGenerating" class="ml-2 text-xs font-normal text-slate-500 animate-pulse">處理中...</span>
             </div>
             <div class="text-xs text-slate-500">保留完整格式，適合直接列印或是分享</div>
          </div>
          <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
        </button>

         <!-- Word Option -->
        <button 
          @click="confirmDownload('word')"
          :disabled="isGenerating"
          class="py-4 px-6 text-left hover:bg-slate-50 transition-colors bg-white active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center group w-full border-t border-slate-100"
        >
          <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors shrink-0">
             <FileText class="w-5 h-5 text-blue-600" />
          </div>
          <div class="flex-1">
             <div class="font-bold text-slate-800">下載 Word 檔 (.docx)</div>
             <div class="text-xs text-slate-500">可編輯內容，格式可能略有差異</div>
          </div>
          <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
        </button>

        <!-- Cancel -->
        <button 
          @click="showConfirmModal = false"
          class="py-3 text-slate-400 font-medium hover:text-slate-600 hover:bg-slate-50 transition-colors bg-white text-sm border-t border-slate-100"
        >
          再檢查一下
        </button>
      </div>
    </div>
  </div>

  <!-- Photo Upload Modal / Sheet -->
    <div v-if="showCustomLabelInput" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
       <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-scale-up p-6 space-y-4">
          <h3 class="text-lg font-bold text-slate-800">新增房屋現況照片</h3>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">選擇標籤 或 自行輸入</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <button 
                v-for="label in presetLabels" 
                :key="label"
                @click="customLabel = label"
                :class="['px-3 py-1.5 text-xs rounded-lg border transition-colors', customLabel === label ? 'border-legal-navy bg-primary-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50']"
              >
                {{ label }}
              </button>
            </div>
            <input 
              v-model="customLabel" 
              type="text" 
              placeholder="輸入自訂名稱..." 
              class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-legal-navy outline-none text-sm"
            />
          </div>

          <div class="pt-2 flex gap-3">
             <button @click="showCustomLabelInput = false" class="flex-1 py-2.5 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors">取消</button>
             <button 
               @click="triggerFileInput" 
               class="flex-1 py-2.5 bg-primary-900 text-white font-medium rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/20"
             >
               選擇照片
             </button>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            class="hidden" 
            @change="handlePhotoUpload"
          />
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

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>

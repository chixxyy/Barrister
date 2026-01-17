import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLetterStore = defineStore('letter', () => {
  const sender = ref({ name: '', address: '' })
  const receiver = ref({ name: '', address: '' })
  const userRole = ref<'landlord' | 'tenant'>('landlord')
  const documentType = ref<'letter' | 'contract'>('letter')
  const category = ref<string>('欠繳租金')
  
  // Lease specific details
  const propertyAddress = ref('')
  const leaseStart = ref('')
  const leaseEnd = ref('')
  const rentAmount = ref('')
  const depositAmount = ref('')
  

  
  // Specific Fact Fields
  const arrearsStart = ref('') // 欠租開始月份
  const arrearsCount = ref('') // 欠租月數
  const arrearsTotal = ref('') // 欠租總額
  
  const repairItem = ref('') // 待修繕項目 / 損壞項目
  const repairNotifyDate = ref('') // 通知房東修繕日期
  
  const moveOutDate = ref('') // 預計/已搬離日期
  const evictionDeadline = ref('') // 限期遷讓日期
  const breachDetails = ref('') // 違約事由
  const intrusionDate = ref('') // 妨害安寧日期

  const facts = ref<string>('')

  const generatedContent = computed(() => {
    // Helper: Convert date string to ROC format (中華民國 xxx 年 x 月 x 日)
    // Supports both ISO (yyyy-mm-dd) and ROC string (yyy/mm/dd)
    const toROC = (dateStr: string) => {
      if (!dateStr) return ''
      
      // Check if it's already a simple ROC format like 112/01/01 or 112/01
      // We assume if year < 1900, it's already ROC
      const rocMatch = dateStr.match(/^(\d{2,3})[\.\-\/](\d{1,2})([\.\-\/](\d{1,2}))?$/)
      if (rocMatch) {
         const [_, y, m, _sep, d] = rocMatch
         if (d) {
             return `中華民國 ${y} 年 ${Number(m)} 月 ${Number(d)} 日`
         } else {
             return `中華民國 ${y} 年 ${Number(m)} 月`
         }
      }

      // Fallback: try parsing as Date (assuming ISO)
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr // Return original if unknown
      
      return `中華民國 ${date.getFullYear() - 1911} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
    }
    const pAddress = propertyAddress.value || sender.value.address || '......'
    
    // Formatted Dates
    const startStr = toROC(leaseStart.value)
    const endStr = toROC(leaseEnd.value)

    // Current Date
    const now = new Date()
    const year = now.getFullYear() - 1911
    const dateStr = `中華民國 ${year} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`
    
    // For Contracts: determine who is Party A (Landlord) vs Party B (Tenant)
    const partyA = userRole.value === 'landlord' ? sender.value : receiver.value
    const partyB = userRole.value === 'landlord' ? receiver.value : sender.value

    if (documentType.value === 'contract') {
      const basicArticles = `第一條：租賃標的
房屋所在地：${pAddress}

第二條：租賃期間
自 ${startStr || '______'} 起至 ${endStr || '______'} 止。

第三條：租金及押金
1. 每月租金新台幣 ${rentAmount.value || '______'} 元整，於每月 ___ 日前支付。
2. 押金新台幣 ${depositAmount.value || '______'} 元整，於租期屆滿交還房屋時無息返還。`

      let otherArticle = ''
      let courtArticleNum = '四'
      
      if (facts.value?.trim()) {
        otherArticle = `\n\n第四條：其他約定\n${facts.value}`
        courtArticleNum = '五'
      }

      return `住宅租賃契約書

立契約書人：
出租人：${partyA.name || '（姓名）'}（以下簡稱甲方）
承租人：${partyB.name || '（姓名）'}（以下簡稱乙方）

茲為房屋租賃事宜，雙方同意本契約條款如下：

${basicArticles}${otherArticle}

第${courtArticleNum}條：管轄法院
本契約如涉訴訟，雙方同意以租賃物所在地之地方法院為第一審管轄法院。

立契約書人
甲方：${partyA.name || '___________'}
地址：${partyA.address || '____________________'}

乙方：${partyB.name || '___________'}
地址：${partyB.address || '____________________'}

中華民國 ${year} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`
    }

    // Default subjects based on category (8 categories)
    let subject = ''
    switch (category.value) {
      // Landlord Categories
      case '欠繳租金': subject = '為催告台端給付積欠之租金事，詳如說明，請查照。'; break;
      case '租約終止': subject = '為通知終止租約並請求遷讓房屋事，詳如說明，請查照。'; break;
      case '損害賠償': subject = '為請求租賃物毀損賠償事，詳如說明，請查照。'; break;
      case '違約行為': subject = '為通知台端違反租賃契約規定事，詳如說明，請查照。'; break;
      
      // Tenant Categories
      case '押金返還': subject = '為請求返還房屋租賃押金事，詳如說明，請查照。'; break;
      case '修繕責任': subject = '為請求履行房屋修繕義務事，詳如說明，請查照。'; break;
      case '提前解約': subject = '為通知提前終止房屋租賃契約事，詳如說明，請查照。'; break;
      case '居住安寧': subject = '為請台端停止干擾租賃居住安寧事，詳如說明，請查照。'; break;
      
      default: subject = '有關房屋租賃爭議事宜，詳如說明，請查照。';
    }

    // Auto-generate fact paragraph from structured data
    let structuredFacts = ''
    // pAddress already defined above
    
    if (startStr && endStr) {
      structuredFacts += `\n一、緣本人與台端就位於「${pAddress}」之房屋訂有租賃契約，租期自 ${startStr} 起至 ${endStr} 止`
      if (rentAmount.value) structuredFacts += `，每月租金新台幣 ${rentAmount.value} 元整`
      structuredFacts += '。'
    } else {
       structuredFacts += `\n一、緣本人與台端就位於「${pAddress}」之房屋訂有租賃契約。`
    }

    // Add category specific standard text if facts are empty or to supplement structured data
    let specificClaim = ''
    
    // Logic: If structured data is present, use it to build "specificClaim".
    
    // --- Landlord Scenarios ---
    if (category.value === '欠繳租金') {
       if (arrearsStart.value && arrearsCount.value && arrearsTotal.value) {
         specificClaim = `\n二、查台端自 ${toROC(arrearsStart.value)} 起即未依約繳納租金，迄今已積欠 ${arrearsCount.value} 個月租金，共計新台幣 ${arrearsTotal.value} 元整。依民法第440條規定，請於見函後五日內付清。`
       } else if (!facts.value) {
         specificClaim = `\n二、查台端自......起即未依約繳納租金，迄今已積欠......個月租金，共計新台幣......元整。`
       }
    } 
    else if (category.value === '租約終止') {
       if (evictionDeadline.value) {
         specificClaim = `\n二、台端因違反租賃契約（或租約到期），租賃關係已於日前終止。本人特函通知，請台端於 ${toROC(evictionDeadline.value)} 前將房屋騰空返還。`
       } else if (!facts.value) {
          specificClaim = `\n二、台端之租賃關係已消滅，請於函到七日內遷讓房屋並返還租賃物。`
       }
    }
    else if (category.value === '損害賠償') {
       if (repairItem.value && arrearsTotal.value) { // Reusing fields: repairItem(items), arrearsTotal(amount)
         specificClaim = `\n二、查台端交還房屋後，發現屋內之「${repairItem.value}」有人為損壞情事。經估價修復費用共計新台幣 ${arrearsTotal.value} 元整，應由台端負擔。`
       } else if (!facts.value) {
          specificClaim = `\n二、台端租用之房屋有毀損情事，請於函到後儘速聯絡賠償事宜。`
       }
    }
    else if (category.value === '違約行為') {
       if (breachDetails.value) { 
         specificClaim = `\n二、查台端於租賃期間，有${breachDetails.value}之情事，顯已違反租賃契約第...條之規定（或民法相關規定）。`
       } else if (!facts.value) {
          specificClaim = `\n二、查台端有違反租賃契約之情事（如轉租、飼養寵物等），特函請立即改善，否則將依法終止租約。`
       }
    }

    // --- Tenant Scenarios ---
    else if (category.value === '押金返還') {
       if (moveOutDate.value && depositAmount.value) {
         specificClaim = `\n二、本人已於 ${toROC(moveOutDate.value)} 搬離租賃處並完成點交，惟本人交付之押金新台幣 ${depositAmount.value} 元整，台端迄今尚未返還。`
       } else if (!facts.value) {
         specificClaim = `\n二、租賃契約已於......終止，惟本人交付之押金新台幣 ${depositAmount.value} 元整，台端迄今尚未返還。`
       }
    } 
    else if (category.value === '修繕責任') {
       if (repairItem.value && repairNotifyDate.value) {
         specificClaim = `\n二、查租賃標的物之「${repairItem.value}」發生損壞，本人已於 ${toROC(repairNotifyDate.value)} 通知台端修繕，惟台端迄今置之不理。`
       } else if (!facts.value) {
         specificClaim = `\n二、查租賃標的物之......發生損壞，本人已於......通知台端修繕，惟台端迄今置之不理。`
       }
    }
    else if (category.value === '提前解約') {
       if (moveOutDate.value) {
         specificClaim = `\n二、因......之故，本人擬依租約約定（或法定事由），於 ${toROC(moveOutDate.value)} 終止租賃契約，並於當日辦理點交。`
       } else if (!facts.value) {
          specificClaim = `\n二、特函通知台端，本人將於......終止租約，請惠予配合辦理退租手續。`
       }
    }
    else if (category.value === '居住安寧') {
       if (intrusionDate.value) { 
         specificClaim = `\n二、查台端於 ${toROC(intrusionDate.value)} 未經本人同意擅自進入租賃住宅（或有其他干擾行為），已嚴重侵害本人之居住權益與隱私。`
       } else if (!facts.value) {
          specificClaim = `\n二、查台端近期有未經允許擅入房屋/干擾居住安寧之情事，特函請自重，以免觸法。`
       }
    }

    // Merge structured claim + custom facts
    // If user provided custom facts, append them or use them.
    // Strategy: If specificClaim exists (from structured data), puts it first. Then custom facts.
    // If no structured data but custom facts exist, use custom facts.
    
    let customFacts = ''
    const hasFacts = !!facts.value?.trim()
    
    if (specificClaim && hasFacts) {
      customFacts = `${specificClaim}\n\n三、${facts.value}`
    } else if (specificClaim) {
      customFacts = specificClaim
    } else if (hasFacts) {
      customFacts = `\n二、${facts.value}`
    } else {
      customFacts = ''
    }

    // Dynamic numbering for the closing warning
    let closingNumber = '三'
    if (specificClaim && hasFacts) {
      // specificClaim is II, facts is III
      closingNumber = '四'
    } else if (!specificClaim && hasFacts) {
      // facts is II
      closingNumber = '三'
    } else {
      // specificClaim is II (or fallback text is II)
      closingNumber = '三'
    }

    // Template structure
    return `存證信函

寄件人：${sender.value.name || '（姓名）'}
地  址：${sender.value.address || '（完整地址）'}

收件人：${receiver.value.name || '（姓名）'}
地  址：${receiver.value.address || '（完整地址）'}

主旨：${subject}

說明：${structuredFacts}
${customFacts}

${closingNumber}、特函告知，請於文到後七日內出面處理或回覆，以免衍生不必要之訴訟程序。

${dateStr}
    `
  })

  return { 
    sender, receiver, userRole, documentType, category, 
    propertyAddress, leaseStart, leaseEnd, rentAmount, depositAmount,
    arrearsStart, arrearsCount, arrearsTotal, 
    repairItem, repairNotifyDate, moveOutDate, evictionDeadline, breachDetails, intrusionDate,
    facts, generatedContent 
  }
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLetterStore = defineStore('letter', () => {
  const sender = ref({ name: '', address: '' })
  const receiver = ref({ name: '', address: '' })
  const userRole = ref<'landlord' | 'tenant'>('landlord')
  const documentType = ref<'letter' | 'contract'>('letter')
  const category = ref<string>('租金欠繳')
  
  // Lease specific details
  const propertyAddress = ref('')
  const leaseStart = ref('')
  const leaseEnd = ref('')
  const rentAmount = ref('')
  const depositAmount = ref('')
  
  const facts = ref<string>('')

  const generatedContent = computed(() => {
    // Helper: Convert date string to ROC format (中華民國 xxx 年 x 月 x 日)
    // Supports both ISO (yyyy-mm-dd) and ROC string (yyy/mm/dd)
    const toROC = (dateStr: string) => {
      if (!dateStr) return ''
      
      // Check if it's already a simple ROC format like 112/01/01
      // We assume if year < 1900, it's already ROC
      const rocMatch = dateStr.match(/^(\d{2,3})[\.\-\/](\d{1,2})[\.\-\/](\d{1,2})$/)
      if (rocMatch) {
        const [_, y, m, d] = rocMatch
        return `中華民國 ${y} 年 ${m} 月 ${d} 日`
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
      return `住宅租賃契約書

立契約書人：
出租人：${partyA.name || '（姓名）'}（以下簡稱甲方）
承租人：${partyB.name || '（姓名）'}（以下簡稱乙方）

茲為房屋租賃事宜，雙方同意本契約條款如下：

第一條：租賃標的
房屋所在地：${pAddress}

第二條：租賃期間
自 ${startStr || '______'} 起至 ${endStr || '______'} 止。

第三條：租金及押金
1. 每月租金新台幣 ${rentAmount.value || '______'} 元整，於每月 ___ 日前支付。
2. 押金新台幣 ${depositAmount.value || '______'} 元整，於租期屆滿交還房屋時無息返還。

第四條：其他約定
${facts.value || '（無補充約定）'}

第五條：管轄法院
本契約如涉訴訟，雙方同意以租賃物所在地之地方法院為第一審管轄法院。

立契約書人
甲方：${partyA.name || '___________'}
地址：${partyA.address || '____________________'}

乙方：${partyB.name || '___________'}
地址：${partyB.address || '____________________'}

中華民國 ${year} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`
    }

    // Default subjects based on category
    let subject = ''
    switch (category.value) {
      case '租金欠繳': subject = '為催告台端給付積欠之租金事，詳如說明，請查照。'; break;
      case '提前解約': subject = '為通知終止房屋租賃契約事，詳如說明，請查照。'; break;
      case '押金返還': subject = '為請求返還房屋租賃押金事，詳如說明，請查照。'; break;
      case '修繕責任': subject = '為請求履行房屋修繕義務事，詳如說明，請查照。'; break;
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

    // Add category specific standard text if facts are empty
    let specificClaim = ''
    if (!facts.value) {
       if (category.value === '租金欠繳' && rentAmount.value) {
          specificClaim = `\n二、查台端自......起即未依約繳納租金，迄今已積欠......個月租金，共計新台幣......元整。`
       } else if (category.value === '押金返還' && depositAmount.value) {
          specificClaim = `\n二、租賃契約已於......終止，惟本人交付之押金新台幣 ${depositAmount.value} 元整，台端迄今尚未返還。`
       }
    }

    const customFacts = facts.value ? `\n二、${facts.value}` : specificClaim

    // Template structure
    return `存證信函

寄件人：${sender.value.name || '（姓名）'}
地  址：${sender.value.address || '（完整地址）'}

收件人：${receiver.value.name || '（姓名）'}
地  址：${receiver.value.address || '（完整地址）'}

主旨：${subject}

說明：${structuredFacts}
${customFacts || '\n二、台端之行為顯已違反契約義務及相關法規。'}

三、特函告知，請於文到後七日內出面處理或回覆，以免衍生不必要之訴訟程序。

${dateStr}
    `
  })

  return { 
    sender, receiver, userRole, documentType, category, 
    propertyAddress, leaseStart, leaseEnd, rentAmount, depositAmount,
    facts, generatedContent 
  }
})

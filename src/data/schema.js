export const DATA_SCHEMA_VERSION = 1

export const primaryIncomeTypes = ['工资薪金', '劳务报酬', '稿酬', '特许权使用费']
export const otherIncomeTypes = ['经营所得', '利息、股息、红利', '财产租赁', '财产转让', '偶然所得']
export const allIncomeTypes = [...primaryIncomeTypes, ...otherIncomeTypes]

const MONEY_FIELDS = [
  'income',
  'reportedTax',
  'expense',
  'taxExemptIncome',
  'basicDeduction',
  'specialDeduction',
  'specialAdditionalDeduction',
  'personalPension',
  'otherDeduction',
  'donationDeduction',
  'taxableIncome',
  'quickDeduction',
  'taxDue',
  'taxRelief',
  'taxPaid',
]

const DEFAULT_APP_DATA = {
  version: DATA_SCHEMA_VERSION,
  updatedAt: '2026-10-11T00:00:00.000Z',
  profile: {
    name: '张三',
    // 演示用合成识别号，切勿写入真实身份信息
    taxpayerId: '11010119900101001X',
    quickItems: [
      { title: '家庭成员', value: '添加', kind: 'family', filled: false },
      { title: '任职受雇', value: '暂无', kind: 'work', filled: false },
      { title: '银行卡', value: '1张', kind: 'bank', filled: true },
    ],
  },
  taxMonths: [
    {
      period: '2026-09',
      records: [
        {
          id: '2026-09-001',
          incomeType: '工资薪金',
          incomeSubtype: '正常工资薪金',
          withholdingAgent: '示例科技有限公司',
          withholdingAgentTaxId: '91000000000000000X',
          taxAuthority: '国家税务总局示例市税务局',
          declarationChannel: '其他',
          declarationDate: '2026-10-11',
          income: '10000.00',
          reportedTax: '79.79',
          expense: '0.00',
          taxExemptIncome: '0.00',
          basicDeduction: '5000.00',
          specialDeduction: '840.30',
          specialAdditionalDeduction: '1500.00',
          specialAdditionalDeductionName: '住房租金',
          personalPension: '0.00',
          otherDeduction: '0.00',
          donationDeduction: '0.00',
          taxableIncome: '2659.70',
          taxRate: '3%',
          quickDeduction: '0.00',
          taxDue: '79.79',
          taxRelief: '0.00',
          taxPaid: '0.00',
        },
      ],
    },
    {
      period: '2026-08',
      records: [
        {
          id: '2026-08-001',
          incomeType: '劳务报酬',
          incomeSubtype: '其他连续劳务报酬',
          withholdingAgent: '示例科技有限公司',
          withholdingAgentTaxId: '91000000000000000X',
          taxAuthority: '国家税务总局示例市税务局',
          declarationChannel: '其他',
          declarationDate: '2026-09-11',
          income: '800.00',
          reportedTax: '0.00',
          expense: '160.00',
          taxExemptIncome: '0.00',
          basicDeduction: '5000.00',
          specialDeduction: '0.00',
          otherDeduction: '0.00',
          donationDeduction: '0.00',
          taxableIncome: '0.00',
          taxRate: '3.00%',
          quickDeduction: '0.00',
          taxDue: '0.00',
          taxRelief: '0.00',
          taxPaid: '0.00',
        },
      ],
    },
    {
      period: '2026-07',
      records: [
        {
          id: '2026-07-001',
          incomeType: '劳务报酬',
          incomeSubtype: '其他连续劳务报酬',
          withholdingAgent: '示例科技有限公司',
          withholdingAgentTaxId: '91000000000000000X',
          taxAuthority: '国家税务总局示例市税务局',
          declarationChannel: '其他',
          declarationDate: '2026-08-11',
          income: '500.00',
          reportedTax: '0.00',
          expense: '100.00',
          taxExemptIncome: '0.00',
          basicDeduction: '5000.00',
          specialDeduction: '0.00',
          otherDeduction: '0.00',
          donationDeduction: '0.00',
          taxableIncome: '0.00',
          taxRate: '3.00%',
          quickDeduction: '0.00',
          taxDue: '0.00',
          taxRelief: '0.00',
          taxPaid: '0.00',
        },
      ],
    },
  ],
  messages: [
    { id: 4, kind: 'notice', title: '个税记忆上线提醒', preview: '快来查收您的2025个税记忆吧', date: '2026-01-27', unread: false },
    { id: 5, kind: 'tax', title: '预约办税提醒', preview: '预约办税提醒', date: '2024-03-09', unread: false },
    { id: 6, kind: 'notice', title: '预约成功提醒', preview: '预约办税成功提醒', date: '2024-03-03', unread: false },
    { id: 7, kind: 'notice', title: '个税记忆上线提醒', preview: '快来查收您的2023个税记忆吧', date: '2024-02-02', unread: false },
  ],
  home: {
    notices: [
      '国家税务总局关于2025年度个人所得税综合所得汇算清缴预约办理时间的通告',
      '关于近期虚假退税宣传的温馨提示',
      '国家税务总局令第57号：《个人所得税综合所得汇算清缴管理办法》',
      '个人退税的这些陷阱你必须知道。',
    ],
    policyTabs: ['警示案例', '通知公告', '热点问题', '政策解读'],
    policyContent: [
      ['办理汇算想便捷 APP密码要记牢', '获取退税想及时 准确卡号必须有', '未依法办理个人所得税综合所得年度汇算清缴案件', '未在法定期限内办理综合所得汇算清缴、虚假填报子女教育专项附加扣除案件'],
      ['关于2025年度个人所得税综合所得汇算清缴事项的公告', '个人养老金有关个人所得税政策公告', '专项附加扣除信息确认温馨提示'],
      ['年度汇算办理常见问题解答', '如何查询个人收入纳税明细', '专项附加扣除热点问题'],
      ['综合所得年度汇算政策解读', '个人养老金税收优惠政策解读', '个税专项附加扣除最新政策解读'],
    ],
  },
}

export function cloneData(value) {
  return JSON.parse(JSON.stringify(value))
}

function fallbackDeclarationDate(period) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(period || ''))
  if (!match) return ''
  let year = Number(match[1])
  let month = Number(match[2]) + 1
  if (month > 12) {
    month = 1
    year += 1
  }
  return `${year}-${String(month).padStart(2, '0')}-11`
}

/**
 * 保留非「扣缴申报温馨提示」的系统/自定义消息，
 * 根据 taxMonths 按时间维度重新生成匹配的「扣缴申报温馨提示」并按日期降序排列。
 */
export function syncMessagesFromTaxMonths(existingMessages = [], taxMonths = []) {
  const keptMessages = (existingMessages || [])
    .filter((item) => item && item.title !== '扣缴申报温馨提示')
    .map((item) => ({ ...item }))

  // 记录旧的扣缴申报温馨提示的已读状态，便于同步时保留
  const previousUnreadByKey = new Map()
  ;(existingMessages || []).forEach((item) => {
    if (item && item.title === '扣缴申报温馨提示') {
      previousUnreadByKey.set(`${item.date}::${item.preview}`, Boolean(item.unread))
    }
  })

  // 同月同申报日期同单位去重，生成对应的扣缴申报温馨提示
  const generatedMap = new Map()
  ;(taxMonths || []).forEach((month) => {
    if (!month || !Array.isArray(month.records)) return
    month.records.forEach((rec) => {
      const agent = String(rec?.withholdingAgent || '扣缴义务人').trim() || '扣缴义务人'
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(rec?.declarationDate || ''))
        ? String(rec.declarationDate)
        : fallbackDeclarationDate(month.period)
      const dedupeKey = `${month.period}::${date}::${agent}`
      if (generatedMap.has(dedupeKey)) return
      const preview = `来自${agent}扣缴申报的温馨提示`
      generatedMap.set(dedupeKey, {
        kind: 'notice',
        title: '扣缴申报温馨提示',
        preview,
        date,
        unread: previousUnreadByKey.has(`${date}::${preview}`)
          ? previousUnreadByKey.get(`${date}::${preview}`)
          : null,
      })
    })
  })

  const generated = Array.from(generatedMap.values())
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))

  // 全新生成的提示默认最新 2 条标为未读，其余已读
  let nextId = keptMessages.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
  const finalizedGenerated = generated.map((item, index) => {
    nextId += 1
    return {
      ...item,
      id: nextId,
      unread: item.unread === null ? index < 2 : item.unread,
    }
  })

  return [...finalizedGenerated, ...keptMessages]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
}

export function createDefaultAppData() {
  const data = cloneData(DEFAULT_APP_DATA)
  data.messages = syncMessagesFromTaxMonths(data.messages, data.taxMonths)
  return data
}

export function createEmptyTaxRecord(period = '2026-10', seq = '001') {
  return {
    id: `${period}-${seq}`,
    incomeType: '工资薪金',
    incomeSubtype: '正常工资薪金',
    withholdingAgent: '示例科技有限公司',
    withholdingAgentTaxId: '91000000000000000X',
    taxAuthority: '国家税务总局示例市税务局',
    declarationChannel: '其他',
    declarationDate: `${period}-15`,
    income: '0.00',
    reportedTax: '0.00',
    expense: '0.00',
    taxExemptIncome: '0.00',
    basicDeduction: '5000.00',
    specialDeduction: '0.00',
    specialAdditionalDeduction: '0.00',
    specialAdditionalDeductionName: '住房租金',
    personalPension: '0.00',
    otherDeduction: '0.00',
    donationDeduction: '0.00',
    taxableIncome: '0.00',
    taxRate: '3%',
    quickDeduction: '0.00',
    taxDue: '0.00',
    taxRelief: '0.00',
    taxPaid: '0.00',
  }
}

export function normalizeMoney(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0.00'
  return num.toFixed(2)
}

export function validateAppData(data) {
  const errors = []
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['数据格式必须为 JSON 对象'] }
  }

  if (!data.profile || !String(data.profile.name || '').trim()) {
    errors.push('个人信息中缺少姓名')
  }

  if (!Array.isArray(data.taxMonths)) {
    errors.push('taxMonths 必须是数组')
  } else {
    const seenIds = new Set()
    data.taxMonths.forEach((month, monthIdx) => {
      if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month.period || ''))) {
        errors.push(`第 ${monthIdx + 1} 个月份的 period 必须为 YYYY-MM 格式`)
      }
      if (!Array.isArray(month?.records)) {
        errors.push(`月份 ${month?.period || monthIdx + 1} 的 records 必须是数组`)
        return
      }
      month.records.forEach((record, recIdx) => {
        const id = String(record?.id || '').trim()
        if (!id) {
          errors.push(`月份 ${month.period} 第 ${recIdx + 1} 条明细缺少唯一 id`)
        } else if (seenIds.has(id)) {
          errors.push(`存在重复的明细 id：${id}`)
        } else {
          seenIds.add(id)
        }
        if (!allIncomeTypes.includes(record?.incomeType)) {
          errors.push(`明细 ${id || recIdx + 1} 的所得类型「${record?.incomeType || ''}」不在可选范围内`)
        }
        for (const field of MONEY_FIELDS) {
          if (record?.[field] !== undefined && !Number.isFinite(Number(record[field]))) {
            errors.push(`明细 ${id || recIdx + 1} 的金额字段 ${field} 不是有效数字`)
            break
          }
        }
      })
    })
  }

  if (!Array.isArray(data.messages)) {
    errors.push('messages 必须是数组')
  }

  return { valid: errors.length === 0, errors }
}

export function normalizeAppData(raw) {
  const fallback = createDefaultAppData()
  if (!raw || typeof raw !== 'object') return fallback

  const profile = {
    name: String(raw.profile?.name ?? fallback.profile.name),
    taxpayerId: String(raw.profile?.taxpayerId ?? fallback.profile.taxpayerId),
    quickItems: Array.isArray(raw.profile?.quickItems) && raw.profile.quickItems.length > 0
      ? raw.profile.quickItems.map((item, index) => ({
          title: String(item.title ?? fallback.profile.quickItems[index]?.title ?? ''),
          value: String(item.value ?? ''),
          kind: String(item.kind ?? fallback.profile.quickItems[index]?.kind ?? 'family'),
          filled: Boolean(item.filled),
        }))
      : fallback.profile.quickItems,
  }

  const taxMonths = Array.isArray(raw.taxMonths)
    ? raw.taxMonths
        .filter((month) => month && /^\d{4}-(0[1-9]|1[0-2])$/.test(String(month.period || '')))
        .map((month) => ({
          period: String(month.period),
          records: Array.isArray(month.records)
            ? month.records.map((record, index) => {
                const base = createEmptyTaxRecord(String(month.period), String(index + 1).padStart(3, '0'))
                const normalized = { ...base, ...record, id: String(record?.id || base.id) }
                for (const field of MONEY_FIELDS) {
                  normalized[field] = normalizeMoney(normalized[field])
                }
                return normalized
              })
            : [],
        }))
        .sort((a, b) => b.period.localeCompare(a.period))
    : fallback.taxMonths

  const messages = Array.isArray(raw.messages)
    ? raw.messages.map((item, index) => ({
        id: item?.id ?? index + 1,
        kind: item?.kind === 'tax' ? 'tax' : 'notice',
        title: String(item?.title ?? ''),
        preview: String(item?.preview ?? ''),
        date: String(item?.date ?? ''),
        unread: Boolean(item?.unread),
      }))
    : fallback.messages

  const home = {
    notices: Array.isArray(raw.home?.notices) && raw.home.notices.length > 0
      ? raw.home.notices.map((text) => String(text)).filter((text) => text.trim().length > 0)
      : fallback.home.notices,
    policyTabs: Array.isArray(raw.home?.policyTabs) && raw.home.policyTabs.length > 0
      ? raw.home.policyTabs.map(String)
      : fallback.home.policyTabs,
    policyContent: Array.isArray(raw.home?.policyContent) && raw.home.policyContent.length > 0
      ? raw.home.policyContent.map((list) => Array.isArray(list) ? list.map(String) : [])
      : fallback.home.policyContent,
  }

  return {
    version: DATA_SCHEMA_VERSION,
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
    profile,
    taxMonths,
    messages,
    home,
  }
}

// 现行中国个人所得税预扣预缴计算引擎（依据《个人所得税法》及国家税务总局公告2018年第61号）
// 所有金额内部统一转为整数「分」计算，避免浮点误差。

// 居民个人工资、薪金所得预扣率表一（年度累计预扣法，7级超额累进）
export const WAGE_TAX_BRACKETS = [
  { maxCents: 3600000, rate: 0.03, rateText: '3%', quickCents: 0 },
  { maxCents: 14400000, rate: 0.10, rateText: '10%', quickCents: 252000 },
  { maxCents: 30000000, rate: 0.20, rateText: '20%', quickCents: 1692000 },
  { maxCents: 42000000, rate: 0.25, rateText: '25%', quickCents: 3192000 },
  { maxCents: 66000000, rate: 0.30, rateText: '30%', quickCents: 5292000 },
  { maxCents: 96000000, rate: 0.35, rateText: '35%', quickCents: 8592000 },
  { maxCents: Infinity, rate: 0.45, rateText: '45%', quickCents: 18192000 },
]

// 劳务报酬所得预扣率表二（单次预扣，3级超额累进）
export const LABOR_TAX_BRACKETS = [
  { maxCents: 2000000, rate: 0.20, rateText: '20%', quickCents: 0 },
  { maxCents: 5000000, rate: 0.30, rateText: '30%', quickCents: 200000 },
  { maxCents: Infinity, rate: 0.40, rateText: '40%', quickCents: 700000 },
]

export function toCents(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.round(num * 100)
}

export function fromCents(cents) {
  return (Math.round(cents) / 100).toFixed(2)
}

function findBracket(taxableCents, brackets) {
  return brackets.find((b) => taxableCents <= b.maxCents) || brackets[brackets.length - 1]
}

function calcLaborStyleExpenseCents(incomeCents) {
  if (incomeCents <= 0) return 0
  if (incomeCents <= 400000) {
    return Math.min(incomeCents, 80000)
  }
  return Math.round(incomeCents * 0.2)
}

function isContinuousLabor(record) {
  return record.incomeType === '劳务报酬' && String(record.incomeSubtype || '').includes('连续')
}

/**
 * 按现行个税政策重算全部月份明细：
 * - 工资薪金 / 连续劳务报酬：按「同一纳税年度 + 同一扣缴义务人」按月份升序执行累计预扣法
 * - 一般劳务报酬 / 稿酬 / 特许权使用费 / 其他分类所得：按单次预扣规则计算
 */
export function recalculateTaxMonths(taxMonths) {
  const cloned = JSON.parse(JSON.stringify(taxMonths || []))
  // 按月份升序计算累计预扣
  const ascMonths = [...cloned].sort((a, b) => String(a.period).localeCompare(String(b.period)))

  // key: `${year}::${withholdingAgent}::${bucket}`
  const cumulativeMap = new Map()

  for (const month of ascMonths) {
    const year = String(month.period || '').slice(0, 4)
    if (!Array.isArray(month.records)) continue

    for (const rec of month.records) {
      const incomeCents = Math.max(0, toCents(rec.income))
      const taxExemptCents = Math.max(0, toCents(rec.taxExemptIncome))
      const specialCents = Math.max(0, toCents(rec.specialDeduction))
      const specialAddCents = Math.max(0, toCents(rec.specialAdditionalDeduction))
      const pensionCents = Math.max(0, toCents(rec.personalPension))
      const otherCents = Math.max(0, toCents(rec.otherDeduction))
      const donationCents = Math.max(0, toCents(rec.donationDeduction))
      const reliefCents = Math.max(0, toCents(rec.taxRelief))

      if (rec.incomeType === '工资薪金' || isContinuousLabor(rec)) {
        const isWage = rec.incomeType === '工资薪金'
        const basicCents = Math.max(0, toCents(rec.basicDeduction ?? '5000.00'))
        const expenseCents = isWage ? 0 : Math.round(incomeCents * 0.2)
        rec.expense = fromCents(expenseCents)
        rec.basicDeduction = fromCents(basicCents)

        const agentKey = `${year}::${String(rec.withholdingAgentTaxId || rec.withholdingAgent || '')}::${isWage ? 'wage' : 'continuous-labor'}`
        const acc = cumulativeMap.get(agentKey) || {
          incomeCents: 0,
          expenseCents: 0,
          taxExemptCents: 0,
          basicCents: 0,
          specialCents: 0,
          specialAddCents: 0,
          pensionCents: 0,
          otherCents: 0,
          donationCents: 0,
          reliefCents: 0,
          paidCents: 0,
        }

        acc.incomeCents += incomeCents
        acc.expenseCents += expenseCents
        acc.taxExemptCents += taxExemptCents
        acc.basicCents += basicCents
        acc.specialCents += specialCents
        acc.specialAddCents += specialAddCents
        acc.pensionCents += pensionCents
        acc.otherCents += otherCents
        acc.donationCents += donationCents
        acc.reliefCents += reliefCents

        const taxableCents = Math.max(
          0,
          acc.incomeCents
            - acc.expenseCents
            - acc.taxExemptCents
            - acc.basicCents
            - acc.specialCents
            - acc.specialAddCents
            - acc.pensionCents
            - acc.otherCents
            - acc.donationCents,
        )
        const bracket = findBracket(taxableCents, WAGE_TAX_BRACKETS)
        const taxDueCents = Math.max(0, Math.round(taxableCents * bracket.rate) - bracket.quickCents)
        const taxPaidBeforeCents = acc.paidCents
        const currentReportedCents = Math.max(0, taxDueCents - acc.reliefCents - taxPaidBeforeCents)

        acc.paidCents += currentReportedCents
        cumulativeMap.set(agentKey, acc)

        rec.taxableIncome = fromCents(taxableCents)
        rec.taxRate = bracket.rateText
        rec.quickDeduction = fromCents(bracket.quickCents)
        rec.taxDue = fromCents(taxDueCents)
        rec.taxPaid = fromCents(taxPaidBeforeCents)
        rec.reportedTax = fromCents(currentReportedCents)
      } else if (rec.incomeType === '劳务报酬') {
        const expenseCents = calcLaborStyleExpenseCents(incomeCents)
        const taxableCents = Math.max(0, incomeCents - expenseCents - taxExemptCents - otherCents - donationCents)
        const bracket = findBracket(taxableCents, LABOR_TAX_BRACKETS)
        const taxDueCents = Math.max(0, Math.round(taxableCents * bracket.rate) - bracket.quickCents)
        const reportedCents = Math.max(0, taxDueCents - reliefCents)

        rec.expense = fromCents(expenseCents)
        rec.basicDeduction = '0.00'
        rec.taxableIncome = fromCents(taxableCents)
        rec.taxRate = bracket.rateText
        rec.quickDeduction = fromCents(bracket.quickCents)
        rec.taxDue = fromCents(taxDueCents)
        rec.taxPaid = '0.00'
        rec.reportedTax = fromCents(reportedCents)
      } else if (rec.incomeType === '稿酬') {
        const expenseCents = calcLaborStyleExpenseCents(incomeCents)
        // 稿酬所得收入额减按 70% 计算
        const baseCents = Math.max(0, incomeCents - expenseCents)
        const taxableCents = Math.max(0, Math.round(baseCents * 0.7) - taxExemptCents - otherCents - donationCents)
        const taxDueCents = Math.round(taxableCents * 0.2)
        const reportedCents = Math.max(0, taxDueCents - reliefCents)

        rec.expense = fromCents(expenseCents)
        rec.basicDeduction = '0.00'
        rec.taxableIncome = fromCents(taxableCents)
        rec.taxRate = '20%'
        rec.quickDeduction = '0.00'
        rec.taxDue = fromCents(taxDueCents)
        rec.taxPaid = '0.00'
        rec.reportedTax = fromCents(reportedCents)
      } else if (rec.incomeType === '特许权使用费') {
        const expenseCents = calcLaborStyleExpenseCents(incomeCents)
        const taxableCents = Math.max(0, incomeCents - expenseCents - taxExemptCents - otherCents - donationCents)
        const taxDueCents = Math.round(taxableCents * 0.2)
        const reportedCents = Math.max(0, taxDueCents - reliefCents)

        rec.expense = fromCents(expenseCents)
        rec.basicDeduction = '0.00'
        rec.taxableIncome = fromCents(taxableCents)
        rec.taxRate = '20%'
        rec.quickDeduction = '0.00'
        rec.taxDue = fromCents(taxDueCents)
        rec.taxPaid = '0.00'
        rec.reportedTax = fromCents(reportedCents)
      } else {
        // 利息股息红利 / 偶然所得 / 财产租赁 / 财产转让等按 20% 比例税率估算
        const expenseCents = Math.max(0, toCents(rec.expense))
        const taxableCents = Math.max(0, incomeCents - expenseCents - taxExemptCents - otherCents - donationCents)
        const taxDueCents = Math.round(taxableCents * 0.2)
        const reportedCents = Math.max(0, taxDueCents - reliefCents)

        rec.basicDeduction = '0.00'
        rec.taxableIncome = fromCents(taxableCents)
        rec.taxRate = '20%'
        rec.quickDeduction = '0.00'
        rec.taxDue = fromCents(taxDueCents)
        rec.taxPaid = '0.00'
        rec.reportedTax = fromCents(reportedCents)
      }
    }
  }

  // 返回按月份降序排列（符合列表展示顺序）
  return ascMonths.sort((a, b) => String(b.period).localeCompare(String(a.period)))
}

/**
 * 获取指定明细对应的「税款计算-累计收入与扣除详情」与「税款计算」实时累计结果
 * - 工资薪金 / 连续劳务报酬：按同纳税年度、同扣缴义务人从年初至本月实时累计所有收入、扣除与前期已缴税额，
 *   并按现行 7 级累计预扣率表实时计算出应纳税所得额、预扣率、速算扣除数、累计应纳税额与本期申报税额。
 * - 其他单次预扣所得：按当期单次预扣规则实时计算。
 */
export function getTaxCalculationBreakdown(taxMonths, recordId) {
  const ascMonths = [...(taxMonths || [])].sort((a, b) => String(a.period).localeCompare(String(b.period)))
  const cumulativeMap = new Map()

  for (const month of ascMonths) {
    const year = String(month.period || '').slice(0, 4)
    if (!Array.isArray(month.records)) continue

    for (const rec of month.records) {
      const incomeCents = Math.max(0, toCents(rec.income))
      const taxExemptCents = Math.max(0, toCents(rec.taxExemptIncome))
      const specialCents = Math.max(0, toCents(rec.specialDeduction))
      const specialAddCents = Math.max(0, toCents(rec.specialAdditionalDeduction))
      const pensionCents = Math.max(0, toCents(rec.personalPension))
      const otherCents = Math.max(0, toCents(rec.otherDeduction))
      const donationCents = Math.max(0, toCents(rec.donationDeduction))
      const reliefCents = Math.max(0, toCents(rec.taxRelief))

      const isCumulative = rec.incomeType === '工资薪金' || isContinuousLabor(rec)
      if (isCumulative) {
        const isWage = rec.incomeType === '工资薪金'
        const basicCents = Math.max(0, toCents(rec.basicDeduction ?? '5000.00'))
        const expenseCents = isWage ? 0 : Math.round(incomeCents * 0.2)
        const agentKey = `${year}::${String(rec.withholdingAgentTaxId || rec.withholdingAgent || '').trim()}::${isWage ? 'wage' : 'continuous-labor'}`
        const acc = cumulativeMap.get(agentKey) || {
          incomeCents: 0,
          expenseCents: 0,
          taxExemptCents: 0,
          basicCents: 0,
          specialCents: 0,
          specialAddCents: 0,
          specialAddItems: new Map(),
          pensionCents: 0,
          otherCents: 0,
          donationCents: 0,
          reliefCents: 0,
          paidCents: 0,
        }

        acc.incomeCents += incomeCents
        acc.expenseCents += expenseCents
        acc.taxExemptCents += taxExemptCents
        acc.basicCents += basicCents
        acc.specialCents += specialCents
        acc.specialAddCents += specialAddCents
        if (specialAddCents > 0) {
          const itemName = String(rec.specialAdditionalDeductionName || '住房租金').trim() || '住房租金'
          acc.specialAddItems.set(itemName, (acc.specialAddItems.get(itemName) || 0) + specialAddCents)
        }
        acc.pensionCents += pensionCents
        acc.otherCents += otherCents
        acc.donationCents += donationCents
        acc.reliefCents += reliefCents

        const taxableCents = Math.max(
          0,
          acc.incomeCents
            - acc.expenseCents
            - acc.taxExemptCents
            - acc.basicCents
            - acc.specialCents
            - acc.specialAddCents
            - acc.pensionCents
            - acc.otherCents
            - acc.donationCents,
        )
        const bracket = findBracket(taxableCents, WAGE_TAX_BRACKETS)
        const taxDueCents = Math.max(0, Math.round(taxableCents * bracket.rate) - bracket.quickCents)
        const taxPaidBeforeCents = acc.paidCents
        const currentReportedCents = Math.max(0, taxDueCents - acc.reliefCents - taxPaidBeforeCents)

        acc.paidCents += currentReportedCents
        cumulativeMap.set(agentKey, acc)

        if (rec.id === recordId) {
          return {
            record: { ...rec, period: month.period },
            isCumulative: true,
            specialAdditionalItems: Array.from(acc.specialAddItems.entries()).map(([name, cents]) => ({
              name,
              amount: fromCents(cents),
            })),
            cumulative: {
              income: fromCents(acc.incomeCents),
              expense: fromCents(acc.expenseCents),
              taxExemptIncome: fromCents(acc.taxExemptCents),
              basicDeduction: fromCents(acc.basicCents),
              specialDeduction: fromCents(acc.specialCents),
              specialAdditionalDeduction: fromCents(acc.specialAddCents),
              personalPension: fromCents(acc.pensionCents),
              otherDeduction: fromCents(acc.otherCents),
              donationDeduction: fromCents(acc.donationCents),
              taxRelief: fromCents(acc.reliefCents),
            },
            calculated: {
              taxableIncome: fromCents(taxableCents),
              taxRate: bracket.rateText,
              quickDeduction: fromCents(bracket.quickCents),
              taxDue: fromCents(taxDueCents),
              taxPaid: fromCents(taxPaidBeforeCents),
              taxRelief: fromCents(acc.reliefCents),
              reportedTax: fromCents(currentReportedCents),
            },
          }
        }
      } else if (rec.id === recordId) {
        let expenseCents = Math.max(0, toCents(rec.expense))
        let taxableCents = 0
        let rateText = '20%'
        let quickCents = 0
        let taxDueCents = 0

        if (rec.incomeType === '劳务报酬') {
          expenseCents = calcLaborStyleExpenseCents(incomeCents)
          taxableCents = Math.max(0, incomeCents - expenseCents - taxExemptCents - otherCents - donationCents)
          const bracket = findBracket(taxableCents, LABOR_TAX_BRACKETS)
          rateText = bracket.rateText
          quickCents = bracket.quickCents
          taxDueCents = Math.max(0, Math.round(taxableCents * bracket.rate) - quickCents)
        } else if (rec.incomeType === '稿酬') {
          expenseCents = calcLaborStyleExpenseCents(incomeCents)
          taxableCents = Math.max(0, Math.round(Math.max(0, incomeCents - expenseCents) * 0.7) - taxExemptCents - otherCents - donationCents)
          taxDueCents = Math.round(taxableCents * 0.2)
        } else if (rec.incomeType === '特许权使用费') {
          expenseCents = calcLaborStyleExpenseCents(incomeCents)
          taxableCents = Math.max(0, incomeCents - expenseCents - taxExemptCents - otherCents - donationCents)
          taxDueCents = Math.round(taxableCents * 0.2)
        } else {
          taxableCents = Math.max(0, incomeCents - expenseCents - taxExemptCents - otherCents - donationCents)
          taxDueCents = Math.round(taxableCents * 0.2)
        }
        const reportedCents = Math.max(0, taxDueCents - reliefCents)

        return {
          record: { ...rec, period: month.period },
          isCumulative: false,
          specialAdditionalItems: specialAddCents > 0
            ? [{ name: String(rec.specialAdditionalDeductionName || '住房租金').trim() || '住房租金', amount: fromCents(specialAddCents) }]
            : [],
          cumulative: {
            income: fromCents(incomeCents),
            expense: fromCents(expenseCents),
            taxExemptIncome: fromCents(taxExemptCents),
            basicDeduction: '0.00',
            specialDeduction: fromCents(specialCents),
            specialAdditionalDeduction: fromCents(specialAddCents),
            personalPension: fromCents(pensionCents),
            otherDeduction: fromCents(otherCents),
            donationDeduction: fromCents(donationCents),
            taxRelief: fromCents(reliefCents),
          },
          calculated: {
            taxableIncome: fromCents(taxableCents),
            taxRate: rateText,
            quickDeduction: fromCents(quickCents),
            taxDue: fromCents(taxDueCents),
            taxPaid: '0.00',
            taxRelief: fromCents(reliefCents),
            reportedTax: fromCents(reportedCents),
          },
        }
      }
    }
  }
  return null
}

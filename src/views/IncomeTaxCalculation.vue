<template>
  <main class="tax-calc-page">
    <TaxPageHeader title="税款计算" sticky />

    <template v-if="breakdown">
      <aside class="calc-tip-banner" aria-label="温馨提示">
        温馨提示：税款计算采用累计计税方式，累计收入与扣除详情数据已包括本期数据。此处数据为扣缴单位为您申报的数据，如有异议，请联系您的单位处理。
      </aside>

      <section class="detail-section">
        <h2><i aria-hidden="true"></i>{{ breakdown.isCumulative ? '累计收入与扣除详情' : '收入与扣除详情' }}</h2>
        <div class="detail-body">
          <div v-for="(item, index) in topDeductionRows" :key="`top-${index}`" class="detail-row">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>

          <button
            v-if="hasSpecialAdditional"
            class="detail-row expandable-row"
            type="button"
            :aria-expanded="specialAddExpanded"
            @click="specialAddExpanded = !specialAddExpanded"
          >
            <span>{{ prefix }}专项附加扣除：</span>
            <strong class="expandable-value">
              <span>{{ breakdown.cumulative.specialAdditionalDeduction }}元</span>
              <i class="triangle-icon" :class="{ collapsed: !specialAddExpanded }" aria-hidden="true"></i>
            </strong>
          </button>
          <div v-else class="detail-row">
            <span>{{ prefix }}专项附加扣除：</span>
            <strong>{{ breakdown.cumulative.specialAdditionalDeduction }}元</strong>
          </div>

          <template v-if="hasSpecialAdditional && specialAddExpanded">
            <div v-for="sub in breakdown.specialAdditionalItems" :key="sub.name" class="sub-deduction-row">
              <span>{{ sub.name }}：</span>
              <strong>{{ sub.amount }} 元</strong>
            </div>
          </template>

          <div v-for="(item, index) in bottomDeductionRows" :key="`bot-${index}`" class="detail-row">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <div class="detail-summary">
          <span>{{ prefix }}应纳税所得额：</span>
          <strong>{{ breakdown.calculated.taxableIncome }}元</strong>
        </div>
      </section>

      <section class="detail-section">
        <h2><i aria-hidden="true"></i>税款计算</h2>
        <div class="detail-body">
          <div v-for="(item, index) in calculationRows" :key="`calc-${index}`" class="detail-row">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <div class="detail-summary">
          <span>本期申报税额：</span>
          <strong>{{ breakdown.calculated.reportedTax }}元</strong>
        </div>
      </section>

      <div class="policy-link">
        <button type="button">查看政策说明</button>
      </div>
    </template>
    <p v-else class="missing-record">未找到对应的税款计算信息，请返回重试。</p>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import TaxPageHeader from '../components/TaxPageHeader.vue'
import { taxMonths } from '../state/appStore'
import { getTaxCalculationBreakdown } from '../utils/taxCalculator'

const route = useRoute()
const breakdown = computed(() => getTaxCalculationBreakdown(taxMonths.value, String(route.query.id || '')))
const specialAddExpanded = ref(true)

const prefix = computed(() => (breakdown.value?.isCumulative ? '累计' : ''))
const hasSpecialAdditional = computed(() => Number(breakdown.value?.cumulative.specialAdditionalDeduction || 0) > 0)

function formatRate(rateText) {
  const str = String(rateText || '0%')
  return str.replace(/\.00%$/, '%')
}

const topDeductionRows = computed(() => {
  const data = breakdown.value
  if (!data) return []
  const p = prefix.value
  const c = data.cumulative
  const rows = [
    { label: `${p}收入：`, value: `${c.income}元` },
    { label: `${p}免税收入：`, value: `${c.taxExemptIncome}元` },
    { label: `${p}减除费用：`, value: `${c.basicDeduction}元` },
    { label: `${p}专项扣除：`, value: `${c.specialDeduction}元` },
  ]
  if (data.record.incomeType !== '工资薪金') {
    rows.splice(1, 0, { label: `${p}费用：`, value: `${c.expense}元` })
  }
  return rows
})

const bottomDeductionRows = computed(() => {
  const data = breakdown.value
  if (!data) return []
  const p = prefix.value
  const c = data.cumulative
  return [
    { label: `${p}其他扣除：`, value: `${c.otherDeduction}元` },
    { label: `${p}个人养老金：`, value: `${c.personalPension}元` },
    { label: `${p}准予扣除的捐赠额：`, value: `${c.donationDeduction}元` },
  ]
})

const calculationRows = computed(() => {
  const data = breakdown.value
  if (!data) return []
  const calc = data.calculated
  const p = prefix.value
  return [
    { label: `${p}应纳税所得额：`, value: `${calc.taxableIncome}元` },
    { label: '税率/预扣率：', value: formatRate(calc.taxRate) },
    { label: '速算扣除数：', value: `${calc.quickDeduction}元` },
    { label: `${p}应纳税额：`, value: `${calc.taxDue}元` },
    { label: `${p}已缴税额：`, value: `${calc.taxPaid}元` },
    { label: `${p}减免税额：`, value: `${calc.taxRelief}元` },
  ]
})
</script>

<style scoped>
.tax-calc-page {
  container-type: inline-size;
  min-height: 100vh;
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
  background: #f5f6fa;
  color: #282a2e;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-synthesis: none;
}
.missing-record { padding: 48px 16px; color: #8d9299; text-align: center; font-size: 3.82cqw; }
.calc-tip-banner {
  padding: 3.4cqw 4.2cqw;
  background: #ebf3fe;
  color: #30343a;
  font-size: 3.51cqw;
  line-height: 1.65;
  text-align: justify;
}
.detail-section { margin-top: 3cqw; background: #fff; }
.detail-section h2 {
  height: 13.7cqw;
  display: flex;
  align-items: center;
  gap: 2.5cqw;
  padding: 0 4.3cqw;
  border-bottom: 1px solid #eceef1;
  color: #24262a;
  font-size: 4.2cqw;
  font-weight: 600;
}
.detail-section h2 i { width: 1.02cqw; height: 4.4cqw; flex: none; border-radius: .76cqw; background: #3d91ef; }
.detail-body { padding: 2cqw 0 3cqw; }
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3cqw;
  min-height: 10cqw;
  padding: 1cqw 4.3cqw;
  font-size: 3.95cqw;
  line-height: 1.45;
}
.detail-row span {
  color: #a0a2a7;
  text-align: left;
  white-space: nowrap;
}
.detail-row strong {
  color: #292b2f;
  font-weight: 400;
  text-align: right;
  white-space: nowrap;
}
.expandable-row {
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.expandable-value {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5cqw;
}
.expandable-value span {
  color: #292b2f;
}
.triangle-icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 1.25cqw solid transparent;
  border-right: 1.25cqw solid transparent;
  border-bottom: 1.5cqw solid #30343a;
  transition: transform .18s ease;
}
.triangle-icon.collapsed {
  transform: rotate(180deg);
}
.sub-deduction-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 11.7cqw;
  margin: 1cqw 0 1.5cqw;
  padding: 0 7.6cqw;
  background: #f7f8fa;
  font-size: 3.82cqw;
}
.sub-deduction-row span { color: #8c9096; }
.sub-deduction-row strong { color: #292b2f; font-weight: 400; }
.detail-summary {
  min-height: 13.7cqw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4.3cqw;
  border-top: 1px solid #eceef1;
  color: #24262a;
  font-size: 3.95cqw;
}
.detail-summary strong { font-weight: 400; }
.policy-link {
  display: flex;
  justify-content: center;
  padding: 7cqw 0 6cqw;
}
.policy-link button {
  height: 10.2cqw;
  padding: 0 5cqw;
  border: 0;
  background: transparent;
  color: #318be9;
  font-size: 3.95cqw;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>

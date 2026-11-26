<template>
  <main class="record-detail-page">
    <TaxPageHeader title="收入纳税明细详情" action-text="申诉" sticky />

    <template v-if="record">
      <section class="detail-section">
        <h2><i aria-hidden="true"></i>纳税明细信息</h2>
        <div class="detail-body">
          <div class="detail-row">
            <span>收入：</span>
            <strong>{{ record.income }}元</strong>
          </div>
          <div class="detail-row">
            <span>已申报税额：</span>
            <strong>{{ record.reportedTax }}元</strong>
          </div>
          <div class="calc-entry-row">
            <button class="calc-link-btn" type="button" @click="openTaxCalculation">
              <span class="calc-link-text">查看税款计算</span>
              <i class="calc-chevron" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h2><i aria-hidden="true"></i>纳税明细-基础情况</h2>
        <div class="detail-body">
          <div v-for="(item, index) in basicRows" :key="`${item.label}-${index}`" class="detail-row">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </section>

      <aside class="warm-tip-banner" aria-label="温馨提示">
        温馨提示：专项附加扣除和个人养老金已体现在税款计算过程中，在本期数据中不予显示。您可在"税款计算-累计收入与扣除详情"中查看。
        <button class="tip-calc-link" type="button" @click="openTaxCalculation">查看税款计算</button>
      </aside>

      <section class="detail-section">
        <h2><i aria-hidden="true"></i>本期收入与扣除详情</h2>
        <div class="detail-body">
          <div v-for="(item, index) in currentPeriodRows" :key="`${item.label}-${index}`" class="detail-row">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </section>
    </template>
    <p v-else class="missing-record">未找到该纳税明细，请返回列表重新选择。</p>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaxPageHeader from '../components/TaxPageHeader.vue'
import { getTaxRecordById } from '../data/taxRecords'

const route = useRoute()
const router = useRouter()
const record = computed(() => getTaxRecordById(String(route.query.id || '')))

const basicRows = computed(() => {
  const item = record.value
  if (!item) return []
  return [
    { label: '所得项目小类：', value: item.incomeSubtype },
    { label: '扣缴义务人名称：', value: item.withholdingAgent },
    { label: '扣缴义务人纳税人识别号：', value: item.withholdingAgentTaxId },
    { label: '主管税务机关：', value: item.taxAuthority },
    { label: '申报渠道：', value: item.declarationChannel },
    { label: '申报日期：', value: item.declarationDate },
    { label: '税款所属期：', value: item.period },
  ]
})

const currentPeriodRows = computed(() => {
  const item = record.value
  if (!item) return []
  return [
    { label: '本期收入：', value: `${item.income}元` },
    { label: '本期免税收入：', value: `${item.taxExemptIncome}元` },
    { label: '本期减除费用：', value: `${item.basicDeduction}元` },
    { label: '本期专项扣除：', value: `${item.specialDeduction}元` },
    { label: '本期其他扣除：', value: `${item.otherDeduction}元` },
    { label: '本期准予扣除的捐赠项目：', value: `${item.donationDeduction}元` },
  ]
})

function openTaxCalculation() {
  if (!record.value) return
  router.push({
    name: 'income-tax-calculation',
    query: { id: record.value.id },
  })
}
</script>

<style scoped>
.record-detail-page {
  container-type: inline-size;
  min-height: 100vh;
  padding-bottom: calc(36px + env(safe-area-inset-bottom));
  background: #f5f6fa;
  color: #282a2e;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-synthesis: none;
}
.missing-record { padding: 48px 16px; color: #8d9299; text-align: center; font-size: 3.82cqw; }
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
.detail-body { padding: 2.3cqw 4.3cqw 3.4cqw; }
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3cqw;
  min-height: 9.9cqw;
  padding: 1.8cqw 0;
  font-size: 3.95cqw;
  line-height: 1.48;
}
.detail-row span {
  flex: 0 1 42%;
  min-width: 0;
  color: #a0a2a7;
}
.detail-row strong {
  flex: 1 1 55%;
  min-width: 0;
  color: #292b2f;
  font-weight: 400;
  text-align: right;
  overflow-wrap: anywhere;
}
.calc-entry-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.6cqw;
}
.calc-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 1.2cqw;
  padding: 1cqw 0;
  border: 0;
  background: transparent;
  color: #318be9;
  font-size: 3.95cqw;
  line-height: 1.3;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.calc-link-text {
  text-decoration: none;
}
.calc-chevron {
  width: 2.2cqw;
  height: 2.2cqw;
  border-top: 1.5px solid currentColor;
  border-right: 1.5px solid currentColor;
  transform: rotate(45deg);
}
.warm-tip-banner {
  margin-top: 3cqw;
  padding: 3.4cqw 4.2cqw;
  background: #ebf3fe;
  color: #30343a;
  font-size: 3.51cqw;
  line-height: 1.65;
  text-align: justify;
}
.tip-calc-link {
  display: inline;
  margin-left: .8cqw;
  padding: 0;
  border: 0;
  background: transparent;
  color: #318be9;
  font-size: 3.51cqw;
  line-height: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>

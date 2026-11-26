<template>
  <main class="income-results-page">
    <TaxPageHeader title="收入纳税明细" action-text="批量申诉" compact />

    <section class="summary" aria-label="收入汇总">
      <div class="summary-row">
        <span>收入合计 <i aria-label="收入合计说明"><b aria-hidden="true">?</b></i>：</span>
        <strong>{{ totalIncome }}元</strong>
      </div>
      <div class="summary-row">
        <span>已申报税额合计：</span>
        <strong>{{ totalReportedTax }}元</strong>
      </div>
    </section>

    <section class="records" aria-label="收入明细列表">
      <article
        v-for="record in records"
        :key="record.id"
        class="record-card"
        role="button"
        tabindex="0"
        :aria-label="`${record.period} ${record.incomeType}，收入${record.income}元`"
        @click="openRecord(record)"
        @keydown.enter.prevent="openRecord(record)"
        @keydown.space.prevent="openRecord(record)"
      >
        <div class="record-title">
          <h2>{{ record.incomeType }}</h2>
          <time :datetime="record.period">{{ record.period }}</time>
        </div>
        <p>所得项目小类：{{ record.incomeSubtype }}</p>
        <p>扣缴义务人：{{ record.withholdingAgent }}</p>
        <p>收入：{{ record.income }}元</p>
        <p>已申报税额：{{ record.reportedTax }}元</p>
        <i class="record-chevron" aria-hidden="true"></i>
      </article>
      <p v-if="records.length === 0" class="empty-records">该年度暂无符合条件的纳税明细</p>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaxPageHeader from '../components/TaxPageHeader.vue'
import { getLatestTaxYear, getTaxRecordsByYear, sumMoney } from '../data/taxRecords'

const route = useRoute()
const router = useRouter()
const selectedYear = computed(() => {
  const year = String(route.query.year || new Date().getFullYear())
  const latestYear = getLatestTaxYear()
  return /^\d{4}$/.test(year) && Number(year) >= 2019 && Number(year) <= latestYear
    ? year
    : String(latestYear)
})
const selectedTypes = computed(() => {
  const types = route.query.types
  return Array.isArray(types) ? types.map(String) : types ? [String(types)] : []
})
const records = computed(() => getTaxRecordsByYear(selectedYear.value, selectedTypes.value))
const totalIncome = computed(() => sumMoney(records.value, 'income'))
const totalReportedTax = computed(() => sumMoney(records.value, 'reportedTax'))

function openRecord(record) {
  router.push({
    name: 'income-tax-record-detail',
    query: { id: record.id },
  })
}
</script>

<style scoped>
.income-results-page { min-height: 100vh; background: #f5f6fa; color: #292b2f; font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif; font-synthesis: none; }
.summary { margin-top: 12px; padding: 8px 16px 13px; background: #fff; }
.summary-row { min-height: 43px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ececee; font-size: 17px; }
.summary-row:last-child { border-bottom: 0; }
.summary-row strong { font-size: 17px; font-weight: 500; }
.summary-row i { display: inline-grid; width: 16px; height: 16px; place-items: center; border: 1px solid #3c91ed; border-radius: 50%; color: #3c91ed; font-size: 12px; font-style: normal; vertical-align: 1px; }
.summary-row i b { display: block; font-family: Arial, sans-serif; font-weight: 400; line-height: 1; transform: translateY(-1px); }
.records { margin-top: 12px; }
.empty-records { padding: 48px 16px; color: #8d9299; text-align: center; font-size: 15px; }
.record-card { position: relative; min-height: 158px; margin-bottom: 12px; padding: 19px 16px 17px; background: #fff; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.record-card:focus-visible { outline: 2px solid #3c91ed; outline-offset: -2px; }
.record-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-right: 34px; }
.record-title h2, .record-title time { color: #292b2f; font-size: 18px; line-height: 1.3; font-weight: 400; }
.record-card p { margin-top: 7px; padding-right: 34px; overflow: hidden; text-overflow: ellipsis; color: #a1a3a8; font-size: 15px; line-height: 1.35; white-space: nowrap; }
.record-chevron { position: absolute; right: 16px; top: 50%; width: 12px; height: 12px; border-top: 2px solid #d0d2d5; border-right: 2px solid #d0d2d5; transform: translateY(-50%) rotate(45deg); }
@media (max-width: 350px) { .record-card p { font-size: 13px; } }
</style>

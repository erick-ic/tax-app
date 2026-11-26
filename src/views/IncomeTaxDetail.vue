<template>
  <main class="income-detail-page">
    <TaxPageHeader title="收入纳税明细" shadow />

    <section class="form-section">
      <h2><span aria-hidden="true"></span>请选择纳税年度</h2>
      <button class="year-row" type="button" :aria-label="`选择纳税年度，当前为${selectedYear}年`" @click="openYearPicker">
        <span>年度</span>
        <strong>{{ selectedYear }}</strong>
        <i aria-hidden="true"></i>
      </button>
    </section>

    <section class="form-section income-types">
      <h2><span aria-hidden="true"></span>请选择所得类型</h2>
      <label v-for="item in primaryTypes" :key="item" class="type-row">
        <input v-model="selectedTypes" type="checkbox" :value="item" />
        <span class="checkmark" aria-hidden="true"></span>
        <span>{{ item }}</span>
      </label>
      <button v-if="!otherOpen" class="other-types" type="button" @click="otherOpen = true">
        <span>其他类型</span>
        <svg class="double-chevron" viewBox="0 0 20 19" aria-hidden="true">
          <path d="M2 1.5 10 9l8-7.5" />
          <path d="M2 9.5 10 17l8-7.5" />
        </svg>
      </button>
      <div v-if="otherOpen" class="other-list">
        <label v-for="item in otherTypes" :key="item" class="type-row">
          <input v-model="selectedTypes" type="checkbox" :value="item" />
          <span class="checkmark" aria-hidden="true"></span>
          <span>{{ item }}</span>
        </label>
        <button class="other-types collapse-types" type="button" @click="otherOpen = false">
          <span>收起</span>
          <svg class="double-chevron" viewBox="0 0 20 19" aria-hidden="true">
            <path d="M2 9.5 10 2l8 7.5" />
            <path d="M2 17.5 10 10l8 7.5" />
          </svg>
        </button>
      </div>
    </section>

    <div class="query-area">
      <button type="button" @click="queryIncome">查询</button>
    </div>

    <van-popup v-model:show="yearPickerVisible" class="year-popup" position="bottom" round>
      <van-picker
        v-model="pendingYear"
        :columns="yearColumns"
        :visible-option-num="5"
        cancel-button-text="取消"
        confirm-button-text="确定"
        @cancel="yearPickerVisible = false"
        @confirm="confirmYear"
      />
    </van-popup>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import TaxPageHeader from '../components/TaxPageHeader.vue'
import { getLatestTaxYear, otherIncomeTypes, primaryIncomeTypes } from '../data/taxRecords'

const router = useRouter()
const primaryTypes = primaryIncomeTypes
const otherTypes = otherIncomeTypes
const selectedTypes = ref([...primaryTypes])
const otherOpen = ref(false)
const latestYear = getLatestTaxYear()
const yearColumns = Array.from({ length: latestYear - 2018 }, (_, index) => {
  const year = String(2019 + index)
  return { text: year, value: year }
})
const selectedYear = ref(String(latestYear))
const pendingYear = ref([selectedYear.value])
const yearPickerVisible = ref(false)

function openYearPicker() {
  pendingYear.value = [selectedYear.value]
  yearPickerVisible.value = true
}

function confirmYear({ selectedValues }) {
  selectedYear.value = selectedValues[0]
  yearPickerVisible.value = false
}

function queryIncome() {
  if (selectedTypes.value.length === 0) {
    showToast('请至少选择一种所得类型')
    return
  }
  router.push({ name: 'income-tax-results', query: { year: selectedYear.value, types: selectedTypes.value } })
}
</script>

<style scoped>
.income-detail-page { min-height: 100vh; background: #f5f6fa; color: #25282c; font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif; font-synthesis: none; }
.form-section { margin-top: 12px; background: #fff; }
.form-section h2 { height: 54px; display: flex; align-items: center; gap: 10px; padding: 0 17px; border-bottom: 1px solid #eceef1; font-size: 17px; font-weight: 600; }
.form-section h2 > span { width: 4px; height: 19px; border-radius: 3px; background: #3d91ef; }
.year-row { position: relative; width: 100%; height: 59px; display: grid; grid-template-columns: 1fr 1fr; align-items: center; padding: 0 18px; border: 0; background: #fff; text-align: left; color: #55585e; font-size: 17px; }
.year-row strong { color: #303236; font-size: 19px; font-weight: 400; }
.year-row i { position: absolute; right: 20px; width: 9px; height: 9px; border-top: 2px solid #d7d9dd; border-right: 2px solid #d7d9dd; transform: rotate(45deg); }
.income-types { margin-top: 13px; }
.type-row { position: relative; height: 63px; display: flex; align-items: center; gap: 20px; margin-left: 17px; padding-right: 17px; border-bottom: 1px solid #ededee; font-size: 18px; cursor: pointer; }
.type-row input { position: absolute; opacity: 0; pointer-events: none; }
.checkmark { position: relative; width: 28px; height: 28px; flex: none; border: 1px solid #d4d8dd; border-radius: 50%; background: #fff; }
.type-row input:checked + .checkmark { border-color: #3e91f2; background: #3e91f2; }
.type-row input:checked + .checkmark::after { content: ''; position: absolute; left: 8px; top: 5px; width: 8px; height: 13px; border-right: 1.8px solid #fff; border-bottom: 1.8px solid #fff; transform: rotate(45deg); }
.other-types { width: 100%; height: 61px; display: flex; align-items: center; justify-content: center; gap: 7px; border: 0; background: #fff; color: #318be9; font-size: 17px; }
.double-chevron { width: 20px; height: 19px; flex: none; overflow: visible; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.other-list { border-top: 1px solid #ededee; }
.other-list .type-row:last-of-type { border-bottom: 1px solid #ededee; }
.collapse-types { height: 61px; gap: 7px; }
.query-area { min-height: 300px; padding: 34px 20px; background: #f5f6fa; }
.query-area button { width: 100%; height: 50px; border: 0; border-radius: 4px; background: #3c87eb; color: #fff; font-size: 19px; letter-spacing: .05em; box-shadow: 0 2px 4px rgba(42, 123, 225, .14); }
:global(.year-popup) { overflow: hidden; }
:global(.year-popup .van-picker__toolbar) { height: 52px; border-bottom: 1px solid #e5e6e8; }
:global(.year-popup .van-picker__cancel), :global(.year-popup .van-picker__confirm) { padding: 0 18px; font-size: 17px; }
:global(.year-popup .van-picker__cancel) { color: #555861; }
:global(.year-popup .van-picker__confirm) { color: #3a8cf1; }
:global(.year-popup .van-picker-column__item) { font-size: 18px; }
:global(.year-popup .van-picker__columns) { padding-bottom: calc(42px + env(safe-area-inset-bottom)); }
</style>

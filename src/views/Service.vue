<template>
  <main class="service-page">
    <header class="service-header"><h1>办&查</h1><p>请选择您需要办理或查询的事项</p></header>
    <div class="service-body">
      <section aria-labelledby="tax-heading">
        <h2 id="tax-heading">办税</h2>
        <div class="tax-panel">
          <div class="feature-entry annual">
            <h3>综合所得年度汇算</h3><p>申报与查询综合所得年度汇算</p>
            <span class="feature-art annual-art" aria-hidden="true"></span>
          </div>
          <div class="feature-entry deduction">
            <h3>专项附加扣除</h3><p>填报与查询7项专项附加扣除信息</p>
            <span class="feature-art deduction-art" aria-hidden="true"></span>
          </div>
          <div class="tax-grid">
            <article v-for="item in taxItems" :key="item.title" class="function-card tax-card">
              <span class="function-icon" :style="iconStyle(item, false)" aria-hidden="true"></span>
              <span v-if="item.isNew" class="new-badge">NEW</span>
              <h3>{{ item.title }}</h3><p>{{ item.desc }}</p>
            </article>
          </div>
          <div class="warning-entry"><span class="warning-art" aria-hidden="true"></span><strong>警示案例</strong><span class="warning-arrow" aria-hidden="true">›</span></div>
        </div>
      </section>
      <section class="query-section" aria-labelledby="query-heading">
        <h2 id="query-heading">查询</h2>
        <div class="query-panel">
          <article
            v-for="item in queryItems"
            :key="item.title"
            class="function-card query-card"
            :class="{ 'is-clickable': item.route }"
            :role="item.route ? 'button' : undefined"
            :tabindex="item.route ? 0 : undefined"
            @click="openService(item)"
            @keydown.enter.prevent="openService(item)"
            @keydown.space.prevent="openService(item)"
          >
            <span class="function-icon" :style="iconStyle(item, true)" aria-hidden="true"></span>
            <span v-if="item.isNew" class="new-badge">NEW</span>
            <h3>{{ item.title }}</h3><p>{{ item.desc }}</p>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import taxReference from '../assets/tax/service-tax-reference.jpg'
import queryReference from '../assets/tax/service-query-reference.jpg'

const router = useRouter()

// Coordinates are in the reference image's 393 x 852 logical canvas.
// Use only icon artwork; all headings, descriptions and badges are HTML.
const taxItems = [
  { title: '个人养老金扣除管理', desc: '录入或查看个人养老金扣除信息', x: 35, y: 351 },
  { title: '经营所得申报', desc: '取得经营所得后办理申报', x: 152, y: 351, isNew: true },
  { title: '纳税记录开具', desc: '生成或查看纳税记录', x: 268, y: 351 },
  { title: '公益慈善捐赠扣除填报', desc: '录入或查看准予扣除的捐赠记录', x: 35, y: 484 },
  { title: '委托代理关系管理', desc: '委托代理机构或个人代办年度汇算', x: 152, y: 484 },
  { title: '涉税服务人员信息管理', desc: '填报涉税服务人员信息与申领信用码', x: 268, y: 484, isNew: true },
]
const queryItems = [
  { title: '收入纳税明细', desc: '查看个人所得税纳税明细', x: 37, y: 342, route: '/income-tax-detail' },
  { title: '申报记录', desc: '查看历史申报记录', x: 153, y: 342 },
  { title: '异议申诉', desc: '查询最新申诉记录和结果', x: 270, y: 342 },
  { title: '税务文书', desc: '查看电子税务文书信息', x: 37, y: 482 },
  { title: '涉税专业服务机构', desc: '查询全国涉税专业服务机构信息', x: 153, y: 482 },
  { title: '备案信息', desc: '查询备案信息', x: 270, y: 482 },
  { title: '票证查验', desc: '查验纳税记录等税收票证信息真伪', x: 37, y: 622 },
  { title: '代办申报明细', desc: '查询月销售额达到10万元的代办申报明细数据', x: 153, y: 622, isNew: true },
  { title: '欠税信息', desc: '查询个人欠税信息', x: 270, y: 622 },
]
function openService(item) {
  if (!item.route) return
  router.push(item.route)
}
function iconStyle(item, query) {
  return {
    backgroundImage: 'url("' + (query ? queryReference : taxReference) + '")',
    backgroundPosition: (-item.x / 393 * 100) + 'cqw ' + (-item.y / 393 * 100) + 'cqw',
  }
}
</script>

<style scoped>
.service-page { container-type: inline-size; width: 100%; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; background: #3589f3; font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif; }
:global(.app-root:has(.service-page)) { padding-bottom: 0; }
.service-header { flex: none; display: flex; align-items: center; gap: 3.2cqw; height: 12.47cqw; padding: 0 3.18cqw 1cqw; background: radial-gradient(ellipse at 47% 0,#829fee,#54a3ed 50%,#2981f2); }
.service-header h1 { margin: 0; color: white; font-size: 6.1cqw; line-height: 1.4; font-weight: 600; white-space: nowrap; }
.service-header p { margin: 0; color: #b3d6f3; font-size: 3.05cqw; white-space: nowrap; }
.service-body { flex: 1; min-height: 0; overflow-y: auto; padding: 4.6cqw 3.18cqw calc(105px + env(safe-area-inset-bottom)); border-radius: 5.1cqw 5.1cqw 0 0; background: #f5f6fa; scrollbar-width: none; }
.service-body::-webkit-scrollbar { display: none; }
.service-body h2 { margin: 0 0 3.3cqw; font-size: 4.07cqw; line-height: 1.5; font-weight: 600; color: #202428; }
.tax-panel { padding: 3.18cqw 3.18cqw 0; border-radius: 2.3cqw; background: #fff; overflow: hidden; }
.feature-entry { position: relative; overflow: hidden; height: 18.57cqw; border-radius: 1cqw; padding: 3.4cqw 4cqw; }
.feature-entry h3 { position: relative; z-index: 1; margin: 0; font-size: 4.07cqw; line-height: 1.5; font-weight: 600; }
.feature-entry p { position: relative; z-index: 1; margin: 1.3cqw 0 0; font-size: 3.3cqw; line-height: 1.4; }
.annual { background: #e7effd; color: #28628c; }.annual h3 { color: #1f638c; }.annual p { color: #688eae; }
.deduction { margin-top: 3.3cqw; background: #fff6e7; color: #ae6a08; }.deduction h3 { color: #a36104; }.deduction p { color: #b7944d; }
.feature-art { position: absolute; right: 0; bottom: 0; width: 18.57cqw; height: 15.5cqw; background-image: url('../assets/tax/service-tax-reference.jpg'); background-size: 100cqw 216.794cqw; }
.annual-art { background-position: -75cqw -46cqw; }.deduction-art { background-position: -75cqw -68cqw; }
.tax-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7.1cqw 1.8cqw; margin-top: 10cqw; }
.function-card { position: relative; min-width: 0; padding: 4.9cqw 2.1cqw 2.7cqw; color: #202326; }
.tax-card { min-height: 26.7cqw; isolation: isolate; }
.tax-card::before { content: ''; position: absolute; inset: 0; z-index: -1; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 110 120' preserveAspectRatio='none'%3E%3Cpath d='M0 15Q0 0 17 2L95 13Q110 16 110 30V107Q110 120 97 120H13Q0 120 0 107Z' fill='%23f8f8fb'/%3E%3C/svg%3E") center / 100% 100% no-repeat; }
.function-card h3 { margin: 0; font-size: 3.05cqw; line-height: 1.65; font-weight: 600; color: #202326; overflow-wrap: anywhere; }
.function-card p { margin: 1.3cqw 0 0; font-size: 2.8cqw; line-height: 1.55; color: #a0a1a3; font-weight: 400; overflow-wrap: anywhere; }
.function-icon { position: absolute; top: -3.7cqw; left: 2.5cqw; width: 6.9cqw; height: 6.9cqw; background-repeat: no-repeat; background-size: 100cqw 216.794cqw; }
.new-badge { position: absolute; z-index: 2; top: -6.4cqw; left: 7cqw; padding: 0 1.1cqw; border-radius: 3cqw; background: #ff6145; color: #fff; font-family: Arial,sans-serif; font-size: 2.8cqw; line-height: 4cqw; }
.warning-entry { position: relative; display: flex; align-items: center; height: 19.6cqw; margin: 0 -3.18cqw; padding-left: 30.5cqw; gap: 2.5cqw; }
.warning-art { position: absolute; left: 0; bottom: 0; width: 28cqw; height: 19cqw; background: url('../assets/tax/service-tax-reference.jpg') -3.18cqw -155.2cqw / 100cqw 216.794cqw no-repeat; }
.warning-entry strong { font-size: 4.07cqw; font-weight: 600; color: #101214; }.warning-arrow { font-size: 6cqw; color: #aaa; }
.query-section { margin-top: 4.6cqw; }
.query-panel { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 2.1cqw 1.8cqw; padding: 3.18cqw; background: #fff; border-radius: 2.3cqw; }
.query-card { padding-top: 12.6cqw; min-height: 33.5cqw; background: #f7f8fa; border-radius: 2.3cqw; }
.query-card.is-clickable { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.query-card.is-clickable:focus-visible { outline: 2px solid #2588f4; outline-offset: -2px; }
.query-card .function-icon { top: 3.8cqw; left: 3cqw; width: 6cqw; height: 6cqw; }
.query-card .new-badge { top: 1cqw; }
</style>

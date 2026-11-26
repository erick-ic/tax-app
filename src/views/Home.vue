<template>
  <main class="home-page">
    <header class="search-row">
      <div class="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="8"/><path d="m16.5 16.5 5 5"/></svg>
        <span>请输入想搜索的功能/服务</span>
      </div>
      <button class="scan-btn" aria-label="扫一扫"><svg viewBox="0 0 26 26" aria-hidden="true"><path d="M4 9V5a1 1 0 0 1 1-1h4m8 0h4a1 1 0 0 1 1 1v4m0 8v4a1 1 0 0 1-1 1h-4m-8 0H5a1 1 0 0 1-1-1v-4m5-4h8"/></svg></button>
    </header>

    <div class="home-content">
      <div class="notice-banner" aria-live="polite">
        <Transition name="notice-slide">
          <div :key="noticeIndex" class="notice-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7v6l-2 2v2h18v-2l-2-2V9a7 7 0 0 0-7-7Z"/><rect x="9" y="20.5" width="6" height="2.5" rx="1.25"/><path d="M8 8v5" stroke="#ffcf8a" stroke-width="2.5" stroke-linecap="round"/></svg>
            <div ref="noticeViewport" class="notice-viewport">
              <span
                ref="noticeText"
                class="notice-text"
                :class="{ 'is-marquee': noticeMarquee }"
                :style="noticeMarqueeStyle"
                @animationend="handleNoticeMarqueeEnd"
              >{{ currentNotice }}</span>
            </div>
          </div>
        </Transition>
      </div>

      <section class="declare-card" aria-label="2025综合所得年度汇算，已于6月30日结束，逾期办理可能会产生滞纳金，请您尽快申报">
        <img :src="declareImage" class="declare-art" alt="" />
        <button class="image-hotspot declare-entry" aria-label="进入专题页"></button>
        <button class="image-hotspot declare-action" aria-label="开始申报"></button>
      </section>

      <h2 class="section-title">重点服务推荐</h2>
      <section class="featured-card" aria-label="专项附加扣除，若符合条件，您可点击下方填报，超1亿人参与">
        <img :src="featuredImage" class="featured-art" alt="" />
        <button class="image-hotspot featured-policy" aria-label="相关政策"></button>
        <button class="image-hotspot featured-action" aria-label="我要填报"></button>
      </section>

      <div class="service-scroll" aria-label="常用服务">
        <article
          class="svc-card"
          v-for="item in gridItems"
          :key="item.title"
          :class="{ 'is-clickable': item.route }"
          :role="item.route ? 'button' : undefined"
          :tabindex="item.route ? 0 : undefined"
          @click="openService(item)"
          @keydown.enter.prevent="openService(item)"
          @keydown.space.prevent="openService(item)"
        >
          <div class="svc-icon"><img :src="item.icon" alt="" /></div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <span class="svc-action" :class="`is-${item.tone}`">{{ item.action }}</span>
        </article>
      </div>

      <section class="pension-banner" :aria-label="bannerLabels[bannerIndex]" @click="showNextBanner">
        <Transition name="banner-slide">
          <div :key="bannerIndex" class="banner-slide">
            <img
              :src="carouselBanners[bannerIndex]"
              class="pension-banner-image"
              :class="{ 'is-overflowing': bannerIndex > 1 }"
              :style="bannerIndex > 1 ? { top: `${bannerTopOffsets[bannerIndex]}px` } : undefined"
              alt=""
            />
          </div>
        </Transition>
        <div class="pension-indicators" aria-hidden="true">
          <i :style="{ transform: `translateX(${bannerIndex * 12.5}px)` }"></i>
        </div>
      </section>

      <section class="policy-section">
        <div class="policy-tabs"><button v-for="(label, i) in policyTabs" :key="label" :class="{active: activePolicy === i}" @click="activePolicy = i">{{ label }}</button></div>
        <div class="policy-cards">
          <article v-for="(item, index) in policyArticles" :key="item.title" class="policy-card" :class="{ 'is-art-left': index > 1 }">
            <div class="policy-copy">
              <h3>{{ item.title }}</h3>
              <time :datetime="item.date"><span class="clock-icon" aria-hidden="true"></span>{{ item.date }}</time>
            </div>
            <img class="policy-art" :src="item.image" alt="" />
          </article>
        </div>
        <button class="policy-more" type="button">
          <span>查看更多</span>
          <i aria-hidden="true"></i>
        </button>
      </section>
    </div>

  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { homeData } from '../state/appStore'
import declareImage from '../assets/tax/home-declare-card-small-text.png'
import featuredImage from '../assets/tax/ChatGPT Image 2026年9月9日 12_07_09 (2).png'
import annualIcon from '../assets/tax/ChatGPT Image 2026年9月9日 14_19_37.png'
import incomeIcon from '../assets/tax/ChatGPT Image 2026年9月9日 14_31_30.png'
import recordIcon from '../assets/tax/ChatGPT Image 2026年9月9日 14_35_15.png'
import moreIcon from '../assets/tax/ChatGPT Image 2026年9月9日 14_13_13.png'
import casePassword from '../assets/tax/case-password.png'
import caseBankCard from '../assets/tax/case-bank-card.png'
import caseFiling from '../assets/tax/case-filing.png'
import caseDeduction from '../assets/tax/case-deduction.png'
import pensionBanner from '../assets/tax/pension-carousel-banner-overflow.png'
import deductionBanner from '../assets/tax/deduction-carousel-banner-overflow.png'
import jobDeductionBanner from '../assets/tax/job-deduction-carousel-banner.jpg'
import taxMemoryBanner from '../assets/tax/tax-memory-carousel-banner.jpg'
import businessIncomeBanner from '../assets/tax/business-income-carousel-banner-overflow.jpg'
import taxRecordBanner from '../assets/tax/tax-record-carousel-banner-overflow.jpg'

const router = useRouter()
const carouselBanners = [jobDeductionBanner, taxMemoryBanner, businessIncomeBanner, pensionBanner, deductionBanner, taxRecordBanner]
const bannerTopOffsets = [0, 0, -11, -4, -11, -11]
const bannerLabels = [
  '入职季专项附加扣除减负利器',
  '2025个税记忆',
  '经营所得申报功能介绍',
  '个人养老金，您想知道的都在这儿',
  '一老一小三项专项附加扣除标准提高啦',
  '纳税记录用处多，开具攻略点这里',
]

const gridItems = [
  { title: '综合所得年度汇算', desc: '申报与查询综合所得年度汇算', icon: annualIcon, action: '去申报', tone: 'blue' },
  { title: '收入纳税明细', desc: '查看个人所得税纳税明细', icon: incomeIcon, route: '/income-tax-detail', action: '去查询', tone: 'purple' },
  { title: '纳税记录开具', desc: '生成或查看纳税记录', icon: recordIcon, action: '去开具', tone: 'mint' },
  { title: '更多功能', desc: '设置在首页展示的常用功能', icon: moreIcon, action: '去设置', tone: 'blue' },
]

function openService(item) {
  if (!item.route) return
  router.push(item.route)
}
const notices = computed(() => homeData.value.notices)
const noticeIndex = ref(0)
const noticeViewport = ref(null)
const noticeText = ref(null)
const noticeMarquee = ref(false)
const noticeDistance = ref(0)
const noticeDuration = ref(0)
const currentNotice = computed(() => {
  const list = notices.value
  if (!list.length) return ''
  return list[noticeIndex.value % list.length]
})
const noticeMarqueeStyle = computed(() => ({
  '--notice-distance': `${noticeDistance.value}px`,
  '--notice-duration': `${noticeDuration.value}ms`,
}))
let noticeTimer
let noticeRafId = 0
let resizeTimer
const bannerIndex = ref(0)
let bannerTimer

function clearNoticeTimer() {
  window.clearTimeout(noticeTimer)
  if (noticeRafId) {
    window.cancelAnimationFrame(noticeRafId)
    noticeRafId = 0
  }
}

function showNextNotice() {
  clearNoticeTimer()
  noticeMarquee.value = false
  const total = notices.value.length
  if (total === 0) return
  noticeIndex.value = (noticeIndex.value + 1) % total
  noticeTimer = window.setTimeout(prepareNotice, 430)
}

async function prepareNotice() {
  clearNoticeTimer()
  noticeMarquee.value = false
  await nextTick()
  const viewport = noticeViewport.value
  const text = noticeText.value
  if (!viewport || !text) return

  const overflow = Math.ceil(text.scrollWidth - viewport.clientWidth)
  if (overflow > 0) {
    noticeDistance.value = overflow
    noticeDuration.value = Math.max(2600, Math.round(overflow / 32 * 1000))
    noticeRafId = window.requestAnimationFrame(() => {
      noticeRafId = 0
      noticeMarquee.value = true
    })
  } else {
    noticeTimer = window.setTimeout(showNextNotice, 2000)
  }
}

function handleResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(prepareNotice, 150)
}

function handleNoticeMarqueeEnd() {
  noticeTimer = window.setTimeout(showNextNotice, 1000)
}

function scheduleNextBanner() {
  window.clearTimeout(bannerTimer)
  bannerTimer = window.setTimeout(showNextBanner, 5000)
}

function showNextBanner() {
  bannerIndex.value = (bannerIndex.value + 1) % bannerLabels.length
  scheduleNextBanner()
}

onMounted(() => {
  prepareNotice()
  scheduleNextBanner()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearNoticeTimer()
  window.clearTimeout(resizeTimer)
  window.clearTimeout(bannerTimer)
  window.removeEventListener('resize', handleResize)
})

const activePolicy = ref(0)
const policyTabs = computed(() => homeData.value.policyTabs)
const policyContent = computed(() => homeData.value.policyContent)
const warningImages = [casePassword, caseBankCard, caseFiling, caseDeduction]
const policyArticles = computed(() => (policyContent.value[activePolicy.value] || []).map((title, index) => ({
  title,
  image: warningImages[index] || warningImages[index % warningImages.length],
  date: activePolicy.value === 0 && index > 1 ? '2024-03-15' : '2025-02-28',
})))
</script>

<style scoped>
/* Reference is 393 CSS pixels wide; its 54px system status area is excluded. */
.home-page {
  --type-search: 3.56234vw;
  --type-notice: 3.81679vw;
  --type-section: 4.07125vw;
  --type-service: 3.30789vw;
  --type-description: 2.79898vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-synthesis: none;
  position: relative;
  min-height: 100vh;
  padding-bottom: 100px;
  background: #f5f6fa;
  overflow: hidden;
}
.home-page::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 180px;
  background: radial-gradient(ellipse at 48% 0%, #819ff0 0%, #58a5ed 40%, #2c82f3 85%);
  mask-image: linear-gradient(#000 0%, #000 65%, transparent 100%);
}
.search-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  height: 65px;
  padding: 13px 13px 18px 12px;
}
.search-box { display: flex; flex: 1; min-width: 0; align-items: center; gap: 8px; height: 34px; padding: 0 12px; border-radius: 9px; background: #c2dfff70; color: #fff; }
.search-box svg { width: 17px; height: 19px; flex: none; stroke: currentColor; stroke-width: 1.8; fill: none; }
.search-box span { white-space: nowrap; font-size: var(--type-search); line-height: 1.4; font-weight: 400; letter-spacing: .02em; }
.scan-btn { border: 0; background: none; padding: 0; color: white; width: 31px; height: 30px; flex: none; }
.scan-btn svg { width: 27px; height: 27px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
.home-content { position: relative; padding: 0 12px; }
.notice-banner { position: relative; height: 44px; overflow: hidden; border-radius: 9px; background: #fff7e7; color: #a86d15; }
.notice-row { position: absolute; inset: 0; display: flex; align-items: center; gap: 16px; padding: 0 9px; }
.notice-row svg { width: 19px; height: 22px; flex: none; fill: #ff852c; filter: drop-shadow(0 2px 3px #ffa54f66); }
.notice-viewport { min-width: 0; flex: 1; overflow: hidden; }
.notice-text { display: inline-block; white-space: nowrap; font-size: var(--type-notice); line-height: 1.4; font-weight: 400; letter-spacing: 0; }
.notice-text.is-marquee { animation: notice-marquee var(--notice-duration) linear forwards; }
.notice-slide-enter-active, .notice-slide-leave-active { transition: transform .4s ease; }
.notice-slide-enter-from { transform: translateY(100%); }
.notice-slide-leave-to { transform: translateY(-100%); }
@keyframes notice-marquee { to { transform: translateX(calc(-1 * var(--notice-distance))); } }
.declare-card { position: relative; margin-top: 11px; width: 100%; aspect-ratio: 369 / 204; overflow: hidden; border-radius: 9px; background: #dceffd; box-shadow: 0 7px 16px #a5c9f52b; }
/* Crop only the supplied artwork canvas margins using CSS; preserve source files. */
.declare-art { position: absolute; width: 109.45%; height: calc(159.91% + 6px); max-width: none; left: -4.65%; top: -33.67%; }
.declare-card { isolation: isolate; }
/* Subtle screen tint over the baked-in heading and description. */
.declare-card::after { content: ''; position: absolute; left: 5.5%; right: 5.5%; top: 18%; height: 37%; background: #181818; mix-blend-mode: screen; pointer-events: none; }
.image-hotspot { position: absolute; border: none; background: transparent; cursor: pointer; border-radius: 24px; }
.image-hotspot:focus-visible { outline: 2px solid #153fbd; outline-offset: -3px; }
.declare-entry { right: 0; top: 0; width: 31%; height: 19%; }
.declare-action { left: 5.7%; top: 63%; width: 45%; height: 25%; }
.section-title { margin: 44px 0 14px; padding: 0; font-size: var(--type-section); line-height: 1.5; font-weight: 600; letter-spacing: .025em; }
.featured-card { position: relative; width: 100%; aspect-ratio: 369 / 166; overflow: hidden; border-radius: 9px; background: #48a0fa; box-shadow: 0 7px 16px #47a6ec55, 0 0 5px #76d3f477; }
.featured-art { position: absolute; width: 112.28%; height: 169.54%; max-width: none; left: -6.21%; top: -34.77%; }
.featured-policy { right: 0; top: 0; width: 32%; height: 26%; }
.featured-action { left: 11%; bottom: 8%; width: 81%; height: 30%; }
.service-scroll { display: flex; gap: 7px; margin: 20px -12px 0; padding: 27px 12px 0; overflow-x: auto; scrollbar-width: none; }
.service-scroll::-webkit-scrollbar { display: none; }
.svc-card { position: relative; flex: 0 0 26.97201vw; min-height: 126px; padding: 13px 2.03562vw 37px; overflow: visible; isolation: isolate; }
.svc-card.is-clickable { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.svc-card.is-clickable:focus-visible { outline: 2px solid #2588f4; outline-offset: -2px; border-radius: 8px; }
/* The reference uses a soft, descending roof line with rounded lower corners. */
.svc-card::before { content: ''; position: absolute; inset: 0; z-index: -1; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 106 126' preserveAspectRatio='none'%3E%3Cpath d='M0 18Q0 0 19 3L88 13Q106 16 106 33V114Q106 126 94 126H12Q0 126 0 114Z' fill='white'/%3E%3C/svg%3E") center / 100% 100% no-repeat; filter: drop-shadow(0 5px 9px rgba(74,104,145,.055)); }
.svc-icon { position: absolute; z-index: 1; left: 11px; top: -27px; width: 32px; height: 31px; overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 2px 7px rgba(64, 124, 183, .16); }
.svc-icon img { position: absolute; width: 139.33%; height: 142.5%; max-width: none; left: -19.55%; top: -21.6%; }
.svc-card h3 { font-size: var(--type-service); line-height: 1.4; font-weight: 400; letter-spacing: 0; color: #161b1f; }
.svc-card p { font-size: var(--type-description); line-height: 1.3; font-weight: 400; letter-spacing: 0; color: #a4a5a7; margin-top: 6px; }
.svc-action { position: absolute; right: 0; bottom: 0; min-width: 58px; height: 28px; display: grid; place-items: center; padding: 0 10px; border-radius: 15px 0 12px; font-size: 12px; line-height: 1; white-space: nowrap; }
.svc-action.is-blue { color: #398fea; background: #d9efff; }.svc-action.is-purple { color: #8d4ce8; background: #eee0ff; }.svc-action.is-mint { color: #16bfa7; background: #d6fbf4; }
.pension-banner { position: relative; height: 96px; margin-top: 26px; overflow: visible; border-radius: 10px; color: #fff; background: #ff8b32; box-shadow: inset 0 1px 0 #ffd39688; }
.banner-slide { position: absolute; inset: 0; clip-path: inset(-12px 0 -3px round 10px); }
.pension-banner-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pension-banner-image.is-overflowing { bottom: auto; height: auto; object-fit: initial; }
.banner-slide-enter-active, .banner-slide-leave-active { transition: transform .42s cubic-bezier(.25, .75, .35, 1); }
.banner-slide-enter-from { transform: translateX(100%); }
.banner-slide-leave-to { transform: translateX(-100%); }
.pension-indicators { position: absolute; z-index: 3; left: 50%; bottom: 3px; width: 75px; height: 3px; overflow: hidden; border-radius: 3px; background: rgba(255, 236, 218, .68); transform: translateX(-50%); }
.pension-indicators i { display: block; width: 12.5px; height: 100%; border-radius: 3px; background: #fff; transition: transform .42s cubic-bezier(.25, .75, .35, 1); }
.policy-section { position: relative; isolation: isolate; margin-top: 17px; }
.policy-section::before { content: ''; position: absolute; z-index: -1; left: -13px; right: -13px; bottom: -182px; height: 226px; pointer-events: none; background: url('../assets/tax/home-bottom-city-cropped.png') center bottom / 100% 226px no-repeat; }
.policy-tabs { display: flex; align-items: flex-end; gap: 0; background: transparent; }
.policy-tabs button { position: relative; flex: 1; border: 0; background: none; padding: 3px 0 13px; color: #4d4f53; font-size: 15px; line-height: 20px; white-space: nowrap; }
.policy-tabs .active { color: #087fee; font-weight: 700; }.policy-tabs .active::after { content: ''; position: absolute; left: 20%; width: 29px; bottom: 9px; height: 2px; border-radius: 2px; background: #f2463d; box-shadow: 8px 3px 0 -0.5px #1688f2; }
.policy-cards { display: grid; gap: 13px; }
.policy-card { position: relative; width: calc(100% - 42px); min-height: 116px; overflow: visible; border-radius: 14px; background: #fff; box-shadow: 0 5px 15px #7189ad0b; }
.policy-card.is-art-left { margin-left: 42px; }
.policy-copy { display: flex; min-height: 116px; min-width: 0; flex-direction: column; justify-content: space-between; padding: 18px 112px 16px 17px; }
.policy-card.is-art-left .policy-copy { padding-right: 15px; padding-left: 154px; }
.policy-copy h3 { color: #17191c; font-size: 15px; line-height: 1.45; font-weight: 500; }
.policy-copy time { display: flex; align-items: center; gap: 5px; color: #aeb1b5; font-size: 12px; line-height: 16px; }
.policy-art { position: absolute; z-index: 1; right: -42px; top: 10px; width: 152px; height: 98px; border-radius: 12px; object-fit: cover; }
.policy-card.is-art-left .policy-art { right: auto; left: -42px; }
.policy-more { width: 100%; height: 72px; display: flex; align-items: flex-start; justify-content: center; gap: 10px; padding-top: 18px; border: 0; background: transparent; color: #a7a9ac; font: inherit; font-size: 15px; line-height: 22px; }
.policy-more i { width: 9px; height: 9px; margin-top: 6px; border-top: 2px solid currentColor; border-right: 2px solid currentColor; transform: rotate(45deg); }
.clock-icon { position: relative; width: 13px; height: 13px; flex: none; border-radius: 50%; background: #c5c8ca; }
.clock-icon::before { content: ''; position: absolute; left: 6px; top: 3px; width: 1px; height: 4px; background: #fff; transform-origin: bottom; }
.clock-icon::after { content: ''; position: absolute; left: 6px; top: 6px; width: 3px; height: 1px; background: #fff; transform: rotate(28deg); transform-origin: left; }
</style>

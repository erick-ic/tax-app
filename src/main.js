import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Vant from 'vant'
import 'vant/lib/index.css'

import './assets/styles/theme.css'
import './assets/styles/global.css'

import App from './App.vue'
import Home from './views/Home.vue'
import { initAppData } from './state/appStore'
import { setTaxModuleLoading } from './state/taxModuleLoading'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior() {
    return { top: 0, left: 0 }
  },
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'home', component: Home, meta: { title: '首页', tab: 'home' } },
    { path: '/todo', name: 'todo', component: () => import('./views/Todo.vue'), meta: { title: '待办', tab: 'todo' } },
    { path: '/service', name: 'service', component: () => import('./views/Service.vue'), meta: { title: '办&查', tab: 'service' } },
    { path: '/message', name: 'message', component: () => import('./views/Message.vue'), meta: { title: '消息', tab: 'message' } },
    { path: '/profile', name: 'profile', component: () => import('./views/Profile.vue'), meta: { title: '我的', tab: 'profile' } },
    { path: '/income-tax-detail', name: 'income-tax-detail', component: () => import('./views/IncomeTaxDetail.vue'), meta: { title: '收入纳税明细', tabBar: false, taxModule: true } },
    { path: '/income-tax-results', name: 'income-tax-results', component: () => import('./views/IncomeTaxResults.vue'), meta: { title: '收入纳税明细', tabBar: false, taxModule: true } },
    { path: '/income-tax-record-detail', name: 'income-tax-record-detail', component: () => import('./views/IncomeTaxRecordDetail.vue'), meta: { title: '收入纳税明细详情', tabBar: false, taxModule: true } },
    { path: '/income-tax-calculation', name: 'income-tax-calculation', component: () => import('./views/IncomeTaxCalculation.vue'), meta: { title: '税款计算', tabBar: false, taxModule: true } },
    { path: '/personal-info', name: 'personal-info', component: () => import('./views/PersonalInfo.vue'), meta: { title: '个人信息', tabBar: false } },
    { path: '/admin', name: 'admin', component: () => import('./views/AdminData.vue'), meta: { title: '数据管理', tabBar: false } },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
})

let previousHistoryPosition = window.history.state?.position ?? 0
let loadingToken = 0

router.beforeEach(async (to) => {
  if (!to.meta.taxModule) return
  const currentHistoryPosition = window.history.state?.position ?? previousHistoryPosition
  if (currentHistoryPosition < previousHistoryPosition) return
  if (Math.random() >= 0.5) return
  const token = ++loadingToken
  setTaxModuleLoading(true)
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 500))
  } finally {
    if (token === loadingToken) {
      setTaxModuleLoading(false)
    }
  }
})

router.afterEach((to) => {
  previousHistoryPosition = window.history.state?.position ?? previousHistoryPosition
  if (to.meta.title) {
    document.title = to.meta.title
  }
})

router.onError(() => {
  loadingToken += 1
  setTaxModuleLoading(false)
})

initAppData()

const app = createApp(App)
app.use(router)
app.use(Vant)
app.mount('#app')

router.isReady().then(() => {
  window.scrollTo(0, 0)
})

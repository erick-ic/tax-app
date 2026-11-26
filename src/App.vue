<template>
  <div class="app-root" :class="{ 'has-tab-bar': showTabBar }">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <AppTabBar v-if="showTabBar" />
    <Transition name="module-loading-fade">
      <div v-if="taxModuleLoading" class="module-loading" role="status" aria-label="加载中" aria-live="polite">
        <svg class="radial-spinner" viewBox="0 0 32 32" aria-hidden="true">
          <line
            v-for="index in 12"
            :key="index"
            x1="16"
            y1="3.5"
            x2="16"
            y2="9"
            :transform="`rotate(${index * 30} 16 16)`"
            :opacity="0.25 + index * 0.06"
          />
        </svg>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppTabBar from './components/AppTabBar.vue'
import { taxModuleLoading } from './state/taxModuleLoading'

const route = useRoute()
const showTabBar = computed(() => route.meta.tabBar !== false)
</script>

<style>
.app-root {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}
.app-root.has-tab-bar {
  /* 浮起胶囊 Tab 栏：56px 高 + 8px 底部 + 8px 缓冲 + iPhone 安全区 */
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.module-loading { position: fixed; z-index: 2000; left: 50%; top: 50%; width: 132px; height: 112px; display: grid; place-items: center; transform: translate(-50%, -50%); border-radius: 4px; background: rgba(54, 61, 69, .68); }
.radial-spinner { width: 34px; height: 34px; overflow: visible; fill: none; stroke: rgba(255, 255, 255, .95); stroke-width: 3; stroke-linecap: round; animation: radial-spin .72s steps(12) infinite; }
.module-loading-fade-enter-active, .module-loading-fade-leave-active { transition: opacity .08s linear; }
.module-loading-fade-enter-from, .module-loading-fade-leave-to { opacity: 0; }
@keyframes radial-spin { to { transform: rotate(360deg); } }
</style>

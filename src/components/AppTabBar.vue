<template>
  <nav class="app-tab-bar" aria-label="主导航">
    <router-link v-for="item in tabs" :key="item.key" :to="item.path" class="tab-item" :class="{ 'is-active': activeKey === item.key }" :aria-current="activeKey === item.key ? 'page' : undefined">
      <span class="tab-icon">
        <span class="icon-crop">
          <img :src="activeKey === item.key ? item.active : item.idle" alt="" />
        </span>
        <span v-if="item.key === 'message' && unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </span>
      <span class="tab-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { unreadCount } from '../state/messages'
const route = useRoute()
const activeKey = computed(() => route.meta.tab || 'home')
const assets = import.meta.glob('../assets/tax/tab/reference/*.webp', { eager: true, query: '?url', import: 'default' })
function source(name) { return Object.entries(assets).find(([path]) => path.endsWith('/' + name + '.webp'))[1] }
const definitions = [
  ['home', '首页'],
  ['todo', '待办'],
  ['service', '办&查'],
  ['message', '消息'],
  ['profile', '我的'],
]
const tabs = definitions.map(([key, label]) => ({ key, label, path: '/' + key, active: source(key + '-active'), idle: source(key + '-idle') }))
</script>

<style scoped>
.app-tab-bar {
  position: fixed;
  z-index: 999;
  bottom: max(12px, calc(env(safe-area-inset-bottom) - 10px));
  left: 50%;
  width: calc(100% - 34px);
  height: 60px;
  display: flex;
  padding: 0 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .56);
  border-radius: 30px;
  background:
    linear-gradient(105deg, rgba(255, 255, 255, .72), rgba(250, 253, 255, .64) 48%, rgba(255, 250, 246, .70));
  box-shadow:
    0 8px 24px rgba(52, 72, 101, .12),
    inset 0 1px 1px rgba(255, 255, 255, .86);
  backdrop-filter: blur(22px) saturate(155%);
  -webkit-backdrop-filter: blur(22px) saturate(155%);
  transform: translateX(-50%);
}
.tab-item { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; color: #222729; text-decoration: none; -webkit-tap-highlight-color: transparent; }
.tab-icon { position: relative; width: 26px; height: 26px; }
.icon-crop { position: absolute; inset: 0; overflow: hidden; }
.icon-crop img { display: block; width: 100%; height: 100%; object-fit: contain; }
.tab-label { font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif; font-size: 2.79898vw; font-weight: 400; line-height: 1.25; letter-spacing: 0; white-space: nowrap; font-synthesis: none; }
.is-active { color: #078bfc; }
.badge { position: absolute; right: -9px; top: -7px; min-width: 16px; height: 16px; padding: 0 4px; line-height: 16px; border-radius: 999px; background: #ff5757; color: white; text-align: center; font-size: 12px; box-shadow: 0 0 0 1px #fff9; }
.tab-item:focus-visible { outline: 2px solid #248afa; border-radius: 12px; }
</style>

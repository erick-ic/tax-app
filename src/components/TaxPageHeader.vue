<template>
  <header class="page-header" :class="{ 'is-sticky': sticky, 'has-shadow': shadow, 'is-compact': compact }">
    <div class="header-inner">
      <button class="back-button" type="button" aria-label="返回" @click="router.back()">
        <span class="back-chevron" aria-hidden="true"></span>
        <span>返回</span>
      </button>
      <h1>{{ title }}</h1>
      <button v-if="actionText" class="action-button" type="button" @click="emit('action')">{{ actionText }}</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, required: true },
  actionText: { type: String, default: '' },
  sticky: { type: Boolean, default: false },
  shadow: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['action'])
const router = useRouter()
</script>

<style scoped>
.page-header {
  padding-top: env(safe-area-inset-top);
  background: #fff;
  border-bottom: 1px solid #e6e8eb;
}
.page-header.is-sticky {
  position: sticky;
  z-index: 20;
  top: 0;
}
.page-header.has-shadow {
  border-bottom-color: #e7e9ed;
  box-shadow: 0 2px 7px rgba(32, 56, 92, .05);
}
.header-inner {
  position: relative;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-header.is-compact .header-inner {
  height: 61px;
}
.header-inner h1 {
  color: #202226;
  font-size: 19px;
  line-height: 1;
  font-weight: 500;
}
.back-button,
.action-button {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3389e9;
  font-size: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.back-button {
  left: 16px;
  gap: 2px;
}
.action-button {
  right: 17px;
}
.back-chevron {
  width: 12px;
  height: 12px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
}
.back-button:focus-visible,
.action-button:focus-visible {
  outline: 2px solid #3c91ed;
  outline-offset: -4px;
  border-radius: 4px;
}
@media (max-width: 350px) {
  .header-inner h1 {
    font-size: 17px;
  }
  .back-button,
  .action-button {
    font-size: 14px;
  }
}
</style>

<template>
  <main class="personal-info-page">
    <TaxPageHeader title="个人信息" compact />

    <section class="info-list" aria-label="个人信息菜单">
      <button
        v-for="item in menuItems"
        :key="item"
        class="info-row"
        type="button"
      >
        <span>{{ item }}</span>
        <i class="row-chevron" aria-hidden="true"></i>
      </button>
    </section>
  </main>
</template>

<script setup>
import TaxPageHeader from '../components/TaxPageHeader.vue'

const menuItems = ['基本信息', '可享税收优惠', '其他身份证件']
</script>

<style scoped>
.personal-info-page {
  min-height: 100vh;
  background: #f5f6fa;
  color: #202226;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-synthesis: none;
}
.info-list {
  margin-top: 12px;
  background: #fff;
  border-top: 1px solid #eceef1;
  border-bottom: 1px solid #eceef1;
}
.info-row {
  position: relative;
  width: 100%;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 0 16px;
  border: 0;
  background: #fff;
  color: #24262a;
  font-size: 16px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.info-row + .info-row::before {
  content: '';
  position: absolute;
  left: 16px;
  right: 0;
  top: 0;
  height: 1px;
  background: #eceef1;
}
.info-row:active {
  background: #f7f8fa;
}
.info-row:focus-visible {
  outline: 2px solid #3c91ed;
  outline-offset: -2px;
}
.row-chevron {
  width: 9px;
  height: 9px;
  flex: none;
  border-top: 1.8px solid #c8cbd1;
  border-right: 1.8px solid #c8cbd1;
  transform: rotate(45deg);
}
</style>

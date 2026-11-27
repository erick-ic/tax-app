<template>
  <main class="message-page">
    <header class="message-header">
      <h1>消息</h1>
      <div class="message-actions">
        <button
          class="filter-button"
          :class="{ active: filterOpen || hasActiveFilter }"
          type="button"
          :aria-expanded="filterOpen"
          aria-controls="message-filter-panel"
          @click="toggleFilter"
        >
          <span>筛选</span>
          <svg viewBox="0 0 12 18" aria-hidden="true"><path d="M1.35 1.5h9.3c.7 0 1.08.82.62 1.35L7.45 7.3A1.8 1.8 0 0 0 7 8.47v4.7l-2 1.1v-5.8c0-.43-.16-.84-.45-1.17L.73 2.85c-.46-.53-.08-1.35.62-1.35Z" /></svg>
        </button>
        <button class="clear-button" type="button" :disabled="unreadCount === 0" @click="clearUnread">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14.7 2.9 7.1 7.1q1.2 1.2 0 2.4l-8.1 8.1q-.7.7-1.9.7H7.6q-1.1 0-1.9-.8l-2.6-2.6q-1.4-1.4-.1-2.8l9.3-12.1q1.2-1.2 2.4 0Z" />
            <path d="m7.3 8.8 8.5 8.5M12.6 20.2H22" />
          </svg>
          <span>清除未读</span>
        </button>
      </div>
    </header>

    <section ref="sheetRef" class="message-sheet" aria-label="消息列表">
      <button v-for="item in visibleMessages" :key="item.id" class="message-item" type="button" @click="readMessage(item)">
        <span class="message-icon" :class="item.kind" aria-hidden="true">
          <img :src="item.kind === 'notice' ? noticeIcon : taxIcon" alt="" />
        </span>
        <span class="message-copy">
          <span class="message-title-row">
            <strong>{{ item.title }}</strong>
            <time>{{ item.date }}</time>
          </span>
          <span class="message-preview-row">
            <span>{{ item.preview }}</span>
            <i v-if="item.unread" aria-label="未读"></i>
          </span>
        </span>
      </button>
      <div v-if="visibleMessages.length === 0" class="empty-state">暂无符合条件的消息</div>
    </section>

    <Transition name="filter-sheet">
      <div v-if="filterOpen" class="filter-overlay" :style="{ top: `${filterTop}px` }" @click.self="filterOpen = false">
        <div id="message-filter-panel" class="filter-panel" role="dialog" aria-label="消息筛选">
          <div class="filter-group">
            <h2>阅读状态</h2>
            <div class="option-grid">
              <button
                v-for="opt in readStatusOptions"
                :key="opt.value"
                type="button"
                class="option-chip"
                :class="{ selected: draftFilter.readStatus === opt.value }"
                @click="draftFilter.readStatus = opt.value"
              >
                <span>{{ opt.label }}</span>
                <span v-if="draftFilter.readStatus === opt.value" class="chip-check" aria-hidden="true">
                  <svg viewBox="0 0 12 12"><path d="M2.5 6.4 5 8.8 9.6 3.5" /></svg>
                </span>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <h2>消息类型</h2>
            <div class="option-grid">
              <button
                v-for="opt in messageTypeOptions"
                :key="opt.value"
                type="button"
                class="option-chip"
                :class="{ selected: draftFilter.messageType === opt.value }"
                @click="draftFilter.messageType = opt.value"
              >
                <span>{{ opt.label }}</span>
                <span v-if="draftFilter.messageType === opt.value" class="chip-check" aria-hidden="true">
                  <svg viewBox="0 0 12 12"><path d="M2.5 6.4 5 8.8 9.6 3.5" /></svg>
                </span>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <h2>时间范围</h2>
            <div class="option-grid">
              <button
                v-for="opt in timeRangeOptions"
                :key="opt.value"
                type="button"
                class="option-chip"
                :class="{ selected: draftFilter.timeRange === opt.value }"
                @click="draftFilter.timeRange = opt.value"
              >
                <span>{{ opt.label }}</span>
                <span v-if="draftFilter.timeRange === opt.value" class="chip-check" aria-hidden="true">
                  <svg viewBox="0 0 12 12"><path d="M2.5 6.4 5 8.8 9.6 3.5" /></svg>
                </span>
              </button>
            </div>
          </div>

          <div class="filter-footer">
            <button class="reset-btn" type="button" @click="resetDraft">重置</button>
            <button class="confirm-btn" type="button" @click="applyFilter">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import noticeIcon from '../assets/tax/message-notice-icon.jpg'
import taxIcon from '../assets/tax/message-tax-icon.jpg'
import { clearUnread, messages, readMessage, unreadCount } from '../state/messages'

const readStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '已读消息', value: 'read' },
  { label: '未读消息', value: 'unread' },
]

const messageTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '重要提醒', value: 'tax' },
  { label: '温馨提示', value: 'notice' },
]

const timeRangeOptions = [
  { label: '全部', value: 'all' },
  { label: '最近一月', value: '1m' },
  { label: '最近三月', value: '3m' },
  { label: '最近半年', value: '6m' },
  { label: '最近一年', value: '1y' },
]

const sheetRef = ref(null)
const filterOpen = ref(false)
const filterTop = ref(0)
const appliedFilter = reactive({
  readStatus: 'all',
  messageType: 'all',
  timeRange: 'all',
})
const draftFilter = reactive({
  readStatus: 'all',
  messageType: 'all',
  timeRange: 'all',
})

const hasActiveFilter = computed(() => (
  appliedFilter.readStatus !== 'all'
  || appliedFilter.messageType !== 'all'
  || appliedFilter.timeRange !== 'all'
))

function toggleFilter() {
  if (!filterOpen.value) {
    if (sheetRef.value) {
      filterTop.value = Math.max(0, Math.round(sheetRef.value.getBoundingClientRect().top))
    }
    draftFilter.readStatus = appliedFilter.readStatus
    draftFilter.messageType = appliedFilter.messageType
    draftFilter.timeRange = appliedFilter.timeRange
  }
  filterOpen.value = !filterOpen.value
}

function resetDraft() {
  draftFilter.readStatus = 'all'
  draftFilter.messageType = 'all'
  draftFilter.timeRange = 'all'
}

function applyFilter() {
  appliedFilter.readStatus = draftFilter.readStatus
  appliedFilter.messageType = draftFilter.messageType
  appliedFilter.timeRange = draftFilter.timeRange
  filterOpen.value = false
}

function matchTimeRange(dateStr, range) {
  if (range === 'all') return true
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || ''))
  if (!match) return false
  const itemDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  const monthsMap = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }
  cutoff.setMonth(cutoff.getMonth() - (monthsMap[range] || 0))
  return itemDate >= cutoff
}

const visibleMessages = computed(() => messages.value.filter((item) => {
  if (appliedFilter.readStatus === 'read' && item.unread) return false
  if (appliedFilter.readStatus === 'unread' && !item.unread) return false
  if (appliedFilter.messageType !== 'all' && item.kind !== appliedFilter.messageType) return false
  if (!matchTimeRange(item.date, appliedFilter.timeRange)) return false
  return true
}))
</script>

<style scoped>
.message-page {
  container-type: inline-size;
  width: 100%;
  min-height: calc(100dvh - 72px - env(safe-area-inset-bottom));
  background: #f6f7f9;
  color: #171a1d;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif;
}
.message-header {
  position: relative;
  z-index: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: calc(4.8cqw + env(safe-area-inset-top)) 3.05cqw 9.5cqw;
  background: radial-gradient(ellipse at 56% -20%, #8b9eea 0, #67a9ee 43%, transparent 72%), linear-gradient(112deg, #3d8cef 0%, #278cf5 100%);
}
.message-header h1 { margin: 0; color: #fff; font-size: 6.1cqw; font-weight: 600; line-height: 1.4; }
.message-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 3.4cqw; }
.message-actions button { border: 0; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.filter-button {
  display: inline-flex; width: 20.4cqw; height: 7cqw; align-items: center; justify-content: center; gap: 1cqw;
  border-radius: 1.45cqw; background: rgba(255,255,255,.23); color: rgba(255,255,255,.8); font-size: 3.56cqw;
}
.filter-button.active { background: rgba(255,255,255,.34); color: #fff; }
.filter-button span { line-height: 3.56cqw; }
.filter-button svg { width: 2.4cqw; height: 3.56cqw; fill: none; stroke: currentColor; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; transform: translateY(.3cqw); }
.clear-button { display: inline-flex; align-items: center; gap: 1.2cqw; padding: 1cqw .8cqw; background: transparent; color: rgba(255,255,255,.62); font-size: 3.31cqw; }
.clear-button:disabled { opacity: .48; }
.clear-button svg { width: 4.07cqw; height: 4.07cqw; fill: none; stroke: currentColor; stroke-width: 1.35; stroke-linecap: round; stroke-linejoin: round; }
.message-sheet {
  position: relative; z-index: 2; min-height: 100cqw; margin-top: -6.1cqw; padding: 2.8cqw 0 6cqw; overflow: hidden;
  border-radius: 6cqw 6cqw 0 0; background: #fff;
}
.filter-overlay {
  position: fixed;
  z-index: 1020;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 6cqw 6cqw 0 0;
  background: rgba(0, 0, 0, .48);
}
.filter-panel {
  padding: 5.8cqw 5.6cqw 6.4cqw;
  border-radius: 6cqw 6cqw 0 0;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 29, 54, .12);
}
.filter-group + .filter-group {
  margin-top: 6cqw;
}
.filter-group h2 {
  margin: 0 0 3.3cqw;
  color: #24282e;
  font-size: 3.82cqw;
  font-weight: 500;
  line-height: 1.35;
}
.option-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.8cqw 3.1cqw;
}
.option-chip {
  position: relative;
  height: 9.6cqw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2cqw;
  border: 0;
  border-radius: 1.4cqw;
  overflow: hidden;
  background: #eff1f5;
  color: #24282e;
  font-size: 3.66cqw;
  font-weight: 400;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.option-chip.selected {
  background: #eaf3ff;
  color: #2c7df0;
}
.chip-check {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 5.4cqw;
  height: 5.4cqw;
  background: #2c7df0;
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}
.chip-check svg {
  position: absolute;
  right: .45cqw;
  bottom: .35cqw;
  width: 2.8cqw;
  height: 2.8cqw;
  fill: none;
  stroke: #fff;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.filter-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5.8cqw;
  margin-top: 7.4cqw;
}
.reset-btn,
.confirm-btn {
  height: 11.4cqw;
  border-radius: 999px;
  font-size: 4.07cqw;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.reset-btn {
  border: 1px solid #68a5f5;
  background: #fff;
  color: #2c7df0;
}
.confirm-btn {
  border: 0;
  background: linear-gradient(90deg, #2d87f5, #3a8df6);
  color: #fff;
  box-shadow: 0 3px 10px rgba(45, 135, 245, .24);
}
.filter-sheet-enter-active,
.filter-sheet-leave-active {
  transition: opacity .24s ease;
}
.filter-sheet-enter-active .filter-panel,
.filter-sheet-leave-active .filter-panel {
  transition: transform .26s cubic-bezier(.22, 1, .36, 1);
}
.filter-sheet-enter-from,
.filter-sheet-leave-to {
  opacity: 0;
}
.filter-sheet-enter-from .filter-panel,
.filter-sheet-leave-to .filter-panel {
  transform: translateY(-100%);
}
.message-item {
  display: flex; width: 100%; min-height: 21.8cqw; box-sizing: border-box; align-items: center; gap: 5.1cqw;
  padding: 3.7cqw 6.1cqw 3.7cqw 7.38cqw; border: 0; background: #fff; color: inherit; text-align: left;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.message-item + .message-item { border-top: 1px solid #f2f2f2; }
.message-item:active { background: #f7faff; }
.message-item:focus-visible { outline: 2px solid #258afa; outline-offset: -3px; }
.message-icon { display: block; width: 10.7cqw; height: 10.7cqw; flex: 0 0 auto; overflow: hidden; border-radius: 1.8cqw; }
.message-icon img { display: block; width: 100%; height: 100%; object-fit: cover; }
.message-copy { min-width: 0; flex: 1; }
.message-title-row, .message-preview-row { display: flex; min-width: 0; align-items: center; }
.message-title-row { justify-content: space-between; gap: 2cqw; }
.message-title-row strong { overflow: hidden; color: #181b1e; font-size: 4.07cqw; font-weight: 600; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.message-title-row time { flex: 0 0 auto; color: #b8babc; font-size: 3.31cqw; font-weight: 400; white-space: nowrap; }
.message-preview-row { justify-content: space-between; gap: 2cqw; margin-top: 1cqw; }
.message-preview-row span { overflow: hidden; color: #575b5e; font-size: 3.31cqw; font-weight: 400; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; }
.message-preview-row i { width: 2.1cqw; height: 2.1cqw; flex: 0 0 auto; border-radius: 50%; background: #ff2419; }
.empty-state { padding: 20cqw 0; color: #a6aaae; font-size: 3.56cqw; text-align: center; }
</style>

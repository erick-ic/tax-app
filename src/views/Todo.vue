<template>
  <main class="todo-page">
    <header class="todo-header">
      <div class="todo-heading">
        <h1>待办</h1>
        <p>请及时办理相关业务并确认办结情况</p>
      </div>
      <div class="todo-notice">
        <span class="notice-symbol" aria-hidden="true">!</span>
        <span class="notice-copy">
          <span class="notice-first-line">温馨提示：目前待办功能仅提供部分待办事项的服</span>
          <span class="notice-second-line">务，我们将持续升级，为您提供更全面的待办提醒。</span>
        </span>
      </div>
    </header>

    <section class="todo-content">
      <div class="todo-tabs" role="tablist" aria-label="待办事项状态" :class="{ 'is-completed': completed }">
        <span class="selected-shape" aria-hidden="true"></span>
        <button id="pending-tab" ref="pendingTab" role="tab" :aria-selected="!completed" aria-controls="todo-panel" :tabindex="completed ? -1 : 0" :class="{active: !completed}" @click="completed = false" @keydown.right.prevent="selectTab(true)" @keydown.left.prevent="selectTab(true)">未办结</button>
        <button id="completed-tab" ref="completedTab" role="tab" :aria-selected="completed" aria-controls="todo-panel" :tabindex="completed ? 0 : -1" :class="{active: completed}" @click="completed = true" @keydown.right.prevent="selectTab(false)" @keydown.left.prevent="selectTab(false)">已办结</button>
      </div>
      <div id="todo-panel" role="tabpanel" :aria-labelledby="completed ? 'completed-tab' : 'pending-tab'" class="todo-empty">
        <div class="empty-art" aria-hidden="true"><img :src="emptyArt" alt="" /></div>
        <p aria-live="polite">{{ completed ? '暂无已办结事项' : '暂无未办结事项' }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import emptyArt from '../assets/tax/todo-reference.webp'

const completed = ref(false)
const pendingTab = ref(null)
const completedTab = ref(null)
function selectTab(value) {
  completed.value = value
  ;(value ? completedTab : pendingTab).value?.focus()
}
</script>

<style scoped>
.todo-page {
  container-type: inline-size;
  width: 100%;
  min-height: calc(100dvh - 72px - env(safe-area-inset-bottom));
  background: #f5f6fa;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif;
}
.todo-header {
  height: calc(34.86cqw + env(safe-area-inset-top));
  padding: calc(2.8cqw + env(safe-area-inset-top)) 3.18cqw 0;
  background: radial-gradient(ellipse at 47% -10%, #879df0, #55a4ed 47%, #2d83f5 100%);
}
.todo-heading { display: flex; align-items: center; gap: 3.18cqw; white-space: nowrap; }
.todo-heading h1 {
  margin: 0;
  color: #fff;
  font-family: "Hiragino Sans GB", "STHeiti", "PingFang SC", sans-serif;
  font-size: 6.1cqw;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: .06em;
  text-shadow: 0 .25cqw .4cqw rgb(22 100 203 / 18%);
}
.todo-heading p { margin: 0; font-size: 3.05cqw; line-height: 1.5; font-weight: 400; color: #b1d7f4; }
.todo-notice {
  display: flex;
  align-items: flex-start;
  gap: .3cqw;
  margin-top: 3.5cqw;
  padding: 2.3cqw 4.2cqw;
  border-radius: 2.3cqw;
  background: #fffde9;
  color: rgb(233, 154, 26);
  font-size: 3.56cqw;
  line-height: 1.55;
  font-weight: 400;
}
.notice-symbol { display: inline-flex; flex: 0 0 3.25cqw; width: 3.25cqw; height: 3.25cqw; margin-top: .94cqw; align-items: center; justify-content: center; border: 1px solid currentColor; border-radius: 50%; font-size: 2.5cqw; line-height: 1; }
.notice-copy { display: block; min-width: 0; }
.notice-first-line { white-space: nowrap; }
.notice-second-line { display: block; margin-top: .3cqw; margin-left: -3.55cqw; }
.todo-content { position: relative; margin-top: -.76cqw; }
.todo-tabs {
  position: relative; display: flex; height: 14cqw;
  overflow: hidden; border-radius: 5.1cqw 5.1cqw 0 0;
  background: linear-gradient(#bbd9f8, #e4edf9 65%, #f5f6fa);
}
.selected-shape {
  position: absolute; inset: 0 auto 0 0; width: 50%; height: 100%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 56' preserveAspectRatio='none'%3E%3Cpath d='M0 0H150Q164 0 170 14L190 54Q192 56 200 56H0Z' fill='%23f5f6fa'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
}
.is-completed .selected-shape { left: auto; right: 0; transform: scaleX(-1); }
.todo-tabs button { position: relative; flex: 1; border: 0; padding: 3.4cqw 0 2cqw; background: none; color: #92999f; font-size: 4.07cqw; font-weight: 600; line-height: 1.5; cursor: pointer; }
.todo-tabs button.active { color: #1c2024; }
.todo-tabs button.active::after { content: ''; position: absolute; bottom: .8cqw; left: 50%; transform: translateX(-50%); width: 8.7cqw; height: .9cqw; border-radius: 1cqw; background: #258afa; box-shadow: 0 1px 2px #278afd55; }
.todo-tabs button:focus-visible { outline: 2px solid #207ee4; outline-offset: -4px; }
.todo-empty { padding-top: 14cqw; text-align: center; }
.empty-art { position: relative; width: 69.9746cqw; height: 49.6183cqw; margin: 0 auto; overflow: hidden; }
/* Reuse only the illustration area of the supplied screenshot; labels remain live text. */
.empty-art img { position: absolute; width: 142.9091%; height: 436.9231%; max-width: none; left: -21.8182%; top: -153.8462%; }
.todo-empty p { margin: 3.05cqw 0 0; color: #202326; font-size: 4.07cqw; line-height: 1.5; font-weight: 400; }
</style>

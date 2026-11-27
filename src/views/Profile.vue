<template>
  <main class="profile-page">
    <header class="profile-hero">
      <div class="avatar" aria-label="用户头像" @click="handleAvatarTap">
        <img :src="profileAvatar" alt="" />
      </div>

      <div class="identity-card">
        <span class="identity-text">
          <strong>{{ profile.name }}</strong>
          <span class="tax-id-row">
            <span>纳税人识别号&nbsp; {{ showTaxId ? profile.taxpayerId : maskedTaxpayerId }}</span>
            <button
              class="eye-button"
              type="button"
              :aria-label="showTaxId ? '隐藏纳税人识别号' : '显示完整纳税人识别号'"
              :aria-pressed="showTaxId"
              @click="showTaxId = !showTaxId"
            >
              <svg v-if="showTaxId" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.7 12s3.4-5.3 9.3-5.3 9.3 5.3 9.3 5.3-3.4 5.3-9.3 5.3S2.7 12 2.7 12Z" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
              <span v-else class="sprite-icon sprite-eye" aria-hidden="true"></span>
            </button>
          </span>
        </span>
        <button class="identity-link" type="button" @click="router.push('/personal-info')">个人信息 <b>›</b></button>
      </div>
    </header>

    <section class="profile-content">
      <div class="quick-grid">
        <button v-for="item in quickItems" :key="item.title" type="button" class="quick-card">
          <span class="quick-icon sprite-icon" :class="`sprite-${item.kind}`" aria-hidden="true"></span>
          <strong>{{ item.title }}</strong>
          <span class="quick-tag" :class="{ filled: item.filled }">{{ item.value }}</span>
        </button>
      </div>

      <div class="menu-card">
        <button v-for="item in menuItems" :key="item.title" type="button">
          <img v-if="item.icon === 'info'" class="info-icon" :src="profileInfoIcon" alt="" />
          <img v-else class="menu-icon" :src="menuIconAssets[item.icon]" alt="" />
          <span>{{ item.title }}</span>
          <b aria-hidden="true">›</b>
        </button>
      </div>

      <button class="logout-button" type="button">退出登录</button>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { maskedTaxpayerId, profile } from '../state/appStore'
import profileAvatar from '../assets/tax/profile-avatar.webp'
import profileIconSprite from '../assets/tax/profile-icons.webp'
import profileInfoIcon from '../assets/tax/profile-info.svg'
import menuHeartIcon from '../assets/tax/profile-menu-heart.webp'
import menuShieldIcon from '../assets/tax/profile-menu-shield.webp'
import menuBulbIcon from '../assets/tax/profile-menu-bulb.webp'
import menuHeadsetIcon from '../assets/tax/profile-menu-headset.webp'
import profileHeroBackground from '../assets/tax/profile-hero-bg.webp'

const profileIconSpriteUrl = `url("${profileIconSprite}")`
const profileHeroBackgroundUrl = `url("${profileHeroBackground}")`
const menuIconAssets = {
  heart: menuHeartIcon,
  shield: menuShieldIcon,
  bulb: menuBulbIcon,
  headset: menuHeadsetIcon,
}
const router = useRouter()
const showTaxId = ref(false)
const quickItems = computed(() => profile.value.quickItems)

let avatarTapCount = 0
let avatarTapTimer

function handleAvatarTap() {
  avatarTapCount += 1
  window.clearTimeout(avatarTapTimer)
  if (avatarTapCount >= 5) {
    avatarTapCount = 0
    router.replace('/admin')
    return
  }
  avatarTapTimer = window.setTimeout(() => {
    avatarTapCount = 0
  }, 1200)
}

onBeforeUnmount(() => {
  window.clearTimeout(avatarTapTimer)
})

const menuItems = [
  { title: '切换关怀版', icon: 'heart' },
  { title: '安全中心', icon: 'shield' },
  { title: '帮助中心', icon: 'bulb' },
  { title: '我要咨询', icon: 'headset' },
  { title: '关于&更新', icon: 'info' },
]
</script>

<style scoped>
.profile-page {
  container-type: inline-size;
  width: 100%;
  min-height: calc(100dvh - 72px - env(safe-area-inset-bottom));
  overflow: hidden;
  background: #f5f6f9;
  color: #171a1d;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif;
}
.sprite-icon {
  display: block;
  background-image: v-bind(profileIconSpriteUrl);
  background-repeat: no-repeat;
  background-size: 400% 200%;
}
.sprite-family { background-position: 0 0; }
.sprite-work { background-position: 33.333% 0; }
.sprite-bank { background-position: 66.667% 0; }
.sprite-eye { background-position: 100% 0; }
.profile-hero {
  position: relative;
  height: calc(67.2cqw + env(safe-area-inset-top));
  background-color: #1266ef;
  background-image: v-bind(profileHeroBackgroundUrl);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.avatar {
  position: absolute; z-index: 1; top: calc(10.8cqw + env(safe-area-inset-top)); left: 50%; width: 29.8cqw; height: 29.8cqw;
  transform: translateX(-50%); overflow: hidden; border-radius: 50%;
}
.avatar img { display: block; width: 100%; height: 100%; object-fit: contain; }
.identity-card {
  position: absolute; z-index: 2; left: 5.85cqw; right: 5.85cqw; bottom: 2.5cqw; height: 20.4cqw;
  display: flex; align-items: center; justify-content: space-between; overflow: hidden; padding: 0 0 0 6.35cqw;
  border: 0; border-radius: 3.4cqw 3.4cqw 0 0; background: linear-gradient(100deg, #ffead8, #fac894);
  color: #292321; text-align: left; box-shadow: 0 -1px 5px rgba(14,76,147,.1);
}
.identity-text { display: flex; min-width: 0; flex-direction: column; gap: 1.25cqw; }
.identity-text strong { font-size: 4.32cqw; font-weight: 600; }
.tax-id-row { display: flex; min-width: 0; align-items: center; gap: 1.2cqw; color: #be6d2f; font-size: 3.05cqw; white-space: nowrap; }
.tax-id-row > span { min-width: 0; }
.eye-button {
  display: grid; width: 4.7cqw; height: 4.7cqw; flex: 0 0 auto; place-items: center; padding: 0;
  border: 0; background: transparent; color: #c7793b; cursor: pointer;
}
.eye-button svg { width: 4.1cqw; height: 4.1cqw; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.eye-button .sprite-eye { width: 6.1cqw; height: 6.1cqw; }
.identity-link {
  align-self: flex-start; flex: 0 0 auto; margin-top: 5.25cqw; padding: 1.1cqw 2.2cqw 1.1cqw 2.8cqw;
  border: 0; border-radius: 4cqw 0 0 4cqw; background: linear-gradient(90deg, #efa75d, #ed8d28); color: #fff; font-size: 3.56cqw; white-space: nowrap; cursor: pointer;
}
.identity-link b { font-size: 5cqw; font-weight: 300; line-height: .5; vertical-align: -.35cqw; }
.profile-content {
  position: relative; z-index: 3; min-height: 118cqw; box-sizing: border-box; margin-top: -5.3cqw; padding: 3.3cqw 3.05cqw 21cqw;
  border-radius: 6cqw 6cqw 0 0; background: #f5f6f9;
}
.quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3cqw; }
.quick-card {
  display: flex; height: 29.8cqw; flex-direction: column; align-items: center; padding: 2cqw 1cqw;
  border: 0; border-radius: 2cqw; background: #fff; color: #15181b; cursor: pointer; box-shadow: 0 1px 5px rgba(39,75,117,.035);
}
.quick-icon { position: relative; width: 11.8cqw; height: 11.8cqw; margin-bottom: .25cqw; }
.quick-card strong { font-size: 4.05cqw; font-weight: 600; line-height: 1.45; white-space: nowrap; }
.quick-tag { min-width: 8.8cqw; margin-top: 1.25cqw; padding: 0 1.8cqw; border: .45cqw solid #308df2; border-radius: 3cqw; color: #2789ed; font-size: 3.05cqw; line-height: 1.65; }
.quick-tag.filled { background: #398cf2; color: #fff; }
.menu-card { margin-top: 3.05cqw; padding: 2.8cqw 0; border-radius: 2cqw; background: #fff; }
.menu-card button {
  display: grid; width: 100%; height: 11.45cqw; grid-template-columns: 32px 1fr auto; align-items: center; gap: 2.5cqw;
  padding: 0 5.1cqw; border: 0; background: transparent; color: #171a1d; text-align: left; cursor: pointer;
}
.menu-card button:active, .quick-card:active, .identity-card:active { filter: brightness(.97); }
.menu-card .info-icon {
  display: block;
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  padding: 4px;
  object-fit: contain;
}
.menu-card .menu-icon {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: contain;
  image-rendering: auto;
  transform: translateZ(0);
}
.menu-card span { font-size: 4.07cqw; font-weight: 500; }
.menu-card b { font-size: 7cqw; font-weight: 300; line-height: 1; }
.logout-button {
  width: 100%; height: 12.7cqw; margin-top: 3.1cqw; border: 0; border-radius: 2cqw; background: #fff;
  color: #2589ee; font: 500 4.07cqw/1 "PingFang SC", sans-serif; cursor: pointer;
}
button:focus-visible { outline: 2px solid #258afa; outline-offset: -3px; }
</style>

// 兼容层：消息列表与未读状态已统一收敛到 src/state/appStore.js。
export { clearUnread, messages, readMessage, unreadCount } from './appStore'

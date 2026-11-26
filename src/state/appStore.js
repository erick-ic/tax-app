import { computed, reactive, ref } from 'vue'
import { cloneData, createDefaultAppData, normalizeAppData, validateAppData } from '../data/schema'
import { getDataMode, loadAppData, readLocalSnapshot, resetAppData, saveAppData, writeLocalSnapshot } from '../services/dataProvider'

const initialData = readLocalSnapshot() || createDefaultAppData()

export const appData = reactive(initialData)
export const dataMode = ref(getDataMode())
export const dataSyncing = ref(false)
export const dataError = ref('')

function applyAppData(next) {
  const normalized = normalizeAppData(next)
  appData.version = normalized.version
  appData.updatedAt = normalized.updatedAt
  appData.profile = normalized.profile
  appData.taxMonths = normalized.taxMonths
  appData.messages = normalized.messages
  appData.home = normalized.home
}

export async function initAppData() {
  if (dataMode.value === 'local') {
    const local = readLocalSnapshot()
    if (local) applyAppData(local)
    return
  }
  dataSyncing.value = true
  dataError.value = ''
  try {
    const remote = await loadAppData()
    applyAppData(remote)
  } catch (error) {
    dataError.value = error instanceof Error ? error.message : '数据同步失败，已使用本地兜底数据'
  } finally {
    dataSyncing.value = false
  }
}

export async function refreshAppData() {
  dataSyncing.value = true
  dataError.value = ''
  try {
    const latest = await loadAppData()
    applyAppData(latest)
    return latest
  } catch (error) {
    const message = error instanceof Error ? error.message : '数据同步失败'
    dataError.value = message
    throw new Error(message)
  } finally {
    dataSyncing.value = false
  }
}

export async function saveAllData(nextData, options = {}) {
  const validation = validateAppData(nextData)
  if (!validation.valid) {
    throw new Error(validation.errors[0])
  }
  const saved = await saveAppData(nextData, options)
  applyAppData(saved)
  return saved
}

export async function resetAllData(options = {}) {
  const defaults = await resetAppData(options)
  applyAppData(defaults)
  return defaults
}

export function exportAppDataJson() {
  return JSON.stringify(cloneData(appData), null, 2)
}

export async function importAppDataJson(jsonText, options = {}) {
  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('JSON 解析失败，请检查语法格式')
  }
  return saveAllData(parsed, options)
}

export const profile = computed(() => appData.profile)
export const maskedTaxpayerId = computed(() => {
  const id = String(appData.profile.taxpayerId || '')
  if (id.length <= 2) return id
  return `${id.slice(0, 1)}${'*'.repeat(Math.max(1, id.length - 2))}${id.slice(-1)}`
})

export const homeData = computed(() => appData.home)

export const messages = computed(() => appData.messages)
export const unreadCount = computed(() => appData.messages.filter((item) => item.unread).length)

export function readMessage(item) {
  if (!item || !item.unread) return
  item.unread = false
  writeLocalSnapshot(cloneData(appData))
}

export function clearUnread() {
  let changed = false
  appData.messages.forEach((item) => {
    if (item.unread) {
      item.unread = false
      changed = true
    }
  })
  if (changed) {
    writeLocalSnapshot(cloneData(appData))
  }
}

export const taxMonths = computed(() => appData.taxMonths)

export function getLatestTaxYear() {
  const years = appData.taxMonths.map((month) => Number(month.period.slice(0, 4))).filter(Number.isFinite)
  return Math.max(new Date().getFullYear(), ...years)
}

export function getTaxRecordsByYear(year, incomeTypes = []) {
  return appData.taxMonths
    .filter((month) => month.period.slice(0, 4) === String(year))
    .flatMap((month) => month.records
      .filter((record) => incomeTypes.length === 0 || incomeTypes.includes(record.incomeType))
      .map((record) => ({ ...record, period: month.period })))
    .sort((a, b) => b.period.localeCompare(a.period))
}

export function getTaxRecordById(id) {
  for (const month of appData.taxMonths) {
    const record = month.records.find((item) => item.id === id)
    if (record) return { ...record, period: month.period }
  }
  return undefined
}

export function sumMoney(records, field) {
  const cents = records.reduce((sum, record) => sum + Math.round(Number(record[field]) * 100), 0)
  return (cents / 100).toFixed(2)
}

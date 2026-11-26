import { createDefaultAppData, normalizeAppData } from '../data/schema'

const STORAGE_KEY = 'tax-app:data:v1'

export function getDataMode() {
  const mode = String(import.meta.env.VITE_DATA_MODE || 'local').trim().toLowerCase()
  if (mode === 'api' || mode === 'remote-json') return mode
  return 'local'
}

export function getRemoteDataUrl() {
  return String(import.meta.env.VITE_DATA_URL || './data/app-data.json').trim()
}

export function getApiBaseUrl() {
  return String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
}

export function readLocalSnapshot() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeAppData(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeLocalSnapshot(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 隐私模式或存储受限时忽略本地缓存写入错误
  }
}

export function clearLocalSnapshot() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export async function loadAppData() {
  const mode = getDataMode()

  if (mode === 'local') {
    return readLocalSnapshot() || createDefaultAppData()
  }

  if (mode === 'remote-json') {
    const response = await fetch(getRemoteDataUrl(), { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`拉取静态数据失败 (${response.status})`)
    }
    const parsed = normalizeAppData(await response.json())
    writeLocalSnapshot(parsed)
    return parsed
  }

  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('已启用 api 模式，但未配置 VITE_API_BASE_URL')
  }
  const response = await fetch(`${base}/app-data`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`接口加载失败 (${response.status})`)
  }
  const parsed = normalizeAppData(await response.json())
  writeLocalSnapshot(parsed)
  return parsed
}

export async function saveAppData(nextData, options = {}) {
  const normalized = normalizeAppData({
    ...nextData,
    updatedAt: new Date().toISOString(),
  })
  const mode = getDataMode()

  if (mode === 'api') {
    const base = getApiBaseUrl()
    if (!base) {
      throw new Error('未配置 VITE_API_BASE_URL，无法保存到后端')
    }
    const headers = { 'Content-Type': 'application/json' }
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`
    }
    const response = await fetch(`${base}/app-data`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(normalized),
    })
    if (!response.ok) {
      throw new Error(`保存到后端失败 (${response.status})`)
    }
    writeLocalSnapshot(normalized)
    return normalized
  }

  // local 模式直接写入 localStorage；remote-json 模式下写入本地预览缓存，便于导出 JSON 发布
  writeLocalSnapshot(normalized)
  return normalized
}

export async function resetAppData(options = {}) {
  const defaults = createDefaultAppData()
  clearLocalSnapshot()
  if (getDataMode() === 'api') {
    return saveAppData(defaults, options)
  }
  return defaults
}

import { getSettings, getSnapshot, removeSnapshot, saveSnapshot } from '@shared/storage'
import { snapshotKey, STORAGE_KEYS, type FormSnapshot, type Language, type SaveFormSettings } from '@shared/types'
import { currentFieldsForFormSelector } from './detectors/form-scanner'
import { readFieldValue } from './detectors/field-value'

const DEBOUNCE_MS = 500

/**
 * Tinh nang tu dong luu ban nhap mac dinh TAT, nguoi dung tu bat qua toggle
 * trong Side Panel. Khi tat: khong luu ban nhap moi va khong hien banner khoi
 * phuc (tinh nang "Phien ban da luu (co ten)" khong bi anh huong, vi do la
 * nguoi dung chu dong bam luu).
 */
let autoSaveEnabled = false
let language: Language = 'vi'

export function isAutoSaveEnabled(): boolean {
  return autoSaveEnabled
}

export function getLanguage(): Language {
  return language
}

/** Doc cai dat luc khoi tao, va tu dong cap nhat khi nguoi dung bat/tat qua toggle hoac doi ngon ngu. */
export async function initAutoSaveSetting(): Promise<void> {
  const settings = await getSettings()
  autoSaveEnabled = settings.autoSaveEnabled
  language = settings.language

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEYS.settings]) return
    const updated = changes[STORAGE_KEYS.settings].newValue as SaveFormSettings | undefined
    autoSaveEnabled = Boolean(updated?.autoSaveEnabled)
    language = updated?.language ?? 'vi'
  })
}

function buildSnapshot(formSelector: string): FormSnapshot {
  return {
    hostname: location.hostname,
    pathname: location.pathname,
    formSelector,
    fields: currentFieldsForFormSelector(formSelector).map(readFieldValue),
    updatedAt: Date.now(),
  }
}

const debounceTimers = new Map<string, number>()

/** Luu ban nhap (debounce) cho mot formSelector, chi khi tinh nang auto-save dang bat. */
export function scheduleSave(formSelector: string): void {
  if (!autoSaveEnabled) return

  const key = snapshotKey(location.hostname, location.pathname, formSelector)
  const existingTimer = debounceTimers.get(key)
  if (existingTimer) window.clearTimeout(existingTimer)

  const timer = window.setTimeout(() => {
    void saveSnapshot(key, buildSnapshot(formSelector))
    debounceTimers.delete(key)
  }, DEBOUNCE_MS)
  debounceTimers.set(key, timer)
}

/** Lay ban nhap da luu (neu co) cho mot formSelector. */
export async function getExistingSnapshot(formSelector: string): Promise<FormSnapshot | undefined> {
  return getSnapshot(snapshotKey(location.hostname, location.pathname, formSelector))
}

/** Xoa ban nhap da luu cho mot formSelector (khi nguoi dung bam "Bo qua" tren banner). */
export async function discardSnapshot(formSelector: string): Promise<void> {
  await removeSnapshot(snapshotKey(location.hostname, location.pathname, formSelector))
}

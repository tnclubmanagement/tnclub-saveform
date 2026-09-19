import { DEFAULT_SETTINGS, STORAGE_KEYS, type FormSnapshot, type FormVersion, type SaveFormSettings } from './types'

export async function getSettings(): Promise<SaveFormSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.settings)
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.settings] as SaveFormSettings | undefined) }
}

export async function setSettings(settings: SaveFormSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings })
}

export async function saveSnapshot(key: string, snapshot: FormSnapshot): Promise<void> {
  await chrome.storage.local.set({ [key]: snapshot })
}

export async function getSnapshot(key: string): Promise<FormSnapshot | undefined> {
  const result = await chrome.storage.local.get(key)
  return result[key] as FormSnapshot | undefined
}

export async function removeSnapshot(key: string): Promise<void> {
  await chrome.storage.local.remove(key)
}

export async function getAllSnapshots(): Promise<Record<string, FormSnapshot>> {
  const all = await chrome.storage.local.get(null)
  const snapshots: Record<string, FormSnapshot> = {}
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith(STORAGE_KEYS.snapshotPrefix)) {
      snapshots[key] = value as FormSnapshot
    }
  }
  return snapshots
}

/** Danh sach cac phien ban co ten cua mot form (rieng biet voi ban nhap tu dong). */
export async function getVersions(key: string): Promise<FormVersion[]> {
  const result = await chrome.storage.local.get(key)
  return (result[key] as FormVersion[] | undefined) ?? []
}

export async function setVersions(key: string, versions: FormVersion[]): Promise<void> {
  await chrome.storage.local.set({ [key]: versions })
}

export interface FieldValue {
  /** CSS selector duy nhat (best-effort) tro toi field trong DOM */
  selector: string
  /** name/id cua field, dung lam fallback khi selector khong khop nua */
  name: string
  type: string
  value: string | boolean
}

export interface FormSnapshot {
  hostname: string
  pathname: string
  /** selector cua form, hoac "__no_form__" neu field khong nam trong the <form> */
  formSelector: string
  fields: FieldValue[]
  updatedAt: number
}

export interface FormVersion {
  /** id duy nhat cua phien ban, dung de xoa/khoi phuc dung phien ban */
  id: string
  /** ten do nguoi dung dat, vd: "Ban nop lan 1" */
  name: string
  fields: FieldValue[]
  savedAt: number
}

export type Language = 'vi' | 'en'

export interface SaveFormSettings {
  /** Danh sach hostname nguoi dung cho phep theo doi form (vd: "example.com") */
  allowedHosts: string[]
  /** So ngay giu du lieu truoc khi tu dong xoa */
  retentionDays: number
  /** Bat/tat tinh nang tu dong luu ban nhap (mac dinh tat, nguoi dung tu bat qua toggle). */
  autoSaveEnabled: boolean
  /** Ngon ngu hien thi cua Side Panel/Options/banner, nguoi dung tu chon trong Options. */
  language: Language
}

export const DEFAULT_SETTINGS: SaveFormSettings = {
  allowedHosts: [],
  retentionDays: 7,
  autoSaveEnabled: false,
  language: 'vi',
}

export const STORAGE_KEYS = {
  settings: 'saveform:settings',
  snapshotPrefix: 'saveform:snapshot:',
  versionPrefix: 'saveform:versions:',
} as const

export function snapshotKey(hostname: string, pathname: string, formSelector: string): string {
  return `${STORAGE_KEYS.snapshotPrefix}${hostname}${pathname}::${formSelector}`
}

/** Key luu danh sach cac phien ban co ten cua mot form (khac voi ban nhap tu dong). */
export function versionListKey(hostname: string, pathname: string, formSelector: string): string {
  return `${STORAGE_KEYS.versionPrefix}${hostname}${pathname}::${formSelector}`
}

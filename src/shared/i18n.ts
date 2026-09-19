import type { Language } from './types'

type Vars = Record<string, string | number>

/** Ten hien thi cua ung dung, dung o moi noi qua placeholder {appName} de doi ten 1 cho duy nhat. */
export const APP_NAME = 'TNClubManagement Save Form'

/**
 * Tu dien da ngon ngu cho toan bo UI (Side Panel, Options, banner cua content
 * script). Dung he thong tu viet (khong dung chrome.i18n) vi chrome.i18n khoa
 * theo ngon ngu trinh duyet, khong cho nguoi dung tu chon trong app.
 */
const dictionaries = {
  vi: {
    'sidepanel.title': '{appName}',
    'sidepanel.savedVersions.title': 'Phiên bản đã lưu',
    'sidepanel.savedVersions.subtitle': 'Lưu nhiều phiên bản có tên cho từng form, khôi phục lại bất cứ lúc nào.',
    'sidepanel.reload.title': 'Tải lại danh sách form trên trang này',
    'sidepanel.draft.title': 'Bản nháp tự động',
    'sidepanel.draft.subtitle': '{appName} tự lưu tạm khi bạn gõ, dùng để khôi phục nếu lỡ tải lại trang. Mặc định tắt.',
    'sidepanel.draft.toggleTitle': 'Bật/tắt tự động lưu bản nháp',
    'sidepanel.openOptions': 'Quản lý domain được phép →',
    'sidepanel.noFormsFound': 'Không tìm thấy form nào trên trang này (hoặc domain này chưa được cấp quyền trong phần Cài đặt).',
    'sidepanel.noActiveTab': 'Không xác định được tab hiện tại',
    'sidepanel.formFieldCount': 'Form ({count} trường)',
    'sidepanel.versionNamePlaceholder': 'Tên phiên bản, ví dụ: Bản nộp lần 1',
    'sidepanel.save': 'Lưu',
    'sidepanel.overwrite': 'Ghi đè',
    'sidepanel.overwriteHint': 'Đã có phiên bản "{name}" — bấm để ghi đè bằng dữ liệu hiện tại.',
    'sidepanel.restoreVersion.title': 'Khôi phục phiên bản này vào form',
    'sidepanel.overwriteVersion.title': 'Ghi đè dữ liệu hiện tại của form lên phiên bản này',
    'sidepanel.deleteVersion.title': 'Xóa phiên bản này',
    'sidepanel.confirmDeleteVersion': 'Xóa phiên bản "{name}"? Hành động này không thể hoàn tác.',
    'sidepanel.versionFieldCount': '{count} trường đã lưu',
    'sidepanel.noFieldsToSave': 'Không lưu được: không đọc được trường dữ liệu nào từ form (0 trường). Vui lòng bấm "Tải lại" rồi thử lại.',
    'sidepanel.noDraftsYet': 'Chưa có bản nháp tự động nào cho trang này.',
    'sidepanel.draftCount': '{count} bản nháp tự động.',
    'sidepanel.draftItem': '{path} ({count} trường) - {time}',
    'sidepanel.confirmDeleteDraft': 'Xóa bản nháp tự động của "{path}"? Hành động này không thể hoàn tác.',
    'sidepanel.delete': 'Xóa',

    'options.pageTitle': '{appName} - Cài đặt',
    'options.subtitle': 'Cài đặt chung',
    'options.domains.title': 'Domain được phép theo dõi form',
    'options.domains.desc': '{appName} chỉ hoạt động trên các domain bạn thêm vào danh sách này. Bạn sẽ được Chrome hỏi cấp quyền truy cập khi thêm domain mới.',
    'options.domains.placeholder': 'Ví dụ: example.com hoặc localhost:9443',
    'options.add': 'Thêm',
    'options.domainInvalid': 'Domain không hợp lệ. Ví dụ hợp lệ: example.com, localhost:9443, 127.0.0.1:8080',
    'options.domainExists': 'Domain này đã được thêm.',
    'options.permissionDenied': 'Bạn cần cấp quyền truy cập domain này để {appName} hoạt động.',
    'options.confirmRemoveHost': 'Xóa domain "{host}" khỏi danh sách được phép? {appName} sẽ ngừng theo dõi form trên domain này.',
    'options.retention.title': 'Thời gian lưu trữ',
    'options.retention.desc': 'Bản nháp tự động sẽ bị xóa sau số ngày dưới đây (không áp dụng cho các phiên bản bạn đã đặt tên).',
    'options.retention.prefix': 'Xóa bản nháp sau',
    'options.retention.unit': 'ngày',
    'options.language.title': 'Ngôn ngữ hiển thị',
    'options.language.desc': 'Áp dụng cho Side Panel, trang Cài đặt và banner khôi phục trên trang web.',
    'options.delete': 'Xóa',

    'banner.message': '{appName}: phát hiện dữ liệu form đã lưu trước đó.',
    'banner.restore': 'Khôi phục',
    'banner.dismiss': 'Bỏ qua',
  },
  en: {
    'sidepanel.title': '{appName}',
    'sidepanel.savedVersions.title': 'Saved versions',
    'sidepanel.savedVersions.subtitle': 'Save multiple named versions per form, restore any of them anytime.',
    'sidepanel.reload.title': 'Reload the form list for this page',
    'sidepanel.draft.title': 'Automatic draft',
    'sidepanel.draft.subtitle': '{appName} auto-saves as you type, so you can recover if the page reloads. Off by default.',
    'sidepanel.draft.toggleTitle': 'Toggle automatic draft saving',
    'sidepanel.openOptions': 'Manage allowed domains →',
    'sidepanel.noFormsFound': 'No form found on this page (or this domain has not been granted permission in Settings).',
    'sidepanel.noActiveTab': 'Could not determine the current tab',
    'sidepanel.formFieldCount': 'Form ({count} fields)',
    'sidepanel.versionNamePlaceholder': 'Version name, e.g. Submission #1',
    'sidepanel.save': 'Save',
    'sidepanel.overwrite': 'Overwrite',
    'sidepanel.overwriteHint': 'A version named "{name}" already exists — click to overwrite it with the current data.',
    'sidepanel.restoreVersion.title': 'Restore this version into the form',
    'sidepanel.overwriteVersion.title': "Overwrite this version with the form's current data",
    'sidepanel.deleteVersion.title': 'Delete this version',
    'sidepanel.confirmDeleteVersion': 'Delete version "{name}"? This action cannot be undone.',
    'sidepanel.versionFieldCount': '{count} field(s) saved',
    'sidepanel.noFieldsToSave': 'Could not save: no field data could be read from the form (0 fields). Please click "Reload" and try again.',
    'sidepanel.noDraftsYet': 'No automatic draft for this page yet.',
    'sidepanel.draftCount': '{count} automatic draft(s).',
    'sidepanel.draftItem': '{path} ({count} fields) - {time}',
    'sidepanel.confirmDeleteDraft': 'Delete the automatic draft for "{path}"? This action cannot be undone.',
    'sidepanel.delete': 'Delete',

    'options.pageTitle': '{appName} - Settings',
    'options.subtitle': 'General settings',
    'options.domains.title': 'Domains allowed to track forms',
    'options.domains.desc': '{appName} only runs on domains you add to this list. Chrome will ask for permission when you add a new domain.',
    'options.domains.placeholder': 'e.g. example.com or localhost:9443',
    'options.add': 'Add',
    'options.domainInvalid': 'Invalid domain. Valid examples: example.com, localhost:9443, 127.0.0.1:8080',
    'options.domainExists': 'This domain has already been added.',
    'options.permissionDenied': 'You need to grant access to this domain for {appName} to work.',
    'options.confirmRemoveHost': 'Remove domain "{host}" from the allowed list? {appName} will stop tracking forms on this domain.',
    'options.retention.title': 'Data retention',
    'options.retention.desc': 'Automatic drafts are deleted after this many days (does not apply to named versions you saved).',
    'options.retention.prefix': 'Delete drafts after',
    'options.retention.unit': 'day(s)',
    'options.language.title': 'Display language',
    'options.language.desc': 'Applies to the Side Panel, the Settings page, and the restore banner on web pages.',
    'options.delete': 'Delete',

    'banner.message': '{appName}: found previously saved form data.',
    'banner.restore': 'Restore',
    'banner.dismiss': 'Dismiss',
  },
} as const satisfies Record<Language, Record<string, string>>

export type MessageKey = keyof typeof dictionaries.vi

export function translate(lang: Language, key: MessageKey, vars?: Vars): string {
  const template = dictionaries[lang]?.[key] ?? dictionaries.vi[key]
  const mergedVars: Vars = { appName: APP_NAME, ...vars }
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(mergedVars[name] ?? ''))
}

/** Ap dung ban dich cho cac element khai bao data-i18n(-placeholder|-title) trong HTML tinh. */
export function applyStaticTranslations(lang: Language): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as MessageKey | undefined
    if (key) el.textContent = translate(lang, key)
  })
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder as MessageKey | undefined
    if (key) el.placeholder = translate(lang, key)
  })
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as MessageKey | undefined
    if (key) el.title = translate(lang, key)
  })
}

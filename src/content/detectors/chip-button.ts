/**
 * Heuristic suy doan cho cac nut "chip selector" (nhom nut anh em, khong co
 * ARIA gi ca, chi khac nhau qua class CSS - vd cac the "Chon phan mon" duoc
 * dung bang <button> Tailwind/React). RUI RO CAO NHAT trong cac detector,
 * vi day la suy doan pattern class, khong phai chuan HTML/ARIA. Nen xem xet
 * gioi han theo domain (xem STORAGE_KEYS/settings) khi ap dung cho trang moi.
 */

export const MIN_BUTTON_GROUP_SIZE = 3

// Nhung tu khoa hanh dong: neu nut co text chua tu nay, KHONG coi la the chon
// de tranh vo tinh bam nham nut pha huy/gui du lieu khi khoi phuc (vd "Xoa", "Gui").
const ACTION_KEYWORDS = [
  'xóa', 'xoa', 'delete', 'remove', 'gửi', 'gui', 'submit', 'lưu', 'luu', 'save',
  'hủy', 'huy', 'cancel', 'xác nhận', 'xac nhan', 'confirm', 'đóng', 'dong', 'close',
  'đăng nhập', 'dang nhap', 'login', 'đăng ký', 'dang ky', 'register', 'quay lại', 'quay lai', 'back',
]

function hasActionKeyword(el: HTMLElement): boolean {
  const text = (el.textContent ?? '').trim().toLowerCase()
  return ACTION_KEYWORDS.some((keyword) => text.includes(keyword))
}

export function getButtonSiblings(el: HTMLButtonElement): HTMLButtonElement[] {
  if (!el.parentElement) return [el]
  return Array.from(el.parentElement.children).filter((c): c is HTMLButtonElement => c instanceof HTMLButtonElement && c.type === 'button')
}

// Cac class lien quan den bo cuc/responsive (vd "col-span-2", "sm:col-span-1")
// khong phan anh trang thai chon/bo chon, ma chi de sap xep grid cho dep (vd
// item le cuoi cung trong luoi 5 cot tren man rong nhung chiem 2 cot tren man
// hep). Neu khong loai bo, nut nao co class bo cuc rieng se luon bi hieu nham
// la "khac biet" = "dang duoc chon" du thuc te co the khong phai.
const LAYOUT_CLASS_PATTERNS = [/^col-span-/, /^row-span-/, /^order-/, /^(sm|md|lg|xl|2xl):/]

/** Chuan hoa class de so sanh trang thai chon: bo class bo cuc, sap xep on dinh. */
function normalizeButtonClassName(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => token && !LAYOUT_CLASS_PATTERNS.some((pattern) => pattern.test(token)))
    .sort()
    .join(' ')
}

function majorityClassName(buttons: HTMLButtonElement[]): { className: string; count: number } {
  const counts = new Map<string, number>()
  for (const btn of buttons) {
    const normalized = normalizeButtonClassName(btn.className)
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
  }
  let className = normalizeButtonClassName(buttons[0]?.className ?? '')
  let count = 0
  for (const [cls, c] of counts) {
    if (c > count) {
      className = cls
      count = c
    }
  }
  return { className, count }
}

/**
 * Nhom nut duoc coi la mot "chip selector" khi co it nhat MIN_BUTTON_GROUP_SIZE
 * nut anh em, va da so trong chung co class giong het nhau (chi 1-2 nut khac
 * biet la nut dang duoc chon). Cach nay tranh nham voi nhom nut hanh dong
 * (vd OK/Huy) vi cac nut do thuong co class khac nhau hoan toan.
 */
export function isGroupedButton(el: Element): el is HTMLButtonElement {
  if (!(el instanceof HTMLButtonElement) || el.type !== 'button' || hasActionKeyword(el)) return false
  const siblings = getButtonSiblings(el)
  if (siblings.length < MIN_BUTTON_GROUP_SIZE) return false
  const { count } = majorityClassName(siblings)
  return count >= Math.max(2, siblings.length - 2)
}

/** Nut "dang duoc chon" la nut co class (da chuan hoa) khac voi class pho bien nhat trong nhom anh em. */
export function readGroupedButtonState(el: HTMLButtonElement): boolean {
  const siblings = getButtonSiblings(el)
  const { className, count } = majorityClassName(siblings)
  if (count === siblings.length) return false // tat ca giong nhau, khong phan biet duoc
  return normalizeButtonClassName(el.className) !== className
}

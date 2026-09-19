import { isFillable } from './native-fields'

/**
 * Phan tu "the chon" tuy bien co danh dau ARIA chuan (role="radio"/"option"/...,
 * aria-checked/pressed/selected). An toan de ap dung cho moi domain vi day la
 * chuan accessibility, khong phai suy doan tu class CSS.
 */
export type AriaChoiceElement = HTMLElement

export const ARIA_CHOICE_ROLES = ['radio', 'option', 'switch', 'tab', 'menuitemradio', 'menuitemcheckbox']
export const ARIA_STATE_ATTRS = ['aria-checked', 'aria-pressed', 'aria-selected']

export function isAriaChoice(el: Element): el is AriaChoiceElement {
  if (!(el instanceof HTMLElement) || isFillable(el)) return false
  const role = el.getAttribute('role')
  if (role && ARIA_CHOICE_ROLES.includes(role)) return true
  return ARIA_STATE_ATTRS.some((attr) => el.hasAttribute(attr))
}

/** Doc trang thai chon/bo chon cua mot the ARIA tuy bien, dua vao cac thuoc tinh trang thai pho bien. */
export function readAriaState(el: AriaChoiceElement): boolean {
  for (const attr of ARIA_STATE_ATTRS) {
    const value = el.getAttribute(attr)
    if (value !== null) return value === 'true'
  }
  return false
}

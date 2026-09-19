import { isFillable, isSkippableInput, type Fillable } from './native-fields'
import { isChoiceElement, type ChoiceElement } from './choice-elements'
import { ARIA_STATE_ATTRS } from './aria-choice'

export const NO_FORM_SELECTOR = '__no_form__'

/** Phan tu duoc SaveForm theo doi: field HTML chuan hoac "the chon" tuy bien. */
export type Trackable = Fillable | ChoiceElement

export function isTrackable(el: Element): el is Trackable {
  return isFillable(el) || isChoiceElement(el)
}

/** Best-effort CSS selector cho mot element, uu tien id/name, roi den vi tri trong DOM. */
export function buildSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`
  const name = el.getAttribute('name')
  const tag = el.tagName.toLowerCase()
  if (name) return `${tag}[name="${CSS.escape(name)}"]`

  const parent = el.parentElement
  if (!parent) return tag
  const siblingIndex = Array.from(parent.children).indexOf(el)
  return `${buildSelector(parent)} > ${tag}:nth-child(${siblingIndex + 1})`
}

/** Quet toan bo DOM, gom field theo form cha (hoac NO_FORM_SELECTOR neu khong nam trong <form>). */
export function getFormGroups(): Map<string, Trackable[]> {
  const groups = new Map<string, Trackable[]>()
  const candidates = document.querySelectorAll(
    `input, textarea, select, button[type="button"], [role], ${ARIA_STATE_ATTRS.map((attr) => `[${attr}]`).join(', ')}`,
  )
  const allFields = Array.from(candidates)
    .filter(isTrackable)
    .filter((el) => !(isFillable(el) && isSkippableInput(el)))

  for (const field of allFields) {
    const form = field.closest('form')
    const key = form ? buildSelector(form) : NO_FORM_SELECTOR
    const group = groups.get(key) ?? []
    group.push(field)
    groups.set(key, group)
  }
  return groups
}

/** Doc lai field hien tai cua mot formSelector, vi field co the them/mat do trang la SPA. */
export function currentFieldsForFormSelector(formSelector: string): Trackable[] {
  return getFormGroups().get(formSelector) ?? []
}

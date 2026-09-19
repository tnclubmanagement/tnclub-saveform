import type { FieldValue } from '@shared/types'
import { isFillable } from './native-fields'
import { readChoiceState, applyChoiceState } from './choice-elements'
import { isGroupedButton } from './chip-button'
import { buildSelector, type Trackable } from './form-scanner'

/** Doc gia tri hien tai cua mot field (native hoac the chon tuy bien) thanh FieldValue de luu tru. */
export function readFieldValue(el: Trackable): FieldValue {
  if (!isFillable(el)) {
    return { selector: buildSelector(el), name: el.getAttribute('name') ?? '', type: 'choice', value: readChoiceState(el) }
  }

  const value = el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value

  return {
    selector: buildSelector(el),
    name: el.getAttribute('name') ?? '',
    type: el instanceof HTMLInputElement ? el.type : el.tagName.toLowerCase(),
    value,
  }
}

/** Ap mot FieldValue da luu vao field trong DOM. */
export function applyFieldValue(el: Trackable, field: FieldValue): void {
  if (!isFillable(el)) {
    applyChoiceState(el, Boolean(field.value))
    return
  }

  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
    el.checked = Boolean(field.value)
  } else {
    el.value = String(field.value)
  }
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

/** Tim gia tri da luu khop voi field hien tai: uu tien selector, fallback ve name khi DOM doi vi tri. */
function findSavedValue(savedFields: FieldValue[], el: Trackable): FieldValue | undefined {
  const currentSelector = buildSelector(el)
  return savedFields.find((f) => f.selector === currentSelector || (f.name && f.name === el.getAttribute('name')))
}

/**
 * Ap toan bo gia tri da luu khop duoc vao danh sach field hien tai (dung khi
 * khoi phuc banner/phien ban).
 *
 * Voi nhom "chip button" (radio-like, loai tru lan nhau), CHI cho phep click
 * (chon) toi da 1 nut moi nhom cha (parentElement), bat ke du lieu da luu co
 * bao nhieu entry mang gia tri true. Day la lop bao ve cho du lieu cu da bi
 * luu sai truoc khi sua bug (vd 2 nut cung mang gia tri true trong 1 nhom) -
 * neu khong chan, khoi phuc se click ca 2 nut, va nut xu ly sau cung trong
 * DOM luon "thang" (ket qua sai lap lai du logic click da duoc sua).
 */
export function applySavedFields(fields: Trackable[], savedFields: FieldValue[]): void {
  const groupsHandled = new Set<Element>()

  for (const field of fields) {
    const saved = findSavedValue(savedFields, field)
    if (!saved) continue

    if (Boolean(saved.value) && isGroupedButton(field) && field.parentElement) {
      if (groupsHandled.has(field.parentElement)) continue
      groupsHandled.add(field.parentElement)
    }

    applyFieldValue(field, saved)
  }
}

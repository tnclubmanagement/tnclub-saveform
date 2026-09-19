/** Field HTML chuan: input/textarea/select. Ap dung cho moi domain, khong co rui ro suy doan. */
export type Fillable = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export function isFillable(el: Element): el is Fillable {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
}

export function isSkippableInput(el: Fillable): boolean {
  if (el instanceof HTMLInputElement) {
    return ['password', 'hidden', 'file', 'submit', 'button', 'reset'].includes(el.type)
  }
  return false
}

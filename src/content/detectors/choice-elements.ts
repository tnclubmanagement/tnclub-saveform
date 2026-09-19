import { isFillable } from './native-fields'
import { isAriaChoice, readAriaState } from './aria-choice'
import { isGroupedButton, readGroupedButtonState } from './chip-button'

/**
 * Module gop cac loai "the chon" tuy bien (khong phai input/select goc) thanh
 * mot interface chung, de phan con lai cua content script khong can biet
 * chi tiet tung detector (ARIA chuan hay heuristic chip-button suy doan).
 */
export type ChoiceElement = HTMLElement

export function isChoiceElement(el: Element): el is ChoiceElement {
  if (isFillable(el)) return false
  return isAriaChoice(el) || isGroupedButton(el)
}

export function readChoiceState(el: ChoiceElement): boolean {
  if (isAriaChoice(el)) return readAriaState(el)
  if (isGroupedButton(el)) return readGroupedButtonState(el)
  return false
}

/**
 * Click lai the neu trang thai hien tai khac trang thai muon khoi phuc.
 *
 * Voi nhom "chip button" (isGroupedButton - vd nut chon so cau/thoi gian lam
 * bai), CHI click khi desired=true, KHONG ep click de "bo chon" (desired=false).
 * Ly do: cac nhom nay la loai tru lan nhau (radio-like), chon dung 1 nut se tu
 * dong lam app bo chon cac nut con lai. Neu ep click ca nut can bo chon, vong
 * lap khoi phuc (applySavedFields) co the doc phai class DOM CU (app chua kip
 * re-render sau click truoc do trong cung luot dong bo), tuong nham nut do van
 * dang duoc chon, dan den click nham lam BAT LAI no thay vi giu trang thai da
 * dung - day chinh la nguyen nhan bug "luc nao cung chon lai 1 nut mac dinh".
 */
export function applyChoiceState(el: ChoiceElement, desired: boolean): void {
  if (isGroupedButton(el)) {
    if (desired && !readGroupedButtonState(el)) el.click()
    return
  }
  if (readChoiceState(el) !== desired) el.click()
}

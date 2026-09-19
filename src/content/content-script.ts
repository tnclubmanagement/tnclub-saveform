import { isFillable } from './detectors/native-fields'
import { isAriaChoice, ARIA_STATE_ATTRS } from './detectors/aria-choice'
import { getButtonSiblings, MIN_BUTTON_GROUP_SIZE } from './detectors/chip-button'
import { buildSelector, getFormGroups, currentFieldsForFormSelector, NO_FORM_SELECTOR, type Trackable } from './detectors/form-scanner'
import { readFieldValue, applySavedFields } from './detectors/field-value'
import { initAutoSaveSetting, isAutoSaveEnabled, getLanguage, scheduleSave, getExistingSnapshot, discardSnapshot } from './draft-autosave'
import { showRestoreBanner } from './restore-banner'
import { registerMessageBridge } from './message-bridge'
import { translate } from '@shared/i18n'

const trackedFields = new WeakSet<Trackable>()
const bannerShownFor = new Set<string>()

function trackField(field: Trackable, formSelector: string): void {
  if (trackedFields.has(field)) return
  trackedFields.add(field)

  // The chon tuy bien (ARIA/chip-button) khong bao gio bien "input"/"change";
  // trang thai chon cua no duoc theo doi rieng qua attributeObserver ben duoi.
  if (!isFillable(field)) return

  field.addEventListener('input', () => scheduleSave(formSelector))
  field.addEventListener('change', () => scheduleSave(formSelector))
}

/**
 * Quet toan bo field/form hien co trong DOM, gan listener cho field moi va
 * hien banner khoi phuc cho form moi xuat hien. Duoc goi lai moi khi DOM
 * thay doi (SPA render them field) chu khong chi luc content script chay lan dau.
 */
async function scanAndTrack(): Promise<void> {
  const groups = getFormGroups()

  for (const [formSelector, fields] of groups) {
    for (const field of fields) trackField(field, formSelector)

    if (!isAutoSaveEnabled() || bannerShownFor.has(formSelector)) continue
    const snapshot = await getExistingSnapshot(formSelector)
    if (snapshot && snapshot.fields.length > 0) {
      bannerShownFor.add(formSelector)
      const lang = getLanguage()
      showRestoreBanner(
        { message: translate(lang, 'banner.message'), restore: translate(lang, 'banner.restore'), dismiss: translate(lang, 'banner.dismiss') },
        () => applySavedFields(currentFieldsForFormSelector(formSelector), snapshot.fields),
        () => void discardSnapshot(formSelector),
      )
    }
  }
}

let scanScheduled = false

function scheduleScan(): void {
  if (scanScheduled) return
  scanScheduled = true
  window.setTimeout(() => {
    scanScheduled = false
    void scanAndTrack()
  }, 300)
}

/**
 * Khi mot the chon (ARIA hoac chip button) doi trang thai (aria-checked/pressed/
 * selected, hoac doi class CSS), luu lai form chua no. Ap dung cho ca truong hop
 * chi 1 nut trong nhom doi class (vd nut vua duoc bo chon) chu khong chi nut
 * vua duoc chon, vi ca 2 deu la tin hieu cho biet lua chon trong nhom da doi.
 */
function handleChoiceStateMutation(target: Node): void {
  if (!(target instanceof Element)) return
  const isRelevant = isAriaChoice(target) || (target instanceof HTMLButtonElement && target.type === 'button' && getButtonSiblings(target).length >= MIN_BUTTON_GROUP_SIZE)
  if (!isRelevant) return
  const form = target.closest('form')
  const formSelector = form ? buildSelector(form) : NO_FORM_SELECTOR
  scheduleSave(formSelector)
}

function init(): void {
  void initAutoSaveSetting().then(() => scanAndTrack())

  const structureObserver = new MutationObserver(() => scheduleScan())
  structureObserver.observe(document.documentElement, { childList: true, subtree: true })

  const attributeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) handleChoiceStateMutation(mutation.target)
  })
  attributeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [...ARIA_STATE_ATTRS, 'class'],
    subtree: true,
  })
}

init()

registerMessageBridge({
  listForms: () =>
    Array.from(getFormGroups().entries()).map(([formSelector, fields]) => ({
      formSelector,
      fieldCount: fields.length,
    })),
  getFields: (formSelector) => currentFieldsForFormSelector(formSelector).map(readFieldValue),
  applyFields: (formSelector, fields) => applySavedFields(currentFieldsForFormSelector(formSelector), fields),
})

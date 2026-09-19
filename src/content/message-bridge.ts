import type { FieldValue } from '@shared/types'

interface FormInfo {
  formSelector: string
  fieldCount: number
}

interface MessageBridgeHandlers {
  listForms: () => FormInfo[]
  getFields: (formSelector: string) => FieldValue[]
  applyFields: (formSelector: string, fields: FieldValue[]) => void
}

/**
 * Cho phep Side Panel giao tiep voi content script qua chrome.tabs.sendMessage:
 * (1) liet ke cac form tren trang, (2) doc gia tri field hien tai de luu
 * thanh phien ban co ten, (3) ap gia tri da luu vao form de khoi phuc.
 * Module nay chi lo phan "day message", logic thuc te do caller (content-script.ts)
 * cung cap qua cac handler.
 */
export function registerMessageBridge(handlers: MessageBridgeHandlers): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!message || typeof message !== 'object' || !('type' in message)) return undefined
    const msg = message as { type: string; formSelector?: string; fields?: FieldValue[] }

    if (msg.type === 'saveform:list-forms') {
      sendResponse({ forms: handlers.listForms() })
      return undefined
    }

    if (msg.type === 'saveform:get-fields' && msg.formSelector) {
      sendResponse({ fields: handlers.getFields(msg.formSelector) })
      return undefined
    }

    if (msg.type === 'saveform:apply-fields' && msg.formSelector && msg.fields) {
      handlers.applyFields(msg.formSelector, msg.fields)
      sendResponse({ ok: true })
      return undefined
    }

    return undefined
  })
}

interface RestoreBannerText {
  message: string
  restore: string
  dismiss: string
}

/**
 * Banner UI thuan (khong biet gi ve storage/DOM cu the) hien khi phat hien ban
 * nhap da luu truoc do. Cac hanh dong Khoi phuc/Bo qua duoc giao lai cho
 * caller qua callback, text hien thi cung do caller cung cap (da dich theo
 * ngon ngu nguoi dung chon) de module nay khong phu thuoc @shared/i18n.
 */
export function showRestoreBanner(text: RestoreBannerText, onRestore: () => void, onDismiss: () => void): void {
  const banner = document.createElement('div')
  banner.setAttribute('data-saveform-banner', 'true')
  banner.style.cssText =
    'position:fixed;top:12px;right:12px;z-index:2147483647;background:#1f2937;color:#fff;' +
    'padding:10px 14px;border-radius:8px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.25);' +
    'display:flex;gap:10px;align-items:center;'
  banner.innerHTML = `
    <span>${text.message}</span>
    <button data-action="restore" style="cursor:pointer;background:#2563eb;color:#fff;border:none;border-radius:4px;padding:4px 8px;">${text.restore}</button>
    <button data-action="dismiss" style="cursor:pointer;background:transparent;color:#d1d5db;border:1px solid #4b5563;border-radius:4px;padding:4px 8px;">${text.dismiss}</button>
  `

  banner.querySelector('[data-action="restore"]')?.addEventListener('click', () => {
    onRestore()
    banner.remove()
  })

  banner.querySelector('[data-action="dismiss"]')?.addEventListener('click', () => {
    onDismiss()
    banner.remove()
  })

  document.body.appendChild(banner)
}

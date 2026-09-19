/**
 * Chuyen mot host nguoi dung nhap (vd: "example.com", "localhost:9900") thanh
 * match pattern Chrome dung cho ca host_permissions/optional_host_permissions
 * (chrome.permissions.request/remove) va chrome.scripting.registerContentScripts.
 *
 * Luu y: mac du tai lieu Chrome co nhac toi cu phap <scheme>://<host>:<port>/<path>,
 * chrome.permissions.request tren thuc te tu choi (hoac loi khong nhat quan)
 * cac pattern co port tuong minh. Vi mot match pattern KHONG co port da tu
 * khop VOI MOI port cua host do, ta bo port khi dung host de dung lam match
 * pattern - dieu nay giup viec xin quyen/dang ky content script hoat dong on
 * dinh cho ca domain thuong lan localhost/IP dev co port (vd: localhost:9900).
 */
export function hostToMatchPattern(host: string): string {
  const hostname = host.split(':')[0]
  return `*://${hostname}/*`
}

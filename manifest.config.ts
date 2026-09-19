import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'TNClubManagement Save Form',
  description: 'Tự động lưu và khôi phục dữ liệu form trên các trang web đã chỉ định',
  version: pkg.version,
  icons: {
    16: 'public/icons/icon16.png',
    48: 'public/icons/icon48.png',
    128: 'public/icons/icon128.png',
  },
  action: {
    // Khong khai bao default_popup: bam icon se mo Side Panel (xem
    // chrome.sidePanel.setPanelBehavior trong service-worker.ts) de co
    // khong gian hien thi rong rai hon popup mac dinh.
    default_icon: {
      16: 'public/icons/icon16.png',
      48: 'public/icons/icon48.png',
      128: 'public/icons/icon128.png',
    },
  },
  side_panel: {
    default_path: 'src/sidepanel/sidepanel.html',
  },
  options_page: 'src/options/options.html',
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  // Khong khai bao "matches" co dinh o day: content script duoc dang ky dong
  // (chrome.scripting.registerContentScripts) dua tren danh sach domain nguoi
  // dung cau hinh trong trang Options. Quyen truy cap tung domain duoc xin
  // (chrome.permissions.request) khi nguoi dung them domain do.
  permissions: ['storage', 'scripting', 'activeTab', 'alarms', 'sidePanel'],
  host_permissions: [],
  optional_host_permissions: ['*://*/*'],
})

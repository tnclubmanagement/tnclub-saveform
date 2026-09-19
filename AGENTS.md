# TNClubManagement Save Form - Chrome Extension

Chrome extension (Manifest V3) tu dong luu va khoi phuc du lieu form tren cac
domain nguoi dung cho phep. Stack: TypeScript + Vite + `@crxjs/vite-plugin`.

## Cau truc
- `manifest.config.ts` - dinh nghia manifest bang `defineManifest` (crxjs). UI
  chinh la Side Panel (`chrome.sidePanel`, khong dung `default_popup`), bam
  icon toolbar se mo panel (`chrome.sidePanel.setPanelBehavior` trong
  service-worker.ts).
- `src/background/service-worker.ts` - dang ky/huy content script theo whitelist
  domain (`chrome.scripting.registerContentScripts`), dep du lieu cu (`chrome.alarms`),
  bat hanh vi mo Side Panel khi bam icon.
- `src/content/content-script.ts` - CHI dieu phoi (~100 dong): gan
  MutationObserver (cau truc DOM + thuoc tinh/class), goi cac module ben duoi,
  khong tu chua logic nghiep vu.
  - `detectors/` - nhan dien field, tach theo do rui ro:
    - `native-fields.ts` - input/textarea/select chuan, an toan cho moi domain.
    - `aria-choice.ts` - phan tu co role/aria-checked/pressed/selected chuan,
      an toan cho moi domain (chuan accessibility, khong phai suy doan).
    - `chip-button.ts` - heuristic suy doan nhom nut "chip selector" (khong
      ARIA, chi khac class CSS). **Rui ro cao nhat** vi dua vao doan pattern
      class, dang ap dung cho MOI domain trong whitelist (chua gioi han rieng
      theo domain - can luu y khi mo rong sang trang khac).
    - `choice-elements.ts` - gop aria-choice + chip-button thanh 1 interface
      chung (`ChoiceElement`/`isChoiceElement`/`readChoiceState`/`applyChoiceState`).
    - `form-scanner.ts` - quet DOM gom field theo form cha (`getFormGroups`),
      `buildSelector` (best-effort CSS selector cho 1 element).
    - `field-value.ts` - chuyen doi qua lai giua DOM va `FieldValue`
      (`readFieldValue`/`applyFieldValue`/`applySavedFields`).
  - `draft-autosave.ts` - trang thai bat/tat auto-save, debounce, luu/doc/xoa
    ban nhap qua `chrome.storage.local`.
  - `restore-banner.ts` - UI banner thuan (nhan callback Khoi phuc/Bo qua tu
    caller, khong tu biet gi ve storage).
  - `message-bridge.ts` - dang ky `chrome.runtime.onMessage`, giao message
    list-forms/get-fields/apply-fields tu Side Panel cho handler cua caller.
- `src/sidepanel/` - UI chinh: xem/luu/khoi phuc/xoa "phien ban co ten" cho
  form tren tab hien tai (giao tiep voi content script qua `chrome.tabs.sendMessage`),
  xem/xoa "ban nhap tu dong", toggle bat/tat auto-save (mac dinh TAT).
- `src/options/` - quan ly danh sach domain duoc phep (xin quyen qua
  `chrome.permissions.request`) va thoi gian giu ban nhap tu dong (khong anh
  huong "phien ban co ten", vi do la nguoi dung chu dong luu).
- `src/shared/` - types va wrapper cho `chrome.storage.local` dung chung
  (`host.ts` co `hostToMatchPattern` dung chung cho ca Options va service worker).
- `docs/privacy.html` - trang chinh sach quyen rieng tu cong khai (song ngu
  VI/EN, toggle o goc phai tren), dung lam Privacy Policy URL khi submit len
  Chrome Web Store. Bat GitHub Pages (Settings > Pages > Deploy from branch >
  `main` > thu muc `/docs`) de co URL cong khai, khong can workflow rieng.
- `.github/workflows/ci.yml` - build + typecheck tren moi push/PR vao `main`.
- `.github/workflows/release.yml` - khi push git tag dang `v*.*.*`, build,
  dong goi `dist/` thanh zip, tao GitHub Release dinh kem zip do (tai len
  Chrome Web Store thu cong; chua tu dong publish vi can OAuth credentials
  rieng cho Chrome Web Store API).

Content script duoc dang ky **dong** (khong khai bao tinh trong manifest) vi
danh sach domain do nguoi dung cau hinh runtime. De crxjs bundle dung, import
no trong service worker bang cu phap `import path from '../content/content-script.ts?script'`
roi truyen `path` vao `chrome.scripting.registerContentScripts(...)`.

## Lenh thuong dung
- `npm install` - cai dependencies.
- `npm run dev` - build + watch (load thu muc `dist/` bang "Load unpacked" trong
  `chrome://extensions`, bat Developer mode).
- `npm run build` - build production vao `dist/`.
- `npm run typecheck` - kiem tra TypeScript (`tsc --noEmit`).

## Luu y khi phat trien tiep
- Sau khi sua `manifest.config.ts` hoac them domain trong Options, service
  worker se tu dong `registerContentScripts` lai (lang nghe `chrome.storage.onChanged`).
- Icon trong `public/icons/` la icon SVG (document + dau tick) duoc rasterize
  bang `sips` (macOS) thanh icon16/48/128.png, khong con la placeholder.

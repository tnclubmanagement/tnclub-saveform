# Nội dung chuẩn bị cho Chrome Web Store Developer Dashboard

Tài liệu này chỉ để tham khảo khi điền form trên
https://chrome.google.com/webstore/devconsole — không phải file cấu hình của
extension.

## 1. Package để upload

Dùng file `saveform-v1.0.0.zip` ở thư mục gốc (đã build từ `dist/`, đúng
chuẩn: `manifest.json` nằm ở root của zip, không có rác `__MACOSX`).

Lệnh build + đóng gói lại khi cần release version mới:

```bash
npm run build
cd dist && zip -r -X ../saveform-vX.Y.Z.zip . -x '.*' -x '__MACOSX/*' && cd ..
```

Nhớ bump `version` trong `package.json` trước khi build (manifest lấy version
từ đây).

## 2. Store listing

- **Tên hiển thị**: TNClubManagement Save Form
- **Mô tả ngắn (tối đa 132 ký tự)**:
  "Tự động lưu và khôi phục dữ liệu form trên các trang web bạn cho phép."
- **Mô tả chi tiết** (gợi ý, chỉnh lại theo giọng văn của bạn):

  > TNClubManagement Save Form giúp bạn không bao giờ mất dữ liệu đang nhập
  > dở trên các form web dài (đăng ký, khảo sát, quản lý CLB...).
  >
  > - Tự động lưu bản nháp khi bạn gõ, khôi phục lại nếu tab bị đóng/reload.
  > - Lưu nhiều "phiên bản có tên" cho cùng một form để tái sử dụng sau này.
  > - Bạn tự chọn chính xác domain nào được phép hoạt động — extension không
  >   truy cập bất kỳ trang nào khác.
  > - Toàn bộ dữ liệu chỉ lưu cục bộ trên trình duyệt của bạn, không gửi lên
  >   server nào.
  > - Hoạt động qua Side Panel của Chrome: xem, khôi phục, xoá bản nháp/
  >   phiên bản đã lưu bất kỳ lúc nào.

- **Category**: Productivity
- **Language**: Tiếng Việt (chính), có thể thêm English sau nếu cần.

## 3. Privacy practices tab (bắt buộc)

- **Single purpose**: "Tự động lưu và khôi phục dữ liệu người dùng nhập vào
  form trên các trang web mà người dùng chỉ định."
- **Privacy policy URL**: link tới `docs/privacy.html` sau khi bật GitHub
  Pages cho repo này (xem hướng dẫn bên dưới), ví dụ:
  `https://<username>.github.io/<repo>/privacy.html`
- **Permission justification** (điền cho từng quyền trong danh sách):
  - `storage`: Lưu bản nháp tự động, phiên bản form đã lưu và danh sách domain
    được phép — toàn bộ ở `chrome.storage.local`, không đồng bộ, không rời
    khỏi máy người dùng.
  - `scripting`: Cần để chèn content script đọc/điền dữ liệu form, nhưng CHỈ
    trên các domain người dùng đã tự thêm và cấp quyền ở trang Options.
  - `activeTab`: Cho phép Side Panel thao tác với đúng tab người dùng đang mở
    khi họ chủ động bấm nút, không truy cập tab khác.
  - `alarms`: Lên lịch dọn dẹp định kỳ các bản nháp tự động đã quá hạn giữ
    (theo cấu hình retention của người dùng).
  - `sidePanel`: Hiển thị giao diện quản lý chính của extension.
  - `host_permissions` / `optional_host_permissions` (`*://*/*` optional):
    Extension KHÔNG có quyền truy cập trang nào theo mặc định
    (`host_permissions: []`). Quyền cho từng domain cụ thể chỉ được xin qua
    `chrome.permissions.request` (hộp thoại xin quyền chuẩn của Chrome) khi
    người dùng chủ động thêm domain đó vào danh sách cho phép ở trang Options.
    Đây là lý do cần khai báo `*://*/*` trong `optional_host_permissions` —
    để không giới hạn trước domain nào người dùng có thể chọn.
- **Data usage disclosure**: Không thu thập, không bán, không chia sẻ dữ liệu
  người dùng với bên thứ ba. Không có dữ liệu nào rời khỏi trình duyệt của
  người dùng.

## 4. Assets cần chuẩn bị

- Icon 128x128: đã có ở `public/icons/icon128.png`.
- Screenshot: ít nhất 1 ảnh, khuyến nghị 1280x800 (hoặc 640x400), định dạng
  PNG/JPEG. Nên chụp: (1) Side Panel với danh sách bản nháp/phiên bản, (2)
  trang Options khi thêm domain, (3) banner "Khôi phục dữ liệu?" trên 1 form
  thật.
- (Tuỳ chọn) Small promo tile 440x280, Marquee 1400x560 nếu muốn nổi bật hơn
  trên store.

## 5. Hướng dẫn bật GitHub Pages cho privacy policy

1. Push repo này (hoặc chỉ thư mục `docs/`) lên một GitHub repo.
2. Vào **Settings → Pages** của repo, chọn source: branch `main`, folder
   `/docs`.
3. Đợi vài phút, URL sẽ có dạng
   `https://<username>.github.io/<repo>/privacy.html`.
4. Dán URL đó vào ô "Privacy policy URL" trong Developer Dashboard.

Nhớ điền email liên hệ thật vào phần "Liên hệ" trong `PRIVACY.md` và
`docs/privacy.html` trước khi publish URL.

## 6. Trước khi submit — checklist nhanh

- [ ] `npm run typecheck` và `npm run build` chạy sạch.
- [ ] Test "Load unpacked" thư mục `dist/` trong `chrome://extensions`,
      thử đủ luồng: thêm domain ở Options → điền form → tự lưu bản nháp →
      reload → thấy banner khôi phục → mở Side Panel lưu/khôi phục/xoá.
- [ ] Điền email hỗ trợ thật vào `PRIVACY.md` / `docs/privacy.html`.
- [ ] Bật GitHub Pages, lấy URL privacy policy.
- [ ] Chuẩn bị ít nhất 1 screenshot.
- [ ] Tài khoản Developer Dashboard đã đóng phí đăng ký một lần ($5).
- [ ] Upload `saveform-v1.0.0.zip`, điền listing + privacy practices như trên,
      submit for review.

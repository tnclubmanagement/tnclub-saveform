# Chính sách quyền riêng tư — TNClubManagement Save Form

Cập nhật lần cuối: 2026-09-19

## Tóm tắt

TNClubManagement Save Form ("Extension") là tiện ích Chrome giúp tự động lưu
và khôi phục dữ liệu bạn đã nhập vào các form trên những trang web mà **chính
bạn** cho phép. Extension **không thu thập, không gửi, không bán** bất kỳ dữ
liệu nào của bạn cho bên thứ ba, và **không có máy chủ (server) riêng nào**.

## Dữ liệu nào được xử lý?

Extension đọc dữ liệu bạn nhập trong các trường form (input, textarea,
select, các nút lựa chọn dạng "chip"...) trên các trang web nằm trong danh
sách domain do bạn tự thêm ở trang Options.

## Dữ liệu được lưu ở đâu?

Toàn bộ dữ liệu (bản nháp tự động lưu, các "phiên bản có tên" do bạn chủ động
lưu, danh sách domain được phép, cấu hình thời gian giữ bản nháp) chỉ được
lưu **cục bộ trên trình duyệt của bạn** thông qua API `chrome.storage.local`
của Chrome. Dữ liệu:

- Không được đồng bộ lên tài khoản Google (không dùng `chrome.storage.sync`).
- Không được gửi tới bất kỳ máy chủ, API, hay dịch vụ phân tích (analytics)
  nào của nhà phát triển hay bên thứ ba.
- Chỉ có thể truy cập được bởi chính Extension, trên chính trình duyệt bạn
  đã cài đặt.

## Quyền truy cập website (host permissions)

Extension **không** yêu cầu quyền truy cập bất kỳ trang web nào theo mặc
định. Quyền truy cập một domain cụ thể chỉ được xin (qua hộp thoại xin quyền
chuẩn của Chrome — `chrome.permissions.request`) khi **bạn chủ động thêm
domain đó** vào danh sách cho phép ở trang Options. Bạn có thể thu hồi quyền
này bất cứ lúc nào bằng cách xoá domain khỏi danh sách.

## Các quyền khác mà Extension sử dụng

| Quyền        | Mục đích |
|--------------|----------|
| `storage`    | Lưu bản nháp, phiên bản đã lưu, danh sách domain và cài đặt — toàn bộ ở local. |
| `scripting`  | Chèn content script vào đúng các domain bạn đã cho phép để đọc/điền dữ liệu form. |
| `activeTab`  | Cho phép trang Side Panel thao tác với tab hiện tại khi bạn chủ động mở nó. |
| `alarms`     | Lên lịch dọn định kỳ các bản nháp tự động lưu đã quá hạn giữ. |
| `sidePanel`  | Hiển thị giao diện quản lý (xem/lưu/khôi phục/xoá) trong Side Panel của Chrome. |

## Xoá dữ liệu

Bạn có thể xoá dữ liệu đã lưu bất kỳ lúc nào từ giao diện Side Panel (xoá
từng bản nháp/phiên bản), hoặc gỡ cài đặt Extension để xoá toàn bộ dữ liệu mà
`chrome.storage.local` đang giữ.

## Liên hệ

Nếu có câu hỏi về chính sách quyền riêng tư này, vui lòng liên hệ:
`<điền email hỗ trợ của bạn tại đây>`.

# Đối chiếu API backend ↔ giao diện

Nguồn: `SaaS_PMS_API_openapi.yaml` (backend commit `b2fb474` "No-show", **99 endpoint**).
Cập nhật: 2026-11-21. Lớp gọi API nằm trong `src/lib/api/`:
`saas-api.ts` (SaaS: đăng nhập, gói, thuê bao, ticket, file), `property-api.ts` (Owner cấu hình khách sạn),
`pms-public-api.ts` (đăng nhập nhân viên, chatbot, đặt phòng công khai), **`pms-ops-api.ts` (mới: check-in, buồng phòng, no-show, hủy/hoàn tiền, F&B của khách, cổng thanh toán)**.

## 1. Kết quả đối chiếu

| Loại | Số endpoint |
|---|---|
| Có hàm gọi trong `src/lib/api/` (kiểm tra bằng script đối chiếu đường dẫn + phương thức HTTP) | **95** |
| Trang quay về Stripe, đã có route Next.js cùng đường dẫn | 2 |
| Webhook Stripe (Stripe gọi vào backend, giao diện không gọi) | 2 |
| **Tổng** | **99** |

Trước lần cập nhật này chỉ có 71 endpoint có hàm gọi; 24 endpoint vận hành còn thiếu đã được thêm ở mục 2.

Bốn endpoint không cần hàm gọi từ giao diện:
- `GET /api/payments/stripe/success|cancel` – trang quay về sau Stripe, đã có route Next.js cùng tên (`src/app/api/payments/stripe/…`) chuyển về `/payments/return`.
- `POST /api/webhooks/stripe`, `/api/webhooks/stripe/property` – Stripe gọi vào backend, giao diện không gọi.

## 2. 24 endpoint được nối mới trong lần này

| Endpoint | Hàm | Màn hình |
|---|---|---|
| `GET /api/payment-gateways` | `paymentGatewayApi.catalog` | Owner → Khách sạn → Cổng thanh toán |
| `GET/POST/PUT /api/properties/{id}/payment-gateway` | `paymentGatewayApi.get/create/update` | như trên (Stripe: secretKey `sk_…`, webhookSecret `whsec_…`, bật/tắt) |
| `GET …/check-in/reservations/{code}` | `checkInApi.search` | PMS → Check-in, Hủy đặt phòng |
| `GET …/check-in/reservations/{code}/guests` | `checkInApi.guests` | PMS → Check-in (hồ sơ khách) |
| `GET …/check-in/rooms/{roomId}/readiness` | `checkInApi.readiness` | PMS → Check-in (phòng sẵn sàng?) |
| `POST …/check-in/reservations/{code}/complete` | `checkInApi.complete` | PMS → Check-in (Hoàn tất) |
| `GET …/housekeeping/schedule?date=` | `housekeepingApi.schedule` | PMS → Buồng phòng |
| `PATCH …/housekeeping/rooms/{roomId}/status` | `housekeepingApi.updateRoomStatus` | PMS → Buồng phòng (DIRTY/CLEANING/READY) |
| `GET …/housekeeping/issues` | `housekeepingApi.issues` | PMS → Sự cố phòng |
| `POST …/housekeeping/rooms/{roomId}/issues` | `housekeepingApi.createIssue` | PMS → Sự cố phòng |
| `PATCH …/housekeeping/issues/{id}/resolution` | `housekeepingApi.resolveIssue` | PMS → Sự cố phòng |
| `GET …/reservations/no-show` | `noShowApi.tracking` | PMS → No-Show |
| `POST …/reservations/{code}/no-show/notify` | `noShowApi.notify` | PMS → No-Show |
| `POST …/reservations/{code}/no-show/confirm` | `noShowApi.confirm` | PMS → No-Show |
| `GET …/reservations/{code}/refund-quote` | `reservationStaffApi.refundQuote` | PMS → Hủy đặt phòng |
| `POST …/reservations/{code}/cancel` | `reservationStaffApi.cancel` | PMS → Hủy đặt phòng |
| `POST …/reservations/{code}/refunds` | `reservationStaffApi.createRefund` | PMS → Hoàn tiền |
| `GET …/refunds/{refundPaymentId}` | `reservationStaffApi.refundStatus` | PMS → Hoàn tiền |
| `GET /api/public/reservations/{code}/refund-quote` | `guestReservationApi.refundQuote` | Khách → Tra cứu đặt phòng |
| `POST /api/public/reservations/{code}/cancel` | `guestReservationApi.cancel` | Khách → Tra cứu đặt phòng |
| `GET /api/public/reservations/{code}/fnb-menu` | `guestFnbApi.menu` | Khách → Tra cứu (Gọi món) |
| `POST /api/public/reservations/{code}/fnb-orders` | `guestFnbApi.placeOrder` | Khách → Tra cứu (Gọi món) |

## 3. Hai chỗ lệch hợp đồng đã sửa khi rà soát

1. `PUT /api/properties/{id}/policy-documents`: `deleteFileIds` là **query param**; code cũ đưa vào form-data nên xóa tài liệu có thể không có tác dụng → đã chuyển sang query (`policyDocumentApi.update`).
2. `GET /api/public/reservations/{code}`: mỗi phòng trong `rooms` chỉ đảm bảo `roomId, roomNumber, floor, status`; các trường `roomType, totalPrice, nightlyPrices` chuyển thành tùy chọn, giao diện chỉ hiện khi có.

## 4. Quyền theo OpenAPI (đã dùng để gắn menu PMS)

| Chức năng | Quyền / vai trò backend yêu cầu |
|---|---|
| Check-in: tìm / hoàn tất / hồ sơ khách / kiểm tra phòng | `RESERVATION_VIEW` / `CHECKIN_EXECUTE` / `GUEST_VIEW` / `ROOM_VIEW` (+ vai trò RECEPTIONIST) |
| Buồng phòng (lịch, trạng thái, sự cố) | vai trò HOUSEKEEPER (không nêu mã quyền) |
| No-show: theo dõi, thông báo / xác nhận | `RESERVATION_VIEW` / `RESERVATION_UPDATE` (+ RECEPTIONIST) |
| Hủy đặt phòng | `RESERVATION_CANCEL` |
| Báo giá hoàn / tạo hoàn / xem hoàn | `REFUND_CALCULATE` / `REFUND_CREATE` / `REFUND_VIEW` |

Menu "Xử lý No-Show" đổi từ `NO_SHOW_VIEW` sang `RESERVATION_VIEW` cho khớp API; thêm mục "Hoàn tiền" (`REFUND_VIEW`).
Nếu một vai trò thấy menu nhưng bấm ra 403, màn hình hiển thị nguyên văn thông báo của backend.

## 5. Chưa có API ở backend → màn hình vẫn dùng dữ liệu mẫu

- PMS: Bảng điều khiển, Danh sách đặt phòng và chi tiết, Tạo đặt phòng (wizard cũ), Check-out, Folio, Dịch vụ F&B của nhân viên (đơn, duyệt, thực tế), Dịch vụ khách sạn, Night Audit, Báo cáo vận hành.
- Admin: Tenant, Giao dịch thanh toán, Nhật ký tác vụ. Owner: Báo cáo chuỗi, danh sách giao dịch thuê bao, danh sách ticket của chính mình.
- Không có API liệt kê hoàn tiền → màn Hoàn tiền lưu mã hoàn đã tạo trong trình duyệt để theo dõi.
- Không có API liệt kê khách sạn công khai (`GET /api/public/properties` → 500) → cổng `/book` dò mã 1–40.
- Nhân viên không gọi được `/api/properties/**` (chỉ Owner) → danh sách phòng cho form sự cố lấy từ lịch buồng phòng + phòng trống công khai.

## 6. Chưa kiểm chứng với backend thật

Lúc viết, backend (ngrok) trả 502 và dev server tắt nên các màn mới **mới qua kiểm tra kiểu (tsc) và đối chiếu hợp đồng OpenAPI**, chưa gọi thật. Cần chạy theo `docs/TEST-PMS.md` khi backend bật lại; đặc biệt:
giá trị `taskType` của lịch buồng phòng, điều kiện no-show, và việc check-in yêu cầu phòng ở trạng thái READY.

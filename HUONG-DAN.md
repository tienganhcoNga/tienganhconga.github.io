# Hướng dẫn đưa trang lên GitHub Pages

## Cấu trúc thư mục

```
lop-hoc/
├── index.html              ← Trang chủ: cột trái Khối lớp → Chủ đề, bên phải là bài học + tab Đáp án
├── .nojekyll               ← File rỗng, giữ nguyên (để GitHub không xử lý lại file)
├── assets/
│   └── pin.js              ← Khóa phần Đáp án bằng mã PIN (đổi mã PIN ở đây)
├── lop-1/
│   └── tieng-anh-lop-1.html ← Tiếng Anh lớp 1 (About Me, cơ thể, vị trí, bộ phận của cây)
├── lop-4/
│   ├── su-viet-ioe.html    ← Bài Sử Việt IOE lớp 4
│   └── tieng-anh-ioe.html  ← Tiếng Anh IOE lớp 4 (từ vựng, ngữ pháp, hội thoại, luyện đề, tập chép)
└── mau-giao/
    └── english-speeches.html ← Luyện nói tiếng Anh (8 chủ đề, mở thẳng một chủ đề bằng #farm, #sea...)
```

Xem thử trên máy: bấm đúp vào `index.html`.

## Lần đầu: tạo trang (khoảng 10 phút)

1. Vào https://github.com, đăng nhập bằng **tài khoản cá nhân**, không dùng tài khoản công ty.
2. Bấm **New repository**:
   - Repository name: `lop-hoc` (tên này sẽ nằm trong link)
   - Chọn **Public** (gói miễn phí chỉ bật Pages được cho repo Public)
   - Bấm **Create repository**
3. Đưa file lên, chọn **một** trong hai cách:

   **Cách A: kéo thả, không cần gõ lệnh**
   - Bấm **uploading an existing file**
   - Kéo toàn bộ nội dung bên trong thư mục `lop-hoc` vào (gồm `index.html`, thư mục `lop-4`)
   - Bấm **Commit changes**
   - Lưu ý: `.nojekyll` là file ẩn nên có thể không kéo được. Nếu vậy, bấm **Add file → Create new file**, đặt tên `.nojekyll`, để trống nội dung, bấm **Commit**.

   **Cách B: dùng git**
   ```bash
   cd ~/Documents/lop-hoc
   git init -b main
   git add .
   git commit -m "Trang hoc dau tien"
   git remote add origin https://github.com/<ten-tai-khoan>/lop-hoc.git
   git push -u origin main
   ```

4. Bật Pages: vào repo, chọn **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, thư mục **/ (root)**, bấm **Save**
5. Chờ 1–2 phút, tải lại trang Settings → Pages sẽ thấy link:
   `https://<ten-tai-khoan>.github.io/lop-hoc/`
   Gửi link này cho học sinh và phụ huynh.

## Các lần sau: thêm bài mới

1. Bỏ file bài mới vào đúng thư mục (`mau-giao/`, `lop-1/` hoặc `lop-4/`).
2. Mở `index.html`, tìm danh sách `GRADES` (gần đầu phần `<script>`):
   - Thêm bài vào `lessons` của khối lớp tương ứng: `id`, biểu tượng `ic`, tên `name`, đường dẫn `file`, danh sách chủ đề `topics` (mã chủ đề là phần sau dấu `#` trong bài).
   - Ghi `answers: true` nếu bài có mục Đáp án (`<section id="answers">`).
   - Muốn thêm khối lớp mới (ví dụ Mầm, Chồi, Lá): thêm một mục mới vào `GRADES`. Màu `c` chọn một trong: `gold`, `sky`, `jade`, `lacquer`.
3. Đưa lên GitHub:
   - Cách A: vào repo, bấm **Add file → Upload files**, kéo file mới vào (giữ đúng thư mục), bấm **Commit**.
   - Cách B: `git add . && git commit -m "Them bai moi" && git push`
4. Khoảng 1 phút sau trang tự cập nhật. Nếu chưa thấy thay đổi, nhấn Ctrl + F5.

## Khóa Đáp án bằng mã PIN

- Tab **Đáp án** luôn khóa sẵn. Bấm vào sẽ hiện ô nhập mã PIN, mặc định là **1234**.
- Nhập đúng một lần thì mọi bài đều mở đáp án, cho đến khi đóng tab trình duyệt hoặc bấm **Khóa lại**.
- Đổi mã PIN: mở `assets/pin.js`, sửa dòng `var PIN = "1234";`.
- Đây chỉ là khóa để các em không bấm nhầm. Người rành máy tính vẫn xem được mã PIN trong code, nên đừng dùng nó để giấu thông tin quan trọng.

## Lưu ý

- Repo để Public nghĩa là ai có link cũng xem được nội dung. Không đưa tên, ảnh hay điểm số của học sinh lên đây.
- Điểm luyện đề chỉ lưu trên máy của từng em, cô không xem được kết quả của các em.

# Hướng dẫn đưa trang lên GitHub Pages

## Cấu trúc thư mục

```
lop-hoc/
├── index.html              ← Trang chủ (Mẫu giáo + Lớp 4)
├── .nojekyll               ← File rỗng, giữ nguyên (để GitHub không xử lý lại file)
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

1. Bỏ file bài mới vào đúng thư mục (`mau-giao/` hoặc `lop-4/`).
2. Mở `index.html`, copy một khối `<a class="lesson" ...> ... </a>` rồi sửa `href`, biểu tượng, tên bài và mô tả.
3. Đưa lên GitHub:
   - Cách A: vào repo, bấm **Add file → Upload files**, kéo file mới vào (giữ đúng thư mục), bấm **Commit**.
   - Cách B: `git add . && git commit -m "Them bai moi" && git push`
4. Khoảng 1 phút sau trang tự cập nhật. Nếu chưa thấy thay đổi, nhấn Ctrl + F5.

## Lưu ý

- Repo để Public nghĩa là ai có link cũng xem được nội dung. Không đưa tên, ảnh hay điểm số của học sinh lên đây.
- Điểm luyện đề chỉ lưu trên máy của từng em, cô không xem được kết quả của các em.

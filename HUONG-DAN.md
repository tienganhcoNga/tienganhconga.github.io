# Hướng dẫn đưa trang lên GitHub Pages

## Cấu trúc thư mục

```
lop-hoc/
├── index.html              ← Trang chủ: cột trái Khối lớp → Chủ đề, bên phải là bài học + tab Đáp án
├── .nojekyll               ← File rỗng, giữ nguyên (để GitHub không xử lý lại file)
├── assets/
│   ├── pin.js              ← Khóa phần Đáp án bằng mã PIN (đổi mã PIN ở đây)
│   ├── course.js / course.css       ← Phần chạy chung cho trang "Ôn 10 chủ đề" lớp 1
│   ├── preschool.js / preschool.css ← Phần chạy chung cho lộ trình mẫu giáo (thẻ hình, hội thoại, trò chơi, cẩm nang). Trang nào có `book:{title,note,rows}` thì Lộ trình hiện bảng đối chiếu với sách học trên lớp
│   ├── pos-art.js          ← Hình vị trí dùng chung cho Mầm non: POS('in' | 'on' | 'under' | 'next to' | 'behind' | 'in front of' | 'table')
│   └── speaking.js / speaking.css   ← Phần chạy chung cho các trang "Ôn tập nói" và "Giáo án lớp 1"
├── lop-1/
│   ├── giao-an-lop-1.html  ← Giáo án lớp 1: 16 Unit giao tiếp theo chủ đề sách trên lớp (mỗi Unit một chữ cái, 2 bài nói), Math / Science (tiếng Anh cho Toán – Khoa học), Story Time (5 truyện cổ tích), 8 bài nói về con vật (Easy / Challenge). Đã lọc bỏ mẫu câu vượt lớp 1. Menu Lớp 1 chỉ còn: Giáo án, Ôn tập nói, Bài tập về nhà
│   ├── unit-lop-1.html     ← (đã bỏ khỏi menu, nội dung gom vào Giáo án) Units lớp 1: Starter + 9 Unit (mỗi Unit 4 Lesson: từ → mở rộng mẫu câu → truyện + Value → liên môn; Phonics & Chant; Games) + 4 Review; #lo-trinh = lộ trình và nghĩa tiếng Việt cho cô và phụ huynh. Phần chạy ở assets/units.js
│   ├── on-tap-noi.html     ← Ôn tập nói lớp 1 theo 16 Unit của Giáo án (danh sách từ g1–g16 chép từ Giáo án; thêm từ vào Giáo án thì chép sang đây): sau Unit 3, 5, 7, 9, 11, 13, 15 và Big Show; mỗi lần gom từ của tất cả Unit đã học, 5 kiểu bài nói; thêm tab "Speech": bài thuyết trình dài có tranh vẽ tay (tranh ở assets/speech-art.js, khóa l1_), có 3 Level trong cùng một tab: Level 1 cho bé khoảng 4 tuổi hoặc chưa học tiếng Anh, Level 2 cho bé 5 tuổi, Level 3 bài đầy đủ (các bài cùng `group:'speech'`, ghi `level` và `levelNote`)
│   ├── tieng-anh-lop-1.html ← (đã bỏ khỏi menu, nội dung gom vào Giáo án) Tiếng Anh lớp 1 (About Me, cơ thể, vị trí, bộ phận của cây, đồ dùng học tập, hình khối, đồ vật trong nhà, ôn tập, các phòng, hoạt động phòng tắm – phòng ngủ)
│   └── chu-de-lop-1.html   ← (đã bỏ khỏi menu, phần hợp lớp 1 gom vào Giáo án) Ôn 10 chủ đề (dữ liệu nằm trong file, phần chạy ở assets/course.js)
├── lop-4/
│   ├── units-lop-4.html    ← Từ vựng & Lộ trình lớp 4: #lo-trinh (lịch 35 tuần), #tu-dien (tra tất cả từ), #s, #u1…#u20 (từ, mẫu câu, hội thoại trong bài + lời bài nghe có đóng vai, 3 trò luyện từ). Từ ở assets/lop4-words.js, hội thoại ở assets/lop4-dialogues.js
│   ├── on-tap-noi.html     ← Ôn tập nói lớp 4: sau Unit 3, rồi cứ 2 Unit một lần (5, 7, … 19), cuối năm Big Show; mỗi lần 5 kiểu bài nói
│   ├── su-viet-ioe.html    ← Bài Sử Việt IOE lớp 4
│   └── tieng-anh-ioe.html  ← Tiếng Anh IOE lớp 4 (từ vựng, ngữ pháp, hội thoại, luyện đề, tập chép)
└── mau-giao/
    ├── giai-doan-1.html    ← Lộ trình 3 tháng đầu cho bé mới bắt đầu: 8 Unit, 24 buổi (#lo-trinh, #u1…#u8, #answers = cẩm nang)
    ├── giai-doan-2.html    ← Giai đoạn 2 (tháng 4–6): 8 Unit khó hơn, nhiều hội thoại
    ├── giai-doan-3.html    ← Giai đoạn 3 (tháng 7–10, 10 Unit): vị trí, chỉ đường, to – nhỏ, dài – ngắn, đẹp – xấu, ngon – dở, các vị, nóng – lạnh và thời tiết, bốn mùa; Unit 10 tìm kho báu ôn cả giai đoạn
    ├── on-tap-noi.html     ← Ôn tập nói: GĐ1 + GĐ2 + GĐ3 tính liền 26 Unit, ôn sau Unit 3, 5, 7, 9, 11, 13, 15, Big Show sau Unit 16, rồi GĐ3 ôn sau Unit 19, 22, 24 và Big Show 2 sau Unit 26 (bản chép từ GĐ3 là c1–c10; hình vị trí dùng POS() từ assets/pos-art.js). Mỗi bài ôn có thêm tab "Speech": bài thuyết trình mẫu có tranh vẽ tay (tranh nằm ở assets/speech-art.js, dùng trong câu bằng DZ.tên_tranh)
    └── english-speeches.html ← Bản bài nói cũ (đã bỏ khỏi menu; bài nói nay nằm trong mục 4 "Bé thuyết trình" của từng Unit)

Cả 3 giai đoạn Mầm non có bảng **Đối chiếu với sách học trên lớp** trong 🗺️ Lộ trình (dòng `book:` trên đầu file trang): mỗi Unit của bé nối với Unit/Lesson tương ứng của sách Level 1 và ghi giới từ lồng vào. Giới từ dạy dần: in, on (GĐ1 Unit 2) → under (Unit 3) → ôn cả ba (Unit 8) → behind, next to, in front of (GĐ2 Unit 1, 4, 5) → đủ 6 giới từ và chỉ đường (GĐ3). Trên trang chỉ ghi "sách học trên lớp", không ghi tên sách.

Bài tập về nhà cho ba mẹ (Mầm non): Lộ trình mỗi giai đoạn có khối **🏠 Bài tập về nhà** gồm 4 kỹ thuật giúp bé nói sõi (mở rộng câu, tạo tình huống cần nói, câu hỏi lựa chọn, đọc sách tranh trước khi ngủ) và 3 kỹ thuật thêm (tường thuật, làm quá với đồ thật, nói theo cụm). Ví dụ riêng cho từng Unit nằm ở dòng `hw:{e,s,c,b,x}` ngay trên `guide:` của Unit: `e` [bé nói, ba mẹ mở rộng], `s` [tình huống, câu bé nói], `c` [câu hỏi lựa chọn, bé trả lời], `b` [hỏi khi đọc tranh, bé trả lời], `x` từ dùng thêm ở nhà. Phần này hiện ở Lộ trình và trong Cẩm nang.

Mỗi Unit mẫu giáo có mục "4. Bé thuyết trình". Nội dung bài nói nằm ở dòng `speech:{...}` ngay dưới `talk:` của Unit đó: `t` là tên bài, `intro` là câu mở đầu, `lines` là các câu (hình, câu tiếng Anh, nghĩa), `end` là câu kết. Từ nào muốn làm từ khóa (còn hiện khi bé tự nói) thì bọc trong `<b>…</b>`.

Trang "Ôn tập nói" (`on-tap-noi.html`): mỗi bài ôn có 5 bài nói (hội thoại, kể chuyện, thuyết trình, so sánh, tự sự). Dữ liệu nằm trong `reviews:` của file; cách ghi xem ở đầu `assets/speaking.js`. Kho từ (`units:`) chép từ các trang Unit; khi sửa từ ở trang Unit thì sửa cả ở đây. Nhãn "Words from" tự dò từ trong câu, không cần ghi tay. Riêng lớp 4: kho từ nằm ở một chỗ là `assets/lop4-words.js`, dùng chung cho trang Từ vựng và trang Ôn tập nói, nên sửa từ ở đó là cả hai trang cùng đổi.

Không ghi tên sách giáo khoa hay nhà xuất bản lên trang (vì bản quyền). Bài do cô tự soạn theo chủ đề.
```

Xem thử trên máy: mở thẳng từng file bài học bằng trình duyệt. Riêng trang chủ (`index.html`) cần chạy trên web mới hoạt động đầy đủ, nên muốn xem trang chủ thì đưa lên GitHub rồi mở link.

## Lần đầu: tạo trang (khoảng 10 phút)

1. Vào https://github.com, đăng nhập bằng **tài khoản cá nhân**, không dùng tài khoản công ty.
2. Bấm **New repository**:
   - Repository name: `tienganhcoNga` (tên này sẽ nằm trong link)
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
   git remote add origin https://github.com/<ten-tai-khoan>/tienganhcoNga.git
   git push -u origin main
   ```

4. Bật Pages: vào repo, chọn **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, thư mục **/ (root)**, bấm **Save**
5. Chờ 1–2 phút, tải lại trang Settings → Pages sẽ thấy link:
   `https://<ten-tai-khoan>.github.io/tienganhcoNga/`
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

## Mã PIN

Tất cả mã PIN nằm trong `assets/pin.js`. Đổi mã: sửa số trong ngoặc kép, rồi đổi số phiên bản `?v=...` sau chữ `pin.js` trong các file `.html` (tìm `pin.js?v=`, thay bằng số mới, ví dụ ngày sửa) để trình duyệt của các em lấy ngay mã mới thay vì giữ bản cũ tới 10 phút. Sau đó đưa lên lại.

**Mã PIN từng khối lớp** (`GRADE_PINS`): **đang tạm tắt**, các em vào học thẳng không cần nhập mã. Muốn bật lại: trong `assets/pin.js` bỏ dấu `//` ở các dòng trong `GRADE_PINS`. Khi bật:
- Mỗi khối có một mã riêng. Chưa nhập đúng mã thì không xem được bài của khối đó, kể cả khi mở thẳng link bài.
- Nhập đúng thì khối đó mở cho đến khi đóng tab trình duyệt. Nếu tick **Nhớ trên máy này** thì máy đó lần sau không phải nhập lại.
- Nút **🔐 Khóa đáp án** ở cột trái trang chủ sẽ khóa lại phần Đáp án (và mọi khối nếu đang bật mã khối) (dùng khi máy dùng chung).
- Muốn thêm khối mới có mã riêng: thêm một dòng vào `GRADE_PINS` và `GRADE_NAMES`, và ghi `data-grade="<mã khối>"` vào thẻ `<html>` của các trang bài thuộc khối đó.

**Mã PIN Đáp án** (`ANSWER_PIN`)
- Tab **Đáp án** luôn khóa sẵn. Nhập đúng một lần thì mọi bài mở đáp án cho đến khi đóng tab hoặc bấm **Khóa lại**.

Đây chỉ là khóa để các em không vào nhầm khối hay xem đáp án. Người rành máy tính vẫn đọc được mã trong code, nên đừng dùng nó để giấu thông tin quan trọng.

## Lưu ý

- Repo để Public nghĩa là ai có link cũng xem được nội dung. Không đưa tên, ảnh hay điểm số của học sinh lên đây.
- Điểm luyện đề chỉ lưu trên máy của từng em, cô không xem được kết quả của các em.

/* Nút "Song ngữ" cho phụ huynh (trang Mầm non và Lớp 1).
   - Mặc định bài học chỉ có tiếng Anh. Bấm nút 🇻🇳 Song ngữ ở góc phải thanh trên cùng thì hiện thêm
     nghĩa tiếng Việt dưới từ, câu, tiêu đề. Bấm lần nữa để tắt. Lựa chọn được nhớ trên máy
     (localStorage "lophoc-bilingual"), dùng chung cho mọi trang.
   - Trang ghi phần tiếng Việt bằng <span class="vi-t">…</span> (hiện thành một dòng nhỏ bên dưới)
     hoặc <span class="vi-t in">…</span> (hiện ngay sau, trên cùng dòng). Tắt song ngữ thì ẩn hết.
     File CSS của trang nên có sẵn .vi-t{display:none} để chữ không lóe lên trước khi file này chạy.
   - Chỗ đặt nút: thanh chọn bài (assets/kidnav.js gọi LopHocBi.btn(), cạnh nút ☰ All, luôn nằm trên
     màn hình); trang không có thanh đó thì đặt vào phần tử có data-bi-slot (data-bi-slot="end": nút nằm cuối, sát phải), nếu không thì góc phải header.hero.
   - Nạp file này TRƯỚC assets/kidnav.js. */
(function () {
  "use strict";
  var KEY = "lophoc-bilingual", root = document.documentElement;
  function saved() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function save(on) { try { if (on) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var css = "" +
    ".vi-t{display:none}" +
    "html.bi .vi-t{display:block;margin-top:2px;font-family:var(--f-body,'Be Vietnam Pro',system-ui,sans-serif);font-size:.78em;font-weight:500;font-style:italic;" +
    "line-height:1.35;letter-spacing:0;text-transform:none;color:var(--muted,#56676A);text-align:inherit;white-space:normal}" +
    "html.bi .vi-t.in{display:inline;margin:0 0 0 .4em}" +
    "html.bi .sk-hide .vi-t,html.bi .hide-text .vi-t{visibility:hidden}" +
    "html.bi .hide-text .sp-note.peek .vi-t{visibility:visible}" +
    ".bi-btn{flex:none;display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:.95rem;font-weight:800;padding:6px 14px;border-radius:999px;cursor:pointer;" +
    "border:1px solid var(--line,#D3DFD8);background:var(--surface,#fff);color:var(--ink,#1C2A36);white-space:nowrap}" +
    ".bi-btn:hover{border-color:var(--accent,var(--sky,#2F6F98))}" +
    ".bi-btn[aria-pressed=true]{background:var(--sky,#2F6F98);border-color:var(--sky,#2F6F98);color:#fff}" +
    ".kn .bi-btn{min-height:44px}" +
    ".bi-btn.bi-end{position:sticky;right:0;margin-left:auto;box-shadow:-10px 0 10px var(--bg,#F1F5F2)}" +
    ".bi-btn .bi-s{display:none;font-style:normal;font-size:.8rem}" +
    "@media (max-width:560px){.kn .bi-btn{padding:0;width:44px;justify-content:center}.kn .bi-btn b,.kn .bi-btn .bi-i{display:none}.kn .bi-btn .bi-s{display:inline}}" +
    ".hero-tools{position:absolute;top:4px;right:0;display:flex;gap:6px;align-items:center;justify-content:flex-end;z-index:5}header.hero{position:relative}" +
    "@media print{.bi-btn{display:none!important}html.bi .vi-t{display:none!important}}";
  var st = document.createElement("style"); st.textContent = css; (document.head || root).appendChild(st);

  var B = document.createElement("button");
  B.type = "button"; B.className = "bi-btn";
  B.title = "Song ngữ: hiện thêm tiếng Việt cho phụ huynh";
  B.onclick = function () { var on = !root.classList.contains("bi"); save(on); set(on); };
  function set(on) {
    root.classList.toggle("bi", on);
    B.setAttribute("aria-pressed", on ? "true" : "false");
    B.innerHTML = '<span class="bi-i" aria-hidden="true">' + (on ? "✓" : "🇻🇳") + "</span><b>Song ngữ</b><i class=\"bi-s\" aria-hidden=\"true\">Việt</i>";
  }
  set(saved());

  function mount() {
    if (B.isConnected) return; /* thanh chọn bài đã gắn nút */
    var slot = document.querySelector("[data-bi-slot]"), hero = document.querySelector("header.hero");
    if (slot) { if (slot.getAttribute("data-bi-slot") === "end") { B.classList.add("bi-end"); slot.appendChild(B); } else slot.insertBefore(B, slot.firstChild); return; }
    if (!hero) return;
    var t = hero.querySelector(".hero-tools");
    if (!t) { t = document.createElement("div"); t.className = "hero-tools"; hero.appendChild(t); }
    t.insertBefore(B, t.firstChild);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else setTimeout(mount, 0);

  window.LopHocBi = {
    btn: function () { return B; },
    on: function () { return root.classList.contains("bi"); },
    vi: function (t, inline) { return t ? '<span class="vi-t' + (inline ? " in" : "") + '" lang="vi">' + esc(t) + "</span>" : ""; }
  };
})();

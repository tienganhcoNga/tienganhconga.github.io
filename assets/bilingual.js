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
    "html.bi h1>.vi-t,html.bi h2>.vi-t{font-size:max(.42em,13px)}" +
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
    if (on) later();
  }

  /* ---------- Tự thêm nghĩa từ từ điển (assets/vi-dict.js) ----------
     Khi bật Song ngữ, mọi chữ tiếng Anh trên trang (nút, tiêu đề, tên bài, câu hỏi…) có trong từ điển
     được thêm <span class="vi-t" data-auto> ngay sau, kể cả chữ hiện ra sau khi bấm (theo dõi thay đổi của trang).
     Chỗ nào trang đã tự ghi nghĩa (.vi-t) thì bỏ qua. Từ điển: window.LOPHOC_VI = { dict:{ "English": "Tiếng Việt" }, pats:[[RegExp, "thay thế $1"]] };
     trang hoặc file JS có thể thêm cặp bằng LopHocBi.add({ "English": "Tiếng Việt" }).
     Dò chữ còn thiếu nghĩa: mở trang với ?vimiss (hiện danh sách ở góc dưới, gom qua nhiều trang; ?vimiss=clear để xóa). */
  var EXTRA = {}, cache = null;
  var norm = function (s) {
    return String(s).replace(/[ \s]+/g, " ").replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
      .replace(/^[^A-Za-z0-9"'(¿{]+/, "").replace(/^\d+[.)]\s+(?=[A-Za-z])/, "").replace(/[^A-Za-z0-9.!?)}"'À-ỹ]+$/, "").trim();
  };
  var VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  var plain = function (h) { return String(h).replace(/<br>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&"); };
  /* Học các cặp Anh – Việt có sẵn trong dữ liệu trang (window.SPEAK, window.PRESCHOOL): [..., "English", "Tiếng Việt", ...]
     và { en:"…", vi:"…" }, để chữ đó hiện ở chỗ khác (trò chơi, bài tập, bảng chọn bài) cũng có nghĩa. */
  function learn(v, d, depth) {
    if (!v || depth > 9) return;
    if (Array.isArray(v)) {
      for (var i = 0; i < v.length; i++) {
        var x = v[i], y = v[i + 1];
        if (typeof x === "string" && typeof y === "string" && !VI.test(x) && VI.test(y) && /[A-Za-z]{2}/.test(x) && x.length < 300) { if (!d[x]) d[x] = plain(y); }
        else if (typeof x === "object") learn(x, d, depth + 1);
      }
    } else if (typeof v === "object") {
      if (typeof v.en === "string" && typeof v.vi === "string" && VI.test(v.vi) && !d[v.en]) d[v.en] = plain(v.vi);
      for (var k in v) if (v[k] && typeof v[k] === "object") learn(v[k], d, depth + 1);
    }
  }
  /* "Listen! {s}! Who says {s}?" → mẫu khớp mọi câu cùng khuôn; chữ điền vào được dịch nếu có trong từ điển */
  function toPat(k, v) {
    var names = [], re = "^" + k.replace(/\{(\w+)\}|[.*+?^$()|[\]\\]/g, function (m, n) {
      if (!n) return "\\" + m;
      var i = names.indexOf(n); if (i >= 0) return "\\" + (i + 1);
      names.push(n); return n === "n" ? "(\\d+)" : "(.+?)";
    }) + "$";
    try { re = new RegExp(re, "i"); } catch (e) { return null; }
    return [re, function () {
      var g = arguments;
      return v.replace(/\{(\w+)\}/g, function (m, n) { var i = names.indexOf(n); if (i < 0) return m; var s = g[i + 1]; return n === "name" ? s : (word(s) || s); });
    }];
  }
  function word(s) { var D = dict(), t = norm(s); return D.d[t] || D.d[t.toLowerCase()] || ""; }
  function dict() {
    if (cache) return cache;
    var src = window.LOPHOC_VI || {}, d = {}, p = (src.pats || []).slice(), k, learned = {};
    learn(window.SPEAK, learned, 0); learn(window.PRESCHOOL, learned, 0);
    [src.more || {}, learned, src.dict || {}, EXTRA].forEach(function (o) {
      for (k in o) if (o[k]) {
        var key = norm(plain(k)), val = plain(o[k]);
        if (/\{\w+\}/.test(key)) { var q = toPat(key, val); if (q) p.push(q); continue; }
        d[key] = val; d[key.toLowerCase()] = val;
      }
    });
    cache = { d: d, p: p };
    return cache;
  }
  function lookup(text) {
    var t = norm(text); if (!/[A-Za-z]{2}/.test(t) || VI.test(t)) return "";
    var D = dict(), v = D.d[t] || D.d[t.toLowerCase()];
    if (v) return v;
    for (var i = 0; i < D.p.length; i++) if (D.p[i][0].test(t)) return t.replace(D.p[i][0], D.p[i][1]);
    /* dòng đổi từ "jump and run → dance / climb": dịch từng vế */
    if (/ → | \/ | · /.test(t)) {
      var n = 0, parts = t.split(/( → | \/ | · | and )/).map(function (x, k) { if (k % 2) return x === " and " ? " và " : x; var y = lookup(x); if (y) n++; return y || x; });
      if (n) return parts.join("");
    }
    return "";
  }
  var SKIP = "script,style,textarea,input,select,option,svg,canvas,.vi-t,[data-no-vi],.bi-btn,#units>a,#viMiss,.kn-cur,.kn-arw,.kn-btn,.sk-nm";
  var EMPH = /^(B|I|EM|STRONG|U|MARK)$/;
  var INL = /^(B|I|EM|STRONG|SMALL|SPAN|U|S|SUB|SUP|CODE|BR|MARK|ABBR|KBD|IMG)$/;
  var INLINE_HOST = /^(BUTTON|A|LABEL|SPAN|B|I|EM|STRONG|SMALL|SUMMARY|OPTION|TH)$/;
  function isVi(n) { return n.nodeType === 1 && n.classList.contains("vi-t"); }
  function hasVi(el) { for (var c = el.firstElementChild; c; c = c.nextElementSibling) if (isVi(c)) return true; return false; }
  function onlyInline(el) { for (var c = el.firstElementChild; c; c = c.nextElementSibling) if (!isVi(c) && !INL.test(c.tagName)) return false; return true; }
  function txt(el) { var s = ""; for (var c = el.firstChild; c; c = c.nextSibling) s += c.nodeType === 3 ? c.nodeValue : c.nodeType === 1 && !isVi(c) && !c.matches("svg,script,style") ? txt(c) : ""; return s; }
  function span(v, inl) { var s = document.createElement("span"); s.className = "vi-t" + (inl ? " in" : ""); s.lang = "vi"; s.setAttribute("data-auto", ""); s.textContent = v; return s; }
  var MISS = null;
  function miss(t) { if (MISS && /[A-Za-z]{3}/.test(t) && t.length < 300) MISS[norm(t)] = 1; }
  function walk(el) {
    if (el.nodeType !== 1 || el.matches(SKIP)) return;
    var sentence = false, done = hasVi(el), sib = el.nextElementSibling && isVi(el.nextElementSibling) ? el.nextElementSibling.textContent.trim() : ""; /* nghĩa có sẵn ngay sau */
    if (!done && onlyInline(el) && !el.querySelector(".vi-t")) {
      var t = txt(el);
      sentence = /[A-Za-z]{2}.*\s.*[A-Za-z]{2}/.test(t); /* câu nhiều chữ không có trong từ điển: không chèn nghĩa lắt nhắt vào từ in đậm bên trong */
      if (t.trim()) { var v = lookup(t); if (v) { if (v.trim() !== sib) el.appendChild(span(v, INLINE_HOST.test(el.tagName))); return; } }
    }
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) {
        if (done || !c.nodeValue.trim()) continue;
        var v2 = sentence ? "" : lookup(c.nodeValue);
        if (v2) { var sp = span(v2, true); el.insertBefore(sp, c.nextSibling); c = sp; }
        else if (MISS && !(c.nextSibling && isVi(c.nextSibling))) miss(onlyInline(el) ? txt(el) : c.nodeValue);
      } else if (c.nodeType === 1 && !(done && INL.test(c.tagName) && c.tagName !== "SMALL") && !(sentence && EMPH.test(c.tagName))) walk(c);
    }
  }
  var timer = 0, mo = null;
  function run() {
    timer = 0; if (!root.classList.contains("bi") || !document.body) return;
    if (mo) mo.disconnect();
    walk(document.body);
    if (MISS) showMiss();
    if (!mo && window.MutationObserver) mo = new MutationObserver(function () { later(); });
    if (mo) mo.observe(document.body, { childList: true, subtree: true });
  }
  function later() { if (!timer) timer = setTimeout(run, 60); }
  /* nạp từ điển (vi-dict.js nằm cạnh file này) */
  (function () {
    var me = document.currentScript, src = me && me.src ? me.src.replace(/bilingual\.js(\?.*)?$/, "vi-dict.js" + ((me.src.match(/\?.*$/) || [""])[0])) : "";
    if (!src || window.LOPHOC_VI) return;
    var s = document.createElement("script"); s.src = src; s.onload = function () { cache = null; later(); };
    (document.head || root).appendChild(s);
  })();
  /* chế độ dò chữ còn thiếu nghĩa */
  (function () {
    var m = /[?&]vimiss(=clear)?/.exec(location.search); if (!m) return;
    try { if (m[1]) localStorage.removeItem("lophoc-vimiss"); MISS = JSON.parse(localStorage.getItem("lophoc-vimiss") || "{}"); } catch (e) { MISS = {}; }
  })();
  function showMiss() {
    try { localStorage.setItem("lophoc-vimiss", JSON.stringify(MISS)); } catch (e) {}
    var b = document.getElementById("viMiss");
    if (!b) { b = document.createElement("pre"); b.id = "viMiss"; b.style.cssText = "position:fixed;left:0;bottom:0;z-index:99999;max-height:30vh;width:100%;overflow:auto;margin:0;background:#ffd;font:11px monospace;border-top:2px solid red;white-space:pre-wrap"; document.body.appendChild(b); }
    var k = Object.keys(MISS).filter(function (x) { return !VI.test(x) && !lookup(x); }).sort();
    b.textContent = "MISSING " + k.length + "\n" + k.join("\n");
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
    add: function (o) { for (var k in o) EXTRA[k] = o[k]; cache = null; later(); },
    vi: function (t, inline) { return t ? '<span class="vi-t' + (inline ? " in" : "") + '" lang="vi">' + esc(t) + "</span>" : ""; }
  };
})();

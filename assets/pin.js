/* Mã PIN của trang.
   - ANSWER_PIN: mở tab Đáp án (cho giáo viên, phụ huynh).
   - GRADE_PINS: mỗi khối lớp một mã, nhập đúng mới xem được bài của khối đó.
   Đổi mã: sửa các dòng bên dưới. Đây là khóa để các em không vào nhầm khối hay xem đáp án,
   không phải bảo mật thật (người rành máy tính vẫn đọc được file này). */
(function () {
  "use strict";
  var ANSWER_PIN = "1234";
  var GRADE_PINS = {
    "mau-giao": "2022",   // Mẫu giáo
    "lop-1":    "2022",   // Lớp 1 (dùng chung mã với Mẫu giáo)
    "lop-4":    "9041"    // Lớp 4
  };
  var GRADE_NAMES = { "mau-giao": "Mẫu giáo", "lop-1": "Lớp 1", "lop-4": "Lớp 4" };

  var KEY = "lophoc-answers-unlocked", GKEY = "lophoc-grade-";
  var mem = {}, subs = [];
  if (window.top !== window.self) document.documentElement.classList.add("in-shell");

  function sGet(k) { try { return sessionStorage.getItem(k) === "1" || localStorage.getItem(k) === "1"; } catch (e) { return !!mem[k]; } }
  function sSet(k, v, remember) {
    mem[k] = v;
    try {
      if (v) { sessionStorage.setItem(k, "1"); if (remember) localStorage.setItem(k, "1"); }
      else { sessionStorage.removeItem(k); localStorage.removeItem(k); }
    } catch (e) {}
  }
  var get = function () { return sGet(KEY); };
  function set(v) { sSet(KEY, v); notify(); }
  /* Mã đúng của khối nào thì mở luôn mọi khối dùng chung mã đó */
  function pinOpens(v, remember, target) {
    if (v !== GRADE_PINS[target]) return false;
    for (var id in GRADE_PINS) if (GRADE_PINS[id] === v) sSet(GKEY + id, true, remember);
    return true;
  }
  function gradeOk(id) { return !GRADE_PINS[id] || sGet(GKEY + id); }
  function notify() { var v = get(); subs.forEach(function (f) { try { f(v); } catch (e) {} }); checkGate(); }
  window.addEventListener("storage", function (e) { if (e.key === null || String(e.key).indexOf("lophoc-") === 0) notify(); });

  var css = "" +
    ".pin-bg{position:fixed;inset:0;background:rgba(10,20,25,.55);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}" +
    ".pin-box{background:var(--surface,#fff);color:var(--ink,#1C2A36);border-radius:18px;padding:22px 20px;width:min(360px,100%);text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);font-family:var(--f-body,system-ui,sans-serif)}" +
    ".pin-box h4{margin:0 0 4px;font-family:var(--f-display,inherit);font-size:1.3rem}" +
    ".pin-box p{margin:0;color:var(--muted,#56676A);font-size:.92rem}" +
    ".pin-field{position:relative;margin:14px 0 6px}" +
    ".pin-field input{width:100%;padding:10px 52px;font-size:1.6rem;letter-spacing:.4em;text-align:center;border:2px solid var(--line,#D3DFD8);border-radius:12px;background:var(--surface,#fff);color:inherit}" +
    ".pin-field input:focus{outline:none;border-color:var(--sky,#2F6F98)}" +
    ".pin-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:40px;height:40px;border:0;border-radius:10px;background:transparent;cursor:pointer;display:grid;place-items:center;color:var(--muted,#56676A);padding:0}" +
    ".pin-eye:hover{background:var(--sky-soft,#DCEAF3);color:var(--sky,#2F6F98)}" +
    ".pin-eye svg{width:24px;height:24px}" +
    ".pin-rem{display:flex;gap:8px;align-items:center;justify-content:center;font-size:.9rem;color:var(--muted,#56676A);margin-bottom:4px}" +
    ".pin-err{color:var(--bad,#B9352B);font-size:.9rem;min-height:1.4em;font-weight:600}" +
    ".pin-row{display:flex;gap:10px;justify-content:center;margin-top:8px;flex-wrap:wrap}" +
    ".pin-row button,.pin-row a{font:inherit;font-weight:700;padding:9px 18px;border-radius:10px;cursor:pointer;border:1px solid var(--line,#D3DFD8);background:var(--surface,#fff);color:inherit;text-decoration:none}" +
    ".pin-row .pin-ok{background:var(--sky,#2F6F98);border-color:var(--sky,#2F6F98);color:var(--surface,#fff)}" +
    ".pin-gate{position:fixed;inset:0;z-index:999;background:var(--bg,#F1F5F2);display:flex;align-items:center;justify-content:center;padding:16px}" +
    ".pin-gate .pin-box{box-shadow:none;border:1px solid var(--line,#D3DFD8)}" +
    ".pin-gate .big{font-size:3rem;line-height:1;margin-bottom:6px}" +
    ".pin-locked{background:var(--gold-soft,#FAEFD3);border:2px dashed var(--gold,#B98110);border-radius:16px;padding:22px;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center}" +
    ".pin-locked .big{font-size:2.6rem;line-height:1}" +
    ".pin-btn{font:inherit;font-weight:800;padding:9px 18px;border-radius:10px;cursor:pointer;border:0;background:var(--sky,#2F6F98);color:var(--surface,#fff)}" +
    ".pin-relock{font:inherit;font-weight:700;padding:6px 14px;border-radius:10px;cursor:pointer;border:1px solid var(--bad,#B9352B);background:var(--bad-soft,#F8E0DC);color:var(--bad,#B9352B)}" +
    ".in-shell .nav a.home,.in-shell .home-link{display:none!important}" +
    "html.grade-locked body>*:not(.pin-gate){visibility:hidden}";
  var st = document.createElement("style"); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.8 10.8 0 0 1 12 19C5 19 1 12 1 12a19.8 19.8 0 0 1 5.1-5.9M9.9 5.2A10 10 0 0 1 12 5c7 0 11 7 11 7a19.6 19.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M1 1l22 22"/></svg>';

  /* Hộp nhập PIN dùng chung. opt: {title, desc, check(value)->bool, remember, onOk, gate, homeHref} */
  function pinForm(opt, wrap) {
    wrap.innerHTML = '<div class="pin-box" role="dialog" aria-modal="true" aria-labelledby="pinT">' +
      (opt.gate ? '<div class="big" aria-hidden="true">🔒</div>' : "") +
      '<h4 id="pinT">' + opt.title + "</h4><p>" + opt.desc + "</p>" +
      '<div class="pin-field"><input type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="Mã PIN">' +
      '<button type="button" class="pin-eye" aria-label="Hiện mã đã nhập" aria-pressed="false" title="Hiện mã đã nhập">' + EYE + "</button></div>" +
      (opt.remember ? '<label class="pin-rem"><input type="checkbox"> Nhớ trên máy này</label>' : "") +
      '<div class="pin-err" aria-live="polite"></div><div class="pin-row">' +
      (opt.gate ? '<a href="' + opt.homeHref + '" target="_top">← Trang chủ</a>' : '<button type="button" class="pin-cancel">Hủy</button>') +
      '<button type="button" class="pin-ok">Mở khóa</button></div></div>';
    var inp = wrap.querySelector(".pin-field input"), err = wrap.querySelector(".pin-err"), rem = wrap.querySelector(".pin-rem input");
    var eye = wrap.querySelector(".pin-eye");
    eye.onclick = function () {
      var show = inp.type === "password";
      inp.type = show ? "text" : "password";
      eye.innerHTML = show ? EYE_OFF : EYE;
      eye.setAttribute("aria-pressed", show);
      eye.setAttribute("aria-label", show ? "Ẩn mã đã nhập" : "Hiện mã đã nhập");
      eye.title = eye.getAttribute("aria-label");
      inp.focus();
    };
    function verify() {
      if (opt.check(inp.value.trim(), rem && rem.checked)) { if (opt.onOk) opt.onOk(); }
      else { err.textContent = "Sai mã PIN, thử lại nhé."; inp.select(); }
    }
    wrap.querySelector(".pin-ok").onclick = verify;
    var c = wrap.querySelector(".pin-cancel"); if (c) c.onclick = opt.onCancel;
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); verify(); }
      else if (e.key === "Escape" && opt.onCancel) opt.onCancel();
      else if (e.key === "Tab") {
        var f = wrap.querySelectorAll("input,button,a"), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    setTimeout(function () { inp.focus(); }, 0);
  }
  var bg = null, lastFocus = null;
  function closeModal() { if (bg) { bg.remove(); bg = null; } if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function modal(opt) {
    lastFocus = document.activeElement; if (bg) closeModal();
    bg = document.createElement("div"); bg.className = "pin-bg"; document.body.appendChild(bg);
    var ok = opt.onOk;
    opt.onOk = function () { closeModal(); notify(); if (ok) ok(); };
    opt.onCancel = closeModal;
    bg.addEventListener("click", function (e) { if (e.target === bg) closeModal(); });
    pinForm(opt, bg);
  }

  function unlockAnswers(cb) {
    if (get()) { if (cb) cb(); return; }
    modal({ title: "🔒 Nhập mã PIN Đáp án", desc: "Phần đáp án dành cho giáo viên và phụ huynh.",
      check: function (v) { if (v === ANSWER_PIN) { sSet(KEY, true); return true; } return false; }, onOk: cb });
  }
  function unlockGrade(id, cb) {
    if (gradeOk(id)) { if (cb) cb(); return; }
    modal({ title: "🔒 " + (GRADE_NAMES[id] || id), desc: "Nhập mã PIN của lớp để vào học.", remember: true,
      check: function (v, remember) { return pinOpens(v, remember, id); }, onOk: cb });
  }
  function lockAll() { sSet(KEY, false); for (var id in GRADE_PINS) sSet(GKEY + id, false); notify(); }

  /* Chặn trang bài học nếu chưa nhập PIN của khối (trang khai báo <html data-grade="...">) */
  var gate = null;
  function checkGate() {
    var g = document.documentElement.getAttribute("data-grade");
    if (!g || !document.body) return;
    if (gradeOk(g)) { document.documentElement.classList.remove("grade-locked"); if (gate) { gate.remove(); gate = null; } return; }
    document.documentElement.classList.add("grade-locked");
    if (gate) return;
    gate = document.createElement("div"); gate.className = "pin-gate"; document.body.appendChild(gate);
    var home = (document.querySelector('a[href$="index.html"]') || {}).getAttribute ? document.querySelector('a[href$="index.html"]').getAttribute("href") : "../index.html";
    pinForm({ gate: true, homeHref: home, title: "Bài của " + (GRADE_NAMES[g] || g), desc: "Nhập mã PIN của lớp để vào học.", remember: true,
      check: function (v, remember) { return pinOpens(v, remember, g); },
      onOk: function () { notify(); } }, gate);
  }
  if (document.documentElement.getAttribute("data-grade")) {
    if (!gradeOk(document.documentElement.getAttribute("data-grade"))) document.documentElement.classList.add("grade-locked");
    if (document.body) checkGate(); else document.addEventListener("DOMContentLoaded", checkGate);
  }

  /* Khối đáp án trong bài: khóa thì hiện thẻ "Nhập mã PIN", mở thì hiện nội dung + nút Khóa lại */
  function guard(container, renderFn) {
    function draw(unlocked) {
      if (!unlocked) {
        container.innerHTML = '<div class="pin-locked"><span class="big" aria-hidden="true">🔒</span>' +
          '<b>Đáp án đang được khóa</b><span>Dành cho giáo viên và phụ huynh, để các em không bấm nhầm.</span>' +
          '<button type="button" class="pin-btn">Nhập mã PIN</button></div>';
        container.querySelector(".pin-btn").onclick = function () { unlockAnswers(); };
      } else {
        container.innerHTML = '<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button type="button" class="pin-relock">🔐 Khóa lại</button></div>';
        var body = document.createElement("div"); container.appendChild(body); renderFn(body);
        container.querySelector(".pin-relock").onclick = function () { set(false); };
      }
    }
    subs.push(draw); draw(get());
  }

  window.LopHocPIN = {
    isUnlocked: get, unlock: unlockAnswers, lock: function () { set(false); },
    gradeOk: gradeOk, unlockGrade: unlockGrade, lockAll: lockAll,
    anyGradeOpen: function () { for (var id in GRADE_PINS) if (sGet(GKEY + id)) return true; return false; },
    onChange: function (f) { subs.push(f); f(get()); }, refresh: notify, guard: guard
  };
})();

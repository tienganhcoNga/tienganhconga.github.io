/* Khóa phần Đáp án bằng mã PIN.
   Đổi mã PIN ở dòng PIN bên dưới. Mở khóa một lần là mở cho mọi bài trong cùng tab trình duyệt,
   đóng tab là tự khóa lại. Lưu ý: đây chỉ là khóa để bé không bấm nhầm, không phải bảo mật thật. */
(function () {
  "use strict";
  var PIN = "1234";
  var KEY = "lophoc-answers-unlocked";
  var mem = false, subs = [];

  if (window.top !== window.self) document.documentElement.classList.add("in-shell");

  function get() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return mem; } }
  function set(v) {
    mem = v;
    try { if (v) sessionStorage.setItem(KEY, "1"); else sessionStorage.removeItem(KEY); } catch (e) {}
    notify();
  }
  function notify() { var v = get(); subs.forEach(function (f) { try { f(v); } catch (e) {} }); }
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === null) notify(); });

  var css = "" +
    ".pin-bg{position:fixed;inset:0;background:rgba(10,20,25,.55);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}" +
    ".pin-box{background:var(--surface,#fff);color:var(--ink,#1C2A36);border-radius:18px;padding:22px 20px;width:min(340px,100%);text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);font-family:var(--f-body,system-ui,sans-serif)}" +
    ".pin-box h4{margin:0 0 4px;font-family:var(--f-display,inherit);font-size:1.3rem}" +
    ".pin-box p{margin:0;color:var(--muted,#56676A);font-size:.92rem}" +
    ".pin-box input{width:100%;margin:14px 0 6px;padding:10px;font-size:1.6rem;letter-spacing:.4em;text-align:center;border:2px solid var(--line,#D3DFD8);border-radius:12px;background:var(--surface,#fff);color:inherit}" +
    ".pin-box input:focus{outline:none;border-color:var(--sky,#2F6F98)}" +
    ".pin-err{color:var(--bad,#B9352B);font-size:.9rem;min-height:1.4em;font-weight:600}" +
    ".pin-row{display:flex;gap:10px;justify-content:center;margin-top:8px}" +
    ".pin-row button{font:inherit;font-weight:700;padding:9px 18px;border-radius:10px;cursor:pointer;border:1px solid var(--line,#D3DFD8);background:var(--surface,#fff);color:inherit}" +
    ".pin-row .pin-ok{background:var(--sky,#2F6F98);border-color:var(--sky,#2F6F98);color:var(--surface,#fff)}" +
    ".pin-locked{background:var(--gold-soft,#FAEFD3);border:2px dashed var(--gold,#B98110);border-radius:16px;padding:22px;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center}" +
    ".pin-locked .big{font-size:2.6rem;line-height:1}" +
    ".pin-btn{font:inherit;font-weight:800;padding:9px 18px;border-radius:10px;cursor:pointer;border:0;background:var(--sky,#2F6F98);color:var(--surface,#fff)}" +
    ".pin-relock{font:inherit;font-weight:700;padding:6px 14px;border-radius:10px;cursor:pointer;border:1px solid var(--bad,#B9352B);background:var(--bad-soft,#F8E0DC);color:var(--bad,#B9352B)}" +
    ".in-shell .nav a.home,.in-shell .home-link{display:none!important}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var bg = null, onOk = null, lastFocus = null;
  function close() { if (bg) { bg.remove(); bg = null; } if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function open(cb) {
    if (get()) { if (cb) cb(); return; }
    onOk = cb; lastFocus = document.activeElement;
    if (bg) close();
    bg = document.createElement("div");
    bg.className = "pin-bg";
    bg.innerHTML = '<div class="pin-box" role="dialog" aria-modal="true" aria-labelledby="pinTitle">' +
      '<h4 id="pinTitle">🔒 Nhập mã PIN</h4><p>Phần đáp án dành cho giáo viên và phụ huynh.</p>' +
      '<input type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="Mã PIN">' +
      '<div class="pin-err" aria-live="polite"></div>' +
      '<div class="pin-row"><button type="button" class="pin-cancel">Hủy</button><button type="button" class="pin-ok">Mở khóa</button></div></div>';
    document.body.appendChild(bg);
    var inp = bg.querySelector("input"), err = bg.querySelector(".pin-err");
    function verify() {
      if (inp.value.trim() === PIN) { var f = onOk; close(); set(true); if (f) f(); }
      else { err.textContent = "Sai mã PIN, thử lại nhé."; inp.select(); }
    }
    bg.querySelector(".pin-ok").onclick = verify;
    bg.querySelector(".pin-cancel").onclick = close;
    bg.addEventListener("click", function (e) { if (e.target === bg) close(); });
    bg.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); verify(); }
      else if (e.key === "Escape") close();
      else if (e.key === "Tab") {
        var f = bg.querySelectorAll("input,button"), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    setTimeout(function () { inp.focus(); }, 0);
  }

  /* Gắn vào một khối đáp án: khi khóa hiện thẻ "Nhập mã PIN", khi mở hiện nội dung + nút Khóa lại */
  function guard(container, renderFn) {
    function draw(unlocked) {
      if (!unlocked) {
        container.innerHTML = '<div class="pin-locked"><span class="big" aria-hidden="true">🔒</span>' +
          '<b>Đáp án đang được khóa</b><span>Dành cho giáo viên và phụ huynh, để các em không bấm nhầm.</span>' +
          '<button type="button" class="pin-btn">Nhập mã PIN</button></div>';
        container.querySelector(".pin-btn").onclick = function () { open(); };
      } else {
        container.innerHTML = '<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button type="button" class="pin-relock">🔐 Khóa lại</button></div>';
        var body = document.createElement("div"); container.appendChild(body); renderFn(body);
        container.querySelector(".pin-relock").onclick = function () { set(false); };
      }
    }
    subs.push(draw); draw(get());
  }

  window.LopHocPIN = {
    isUnlocked: get,
    unlock: open,
    lock: function () { set(false); },
    onChange: function (f) { subs.push(f); f(get()); },
    refresh: notify,
    guard: guard
  };
})();

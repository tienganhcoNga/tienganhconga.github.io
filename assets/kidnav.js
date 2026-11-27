/* Thanh chọn bài gọn cho bé (Mầm non, Lớp 1).
   Thay hàng nút dài (Unit 1, Unit 2... / Review 1, Review 2...) bằng:
     ‹  [bài đang học]  ›        ☰ All   🔒
   - ‹ ›: sang bài trước, bài sau.
   - ☰ All (hoặc bấm vào bài đang học): bảng chọn bài bằng hình to.
   - 🔒: mục dành cho cô và ba mẹ (🗺️ Lộ trình, 🔒 Cẩm nang).
   Các nút gốc trong #units vẫn giữ nguyên (ẩn đi), nên trang vẫn tự đánh dấu
   bài đang học bằng aria-current như cũ; file này chỉ đọc lại và vẽ thanh mới.
   Nạp file này SAU script chính của trang. */
(function () {
  "use strict";
  var box = document.getElementById("units");
  if (!box) return;
  var TEACH = /^#(lo-trinh|answers)$/, EXTRA = /^#(tu-dien)$/;  /* EXTRA: có trong bảng All nhưng không nằm trong chuỗi bài ‹ › */

  var css = "" +
    ".kn-on>a:not(.home){display:none!important}" +
    ".kn-on{align-items:center;overflow:visible!important}" +
    ".kn{display:flex;align-items:center;gap:8px;flex:1;min-width:0}" +
    ".kn .kn-arw,.kn .kn-cur,.kn .kn-btn{flex:none;font:inherit;font-weight:800;text-decoration:none;color:var(--ink);border:1px solid var(--line);background:var(--surface);border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}" +
    ".kn .kn-arw{width:44px;height:44px;font-size:1.4rem;line-height:1;padding:0}" +
    ".kn .kn-arw[aria-disabled=true]{visibility:hidden}" +
    ".kn .kn-cur{min-height:44px;padding:4px 18px;font-size:1.15rem;background:var(--accent-soft);border:2px solid var(--accent);min-width:0;max-width:min(52vw,320px);flex:0 1 auto}" +
    ".kn .kn-cur span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".kn .kn-cur .kn-ic{font-size:1.4rem}" +
    ".kn .kn-sp{flex:1}" +
    ".kn .kn-btn{min-height:44px;padding:4px 14px;font-size:1rem}" +
    ".kn .kn-lock{width:44px;padding:0;font-size:1.1rem;opacity:.75}" +
    ".kn .kn-arw:hover,.kn .kn-btn:hover{border-color:var(--accent)}" +
    ".kn-pop{position:relative;flex:none}" +
    ".kn-menu{position:absolute;right:0;top:calc(100% + 6px);background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.18);padding:6px;display:flex;flex-direction:column;gap:4px;min-width:190px;z-index:20}" +
    ".kn-menu[hidden]{display:none}" +
    ".kn-menu a{display:block;padding:10px 12px;border-radius:10px;text-decoration:none;color:var(--ink);font-weight:700;border:0!important;background:none}" +
    ".kn-menu a:hover,.kn-menu a[aria-current=page]{background:var(--accent-soft)}" +
    ".kn-bg{position:fixed;inset:0;background:rgba(10,20,25,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}" +
    ".kn-box{background:var(--bg,#fff);border-radius:22px;padding:18px;width:min(720px,100%);max-height:90vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.3)}" +
    ".kn-top{display:flex;justify-content:flex-end;margin-bottom:8px}" +
    ".kn-x{width:48px;height:48px;border-radius:999px;border:1px solid var(--line);background:var(--surface);font-size:1.4rem;cursor:pointer;color:var(--ink)}" +
    ".kn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}" +
    ".kn-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:118px;padding:12px 8px;border-radius:18px;border:2px solid var(--line);background:var(--surface);text-decoration:none;color:var(--ink);font-weight:800;text-align:center;line-height:1.2}" +
    ".kn-card .kn-ic{font-size:2.6rem;line-height:1}" +
    ".kn-card:hover{border-color:var(--accent)}" +
    ".kn-card[aria-current=page]{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 4px 0 var(--accent)}" +
    "@media (max-width:560px){.kn-on>a.home{font-size:0;padding:0;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center}.kn-on>a.home::before{content:'🏠';font-size:1.2rem}" +
    ".kn{gap:4px}.kn .kn-arw{width:36px}.kn .kn-arw[aria-disabled=true]{display:none}.kn .kn-btn{width:40px;padding:0}.kn .kn-all b{display:none}.kn .kn-cur{padding:4px 8px;gap:4px;font-size:1rem;max-width:none}.kn .kn-cur .kn-ic{font-size:1.15rem}.kn-grid{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}.kn-card{min-height:100px}}";

  /* Tách hình (emoji) và chữ của một nút gốc */
  function parts(a) {
    var sp = a.querySelector('span[aria-hidden="true"]'), ic, label;
    if (sp) { ic = sp.textContent.trim(); label = a.textContent.replace(sp.textContent, "").trim(); }
    else {
      var t = a.textContent.trim(), m = t.match(/^(\S+)\s+(.+)$/);
      if (m && !/[A-Za-z0-9À-ỹ]/.test(m[1])) { ic = m[1]; label = m[2]; } else { ic = ""; label = t; }
    }
    return { ic: ic, label: label, href: a.getAttribute("href"), cur: a.getAttribute("aria-current") === "page" };
  }
  function items() {
    var kid = [], teach = [], extra = [];
    Array.prototype.forEach.call(box.children, function (a) {
      if (a.tagName !== "A" || a.classList.contains("home")) return;
      var p = parts(a); (TEACH.test(p.href) ? teach : EXTRA.test(p.href) ? extra : kid).push(p);
    });
    return { kid: kid, teach: teach, extra: extra };
  }
  function el(tag, cls, attrs, kids) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function icLabel(p) { return [el("span", "kn-ic", { "aria-hidden": "true" }, [p.ic || "⭐"]), el("span", "", {}, [p.label])]; }

  /* ---------- bảng chọn bài ---------- */
  var bg = null, opener = null;
  function closeAll() { if (bg) { bg.remove(); bg = null; if (opener) opener.focus(); } }
  function openAll() {
    var it = items(); opener = document.activeElement; closeAll();
    var x = el("button", "kn-x", { type: "button", "aria-label": "Close" }, ["✕"]);
    var grid = el("div", "kn-grid", {}, it.kid.concat(it.extra).map(function (p) {
      return el("a", "kn-card", p.cur ? { href: p.href, "aria-current": "page" } : { href: p.href }, icLabel(p));
    }));
    bg = el("div", "kn-bg", {}, [el("div", "kn-box", { role: "dialog", "aria-modal": "true", "aria-label": "All lessons" }, [el("div", "kn-top", {}, [x]), grid])]);
    document.body.appendChild(bg);
    x.onclick = closeAll;
    bg.addEventListener("click", function (e) { if (e.target === bg || e.target.closest(".kn-card")) setTimeout(closeAll, 0); });
    bg.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
    (grid.querySelector("[aria-current]") || grid.firstChild || x).focus();
  }

  /* ---------- thanh gọn ---------- */
  var bar = el("div", "kn"), menu = null;
  function render() {
    var it = items(), k = it.kid, i = -1, j;
    for (j = 0; j < k.length; j++) if (k[j].cur) i = j;
    var t = null, te = it.teach.concat(it.extra); for (j = 0; j < te.length; j++) if (te[j].cur) t = te[j];
    var cur = i >= 0 ? k[i] : (t || { ic: "☰", label: "All" });
    var prev = i > 0 ? k[i - 1] : null, next = i >= 0 ? k[i + 1] : k[0];
    function arw(p, sym, name) {
      return p ? el("a", "kn-arw", { href: p.href, "aria-label": name + ": " + p.label, title: p.label }, [sym])
               : el("span", "kn-arw", { "aria-disabled": "true" }, [sym]);
    }
    var curBtn = el("button", "kn-cur", { type: "button", title: "All lessons" }, icLabel(cur));
    curBtn.onclick = openAll;
    var all = el("button", "kn-btn kn-all", { type: "button", "aria-label": "All lessons", title: "All lessons" }, ["☰", el("b", "", {}, ["All"])]); all.onclick = openAll;
    var nodes = [arw(prev, "‹", "Back"), curBtn, arw(next, "›", "Next"), el("span", "kn-sp"), all];
    if (it.teach.length) {
      var lock = el("button", "kn-btn kn-lock", { type: "button", "aria-label": "For teachers and parents", title: "For teachers and parents", "aria-expanded": "false" }, ["🔒"]);
      menu = el("div", "kn-menu", { hidden: "" }, it.teach.map(function (p) {
        return el("a", "", p.cur ? { href: p.href, "aria-current": "page" } : { href: p.href }, [(p.ic ? p.ic + " " : "") + p.label]);
      }));
      lock.onclick = function (e) { e.stopPropagation(); var h = !menu.hidden; menu.hidden = h; lock.setAttribute("aria-expanded", String(!h)); };
      menu.onclick = function () { menu.hidden = true; };
      nodes.push(el("div", "kn-pop", {}, [lock, menu]));
    }
    bar.innerHTML = ""; nodes.forEach(function (n) { bar.appendChild(n); });
  }
  document.addEventListener("click", function (e) { if (menu && !menu.hidden && !e.target.closest(".kn-pop")) menu.hidden = true; });

  function start() {
    if (!box.querySelector("a:not(.home)")) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    box.classList.add("kn-on"); box.appendChild(bar); render();
    new MutationObserver(render).observe(box, { attributes: true, subtree: true, attributeFilter: ["aria-current"] });
    window.addEventListener("hashchange", function () { setTimeout(render, 0); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

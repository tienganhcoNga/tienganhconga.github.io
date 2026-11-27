/* Thanh chọn bài gọn cho học sinh (Mầm non, Lớp 1, Lớp 4).
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
    /* hộp: thanh trên cố định (tab nhóm + nút ✕), phần thẻ bài cuộn bên dưới */
    ".kn-box{background:var(--bg,#fff);border-radius:22px;width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.3)}" +
    ".kn-head{flex:none;display:flex;align-items:center;gap:10px;padding:12px 12px 12px 16px;border-bottom:1px solid var(--line);background:var(--surface)}" +
    ".kn-head h3{flex:1;margin:0;font-family:var(--f-display,inherit);font-size:1.2rem;color:var(--ink)}" +
    ".kn-tabs{flex:1;min-width:0;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px}" +
    ".kn-tab{flex:none;font:inherit;font-weight:800;font-size:1rem;padding:8px 14px;border-radius:999px;border:2px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;display:inline-flex;gap:6px;align-items:center}" +
    ".kn-tab:hover{border-color:var(--accent)}" +
    ".kn-tab[aria-selected=true]{border-color:var(--accent);background:var(--accent-soft)}" +
    ".kn-x{flex:none;width:44px;height:44px;border-radius:999px;border:1px solid var(--line);background:var(--surface);font-size:1.3rem;cursor:pointer;color:var(--ink)}" +
    ".kn-body{min-height:0;overflow:auto;padding:16px}" +
    ".kn-sec[hidden]{display:none}" +
    ".kn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}" +
    ".kn-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:118px;padding:12px 8px;border-radius:18px;border:2px solid var(--line);background:var(--surface);text-decoration:none;color:var(--ink);font-weight:800;text-align:center;line-height:1.2}" +
    ".kn-card .kn-ic{font-size:2.6rem;line-height:1}" +
    ".kn-card:hover{border-color:var(--accent)}" +
    ".kn-card[aria-current=page]{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 4px 0 var(--accent)}" +
    ".kn-card small{font-weight:600;font-size:.78rem;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    "@media (max-width:560px){.kn-on>a.home{font-size:0;padding:0;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center}.kn-on>a.home::before{content:'🏠';font-size:1.2rem}" +
    ".kn{gap:4px}.kn .kn-arw{width:36px}.kn .kn-arw[aria-disabled=true]{display:none}.kn .kn-btn{width:40px;padding:0}.kn .kn-all b{display:none}.kn .kn-cur{padding:4px 8px;gap:4px;font-size:1rem;max-width:none}.kn .kn-cur .kn-ic{font-size:1.15rem}.kn-grid{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}.kn-card{min-height:100px}.kn-bg{padding:8px}.kn-head{padding:8px;gap:6px}.kn-tab{padding:6px 10px;font-size:.92rem}.kn-body{padding:10px}}";

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

  /* ---------- bảng chọn bài ----------
     Mở trong trang chủ (index.html): hiện mọi bài của cả khối lớp, chia nhóm theo từng phần
     (Stage 1, Stage 2, Speaking...), lấy từ danh sách GRADES của trang chủ.
     Mở thẳng file bài học: chỉ hiện các bài trong trang này. */
  function gradeOfPage() {
    var G = null;
    try { if (window.parent !== window) G = window.parent.LOPHOC_GRADES; } catch (e) {}
    if (!G) return null;
    var path = decodeURIComponent(location.pathname);
    for (var i = 0; i < G.length; i++) for (var j = 0; j < G[i].lessons.length; j++)
      if (path.slice(-(G[i].lessons[j].file.length + 1)) === "/" + G[i].lessons[j].file) return { g: G[i], l: G[i].lessons[j] };
    return null;
  }
  /* "Unit 3: Under the Sea" → chữ to "Unit 3", chữ nhỏ "Under the Sea" */
  function splitName(n) {
    n = String(n).replace(/^\S+\s+/, function (w) { return /[A-Za-z0-9À-ỹ]/.test(w) ? w : ""; });
    var k = n.indexOf(": ");
    return k > 0 ? { t: n.slice(0, k), s: n.slice(k + 2) } : { t: n, s: "" };
  }
  function card(ic, t, s, attrs) {
    return el("a", "kn-card", attrs, [el("span", "kn-ic", { "aria-hidden": "true" }, [ic || "⭐"]), el("span", "", {}, [t])].concat(s ? [el("small", "", {}, [s])] : []));
  }
  var bg = null, opener = null;
  function closeAll() { if (bg) { bg.remove(); bg = null; if (opener) opener.focus(); } }
  function openAll() {
    var it = items(), here = gradeOfPage(), secs = [], tabs = []; opener = document.activeElement; closeAll();
    var x = el("button", "kn-x", { type: "button", "aria-label": "Close" }, ["✕"]);
    if (here) {
      /* mỗi phần của khối lớp là một tab; mở sẵn tab của trang đang học */
      var curId = location.hash.slice(1), domIc = {};
      it.kid.concat(it.extra).forEach(function (p) { domIc[p.href.slice(1)] = p.ic; });
      here.g.lessons.forEach(function (l) {
        var mine = l === here.l;
        var cards = l.topics.filter(function (t) { return !/^(lo-trinh|answers)$/.test(t[0]); }).map(function (t) {
          var nm = splitName(t[1]), a = { href: mine ? "#" + t[0] : "#", "data-go": mine ? "" : here.g.id + "/" + l.id + "/" + t[0] };
          if (mine && t[0] === curId) a["aria-current"] = "page";
          return card(t[2] || (mine && domIc[t[0]]) || l.ic, nm.t, nm.s, a);
        });
        if (!cards.length) return;
        var n = secs.length, sec = el("section", "kn-sec", { role: "tabpanel", id: "kn-p" + n, "aria-labelledby": "kn-t" + n }, [el("div", "kn-grid", {}, cards)]);
        var tab = el("button", "kn-tab", { type: "button", role: "tab", id: "kn-t" + n, "aria-controls": "kn-p" + n }, [el("span", "", { "aria-hidden": "true" }, [l.ic]), l.en || l.name]);
        tab.onclick = function () { pick(n); };
        sec.mine = mine; secs.push(sec); tabs.push(tab);
      });
    } else {
      secs.push(el("section", "kn-sec", {}, [el("div", "kn-grid", {}, it.kid.concat(it.extra).map(function (p) {
        return card(p.ic, p.label, "", p.cur ? { href: p.href, "aria-current": "page" } : { href: p.href });
      }))]));
    }
    var body = el("div", "kn-body", {}, secs);
    function pick(n) {
      secs.forEach(function (s, k) { s.hidden = k !== n; });
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", String(k === n)); });
      body.scrollTop = 0;
    }
    var start = 0; secs.forEach(function (s, k) { if (s.mine) start = k; });
    if (tabs.length) pick(start);
    var head = el("div", "kn-head", {}, [tabs.length > 1 ? el("div", "kn-tabs", { role: "tablist", "aria-label": "Parts" }, tabs) : el("h3", "", {}, ["All lessons"]), x]);
    bg = el("div", "kn-bg", {}, [el("div", "kn-box", { role: "dialog", "aria-modal": "true", "aria-label": "All lessons" }, [head, body])]);
    document.body.appendChild(bg);
    var selTab = head.querySelector('[aria-selected="true"]'); if (selTab && selTab.scrollIntoView) selTab.scrollIntoView({ block: "nearest", inline: "nearest" });
    x.onclick = closeAll;
    bg.addEventListener("click", function (e) {
      var c = e.target.closest(".kn-card");
      if (c && c.getAttribute("data-go")) { e.preventDefault(); try { window.parent.location.hash = "#" + c.getAttribute("data-go"); } catch (er) {} }
      if (e.target === bg || c) setTimeout(closeAll, 0);
    });
    bg.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
    (bg.querySelector(".kn-card[aria-current]") || bg.querySelector(".kn-card") || x).focus();
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
    var nodes = [arw(prev, "‹", "Back"), curBtn, arw(next, "›", "Next"), el("span", "kn-sp")];
    /* nút 🇻🇳 Song ngữ cho phụ huynh (assets/bilingual.js), cùng một nút được gắn lại mỗi lần vẽ */
    if (window.LopHocBi && LopHocBi.btn) nodes.push(LopHocBi.btn());
    nodes.push(all);
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

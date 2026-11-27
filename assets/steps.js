/* Con đường các bước cho bé tự dùng: một bộ component dùng chung cho mọi trang bài học
   (Mầm non giai đoạn 1–3, Ôn tập nói, Giáo án lớp 1, Từ vựng lớp 4). CSS nằm trong course.css.

   Mỗi bước: { k:"words", ic:"👂", t:"Listen", say:"Tap a picture and listen!", vi:"Bấm vào hình để nghe" }.
   Trang dùng:
     KID.setup({ store:"lophoc.mg.steps", id:fn→id bài đang mở, stop:fn dừng đọc, talk:fn(step) đọc lời hướng dẫn (tùy chọn), say:fn(text) })
     KID.use(steps, muốn, end)   → chọn danh sách bước của bài, trả về key bước đang mở.
                                    end = { href, ic, label, top } là nút 🏆 ▶ ở bước cuối (sang bài sau), có thể bỏ trống.
     KID.bar()                   → thanh các bước (⭐ ở bước đã xong).
     KID.panel(key, { cls, id, extra, body }) → khung một bước: đầu bước (icon, tên, 🔊, lời hướng dẫn, nút phụ bên phải),
                                    nội dung, nút ▶ to sang bước sau.
     KID.show(key, talk)         → chỉ hiện bước key; talk = true thì đọc lời hướng dẫn.
     KID.mark(key)               → đánh dấu bước xong (⭐, nhớ trên máy).
   Bấm nút bước, nút ▶ và nút 🔊 đầu bước do file này tự xử lý. */
(function () {
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var SPK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
  var cfg = {}, STEPS = [], CUR = null, END = null;
  function load() { try { return JSON.parse(localStorage.getItem(cfg.store) || "{}") || {}; } catch (e) { return {}; } }
  function find(k) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].k === k) return STEPS[i]; return null; }
  function curId() { return cfg.id ? cfg.id() : null; }
  function say(t) {
    if (cfg.say) return cfg.say(t);
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; speechSynthesis.speak(u);
  }

  var K = window.KID = {
    setup: function (o) { cfg = o || {}; },
    use: function (steps, want, end) {
      STEPS = steps.filter(Boolean); END = end || null;
      CUR = find(want) ? want : (STEPS[0] ? STEPS[0].k : null);
      return CUR;
    },
    cur: function () { return CUR; },
    has: function (k) { return !!find(k); },
    done: function () { var id = curId(); return (id != null && load()[id]) || {}; },
    mark: function (key) {
      var id = curId(); if (id == null || !find(key)) return;
      try { var a = load(); a[id] = a[id] || {}; a[id][key] = 1; localStorage.setItem(cfg.store, JSON.stringify(a)); } catch (e) {}
      var b = document.querySelector('.stp[data-step-go="' + key + '"]'); if (b) b.classList.add("is-done");
    },
    bar: function () {
      if (STEPS.length < 2) return "";
      var d = K.done();
      return '<nav class="steps" aria-label="Steps">' + STEPS.map(function (s) {
        return '<button class="stp' + (d[s.k] ? " is-done" : "") + '" type="button" data-step-go="' + s.k + '" aria-current="' + (s.k === CUR) + '">' +
          '<span class="e" aria-hidden="true">' + s.ic + "</span><b>" + esc(s.t) + '</b><i class="star" aria-hidden="true">⭐</i></button>';
      }).join('<span class="stp-line" aria-hidden="true"></span>') + "</nav>";
    },
    head: function (s, extra) {
      return '<div class="b-head step-head"><h3><span class="st-ic" aria-hidden="true">' + s.ic + "</span> " + esc(s.t) + "</h3>" +
        '<button class="say" type="button" data-ksay="' + esc(s.say) + '" aria-label="' + esc(s.say) + '">' + SPK + "</button>" +
        '<span class="st-say">' + esc(s.say) + (s.vi ? '<span class="vi-t" lang="vi">' + esc(s.vi) + "</span>" : "") + "</span>" +
        (extra ? '<span class="st-x">' + extra + "</span>" : "") + "</div>";
    },
    next: function (key) {
      var i = STEPS.indexOf(find(key)), n = STEPS[i + 1];
      if (n) return '<div class="step-next"><button class="go-next" type="button" data-step-go="' + n.k + '" data-from="' + key + '" aria-label="Next: ' + esc(n.t) + '"><span aria-hidden="true">' + n.ic + "</span> ▶</button></div>";
      if (END && END.href) return '<div class="step-next"><a class="go-next" href="' + esc(END.href) + '"' + (END.top ? ' target="_top"' : "") + ' data-from="' + key + '" aria-label="' + esc(END.label || "Next") + '"><span aria-hidden="true">🏆' + (END.ic ? " " + END.ic : "") + "</span> ▶</a></div>";
      return "";
    },
    panel: function (key, o) {
      var s = find(key); o = o || {};
      if (!s) return "";
      return '<div class="block kstep' + (o.cls ? " " + o.cls : "") + (key === CUR ? " on" : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + ' data-step="' + key + '">' +
        K.head(s, o.extra) + (o.body || "") + K.next(key) + "</div>";
    },
    show: function (key, talk) {
      var s = find(key) || STEPS[0]; if (!s) return;
      CUR = s.k;
      if (cfg.stop) cfg.stop();
      Array.prototype.forEach.call(document.querySelectorAll(".kstep[data-step]"), function (b) { b.classList.toggle("on", b.getAttribute("data-step") === CUR); });
      Array.prototype.forEach.call(document.querySelectorAll(".stp[data-step-go]"), function (b) { b.setAttribute("aria-current", String(b.getAttribute("data-step-go") === CUR)); });
      if (talk) {
        var bar = document.querySelector("nav.steps");
        if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ block: "start" });
        if (cfg.talk) cfg.talk(s); else say(s.say);
      }
    }
  };

  document.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var g = t.closest("[data-step-go]");
    if (g) { var fr = g.getAttribute("data-from"); if (fr) K.mark(fr); K.show(g.getAttribute("data-step-go"), true); return; }
    var a = t.closest("a.go-next[data-from]"); if (a) { K.mark(a.getAttribute("data-from")); return; }
    var k = t.closest("[data-ksay]"); if (k) { if (cfg.stop) cfg.stop(); say(k.getAttribute("data-ksay")); }
  });
})();

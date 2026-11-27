/* Giọng đọc tiếng Anh dùng chung cho mọi trang bài học.
   - Tự chọn giọng tốt nhất máy đang có: giọng Natural/Online (Edge), Google (Chrome),
     Enhanced/Premium hoặc Samantha, Ava... (iPhone, iPad, Mac). Bỏ các giọng vui kiểu
     "Albert", "Bubbles", "Grandpa" của Apple vì đọc méo âm.
   - Nút 🔊 Voice ở đầu trang để tự chọn giọng và nghe thử (ship – sheep, sit – seat).
     Giọng đã chọn được nhớ trên máy (localStorage "lophoc-voice").
   - Các trang gọi LopHocVoice.apply(utterance, số_vai): vai 0 là giọng chính,
     vai 1, 2... là giọng tốt kế tiếp (dùng cho nhân vật thứ hai trong hội thoại). */
(function () {
  "use strict";
  var ok = "speechSynthesis" in window, KEY = "lophoc-voice";
  var NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|junior|kathy|ralph|fred|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley|deranged|hysterical|princess|agnes|bruce|vicki|victoria)\b/i;
  var APPLE_GOOD = /^(samantha|ava|allison|susan|zoe|evan|nathan|tom|alex|karen|daniel|serena|kate|moira|tessa|fiona|nicky|aaron|joelle|noelle)\b/i;

  function lang(v) { return String(v.lang || "").replace("_", "-").toLowerCase(); }
  function score(v) {
    var n = v.name || "", l = lang(v), s = 0;
    if (NOVELTY.test(n) || /eloquence/i.test(v.voiceURI || "")) return -100;
    if (l === "en-us") s += 20; else if (l === "en-gb") s += 16; else if (/^en-(au|ca|ie|nz)/.test(l)) s += 8;
    if (/natural|neural|premium|enhanced|online/i.test(n)) s += 40;
    if (/google/i.test(n)) s += 30;
    if (APPLE_GOOD.test(n)) s += 25;
    if (/network/i.test((v.voiceURI || "") + n)) s += 8;
    if (v.default) s += 3;
    return s;
  }
  function list() {
    if (!ok) return [];
    var all = speechSynthesis.getVoices().filter(function (v) { return /^en-/.test(lang(v)); });
    all = all.map(function (v, i) { return { v: v, s: score(v), i: i }; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    var good = all.filter(function (x) { return x.s >= 0; });
    return (good.length ? good : all).map(function (x) { return x.v; });
  }
  function saved() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function save(uri) { try { if (uri) localStorage.setItem(KEY, uri); else localStorage.removeItem(KEY); } catch (e) {} }
  function idOf(v) { return v.voiceURI || v.name; }
  function get(role) {
    var vs = list(); if (!vs.length) return null;
    var want = saved(), main = vs[0];
    for (var i = 0; i < vs.length; i++) if (idOf(vs[i]) === want) { main = vs[i]; break; }
    if (!role) return main;
    var rest = vs.filter(function (v) { return v !== main; });
    return rest.length ? rest[(role - 1) % rest.length] : main;
  }
  function apply(u, role) {
    var v = get(role || 0);
    if (v) { u.voice = v; u.lang = v.lang; }
    return v;
  }

  /* ---------- nút chọn giọng ---------- */
  var SAMPLE = "ship, sheep. sit, seat. big, bean. fish, feet.";
  var css = "" +
    ".vc-btn{position:absolute;top:4px;right:0;font:inherit;font-size:.9rem;font-weight:700;padding:6px 12px;border-radius:999px;cursor:pointer;border:1px solid var(--line,#D3DFD8);background:var(--surface,#fff);color:var(--ink,#1C2A36)}" +
    ".vc-btn:hover{border-color:var(--sky,#2F6F98);color:var(--sky,#2F6F98)}" +
    "header.hero{position:relative}" +
    ".vc-bg{position:fixed;inset:0;background:rgba(10,20,25,.55);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}" +
    ".vc-box{background:var(--surface,#fff);color:var(--ink,#1C2A36);border-radius:18px;padding:18px;width:min(420px,100%);max-height:min(560px,90vh);display:flex;flex-direction:column;gap:10px;box-shadow:0 20px 50px rgba(0,0,0,.3);font-family:var(--f-body,system-ui,sans-serif)}" +
    ".vc-box h4{margin:0;font-family:var(--f-display,inherit);font-size:1.25rem}" +
    ".vc-box p{margin:0;color:var(--muted,#56676A);font-size:.88rem}" +
    ".vc-list{overflow:auto;display:flex;flex-direction:column;gap:4px;border:1px solid var(--line,#D3DFD8);border-radius:12px;padding:6px}" +
    ".vc-list label{display:flex;gap:8px;align-items:center;padding:7px 8px;border-radius:8px;cursor:pointer;font-size:.95rem}" +
    ".vc-list label:hover{background:var(--sky-soft,#DCEAF3)}" +
    ".vc-list small{color:var(--muted,#56676A);margin-left:auto;white-space:nowrap}" +
    ".vc-row{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}" +
    ".vc-row button{font:inherit;font-weight:700;padding:8px 16px;border-radius:10px;cursor:pointer;border:1px solid var(--line,#D3DFD8);background:var(--surface,#fff);color:inherit}" +
    ".vc-row .vc-test{background:var(--sky,#2F6F98);border-color:var(--sky,#2F6F98);color:var(--surface,#fff)}";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function test() {
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(SAMPLE); u.rate = 0.85; apply(u, 0);
    window.__vcUtt = u; speechSynthesis.speak(u);
  }
  var bg = null, opener = null;
  function close() { if (bg) { bg.remove(); bg = null; } if (opener) opener.focus(); }
  function open() {
    if (bg) close();
    opener = document.activeElement;
    var vs = list(), want = saved(), best = vs[0];
    var cur = get(0);
    bg = document.createElement("div"); bg.className = "vc-bg";
    bg.innerHTML = '<div class="vc-box" role="dialog" aria-modal="true" aria-labelledby="vcT">' +
      '<h4 id="vcT">🔊 Voice</h4><p>Choose the clearest voice. Tap Test to hear: ship – sheep, sit – seat.</p>' +
      '<div class="vc-list" role="radiogroup" aria-label="Voices">' +
      '<label><input type="radio" name="vc" value=""' + (!want || !cur || idOf(cur) !== want ? " checked" : "") + '> Auto' +
      (best ? " <small>" + esc(best.name) + "</small>" : "") + "</label>" +
      vs.map(function (v) {
        var id = idOf(v);
        return '<label><input type="radio" name="vc" value="' + esc(id) + '"' + (want && id === want ? " checked" : "") + "> " +
          esc(v.name) + " <small>" + esc(v.lang) + "</small></label>";
      }).join("") + "</div>" +
      (vs.length ? "" : "<p>No English voice found on this device.</p>") +
      '<div class="vc-row"><button type="button" class="vc-close">Done</button><button type="button" class="vc-test">▶ Test</button></div></div>';
    document.body.appendChild(bg);
    bg.addEventListener("click", function (e) { if (e.target === bg) close(); });
    bg.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    bg.querySelector(".vc-list").addEventListener("change", function (e) { save(e.target.value); test(); });
    bg.querySelector(".vc-test").onclick = test;
    bg.querySelector(".vc-close").onclick = close;
    var first = bg.querySelector("input:checked") || bg.querySelector("input"); if (first) first.focus();
  }
  function mount() {
    var hero = document.querySelector("header.hero");
    if (!ok || !hero || hero.querySelector(".vc-btn")) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement("button"); b.type = "button"; b.className = "vc-btn";
    b.textContent = "🔊 Voice"; b.title = "Choose voice"; b.onclick = open;
    hero.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();

  window.LopHocVoice = { list: list, get: get, apply: apply, open: open };
})();

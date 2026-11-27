/* Ôn tập nói: dùng chung cho Mầm non và Lớp 1.
   Dữ liệu nằm trong trang (window.SPEAK):
   - units: { mã: { n, en, ic, w:[[biểu tượng, từ, nghĩa]] } }  ← kho từ của từng Unit
   - reviews: [{ id, n, span (tiếng Anh), when (tiếng Việt), ic, title, units:[mã…], fresh:[mã của 2–3 Unit mới], tasks:[…] }]
   - task: { type, title, ic, tip, lines, swap:[…], ask:[…] }  (nhãn "Words from" tự dò từ trong câu)
   Bài học của bé chỉ có tiếng Anh. Phần tiếng Việt (when, tip, nghĩa từng câu) chỉ hiện ở 🗺️ Lộ trình và 🔒 Cẩm nang (#answers, khóa PIN).
       type "talk"    (hội thoại):   roles:{A:[hình, tên], B:[hình, tên]}, lines:[[A|B, câu, nghĩa, hình?]]
       type "story"   (kể chuyện):   lines:[[hình, câu, nghĩa]]  → tranh truyện, tự thêm "The end!"
       type "show"    (thuyết trình): lines:[[hình, câu, nghĩa]]  → tự thêm câu chào và câu cảm ơn
       type "compare" (so sánh):     left:[hình, tên], right:[hình, tên], lines:[[L|R|B, hình, câu, nghĩa]]
       type "me"      (tự sự):       lines:[[hình, câu, nghĩa]]  → các bước nối nhau, tự thêm câu cảm ơn
   Trong câu: <b>từ khóa</b> (còn hiện khi bé tự nói), {name} = tên bé. */
(function () {
  "use strict";
  var D = window.SPEAK;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var plain = function (h) { return String(h).replace(/<br>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); };

  /* ---------- giọng đọc ---------- */
  var hasSpeech = "speechSynthesis" in window, voices = [];
  function loadVoices() { voices = hasSpeech ? speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); }) : []; }
  if (hasSpeech) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; } else document.documentElement.classList.add("no-speech");
  /* tốc độ đọc chung cho mọi trang (Rất chậm / Chậm / Bình thường), lưu trên trình duyệt */
  var SPEEDS = [[0.65, "🐌", "Very slow"], [0.8, "🐢", "Slow"], [1, "🐇", "Normal"]];
  var SPEED = (function () { try { var v = parseFloat(localStorage.getItem("lophoc.speed")); if (v > 0) return v; } catch (e) {} return 1; })();
  function speedBar() {
    return '<span class="speed" role="group" aria-label="Speaking speed">' + SPEEDS.map(function (s) {
      return '<button type="button" data-speed="' + s[0] + '" aria-pressed="' + (s[0] === SPEED) + '"><span aria-hidden="true">' + s[1] + "</span> " + s[2] + "</button>"; }).join("") + "</span>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-speed]"); if (!b) return;
    SPEED = parseFloat(b.getAttribute("data-speed")); try { localStorage.setItem("lophoc.speed", String(SPEED)); } catch (err) {}
    document.querySelectorAll("[data-speed]").forEach(function (x) { x.setAttribute("aria-pressed", String(parseFloat(x.getAttribute("data-speed")) === SPEED)); });
  });
  function speak(text, o) {
    o = o || {};
    if (!hasSpeech) { if (o.onend) setTimeout(o.onend, 600); return; }
    if (!o.queue) speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(text).replace(/\.\.\./g, ","));
    u.lang = "en-US"; u.rate = Math.max(0.4, (o.rate || D.rate || 0.85) * SPEED); u.pitch = o.pitch || 1.1;
    if (window.LopHocVoice) LopHocVoice.apply(u, o.voice || 0); else if (voices.length) u.voice = voices[(o.voice || 0) % voices.length];
    if (o.onstart) u.onstart = o.onstart;
    if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
    speechSynthesis.speak(u);
  }
  var actx;
  function chime(up) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.frequency.setValueAtTime(up ? 660 : 520, t); o.frequency.exponentialRampToValueAtTime(up ? 990 : 780, t + 0.15);
      g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.32);
    } catch (e) {}
  }

  /* ---------- biểu tượng (giống trang Units lớp 1) ---------- */
  var SH = { circle: '<circle cx="50" cy="50" r="40"/>', square: '<rect x="13" y="13" width="74" height="74" rx="4"/>', triangle: '<polygon points="50,9 93,88 7,88"/>',
    rectangle: '<rect x="5" y="25" width="90" height="50" rx="4"/>', star: '<polygon points="50,5 61,38 96,38 68,58 79,92 50,71 21,92 32,58 4,38 39,38"/>',
    heart: '<path d="M50 88C12 61 5 33 24 21c14-8 26 3 26 9 0-6 12-17 26-9 19 12 12 40-26 67z"/>',
    cube: '<rect x="14" y="34" width="52" height="52"/><polygon points="14,34 34,14 86,14 66,34"/><polygon points="66,34 86,14 86,66 66,86"/><polygon points="14,34 34,14 86,14 66,34" fill="#fff" fill-opacity=".4"/><polygon points="66,34 86,14 86,66 66,86" fill="#000" fill-opacity=".2"/>',
    cuboid: '<rect x="6" y="40" width="66" height="40"/><polygon points="6,40 28,18 94,18 72,40"/><polygon points="72,40 94,18 94,58 72,80"/><polygon points="6,40 28,18 94,18 72,40" fill="#fff" fill-opacity=".4"/><polygon points="72,40 94,18 94,58 72,80" fill="#000" fill-opacity=".2"/>',
    sphere: '<circle cx="50" cy="50" r="40"/><ellipse cx="36" cy="34" rx="12" ry="8" fill="#fff" fill-opacity=".45" stroke="none"/>',
    cylinder: '<path d="M22 20v60a28 9 0 0 0 56 0V20"/><ellipse cx="50" cy="20" rx="28" ry="9"/><ellipse cx="50" cy="20" rx="28" ry="9" fill="#fff" fill-opacity=".4"/>',
    cone: '<path d="M50 8L80 78a30 10 0 0 1-60 0z"/><ellipse cx="50" cy="78" rx="30" ry="10" fill="#000" fill-opacity=".15"/>' };
  function icon(s) {
    s = String(s || "");
    if (s.indexOf("c:") === 0) return '<span class="sk-sw" style="background:' + esc(s.slice(2)) + '"></span>';
    if (s.indexOf("n:") === 0) return '<span class="sk-nb">' + esc(s.slice(2)) + "</span>";
    if (s.indexOf("s:") === 0) { var p = s.slice(2).split(":"); return '<svg class="sk-shp" viewBox="0 0 100 100" aria-hidden="true"><g fill="' + esc(p[1] || "#1E88E5") + '" stroke="rgba(0,0,0,.25)" stroke-width="3">' + (SH[p[0]] || "") + "</g></svg>"; }
    if (s.indexOf("z:") === 0) { var q = s.slice(2).split(":"); return '<span class="sk-z-' + esc(q[0]) + '">' + q.slice(1).join(":") + "</span>"; }
    return s;
  }

  /* ---------- tên bé (dùng chung với mục "Bé thuyết trình" của trang mẫu giáo) ---------- */
  function kidName() { try { return (localStorage.getItem("lophoc-kid-name") || "").trim(); } catch (e) { return ""; } }
  function setKidName(v) { try { localStorage.setItem("lophoc-kid-name", v); } catch (e) {} }
  var nameOf = function () { return kidName() || D.kid || "Bin"; };
  function fill(h) { return String(h).replace(/\{name\}/g, '<span class="sk-nm">' + esc(nameOf()) + "</span>"); }

  var TYPES = {
    talk: { ic: "💬", en: "Talk together", vi: "Hội thoại" },
    story: { ic: "📖", en: "Tell a story", vi: "Kể chuyện" },
    show: { ic: "🎤", en: "Show and tell", vi: "Thuyết trình" },
    compare: { ic: "⚖️", en: "Compare", vi: "So sánh" },
    me: { ic: "🧒", en: "My story", vi: "Tự sự: kể về mình" }
  };
  var VOICE = { A: { voice: 0, pitch: 1.05 }, B: { voice: 1, pitch: 1.45 }, N: { voice: 0, pitch: 1.15 }, L: { voice: 0, pitch: 1.1 }, R: { voice: 1, pitch: 1.4 } };

  /* Gom các câu của một bài về một dạng chung */
  function lines(t) {
    var out = [];
    if (t.type === "talk") t.lines.forEach(function (l) { out.push({ who: l[0], ic: l[3] || "", html: l[1], vi: l[2] }); });
    else if (t.type === "compare") t.lines.forEach(function (l) { out.push({ who: l[0], ic: l[1], html: l[2], vi: l[3] }); });
    else {
      /* own: bài tự có câu chào và câu kết, không thêm tự động */
      if (t.type === "show" && !t.own) out.push({ who: "N", ic: "👋", html: (D.hello || "Hello, everyone! My name is {name}."), vi: "Chào cả lớp! Tớ tên là …", extra: true });
      t.lines.forEach(function (l) { out.push({ who: "N", ic: l[0], html: l[1], vi: l[2] }); });
      if (t.type === "story") out.push({ who: "N", ic: "📕", html: "The end!", vi: "Hết truyện!", extra: true });
      else if (!t.own) out.push({ who: "N", ic: "🙇", html: "Thank you for listening!", vi: "Cảm ơn mọi người đã lắng nghe!", extra: true });
    }
    out.forEach(function (g, k) { g.k = k; g.html = fill(g.html); g.say = plain(g.html); g.vi = String(g.vi || "").replace(/\{name\}/g, nameOf()); });
    return out;
  }
  /* Bài nói dùng từ của Unit nào: tự dò từ trong kho từ (bỏ qua vài từ quá ngắn hay gặp như in, on, OK) */
  var SKIP = /^(in|on|under|ok|hi|name|i|it)$/i;
  var reCache = {};
  function wordRe(w) {
    var k = w.toLowerCase();
    return reCache[k] || (reCache[k] = new RegExp("(^|[^a-z'])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+") + "(s|es)?(?![a-z])", "i"));
  }
  function usedUnits(r, t) {
    var txt = t.lines.map(function (l) { return plain(t.type === "compare" ? l[2] : l[1]); }).join(" | ");
    return r.units.filter(function (id) { var u = D.units[id]; return u && u.w.some(function (w) { return !SKIP.test(w[1]) && wordRe(w[1]).test(txt); }); });
  }
  function roleName(t, r) { return plain(fill((t.roles[r] || [])[1] || r)); }

  /* ---------- trạng thái ---------- */
  var cur = { r: null, ti: 0 };
  var RUN = { id: null, timers: [] };
  var ST = null, REC = { rec: null, chunks: [], url: null, stream: null };
  var canRec = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  /* ---------- khung trang ----------
     Phần bài học chỉ có tiếng Anh. Tiếng Việt (gợi ý cho cô, nghĩa từng câu) chỉ nằm ở
     🗺️ Lộ trình và 🔒 Cẩm nang (#answers, khóa PIN). */
  function head() {
    $("#pTitle").innerHTML = D.title; $("#pLead").innerHTML = D.lead;
    var nav = $("#units");
    nav.insertAdjacentHTML("beforeend", '<a href="#lo-trinh" data-id="lo-trinh">🗺️ ' + esc(D.guideName || "Lộ trình") + "</a>" +
      D.reviews.map(function (r) { return '<a href="#' + r.id + '" data-id="' + r.id + '">' + r.ic + " " + esc(r.n) + "</a>"; }).join("") +
      (HW ? '<a href="#hw" data-id="hw">🏠 Homework</a>' : "") +
      '<a href="#answers" data-id="answers">🔒 Cẩm nang</a>');
  }
  function unitLabel(id) { var u = D.units[id]; return u ? u.n : id; }

  function guide() {
    var rows = D.reviews.map(function (r) {
      return "<tr><td><a href=\"#" + r.id + "\">" + r.ic + " " + esc(r.n) + "</a></td><td>" + esc(r.when) + "</td><td>" + esc(r.span) + "</td><td>" +
        r.tasks.map(function (t) { return TYPES[t.type].ic + " " + esc(t.title); }).join("<br>") + "</td></tr>";
    }).join("");
    var th = D.tableHead || ["Bài ôn", "Học sau", "Từ vựng của", "5 bài nói"];
    return '<div class="u-head"><span class="u-ic" aria-hidden="true">🗺️</span><div><div class="u-n">' + esc(D.guideName || "Lộ trình") + "</div><h2>" + esc(D.guideTitle || "Ôn tập nói") + "</h2>" +
      (D.guideSub === "" ? "" : '<div class="u-vi">' + esc(D.guideSub || "Cứ học xong vài Unit thì có một buổi ôn nói, gom lại toàn bộ từ đã học.") + "</div>") + "</div></div>" +
      '<div class="block sk-guide">' + D.guide + "</div>" +
      '<div class="block"><div class="b-head"><h3>' + esc(D.tableTitle || "Lịch ôn tập") + '</h3></div><div class="sk-tw"><table class="sk-t"><thead><tr>' + th.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows + "</tbody></table></div></div>" +
      /* guideTypes: false = không hiện khối giải thích 5 kiểu bài nói */
      (D.guideTypes === false ? "" : '<div class="block"><div class="b-head"><h3>5 kiểu bài nói</h3></div><div class="sk-types">' +
      [["talk", "Hai bạn (hoặc cô và bé) hỏi – đáp. Bấm “Be A / Be B”: máy đọc vai kia, đến lượt bé thì máy chờ."],
        ["story", "Nhìn tranh kể lại một câu chuyện có mở đầu, rắc rối và kết thúc. Bé kể ở ngôi thứ ba: <i>He… She… The dog…</i>"],
        ["show", "Đứng trước lớp giới thiệu một thứ: đồ chơi, gia đình, con vật… Có câu chào và câu cảm ơn."],
        ["compare", "Hai bé đứng cạnh nhau, mỗi bé nói một bên. Câu ở giữa cả hai cùng nói. Luyện <i>but / too / both</i>."],
        ["me", "Bé kể chuyện của chính mình theo thứ tự: <i>First… Then… Finally…</i> Bé thay chi tiết thật của mình vào."]]
        .map(function (x) { var T = TYPES[x[0]]; return '<div class="sk-type"><span class="e" aria-hidden="true">' + T.ic + "</span><b>" + T.vi + "</b><small>" + T.en + "</small><p>" + x[1] + "</p></div>"; }).join("") +
      "</div></div>");
  }

  /* ---------- 📚 Word bank ----------
     Hai cách xem: 🗂️ Topics (mặc định) và 📘 Units (như cũ, theo từng Unit).
     Topics: kho từ chủ đề assets/wordbank.js (window.WORDBANK). Mỗi chủ đề hiện:
       ✓ từ đã học trong các Unit của bài ôn (giữ hình và nghĩa như trong bài và trong game, nhãn NEW cho Unit mới),
       💬 từ có trong 5 bài nói của bài ôn mà Unit chưa dạy,
       ➕ từ mở rộng của chủ đề (lọc theo khối: Mầm non ^1, Lớp 1 ^2, Lớp 4 ^3).
     Mỗi chủ đề có nút 🎮 Play: chơi Listen and choose / Look and choose / Memory / Say it với từ của chủ đề. */
  var WB = window.WORDBANK, WBT = null;
  var LV = { "mau-giao": 1, "lop-1": 2, "lop-4": 3 }[document.documentElement.getAttribute("data-grade")] || D.bankLevel || 3;
  var bkey = function (s) { return String(s).toLowerCase().replace(/[?!.,]+$/, "").replace(/\s+/g, " ").trim(); };
  /* từ ngắn, hay gặp hoặc nhiều nghĩa: không dò trong bài nói */
  var LSTOP = /^(it|can|he|she|name|top|match|fall|point|watch|light|kind|fine|good|nice|like|love|live|go|may|march|cook|slide|swing|bank|glass|glasses|cool|kid|fly|times|more|less|same|first|second|third|half|total|sum|even|odd|add|count|sink|man|hi|bye|on|in|up|down|yes|no|what|who|where|why|shake|wave|open|close|give|hot|cold|big|small|long|short|tall|little|many|new|old|fun)$/;
  function wbParse() {
    if (WBT || !WB) return WBT;
    var keys = {};
    WBT = { keys: keys, sections: WB.sections.map(function (s) {
      return { id: s.id, ic: s.ic, en: s.en, vi: s.vi, topics: s.topics.map(function (t, ti) {
        var w = String(t.w).split(";").map(function (x) {
          var m = x.trim().match(/^(\S+) (.+?)=(.+?)(?:\^(\d))?$/); if (!m) return null;
          var o = { ic: m[1], w: m[2], vi: m[3], lv: +(m[4] || 1), k: bkey(m[2]) }; keys[o.k] = o; return o;
        }).filter(Boolean);
        return { id: s.id + "-" + ti, ic: t.ic, en: t.en, vi: t.vi, nm: !!t.nm, w: w };
      }) };
    }) };
    return WBT;
  }
  /* từ của Unit → từ trong kho chủ đề (thử cả dạng số ít: leaves → leaf, hands → hand) */
  function wbFind(k) {
    var K = WBT.keys, c = [k, k.replace(/ies$/, "y"), k.replace(/ves$/, "f"), k.replace(/es$/, ""), k.replace(/s$/, "")];
    for (var i = 0; i < c.length; i++) if (K[c[i]]) return c[i];
    return null;
  }
  function bankData(r) {
    if (r._wb) return r._wb;
    var learned = {}, said = {}, other = [], n = 0;
    r.units.forEach(function (id) {
      var u = D.units[id]; if (!u) return; var isNew = r.fresh.indexOf(id) >= 0;
      u.w.forEach(function (w) {
        var k = wbFind(bkey(w[1]));
        if (!k) { if (!other.some(function (x) { return x.w === w[1]; })) other.push({ ic: w[0], w: w[1], vi: w[2] || "", fresh: isNew }); return; }
        if (learned[k]) { if (isNew) learned[k].fresh = true; return; }
        learned[k] = { ic: w[0], w: w[1], vi: w[2] || "", fresh: isNew }; n++;
      });
    });
    /* dò từ trong bài nói: cụm dài trước, gặp rồi thì xóa khỏi câu để từ ngắn không bị tính lại (ice cream ≠ ice, sea turtle ≠ sea) */
    var txt = r.tasks.map(function (t) { return t.lines.map(function (l) { return plain(t.type === "compare" ? l[2] : l[1]); }).join(" | "); }).join(" | ");
    var cut = function (w) { var re = new RegExp(wordRe(w).source, "gi"), hit = re.test(txt); if (hit) txt = txt.replace(re, "$1 # "); return hit; };
    var byLen = function (a, b) { return b.length - a.length; };
    var cand = {};
    WBT.sections.forEach(function (s) { s.topics.forEach(function (t) { if (!t.nm) t.w.forEach(function (x) { cand[x.k] = x.w; }); }); });
    Object.keys(learned).forEach(function (k) { cand[k] = learned[k].w; });
    Object.keys(cand).sort(byLen).forEach(function (k) {
      if (learned[k]) { cut(cand[k]); return; }
      if (k.length >= 3 && !LSTOP.test(k) && cut(cand[k])) said[k] = 1;
    });
    return (r._wb = { learned: learned, said: said, other: other, n: n + other.length });
  }
  /* các từ của một chủ đề cho bài ôn r: đã học → có trong bài nói → mở rộng */
  function topicWords(r, t, withMore) {
    var B = bankData(r), a = [], b = [], c = [], seen = {};
    t.w.forEach(function (x) {
      var L = B.learned[x.k]; if (seen[x.k]) return; seen[x.k] = 1;
      if (L) a.push({ ic: L.ic, w: L.w, vi: L.vi, st: "l", fresh: L.fresh });
      else if (B.said[x.k]) b.push({ ic: x.ic, w: x.w, vi: x.vi, st: "s" });
      else if (withMore && x.lv <= LV) c.push({ ic: x.ic, w: x.w, vi: x.vi, st: "m" });
    });
    return a.concat(b, c);
  }
  var BK = { view: (function () { try { return localStorage.getItem("lophoc.wb.view") || "topic"; } catch (e) { return "topic"; } })(), sec: null, more: true };
  function wbChip(x) {
    return '<button class="sk-chip wb-c ' + x.st + '" type="button" data-say="' + esc(x.w) + '"><span class="ic" aria-hidden="true">' + icon(x.ic) + "</span>" + esc(x.w) +
      (x.fresh ? ' <span class="sk-new">NEW</span>' : "") + vi(x.vi, true) + "</button>";
  }
  function unitGroups(r) {
    return r.units.map(function (id) {
      var u = D.units[id]; if (!u) return "";
      var isNew = r.fresh.indexOf(id) >= 0;
      return '<details class="sk-ug' + (isNew ? " new" : "") + '"' + (isNew ? " open" : "") + '><summary><span aria-hidden="true">' + u.ic + "</span> <b>" + esc(u.n) + "</b> " + esc(u.en) +
        (isNew ? ' <span class="sk-new">NEW</span>' : "") + ' <span class="muted">· ' + u.w.length + "</span></summary>" +
        '<div class="sk-chips">' + u.w.map(function (w) {
          return '<button class="sk-chip" type="button" data-say="' + esc(w[1]) + '"><span class="ic" aria-hidden="true">' + icon(w[0]) + "</span>" + esc(w[1]) + vi(w[2], true) + "</button>";
        }).join("") + "</div></details>";
    }).join("");
  }
  function topicView(r) {
    var B = bankData(r);
    var secs = WBT.sections.map(function (s) {
      var got = 0, fresh = 0;
      s.topics.forEach(function (t) { topicWords(r, t, false).forEach(function (x) { got++; if (x.fresh) fresh++; }); });
      return { s: s, got: got, fresh: fresh };
    });
    if (B.other.length) secs.push({ s: { id: "other", ic: "📌", en: "Other words", vi: "Từ khác trong bài", topics: [] }, got: B.other.length, fresh: B.other.filter(function (x) { return x.fresh; }).length });
    if (!BK.sec || !secs.some(function (x) { return x.s.id === BK.sec; })) {
      var best = secs.slice().sort(function (a, b) { return b.fresh - a.fresh || b.got - a.got; })[0]; BK.sec = best.s.id;
    }
    var cs = secs.filter(function (x) { return x.s.id === BK.sec; })[0].s;
    var html = '<div class="wb-secs">' + secs.map(function (x) {
      return '<button class="wb-sec" type="button" data-wb="sec" data-id="' + x.s.id + '" aria-pressed="' + (x.s.id === BK.sec) + '"><span class="e" aria-hidden="true">' + x.s.ic + "</span><b>" + esc(x.s.en) + "</b>" + vi(x.s.vi) +
        '<small>' + (x.got ? "✓ " + x.got : "&nbsp;") + (x.fresh ? ' <i class="wb-dot" title="NEW"></i>' : "") + "</small></button>";
    }).join("") + "</div>" +
      '<div class="wb-legend"><span class="wb-k l">✓ Learned' + vi("Đã học", true) + '</span><span class="wb-k s">💬 In our talks' + vi("Có trong bài nói", true) + '</span>' +
      '<button class="chip wb-k m" type="button" data-wb="more" aria-pressed="' + BK.more + '">➕ More words' + vi("Từ mở rộng", true) + "</button></div>";
    if (cs.id === "other") return html + '<div class="wb-topic"><div class="sk-chips">' + B.other.map(function (x) { return wbChip({ ic: x.ic, w: x.w, vi: x.vi, st: "l", fresh: x.fresh }); }).join("") + "</div></div>";
    var shown = 0;
    html += cs.topics.map(function (t) {
      var W = topicWords(r, t, BK.more); if (!W.length) return "";
      shown++;
      var got = W.filter(function (x) { return x.st !== "m"; }).length, pics = {};
      W.forEach(function (x) { pics[x.ic] = 1; });
      return '<div class="wb-topic" id="wb-' + t.id + '"><div class="wb-th"><span class="e" aria-hidden="true">' + t.ic + "</span><div><b>" + esc(t.en) + "</b>" + vi(t.vi) + "</div>" +
        '<span class="muted">' + (got ? "✓ " + got + (BK.more ? " / " + W.length : "") : W.length + " words") + "</span>" +
        (Object.keys(pics).length >= 4 ? '<button class="btn wb-play" type="button" data-wb="play" data-t="' + t.id + '">🎮 Play' + vi("Chơi", true) + "</button>" : "") + "</div>" +
        '<div class="sk-chips">' + W.map(wbChip).join("") + "</div></div>";
    }).join("");
    if (!shown) html += '<p class="muted wb-empty">No words yet. Tap ➕ More words!' + vi("Chưa có từ đã học. Bấm ➕ More words để xem thêm từ.") + "</p>";
    return html;
  }
  function bankInner(r) { return BK.view === "unit" || !wbParse() ? unitGroups(r) : topicView(r); }
  function bank(r) {
    var total = 0; r.units.forEach(function (id) { if (D.units[id]) total += D.units[id].w.length; });
    if (wbParse()) total = bankData(r).n;
    return '<details class="block sk-bank" id="wbank"><summary class="b-head"><h3>📚 Word bank' + vi("Kho từ", true) + '</h3><span class="muted">' + total + " words · " + esc(r.span) + "</span></summary>" +
      (WB ? '<div class="wb-views" role="group" aria-label="View">' +
        '<button class="chip" type="button" data-wb="view" data-v="topic" aria-pressed="' + (BK.view !== "unit") + '">🗂️ Topics' + vi("Theo chủ đề", true) + "</button>" +
        '<button class="chip" type="button" data-wb="view" data-v="unit" aria-pressed="' + (BK.view === "unit") + '">📘 Units' + vi("Theo Unit", true) + "</button></div>" : "") +
      '<p class="muted sk-hint">Tap a word to hear it. Use these words in your talk!</p><div id="wbBody">' + bankInner(r) + "</div>" +
      '<div class="wb-game" id="wbGame" hidden></div></details>';
  }
  function bankRefresh() {
    var el = $("#wbBody"); if (!el || !cur.r) return;
    el.innerHTML = bankInner(cur.r);
    $$("[data-wb=view]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === (BK.view === "unit" ? "unit" : "topic"))); });
    var g = $("#wbGame"); if (g) { g.hidden = true; g.innerHTML = ""; } if (G && G.wb) G = null;
  }
  function wbTopic(id) { var t = null; WBT.sections.forEach(function (s) { s.topics.forEach(function (x) { if (x.id === id) t = x; }); }); return t; }
  function bankPlay(id) {
    var t = wbTopic(id), box = $("#wbGame"); if (!t || !box || !cur.r) return;
    GP = topicWords(cur.r, t, BK.more).map(function (x) { return { ic: x.ic, w: x.w, vi: x.vi, ex: "", exVi: "", st: x.st }; });
    box.hidden = false;
    box.innerHTML = '<div class="wb-gh"><span class="e" aria-hidden="true">' + t.ic + "</span><h4>🎮 " + esc(t.en) + vi(t.vi, true) + '</h4><button class="btn" type="button" data-wb="gclose">✕</button></div>' +
      '<div class="sk-gtabs wb-gtabs">' + GAMES.filter(function (g) { return g[0] !== "fill"; }).map(function (g) {
        return '<button class="chip" type="button" data-g="start" data-wbp="1" data-gt="' + g[0] + '" aria-pressed="false">' + g[1] + " " + g[2] + "</button>";
      }).join("") + '</div><div class="sk-gbox" id="wbGameBox"></div>';
    var tc = $("#wb-" + id); if (tc) tc.insertAdjacentElement("afterend", box);
    gameStart("listen", true);
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-wb]"); if (!b || !cur.r) return;
    var a = b.getAttribute("data-wb");
    if (a === "view") { BK.view = b.getAttribute("data-v"); try { localStorage.setItem("lophoc.wb.view", BK.view); } catch (err) {} bankRefresh(); }
    if (a === "sec") { BK.sec = b.getAttribute("data-id"); bankRefresh(); }
    if (a === "more") { BK.more = !BK.more; bankRefresh(); }
    if (a === "play") bankPlay(b.getAttribute("data-t"));
    if (a === "gclose") { var g = $("#wbGame"); if (g) { g.hidden = true; g.innerHTML = ""; } G = null; if (hasSpeech) speechSynthesis.cancel(); }
  });

  var MODE_VI = { listen: "Nghe mẫu", roleA: "Con nói phần này", roleB: "Con nói phần này", repeat: "Nghe rồi nói theo", self: "Tự nói, chữ được ẩn", stage: "Lên sân khấu nói cho cả lớp" };
  function modeBtns(t) {
    var m = [["listen", "👂", "Listen", "Listen and look"]];
    if (t.type === "talk") m.push(["roleA", t.roles.A[0], "Be " + roleName(t, "A"), "You say " + roleName(t, "A") + "'s part"], ["roleB", t.roles.B[0], "Be " + roleName(t, "B"), "You say " + roleName(t, "B") + "'s part"]);
    else m.push(["repeat", "🦜", "Repeat", "Listen and say it"]);
    m.push(["self", "🙈", "Say it alone", "Look at the pictures"], ["stage", "🌟", "On stage!", "Speak to the class"]);
    return '<div class="sk-modes">' + m.map(function (x) {
      return '<button class="sk-mode m-' + x[0] + '" type="button" data-sk="' + x[0] + '" aria-pressed="false"><span class="e" aria-hidden="true">' + x[1] + "</span><b>" + esc(x[2]) + "</b><small>" + esc(x[3]) + vi(MODE_VI[x[0]]) + "</small></button>";
    }).join("") + "</div>";
  }

  /* Song ngữ cho phụ huynh: <span class="vi-t"> bị ẩn (speaking.css), chỉ hiện khi bật nút 🇻🇳 Song ngữ (assets/bilingual.js). */
  function vi(t, inl) { return t ? '<span class="vi-t' + (inl ? " in" : "") + '" lang="vi">' + esc(t) + "</span>" : ""; }
  function lineBody(g) {
    return '<span class="sk-txt">' + g.html + "</span>" + vi(g.vi) + '<span class="sk-turn" aria-hidden="true">🎤 Your turn!<i></i></span>';
  }
  function content(t, L) {
    if (t.type === "talk") {
      return '<div class="sk-chat">' + L.map(function (g) {
        var R = t.roles[g.who] || ["🙂", g.who];
        return '<button class="sk-ln sk-bub side-' + g.who + '" type="button" data-k="' + g.k + '"><span class="sk-av" aria-hidden="true">' + R[0] + '</span><span class="sk-bb"><span class="sk-who">' + esc(roleName(t, g.who)) + "</span>" +
          (g.ic ? '<span class="sk-pic" aria-hidden="true">' + icon(g.ic) + "</span>" : "") + lineBody(g) + "</span></button>";
      }).join("") + "</div>";
    }
    if (t.type === "story") {
      return '<div class="sk-comic">' + L.map(function (g, k) {
        return '<button class="sk-ln sk-panel' + (g.extra ? " end" : "") + '" type="button" data-k="' + g.k + '"><span class="sk-pn">' + (g.extra ? "★" : k + 1) + '</span><span class="sk-art" aria-hidden="true">' + icon(g.ic) + "</span>" + lineBody(g) + "</button>";
      }).join("") + "</div>";
    }
    if (t.type === "show") {
      return '<div class="sk-board">' + L.map(function (g) {
        return '<button class="sk-ln sk-card' + (g.extra ? " wide" : "") + '" type="button" data-k="' + g.k + '"><span class="sk-art" aria-hidden="true">' + icon(g.ic) + '</span><span class="sk-body">' + lineBody(g) + "</span></button>";
      }).join("") + "</div>";
    }
    if (t.type === "me") {
      return '<ol class="sk-steps">' + L.map(function (g, k) {
        return '<li><button class="sk-ln sk-step' + (g.extra ? " end" : "") + '" type="button" data-k="' + g.k + '"><span class="sk-dot">' + (g.extra ? "★" : k + 1) + '</span><span class="sk-art" aria-hidden="true">' + icon(g.ic) + '</span><span class="sk-body">' + lineBody(g) + "</span></button></li>";
      }).join("") + "</ol>";
    }
    /* compare: hai cột, câu chung (B) nằm giữa */
    var html = '<div class="sk-vs"><div class="sk-side L"><span class="sk-art" aria-hidden="true">' + icon(t.left[0]) + "</span><b>" + fill(t.left[1]) + '</b></div><span class="sk-vs-x" aria-hidden="true">VS</span>' +
      '<div class="sk-side R"><span class="sk-art" aria-hidden="true">' + icon(t.right[0]) + "</span><b>" + fill(t.right[1]) + "</b></div></div><div class=\"sk-cmp\">";
    var cell = function (g) { return '<button class="sk-ln sk-cell side-' + g.who + '" type="button" data-k="' + g.k + '"><span class="sk-art" aria-hidden="true">' + icon(g.ic) + '</span><span class="sk-body">' + lineBody(g) + "</span></button>"; };
    for (var i = 0; i < L.length; i++) {
      var g = L[i];
      if (g.who === "B") html += '<div class="sk-both">' + cell(g) + "</div>";
      else if (g.who === "L" && L[i + 1] && L[i + 1].who === "R") { html += cell(g) + cell(L[i + 1]); i++; }
      else html += g.who === "R" ? '<span></span>' + cell(g) : cell(g) + "<span></span>";
    }
    return html + "</div>";
  }

  function extras(t) {
    var h = "";
    if (t.swap && t.swap.length) h += '<div class="sk-x sk-swap"><h4>🔄 Make it yours!' + vi("Đổi từ in đậm để thành bài của con", true) + '</h4><p class="muted">Change the words. Make it your talk!</p><ul>' +
      t.swap.map(function (s) { return "<li>" + fill(s) + "</li>"; }).join("") + "</ul></div>";
    if (t.ask && t.ask.length) h += '<div class="sk-x sk-ask"><h4>❓ Teacher asks' + vi("Cô hỏi, con tự trả lời", true) + '</h4><p class="muted">Answer in your own words.</p><ul>' +
      t.ask.map(function (s) { var q = fill(s); return '<li><button class="sk-q" type="button" data-say="' + esc(plain(q)) + '">🔊</button> ' + q + "</li>"; }).join("") + "</ul></div>";
    return h ? '<div class="sk-xs">' + h + "</div>" : "";
  }

  /* Nhóm Level: các bài liền nhau có cùng group (vd. "speech") dùng chung một tab, chọn Level bằng nút trong bài.
     Mỗi bài trong nhóm ghi thêm level:"🌱 Level 1" (tên nút) và levelNote (dòng nhỏ dưới nút). */
  function sameGroup(r, a, b) { var x = r.tasks[a], y = r.tasks[b]; return a === b || !!(x && y && x.group && x.group === y.group); }
  function groupOf(r, ti) { var out = []; r.tasks.forEach(function (t, k) { if (sameGroup(r, ti, k)) out.push(k); }); return out; }
  function nextTi(r, ti) { var j = ti + 1; while (j < r.tasks.length && sameGroup(r, ti, j)) j++; return j < r.tasks.length ? j : -1; }
  function prevTi(r, ti) { var j = ti - 1; while (j >= 0 && sameGroup(r, ti, j)) j--; if (j < 0) return -1; return groupOf(r, j)[0]; }
  function levelBar(r, ti) {
    var g = groupOf(r, ti); if (g.length < 2) return "";
    return '<div class="sk-lvs" role="group" aria-label="Level">' + g.map(function (k) {
      var t = r.tasks[k];
      return '<button class="sk-lv" type="button" data-lv="' + k + '" aria-pressed="' + (k === ti) + '"><b>' + esc(t.level || "Level") + "</b>" + (t.levelNote ? "<small>" + esc(t.levelNote) + "</small>" : "") + "</button>";
    }).join("") + "</div>";
  }

  function taskView(r, ti) {
    var t = r.tasks[ti], T = TYPES[t.type], L = lines(t), pi = prevTi(r, ti), ni = nextTi(r, ti);
    return '<div class="block sk-task type-' + t.type + '" id="task">' +
      '<div class="sk-th"><span class="sk-tic" aria-hidden="true">' + (t.ic || T.ic) + '</span><div><div class="sk-tt">' + T.ic + " " + T.en + vi(T.vi, true) + (t.badge ? ' <span class="sk-badge">' + esc(t.badge) + "</span>" : "") + "</div><h3>" + fill(t.title) + "</h3>" +
      '<div class="sk-use">Words from: ' + usedUnits(r, t).map(function (id) { return '<span class="' + (r.fresh.indexOf(id) >= 0 ? "new" : "") + '">' + esc(unitLabel(id)) + "</span>"; }).join("") + "</div></div></div>" +
      levelBar(r, ti) + modeBtns(t) +
      '<div class="sk-bar"><label>✏️ My name: <input id="skName" type="text" maxlength="24" placeholder="' + esc(D.kid || "Bin") + '" autocomplete="off" value="' + esc(kidName()) + '"></label>' + speedBar() +
      '<button class="btn" type="button" data-sk="stop" id="skStop" hidden>⏹ Stop</button><span class="sk-status" id="skStatus" aria-live="polite"></span></div>' +
      '<div class="sk-area" id="skArea">' + content(t, L) + "</div>" + extras(t) +
      '<div class="u-nav">' + (pi >= 0 ? '<button class="btn" type="button" data-sk="prevtask">← ' + esc(r.tasks[pi].title.replace(/\{name\}/g, nameOf())) + "</button>" : "<span></span>") +
      (ni >= 0 ? '<button class="btn primary" type="button" data-sk="nexttask">' + esc(r.tasks[ni].title.replace(/\{name\}/g, nameOf())) + " →</button>" : "") + "</div></div>";
  }

  function reviewView(r) {
    var idx = D.reviews.indexOf(r);
    return '<div class="u-head"><span class="u-ic" aria-hidden="true">' + r.ic + '</span><div><div class="u-n">' + esc(r.n) + " · " + esc(r.span) + "</div><h2>" + esc(r.title) + "</h2>" + vi(r.when) + "</div></div>" +
      '<div class="sk-map" aria-label="Units">' + r.units.map(function (id) { var u = D.units[id]; return '<span class="' + (r.fresh.indexOf(id) >= 0 ? "new" : "") + '" title="' + esc(u.n + ": " + u.en) + '">' + u.ic + "</span>"; }).join("") + "</div>" +
      (D.cards && !r.noCards && hasEx(r) ? cardsBlock(r) : bank(r)) + (D.games && !r.noGames ? gamesBlock(r) : "") +
      /* mục chỉ có từ và trò chơi (tasks rỗng) thì không có phần bài nói */
      (r.tasks.length ? '<div class="sk-tabs" role="tablist">' + r.tasks.map(function (t, k) {
        var T = TYPES[t.type];
        if (k > 0 && sameGroup(r, k - 1, k)) return ""; /* nhóm Level: chỉ một tab */
        return '<button class="sk-tab" type="button" role="tab" data-ti="' + k + '" aria-selected="' + sameGroup(r, k, cur.ti) + '"><span class="e" aria-hidden="true">' + T.ic + "</span><b>" + esc(T.en) + "</b>" + vi(T.vi) + "<small>" + (t.badge ? esc(t.badge) + " · " : "") + fill(t.title) + "</small></button>";
      }).join("") + "</div>" +
      '<div id="taskBox">' + taskView(r, cur.ti) + "</div>" : "") +
      (HW ? HW.block(r) : "") +
      '<div class="u-nav">' + (idx > 0 ? '<a class="btn" href="#' + D.reviews[idx - 1].id + '">← ' + esc(D.reviews[idx - 1].n) + "</a>" : '<a class="btn" href="#lo-trinh">← 🗺️</a>') +
      (idx < D.reviews.length - 1 ? '<a class="btn primary" href="#' + D.reviews[idx + 1].id + '">' + esc(D.reviews[idx + 1].n) + " →</a>" : "") + "</div>";
  }

  /* ---------- cẩm nang cho cô và ba mẹ (khóa PIN): gợi ý dạy và nghĩa tiếng Việt từng câu ---------- */
  function notesView() {
    return '<div class="u-head"><span class="u-ic" aria-hidden="true">📒</span><div><div class="u-n">Dành cho cô và ba mẹ</div><h2>Cẩm nang ôn tập nói</h2>' +
      '<div class="u-vi">Gợi ý cách dạy từng bài nói và nghĩa tiếng Việt của từng câu. Trong bài học của bé chỉ có tiếng Anh.</div></div></div><div id="notesBox"></div>';
  }
  function notesBody(box) {
    box.innerHTML = '<div class="sk-nchips">' + D.reviews.map(function (r) { return '<a class="chip" href="#n-' + r.id + '">' + r.ic + " " + esc(r.n) + "</a>"; }).join("") + "</div>" +
      D.reviews.map(function (r) {
        return '<div class="block sk-notes" id="n-' + r.id + '"><div class="b-head"><h3>' + r.ic + " " + esc(r.n) + ": " + esc(r.title) + '</h3><span class="muted">' + esc(r.when) + " · " + esc(r.span) + "</span></div>" +
          r.tasks.map(function (t) {
            var T = TYPES[t.type];
            return '<details class="sk-nt"><summary>' + T.ic + " <b>" + T.vi + "</b>: " + fill(t.title) + (t.level ? " · " + esc(t.level) + (t.levelNote ? " (" + esc(t.levelNote) + ")" : "") : "") + "</summary>" +
              (t.tip ? '<p class="sk-ntip">👩‍🏫 ' + t.tip + "</p>" : "") +
              "<ul>" + lines(t).map(function (g) {
                var who = t.type === "talk" ? roleName(t, g.who) + ": " : t.type === "compare" ? (g.who === "B" ? "Cả hai: " : plain(fill((g.who === "L" ? t.left : t.right)[1])) + ": ") : "";
                return "<li><i>" + esc(who) + esc(g.say) + "</i> → " + esc(String(g.vi || "").replace(/\{name\}/g, nameOf())) + "</li>";
              }).join("") + "</ul></details>";
          }).join("") + "</div>";
      }).join("");
  }

  function route() {
    stop(); closeStage();
    var id = location.hash.slice(1), r = D.reviews.filter(function (x) { return x.id === id; })[0];
    var main = $("#view"), hw = HW && HW.match(id);
    if (HW) HW.reset();
    if (hw && hw.r) { r = hw.r; id = r.id; }
    if (id.indexOf("n-") === 0) { var el = document.getElementById(id); if (el) { el.scrollIntoView(); return; } id = "answers"; }
    G = null; GP = null;
    if (r) { if (cur.r !== r) { cur.ti = 0; BK.sec = null; } cur.r = r; main.innerHTML = reviewView(r); }
    else if (id === "answers") {
      cur.r = null; main.innerHTML = notesView();
      if (window.LopHocPIN) window.LopHocPIN.guard($("#notesBox"), notesBody); else notesBody($("#notesBox"));
    }
    else if (hw && hw.hub) { cur.r = null; main.innerHTML = HW.hub(); }
    else { cur.r = null; id = "lo-trinh"; main.innerHTML = guide(); }
    if (hw && hw.r) setTimeout(function () { var el = $("#homework"); if (el) el.scrollIntoView(); }, 30);
    $$("#units a[data-id]").forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-id") === id ? "page" : "false"); });
    var on = $('#units a[aria-current="page"]'); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center" });
    document.title = (hw && hw.r ? "Homework " + unitLabel(hw.g) + " · " : "") + (r ? r.n + ": " + r.title : id === "answers" ? "Cẩm nang" : hw && hw.hub ? "Homework" : "Lộ trình") + " · " + D.pageName;
  }
  function showTask(ti) {
    stop(); cur.ti = ti;
    $("#taskBox").innerHTML = taskView(cur.r, ti);
    $$(".sk-tab").forEach(function (b) { b.setAttribute("aria-selected", sameGroup(cur.r, +b.getAttribute("data-ti"), ti) ? "true" : "false"); });
  }
  function curTask() { return cur.r && cur.r.tasks[cur.ti]; }

  /* ---------- chạy mẫu: nghe / nói theo / đóng vai ---------- */
  function later(fn, ms) { RUN.timers.push(setTimeout(fn, ms)); }
  function status(t) { var s = $("#skStatus"); if (s) s.textContent = t || ""; }
  function stop() {
    RUN.id = null; RUN.timers.forEach(clearTimeout); RUN.timers = [];
    if (hasSpeech) speechSynthesis.cancel();
    $$(".sk-ln").forEach(function (n) { n.classList.remove("on", "turn"); });
    $$(".sk-mode.m-listen,.sk-mode.m-repeat,.sk-mode.m-roleA,.sk-mode.m-roleB").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    var st = $("#skStop"); if (st) st.hidden = true; status("");
  }
  function sayThen(g, rate, then) {
    var token = RUN.id, fired = false, go = function () { if (fired || RUN.id !== token) return; fired = true; then(); };
    var v = VOICE[g.who] || VOICE.N;
    if (!hasSpeech) { later(go, 1200 + g.say.split(" ").length * 350); return; }
    speak(g.say, { rate: rate, voice: v.voice, pitch: v.pitch, onend: go });
    later(go, (4000 + g.say.length * 170) / SPEED);
  }
  var waitFor = function (g) { return Math.max(2800, g.say.split(" ").length * (D.waitWord || 750) + 1500) / SPEED; };
  function run(mode) {
    var t = curTask(); if (!t) return;
    stop(); var L = lines(t), els = $$("#skArea .sk-ln"), i = 0, mine = mode === "roleA" ? "A" : mode === "roleB" ? "B" : null;
    RUN.id = {}; $("#skStop").hidden = false;
    $$(".sk-mode.m-" + mode).forEach(function (b) { b.setAttribute("aria-pressed", "true"); });
    var slow = mode === "listen" ? (D.rate || 0.85) : (D.rate || 0.85) - 0.1;
    (function step() {
      els.forEach(function (n) { n.classList.remove("on", "turn"); });
      if (i >= L.length) { stop(); if (mode !== "listen") { chime(true); status("🎉 Great job!"); } return; }
      var n = els[i], g = L[i]; n.classList.add("on"); n.scrollIntoView({ block: "nearest", behavior: "smooth" });
      var yourTurn = function () {
        var w = waitFor(g); n.style.setProperty("--wait", w + "ms"); n.classList.add("turn"); status("🎤 Your turn!");
        later(function () { i++; step(); }, w);
      };
      if (mine && g.who === mine) { chime(false); yourTurn(); return; }
      status((mine ? "👂 " : mode === "repeat" ? "🦜 " : "👂 ") + (i + 1) + "/" + L.length);
      sayThen(g, slow, function () { if (mode === "repeat") yourTurn(); else { i++; later(step, 450); } });
    })();
  }
  function selfMode(btn) {
    stop(); var a = $("#skArea"), on = !a.classList.contains("sk-hide");
    a.classList.toggle("sk-hide", on); btn.setAttribute("aria-pressed", on ? "true" : "false");
    status(on ? "🙈 Look at the pictures and say it!" : "");
    if (on) speak("Now you try! Look at the pictures.");
  }

  /* ---------- sân khấu ---------- */
  function applause() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var len = 2.6, sr = actx.sampleRate, buf = actx.createBuffer(1, Math.floor(sr * len), sr), d = buf.getChannelData(0);
      for (var c = 0; c < 140; c++) {
        var t0 = Math.floor(Math.pow(Math.random(), 1.6) * (len - 0.1) * sr), amp = 0.25 + Math.random() * 0.4;
        for (var j = 0; j < sr * 0.03 && t0 + j < d.length; j++) d[t0 + j] += (Math.random() * 2 - 1) * amp * Math.exp(-j / (sr * 0.005));
      }
      var src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
      src.buffer = buf; f.type = "bandpass"; f.frequency.value = 1600; f.Q.value = 0.5; g.gain.value = 0.6;
      src.connect(f); f.connect(g); g.connect(actx.destination); src.start();
    } catch (e) {}
  }
  function confetti() {
    var em = ["🎉", "⭐", "🎊", "✨", "🌟", "💖", "🎈"], box = document.createElement("div"); box.className = "sk-confetti";
    for (var k = 0; k < 36; k++) box.innerHTML += '<span style="left:' + (Math.random() * 100) + "%;animation-delay:" + (Math.random() * 0.8).toFixed(2) + "s;animation-duration:" + (2 + Math.random() * 1.6).toFixed(2) + 's">' + em[k % em.length] + "</span>";
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 4600);
  }
  function recStart(cb) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      REC.stream = stream; REC.chunks = [];
      var r = REC.rec = new MediaRecorder(stream);
      r.ondataavailable = function (e) { if (e.data && e.data.size) REC.chunks.push(e.data); };
      r.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        if (REC.url) URL.revokeObjectURL(REC.url);
        REC.url = URL.createObjectURL(new Blob(REC.chunks, { type: r.mimeType || "audio/webm" }));
        var b = $("#skPlay"); if (b) b.hidden = false;
      };
      r.start(); cb(true);
    }).catch(function () { cb(false); });
  }
  function recStop() { if (REC.rec && REC.rec.state !== "inactive") REC.rec.stop(); REC.rec = null; }
  var CARD_C = ["c1", "c2", "c3", "c4", "c5", "c6"];
  function stageOpen() {
    var t = curTask(); if (!t) return;
    stop(); closeStage();
    ST = { t: t, L: lines(t), i: -1, text: true, rec: false };
    var o = document.createElement("div"); o.className = "sk-stage"; o.id = "skStage";
    o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "On stage");
    o.innerHTML = '<div class="sk-curtain l" aria-hidden="true"></div><div class="sk-curtain r" aria-hidden="true"></div>' +
      '<div class="sk-top"><button class="sk-sbtn sm" type="button" data-sk="st-close">✕ Exit</button><div class="sk-dots" id="skDots"></div><span class="sk-rec-on" id="skRecOn" hidden>● REC</span></div>' +
      '<div class="sk-scard" id="skCard"></div><div class="sk-ctl" id="skCtl"></div>';
    document.body.appendChild(o); document.documentElement.classList.add("sk-lock");
    var c = $("#skCard"); c.className = "sk-scard c1 enter";
    var T = TYPES[t.type];
    c.innerHTML = '<span class="sk-big" aria-hidden="true">' + (t.ic || T.ic) + '</span><p class="sk-sline">' + fill(t.title) + '</p><p class="sk-ssub">' + T.ic + " " + T.en +
      (t.type === "talk" ? " · " + esc(roleName(t, "A")) + " & " + esc(roleName(t, "B")) : t.type === "compare" ? " · two friends, one side each" : "") + "</p>" +
      '<p class="sk-ssub">Stand tall. Look at your friends. Speak loud!</p>' +
      (canRec ? '<label class="sk-check"><input type="checkbox" id="skRecBox"> 🎙️ Record my voice</label>' : "");
    $("#skCtl").innerHTML = '<button class="sk-sbtn go" type="button" data-sk="st-start">Start ▶</button>';
    speak("Ready? Let's go!");
    var s = $("#skCtl button"); if (s) s.focus();
  }
  function stageStart() {
    var go = function () { ST.i = 0; stageShow(); };
    var box = $("#skRecBox");
    if (box && box.checked) recStart(function (ok) { ST.rec = ok; $("#skRecOn").hidden = !ok; go(); });
    else go();
  }
  function whoTag(g) {
    var t = ST.t;
    if (t.type === "talk") { var R = t.roles[g.who]; return '<span class="sk-swho side-' + g.who + '">' + R[0] + " " + esc(roleName(t, g.who)) + "</span>"; }
    if (t.type === "compare") return '<span class="sk-swho side-' + g.who + '">' + (g.who === "B" ? "👫 Together!" : (g.who === "L" ? icon(t.left[0]) + " " + fill(t.left[1]) : icon(t.right[0]) + " " + fill(t.right[1]))) + "</span>";
    return "";
  }
  function stageShow() {
    var g = ST.L[ST.i], c = $("#skCard");
    if (hasSpeech) speechSynthesis.cancel();
    c.className = "sk-scard " + CARD_C[ST.i % CARD_C.length]; void c.offsetWidth; c.classList.add("enter");
    c.innerHTML = whoTag(g) + '<span class="sk-big" aria-hidden="true">' + icon(g.ic || (ST.t.type === "talk" ? ST.t.roles[g.who][0] : "🎤")) + '</span><p class="sk-sline' + (ST.text ? "" : " hid") + '">' + g.html + "</p>";
    $("#skDots").innerHTML = ST.L.map(function (_, k) { return '<i class="' + (k < ST.i ? "ok" : k === ST.i ? "now" : "") + '"></i>'; }).join("");
    $("#skCtl").innerHTML = '<button class="sk-sbtn" type="button" data-sk="st-prev"' + (ST.i ? "" : " disabled") + ' aria-label="Back">◀</button>' +
      '<button class="sk-sbtn" type="button" data-sk="st-hint">🔊 Help</button>' +
      '<button class="sk-sbtn" type="button" data-sk="st-text">' + (ST.text ? "🙈 Hide words" : "👀 Show words") + "</button>" +
      '<button class="sk-sbtn go" type="button" data-sk="st-next">' + (ST.i === ST.L.length - 1 ? "Finish! 🎉" : "Next ▶") + "</button>";
    chime(true);
  }
  function stageEnd() {
    recStop(); $("#skRecOn").hidden = true;
    $("#skDots").innerHTML = ST.L.map(function () { return '<i class="ok"></i>'; }).join("");
    var c = $("#skCard"); c.className = "sk-scard c3 enter";
    c.innerHTML = '<span class="sk-big" aria-hidden="true">🏆</span><p class="sk-sline">Wonderful!</p><p class="sk-ssub">Everyone, clap your hands! 👏👏👏</p><div class="sk-stars" aria-hidden="true">⭐⭐⭐</div>';
    $("#skCtl").innerHTML = (ST.rec ? '<button class="sk-sbtn go" type="button" data-sk="st-play" id="skPlay" hidden>▶ Hear my voice</button>' : "") +
      '<button class="sk-sbtn" type="button" data-sk="st-again">↺ Again</button><button class="sk-sbtn" type="button" data-sk="st-close">✕ Close</button>';
    applause(); confetti(); setTimeout(function () { speak("Wonderful! Great job!"); }, 900);
  }
  function closeStage() {
    recStop(); if (REC.stream) { REC.stream.getTracks().forEach(function (t) { t.stop(); }); REC.stream = null; }
    var o = $("#skStage"); if (o) o.remove(); document.documentElement.classList.remove("sk-lock");
    if (ST) { ST = null; if (hasSpeech) speechSynthesis.cancel(); }
  }

  /* ---------- thẻ từ có câu ví dụ (D.cards) ----------
     Từ trong kho: [hình, từ, nghĩa, câu ví dụ (có <b>), nghĩa câu]. Bấm thẻ: đọc từ rồi đọc câu. */
  function poolOf(r) {
    var ids = r.fresh && r.fresh.length ? r.fresh : r.units, seen = {}, out = [];
    ids.forEach(function (id) { (D.units[id] ? D.units[id].w : []).forEach(function (w) { if (!seen[w[1]]) { seen[w[1]] = 1; out.push({ ic: w[0], w: w[1], vi: w[2] || "", ex: w[3] || "", exVi: w[4] || "" }); } }); });
    return out;
  }
  function hasEx(r) { return poolOf(r).some(function (x) { return x.ex; }); }
  function cardsBlock(r) {
    var P = poolOf(r);
    return '<div class="block sk-words" id="words"><div class="b-head"><h3>📚 Words' + vi("Từ vựng", true) + '</h3><span class="muted">' + P.length + ' words · Tap a card to listen</span>' +
      '<button class="btn" type="button" data-g="allwords">▶ Play all</button></div><div class="sk-wcards">' +
      P.map(function (x, k) {
        return '<button class="sk-wc" type="button" data-card="' + k + '"><span class="sk-wic" aria-hidden="true">' + icon(x.ic) + '</span><span class="sk-ww">' + esc(x.w) + "</span>" + vi(x.vi) +
          (x.ex ? '<span class="sk-wex">' + fill(x.ex) + "</span>" + vi(x.exVi) : "") + "</button>";
      }).join("") + "</div></div>";
  }
  function sayCard(x, el, then) {
    if (el) { $$(".sk-wc").forEach(function (c) { c.classList.remove("on"); }); el.classList.add("on"); }
    speak(x.w, { rate: 0.8, onend: function () {
      if (!x.ex) { if (el) el.classList.remove("on"); if (then) then(); return; }
      setTimeout(function () { speak(plain(fill(x.ex)), { onend: function () { if (el) el.classList.remove("on"); if (then) then(); } }); }, 250);
    } });
  }

  /* ---------- trò chơi với từ của bài (D.games) ---------- */
  var GAMES = [["listen", "👂", "Listen and choose"], ["look", "👀", "Look and choose"], ["fill", "✏️", "Fill the gap"], ["memory", "🎴", "Memory"], ["say", "🎤", "Say it!"]];
  var G = null, GP = null; /* GP: từ của chủ đề đang chơi trong Word bank */
  function gbox() { return $(G && G.wb ? "#wbGameBox" : "#gameBox"); }
  /* game của Word bank: hỏi từ đã học trước, rồi mới đến từ mở rộng */
  function learnedFirst(p) { return shuffle(p.filter(function (x) { return x.st !== "m"; })).concat(shuffle(p.filter(function (x) { return x.st === "m"; }))); }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gamesBlock(r) {
    var P = poolOf(r), ex = P.some(function (x) { return x.ex; });
    return '<div class="block sk-games" id="games"><div class="b-head"><h3>🎮 Games' + vi("Trò chơi", true) + '</h3><span class="muted">Play with the words</span></div>' +
      '<div class="sk-gtabs">' + GAMES.filter(function (g) { return g[0] !== "fill" || ex; }).map(function (g) {
        return '<button class="chip" type="button" data-g="start" data-gt="' + g[0] + '" aria-pressed="false">' + g[1] + " " + g[2] + "</button>";
      }).join("") + '</div><div class="sk-gbox" id="gameBox"><p class="muted sk-gstart">Choose a game! 👆</p></div></div>';
  }
  function options(item, n, key) {
    /* lựa chọn sai: khác từ, khác hình (để không có hai đáp án giống nhau) */
    var others = shuffle(G.pool.filter(function (x) { return x.w !== item.w && x[key] !== item[key]; })), picked = [], seen = {};
    seen[item[key]] = 1;
    others.forEach(function (x) { if (picked.length < n - 1 && !seen[x[key]]) { seen[x[key]] = 1; picked.push(x); } });
    return shuffle(picked.concat([item]));
  }
  function gameStart(type, wb) {
    var r = cur.r; if (!r) return;
    if (wb && !GP) return;
    var pool = wb ? GP : poolOf(r);
    if (type === "fill") pool = pool.filter(function (x) { return x.ex; });
    G = { type: type, wb: !!wb, pool: pool, list: (wb ? learnedFirst(pool) : shuffle(pool)).slice(0, Math.min(8, pool.length)), i: 0, score: 0, miss: false };
    $$((wb ? ".wb-gtabs" : ".sk-gtabs:not(.wb-gtabs)") + " .chip").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-gt") === type ? "true" : "false"); });
    if (type === "memory") return memStart();
    gameShow();
  }
  function gTop() { return '<div class="sk-gtop"><span>' + (G.i + 1) + " / " + G.list.length + "</span><span>⭐ " + G.score + "</span></div>"; }
  function gameShow() {
    var box = gbox(); if (!box || !G) return;
    if (G.i >= G.list.length) return gameEnd();
    var it = G.list[G.i]; G.miss = false;
    if (G.type === "listen") {
      box.innerHTML = gTop() + '<div class="sk-gq"><button class="sk-sbtn go" type="button" data-g="hear">🔊 Listen</button></div><div class="sk-opts pics">' +
        options(it, 4, "ic").map(function (o) { return '<button class="sk-opt" type="button" data-g="ans" data-w="' + esc(o.w) + '" aria-label="picture">' + icon(o.ic) + "</button>"; }).join("") + "</div>";
      setTimeout(function () { speak(it.w, { rate: 0.8 }); }, 300);
    } else if (G.type === "look") {
      box.innerHTML = gTop() + '<div class="sk-gq"><span class="sk-gpic" aria-hidden="true">' + icon(it.ic) + '</span><span class="muted">What is it?</span></div><div class="sk-opts words">' +
        options(it, 4, "w").map(function (o) { return '<button class="sk-opt" type="button" data-g="ans" data-w="' + esc(o.w) + '">' + esc(o.w) + "</button>"; }).join("") + "</div>";
    } else if (G.type === "fill") {
      var gap = fill(it.ex).replace(/<b>[\s\S]*?<\/b>/, '<span class="sk-gap">____</span>');
      box.innerHTML = gTop() + '<div class="sk-gq col"><span class="sk-gpic sm" aria-hidden="true">' + icon(it.ic) + '</span><p class="sk-gsent">' + gap + '</p></div><div class="sk-opts words">' +
        options(it, 3, "w").map(function (o) { return '<button class="sk-opt" type="button" data-g="ans" data-w="' + esc(o.w) + '">' + esc(o.w) + "</button>"; }).join("") + "</div>";
    } else if (G.type === "say") {
      box.innerHTML = gTop() + '<div class="sk-gq col"><span class="sk-gpic" aria-hidden="true">' + icon(it.ic) + '</span><p class="sk-gword" id="gWord" hidden>' + esc(it.w) + "</p>" +
        '<p class="sk-gmsg" id="gMsg">' + (SR ? "Say the word!" : "Say the word, then check!") + "</p></div>" +
        '<div class="sk-ctl">' + (SR ? '<button class="sk-sbtn go" type="button" data-g="mic">🎤 Say it</button>' : "") +
        '<button class="sk-sbtn" type="button" data-g="hint">🔊 Help</button>' +
        '<button class="sk-sbtn" type="button" data-g="said">' + (SR ? "Next ▶" : "✓ I said it!") + "</button></div>";
    }
  }
  function gameAnswer(btn) {
    var it = G.list[G.i], ok = btn.getAttribute("data-w") === it.w;
    if (!ok) { btn.classList.add("bad"); btn.disabled = true; G.miss = true; chime(false); return; }
    if (!G.miss) G.score++;
    btn.classList.add("ok"); $$(".sk-opt").forEach(function (b) { b.disabled = true; }); chime(true);
    var next = function () { G.i++; gameShow(); };
    if (G.type === "fill") { var s = $(".sk-gsent"); if (s) s.innerHTML = fill(it.ex); speak(plain(fill(it.ex)), { onend: function () { setTimeout(next, 500); } }); }
    else { speak(it.w, { rate: 0.8 }); setTimeout(next, 1300); }
  }
  function sayResult(ok) {
    var it = G.list[G.i], m = $("#gMsg"), w = $("#gWord"); if (w) w.hidden = false;
    if (ok) { if (!G.miss) G.score++; chime(true); if (m) m.textContent = "🎉 Great!"; setTimeout(function () { G.i++; gameShow(); }, 1200); }
    else { G.miss = true; chime(false); if (m) m.textContent = "Try again! Listen: " + it.w; speak(it.w, { rate: 0.75 }); }
  }
  function micListen() {
    var it = G.list[G.i], m = $("#gMsg"), rec;
    try { rec = new SR(); } catch (e) { return; }
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5;
    if (m) m.textContent = "👂 Listening…";
    rec.onresult = function (e) {
      var target = it.w.toLowerCase(), heard = [];
      for (var i = 0; i < e.results[0].length; i++) heard.push(e.results[0][i].transcript.toLowerCase());
      sayResult(heard.some(function (h) { return h.indexOf(target) >= 0 || target.indexOf(h.trim()) >= 0 && h.trim().length > 2; }));
    };
    rec.onerror = function () { if (m) m.textContent = "Tap 🎤 and say it again!"; };
    rec.start();
  }
  function memStart() {
    var pick = (G.wb ? learnedFirst(G.pool) : shuffle(G.pool)).filter(function (x, k, a) { return a.findIndex(function (y) { return y.ic === x.ic; }) === k; }).slice(0, 6), cards = [];
    pick.forEach(function (x, k) { cards.push({ k: k, face: icon(x.ic), w: x.w, pic: true }, { k: k, face: esc(x.w), w: x.w }); });
    G.cards = shuffle(cards); G.open = []; G.done = 0; G.moves = 0; G.pairs = pick.length;
    gbox().innerHTML = '<div class="sk-gtop"><span>Find the pairs!</span><span id="gMoves">0 moves</span></div><div class="sk-mem">' +
      G.cards.map(function (c, i) { return '<button class="sk-mc' + (c.pic ? " pic" : "") + '" type="button" data-g="flip" data-i="' + i + '"><span class="back">?</span><span class="face">' + c.face + "</span></button>"; }).join("") + "</div>";
  }
  function memFlip(btn) {
    var i = +btn.getAttribute("data-i"), c = G.cards[i];
    if (btn.classList.contains("up") || G.open.length >= 2) return;
    btn.classList.add("up"); G.open.push({ i: i, el: btn }); if (!c.pic) speak(c.w, { rate: 0.85 });
    if (G.open.length < 2) return;
    G.moves++; var mv = $("#gMoves"); if (mv) mv.textContent = G.moves + " moves";
    var a = G.open[0], b = G.open[1];
    if (G.cards[a.i].k === G.cards[b.i].k) {
      a.el.classList.add("ok"); b.el.classList.add("ok"); G.open = []; G.done++; chime(true);
      if (G.done === G.pairs) { G.score = Math.max(0, G.pairs * 2 - G.moves + G.pairs); G.list = new Array(G.pairs * 2); setTimeout(gameEnd, 700); }
    } else setTimeout(function () { a.el.classList.remove("up"); b.el.classList.remove("up"); G.open = []; }, 900);
  }
  function gameEnd() {
    var n = G.type === "memory" ? G.pairs * 2 : G.list.length, ratio = Math.min(1, G.score / Math.max(1, n));
    var stars = ratio >= 0.9 ? "⭐⭐⭐" : ratio >= 0.6 ? "⭐⭐" : "⭐";
    gbox().innerHTML = '<div class="sk-gend"><div class="sk-stars">' + stars + "</div><p class=\"sk-sline\">" + (ratio >= 0.6 ? "Great job!" : "Good try!") + "</p>" +
      (G.type === "memory" ? '<p class="muted">' + G.moves + " moves</p>" : '<p class="muted">' + G.score + " / " + n + "</p>") +
      '<button class="btn primary" type="button" data-g="start"' + (G.wb ? ' data-wbp="1"' : "") + ' data-gt="' + G.type + '">↺ Play again</button></div>';
    speak(ratio >= 0.6 ? "Great job!" : "Good try!"); if (ratio >= 0.9) confetti();
  }
  document.addEventListener("click", function (e) {
    var card = e.target.closest("[data-card]");
    if (card && cur.r) { if (hasSpeech) speechSynthesis.cancel(); sayCard(poolOf(cur.r)[+card.getAttribute("data-card")], card); return; }
    var b = e.target.closest("[data-g]"); if (!b) return;
    var a = b.getAttribute("data-g");
    if (a === "allwords" && cur.r) {
      var P = poolOf(cur.r), els = $$(".sk-wc"), k = 0;
      (function nx() { if (k >= P.length) return; var x = P[k], el = els[k]; k++; if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" }); sayCard(x, el, function () { setTimeout(nx, 400); }); })();
      return;
    }
    if (a === "start") { gameStart(b.getAttribute("data-gt"), b.hasAttribute("data-wbp")); return; }
    if (!G) return;
    if (a === "hear") speak(G.list[G.i].w, { rate: 0.75 });
    if (a === "ans") gameAnswer(b);
    if (a === "flip") memFlip(b);
    if (a === "mic") micListen();
    if (a === "hint") { G.miss = true; var w = $("#gWord"); if (w) w.hidden = false; speak(G.list[G.i].w, { rate: 0.75 }); }
    if (a === "said") sayResult(true);
  });

  /* ---------- sự kiện ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sk]");
    var sayB = e.target.closest("[data-say]");
    if (sayB && !b) { speak(sayB.getAttribute("data-say")); sayB.classList.add("on"); setTimeout(function () { sayB.classList.remove("on"); }, 900); return; }
    var tab = e.target.closest(".sk-tab"); if (tab) { showTask(+tab.getAttribute("data-ti")); return; }
    var lv = e.target.closest(".sk-lv"); if (lv) { showTask(+lv.getAttribute("data-lv")); return; }
    var ln = e.target.closest(".sk-ln");
    if (ln && !b) {
      stop(); var g = lines(curTask())[+ln.getAttribute("data-k")], v = VOICE[g.who] || VOICE.N;
      $$(".sk-ln").forEach(function (n) { n.classList.remove("on", "peek"); }); ln.classList.add("on", "peek");
      speak(g.say, { voice: v.voice, pitch: v.pitch, onend: function () { ln.classList.remove("on"); setTimeout(function () { ln.classList.remove("peek"); }, 1500); } });
      return;
    }
    if (!b) return;
    var a = b.getAttribute("data-sk");
    if (a === "listen" || a === "repeat" || a === "roleA" || a === "roleB") { if (b.getAttribute("aria-pressed") === "true") stop(); else run(a); }
    if (a === "stop") stop();
    if (a === "self") selfMode(b);
    if (a === "stage") stageOpen();
    if (a === "prevtask") { showTask(prevTi(cur.r, cur.ti)); $("#task").scrollIntoView({ behavior: "smooth" }); }
    if (a === "nexttask") { showTask(nextTi(cur.r, cur.ti)); $("#task").scrollIntoView({ behavior: "smooth" }); }
    if (a === "st-close") closeStage();
    if (a === "st-start") stageStart();
    if (a === "st-again") stageOpen();
    if (a === "st-play" && REC.url) { try { new Audio(REC.url).play(); } catch (err) {} }
    if (!ST || ST.i < 0) return;
    if (a === "st-next") { if (ST.i >= ST.L.length - 1) stageEnd(); else { ST.i++; stageShow(); } }
    if (a === "st-prev" && ST.i > 0) { ST.i--; stageShow(); }
    if (a === "st-hint") { var g = ST.L[ST.i], v = VOICE[g.who] || VOICE.N; speak(g.say, { rate: (D.rate || 0.85) - 0.1, voice: v.voice, pitch: v.pitch }); }
    if (a === "st-text") { ST.text = !ST.text; stageShow(); }
  });
  document.addEventListener("keydown", function (e) {
    if (!ST) return;
    if (e.key === "Escape") closeStage();
    if (ST && ST.i >= 0 && (e.key === "ArrowRight" || e.key === " ") && e.target.tagName !== "BUTTON") { e.preventDefault(); if (ST.i >= ST.L.length - 1) stageEnd(); else { ST.i++; stageShow(); } }
    if (ST && ST.i > 0 && e.key === "ArrowLeft") { ST.i--; stageShow(); }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id !== "skName") return;
    setKidName(e.target.value);
    /* cập nhật tên trong bài mà không vẽ lại ô nhập */
    var n = nameOf(); $$(".sk-nm").forEach(function (s) { s.textContent = n; });
  });
  document.addEventListener("change", function (e) { if (e.target.id === "skName" && cur.r) showTask(cur.ti); });

  /* Bài tập về nhà theo Unit (assets/homework.js, nạp trước file này; chỉ bật khi trang có SPEAK.homework) */
  var HW = D.homework && window.SpeakHomework ? window.SpeakHomework({ D: D, speak: speak, chime: chime, icon: icon, esc: esc, plain: plain, fill: fill, vi: vi, shuffle: shuffle, confetti: confetti, stop: stop }) : null;

  head();
  route();
  window.addEventListener("hashchange", function () { route(); var m = $("#view"); if (m && document.documentElement.scrollTop > m.offsetTop) m.scrollIntoView(); });
})();

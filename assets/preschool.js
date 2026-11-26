/* Trang Tiếng Anh mẫu giáo theo lộ trình. Mỗi trang khai báo window.PRESCHOOL rồi nạp file này.
   Hash: #lo-trinh (lộ trình), #u1..#u8 (bài), #answers (cẩm nang, khóa PIN). */
(function () {
  "use strict";
  var P = window.PRESCHOOL; if (!P) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var SPK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pickN(a, n) { return shuffle(a).slice(0, n); }

  /* ---------- sound ---------- */
  var hasSpeech = "speechSynthesis" in window, voices = [];
  if (!hasSpeech) document.documentElement.classList.add("no-speech");
  function loadVoices() { voices = hasSpeech ? speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); }) : []; }
  if (hasSpeech) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(text, o) {
    o = o || {}; if (!hasSpeech || !text) return;
    if (!o.queue) speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = o.rate || 0.8;
    if (voices.length) u.voice = voices[(o.voice || 0) % voices.length];
    u.pitch = voices.length > 1 ? 1 : (o.voice ? 0.85 : 1.15);
    if (o.onstart) u.onstart = o.onstart; if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
    speechSynthesis.speak(u);
  }
  var actx = null;
  function chime(happy) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var notes = happy ? [523, 659, 784, 1047] : [330, 294];
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.09;
        o.type = "triangle"; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.start(t); o.stop(t + 0.25);
      });
    } catch (e) {}
  }
  var PRAISE = ["Great job!", "Well done!", "Super!", "Yay! Good job!", "Excellent!"];
  function praise(extra) { chime(true); speak((extra ? extra + " " : "") + PRAISE[Math.floor(Math.random() * PRAISE.length)]); }
  function oops(el) { chime(false); speak("Try again!"); if (el) { el.classList.remove("wiggle"); void el.offsetWidth; el.classList.add("wiggle"); } }
  function burst(el) {
    var r = el.getBoundingClientRect(), box = document.createElement("div"); box.className = "burst";
    box.style.left = (r.left + r.width / 2) + "px"; box.style.top = (r.top + r.height / 2) + "px";
    box.innerHTML = "<span>⭐</span><span>✨</span><span>⭐</span><span>🎉</span><span>✨</span>";
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 900);
  }
  var sayBtn = function (t, label) { return '<button class="say" type="button" data-say="' + esc(t) + '" aria-label="Nghe: ' + esc(label || t) + '">' + SPK + "</button>"; };
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-say]"); if (b) { e.stopPropagation(); speak(b.getAttribute("data-say")); } });

  /* ---------- page chrome ---------- */
  $("#pTitle").innerHTML = P.title; $("#pLead").textContent = P.lead;
  $("#pStats").innerHTML = P.stats.map(function (s) { return '<span class="stat"><b>' + s[0] + "</b>" + esc(s[1]) + "</span>"; }).join("");
  $("#units").insertAdjacentHTML("beforeend",
    '<a href="#lo-trinh" data-v="lo-trinh">🗺️ Lộ trình</a>' +
    P.units.map(function (u) { return '<a href="#' + u.id + '" data-v="' + u.id + '"><span aria-hidden="true">' + u.ic + "</span> " + esc(u.n) + "</a>"; }).join("") +
    '<a href="#answers" data-v="answers" class="ans-link">🔒 Cẩm nang</a>');

  var unitById = function (id) { return P.units.filter(function (u) { return u.id === id; })[0]; };
  var W = function (w) { return { ic: w[0], en: w[1], vi: w[2], x: w[3] }; };

  /* ---------- roadmap ---------- */
  function roadmap() {
    var S = P.sessionParts, total = P.units.length * S.length, perWeek = 2, weeks = total / perWeek;
    var h = '<div class="v-head"><span class="v-ic" aria-hidden="true">🗺️</span><div><span class="v-n">' + esc(P.phase) + "</span><h2>Lộ trình " + esc(P.span) + '</h2><span class="v-vi">' + weeks + " tuần · " + total + " buổi · mỗi tuần 2 buổi · mỗi buổi 30–45 phút</span></div></div>";
    h += '<div class="block"><h3>Mục tiêu sau giai đoạn này</h3><ul class="goals">' + P.goals.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul></div>";
    h += '<div class="block"><h3>Khung một buổi học</h3><p class="muted">Buổi 30 phút bỏ bớt phần có dấu *. Buổi 45 phút làm đủ.</p><div class="plan">' +
      P.lessonPlan.map(function (s) { return '<div class="step" style="--w:' + s[0] + '"><div class="mins">' + s[0] + "′" + (s[3] ? "*" : "") + '</div><div><b>' + esc(s[1]) + "</b><small>" + esc(s[2]) + "</small></div></div>"; }).join("") + "</div></div>";
    h += '<div class="block"><h3>Mỗi Unit học trong 3 buổi</h3><div class="parts">' + S.map(function (s, i) { return '<div class="part"><span class="pl">Buổi ' + "ABC"[i] + "</span><b>" + esc(s[0]) + "</b><small>" + esc(s[1]) + "</small></div>"; }).join("") + "</div></div>";
    var k = 0, months = Math.ceil(weeks / 4);
    for (var m = 0; m < months; m++) {
      h += '<div class="block month"><h3>Tháng ' + (P.monthStart + m) + "</h3><div class='weeks'>";
      for (var wk = 0; wk < 4 && k < total; wk++) {
        h += '<div class="week"><div class="wk">Tuần ' + (m * 4 + wk + 1) + "</div>";
        for (var s = 0; s < perWeek && k < total; s++, k++) {
          var u = P.units[Math.floor(k / S.length)], part = k % S.length;
          h += '<a class="sess" href="#' + u.id + '"><span class="sn">Buổi ' + (k + 1) + '</span><span class="su"><span aria-hidden="true">' + u.ic + "</span> " + esc(u.n) + ": " + esc(u.en) + '</span><span class="sp">' + "ABC"[part] + " · " + esc(S[part][0]) + "</span></a>";
        }
        h += "</div>";
      }
      h += "</div></div>";
    }
    if (P.next) h += '<div class="block next"><b>' + esc(P.next.text) + '</b> <a class="btn primary" target="_top" href="' + P.next.href + '">' + esc(P.next.label) + "</a></div>";
    return h;
  }

  /* ---------- unit ---------- */
  function unitView(u) {
    var i = P.units.indexOf(u), prev = P.units[i - 1], next = P.units[i + 1];
    var h = '<div class="v-head"><span class="v-ic" aria-hidden="true">' + u.ic + '</span><div><span class="v-n">' + esc(u.n) + "</span><h2>" + esc(u.en) + '</h2><span class="v-vi">' + esc(u.vi) + "</span></div></div>";
    if (u.review) h += '<p class="review">🔁 Ôn lại: ' + esc(u.review) + "</p>";
    h += '<div class="block"><div class="b-head"><h3>1. Chạm là đọc</h3><span class="muted">Tap &amp; Listen</span><button class="btn" type="button" data-act="all-words">▶ Nghe tất cả</button></div>';
    var lastG = null;
    h += u.words.map(function (w, k) {
      var o = W(w), g = w[4] || "", head = "";
      if (g !== lastG) { head = (lastG !== null ? "</div>" : "") + (g ? '<h4 class="grp">' + esc(g) + "</h4>" : "") + '<div class="cards">'; lastG = g; }
      return head + '<button class="card" type="button" data-w="' + k + '">' + vis(o, true) + '<span class="en">' + esc(o.en) + '</span><span class="vi">' + esc(o.vi) + "</span></button>";
    }).join("") + "</div></div>";
    h += '<div class="block"><div class="b-head"><h3>2. Nói theo nào!</h3><span class="muted">Say it!</span><button class="btn" type="button" data-act="all-talk">▶ Nghe cả đoạn</button></div><div class="talk">' +
      u.talk.map(function (t, k) {
        var who = P.chars[t[2] || 0];
        return '<div class="bub ' + ((t[2] || 0) === 2 ? "r" : "") + '" data-t="' + k + '"><span class="who" aria-hidden="true">' + who + '</span><button class="bb" type="button" data-t="' + k + '"><span class="en">' + esc(t[0]) + "</span><small>" + esc(t[1]) + "</small></button></div>";
      }).join("") + "</div></div>";
    h += '<div class="block"><div class="b-head"><h3>3. Trò chơi</h3></div>' +
      (u.games.length > 1 ? '<div class="gtabs">' + u.games.map(function (g, k) { return '<button class="chip" type="button" data-g="' + k + '" aria-pressed="' + (k === 0) + '">' + esc(g.name) + "</button>"; }).join("") + "</div>" : "") +
      '<div class="game" id="game" aria-live="polite"></div></div>';
    h += '<div class="u-nav">' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + esc(prev.n) + "</a>" : '<a class="btn" href="#lo-trinh">← Lộ trình</a>') +
      (next ? '<a class="btn primary" href="#' + next.id + '">' + esc(next.n) + ": " + esc(next.en) + " →</a>" : (P.next ? '<a class="btn primary" target="_top" href="' + P.next.href + '">' + esc(P.next.label) + " →</a>" : "")) + "</div>";
    return h;
  }
  function vis(o, big) {
    if (o.x && o.x.color) return '<span class="ball" style="--c:' + o.x.color + '" aria-hidden="true"></span>';
    return '<span class="ic" aria-hidden="true">' + o.ic + "</span>";
  }

  /* ---------- games ---------- */
  var G = null, cur = null;
  function startGame(k) {
    $$(".gtabs .chip").forEach(function (c) { c.setAttribute("aria-pressed", +c.getAttribute("data-g") === k); });
    var cfg = cur.games[k];
    G = { cfg: cfg, i: 0, ok: 0, miss: false };
    var box = $("#game");
    if (cfg.type === "simon") return simon(box, cfg);
    if (cfg.type === "match") return match(box, cfg);
    if (cfg.type === "scene") { G.order = shuffle(idx(cfg)); return scene(box); }
    if (cfg.type === "basket") { G.order = shuffle(idx(cfg)); G.left = idx(cfg).slice(); return basket(box); }
    if (cfg.type === "count") { G.order = pickN([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (n) { return n <= (cfg.max || 10); }), cfg.rounds || 6); return count(box); }
    if (cfg.type === "phrase") { G.order = shuffle(cfg.items.map(function (_, j) { return j; })); return phrase(box); }
    G.order = pickN(idx(cfg), Math.min(cfg.rounds || 6, idx(cfg).length)); pick(box);
  }
  function idx(cfg) { return cfg.only || cur.words.map(function (_, j) { return j; }); }
  function fill(t, o) { return t.replace("{w}", o.en).replace("{s}", o.x && o.x.sound || "").replace("{a}", /^[aeiou]/i.test(o.en) ? "an" : "a"); }
  function top() { return '<div class="g-top"><span>Câu ' + (G.i + 1) + "/" + G.order.length + '</span><span class="stars">' + "⭐".repeat(G.ok) + "</span></div>"; }
  function done(box) {
    box.innerHTML = '<div class="done"><div class="big">🎉</div><p>Giỏi quá! Bé được <b>' + G.ok + "</b> ngôi sao</p><div class=\"stars\">" + "⭐".repeat(G.ok) + '</div><button class="btn primary" type="button" data-act="replay">↺ Chơi lại</button></div>';
    chime(true); speak("Well done! Great job!");
  }
  /* pick: nghe rồi chọn 1 trong 3 hình */
  function pick(box) {
    if (G.i >= G.order.length) return done(box);
    var cfg = G.cfg, k = G.order[G.i], o = W(cur.words[k]);
    var pool = idx(cfg).filter(function (j) { return j !== k; });
    var opts = shuffle([k].concat(pickN(pool, (cfg.options || 3) - 1)));
    var say = fill(cfg.prompt || "{w}", o);
    G.ans = k; G.miss = false; G.say = say;
    box.innerHTML = top() + '<div class="g-ask"><button class="btn primary big" type="button" data-act="hear">🔊 Nghe</button>' + (cfg.showText ? '<span class="ask-t">' + esc(say) + "</span>" : "") + "</div>" +
      '<div class="g-opts n' + opts.length + '">' + opts.map(function (j) { var w = W(cur.words[j]); return '<button class="opt" type="button" data-j="' + j + '" aria-label="' + esc(w.vi) + '">' + vis(w) + "</button>"; }).join("") + "</div>";
  }
  function answerPick(btn) {
    var j = +btn.getAttribute("data-j"), o = W(cur.words[G.ans]);
    if (j === G.ans) {
      if (!G.miss) G.ok++; btn.classList.add("right"); burst(btn); $$(".opt").forEach(function (b) { b.disabled = true; });
      praise(G.cfg.after ? fill(G.cfg.after, o) : o.en + "!");
      setTimeout(function () { G.i++; pick($("#game")); }, 1700);
    } else { G.miss = true; oops(btn); }
  }
  /* count: đếm hình, chọn số */
  var NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function count(box) {
    if (G.i >= G.order.length) return done(box);
    var n = G.order[G.i], item = G.cfg.items[G.i % G.cfg.items.length];
    var others = pickN([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (x) { return x !== n && x <= (G.cfg.max || 10) && Math.abs(x - n) <= 3; }), 2);
    var opts = shuffle([n].concat(others)); G.ans = n; G.miss = false; G.say = "How many?";
    box.innerHTML = top() + '<div class="g-ask"><button class="btn primary big" type="button" data-act="hear">🔊 How many?</button></div>' +
      '<div class="tray-items" aria-label="' + n + ' hình">' + new Array(n + 1).join('<span aria-hidden="true">' + item + "</span>") + "</div>" +
      '<div class="g-opts n3">' + opts.map(function (x) { return '<button class="opt num" type="button" data-n="' + x + '">' + x + "<small>" + NUM[x] + "</small></button>"; }).join("") + "</div>";
  }
  /* simon: cô bấm, máy đọc lệnh, bé làm theo */
  function simon(box, cfg) {
    G.order = shuffle(cfg.cmds.map(function (_, j) { return j; })); G.i = -1;
    box.innerHTML = '<p class="muted">Bấm nút, máy đọc lệnh. Cả lớp đứng lên làm theo! Bật ô "' + esc(cfg.says || "Simon says") + '" để chơi kiểu: chỉ làm khi máy nói câu đó, không có thì đứng yên.</p>' +
      '<div class="simon"><div class="cmd" id="cmd"><span class="big" aria-hidden="true">👂</span><span class="ct">Sẵn sàng chưa?</span></div>' +
      '<div class="row"><button class="btn primary big" type="button" data-act="cmd">🎲 Lệnh tiếp theo</button><button class="btn" type="button" data-act="cmd-again">🔊 Nghe lại</button>' +
      '<label class="ss"><input type="checkbox" id="simonSays"> ' + esc(cfg.says || "Simon says") + '</label></div></div>';
  }
  function nextCmd(again) {
    var cfg = G.cfg; if (!again) { G.i = (G.i + 1) % G.order.length; G.simon = $("#simonSays") && $("#simonSays").checked ? Math.random() < 0.65 : true; }
    var c = cfg.cmds[G.order[G.i]], say = (G.simon && $("#simonSays").checked ? (cfg.says || "Simon says") + ", " : "") + c[1];
    $("#cmd").innerHTML = '<span class="big" aria-hidden="true">' + c[0] + '</span><span class="ct">' + esc(say) + "</span><small>" + esc(c[2]) + "</small>";
    speak(say, { rate: 0.85 });
  }
  /* scene: tìm con vật trong bức tranh */
  var SPOTS = [[12, 22], [36, 14], [62, 24], [84, 16], [20, 58], [48, 50], [74, 60], [30, 82], [58, 80], [86, 84], [8, 84], [92, 44]];
  function scene(box) {
    if (G.i >= G.order.length) return done(box);
    var cfg = G.cfg, k = G.order[G.i], o = W(cur.words[k]); G.ans = k; G.miss = false; G.say = fill(cfg.prompt, o);
    var all = idx(cfg), spots = shuffle(SPOTS);
    box.innerHTML = top() + '<div class="g-ask"><button class="btn primary big" type="button" data-act="hear">🔊 ' + esc(G.say) + "</button></div>" +
      '<div class="scene ' + (cfg.bg || "") + '">' + (cfg.deco || []).map(function (d) { return '<span class="deco" style="left:' + d[1] + "%;top:" + d[2] + '%" aria-hidden="true">' + d[0] + "</span>"; }).join("") +
      all.map(function (j, n) { var w = W(cur.words[j]), s = spots[n % spots.length]; return '<button class="spot" type="button" data-j="' + j + '" style="left:' + s[0] + "%;top:" + s[1] + '%" aria-label="' + esc(w.vi) + '">' + w.ic + "</button>"; }).join("") + "</div>";
  }
  /* basket: bỏ đồ vào giỏ */
  function basket(box) {
    if (G.i >= G.order.length) return done(box);
    var cfg = G.cfg, k = G.order[G.i], o = W(cur.words[k]); G.ans = k; G.miss = false; G.say = fill(cfg.prompt, o);
    box.innerHTML = top() + '<div class="g-ask"><button class="btn primary big" type="button" data-act="hear">🔊 Nghe</button></div>' +
      '<div class="room"><div class="floor">' + G.left.map(function (j) { var w = W(cur.words[j]); return '<button class="opt" type="button" data-j="' + j + '" aria-label="' + esc(w.vi) + '">' + vis(w) + "</button>"; }).join("") +
      '</div><div class="bin" aria-label="Giỏ"><span class="bin-ic" aria-hidden="true">' + (cfg.bin || "🧺") + '</span><div class="in">' + G.order.slice(0, G.i).map(function (j) { return '<span aria-hidden="true">' + cur.words[j][0] + "</span>"; }).join("") + "</div></div></div>";
  }
  /* match: nối con vật với việc nó làm được */
  function match(box, cfg) {
    G.pairs = cfg.pairs; G.sel = null; G.done = 0; G.ok = 0; G.miss = false;
    var L = shuffle(cfg.pairs.map(function (_, j) { return j; })), R = shuffle(L);
    box.innerHTML = '<p class="muted">Bấm một con vật bên trái, rồi bấm việc nó làm được bên phải.</p><div class="match"><div class="col">' +
      L.map(function (j) { var p = cfg.pairs[j]; return '<button class="mi" type="button" data-l="' + j + '"><span class="ic" aria-hidden="true">' + p[0] + "</span>" + esc(p[1]) + "</button>"; }).join("") +
      '</div><div class="col">' + R.map(function (j) { var p = cfg.pairs[j]; return '<button class="mi" type="button" data-r="' + j + '"><span class="ic" aria-hidden="true">' + p[2] + "</span>" + esc(p[3]) + "</button>"; }).join("") + "</div></div>";
  }
  /* phrase: tình huống, chọn câu nói đúng */
  function phrase(box) {
    if (G.i >= G.order.length) return done(box);
    var it = G.cfg.items[G.order[G.i]]; G.ans = it.a; G.miss = false; G.say = it.say || "";
    var opts = shuffle(it.o.map(function (_, j) { return j; }));
    box.innerHTML = top() + '<div class="situ"><span class="big" aria-hidden="true">' + it.pic + '</span><span class="sv">' + esc(it.vi) + "</span>" + (it.say ? '<button class="btn primary" type="button" data-act="hear">🔊 Nghe</button>' : "") + "</div>" +
      '<p class="muted center">Bấm vào câu để nghe. Bé nói câu nào?</p><div class="phr">' + opts.map(function (j) { return '<button class="opt ph" type="button" data-p="' + j + '"><span class="ic" aria-hidden="true">' + it.o[j][0] + "</span>" + esc(it.o[j][1]) + "</button>"; }).join("") + "</div>";
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = t.closest("[data-act]");
    if (a) {
      var act = a.getAttribute("data-act");
      if (act === "hear") speak(G.say);
      if (act === "replay") startGame(+(($(".gtabs .chip[aria-pressed=true]") || { getAttribute: function () { return 0; } }).getAttribute("data-g")));
      if (act === "cmd") nextCmd(false);
      if (act === "cmd-again" && G.i >= 0) nextCmd(true);
      if (act === "all-words") { if (hasSpeech) speechSynthesis.cancel(); var cards = $$(".card"); cur.words.forEach(function (w, k) { speak(w[1].replace(/ \/ /g, ", "), { queue: true, onstart: function () { cards.forEach(function (c) { c.classList.remove("on"); }); cards[k].classList.add("on"); }, onend: function () { cards[k].classList.remove("on"); } }); }); }
      if (act === "all-talk") { if (hasSpeech) speechSynthesis.cancel(); var bs = $$(".bub"); cur.talk.forEach(function (x, k) { speak(x[0], { queue: true, voice: x[2] || 0, onstart: function () { bs.forEach(function (c) { c.classList.remove("on"); }); bs[k].classList.add("on"); }, onend: function () { bs[k].classList.remove("on"); } }); }); }
      return;
    }
    var gt = t.closest(".gtabs .chip"); if (gt) { startGame(+gt.getAttribute("data-g")); return; }
    var card = t.closest(".card");
    if (card) { var w = cur.words[+card.getAttribute("data-w")]; card.classList.add("on", "zoom"); speak(w[1].replace(/ \/ /g, ", "), { onend: function () { card.classList.remove("on"); } }); setTimeout(function () { card.classList.remove("zoom"); }, 450); return; }
    var bb = t.closest(".bb"); if (bb) { var x = cur.talk[+bb.getAttribute("data-t")]; speak(x[0], { voice: x[2] || 0 }); return; }
    if (!G) return;
    var type = G.cfg.type;
    var opt = t.closest(".opt");
    if (opt && !opt.disabled && type === "pick") return answerPick(opt);
    if (opt && type === "count") {
      if (+opt.getAttribute("data-n") === G.ans) { if (!G.miss) G.ok++; opt.classList.add("right"); burst(opt); $$(".opt").forEach(function (b) { b.disabled = true; }); praise(NUM[G.ans] + "!"); setTimeout(function () { G.i++; count($("#game")); }, 1700); }
      else { G.miss = true; oops(opt); }
      return;
    }
    if (opt && type === "basket" && !opt.disabled) {
      if (+opt.getAttribute("data-j") === G.ans) {
        if (!G.miss) G.ok++; opt.disabled = true; opt.classList.add("fly"); burst(opt);
        G.left = G.left.filter(function (j) { return j !== G.ans; });
        praise(G.cfg.after ? fill(G.cfg.after, W(cur.words[G.ans])) : "");
        setTimeout(function () { G.i++; basket($("#game")); }, 1500);
      } else { G.miss = true; oops(opt); }
      return;
    }
    if (opt && type === "phrase" && !opt.disabled) {
      var it = G.cfg.items[G.order[G.i]], p = +opt.getAttribute("data-p");
      speak(it.o[p][1]);
      if (p === G.ans) { if (!G.miss) G.ok++; opt.classList.add("right"); burst(opt); $$(".opt").forEach(function (b) { b.disabled = true; }); setTimeout(function () { chime(true); }, 600); setTimeout(function () { G.i++; phrase($("#game")); }, 2200); }
      else { G.miss = true; setTimeout(function () { oops(opt); }, 900); }
      return;
    }
    var sp = t.closest(".spot");
    if (sp && type === "scene" && !sp.disabled) {
      if (+sp.getAttribute("data-j") === G.ans) { if (!G.miss) G.ok++; sp.classList.add("found"); burst(sp); $$(".spot").forEach(function (b) { b.disabled = true; }); praise(G.cfg.after ? fill(G.cfg.after, W(cur.words[G.ans])) : W(cur.words[G.ans]).en + "!"); setTimeout(function () { G.i++; scene($("#game")); }, 1700); }
      else { G.miss = true; oops(sp); }
      return;
    }
    var mi = t.closest(".mi");
    if (mi && type === "match" && !mi.disabled) {
      if (mi.hasAttribute("data-l")) { $$(".mi[data-l]").forEach(function (b) { b.classList.remove("sel"); }); mi.classList.add("sel"); G.sel = +mi.getAttribute("data-l"); speak(G.pairs[G.sel][1]); return; }
      if (G.sel === null) { speak(G.pairs[+mi.getAttribute("data-r")][3]); return; }
      var r = +mi.getAttribute("data-r");
      if (r === G.sel) {
        var l = $('.mi[data-l="' + r + '"]'); l.classList.remove("sel"); l.classList.add("paired"); mi.classList.add("paired"); l.disabled = mi.disabled = true;
        burst(mi); praise(G.pairs[r][4]); G.sel = null; G.done++;
        if (G.done === G.pairs.length) setTimeout(function () { G.ok = G.pairs.length; done($("#game")); }, 1900);
      } else oops(mi);
    }
  });

  /* ---------- answers / guide (PIN) ---------- */
  function guideView() {
    return '<div class="v-head"><span class="v-ic" aria-hidden="true">📒</span><div><span class="v-n">Dành cho cô và ba mẹ</span><h2>Cẩm nang phụ huynh &amp; giáo viên</h2><span class="v-vi">Đáp án trò chơi, kịch bản hỏi đáp 2 phút ở nhà, mẹo phát âm</span></div></div><div id="answerBox"></div>';
  }
  function guideBody(box) {
    box.innerHTML = '<div class="gchips">' + P.units.map(function (u) { return '<a class="chip" href="#g-' + u.id + '">' + u.ic + " " + esc(u.n) + "</a>"; }).join("") + "</div>" +
      P.units.map(function (u) {
        var g = u.guide;
        return '<div class="block guide" id="g-' + u.id + '"><h3>' + u.ic + " " + esc(u.n) + ": " + esc(u.en) + "</h3>" +
          '<div class="gcols"><div><h4>✅ Đáp án nhanh</h4><ul>' + g.answers.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
          '<div><h4>🏠 Kịch bản 2 phút ở nhà</h4><ul>' + g.home.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
          '<div><h4>🗣️ Mẹo phát âm</h4><ul>' + g.tips.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div></div></div>";
      }).join("");
  }

  /* ---------- router ---------- */
  function route() {
    var id = location.hash.slice(1) || "lo-trinh", view = $("#view");
    if (id.indexOf("g-") === 0) { var el = document.getElementById(id); if (el) { el.scrollIntoView(); return; } id = "answers"; }
    var u = unitById(id);
    $$("#units a[data-v]").forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-v") === (u ? u.id : id) ? "page" : "false"); });
    if (hasSpeech) speechSynthesis.cancel();
    if (u) { cur = u; view.innerHTML = unitView(u); startGame(0); }
    else if (id === "answers") { cur = null; G = null; view.innerHTML = guideView(); if (window.LopHocPIN) LopHocPIN.guard($("#answerBox"), guideBody); else guideBody($("#answerBox")); }
    else { cur = null; G = null; view.innerHTML = roadmap(); }
    var nav = $(".nav"); if (nav && nav.getBoundingClientRect().top <= 0) view.scrollIntoView();
  }
  window.addEventListener("hashchange", route);
  route();
  if (window.LopHocPIN) LopHocPIN.onChange(function (u) { $$(".ans-link").forEach(function (a) { a.textContent = (u ? "🔓" : "🔒") + " Cẩm nang"; }); });
})();

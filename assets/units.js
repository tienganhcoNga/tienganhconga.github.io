/* Trang "Units" lớp 1. Mỗi Unit đi theo 4 bước: Lesson 1 (từ + mẫu câu) → Lesson 2 (thêm từ, mở rộng mẫu câu)
   → Lesson 3 (truyện tranh + hội thoại + bài học thái độ) → Lesson 4 (liên môn: Toán, Mĩ thuật, Khoa học, Sức khỏe…),
   rồi Âm & Chant và Trò chơi. Sau mỗi 2 Unit có một bài Ôn tập.
   Trang khai báo window.UNITS = { title, sub, chars, guide, units:[...] } trước khi nạp file này.
   Phần bài học và trò chơi chỉ dùng tiếng Anh. Tiếng Việt (nghĩa, mục tiêu, gợi ý cho cô) chỉ hiện ở mục #lo-trinh.
   Biểu tượng của từ: emoji, hoặc "c:#màu" (ô màu), "n:12" (số), "s:circle:#màu" (hình khối), "z:big:🎈" / "z:small:🎈" (to / nhỏ). */
(function () {
  "use strict";
  var D = window.UNITS; if (!D) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var SPK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  /* ---------- giọng đọc ---------- */
  var hasSpeech = "speechSynthesis" in window, voices = [];
  if (!hasSpeech) document.documentElement.classList.add("no-speech");
  function loadVoices() { voices = hasSpeech ? speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); }) : []; }
  if (hasSpeech) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(text, o) {
    o = o || {}; if (!hasSpeech) return;
    if (!o.queue) speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = o.rate || 0.8; u.pitch = o.pitch || 1;
    if (voices.length) u.voice = voices[0];
    if (o.onstart) u.onstart = o.onstart; if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
    (window.__utts = window.__utts || []).push(u); if (window.__utts.length > 40) window.__utts.shift(); // giữ tham chiếu để Chrome không làm mất onend
    speechSynthesis.speak(u);
  }
  function sayThen(text, next, minMs) {
    var t0 = Date.now(), fired = false;
    var go = function () { if (fired) return; fired = true; setTimeout(next, Math.max(250, minMs - (Date.now() - t0))); };
    if (!hasSpeech) { go(); return; }
    speak(text, { onend: go });
    setTimeout(go, minMs + 6000);
  }
  /* đọc lần lượt các phần tử có data-t, tô sáng phần tử đang đọc */
  function playAll(els) {
    if (!hasSpeech || !els.length) return;
    speechSynthesis.cancel();
    els.forEach(function (el, k) {
      speak(el.getAttribute("data-t"), { queue: true, pitch: +el.getAttribute("data-p") || 1,
        onstart: function () { els.forEach(function (x) { x.classList.remove("speaking"); }); el.classList.add("speaking"); },
        onend: function () { el.classList.remove("speaking"); } });
    });
  }
  var sayBtn = function (t, p) { return '<button class="say" type="button" data-say="' + esc(t) + '"' + (p ? ' data-p="' + p + '"' : "") + ' aria-label="Listen: ' + esc(t) + '">' + SPK + "</button>"; };

  /* ---------- biểu tượng ---------- */
  var SH = { circle: '<circle cx="50" cy="50" r="40"/>', square: '<rect x="13" y="13" width="74" height="74" rx="4"/>', triangle: '<polygon points="50,9 93,88 7,88"/>',
    rectangle: '<rect x="5" y="25" width="90" height="50" rx="4"/>', oval: '<ellipse cx="50" cy="50" rx="45" ry="29"/>',
    star: '<polygon points="50,5 61,38 96,38 68,58 79,92 50,71 21,92 32,58 4,38 39,38"/>', heart: '<path d="M50 88C12 61 5 33 24 21c14-8 26 3 26 9 0-6 12-17 26-9 19 12 12 40-26 67z"/>' };
  function icon(s) {
    s = String(s);
    if (s.indexOf("c:") === 0) return '<span class="sw" style="background:' + esc(s.slice(2)) + '"></span>';
    if (s.indexOf("n:") === 0) return '<span class="nb">' + esc(s.slice(2)) + "</span>";
    if (s.indexOf("s:") === 0) { var p = s.slice(2).split(":"); return '<svg class="shp" viewBox="0 0 100 100" aria-hidden="true"><g fill="' + esc(p[1] || "#1E88E5") + '" stroke="rgba(0,0,0,.25)" stroke-width="3">' + (SH[p[0]] || "") + "</g></svg>"; }
    if (s.indexOf("z:") === 0) { var q = s.slice(2).split(":"); return '<span class="z-' + esc(q[0]) + '">' + q.slice(1).join(":") + "</span>"; }
    return s;
  }
  function chr(id) { return (D.chars && D.chars[id]) || { name: id, av: "🙂", pitch: 1 }; }

  /* ---------- dữ liệu gộp ---------- */
  var byId = {}; D.units.forEach(function (u) { byId[u.id] = u; });
  function srcUnits(u) { return u.review ? u.review.map(function (id) { return byId[id]; }).filter(Boolean) : [u]; }
  function allWords(u) {
    var out = [], seen = {};
    srcUnits(u).forEach(function (s) { (s.lessons || []).forEach(function (l) { (l.words || []).forEach(function (w) { if (!seen[w[1]]) { seen[w[1]] = 1; out.push(w); } }); }); });
    return out;
  }
  function allTalk(u) { var out = []; srcUnits(u).forEach(function (s) { (s.lessons || []).forEach(function (l) { out = out.concat(l.talk || []); }); }); return out; }
  function tabs(u) {
    if (u.review) return [{ k: "check", label: "✅ I can…" }, { k: "games", label: "🎮 Games" }];
    var t = u.lessons.map(function (l, i) { return { k: "l" + i, label: l.tag + (l.short ? " · " + l.short : "") }; });
    if (u.phonics || u.chant) t.push({ k: "pc", label: "🔤 Phonics & Chant" });
    t.push({ k: "games", label: "🎮 Games" });
    return t;
  }

  /* ---------- khung trang ---------- */
  $("#cTitle").innerHTML = D.title; $("#cSub").textContent = D.sub;
  var cn = $("#cNote"); if (cn) cn.hidden = true;
  $("#units").insertAdjacentHTML("beforeend", '<a href="#lo-trinh" data-u="lo-trinh"><span aria-hidden="true">🗺️</span> Lộ trình</a>' + D.units.map(function (u) {
    return '<a href="#' + u.id + '" data-u="' + u.id + '"' + (u.review ? ' class="rv"' : "") + '><span aria-hidden="true">' + u.ic + "</span> " + esc(u.n) + "</a>";
  }).join(""));

  var cur = null, tab = null, game = null;
  function markNav(id) {
    $$("#units a[data-u]").forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-u") === id ? "page" : "false"); });
    var a = $('#units a[data-u="' + id + '"]'); if (a && a.scrollIntoView) a.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  function show(id) {
    if (hasSpeech) speechSynthesis.cancel();
    if (id === "lo-trinh") { cur = null; game = null; markNav(id); $("#unit").innerHTML = guidePanel(); return; }
    var u = byId[id] || D.units[0];
    if (u !== cur) { cur = u; tab = tabs(u)[0].k; }
    markNav(u.id);
    var i = D.units.indexOf(u), prev = D.units[i - 1], next = D.units[i + 1];
    var h = '<div class="u-head"><span class="u-ic" aria-hidden="true">' + u.ic + '</span><div><span class="u-n">' + esc(u.n) + "</span><h2>" + esc(u.en) + "</h2></div></div>";
    if (u.can && !u.review) h += '<div class="goals"><b>🎯 I can…</b><ul>' + u.can.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul></div>";
    h += '<div class="ltabs" role="tablist" aria-label="Lessons">' + tabs(u).map(function (t) {
      return '<button class="chip" type="button" role="tab" data-tab="' + t.k + '" aria-selected="' + (t.k === tab) + '">' + esc(t.label) + "</button>";
    }).join("") + "</div>";
    h += '<div id="panel" role="tabpanel"></div>';
    h += '<div class="u-nav">' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + esc(prev.n) + "</a>" : "<span></span>") +
      (next ? '<a class="btn primary" href="#' + next.id + '">' + esc(next.n) + ": " + esc(next.en) + " →</a>" : "") + "</div>";
    $("#unit").innerHTML = h;
    renderTab();
  }
  function setTab(k) {
    tab = k; if (hasSpeech) speechSynthesis.cancel();
    $$(".ltabs .chip").forEach(function (c) { c.setAttribute("aria-selected", c.getAttribute("data-tab") === k); });
    renderTab();
  }
  function nextTabBtn() {
    var t = tabs(cur), i = t.map(function (x) { return x.k; }).indexOf(tab), n = t[i + 1];
    return n ? '<div class="next-tab"><button class="btn primary" type="button" data-tab="' + n.k + '">Next: ' + esc(n.label) + " →</button></div>" : "";
  }

  /* ---------- các phần trong bài (chỉ tiếng Anh) ---------- */
  function wordsBlock(ws, title) {
    return '<div class="block"><div class="b-head"><h3>' + esc(title || "Words") + '</h3><span class="muted">Listen, point and say.</span><button class="btn" type="button" data-playall=".words .word">▶ Listen to all</button></div><div class="words">' +
      ws.map(function (w) { return '<button class="word tap" type="button" data-t="' + esc(w[1]) + '"><span class="ic" aria-hidden="true">' + icon(w[0]) + '</span><span class="w">' + esc(w[1]) + "</span></button>"; }).join("") + "</div></div>";
  }
  function patsBlock(ps, title, sel) {
    return '<div class="block"><div class="b-head"><h3>' + esc(title || "Say it!") + '</h3><button class="btn" type="button" data-playall="' + sel + ' .pat">▶ Listen to all</button></div><div class="pats ' + sel.slice(1) + '">' +
      ps.map(function (p) { return '<div class="pat" data-t="' + esc(p[0]) + '">' + sayBtn(p[0]) + '<div><span class="en">' + esc(p[0]) + "</span></div></div>"; }).join("") + "</div></div>";
  }
  function talkBlock(ts) {
    return '<div class="block"><div class="b-head"><h3>Let&#39;s talk</h3><span class="muted">Ask and answer. Say it first, then tap.</span></div><div class="talks">' +
      ts.map(function (t) {
        return '<div class="talk"><span class="t-ic" aria-hidden="true">' + icon(t[0]) + '</span><div class="t-body"><div class="t-q">' + sayBtn(t[1]) + "<span>" + esc(t[1]) + '</span></div><button class="btn t-show" type="button" data-a="' + esc(t[2]) + '">💬 Answer</button><div class="t-a" hidden>' + esc(t[2]) + "</div></div></div>";
      }).join("") + "</div></div>";
  }
  function storyBlock(l) {
    var s = l.story;
    var h = '<div class="block"><div class="b-head"><h3>📖 ' + esc(s.title) + '</h3><span class="muted">Look, listen and read.</span><button class="btn primary" type="button" data-playall=".comic .bub">▶ Listen to the story</button></div><div class="comic">';
    h += s.scenes.map(function (sc, k) {
      var who = uniq(sc.lines.map(function (x) { return x[0]; }));
      return '<div class="frame"><div class="f-top"><span class="f-n">' + (k + 1) + '</span><span class="f-bg" aria-hidden="true">' + (sc.bg || "") + '</span><span class="f-who" aria-hidden="true">' + who.map(function (id) { return chr(id).av; }).join("") + "</span></div>" +
        sc.lines.map(function (x) {
          var c = chr(x[0]);
          return '<button class="bub tap" type="button" data-t="' + esc(x[1]) + '" data-p="' + (c.pitch || 1) + '"><span class="b-av" aria-hidden="true">' + c.av + '</span><span class="b-tx"><b>' + esc(c.name) + ":</b> " + esc(x[1]) + "</span></button>";
        }).join("") + "</div>";
    }).join("");
    h += "</div>";
    if (s.value) h += '<div class="value"><span class="v-tag">Value</span><span class="v-en">' + esc(s.value[0]) + "</span></div>";
    return h + "</div>";
  }
  function lessonPanel(l) {
    var h = '<div class="l-head"><span class="l-tag">' + esc(l.tag) + "</span><h3>" + esc(l.name) + "</h3>" + (l.subj ? '<span class="subj">' + esc(l.subj) + "</span>" : "") + "</div>";
    if (l.story) h += storyBlock(l);
    if (l.words) h += wordsBlock(l.words);
    if (l.patterns) h += patsBlock(l.patterns, l.story ? "Let's say it!" : "Say it!", ".p-main");
    if (l.talk) h += talkBlock(l.talk);
    return h;
  }
  function hl(word, mark) {
    var m = String(mark).split(/[ ,/]+/).filter(Boolean), out = esc(word);
    for (var i = 0; i < m.length; i++) { var idx = word.toLowerCase().indexOf(m[i].toLowerCase()); if (idx >= 0) { out = esc(word.slice(0, idx)) + "<b>" + esc(word.slice(idx, idx + m[i].length)) + "</b>" + esc(word.slice(idx + m[i].length)); break; } }
    return '<span class="pt">' + out + "</span>";
  }
  function pcPanel(u) {
    var h = "";
    if (u.phonics) {
      h += '<div class="block"><div class="b-head"><h3>Phonics</h3><span class="muted">Listen and repeat.</span></div>';
      h += u.phonics.groups.map(function (g) {
        return '<div class="phon"><button class="letter" type="button" data-say="' + esc(g.say || g.label) + '">' + esc(g.label) + '</button><div class="pwords">' +
          g.words.map(function (w) { return '<button class="pw" type="button" data-say="' + esc(w[1]) + '"><span class="ic" aria-hidden="true">' + icon(w[0]) + "</span>" + hl(w[1], g.mark || g.label) + "</button>"; }).join("") +
          "</div>" + (g.line ? '<div class="pline">' + sayBtn(g.line) + "<span>" + hl(g.line, g.mark || g.label) + "</span></div>" : "") + "</div>";
      }).join("");
      h += "</div>";
    }
    if (u.chant) h += patsBlock(u.chant.lines.map(function (x) { return [x]; }), "🎵 Let's chant: " + u.chant.title, ".p-chant");
    return h;
  }
  function checkPanel(u) {
    var h = '<div class="block"><div class="b-head"><h3>I can…</h3><span class="muted">Tap ✓ if you can.</span></div>';
    h += srcUnits(u).map(function (s) {
      return '<div class="ck-u"><a href="#' + s.id + '"><span aria-hidden="true">' + s.ic + "</span> " + esc(s.n) + ": " + esc(s.en) + '</a><ul class="ck">' +
        (s.can || []).map(function (g) { return '<li><button class="ck-b" type="button" aria-pressed="false"><span class="ck-box" aria-hidden="true"></span><span>' + esc(g) + "</span></button></li>"; }).join("") + "</ul></div>";
    }).join("");
    return h + "</div>" + wordsBlock(allWords(u), "All the words");
  }
  function gamesPanel(u) {
    var hasTalk = allTalk(u).length >= 3;
    return '<div class="block"><div class="b-head"><h3>Games</h3></div><div class="gtabs" role="group" aria-label="Games">' +
      '<button class="chip" type="button" data-g="listen" aria-pressed="true">🎧 Listen</button>' +
      '<button class="chip" type="button" data-g="read" aria-pressed="false">📖 Read</button>' +
      '<button class="chip" type="button" data-g="pic" aria-pressed="false">🖼️ Look</button>' +
      (hasTalk ? '<button class="chip" type="button" data-g="qa" aria-pressed="false">💬 Ask &amp; answer</button>' : "") +
      '</div><div class="game" id="game" aria-live="polite"></div></div>';
  }
  function renderTab() {
    var p = $("#panel"); if (!p) return;
    var h;
    if (tab === "games") h = gamesPanel(cur);
    else if (tab === "check") h = checkPanel(cur);
    else if (tab === "pc") h = pcPanel(cur);
    else h = lessonPanel(cur.lessons[+tab.slice(1)]);
    p.innerHTML = h + nextTabBtn();
    if (tab === "games") startGame("listen");
  }

  /* ---------- Lộ trình: phần duy nhất có tiếng Việt (cho cô và phụ huynh) ---------- */
  function guidePanel() {
    var G = D.guide || {};
    var h = '<div class="u-head"><span class="u-ic" aria-hidden="true">🗺️</span><div><span class="u-n">Dành cho cô và phụ huynh</span><h2>Lộ trình &amp; gợi ý dạy</h2></div></div>';
    if (G.intro) h += '<div class="block guide">' + G.intro + "</div>";
    h += '<div class="block"><div class="b-head"><h3>Lộ trình cả năm</h3><span class="muted">Bấm vào từng Unit để xem mục tiêu, nghĩa của từ và câu, truyện, câu hỏi gợi ý.</span></div>';
    h += D.units.map(function (u) {
      if (u.review) return '<p class="g-rv"><a href="#' + u.id + '">' + u.ic + " " + esc(u.n) + "</a>: " + esc(u.vi) + "</p>";
      var s = '<details class="g-u"><summary><span aria-hidden="true">' + u.ic + "</span> <b>" + esc(u.n) + ": " + esc(u.en) + '</b> <span class="muted">· ' + esc(u.vi) + "</span></summary>";
      s += '<p><a class="btn" href="#' + u.id + '">Mở bài học →</a></p>';
      if (u.goals) s += "<h4>Mục tiêu</h4><ul>" + u.goals.map(function (g) { return "<li>" + g + "</li>"; }).join("") + "</ul>";
      u.lessons.forEach(function (l) {
        s += "<h4>" + esc(l.tag) + ": " + esc(l.name) + (l.subjVi ? " · " + esc(l.subjVi) : "") + "</h4>";
        if (l.intro) s += '<p class="tip">💡 ' + l.intro + "</p>";
        if (l.words) s += '<p class="g-w">' + l.words.map(function (w) { return "<b>" + esc(w[1]) + "</b> (" + esc(w[2]) + ")"; }).join(", ") + "</p>";
        if (l.story) {
          s += '<table class="g-t">' + l.story.scenes.map(function (sc) { return sc.lines.map(function (x) { return "<tr><td><b>" + esc(chr(x[0]).name) + ":</b> " + esc(x[1]) + "</td><td>" + esc(x[2] || "") + "</td></tr>"; }).join(""); }).join("") + "</table>";
          if (l.story.value) s += '<p class="tip">❤️ <b>' + esc(l.story.value[0]) + "</b> " + esc(l.story.value[1]) + "</p>";
          if (l.story.ask) s += '<p class="tip">❓ Cô hỏi bằng tiếng Việt, con trả lời bằng tiếng Anh:</p><ol>' + l.story.ask.map(function (q) { return "<li>" + q + "</li>"; }).join("") + "</ol>";
        }
        if (l.patterns) s += '<table class="g-t">' + l.patterns.map(function (p) { return "<tr><td>" + esc(p[0]) + "</td><td>" + esc(p[1] || "") + "</td></tr>"; }).join("") + "</table>";
      });
      if (u.phonics) s += "<h4>Âm &amp; Chant</h4><p>" + u.phonics.groups.map(function (g) { return "<b>" + esc(g.label) + "</b> (" + g.words.map(function (w) { return esc(w[1]); }).join(", ") + ")"; }).join(" · ") + (u.chant ? ". Chant: <i>" + esc(u.chant.title) + "</i>." : "") + "</p>";
      return s + "</details>";
    }).join("");
    return h + "</div>";
  }

  /* ---------- trò chơi ---------- */
  function startGame(kind) {
    if (hasSpeech) speechSynthesis.cancel();
    $$(".gtabs .chip").forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-g") === kind); });
    var pool = kind === "qa" ? allTalk(cur) : allWords(cur);
    game = { kind: kind, pool: pool, order: shuffle(pool.map(function (x, k) { return k; })).slice(0, Math.min(8, pool.length)), i: 0, ok: 0 };
    round();
  }
  function qaOptions(it, pool) {
    if (it[3]) return it[3].slice(0, 2);
    var same = shuffle(uniq(pool.filter(function (x) { return x[1] === it[1] && x[2] !== it[2]; }).map(function (x) { return x[2]; })));
    var diff = shuffle(uniq(pool.filter(function (x) { return x[1] !== it[1] && x[2] !== it[2]; }).map(function (x) { return x[2]; })));
    var out = same.slice(0, 1);
    diff.forEach(function (a) { if (out.length < 2 && out.indexOf(a) < 0) out.push(a); });
    same.slice(1).forEach(function (a) { if (out.length < 2) out.push(a); });
    return out;
  }
  function round() {
    var box = $("#game"); if (!box) return;
    if (game.i >= game.order.length) {
      var n = game.order.length, stars = game.ok === n ? "⭐⭐⭐" : game.ok >= n * 0.6 ? "⭐⭐" : "⭐";
      box.innerHTML = '<div class="done"><div class="stars">' + stars + '</div><p>' + (game.ok >= n * 0.6 ? "Great job!" : "Good try!") + ' <b>' + game.ok + "/" + n + '</b></p><button class="btn primary" type="button" id="again">↺ Play again</button></div>';
      return;
    }
    var k = game.order[game.i], top = '<div class="g-top"><span class="g-count">' + (game.i + 1) + "/" + game.order.length + '</span><span class="g-score">⭐ ' + game.ok + "</span></div>";
    game.miss = false;
    if (game.kind === "qa") {
      var it = game.pool[k], opts = shuffle([it[2]].concat(qaOptions(it, game.pool)));
      game.ans = it[2];
      box.innerHTML = top + '<div class="g-prompt qa"><span class="pic-q" aria-hidden="true">' + icon(it[0]) + '</span><span class="read-q">' + esc(it[1]) + "</span>" + sayBtn(it[1]) + "</div>" +
        '<div class="g-opts txt one">' + opts.map(function (a) { return '<button class="g-opt" type="button" data-a="' + esc(a) + '">' + esc(a) + "</button>"; }).join("") + "</div>";
      return;
    }
    var w = game.pool[k];
    var others = shuffle(game.pool.map(function (x, j) { return j; }).filter(function (j) { var o = game.pool[j]; return j !== k && o[0] !== w[0] && o[1] !== w[1]; })).slice(0, 3);
    var ord = shuffle([k].concat(others));
    game.ans = k;
    var prompt;
    if (game.kind === "listen") prompt = '<button class="btn primary big" type="button" id="hear">🔊 Listen</button><span class="muted">Listen and tap the right picture.</span>';
    else if (game.kind === "read") prompt = '<span class="read-w">' + esc(w[1]) + "</span>" + sayBtn(w[1]);
    else prompt = '<span class="pic-q" aria-hidden="true">' + icon(w[0]) + '</span><span class="muted">What is it?</span>';
    box.innerHTML = top + '<div class="g-prompt">' + prompt + "</div>" +
      '<div class="g-opts ' + (game.kind === "pic" ? "txt" : "") + '">' + ord.map(function (j) {
        var o = game.pool[j];
        return '<button class="g-opt" type="button" data-j="' + j + '" aria-label="' + esc(game.kind === "pic" ? o[1] : "picture " + (ord.indexOf(j) + 1)) + '">' + (game.kind === "pic" ? esc(o[1]) : '<span aria-hidden="true">' + icon(o[0]) + "</span>") + "</button>";
      }).join("") + "</div>";
    // Chỉ đọc khi bé bấm 🔊 Nghe, không tự đọc.
  }
  function pick(o) {
    var right = game.kind === "qa" ? o.getAttribute("data-a") === game.ans : +o.getAttribute("data-j") === game.ans;
    if (!right) { o.classList.add("wrong"); game.miss = true; o.disabled = true; return; }
    o.classList.add("right"); if (!game.miss) game.ok++;
    $$(".g-opt").forEach(function (b) { b.disabled = true; });
    var mine = game, text = game.kind === "qa" ? game.ans : "Yes! " + game.pool[game.ans][1];
    sayThen(text, function () { if (game === mine) { game.i++; round(); } }, 1000);
  }

  /* ---------- bấm ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target, b;
    if ((b = t.closest("[data-say]"))) { speak(b.getAttribute("data-say"), { pitch: +b.getAttribute("data-p") || 1 }); return; }
    if ((b = t.closest("[data-tab]"))) { setTab(b.getAttribute("data-tab")); if (b.closest(".next-tab")) { var lt = $(".ltabs"); if (lt) lt.scrollIntoView({ block: "start" }); } return; }
    if ((b = t.closest("[data-playall]"))) { playAll($$(b.getAttribute("data-playall"), $("#panel"))); return; }
    if ((b = t.closest(".tap"))) { b.classList.add("speaking"); speak(b.getAttribute("data-t"), { pitch: +b.getAttribute("data-p") || 1, onend: function () { b.classList.remove("speaking"); } }); return; }
    if ((b = t.closest(".t-show"))) { var a = b.nextElementSibling; a.hidden = false; speak(b.getAttribute("data-a")); return; }
    if ((b = t.closest(".ck-b"))) { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); return; }
    if ((b = t.closest(".gtabs .chip"))) { startGame(b.getAttribute("data-g")); return; }
    if (t.closest("#again")) { startGame(game.kind); return; }
    if (t.closest("#hear")) { speak(game.pool[game.ans][1]); return; }
    if ((b = t.closest(".g-opt")) && game && !b.disabled) { pick(b); return; }
  });

  function route() { show(location.hash.slice(1)); }
  window.addEventListener("hashchange", function () { route(); var m = $("#unit"); if (m && document.documentElement.scrollTop > m.offsetTop) m.scrollIntoView(); });
  route();
})();

/* Trang ôn tập theo từng Unit. Mỗi trang khai báo window.COURSE = { title, sub, note, reading, units:[...] } trước khi nạp file này.
   unit: { id:'u1', n:'Unit 1', en:'At school', vi:'Ở trường', ic:'🏫', words:[[emoji,english,tiếng Việt]], patterns:[[english,tiếng Việt]], phonics:{label:'a', words:[[emoji,word]]} } */
(function () {
  "use strict";
  var C = window.COURSE; if (!C) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var SPK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* speech */
  var hasSpeech = "speechSynthesis" in window, voices = [];
  if (!hasSpeech) document.documentElement.classList.add("no-speech");
  function loadVoices() { voices = hasSpeech ? speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); }) : []; }
  if (hasSpeech) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(text, o) {
    o = o || {}; if (!hasSpeech) return;
    if (!o.queue) speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = o.rate || 0.8;
    if (voices.length) u.voice = voices[0];
    if (o.onstart) u.onstart = o.onstart; if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
    speechSynthesis.speak(u);
  }
  var clean = function (w) { return w.replace(/ \/ /g, ", "); };
  var sayBtn = function (t) { return '<button class="say" type="button" data-say="' + esc(t) + '" aria-label="Nghe: ' + esc(t) + '">' + SPK + "</button>"; };
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-say]"); if (b) { e.stopPropagation(); speak(b.getAttribute("data-say")); } });

  /* header + unit chips */
  $("#cTitle").innerHTML = C.title; $("#cSub").textContent = C.sub;
  if (C.note) $("#cNote").textContent = C.note;
  $("#units").insertAdjacentHTML("beforeend", C.units.map(function (u) {
    return '<a href="#' + u.id + '" data-u="' + u.id + '"><span aria-hidden="true">' + u.ic + "</span> " + esc(u.n) + "</a>";
  }).join(""));

  var cur = null, game = null;
  function show(id) {
    var u = C.units.filter(function (x) { return x.id === id; })[0] || C.units[0];
    cur = u;
    document.querySelectorAll("#units a[data-u]").forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-u") === u.id ? "page" : "false"); });
    var i = C.units.indexOf(u), prev = C.units[i - 1], next = C.units[i + 1];
    var html = '<div class="u-head"><span class="u-ic" aria-hidden="true">' + u.ic + '</span><div><span class="u-n">' + esc(u.n) + "</span><h2>" + esc(u.en) + '</h2><span class="u-vi">' + esc(u.vi) + "</span></div></div>";
    html += '<div class="block"><div class="b-head"><h3>Từ vựng</h3><button class="btn" type="button" id="playWords">▶ Nghe tất cả</button></div><div class="words">' +
      u.words.map(function (w, k) { return '<button class="word" type="button" data-k="' + k + '"><span class="ic" aria-hidden="true">' + w[0] + '</span><span class="w">' + esc(w[1]) + '</span><span class="v">' + esc(w[2]) + "</span></button>"; }).join("") + "</div></div>";
    html += '<div class="block"><div class="b-head"><h3>Mẫu câu</h3><button class="btn" type="button" id="playPat">▶ Nghe tất cả</button></div><div class="pats">' +
      u.patterns.map(function (p, k) { return '<div class="pat" data-k="' + k + '">' + sayBtn(p[0]) + '<div><span class="en">' + esc(p[0]) + "</span><small>" + esc(p[1]) + "</small></div></div>"; }).join("") + "</div></div>";
    if (u.phonics) html += '<div class="block"><div class="b-head"><h3>Âm của bài</h3><span class="muted">Phonics</span></div><div class="phon"><button class="letter" type="button" data-say="' + esc(u.phonics.say || u.phonics.label) + '">' + esc(u.phonics.label) + '</button><div class="pwords">' +
      u.phonics.words.map(function (w) { return '<button class="pw" type="button" data-say="' + esc(w[1]) + '"><span class="ic" aria-hidden="true">' + w[0] + "</span>" + hl(w[1], u.phonics.mark || u.phonics.label) + "</button>"; }).join("") + "</div></div></div>";
    html += '<div class="block"><div class="b-head"><h3>Trò chơi</h3></div><div class="gtabs" role="group" aria-label="Chọn trò chơi">' +
      '<button class="chip" type="button" data-g="listen" aria-pressed="true">🎧 Nghe và chọn hình</button>' +
      (C.reading ? '<button class="chip" type="button" data-g="read" aria-pressed="false">📖 Đọc chữ, chọn hình</button><button class="chip" type="button" data-g="pic" aria-pressed="false">🖼️ Nhìn hình, chọn chữ</button>' : "") +
      '</div><div class="game" id="game" aria-live="polite"></div></div>';
    html += '<div class="u-nav">' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + esc(prev.n) + ": " + esc(prev.en) + "</a>" : "<span></span>") +
      (next ? '<a class="btn primary" href="#' + next.id + '">' + esc(next.n) + ": " + esc(next.en) + " →</a>" : "") + "</div>";
    $("#unit").innerHTML = html;
    startGame("listen");
  }
  function hl(word, mark) {
    var m = String(mark).split(/[ ,/]+/).filter(function (x) { return x && x.indexOf("-") < 0; });
    var out = esc(word);
    for (var i = 0; i < m.length; i++) { var idx = word.toLowerCase().indexOf(m[i].toLowerCase()); if (idx >= 0) { out = esc(word.slice(0, idx)) + "<b>" + esc(word.slice(idx, idx + m[i].length)) + "</b>" + esc(word.slice(idx + m[i].length)); break; } }
    return '<span class="pt">' + out + "</span>";
  }

  /* games */
  function startGame(kind) {
    document.querySelectorAll(".gtabs .chip").forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-g") === kind); });
    var pool = cur.words.map(function (w, k) { return k; });
    game = { kind: kind, order: shuffle(pool).slice(0, Math.min(8, pool.length)), i: 0, ok: 0, miss: false };
    round();
  }
  function round() {
    var box = $("#game"); if (!box) return;
    if (game.i >= game.order.length) {
      var stars = game.ok === game.order.length ? "⭐⭐⭐" : game.ok >= game.order.length * 0.6 ? "⭐⭐" : "⭐";
      box.innerHTML = '<div class="done"><div class="stars">' + stars + '</div><p>Đúng ngay lần đầu: <b>' + game.ok + "/" + game.order.length + '</b></p><button class="btn primary" type="button" id="again">↺ Chơi lại</button></div>';
      return;
    }
    var k = game.order[game.i], w = cur.words[k];
    var others = shuffle(cur.words.map(function (x, j) { return j; }).filter(function (j) { return j !== k && cur.words[j][0] !== w[0]; })).slice(0, 3);
    var opts = shuffle([k].concat(others));
    game.ans = k; game.miss = false;
    var prompt;
    if (game.kind === "listen") prompt = '<button class="btn primary big" type="button" id="hear">🔊 Nghe</button><span class="muted">Nghe rồi bấm vào hình đúng</span>';
    else if (game.kind === "read") prompt = '<span class="read-w">' + esc(w[1]) + "</span>" + sayBtn(clean(w[1]));
    else prompt = '<span class="pic-q" aria-hidden="true">' + w[0] + '</span><span class="muted">Đây là gì?</span>';
    box.innerHTML = '<div class="g-top"><span class="g-count">Câu ' + (game.i + 1) + "/" + game.order.length + '</span><span class="g-score">⭐ ' + game.ok + "</span></div>" +
      '<div class="g-prompt">' + prompt + "</div>" +
      '<div class="g-opts ' + (game.kind === "pic" ? "txt" : "") + '">' + opts.map(function (j) {
        var o = cur.words[j];
        return '<button class="g-opt" type="button" data-j="' + j + '" aria-label="' + esc(game.kind === "pic" ? o[1] : o[2]) + '">' + (game.kind === "pic" ? esc(o[1]) : '<span aria-hidden="true">' + o[0] + "</span>") + "</button>";
      }).join("") + "</div>";
    if (game.kind === "listen") setTimeout(function () { speak(clean(w[1])); }, 250);
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    var g = t.closest(".gtabs .chip"); if (g) { startGame(g.getAttribute("data-g")); return; }
    if (t.closest("#again")) { startGame(game.kind); return; }
    if (t.closest("#hear")) { speak(clean(cur.words[game.ans][1])); return; }
    var o = t.closest(".g-opt");
    if (o && game && !o.disabled) {
      var j = +o.getAttribute("data-j"), w = cur.words[game.ans];
      if (j === game.ans) {
        o.classList.add("right"); if (!game.miss) game.ok++;
        document.querySelectorAll(".g-opt").forEach(function (b) { b.disabled = true; });
        speak("Yes! " + clean(w[1]));
        setTimeout(function () { game.i++; round(); }, 1200);
      } else { o.classList.add("wrong"); game.miss = true; o.disabled = true; }
      return;
    }
    var wd = t.closest(".word");
    if (wd) { var x = cur.words[+wd.getAttribute("data-k")]; wd.classList.add("speaking"); speak(clean(x[1]), { onend: function () { wd.classList.remove("speaking"); } }); return; }
    if (t.closest("#playWords")) { if (hasSpeech) speechSynthesis.cancel(); var cards = document.querySelectorAll(".word"); cur.words.forEach(function (x, k) { speak(clean(x[1]), { queue: true, onstart: function () { cards.forEach(function (c) { c.classList.remove("speaking"); }); cards[k].classList.add("speaking"); }, onend: function () { cards[k].classList.remove("speaking"); } }); }); return; }
    if (t.closest("#playPat")) { if (hasSpeech) speechSynthesis.cancel(); var rows = document.querySelectorAll(".pat"); cur.patterns.forEach(function (p, k) { speak(p[0], { queue: true, onstart: function () { rows.forEach(function (r) { r.classList.remove("speaking"); }); rows[k].classList.add("speaking"); }, onend: function () { rows[k].classList.remove("speaking"); } }); }); return; }
  });

  function route() { show(location.hash.slice(1)); }
  window.addEventListener("hashchange", function () { route(); var m = $("#unit"); if (m && document.documentElement.scrollTop > m.offsetTop) m.scrollIntoView(); });
  route();
})();

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
    o = o || {}; if (!hasSpeech || !text) return;
    if (!o.queue) speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = Math.max(0.4, (o.rate || 0.8) * SPEED);
    if (window.LopHocVoice) LopHocVoice.apply(u, o.voice || 0); else if (voices.length) u.voice = voices[(o.voice || 0) % voices.length];
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
  /* Song ngữ cho phụ huynh: <span class="vi-t"> bị ẩn (preschool.css), chỉ hiện khi bật nút 🇻🇳 Song ngữ (assets/bilingual.js). */
  var vi = function (t, inl) { return t ? '<span class="vi-t' + (inl ? " in" : "") + '" lang="vi">' + esc(t) + "</span>" : ""; };

  /* ---------- roadmap ---------- */
  function roadmap() {
    var S = P.sessionParts, total = P.units.length * S.length, perWeek = 2, weeks = total / perWeek;
    var h = '<div class="v-head"><span class="v-ic" aria-hidden="true">🗺️</span><div><span class="v-n">' + esc(P.phase) + "</span><h2>Lộ trình " + esc(P.span) + '</h2><span class="v-vi">' + weeks + " tuần · " + total + " buổi · mỗi tuần 2 buổi · mỗi buổi 30–45 phút</span></div></div>";
    h += '<div class="block"><h3>Mục tiêu sau giai đoạn này</h3><ul class="goals">' + P.goals.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul></div>";
    /* Đối chiếu với sách học trên lớp (nếu trang có P.book): mỗi dòng [mã Unit, phần sách tương ứng, giới từ và mẫu câu lồng vào] */
    if (P.book) h += '<div class="block book"><h3>📘 ' + esc(P.book.title) + "</h3>" + (P.book.note ? '<p class="muted">' + P.book.note + "</p>" : "") +
      '<div class="bk-wrap"><table class="bk-tbl"><thead><tr><th>Unit của bé</th><th>Sách học trên lớp</th><th>📍 Giới từ và mẫu câu lồng vào</th></tr></thead><tbody>' +
      P.book.rows.map(function (r) { var u = unitById(r[0]); return '<tr><td><a href="#' + r[0] + '">' + (u ? u.ic + " " + esc(u.n) + ": " + esc(u.en) : esc(r[0])) + "</a></td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>"; }).join("") +
      "</tbody></table></div>" + (P.book.after ? '<p class="muted" style="margin-top:8px">' + P.book.after + "</p>" : "") + "</div>";
    h += '<div class="block"><h3>Khung một buổi học</h3><p class="muted">Buổi 30 phút bỏ bớt phần có dấu *. Buổi 45 phút làm đủ.</p><div class="plan">' +
      P.lessonPlan.map(function (s) { return '<div class="step" style="--w:' + s[0] + '"><div class="mins">' + s[0] + "′" + (s[3] ? "*" : "") + '</div><div><b>' + esc(s[1]) + "</b><small>" + esc(s[2]) + "</small></div></div>"; }).join("") + "</div></div>";
    h += '<div class="block"><h3>Mỗi Unit học trong 3 buổi</h3><div class="parts">' + S.map(function (s, i) { return '<div class="part"><span class="pl">Buổi ' + "ABC"[i] + "</span><b>" + esc(s[0]) + "</b><small>" + esc(s[1]) + "</small></div>"; }).join("") + "</div></div>";
    h += '<div class="block"><h3>Trong bài học chỉ có tiếng Anh</h3><p>Để bé không bị lẫn, màn hình bài học và trò chơi chỉ ghi tiếng Anh. Nghĩa tiếng Việt của từ, câu và bài nói nằm trong <b>🔒 Cẩm nang</b> (cần mã PIN), ba mẹ xem trước để hiểu bé đang học gì.</p></div>';
    h += '<div class="block"><h3>🎤 Bé thuyết trình (mục 4 của mỗi Unit)</h3><div class="parts">' +
      [["1. Listen", "Nghe mẫu", "Máy đọc cả bài, bé nghe và nhìn hình."], ["2. Repeat", "Nói theo", "Máy đọc từng câu rồi dừng, bé nhắc lại khi thấy chữ “Your turn!”."],
       ["3. Say it alone", "Tự nói", "Chữ được ẩn, chỉ còn hình và từ khóa. Bé nhìn hình để nói. Bấm vào tờ giấy để xem gợi ý."], ["4. On stage!", "Lên sân khấu", "Bé tự bấm Next để nói từng câu. Hết bài cả lớp vỗ tay. Có thể tick “Record my voice” để bé nghe lại giọng mình."]]
        .map(function (x) { return '<div class="part"><span class="pl">' + x[0] + "</span><b>" + x[1] + "</b><small>" + x[2] + "</small></div>"; }).join("") +
      '</div><p class="muted" style="margin-top:8px">Gõ tên bé vào ô “My name” một lần, bài nói sẽ tự điền “My name is …”.</p></div>';
    if (P.units.some(function (u) { return u.hw; })) h += homework();
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

  /* ---------- bài tập về nhà: kỹ thuật giúp bé nói sõi (ba mẹ làm cùng con) ----------
     Mỗi Unit ghi hw:{e:[bé nói, ba mẹ mở rộng], s:[tình huống, câu bé nói], c:[câu hỏi lựa chọn, bé trả lời], b:[hỏi khi đọc tranh, bé trả lời], x:"từ dùng thêm ở nhà"} */
  var HW_TECH = [
    ["1", "🗣️ Mở rộng câu", "Bé nói một từ, ba mẹ nhắc lại và thêm 1–2 từ thành câu. Không chê bé nói thiếu, không bắt bé nói lại.", "Bé: <i>Dog!</i> → Ba mẹ: <i>Yes! A big dog. The dog is running!</i> Bé nói tiếng Việt “Chó!” cũng được: <i>Yes, a dog! Woof woof!</i>"],
    ["2", "🎁 Tạo tình huống cần nói", "Đừng phục vụ bé quá nhanh. Cố tình thiếu một thứ rồi chờ 5 giây để bé mở lời. Bé chưa nói được thì ba mẹ nói mẫu, chờ bé nhắc lại rồi mới đưa.", "Đưa bát cơm nhưng không đưa thìa: <i>What do you need?</i> → Bé: <i>Spoon, please!</i>"],
    ["3", "✌️ Câu hỏi lựa chọn", "Thay vì hỏi mở (<i>What do you want?</i>), đưa ra 2 lựa chọn: từ bé cần nói đã nằm sẵn trong câu hỏi.", "<i>Banana or apple?</i> → <i>Banana, please!</i>"],
    ["4", "📚 Đọc sách tranh trước khi ngủ", "10 phút, không cần đọc hết chữ. Chỉ vào tranh và hỏi. Trẻ 2–5 tuổi học từ qua tranh nhanh hơn nhiều so với chỉ nghe nói.", "<i>What is it? What is the bear doing? Where is the rabbit? – It's under the tree!</i>"]];
  var HW_MORE = [
    ["🎙️", "Tường thuật", "Ba mẹ “bình luận” việc bé đang làm bằng câu ngắn. Bé không cần trả lời, chỉ cần được nghe đi nghe lại.", "<i>You're washing your hands. Wash, wash! Now they're clean!</i>"],
    ["🍌", "Làm quá và dùng đồ thật", "Nét mặt, động tác thật to; cho bé cầm, ngửi, nếm đồ thật.", "Quả chuối: <i>Peel it! Smell it! Take a big bite! It's soft and sweet. Yummy!</i>"],
    ["🧩", "Nói theo cụm", "Ghép Danh từ + Động từ + Tính từ thay vì dạy từng từ rời.", "<i>a yellow banana · peel the banana · it's soft</i>"]];
  function hwItems(u) {
    var x = u.hw, q = function (t) { return "“<i>" + esc(t) + "</i>”"; };
    return '<ul class="hw-list">' +
      "<li><b>🗣️ Mở rộng câu:</b> Bé: " + q(x.e[0]) + " → Ba mẹ: " + q(x.e[1]) + "</li>" +
      "<li><b>🎁 Tạo tình huống:</b> " + esc(x.s[0]) + " Chờ 5 giây → bé nói: " + q(x.s[1]) + "</li>" +
      "<li><b>✌️ Câu hỏi lựa chọn:</b> " + q(x.c[0]) + " → " + q(x.c[1]) + "</li>" +
      "<li><b>📚 Đọc tranh trước khi ngủ:</b> " + q(x.b[0]) + " → " + q(x.b[1]) + "</li>" +
      (x.x ? "<li><b>🏠 Từ dùng thêm ở nhà (đồ thật):</b> <i>" + esc(x.x) + "</i></li>" : "") + "</ul>";
  }
  function homework() {
    var card = function (pl, t, d, ex) { return '<div class="part"><span class="pl">' + pl + "</span><b>" + t + "</b><small>" + d + '</small><small class="ex">' + ex + "</small></div>"; };
    return '<div class="block hw" id="hw"><h3>🏠 Bài tập về nhà: ba mẹ giúp con nói sõi</h3>' +
      "<p>Bé học với cô 2 buổi một tuần. Nói sõi là nhờ ba mẹ nói cùng con <b>10–15 phút mỗi ngày</b>, chia nhỏ vào giờ ăn, giờ tắm và trước khi ngủ. Ba mẹ không cần giỏi tiếng Anh: dùng đúng câu trong bài, bấm loa trên web để nghe mẫu.</p>" +
      "<h4>4 kỹ thuật vàng</h4><div class=\"parts\">" + HW_TECH.map(function (t) { return card("Kỹ thuật " + t[0], t[1], t[2], t[3]); }).join("") + "</div>" +
      "<h4>Thêm 3 kỹ thuật từ giờ học của cô</h4><div class=\"parts\">" + HW_MORE.map(function (t) { return card(t[0], t[1], t[2], t[3]); }).join("") + "</div>" +
      '<ul class="hw-rules"><li>Cứ 3–5 phút cho bé đứng dậy vận động: chạy đi lấy đồ, nhảy, vỗ tay.</li>' +
      "<li>Khen ngay khi bé mở lời (<i>Good job!</i>). Không sửa lỗi giữa chừng, chỉ nhắc lại câu đúng một lần như kỹ thuật 1.</li>" +
      "<li>Web chỉ để nghe mẫu và chơi 5–10 phút. Phần còn lại là nói chuyện thật với đồ thật.</li></ul>" +
      "<h4>Bài tập theo từng Unit</h4><p class=\"muted\">Mỗi Unit có một ví dụ cho từng kỹ thuật, dùng đúng từ bé đang học.</p>" +
      P.units.filter(function (u) { return u.hw; }).map(function (u) {
        return '<details class="hw-unit"><summary>' + u.ic + " " + esc(u.n) + ": " + esc(u.en) + "</summary>" + hwItems(u) + "</details>";
      }).join("") + "</div>";
  }

  var VI = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
  function enOnly(t) { if (!t) return ""; var x = String(t); if (VI.test(x) && x.indexOf(":") >= 0) x = x.slice(x.indexOf(":") + 1).trim(); return VI.test(x) ? "" : x; }
  /* ---------- unit ---------- */
  function unitView(u) {
    var i = P.units.indexOf(u), prev = P.units[i - 1], next = P.units[i + 1];
    var h = '<div class="v-head"><span class="v-ic" aria-hidden="true">' + u.ic + '</span><div><span class="v-n">' + esc(u.n) + "</span><h2>" + esc(u.en) + "</h2>" + vi(u.vi) + '</div></div>';
    var rv = enOnly(u.review); if (rv) h += '<p class="review">🔁 Review: ' + esc(rv) + vi("Ôn lại: " + u.review) + "</p>";
    else if (u.review) h += '<p class="review vi-t" lang="vi">🔁 Ôn lại: ' + esc(u.review) + "</p>";
    if (u.speech) { var nS = spList(u).length; h += '<button class="sp-jump" type="button" data-sp="jump">🎤 My Speech: <b>' + esc(u.speech.t) + "</b>" + (nS > 1 ? " +" + (nS - 1) : "") + " ↓</button>"; }
    h += '<div class="block"><div class="b-head"><h3>1. Tap &amp; Listen' + vi("Bấm vào hình để nghe", true) + '</h3><button class="btn" type="button" data-act="all-words">▶ Listen to all</button></div>';
    var lastG = null;
    h += u.words.map(function (w, k) {
      var o = W(w), g = w[4] || "", head = "";
      if (g !== lastG) { head = (lastG !== null ? "</div>" : "") + (lastG !== null ? '<div class="grp-gap"></div>' : "") + '<div class="cards">'; lastG = g; }
      return head + '<button class="card" type="button" data-w="' + k + '">' + vis(o, true) + '<span class="en">' + esc(o.en) + "</span>" + vi(o.vi) + "</button>";
    }).join("") + "</div></div>";
    h += '<div class="block"><div class="b-head"><h3>2. Say it!' + vi("Nói theo", true) + '</h3><button class="btn" type="button" data-act="all-talk">▶ Listen to all</button>' + speedBar() + '</div><div class="talk">' +
      u.talk.map(function (t, k) {
        var who = P.chars[t[2] || 0];
        return '<div class="bub ' + ((t[2] || 0) === 2 ? "r" : "") + '" data-t="' + k + '"><span class="who" aria-hidden="true">' + who + '</span><button class="bb" type="button" data-t="' + k + '"><span class="en">' + esc(t[0]) + "</span>" + vi(t[1]) + "</button></div>";
      }).join("") + "</div></div>";
    h += songBlock(u);
    var gs = gamesOf(u);
    h += '<div class="block"><div class="b-head"><h3>3. Games' + vi("Trò chơi", true) + '</h3></div>' +
      '<div class="gtabs">' + gs.map(function (g, k) { return '<button class="chip" type="button" data-g="' + k + '" aria-pressed="' + (k === 0) + '">' + esc(g.name) + "</button>"; }).join("") + "</div>" +
      '<div class="gq"><div class="game" id="game" aria-live="polite"></div><aside class="gside" id="gside" hidden></aside></div></div>';
    h += speechBlock(u);
    h += '<div class="u-nav">' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + esc(prev.n) + "</a>" : '<a class="btn" href="#lo-trinh">← Start</a>') +
      (next ? '<a class="btn primary" href="#' + next.id + '">' + esc(next.n) + ": " + esc(next.en) + " →</a>" : (P.next ? '<a class="btn primary" target="_top" href="' + P.next.href + '">' + esc(P.next.label) + " →</a>" : "")) + "</div>";
    return h;
  }
  /* ---------- bài hát ----------
     Unit khai báo song:{t, verses:[{ic, cue:[gợi ý EN, gợi ý VI], lines:[câu (có <b>)], vi:"nghĩa"}]}.
     Trong bài chỉ hiện tiếng Anh; nghĩa và gợi ý động tác tiếng Việt nằm ở cẩm nang. */
  function songBlock(u) {
    if (!u.song) return "";
    var s = u.song;
    return '<div class="block song" id="song"><div class="b-head"><h3>🎵 Let&#39;s sing!' + vi("Cùng hát", true) + '</h3><span class="muted">' + esc(s.t) + '</span><button class="btn" type="button" data-act="all-song">▶ Listen to all</button></div>' +
      '<p class="muted">Sing and do the actions! Tap a picture to hear it.</p><div class="verses">' +
      s.verses.map(function (v, k) {
        return '<button class="verse c-' + NOTE_C[k % NOTE_C.length] + '" type="button" data-verse="' + k + '"><span class="v-art" aria-hidden="true">' + v.ic + '</span><span class="v-lines">' +
          v.lines.map(function (l) { return '<span class="v-line">' + l + "</span>"; }).join("") + vi(v.vi) + "</span>" + cueTag(v.cue && v.cue[0]) + "</button>";
      }).join("") + "</div></div>";
  }
  /* đọc lần lượt các dòng của bài hát, tô sáng dòng đang đọc */
  function singLines(els) {
    if (!hasSpeech || !els.length) return;
    speechSynthesis.cancel();
    els.forEach(function (el) {
      speak(plain(el.innerHTML), { queue: true, rate: 0.85,
        onstart: function () { $$(".v-line.on,.verse.on").forEach(function (x) { x.classList.remove("on"); }); el.classList.add("on"); el.closest(".verse").classList.add("on"); },
        onend: function () { el.classList.remove("on"); } });
    });
  }
  function vis(o, big) {
    if (o.x && o.x.color) return '<span class="ball" style="--c:' + o.x.color + '" aria-hidden="true"></span>';
    return '<span class="ic" aria-hidden="true">' + o.ic + "</span>";
  }

  /* ---------- games ---------- */
  var G = null, cur = null;
  /* Mỗi bài có thêm trò "Lật thẻ đoán từ" (giống thẻ "Đoán nhân vật" ở trang Sử Việt). */
  function gamesOf(u) { return u.games.concat([{ type: "flip", name: "🃏 Look and say" }]); }
  var ROUND = { pick: 1, count: 1, scene: 1, basket: 1, phrase: 1 };
  function startGame(k) {
    $$(".gtabs .chip").forEach(function (c) { c.setAttribute("aria-pressed", +c.getAttribute("data-g") === k); });
    var cfg = gamesOf(cur)[k];
    G = { cfg: cfg, k: k, i: 0, ok: 0, miss: false, res: [] };
    var box = $("#game");
    side();
    if (cfg.type === "flip") return flip(box);
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
  function top() { setTimeout(side, 0); return '<div class="g-top"><span>' + (G.i + 1) + "/" + G.order.length + '</span><span class="stars">' + "⭐".repeat(G.ok) + "</span></div>"; }
  /* Khung điểm bên phải: mỗi câu một ô, xanh = đúng ngay lần đầu, đỏ = có chọn sai. */
  function wrongs() { return G.order.filter(function (_, i) { return G.res[i] === false; }); }
  function side() {
    var box = $("#gside"), gq = $(".gq"); if (!box || !gq) return;
    var on = !!(G && ROUND[G.cfg.type] && G.order);
    box.hidden = !on; gq.classList.toggle("has-side", on); if (!on) return;
    box.innerHTML = '<div class="gs-score"><b>' + G.ok + '</b><span>/ ' + G.order.length + "</span></div>" +
      '<div class="gs-dots">' + G.order.map(function (_, i) { var r = G.res[i]; return '<span class="gs-dot' + (i === G.i ? " cur" : "") + (r === true ? " r" : r === false ? " w" : "") + '">' + (i + 1) + "</span>"; }).join("") + "</div>" +
      '<button class="btn" type="button" data-act="replay">🔀 Play again</button>' +
      '<button class="btn" type="button" data-act="g-wrong"' + (wrongs().length ? "" : " disabled") + ">🔁 Try the red ones</button>";
  }
  function mark(ok) { if (G.res[G.i] === undefined) G.res[G.i] = ok; side(); }
  function fb(ok, text) {
    var box = $("#game"); $$(".feedback", box).forEach(function (f) { f.remove(); });
    box.insertAdjacentHTML("beforeend", ok ? '<div class="feedback good"><b>✅ Yes!</b> <span class="en">' + esc(text || "") + "</span></div>"
      : '<div class="feedback bad"><b>❌ Try again!</b></div>');
  }
  function renderRound() { var box = $("#game"), t = G.cfg.type; ({ pick: pick, count: count, scene: scene, basket: basket, phrase: phrase })[t](box); }
  function retryWrong() {
    var w = wrongs(); if (!w.length) return;
    G = { cfg: G.cfg, k: G.k, i: 0, ok: 0, miss: false, res: [], order: shuffle(w) };
    if (G.cfg.type === "basket") G.left = idx(G.cfg).slice();
    renderRound();
  }
  function done(box) {
    var w = wrongs().length;
    box.innerHTML = '<div class="done"><div class="big">🎉</div><p>Great job! <b>' + G.ok + "/" + G.order.length + "</b></p><div class=\"stars\">" + "⭐".repeat(G.ok) + "</div>" +
      '<div class="row-tools center">' + (w ? '<button class="btn primary" type="button" data-act="g-wrong">🔁 Try the red ones (' + w + ")</button>" : "") +
      '<button class="btn' + (w ? "" : " primary") + '" type="button" data-act="replay">↺ Play again</button></div></div>';
    side(); chime(true); speak("Well done! Great job!");
  }
  /* flip: lật thẻ đoán từ */
  function flip(box) {
    var ws = shuffle(cur.words.map(function (_, j) { return j; }));
    box.innerHTML = '<p class="muted">Look at the picture. Say the word! Tap to check.</p>' +
      '<div class="row-tools"><button class="btn" type="button" data-act="flip-all">Show all</button><button class="btn" type="button" data-act="flip-none">Hide all</button></div>' +
      '<div class="flips">' + ws.map(function (j) {
        var o = W(cur.words[j]);
        return '<button class="fcard" type="button" data-f="' + j + '" aria-pressed="false"><span class="fc-front"><span class="q" aria-hidden="true">' + vis(o) + "</span><span class=\"fq\">?</span>" +
          (o.x && o.x.sound ? '<span class="fs">“' + esc(o.x.sound) + "”</span>" : "") + '<span class="hint">Tap to check</span></span>' +
          '<span class="fc-back">' + vis(o) + '<span class="en">' + esc(o.en) + "</span>" + vi(o.vi) + "</span></button>";
      }).join("") + "</div>";
  }
  function flipCard(c, on) { c.classList.toggle("open", on); c.setAttribute("aria-pressed", on ? "true" : "false"); }
  /* pick: nghe rồi chọn 1 trong 3 hình */
  function pick(box) {
    if (G.i >= G.order.length) return done(box);
    var cfg = G.cfg, k = G.order[G.i], o = W(cur.words[k]);
    var pool = idx(cfg).filter(function (j) { return j !== k; });
    var opts = shuffle([k].concat(pickN(pool, (cfg.options || 3) - 1)));
    var say = fill(cfg.prompt || "{w}", o);
    G.ans = k; G.miss = false; G.say = say;
    box.innerHTML = top() + '<div class="g-ask"><button class="btn primary big" type="button" data-act="hear">🔊 Listen</button>' + (cfg.showText ? '<span class="ask-t">' + esc(say) + "</span>" : "") + "</div>" +
      '<div class="g-opts n' + opts.length + '">' + opts.map(function (j) { var w = W(cur.words[j]); return '<button class="opt" type="button" data-j="' + j + '" aria-label="' + esc(w.en) + '">' + vis(w) + "</button>"; }).join("") + "</div>";
  }
  function answerPick(btn) {
    var j = +btn.getAttribute("data-j"), o = W(cur.words[G.ans]);
    if (j === G.ans) {
      if (!G.miss) G.ok++; mark(true); btn.classList.add("right"); burst(btn); $$(".opt").forEach(function (b) { b.disabled = true; });
      var said = G.cfg.after ? fill(G.cfg.after, o) : o.en + "!"; praise(said); fb(true, said);
      setTimeout(function () { G.i++; pick($("#game")); }, 1900);
    } else { G.miss = true; mark(false); fb(false); oops(btn); }
  }
  /* count: đếm hình, chọn số */
  var NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function count(box) {
    if (G.i >= G.order.length) return done(box);
    var n = G.order[G.i], item = G.cfg.items[G.i % G.cfg.items.length];
    var others = pickN([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (x) { return x !== n && x <= (G.cfg.max || 10) && Math.abs(x - n) <= 3; }), 2);
    var opts = shuffle([n].concat(others)); G.ans = n; G.miss = false; G.say = "How many?";
    box.innerHTML = top() + '<div class="g-ask"><button class="btn primary big" type="button" data-act="hear">🔊 How many?</button></div>' +
      '<div class="tray-items" aria-label="' + n + '">' + new Array(n + 1).join('<span aria-hidden="true">' + item + "</span>") + "</div>" +
      '<div class="g-opts n3">' + opts.map(function (x) { return '<button class="opt num" type="button" data-n="' + x + '">' + x + "<small>" + NUM[x] + "</small></button>"; }).join("") + "</div>";
  }
  /* simon: cô bấm, máy đọc lệnh, bé làm theo */
  function simon(box, cfg) {
    G.order = shuffle(cfg.cmds.map(function (_, j) { return j; })); G.i = -1;
    box.innerHTML = '<p class="muted">Stand up! Listen and do it!</p>' +
      '<div class="simon"><div class="cmd" id="cmd"><span class="big" aria-hidden="true">👂</span><span class="ct">Are you ready?</span></div>' +
      '<div class="row"><button class="btn primary big" type="button" data-act="cmd">🎲 Next</button><button class="btn" type="button" data-act="cmd-again">🔊 Again</button>' +
      '<label class="ss"><input type="checkbox" id="simonSays"> ' + esc(cfg.says || "Simon says") + '</label></div></div>';
  }
  function nextCmd(again) {
    var cfg = G.cfg; if (!again) { G.i = (G.i + 1) % G.order.length; G.simon = $("#simonSays") && $("#simonSays").checked ? Math.random() < 0.65 : true; }
    var c = cfg.cmds[G.order[G.i]], say = (G.simon && $("#simonSays").checked ? (cfg.says || "Simon says") + ", " : "") + c[1];
    $("#cmd").innerHTML = '<span class="big" aria-hidden="true">' + c[0] + '</span><span class="ct">' + esc(say) + "</span>";
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
      all.map(function (j, n) { var w = W(cur.words[j]), s = spots[n % spots.length]; return '<button class="spot" type="button" data-j="' + j + '" style="left:' + s[0] + "%;top:" + s[1] + '%" aria-label="' + esc(w.en) + '">' + w.ic + "</button>"; }).join("") + "</div>";
  }
  /* basket: bỏ đồ vào giỏ */
  function basket(box) {
    if (G.i >= G.order.length) return done(box);
    var cfg = G.cfg, k = G.order[G.i], o = W(cur.words[k]); G.ans = k; G.miss = false; G.say = fill(cfg.prompt, o);
    box.innerHTML = top() + '<div class="g-ask"><button class="btn primary big" type="button" data-act="hear">🔊 Listen</button></div>' +
      '<div class="room"><div class="floor">' + G.left.map(function (j) { var w = W(cur.words[j]); return '<button class="opt" type="button" data-j="' + j + '" aria-label="' + esc(w.en) + '">' + vis(w) + "</button>"; }).join("") +
      '</div><div class="bin" aria-label="Basket"><span class="bin-ic" aria-hidden="true">' + (cfg.bin || "🧺") + '</span><div class="in">' + G.order.slice(0, G.i).map(function (j) { return '<span aria-hidden="true">' + cur.words[j][0] + "</span>"; }).join("") + "</div></div></div>";
  }
  /* match: nối con vật với việc nó làm được */
  function match(box, cfg) {
    G.pairs = cfg.pairs; G.sel = null; G.done = 0; G.ok = 0; G.miss = false;
    var L = shuffle(cfg.pairs.map(function (_, j) { return j; })), R = shuffle(L);
    box.innerHTML = '<p class="muted">Tap an animal. Then tap what it can do!</p><div class="match"><div class="col">' +
      L.map(function (j) { var p = cfg.pairs[j]; return '<button class="mi" type="button" data-l="' + j + '"><span class="ic" aria-hidden="true">' + p[0] + "</span>" + esc(p[1]) + "</button>"; }).join("") +
      '</div><div class="col">' + R.map(function (j) { var p = cfg.pairs[j]; return '<button class="mi" type="button" data-r="' + j + '"><span class="ic" aria-hidden="true">' + p[2] + "</span>" + esc(p[3]) + "</button>"; }).join("") + "</div></div>";
  }
  /* phrase: tình huống, chọn câu nói đúng */
  function phrase(box) {
    if (G.i >= G.order.length) return done(box);
    var it = G.cfg.items[G.order[G.i]]; G.ans = it.a; G.miss = false; G.say = it.say || it.en || "";
    var opts = shuffle(it.o.map(function (_, j) { return j; }));
    box.innerHTML = top() + '<div class="situ"><span class="big" aria-hidden="true">' + it.pic + '</span><span class="sv">' + esc(it.en || "") + "</span>" + (it.say ? '<span class="sv said">“' + esc(it.say) + "”</span>" : "") + '<button class="btn primary" type="button" data-act="hear">🔊 Listen</button></div>' +
      '<p class="muted center">What do you say? Tap to listen.</p><div class="phr">' + opts.map(function (j) { return '<button class="opt ph" type="button" data-p="' + j + '"><span class="ic" aria-hidden="true">' + it.o[j][0] + "</span>" + esc(it.o[j][1]) + "</button>"; }).join("") + "</div>";
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = t.closest("[data-act]");
    if (a) {
      var act = a.getAttribute("data-act");
      if (act === "hear") speak(G.say);
      if (act === "replay") startGame(G ? G.k : 0);
      if (act === "g-wrong") retryWrong();
      if (act === "flip-all" || act === "flip-none") $$(".fcard").forEach(function (c) { flipCard(c, act === "flip-all"); });
      if (act === "cmd") nextCmd(false);
      if (act === "cmd-again" && G.i >= 0) nextCmd(true);
      if (act === "all-words") { if (hasSpeech) speechSynthesis.cancel(); var cards = $$(".card"); cur.words.forEach(function (w, k) { speak(w[1].replace(/ \/ /g, ", "), { queue: true, onstart: function () { cards.forEach(function (c) { c.classList.remove("on"); }); cards[k].classList.add("on"); }, onend: function () { cards[k].classList.remove("on"); } }); }); }
      if (act === "all-song") singLines($$(".verses .v-line"));
      if (act === "all-talk") { if (hasSpeech) speechSynthesis.cancel(); var bs = $$(".bub"); cur.talk.forEach(function (x, k) { speak(x[0], { queue: true, voice: x[2] || 0, onstart: function () { bs.forEach(function (c) { c.classList.remove("on"); }); bs[k].classList.add("on"); }, onend: function () { bs[k].classList.remove("on"); } }); }); }
      return;
    }
    var gt = t.closest(".gtabs .chip"); if (gt) { startGame(+gt.getAttribute("data-g")); return; }
    var vs = t.closest(".verse"); if (vs) { singLines($$(".v-line", vs)); return; }
    var card = t.closest(".card");
    if (card) { var w = cur.words[+card.getAttribute("data-w")]; card.classList.add("on", "zoom"); speak(w[1].replace(/ \/ /g, ", "), { onend: function () { card.classList.remove("on"); } }); setTimeout(function () { card.classList.remove("zoom"); }, 450); return; }
    var bb = t.closest(".bb"); if (bb) { var x = cur.talk[+bb.getAttribute("data-t")]; speak(x[0], { voice: x[2] || 0 }); return; }
    var fc = t.closest(".fcard");
    if (fc) { var open = !fc.classList.contains("open"); flipCard(fc, open); if (open) { speak(cur.words[+fc.getAttribute("data-f")][1].replace(/ \/ /g, ", ")); burst(fc); } return; }
    if (!G) return;
    var type = G.cfg.type;
    var opt = t.closest(".opt");
    if (opt && !opt.disabled && type === "pick") return answerPick(opt);
    if (opt && type === "count") {
      if (+opt.getAttribute("data-n") === G.ans) { if (!G.miss) G.ok++; mark(true); opt.classList.add("right"); burst(opt); $$(".opt").forEach(function (b) { b.disabled = true; }); praise(NUM[G.ans] + "!"); fb(true, G.ans + " – " + NUM[G.ans] + "!"); setTimeout(function () { G.i++; count($("#game")); }, 1900); }
      else { G.miss = true; mark(false); fb(false); oops(opt); }
      return;
    }
    if (opt && type === "basket" && !opt.disabled) {
      if (+opt.getAttribute("data-j") === G.ans) {
        if (!G.miss) G.ok++; mark(true); opt.disabled = true; opt.classList.add("fly"); burst(opt);
        G.left = G.left.filter(function (j) { return j !== G.ans; });
        var bs = G.cfg.after ? fill(G.cfg.after, W(cur.words[G.ans])) : W(cur.words[G.ans]).en + "!";
        praise(G.cfg.after ? bs : ""); fb(true, bs);
        setTimeout(function () { G.i++; basket($("#game")); }, 1700);
      } else { G.miss = true; mark(false); fb(false); oops(opt); }
      return;
    }
    if (opt && type === "phrase" && !opt.disabled) {
      var it = G.cfg.items[G.order[G.i]], p = +opt.getAttribute("data-p");
      speak(it.o[p][1]);
      if (p === G.ans) { if (!G.miss) G.ok++; mark(true); opt.classList.add("right"); burst(opt); $$(".opt").forEach(function (b) { b.disabled = true; }); fb(true, it.o[p][1]); setTimeout(function () { chime(true); }, 600); setTimeout(function () { G.i++; phrase($("#game")); }, 2400); }
      else { G.miss = true; mark(false); setTimeout(function () { fb(false); oops(opt); }, 900); }
      return;
    }
    var sp = t.closest(".spot");
    if (sp && type === "scene" && !sp.disabled) {
      if (+sp.getAttribute("data-j") === G.ans) { if (!G.miss) G.ok++; mark(true); sp.classList.add("found"); burst(sp); $$(".spot").forEach(function (b) { b.disabled = true; }); var ss = G.cfg.after ? fill(G.cfg.after, W(cur.words[G.ans])) : W(cur.words[G.ans]).en + "!"; praise(ss); fb(true, ss); setTimeout(function () { G.i++; scene($("#game")); }, 1900); }
      else { G.miss = true; mark(false); fb(false); oops(sp); }
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

  /* ---------- speech: bé tập thuyết trình ----------
     Mỗi Unit khai báo speech:{t, intro:[en,vi], lines:[[hình, câu (có <b>), nghĩa]], end:[en,vi]}.
     4 bước: Nghe mẫu → Nói theo (máy đọc, dừng chờ bé nói) → Tự nói (ẩn chữ, chỉ còn hình và từ khóa) → Lên sân khấu. */
  var NOTE_C = ["yellow", "blue", "pink", "green", "orange", "lilac"];
  var SP = { run: null, timers: [], st: null, rec: null, chunks: [], url: null, stream: null };
  var canRec = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  function kidName() { try { return (localStorage.getItem("lophoc-kid-name") || "").trim(); } catch (e) { return ""; } }
  function setKidName(v) { try { localStorage.setItem("lophoc-kid-name", v); } catch (e) {} }
  var plain = function (h) { return String(h).replace(/<br>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); };
  /* Một Unit có thể có nhiều bài nói: speech (bài chính) + speeches:[...] (bài thêm).
     Bài thêm có thể tự viết câu chào hello:[en có {name}, vi, gợi ý EN, gợi ý VI] và câu kết bye:[en, vi, gợi ý EN, gợi ý VI];
     mỗi dòng lines có thể thêm gợi ý biểu cảm: [hình, câu, nghĩa, "😄 Big smile!", "Cười thật tươi"].
     Gợi ý EN hiện trên thẻ, gợi ý VI chỉ ở cẩm nang. */
  function spList(u) { return (u.speech ? [u.speech] : []).concat(u.speeches || []); }
  function spCur(u) { var L = spList(u); return L[Math.min(SP.k || 0, L.length - 1)]; }
  function segs(u) {
    var s = spCur(u), nm = kidName(), nmHtml = '<b class="sp-nm">' + (nm ? esc(nm) : "_____") + "</b>";
    var out = [s.hello ? { ic: "👋", html: s.hello[0].replace("{name}", nmHtml), vi: s.hello[1], cue: s.hello[2], wide: true }
      : { ic: "👋", html: "Hi teacher and everyone!<br>My name is " + nmHtml + ".", vi: "Chào cô và các bạn! Tớ tên là …", wide: true }];
    if (s.intro) out.push({ ic: u.ic, html: s.intro[0], vi: s.intro[1], wide: true });
    s.lines.forEach(function (l) { out.push({ ic: l[0], html: l[1], vi: l[2], cue: l[3] }); });
    out.push(s.bye ? { ic: "🙇", html: s.bye[0], vi: s.bye[1], cue: s.bye[2], wide: true }
      : { ic: "🙇", html: s.end[0] + "<br><span class=\"sp-ty\">Thank you for listening!</span>", vi: s.end[1] + " Cảm ơn mọi người đã lắng nghe!", wide: true });
    /* chưa nhập tên thì bỏ câu có chỗ trống khi đọc mẫu */
    out.forEach(function (g) { g.say = plain(g.html).replace(/[^.!?]*_____[^.!?]*[.!?]\s*/g, "").trim(); });
    return out;
  }
  var cueTag = function (c) { return c ? '<span class="sp-cue">' + esc(c) + "</span>" : ""; };
  function speechBlock(u) {
    if (!u.speech) return "";
    var S = segs(u), L = spList(u), s = spCur(u);
    var modes = [["listen", "👂", "1. Listen", "Listen and look"], ["repeat", "🦜", "2. Repeat", "Listen and say it"],
      ["self", "🙈", "3. Say it alone", "Look at the pictures"], ["stage", "🌟", "4. On stage!", "Speak to the class"]];
    return '<div class="block speech" id="speech"><div class="b-head"><h3>4. My Speech' + vi("Bài nói của bé", true) + '</h3><span class="muted">' + esc(s.t) + "</span></div>" +
      (L.length > 1 ? '<div class="sp-pick" role="group" aria-label="Choose a speech">' + L.map(function (x, k) {
        return '<button class="chip" type="button" data-sp="pick" data-k="' + k + '" aria-pressed="' + (x === s) + '">🎤 ' + esc(x.t) + "</button>"; }).join("") + "</div>" : "") +
      '<p class="muted">Speak loud. Look at your friends. Smile! 😊</p>' +
      '<div class="sp-modes">' + modes.map(function (m) { return '<button class="sp-mode ' + m[0] + '" type="button" data-sp="' + m[0] + '" aria-pressed="false"><span class="e" aria-hidden="true">' + m[1] + "</span><b>" + m[2] + "</b><small>" + m[3] + "</small></button>"; }).join("") + "</div>" +
      '<div class="sp-bar"><label>✏️ My name: <input id="spName" type="text" maxlength="24" placeholder="Bin" autocomplete="off" value="' + esc(kidName()) + '"></label>' + speedBar() +
      '<button class="btn" type="button" data-sp="stop" id="spStop" hidden>⏹ Stop</button><span class="sp-status" id="spStatus" aria-live="polite"></span></div>' +
      '<div class="sp-paper" id="spPaper">' + S.map(function (g, k) {
        return '<button class="sp-note c-' + NOTE_C[k % NOTE_C.length] + (g.wide ? " wide" : "") + '" type="button" data-sp-s="' + k + '"><span class="sp-art" aria-hidden="true">' + g.ic + "</span>" +
          '<span class="sp-body"><span class="sp-txt">' + g.html + "</span>" + vi(g.vi) + cueTag(g.cue) + '<span class="sp-turn" aria-hidden="true">🎤 Your turn!<i></i></span></span></button>';
      }).join("") + "</div></div>";
  }
  function later(fn, ms) { SP.timers.push(setTimeout(fn, ms)); }
  function spStatus(t) { var s = $("#spStatus"); if (s) s.textContent = t || ""; }
  function spStop() {
    SP.run = null; SP.timers.forEach(clearTimeout); SP.timers = [];
    if (hasSpeech) speechSynthesis.cancel();
    $$(".sp-note").forEach(function (n) { n.classList.remove("on", "turn"); });
    $$(".sp-mode.listen,.sp-mode.repeat").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    var st = $("#spStop"); if (st) st.hidden = true; spStatus("");
  }
  /* đọc một câu, xong thì gọi then (kể cả khi máy không có giọng đọc) */
  function sayThen(text, rate, then) {
    var token = SP.run, fired = false, go = function () { if (fired || SP.run !== token) return; fired = true; then(); };
    if (!hasSpeech) { later(go, 1200 + text.split(" ").length * 350); return; }
    speak(text, { rate: rate, onend: go });
    later(go, (4000 + text.length * 160) / SPEED); /* phòng khi trình duyệt không báo đọc xong */
  }
  function spRun(repeat) {
    spStop(); var S = segs(cur), notes = $$("#spPaper .sp-note"), i = 0;
    SP.run = {}; $("#spStop").hidden = false;
    $$(".sp-mode." + (repeat ? "repeat" : "listen")).forEach(function (b) { b.setAttribute("aria-pressed", "true"); });
    (function step() {
      notes.forEach(function (n) { n.classList.remove("on", "turn"); });
      if (i >= S.length) { spStop(); if (repeat) { praise("You did it!"); spStatus("🎉 Great job!"); } return; }
      var n = notes[i], g = S[i]; n.classList.add("on"); n.scrollIntoView({ block: "nearest", behavior: "smooth" });
      spStatus("👂 " + (i + 1) + "/" + S.length);
      sayThen(g.say, repeat ? 0.72 : 0.8, function () {
        if (!repeat) { i++; later(step, 450); return; }
        var wait = Math.max(2600, g.say.split(" ").length * 700 + 1400) / SPEED;
        n.style.setProperty("--wait", wait + "ms"); n.classList.add("turn"); spStatus("🎤 Your turn!");
        later(function () { i++; step(); }, wait);
      });
    })();
  }
  function spSelf(btn) {
    spStop(); var p = $("#spPaper"), on = !p.classList.contains("hide-text");
    p.classList.toggle("hide-text", on); btn.setAttribute("aria-pressed", on ? "true" : "false");
    spStatus(on ? "🙈 Look at the pictures and say it!" : "");
    if (on) speak("Now you try! Look at the pictures.");
  }
  /* ---- sân khấu ---- */
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
    var em = ["🎉", "⭐", "🎊", "✨", "🌟", "💖", "🎈"], box = document.createElement("div"); box.className = "sp-confetti";
    for (var k = 0; k < 36; k++) box.innerHTML += '<span style="left:' + (Math.random() * 100) + "%;animation-delay:" + (Math.random() * 0.8).toFixed(2) + "s;animation-duration:" + (2 + Math.random() * 1.6).toFixed(2) + 's">' + em[k % em.length] + "</span>";
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 4600);
  }
  function recStart(cb) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      SP.stream = stream; SP.chunks = [];
      var r = SP.rec = new MediaRecorder(stream);
      r.ondataavailable = function (e) { if (e.data && e.data.size) SP.chunks.push(e.data); };
      r.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        if (SP.url) URL.revokeObjectURL(SP.url);
        SP.url = URL.createObjectURL(new Blob(SP.chunks, { type: r.mimeType || "audio/webm" }));
        var b = $("#spPlay"); if (b) b.hidden = false;
      };
      r.start(); cb(true);
    }).catch(function () { cb(false); });
  }
  function recStop() { if (SP.rec && SP.rec.state !== "inactive") SP.rec.stop(); SP.rec = null; }
  function stageOpen() {
    spStop(); closeStage();
    SP.st = { S: segs(cur), i: -1, text: true, rec: false };
    var o = document.createElement("div"); o.className = "sp-stage"; o.id = "spStage";
    o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "On stage");
    o.innerHTML = '<div class="sp-curtain l" aria-hidden="true"></div><div class="sp-curtain r" aria-hidden="true"></div>' +
      '<div class="sp-top"><button class="sp-btn sm" type="button" data-sp="st-close">✕ Exit</button><div class="sp-dots" id="spDots"></div><span class="sp-rec-on" id="spRecOn" hidden>● REC</span></div>' +
      '<div class="sp-card" id="spCard"></div><div class="sp-ctl" id="spCtl"></div>';
    document.body.appendChild(o); document.documentElement.classList.add("sp-lock");
    stageReady();
  }
  function stageReady() {
    var c = $("#spCard"); c.className = "sp-card c-yellow enter";
    c.innerHTML = '<span class="sp-big" aria-hidden="true">🎤</span><p class="sp-line">Ready? Let\'s go!</p><p class="sp-sub">Stand tall. Look at your friends. Speak loud!</p>' +
      (canRec ? '<label class="sp-check"><input type="checkbox" id="spRecBox"> 🎙️ Record my voice</label>' : "");
    $("#spDots").innerHTML = ""; $("#spCtl").innerHTML = '<button class="sp-btn go" type="button" data-sp="st-start">Start ▶</button>';
    speak("Ready? Let's go!");
  }
  function stageStart() {
    var go = function () { SP.st.i = 0; stageShow(); };
    var box = $("#spRecBox");
    if (box && box.checked) recStart(function (ok) { SP.st.rec = ok; $("#spRecOn").hidden = !ok; go(); });
    else go();
  }
  function stageShow() {
    var st = SP.st, g = st.S[st.i], c = $("#spCard");
    if (hasSpeech) speechSynthesis.cancel();
    c.className = "sp-card c-" + NOTE_C[st.i % NOTE_C.length]; void c.offsetWidth; c.classList.add("enter");
    c.innerHTML = '<span class="sp-big" aria-hidden="true">' + g.ic + '</span><p class="sp-line' + (st.text ? "" : " hid") + '">' + g.html + "</p>" + cueTag(g.cue);
    $("#spDots").innerHTML = st.S.map(function (_, k) { return '<i class="' + (k < st.i ? "ok" : k === st.i ? "now" : "") + '"></i>'; }).join("");
    $("#spCtl").innerHTML = '<button class="sp-btn" type="button" data-sp="st-prev"' + (st.i ? "" : " disabled") + ' aria-label="Back">◀</button>' +
      '<button class="sp-btn" type="button" data-sp="st-hint">🔊 Help</button>' +
      '<button class="sp-btn" type="button" data-sp="st-text">' + (st.text ? "🙈 Hide words" : "👀 Show words") + "</button>" +
      '<button class="sp-btn go" type="button" data-sp="st-next">' + (st.i === st.S.length - 1 ? "Finish! 🎉" : "Next ▶") + "</button>";
    chime(true);
  }
  function stageEnd() {
    var st = SP.st; recStop(); $("#spRecOn").hidden = true;
    $("#spDots").innerHTML = st.S.map(function () { return '<i class="ok"></i>'; }).join("");
    var c = $("#spCard"); c.className = "sp-card c-pink enter";
    c.innerHTML = '<span class="sp-big" aria-hidden="true">🏆</span><p class="sp-line">Wonderful speech!</p><p class="sp-sub">Everyone, clap your hands! 👏👏👏</p><div class="sp-stars" aria-hidden="true">⭐⭐⭐</div>';
    /* nút nghe lại hiện ra khi bản thu đã lưu xong (recorder.onstop) */
    $("#spCtl").innerHTML = (st.rec ? '<button class="sp-btn go" type="button" data-sp="st-play" id="spPlay" hidden>▶ Hear my voice</button>' : "") +
      '<button class="sp-btn" type="button" data-sp="st-again">↺ Again</button><button class="sp-btn" type="button" data-sp="st-close">✕ Close</button>';
    applause(); confetti(); setTimeout(function () { speak("Wonderful! Great job!"); }, 900);
  }
  function closeStage() {
    recStop(); if (SP.stream) { SP.stream.getTracks().forEach(function (t) { t.stop(); }); SP.stream = null; }
    var o = $("#spStage"); if (o) o.remove(); document.documentElement.classList.remove("sp-lock");
    if (SP.st) { SP.st = null; if (hasSpeech) speechSynthesis.cancel(); }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sp]"), note = e.target.closest(".sp-note");
    if (note && !b) {
      spStop(); var g = segs(cur)[+note.getAttribute("data-sp-s")];
      $$(".sp-note").forEach(function (n) { n.classList.remove("on", "peek"); }); note.classList.add("on", "peek");
      speak(g.say, { onend: function () { note.classList.remove("on"); setTimeout(function () { note.classList.remove("peek"); }, 1500); } });
      return;
    }
    if (!b) return;
    var a = b.getAttribute("data-sp"), st = SP.st;
    if (a === "jump") { var sp = $("#speech"); if (sp) sp.scrollIntoView({ behavior: "smooth" }); }
    if (a === "pick" && cur) {
      spStop(); SP.k = +b.getAttribute("data-k");
      var old = $("#speech"); if (old) { old.outerHTML = speechBlock(cur); $("#speech").scrollIntoView({ block: "nearest" }); }
      return;
    }
    if (a === "listen") spRun(false);
    if (a === "repeat") spRun(true);
    if (a === "stop") spStop();
    if (a === "self") spSelf(b);
    if (a === "stage") stageOpen();
    if (a === "st-close") closeStage();
    if (a === "st-start") stageStart();
    if (a === "st-again") { closeStage(); stageOpen(); }
    if (a === "st-play" && SP.url) { try { new Audio(SP.url).play(); } catch (err) {} }
    if (!st || st.i < 0) return;
    if (a === "st-next") { if (st.i >= st.S.length - 1) stageEnd(); else { st.i++; stageShow(); } }
    if (a === "st-prev" && st.i > 0) { st.i--; stageShow(); }
    if (a === "st-hint") speak(st.S[st.i].say, { rate: 0.75 });
    if (a === "st-text") { st.text = !st.text; $(".sp-line").classList.toggle("hid", !st.text); b.textContent = st.text ? "🙈 Hide words" : "👀 Show words"; }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id !== "spName") return;
    var v = e.target.value.trim(); setKidName(v);
    $$(".sp-nm").forEach(function (n) { n.textContent = v || "_____"; });
  });
  document.addEventListener("keydown", function (e) {
    if (!SP.st) return;
    if (e.key === "Escape") closeStage();
    if ((e.key === "ArrowRight" || e.key === " ") && SP.st.i >= 0 && !e.target.closest("button,input")) { e.preventDefault(); var n = $('[data-sp="st-next"]'); if (n) n.click(); }
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
          '<div><h4>🏠 Kịch bản 2 phút ở nhà</h4><ul>' + g.home.map(function (x) { return "<li>" + x + "</li>"; }).join("") +
            (u.speech ? "<li>🎤 Mỗi tối bé nói bài <i>" + esc(u.speech.t) + "</i> (mục 4 của bài) cho cả nhà nghe. Ba mẹ làm khán giả, vỗ tay thật to sau mỗi lần nói.</li>" : "") + "</ul></div>" +
          (u.hw ? '<div><h4>🏠 Bài tập về nhà: 4 kỹ thuật</h4>' + hwItems(u) + '<p class="muted"><a href="#lo-trinh">Cách làm từng kỹ thuật: xem Lộ trình</a></p></div>' : "") +
          '<div><h4>🗣️ Mẹo phát âm</h4><ul>' + g.tips.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div></div>" +
          meaningBox(u) + "</div>";
      }).join("");
  }
  /* Trong bài học chỉ có tiếng Anh, nên nghĩa tiếng Việt của từ, câu và bài nói được gom vào cẩm nang cho ba mẹ. */
  function meaningBox(u) {
    var h = '<details class="gmean"><summary>📖 Nghĩa tiếng Việt của từ, câu và bài nói</summary>' +
      '<h4>Từ mới</h4><p class="gwords">' + u.words.map(function (w) { return "<span><b>" + esc(w[1]) + "</b> " + esc(w[2]) + "</span>"; }).join("") + "</p>" +
      "<h4>Nói theo nào</h4><ul>" + u.talk.map(function (t) { return "<li><i>" + esc(t[0]) + "</i> → " + esc(t[1]) + "</li>"; }).join("") + "</ul>";
    if (u.song) h += "<h4>🎵 Bài hát: " + esc(u.song.t) + "</h4><ul>" + u.song.verses.map(function (v) {
      return "<li><i>" + v.lines.map(plain).join(" / ") + "</i> → " + esc(v.vi || "") + (v.cue ? ' <span class="gact">(' + esc(v.cue[0]) + " → " + esc(v.cue[1]) + ")</span>" : "") + "</li>"; }).join("") + "</ul>";
    var act = function (en, vi) { return vi ? ' <span class="gact">(' + esc(en || "") + " → " + esc(vi) + ")</span>" : ""; };
    spList(u).forEach(function (s) {
      h += "<h4>🎤 Bài nói: " + esc(s.t) + "</h4><ul>" +
        (s.hello ? "<li><i>" + plain(s.hello[0].replace("{name}", "…")) + "</i> → " + esc(s.hello[1]) + act(s.hello[2], s.hello[3]) + "</li>"
          : "<li><i>Hi teacher and everyone! My name is …</i> → Chào cô và các bạn! Tớ tên là …</li>") +
        (s.intro ? "<li><i>" + plain(s.intro[0]) + "</i> → " + esc(s.intro[1]) + "</li>" : "") +
        s.lines.map(function (l) { return "<li><i>" + plain(l[1]) + "</i> → " + esc(l[2]) + act(l[3], l[4]) + "</li>"; }).join("") +
        (s.bye ? "<li><i>" + plain(s.bye[0]) + "</i> → " + esc(s.bye[1]) + act(s.bye[2], s.bye[3]) + "</li>"
          : "<li><i>" + plain(s.end[0]) + " Thank you for listening!</i> → " + esc(s.end[1]) + " Cảm ơn mọi người đã lắng nghe!</li>") + "</ul>";
    });
    return h + "</details>";
  }

  /* ---------- router ---------- */
  function route() {
    var id = location.hash.slice(1) || "lo-trinh", view = $("#view");
    if (id.indexOf("g-") === 0) { var el = document.getElementById(id); if (el) { el.scrollIntoView(); return; } id = "answers"; }
    var u = unitById(id);
    $$("#units a[data-v]").forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-v") === (u ? u.id : id) ? "page" : "false"); });
    spStop(); closeStage();
    document.body.classList.toggle("in-unit", !!u); /* bài học chỉ tiếng Anh: ẩn phần giới thiệu tiếng Việt ở đầu trang */
    if (u) { if (cur !== u) SP.k = 0; cur = u; view.innerHTML = unitView(u); startGame(0); }
    else if (id === "answers") { cur = null; G = null; view.innerHTML = guideView(); if (window.LopHocPIN) LopHocPIN.guard($("#answerBox"), guideBody); else guideBody($("#answerBox")); }
    else { cur = null; G = null; view.innerHTML = roadmap(); }
    var nav = $(".nav"); if (nav && nav.getBoundingClientRect().top <= 0) view.scrollIntoView();
  }
  window.addEventListener("hashchange", route);
  route();
  if (window.LopHocPIN) LopHocPIN.onChange(function (u) { $$(".ans-link").forEach(function (a) { a.textContent = (u ? "🔓" : "🔒") + " Cẩm nang"; }); });
})();

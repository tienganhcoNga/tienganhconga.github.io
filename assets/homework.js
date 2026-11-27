/* Bài tập về nhà theo Unit, gắn ở cuối mỗi bài "Ôn tập nói" (hiện dùng cho Lớp 1).
   Nạp file này TRƯỚC assets/speaking.js. Trang nào có SPEAK.homework thì speaking.js gọi
   window.SpeakHomework(kit) và vẽ khối 🏠 Homework ở cuối bài ôn, mỗi tab là một Unit mới của bài ôn đó.
   Đường dẫn: #hw = bảng 16 Unit, #hw-g5 = mở bài ôn có Unit 5 và cuộn xuống bài tập Unit 5.

   Các dạng bài TỰ SINH từ kho từ của Unit (units.gN.w = [hình, từ, nghĩa, câu ví dụ có <b>từ</b>, nghĩa câu]):
     👂 Listen and choose · 👀 Look and choose · ✅ Yes or no · 🔗 Match · 🔤 Missing letter · 🔀 Spell it
     ⌨️ Write the word · ✏️ Fill the gap · 🧩 Make a sentence · 🎴 Memory · 🎤 Say it · 🖨️ Worksheet (phiếu in)
   Thêm từ vào kho từ của Unit là bài tập tự có thêm câu, không cần sửa ở đây.

   Dữ liệu ghi tay (SPEAK.homework):
     talk:  { gN: [ [bé nói, ba mẹ mở rộng], [việc ba mẹ làm (tiếng Việt), ba mẹ nói hoặc "", bé nói],
                    [câu hỏi lựa chọn, bé đáp], [hỏi khi đọc tranh, bé đáp], "từ dùng thêm ở nhà (tiếng Việt)" ] }
            → dạng 💬 Talk at home
     extra: { gN: [ { id, ic, t, vi, kind, items } ] }  bài riêng của Unit (Toán, Khoa học…):
            kind mặc định (chọn đáp án): item { pic | txt | s:[dãy, null = ô trống], q, o:[…], a, say }
            kind "write": item { txt, a }               (nhìn số, gõ chữ)
            kind "speak": item { pic, lines:[câu…] }    (nghe rồi nói cả đoạn)
     key:"…"          chỗ lưu sao trên máy (mỗi trang một key)
     young:true       chế độ Mầm non: phiếu in cho bé chưa biết viết (tô chữ, nghe rồi khoanh hình, khoanh chữ, nối, vẽ và nói)
     types:[…]        chỉ dùng các dạng này (Mầm non: listen, look, yesno, match, memory, say, talk)
     talk có thể ghi dạng { e, s, c, b, x } giống dòng hw: của trang Giai đoạn Mầm non
     sentences(g)     hàm trả về [[câu tiếng Anh, nghĩa]] của Unit: tự tìm từ của Unit trong câu làm chỗ trống (Fill the gap), câu ngắn dùng cho Make a sentence
     qa(g)            hàm trả về [[câu hỏi, trả lời, nghĩa hỏi, nghĩa đáp]] → dạng 🙋 Ask and answer
     showVi:true      hiện luôn nghĩa tiếng Việt (Lớp 4 không có nút Song ngữ); maxWords: số từ tối đa của câu xếp; note: lời dặn đầu khối
   Bài của bé chỉ có tiếng Anh; tiếng Việt nằm trong <span class="vi-t"> (nút 🇻🇳 Song ngữ).
   Số sao mỗi bài lưu trên máy (localStorage "lophoc.hw.l1"). */
(function () {
  "use strict";
  window.SpeakHomework = function (K) {
    var D = K.D, HD = D.homework || {}, esc = K.esc, plain = K.plain, fill = K.fill, vi = K.vi, icon = K.icon, shuffle = K.shuffle;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var speak = function (t, o) { K.speak(t, o || { rate: 0.8 }); };
    var KEY = HD.key || "lophoc.hw.l1", N = 8, YOUNG = !!HD.young, ONLY = HD.types || null, MAXTOK = HD.maxWords || 7;
    /* talk dạng {e,s,c,b,x} (giống hw: của trang Giai đoạn Mầm non) → dạng mảng */
    var TALK = {};
    Object.keys(HD.talk || {}).forEach(function (g) {
      var t = HD.talk[g];
      TALK[g] = Array.isArray(t) ? t : [t.e, [t.s[0], t.s.length > 2 ? t.s[1] : "", t.s[t.s.length - 1]], t.c, t.b, t.x];
    });
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var sel = {}, G = null;

    /* ---------- CSS riêng ---------- */
    var css = "" +
      ".hw{scroll-margin-top:70px}.hw:not(.kstep){border:3px solid var(--accent)}" +
      ".hw .b-head .btn{margin-left:auto}" +
      ".hw-units{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}" +
      ".hw-ut{font:inherit;font-weight:800;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:16px;padding:8px 14px;cursor:pointer;display:flex;align-items:center;gap:8px;text-align:left;line-height:1.2}" +
      ".hw-ut .e{font-size:1.6rem}.hw-ut small{display:block;font-weight:600;color:var(--muted);font-size:.8rem}" +
      ".hw-ut[aria-selected=true]{border-color:var(--accent);background:var(--accent-soft)}" +
      ".hw-pg{font-size:.78rem;font-weight:800;color:var(--accent);margin-top:2px;display:block}" +
      ".hw-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px}" +
      ".hw-tile{font:inherit;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:16px;padding:10px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;line-height:1.2;min-height:112px;justify-content:center}" +
      ".hw-tile .e{font-size:2rem;line-height:1}.hw-tile b{font-size:.95rem}.hw-tile .st{font-size:.85rem;letter-spacing:1px;color:var(--muted)}" +
      ".hw-tile.x{border-style:dashed}.hw-tile.pr{background:var(--accent-soft)}" +
      ".hw-tile:hover{border-color:var(--accent)}.hw-tile[aria-pressed=true]{border-color:var(--accent);box-shadow:0 4px 0 var(--accent)}" +
      ".hw-tile.done{border-color:var(--ok)}" +
      ".hw-tile .vi-t{font-size:.75rem;color:var(--muted)}" +
      ".hw-box{margin-top:14px;scroll-margin-top:70px}" +
      ".hw-gh{display:flex;align-items:center;gap:10px;margin-bottom:6px}.hw-gh h4{margin:0;font-family:var(--f-display);font-size:1.2rem;flex:1}" +
      ".hw-gh .btn{padding:4px 12px}" +
      ".hw-how{font-size:.95rem;color:var(--muted);margin:0 0 8px;text-align:center}" +
      ".hw-word{font-family:var(--f-display);font-weight:800;font-size:clamp(1.8rem,6vw,2.6rem);letter-spacing:.06em;color:var(--accent);margin:0}" +
      ".hw-word .gp{display:inline-block;min-width:.8em;border-bottom:4px dashed var(--pink,#d81b60);color:var(--pink,#d81b60)}" +
      ".hw-slots{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}" +
      ".hw-slots span{width:44px;height:52px;border-radius:10px;border:2px dashed var(--accent);display:grid;place-items:center;font-family:var(--f-display);font-weight:800;font-size:1.6rem;background:var(--surface)}" +
      ".hw-slots span.f{border-style:solid;color:var(--ok);border-color:var(--ok)}" +
      ".hw-tl{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}" +
      ".hw-tl button{min-width:52px;min-height:52px;border-radius:14px;border:3px solid var(--line);background:var(--surface);font:inherit;font-weight:800;font-size:1.4rem;cursor:pointer;color:var(--ink);padding:4px 12px}" +
      ".hw-tl button:hover:not(:disabled){border-color:var(--accent)}.hw-tl button:disabled{opacity:.25;cursor:default}" +
      ".hw-tl.wd button{font-size:1.1rem}" +
      ".hw-sent{min-height:58px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;border-bottom:3px dashed var(--accent);padding:6px;font-family:var(--f-display);font-weight:700;font-size:1.35rem}" +
      ".hw-sent.ok{border-color:var(--ok);color:var(--ok)}" +
      ".hw-yn{display:flex;gap:14px;justify-content:center}.hw-yn .sk-opt{min-width:130px;font-size:1.4rem}" +
      ".hw-mt{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;max-width:520px;margin:0 auto}" +
      ".hw-mt .col{display:flex;flex-direction:column;gap:10px}" +
      ".hw-mt button{min-height:64px;border:3px solid var(--line);background:var(--surface);border-radius:16px;font:inherit;font-weight:800;font-size:1.15rem;color:var(--ink);cursor:pointer;padding:6px}" +
      ".hw-mt .p{font-size:2.4rem}.hw-mt button.sel{border-color:var(--accent);background:var(--accent-soft)}" +
      ".hw-mt button.ok{border-color:var(--ok);background:var(--ok-soft);opacity:.7;cursor:default}" +
      ".hw-mt button.bad{animation:skShake .3s;border-color:var(--bad)}" +
      ".hw-wr{display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap}" +
      ".hw-wr input{font:inherit;font-family:var(--f-display);font-weight:800;font-size:1.8rem;text-align:center;width:min(280px,80vw);border:none;border-bottom:3px dashed var(--accent);background:transparent;color:var(--ink);padding:4px}" +
      ".hw-wr input:focus{outline:none;border-bottom-style:solid}.hw-wr.ok input{color:var(--ok);border-color:var(--ok)}.hw-wr.bad input{border-color:var(--bad);animation:skShake .3s}" +
      ".hw-seq{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;font-family:var(--f-display);font-size:2rem;font-weight:800}" +
      ".hw-seq span{min-width:52px;text-align:center;border-radius:12px;background:var(--surface);padding:0 8px}.hw-seq span.gp{background:var(--gold-soft,#faefd3);color:var(--gold,#b98110)}" +
      ".hw-pic{font-size:2.6rem;line-height:1.25;text-align:center;letter-spacing:2px;max-width:420px}" +
      ".hw-txt{font-family:var(--f-display);font-weight:800;font-size:3rem;color:var(--accent);line-height:1}" +
      ".hw-q{font-weight:700;font-size:1.1rem;text-align:center}" +
      ".hw-talk{display:grid;gap:12px}" +
      ".hw-tc{background:var(--surface);border-radius:16px;padding:12px 14px;border:1px solid var(--line)}" +
      ".hw-tc h5{margin:0 0 8px;font-size:1rem;font-family:var(--f-display);color:var(--accent)}" +
      ".hw-ln{display:flex;align-items:center;gap:10px;margin-top:6px}" +
      ".hw-ln .who{flex:none;font-size:1.6rem}.hw-ln .t{flex:1;font-weight:700;font-size:1.1rem}" +
      ".hw-ln.k .t.hid{color:transparent;background:repeating-linear-gradient(90deg,var(--accent-soft) 0 10px,transparent 10px 14px);border-radius:8px;user-select:none}" +
      "html.bi .hw-ln .t.hid .vi-t,.hw-vi .hw-ln .t.hid .vi-t{visibility:hidden}" +
      ".hw-hint{margin:0;color:var(--muted);font-style:italic;text-align:center}" +
      ".hw-vi .vi-t{display:block;font-size:.8em;font-weight:500;font-style:italic;color:var(--muted);margin-top:2px}.hw-vi .vi-t.in{display:inline;margin:0 0 0 .4em}" +
      ".hw-sp{flex:none;width:40px;height:40px;border-radius:50%;border:2px solid var(--line);background:var(--surface);cursor:pointer;font-size:1.05rem}" +
      ".hw-sp:hover{border-color:var(--accent)}" +
      ".hw-tc .note{font-size:.9rem;color:var(--muted);margin:0 0 4px}" +
      ".hw-hub{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}" +
      ".hw-hub a{display:flex;flex-direction:column;gap:4px;text-decoration:none;color:var(--ink);border:2px solid var(--line);background:var(--surface);border-radius:18px;padding:14px;font-weight:800;line-height:1.2}" +
      ".hw-hub a:hover{border-color:var(--accent)}.hw-hub .e{font-size:2.2rem}.hw-hub small{color:var(--muted);font-weight:600}" +
      ".hw-hub .hw-pg{margin-top:auto}" +
      ".hw-guide{font-size:.95rem}" +
      "#hwPrint{display:none}" +
      "@media (max-width:560px){.hw-tiles{grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}.hw-tile{min-height:100px}.hw-slots span{width:36px;height:46px;font-size:1.3rem}.hw-tl button{min-width:44px;min-height:46px}.hw-mt .p{font-size:2rem}}" +
      "@media print{html.hw-printing body>*:not(#hwPrint){display:none!important}html.hw-printing #hwPrint{display:block!important}}" +
      "#hwPrint{font-family:var(--f-body,system-ui);color:#000;background:#fff;font-size:13pt;line-height:1.5}" +
      "#hwPrint h1{font-family:var(--f-display,inherit);font-size:22pt;margin:0 0 4px}" +
      "#hwPrint h2{font-size:14pt;margin:16px 0 8px;break-after:avoid}" +
      "#hwPrint .nm{display:flex;gap:24px;margin:6px 0 10px;font-weight:700}#hwPrint .nm span{flex:1;border-bottom:1.5px solid #000}" +
      "#hwPrint .g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 18px}" +
      "#hwPrint .c{border:1.5px solid #999;border-radius:10px;padding:8px;text-align:center;break-inside:avoid}" +
      "#hwPrint .c .p{font-size:28pt;line-height:1.2}#hwPrint .ln{display:block;border-bottom:1.5px solid #000;height:26px;margin-top:4px}" +
      "#hwPrint .bx{letter-spacing:6px;font-size:16pt;font-weight:700}" +
      "#hwPrint .mt{display:grid;grid-template-columns:1fr 120px 1fr;align-items:center;row-gap:12px}#hwPrint .mt .p{font-size:26pt}#hwPrint .mt .w{font-size:15pt;font-weight:700}" +
      "#hwPrint .dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#000;vertical-align:middle;margin:0 8px}" +
      "#hwPrint ol{margin:0;padding-left:1.4em}#hwPrint ol li{margin-bottom:10px;break-inside:avoid}" +
      "#hwPrint .wb{border:1.5px solid #000;border-radius:10px;padding:6px 10px;margin-bottom:8px;font-weight:700}" +
      "#hwPrint .ans{break-before:page;font-size:11pt}#hwPrint .ans ol{columns:2}" +
      "#hwPrint .tw{font-family:var(--f-display,inherit);font-size:24pt;font-weight:800;letter-spacing:3px;color:#fff;-webkit-text-stroke:1.2px #888;line-height:1.3}" +
      "#hwPrint li.row{display:flex;gap:28px;align-items:center;margin-bottom:12px}#hwPrint li.row .p{font-size:30pt;border:1.5px solid #bbb;border-radius:12px;padding:2px 12px}" +
      "#hwPrint .g2{display:grid;grid-template-columns:1fr 1fr;gap:18px}#hwPrint .dr .box{height:150px;border:1.5px dashed #999;border-radius:10px;margin:6px 0}" +
      "#hwPrint small{font-weight:400;font-size:10pt;color:#555}" +
      "#hwPrint .sw{display:inline-block;width:1.1em;height:1.1em;border-radius:4px;border:1px solid #000;vertical-align:middle}";
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

    /* ---------- dữ liệu của Unit ---------- */
    var unitIds = Object.keys(D.units);
    function words(g) {
      var seen = {}, out = [];
      (D.units[g] ? D.units[g].w : []).forEach(function (w) { if (!seen[w[1]]) { seen[w[1]] = 1; out.push({ ic: w[0], w: w[1], vi: w[2] || "", ex: w[3] || "", exVi: w[4] || "" }); } });
      return out;
    }
    var isSpell = function (x) { return /^[a-z]{3,9}$/i.test(x.w); };
    function gapOK(x) { var m = /<b>([\s\S]*?)<\/b>/.exec(x.ex || ""); return !!m && plain(m[1]).toLowerCase() === x.w.toLowerCase(); }
    function tokens(x) { return plain(fill(x.ex)).split(" ").filter(Boolean); }
    function orderOK(x) { if (!x.ex) return false; var n = tokens(x).length; return n >= 3 && n <= MAXTOK; }
    /* Câu thêm của Unit (HD.sentences(g) → [[câu tiếng Anh, nghĩa]], vd. mẫu câu và hội thoại lớp 4):
       tự tìm một từ của Unit trong câu để làm chỗ trống (Fill the gap); câu 3–MAXTOK từ dùng cho Make a sentence. */
    var SCACHE = {};
    function extra(g) {
      if (SCACHE[g]) return SCACHE[g];
      var out = [], W = words(g).filter(function (x) { return x.w.length >= 3; }).sort(function (a, b) { return b.w.length - a.w.length; });
      var list = HD.sentences ? (HD.sentences(g) || []) : [], seen = {};
      list.forEach(function (pv) {
        var en = String(pv[0]).replace(/\s+/g, " ").trim(), v = pv[1] || "";
        if (!en || seen[en] || !/[a-z]/i.test(en)) return; seen[en] = 1;
        var hit = null;
        for (var i = 0; i < W.length && !hit; i++) {
          var re = new RegExp("(^|[^A-Za-z'])(" + W[i].w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![A-Za-z'])", "i"), m = re.exec(en);
          if (m) hit = { x: W[i], at: m.index + m[1].length, len: m[2].length };
        }
        var ex = hit ? esc(en.slice(0, hit.at)) + "<b>" + esc(en.substr(hit.at, hit.len)) + "</b>" + esc(en.slice(hit.at + hit.len)) : esc(en);
        out.push({ ic: hit ? hit.x.ic : (D.units[g] || {}).ic || "💬", w: hit ? en.substr(hit.at, hit.len) : "", ex: ex, exVi: v, gapOnly: !!hit, sent: true });
      });
      return (SCACHE[g] = out);
    }
    function gapPool(g) { return words(g).filter(gapOK).concat(extra(g).filter(function (x) { return x.w && x.exVi && gapOK(x); })); }
    function orderPool(g) { return words(g).filter(orderOK).concat(extra(g).filter(orderOK)); }
    /* Hỏi – đáp (HD.qa(g) → [[câu hỏi, câu trả lời, nghĩa hỏi, nghĩa đáp]]) */
    function qaPool(g) { return HD.qa ? (HD.qa(g) || []) : []; }
    function uniqPics(P) { var s = {}; return P.filter(function (x) { if (s[x.ic]) return false; s[x.ic] = 1; return true; }); }
    function reviewOf(g) { return D.reviews.filter(function (r) { return (r.fresh || []).indexOf(g) >= 0; })[0] || D.reviews.filter(function (r) { return r.units.indexOf(g) >= 0; })[0]; }

    var BASE = [
      ["listen", "👂", "Listen and choose", "Nghe rồi chọn hình đúng", "Listen. Tap the right picture.", "Nghe từ, bấm vào hình đúng."],
      ["look", "👀", "Look and choose", "Nhìn hình, chọn từ đúng", "Look at the picture. Tap the right word.", "Nhìn hình, bấm vào từ đúng."],
      ["yesno", "✅", "Yes or no?", "Hình và chữ có khớp không?", "Look and read. Is it right?", "Nhìn hình, đọc chữ. Đúng thì bấm Yes, sai thì bấm No."],
      ["match", "🔗", "Match", "Nối hình với chữ", "Tap a picture, then tap its word.", "Bấm một hình rồi bấm chữ đi cùng hình đó."],
      ["letter", "🔤", "Missing letter", "Điền chữ cái còn thiếu", "Which letter is missing?", "Chữ cái nào còn thiếu?"],
      ["spell", "🔀", "Spell it", "Xếp chữ cái thành từ", "Listen. Tap the letters in order.", "Nghe từ, bấm các chữ cái theo đúng thứ tự."],
      ["write", "⌨️", "Write the word", "Nhìn hình, gõ từ", "Look, listen and write the word.", "Nhìn hình, nghe rồi gõ từ. Bấm 💡 nếu cần gợi ý."],
      ["gap", "✏️", "Fill the gap", "Chọn từ điền vào câu", "Read. Choose the missing word.", "Đọc câu, chọn từ còn thiếu."],
      ["order", "🧩", "Make a sentence", "Xếp từ thành câu", "Tap the words in order to make a sentence.", "Bấm các từ theo đúng thứ tự để thành câu."],
      ["memory", "🎴", "Memory", "Lật thẻ tìm cặp hình – chữ", "Find the pairs: a picture and its word.", "Lật thẻ, tìm cặp hình và chữ giống nhau."],
      ["say", "🎤", "Say it!", "Nhìn hình, nói từ", "Look at the picture and say the word.", "Nhìn hình rồi nói to từ tiếng Anh."],
      ["talk", "💬", "Talk at home", "Nói cùng ba mẹ", "Talk with Mom or Dad. Say your part!", "Ba mẹ đọc câu của ba mẹ, con nói câu của con. Câu của con được che, bấm 👀 để xem."],
      ["qa", "🙋", "Ask and answer", "Hỏi – đáp", "Read the question. Say the answer, then tap 👀 to check.", "Ba mẹ (hoặc bạn) đọc câu hỏi, con trả lời; câu trả lời được che, bấm 👀 để xem lại."]
    ];
    function typesFor(g) {
      var P = words(g), S = P.filter(isSpell), out = [];
      var ok = { listen: uniqPics(P).length >= 4, look: P.length >= 4, yesno: P.length >= 3, match: uniqPics(P).length >= 4, letter: S.length >= 3, spell: S.length >= 3,
        write: S.length >= 3, gap: gapPool(g).length >= 3, order: orderPool(g).length >= 3, memory: uniqPics(P).length >= 4, say: P.length >= 3, talk: !!TALK[g], qa: qaPool(g).length >= 2 };
      BASE.forEach(function (b) { if (ok[b[0]] && (!ONLY || ONLY.indexOf(b[0]) >= 0)) out.push({ id: b[0], ic: b[1], t: b[2], vi: b[3], how: b[4], howVi: b[5] }); });
      ((HD.extra || {})[g] || []).forEach(function (x, k) { out.push({ id: "x" + k, ic: x.ic || "⭐", t: x.t, vi: x.vi || "", how: x.how || "", howVi: x.howVi || "", x: x, extra: true }); });
      return out;
    }

    /* ---------- tiến độ (số sao) ---------- */
    function prog() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
    function saveStars(g, t, n) { var p = prog(); p[g] = p[g] || {}; if ((p[g][t] || 0) < n) { p[g][t] = n; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} } }
    function doneCount(g) { var p = prog()[g] || {}, T = typesFor(g); return { d: T.filter(function (t) { return p[t.id]; }).length, n: T.length }; }
    function pgText(g) { var c = doneCount(g); return (c.d >= c.n ? "🏆 " : "⭐ ") + c.d + "/" + c.n; }
    function starsOf(g, t) { var n = (prog()[g] || {})[t] || 0; return n ? new Array(n + 1).join("⭐") + new Array(4 - n).join("☆") : "☆☆☆"; }

    /* ---------- khối Homework ở cuối bài ôn ---------- */
    function block(r) {
      var us = (r.fresh && r.fresh.length ? r.fresh : r.units).filter(function (g) { return D.units[g]; });
      if (!us.length) return "";
      var g = sel[r.id] && us.indexOf(sel[r.id]) >= 0 ? sel[r.id] : us[0]; sel[r.id] = g;
      var p = parts(r); if (!p) return "";
      return '<div class="block ' + p.cls + '" id="homework"><div class="b-head"><h3>🏠 Homework' + vi("Bài tập về nhà", true) + "</h3>" +
        '<span class="muted">Choose your unit and play!</span>' + p.extra + "</div>" + p.body + "</div>";
    }
    /* phần thân của khối Homework, để trang bài ôn đặt vào khung bước 🏠 Home (assets/steps.js) */
    function parts(r) {
      var us = (r.fresh && r.fresh.length ? r.fresh : r.units).filter(function (g) { return D.units[g]; });
      if (!us.length) return null;
      var g = sel[r.id] && us.indexOf(sel[r.id]) >= 0 ? sel[r.id] : us[0]; sel[r.id] = g;
      return { cls: "hw" + (HD.showVi ? " hw-vi" : ""), id: "homework", extra: '<a class="btn" href="#hw">📚 All units</a>', body:
        '<p class="vi-t hw-guide" lang="vi">' + esc(HD.note || "Ba mẹ chọn Unit con vừa học trên lớp. Mỗi ngày làm 2–3 bài (10–15 phút), ngồi cùng con, bấm 🔊 để nghe mẫu. Làm sai cứ cho con chọn lại; mỗi bài có sao để con thi đua. Bài 💬 Talk at home là phần nói chuyện thật với con, nên làm mỗi ngày. Bấm 🖨️ Worksheet để in phiếu cho con làm bằng bút chì.") + "</p>" +
        '<div class="hw-units" role="tablist" aria-label="Units">' + us.map(function (id) {
          var u = D.units[id];
          return '<button class="hw-ut" type="button" role="tab" data-hw="unit" data-u="' + id + '" aria-selected="' + (id === g) + '"><span class="e" aria-hidden="true">' + u.ic + "</span><span>" + esc(u.n) + "<small>" + esc(u.en) + '</small><span class="hw-pg" data-pg="' + id + '">' + pgText(id) + "</span></span></button>";
        }).join("") + '</div><div id="hwUnit">' + unitView(g) + "</div>" };
    }
    function unitView(g) {
      return '<div class="hw-tiles">' + typesFor(g).map(function (t) { return tile(g, t); }).join("") +
        '<button class="hw-tile pr" type="button" data-hw="print" data-u="' + g + '"><span class="e" aria-hidden="true">🖨️</span><b>Worksheet</b>' + vi("In phiếu bài tập") + '<span class="st">Print</span></button></div>' +
        '<div class="hw-box sk-gbox" id="hwBox" hidden></div>';
    }
    function tile(g, t) {
      var p = (prog()[g] || {})[t.id];
      return '<button class="hw-tile' + (t.extra ? " x" : "") + (p ? " done" : "") + '" type="button" data-hw="open" data-u="' + g + '" data-t="' + t.id + '" aria-pressed="false"><span class="e" aria-hidden="true">' + t.ic + "</span><b>" + esc(t.t) + "</b>" + vi(t.vi) + '<span class="st" data-st="' + t.id + '">' + starsOf(g, t.id) + "</span></button>";
    }
    function refreshTiles() {
      if (!G) return;
      var b = $('.hw-tile[data-t="' + G.t.id + '"]'); if (b) { b.querySelector("[data-st]").textContent = starsOf(G.g, G.t.id); b.classList.toggle("done", !!(prog()[G.g] || {})[G.t.id]); }
      $$('[data-pg="' + G.g + '"]').forEach(function (s) { s.textContent = pgText(G.g); });
    }

    /* ---------- bảng 16 Unit (#hw) ---------- */
    function hub() {
      return '<div class="' + (HD.showVi ? "hw-vi" : "") + '"><div class="u-head"><span class="u-ic" aria-hidden="true">🏠</span><div><div class="u-n">Homework · ' + unitIds.length + " units</div><h2>Choose your unit!</h2>" +
        vi("Bài tập về nhà theo từng Unit. Ba mẹ chọn Unit con đang học trên lớp; mỗi Unit có nhiều dạng bài và trò chơi, và phiếu in.") + "</div></div>" +
        '<div class="hw-hub">' + unitIds.map(function (id) {
          var u = D.units[id];
          return '<a href="#hw-' + id + '"><span class="e" aria-hidden="true">' + u.ic + "</span>" + esc(u.n) + "<small>" + esc(u.en) + '</small><span class="hw-pg">' + pgText(id) + "</span></a>";
        }).join("") + "</div></div>";
    }
    /* #hw-g5 → bài ôn có Unit 5 là Unit mới */
    function match(id) {
      if (id === "hw") return { hub: true };
      var m = /^hw-(.+)$/.exec(id); if (!m || !D.units[m[1]]) return null;
      var r = reviewOf(m[1]); if (!r) return null;
      sel[r.id] = m[1]; return { r: r, g: m[1] };
    }

    /* ---------- trò chơi ---------- */
    /* xáo sao cho không trùng thứ tự gốc (bài Spell it, Make a sentence) */
    function mix(a) { var b = a; for (var k = 0; k < 6; k++) { b = shuffle(a); if (b.some(function (x, j) { return x.x !== a[j].x; })) break; } return b; }
    function pickN(a, n) { return shuffle(a).slice(0, Math.min(n, a.length)); }
    function others(P, it, key, n) {
      var seen = {}, out = []; seen[it[key]] = 1;
      shuffle(P).forEach(function (x) { if (out.length < n && x.w !== it.w && x.ic !== it.ic && !seen[x[key]]) { seen[x[key]] = 1; out.push(x); } });
      return out;
    }
    function open(g, tid) {
      K.stop();
      var t = typesFor(g).filter(function (x) { return x.id === tid; })[0]; if (!t) return;
      var P = words(g), S = P.filter(isSpell);
      G = { g: g, t: t, P: P, i: 0, score: 0, miss: false, list: [] };
      if (t.extra) G.list = t.x.items.slice();
      else if (t.id === "listen") G.list = pickN(uniqPics(P), N);
      else if (t.id === "look" || t.id === "say") G.list = pickN(P, N);
      else if (t.id === "yesno") G.list = pickN(P, N).map(function (it, k) { var o = others(P, it, "w", 1)[0]; return { it: it, sh: k % 2 && o ? o : it }; });
      else if (t.id === "match") { var M = pickN(uniqPics(P), N); G.list = []; for (var k = 0; k < M.length; k += 4) G.list.push(M.slice(k, k + 4)); if (G.list.length > 1 && G.list[G.list.length - 1].length < 2) G.list[G.list.length - 2] = G.list[G.list.length - 2].concat(G.list.pop()); }
      else if (t.id === "letter" || t.id === "spell" || t.id === "write") G.list = pickN(S, 6);
      else if (t.id === "gap") G.list = pickN(gapPool(g), N);
      else if (t.id === "order") G.list = pickN(orderPool(g), 6);
      else if (t.id === "qa") G.list = [1];
      else if (t.id === "memory") G.list = pickN(uniqPics(P), 6);
      else if (t.id === "talk") G.list = [1];
      if (t.id === "yesno") G.list = shuffle(G.list);
      $$(".hw-tile").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-t") === tid)); });
      var box = $("#hwBox"); box.hidden = false;
      if (t.id === "memory") memStart(); else show();
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function gh(count) {
      return '<div class="hw-gh"><span aria-hidden="true" style="font-size:1.6rem">' + G.t.ic + "</span><h4>" + esc(G.t.t) + vi(G.t.vi, true) + "</h4>" +
        '<button class="btn" type="button" data-hw="close" aria-label="Close">✕</button></div>' +
        (G.t.how ? '<p class="hw-how">' + esc(G.t.how) + vi(G.t.howVi) + "</p>" : "") +
        (count === false ? "" : '<div class="sk-gtop"><span>' + (G.i + 1) + " / " + G.list.length + "</span><span>⭐ " + G.score + "</span></div>");
    }
    var spk = function (t) { return '<button class="hw-sp" type="button" data-say="' + esc(t) + '" aria-label="Listen">🔊</button>'; };
    function show() {
      var box = $("#hwBox"); if (!box || !G) return;
      if (G.i >= G.list.length) return end();
      G.miss = false; G.pos = 0;
      var t = G.t, it = G.list[G.i], h = "";
      if (t.extra) return showExtra(box);
      if (t.id === "listen") {
        h = '<div class="sk-gq"><button class="sk-sbtn go" type="button" data-hw="hear">🔊 Listen</button></div><div class="sk-opts pics">' +
          shuffle(others(G.P, it, "ic", 3).concat([it])).map(function (o) { return '<button class="sk-opt" type="button" data-hw="ans" data-v="' + esc(o.w) + '" aria-label="picture">' + icon(o.ic) + "</button>"; }).join("") + "</div>";
        setTimeout(function () { speak(it.w); }, 300);
      } else if (t.id === "look") {
        h = '<div class="sk-gq"><span class="sk-gpic" aria-hidden="true">' + icon(it.ic) + '</span></div><div class="sk-opts words">' +
          shuffle(others(G.P, it, "w", 3).concat([it])).map(function (o) { return '<button class="sk-opt" type="button" data-hw="ans" data-v="' + esc(o.w) + '">' + esc(o.w) + "</button>"; }).join("") + "</div>";
      } else if (t.id === "yesno") {
        h = '<div class="sk-gq col"><span class="sk-gpic" aria-hidden="true">' + icon(it.it.ic) + '</span><p class="hw-word">' + esc(it.sh.w) + "?</p>" + spk(it.sh.w) + "</div>" +
          '<div class="hw-yn"><button class="sk-opt" type="button" data-hw="ans" data-v="yes">✔ Yes</button><button class="sk-opt" type="button" data-hw="ans" data-v="no">✘ No</button></div>';
      } else if (t.id === "match") {
        G.sel = null; G.left = it.length;
        h = '<div class="hw-mt"><div class="col">' + shuffle(it).map(function (o) { return '<button class="p" type="button" data-hw="mp" data-v="' + esc(o.w) + '" aria-label="picture">' + icon(o.ic) + "</button>"; }).join("") +
          '</div><div class="col">' + shuffle(it).map(function (o) { return '<button type="button" data-hw="mw" data-v="' + esc(o.w) + '">' + esc(o.w) + "</button>"; }).join("") + "</div></div>";
      } else if (t.id === "letter") {
        var w = it.w, k = Math.floor(Math.random() * w.length), c = w[k].toLowerCase(), V = "aeiou", pool = (V.indexOf(c) >= 0 ? V : "bcdfghklmnprstw").split("").filter(function (x) { return x !== c; });
        G.ans = c;
        h = '<div class="sk-gq col"><span class="sk-gpic sm" aria-hidden="true">' + icon(it.ic) + '</span><p class="hw-word">' + esc(w.slice(0, k)) + '<span class="gp">_</span>' + esc(w.slice(k + 1)) + "</p>" + spk(w) + "</div>" +
          '<div class="hw-tl">' + shuffle(pickN(pool, 2).concat([c])).map(function (x) { return '<button type="button" data-hw="ans" data-v="' + x + '">' + x + "</button>"; }).join("") + "</div>";
      } else if (t.id === "spell") {
        var L = it.w.toLowerCase().split("");
        h = '<div class="sk-gq col"><span class="sk-gpic sm" aria-hidden="true">' + icon(it.ic) + "</span>" + spk(it.w) + '<div class="hw-slots">' + L.map(function () { return "<span></span>"; }).join("") + "</div></div>" +
          '<div class="hw-tl">' + mix(L.map(function (x, j) { return { x: x, j: j }; })).map(function (o) { return '<button type="button" data-hw="tile" data-v="' + o.x + '">' + o.x + "</button>"; }).join("") + "</div>";
        setTimeout(function () { speak(it.w); }, 300);
      } else if (t.id === "write") {
        G.hint = 0;
        h = '<div class="sk-gq col"><span class="sk-gpic" aria-hidden="true">' + icon(it.ic) + "</span>" + spk(it.w) + "</div>" +
          '<div class="hw-wr"><input id="hwIn" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Write the word" placeholder="' + new Array(it.w.length + 1).join("_ ").trim() + '">' +
          '</div><div class="sk-ctl"><button class="sk-sbtn go" type="button" data-hw="check">✔ Check</button><button class="sk-sbtn" type="button" data-hw="whint">💡 Help</button></div>';
      } else if (t.id === "gap") {
        var gap = fill(it.ex).replace(/<b>[\s\S]*?<\/b>/, '<span class="sk-gap">____</span>');
        h = '<div class="sk-gq col"><span class="sk-gpic sm" aria-hidden="true">' + icon(it.ic) + '</span><p class="sk-gsent" id="hwSent">' + gap + "</p>" + (it.sent ? (HD.showVi ? '<p class="hw-hint">' + esc(it.exVi) + "</p>" : vi(it.exVi)) : "") + "</div>" +
          '<div class="sk-opts words">' + shuffle(others(G.P, it, "w", 2).concat([it])).map(function (o) { return '<button class="sk-opt" type="button" data-hw="ans" data-v="' + esc(o.w) + '">' + esc(o.w) + "</button>"; }).join("") + "</div>";
      } else if (t.id === "order") {
        G.tok = tokens(it);
        h = '<div class="sk-gq col"><span class="sk-gpic sm" aria-hidden="true">' + icon(it.ic) + '</span></div><div class="hw-sent" id="hwSent"></div>' +
          '<div class="hw-tl wd">' + mix(G.tok.map(function (x, j) { return { x: x, j: j }; })).map(function (o) { return '<button type="button" data-hw="tok" data-v="' + esc(o.x) + '">' + esc(o.x) + "</button>"; }).join("") + "</div>" +
          '<div class="sk-ctl"><button class="sk-sbtn sm" type="button" data-hw="ohint">🔊 Help</button></div>';
      } else if (t.id === "say") {
        h = '<div class="sk-gq col"><span class="sk-gpic" aria-hidden="true">' + icon(it.ic) + '</span><p class="sk-gword" id="hwWord" hidden>' + esc(it.w) + '</p><p class="sk-gmsg" id="hwMsg">' + (SR ? "Say the word!" : "Say the word, then check!") + "</p></div>" +
          '<div class="sk-ctl">' + (SR ? '<button class="sk-sbtn go" type="button" data-hw="mic">🎤 Say it</button>' : "") +
          '<button class="sk-sbtn" type="button" data-hw="shint">🔊 Help</button><button class="sk-sbtn" type="button" data-hw="said">' + (SR ? "Next ▶" : "✓ I said it!") + "</button></div>";
      } else if (t.id === "talk") return showTalk(box);
      else if (t.id === "qa") return showQA(box);
      box.innerHTML = gh() + h;
      var inp = $("#hwIn"); if (inp) inp.focus();
    }
    function right(btn, say, wait) {
      if (!G.miss) G.score++;
      if (btn) btn.classList.add("ok");
      $$("#hwBox [data-hw=ans]").forEach(function (b) { b.disabled = true; });
      K.chime(true);
      var me = G, fired = false, go = function () { if (fired || G !== me) return; fired = true; G.i++; show(); };
      if (say) { speak(say, { rate: 0.85, onend: function () { setTimeout(go, 400); } }); setTimeout(go, 1200 + String(say).split(" ").length * 700); }
      else setTimeout(go, wait || 900);
    }
    function wrong(btn) { G.miss = true; K.chime(false); if (btn) { btn.classList.add("bad"); btn.disabled = true; } }
    function shake(el) { el.classList.remove("bad"); void el.offsetWidth; el.classList.add("bad"); setTimeout(function () { el.classList.remove("bad"); }, 400); }
    function answer(btn) {
      var it = G.list[G.i], v = btn.getAttribute("data-v"), t = G.t.id;
      if (G.t.extra) return extraAnswer(btn, it, v);
      if (t === "yesno") {
        var ok = (it.sh.w === it.it.w) === (v === "yes");
        if (!ok) return wrong(btn);
        var p = $("#hwBox .hw-word"); if (p && it.sh !== it.it) p.innerHTML = "<s>" + esc(it.sh.w) + "</s> → " + esc(it.it.w);
        return right(btn, it.it.w);
      }
      if (t === "letter") { if (v !== G.ans) return wrong(btn); var w = $("#hwBox .hw-word"); if (w) w.textContent = it.w; return right(btn, it.w); }
      if (v !== it.w) return wrong(btn);
      if (t === "gap") { var s = $("#hwSent"); if (s) s.innerHTML = fill(it.ex) + (it.sent ? "" : vi(it.exVi)); return right(btn, plain(fill(it.ex))); }
      right(btn, it.w);
    }
    function spellTap(btn) {
      var it = G.list[G.i], L = it.w.toLowerCase(), v = btn.getAttribute("data-v");
      if (v !== L[G.pos]) { G.miss = true; K.chime(false); shake(btn); return; }
      btn.disabled = true; var s = $$("#hwBox .hw-slots span")[G.pos]; s.textContent = v; s.classList.add("f"); G.pos++;
      if (G.pos >= L.length) right(null, it.w);
    }
    function tokTap(btn) {
      var v = btn.getAttribute("data-v");
      if (v !== G.tok[G.pos]) { G.miss = true; K.chime(false); shake(btn); return; }
      btn.disabled = true; var s = $("#hwSent"); s.insertAdjacentHTML("beforeend", "<span>" + esc(v) + "</span>"); G.pos++;
      if (G.pos >= G.tok.length) { s.classList.add("ok"); right(null, G.tok.join(" ")); }
    }
    function norm(s) { return String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim(); }
    function writeCheck() {
      var it = G.list[G.i], inp = $("#hwIn"), wr = $("#hwBox .hw-wr"); if (!inp || inp.readOnly) return;
      var v = norm(inp.value); if (!v) { inp.focus(); return; }
      if (v === norm(it.a || it.w)) { inp.readOnly = true; wr.classList.add("ok"); right(null, String(it.a || it.w)); }
      else { G.miss = true; K.chime(false); shake(wr); inp.select(); }
    }
    function writeHint() {
      var it = G.list[G.i], inp = $("#hwIn"), w = String(it.a || it.w); if (!inp) return;
      G.miss = true; G.hint = Math.min(w.length, (G.hint || 0) + 1); inp.value = w.slice(0, G.hint); inp.focus(); speak(w);
    }
    function matchTap(btn, side) {
      if (btn.classList.contains("ok")) return;
      if (!G.sel || G.sel.side === side) {
        $$("#hwBox .hw-mt button.sel").forEach(function (b) { b.classList.remove("sel"); });
        btn.classList.add("sel"); G.sel = { side: side, el: btn };
        if (side === "mw") speak(btn.getAttribute("data-v"));
        return;
      }
      var a = G.sel.el; G.sel = null; a.classList.remove("sel");
      if (a.getAttribute("data-v") === btn.getAttribute("data-v")) {
        a.classList.add("ok"); btn.classList.add("ok"); a.disabled = btn.disabled = true; K.chime(true); speak(btn.getAttribute("data-v"));
        if (!G.miss) G.score++; G.miss = false; G.left--;
        if (G.left <= 0) setTimeout(function () { G.i++; show(); }, 900);
      } else { G.miss = true; K.chime(false); shake(btn); shake(a); }
    }
    function sayResult(ok) {
      var it = G.list[G.i], m = $("#hwMsg"), w = $("#hwWord"); if (w) w.hidden = false;
      if (ok) { if (!G.miss) G.score++; K.chime(true); if (m) m.textContent = "🎉 Great!"; setTimeout(function () { G.i++; show(); }, 1100); }
      else { G.miss = true; K.chime(false); if (m) m.textContent = "Try again! Listen: " + it.w; speak(it.w, { rate: 0.75 }); }
    }
    function micListen() {
      var it = G.list[G.i], m = $("#hwMsg"), rec;
      try { rec = new SR(); } catch (e) { return; }
      rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5;
      if (m) m.textContent = "👂 Listening…";
      rec.onresult = function (e) {
        var target = it.w.toLowerCase(), heard = [];
        for (var i = 0; i < e.results[0].length; i++) heard.push(e.results[0][i].transcript.toLowerCase().trim());
        sayResult(heard.some(function (h) { return h.indexOf(target) >= 0 || (target.indexOf(h) >= 0 && h.length > 2); }));
      };
      rec.onerror = function () { if (m) m.textContent = "Tap 🎤 and say it again!"; };
      rec.start();
    }
    /* Memory: 6 cặp hình – chữ */
    function memStart() {
      var cards = [];
      G.list.forEach(function (x, k) { cards.push({ k: k, face: icon(x.ic), w: x.w, pic: true }, { k: k, face: esc(x.w), w: x.w }); });
      G.cards = shuffle(cards); G.open = []; G.done = 0; G.moves = 0;
      $("#hwBox").innerHTML = gh(false) + '<div class="sk-gtop"><span>Find the pairs!</span><span id="hwMoves">0 moves</span></div><div class="sk-mem">' +
        G.cards.map(function (c, i) { return '<button class="sk-mc' + (c.pic ? " pic" : "") + '" type="button" data-hw="flip" data-i="' + i + '"><span class="back">?</span><span class="face">' + c.face + "</span></button>"; }).join("") + "</div>";
    }
    function memFlip(btn) {
      var i = +btn.getAttribute("data-i"), c = G.cards[i];
      if (btn.classList.contains("up") || G.open.length >= 2) return;
      btn.classList.add("up"); G.open.push({ i: i, el: btn }); if (!c.pic) speak(c.w);
      if (G.open.length < 2) return;
      G.moves++; var mv = $("#hwMoves"); if (mv) mv.textContent = G.moves + " moves";
      var a = G.open[0], b = G.open[1];
      if (G.cards[a.i].k === G.cards[b.i].k) {
        a.el.classList.add("ok"); b.el.classList.add("ok"); G.open = []; G.done++; K.chime(true);
        if (G.done === G.list.length) { G.score = Math.max(0, Math.min(G.list.length, G.list.length * 2 - G.moves + 2)); G.i = G.list.length; setTimeout(end, 700); }
      } else setTimeout(function () { a.el.classList.remove("up"); b.el.classList.remove("up"); G.open = []; }, 900);
    }
    /* 💬 Talk at home: ba mẹ nói câu của ba mẹ, bé nói câu của bé (che sẵn) */
    function showTalk(box) {
      var T = TALK[G.g], P = "👩", Kd = "🧒";
      var ln = function (who, text) {
        if (!text) return "";
        return '<div class="hw-ln ' + (who === Kd ? "k" : "p") + '"><span class="who" aria-hidden="true">' + who + "</span>" +
          '<span class="t' + (who === Kd ? " hid" : "") + '">' + esc(text) + "</span>" + (who === Kd ? '<button class="hw-sp" type="button" data-hw="peek" aria-label="Show">👀</button>' : "") + spk(text) + "</div>";
      };
      var card = function (n, title, titleVi, note, rows) {
        return '<div class="hw-tc"><h5>' + n + ". " + esc(title) + vi(titleVi, true) + "</h5>" + (note ? '<p class="note vi-t" lang="vi">' + esc(note) + "</p>" : "") + rows + "</div>";
      };
      box.innerHTML = gh(false) + '<div class="hw-talk">' +
        card(1, "Say more!", "Mở rộng câu: con nói một từ, ba mẹ nói lại cả câu", "Con nói từ này, ba mẹ nói lại thành câu đầy đủ và thêm một ý. Không bắt con nói lại.", ln(Kd, T[0][0]) + ln(P, T[0][1])) +
        card(2, "What do you need?", "Tạo tình huống để con phải nói", T[1][0] + " Chờ 5 giây để con tự nói.", ln(P, T[1][1]) + ln(Kd, T[1][2])) +
        card(3, "This or that?", "Câu hỏi lựa chọn", YOUNG ? "Hỏi hai lựa chọn, con chỉ cần nói một từ." : "Hỏi hai lựa chọn, con trả lời cả câu.", ln(P, T[2][0]) + ln(Kd, T[2][1])) +
        card(4, "Look and talk", "Đọc tranh, sách trước khi ngủ", "Chỉ vào tranh trong sách hoặc đồ thật rồi hỏi.", ln(P, T[3][0]) + ln(Kd, T[3][1])) +
        (T[4] ? '<p class="vi-t note" lang="vi">🏠 Từ dùng thêm ở nhà: ' + esc(T[4]) + "</p>" : "") +
        '</div><div class="sk-ctl" style="margin-top:12px"><button class="sk-sbtn go" type="button" data-hw="tdone">✓ We talked today!</button></div>';
    }
    function showQA(box) {
      var L = pickN(qaPool(G.g), 6);
      box.innerHTML = gh(false) + '<div class="hw-talk">' + L.map(function (q, k) {
        return '<div class="hw-tc"><h5>' + (k + 1) + ".</h5>" +
          '<div class="hw-ln p"><span class="who" aria-hidden="true">🙋</span><span class="t">' + esc(q[0]) + vi(q[2]) + "</span>" + spk(q[0]) + "</div>" +
          '<div class="hw-ln k"><span class="who" aria-hidden="true">🧒</span><span class="t hid">' + esc(q[1]) + vi(q[3]) + '</span><button class="hw-sp" type="button" data-hw="peek" aria-label="Show">👀</button>' + spk(q[1]) + "</div></div>";
      }).join("") + '</div><div class="sk-ctl" style="margin-top:12px"><button class="sk-sbtn go" type="button" data-hw="tdone">✓ I can answer!</button></div>';
    }
    /* ---------- bài riêng của Unit ---------- */
    function showExtra(box) {
      var x = G.t.x, it = G.list[G.i], h = "";
      if (x.kind === "write") {
        G.hint = 0;
        h = '<div class="sk-gq col"><span class="hw-txt">' + esc(it.txt) + "</span>" + spk(it.a) + "</div>" +
          '<div class="hw-wr"><input id="hwIn" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Write the word"></div>' +
          '<div class="sk-ctl"><button class="sk-sbtn go" type="button" data-hw="check">✔ Check</button><button class="sk-sbtn" type="button" data-hw="whint">💡 Help</button></div>';
      } else if (x.kind === "speak") {
        h = '<div class="sk-gq col"><span class="sk-gpic" aria-hidden="true">' + it.pic + "</span></div>" +
          '<div class="hw-tc">' + it.lines.map(function (l) { return '<div class="hw-ln"><span class="who" aria-hidden="true">🧒</span><span class="t">' + esc(l) + "</span>" + spk(l) + "</div>"; }).join("") + "</div>" +
          '<div class="sk-ctl" style="margin-top:12px"><button class="sk-sbtn" type="button" data-hw="sall">▶ Listen to all</button><button class="sk-sbtn go" type="button" data-hw="said">✓ I said it!</button></div>';
      } else {
        var top = it.s ? '<div class="hw-seq">' + it.s.map(function (v) { return v === null ? '<span class="gp">?</span>' : "<span>" + v + "</span>"; }).join("") + "</div>"
          : it.txt != null ? '<span class="hw-txt">' + esc(it.txt) + "</span>" : '<span class="hw-pic" aria-hidden="true">' + it.pic + "</span>";
        h = '<div class="sk-gq col">' + top + (it.q ? '<p class="hw-q">' + esc(it.q) + " " + spk(it.q) + vi(it.qv) + "</p>" : "") + "</div>" +
          '<div class="sk-opts words">' + it.o.map(function (o) { return '<button class="sk-opt" type="button" data-hw="ans" data-v="' + esc(o) + '">' + esc(o) + "</button>"; }).join("") + "</div>";
      }
      box.innerHTML = gh() + h;
      var inp = $("#hwIn"); if (inp) inp.focus();
    }
    function extraAnswer(btn, it, v) {
      if (v !== String(it.a)) return wrong(btn);
      if (it.s) { var gp = $("#hwBox .hw-seq .gp"); if (gp) { gp.textContent = it.a; gp.classList.remove("gp"); } }
      right(btn, it.say != null ? String(it.say) : String(it.a));
    }
    function end() {
      var n = G.t.id === "match" ? G.list.reduce(function (s, x) { return s + x.length; }, 0) : G.list.length, ratio = Math.min(1, G.score / Math.max(1, n));
      var stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
      saveStars(G.g, G.t.id, stars); refreshTiles();
      var T = typesFor(G.g), k = T.map(function (t) { return t.id; }).indexOf(G.t.id), nx = T[k + 1];
      $("#hwBox").innerHTML = gh(false) + '<div class="sk-gend"><div class="sk-stars">' + new Array(stars + 1).join("⭐") + '</div><p class="sk-sline">' + (ratio >= 0.6 ? "Great job!" : "Good try!") + "</p>" +
        (G.t.id === "memory" ? '<p class="muted">' + G.moves + " moves</p>" : '<p class="muted">' + G.score + " / " + n + "</p>") +
        '<div class="sk-ctl"><button class="btn" type="button" data-hw="open" data-u="' + G.g + '" data-t="' + G.t.id + '">↺ Play again</button>' +
        (nx ? '<button class="btn primary" type="button" data-hw="open" data-u="' + G.g + '" data-t="' + nx.id + '">' + nx.ic + " " + esc(nx.t) + " →</button>" : "") + "</div></div>";
      speak(ratio >= 0.6 ? "Great job!" : "Good try!"); if (stars === 3) K.confetti();
    }

    /* ---------- 🖨️ phiếu in ---------- */
    function printSheet(g) {
      var u = D.units[g], P = words(g), S = P.filter(isSpell), pics = uniqPics(P), A = [];
      var pic = function (x) { return /^c:/.test(x.ic) ? '<span class="sw" style="background:' + esc(x.ic.slice(2)) + '"></span>' : icon(x.ic); };
      var h = "<h1>" + u.ic + " " + esc(u.n) + ": " + esc(u.en) + '</h1><div class="nm">Name:<span></span>Date:<span></span></div>';
      if (YOUNG) return printYoung(g, u, P, pics, pic, h);
      /* 1. Look and write */
      var lw = pickN(S.length >= 6 ? S : pics, 6);
      h += "<h2>1. Look and write.</h2><div class=\"g\">" + lw.map(function (x) { return '<div class="c"><div class="p">' + pic(x) + '</div><div class="bx">' + x.w.split("").map(function (c) { return c === " " ? "&nbsp;" : "_"; }).join(" ") + "</div></div>"; }).join("") + "</div>";
      A.push(["1. Look and write", lw.map(function (x) { return x.w; })]);
      /* 2. Missing letters */
      var S2 = S.filter(function (x) { return lw.indexOf(x) < 0; });
      var ml = pickN(S2.length >= 4 ? S2 : S, 6).map(function (x) { var k = Math.floor(Math.random() * x.w.length); return { x: x, k: k }; });
      if (ml.length) {
        h += "<h2>2. Write the missing letter.</h2><div class=\"g\">" + ml.map(function (m) { return '<div class="c"><div class="p">' + pic(m.x) + '</div><div class="bx">' + esc(m.x.w.slice(0, m.k)) + "_" + esc(m.x.w.slice(m.k + 1)) + "</div></div>"; }).join("") + "</div>";
        A.push(["2. Missing letter", ml.map(function (m) { return m.x.w + " (" + m.x.w[m.k] + ")"; })]);
      }
      /* 3. Look and circle */
      var lc = pickN(pics, 6).map(function (x) { var o = others(P, x, "w", 1)[0]; return { x: x, o: Math.random() < 0.5 ? [x.w, o ? o.w : ""] : [o ? o.w : "", x.w] }; });
      h += "<h2>3. Look and circle the right word.</h2><div class=\"g\">" + lc.map(function (m) { return '<div class="c"><div class="p">' + pic(m.x) + "</div><div><b>" + esc(m.o[0]) + "</b> &nbsp;/&nbsp; <b>" + esc(m.o[1]) + "</b></div></div>"; }).join("") + "</div>";
      A.push(["3. Look and circle", lc.map(function (m) { return m.x.w; })]);
      /* 4. Match */
      var mt = pickN(pics, 5), mw = shuffle(mt);
      h += "<h2>4. Match.</h2><div class=\"mt\">" + mt.map(function (x, k) { return '<div class="p">' + pic(x) + '<span class="dot"></span></div><div></div><div class="w"><span class="dot"></span>' + esc(mw[k].w) + "</div>"; }).join("") + "</div>";
      A.push(["4. Match", mt.map(function (x) { return x.w; })]);
      /* 5. Fill the gap */
      var fg = pickN(gapPool(g), 5);
      if (fg.length >= 3) {
        h += "<h2>5. Read and write the missing word.</h2><div class=\"wb\">" + shuffle(fg).map(function (x) { return esc(x.w); }).join(" &nbsp;·&nbsp; ") + "</div><ol>" +
          fg.map(function (x) { return "<li>" + plain(fill(x.ex).replace(/<b>[\s\S]*?<\/b>/, "@@")).replace("@@", "__________") + "</li>"; }).join("") + "</ol>";
        A.push(["5. Fill the gap", fg.map(function (x) { return x.w; })]);
      }
      /* 6. Put the words in order */
      var po = pickN(orderPool(g), 3);
      if (po.length) {
        h += "<h2>6. Put the words in order.</h2><ol>" + po.map(function (x) { return "<li>" + shuffle(tokens(x)).map(esc).join(" &nbsp;/&nbsp; ") + '<span class="ln"></span></li>'; }).join("") + "</ol>";
        A.push(["6. Put the words in order", po.map(function (x) { return tokens(x).join(" "); })]);
      }
      finishPrint(h, A);
    }
    /* Phiếu cho bé Mầm non (chưa biết viết): tô chữ, nghe rồi khoanh hình, khoanh chữ, nối, vẽ và nói */
    function printYoung(g, u, P, pics, pic, h) {
      var A = [], n = 0, sec = function (t) { n++; return "<h2>" + n + ". " + t + "</h2>"; };
      var tr = pickN(pics, 6);
      h += sec("Look, say and trace.") + '<div class="g">' + tr.map(function (x) { return '<div class="c"><div class="p">' + pic(x) + '</div><div class="tw">' + esc(x.w) + '</div><div class="tw">' + esc(x.w) + "</div></div>"; }).join("") + "</div>";
      var ls = pickN(pics, 5).map(function (x) { var o = shuffle(others(pics, x, "ic", 2).concat([x])); return { x: x, o: o }; });
      h += sec("Listen and circle. <small>(Ba mẹ đọc to từ ở trang đáp án, bé khoanh hình đúng.)</small>") + "<ol>" + ls.map(function (m, k) { return '<li class="row"><b>' + (k + 1) + ".</b>" + m.o.map(function (o) { return '<span class="p">' + pic(o) + "</span>"; }).join("") + "</li>"; }).join("") + "</ol>";
      A.push(["Listen and circle (ba mẹ đọc to)", ls.map(function (m) { return m.x.w; })]);
      var lc = pickN(pics, 6).map(function (x) { var o = others(P, x, "w", 1)[0]; return { x: x, o: Math.random() < 0.5 ? [x.w, o ? o.w : ""] : [o ? o.w : "", x.w] }; });
      h += sec("Look and circle the right word.") + '<div class="g">' + lc.map(function (m) { return '<div class="c"><div class="p">' + pic(m.x) + "</div><div><b>" + esc(m.o[0]) + "</b> &nbsp;/&nbsp; <b>" + esc(m.o[1]) + "</b></div></div>"; }).join("") + "</div>";
      A.push(["Look and circle", lc.map(function (m) { return m.x.w; })]);
      var mt = pickN(pics, 4), mw = shuffle(mt);
      h += sec("Match.") + '<div class="mt">' + mt.map(function (x, k) { return '<div class="p">' + pic(x) + '<span class="dot"></span></div><div></div><div class="w"><span class="dot"></span>' + esc(mw[k].w) + "</div>"; }).join("") + "</div>";
      A.push(["Match", mt.map(function (x) { return x.w; })]);
      var dr = pickN(pics, 2);
      h += sec("Draw and say.") + '<div class="g2">' + dr.map(function (x) { return '<div class="c dr"><div class="bx">' + esc(x.w) + '</div><div class="box"></div><div>I can see a <b>' + esc(x.w) + "</b>!</div></div>"; }).join("") + "</div>";
      finishPrint(h, A);
    }
    function finishPrint(h, A) {
      h += '<div class="ans"><h2>Answers (for parents)</h2>' + A.map(function (a) { return "<p><b>" + esc(a[0]) + "</b></p><ol>" + a[1].map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>"; }).join("") + "</div>";
      var box = document.getElementById("hwPrint");
      if (!box) { box = document.createElement("div"); box.id = "hwPrint"; document.body.appendChild(box); }
      box.innerHTML = h;
      document.documentElement.classList.add("hw-printing");
      var off = function () { document.documentElement.classList.remove("hw-printing"); window.removeEventListener("afterprint", off); };
      window.addEventListener("afterprint", off);
      /* lớp hw-printing chỉ có tác dụng khi in (@media print), nên giữ đến khi in xong (afterprint) */
      setTimeout(function () { window.print(); }, 50);
    }

    /* ---------- sự kiện ---------- */
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-hw]"); if (!b) return;
      var a = b.getAttribute("data-hw");
      if (a === "unit") {
        var g = b.getAttribute("data-u"), r = reviewOf(g); G = null;
        if (r) sel[r.id] = g;
        $$(".hw-ut").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
        $("#hwUnit").innerHTML = unitView(g);
        try { history.replaceState(null, "", "#hw-" + g); } catch (err) {}
        return;
      }
      if (a === "open") { open(b.getAttribute("data-u"), b.getAttribute("data-t")); return; }
      if (a === "print") { printSheet(b.getAttribute("data-u")); return; }
      if (!G) return;
      if (a === "close") { G = null; var box = $("#hwBox"); box.hidden = true; box.innerHTML = ""; $$(".hw-tile").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); return; }
      if (a === "hear") speak(G.list[G.i].w, { rate: 0.75 });
      if (a === "ans") answer(b);
      if (a === "tile") spellTap(b);
      if (a === "tok") tokTap(b);
      if (a === "ohint") { G.miss = true; speak(G.tok.join(" ")); }
      if (a === "mp" || a === "mw") matchTap(b, a);
      if (a === "check") writeCheck();
      if (a === "whint") writeHint();
      if (a === "flip") memFlip(b);
      if (a === "mic") micListen();
      if (a === "shint") { G.miss = true; var w = $("#hwWord"); if (w) w.hidden = false; speak(G.list[G.i].w, { rate: 0.75 }); }
      if (a === "said") { if (G.t.extra) { G.score++; K.chime(true); G.i++; show(); } else sayResult(true); }
      if (a === "sall") { var L = G.list[G.i].lines; K.speak(L[0]); L.slice(1).forEach(function (l) { K.speak(l, { queue: true }); }); }
      if (a === "peek") { var t = b.parentNode.querySelector(".t"); if (t) t.classList.remove("hid"); }
      if (a === "tdone") { $$("#hwBox .t.hid").forEach(function (t) { t.classList.remove("hid"); }); G.score = G.list.length; G.i = G.list.length; end(); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.id === "hwIn" && G) { e.preventDefault(); writeCheck(); } });

    return { block: block, parts: parts, hub: hub, match: match, reset: function () { G = null; } };
  };
})();

/* Kho từ vựng dùng chung theo khối lớp: mỗi khối một file trong assets/vocab/ (mau-giao.js, lop-1.js, ... lop-5.js).
   Sửa từ của một Unit ở đúng một chỗ (file khối lớp đó). Mọi trang dùng Unit ấy tự đổi theo:
     - Mầm non: trang Giai đoạn 1–3, Ôn tập nói Mầm non, 📒 Words I know của Giáo án lớp 1.
     - Lớp 1: Giáo án lớp 1, Ôn tập nói lớp 1.
   Nạp file này, rồi các file khối lớp cần dùng, TRƯỚC đoạn <script> dữ liệu của trang.

   File khối lớp ghi:  LopHocVocab.add("lop-2", { u1: { n:"Unit 1", en:"My school", vi:"Trường của em", ic:"🏫", w:[ … ] }, … });
   Mỗi từ:  [hình, từ tiếng Anh, nghĩa tiếng Việt, câu ví dụ (có thể có <b>từ</b>), nghĩa câu ví dụ]
     hình: emoji (bản 12 trở xuống), "n:12" ô số, "c:#hex" ô màu, "s:circle:#hex" hình khối,
           "i:tadpole.svg" hình vẽ trong assets/img/, "pos:in" hình vị trí (assets/pos-art.js).
   Mầm non ghi theo kiểu của trang Giai đoạn: [hình, từ, nghĩa, thêm ({sound}, {color} hoặc ""), nhóm từ]
   (khai báo { kind:"preschool" }), nên khi đưa sang trang Ôn tập nói chỉ lấy 3 ô đầu.

   Trang dùng:
     LopHocVocab.w("mau-giao/a1")                  → danh sách từ của Unit (trang Giai đoạn: words: …)
     LopHocVocab.units("lop-1")                    → { g1:{n,en,ic,w}, … } cho window.SPEAK.units
     LopHocVocab.units("mau-giao", { prefix:"p" }) → { pa1:…, pb1:… } (đặt tên khác để không trùng Unit của trang)
     LopHocVocab.units("lop-1", { only:["g1","g2"] })  → chỉ lấy vài Unit (hoặc only:/^g\d+$/)
     LopHocVocab.mix(a, b, …)                      → gộp nhiều nhóm Unit làm một */
(function () {
  "use strict";
  var G = {}, OPT = {};
  function ic(s) {
    if (typeof s === "string" && s.indexOf("pos:") === 0) return window.POS ? window.POS(s.slice(4)) : "📦";
    return s;
  }
  function copyW(list, short) {
    return (list || []).map(function (x) {
      var y = short ? x.slice(0, 3) : x.slice(); y[0] = ic(y[0]); return y;
    });
  }
  function find(ref) {
    var k = String(ref).indexOf("/"), g = G[String(ref).slice(0, k)], u = g && g[String(ref).slice(k + 1)];
    if (!u) { if (window.console) console.warn("LopHocVocab: không có Unit " + ref); return null; }
    return u;
  }
  var V = window.LopHocVocab = {
    add: function (grade, units, opt) { G[grade] = units; OPT[grade] = opt || {}; },
    has: function (grade) { return !!G[grade]; },
    unit: function (ref) { return find(ref); },
    w: function (ref) { var u = find(ref); return u ? copyW(u.w, false) : []; },
    units: function (grade, opt) {
      opt = opt || {}; var out = {}, g = G[grade] || {}, short = OPT[grade].kind === "preschool", pre = opt.prefix || "";
      if (!G[grade] && window.console) console.warn("LopHocVocab: chưa nạp assets/vocab/" + grade + ".js");
      Object.keys(g).forEach(function (id) {
        if (opt.only && (opt.only.test ? !opt.only.test(id) : opt.only.indexOf(id) < 0)) return;
        var u = g[id];
        out[pre + id] = { n: u.n, en: u.en, ic: u.ic, w: copyW(u.w, short) };
      });
      return out;
    },
    mix: function () {
      var out = {};
      Array.prototype.forEach.call(arguments, function (o) { for (var k in o) out[k] = o[k]; });
      return out;
    }
  };
})();

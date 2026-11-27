/* Hình vị trí dùng chung cho trang Mầm non: POS("in" | "on" | "under" | "next to" | "behind" | "in front of" | "table")
   trả về một SVG nhỏ (quả bóng đỏ ở trong / trên / dưới / cạnh / sau / trước cái hộp), cao bằng cỡ chữ. */
window.POS = function (p) {
  var S = 'stroke="#1d2a44" stroke-width="4" stroke-linejoin="round"';
  var box = '<rect x="34" y="44" width="56" height="44" rx="3" fill="#d9a066" ' + S + '/><path d="M34 58 h56" stroke="#a0622d" stroke-width="3"/>';
  var ball = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 12) + '" fill="#ef4b4b" ' + S + '/><path d="M' + (x - 5) + ' ' + (y - 5) + ' q4 -4 9 -2" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'; };
  var floor = '<path d="M4 90 h112" stroke="#9aa1ad" stroke-width="3" stroke-linecap="round"/>';
  var body = {
    "in": floor + '<path d="M34 44 l-12 -14 M90 44 l12 -14" ' + S + '/>' + ball(62, 42) + box,
    "on": floor + box + ball(62, 30),
    "under": floor + '<rect x="18" y="34" width="84" height="10" rx="3" fill="#c98a4b" ' + S + '/><path d="M26 44 v44 M94 44 v44" ' + S + ' stroke-width="6"/>' + ball(60, 76),
    "next to": floor + box.replace(/x="34"/, 'x="14"').replace(/M34 58 h56/, 'M14 58 h56') + ball(94, 76),
    "behind": floor + ball(82, 40, 13) + box,
    "in front of": floor + box + ball(62, 74, 15),
    "table": floor + '<rect x="14" y="34" width="92" height="11" rx="3" fill="#c98a4b" ' + S + '/><path d="M24 45 v43 M96 45 v43" ' + S + ' stroke-width="6"/>'
  }[p];
  return '<svg class="pos" viewBox="0 0 120 96" aria-hidden="true">' + body + '</svg>';
};
(function () { var s = document.createElement("style"); s.textContent = ".pos{width:1.25em;height:1em;vertical-align:middle;overflow:visible}"; document.head.appendChild(s); })();

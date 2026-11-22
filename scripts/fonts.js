// Copies font files from node_modules into www/fonts so the app works offline.
const fs = require('fs'), path = require('path');
const F = {
  'newsreader': ['Newsreader', [400, 600]],
  'hanken-grotesk': ['Hanken Grotesk', [400, 600]],
  'nunito': ['Nunito', [400, 700]],
  'space-mono': ['Space Mono', [400, 700]],
  'caveat': ['Caveat', [400, 700]]
};
fs.mkdirSync('www/fonts', { recursive: true });
let css = '';
for (const [id, [fam, ws]] of Object.entries(F)) for (const w of ws) {
  const f = `${id}-latin-${w}-normal.woff2`;
  const src = path.join('node_modules/@fontsource', id, 'files', f);
  if (!fs.existsSync(src)) { console.warn('missing', f); continue; }
  fs.copyFileSync(src, 'www/fonts/' + f);
  css += `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:swap;src:url(fonts/${f}) format('woff2')}\n`;
}
fs.writeFileSync('www/fonts.css', css);

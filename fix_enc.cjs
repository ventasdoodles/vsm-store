const fs = require('fs');
const path = require('path');

const replacements = [
  ['\u00c3\u00a1', 'á'], ['\u00c3\u00a9', 'é'], ['\u00c3\u00ad', 'í'],
  ['\u00c3\u00b3', 'ó'], ['\u00c3\u00ba', 'ú'], ['\u00c3\u00b1', 'ñ'],
  ['\u00c3\u0081', 'Á'], ['\u00c3\u0089', 'É'], ['\u00c3\u008d', 'Í'],
  ['\u00c3\u0093', 'Ó'], ['\u00c3\u009a', 'Ú'], ['\u00c3\u0091', 'Ñ'],
  ['\u00c3\u00bc', 'ü'], ['\u00c3\u009c', 'Ü'],
  ['\u00c2\u00a1', '¡'], ['\u00c2\u00bf', '¿'],
  ['\u00e2\u0080\u0093', '–'], ['\u00e2\u0080\u0094', '—'],
  ['\u00e2\u0080\u009c', '\u201c'], ['\u00e2\u0080\u009d', '\u201d'],
  ['\u00e2\u0080\u0098', '\u2018'], ['\u00e2\u0080\u0099', '\u2019'],
  ['\u00e2\u0080\u00a6', '…'], ['\u00e2\u0086\u0092', '→'],
  ['\u00e2\u0080\u00a2', '•'],
  ['\u00e2\u009a\u00a1', '⚡'],
  ['\u00e2\u0084\u00a2', '™'], ['\u00c2\u00a9', '©'], ['\u00c2\u00ae', '®'],
  ['\u00e2\u0086\u0090', '←'], ['\u00e2\u0086\u0093', '↓'], ['\u00e2\u0086\u0091', '↑'],
  ['\u00e2\u0094\u0080', '─'], ['\u00e2\u0094\u0082', '│'],
  ['\u00e2\u0098\u0085', '★'],
  ['\u00c2\u00a0', '\u00a0'],
  ['\u00f0\u009f\u0094\u008d', '🔍'],
  ['\u00f0\u009f\u0094\u00a5', '🔥'],
  ['\u00f0\u009f\u008f\u0086', '🏆'],
  ['\u00f0\u009f\u0094\u0092', '🔒'],
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [bad, good] of replacements) {
    while (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Also handle visible-text mojibake (when terminal/editor already decoded wrong)
const visibleReplacements = [
  ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã\xAD', 'í'], ['Ã³', 'ó'], ['Ãº', 'ú'],
  ['Ã±', 'ñ'], ['Ã\x81', 'Á'], ['Ã\x89', 'É'], ['Ã\x8D', 'Í'],
  ['Ã"', 'Ó'], ['Ã\x9A', 'Ú'], ['Ã\x91', 'Ñ'],
  ['Ã¼', 'ü'], ['Ã\x9C', 'Ü'],
  ['Â¡', '¡'], ['Â¿', '¿'], ['Â©', '©'], ['Â®', '®'], ['Â ', ' '],
];

function fixFileVisible(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [bad, good] of visibleReplacements) {
    while (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walk(dir) {
  let fixed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', '.vite'].includes(entry.name)) continue;
      fixed += walk(full);
    } else if (/\.(tsx?|jsx?|md|json|html|css)$/.test(entry.name)) {
      if (fixFile(full)) { fixed++; console.log('Fixed (binary):', full); }
      if (fixFileVisible(full)) { fixed++; console.log('Fixed (visible):', full); }
    }
  }
  return fixed;
}

const total = walk('.');
console.log('\nTotal fixes applied: ' + total);

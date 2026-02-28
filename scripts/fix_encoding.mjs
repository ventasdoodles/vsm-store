import fs from 'fs';
import path from 'path';

const directoryPath = path.join(process.cwd(), 'src');

// Map of common UTF-8 mojibake to correct characters
const replacements = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',  // Includes soft hyphen if any
  'Ã\xAD': 'í', // Explicit soft hyphen
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Â¡': '¡',
  'Â¿': '¿',
  'Ã\x81': 'Á',
  'Ã\x89': 'É',
  'Ã\x8D': 'Í',
  'Ã\x93': 'Ó',
  'Ã\x9A': 'Ú',
  'Ã\x91': 'Ñ',
  // Sometimes 'í' gets truncated to just 'Ã' if followed by space or certain chars,
  // but we should be careful replacing a lone 'Ã' so we do it last if specified
};

function readFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      readFilesRecursively(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const files = readFilesRecursively(directoryPath);
let fixedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Apply explicit replacements
  for (const [corrupted, fixed] of Object.entries(replacements)) {
    content = content.split(corrupted).join(fixed);
  }

  // Handle lone Ã if the user specifically noted it might mean 'í', 
  // though we only do it if it's the specific case where 'í' was meant.
  // We'll replace literally what might be a broken 'Ã' where 'í' was intended,
  // typically seen as 'EnvÃo' -> 'Envío'
  content = content.split('EnvÃo').join('Envío');
  content = content.split('MÃ¡s').join('Más');
  
  // Generic lone Ã to í safely (only if not before another corrupted character)
  // To avoid breaking valid things or sequence, we just use string replace.
  // A raw 'Ã' followed by space or letters:
  content = content.replace(/Ã(?![\x81-\xBA])/g, 'í');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed encoding in: ${path.relative(process.cwd(), file)}`);
    fixedFiles++;
  }
});

console.log(`\nEncoding fix complete. Fixed ${fixedFiles} files.`);

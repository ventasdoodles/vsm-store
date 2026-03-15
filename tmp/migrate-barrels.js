const fs = require('fs');
const path = require('path');

const rootDir = 'src';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(rootDir);

files.forEach(file => {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
  if (file.includes('services' + path.sep + 'index.ts')) return;
  if (file.includes('services' + path.sep + 'admin' + path.sep + 'index.ts')) return;

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace public service imports
  // from '@/services/xxx.service' -> from '@/services'
  content = content.replace(/from ['"]@\/services\/(addresses|auth|brands|bundle|categories|concierge|coupons|flash-deals|gamification|inventory|loyalty|monitoring|notifications|orders|products|search|settings|stats|storage|testimonials|tracking|voice|wishlist)\.service['"]/g, "from '@/services'");

  // Replace admin service imports
  // from '@/services/admin/admin-xxx.service' -> from '@/services/admin'
  content = content.replace(/from ['"]@\/services\/admin\/admin-(auth|dashboard|orders|products|categories|customers|coupons|tags|testimonials|flash-deals|variants|brands|wheel|nlp|crm|marketing)\.service['"]/g, "from '@/services/admin'");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});

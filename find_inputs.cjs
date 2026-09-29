const fs = require('fs');
const files = [
  'src/components/admin/cesarin/TabInteractions.tsx',
  'src/components/admin/cesarin/TabTraining.tsx',
  'src/components/admin/customers/details/CustomerEvidence.tsx',
  'src/components/admin/products/ProductEditorDrawer.tsx',
  'src/components/admin/products/ProductSpecsBuilder.tsx',
  'src/components/admin/settings/VerticalPackConfigSettings.tsx',
  'src/components/admin/ui/AdminCommandPalette.tsx',
  'src/components/admin/ui/SupplierOrderModal.tsx',
  'src/pages/admin/AdminBatchManager.tsx',
  'src/pages/admin/AdminProductForm.tsx'
];

files.forEach(f => {
  const p = 'C:/dev/vsm-store-fresh/' + f;
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, 'utf8');
  let m = content.match(/<input\s[^>]*>/g);
  if(m) {
    console.log('FILE: ' + f);
    m.forEach(match => {
      if(!match.includes('type="file"') && !match.includes('type="checkbox"') && !match.includes('type="radio"')) {
        console.log(' - ' + match);
      }
    });
  }
})

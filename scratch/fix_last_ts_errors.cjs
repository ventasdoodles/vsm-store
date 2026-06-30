const fs = require('fs');

// 1. AdminApp.tsx - remove all unused imports
let adminApp = fs.readFileSync('src/AdminApp.tsx', 'utf8');
const unusedAdmin = [
    'AdminDashboard', 'AdminProducts', 'AdminProductForm', 'AdminOrders', 
    'AdminCategories', 'AdminBrands', 'AdminTags', 'AdminCustomers', 
    'AdminCustomerDetails', 'AdminCoupons', 'AdminSettings', 'AdminHomeSliders',
    'AdminMonitoring', 'AdminTestimonials', 'AdminHomeEditor', 'AdminLoyalty',
    'AdminFlashDeals', 'AdminAttributes', 'AdminWheelGame', 'AdminBatchManager',
    'AdminCesarinOS', 'NotFound'
];
unusedAdmin.forEach(name => {
    adminApp = adminApp.replace(new RegExp(`import\\s+\\{\\s*${name}\\s*\\}\\s+from\\s+['"][^'"]+['"];?\\r?\\n?`, 'g'), '');
    adminApp = adminApp.replace(new RegExp(`import\\s+${name}\\s+from\\s+['"][^'"]+['"];?\\r?\\n?`, 'g'), '');
});
fs.writeFileSync('src/AdminApp.tsx', adminApp);

// 2. App.tsx - remove unused variables
let appT = fs.readFileSync('src/App.tsx', 'utf8');
appT = appT.replace(/import\s+\{\\s*ProtectedRoute\s*\}\s+from\s+['"][^'"]+['"];?\r?\n?/, '');
appT = appT.replace(/import\s+OffersPage\s+from\s+['"][^'"]+['"];?\r?\n?/, '');
appT = appT.replace(/const\s+\{\s*isLoading\s*\}\s*=\s*useAuth\(\);/, 'useAuth();');
appT = appT.replace(/const\s+publicSectionRouteDeclarations\s*=\s*\[[^\]]+\];/, '');
// fix Argument of type '{}' is not assignable to parameter of type 'string' at line 127
appT = appT.replace(/location.pathname.startsWith\(\{\}\)/, "location.pathname.startsWith('/')");
fs.writeFileSync('src/App.tsx', appT);

// 3. AdminCommandPalette.tsx - fix navigate
let adminPal = fs.readFileSync('src/components/admin/ui/AdminCommandPalette.tsx', 'utf8');
adminPal = adminPal.replace(/navigate\(\s*item\.path\s*\)/g, 'navigate({ to: item.path as any })');
adminPal = adminPal.replace(/navigate\(\s*action\.path\s*\)/g, 'navigate({ to: action.path as any })');
fs.writeFileSync('src/components/admin/ui/AdminCommandPalette.tsx', adminPal);

// 4. ConciergeMessageItem.tsx - fix navigate to accept object? No, the prop in interface is navigate: (path: string) => void;
// but the code now has navigate({ to: ... as any }) because of our sweeping fix!
let concMsg = fs.readFileSync('src/components/ui/ai/ConciergeMessageItem.tsx', 'utf8');
// Fix navigate({ to: `/${product.section ?? 'vape'}/${product.slug}` as any }) back to navigate(`/${product.section ?? 'vape'}/${product.slug}`)
// since we changed AIConcierge to pass (path) => navigate({ to: path as any })
concMsg = concMsg.replace(/navigate\(\{\s*to:\s*(`\/\$\{product\.section \?\? 'vape'\}\/\$\{product\.slug\}`)\s+as\s+any\s*\}\)/g, 'navigate($1)');
fs.writeFileSync('src/components/ui/ai/ConciergeMessageItem.tsx', concMsg);

// 5. Fix orderId in params
const orderFiles = [
    'src/pages/Orders.tsx',
    'src/pages/PaymentFailure.tsx',
    'src/pages/PaymentPending.tsx',
    'src/pages/PaymentSuccess.tsx'
];
orderFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Replace: to: '/orders/$orderId' as any, orderId: order.id
    // With: to: '/orders/$orderId' as any, params: { orderId: order.id }
    content = content.replace(/to:\s*['"]\/orders\/\$orderId['"]\s*as\s*any,\s*orderId:\s*([a-zA-Z0-9_$.]+)/g, "to: '/orders/$orderId' as any, params: { orderId: $1 }");
    fs.writeFileSync(file, content);
});

console.log('Fixed type errors part 4');

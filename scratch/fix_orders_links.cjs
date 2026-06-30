const fs = require('fs');

const orderFiles = [
    'src/pages/Orders.tsx',
    'src/pages/PaymentFailure.tsx',
    'src/pages/PaymentPending.tsx',
    'src/pages/PaymentSuccess.tsx'
];

orderFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/to=\{"\/orders\/\$orderId" as any\} params=\{\{ orderId: ([^\}]+) \}\}/g, 'to={`/orders/${$1}` as any}');
    fs.writeFileSync(file, content);
});

console.log('Fixed link params type errors');

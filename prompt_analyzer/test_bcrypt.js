const bcrypt = require('bcrypt');
console.log('bcrypt version:', require('bcrypt/package.json').version);

async function test() {
    try {
        const hash = await bcrypt.hash('test', 10);
        console.log('hash works:', hash);
    } catch(e) {
        console.error('hash error:', e.message);
    }
}
test();

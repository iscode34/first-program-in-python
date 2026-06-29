const http = require('http');

function apiRequest(method, path, data, token) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const req = http.request({ hostname: 'localhost', port: 5000, path, method, headers }, (res) => {
            let respBody = '';
            res.on('data', (chunk) => respBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(respBody) }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function run() {
    console.log('=== Login ===');
    const login = await apiRequest('POST', '/api/auth/login', { email: 'studen@gmail.com', password: 'password' });
    console.log('Status:', login.status);
    console.log('Token:', login.body.token ? login.body.token.substring(0, 30) + '...' : 'NONE');
    const token = login.body.token;

    console.log('\n=== DeepSeek Analysis ===');
    const analysis = await apiRequest('POST', '/api/prompts/analyze', {
        prompt_text: 'Act as a professional copywriter. Write a persuasive email to get an investor for my AI startup. Format as bullet points.'
    }, token);
    console.log('Status:', analysis.status);
    console.log('Analysis:', JSON.stringify(analysis.body, null, 2));

    console.log('\n=== Save Prompt ===');
    const save = await apiRequest('POST', '/api/prompts', {
        title: 'Investor Email',
        category: 'Marketing',
        prompt_text: 'Act as a professional copywriter. Write a persuasive email to get an investor for my AI startup. Format as bullet points.',
        context: ''
    }, token);
    console.log('Status:', save.status);
    console.log('Saved:', save.body.success);

    console.log('\n=== Get Prompts ===');
    const prompts = await apiRequest('GET', '/api/prompts', {}, token);
    console.log('Status:', prompts.status);
    console.log('Count:', prompts.body.prompts.length);
}

run().catch(e => console.error('Test failed:', e.message));

const { handler } = require('../netlify/functions/api.js');

async function runTest() {
  const paths = [
    '/auth/login',
    '/api/auth/login',
    '/.netlify/functions/api/auth/login'
  ];

  for (const p of paths) {
    const event = {
      httpMethod: 'POST',
      path: p,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      isBase64Encoded: false,
    };
    try {
      const result = await handler(event, {});
      console.log(`[TEST] Path: ${p} => Status: ${result.statusCode}`);
      console.log(`[TEST] Body: ${result.body.substring(0, 150)}...\n`);
    } catch (e) {
      console.error(`[TEST] Error on path ${p}:`, e);
    }
  }
}

runTest();

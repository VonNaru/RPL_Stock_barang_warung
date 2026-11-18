const { handler } = require('../netlify/functions/api.js');
(async () => {
  const paths = ['/auth/login', '/api/auth/login'];
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
      console.log('Path', p, '=>', result.statusCode, result.body);
    } catch (e) {
      console.error('Error for', p, e);
    }
  }
})();

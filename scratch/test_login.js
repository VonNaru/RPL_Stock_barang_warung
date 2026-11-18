const { handler } = require('./netlify/functions/api.js');
(async () => {
  const event = {
    httpMethod: 'POST',
    path: '/auth/login',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    isBase64Encoded: false
  };
  const context = {};
  try {
    const result = await handler(event, context);
    console.log('Result:', result);
  } catch (e) {
    console.error('Error invoking handler:', e);
  }
})();

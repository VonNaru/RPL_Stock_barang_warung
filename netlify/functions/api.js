const serverless = require('serverless-http');
const appModule = require('../../apps/api/server.js');
let expressApp = appModule;
while (expressApp && typeof expressApp === 'object' && 'default' in expressApp) {
  expressApp = expressApp.default;
}
exports.handler = serverless(expressApp);





import serverless from 'serverless-http';
import * as appModule from '../../apps/api/server.js';
let expressApp = appModule;
while (expressApp && typeof expressApp === 'object' && 'default' in expressApp) {
  expressApp = expressApp.default;
}
export const handler = serverless(expressApp);




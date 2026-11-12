import serverless from 'serverless-http';
import * as appModule from '../../apps/api/server.js';
const expressApp = (appModule && typeof appModule === 'object' && 'default' in appModule) ? appModule.default : appModule;
export const handler = serverless(expressApp);




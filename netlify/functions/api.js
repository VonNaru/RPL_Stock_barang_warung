import serverless from 'serverless-http';
import app from '../../apps/api/server.js';

export const handler = serverless(app);


import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

// Prefer explicit env token in development, otherwise use the appParams token
const envToken = import.meta.env.VITE_BASE44_ACCESS_TOKEN;
const clientToken = import.meta.env.DEV ? (envToken || token) : token;

//Create a client with authentication (token may be null in production where URL param is used)
export const base44 = createClient({
  appId,
  serverUrl,
  token: clientToken,
  functionsVersion,
  requiresAuth: false
});

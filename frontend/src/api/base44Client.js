import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68c9d729fb43def6910b57b7", 
  requiresAuth: true // Ensure authentication is required for all operations
});

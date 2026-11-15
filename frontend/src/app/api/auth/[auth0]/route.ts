import { handleAuth } from "@auth0/nextjs-auth0";

// Auth0 handler for login, logout, callback, me
export const GET = handleAuth();
export const POST = handleAuth();

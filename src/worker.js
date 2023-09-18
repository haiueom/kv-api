/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import handleProxy from './proxy';
import handleRedirect from './redirect';
import apiRouter from './router';

// Export a default object containing event handlers
export default {
    // The fetch handler is invoked when this worker receives a HTTP(S) request
    // and should return a Response (optionally wrapped in a Promise)
    async fetch(request, env, ctx) {
        // You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
        const url = new URL(request.url);

        // You can get pretty far with simple logic like if/switch-statements
        switch (url.pathname) {
            case '/redirect':
                return handleRedirect.fetch(request, env, ctx);

            case '/proxy':
                return handleProxy.fetch(request, env, ctx);
        }

        if (url.pathname.startsWith('/api/')) {
            // auth with headers
            let accessKey = await env.API.get('KV_SECRET_KEY');
            const ak = await request.headers.get('x-access-key');

            if (ak === accessKey) {
                // You can also use more robust routing
                return apiRouter.handle(request, env);
            } else {
                return new Response('Unauthorized', { status: 401 });
            }
        }

        return new Response(`Online`, { headers: { 'Content-Type': 'text/html' } });
    },
};

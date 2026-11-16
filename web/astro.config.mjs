import { defineConfig } from 'astro/config';

// Deployed to Cloudflare Pages at the custom domain pythoning.saxon.zone,
// served from the root path (no base prefix).
export default defineConfig({
  vite: { plugins: [{ name: 'microgame-routes', configureServer(server) { server.middlewares.use((req, res, next) => { if (req.url?.startsWith('/microgames/')) req.url = '/microgames/'; next(); }); } }] },
  site: 'https://pythoning.saxon.zone',
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
});

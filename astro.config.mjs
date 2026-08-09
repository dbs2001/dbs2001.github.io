import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // STEP 1: Replace YOUR_GITHUB_USERNAME before your first deployment.
  // STEP 2: When your custom domain is ready, replace this with e.g.
  //         https://blog.yourdomain.com
  site: 'https://blog.datasaaz.com',
  integrations: [sitemap()],
});

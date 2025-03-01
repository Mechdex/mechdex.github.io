import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	preprocess: [vitePreprocess()],
	
	kit: {
		adapter: adapter({
			// Build output goes to 'build'
			pages: 'build',
			assets: 'build',
			// No fallback needed if every route is prerendered;
			// if you want an SPA fallback, set this to 'index.html'
			fallback: null,
			strict: false
		}),
		paths: {
			// No base path so pages are served at the root
			base: ''
		},
		prerender: {
			// Prerender every route (make sure you've configured all dynamic routes)
			default: true
		}
	}
};

export default config;

import { get, writable } from 'svelte/store';
import type { ConciseMechanic, Mechanic, MechanicCategory } from './types';
import { browser } from '$app/environment';
import lunr from 'lunr';
import { prefersReducedMotion } from 'svelte/motion';
import { gsap } from 'gsap/dist/gsap';
import { prefersReducedMotionStore } from '@skeletonlabs/skeleton';

export let searchEngine: lunr.Index;
export let setSearchEngine = (e: lunr.Index) => {
	searchEngine = e;
};

// I'm not sure if syncing to sessionStorage does anything.
// conciseMechanics is the cache of the cards on the home screen, containing just the symbol, title, category and a short description.
// loadedMechanics is the cache of all mechanics.

export function gsap_xto(targets: gsap.TweenTarget, vars: gsap.TweenVars): gsap.core.Tween {
	console.log(get(prefersReducedMotionStore));
	if (get(prefersReducedMotionStore)) {
		return gsap.set(targets, vars);
	}
	return gsap.to(targets, vars);
}

export let conciseMechanics = writable<ConciseMechanic[]>([]);
if (browser) {
	let cache = sessionStorage.getItem('_mechdex_concise_cache');
	if (cache) {
		// console.log('Cache was found for concise mechanics.');
		// console.log(cache);
		try {
			conciseMechanics.set(JSON.parse(cache));
		} catch (e) {
			throw e;
		}
	}
}

export let _currentLoadingCategoryIndex = writable<number>();
export let sidePanelState = writable<'full' | 'split' | 'hidden'>('hidden');
conciseMechanics.subscribe((value) => {
	if (browser) {
		sessionStorage.setItem('_mechdex_concise_cache', JSON.stringify(value) || '[]');
	}
});

export let loadedMechanics = writable<Mechanic[]>([]);
loadedMechanics.subscribe((value) => {
	if (browser) {
		sessionStorage.setItem('_mechdex_mechanic_cache', JSON.stringify(value));
	}
});

export let screenType = writable<'sm' | 'md' | 'lg'>();
export let gridLayoutType = writable<'compact' | 'normal'>('normal');
if (browser) {
	let storedMechanics = sessionStorage.getItem('_mechdex_mechanic_cache');
	let storedConciseMechanics = sessionStorage.getItem('_mechdex_concise_cache');

	if (storedMechanics) {
		loadedMechanics.set(JSON.parse(storedMechanics));
	}
	if (storedConciseMechanics) {
		conciseMechanics.set(JSON.parse(storedConciseMechanics));
	}
}

export let pinnedMechanics = writable<Mechanic[]>([]);

export const mechanicColors: Record<MechanicCategory, string> = {
	Abilities: '#857300', // Dark Blue
	Actions: '#B06204', // Dark Green
	AI: '#D6410B', // Vivid Dark Red
	Audio: '#C40A00', // Deep Burgundy
	Building: '#E00B6F', // Rich Dark Brown
	Camera: '#C915D6', // Dark Teal
	Combat: '#981BFF', // Deep Orange
	Crafting: '#421DFF', // Dark Cyan
	Economy: '#0B70E3', // Dark Mustard
	Exploration: '#047F8A', // Deep Purple
	Input: '#006944', // Blue Grey
	Modding: '#0D820F', // Medium–Dark Grey
	Movement: '#7A6933', // Chocolate Brown
	Multiplayer: '#945D44', // Dark Violet
	Narrative: '#914E7E', // Rich Dark Purple
	Physics: '#8356A3', // Brick Red
	Progression: '#565F94', // Deep Maroon
	Randomness: '#418074', // Charcoal
	Resources: '#4B824A', // Dark Teal–Green
	Social: '#6826FF', // Dark Pink
	UI: '#516E65', // Slate Blue–Grey
	World: '#BF3B56' // Midnight Blue
};

export const mechanics: MechanicCategory[] = [
	'Abilities',
	'Actions',
	'AI',
	'Audio',
	'Building',
	'Camera',
	'Combat',
	'Crafting',
	'Economy',
	'Exploration',
	'Input',
	'Modding',
	'Movement',
	'Multiplayer',
	'Narrative',
	'Physics',
	'Progression',
	'Randomness',
	'Resources',
	'Social',
	'UI',
	'World'
];

import { get, writable } from "svelte/store";
import type { ConciseMechanic, Mechanic, MechanicCategory } from "./types";
import { browser } from "$app/environment";
import yaml from 'js-yaml';

// I'm not sure if syncing to sessionStorage does anything.
// conciseMechanics is the cache of the cards on the home screen, containing just the symbol, title, category and a short description.
// loadedMechanics is the cache of all mechanics.

export let conciseMechanicsCache = writable<ConciseMechanic[]>([]);
conciseMechanicsCache.subscribe((value) => {
    if (browser) {
        sessionStorage.setItem('_mechdex_concise_cache', JSON.stringify(value));
    }
});

export let loadedMechanics = writable<Mechanic[]>([]);
loadedMechanics.subscribe((value) => {
    if (browser) {
        sessionStorage.setItem('_mechdex_mechanic_cache', JSON.stringify(value));
    }
});


if (browser) {
    let storedMechanics = sessionStorage.getItem('_mechdex_mechanic_cache');
    let storedConciseMechanics = sessionStorage.getItem('_mechdex_concise_cache');

    if (storedMechanics) {
        loadedMechanics.set(JSON.parse(storedMechanics));
    }
    if (storedConciseMechanics) {
        loadedMechanics.set(JSON.parse(storedConciseMechanics));
    }
}

export const mechanicColors: Record<MechanicCategory, string> = {
    Abilities:    '#857300', // Dark Blue
    Actions:      '#B06204', // Dark Green
    AI:           '#D6410B', // Vivid Dark Red
    Audio:        '#C40A00', // Deep Burgundy
    Building:     '#E00B6F', // Rich Dark Brown
    Camera:       '#C915D6', // Dark Teal
    Combat:       '#981BFF', // Deep Orange
    Crafting:     '#421DFF', // Dark Cyan
    Economy:      '#0B70E3', // Dark Mustard
    Exploration:  '#047F8A', // Deep Purple
    Input:        '#006944', // Blue Grey
    Modding:      '#0D820F', // Medium–Dark Grey
    Movement:     '#7A6933', // Chocolate Brown
    Multiplayer:  '#945D44', // Dark Violet
    Narrative:    '#914E7E', // Rich Dark Purple
    Physics:      '#8356A3', // Brick Red
    Progression:  '#565F94', // Deep Maroon
    Randomness:   '#418074', // Charcoal
    Resources:    '#4B824A', // Dark Teal–Green
    Social:       '#6826FF', // Dark Pink
    UI:           '#516E65', // Slate Blue–Grey
    World:        '#BF3B56'  // Midnight Blue
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

/**
 * Fetches a mechanic from the server based on the provided symbol and category.
 * If the mechanic is already loaded in the cache, it returns the cached mechanic.
 * Otherwise, it fetches the mechanic from the server, parses the YAML response,
 * and updates the cache with the new mechanic.
 *
 * @param data - An object containing the symbol and category of the mechanic to fetch.
 * @param data.symbol - The symbol of the mechanic to fetch.
 * @param data.category - The category of the mechanic to fetch.
 * @returns A promise that resolves to the fetched mechanic or an error object.
 *          If the mechanic is found in the cache, it returns the cached mechanic.
 *          If the mechanic is fetched from the server, it returns the fetched mechanic.
 *          If an error occurs during fetching or parsing, it returns an error object.
 */
export async function fetchMechanicFromServer(data: { symbol: string, category: MechanicCategory }): Promise<Mechanic | { error: string }> {
    const cachedMechanic = get(loadedMechanics).find((m) => m.symbol === data.symbol);
    if (cachedMechanic) {
        console.log(`Loaded ${data.symbol} from cache.`);
        return cachedMechanic;
    }

    try {
        const response = await fetch(
            `https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/${data.category}/${data.symbol}/mechanic.yaml`
        );
        const responseText = await response.text();
        const parsedMechanic = (yaml.load(responseText) as any).mechanic as Mechanic;

        if (!parsedMechanic || responseText === '404: Not Found') {
            return { error: 'Mechanic not found or failed to load.' };
        }

        loadedMechanics.update((mechanics) => [...mechanics, parsedMechanic]);
        return parsedMechanic;
    } catch (err) {
        return { error: 'Mechanic failed to load.' };
    }
}

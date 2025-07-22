import yaml from 'js-yaml';
import { get } from 'svelte/store';
import { conciseMechanics, loadedMechanics } from './stores';
import {
	type MechanicCategory,
	type Mechanic,
	MECHANIC_CATEGORIES,
	type ConciseMechanic
} from './types';

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

export async function fetchMechanicFromServer(data: {
	symbol: string;
	category: MechanicCategory;
}): Promise<Mechanic | { error: string }> {
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

// Do not touch this this is very very fragile for some reason
export async function populateConciseMechanics() {
    let _conciseMechanics: ConciseMechanic[] = [];

    for (let category of MECHANIC_CATEGORIES) {
        const URL = `https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/${category}/index.json`;

        try {
            const response = await fetch(URL);
            const responseText = await response.text();
            const parsedIndex: { index: Omit<ConciseMechanic, 'category'>[] } = JSON.parse(responseText);
            const indexedMechanics = parsedIndex.index.map((mechanic) => ({
                ...mechanic,
                category
            }));

            _conciseMechanics = _conciseMechanics.concat(indexedMechanics);
            console.log(`Loading ${category}`);
            console.log(parsedIndex);
            console.log(indexedMechanics);

            conciseMechanics.set(get(conciseMechanics).concat(indexedMechanics));
            console.log(get(conciseMechanics));
            console.log('--------------------------------------');
        } catch (error) {
            console.error(`Failed to load mechanics for category ${category}:`, error);
        }
    }

    // conciseMechanics.set(_conciseMechanics);
}

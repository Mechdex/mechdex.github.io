import { get, writable } from "svelte/store";
import type { Mechanic, MechanicCategory } from "./types";
import { browser } from "$app/environment";
import yaml from 'js-yaml';


export let loadedMechanics = writable<Mechanic[]>([]);
loadedMechanics.subscribe((value) => {
    if (browser) {
        sessionStorage.setItem('_mechdex_mechanic_cache', JSON.stringify(value));
    }
});


if (browser) {
    let storedMechanics = sessionStorage.getItem('_mechdex_mechanic_cache');
    if (storedMechanics) {
        loadedMechanics.set(JSON.parse(storedMechanics));
    }
}

export const mechanicColors: Record<MechanicCategory, string> = {
    Abilities: '#512DA8',    // Dark purple
    Actions: '#1976D2',      // Dark blue
    AI: '#2C3E50',          // Dark gray-blue (unchanged)
    Audio: '#E65100',       // Dark deep orange
    Building: '#5D4037',    // Dark brown
    Camera: '#6A1B9A',      // Dark violet
    Combat: '#B71C1C',      // Dark red
    Crafting: '#2E7D32',    // Dark green
    Economy: '#F57F17',     // Dark amber
    Exploration: '#00695C', // Dark teal
    Input: '#263238',       // Very dark blue-gray
    Modding: '#616161',     // Darker gray
    Movement: '#BF360C',    // Deep, dark orange
    Multiplayer: '#1565C0', // Darker blue
    Narrative: '#4A148C',   // Deep purple
    Physics: '#FF8F00',     // Dark amber-orange
    Progression: '#D32F2F', // Dark red
    Randomness: '#757575',  // Medium-dark gray
    Resources: '#1B5E20',   // Very dark green
    Social: '#AD1457',      // Dark pink
    UI: '#00796B',          // Dark teal
    World: '#37474F'        // Dark blue-gray
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

export async function fetchMechanic(data: { symbol: string, category: MechanicCategory }): Promise<Mechanic | { error: string }> {
    let m = get(loadedMechanics).find((m) => m.symbol == data.symbol);
    let error = null;
    let mechanic = null;

    if (!m) {
        try {
            const response = await fetch(
                `https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/${data.category}/${data.symbol}/mechanic.yaml`
            );
            const yamlText = await response.text();
            let m_result = yaml.load(yamlText);
            if (!m_result) {
                error = 'Mechanic failed to load.';
                return { error };
            }

            if (m_result == '404: Not Found') {
                error = 'That mechanic was not found.';
                return { error };
            }
            m_result = m_result as any as Mechanic;
            loadedMechanics.update((mechanics) => [
                ...mechanics,
                (m_result as any).mechanic as Mechanic
            ]);
            mechanic = (m_result as any).mechanic as Mechanic;

            if (!mechanic) {
                return {
                    error: 'Mechanic failed to load (it was nullish).'
                }
            } else {
                return mechanic;
            }
        } catch (err) {
            error = 'Mechanic failed to load.';
            return { error };
        }
    } else {
        console.log(`Loaded ${data.symbol} from cache.`);
        mechanic = m;
        return mechanic;
    }
}

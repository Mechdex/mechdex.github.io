export const MECHANIC_CATEGORIES = [
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
    'World',
] as const;

export type MechanicCategory = typeof MECHANIC_CATEGORIES[number];

export interface Index {
    index: ConciseMechanic[];
}

export interface ConciseMechanic {
    symbol: string,
    name: string,
    category: string,
    short_description: string,
}

export interface Mechanic {
    symbol: string,
    category: MechanicCategory
    name: string,
    short_description: string,
    long_description: string,
    solved_problems: string,
    examples: string[]
}
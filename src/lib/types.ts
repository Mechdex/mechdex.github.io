export type MechanicCategory =
    | 'Abilities'
    | 'Actions'
    | 'AI'
    | 'Audio'
    | 'Building'
    | 'Camera'
    | 'Combat'
    | 'Crafting'
    | 'Economy'
    | 'Exploration'
    | 'Input'
    | 'Modding'
    | 'Movement'
    | 'Multiplayer'
    | 'Narrative'
    | 'Physics'
    | 'Progression'
    | 'Randomness'
    | 'Resources'
    | 'Social'
    | 'UI'
    | 'World';

export interface Index {
    index: ConciseMechanic[];
}

export interface ConciseMechanic {
    symbol: string,
    name: string,
    short_description: string
}

export interface ConciseMechanicCard {
    category: MechanicCategory,
    details: ConciseMechanic
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
import type { Index, MechanicCategory } from "$lib/types";

export const load = ({ params }) => {
    return {
        category: params.category,
        slug: params.slug
    }
}

export const prerender = true;

export async function entries() {
    const mechanicTypes: MechanicCategory[] = [
        'Abilities', 'Actions', 'AI', 'Audio', 'Building', 'Camera', 'Combat', 'Crafting', 'Economy', 'Exploration', 'Input', 'Modding', 'Movement', 'Multiplayer', 'Narrative', 'Physics', 'Progression', 'Randomness', 'Resources', 'Social', 'UI', 'World'
    ];

    const mechanics: { slug: string, category: string }[] = [];

    for (const mechanicType of mechanicTypes) {
        const response = await fetch(`https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/${mechanicType}/index.json`);
        const data: Index = await response.json();
        data.index.forEach(mechanic => {
            mechanics.push({ slug: mechanic.symbol, category: mechanicType });
        });
    }

    // Return an array of objects with a "slug" property
    return mechanics.map(mechanic => ({ slug: mechanic.slug, category: mechanic.category }));
}

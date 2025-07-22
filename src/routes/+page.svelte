<script lang="ts">
	import SearchIcon from '~icons/mdi/search';
	import GridIcon from '~icons/mdi/grid';
	import GridLargeIcon from '~icons/mdi/grid-large';
	import { conciseMechanics, gridLayoutType } from '$lib/stores';
	import { onMount } from 'svelte';
	import { populateConciseMechanics } from '$lib/mechanics';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import type { ConciseMechanic } from '$lib/types';

	async function setupConciseMechanics() {
		let cache = sessionStorage.getItem('_mechdex_concise_cache');
		console.log('Got a cache...');
		console.log(cache);

		try {
			if (cache && JSON.parse(cache).length > 0) {
				conciseMechanics.set(JSON.parse(cache));
			} else {
				await populateConciseMechanics();
			}
		} catch (e) {
			throw e;
		}
	}

	async function initializeDisplay() {
		displayedMechanics = $conciseMechanics;

		displayedMechanics = displayedMechanics.sort(() => Math.random() - 0.5);
		displayedMechanics = displayedMechanics.sort(() => Math.random() - 0.5);
		displayedMechanics = displayedMechanics.sort(() => Math.random() - 0.5);
		displayedMechanics = displayedMechanics.sort(() => Math.random() - 0.5);

		console.log(displayedMechanics);
	}
	onMount(async () => {
		await setupConciseMechanics();
		await initializeDisplay();
		initialLoad = false;
	});

	// State

	let initialLoad = true;
	let displayedMechanics: ConciseMechanic[] = [];
</script>

<div class="flex flex-col w-full h-full p-2 space-y-5">
	<!-- Headers -->
	<div>
		<h1 class="h1 text-primary-500 text-center">Mechdex</h1>
		<h5 class="h5 text-center">Building blocks for your games.</h5>
	</div>

	<!-- Search -->
	<div class="w-full flex flex-row space-x-2">
		<input
			class="input flex-1 outline-none active:border-primary-500 px-3"
			placeholder="Search for a mechanic's title, description, use cases..."
		/>
		<button class="btn variant-filled-primary"
			><SearchIcon style="font-size: 1.2rem;"></SearchIcon></button
		>
		<button
			class="btn variant-filled-secondary"
			title="Toggle compact and normal grid layouts"
			on:click={() => gridLayoutType.set($gridLayoutType == 'normal' ? 'compact' : 'normal')}
		>
			{#if $gridLayoutType == 'compact'}
				<GridLargeIcon style="font-size: 1.2rem; color: rgb(var(--color-surface-900))"
				></GridLargeIcon>
			{:else}
				<GridIcon style="font-size: 1.2rem; color: rgb(var(--color-surface-900))"></GridIcon>
			{/if}
		</button>
	</div>

	<!-- Display grid -->
	<div
		class="w-full max-h-fit h-full overflow-y-auto grid grid-cols-5 gap-4 p-4 rounded-lg bg-surface-800 custom-scrollbar"
	>
		{#each displayedMechanics as mechanic, i (mechanic.symbol)}
			<div animate:flip={{ duration: 400, easing: expoOut }}>
				<div class="w-full h-full aspect-square flex flex-col justify-start col-auto">
					<MechanicCard index={initialLoad ? i : -1} {mechanic} />
				</div>
			</div>
		{/each}
	</div>
</div>

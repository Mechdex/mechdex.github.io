<script lang="ts">
	import SearchIcon from '~icons/mdi/search';
	import GridIcon from '~icons/mdi/grid';
	import GridLargeIcon from '~icons/mdi/grid-large';
	import {
		_currentLoadingCategoryIndex,
		activeSearch,
		conciseMechanics,
		conciseMinisearch,
		gridLayoutType,
		mechanicColors
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import { populateConciseMechanics } from '$lib/mechanics';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import { MECHANIC_CATEGORIES, type ConciseMechanic } from '$lib/types';
	import { get } from 'svelte/store';
	import { ProgressBar } from '@skeletonlabs/skeleton';

	async function setupConciseMechanics() {
		let cache = sessionStorage.getItem('_mechdex_concise_cache');
		console.log('Got a cache...');
		console.log(cache);

		try {
			if (cache && JSON.parse(cache).length > 0) {
				conciseMechanics.set(JSON.parse(cache));
			} else {
				await populateConciseMechanics();
				console.log('Adding to search.');
				console.log(get(conciseMechanics));
				conciseMinisearch.addAll(get(conciseMechanics));
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

		num_cols = M_COL(window.innerWidth);
		console.log('Cols: ', num_cols);
	}

	function startMechanicSearch() {
		let e = activeSearch();
		let res = e.search(inputStage);

		console.log(res);
		displayedMechanics = res as unknown as ConciseMechanic[];
	}
	onMount(async () => {
		await setupConciseMechanics();
		await initializeDisplay();
		initialLoad = false;
	});

	// State

	let initialLoad = $state(true);
	let displayedMechanics = $state<ConciseMechanic[]>([]);
	let outerGridWidth = $state(0);
	let num_cols = $derived(
		$gridLayoutType == 'compact'
			? parseInt((outerGridWidth / 269).toString()) + 2
			: parseInt((outerGridWidth / 269).toString())
	);

	let M_COL = (x: number) => parseInt(Math.floor(0.0051 * x + -2).toString());
	let inputStage = $state('');
</script>

<svelte:window onresize={() => (num_cols = M_COL(window.innerWidth))} />
<div class="flex flex-col w-full h-full p-2 space-y-5">
	<!-- Headers -->
	<div>
		<h1 class="h1 text-primary-500 text-center">Mechdex</h1>
		<h5 class="h5 text-center">Building blocks for your games.</h5>
	</div>

	<!-- Search -->
	<div class="w-full flex flex-row space-x-2">
		<!-- svelte-ignore component_name_lowercase -->
		<input
			onkeydown={(e) => e.key == 'ENTER' && startMechanicSearch()}
			class="input flex-1 outline-none active:border-primary-500 px-3"
			bind:value={inputStage}
			placeholder="Search for a mechanic's title, description, use cases..."
		/>
		<button class="btn variant-filled-primary" onclick={startMechanicSearch}
			><SearchIcon style="font-size: 1.2rem;"></SearchIcon></button
		>
		<button
			class="btn variant-filled-secondary"
			title="Toggle compact and normal grid layouts"
			onclick={() => gridLayoutType.set($gridLayoutType == 'normal' ? 'compact' : 'normal')}
		>
			{#if $gridLayoutType == 'compact'}
				<GridLargeIcon style="font-size: 1.2rem; color: rgb(var(--color-surface-900))"
				></GridLargeIcon>
			{:else}
				<GridIcon style="font-size: 1.2rem; color: rgb(var(--color-surface-900))"></GridIcon>
			{/if}
		</button>
	</div>

	{#if initialLoad}
		<!-- <p>
			Loading mechanics for <span
				style={`color: ${mechanicColors[MECHANIC_CATEGORIES[$_currentLoadingCategoryIndex]]}`}
				>{MECHANIC_CATEGORIES[$_currentLoadingCategoryIndex]}</span
			>...
		</p> -->
		<p>Loading mechanics...</p>
		<ProgressBar
			meter="bg-primary-500"
			value={$_currentLoadingCategoryIndex}
			max={MECHANIC_CATEGORIES.length}
		></ProgressBar>
	{/if}
	<!-- Display grid -->

	<div
		bind:clientWidth={outerGridWidth}
		style={`grid-template-columns: repeat(${num_cols}, minmax(0, 1fr))`}
		class={`w-full max-h-fit h-full overflow-y-auto grid  gap-4 p-4 rounded-lg bg-surface-800 custom-scrollbar`}
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

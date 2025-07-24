<script lang="ts">
	import SearchIcon from '~icons/mdi/search';
	import GridIcon from '~icons/mdi/grid';
	import GridLargeIcon from '~icons/mdi/grid-large';
	import SelectAllIcon from '~icons/mdi/select-all';
	import MagnifyIcon from '~icons/mdi/magnify';
	import {
		_currentLoadingCategoryIndex,
		conciseMechanics,
		gridLayoutType,
		searchEngine,
		mechanicColors,
		setSearchEngine
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import { populateConciseMechanics } from '$lib/mechanics';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import { MECHANIC_CATEGORIES, type ConciseMechanic } from '$lib/types';
	import { get } from 'svelte/store';
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import lunr from 'lunr';
	import { fly } from 'svelte/transition';

	async function setupConciseMechanics() {
		const response = fetch(
			`https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/static/search_index.json`
		);
		const responseText = response.then(async (r) => {
			let j = await r.json();
			console.log(j);
			setSearchEngine(lunr.Index.load(j));
		});

		let cache = sessionStorage.getItem('_mechdex_concise_cache');
		// console.log('Got a cache...');
		// console.log(cache);

		try {
			if (cache && JSON.parse(cache).length > 0) {
				conciseMechanics.set(JSON.parse(cache));
			} else {
				await populateConciseMechanics();
				console.log('Adding to search.');
				console.log(get(conciseMechanics));
			}
		} catch (e) {
			throw e;
		}
	}

	async function initializeDisplay() {
		setMechanics(shuffleMechanics($conciseMechanics));

		// console.log(displayedMechanics);

		num_cols = M_COL(window.innerWidth);
		// console.log('Cols: ', num_cols);
	}

	function startMechanicSearch() {
		console.log('Starting search');
		_currentSearchTerm = inputStage;

		if (inputStage == '') {
			setMechanics($conciseMechanics);
			return;
		}
		let e = searchEngine;
		let res = e.search(inputStage);
		let mechanicsRefs = res;
		console.log(mechanicsRefs);

		if (mechanicsRefs.length == 0) {
			console.log('No refs found.');
			displayedMechanics = [];
			return;
		}
		console.log('Refs found ^');
		setMechanics(
			mechanicsRefs.map((m) => {
				let mech = get(conciseMechanics).find((p) => p.symbol == m.ref);

				if (!mech) {
					throw `Mechanic with symbol ${m.ref} was not found.`;
				}
				return mech;
			})
		);
		console.log('Found:');
		console.log(displayedMechanics);
	}

	function shuffleMechanics(mechanics: ConciseMechanic[]) {
		mechanics = mechanics.sort(() => Math.random() - 0.5);
		mechanics = mechanics.sort(() => Math.random() - 0.5);
		mechanics = mechanics.sort(() => Math.random() - 0.5);
		mechanics = mechanics.sort(() => Math.random() - 0.5);

		// Yep this is the fastest way I found :D don't sue me

		return mechanics;
	}

	function setMechanics(mechanics: ConciseMechanic[] | null) {
		if (mechanics === null) {
			startMechanicSearch();
			return;
		}
		displayedMechanics = mechanics;

		displayedMechanics = displayedMechanics.filter((p) => {
			let validCategories = [];

			for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
				if (activeCategoryFilters[i]) {
					validCategories.push(MECHANIC_CATEGORIES[i]);
				}
			}

			return validCategories.includes(p.category);
		});
	}

	function _toggleSelectAllCategories() {
		let newState = !activeCategoryFilters[0];
		for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
			activeCategoryFilters[i] = newState;
		}

		setMechanics(null);
	}
	onMount(async () => {
		for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
			activeCategoryFilters[i] = true;
		}
		await setupConciseMechanics();
		await initializeDisplay();

		initialLoad = false;
	});

	// State

	let initialLoad = $state(true);
	let displayedMechanics = $state<ConciseMechanic[]>([]);
	let activeCategoryFilters: Record<number, boolean> = $state({});
	let outerGridWidth = $state(0);
	let num_cols = $derived(
		$gridLayoutType == 'compact'
			? parseInt((outerGridWidth / 250).toString()) + 2
			: parseInt((outerGridWidth / 250).toString())
	);

	let M_COL = (x: number) => parseInt(Math.floor(0.0051 * x + -2).toString());
	let inputStage = $state('');
	let _numActiveCategoriesSelected = $derived.by(() => {
		let activated = 0;

		for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
			if (activeCategoryFilters[i]) {
				activated += 1;
			}
		}

		return activated;
	});
	let _allActiveCategoriesSelected = $derived(
		_numActiveCategoriesSelected == MECHANIC_CATEGORIES.length
	);
	let _currentSearchTerm = $state('');

	function toggleMechanicCategoryFilter(i: number) {
		console.log('Hm');
		console.log(activeCategoryFilters);
		activeCategoryFilters[i] = !activeCategoryFilters[i];
		setMechanics(null);
	}
</script>

<svelte:window onresize={() => (num_cols = M_COL(window.innerWidth))} />
<div class="flex flex-col w-full h-full p-2 space-y-6 custom-scrollbar overflow-y-scroll">
	<!-- Headers -->
	<div>
		<h1 class="h1 text-primary-500 text-center">Mechdex</h1>
		<h5 class="h5 text-center">Building blocks for your games.</h5>
	</div>

	<!-- Search -->
	<div class="w-full flex flex-row space-x-2 sticky top-0 z-10">
		<!-- svelte-ignore component_name_lowercase -->
		<input
			onkeydown={(e) => e.key == 'Enter' && startMechanicSearch()}
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

	<!-- Filter chips -->

	<div class="overflow-x-auto custom-scrollbar pb-[4rem] px-2 overflow-y-hidden">
		<div class="inline-flex w-max items-center space-x-4">
			<!-- svelte-ignore component_name_lowercase -->
			<button
				class="btn variant-ringed-primary flex-shrink-0"
				onclick={_toggleSelectAllCategories}
				style={`background-color: ${_allActiveCategoriesSelected ? 'rgb(var(--color-primary-500))' : 'transparent'}`}
			>
				<!-- Ensure your icon component has a defined size, e.g., with a class like `h-5 w-5` -->
				<SelectAllIcon style="font-size: 1.2rem;"></SelectAllIcon>
			</button>
			{#each MECHANIC_CATEGORIES as category, i}
				<button
					class="btn flex-shrink-0"
					onclick={() => toggleMechanicCategoryFilter(i)}
					style={`background-color: ${activeCategoryFilters[i] ? mechanicColors[category] : 'transparent'}; border: solid 1px ${mechanicColors[category]}`}
				>
					{category}
				</button>
			{/each}
		</div>
	</div>

	<p></p>
	{#if initialLoad}
		<!-- <p>
			Loading mechanics for <span
				style={`color: ${mechanicColors[MECHANIC_CATEGORIES[$_currentLoadingCategoryIndex]]}`}
				>{MECHANIC_CATEGORIES[$_currentLoadingCategoryIndex]}</span
			>...
		</p> -->
		<p>Loading mechanics...</p>
		<ProgressBar meter="bg-primary-500" max={MECHANIC_CATEGORIES.length}></ProgressBar>
	{/if}
	<!-- Display grid -->

	<div
		bind:clientWidth={outerGridWidth}
		style={`grid-template-columns: repeat(${num_cols}, minmax(0, 1fr));`}
		class={`auto-rows-min w-full max-h-fit h-full grid gap-4 p-4 rounded-lg bg-surface-800 relative`}
	>
		{#each displayedMechanics as mechanic, i (mechanic.symbol)}
			<div animate:flip={{ duration: 400, easing: expoOut }}>
				<div class="w-full h-full aspect-square flex flex-col justify-start col-auto">
					<MechanicCard index={initialLoad ? i : -1} {mechanic} {initialLoad} />
				</div>
			</div>
		{/each}
		{#if displayedMechanics.length == 0}
			<div class="absolute w-full h-full flex flex-col items-center justify-center space-y-8">
				<MagnifyIcon font-size="6rem" class="text-surface-500"></MagnifyIcon>

				{#if _numActiveCategoriesSelected == 0}
					<div class="w-full h-fit text-center space-y-4">
						<h1 class="h1 text-surface-300">No categories selected.</h1>
						<h4 class="h4 text-surface-300">Select a category to continue.</h4>
					</div>
				{:else if _currentSearchTerm}
					<div class="w-full h-fit text-center space-y-4">
						<h1 class="h1 text-surface-300">
							No mechanics found based on "<span
								class="underline underline-offset-2 decoration-4 decoration-secondary-500"
								>{_currentSearchTerm}</span
							>", with {_numActiveCategoriesSelected} category filters.
						</h1>
						<h4 class="h4 text-surface-300">
							Try again with a different search term, category set, or <a
								href="/contribute"
								class="underline underline-offset-2 decoration-4 decoration-primary-500"
								>contribute a new mechanic</a
							>.
						</h4>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import SearchIcon from '~icons/mdi/search';
	import GridIcon from '~icons/mdi/grid';
	import GridLargeIcon from '~icons/mdi/grid-large';
	import SelectAllIcon from '~icons/mdi/select-all';
	import PinIcon from '~icons/mdi/pin';
	import MagnifyIcon from '~icons/mdi/magnify';
	import ChevronLeftIcon from '~icons/mdi/chevron-left';
	import ChevronRightIcon from '~icons/mdi/chevron-right';
	import CloseIcon from '~icons/mdi/close';
	import {
		_currentLoadingCategoryIndex,
		conciseMechanics,
		gridLayoutType,
		searchEngine,
		mechanicColors,
		setSearchEngine,
		screenType,
		sidePanelState
	} from '$lib/stores';
	import { onMount, tick } from 'svelte';
	import { fetchMechanicFromServer, populateConciseMechanics } from '$lib/mechanics';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import {
		MECHANIC_CATEGORIES,
		type ConciseMechanic,
		type Mechanic,
		type MechanicCategory
	} from '$lib/types';
	import { get } from 'svelte/store';
	import { filter, ProgressBar } from '@skeletonlabs/skeleton';
	import lunr from 'lunr';
	import { fade, fly, scale } from 'svelte/transition';
	import { Flip } from 'gsap/dist/Flip';
	import { gsap } from 'gsap/dist/gsap';

	import fitty from 'fitty';

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

	function updateScreenType() {
		const width = window.innerWidth;
		if (width < 640) {
			screenType.set('sm');
		} else if (width < 1024) {
			screenType.set('md');
		} else {
			screenType.set('lg');
		}
	}

	async function initializeDisplay() {
		refreshMechanics(shuffleMechanics($conciseMechanics));

		updateGridSize();
	}

	function startMechanicSearch(): ConciseMechanic[] {
		console.log('Starting search');
		_currentSearchTerm = inputStage;

		if (inputStage == '') {
			console.log('Stage was null, using all mechanics');
			console.log('Completed search.');
			return $conciseMechanics;
		}
		let e = searchEngine;
		let sT = Date.now();
		let res = e.search(inputStage);
		console.log(Date.now() - sT);
		let mechanicsRefs = res;
		console.log(mechanicsRefs);

		if (mechanicsRefs.length == 0) {
			console.log('No refs found.');
			return [];
		}
		console.log('Refs found ^');

		return (
			mechanicsRefs.map((m) => {
				let mech = get(conciseMechanics).find((p) => p.symbol == m.ref);

				if (!mech) {
					throw `Mechanic with symbol ${m.ref} was not found.`;
				}
				return mech;
			}) ?? []
		);
	}

	function shuffleMechanics(mechanics: ConciseMechanic[]) {
		mechanics = mechanics.sort(() => Math.random() - 0.5);
		mechanics = mechanics.sort(() => Math.random() - 0.5);
		mechanics = mechanics.sort(() => Math.random() - 0.5);
		mechanics = mechanics.sort(() => Math.random() - 0.5);

		// Yep this is the fastest way I found :D don't sue me

		return mechanics;
	}

	async function onMechanicClick(mechanic: { symbol: string; category: MechanicCategory }) {
		let m = await fetchMechanicFromServer({ symbol: mechanic.symbol, category: mechanic.category });

		if ('error' in m && m.error) {
			throw m.error;
		}
		_currentDisplayedMechanic = m as Mechanic;
		console.log(m);

		if ($sidePanelState == 'hidden') {
			await setSidePanelState('split');
		}
	}
	function refreshMechanics(mechanics?: ConciseMechanic[]) {
		console.log('Setting mechanics');
		displayedMechanics = mechanics || startMechanicSearch();

		displayedMechanics = displayedMechanics.filter((p) => {
			let validCategories = [];

			for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
				if (activeCategoryFilters[i]) {
					validCategories.push(MECHANIC_CATEGORIES[i]);
				}
			}

			return validCategories.includes(p.category);
		});

		console.log('Finished setting all mechanics.');
	}

	function _toggleSelectAllCategories(e: UIEvent) {
		e.stopPropagation(); // Without this, the event handler is called twice. Thanks, Vite!
		console.log(new Error().stack);
		console.log('Toggle select all categories');

		let newState = !activeCategoryFilters[0];
		console.log('Setting all to ', newState);
		for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
			activeCategoryFilters[i] = newState;
		}

		// setMechanics(null);
		refreshMechanics();
		console.log('Toggled.');
	}
	onMount(async () => {
		updateScreenType();

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
	let num_cols = $state(2);

	let filterChipNavDiv: HTMLDivElement;
	let M_COL = (x: number) => parseInt(Math.floor(0.0055 * x + -2).toString());
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
	let _filterChipNavDivScroll = $state(0);
	let _currentDisplayedMechanic: Mechanic | undefined = $state();

	function toggleMechanicCategoryFilter(i: number) {
		console.log(activeCategoryFilters);
		activeCategoryFilters[i] = !activeCategoryFilters[i];
		// setMechanics(null);
		refreshMechanics();
	}

	function _onFilterChipNavDivScroll() {
		if (!filterChipNavDiv) return 0;
		_filterChipNavDivScroll =
			filterChipNavDiv.scrollLeft / (filterChipNavDiv.scrollWidth - filterChipNavDiv.clientWidth);
	}

	function _setFilterChipNavScroll(finalValue: number) {
		if (!filterChipNavDiv) return;

		filterChipNavDiv.scrollTo({
			left: finalValue * (filterChipNavDiv.scrollWidth - filterChipNavDiv.clientWidth),
			behavior: 'smooth'
		});
	}

	function updateGridSize() {
		if ($sidePanelState == 'hidden') {
			num_cols = $screenType == 'sm' ? 2 : M_COL(window.innerWidth);
		} else {
			num_cols = $screenType == 'md' ? 2 : 3;
		}
	}

	async function setSidePanelState(state: 'hidden' | 'full' | 'split') {
		let _oldState = Flip.getState('.side-panel');
		$sidePanelState = state;
		updateGridSize();
		await tick();
		await new Promise((r) => setTimeout(r, 0));
		fitty('.mechanic-heading', { minSize: 10, maxSize: 50 });
		gsap.set('.side-panel', {
			opacity: state == 'hidden' ? '100%' : '0%',
			ease: 'expo',
			duration: 0.4
		});
		gsap.to('.main-panel', { width: state == 'hidden' ? '100%' : '50%', ease: 'expo' });
		gsap.to('.side-panel', {
			opacity: state == 'hidden' ? '0%' : '100%',
			ease: 'expo',
			duration: 0.4,
			delay: 0.1
		});
	}
</script>

<svelte:window onresize={() => updateGridSize()} />
<div
	class="custom-scrollbar relative flex h-full w-full flex-row space-x-4 overflow-x-hidden overflow-y-hidden p-2"
>
	<div
		class="main-panel custom-scrollbar z-30 flex flex-col space-y-6 overflow-x-hidden overflow-y-scroll bg-surface-900 p-2"
	>
		<!-- Headers -->
		<div>
			<h1 class="h1 text-center text-primary-500">Mechdex</h1>
			<h5 class="h5 text-center">Building blocks for your games.</h5>
		</div>

		<!-- Search -->
		<div class="sticky top-0 z-40 flex w-full flex-row space-x-2">
			<!-- svelte-ignore component_name_lowercase -->
			<input
				onkeydown={(e) => e.key == 'Enter' && refreshMechanics()}
				class="input flex-1 px-3 outline-none active:border-primary-500"
				bind:value={inputStage}
				placeholder="Search for a mechanic's title, description, use cases..."
			/>
			<button class="variant-filled-primary btn" onclick={() => refreshMechanics()}
				><SearchIcon style="font-size: 1.2rem;"></SearchIcon></button
			>
			{#if $screenType != 'sm'}
				<button
					class="variant-filled-secondary btn"
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
			{/if}
		</div>

		<!-- Filter chips -->

		<div class="relative">
			<div
				class="custom-scrollbar shrink-0 overflow-x-auto overflow-y-hidden p-4 px-0"
				bind:this={filterChipNavDiv}
				onscroll={_onFilterChipNavDivScroll}
			>
				{#if _filterChipNavDivScroll > 0}
					<button
						transition:fly={{ x: -20, easing: expoOut }}
						onclick={(e) => {
							e.stopPropagation();
							_setFilterChipNavScroll(0);
						}}
						class="absolute left-0 z-20 w-fit rounded-full bg-slate-800 shadow-xl shadow-black active:scale-90"
					>
						<ChevronLeftIcon style="font-size: 2rem;" />
					</button>
				{/if}
				{#if _filterChipNavDivScroll < 1}
					<button
						transition:fly={{ x: 20, easing: expoOut }}
						onclick={(e) => {
							e.stopPropagation();
							_setFilterChipNavScroll(1);
						}}
						class="absolute right-0 z-20 w-fit rounded-full bg-slate-800 shadow-xl shadow-black active:scale-90"
					>
						<ChevronRightIcon style="font-size: 2rem;" />
					</button>
				{/if}
				<div class="inline-flex w-max items-center space-x-4">
					<!-- svelte-ignore component_name_lowercase -->
					<button
						class="variant-ringed-primary btn flex-shrink-0"
						onclick={_toggleSelectAllCategories}
						style={`background-color: ${_allActiveCategoriesSelected ? 'rgb(var(--color-primary-500))' : 'transparent'}`}
					>
						<SelectAllIcon style="font-size: 1.2rem;"></SelectAllIcon>
					</button>
					{#each MECHANIC_CATEGORIES as category, i}
						<button
							class="btn flex-shrink-0"
							onclick={(e) => {
								e.stopPropagation(); // Thanks for calling my event handler twice every 3rd click, Vite/Svelte/Rich Harris!
								toggleMechanicCategoryFilter(i);
							}}
							style={`background-color: ${activeCategoryFilters[i] ? mechanicColors[category] : 'transparent'}; border: solid 1px ${mechanicColors[category]}`}
						>
							{category}
						</button>
					{/each}
				</div>
			</div>
		</div>
		<p>
			Displaying <b>{displayedMechanics.length}</b>
			mechanic{#if displayedMechanics.length != 1}s{/if}
			for {#if _currentSearchTerm}"<span
					class="underline decoration-primary-500 decoration-2 underline-offset-2"
					>{_currentSearchTerm}</span
				>" and <b>{_numActiveCategoriesSelected}</b> categories.
			{:else}<b>{_numActiveCategoriesSelected}</b> categories.{/if}
		</p>
		{#if initialLoad}
			<p>Loading mechanics...</p>
			<ProgressBar meter="bg-primary-500" max={MECHANIC_CATEGORIES.length}></ProgressBar>
		{/if}
		<!-- Display grid -->

		<div
			bind:clientWidth={outerGridWidth}
			style="grid-template-columns: repeat({num_cols}, minmax(0, 1fr));"
			class={`relative grid h-full max-h-fit w-full auto-rows-min grid-cols-1 gap-4 rounded-lg bg-surface-800 p-4`}
		>
			{#each displayedMechanics as mechanic, i (mechanic.symbol)}
				<div animate:flip={{ duration: 400, easing: expoOut }}>
					<div class="col-auto flex aspect-square h-full w-full flex-col justify-start">
						<MechanicCard
							onclick={onMechanicClick}
							index={initialLoad ? i : -1}
							{mechanic}
							{initialLoad}
						/>
					</div>
				</div>
			{/each}
			{#if displayedMechanics.length == 0}
				<div class="absolute flex h-full w-full flex-col items-center justify-center space-y-8">
					<MagnifyIcon font-size="6rem" class="text-surface-500"></MagnifyIcon>

					{#if _numActiveCategoriesSelected == 0}
						<div class="h-fit w-full space-y-4 text-center">
							<h1 class="h1 text-surface-300">No categories selected.</h1>
							<h4 class="h4 text-surface-300">Select a category to continue.</h4>
						</div>
					{:else if _currentSearchTerm}
						<div class="h-fit w-full space-y-4 text-center">
							<h2 class="h2 text-surface-300">
								No mechanics found based on "<span
									class="underline decoration-secondary-500 decoration-4 underline-offset-2"
									>{_currentSearchTerm}</span
								>", with {_numActiveCategoriesSelected} category filters.
							</h2>
							<h4 class="h4 text-surface-300">
								Try again with a different search term, category set, or <a
									href="/contribute"
									class="underline decoration-primary-500 decoration-4 underline-offset-2"
									>contribute a new mechanic</a
								>.
							</h4>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<div
		style="width: {$sidePanelState != 'hidden' ? 100 : 0}%"
		class="custom-scrollbar side-panel absolute h-full overflow-hidden overflow-y-auto rounded-lg p-0"
	>
		{#if _currentDisplayedMechanic}
			<div class="absolute right-0 z-0 flex h-full w-[50%] flex-row">
				<div
					class="custom-scrollbar flex h-full max-h-full w-full flex-1 flex-col items-center overflow-y-auto rounded-lg bg-surface-800 p-10"
				>
					<flex
						class="h-full w-full flex-col items-center justify-center space-y-4 rounded-lg px-4"
					>
						<div class="flex w-full flex-col items-center justify-center space-y-4 rounded">
							<h1
								class="h3 inline-block rounded-lg"
								style:color={mechanicColors[_currentDisplayedMechanic.category]}
							>
								{_currentDisplayedMechanic.category}
							</h1>
							<h1
								class="mechanic-heading h1 inline-flex flex-row items-center justify-center space-x-2"
							>
								<span class="text-nowrap">{_currentDisplayedMechanic.name}</span> /
								<span
									class="rounded-lg p-2"
									style:background-color={mechanicColors[_currentDisplayedMechanic.category]}
									>{_currentDisplayedMechanic.symbol}</span
								>
							</h1>
							<h2 class="h4 text-center font-light">
								{_currentDisplayedMechanic.short_description}
							</h2>
						</div>
						<hr class="!my-8 !border-primary-500" />
						<article
							class="prose h-fit prose-h2:text-primary-500 prose-p:text-white prose-li:text-white prose-li:marker:text-primary-500"
						>
							<h2 class="h2">Description</h2>
							<p>{_currentDisplayedMechanic.long_description}</p>
							<h2 class="h2">Problems Solved by this Mechanic</h2>
							<p>{_currentDisplayedMechanic.solved_problems}</p>
						</article>
					</flex>
					<article class=""></article>
				</div>
				<div class="m-2 flex h-full shrink-0 flex-col space-y-2">
					<button
						onclick={() => setSidePanelState('hidden')}
						class="h-fit w-fit rounded-full p-2 transition-all hover:bg-surface-700 hover:brightness-110"
						><CloseIcon color="rgb(var(--color-primary-500))" font-size="1.2rem" /></button
					>
					<button
						class="h-fit w-fit rounded-full p-2 transition-all hover:bg-surface-700 hover:brightness-110"
						><PinIcon font-size="1.2rem" /></button
					>
				</div>
			</div>
		{/if}
	</div>
</div>

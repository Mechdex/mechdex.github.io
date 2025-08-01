<script lang="ts">
	import ReadingPanel from '../lib/Components/ReadingPanel.svelte';

	// Svelte/SvelteKit Imports
	import { onMount, tick } from 'svelte';

	// Library Imports
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { gsap } from 'gsap/dist/gsap';
	import lunr from 'lunr';
	import fitty from 'fitty';
	import { popup, ProgressBar } from '@skeletonlabs/skeleton';
	import { marked } from 'marked';

	// Internal Project Imports ($lib)
	import {
		conciseMechanics,
		gridLayoutType,
		gsap_xto,
		mechanicColors,
		pinnedMechanics,
		screenType,
		searchEngine,
		setSearchEngine,
		sidePanelState
	} from '$lib/stores';
	import { fetchMechanicFromServer, populateConciseMechanics } from '$lib/mechanics';
	import { MECHANIC_CATEGORIES, type ConciseMechanic, type Mechanic } from '$lib/types';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';

	// Icon Imports
	import SearchIcon from '~icons/mdi/search';
	import GridIcon from '~icons/mdi/grid';
	import GridLargeIcon from '~icons/mdi/grid-large';
	import SelectAllIcon from '~icons/mdi/select-all';
	import MagnifyIcon from '~icons/mdi/magnify';
	import ChevronLeftIcon from '~icons/mdi/chevron-left';
	import ChevronRightIcon from '~icons/mdi/chevron-right';
	import CloseIcon from '~icons/mdi/close';
	import PinIcon from '~icons/mdi/pin';
	import HammerWrenchIcon from '~icons/mdi/hammer-wrench';
	import ChevronDoubleLeftIcon from '~icons/mdi/chevron-double-left';
	import ChevronDoubleRightIcon from '~icons/mdi/chevron-double-right';
	import { prefersReducedMotionStore } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	// --- SVELTE 5 STATE ---

	let initialLoad = $state(true);
	let displayedMechanics = $state<ConciseMechanic[]>([]);
	let activeCategoryFilters: Record<number, boolean> = $state({});
	let num_cols = $state(2);
	let inputStage = $state('');
	let currentSearchTerm = $state('');
	let currentDisplayedMechanic: Mechanic | undefined = $state();

	// Element Bindings & UI State
	let filterChipNavDiv: HTMLDivElement;
	let filterChipNavScrollPercent = $state(0);
	let isSidePanelChanging = $state(false);
	let outerGrid: HTMLDivElement;
	let getOuterGridWidth = () => outerGrid?.clientWidth || 0;

	// --- DERIVED STATE ---

	const numActiveCategoriesSelected = $derived(
		Object.values(activeCategoryFilters).filter(Boolean).length
	);
	const allCategoriesSelected = $derived(
		numActiveCategoriesSelected === MECHANIC_CATEGORIES.length
	);

	// --- LIFECYCLE ---

	onMount(async () => {
		updateScreenType();

		// Initialize all category filters to true
		for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
			activeCategoryFilters[i] = true;
		}

		await setupDataAndSearch();
		refreshDisplayedMechanics();
		updateGridSize();

		initialLoad = false;
	});

	// --- DATA & INITIALIZATION ---

	async function setupDataAndSearch() {
		// Asynchronously fetch and load the search index
		fetch(
			`https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/static/search_index.json`
		)
			.then((res) => res.json())
			.then((indexJSON) => setSearchEngine(lunr.Index.load(indexJSON)))
			.catch(console.error);

		// Attempt to load mechanics from session cache, otherwise fetch from server
		const cache = sessionStorage.getItem('_mechdex_concise_cache');
		try {
			if (cache) {
				try {
					if (JSON.parse(cache).length > 0) {
						// console.log('Using cache');
						conciseMechanics.set(JSON.parse(cache));
					} else {
						// console.log('No cache');
						await populateConciseMechanics();
					}
				} catch (e) {
					console.error(e);
					await populateConciseMechanics();
				}
			} else {
				// console.log('No cache');
				await populateConciseMechanics();
			}
		} catch (e) {
			console.error('Failed to parse cache or populate mechanics', e);
			await populateConciseMechanics(); // Fallback
		}
	}

	function searchMechanics(): ConciseMechanic[] {
		if (!inputStage.trim()) {
			return $conciseMechanics;
		}

		const results = searchEngine.search(inputStage);
		// console.log('Results for search:');
		// console.log(results);
		if (results.length === 0) {
			return [];
		}

		const mechanicsMap = new Map($conciseMechanics.map((m) => [m.symbol, m]));
		// console.log('Mechanics are: ', $conciseMechanics);
		// console.log();
		return results.map((r) => mechanicsMap.get(r.ref)) as ConciseMechanic[];
	}

	function shuffleMechanics(mechanics: ConciseMechanic[]): ConciseMechanic[] {
		const array = [...mechanics];
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]]; // Swap elements
		}
		return array;
	}
	// --- UI LOGIC & EVENT HANDLERS ---

	function refreshDisplayedMechanics() {
		currentSearchTerm = inputStage;
		let mechanics = searchMechanics();
		// console.log('While refreshing, ');
		// console.log(mechanics);
		// Shuffle the full list when not searching. Search results are relevance-ordered.
		if (!currentSearchTerm.trim()) {
			mechanics = shuffleMechanics(mechanics);
		}

		// Filter by active categories
		const activeCategories = new Set(
			MECHANIC_CATEGORIES.filter((_, i) => activeCategoryFilters[i])
		);
		displayedMechanics = mechanics.filter((m) => activeCategories.has(m.category));
	}

	function handleCategoryFilterToggle(e: UIEvent, index: number) {
		e.stopPropagation();
		activeCategoryFilters[index] = !activeCategoryFilters[index];
		refreshDisplayedMechanics();
	}

	function openModalForMechanic(mechanic: Mechanic) {
		modalStore.trigger({
			type: 'component',
			backdropClasses: '!overflow-y-auto custom-scrollbar',
			modalClasses: '',
			component: {
				ref: ReadingPanel,

				props: {
					currentDisplayedMechanic: mechanic,
					setSidePanelState,
					asModal: true
				}
			}
		});
	}
	function handleSelectAllCategories(e: UIEvent) {
		e.stopPropagation();
		const newState = !allCategoriesSelected;
		for (let i = 0; i < MECHANIC_CATEGORIES.length; i++) {
			activeCategoryFilters[i] = newState;
		}
		refreshDisplayedMechanics();
	}

	async function handleMechanicClick(mechanic: ConciseMechanic) {
		const m = await fetchMechanicFromServer(mechanic);
		if ('error' in m && m.error) {
			console.log(m.error);
			console.error(m.content);
			return;
		}

		if ($screenType == 'sm') {
			openModalForMechanic(m as Mechanic);
			return;
		}
		currentDisplayedMechanic = m as Mechanic;
		await tick();
		if ($sidePanelState === 'hidden') {
			await setSidePanelState('split');
		}
	}

	async function setSidePanelState(state: 'hidden' | 'full' | 'split') {
		$sidePanelState = state;
		isSidePanelChanging = true;
		updateGridSize();

		await tick();

		fitty('.mechanic-heading', { minSize: 10, maxSize: 50 });

		if (state == 'hidden') {
			gsap_xto('.main-panel', {
				width: state === 'hidden' ? '100%' : '50%',
				opacity: 1,
				ease: 'expo.out',
				duration: 0.6
			})
				.then(() => {
					isSidePanelChanging = false;
					fitty.fitAll();
				})
				.then((r) => {
					gsap_xto('.side-panel', {
						opacity: state === 'hidden' ? 0 : 1,
						width: '50%',
						ease: 'expo.out',
						duration: 0.6,
						delay: 0.1
					});
				});
		} else if (state == 'split') {
			gsap_xto('.main-panel', {
				width: '50%',
				opacity: 1,

				ease: 'expo.out',
				duration: 0.6
			}).then(() => {
				isSidePanelChanging = false;
				fitty.fitAll();
			});
			gsap_xto('.side-panel', {
				opacity: 1,
				width: '50%',
				ease: 'expo.out',
				duration: 0.6,
				delay: 0.1
			});
		} else {
			gsap_xto('.main-panel', {
				width: '0%',
				opacity: 0,
				ease: 'expo.out',
				duration: 0.6
			}).then(() => {
				isSidePanelChanging = false;
				fitty.fitAll();
			});
			gsap_xto('.side-panel', {
				opacity: 1,
				width: '100%',

				ease: 'expo.out',
				duration: 0.6,
				delay: 0.1
			});
		}
	}

	function updateGridSize() {
		if ($sidePanelState === 'hidden') {
			num_cols = $screenType === 'sm' ? 2 : Math.max(1, Math.floor(0.0055 * window.innerWidth - 2));
		} else {
			num_cols = Math.floor(
				($screenType === 'sm' ? 2 : Math.max(1, Math.floor(0.0055 * window.innerWidth - 2))) / 2
			);
		}

		if ($gridLayoutType == 'compact') {
			if ($sidePanelState === 'hidden') {
				num_cols += $screenType === 'md' ? 0 : 1;
			} else {
				num_cols += $screenType === 'md' ? 1 : 2;
			}
		}
	}

	function updateScreenType() {
		const width = window.innerWidth;
		if (width < 640) screenType.set('sm');
		else if (width < 1024) screenType.set('md');
		else screenType.set('lg');
	}

	function handleFilterNavScroll() {
		if (!filterChipNavDiv) return;
		const { scrollLeft, scrollWidth, clientWidth } = filterChipNavDiv;
		if (scrollWidth === clientWidth) {
			filterChipNavScrollPercent = 0;
			return;
		}
		filterChipNavScrollPercent = scrollLeft / (scrollWidth - clientWidth);
	}

	function setFilterChipNavScroll(targetPercent: number) {
		if (!filterChipNavDiv) return;
		const { scrollWidth, clientWidth } = filterChipNavDiv;
		filterChipNavDiv.scrollTo({
			left: targetPercent * (scrollWidth - clientWidth),
			behavior: 'smooth'
		});
	}
</script>

<svelte:window on:resize={updateGridSize} />

<div class="relative flex h-full w-full flex-row overflow-hidden bg-surface-900 p-2">
	<!-- Main Content Panel -->
	<div
		class="main-panel custom-scrollbar offset z-30 flex w-full flex-col space-y-6 overflow-x-hidden overflow-y-scroll bg-surface-900 p-2"
	>
		<!-- Header -->
		<header class="text-center">
			<h1 class="h1 text-primary-500">Mechdex</h1>
			<h5 class="h5">Building blocks for your games.</h5>
		</header>

		<!-- Search & Controls -->
		<div class="sticky top-0 z-40 flex w-full flex-row space-x-2 bg-surface-900 py-2">
			<input
				class="input flex-1 px-3"
				bind:value={inputStage}
				onkeydown={(e) => e.key === 'Enter' && refreshDisplayedMechanics()}
				placeholder="Search for a mechanic's title, description, problems... (e.g. 'immersion in cutscenes')"
			/>
			<button class="variant-filled-primary btn" onclick={refreshDisplayedMechanics}>
				<SearchIcon style="font-size: 1.2rem;" />
			</button>
			{#if $screenType !== 'sm'}
				<button
					class="variant-ringed-primary btn"
					title="Toggle grid layout"
					onclick={() => {
						gridLayoutType.set($gridLayoutType === 'normal' ? 'compact' : 'normal');
						updateGridSize();
					}}
				>
					{#if $gridLayoutType === 'compact'}
						<GridLargeIcon style="font-size: 1.2rem; color: rgb(var(--color-primary-500))" />
					{:else}
						<GridIcon style="font-size: 1.2rem; color: rgb(var(--color-primary-500))" />
					{/if}
				</button>
			{/if}
		</div>

		<!-- Category Filter Chips -->
		<div class="relative">
			<div
				class="custom-scrollbar shrink-0 overflow-x-auto p-4 px-0"
				bind:this={filterChipNavDiv}
				onscroll={handleFilterNavScroll}
			>
				<!-- Scroll Buttons -->
				{#if filterChipNavScrollPercent > 0.01}
					<button
						transition:fly={{
							x: -20,
							duration: $prefersReducedMotionStore ? 0 : 200,
							easing: expoOut
						}}
						onclick={() => setFilterChipNavScroll(0)}
						class="absolute left-0 top-1/2 z-20 w-fit -translate-y-1/2 rounded-full bg-surface-800/80 shadow-xl shadow-black backdrop-blur-sm active:scale-90"
					>
						<ChevronLeftIcon style="font-size: 2rem;" />
					</button>
				{/if}
				{#if filterChipNavScrollPercent < 0.99}
					<button
						transition:fly={{
							x: 20,
							duration: $prefersReducedMotionStore ? 0 : 200,
							easing: expoOut
						}}
						onclick={() => setFilterChipNavScroll(1)}
						class="absolute right-0 top-1/2 z-20 w-fit -translate-y-1/2 rounded-full bg-surface-800/80 shadow-xl shadow-black backdrop-blur-sm active:scale-90"
					>
						<ChevronRightIcon style="font-size: 2rem;" />
					</button>
				{/if}

				<!-- Filter Chip Buttons -->
				<div class="inline-flex w-max items-center space-x-4">
					<button
						class="variant-ringed-primary btn flex-shrink-0"
						class:!bg-primary-500={allCategoriesSelected}
						onclick={handleSelectAllCategories}
					>
						<SelectAllIcon style="font-size: 1.2rem;" />
					</button>
					<div class="h-full border-l-primary-500"></div>
					{#each MECHANIC_CATEGORIES as category, i}
						<button
							class="btn flex-shrink-0"
							onclick={(e) => handleCategoryFilterToggle(e, i)}
							style:background-color={activeCategoryFilters[i]
								? mechanicColors[category]
								: 'transparent'}
							style:border="1px solid {mechanicColors[category]}"
						>
							{category}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Results Summary -->
		<p>
			Displaying <b>{displayedMechanics.length}</b>
			mechanic{displayedMechanics.length !== 1 ? 's' : ''}
			{#if currentSearchTerm}
				for "<span class="underline decoration-primary-500 decoration-2 underline-offset-2"
					>{currentSearchTerm}</span
				>" and
			{/if}
			<b>{numActiveCategoriesSelected}</b> categories.
		</p>

		{#if initialLoad}
			<p>Loading mechanics...</p>
			<ProgressBar meter="bg-primary-500" />
		{/if}

		<!-- Mechanic Card Grid -->

		<div
			style:grid-template-columns="repeat({num_cols}, minmax(0, 1fr))"
			bind:this={outerGrid}
			class="relative grid h-full max-h-fit min-h-[50vh] w-full shrink-0 auto-rows-max gap-4 rounded-lg bg-surface-800 p-4 transition-all duration-200"
			style:opacity={isSidePanelChanging ? '0%' : '100%'}
		>
			{#each displayedMechanics as mechanic (mechanic.symbol)}
				<div animate:flip={{ duration: $prefersReducedMotionStore ? 0 : 400, easing: expoOut }}>
					<div
						class="col-auto flex aspect-square h-full w-full transition-all duration-0"
						style:opacity={isSidePanelChanging ? '0%' : '100%'}
					>
						<MechanicCard
							{getOuterGridWidth}
							isHidden={isSidePanelChanging}
							{mechanic}
							index={initialLoad ? displayedMechanics.indexOf(mechanic) : -1}
							onclick={() => handleMechanicClick(mechanic)}
						/>
					</div>
				</div>
			{:else}
				<div
					class="absolute inset-0 flex flex-col items-center justify-center space-y-8 text-center h-full"
				>
					<MagnifyIcon font-size="6rem" class="text-surface-500" />
					{#if numActiveCategoriesSelected === 0}
						<div class="w-full space-y-4">
							<h1 class="h1 text-surface-300">No categories selected.</h1>
							<h4 class="h4 text-surface-300">Select a category to continue.</h4>
						</div>
					{:else}
						<div class="w-full space-y-4">
							<h2 class="h2 text-surface-300">
								No results for "<span
									class="underline decoration-secondary-500 decoration-4 underline-offset-2"
									>{currentSearchTerm || '...'}</span
								>"
							</h2>
							<h4 class="h4 text-surface-300">
								Try a different search, or <a href="/contribute" class="anchor"
									>contribute a new mechanic</a
								>.
							</h4>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Side Panel for Mechanic Details -->
	<div
		class="side-panel custom-scrollbar absolute right-0 h-full w-1/2 overflow-y-auto rounded-lg bg-surface-800"
		style:opacity={$sidePanelState === 'hidden' ? 0 : 1}
		style:pointer-events={$sidePanelState === 'hidden' ? 'none' : 'auto'}
	>
		{#if currentDisplayedMechanic}
			<ReadingPanel {currentDisplayedMechanic} {setSidePanelState}></ReadingPanel>
		{/if}
	</div>
</div>

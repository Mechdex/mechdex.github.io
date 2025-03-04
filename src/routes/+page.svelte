<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '$lib/Components/Icon.svelte';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import type {
		ConciseMechanic,
		ConciseMechanicCard,
		Index,
		Mechanic,
		MechanicCategory
	} from '$lib/types';
	import { onMount, type EventDispatcher } from 'svelte';
	import { animate, easeInOut, stagger } from 'motion';
	import { fetchMechanic, mechanics as mechanicsCategories } from '$lib/stores';
	import FilterChip from '$lib/Components/FilterChip.svelte';
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import {
		getDrawerStore,
		getModalStore,
		ProgressBar,
		ProgressRadial,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import { draw, fade, fly } from 'svelte/transition';
	import MechanicModal from '$lib/Components/MechanicModal.svelte';
	import { goto } from '$app/navigation';

	let loadingString: string = '';
	let loadingMechanics = false;

	let allIndexes: Index[] = [];
	let allSelected = false;
	let allConciseMechanics: ConciseMechanicCard[] = [];
	let displayMechanics: ConciseMechanicCard[] = [];
	let selectedCategories: { [category: string]: boolean } = {};
	let searchStage = '';
	let loadingDiv: HTMLDivElement | null = null;
	let initialLoad = true;
	let compactView = false;

	let drawerStore = getDrawerStore();
	let modalStore = getModalStore();

	function onFilterChipClick(event: CustomEvent) {
		initialLoad = false;
		const category = event.detail.category;
		selectedCategories[category] = !selectedCategories[category];

		allSelected = Object.values(selectedCategories).every(Boolean);

		loadMechanics();
	}

	function onAllSelected() {
		initialLoad = false;

		if (allSelected) {
			allSelected = false;
		} else {
			allSelected = true;
		}
		for (let category of mechanicsCategories) {
			selectedCategories[category] = allSelected;
		}

		loadMechanics();
	}

	const apiURLFormat = (mechanicType: MechanicCategory): string =>
		`https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/${mechanicType}/index.json`;

	function loadMechanics() {
		let selected = Object.keys(selectedCategories);
		selected = selected.filter((m) => selectedCategories[m]);
		displayMechanics = allConciseMechanics.filter((m) => selected.includes(m.category));

		if (searchStage) {
			displayMechanics = displayMechanics.filter(
				(m) =>
					m.details.name.toLowerCase().match(searchStage.toLowerCase()) ||
					m.details.short_description.toLowerCase().match(searchStage.toLowerCase()) ||
					m.details.symbol.toLowerCase().match(searchStage.toLowerCase())
			);
		}
	}
	onMount(async () => {
		drawerStore.close();
		startLoading();
		loadingString = 'Loading...';
		if (browser) {
			const cachedIndexes = sessionStorage.getItem('_mechdex_cache_allIndexes');
			if (cachedIndexes) {
				allIndexes = JSON.parse(cachedIndexes);

				console.log('Loaded indexes from cache.');
				loadingString = '';
			} else {
				console.log('Fetching indexes.');
				for (const category of mechanicsCategories) {
					loadingString = 'Loading ' + category.toLowerCase() + ' mechanics... ';
					// if (loadingDiv) {
					// 	animate(loadingDiv, { y: [0, -50], opacity: [1, 0] }, { duration: 0.1 });
					// }

					const response = await fetch(apiURLFormat(category));
					const indexData = await response.json();
					console.log(indexData);
					allIndexes.push(indexData);
					console.log('Loaded index for category ' + category);

					for (let mechanic of indexData.index) {
						console.log('mech');
						allConciseMechanics.push({ category: category, details: mechanic });
						sessionStorage.setItem(
							'_mechdex_cache_allConciseMechanics',
							JSON.stringify(allConciseMechanics)
						);
					}
				}
				sessionStorage.setItem('_mechdex_cache_allIndexes', JSON.stringify(allIndexes));
				console.log('Cached storage.');
			}

			let cachedCards = sessionStorage.getItem('_mechdex_cache_allConciseMechanics');
			if (cachedCards) {
				allConciseMechanics = JSON.parse(cachedCards);
			}
			console.log('Loaded all concise mechanics.');
			allConciseMechanics = allConciseMechanics
				.sort(() => Math.random() - 0.5)
				.sort(() => Math.random() - 0.5);
			onAllSelected();
			loadMechanics();
			loadingString = '';
			endLoading();
		}
	});

	function startLoading() {
		loadingMechanics = true;
		setTimeout(() => {
			if (loadingDiv) {
				loadingDiv.innerHTML = '<p>Just a second...</p>';

				let i = 0;

				let messages = [
					'<p>Still going...</p>',
					'<p>Almost there...</p>',
					"<p>It usually doesn't take this long...</p>",
					'<p>What do you think about the current state of the economy?<p>'
				];
				setInterval(() => {
					if (!loadingDiv) return;
					animate(loadingDiv, { y: [0, -10], opacity: [1, 0] }, { duration: 0.2 });
					setTimeout(() => {
						if (!loadingDiv) return;

						loadingDiv.innerHTML = messages[i];
						animate(loadingDiv, { y: [10, 0], opacity: [0, 1] }, { duration: 0.2 });
					}, 200);
					i += 1;
					i = i % messages.length;
				}, 5000);
			}
		}, 0);
	}

	function endLoading() {
		loadingMechanics = false;

		
	}
	function onSearch() {
		loadMechanics();
	}

	async function onMechanicCardClick(event: CustomEvent) {
		await fetchMechanic(event.detail);
		let m = { ref: MechanicModal };
		let modal: ModalSettings = {
			type: 'component',
			component: m,
			meta: event.detail,
			backdropClasses: ''
		};

		modalStore.trigger(modal);
		console.log(modal);
	}
</script>

<div
	class="absolute bg-surface-100-800-token w-full min-h-full max-h-fit flex flex-col items-center space-y-8 p-4"
>
	<div class="flex flex-row w-full relative justify-center items-center">
		<div class="grid place-items-center absolute top-0 left-0">
			<button class="btn" on:click={() => drawerStore.open()}
				><Icon name="menu-alt-left"></Icon></button
			>
		</div>
		<div class="flex-1 flex flex-col left-0 justify-center items-center">
			<h1 class="h1 text-center text-primary-500">Mechdex</h1>
			<h4 class="h4">Building blocks for your games.</h4>
		</div>
	</div>
	<div class="flex flex-row w-full space-x-2 p-2">
		<input
			class="input flex-1"
			bind:value={searchStage}
			on:keydown={(e) => {
				if (e.key === 'Enter') onSearch();
			}}
			placeholder="Search for a game mechanic..."
		/><button on:click={onSearch} class="btn variant-filled-primary"
			><box-icon name="search"></box-icon></button
		><button on:click={() => (compactView = !compactView)} class="btn variant-filled-secondary"
			><box-icon name={compactView ? 'grid' : 'grid-small'}></box-icon></button
		><button on:click={() => goto('/about')} class="btn variant-filled-secondary"
			><box-icon name="help-circle"></box-icon></button
		>
	</div>
	<div class="flex flex-row w-full overflow-x-scroll space-x-4 p-2 m-10 custom-scrollbar">
		<button
			on:click={onAllSelected}
			class={`btn border`}
			style={`border-color: rgb(var(--color-primary-500)) !important; ${allSelected ? 'background-color: rgb(var(--color-primary-500));' : ''}`}
			>{allSelected ? 'Deselect' : 'Select'} All</button
		>

		{#each mechanicsCategories as category, i (category)}
			<FilterChip {category} on:click={onFilterChipClick} selected={selectedCategories[category]} />
		{/each}
	</div>

	{#if displayMechanics.length == 0 && !initialLoad}
		<p in:fly>No mechanics match your search.</p>
	{:else if loadingMechanics}
		<p in:fade out:fade bind:this={loadingDiv}></p>
	{/if}
	<div
		class={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 ${compactView ? '!grid-cols-11' : ''} gap-4 w-full`}
	>
		{#each displayMechanics as card, i (card)}
			<div animate:flip={{ duration: 400, easing: expoOut }}>
				<div class="w-full h-full aspect-square flex flex-col justify-start col-auto">
					<MechanicCard
						index={initialLoad ? i : -1}
						category={card.category}
						name={card.details.name}
						short_description={card.details.short_description}
						symbol={card.details.symbol}
						on:click={onMechanicCardClick}
						{compactView}
					/>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: rgb(var(--color-primary-500)) rgb(var(--color-surface-900));
	}

	.custom-scrollbar::-webkit-scrollbar {
		height: 1px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #888;
		border-radius: 1px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: #555;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #f1f1f1;
	}
</style>

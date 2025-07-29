<script lang="ts">
	import { loadedMechanics, mechanicColors } from '$lib/stores';
	import { fetchMechanicFromServer } from '$lib/mechanics';
	import type { Mechanic } from '$lib/types.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import yaml from 'js-yaml';
	import { getDrawerStore, getModalStore, ProgressBar } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import Icon from '$lib/Components/Icon.svelte';

	let modalStore = getModalStore();

	let error = $state('');
	let mechanic: Mechanic = $state({} as Mechanic);
	let examples: string[] = []; // We need a separate freaking array for this because Svelte refuses to compile anything if mechanic.examples is references in the template
	let isExpanded = $state(false);

	onMount(async () => {
		let data = $modalStore[0].meta;
		let m = await fetchMechanicFromServer(data);
		// console.log('Fetch mechanic returned');
		// console.log(m);
		if ('error' in m) {
			error = m.error;
		} else {
			mechanic = m;
		}

		console.log(mechanic.examples);

		examples = mechanic.examples;
	});

	function toggleExpand() {
		isExpanded = !isExpanded;
		// console.log(isExpanded);
	}

	let drawerStore = getDrawerStore();
</script>

{#if error}
	<p>Error: {error}</p>
{/if}
{#if mechanic}
	<div
		class={`w-[90%] h-[90vh] md:w-[80%] md:h-[80vh] custom-scrollbar shadow-2xl shadow-black transition-all duration-[250ms] ease-out   ${isExpanded ? '!w-full !h-[100vh] !p-1' : ''} overflow-y-scroll bg-surface-800 grid place-items-center p-4 rounded-lg`}
	>
		<div class="flex-row flex w-full justify-end">
			{#if mechanicColors[mechanic.category]}
				<button onclick={toggleExpand} class="button"
					>{#if isExpanded}<Icon
							rawColor={mechanicColors[mechanic.category]}
							name="collapse-alt"
						/>{:else}<Icon
							rawColor={mechanicColors[mechanic.category]}
							name="expand-alt"
						/>{/if}</button
				>
			{/if}
		</div>
		<!-- Use vh for height otherwise it overflows -->
		<article class="w-full h-full prose prose-p:text-on-surface-token max-w-none p-2">
			<h1 class="h1 text-primary-500 text-center sm:leading-10 md:leading-normal">
				<span style={`color: ${mechanicColors[mechanic.category]}`}>{mechanic.category} /</span>
				<span class="text-on-surface-token">{mechanic.name} / </span>
				<span
					style={`background-color: ${mechanicColors[mechanic.category]}`}
					class="text-surface-800 p-1 rounded">{mechanic.symbol}</span
				>
			</h1>
			<h3 class="h3 text-on-surface-token text-center font-thin">{mechanic.short_description}</h3>
			<hr class="w-full my-5 border-4" />

			<h2 class="h2 text-primary-500">Description</h2>
			<hr />
			<p class="whitespace-pre-line">{mechanic.long_description}</p>
			<h2 class="h2 text-primary-500">Problems This Mechanic Solves</h2>
			<hr />

			<p>{mechanic.solved_problems}</p>
			<h2 class="h2 text-primary-500">Real-World Examples</h2>
			<hr />
			<ul class="marker:text-primary-500 text-on-surface-token">
				{#if mechanic.examples}
					{#each mechanic.examples as sp}
						<li>{sp}</li>
					{/each}
				{/if}
			</ul>
		</article>
	</div>
{/if}

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
		/* scrollbar-color: rgb(var(--color-primary-500)) rgb(var(--color-surface-900)); */
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

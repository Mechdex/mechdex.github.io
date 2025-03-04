<script lang="ts">
	import { fetchMechanic, loadedMechanics, mechanicColors } from '$lib/stores';
	import type { Mechanic } from '$lib/types.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import yaml from 'js-yaml';
	import { getDrawerStore, getModalStore, ProgressBar } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import Icon from '$lib/Components/Icon.svelte';

	let modalStore = getModalStore();

	let error = '';
	let mechanic: Mechanic = {} as Mechanic;
	let examples: string[] = []; // We need a separate freaking array for this because Svelte refuses to compile anything if mechanic.examples is references in the template
	let isExpanded = false;

	onMount(async () => {
		let data = $modalStore[0].meta;
		let m = await fetchMechanic(data);
		console.log('Fetch mechanic returned');
		console.log(m);
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
		console.log(isExpanded);
	}

	let drawerStore = getDrawerStore();
</script>

{#if error}
	<p>Error: {error}</p>
{/if}
{#if mechanic}
	<div
		class={`w-[80%] h-[80vh] ${isExpanded ? '!w-full !h-[100vh] !p-1' : ''} overflow-y-scroll bg-surface-800 grid place-items-center p-4 rounded-lg`}
	>
		<div class="flex-row flex w-full justify-end">
			{#if mechanicColors[mechanic.category]}
				<button on:click={toggleExpand} class="button"
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
			<h1 class="h1 text-primary-500 text-center">
				<span style={`color: ${mechanicColors[mechanic.category]}`}>{mechanic.category} /</span>
				<span class="text-on-surface-token">{mechanic.name} / </span>
				<span
					style={`background-color: ${mechanicColors[mechanic.category]}`}
					class="text-surface-800 p-1 rounded">{mechanic.symbol}</span
				>
			</h1>
			<h3 class="h3 text-on-surface-token text-center">{mechanic.short_description}</h3>
			<hr class="w-full my-5" />
			<h2 class="h2 text-primary-500">Description</h2>
			<hr />
			<p>{mechanic.long_description}</p>
			<h2 class="h2 text-primary-500">Problems This Mechanic Solves</h2>
			<hr />

			<p>{mechanic.solved_problems}</p>
			<h2 class="h2 text-primary-500">Real-World Examples</h2>
			<hr />
			<ul class="marker:text-primary-500 text-on-surface-token">
				{#each examples as sp}
					<li>{sp}</li>
				{/each}
			</ul>
		</article>
	</div>
{/if}

<!-- <div class="w-full h-full relative">
	{#if mechanic}
		<div class="w-full h-fit flex flex-col items-center p-4" transition:fly>
			<div class="flex flex-row w-full relative justify-center items-center">
				<div class="grid place-items-center absolute top-0 left-0">
					<button class="btn" on:click={() => drawerStore.open()}
						><Icon name="menu-alt-left"></Icon></button
					>
				</div>
				<article class="w-full h-full prose prose-p:text-on-surface-token max-w-none p-2">
					<h1 class="h1 text-primary-500 text-center">
						<span style={`color: ${mechanicColors[mechanic.category]}`}>{mechanic.category} /</span>
						<span class="text-on-surface-token">{mechanic.name} / </span>
						<span
							style={`background-color: ${mechanicColors[mechanic.category]}`}
							class="text-surface-800 p-1 rounded">{mechanic.symbol}</span
						>
					</h1>
					<h3 class="h3 text-on-surface-token text-center">{mechanic.short_description}</h3>
					<hr class="w-full my-5" />
					<h2 class="h2 text-primary-500">Description</h2>
					<hr />
					<p>{mechanic.long_description}</p>
					<h2 class="h2 text-primary-500">Problems This Mechanic Solves</h2>
					<hr />

					<p>{mechanic.solved_problems}</p>
					<h2 class="h2 text-primary-500">Real-World Examples</h2>
					<hr />
					<ul class="marker:text-primary-500 text-on-surface-token">
						{#each mechanic.examples as sp}
							<li>{sp}</li>
						{/each}
					</ul>
				</article>
			</div>
		</div>
	{:else if error}
		<div class="absolute w-full h-full grid place-items-center" transition:fly>
			<h1 class="h1 text-error-500">Error: {error}</h1>
		</div>
	{/if}
</div> -->

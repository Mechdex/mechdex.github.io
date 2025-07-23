<script lang="ts">
	import { loadedMechanics, mechanicColors } from '$lib/stores';
	import type { Mechanic } from '$lib/types.js';
	import { onMount } from 'svelte';
	import yaml from 'js-yaml';
	import { getDrawerStore, ProgressBar } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';
	import MechanicCard from '$lib/Components/MechanicCard.svelte';
	import Icon from '$lib/Components/Icon.svelte';

	let { data } = $props();
	let mechanic: Mechanic = $state();
	let error = $state('');

	onMount(() => {
		let m = $loadedMechanics.find((m) => m.symbol == data.slug);
		if (!m) {
			fetch(
				`https://raw.githubusercontent.com/Mechdex/mechanics/refs/heads/main/${data.category}/${data.slug}/mechanic.yaml`
			)
				.then((response) => response.text())
				.then((yamlText) => {
					console.log(yamlText);
					let m_result = yaml.load(yamlText);
					if (!m_result) {
						error = 'Mechanic failed to load.';
						return;
					}
					console.log('Result: ', m_result);

					if (m_result == '404: Not Found') {
						error = 'That mechanic was not found.';
						return;
					}
					m_result = m_result as any as Mechanic;
					loadedMechanics.update((mechanics) => [
						...mechanics,
						(m_result as any).mechanic as Mechanic
					]);
					mechanic = (m_result as any).mechanic as Mechanic;
				})
				.catch((error) => {
					console.log(error);

					error = 'Mechanic failed to load.';
				});
		} else {
			mechanic = m;
		}
	});

	let drawerStore = getDrawerStore();
</script>

{#if mechanic}
	<div class="absolute w-full h-full flex flex-col items-center p-4" transition:fly>
		<div class="flex flex-row w-full relative justify-center items-center">
			<div class="grid place-items-center absolute top-0 left-0">
				<button class="btn" onclick={() => drawerStore.open()}
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

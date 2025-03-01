<script lang="ts">
	import { goto } from '$app/navigation';
	import { mechanicColors } from '$lib/stores';
	import type { MechanicCategory } from '$lib/types';
	import { animate } from 'motion';
	import { onMount } from 'svelte';

	export let symbol = '';
	export let category: MechanicCategory;
	export let name = '';
	export let number = '';
	export let weight = '';
	export let short_description: string;
	export let index: number;

	let cardDiv: HTMLDivElement;

	onMount(() => {
		animate(
			cardDiv,
			{ y: [50, 0], opacity: [0, 1] },
			{ duration: 0.4, delay: index * 0.2, ease: 'backOut' }
		);
		console.log(index);
	});

	function gotoMechPage() {
		goto(`/mechanic/${category}/${symbol}`);
	}
</script>

<div
	bind:this={cardDiv}
	on:click={gotoMechPage}
	on:keydown={(e) => e.key === 'Enter' && gotoMechPage()}
	role="button"
	tabindex="0"
	style={`background-color: ${mechanicColors[category]}`}
	class="relative flex flex-col p-2 hover:!scale-[103%] hover:shadow-lg cursor-pointer transition-all animate_card_in rounded-lg border aspect-square"
>
	<div class="flex h-[1/5] w-full flex-row justify-start items-center">{symbol}</div>
	<div class="flex-1 flex flex-col justify-center items-center">
		<h3 class="h3 font-bold text-center">{name}</h3>
		<hr />
		<p class="text-center w-full">{short_description}</p>
	</div>
	<div class="flex h-[1/5] w-full flex-row justify-end items-center">{category}</div>
</div>

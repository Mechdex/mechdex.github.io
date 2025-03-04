<script lang="ts">
	import { goto } from '$app/navigation';
	import { mechanicColors } from '$lib/stores';
	import type { MechanicCategory } from '$lib/types';
	import { animate } from 'motion';
	import { createEventDispatcher, onMount } from 'svelte';

	export let symbol = '';
	export let category: MechanicCategory;
	export let name = '';
	export let number = '';
	export let weight = '';
	export let short_description: string;
	export let index: number;
	export let compactView = false;

	let cardDiv: HTMLDivElement;
	let dispatcher = createEventDispatcher();

	onMount(() => {
		animate(
			cardDiv,
			{ y: [index == -1 ? 0 : 25, 0], opacity: [0, 1] },
			{ duration: 0.3, delay: index == -1 ? 0 : index * 0.1, ease: 'backOut' }
		);
		console.log(index);
	});

	function gotoMechPage() {
		dispatcher('click', { category, symbol });
	}
</script>

<div
	bind:this={cardDiv}
	on:click={gotoMechPage}
	on:keydown={(e) => e.key === 'Enter' && gotoMechPage()}
	role="button"
	tabindex="0"
	style={`background-color: ${mechanicColors[category]}`}
	class={`relative flex flex-col px-4 py-2 ${compactView ? '!p-1' : ''}  h-full space-y-2 w-full hover:!scale-[103%] hover:shadow-lg cursor-pointer transition-all animate_card_in rounded-lg border aspect-square`}
>
	<div class="flex h-[1/5] w-full flex-row justify-start items-center">{symbol}</div>
	<!-- <hr class="w-full my-2 text-white"/> -->
	<div class="flex-1 flex flex-col justify-center items-center">
		<h3 class={`${compactView ? 'text-sm' : 'text-lg'} font-bold text-center`}>{name}</h3>
		<hr />
		{#if !compactView}
			<p class="text-center w-full">{short_description}</p>
		{/if}
	</div>
	<!-- <hr class="w-full my-2 text-white"> -->
	<div class="flex h-[1/5] w-full flex-row justify-end items-center">{category}</div>
</div>

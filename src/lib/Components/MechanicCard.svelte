<script lang="ts">
	import { goto } from '$app/navigation';
	import { gridLayoutType, loadedMechanics, mechanicColors } from '$lib/stores';
	import type { ConciseMechanic, MechanicCategory } from '$lib/types';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import fitty from 'fitty';
	import { animate } from 'motion';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import gsap from 'gsap';
	import { fade, fly } from 'svelte/transition';
	import Icon from './Icon.svelte';

	export let index;
	$: compactView = $gridLayoutType == 'compact';
	export let isLoading = false;

	export let mechanic: ConciseMechanic & { category: string };
	export let initialLoad: boolean = false;

	let color = mechanicColors[mechanic.category as MechanicCategory];
	let cardDiv: HTMLDivElement;
	let dispatcher = createEventDispatcher();

	let isMechanicLoaded = false;
	loadedMechanics.subscribe((mechanics) => {
		isMechanicLoaded = mechanics.find((m) => m.symbol == mechanic.symbol) ? true : false;
	});

	onMount(() => {
		if (initialLoad) {
			animate(
				cardDiv,
				{ y: [index == -1 ? 0 : 25, 0], opacity: [0, 1] },
				{ duration: 0.3, delay: index == -1 ? 0 : index * 0.1, ease: 'backOut' }
			);
		}

		fitty('.description-heading', {
			minSize: 16,
			multiLine: true
			// observeMutations: { subtree: true, childList: true, characterData: true }
		}); // observeMutations is necessary because navigating away and back to the index page does not make it re-fit
		if (compactView) {
			fitty('.name-heading', {
				minSize: 18,
				multiLine: true
				// observeMutations: { subtree: true, childList: true, characterData: true }
			});
		}
	});

	function gotoMechPage() {
		dispatcher('click', { category: mechanic.category, symbol: mechanic.symbol });
	}

	function onMouseEnter() {
		gsap.to(cardDiv.getElementsByClassName('side-heading')[0], {
			y: -10,
			opacity: 0,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap.to(cardDiv.getElementsByClassName('side-heading')[1], {
			y: 10,
			opacity: 0,
			duration: 0.2,
			ease: 'expo.out'
		});
		gsap.to(cardDiv.getElementsByClassName('description-heading'), {
			scale: 1.1,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap.to(cardDiv.getElementsByClassName('name-heading'), {
			y: -10,
			duration: 0.3,
			ease: 'expo.out'
		});
	}

	function onMouseLeave() {
		gsap.to(cardDiv.getElementsByClassName('side-heading'), {
			y: 0,
			opacity: 1,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap.to(cardDiv.getElementsByClassName('description-heading'), {
			scale: 1,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap.to(cardDiv.getElementsByClassName('name-heading'), {
			y: 0,
			duration: 0.3,
			ease: 'expo.out'
		});
	}

	// onDestroy(() => {
	// 	fitty('.fittext').forEach((f) => {
	// 		f.unsubscribe();
	// 	});

	// 	fitty('.description-heading').forEach((f) => {
	// 		f.unsubscribe();
	// 	});
	// 	fitty('.name-heading').forEach((f) => {
	// 		f.unsubscribe();
	// 	});
	// });
</script>

<div
	bind:this={cardDiv}
	on:click={gotoMechPage}
	on:keydown={(e) => e.key === 'Enter' && gotoMechPage()}
	on:mouseenter={onMouseEnter}
	on:mouseleave={onMouseLeave}
	role="button"
	tabindex="0"
	style={`background-color: ${color};`}
	class={`relative flex flex-col px-4 py-2 ${compactView ? '!p-1' : ''} animate_card_in col-span-1 row-span-1 aspect-square h-full w-full cursor-pointer space-y-2 rounded-lg transition-all duration-200 hover:!scale-[103%] hover:shadow-lg  hover:brightness-125`}
>
	<div class="absolute left-4 top-2">
		<h4 class={`side-heading h4 ${compactView ? '!h6' : ''}`}>{mechanic.symbol}</h4>
	</div>
	<div class="flex h-[86%] w-full flex-col justify-center">
		<h4
			class={`name-heading fittext h4 text-center ${compactView ? 'font-normal' : 'font-semibold'} break-words leading-tight`}
		>
			{mechanic.name}
		</h4>
		{#if !compactView}
			<h3 class="description-heading fittext h3 text-center font-light leading-tight">
				{mechanic.short_description}
			</h3>
		{/if}
	</div>
	<div class="gap-2r absolute bottom-2 right-4 flex items-center">
		{#if isLoading}<div in:fly={{ y: 50, duration: 200 }} class="contents">
				<ProgressRadial width="w-[1.3em]"></ProgressRadial>
			</div>{/if}

		<div class="flex-1"></div>
		<h4 class="side-heading h4">{mechanic.category}</h4>
	</div>
</div>

<!-- <div
	bind:this={cardDiv}
	on:click={gotoMechPage}
	on:keydown={(e) => e.key === 'Enter' && gotoMechPage()}
	on:mouseenter={onMouseEnter}
	on:mouseleave={onMouseLeave}
	role="button"
	tabindex="0"
	style={`background-color: ${mechanicColors[category]};`}
	class={`relative flex flex-col px-4 py-2 ${compactView ? '!p-1' : ''}  h-full space-y-2 w-full hover:!scale-[103%] hover:shadow-lg cursor-pointer duration-200 transition-all animate_card_in rounded-lg border aspect-square`}
>
	<div class="w-full border border-red-500 flex-[1/6] justify-start flex flex-row rounded-t-lg">
		<h4 class="h4 side-heading">{symbol}</h4>
	</div>
	<div class="flex-1 border border-teal-500 shrink flex flex-col w-full p-2 max-h-[83%] items-center justify-center space-y-2">
		<h3 class="h3 text-center font-semibold name-heading leading-tight">{name}</h3>
		<h4 class="h4 text-center font-light description-heading leading-tight fittext">
			{short_description}
		</h4>
	</div>
	<div class="w-full border border-green-500 flex-[1/6] justify-center items-center flex flex-row rounded-t-lg">
		{#if isLoading}<ProgressRadial width="w-[1.3em]" />{/if}
		<div class="flex-1"></div>
		<h4 class="h4 side-heading fittext">{category}</h4>
	</div>
</div> -->

<style>
	.name-heading {
		font-size: 1.3em;
	}
	.description-heading {
		font-size: 1em;
	}
	.side-heading {
		font-size: 1em !important;
	}
	.fittext-bope {
		/* Ensures fitty doesn't flash large text before adjusting */
		display: inline-block;
		white-space: nowrap;
	}
</style>

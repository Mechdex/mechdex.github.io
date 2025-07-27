<script lang="ts">
	import { goto } from '$app/navigation';
	import { gridLayoutType, loadedMechanics, mechanicColors } from '$lib/stores';
	import type { ConciseMechanic, Mechanic, MechanicCategory } from '$lib/types';
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
	export let onclick: (mechanic: { symbol: string; category: MechanicCategory }) => void;

	let color = mechanicColors[mechanic.category as MechanicCategory];
	let cardDiv: HTMLDivElement;
	let dispatcher = createEventDispatcher();

	let isMechanicLoaded = false;
	loadedMechanics.subscribe((mechanics) => {
		isMechanicLoaded = mechanics.find((m) => m.symbol == mechanic.symbol) ? true : false;
	});

	onMount(() => {
		console.log(mechanic.symbol, index);
		console.log('Initial load for', mechanic.symbol, initialLoad);
		console.log('b-but', index);
		// const ctx = gsap.context(() => {
		// 	// All GSAP code goes inside here
		// 	if (initialLoad && index > -1) {
		// 		console.log('ANIMATING ', index);
		// 		gsap.fromTo(
		// 			cardDiv,
		// 			{ y: 25, opacity: 0 },
		// 			{ y: 0, opacity: 1, duration: 0.3, delay: index * 0.1, ease: 'expo.inOut' }
		// 		);
		// 	}
		// }, cardDiv); // Scope the context to the component's root element
		const controls = animate(
			cardDiv,
			{ y: [index == -1 ? 0 : 25, 0], opacity: [0, 1] },
			{ duration: 0.3, delay: index == -1 ? 0 : index * 0.1, ease: 'backOut' }
		);

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

		// 2. Return a cleanup function
		return () => {
			controls.stop(); // This kills all animations created in the context
		};
	});

	function gotoMechPage() {
		onclick({ symbol: mechanic.symbol, category: mechanic.category });
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

<svelte:window onresize={(e) => fitty.fitAll()} />
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
</style>

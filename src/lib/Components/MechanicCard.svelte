<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		gridLayoutType,
		gsap_xto,
		loadedMechanics,
		mechanicColors,
		screenType,
		sidePanelState
	} from '$lib/stores';
	import type { ConciseMechanic, Mechanic, MechanicCategory } from '$lib/types';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import fitty from 'fitty';
	import { animate } from 'motion';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import gsap from 'gsap';
	import { fade, fly } from 'svelte/transition';
	import Icon from './Icon.svelte';

	export let index;
	export let isLoading = false;
	export let mechanic: ConciseMechanic & { category: string };
	export let initialLoad: boolean = false;
	export let isHidden = false;
	export let getOuterGridWidth: () => number;
	let outerGridWidth = 0;

	export let onclick: (mechanic: { symbol: string; category: MechanicCategory }) => void;

	let color = mechanicColors[mechanic.category as MechanicCategory];
	let cardDiv: HTMLDivElement;

	$: minNameSize = $screenType == 'sm' || $sidePanelState == 'split' ? 14 : 18;
	$: minDescSize = $screenType == 'sm' || $sidePanelState == 'split' ? 14 : 16; // Look I'm sorry I know I shouldn't below 16px but some cards just don't fit otherwise
	$: minSideSize = $screenType == 'sm' || $sidePanelState == 'split' ? 8 : 12; //
	$: compactView = $gridLayoutType == 'compact';

	function refitText() {
		fitty('.name-heading', {
			minSize: minNameSize,
			maxSize: 18,
			multiLine: true
		});
		fitty('.description-heading', {
			minSize: minDescSize,
			maxSize: 18,
			multiLine: true
		});
		fitty('.side-heading', {
			minSize: minSideSize,
			maxSize: 18,
			multiLine: false
		});
	}

	gridLayoutType.subscribe((n) => {
		refitText();
	});

	// sidePanelState.subscribe((state) => {
	// 	outerGridWidth = getOuterGridWidth();
	// 	setTimeout(refitText, 100); // Yep.

	// 	// console.log('side panel changed to', state);
	// }); // <-- single handedly made the whole site unresponsive
	
	let isMechanicLoaded = false;
	loadedMechanics.subscribe((mechanics) => {
		isMechanicLoaded = mechanics.find((m) => m.symbol == mechanic.symbol) ? true : false;
	});

	onMount(() => {
		const controls = animate(
			cardDiv,
			{ y: [index == -1 ? 0 : 25, 0], opacity: [0, 1] },
			{ duration: 0.3, delay: index == -1 ? 0 : index * 0.1, ease: 'backOut' }
		);

		fitty('.description-heading', {
			minSize: 16,
			multiLine: true
		});
		fitty('.name-heading', {
			minSize: 18,
			multiLine: true
		});

		return () => {
			controls.stop();
		};
	});

	async function gotoMechPage() {
		isLoading = true;
		await onclick({ symbol: mechanic.symbol, category: mechanic.category });
		isLoading = false;
	}

	function onMouseEnter() {
		gsap_xto(cardDiv.getElementsByClassName('side-heading')[0], {
			y: -10,
			opacity: 0,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap_xto(cardDiv.getElementsByClassName('side-heading')[1], {
			y: 10,
			opacity: 0,
			duration: 0.2,
			ease: 'expo.out'
		});
		gsap_xto(cardDiv.getElementsByClassName('description-heading'), {
			scale: 1.1,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap_xto(cardDiv.getElementsByClassName('name-heading'), {
			y: -10,
			duration: 0.3,
			ease: 'expo.out'
		});
	}

	function onMouseLeave() {
		gsap_xto(cardDiv.getElementsByClassName('side-heading'), {
			y: 0,
			opacity: 1,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap_xto(cardDiv.getElementsByClassName('description-heading'), {
			scale: 1,
			duration: 0.3,
			ease: 'expo.out'
		});
		gsap_xto(cardDiv.getElementsByClassName('name-heading'), {
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
	transition:fade={{ duration: 50 }}
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
			class={`name-heading fittext text-center ${compactView ? 'text-xs font-normal' : 'text-lg  font-semibold'} break-words leading-tight`}
		>
			{mechanic.name}
		</h4>
		{#if !compactView}
			<h3 class="description-heading fittext h3 text-center font-light leading-tight">
				{mechanic.short_description}
			</h3>
		{/if}
	</div>
	<div class="gap-2r absolute bottom-2 right-4 flex w-full items-center">
		<div class="flex-1"></div>
		<h4 class="side-heading h4">{mechanic.category}</h4>
	</div>
	<!-- {#if isLoading}<div class="contents self-start absolute bottom-2 left-2">
			<ProgressRadial width="w-[1.3em]"></ProgressRadial>
		</div>{/if} -->
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

<script lang="ts">
	const prerender = true;
	import Icon from '$lib/Components/Icon.svelte';
	import '../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { getDrawerStore, Modal, storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	import { initializeStores, Drawer } from '@skeletonlabs/skeleton';
	import { gsap } from 'gsap';

	import { Flip } from 'gsap/Flip';

	gsap.registerPlugin(Flip);
	initializeStores();

	let drawerStore = getDrawerStore();
</script>

<svelte:head>
	<title>Game Mechanics | Mechdex</title>
</svelte:head>
<Modal width="w-[80%]" height="h-[80%]" />
<Drawer class="w-[80%] lg:w-[20%]">
	<div class="w-full h-full flex flex-col justify-start items-center">
		<div class="flex flex-row justify-end w-full mb-5">
			<button class="btn" on:click={() => drawerStore.close()}
				><Icon name="arrow-back"></Icon></button
			>
		</div>
		<a class="w-full p-2 flex flex-row items-center bg-surface-500 rouned-lg" href="/"
			><Icon name="home"></Icon>
			<p class="flex-1 text-center">Index</p></a
		>
		<hr />
		<a class="w-full p-2 flex flex-row items-center bg-surface-500 rouned-lg" href="/about"
			><Icon name="help-circle"></Icon>
			<p class="flex-1 text-center">About</p></a
		>
		<hr />
		<a class="w-full p-2 flex flex-row items-center bg-surface-500 rouned-lg" href="/contribute"
			><Icon name="plus"></Icon>
			<p class="flex-1 text-center">Contribute</p></a
		>
		<div class="flex-1"></div>
		<div class="w-full p-2 flex flex-row justify-center items-center space-x-2">
			<p>Mechdex</p>
			<span class="text-primary-500">•</span>
			<p>Alpha V0.1</p>
		</div>
	</div>
</Drawer>
<slot />

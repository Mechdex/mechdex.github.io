<script lang="ts">
	const prerender = true;
	import Icon from '$lib/Components/Icon.svelte';
	import ArrowBack from '~icons/mdi/arrow-back';
	import Home from '~icons/material-symbols/home-rounded';
	import Help from '~icons/mdi/help-circle';
	import Plus from '~icons/mdi/plus';
	import '../app.postcss';
	
	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import {
		AppRail,
		AppRailAnchor,
		getDrawerStore,
		Modal,
		storePopup,
		TabAnchor,
		TabGroup
	} from '@skeletonlabs/skeleton';
	import { initializeStores, Drawer } from '@skeletonlabs/skeleton';
	import { gsap } from 'gsap';
	import { gsap_xto, screenType } from '$lib/stores';
	import { onMount } from 'svelte';
	import { Flip } from 'gsap/dist/Flip';
	import { page } from '$app/state';
	import { get } from 'svelte/store';
	import { prefersReducedMotion } from 'svelte/motion';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	gsap.registerPlugin(Flip);
	initializeStores();
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	let drawerStore = getDrawerStore();

	function updateScreenType() {
		const width = window.innerWidth;
		if (width < 640) {
			screenType.set('sm');
		} else if (width < 1024) {
			screenType.set('md');
		} else {
			screenType.set('lg');
		}
	}

	onMount(() => {
		updateScreenType();
		window.addEventListener('resize', updateScreenType);

		if (prefersReducedMotion) {
		}
	});

	function gsapOnApprailTileHover(tileIndex: number) {
		// gsap.set(`.gsap-apprail-border-${tileIndex}`, { translateX: '-100%' });

		gsap_xto(`.gsap-apprail-border-${tileIndex}`, { translateX: '0%', ease: 'expo.out' });
	}

	function gsapOnApprailTileLeave(tileIndex: number) {
		gsap_xto(`.gsap-apprail-border-${tileIndex}`, { translateX: '100%', ease: 'expo.out' }).then(
			(r) => {
				gsap.set(`.gsap-apprail-border-${tileIndex}`, { translateX: '-100%' });
			}
		);
	}

	let path = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>Game Mechanics | Mechdex</title>
</svelte:head>
<Modal width="w-[80%]" height="h-[80%]" />

{#if $screenType == 'sm'}<div class="absolute flex h-full w-full flex-col">
		{@render children?.()}

		<TabGroup
			justify="justify-center"
			active="variant-filled-primary"
			hover=""
			flex="flex-1 lg:flex-none"
			rounded=""
			border=""
			class="fixed bottom-0 z-50 w-full bg-surface-800"
		>
			<TabAnchor href="/" selected={page.url.pathname === '/'}>
				<svelte:fragment slot="lead">
					<div class="gsap-apprail-tile-0 grid h-full w-full flex-1 place-items-center">
						<Home
							style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/' ? '--color-surface-800' : '--color-surface-400'}))`}
						></Home>
					</div>
				</svelte:fragment>
				<span>Home</span>
			</TabAnchor>
			<TabAnchor href="/about" selected={page.url.pathname === '/about'}>
				<svelte:fragment slot="lead">
					<div class="gsap-apprail-tile-0 grid h-full w-full flex-1 place-items-center">
						<Help
							style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/about' ? '--color-surface-800' : '--color-surface-400'}))`}
						></Help>
					</div>
					<span>About</span>
				</svelte:fragment>
			</TabAnchor>
			<TabAnchor href="/" selected={page.url.pathname === '/contribute'}>
				<svelte:fragment slot="lead"
					><div class="gsap-apprail-tile-0 grid h-full w-full flex-1 place-items-center">
						<Plus
							style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/contribute' ? '--color-surface-800' : '--color-surface-400'}))`}
						></Plus>
					</div></svelte:fragment
				>
				<span>Contribute</span>
			</TabAnchor>
			<!-- ... -->
		</TabGroup>
	</div>{:else if $screenType == 'md' || $screenType == 'lg'}
	<div class="absolute m-0 flex h-full w-full flex-row p-0">
		<div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<AppRail>
				{#snippet lead()}
					<div
						class="contents"
						onmouseover={() => gsapOnApprailTileHover(0)}
						onmouseleave={() => gsapOnApprailTileLeave(0)}
					>
						<AppRailAnchor href="/">
							<div class="relative flex h-full w-full flex-col justify-between">
								<div class="gsap-apprail-tile-0 grid h-full w-full flex-1 place-items-center">
									<Home
										style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/' ? '--color-primary-500' : '--color-surface-400'}))`}
									></Home>
								</div>
							</div>
						</AppRailAnchor>
						<hr
							class="gsap-apprail-border-0 w-full translate-x-[-100%] border-2 !border-primary-500"
						/>
					</div>

					<div
						class="contents"
						onmouseover={() => gsapOnApprailTileHover(1)}
						onmouseleave={() => gsapOnApprailTileLeave(1)}
					>
						<AppRailAnchor href="/about">
							<div class="relative flex h-full w-full flex-col justify-between">
								<div class="gsap-apprail-tile-0 grid h-full w-full flex-1 place-items-center">
									<Help
										style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/about' ? '--color-primary-500' : '--color-surface-400'}))`}
									></Help>
								</div>
							</div>
						</AppRailAnchor>
						<hr
							class="gsap-apprail-border-1 w-full translate-x-[-100%] border-2 !border-primary-500"
						/>
					</div>
					<div
						class="contents"
						onmouseover={() => gsapOnApprailTileHover(2)}
						onmouseleave={() => gsapOnApprailTileLeave(2)}
					>
						<AppRailAnchor href="/contribute">
							<div class="relative flex h-full w-full flex-col justify-between">
								<div class="gsap-apprail-tile-0 grid h-full w-full flex-1 place-items-center">
									<Plus
										style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/contribute' ? '--color-primary-500' : '--color-surface-400'}))`}
									></Plus>
								</div>
							</div>
						</AppRailAnchor>
						<hr
							class="gsap-apprail-border-2 w-full translate-x-[-100%] border-2 !border-primary-500"
						/>
					</div>
				{/snippet}
				<!-- --- -->

				<!-- --- -->
				{#snippet trail()}
					<div class="text-sm/2 flex flex-col text-center leading-snug">
						<p class="m-0">
							Alpha<br />
							<span class="text-primary-500">•</span> <br />
							V0.0.1
						</p>
					</div>
				{/snippet}
			</AppRail>
		</div>
		<div class="relative h-full w-full flex-1 overflow-auto">
			{@render children?.()}
		</div>
	</div>
{/if}

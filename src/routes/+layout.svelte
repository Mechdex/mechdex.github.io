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
		storePopup
	} from '@skeletonlabs/skeleton';
	import { initializeStores, Drawer } from '@skeletonlabs/skeleton';
	import { gsap } from 'gsap';
	import { screenType } from '$lib/stores';
	import { onMount } from 'svelte';
	import { Flip } from 'gsap/Flip';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

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
	});

	function gsapOnApprailTileHover(tileIndex: number) {
		// gsap.set(`.gsap-apprail-border-${tileIndex}`, { translateX: '-100%' });

		gsap.to(`.gsap-apprail-border-${tileIndex}`, { translateX: '0%', ease: 'expo.out' });
	}

	function gsapOnApprailTileLeave(tileIndex: number) {
		gsap
			.to(`.gsap-apprail-border-${tileIndex}`, { translateX: '100%', ease: 'expo.out' })
			.then((r) => {
				gsap.set(`.gsap-apprail-border-${tileIndex}`, { translateX: '-100%' });
			});
	}

	let path = $derived()
</script>

<svelte:head>
	<title>Game Mechanics | Mechdex</title>
</svelte:head>
<Modal width="w-[80%]" height="h-[80%]" />

{#key page.url.pathname}
	{#if $screenType == 'sm'}<div></div>{:else if $screenType == 'md' || $screenType == 'lg'}
		<div class="absolute w-full h-full flex flex-row">
			<div>
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<p>{path}</p>
				<AppRail>
					<svelte:fragment slot="lead">
						<div
							class="contents"
							on:mouseover={() => gsapOnApprailTileHover(0)}
							on:mouseleave={() => gsapOnApprailTileLeave(0)}
						>
							<AppRailAnchor href="/">
								<div class="w-full h-full flex flex-col justify-between relative">
									<div class="w-full h-full grid place-items-center gsap-apprail-tile-0 flex-1">
										<Home
											style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/' ? '--color-primary-500' : '--color-surface-400'}))`}
										></Home>
									</div>
								</div>
							</AppRailAnchor>
							<hr
								class="!border-primary-500 border-2 w-full translate-x-[-100%] gsap-apprail-border-0"
							/>
						</div>
						<div
							class="contents"
							on:mouseover={() => gsapOnApprailTileHover(1)}
							on:mouseleave={() => gsapOnApprailTileLeave(1)}
						>
							<AppRailAnchor href="/about">
								<div class="w-full h-full flex flex-col justify-between relative">
									<div class="w-full h-full grid place-items-center gsap-apprail-tile-0 flex-1">
										<Help
											style={`font-size: 2rem; color: rgb(var(${page.url.pathname == '/about' ? '--color-primary-500' : '--color-surface-400'}))`}
										></Help>
									</div>
								</div>
							</AppRailAnchor>
							<hr
								class="!border-primary-500 border-2 w-full translate-x-[-100%] gsap-apprail-border-1"
							/>
						</div>
					</svelte:fragment>
					<!-- --- -->

					<!-- --- -->
					<svelte:fragment slot="trail">
						<div class="text-center flex flex-col text-sm/2 leading-snug">
							<p class="m-0">
								Alpha<br />
								<span class="text-primary-500">•</span> <br />
								V0.0.1
							</p>
						</div>
					</svelte:fragment>
				</AppRail>
			</div>
			<div class="relative w-full h-full flex-1">
				<slot />
			</div>
		</div>
	{/if}
{/key}

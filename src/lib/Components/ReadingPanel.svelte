<script lang="ts">
	import CloseIcon from '~icons/mdi/close';
	import ChevronDoubleRightIcon from '~icons/mdi/chevron-double-right';
	import ChevronDoubleLeftIcon from '~icons/mdi/chevron-double-left';
	import PinIcon from '~icons/mdi/pin';
	import HammerWrenchIcon from '~icons/mdi/hammer-wrench';

	import { sidePanelState, pinnedMechanics, mechanicColors } from '$lib/stores';
	import type { Mechanic } from '$lib/types';
	import { marked } from 'marked';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { fly } from 'svelte/transition';

	export let currentDisplayedMechanic: Mechanic;
	export let setSidePanelState: (a: 'hidden' | 'split' | 'full') => void;
	export let asModal = false;

	let modalStore = getModalStore();

	function close() {
		if (asModal) {
			modalStore.close();
		} else {
			setSidePanelState('hidden');
		}
	}
</script>

<div
	class="relative flex h-full w-full flex-row bg-surface-800 {asModal ? 'rounded-lg' : ''}"
	style={asModal ? '' : 'box-shadow: inset 2px 2px 16px black'}
>
	<div class="custom-scrollbar {asModal ? '' : 'pr-15'} flex-1 overflow-y-auto rounded-lg p-10">
		<div class="flex w-full flex-col items-center space-y-6 text-center">
			<h3 class="h3" style:color={mechanicColors[currentDisplayedMechanic.category]}>
				{currentDisplayedMechanic.category}
			</h3>
			<h1 class="mechanic-heading h1 inline-flex flex-wrap items-center justify-center gap-x-2">
				<span>{currentDisplayedMechanic.name}</span>
				<span>/</span>
				<span
					class="rounded-lg p-2 text-surface-900"
					style:background-color={mechanicColors[currentDisplayedMechanic.category]}
				>
					{currentDisplayedMechanic.symbol}
				</span>
			</h1>
			<h2 class="h4 font-light">{currentDisplayedMechanic.short_description}</h2>
		</div>

		<hr class="side-panel-hr !my-8 !border-primary-500 transition-all duration-200" />

		<article
			class="prose max-w-none prose-h2:text-primary-500 prose-h3:text-white prose-p:text-white prose-li:text-white prose-li:marker:text-primary-500"
		>
			<h2>Description</h2>
			<p>{@html marked.parse(currentDisplayedMechanic.long_description)}</p>
			<h2>Problems Solved</h2>
			{#each currentDisplayedMechanic.solved_problems as problem}
				<h3 class="h3 underline decoration-primary-500 decoration-2 underline-offset-2">
					{problem.title}
				</h3>
				<p>{problem.description}</p>
			{/each}
			<h2>Examples</h2>
			{#each currentDisplayedMechanic.examples as example}
				<h3 class="h3 underline decoration-primary-500 decoration-2 underline-offset-2">
					{example.title}
				</h3>
				<p>{example.description}</p>
			{/each}
		</article>
	</div>
	{#if asModal}
		<button
			class="absolute right-2 top-2 h-fit w-fit rounded-full p-2 transition-all hover:bg-surface-700"
			onclick={close}
		>
			<CloseIcon color="rgb(var(--color-primary-500))" font-size="1.2rem" />
		</button>
	{:else}
		<div class="m-2 flex flex-col space-y-4 pb-5">
			<button
				class="h-fit w-fit rounded-full p-2 transition-all hover:bg-surface-700"
				onclick={close}
			>
				<CloseIcon color="rgb(var(--color-primary-500))" font-size="1.2rem" />
			</button>
			{#if !asModal}
				<button
					class="h-fit w-fit rounded-full p-2 transition-all hover:bg-surface-700"
					onclick={() =>
						$sidePanelState == 'full' ? setSidePanelState('split') : setSidePanelState('full')}
				>
					{#if $sidePanelState == 'full'}
						<ChevronDoubleRightIcon color="rgb(var(--color-primary-500))" font-size="1.2rem" />
					{:else}
						<ChevronDoubleLeftIcon color="rgb(var(--color-primary-500))" font-size="1.2rem" />
					{/if}
				</button>
				<button
					onclick={() =>
						$pinnedMechanics.find((p) => p.symbol == currentDisplayedMechanic?.symbol)
							? ($pinnedMechanics =
									[...$pinnedMechanics].filter(
										(p) => p.symbol != currentDisplayedMechanic?.symbol
									) || [])
							: ($pinnedMechanics = [...$pinnedMechanics, currentDisplayedMechanic as Mechanic])}
					class="h-fit w-fit rounded-full p-2 transition-all hover:bg-surface-700 {$pinnedMechanics.find(
						(f) => f.symbol == currentDisplayedMechanic?.symbol
					)
						? 'variant-ringed-primary'
						: ''}"
				>
					<PinIcon color="rgb(var(--color-primary-500))" font-size="1.2rem" />
				</button>
				{#each $pinnedMechanics as mechanic, i}
					<button
						transition:fly={{ x: 25, duration: 50 }}
						class="aspect-square rounded-lg border p-1 text-center text-white transition-all"
						style="border-color: {mechanicColors[mechanic.category]} !important"
						style:background-color={currentDisplayedMechanic.symbol == mechanic.symbol
							? mechanicColors[mechanic.category]
							: 'transparent'}
						onclick={() => (currentDisplayedMechanic = mechanic)}
					>
						{mechanic.symbol}
					</button>
				{/each}
			{/if}
			<div class="flex-1"></div>
			{#if !Object.hasOwn(currentDisplayedMechanic, 'isHumanWritten') || !(currentDisplayedMechanic as Mechanic & { isHumanWritten: boolean }).isHumanWritten}
				<div class="aspect-square w-full">
					<div
						class="peer variant-ghost-surface grid aspect-square w-full place-items-center rounded-lg"
					>
						<HammerWrenchIcon class="w-full text-lg text-surface-100" />
					</div>
					<div
						class="card variant-filled-surface pointer-events-none fixed bottom-0 right-0 z-[60] p-4 opacity-0 transition-opacity peer-hover:opacity-100"
					>
						<p>
							This mechanic's data is a placeholder generated by AI. It will be phased out soon for
							better-quality, human-written content.
						</p>
						<p>If you'd like to rewrite it yourself, please contribute to the database!</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

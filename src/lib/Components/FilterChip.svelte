<script lang="ts">
	import { mechanicColors } from '$lib/stores';
	import type { MechanicCategory } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	interface Props {
		category: MechanicCategory;
		selected?: boolean;
	}

	let { category, selected = $bindable(false) }: Props = $props();

	let dispatcher = createEventDispatcher();

	function onClick() {
		selected = !selected;
		dispatcher('click', { category: category });
	}
</script>

<button
	onclick={onClick}
	class={`btn border transition-all duration-[250ms]`}
	style={`border-color: ${mechanicColors[category]} !important; ${selected ? 'background-color: ' + mechanicColors[category] + ';' : ''}`}
	>{category}</button
>

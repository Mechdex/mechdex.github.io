<script lang="ts">
	import { mechanicColors } from '$lib/stores';
	import type { MechanicCategory } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	export let category: MechanicCategory;
	export let selected = false;

	let dispatcher = createEventDispatcher();

	function onClick() {
		selected = !selected;
		dispatcher('click', { category: category });
	}
</script>

<button
	on:click={onClick}
	class={`btn border transition-all duration-[250ms]`}
	style={`border-color: ${mechanicColors[category]} !important; ${selected ? 'background-color: ' + mechanicColors[category] + ';' : ''}`}
	>{category}</button
>

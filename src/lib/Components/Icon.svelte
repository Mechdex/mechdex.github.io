<script lang="ts">
	import type { BoxIcon } from '$lib/boxicons';
	export let name: BoxIcon;
	export let type: 'regular' | 'solid' | 'logo' = 'regular';
	export let rawColor = '';
	export let color: 'primary' | 'secondary' | 'tertiary' | 'surface' = 'primary';
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
	export let rotate: number = 0;
	export let flip: 'horizontal' | 'vertical' | null = null;
	export let border: 'square' | 'circle' | null = null;

	let finalColor = rawColor || `rgb(var(--color-${color}-500))`;

	const props = {
		name,
		type,
		color: finalColor,
		size,
		rotate,
		...(flip && { flip }),
		...(border && { border })
	};
</script>

<div class="grid place-items-center">
	<!-- <box-icon {...props}></box-icon> -->
	<i class="bx bx-collapse-alt"></i>	
</div>

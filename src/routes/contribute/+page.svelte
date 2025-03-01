<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!browser) return;
		window.location.href = 'https://github.com/Mechdex/mechanics/README.md';
	});
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// onMount(() => {
	// 	if (!browser) return;
	// 	window.location.href = 'https://github.com/Mechdex/mechanics/';
	// });
</script>

<div
	class="bg-surface-900-token flex max-h-fit min-h-full w-full flex-col items-center space-y-8 p-4"
>
	<div class="relative flex w-full flex-row items-center justify-center">
		<div class="left-0 flex flex-1 flex-col items-center justify-center">
			<h1 class="h1 text-center text-primary-500">Contributing</h1>
		</div>
	</div>
	<article class="prose h-full w-full text-on-surface-token sm:pb-10">
		<p>
			All mechanics are stored in a GitHub repository <a
				href="https://github.com/Mechdex/mechanics"
				class="!text-on-surface-token"
				><u class="!decoration-primary-500 !decoration-2 !underline-offset-2">here</u></a
			>.
		</p>
		<ul>
			<li>Mechanic data is stored in a format called <i>YAML</i>.</li>
			<li>Each mechanic is stored in one <i>mechanic.yaml</i> file each.</li>
			<li>
				The structure of the database is simple: one folder for each category. One folder within
				each category for each mechanic. Each folder has only one file - <i>mechanic.yaml</i>.
			</li>
		</ul>
		<h2 class="h2 text-primary-500">Yeah, but how do I add/update a mechanic?</h2>
		<p>
			I'll eventually add more details later, but if you already understand how <a
				href="https://github.com/git-guides"
				class="!text-on-surface-token"
				><u class="!decoration-primary-500 !decoration-2 !underline-offset-2">git</u></a
			> works, all you need to do is to fork and create a pull request.
		</p>
		<ol>
			<li>First, create a Github account.</li>
			<li>Then, <i>fork</i> the repository to your account. Make your changes and commit them.</li>
			<li>
				<a href="https://github.com/Mechdex/mechanics/compare" class="!text-on-surface-token"
					><u class="!decoration-primary-500 !decoration-2 !underline-offset-2"
						>Open a pull request</u
					></a
				> on Github.
			</li>
			<li>Wait for me to merge your changes.</li>
		</ol>

		<p>That's it. Thanks for taking the time to contribute!</p>
	</article>
</div>

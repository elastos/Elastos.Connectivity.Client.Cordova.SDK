<script>
	// This property is used by Modal.svelte to pass down the close function
  export let onClose;
</script>

<style>
	button {
		position: absolute;
		top: -3rem;
		right: 0;
		color: white;
		background: linear-gradient(to bottom, #732dcf, #640fd4);
		border: 2px solid linear-gradient(to bottom, #732dcf, #640fd4);
	}
</style>

<button on:click={onClose}>Custom Close Button</button>
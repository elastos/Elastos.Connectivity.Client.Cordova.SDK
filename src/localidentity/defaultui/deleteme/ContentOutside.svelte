<script>
	import { fly } from 'svelte/transition';
	import { bind } from '../../../internal/ui/shared/Modal.svelte';
  	import Popup from '../Popup.svelte';
	import { modal } from '../../../internal/ui/shared/stores';

	let opening = false;
	let opened = false;
	let closing = false;
	let closed = false;

  	const showPopup = () => {
		modal.set(Popup);
	};

  	const showPopupWithProps = () => {
		console.log(bind(Popup, { message: "It's a customized popup!" }))
		modal.set(bind(Popup, { message: "It's a customized popup!" }));
	};
</script>

<section>
	<hr />
	<button on:click={showPopup}>Show a popup from an outside component!</button>
	<br />
	<button on:click={showPopupWithProps}>Show a popup from an outside component with custom props!</button>
</section>

<style>
	section {
		padding-top: 0.5em;
	}
	hr {
		border: 0;
		border-top: 1px dashed #ccc;
		padding-bottom: 1em;
	}
</style>
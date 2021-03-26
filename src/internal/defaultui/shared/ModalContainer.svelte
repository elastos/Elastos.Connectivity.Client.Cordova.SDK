<script lang="ts">
	import { modal } from './stores';
	import { bind } from './Modal.svelte';
	import Modal from './Modal.svelte';
	import type { ModalCallbacks } from './modalcallbacks';

	let activeModal: Modal;

	export function show(component: Svelte2TsxComponent, props: any, callbacks?: ModalCallbacks) {
		modal.set(bind(component, props));
		activeModal.setCallback(callbacks || {});
	}

	export function close() {
		activeModal.close();
	}
</script>

{#if modal}
<Modal show={$modal} bind:this={activeModal}></Modal>
{/if}
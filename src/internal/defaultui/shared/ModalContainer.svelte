<script lang="ts">
	import { modal } from './stores';
	import { bind } from './Modal.svelte';
	import Modal from './Modal.svelte';

	export function show(component: Svelte2TsxComponent, props: any) {
		modal.set(bind(component, props));
	}
</script>

<Modal show={$modal}></Modal>

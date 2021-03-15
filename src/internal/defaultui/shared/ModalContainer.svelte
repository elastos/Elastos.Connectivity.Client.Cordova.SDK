<script lang="ts">
	import { modal } from './stores';
	import { bind } from './Modal.svelte';
	import Modal from './Modal.svelte';
	import IdentityPrompt from '../generic/IdentityPrompt.svelte';

	export function test2() {
		modal.set(bind(IdentityPrompt, { message: "Hey cool 2"}));
	}
</script>

<Modal show={$modal}></Modal>

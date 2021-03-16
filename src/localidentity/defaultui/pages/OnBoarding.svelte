<style>
</style>

<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { connectivity } from '../../..';

    function next() {
        connectivity.localIdentityUIHandler.showCreateIdentity();
    }
</script>

<h1>Welcome</h1>
<button on:click={next}>Create now</button>
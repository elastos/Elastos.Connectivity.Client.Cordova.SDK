<!-- Swiper styles must be global otherwise they are removed by the sass loader -->
<style type="text/scss" global>
    @import '../../../../node_modules/swiper/swiper.scss';
	@import '../../../../node_modules/swiper/components/navigation/navigation.scss';
	@import '../../../../node_modules/swiper/components/pagination/pagination.scss';
	@import '../../../../node_modules/swiper/components/scrollbar/scrollbar.scss';
</style>

<script lang="ts">
    import { ViewType } from "../viewtype";
    import IdentitySetup from "./IdentitySetup.svelte";
    import { viewType } from "../localidstores";

    export let activeViewType: ViewType | null = ViewType.None;

    viewType.subscribe((newViewType)=>{
        console.log("Active view type changed:", newViewType);
        activeViewType = newViewType;
    })
</script>

{#if activeViewType == ViewType.IdentitySetup }
<IdentitySetup></IdentitySetup>
{:else}
Nothing here
{/if}
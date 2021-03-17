<style>
    h1 {
        font-size: 2rem;
        text-align: center;
    }

    h2 {
        font-size: 1.25rem;
    }
</style>

<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { connectivity } from '../../..';
    import type { IConnector } from '../../../interfaces/connectors';
    import { modal } from '../shared/stores';
    import { globalModalService } from '../../../services/global.modal.service';

    export let onSelection = null;

    async function connectorSelected(connector: IConnector) {
        connectivity.setActiveConnector(connector.name);

        // Close the popup
        //modal.set(null);

        globalModalService.getModal().close();

        setTimeout(()=>{
            onSelection(connector.name);
        }, 500);

        /*
        await this.identityService.saveUsingExternalIdentityWalletPreference();

        let responseParams = {
            action: "external"
        };
        appManager.sendIntentResponse(null, responseParams, this.dappService.getReceivedIntent().intentId, ()=>{
            console.log("Proxy intent response sent, original request:", this.dappService.getReceivedIntent(), "Response params:", responseParams);
        }, (err)=>{
            console.log("Failed to send intent response:", err);
        });*/
    }

    /**
     * User wants to create a temporary identity internally in the trinity native app. We send this information to the
     * runtime, and the runtime is going to launch this identity app in a normal way with credaccess.
     * At that time, we will create the identity.
     */
    async function useTemporaryIdentity() {
        /*await this.identityService.saveUsingBuiltInIdentityWalletPreference();

        let responseParams = {
            action: "internal"
        };
        appManager.sendIntentResponse(null, responseParams, this.dappService.getReceivedIntent().intentId, ()=>{
            console.log("Proxy intent response sent, original request:", this.dappService.getReceivedIntent(), "Response params:", responseParams);
        }, (err)=>{
            console.log("Failed to send intent response:", err);
        });*/
    }
</script>

<ion-content class="ion-text-center">
<ion-grid class="container">
    <img src={"!theme.darkMode ? 'assets/icons/did.svg' : 'assets/icons/darkmode/did.svg'"} alt="">
    <h1>{$_('credaccessprompt.please-choose')}</h1>
    <h2>{$_('credaccessprompt.your-did')}</h2>
</ion-grid>
</ion-content>

<ion-footer class="ion-no-border">
<p>{ $_('credaccessprompt.login-msg') }</p>
{#each connectivity.getAvailableConnectors() as connector }
    <ion-button on:click={() => connectorSelected(connector)}>{connector.name}</ion-button>
{/each}
</ion-footer>

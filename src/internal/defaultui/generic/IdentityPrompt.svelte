<style>
    h1 {
        font-size: 2rem;
        text-align: center;
    }

    h2 {
        font-size: 1.25rem;
    }

    p {
        padding: 0 10px;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
    }

    footer {
        padding: 20px 20px 15px;
        border: none;
    }

    button {
        height: 50px;
        width: 100%;
        background: linear-gradient(to bottom, #732dcf, #640fd4);
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 5px;
    }

    .dark-mode {
        background: #191a2f;
        color: #ffffff;
    }
</style>

<script lang="ts">
    //import { _ } from 'svelte-i18n';
    import { connectivity } from '../../../connectivity';
    import type { IConnector } from '../../../interfaces/connectors';
    import { globalModalService } from '../../../services/global.modal.service';
    import { _ } from "svelte-i18n";
    import { globalThemeService } from '../../../services/global.theme.service';

    export let onSelection = null;
    const theme = globalThemeService;

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
            logger.log("Proxy intent response sent, original request:", this.dappService.getReceivedIntent(), "Response params:", responseParams);
        }, (err)=>{
            logger.log("Failed to send intent response:", err);
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
            logger.log("Proxy intent response sent, original request:", this.dappService.getReceivedIntent(), "Response params:", responseParams);
        }, (err)=>{
            logger.log("Failed to send intent response:", err);
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

<footer class:dark-mode={theme.darkMode}>
    <p>{ $_('credaccessprompt.login-msg') }</p>
    {#each connectivity.getAvailableConnectors() as connector }
        {#await connector.getDisplayName() then connectorName }
            <button on:click={() => connectorSelected(connector)}>{ $_(connectorName) }</button>
        {/await}
    {/each}
</footer>

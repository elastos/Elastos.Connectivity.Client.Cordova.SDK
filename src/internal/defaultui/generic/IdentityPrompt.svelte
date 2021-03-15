<script lang="ts">
    import { _, dictionary, locale } from 'svelte-i18n';
    import { Connectivity } from '../../../connectivity';
import type { IConnector } from '../../../interfaces/connectors';
import { modal } from '../shared/stores';

    export let onSelection = null;

    dictionary.set({
        en: {
            credaccessprompt: {
                "login-msg": "Select one of the following options",
                "please-choose": 'Please choose',
                "your-did": 'Your DID',
                "temp-did": "Create a temporary identity"
            },
        },
        fr: {
            credaccessprompt: {
                "login-msg": "Choisissez l'une des options suivantes",
                "please-choose": 'Veuillez choisir',
                "your-did": 'Votre DID',
                "temp-did": "Créer une identité temporaraire"
            },
        },
    });
    locale.set('en');

    async function connectorSelected(connector: IConnector) {
        Connectivity.setActiveConnector(connector.name);

        // Close the popup
        modal.set(null);

        onSelection(connector.name);

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

<style>
    h1 {
        font-size: 2rem;
        text-align: center;
    }

    h2 {
        font-size: 1.25rem;
    }
</style>

<ion-content class="ion-text-center">
<ion-grid class="container">
    <img src={"!theme.darkMode ? 'assets/icons/did.svg' : 'assets/icons/darkmode/did.svg'"} alt="">
    <h1>{$_('credaccessprompt.please-choose')}</h1>
    <h2>{$_('credaccessprompt.your-did')}</h2>
</ion-grid>
</ion-content>

<ion-footer class="ion-no-border">
<p>{ $_('credaccessprompt.login-msg') }</p>
{#each Connectivity.getAvailableConnectors() as connector }
    <ion-button on:click={() => connectorSelected(connector)}>{connector.name}</ion-button>
{/each}
</ion-footer>
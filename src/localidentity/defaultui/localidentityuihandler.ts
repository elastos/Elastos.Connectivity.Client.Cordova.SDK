import type { ILocalIdentityUIHandler } from "../../interfaces/ui/ilocalidentityuihandler";
import { globalModalService } from "../../services/global.modal.service";
import OnBoarding from "./pages/OnBoarding.svelte";
import IdentitySetup from "./pages/IdentitySetup.svelte";
import Root from './pages/Root.svelte';
import { navigatedView } from './localidstores';
import { ViewType } from "./viewtype";
import { navService } from "./nav.service";
import { identityService } from "../services/identity.service";
import type { IdentitySetupNavParams } from "./navparams";

export class LocalIdentityUIHandler implements ILocalIdentityUIHandler {
    private localIdentityModalShown = false;

    constructor() {
        console.log("Local identity UI handler created");
    }

    private async showRootComponentInModal(onPopupClosed?: ()=>void): Promise<void> {
        return new Promise((resolve)=>{
            if (!this.localIdentityModalShown) {
                console.log("Showing local identity modal");
                globalModalService.getModal().show(Root, {
                }, {
                    onOpen: () => {
                        this.localIdentityModalShown = true
                        console.log("Modal is opened, resolving");
                        resolve();
                    },
                    onClosed: ()=>{
                        this.localIdentityModalShown = false;
                        if (onPopupClosed)
                            onPopupClosed();
                    }
                });
            }
            else {
                // Nothing to do
                resolve();
            }
        });
    }

    async showOnBoarding(): Promise<void> {
        // TODO: empty for now
        return null;
    }

    /**
     * Show the local identity creation popup / flow / steps
     */
    async showCreateIdentity(): Promise<void> {
        return new Promise(async (resolve)=>{
            console.log("Local identity: showCreateIdentity()");
            await this.showRootComponentInModal();
            console.log("Setting view type to IdentitySetup");
            navService.navigateTo(ViewType.IdentitySetup, {
                onIdentityCreationCompleted:() => {
                    resolve();
                }
            } as IdentitySetupNavParams);

            // NOTE: if user cancels, we never fulfill this promise for now.
        });
    }

    showRequestGetCredentials(claims: any): Promise<DIDPlugin.VerifiablePresentation> {
        return identityService.generatePresentationForClaims(claims);
    }

    showRequestIssueAppIDCredential(appInstanceDID: string): Promise<DIDPlugin.VerifiableCredential> {
        return identityService.generateApplicationIDCredential(appInstanceDID, "did:elastos:TODO");
    }

    showManageIdentity(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
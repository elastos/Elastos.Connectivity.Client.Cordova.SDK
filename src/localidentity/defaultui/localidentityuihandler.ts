import type { ILocalIdentityUIHandler } from "../../interfaces/ui/ilocalidentityuihandler";
import { globalModalService } from "../../services/global.modal.service";
import OnBoarding from "./pages/OnBoarding.svelte";
import IdentitySetup from "./pages/IdentitySetup.svelte";
import Root from './pages/Root.svelte';
import { viewType } from './localidstores';
import { ViewType } from "./viewtype";

export class LocalIdentityUIHandler implements ILocalIdentityUIHandler {
    private localIdentityModalShown = false;

    private async showRootComponentInModal(): Promise<void> {
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
                    }
                });
            }
            else {
                // Nothing to do
                resolve();
            }
        });
    }

    showOnBoarding(): Promise<void> {
        // TODO: empty for now
        return new Promise((resolve)=>{
            globalModalService.getModal().show(OnBoarding, {
            }, {
                onClosed: ()=>{
                    resolve();
                }
            });
        });
    }

    /**
     * Show the local identity creation popup / flow / steps
     */
    async showCreateIdentity(): Promise<void> {
        console.log("Local identity: showCreateIdentity()");
        await this.showRootComponentInModal();
        console.log("Setting view type to IdentitySetup");
        viewType.set(ViewType.IdentitySetup);
    }

    showRequestGetCredentials(claims: any): Promise<DIDPlugin.VerifiablePresentation> {
        throw new Error("Method not implemented.");
    }

    showRequestIssueAppIDCredential(): Promise<DIDPlugin.VerifiableCredential> {
        throw new Error("Method not implemented.");
    }

    showManageIdentity(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
import type { ILocalIdentityUIHandler } from "../../interfaces/ui/ilocalidentityuihandler";

import ModalContainer from "../../internal/defaultui/shared/ModalContainer.svelte";
import OnBoarding from "./pages/OnBoarding.svelte";
import IdentitySetup from "./pages/IdentitySetup.svelte";

export class LocalIdentityUIHandler implements ILocalIdentityUIHandler {
    private localIDModalContainer = new ModalContainer({
        target: document.body
    });

    showOnBoarding(): Promise<void> {
        // TODO: empty for now
        return new Promise((resolve)=>{
            this.localIDModalContainer.show(OnBoarding, {
            }, {}, {}, {
                onClosed: ()=>{
                    resolve();
                }
            });
        });
    }

    /**
     * Show the local identity creation popup / flow / steps
     */
    showCreateIdentity(): Promise<void> {
        return new Promise<void>((resolve)=>{
            this.localIDModalContainer.show(IdentitySetup, {
            }, {}, {}, {
                onClosed: ()=>{
                    resolve();
                }
            });
        });
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
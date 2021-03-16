import type { ILocalIdentityUIHandler } from "../../interfaces/ui/ilocalidentityuihandler";

import ModalContainer from "../../internal/defaultui/shared/ModalContainer.svelte";
import OnBoarding from "./pages/OnBoarding.svelte";
import IdentitySetup from "./pages/IdentitySetup.svelte";

export class LocalIdentityUIHandler implements ILocalIdentityUIHandler {
    private localIDModalContainer = new ModalContainer({
        target: document.body
    });

    showOnBoarding() {
        return new Promise((resolve)=>{
            this.localIDModalContainer.show(OnBoarding, {
                onSelection: (selectedConnectorName)=>{
                    console.log("Selected connector: "+selectedConnectorName);
                    resolve(selectedConnectorName);
                }
            }, {}, {}, {
                onClosed: ()=>{

                }
            });
        });
    }

    /**
     * Show the local identity creation popup / flow / steps
     */
    showCreateIdentity() {
        return new Promise<void>((resolve)=>{
            this.localIDModalContainer.show(IdentitySetup, {
            }, {}, {}, {
                onClosed: ()=>{
                    resolve();
                }
            });
        });
    }

    showRequestGetCredentials() {
        throw new Error("Method not implemented.");
    }

    showRequestIssueAppIDCredential() {
        throw new Error("Method not implemented.");
    }

    showManageIdentity() {
        throw new Error("Method not implemented.");
    }
}
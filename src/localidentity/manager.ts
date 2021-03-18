import { connectivity } from "..";
import { identityService } from "./services/identity.service";

class LocalIdentityManager {
    /**
     * Triggers the UI interface that allows user to manage his local identity (profile name, export, etc).
     * In case the identity creation is not completed yet, the identity creation UI is displayed.
     */
    public async manageIdentity() {
        if (!await identityService.identityIsPublished()) {
            // No local identity yet: we have to create one first
            console.log("Local identity is not ready to use, showing identity creation screen");
            await connectivity.localIdentityUIHandler.showCreateIdentity();
            // TODO: We should go directly to the manage identity screen after identity creation completion
        }
        else {
            connectivity.localIdentityUIHandler.showManageIdentity();
        }
    }
}

export const localIdentityManager = new LocalIdentityManager();
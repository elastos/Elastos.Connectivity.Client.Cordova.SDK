import { connectivity } from "..";
import type { Connectors } from "../interfaces";
import { identityService } from "./services/identity.service";

export class LocalIdentityConnector implements Connectors.IConnector {
    public name: string = "local-identity";

    /**
     * DID API
     */

    async getCredentials(claims: any): Promise<DIDPlugin.VerifiablePresentation> {
        if (!await identityService.identityIsFullyReadyToUse()) {
            // No local identity yet: we have to create one first
            console.log("Local identity is not ready to use, showing identity creation screen");
            await connectivity.localIdentityUIHandler.showCreateIdentity();
            console.log("Local identity - getCredentials() - after showCreateIdentity()");
            return null; // TODO: for now, after the initial creation, we don't proceed to the initial request. This is to be done
        }
        else {
            let credential = await connectivity.localIdentityUIHandler.showRequestGetCredentials(claims);
            return credential;
        }
    }

    async generateAppIdCredential(appInstanceDID: string): Promise<DIDPlugin.VerifiableCredential> {
        if (!await identityService.identityIsFullyReadyToUse()) {
            // No local identity yet: we have to create one first
            console.log("Local identity is not ready to use, showing identity creation screen");
            await connectivity.localIdentityUIHandler.showCreateIdentity();
            return null; // TODO: for now, after the initial creation, we don't proceed to the initial request. This is to be done
        }
        else {
            let credential = await connectivity.localIdentityUIHandler.showRequestIssueAppIDCredential();
            return credential;
        }
    }

    /**
     * Wallet API
     */

    async pay() {
        throw new Error("Method not implemented.");
    }

    async voteForDPoS() {
        throw new Error("Method not implemented.");
    }

    async voteForCRCouncil() {
        throw new Error("Method not implemented.");
    }

    async voteForCRProposal() {
        throw new Error("Method not implemented.");
    }

    async sendSmartContractTransaction(payload: any): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
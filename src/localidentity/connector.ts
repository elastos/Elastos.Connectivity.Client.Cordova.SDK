import { connectivity } from "..";
import type { Connectors } from "../interfaces";
import { identityService } from "./services/identity.service";

export class LocalIdentityConnector implements Connectors.IConnector {
    public name: string = "local-identity";

    /**
     * DID API
     */

    getCredentials(claims: any): Promise<DIDPlugin.VerifiablePresentation> {
        throw new Error("Method not implemented.");
    }

    async generateAppIdCredential(appInstanceDID: string): Promise<DIDPlugin.VerifiableCredential> {
        if (!identityService.identityIsFullyReadyToUse()) {
            // No local identity yet: we have to create one first
            await connectivity.localIdentityUIHandler.showCreateIdentity();

        }
        if (identityService.identityIsFullyReadyToUse()) {
            let credential = await connectivity.localIdentityUIHandler.showRequestIssueAppIDCredential();
            return credential;
        }
        else {
            return null;
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
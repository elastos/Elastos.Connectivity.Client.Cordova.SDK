import { connectivity } from "../connectivity";
import type { Connectors } from "../interfaces";
import { identityService } from "./services/identity.service";
import type { GetCredentialsQuery } from "../did/model/getcredentialsquery";
import { _, getMessageFormatter } from 'svelte-i18n';
import type { PayQuery, TransactionResult } from "../wallet";

export class LocalIdentityConnector implements Connectors.IConnector {
    public name: string = "local-identity";

    async getDisplayName(): Promise<string> {
        return getMessageFormatter("local-identity-name").format() as string;
    }

    /**
     * DID API
     */

    async getCredentials(query: GetCredentialsQuery): Promise<DIDPlugin.VerifiablePresentation> {
        if (!await identityService.identityIsFullyReadyToUse()) {
            // No local identity yet: we have to create one first
            console.log("Local identity is not ready to use, showing identity creation screen");
            await connectivity.localIdentityUIHandler.showCreateIdentity();
            console.log("Local identity - getCredentials() - after showCreateIdentity()");
            return null; // TODO: for now, after the initial creation, we don't proceed to the initial request. This is to be done
        }
        else {
            let credential = await connectivity.localIdentityUIHandler.showRequestGetCredentials(query);
            return credential;
        }
    }

    async generateAppIdCredential(appInstanceDID: string, appDID: string): Promise<DIDPlugin.VerifiableCredential> {
        if (!await identityService.identityIsPublished()) {
            // No local identity yet: we have to create one first
            console.log("Local identity is not ready to use, showing identity creation screen");
            await connectivity.localIdentityUIHandler.showCreateIdentity();
            return null; // TODO: for now, after the initial creation, we don't proceed to the initial request. This is to be done
        }
        else {
            let credential = await connectivity.localIdentityUIHandler.showRequestIssueAppIDCredential(appInstanceDID, appDID);
            return credential;
        }
    }

    /**
     * Wallet API
     */

    async pay(query: PayQuery): Promise<TransactionResult> {
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
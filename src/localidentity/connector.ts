import type { Connectors } from "../interfaces";

export class LocalIdentityConnector implements Connectors.IConnector {
    public name: string = "local-identity";

    /**
     * DID API
     */

    getCredentials(claims: any): Promise<DIDPlugin.VerifiablePresentation> {
        throw new Error("Method not implemented.");
    }

    generateAppIdCredential(appInstanceDID: string): Promise<DIDPlugin.VerifiableCredential> {
        throw new Error("Method not implemented.");
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
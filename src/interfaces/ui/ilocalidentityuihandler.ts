export interface ILocalIdentityUIHandler {
    // Identity management
    showCreateIdentity(): Promise<void>;
    showManageIdentity(): Promise<void>;

    // Identity usage requests
    showRequestGetCredentials(claims: any): Promise<DIDPlugin.VerifiablePresentation>;
    showRequestIssueAppIDCredential(appInstanceDID: string): Promise<DIDPlugin.VerifiableCredential>;
}
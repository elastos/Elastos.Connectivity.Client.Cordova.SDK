export interface ILocalIdentityUIHandler {
    showOnBoarding(): Promise<void>;
    showCreateIdentity(): Promise<void>;
    showRequestGetCredentials(claims: any): Promise<DIDPlugin.VerifiablePresentation>;
    showRequestIssueAppIDCredential(): Promise<DIDPlugin.VerifiableCredential>;
    showManageIdentity(): Promise<void>;
}
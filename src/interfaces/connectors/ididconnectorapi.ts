import type { GetCredentialsQuery } from "../../did/model/getcredentialsquery";
import type { CredentialDisclosureRequest } from "../../did/model/requestcredentialsquery";
export interface IDIDConnectorAPI {
    /**
     * Gets credentials from user identity, based on the requested GetCredentialsQuery. Claims format is available
     * on the elastos developer portal and can be optional or mandatory.
     * A DID Verifiable Presentation is returned, including the list of related credentials found
     * in user's identity wallet.
     */
    getCredentials(query: GetCredentialsQuery): Promise<DIDPlugin.VerifiablePresentation>;

    /**
     * Replacement for the deprecated getCredentials().
     *
     * Gets credentials from user identity, based on the requested CredentialDisclosureRequest.
     * A DID Verifiable Presentation is returned, including the list of related credentials found
     * in user's identity wallet.
     */
    requestCredentials?(request: CredentialDisclosureRequest): Promise<DIDPlugin.VerifiablePresentation>;

    /**
     * Requests user's identity wallet to generate a special "app ID" credential. This credential is used
     * to authorize an application to access some kind of information after prooving who it is.
     * For example, this credential is used by the hive authentication, in order to let apps access only
     * the storage space sandboxed using the application DID, and not other app's storage data.
     *
     * This credential is sensitive and must be delivered by the identity wallet only after verifying that
     * the requesting application is really the owner of appDID, for example by making sure that the redirect
     * url registered in the App's DID Document (public) matches the redirect url defined to receive the response
     * to this connector request (when a third party identity app is used).
     *
     * @param appInstanceDID The temporary application instance DID. Usually, automatically generated by this SDK.
     * @param appDID The developer defined application DID. This DID must be published on chain and configured with a developer tool application.
     */
    generateAppIdCredential(appInstanceDID: string, appDID: string): Promise<DIDPlugin.VerifiableCredential>;
}
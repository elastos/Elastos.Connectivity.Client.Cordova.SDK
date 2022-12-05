import moment from 'moment';
import { connectivity } from "../connectivity";
import { ConnectivityHelper } from "../internal/connectivityhelper";
import { globalLoggerService as logger } from "../services/global.logger.service";
import { globalStorageService } from "../services/global.storage.service";
import { DIDHelper } from "./didhelper";
import type { FastDIDCreationResult } from "./fastdidcreationresult";
import type { GetCredentialsQuery } from "./model/getcredentialsquery";
import type { CredentialDisclosureRequest } from './model/requestcredentialsquery';
import { generateRandomDIDStoreId, notImplementedError, randomString } from "./utils";

declare let didManager: DIDPlugin.DIDManager;

export class DIDAccess {
    private helper: DIDHelper = null;

    constructor() {
        this.helper = new DIDHelper();
    }

    /**
     * @deprecated Use requestCredentials().
     *
     * Gets credentials from user identity, based on the requested GetCredentialsQuery.
     * A DID Verifiable Presentation is returned, including the list of related credentials found
     * in user's identity wallet.
     */
    public async getCredentials(query: GetCredentialsQuery): Promise<DIDPlugin.VerifiablePresentation> {
        return new Promise((resolve) => {
            ConnectivityHelper.ensureActiveConnector(async () => {
                let presentation = await connectivity.getActiveConnector().getCredentials(query);
                resolve(presentation);
            }, () => {
                resolve(null);
            });
        });
    }

    /**
     * Replacement for the deprecated getCredentials().
     *
     * Gets credentials from user identity, based on the requested CredentialDisclosureRequest.
     * A DID Verifiable Presentation is returned, including the list of related credentials found
     * in user's identity wallet.
     */
    public async requestCredentials(request: CredentialDisclosureRequest): Promise<DIDPlugin.VerifiablePresentation> {
        return new Promise((resolve, reject) => {
            ConnectivityHelper.ensureActiveConnector(async () => {
                if (!connectivity.getActiveConnector().requestCredentials) {
                    reject(notImplementedError("requestCredentials"));
                    return;
                }

                try {
                    // If realm and/or nonce are not set by the app, we set and verify some values.
                    // DID SDKs force those fields to be set for security reasons.
                    let shouldManuallyVerifyNonce = false;
                    if (!request.nonce) {
                        request.nonce = randomString();
                        shouldManuallyVerifyNonce = true;
                    }
                    let shouldManuallyVerifyRealm = false;
                    if (!request.realm) {
                        request.realm = randomString();
                        shouldManuallyVerifyRealm = true;
                    }

                    // Hardcoded format version - we are now at version 2 (after May 2022)
                    request._version = 2;

                    let presentation = await connectivity.getActiveConnector().requestCredentials(request);

                    /* TODO: DID plugin can't match those DID JS SDK calls for now - improve this
                    if (presentation) {
                        if (shouldManuallyVerifyNonce && request.nonce !== presentation.getProof().getNonce()) {
                            reject(new Error("Automatically generated nonce doesn't match nonce in the returned presentation"));
                            return;
                        }
                        if (shouldManuallyVerifyRealm && request.realm !== presentation.getProof().getRealm()) {
                            reject(new Error("Automatically generated realm doesn't match realm in the returned presentation"));
                            return;
                        }
                    } */
                    resolve(presentation);
                }
                catch (e) {
                    reject(e);
                }
            }, () => {
                resolve(null);
            });
        });
    }

    public async generateAppIdCredential(): Promise<DIDPlugin.VerifiableCredential> {
        return new Promise((resolve) => {
            ConnectivityHelper.ensureActiveConnector(async () => {
                let storedAppInstanceDID = await this.getOrCreateAppInstanceDID();
                if (!storedAppInstanceDID) {
                    resolve(null);
                    return;
                }

                let appInstanceDID = storedAppInstanceDID.did;

                // No such credential, so we have to create one. Send an intent to get that from the did app
                logger.log("Starting to generate a new App ID credential.");

                let credential = await connectivity.getActiveConnector().generateAppIdCredential(appInstanceDID.getDIDString(), connectivity.getApplicationDID());

                // TODO IMPORTANT: Check if the credential was issued by the user himself for security purpose, to make sure
                // another app is not trying to issue and add a fake app-id-credential credential to user's profile
                // by another way.

                // Save this issued credential for later use.
                appInstanceDID.addCredential(credential);

                // This generated credential must contain the following properties:
                // TODO: CHECK THAT THE RECEIVED CREDENTIAL CONTENT IS VALID
                // appInstanceDid
                // appDid

                resolve(credential);
            }, () => {
                resolve(null);
            });
        });
    }

    /**
     * Gets the special App ID credential from the app instance DID. This credential was delivered by
     * a connector and signed with user's DID, after user's approval.
     * The credential contains the real app did used to publish it.
     */
    public async getExistingAppIdentityCredential(): Promise<DIDPlugin.VerifiableCredential> {
        logger.log("Trying to get an existing app ID credential from storage");

        let storedAppInstanceDID = await this.getOrCreateAppInstanceDID();
        if (!storedAppInstanceDID) {
            return null;
        }
        let appInstanceDID = storedAppInstanceDID.did;

        logger.log("App Instance DID:", appInstanceDID);

        let credential = appInstanceDID.getCredential("#app-id-credential");
        if (credential) {
            // If the credential exists but expiration date it too close, delete the current one to force generating a
            // new one.
            let expirationDate = moment(credential.getExpirationDate());
            if (expirationDate.isBefore(moment().subtract(1, 'hours'))) {
                // We are expired - ask to generate a new credential
                logger.log("Existing credential is expired or almost expired - renewing it");
                return null;
            }
            else {
                logger.log("Returning existing app id credential found in app's local storage");
            }
        }

        return credential;
    }

    /**
     * Get the existing application instance DID if it was created before. Otherwise, a new app instance
     * DID is created and the information is stored in persistent storage for later use.
     */
    public async getOrCreateAppInstanceDID(): Promise<{ did: DIDPlugin.DID, didStore: DIDPlugin.DIDStore }> {
        let didStore: DIDPlugin.DIDStore = null;
        let did: DIDPlugin.DID = null;

        logger.log("Getting or creating app instance DID");

        return new Promise((resolve) => {
            ConnectivityHelper.ensureActiveConnector(async () => {
                // Check if we have a app instance DID store saved in our local storage (app manager settings)
                let appInstanceDIDInfo = await this.getExistingAppInstanceDIDInfo();
                if (appInstanceDIDInfo) {
                    // DID store found - previously created. Open it and get the app instance did.
                    didStore = await DIDHelper.openDidStore(appInstanceDIDInfo.storeId);
                    if (didStore) { // Make sure the DID store could be loaded, just in case (abnormal case).
                        try {
                            did = await DIDHelper.loadDID(didStore, appInstanceDIDInfo.didString);
                        }
                        catch (err) {
                            logger.error(err);
                        }
                    }
                }

                if (!didStore || !did) {
                    logger.log("No app instance DID found. Creating a new one");

                    // No DID store found. Need to create a new app instance DID.
                    let didCreationresult = await this.createNewAppInstanceDID();
                    if (!didCreationresult) {
                        resolve(null);
                        return;
                    }
                    else {
                        didStore = didCreationresult.didStore;
                        did = didCreationresult.did;
                    }
                }

                // Load credentials first before being able to call getCredential().
                await DIDHelper.loadDIDCredentials(did);

                resolve({
                    did: did,
                    didStore: didStore
                });
            }, () => {
                // Cancelled
                resolve(null);
            });
        });
    }

    /**
    * Retrieve information about existing app instance info from permanent storage, if any.
    */
    public async getExistingAppInstanceDIDInfo(): Promise<{ storeId: string, didString: string, storePassword: string }> {
        let storeId = await globalStorageService.get("dappsdk_appinstancedidstoreid", null, true)
        let didString = await globalStorageService.get("dappsdk_appinstancedidstring", null, true)
        let storePassword = await globalStorageService.get("dappsdk_appinstancedidstorepassword", null, true)

        if (storeId && didString) {
            return {
                storeId: storeId,
                didString: didString,
                storePassword: storePassword
            };
        }

        return null;
    }

    /**
     * Convenient method to:
     * - Create a new DID store
     * - Initiate its private key with a mnemonic
     * - Create a default DID in the store
     *
     * This method should be directly in the DID SDK / DID Plugin. We keep it here private for now
     * for convenience.
     */
    public fastCreateDID(language: DIDPlugin.MnemonicLanguage): Promise<FastDIDCreationResult> {
        logger.log("Fast DID creation with language " + language);

        return new Promise((resolve, reject) => {
            didManager.generateMnemonic(language, (mnemonic) => {
                let didStoreId = generateRandomDIDStoreId();
                didManager.initDidStore(didStoreId, (payload: string, memo: string) => {
                    // Never called
                }, async (didStore) => {
                    // Store created, now init the private identity
                    let storePass = this.helper.generateRandomPassword();
                    didStore.initPrivateIdentity(language, mnemonic, null, storePass, true, () => {
                        // Now add a DID
                        didStore.newDid(storePass, "", (did) => {
                            // DID added, now we can return
                            resolve({
                                didStore: didStore,
                                did: did,
                                storePassword: storePass
                            });
                        }, (err) => {
                            logger.error(err);
                            resolve(null);
                        });
                    }, (err) => {
                        logger.error(err);
                        resolve(null);
                    });
                }, (err) => {
                    logger.error(err);
                    resolve(null);
                });
            }, (err) => {
                logger.error(err);
                resolve(null);
            });
        });
    }

    /**
     * Creates a new application instance DID store, DID, and saves info to permanent storage.
     */
    public async createNewAppInstanceDID(): Promise<{ didStore: DIDPlugin.DIDStore, did: DIDPlugin.DID }> {
        let didCreationResult = await this.fastCreateDID("ENGLISH");
        if (!didCreationResult)
            return null;

        await this.helper.saveAppInstanceDIDInfo(didCreationResult.didStore.getId(), didCreationResult.did.getDIDString(), didCreationResult.storePassword);

        return {
            didStore: didCreationResult.didStore,
            did: didCreationResult.did
        }
    }
}

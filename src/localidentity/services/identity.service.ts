import { DID } from '../..';
import { DIDPublicationStatus } from '../model/didpublicationstatus.model';
import { HiveCreationStatus } from '../model/hivecreationstatus.model';
import { persistenceService } from './persistence.service';
import { hiveService } from './hive.service';
import { DIDHelper } from '../../did/internal/didhelper';
import { globalStorageService } from '../../services/global.storage.service';

declare let didManager: DIDPlugin.DIDManager;

const assistAPIEndpoint = "https://wogbjv3ci3.execute-api.us-east-1.amazonaws.com/prod";
const assistAPIKey = "IdSFtQosmCwCB9NOLltkZrFy5VqtQn8QbxBKQoHPw7zp3w0hDOyOYjgL53DO3MDH";

type AssistBaseResponse = {
    meta: {
        code: number,
        message: string
    }
}

type AssistCreateTxResponse = AssistBaseResponse & {
    data: {
        confirmation_id: string,
        service_count: number,
        duplicate: boolean
    }
}

enum AssistTransactionStatus {
    PENDING = "Pending",
    PROCESSING = "Processing",
    COMPLETED = "Completed",
    QUARANTINED = "Quarantined",
    ERROR = "Error"
}

type AssistTransactionStatusResponse = AssistBaseResponse & {
    data: {
        id: string, // Confirmation ID as requested
        did: string, // DID, without did:elastos prefix
        requestFrom: string, // App package id of the requester
        didRequest: any, // Unhandled for now
        status: AssistTransactionStatus,
        memo: string,
        extraInfo: any, // Unhandled for now
        blockchainTxId: string,
        blockchainTx: any,
        created: string, // Creation date, in no clear format for now
        modified: string // Modification (?) date, in no clear format for now
    }
}

class IdentityService {
    private didHelper: DID.DIDAccess;

    constructor() {
        this.didHelper = new DID.DIDAccess();
    }

    /**
     * Tells if the identity is fully ready to use (so we can proceed to real intent requests) or if it needs
     * to be setup first.
     */
    public async identityIsFullyReadyToUse(): Promise<boolean> {
        let persistentInfo = persistenceService.getPersistentInfo();

        if (persistentInfo.did.publicationStatus == DIDPublicationStatus.PUBLISHED_AND_CONFIRMED &&
            persistentInfo.hive.creationStatus == HiveCreationStatus.VAULT_CREATED_AND_VERIFIED) {
            return true;
        }
        else {
            return false;
        }
    }

    public async createLocalIdentity() {
        let persistentInfo = persistenceService.getPersistentInfo();
        let createdDIDInfo = await this.didHelper.fastCreateDID("ENGLISH");

        if (!createdDIDInfo) {
            console.error("Null DID returned!");
            return;
        }

        console.log("DID has been created:", createdDIDInfo);

        // Save the created DID info. We don't bother user with manual passwords or mnemonics, as this is a "temporary"
        // identity only.
        persistentInfo.did.didString = createdDIDInfo.did.getDIDString();
        persistentInfo.did.storeId = createdDIDInfo.didStore.getId();
        persistentInfo.did.storePassword = createdDIDInfo.storePassword;
        persistentInfo.did.publicationStatus = DIDPublicationStatus.PUBLICATION_NOT_REQUESTED;

        await persistenceService.savePersistentInfo(persistentInfo);
    }

    public async getLocalDID(): Promise<DIDPlugin.DID> {
        let persistentInfo = persistenceService.getPersistentInfo();
        if (!persistentInfo.did.storeId)
            return null;

        let didStore = await DIDHelper.openDidStore(persistentInfo.did.storeId);
        return await DIDHelper.loadDID(didStore, persistentInfo.did.didString);
    }

    public async getDIDMnemonic(): Promise<string> {
        let persistentInfo = persistenceService.getPersistentInfo();
        let didStore = await DIDHelper.openDidStore(persistentInfo.did.storeId);
        return await new Promise((resolve) => {
            didStore.exportMnemonic(persistentInfo.did.storePassword, (mnemonic) => {
                resolve(mnemonic);
            }, (e) => resolve(""));
        });
    }

    /**
     * Queries the DID sidechain to check if the given DID is published or not.
     */
    public async getIdentityOnChain(didString: string): Promise<DIDPlugin.DIDDocument> {
        return new Promise((resolve, reject) => {
            didManager.resolveDidDocument(didString, true, (document) => {
                resolve(document);
            }, (err) => {
                reject(err);
            });
        });
    }

    /**
     * Publish the DID using assist api
     */
    public async publishIdentity(): Promise<void> {
        console.log("Starting the DID publication process");

        return new Promise(async (resolve, reject) => {
            try {
                let persistentInfo = persistenceService.getPersistentInfo();

                let didStore = await this.openDidStore(persistentInfo.did.storeId, async (payload: string, memo: string) => {
                    // Callback called by the DID SDK when trying to publish a DID.
                    console.log("Create ID transaction callback is being called", payload, memo);
                    let payloadAsJson = JSON.parse(payload);
                    try {
                        await this.publishDIDOnAssist(persistentInfo.did.didString, payloadAsJson, memo);
                        resolve();
                    }
                    catch (err) {
                        reject(err);
                    }
                });

                let localDIDDocument = await this.loadLocalDIDDocument(didStore, persistentInfo.did.didString);

                // Hive support: we directly automatically select a random hive node and define it as a service in the
                // DID document, before we publish at first. Because we don't want to publish the DID 2 times.
                await this.addRandomHiveToDIDDocument(localDIDDocument, persistentInfo.did.storePassword);

                // Start the publication flow
                localDIDDocument.publish(persistentInfo.did.storePassword, () => { }, (err) => {
                    // Local "publish" process errored
                    console.log("Local DID Document publish(): error", err);
                    reject(err);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    private addRandomHiveToDIDDocument(localDIDDocument: DIDPlugin.DIDDocument, storePassword: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let randomHideNodeAddress = hiveService.getRandomQuickStartHiveNodeAddress();
            if (randomHideNodeAddress) {
                let service = didManager.ServiceBuilder.createService('#hivevault', 'HiveVault', randomHideNodeAddress);
                await this.removeHiveVaultServiceFromDIDDocument(localDIDDocument, storePassword);
                localDIDDocument.addService(service, storePassword, async () => {
                    // Save this hive address to persistence for later use
                    let persistentInfo = persistenceService.getPersistentInfo();
                    persistentInfo.hive.vaultProviderAddress = randomHideNodeAddress;
                    await persistenceService.savePersistentInfo(persistentInfo);

                    resolve();
                }, (err) => {
                    reject(err);
                });
            }
            else {
                reject("Hive node address cannot be null");
            }
        });
    }

    private removeHiveVaultServiceFromDIDDocument(localDIDDocument: DIDPlugin.DIDDocument, storePassword: string): Promise<void> {
        return new Promise((resolve) => {
            localDIDDocument.removeService("#hivevault", storePassword, () => {
                resolve();
            }, (err) => {
                // Resolve normally in case of error, as this may be a "service does not exist" error which is fine.
                resolve();
            });
        });
    }

    // DOC FOR ASSIST API: https://github.com/tuum-tech/assist-restapi-backend#verify
    private publishDIDOnAssist(didString: string, payloadObject: any, memo: string) {
        return new Promise<void>(async (resolve, reject) => {
            console.log("Requesting identity publication to Assist");

            let assistAPIKey = "IdSFtQosmCwCB9NOLltkZrFy5VqtQn8QbxBKQoHPw7zp3w0hDOyOYjgL53DO3MDH";

            let requestBody = {
                "did": didString,
                "memo": memo || "",
                "requestFrom": "elastos.connectivity.client.cordova.sdk", // TODO: get info about APP, not SDK. This is not useful.
                "didRequest": payloadObject
            };

            console.log("Assist API request body:", requestBody);

            let fetchResponse = await fetch(assistAPIEndpoint + "/v1/didtx/create", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": assistAPIKey
                },
                body: JSON.stringify(requestBody)
            });

            try {
                let response: AssistCreateTxResponse = await fetchResponse.json();
                console.log("Assist successful response:", response);
                if (response && response.meta && response.meta.code == 200 && response.data.confirmation_id) {
                    console.log("All good, DID has been submitted. Now waiting.");

                    let persistentInfo = persistenceService.getPersistentInfo();
                    persistentInfo.did.publicationStatus = DIDPublicationStatus.AWAITING_PUBLICATION_CONFIRMATION;
                    persistentInfo.did.assistPublicationID = response.data.confirmation_id;
                    await persistenceService.savePersistentInfo(persistentInfo);

                    resolve();
                } else {
                    let error = "Successful response received from the assist API, but response can't be understood";
                    reject(error);
                }
            }
            catch (err) {
                console.log("Assist api call error:", err);
                reject(err);
            }
        });
    }

    /**
     * Checks the publication status on the assist API, for a previously saved ID.
     */
    public async checkPublicationStatusAndUpdate(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let persistentInfo = persistenceService.getPersistentInfo();

            console.log("Requesting identity publication status to Assist for confirmation ID " + persistentInfo.did.assistPublicationID);

            let fetchResponse = await fetch(assistAPIEndpoint + "/v1/didtx/confirmation_id/" + persistentInfo.did.assistPublicationID, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": assistAPIKey
                }
            });

            try {
                let response: AssistTransactionStatusResponse = await fetchResponse.json();
                console.log("Assist successful response:", response);
                if (response && response.meta && response.meta.code == 200 && response.data.status) {
                    console.log("All good, We got a clear status from the assist api:", response.data.status);

                    if (response.data.status == AssistTransactionStatus.PENDING || response.data.status == AssistTransactionStatus.PROCESSING) {
                        // Transaction is still pending, we do nothing, just wait and retry later.
                        console.log("Publication is still pending / processing / not confirmed.");
                    }
                    else if (response.data.status == AssistTransactionStatus.QUARANTINED) {
                        // Blocking issue. This publication was quarantined, there is "something wrong somewhere".
                        // So to make things more reliable, we just delete everything and restart the process
                        // from scratch.
                        console.log("Publication request was quarantined! Deleting the identity and trying again.");
                        await this.resetOnGoingProcess();
                    }
                    else if (response.data.status == AssistTransactionStatus.COMPLETED) {
                        // Publication is now on chain, so we can change our local status.
                        let persistentInfo = persistenceService.getPersistentInfo();
                        persistentInfo.did.publicationStatus = DIDPublicationStatus.PUBLISHED_AND_CONFIRMED;
                        await persistenceService.savePersistentInfo(persistentInfo);
                    }
                    else {
                        console.error("Unhandled transaction status received from assist:", response.data.status);
                    }

                    resolve();
                } else {
                    let error = "Successful response received from the assist API, but response can't be understood";
                    reject(error);
                }
            }
            catch(err) {
                console.log("Assist api call error:", err);
                reject(err);
            }
        });
    }

    /**
     * Resets the whole process as if we were at the beginning.
     */
    public async resetOnGoingProcess() {
        try {
            // Reset hive authentication
            let vault = await hiveService.getUserVault();
            vault.revokeAccessToken();
        }
        catch (e) {
            // Failing? We try to not mind, we continue because we cannot recover a from a recovery...
        }

        // Delete app instance DID information
        globalStorageService.set("dappsdk_appinstancedidstoreid", null);
        globalStorageService.set("dappsdk_appinstancedidstring", null);
        globalStorageService.set("dappsdk_appinstancedidstorepassword", null);

        // Clear identity creation flow status
        await persistenceService.reset();
    }

    private openDidStore(storeId: string, createIdTransactionCallback: DIDPlugin.OnCreateIdTransaction): Promise<DIDPlugin.DIDStore> {
        return new Promise((resolve) => {
            didManager.initDidStore(storeId, createIdTransactionCallback, (didstore) => {
                resolve(didstore);
            }, (err) => {
                resolve(null);
            });
        });
    }

    private loadLocalDIDDocument(didStore: DIDPlugin.DIDStore, didString: string): Promise<DIDPlugin.DIDDocument> {
        return new Promise((resolve) => {
            didStore.loadDidDocument(didString, (didDocument) => {
                resolve(didDocument);
            }, (err) => {
                resolve(null);
            });
        });
    }

    public createCredaccessPresentation(credentials: DIDPlugin.VerifiableCredential[]): Promise<DIDPlugin.VerifiablePresentation> {
        return new Promise(async (resolve) => {
            let persistentInfo = persistenceService.getPersistentInfo();
            let didStore = await DIDHelper.openDidStore(persistentInfo.did.storeId);
            let did = await DIDHelper.loadDID(didStore, persistentInfo.did.didString);

            // TODO: embed the "name" credential when we have this configuration available on the UI.
            did.createVerifiablePresentation(credentials, "none", "none", persistentInfo.did.storePassword, (presentation) => {
                resolve(presentation);
            }, (err) => {
                console.error("Error while creating the credaccess presentation:", err);
                resolve(null);
            });
        });
    }

    /**
     * Generates a appid credential for hive authentication, silently
     */
    /*public async generateAndSendApplicationIDCredentialIntentResponse(mainNativeApplicationDID: string, intent: AppManagerPlugin.ReceivedIntent) {
        let persistentInfo = persistenceService.getPersistentInfo();

        console.log("Generating appid credential");
        console.log("User DID:", persistentInfo.did.didString);

        let properties = {
            appInstanceDid: intent.params.appinstancedid,
            appDid: mainNativeApplicationDID,
        };

        console.log("Properties:", properties);

        let userDID = await this.getLocalDID();
        if (userDID) {
            userDID.issueCredential(
                intent.params.appinstancedid,
                "#app-id-credential",
                ['AppIdCredential'],
                30, // one month - after that, we'll need to generate this credential again.
                properties,
                persistentInfo.did.storePassword,
                async (issuedCredential) => {
                    console.log("Sending appidcredissue intent response for intent id " + intent.intentId);
                    let credentialAsString = await issuedCredential.toString();
                    appManager.sendIntentResponse(null, {
                        credential: credentialAsString
                    }, intent.intentId);
                }, async (err) => {
                    console.error("Failed to issue the app id credential...", err);
                }
            );
        }
        else {
            console.log("Sending empty appidcredissue intent response as no identity was found.");
            await appManager.sendIntentResponse(null, {}, intent.intentId);
        }
    }*/

    /**
     * Save in global preferences that the user has chosen to use the external identity wallet app (elastOS)
     * to handle special intents. This information is used for example by the native title bar to know if a
     * "manage account" icon should be displayed or not.
     */
    /*public async saveUsingExternalIdentityWalletPreference(): Promise<void> {
        return new Promise((resolve) => {
            appManager.setPreference("internalidentity.inuse", false, () => {
                resolve();
            }, (err) => {
                // Maybe no permission to call setPreference if developping this app inside elastOS. that's ok,
                // just forget it and resolve.
                console.warn(err);
                resolve();
            });
        });
    }*/

    /**
     * Save in global preferences that the user has chosen to use the built-in identity wallet app (this app)
     * to handle special intents. This information is used for example by the native title bar to know if a
     * "manage account" icon should be displayed or not.
     */
    /*public async saveUsingBuiltInIdentityWalletPreference(): Promise<void> {
        return new Promise((resolve) => {
            appManager.setPreference("internalidentity.inuse", true, () => {
                resolve();
            }, (err) => {
                // Maybe no permission to call setPreference if developping this app inside elastOS. that's ok,
                // just forget it and resolve.
                console.warn(err);
                resolve();
            });
        });
    }*/

    /**
     * Tells if we are using the built in identity.
     */
    /*public async isUsingBuiltInIdentityWalletPreference(): Promise<boolean> {
        return new Promise((resolve) => {
            appManager.getPreference("internalidentity.inuse", (inUse) => {
                resolve(inUse);
            }, (err) => {
                // Preference not found, this means we never created or used a built in identity.
                resolve(false);
            });
        });
    }*/
}

export const identityService = new IdentityService();
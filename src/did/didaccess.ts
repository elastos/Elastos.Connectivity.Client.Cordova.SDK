import { connectivity } from "../connectivity";
import type { IKeyValueStorage } from "../interfaces/ikeyvaluestorage";
import type { ILogger } from "../interfaces/ilogger";
import { ConnectivityHelper } from "../internal/connectivityhelper";
import { DefaultLogger } from "../internal/defaultlogger";
import { globalStorageService } from "../services/global.storage.service";
import type { FastDIDCreationResult } from "./fastdidcreationresult";
import { DIDHelper } from "./didhelper";
import type { GetCredentialsQuery } from "./model/getcredentialsquery";
import { Utils } from "./utils";
import moment from 'moment';

declare let didManager: DIDPlugin.DIDManager;

export class DIDAccess {
    private helper: DIDHelper = null;

    constructor() {
        this.helper = new DIDHelper();
    }

    /**
     * Overrides the default console logger with a custom logger.
     */
    public setLogger(logger: ILogger) {
        this.helper.setLogger(logger);
    }

    public async getCredentials(query: GetCredentialsQuery): Promise<DIDPlugin.VerifiablePresentation> {
        return new Promise((resolve)=>{
            ConnectivityHelper.ensureActiveConnector(async ()=>{
                let presentation = await connectivity.getActiveConnector().getCredentials(query);
                resolve(presentation);
            }, ()=>{
                resolve(null);
            });
        });
    }

    public async generateAppIdCredential(): Promise<DIDPlugin.VerifiableCredential> {
        return new Promise((resolve)=>{
            ConnectivityHelper.ensureActiveConnector(async ()=>{
                let appInstanceDID = (await this.getOrCreateAppInstanceDID()).did;

                // No such credential, so we have to create one. Send an intent to get that from the did app
                this.helper.logger.log("Starting to generate a new App ID credential.");

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
            }, ()=>{
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
        this.helper.logger.log("Trying to get an existing app ID credential from storage");

        let appInstanceDID = (await this.getOrCreateAppInstanceDID()).did;

        this.helper.logger.log("App Instance DID:", appInstanceDID);

        let credential = appInstanceDID.getCredential("#app-id-credential");
        if (credential) {
            // If the credential exists but expiration date it too close, delete the current one to force generating a
            // new one.
            let expirationDate = moment(credential.getExpirationDate());
            if (expirationDate.isBefore(moment().subtract(1, 'hours'))) {
                // We are expired - ask to generate a new credential
                this.helper.logger.log("Existing credential is expired or almost expired - renewing it");
                return null;
            }
            else {
                this.helper.logger.log("Returning existing app id credential found in app's local storage");
            }
        }

        return credential;
    }

    /**
     * Get the existing application instance DID if it was created before. Otherwise, a new app instance
     * DID is created and the information is stored in persistant storage for later use.
     */
    public async getOrCreateAppInstanceDID(): Promise<{did: DIDPlugin.DID, didStore: DIDPlugin.DIDStore}> {
        let didStore: DIDPlugin.DIDStore = null;
        let did: DIDPlugin.DID = null;

        this.helper.logger.log("Getting or creating app instance DID");

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
                    this.helper.logger.error(err);
                }
            }
        }

        if (!didStore || !did) {
            this.helper.logger.log("No app instance DID found. Creating a new one");

            // No DID store found. Need to create a new app instance DID.
            let didCreationresult = await this.createNewAppInstanceDID();
            didStore = didCreationresult.didStore;
            did = didCreationresult.did;
        }

        // Load credentials first before being able to call getCredential().
        await DIDHelper.loadDIDCredentials(did);

        return {
            did: did,
            didStore: didStore
        };
    }

     /**
     * Retrieve information about existing app instance info from permanent storage, if any.
     */
    public async getExistingAppInstanceDIDInfo(): Promise<{storeId: string, didString: string, storePassword: string}> {
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
        this.helper.logger.log("Fast DID creation with language "+language);

        return new Promise((resolve, reject)=>{
            didManager.generateMnemonic(language, (mnemonic)=>{
                let didStoreId = Utils.generateRandomDIDStoreId();
                didManager.initDidStore(didStoreId, (payload: string, memo: string) =>{
                    // Never called
                }, async (didStore)=>{
                    // Store created, now init the private identity
                    let storePass = this.helper.generateRandomPassword();
                    didStore.initPrivateIdentity(language, mnemonic, null, storePass, true, ()=>{
                        // Now add a DID
                        didStore.newDid(storePass, "", (did)=>{
                            // DID added, now we can return
                            resolve({
                                didStore: didStore,
                                did: did,
                                storePassword: storePass
                            });
                        }, (err)=>{
                            this.helper.logger.error(err);
                            resolve(null);
                        });
                    }, (err)=>{
                        this.helper.logger.error(err);
                        resolve(null);
                    });
                }, (err)=>{
                    this.helper.logger.error(err);
                    resolve(null);
                });
            }, (err)=>{
                this.helper.logger.error(err);
                resolve(null);
            });
        });
    }

    /**
     * Creates a new application instance DID store, DID, and saves info to permanent storage.
     */
    public async createNewAppInstanceDID(): Promise<{didStore: DIDPlugin.DIDStore, did: DIDPlugin.DID}> {
        let didCreationResult = await this.fastCreateDID("ENGLISH");
        await this.helper.saveAppInstanceDIDInfo(didCreationResult.didStore.getId(), didCreationResult.did.getDIDString(), didCreationResult.storePassword);

        return {
            didStore: didCreationResult.didStore,
            did: didCreationResult.did
        }
    }
}

import { Utils } from "./utils";
import { globalStorageService } from "../services/global.storage.service";
import type { IConnector } from "../interfaces/connectors";

declare let didManager: DIDPlugin.DIDManager;

export class DIDHelper {
    constructor() {}

    /**
     * Saves app instance did info to permanent storage.
     */
    public async saveAppInstanceDIDInfo(storeId: string, didString: string, storePassword: string): Promise<void> {
        await globalStorageService.set("dappsdk_appinstancedidstoreid", storeId, true);
        await globalStorageService.set("dappsdk_appinstancedidstring", didString, true);
        // TODO: Devices with biometric auth enabled may use the password manager to save this password
        // more securely than in local storage.
        await globalStorageService.set("dappsdk_appinstancedidstorepassword", storePassword, true);
    }

    /**
     * Deletes any data about the active connector context
     */
    public async cleanupConnectorContext(connector: IConnector) {
        await globalStorageService.unset("dappsdk_appinstancedidstoreid", true);
        await globalStorageService.unset("dappsdk_appinstancedidstring", true);
        await globalStorageService.unset("dappsdk_appinstancedidstorepassword", true);
    }

    /**
     * Use the same mechanism as generateRandomDIDStoreId(), this can generate a simple password.
     */
    public generateRandomPassword(): string {
        return Utils.generateRandomDIDStoreId();
    }

    /**
     * Convenient way to open a DID store from its ID
     */
    public static openDidStore(storeId: string): Promise<DIDPlugin.DIDStore> {
        return new Promise((resolve)=>{
            didManager.initDidStore(storeId, null, (didstore)=>{
            resolve(didstore);
            }, (err)=>{
            resolve(null);
            })
        });
    }

    /**
     * Convenient way to load a DID.
     */
    public static loadDID(didStore: DIDPlugin.DIDStore, didString: string): Promise<DIDPlugin.DID> {
        return new Promise((resolve, reject)=>{
            didStore.loadDidDocument(didString, (didDocument)=>{
                resolve(didDocument.getSubject());
            }, (err)=>{
                reject(err);
            })
        });
    }


    public static loadDIDCredentials(did: DIDPlugin.DID): Promise<DIDPlugin.VerifiableCredential[]> {
        return new Promise((resolve, reject)=>{
            did.loadCredentials((credentials)=>{
                resolve(credentials);
            }, (err)=> {
                reject(err);
            })
        });
    }
}
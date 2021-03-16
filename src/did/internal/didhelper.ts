import moment from "moment";
import type { IKeyValueStorage } from "../../interfaces/ikeyvaluestorage";
import type { ILogger } from "../../interfaces/ilogger";
import { DefaultLogger } from "../../internal/defaultlogger";
import { Utils } from "../utils";
import { DefaultKeyValueStorage } from "../../internal/defaultkeyvaluestorage";
import { globalStorageService } from "../../services/global.storage.service";

declare let didManager: DIDPlugin.DIDManager;

export class DIDHelper {
    public logger: ILogger = new DefaultLogger();

    constructor() {}

    /**
     * Overrides the default console logger with a custom logger.
     */
    public setLogger(logger: ILogger) {
        this.logger = logger;
    }

    /**
     * Saves app instance did info to permanent storage.
     */
    public async saveAppInstanceDIDInfo(storeId: string, didString: string, storePassword: string): Promise<void> {
        await this.setAppManagerSetting("dappsdk_appinstancedidstoreid", storeId);
        await this.setAppManagerSetting("dappsdk_appinstancedidstring", didString);
        // TODO: Devices with biometric auth enabled may use the password manager to save this password
        // more securely than in local storage.
        await this.setAppManagerSetting("dappsdk_appinstancedidstorepassword", storePassword);
    }

    /**
     * Use the same mechanism as generateRandomDIDStoreId(), this can generate a simple password.
     */
    public generateRandomPassword(): string {
        return Utils.generateRandomDIDStoreId();
    }

    /**
     * Convenient way to retrieve settings from the app manager plugin.
     */
    public getAppManagerSetting(settingName: string, defaultValue: string): Promise<string> {
        return globalStorageService.get(settingName, defaultValue);
    }

    /**
     * Convenient way to save settings to the app manager plugin.
     */
    public setAppManagerSetting(settingName: string, value: string): Promise<void> {
        return globalStorageService.set(settingName, value);
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
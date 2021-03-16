import { globalStorageService } from '../../services/global.storage.service';
import { DIDPublicationStatus } from '../model/didpublicationstatus.model';
import { HiveCreationStatus } from '../model/hivecreationstatus.model';
import type { PersistentInfo } from '../model/persistentinfo.model';

class PersistenceService {
    private persistentInfo: PersistentInfo = null;

    constructor() {
        this.init();
    }

    public async init() {
        let persistentInfoJsonStr = await globalStorageService.get("persistentinfo", null) as string;
        this.persistentInfo = (persistentInfoJsonStr ? JSON.parse(persistentInfoJsonStr) : this.createNewPersistentInfo());
        console.log("Persistent info:", this.persistentInfo);
    }

    private createNewPersistentInfo(): PersistentInfo {
        return {
            did: {
                storeId: null,
                storePassword: null,
                didString: null,
                publicationStatus: DIDPublicationStatus.PUBLICATION_NOT_REQUESTED,
                assistPublicationID: null
            },
            hive: {
                vaultProviderAddress: null,
                creationStatus: HiveCreationStatus.VAULT_NOT_CREATED
            }
        }
    }

    public getPersistentInfo(): PersistentInfo {
        return this.persistentInfo;
    }

    public async savePersistentInfo(persistentInfo: PersistentInfo) {
        this.persistentInfo = persistentInfo;
        await globalStorageService.set("persistentinfo", JSON.stringify(this.persistentInfo));
    }

    public async reset() {
        await this.savePersistentInfo(this.createNewPersistentInfo());
    }
}

export const persistenceService = new PersistenceService();
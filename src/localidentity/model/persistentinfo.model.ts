import type { DIDPublicationStatus } from "./didpublicationstatus.model";
import type { HiveCreationStatus } from "./hivecreationstatus.model";

/**
 * Model that holds all information we want to store locally for later reuse.
 */
export type PersistentInfo = {
    did: {
        storeId: string;
        storePassword: string;
        didString: string;
        publicationStatus: DIDPublicationStatus,
        assistPublicationID: string // Unique publication ID returned by the assist API after a successful publication request. This is NOT a blockchain transaction ID.
    },
    hive: {
        vaultProviderAddress: string,
        creationStatus: HiveCreationStatus
    }
}
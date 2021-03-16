import * as DID from "./did";
import * as Hive from "./hive";
import * as Wallet from "./wallet";
import * as Ethereum from "./ethereum";
import { Connectivity } from "./connectivity";
import * as Interfaces from "./interfaces";
import { globalStorageService } from "./services/global.storage.service";

import { LocalIdentityConnector } from "./localidentity/connector";
import { Localization } from "./internal/localization";

// Setup localization
Localization.init();

// Create and export a connectivity manager singleton
const connectivity = new Connectivity();

// Register our built-in local identity connector by default
connectivity.registerConnector(new LocalIdentityConnector());

export {
    // Classes
    DID,
    Hive,
    Ethereum,
    Wallet,
    Interfaces,

    // Singleton instances
    connectivity,
    globalStorageService
}
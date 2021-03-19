import * as DID from "./did";
import * as Hive from "./hive";
import * as Wallet from "./wallet";
import * as Ethereum from "./ethereum";
import { Connectivity } from "./connectivity";
import * as Interfaces from "./interfaces";
import { localIdentityManager as localIdentity } from "./localidentity/manager";
import { globalLocalizationService as localization } from "./services/global.localization.service";
import { globalThemeService as theme } from "./services/global.theme.service";

import { LocalIdentityConnector } from "./localidentity/connector";

// Create and export a connectivity manager singleton
const connectivity = new Connectivity();

// Register our built-in local identity connector by default
connectivity.registerConnector(new LocalIdentityConnector());

export {
    // Interfaces
    Interfaces,

    // Classes
    DID,
    Hive,
    Ethereum,
    Wallet,

    // Singleton instances
    connectivity,
    localIdentity,
    localization,
    theme
}
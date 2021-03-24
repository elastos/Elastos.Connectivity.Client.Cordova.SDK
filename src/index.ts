import * as DID from "./did";
import * as Hive from "./hive";
import * as Wallet from "./wallet";
import * as Ethereum from "./ethereum";
import { connectivity } from "./connectivity";
import * as Interfaces from "./interfaces";
import { localIdentityManager as localIdentity } from "./localidentity/manager";
import { globalLocalizationService as localization } from "./services/global.localization.service";
import { globalThemeService as theme } from "./services/global.theme.service";

import { LocalIdentityConnector } from "./localidentity/connector";
import { GenericUIHandler } from "./internal/defaultui/genericuihandler";
import { LocalIdentityUIHandler } from "./localidentity/defaultui/localidentityuihandler";

// Register our built-in local identity connector by default
connectivity.registerConnector(new LocalIdentityConnector());

connectivity.setGenericUIHandler(new GenericUIHandler());
connectivity.setLocalIdentityUIHandler(new LocalIdentityUIHandler());

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
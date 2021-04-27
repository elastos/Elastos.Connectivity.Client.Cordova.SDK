import * as DID from "./did";
import * as Hive from "./hive";
import * as Wallet from "./wallet";
import * as Ethereum from "./ethereum";
import { connectivity } from "./connectivity";
import * as Interfaces from "./interfaces";
import { globalLocalizationService as localization } from "./services/global.localization.service";
import { globalThemeService as theme } from "./services/global.theme.service";
import { globalStorageService as storage } from "./services/global.storage.service";
import { globalLoggerService as logger } from "./services/global.logger.service";

import { GenericUIHandler } from "./internal/defaultui/genericuihandler";

// Provide a default generic UI handler that can be replaced later.
connectivity.setGenericUIHandler(new GenericUIHandler());

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
    localization,
    theme,
    storage,
    logger
}
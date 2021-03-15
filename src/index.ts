import * as DID from "./did";
import * as Hive from "./hive";
import * as Wallet from "./wallet";
import * as Ethereum from "./ethereum";
import { Connectivity } from "./connectivity";
import * as Interfaces from "./interfaces";

import { LocalIdentityConnector } from "./localidentity/connector";

// Register our built-in local identity connector by default
Connectivity.registerConnector(new LocalIdentityConnector());

export {
    DID,
    Hive,
    Ethereum,
    Wallet,
    Connectivity,
    Interfaces
}
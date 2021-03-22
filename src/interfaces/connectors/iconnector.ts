import type { IDIDConnectorAPI } from "./ididconnectorapi";
import type { IWalletConnectorAPI } from "./iwalletconnectorapi";

export interface IConnector extends IDIDConnectorAPI, IWalletConnectorAPI {
    name: string;

    /**
     * Returns the connector name to be displayed on UI. This name may be localized for
     * the active language.
     */
    getDisplayName(): Promise<string>;
}
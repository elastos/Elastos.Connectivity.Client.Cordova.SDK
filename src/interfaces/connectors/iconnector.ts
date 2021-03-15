import type { IDIDConnectorAPI } from "./ididconnectorapi";
import type { IWalletConnectorAPI } from "./iwalletconnectorapi";

export interface IConnector extends IDIDConnectorAPI, IWalletConnectorAPI {
    name: string;
}
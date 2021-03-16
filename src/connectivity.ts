import type { IGenericUIHandler } from "./interfaces/ui/igenericuihandler";
import type { ILocalIdentityUIHandler } from "./interfaces/ui/ilocalidentityuihandler";
import { GenericUIHandler } from "./internal/defaultui/genericuihandler";
import { LocalIdentityUIHandler } from "./localidentity/defaultui/localidentityuihandler";
import type { IConnector } from "./interfaces/connectors/iconnector";

export class Connectivity {
    private connectors: IConnector[] = [];
    private activeConnector: IConnector | null = null;
    public genericUIHandler: IGenericUIHandler = new GenericUIHandler();
    public localIdentityUIHandler: ILocalIdentityUIHandler = new LocalIdentityUIHandler();

    /**
     * Registers a new connector as part of the available service providers.
     * This connector can then be selected by the app or by the end users to manage
     * their Elastos operations (get credentials, authenticate on hive, call smart contracts, etc).
     */
    public registerConnector(connector: IConnector) {
        if (connector)
            console.log("[Elastos Connectivity SDK] Registering connector with name", connector.name);

        this.connectors.push(connector);
    }

    /**
     * Sets the active connector for the whole application. The active connector is used
     * by all Elastos operation that require access to a connector API.
     */
    public setActiveConnector(connectorName: string) {
        if (connectorName == null) {
            this.activeConnector = null;
        }
        else {
            let newActiveConnector = this.connectors.find((c)=>c.name === connectorName);
            if (!newActiveConnector)
                throw new Error("Failed to set active connector. Connector "+connectorName+" not found!");

            this.activeConnector = newActiveConnector;
        }
    }

    public getActiveConnector(): IConnector | null {
        return this.activeConnector;
    }

    public getAvailableConnectors(): IConnector[] {
        return this.connectors;
    }

    /**
     * Overwrites the default UI for generic prompts (ex: the connector chooser) with a
     * custom UI handler.
     */
    public setGenericUIHandler(customUIHandler: IGenericUIHandler) {
        this.genericUIHandler = customUIHandler
    }

    /**
     * Overwrites the default UI for local identity prompts (ex: local identity creation) with a
     * custom UI handler.
     */
    public setLocalIdentityUIHandler(customUIHandler: ILocalIdentityUIHandler) {
        this.localIdentityUIHandler = customUIHandler
    }
}

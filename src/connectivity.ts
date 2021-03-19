import type { IGenericUIHandler } from "./interfaces/ui/igenericuihandler";
import type { ILocalIdentityUIHandler } from "./interfaces/ui/ilocalidentityuihandler";
import { GenericUIHandler } from "./internal/defaultui/genericuihandler";
import { LocalIdentityUIHandler } from "./localidentity/defaultui/localidentityuihandler";
import type { IConnector } from "./interfaces/connectors/iconnector";
import { globalStorageService } from "./services/global.storage.service";

export class Connectivity {
    private connectors: IConnector[] = [];
    private activeConnector: IConnector | null = null;
    public genericUIHandler: IGenericUIHandler = new GenericUIHandler();
    public localIdentityUIHandler: ILocalIdentityUIHandler = new LocalIdentityUIHandler();

    constructor() {}

    /**
     * Registers a new connector as part of the available service providers.
     * This connector can then be selected by the app or by the end users to manage
     * their Elastos operations (get credentials, authenticate on hive, call smart contracts, etc).
     */
    public async registerConnector(connector: IConnector) {
        if (connector) {
            console.log("[Elastos Connectivity SDK] Registering connector with name", connector.name);

            // Make sure this connector name doesn't exist yet.
            let connectorIndex = this.connectors.findIndex((c)=>c.name === connector.name);
            if (connectorIndex >= 0)
                throw new Error("Connector with name "+connector.name+" already exists");

            this.connectors.push(connector);

            // Retrieve the existing active connector, if any. If the connector we just registered
            // if the active one, we re-activate it.
            let activeConnectorName = await globalStorageService.get("activeconnectorname", null);
            if (activeConnectorName == connector.name) {
                console.log("[Elastos Connectivity SDK] Reactivating previously saved connector:"+activeConnectorName);
                this.activeConnector = connector;
            }
        }
    }

    public async unregisterConnector(connectorName: string) {
        // Unregistering the active connector? Forget it as active.
        if (this.activeConnector && this.activeConnector.name == connectorName)
            this.setActiveConnector(null);

        let connectorIndex = this.connectors.findIndex((c)=>c.name === connectorName);
        if (connectorIndex < 0)
            throw new Error("Connector with name "+connectorName+" doesn't exist");

        // Remove connector from our list.
        this.connectors.splice(connectorIndex, 1);
    }

    /**
     * Sets the active connector for the whole application. The active connector is used
     * by all Elastos operation that require access to a connector API.
     */
    public setActiveConnector(connectorName: string) {
        if (connectorName == null) {
            console.log("Forgetting the currently active connector");
            this.activeConnector = null;
        }
        else {
            let newActiveConnector = this.connectors.find((c)=>c.name === connectorName);
            if (!newActiveConnector)
                throw new Error("Failed to set active connector. Connector "+connectorName+" not found!");

            this.activeConnector = newActiveConnector;
        }

        // Save connector name to disk for when the app restarts.
        globalStorageService.set("activeconnectorname", connectorName);
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

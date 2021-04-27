import type { IGenericUIHandler } from "./interfaces/ui/igenericuihandler";
import type { IConnector } from "./interfaces/connectors/iconnector";
import { globalStorageService } from "./services/global.storage.service";
import { DIDHelper } from "./did/didhelper";
import { globalLoggerService as logger } from "./services/global.logger.service";
import { globalLocalizationService } from "./services/global.localization.service";

class Connectivity {
    private connectors: IConnector[] = [];
    private activeConnector: IConnector | null = null;
    public genericUIHandler: IGenericUIHandler = null;
    private applicationDID: string = null;

    constructor() {
    }

    /**
     * Registers a new connector as part of the available service providers.
     * This connector can then be selected by the app or by the end users to manage
     * their Elastos operations (get credentials, authenticate on hive, call smart contracts, etc).
     */
    public async registerConnector(connector: IConnector) {
        if (connector) {
            logger.log("Registering connector with name", connector.name);

            // Make sure this connector name doesn't exist yet.
            let connectorIndex = this.connectors.findIndex((c)=>c.name === connector.name);
            if (connectorIndex >= 0)
                throw new Error("Connector with name "+connector.name+" already exists");

            this.connectors.push(connector);

            // Retrieve the existing active connector, if any. If the connector we just registered
            // if the active one, we re-activate it.
            let activeConnectorName = await globalStorageService.get("activeconnectorname", null);
            if (activeConnectorName == connector.name) {
                logger.log("Reactivating previously saved connector:"+activeConnectorName);
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
    public async setActiveConnector(connectorName: string) {
        if (connectorName == null && this.activeConnector) {
            await this.cleanupConnectorContext(this.activeConnector);
            logger.log("Forgetting the currently active connector");
            this.activeConnector = null;
        }
        else if (connectorName != null) {
            let newActiveConnector = this.connectors.find((c)=>c.name === connectorName);
            if (!newActiveConnector)
                throw new Error("Failed to set active connector. Connector "+connectorName+" not found!");

            if (this.activeConnector && this.activeConnector.name !== connectorName)
                await this.cleanupConnectorContext(this.activeConnector);

            this.activeConnector = newActiveConnector;
        }

        // Save connector name to disk for when the app restarts.
        globalStorageService.set("activeconnectorname", connectorName);
    }

    /**
     * Cleanup current context for a given connector so that its data will not overlap
     * with another connector's data when setting a different active connector.
     * This is true for example for hive's App ID credential, that is different for each connector.
     */
    private async cleanupConnectorContext(connector: IConnector): Promise<void> {
        logger.log("Cleaning up connector context for: "+connector.name);
        await new DIDHelper().cleanupConnectorContext(connector);
    }

    public getActiveConnector(): IConnector | null {
        return this.activeConnector;
    }

    public getAvailableConnectors(): IConnector[] {
        return this.connectors;
    }

    /**
     * Sets the application DID string. Each application using the connectivity SDK has to have its own
     * DID, published on chain, and configured with the developer tool application for secure identication
     * purpose.
     */
    public setApplicationDID(appDID: string) {
        this.applicationDID = appDID;
    }

    public getApplicationDID(): string {
        if (!this.applicationDID)
            throw new Error("No application DID defined yet. Please call setApplicationDID() first.");

        return this.applicationDID;
    }

    /**
     * Overwrites the default UI for generic prompts (ex: the connector chooser) with a
     * custom UI handler.
     */
    public setGenericUIHandler(customUIHandler: IGenericUIHandler) {
        this.genericUIHandler = customUIHandler
    }
}

export const connectivity = new Connectivity();
import { globalLoggerService as logger } from "../services/global.logger.service";
import { connectivity } from "../connectivity";

export class ConnectivityHelper {
    /**
     * Ensures that an active connector is set.
     * If none, user is prompted to choose one.
     */
    public static async ensureActiveConnector(onActiveConnector:()=>void, onCancelled:()=>void) {
        if (connectivity.getActiveConnector() != null)
            onActiveConnector();
        else {
            // If no active connector but only one connector available, we auto-activate it.
            if (connectivity.getAvailableConnectors().length == 1) {
                connectivity.setActiveConnector(connectivity.getAvailableConnectors()[0].name);
                onActiveConnector();
            }
            else {
                let selectedConnectorName = await connectivity.genericUIHandler.showConnectorChooser();
                if (selectedConnectorName)
                    onActiveConnector();
                else {
                    logger.warn("Cannot ensure active connector. No connector available, or user did not pick one");
                    onCancelled();
                }
            }
        }
    }
}
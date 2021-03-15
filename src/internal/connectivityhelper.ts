import { Connectivity } from "..";

export class ConnectivityHelper {
    /**
     * Ensures that an active connector is set.
     * If none, user is prompted to choose one.
     */
    public static async ensureActiveConnector(onActiveConnector:()=>void, onCancelled:()=>void) {
        if (Connectivity.getActiveConnector() != null)
            onActiveConnector();
        else {
            let selectedConnectorName = await Connectivity.genericUIHandler.showConnectorChooser();
            if (selectedConnectorName)
                onActiveConnector();
            else
                onCancelled();
        }
    }
}
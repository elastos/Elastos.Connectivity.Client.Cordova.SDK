export interface IGenericUIHandler {
    /**
     * Shows a prompt to let the user select which connector he wants to use (local identity, essentials, etc).
     * The returned string is the connector name.
     */
    showConnectorChooser(): Promise<string>;
}
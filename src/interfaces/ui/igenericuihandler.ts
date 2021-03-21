export interface IGenericUIHandler {
    /**
     * Shows a prompt to let the user select which connector he wants to use (local identity, essentials, etc).
     *
     * @returns The selected connector name.
     */
    showConnectorChooser(): Promise<string>;
}
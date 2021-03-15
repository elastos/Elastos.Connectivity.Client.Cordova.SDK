import type { IGenericUIHandler } from "../../interfaces/ui/igenericuihandler";

import ModalContainer from "./shared/ModalContainer.svelte";

export class GenericUIHandler implements IGenericUIHandler {
    private genericModalContainer = new ModalContainer({
        target: document.body
    });

    constructor()
    {
    }

    showConnectorChooser(): Promise<string> {
        throw new Error("Method not implemented.");

        // genericModalContainer.test2();
    }
}
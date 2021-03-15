import type { IGenericUIHandler } from "../../interfaces/ui/igenericuihandler";

import ModalContainer from "./shared/ModalContainer.svelte";
import IdentityPrompt from "./generic/IdentityPrompt.svelte";

export class GenericUIHandler implements IGenericUIHandler {
    private genericModalContainer = new ModalContainer({
        target: document.body
    });

    constructor()
    {}

    public async showConnectorChooser(): Promise<string> {
        return new Promise((resolve)=>{
            this.genericModalContainer.show(IdentityPrompt, {
                onSelection: (selectedConnectorName)=>{
                    console.log("Selected connector: "+selectedConnectorName);
                    resolve(selectedConnectorName);
                }
            });
        });
    }
}
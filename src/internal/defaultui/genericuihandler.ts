import type { IGenericUIHandler } from "../../interfaces/ui/igenericuihandler";
import { globalModalService } from "../../services/global.modal.service";
import IdentityPrompt from "./generic/IdentityPrompt.svelte";

export class GenericUIHandler implements IGenericUIHandler {
    constructor() {}

    public async showConnectorChooser(): Promise<string> {
        return new Promise((resolve)=>{
            globalModalService.getModal().show(IdentityPrompt, {
                onSelection: (selectedConnectorName)=>{
                    console.log("Selected connector: "+selectedConnectorName);
                    resolve(selectedConnectorName);
                }
            });
        });
    }
}
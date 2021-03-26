import type { IGenericUIHandler } from "../../interfaces/ui/igenericuihandler";
import { globalModalService } from "../../services/global.modal.service";
import IdentityPrompt from "./generic/IdentityPrompt.svelte";
import { globalLoggerService as logger } from "../../services/global.logger.service";

export class GenericUIHandler implements IGenericUIHandler {
    constructor() {}

    public async showConnectorChooser(): Promise<string> {
        return new Promise((resolve)=>{
            globalModalService.getModal().show(IdentityPrompt, {
                onSelection: (selectedConnectorName)=>{
                    logger.log("Selected connector: "+selectedConnectorName);
                    resolve(selectedConnectorName);
                }
            });
        });
    }
}
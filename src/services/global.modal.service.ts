import type { IKeyValueStorage } from "../interfaces/ikeyvaluestorage";
import { DefaultKeyValueStorage } from "../internal/defaultkeyvaluestorage";
import ModalContainer from "../internal/defaultui/shared/ModalContainer.svelte";
import { getGlobalSingleton } from "../singleton";

class GlobalModalService {
    private genericModalContainer = new ModalContainer({
        target: document.body
    });

  constructor() {}

  public getModal(): ModalContainer {
      return this.genericModalContainer;
  }
}

export const globalModalService = getGlobalSingleton<GlobalModalService>("modal", ()=>new GlobalModalService());


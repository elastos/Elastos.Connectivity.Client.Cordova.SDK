import type { IKeyValueStorage } from "../interfaces/ikeyvaluestorage";
import { DefaultKeyValueStorage } from "../internal/defaultkeyvaluestorage";
import ModalContainer from "../internal/defaultui/shared/ModalContainer.svelte";

class GlobalModalService {
    private genericModalContainer = new ModalContainer({
        target: document.body
    });

  constructor() {}

  public getModal(): ModalContainer {
      return this.genericModalContainer;
  }
}

export const globalModalService = new GlobalModalService();


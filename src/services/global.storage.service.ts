import type { IKeyValueStorage } from "../interfaces/ikeyvaluestorage";
import { DefaultKeyValueStorage } from "../internal/defaultkeyvaluestorage";

class GlobalStorageService {
  private storageLayer: IKeyValueStorage = new DefaultKeyValueStorage();

  constructor() {}

  /**
   * Overrides the default storage layer in order to store data in a custom storage.
   * By default, the default storage uses webview's local storage.
   */
  public setStorageLayer(storageLayer: IKeyValueStorage) {
    this.storageLayer = storageLayer;
  }

  public set(key: string, value: any): Promise<void> {
    return this.storageLayer.set(key, value);
  }

  public async get(key: string, defaultValue: string | null): Promise<string> {
    return this.storageLayer.get(key, defaultValue);
  }
}

export const globalStorageService = new GlobalStorageService();


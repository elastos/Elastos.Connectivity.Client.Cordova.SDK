import { connectivity } from "../connectivity";
import type { IKeyValueStorage } from "../interfaces/ikeyvaluestorage";
import { DefaultKeyValueStorage } from "../internal/defaultkeyvaluestorage";
import { getGlobalSingleton } from "../singleton";

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

  public set(key: string, value: any, isolateForActiveConnector: boolean = false): Promise<void> {
    if (isolateForActiveConnector) {
      if (!connectivity.getActiveConnector())
        throw new Error("Cannot isolate stored data for active connector as no active connector is defined");

      key = connectivity.getActiveConnector().name+"_"+key;
    }

    return this.storageLayer.set(key, value);
  }

  public async get(key: string, defaultValue: string | null, isolateForActiveConnector: boolean = false): Promise<string> {
    if (isolateForActiveConnector) {
      if (!connectivity.getActiveConnector())
        throw new Error("Cannot isolate stored data for active connector as no active connector is defined");

      key = connectivity.getActiveConnector().name+"_"+key;
    }

    return this.storageLayer.get(key, defaultValue);
  }

  public async unset(key: string, isolateForActiveConnector: boolean = false): Promise<void> {
    if (isolateForActiveConnector) {
      if (!connectivity.getActiveConnector())
        throw new Error("Cannot isolate stored data for active connector as no active connector is defined");

      key = connectivity.getActiveConnector().name+"_"+key;
    }

    return this.storageLayer.unset(key);
  }

  public setJSON(key: string, value: any, isolateForActiveConnector: boolean = false): Promise<void> {
    return this.set(key, JSON.stringify(value), isolateForActiveConnector);
  }

  public async getJSON(key: string, defaultValue: Object | null, isolateForActiveConnector: boolean = false): Promise<any> {
    return JSON.parse(await this.get(key, JSON.stringify(defaultValue), isolateForActiveConnector));
  }
}

export const globalStorageService = getGlobalSingleton<GlobalStorageService>("storage", ()=>new GlobalStorageService());


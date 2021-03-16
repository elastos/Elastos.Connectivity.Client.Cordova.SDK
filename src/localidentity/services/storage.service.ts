import { globalStorageService } from "../../services/global.storage.service";

class StorageService {
  constructor() {}

  public setProfile(value: any) {
    return globalStorageService.set("profile", JSON.stringify(value)).then((data) => {
    });
  }

  public getProfile(): Promise<any> {
    return globalStorageService.get("profile", "{}").then((data) => {
      return JSON.parse(data);
    });
  }
}

export const storageService = new StorageService();


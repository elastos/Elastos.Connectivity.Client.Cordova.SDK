import { globalLoggerService as logger } from "../services/global.logger.service";

declare let didManager: DIDPlugin.DIDManager;

export class Utils {
  /**
   * Returns the vault provider address for a given DID. The DID must be a published DID and have a
   * HiveVault service registered. Otherwise, this method return null.
   */
  public static getVaultProviderAddress(did: string): Promise<string> {
    return new Promise((resolve, reject)=>{
      didManager.resolveDidDocument(did, false, (document)=>{
        if (!document) {
          logger.log("getVaultProviderAddress("+did+"): DID document not found");
          resolve(null);
        }
        else {
          var services = document.getServices();
          let vaultService = services.find(x => {
            return x.getType() == "HiveVault"
          });

          if (vaultService)
            resolve(vaultService.getEndpoint());
          else {
            logger.log("getVaultProviderAddress("+did+"): DID document found but no vault entry inside", document);
            resolve(null);
          }
        }
      }, (err)=>{
        logger.error("getVaultProviderAddress("+did+"): failed to resolve the DID Document", err);
        resolve(null);
      })
    });
  }
}

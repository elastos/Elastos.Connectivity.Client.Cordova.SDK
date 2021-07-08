import { DIDAccess } from "../did";
import { DIDHelper } from "../did/didhelper";
import { ConnectivityHelper } from "../internal/connectivityhelper";
import { globalLoggerService as  logger } from "../services/global.logger.service";

declare let didManager: DIDPlugin.DIDManager;
declare let hiveManager: HivePlugin.HiveManager;

export class AuthHelper {
  private didAccess: DIDAccess;

  constructor() {
  }

  /**
   * Returns a hive client object ready to handle the authentication flow. This method can be used by dApps
   * for convenience, or can be skipped and customized in-app if the app wants a different behaviour.
   */
  public getClientWithAuth(onAuthError?: (e: Error)=>void): Promise<HivePlugin.Client> {
    return new Promise(async (resolve)=>{
      ConnectivityHelper.ensureActiveConnector(async ()=>{
        this.didAccess = new DIDAccess();

        let authHelper = this;

        // Initiate or retrieve an application instance DID. This DID is used to sign authentication content
        // for hive. Hive uses the given app instance DID document to verify JWTs received later, using an unpublished
        // app instance DID.
        logger.log("Getting an app instance DID");
        let appInstanceDIDInfo = await this.didAccess.getOrCreateAppInstanceDID();

        logger.log("Getting app instance DID document");
        appInstanceDIDInfo.didStore.loadDidDocument(appInstanceDIDInfo.did.getDIDString(), async (didDocument)=>{
          logger.log("Got app instance DID document. Now creating the Hive client", await didDocument.toJson());
          let client = await hiveManager.getClient({
            authenticationHandler: new class AuthenticationHandler implements HivePlugin.AuthenticationHandler {
              /**
               * Called by the Hive plugin when a hive backend needs to authenticate the user and app.
               * The returned data must be a verifiable presentation, signed by the app instance DID, and
               * including a appid certification credential provided by the identity application.
               */
              async authenticationChallenge(jwtToken: string): Promise<string> {
                logger.log("Hive client authentication challenge callback is being called with token:", jwtToken);
                try {
                  return await authHelper.handleVaultAuthenticationChallenge(jwtToken);
                }
                catch (e) {
                  logger.error("Exception in authentication handler:", e);
                  if (onAuthError)
                    onAuthError(e);
                  return null;
                }
              }
            },
            authenticationDIDDocument: await didDocument.toJson()
          });

          logger.log("Hive client initialization completed");
          resolve(client);
        }, (err)=>{
          logger.error(err);
        });
      }, ()=>{
        resolve(null);
      });
    });
  }

  /*
  - auth challenge: JWT (iss, nonce)
  - hive sdk:
    - verify jwt
    - extract iss and nonce
  - consumer dapp:
    - generate app instance presentation including nonce=nonce, realm=iss, app id credential
    - embed presentation as JWT and return to the hive auth handler
  - server side:
    - verify jwt (using local app instance did public key provided before)
    - generate access token
  */
  public handleVaultAuthenticationChallenge(jwtToken: string): Promise<string> {
    return this.generateAuthPresentationJWT(jwtToken);
  }

  /**
   * Generates a JWT token needed by hive vaults to authenticate users and app.
   * That JWT contains a verifiable presentation that contains server challenge info, and the app id credential
   * issued by the end user earlier.
   */
  private generateAuthPresentationJWT(authChallengeJwttoken: string): Promise<string> {
    logger.log("Starting process to generate hive auth presentation JWT");

    return new Promise(async (resolve, reject)=>{
      // Parse, but verify on chain that this JWT is valid first
      let parseResult = await didManager.parseJWT(true, authChallengeJwttoken);

      if (!parseResult.signatureIsValid) {
        // Could not verify the received JWT as valid - reject the authentication request by returning a null token
        reject("The received authentication JWT token signature cannot be verified or failed to verify: "+parseResult.errorReason+". Is the hive back-end DID published? Are you on the right network?");
        return;
      }

      // The request JWT must contain iss and nonce fields
      if (!("iss" in parseResult.payload) || !("nonce" in parseResult.payload)) {
        reject("The received authentication JWT token does not contain iss or nonce");
        return;
      }

      // Generate a hive authentication presentation and put the credential + back-end info such as nonce inside
      let nonce = parseResult.payload["nonce"] as string;
      let realm = parseResult.payload["iss"] as string;

      logger.log("Getting app instance DID");
      let appInstanceDID = (await this.didAccess.getOrCreateAppInstanceDID()).did;

      let appInstanceDIDInfo = await this.didAccess.getExistingAppInstanceDIDInfo();

      logger.log("Getting app identity credential");
      let appIdCredential = await this.didAccess.getExistingAppIdentityCredential();

      if (!appIdCredential) {
        logger.log("Empty app id credential. Trying to generate a new one");

        appIdCredential = await this.didAccess.generateAppIdCredential();
        if (!appIdCredential) {
          logger.warn("Failed to generate a new App ID credential");
          resolve(null);
          return;
        }
      }

      // Create the presentation that includes hive back end challenge (nonce) and the app id credential.
      logger.log("Creating DID presentation response for Hive authentication challenge"),
      appInstanceDID.createVerifiablePresentation([
        appIdCredential
      ], realm, nonce, appInstanceDIDInfo.storePassword, async (presentation)=>{
        if (presentation) {
          // Generate the hive back end authentication JWT
          logger.log("Opening DID store to create a JWT for presentation:", presentation);
          let didStore = await DIDHelper.openDidStore(appInstanceDIDInfo.storeId);

          logger.log("Loading DID document");
          didStore.loadDidDocument(appInstanceDIDInfo.didString, async (didDocument)=>{
            let validityDays = 2;
            logger.log("Creating JWT");
            didDocument.createJWT({
              presentation: JSON.parse(await presentation.toJson())
            }, validityDays, appInstanceDIDInfo.storePassword, (jwtToken)=>{
              logger.log("JWT created for presentation:", jwtToken);
              resolve(jwtToken);
            }, (err)=>{
              reject(err);
            });
          }, (err)=>{
            reject(err);
          });
        }
        else {
          reject("No presentation generated");
        }
      });
    });
  }
}
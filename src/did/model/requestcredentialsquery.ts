/** Credential sample:
{
  "id": "did:elastos:iqeXQuCuUuZ2mdHuPUhQpQGFs4HqHixm3G#email36543284619842",
  "context": [
      "https://ttech.io/displayablecredential/v1",
      "https://ttech.io/emailcredential/v1"
  ],
  "type": [
    "DisplayableCredential",
    "EmailCredential"
  ],
  "issuer": "did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq",
  "issuanceDate": "2021-10-19T06:57:01.000Z",
  "expirationDate": "2021-10-23T06:57:01.000Z",
  "credentialSubject": {
    "displayable": {
       "icon": "https://xx.png",
       "name": "@email"
    },
    "email": "ben@ben.com"
  },
  "proof": {
    "type": "ECDSAsecp256r1",
    "created": "2021-10-19T06:57:01Z",
    "verificationMethod": "did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq#primary",
    "signature": "fJoEiNIlhMFheoDZPukYtz_Nox8_ITtZOtVMskozn8qGydTnRlqYuRveUNT9JqDBPZWMv8mgSkQUWpmjywqweg"
  }
}

*/

/**
 * String representing a JSON-path query.
 * Ex: $.type[?(@ == "TestCredentialType")]
 */
export type JsonPath = string;

/**
 * A string in the form of "did:elastos:abcdef".
 */
export type DIDString = string;

/**
 * Recommendation info to user to help him find suitable credentials in case user's credentials
 * can't match a claim.
 */
export type NoMatchRecommendation = {
  /** User friendly title to describe the url. */
  title: string;
  /** Url to open to try to get missing credentials from a third party provider */
  url: string;
  /**
   * In case the identity connector has a built-in browser, the url target defines if the link should be
   * opened internally in that browser, or externally using the native platform browser/app.
   * For instance, if the target url is a mobile friendly dApp, internal may be chosen for better user experience.
   * If the url is a app store link though, external may be better.
   */
  urlTarget?: "internal" | "external";
}

/**
 * A Claim describes what the calling application would like to retrieve from users identity wallet.
 * Helper methods are provided to build the most common claim configurations, such as:
 *    standardNameClaim("Your name")
 *    simpleTypeClaim("Your diploma", "https://my.web/credentials/diplomacredential/v1#DiplomaCredential")
 *
 * About claim descriptions:
 *
 * These are mostly a user interface element, used to show users why some credentials are requested, and control
 * how many min/max credentials of a kind have to be provided.
 *
 * Each claim description can have more than one claim, that are combined as "OR", meaning that any
 * of the claim description claim configurations can be provided by users. This is useful to say that
 * we want, for example, a "name" credential either with type did1:NameCredential or type did2:AnotherNameCredential,
 * but we want at least one of those.
 *
 * On the contrary, multiple root "claim descriptions" combine as "AND", meaning that each claim description
 * must be fulfilled for users to be able to validate the screen.
 *
 * About min/max:
 *
 * These are the number of credentials that should be provided for this claim. min and max use 1 as default
 * value, meaning that the application expects users to provide exactly 1 credential. that matches. This claim
 * can be described as "required".
 *
 * In order to make a claim be optional (user can choose to not provide one), use min = 0.
 * In order to let user provide many credentials of a similar type, use max > 0.
 *
 * About the JSON path query:
 *
 * Complex queries can be made on credentials JSON structure, for example to get a credential of a given type
 * and with a specific kind on data in its content. Most of the time, using claim builder methods are enough
 * so that developers don't need to manually write JSON Path queries, but manual queries remain an option.
 *
 * Here is an example: $[?(@.type.indexOf("MyCustomCredential")>=0 && @.credentialSubject.myData == "someValue")]
 *
 * A JSON path online playground exists to test claim queries: https://jsonpath.herokuapp.com/
 * - NOTE: Run tests against an array of credentials Json objects (see credential sample at the top of this file).
 * - NOTE: Encapsulate the tested credential object in an array [].
 * - NOTE: Use the Goessner tester for better results.
 */
export class ClaimDescription {
  /** Reason displayed to user on the identity wallet UI. */
  public reason: string;

  /** Minimum number of credentials that should be returned. Default: 1 */
  public min?: number = 1;

  /** Maximum number of credentials that should be returned. Default: 1 */
  public max?: number = 1;

  /**
    * In case the user has no credential matching the claim description, the identity wallet can recommend
    * one or more urls (dApp, native store app...) where credentials can be obtained.
    * For instance, if the claim requires a "KYC-ed" credential issued by a specific issuer,
    * the recommendation url may be the issuer's dApp url */
  public noMatchRecommendations?: NoMatchRecommendation[];

  /** List of OR claims that need to be fulfilled */
  public claims: Claim[];

  constructor() { }

  public withReason(reason: string): ClaimDescription {
    this.reason = reason;
    return this;
  }

  public withMin(min: number): ClaimDescription {
    this.min = min;
    return this;
  }

  public withMax(max: number): ClaimDescription {
    this.max = max;
    return this;
  }

  public withNoMatchRecommendations(noMatchRecommendations?: NoMatchRecommendation[]): ClaimDescription {
    this.noMatchRecommendations = noMatchRecommendations;
    return this;
  }

  public withClaim(claim: Claim): ClaimDescription {
    this.claims = [claim];
    return this;
  }

  public withAnyOfClaims(claims: Claim[]): ClaimDescription {
    this.claims = claims;
    return this;
  }
}

export class Claim {
  /** Json path query to match user credentials against */
  public query: JsonPath;

  /**
   * Credentials must have been issued by any of these specific DIDs. Default: undefined,
   * meaning that any issuer is accepted.
   */
  public issuers?: DIDString[];

  public withQuery(query: string): Claim {
    this.query = query;
    return this;
  }

  public withIssuers(issuers?: DIDString[]): Claim {
    this.issuers = issuers;
    return this;
  }
}

/**
 * Builds a simple claim from a reason and a Json path query.
 */
export function claimWithJsonPathQuery(query: JsonPath): Claim {
  return new Claim().withQuery(query);
}

/**
 * Shortcut to build a claim description with basic info inside.
 */
export function claimDescription(reason: string, required = false): ClaimDescription {
  return new ClaimDescription()
    .withReason(reason)
    .withMin(required ? 1 : 0); // Min/Max are at one by default (required) - if not required, this means the min can be 0
}

export function typeClaim(type: string): Claim {
  return claimWithJsonPathQuery(`$[?(@.type.indexOf('${type}') >= 0)]`);
}

export function idClaim(id: string): Claim {
  return claimWithJsonPathQuery(`$[?(@.id == "${id}" || @.id.match(/#${id}$/))]`)
}

/**
 * Builds a claim that requires a specific credential ID.
 * This remains a rare case as credentials IDs are generailly random strings. But useful to retrieve
 * a very specific credential from user.
 *
 * The generate claim is wrapped in a claim description automatically
 */
export function simpleIdClaim(reason: string, id: string, required = true): ClaimDescription {
  // id can be either long form, or a fragment. We want to match when id is either:
  //    did:elastos:iqeXQuCuUuZ2mdHuPUhQpQGFs4HqHixm3G#email36543284619842
  //    or
  //    email36543284619842
  return claimDescription(reason, required).withAnyOfClaims([
    idClaim(id)
  ]);
}

/**
 * Builds a claim that requires a specific credential type.
 */
export function simpleTypeClaim(reason: string, type: string, required = true): ClaimDescription {
  return claimDescription(reason, required).withAnyOfClaims([
    typeClaim(type)
  ]);
}

export function standardNameClaim(reason: string, required = true): ClaimDescription {
  return simpleTypeClaim(reason, "NameCredential", required);
}

export function standardEmailClaim(reason: string, required = true): ClaimDescription {
  return simpleTypeClaim(reason, "EmailCredential", required);
}

/**
 * Query object for requestCredentials(). Mainly, this object contains a list of claims, requested by
 * a calling dApp, that the target user should return from his identity wallet.
 *
 * Basic query example to get the user name (actually querying one of his DID credentials of a standard type "Name"):
 *
 * // Get user name (mandatory) and email (optional).
 * // User will return 1 or 2 credentials.
 * // Credentials can have been created by anyone.
 * {
 *    claims: [ standardNameClaim("Your name"), standardEmailClaim("Your email address", false) ]
 * }
 *
 * Basic query to get a custom credential:
 *
 * // Get a custom credential type that has no "standard" helper. Here, a "diploma credential" whose credential
 * // format has been defined by let's say, a "university.standards" organization. They stored the credential
 * // format on their http server.
 * {
 *    claims: [ simpleTypeClaim("Your diploma", "https://university.standards/diplomacredential/v1#DiplomaCredential") ]
 * }
 *
 * Advanced uery to get a "name" from 2 different name credential types, AND a gender:
 *
 * {
 *   claims: [
 *     claimDescription("Your name", false).withAnyOfClaims([
 *       typeClaim("NamePassportCredential").withIssuers(...),
 *       // OR
 *       typeClaim("NameIDCardCredential"),
 *     ]).withNoMatchRecommendations([
 *       { title: "an-app.io", url: "https://an-app.io", urlTarget: "internal" }
 *     ]),
 *
 *     // AND
 *
 *     simpleTypeClaim("Your birth date", "BirthDateCredential", true)
 *  ]
 * }
 *
 * Advanced query with complex json path:
 *
 * // Get a custom credential made by a third party app or service. User can select between 0 and 5 of this credential
 * // type at the same time if he has many. Don't accept user's self created credentials, but only the credentials
 * // created by "did:elastos:anothercompany". Try to customize UI with some colors.
 * {
 *    claims: [
 *      claimDescription("To Identify you on our awesome system")
 *        .withMin(0).withMax(5)
 *        .withAnyOfClaims([
 *           claimWithJsonPathQuery('$[?(@.type == "MyCustomCredential" && @.credentialSubject.myData == "someValue")]')
 *             .withIssuers([ "did:elastos:anothercompany" ])
 *        ])
 *    ],
 *    customization: {
 *      primaryColorLightMode: "#FF0000",
 *      primaryColorDarkMode: "#00FF00"
 *    }
 * }
 *
 * Where to find standard and existing credential types?
 * - https://credentials-toolbox.elastos.net/
 */
export type CredentialDisclosureRequest = {
  /** Internal field for backward compatibility management */
  _version?: number;

  /** List of claims that have to be provided by the user. */
  claims: ClaimDescription[];
  /** Optional DID string to which this request must be sent. If provided, the identity wallet must force to select that user's identity. */
  target?: DIDString;
  /** Optional nonce challenge returned in the signed Verifiable Presentation, for additional security level. */
  nonce?: string;
  /** Optional realm returned in the signed Verifiable Presentation, to be used with the nonce. */
  realm?: string;
  /** Can optionally force the DID to be published. If set to false, the identity wallet can allo unpublished DID to return data, but the calling app won't be able to verify the signature. Default: true */
  didMustBePublished?: boolean;
}
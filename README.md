# Elastos Connectivity Client Cordova SDK

## Installation

```npm i --save @elastosfoundation/elastos-connectivity-sdk-cordova```

### Angular apps:

Add SDK styles to your main CSS file:

```
@import "~@elastosfoundation/elastos-connectivity-sdk-cordova/dist/bundle.css";
```

And if you are using the local identity connector:

```
@import "~@elastosfoundation/elastos-connector-localidentity-cordova/dist/bundle.css";
```

Add SDK assets to angular.json's assets section (local identity connector only):

```
{
    "glob": "**/*",
    "input": "./node_modules/@elastosfoundation/elastos-connector-localidentity-cordova/dist/assets",
    "output": "assets"
}
```

## Usage example

```
import { connectivity, Hive } from '@elastosfoundation/elastos-connectivity-sdk-cordova';
import { EssentialsConnector } from '@elastosfoundation/essentials-connector-cordova';

// If willing to let users use Elastos Essentials to handle operations:
connectivity.registerConnector(new EssentialsConnector());

let dataSync = new Hive.DataSync.HiveDataSync(userVault);
```

## Architecture

This connectivity SDK contains:

- **Access** (DIDAccess, HiveAccess ...) entry points to easily request private identity information from third-party apps, such as DID credentials, hive authentication credentials, payment with wallet, executing smart contracts, etc.
- A mechanism made of **connectors**, in order to dynamically add custom providers for the **access** services.
- By default, only a **Local Identity Connector** is built-in. This connector is required by all dApps in order to let new users easily join the application while they don't have a decentralized identity yet, but also by app store reviewer teams as app stores usually don't accept applications that force users to depend on a third party wallet application to sign in or do major operations. Local identities provide a built-in DID and hive storage environment for a quickstart.
- Additional connectors such as the **Elastos Essentials Connector** or any custom connector **can** be added to let end users use their favorite way to use their identity. By adding the Essentials connector, for instance, end users can pick "Essentials" in the list, and all decentralized operations open the external Elastos Essentials application to request user confirmation. Each application decides which connectors it wants to provide to its users.
- **UI interfaces** for **Generic prompts** and **Local identity prompts** are also provided with a built-in default implementation that prompts end-users with default popups for convenience. Though, those interfaces can be overridden by the application in order to build a custom UI.

## Development

### Build for distribution

```npm run build```

Generated output is in **dist/**.

### Build for development

```npm run dev```

Runs webpack in watch mode to auto-rebuild the project on every file change.

## How to publish to npmjs.com

### Publishing account (NPM)

- Organization: @elastosfoundation
- Owner: @benjaminpiette

### Useful commands

- `npm adduser` (once)
- `npm login` (once)
- Increase version number in package.json
- `npm publish --access=public`

# Elastos Connectivity Client Cordova SDK

TODO

## Installation

```npm i --save @elastosfoundation/elastos-connectivity-sdk-cordova```

### Angular apps:

Add SDK assets to angular.json's assets section:

```
{
    "glob": "**/*",
    "input": "./node_modules/@elastosfoundation/elastos-connectivity-sdk-cordova/dist/assets",
    "output": "assets"
}
```

## Build

```npm run build```

Generated output is in **dist/**.

# Publishing account

- Organization: @elastosfoundation
- Owner: @benjaminpiette

# How to publish to npmjs.com

- `npm adduser` (once)
- `npm login` (once)
- Increase version number in package.json
- `npm run prepublish`
- `npm publish --access=public`

## Usage example

```
import { Connectors, Hive } from '@elastosfoundation/elastos-connectivity-sdk-cordova';
import { EssentialsConnector } from '@elastosfoundation/essentials-connector-cordova';

// If willing to let users use Elastos Essentials to handle operations:
Connectors.registerConnector(new EssentialsConnector());

let dataSync = new Hive.DataSync.HiveDataSync(userVault);
```
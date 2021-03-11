# Trinity DApp SDK

This is a helper Typescript SDK for all elastOS (Trinity) dApps.

## Installation

```npm i --save @elastosfoundation/trinity-dapp-sdk```

## Build

```npm run build```

Generated output is in **dist/**.

## Publish

```npm publish```

## Usage example

```
import * as TrinitySDK from '@elastosfoundation/trinity-dapp-sdk';

let web3Provider = new TrinitySDK.Ethereum.Web3.Providers.TrinityWeb3Provider();
```
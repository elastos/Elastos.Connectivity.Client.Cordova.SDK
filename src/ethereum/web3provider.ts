import { globalLoggerService as logger } from "../services/global.logger.service";
import { connectivity } from "../connectivity";

/*
 * Types imported from the WEB3 ethereum library.
 */

export interface JsonRpcPayload {
    jsonrpc: string;
    method: string;
    params: any[];
    id?: string | number;
}

export interface JsonRpcResponse {
    jsonrpc: string;
    id: number;
    result?: any;
    error?: string;
}

export interface RequestArguments {
    method: string;
    params?: any;
    [key: string]: any;
}

export interface AbstractProvider {
    sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
    send?(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
    request?(args: RequestArguments): Promise<any>;
    connected?: boolean;
}

/**
 * Custom Elastos Web3 provider
 */
export class ElastosWeb3Provider implements AbstractProvider {
    constructor(private rpcApiEndpoint: string) {}

    /**
     * Returns the previously fetched RPC API endpoint from Elastos Essentials's preferences
     */
    private getRPCApiEndpoint(): string {
        return this.rpcApiEndpoint;
    }

    private async callJsonRPC(payload): Promise<any> {
        return new Promise(async (resolve, reject)=>{
            var request = new XMLHttpRequest();

            let rpcApiEndpoint = this.getRPCApiEndpoint();

            request.open('POST', rpcApiEndpoint, true);
            request.setRequestHeader('Content-Type','application/json');
            request.timeout = 5000;

            request.onreadystatechange = function() {
                if (request.readyState === 4 && request.timeout !== 1) {
                    var result = request.responseText;

                    try {
                        logger.log("Ethereum JSON RPC call result:", result, "for payload:", payload);
                        result = JSON.parse(result);
                        resolve(result);
                    } catch(e) {
                        logger.log("JSON parse error");
                        reject("Invalid JSON response returned by the JSON RPC");
                    }
                }
            };

            request.ontimeout = function() {
                reject("Timeout");
            };

            request.onerror = function(error) {
                logger.error("RPC call error");
                reject(error);
            }

            try {
                request.send(JSON.stringify(payload));
            } catch(error) {
                reject("Connection error");
            }
        });
    }

    // Can be inherited for custom behaviour.
    protected async sendTransaction(payload: JsonRpcPayload, callback: (error: Error, result?: JsonRpcResponse) => void) {
        let txId = await connectivity.getActiveConnector().sendSmartContractTransaction(payload);

        callback(null, {
            jsonrpc: "2.0",
            id: payload.id as number,
            result: txId // 32 Bytes - the transaction hash, or the zero hash if the transaction is not yet available.
        });
    }

    // Mandatory method: sendAsync()
    async sendAsync(payload: JsonRpcPayload, callback: (error: Error, result?: JsonRpcResponse) => void) {
        logger.log("Elastos Web3 provider sendAsync payload", payload);

        switch (payload.method) {
            // Sending transaction is handled by a wallet app intent in order to sign the transaction.
            case "eth_sendTransaction":
                this.sendTransaction(payload, callback);
                break;
            // All methods not handled above are sent through JSON RPC API to the user-defined node url.
            default:
                try {
                    let result = await this.callJsonRPC(payload);
                    callback(null, result);
                }
                catch(e) {
                    logger.log("callJsonRPC catched");
                    callback(e);
                }
        }
    }
}
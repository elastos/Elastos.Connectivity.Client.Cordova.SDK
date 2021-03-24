import { connectivity } from "..";
import { IWalletConnectorAPI } from "../interfaces/connectors/iwalletconnectorapi";
import { ConnectivityHelper } from "../internal/connectivityhelper";
import type { PayQuery, SmartContractQuery, TransactionResult } from "./model/transaction.model";

export class WalletAccess {
    pay(query: PayQuery): Promise<TransactionResult> {
        return new Promise((resolve)=>{
            ConnectivityHelper.ensureActiveConnector(async ()=>{
                let result = await connectivity.getActiveConnector().pay(query);
                resolve(result);
            }, ()=>{
                resolve(null);
            });
        });
    }
    voteForDPoS() {
        throw new Error("Method not implemented.");
    }
    voteForCRCouncil() {
        throw new Error("Method not implemented.");
    }
    voteForCRProposal() {
        throw new Error("Method not implemented.");
    }
    sendSmartContractTransaction(query: SmartContractQuery): Promise<TransactionResult> {
        throw new Error("Method not implemented.");
    }
}
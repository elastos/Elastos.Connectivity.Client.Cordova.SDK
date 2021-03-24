export enum TransactionStatus {
    Cancelled = "cancelled",
    Published = "cancelled",
    Error = "error"
}

export type PayQuery = {
    amount: number,
    receiver: string,
    currency?: string,
    memo?: string
}

//TODO:: need to think more
export type SmartContractQuery = {
    receiver: string,
    amount?: number,
    payload: string
}

export type TransactionResult = {
    txId: string,
    status: TransactionStatus,
}

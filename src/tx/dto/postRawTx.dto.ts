export class PostRawTxDto {
    public nonce: number;
    public gas: number;
    public gasLimit: number;
    public amount: number;
    public from: string;
    public pk: string;
    public to: string;
    public data?: string;
}
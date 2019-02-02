import { Injectable } from "@nestjs/common";
import { JsonRpcService } from '../json-rpc/json-rpc.service';
const EthereumTx = require("ethereumjs-tx");

@Injectable()
export class TxService {

    constructor(private readonly jsonRpcSerice: JsonRpcService) {}
    
    /**
     * Create and submit an Ethereum transaction
     *
     * @memberof TxService
     */
    public createAndSignTx(nonce: number, gasPrice: number, gasLimit: number, receiver: string, amount: number, pk: string, data?: string) {
        // Tx params creation
        const TxParams = {
            nonce: this.numToHex(nonce),
            gasPrice: this.numToHex(gasPrice),
            gasLimit: this.numToHex(gasLimit),
            to: `${receiver}`,
            value: this.numToHex(this.ethToWei(amount)),
            v: 0,
            r: 0,
            s: 0,
            chainId: 3  // chain id
        }
        const tx = new EthereumTx(TxParams);
        // singature
        const privKey = Buffer.from(pk, "hex");
        tx.sign(privKey);
        const serializedTx = tx.serialize();
        return `0x${serializedTx.toString('hex')}`;
    }

    /**
     * get balance of a specific eth address
     *
     * @memberof TxService
     */
    public async getBalance(address: string) {
        const result = await this.jsonRpcSerice.executeMethods("eth_getBalance", address, "latest");
        return this.weiToEth(parseInt(result, 16));
    }

    /**
     * Get eth tx info by hash
     *
     * @param {string} hash
     * @returns
     * @memberof TxService
     */
    public async getTxInfoByHash(hash: string) {
        const result = await this.jsonRpcSerice.executeMethods("eth_getTransactionByHash", hash);
        return result;
    }

    /**
     * Submit raw to the testnet
     *
     * @param {string} raw
     * @returns
     * @memberof TxService
     */
    public async submitRawTx(raw: string) {
        const result = await this.jsonRpcSerice.executeMethods('eth_sendRawTransaction', raw);
        return result;
    }


    private numToHex(num: number) {
        return `0x${num.toString(16)}`;
    }

    private ethToWei(eth: number) {
        return eth * 1000000000000000000;
    } 

    private weiToEth(wei: number) {
        return wei / 1000000000000000000;
    } 
}
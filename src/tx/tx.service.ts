import { Injectable, Logger } from "@nestjs/common";
import { JsonRpcService } from '../json-rpc/json-rpc.service';
import { HotToColdProcessDto } from './dto/hotToColdTransfer.dto';
import { EthEventService } from '../eth-event/eth-event.service';
import { EthEvent } from "../eth-event/eth-event.enum";
const EthereumTx = require("ethereumjs-tx");
const Web3 = require("web3");

@Injectable()
export class TxService {

    private logger: Logger = new Logger(TxService.name);

    constructor(private readonly jsonRpcService: JsonRpcService, private readonly ethEventService: EthEventService) {}
    
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
            data: data,
            value: this.numToHex(this.ethToWei(amount)),
            v: 0,
            r: 0,
            s: 0,
            //chainId: 3  // chain id ropsten
        }
        const tx = new EthereumTx(TxParams);
        // singature
        const privKey = Buffer.from(pk, "hex");
        tx.sign(privKey);
        const serializedTx = tx.serialize();
        return `0x${serializedTx.toString('hex')}`;
    }

    public async callMethod(method: string, from: string, to: string) {
        const result = await this.jsonRpcService.executeMethods("eth_call", {
            from: from,
            to: to,
            data: method
        }, "latest");
        return result;
    }

    public callWithDrawMethodOnSmartContract(method: string) {
        const web3 = new Web3("URL_JSON_RPC");
        const myContract = new web3.eth.Contract([{"constant":true,"inputs":[],"name":"getBal","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}], "0xfe050737abdb9216834bb4411b09e2ba87b118bf");
        const data = myContract.methods[method].encodeABI();
        return data;
    }

    public deployAContract() {
        const web3 = new Web3("URL_JSON_RPC");
        const contract = web3.eth.Contract([{"constant":true,"inputs":[],"name":"getBal","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]);
        const contractData = contract.deploy({
            data: `0x6080604052336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610365806100536000396000f3fe608060405260043610610051576000357c01000000000000000000000000000000000000000000000000000000009004806325caa262146100535780633ccfd60b1461007e57806383197ef014610095575b005b34801561005f57600080fd5b506100686100ac565b6040518082815260200191505060405180910390f35b34801561008a57600080fd5b506100936100cb565b005b3480156100a157600080fd5b506100aa610215565b005b60003073ffffffffffffffffffffffffffffffffffffffff1631905090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156101b5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f596f75277265206e6f7420746865206f776e6572206f662074686520636f6e7481526020017f726163740000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc3073ffffffffffffffffffffffffffffffffffffffff16319081150290604051600060405180830381858888f19350505050158015610212573d6000803e3d6000fd5b50565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156102ff576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f596f75277265206e6f7420746865206f776e6572206f662074686520636f6e7481526020017f726163740000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16fffea165627a7a72305820e40d56580633ebc4a69994b8484ab114570252709646b8e0da1872d5c82003dc0029`
        }).encodeABI();
        const rawTx = {
            nonce: this.numToHex(1048577),
            gasPrice: this.numToHex(80000000000),
            gasLimit: this.numToHex(300000),
            data: contractData,
            from: `0x8Ff63B42699599b506EC56539FB42322dF26c2e6`,
            value: this.numToHex(this.ethToWei(2))
        }
        const tx = new EthereumTx(rawTx);
        const privKey = Buffer.from("f16a39ba23fc535651052b0bf5ed6c42a7b1c8cbcf24086221c8b42ca8a733a6", "hex");
        tx.sign(privKey);
        const serializedTx = tx.serialize();
        return `0x${serializedTx.toString('hex')}`;
    }   

    public deployAContractv2(abi, data, fromi, gas, gasPrice, pk) {
		const web3 = new Web3("URL_JSON_RPC");
        const account = web3.eth.accounts.privateKeyToAccount(`0x${pk}`);
        web3.eth.accounts.wallet.add(account);
        const contract = web3.eth.Contract(abi);
        contract.options.data = data;
        const ctrResult = contract.deploy({
            arguments: []
        });
        return ctrResult.send({
            from: fromi,
            gas: gas,
            gasPrice: gasPrice.toString()
        }, (error, transactionHash) => { 
            this.logger.log(error);
            this.logger.log(transactionHash);
         }).then((newContractInstance) => {
            this.logger.log("Contract successfully created");
            return Promise.resolve(newContractInstance); // instance with the new contract address
        })
    }   

    public async getTxReceipt(hash: string) { 
        const result = await this.jsonRpcService.executeMethods("eth_getTransactionReceipt", hash);
        return result;
    }

    /**
     * get balance of a specific eth address
     *
     * @memberof TxService
     */
    public async getBalance(address: string) {
        const result = await this.jsonRpcService.executeMethods("eth_getBalance", address, "latest");
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
        const result = await this.jsonRpcService.executeMethods("eth_getTransactionByHash", hash);
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
        const result = await this.jsonRpcService.executeMethods('eth_sendRawTransaction', raw);
        return result;
    }

    public async getDebug(txHash: string) {
        const result = await this.jsonRpcService.executeMethods("debug_traceBlockByHash", txHash);
        return result;
    }

    public async isASmartContractAddress(address: string) {
        const res = await this.jsonRpcService.executeMethods("eth_getCode", address, "latest");
        if (res.result !== "0x0") {
            return true;
        }
        return false;
    }

    /**
     * Get nonce of an address
     *
     * @param {string} address
     * @memberof TxService
     */
    public async getNonce(address: string) {
        const result = await this.jsonRpcService.executeMethods("eth_getTransactionCount", address, "latest");
        return this.hexToNum(result);
    }


    public initHotToColdTransfer(hotToColdProcessDto: HotToColdProcessDto) {
        this.ethEventService.subscribe(EthEvent.PENDING_TX, async (txHash) => {
            const tx = await this.getTxInfoByHash(txHash);
            if (tx.to === hotToColdProcessDto.hotAddress.toLowerCase()) {
                this.logger.log(`### Hot wallet received a tx ###`);
                const gasPrice = this.hexToNum(tx.gasPrice);
                const amountReceived = this.hexToNum(tx.value);
                const gas = this.hexToNum(tx.gas);
                const weiFee = gas * gasPrice;
                const ethFee = this.weiToEth(weiFee); 
                
                const amount = this.weiToEth(amountReceived - (weiFee - 10000000000)); // we prepare the next TX Hot to cold

                this.logger.log(`TX INFOS - Tx0 : ${JSON.stringify({
                    amount: this.weiToEth(amountReceived),
                    gas: gasPrice,
                    gasLimit: gas,
                    ethFee: ethFee
                })}`);

                this.logger.log(`### Preparing the tx from Hot to Cold wallet ###`);
                this.logger.log(`TX INFOS - Tx1 : ${JSON.stringify({
                    amount: amount,
                    gas: gasPrice,
                    gasLimit: gas
                })}`);

                // do the transfer from hot to cold
                // 1: first test case => with the same fees
                // 2: second test case => with less fees
                
               
                // let's wait new blockheader 
                const cb = async () => {
                    try {
                        const nonce = await this.getNonce(hotToColdProcessDto.hotAddress);
                        const rawTx = this.createAndSignTx(nonce, 9000000000, 21000, hotToColdProcessDto.coldAddress, amount, hotToColdProcessDto.hotPk);
                        this.logger.log(`TX INFOS - Tx1 RAW : ${rawTx}`);
                        const hash = await this.submitRawTx(rawTx);
                        this.logger.log(`TX INFOS - Tx1 HASH : ${hash}`);
                        this.logger.log(`TX INFOS - Tx1 : ${JSON.stringify(await this.getTxInfoByHash(hash))}`);
                        this.ethEventService.unsubScribe(EthEvent.NEW_BLOCK_HEADERS, cb);
                    } catch (e) {
                        this.logger.warn("NOT MINED YET : " + e.message);
                    }
                }
                this.ethEventService.subscribe(EthEvent.NEW_BLOCK_HEADERS, cb);
            }
        });
    }


    private numToHex(num: number) {
        return `0x${num.toString(16)}`;
    }

    private hexToNum(num: string) {
        return parseInt(num, 16);
    }

    private ethToWei(eth: number) {
        return eth * 1000000000000000000;
    } 

    private weiToEth(wei: number) {
        return wei / 1000000000000000000;
    } 
}
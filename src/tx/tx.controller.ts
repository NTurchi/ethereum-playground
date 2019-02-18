import { Controller, Get, Post, Injectable, Body, Param, LoggerService, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TxService } from './tx.service';
import { PostRawTxDto } from './dto/postRawTx.dto';
import { SubmitRawTxDto } from "./dto/submitRawTx.dto";
import { EthEventService } from "../eth-event/eth-event.service";
import { HotToColdProcessDto } from './dto/hotToColdTransfer.dto';
import { EthEvent } from '../eth-event/eth-event.enum';
import { CallMethodDto } from './dto/callMethod.dto';
import { NewContractDto } from './dto/newContract.dto';

@Controller("tx")
export class TxController {

    private readonly logger = new Logger(TxController.name);

    constructor(
        private readonly txService: TxService, 
        private readonly ethEvent: EthEventService
    ) {}

    @Get()
    public get() {
		return 'Hello World!';
    }

    @Get("/contract")
    public getContractTxHash() {
        return {
            result: this.txService.deployAContract()
        }
    }

    @Get("/receipt/:txhash")
    public async getReceipt(@Param("txhash") txhash) {
        const res = await this.txService.getTxReceipt(txhash);
        return {
            result : res
        }
    }

    @Post("/method")
    public async method(@Body() method: CallMethodDto) {
        const res = await this.txService.callMethod(method.method, method.from, method.to);
        return {
            result : res
        }
    }

    @Get(":hash")
    public async getTxByHash(@Param("hash") hash: string) {
        const result = await this.txService.getTxInfoByHash(hash);
        return {
            result: result
        };
    }

    @Post("/raw")
    public createRawTx(@Body() postRawTxDto: PostRawTxDto) {
        const raw = this.txService.createAndSignTx(postRawTxDto.nonce, postRawTxDto.gas, postRawTxDto.gasLimit, postRawTxDto.to, postRawTxDto.amount, postRawTxDto.pk, postRawTxDto.data);
        return {
            raw: raw 
        }
    }

    @Post("/contract")
    public createContract(@Body() contractInfo: NewContractDto) {
        return this.txService.deployAContractv2(contractInfo.abi, contractInfo.data, contractInfo.from, contractInfo.gasLimit, contractInfo.gas, contractInfo.pk)
        /*.then((inst) => {
            return {
                result: JSON.parse(inst)
            }
        })
        .catch(err => {
            throw new InternalServerErrorException(`ERRREUR : ${err.message}`);
        });*/
    }

    @Get("/debug/:txHash")
    public async getDebugInfo(@Param("txHash") txHash: string) {
        const result = await this.txService.getDebug(txHash);
        return {
            result: result
        };
    }

    @Post()
    public async submit(@Body() txRaw: SubmitRawTxDto) {
        const hash = await this.txService.submitRawTx(txRaw.raw);
        return {
            hash: hash
        }
    }

    @Get("balance/:address")
    public async getBalance(@Param("address") address: string) {
        const balance = await this.txService.getBalance(address);
        return {
            balance: balance
        }
    }

    @Get("event/:eventId/subscribe")
    public subscribe(@Param("eventId") eventId: string) {
        this.logger.log(`[${eventId}] => SUBSCRIBED`, this.subscribe.name);
        const ev = this.ethEvent.getEventById(eventId);
        if (!ev) throw new BadRequestException(`The event ${eventId} doesn't exist`);
        this.ethEvent.subscribe(ev, async (data) => {
            if (ev === EthEvent.PENDING_TX) {
                // get tx info 
                const tx = await this.txService.getTxInfoByHash(data);
                if (tx) {
                    if (!tx.to) {
                        this.logger.log(`[TX] This is a contract creation tx : ${data}`);
                    } else if (await this.txService.isASmartContractAddress(tx.to)) {
                        this.logger.log(`[TX] This is a contract trigged tx : ${JSON.stringify({ hash: data, address: tx.to })}`);
                    } 
                }
            } else {
                this.logger.log(`[${eventId}] => ${typeof data === "object" ? JSON.stringify(data) : data}`);
            }
        });
        return {
            result: "Ok"
        };
    }

    @Get("event/:eventId/unsubscribe")
    public unsubscribe(@Param("eventId") eventId: string) {
        const ev = this.ethEvent.getEventById(eventId);
        if (!ev) throw new BadRequestException(`The event ${eventId} doesn't exist`);
		this.ethEvent.unsubScribeAll(ev);
        return {
            result: "Ok"
        };
    }

    @Post("/transfer")
    public async hotToColdTransfer(@Body() transferInfo: HotToColdProcessDto) { 
        await this.txService.initHotToColdTransfer(transferInfo);
        return {
            result: "Activated"
        }
    }
}
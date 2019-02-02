import { Controller, Get, Post, Injectable, Body, Param } from "@nestjs/common";
import { TxService } from './tx.service';
import { PostRawTxDto } from './dto/postRawTx.dto';
import { SubmitRawTxDto } from "./dto/submitRawTx.dto";

@Controller("tx")
export class TxController {

    constructor(private readonly txService: TxService) {}

    @Get()
    public get() {
        return 'Hello World!'
    }

    @Get(":hash")
    public async getTxByHas(@Param("hash") hash: string) {
        const result = await this.txService.getTxInfoByHash(hash);
        return {
            result: result
        };
    }

    @Post("/raw")
    public createRawTx(@Body() postRawTxDto: PostRawTxDto) {
        const raw = this.txService.createAndSignTx(postRawTxDto.nonce, postRawTxDto.gas, postRawTxDto.gas, postRawTxDto.to, postRawTxDto.amount, postRawTxDto.pk);
        return {
            raw: raw 
        }
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
}
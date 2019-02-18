import { Module } from "@nestjs/common";
import { TxController } from "./tx.controller";
import { TxProviders } from './tx.providers';
import { JsonRpcModule } from '../json-rpc/json-rpc.module';
import { EthEventModule } from "../eth-event/eth-event.module";

@Module({
    imports: [JsonRpcModule, EthEventModule],
    providers: TxProviders,
    controllers: [TxController]
})
export class TxModule {

}
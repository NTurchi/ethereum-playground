import { Module } from "@nestjs/common";
import { TxController } from "./tx.controller";
import { TxProviders } from './tx.providers';
import { JsonRpcModule } from '../json-rpc/json-rpc.module';

@Module({
    imports: [JsonRpcModule],
    providers: TxProviders,
    controllers: [TxController]
})
export class TxModule {

}
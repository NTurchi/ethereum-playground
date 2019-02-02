import { Module } from "@nestjs/common";
import { TxController } from "./tx.controller";
import { TxProviders } from './tx.providers';

@Module({
    providers: TxProviders,
    controllers: [TxController]
})
export class TxModule {

}
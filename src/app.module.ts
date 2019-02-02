import { Module } from "@nestjs/common"
import { TxModule } from './tx/tx.module';
import { JsonRpcController } from "./json-rpc/json-rpc.controller";

@Module({
    imports: [TxModule, JsonRpcController],
    controllers: []
})
export class AppModule { 
    
}
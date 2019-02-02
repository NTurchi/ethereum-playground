import { Module, Global } from "@nestjs/common";
import { JsonRpcProviders } from './json-rpc.providers';
import { JsonRpcController } from './json-rpc.controller';

@Module({
    providers: JsonRpcProviders,
    exports: JsonRpcProviders,
    controllers: [JsonRpcController]
})
export class JsonRpcModule {}
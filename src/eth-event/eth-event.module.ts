import { Module } from "@nestjs/common";
import { ethEventProviders } from './eth-event.providers';

@Module({
    providers: ethEventProviders,
    exports: ethEventProviders
})
export class EthEventModule {
    
}
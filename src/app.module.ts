import { Module } from "@nestjs/common"
import { TxModule } from './tx/tx.module';


@Module({
    imports: [TxModule],
    controllers: []
})
export class AppModule { 
    
}
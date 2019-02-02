import { Controller, Get } from "@nestjs/common";

@Controller("tx")
export class TxController {
    @Get()
    public get() {
        return 'Hello World !'
    }
}
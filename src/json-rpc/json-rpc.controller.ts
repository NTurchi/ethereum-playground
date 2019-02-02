import { Controller, Post, Body } from '@nestjs/common';
import { InitUrlDto } from './dto/initUrl.dto';
import { JsonRpcService } from './json-rpc.service';

@Controller("jsonrpc")
export class JsonRpcController {
    @Post()
    public initUrl(@Body() initUrlDto: InitUrlDto) {
        JsonRpcService.url = initUrlDto.url;
        return { "message": "Url successfully initialized" };
    }
}
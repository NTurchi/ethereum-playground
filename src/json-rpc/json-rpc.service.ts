import { Injectable, BadRequestException } from "@nestjs/common";
import * as axios from "axios";


@Injectable()
export class JsonRpcService {

    private req = axios.default;

    public static url: string = undefined;

    public async executeMethods(name: string, ...params: any[]) {
        if (!JsonRpcService.url) throw new BadRequestException("The JSON RPC url has not been set, please call POST '/api/jsonrpc/' with the expected URL");
        const data = {
            jsonrpc: "2.0",
            method: `${name}`,
            params: params,
            id: 1
        }
        const res =  await this.req.post(JsonRpcService.url, data);
        if (res.data.error) {
            throw new BadRequestException(`Error when executing the command : ${res.data.error.message}`);
        }
        return res.data.result;
    }
}
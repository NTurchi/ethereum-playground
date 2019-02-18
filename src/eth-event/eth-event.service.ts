import { EventEmitter } from "events";
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Web3 = require('web3')
import { JsonRpcService } from '../json-rpc/json-rpc.service';
import { EthEvent } from './eth-event.enum';

@Injectable()
export class EthEventService {
    
    private eventEmmiter: EventEmitter;

    private logger: Logger = new Logger(EthEventService.name);

    private get url() {
		return "WEBSOCKET_URL_NODE";
    } 

    private ethBc; 

    /**
     * Init from eth blockahin 
     *
     * @private
     * @memberof EthEventService
     */
    private initEvent() {
        // web3 init
        this.ethBc = new Web3(this.url);
        this.eventEmmiter = new EventEmitter();


        // PENDING_TX
        const sub = this.ethBc.eth.subscribe(EthEvent.PENDING_TX);
        sub.on("data", (txHash) => {
            this.eventEmmiter.emit(EthEvent.PENDING_TX, txHash);
        });
        sub.on("error", (err) => {
            this.logger.error(err);
        });

        // Block header
        const sub2 = this.ethBc.eth.subscribe(EthEvent.NEW_BLOCK_HEADERS);
        sub2.on("data", (blockH) => {
            this.eventEmmiter.emit(EthEvent.NEW_BLOCK_HEADERS, blockH);
        });

        sub2.on("error", (err) => {
            this.logger.error(err);
        });
    }

    /**
     * Subscribe to a blockchain event
     *
     * @param {string} name
     * @param {(...args: any) => {}} callback
     * @memberof EthEventService
     */
    public subscribe(name: string, callback: (...args: any) => void) {
        this.eventEmmiter ? undefined : this.initEvent();
        this.eventEmmiter.on(name, callback);
    }

    /**
     * Unsubscribe from an event
     *
     * @param {string} name
     * @param {(...args: any) => {}} callback
     * @memberof EthEventService
     */
    public unsubScribe(name: string, callback: (...args: any) => void) {
        this.eventEmmiter ? undefined : this.initEvent();
        this.eventEmmiter.removeListener(name, callback);
    }

    public unsubScribeAll(event: string) {
        this.eventEmmiter.removeAllListeners(event);
    }

    public getEventById(id: string) { 
        return EthEvent[Object.keys(EthEvent).filter(i => i === id)[0]];
    }
}
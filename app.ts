import "reflect-metadata";
import { NestFactoryStatic } from "@nestjs/core/nest-factory";
import * as express from "express";
import * as http from "http";
import { AppModule } from './src/app.module';
import { NestFactory } from '@nestjs/core';
import { appendFile } from "fs";


async function bootstrapServerWithExpress() {
    const api = await NestFactory.create(AppModule);
    api.setGlobalPrefix("/api");

    const port = process.env.SERVER_PORT ? process.env.SERVER_PORT : 10500;
    await api.listen(port);
}

bootstrapServerWithExpress();
import { Eureka } from 'eureka-js-client';
import 'dotenv/config';

const port = parseInt(process.env.PORT || '3000', 10);
const hostName = process.env.SERVICE_HOST_NAME || 'mcp-service';
const eurekaHost = process.env.EUREKA_HOST || 'discovery-service';
const eurekaPort = parseInt(process.env.EUREKA_PORT || '8761', 10);
const appName = process.env.APP_NAME || 'mcp-service';

export const eurekaClient = new Eureka({
    instance: {
        app: appName,
        hostName: hostName,
        ipAddr: '127.0.0.1',
        statusPageUrl: `http://${hostName}:${port}/health`,
        healthCheckUrl: `http://${hostName}:${port}/health`,
        port: {
            '$': port,
            '@enabled': true,
        },
        vipAddress: appName,
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: eurekaHost,
        port: eurekaPort,
        servicePath: '/eureka/apps/',
        maxRetries: 10,
        requestRetryDelay: 2000,
    },
});

export default eurekaClient;

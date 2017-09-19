import { HttpMethods, IRouterConfig, IRoutletConfig } from "./";

export function isValidMethod(method: string): boolean {
    for (let key of Object.keys(HttpMethods)) {
        if (HttpMethods[key] === method) {
            return true;
        }
    }
    return false;
}

export function getDefaultRouterConfig(): IRouterConfig {
    return {
        port: 3000,
        hostname: "127.0.0.1"
    };
}

export function getDefaultRoutletConfig(): IRoutletConfig {
    return {
        baseUrl: ""
    };
}

export interface IRoute {
    path: string;
    method: string;
}

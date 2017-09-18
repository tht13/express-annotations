import * as express from "express";
import { v4 } from "uuid";

export enum HttpMethods {
    GET = "get",
    POST = "post",
    DELETE = "delete",
    PUT = "put"
}

function isValidMethod(method: string): boolean {
    for (let key of Object.keys(HttpMethods)) {
        if (HttpMethods[key] === method) {
            return true;
        }
    }
    return false;
}

export interface IRouterConfig {
    port?: number;
    hostname?: string;

}

function getDefaultConfig(): IRouterConfig {
    return {
        port: 3000,
        hostname: "127.0.0.1"
    }
}

export default class Router {
    private static routers: Map<string, Router> = new Map();
    private static readonly ROUTER_ID = "expressRouterId";

    private readonly app = express();
    private cls: Object;
    private config: IRouterConfig;

    private static getRouter(target: any): Router {
        if (target[this.ROUTER_ID] === undefined) {
            const id = v4();
            Object.defineProperty(target, this.ROUTER_ID, { value: id, writable: false });
            this.routers.set(id, new Router());
        }
        return this.routers.get(target[this.ROUTER_ID]);
    }

    public static Application(config: IRouterConfig): ClassDecorator {
        return (cls: any) => {
            let router: Router = this.routers.get(cls.prototype[this.ROUTER_ID]);
            if (!router) {
                throw new Error("Class has no routes");
            }
            router.config = { ...getDefaultConfig(), ...config };
            router.cls = new cls();
            router.start();
        }
    }

    public static Route(path: string): MethodDecorator;
    public static Route(method: HttpMethods, path: string): MethodDecorator;
    public static Route(pathOrMethod: string, path?: string): MethodDecorator {
        let method: string;
        if (path === undefined) {
            path = pathOrMethod;
            method = HttpMethods.GET;
        } else {
            method = pathOrMethod;
        }
        if (!isValidMethod(method)) {
            throw new Error("Incorrect method");
        }
        const id = v4();
        return (target, key, descriptor) => {
            const router = this.getRouter(target);
            const value = (...args: any[]) => {
                const fn: express.RequestHandler = descriptor.value as any;
                if (args[0] === null) {
                    router.app[method](path, (req, res, next) => {
                        return fn(req, res, next);
                    });
                } else {
                    throw new Error("Router.start() was not called");
                }
            };
            Object.defineProperty(value, "isRoute", { value: true });
            const rtn: any = {
                value
            }
            return rtn;
        }
    }

    constructor() { }

    private start() {
        const objProto = Object.getPrototypeOf(this.cls);
        const keys = Object.getOwnPropertyNames(objProto).sort().filter((e, i, arr) => {
            let descriptor = Object.getOwnPropertyDescriptor(objProto, e);
            return (
                (descriptor && descriptor.value["isRoute"]) &&
                e != arr[i + 1] &&
                typeof this.cls[e] == 'function' &&
                e !== 'constructor') ? true : false;
        });;
        for (let key of keys) {
            this.cls[key](null);
        }
        this.app.listen(this.config.port, this.config.hostname);
    }
}

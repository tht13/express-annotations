import * as express from "express";
import { v4 } from "uuid";
import { getDefaultRouterConfig, getDefaultRoutletConfig, isValidMethod, IRoute } from "./helpers";
import { Server } from "http";

export enum HttpMethods {
    GET = "get",
    POST = "post",
    DELETE = "delete",
    PUT = "put"
}

export interface IRouterConfig {
    /** Adds a `/shutdown` route to the router */
    shutdownRoute?: string;
    port?: number;
    hostname?: string;
}

export interface IRoutletConfig {
    baseUrl?: string;
}

export default class Router {
    private static routers: Map<string, Router> = new Map();
    private static readonly ROUTER_ID = "expressRouterId";

    private app: express.Express;
    private cls: Object;
    private config: IRouterConfig;
    private baseUrl: string = "";
    private routes: Set<IRoute> = new Set();
    private expressListen: boolean = true;
    private server: Server;

    private static getRouter(target: any): Router {
        if (target[this.ROUTER_ID] === undefined) {
            const id: string = v4();
            Object.defineProperty(target, this.ROUTER_ID, { value: id, writable: false });
            this.routers.set(id, new Router());
        }
        return this.routers.get(target[this.ROUTER_ID]);
    }

    public static Application(config: IRouterConfig): ClassDecorator;
    public static Application(app: express.Express, config?: IRoutletConfig): ClassDecorator;
    public static Application(configOrApp: IRouterConfig | express.Express, routletConfig?: IRoutletConfig): ClassDecorator {
        let app: express.Express;
        let config: IRouterConfig | IRoutletConfig;
        if (config && typeof configOrApp === "function") {
            app = configOrApp as express.Express;
            config = { ...getDefaultRoutletConfig(), ...routletConfig };
        } else {
            config = { ...getDefaultRouterConfig(), ...configOrApp };
        }
        return (cls: any) => {
            let router: Router = this.routers.get(cls.prototype[this.ROUTER_ID]);
            if (!router) {
                throw new Error("Class has no routes");
            }
            router.cls = new cls();
            if (app) {
                router.app = app;
                router.baseUrl = (config as IRoutletConfig).baseUrl;
                router.expressListen = false;
            } else {
                router.app = express();
                router.config = config as IRouterConfig;
            }
            router.start();
        };
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
        return (target, key, descriptor) => {
            const router: Router = this.getRouter(target);
            const route: IRoute = { path: router.baseUrl + path, method };
            const value: Function = (...args: any[]) => {
                const fn: express.RequestHandler = descriptor.value as any;
                if (args[0] === null) {
                    router.app[route.method](route.path, (req, res, next) => {
                        return fn(req, res, next);
                    });
                } else {
                    throw new Error("Router.start() was not called");
                }
            };
            Object.defineProperties(value, {
                isRoute: { value: true },
                routeProperties: { value: route }
            });
            const rtn: TypedPropertyDescriptor<any> = {
                value
            };
            return rtn;
        };
    }

    private constructor() { }

    private start(): void {
        const objProto: object = Object.getPrototypeOf(this.cls);
        const keys: string[] = Object.getOwnPropertyNames(objProto).sort().filter((e, i, arr) => {
            let descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(objProto, e);
            return (
                (descriptor && descriptor.value.isRoute) &&
                e !== arr[i + 1] &&
                typeof this.cls[e] === "function" &&
                e !== "constructor") ? true : false;
        });
        for (let key of keys) {
            this.cls[key](null);
        }
        if (this.expressListen) {
            this.server = this.app.listen(this.config.port, this.config.hostname);
            if (this.config.shutdownRoute) {
                this.app.get(this.config.shutdownRoute, (req, res) => {
                    res.status(200).end();
                    this.server.close();
                });
            }
        }
    }
}

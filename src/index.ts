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

export class Router {
    private readonly app = express();
    private cls: Object;
    private port: number;

    public readonly Application: (port: number) => ClassDecorator = port => {
        this.port = port;
        return (cls: any) => {
            console.log(`has class: ${cls.name}`);
            this.cls = new cls();
            this.start();
        }
    }

    public route(path: string): MethodDecorator;
    public route(method: HttpMethods, path: string): MethodDecorator;
    public route(pathOrMethod: string, path?: string): MethodDecorator {
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
        console.log(`register path: ${path}, id: ${id}`);
        return (target, key, descriptor) => {
            console.log(`Call path: ${path}, id: ${id}`);
            const value = (...args: any[]) => {
                const fn: express.RequestHandler = descriptor.value as any;
                if (args[0] === null) {
                    console.log(`connecting path: ${path}, id: ${id}`);
                    this.app[method](path, (req, res, next) => {
                        console.log(`triggering path: ${path}, id: ${id}`);
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
            console.log(descriptor);
            return (
                (descriptor && descriptor.value["isRoute"]) &&
                e != arr[i + 1] &&
                typeof this.cls[e] == 'function' &&
                e !== 'constructor') ? true : false;
        });;
        console.log(keys);
        for (let key of keys) {
            console.log(`starting key: ${key}`);
            this.cls[key](null);
        }
        this.app.listen(3000);
    }
}

const ex = () => new Router();
export default ex;

import Router, { HttpMethods } from "../";
import * as express from "express";
import * as rp from "request-promise-native";
import { getRandomPort, getRoutes } from "./testHelper";
import * as mocha from "mocha";

const port: number = getRandomPort();

@Router.Application({ port, shutdownRoute: "/shutdown" })
class App {

    @Router.Route("/")
    public root(req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.send("foo");
    }


    @Router.Route(HttpMethods.POST, "/post")
    public demo(req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.send("bar");
    }

    public example(): void {
        console.log("This is not a route");
    }
}

async function main(): Promise<void> {
    try {
        for (let route of getRoutes(App)) {
            console.log(await rp[route.method](`http://localhost:${port}${route.path}`));
        }
        await rp.get(`http://localhost:${port}/shutdown`);
    } catch (e) {
        console.warn(e);
        process.exit(1);
    }
}

main();

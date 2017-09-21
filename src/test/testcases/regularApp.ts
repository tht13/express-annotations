import Router, { HttpMethods } from "../../";
import * as express from "express";
import { getRandomPort, getRoutes, ITestFile } from "../testHelper";

const port: number = getRandomPort();
let startCb: () => any;
const startPromise: Promise<void> = new Promise(res => {
    startCb = res;
});

@Router.Application({ port, startCb })
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


const testcase: ITestFile = {
    classes: [App],
    port,
    startPromise
};

export default testcase;

import Router, { HttpMethods } from "../";
import * as express from "express";
import * as rp from "request-promise-native";

@Router.Application({ port: 3000 })
class App {

    @Router.Route("/")
    public root(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("foo");
    }


    @Router.Route(HttpMethods.GET, "/demo")
    public demo(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("bar");
    }

    public example() {
        console.log("This is not a route");
    }
}

@Router.Application({ port: 3001 })
class App2 {

    @Router.Route("/")
    public root(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("foo");
    }


    @Router.Route(HttpMethods.GET, "/demo")
    public demo(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("bar");
    }

    public example() {
        console.log("This is not a route");
    }
}

async function main() {
    console.log(await rp.get("http://localhost:3000/"));
    console.log(await rp.get("http://localhost:3000/demo"));
    console.log(await rp.get("http://localhost:3001/"));
    console.log(await rp.get("http://localhost:3001/demo"));
}

main();
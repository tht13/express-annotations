import rt, { HttpMethods } from "../";
import * as express from "express";
const Router = rt();

@Router.Application(3000)
class App {

    @Router.route("/")
    public root(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("foo");
    }


    @Router.route(HttpMethods.GET, "/demo")
    public demo(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("bar");
    }

    public example() {
        console.log("This is not a route");
    }
}

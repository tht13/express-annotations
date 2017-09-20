import Router from "../../";
import * as express from "express";
import { getRandomPort, getRoutes, ITestFile } from "../testHelper";
import { Server } from "http";

const port: number = getRandomPort();

const ap: express.Express = express();
@Router.Application(ap)
class App2 {

    @Router.Route("/")
    public root(req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.send("foo");
    }
}

@Router.Application(ap, { baseUrl: "/secondController" })
class App3 {

    @Router.Route("/holla")
    public holla(req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.send("baz");
    }

}

const server: Server = ap.listen(port, () => {
    console.log("blah");
});

const testcase: ITestFile = {
    classes: [App2, App3],
    port,
    shutdown: () => {
        server.close();
        return Promise.resolve();
    }
};

export default testcase;

import Router from "../";
import * as express from "express";
import * as rp from "request-promise-native";
import { getRandomPort, getRoutes } from "./testHelper";
import * as mocha from "mocha";
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
let server: Server = ap.listen(port);

async function main(): Promise<void> {
    try {
        for (let route of [...getRoutes(App2), ...getRoutes(App3)]) {
            console.log(await rp[route.method](`http://localhost:${port}${route.path}`));
        }
        server.close();
    } catch (e) {
        console.warn(e);
    }
}

main();

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
const ap = express();
@Router.Application(ap)
class App2 {

    @Router.Route("/")
    public root(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("foo");
    }


    @Router.Route(HttpMethods.GET, "/demo")
    public demo(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("bar");
    }
}

@Router.Application(ap, { baseUrl: "/yo" })
class App3 {

    @Router.Route("/holla")
    public holla(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send("baz");
    }

}
ap.listen(3001);

async function main() {
    try {
        console.log(await rp.get("http://localhost:3000/"));
        console.log(await rp.get("http://localhost:3000/demo"));
        console.log(await rp.get("http://localhost:3001/"));
        console.log(await rp.get("http://localhost:3001/demo"));
        console.log(await rp.get("http://localhost:3001/yo/holla"));
    } catch (e) {
        console.warn(e);
    }
}

main();
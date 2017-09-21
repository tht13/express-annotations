import { fork, ChildProcess } from "child_process";
import { join, normalize } from "path";
import { IRoute } from "../helpers";
import { ITestcase } from "./testHelper";

export interface IRunningTestcase {
    port: number;
    routes: IRoute[];
    shutdown: () => Promise<void>;
}

export function launchTestcase(testcase: string): Promise<IRunningTestcase> {
    return new Promise(res => {
        let cp: ChildProcess = fork(normalize(join(__dirname, "testcaseRunner.js")), [testcase], { execArgv: [], silent: true });
        const shutdown: () => Promise<void> = () => {
            return new Promise(res => {
                cp.on("exit", res);
                cp.kill();
            });
        };
        cp.on("error", err => console.log(`Error in "${testcase}": ${err}`));
        cp.on("message", msg => {
            const testcase: ITestcase = JSON.parse(msg);
            res({
                shutdown,
                ...testcase
            });
        });
        cp.stderr.on("data", chunk => console.log(`Error in "${testcase}": ${chunk.toString()}`));
    });
}

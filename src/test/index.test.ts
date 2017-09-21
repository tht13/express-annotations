import * as assert from "assert";
import { getTestCases, ITestFile } from "./testHelper";
import { join } from "path";
import * as rp from "request-promise-native";
import { IRoute } from "../helpers";
import { IRunningTestcase, launchTestcase } from "./testcaseLauncher";

let success: boolean = true;

function timeout(ms: number = 1000): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
}

async function main(): Promise<void> {
    const testcases: string[] = (await getTestCases()).filter(name => name.endsWith(".js"));
    for (let testcase of testcases) {
        console.log(`Testing: ${testcase}`);
        const testfile: IRunningTestcase = await launchTestcase(testcase);
        for (let route of testfile.routes) {
            await testRoute(route, testfile.port);
        }
        await testfile.shutdown();
    }
}

async function testRoute(route: IRoute, port: number): Promise<void> {
    console.log(`Testing route: [${route.method}]${route.path}`);
    try {
        let result: any = await rp[route.method](`http://localhost:${port}${route.path}`);
        console.log(`Successful result: [${route.method}]${route.path}`);
    } catch (e) {
        console.warn(`Route Failed: [${route.method}]${route.path}`);
        success = false;
    }
}

(async () => {
    await main();
    if (!success) {
        console.log("Failures occured");
        return process.exit(1);
    }
    process.exit(0);
})();

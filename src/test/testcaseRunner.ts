import { getRoutes, ITestFile, ITestcase, TEST_CASE_DIR } from "./testHelper";
import { IRoute } from "../helpers";
import { join } from "path";

async function main(): Promise<void> {
    const testcaseName: string = process.argv[2];
    const testfile: ITestFile = (await import(join(TEST_CASE_DIR, testcaseName))).default;
    const routes: IRoute[] = testfile.classes
        .map(cls => getRoutes(cls))
        .reduce((prev, curr) => prev.concat(curr), []);
    const testcase: ITestcase = {
        routes,
        port: testfile.port
    };
    await testfile.startPromise;
    process.send(JSON.stringify(testcase));
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})();

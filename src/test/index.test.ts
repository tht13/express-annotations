import * as assert from "assert";
import { getTestCases, getRoutes, TEST_CASE_DIR, ITestFile } from "./testHelper";
import { join } from "path";
import * as rp from "request-promise-native";

function timeout(ms: number = 1000): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
}

(async function (): Promise<void> {
    const testcases: string[] = (await getTestCases()).filter(name => name.endsWith(".js"));
    const testfiles: ITestFile[] = [];
    for (let testcase of testcases) {
        testfiles.push((await import(join(TEST_CASE_DIR, testcase))).default);
    }
    describe("TestCases", function (): void {
        this.timeout(10000);
        // tslint:disable-next-line:forin
        for (let index in testcases) {
            const testcase: string = testcases[index];
            const testfile: ITestFile = testfiles[index];
            describe(`Testcase: ${testcase}`, function (): void {
                after(function (): Promise<void> {
                    return testfile.shutdown();
                });

                for (let route of testfile.classes
                    .map(cls => getRoutes(cls))
                    .reduce((prev, curr) => prev.concat(curr), [])
                ) {
                    it(`Should have functioning path: ${route.path}`, async function (): Promise<void> {
                        console.log(await rp[route.method](`http://localhost:${testfile.port}${route.path}`));
                        return Promise.resolve();
                    });
                }
            });
        }
    });
    await timeout();
    run();
})();

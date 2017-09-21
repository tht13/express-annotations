import { IRoute } from "../helpers";
import { readdirAsync } from "fs-extra-promise";
import { join, normalize } from "path";

export const TEST_CASE_DIR: string = normalize(join(__dirname, "testcases"));

export function getRandomPort(min: number = 20000, max: number = 50000): number {
    return Math.floor((Math.random() * (max - min)) + min);
}

export interface ITestcase {
    port: number;
    routes: IRoute[];
}

export interface ITestFile {
    port: number;
    classes: any[];
    startPromise: Promise<void>;
}

export function getRoutes(cls: any): IRoute[] {
    const routes: IRoute[] = [];
    const objProto: Object = cls.prototype;
    return Object.getOwnPropertyNames(objProto).sort()
        .filter((e, i, arr) => {
            let descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(objProto, e);
            return (
                (descriptor && descriptor.value && descriptor.value.isRoute) &&
                e !== arr[i + 1] &&
                typeof objProto[e] === "function" &&
                e !== "constructor") ? true : false;
        }).map<IRoute>(e => Object.getOwnPropertyDescriptor(objProto, e).value.routeProperties);
}

export async function getTestCases(): Promise<string[]> {
    return await readdirAsync(TEST_CASE_DIR);
}

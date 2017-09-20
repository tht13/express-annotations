import { IRoute } from "../helpers";

export function getRandomPort(min: number = 20000, max: number = 50000): number {
    return Math.floor((Math.random() * (max - min)) + min);
}

export function getRoutes(cls): IRoute[] {
    const routes: IRoute[] = [];
    const objProto: object = cls.prototype;
    return Object.getOwnPropertyNames(objProto).sort()
        .filter((e, i, arr) => {
            let descriptor = Object.getOwnPropertyDescriptor(objProto, e);
            return (
                (descriptor && descriptor.value && descriptor.value["isRoute"]) &&
                e != arr[i + 1] &&
                typeof objProto[e] == 'function' &&
                e !== 'constructor') ? true : false;
        }).map<IRoute>(e => Object.getOwnPropertyDescriptor(objProto, e).value["routeProperties"]);
}

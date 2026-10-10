"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const IpAddress_1 = __importDefault(require("../domain/IpAddress"));
const IpPort_1 = __importDefault(require("../domain/IpPort"));
class Configuration {
    loadIpAddress(fieldName, setter, data) {
        const value = data[fieldName];
        if (value === undefined || value === null) {
            // value is not set
            return;
        }
        else if (typeof value === "string") {
            try {
                const ip = (0, IpAddress_1.default)(value);
                setter(ip);
            }
            catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`);
                return;
            }
        }
        else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`);
        }
    }
    loadIpPort(fieldName, setter, data) {
        const value = data[fieldName];
        if (value === undefined || value === null) {
            // value is not set
            return;
        }
        else if (typeof value === "number") {
            try {
                const port = (0, IpPort_1.default)(value);
                setter(port);
            }
            catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`);
                return;
            }
        }
        else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`);
        }
    }
    loadNumber(fieldName, setter, data) {
        const value = data[fieldName];
        if (value === undefined || value === null) {
            // value is not set
            return;
        }
        else if (typeof value === "number") {
            try {
                setter(value);
            }
            catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`);
                return;
            }
        }
        else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`);
        }
    }
    loadString(fieldName, setter, data) {
        const value = data[fieldName];
        if (value === undefined || value === null) {
            // value is not set
            return;
        }
        else if (typeof value === "string") {
            try {
                setter(value);
            }
            catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`);
                return;
            }
        }
        else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`);
        }
    }
}
exports.Configuration = Configuration;

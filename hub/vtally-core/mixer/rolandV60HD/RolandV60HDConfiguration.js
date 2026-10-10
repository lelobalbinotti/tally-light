"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IpAddress_1 = __importDefault(require("../../domain/IpAddress"));
const IpPort_1 = __importDefault(require("../../domain/IpPort"));
const interfaces_1 = require("../interfaces");
class RolandV60HDConfiguration extends interfaces_1.Configuration {
    constructor() {
        super();
        this.ip = RolandV60HDConfiguration.defaultIp;
        this.port = RolandV60HDConfiguration.defaultPort;
        this.requestInterval = RolandV60HDConfiguration.defaultRequestInterval;
    }
    fromJson(data) {
        this.loadIpAddress("ip", this.setIp.bind(this), data);
        this.loadIpPort("port", this.setPort.bind(this), data);
        this.loadNumber("requestInterval", this.setRequestInterval.bind(this), data);
    }
    toJson() {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
            requestInterval: this.requestInterval,
        };
    }
    clone() {
        const clone = new RolandV60HDConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
    setIp(ip) {
        if (typeof ip === "string") {
            ip = (0, IpAddress_1.default)(ip);
        }
        else if (ip === null) {
            ip = RolandV60HDConfiguration.defaultIp;
        }
        this.ip = ip;
        return this;
    }
    getIp() {
        return this.ip;
    }
    setPort(port) {
        if (typeof port === "number" || typeof port === "string") {
            port = (0, IpPort_1.default)(port);
        }
        else if (port === null) {
            port = RolandV60HDConfiguration.defaultPort;
        }
        this.port = port;
        return this;
    }
    getPort() {
        return this.port;
    }
    setRequestInterval(requestInterval) {
        if (requestInterval === null) {
            requestInterval = RolandV60HDConfiguration.defaultRequestInterval;
        }
        else if (typeof requestInterval === "string") {
            requestInterval = parseInt(requestInterval, 10);
            if (!Number.isFinite(requestInterval)) {
                throw new Error(`Could not parse "${requestInterval}" into a number.`);
            }
        }
        this.requestInterval = requestInterval;
    }
    getRequestInterval() {
        return this.requestInterval;
    }
}
RolandV60HDConfiguration.defaultIp = (0, IpAddress_1.default)("127.0.0.1");
RolandV60HDConfiguration.defaultPort = (0, IpPort_1.default)(80);
RolandV60HDConfiguration.defaultRequestInterval = 250;
exports.default = RolandV60HDConfiguration;

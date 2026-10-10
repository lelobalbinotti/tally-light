"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IpAddress_1 = __importDefault(require("../../domain/IpAddress"));
const IpPort_1 = __importDefault(require("../../domain/IpPort"));
const interfaces_1 = require("../interfaces");
class AtemConfiguration extends interfaces_1.Configuration {
    constructor() {
        super();
        this.ip = AtemConfiguration.defaultIp;
        this.port = AtemConfiguration.defaultPort;
    }
    fromJson(data) {
        this.loadIpAddress("ip", this.setIp.bind(this), data);
        this.loadIpPort("port", this.setPort.bind(this), data);
    }
    toJson() {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
        };
    }
    clone() {
        const clone = new AtemConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
    setIp(ip) {
        if (typeof ip === "string") {
            ip = (0, IpAddress_1.default)(ip);
        }
        else if (ip === null) {
            ip = AtemConfiguration.defaultIp;
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
            port = AtemConfiguration.defaultPort;
        }
        this.port = port;
        return this;
    }
    getPort() {
        return this.port;
    }
}
AtemConfiguration.defaultIp = (0, IpAddress_1.default)("127.0.0.1");
AtemConfiguration.defaultPort = (0, IpPort_1.default)(9910);
exports.default = AtemConfiguration;

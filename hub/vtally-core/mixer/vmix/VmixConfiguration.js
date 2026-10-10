"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IpAddress_1 = __importDefault(require("../../domain/IpAddress"));
const IpPort_1 = __importDefault(require("../../domain/IpPort"));
const interfaces_1 = require("../interfaces");
class VmixConfiguration extends interfaces_1.Configuration {
    constructor() {
        super();
        this.ip = VmixConfiguration.defaultIp;
        this.port = VmixConfiguration.defaultPort;
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
        const clone = new VmixConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
    setIp(ip) {
        if (typeof ip === "string") {
            ip = (0, IpAddress_1.default)(ip);
        }
        else if (ip === null) {
            ip = VmixConfiguration.defaultIp;
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
            port = VmixConfiguration.defaultPort;
        }
        this.port = port;
        return this;
    }
    getPort() {
        return this.port;
    }
}
VmixConfiguration.defaultIp = (0, IpAddress_1.default)("127.0.0.1");
VmixConfiguration.defaultPort = (0, IpPort_1.default)(8099);
exports.default = VmixConfiguration;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IpAddress_1 = __importDefault(require("../../domain/IpAddress"));
const IpPort_1 = __importDefault(require("../../domain/IpPort"));
const interfaces_1 = require("../interfaces");
class ObsConfiguration extends interfaces_1.Configuration {
    constructor() {
        super();
        this.ip = ObsConfiguration.defaultIp;
        this.port = ObsConfiguration.defaultPort;
        this.liveMode = ObsConfiguration.defaultLiveMode;
    }
    fromJson(data) {
        this.loadIpAddress("ip", this.setIp.bind(this), data);
        this.loadIpPort("port", this.setPort.bind(this), data);
        data.liveMode && this.setLiveMode(data.liveMode);
    }
    toJson() {
        return {
            ip: this.ip.toString(),
            port: this.port.toNumber(),
            liveMode: this.liveMode,
        };
    }
    clone() {
        const clone = new ObsConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
    setIp(ip) {
        if (typeof ip === "string") {
            ip = (0, IpAddress_1.default)(ip);
        }
        else if (ip === null) {
            ip = ObsConfiguration.defaultIp;
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
            port = ObsConfiguration.defaultPort;
        }
        this.port = port;
        return this;
    }
    getPort() {
        return this.port;
    }
    setLiveMode(mode) {
        this.liveMode = mode;
    }
    getLiveMode() {
        return this.liveMode;
    }
    static isValidLiveMode(theString) {
        return theString === "always" || theString === "streamOrRecord" || theString === "stream" || theString === "record";
    }
}
ObsConfiguration.defaultIp = (0, IpAddress_1.default)("127.0.0.1");
ObsConfiguration.defaultPort = (0, IpPort_1.default)(4455);
ObsConfiguration.defaultLiveMode = "always";
exports.default = ObsConfiguration;

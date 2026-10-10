"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpPort = void 0;
function isValidPort(port) {
    return Number.isInteger(port) && port > 0 && port <= 65535;
}
class IpPort {
    constructor(port) {
        if (typeof port === "string") {
            port = parseInt(port, 10);
        }
        if (!isValidPort(port)) {
            throw new Error(`Invalid Port: ${port}`);
        }
        else {
            this.port = port;
        }
    }
    toNumber() {
        return this.port;
    }
    toString() {
        return this.toNumber().toString();
    }
}
exports.IpPort = IpPort;
const ipPort = (port) => new IpPort(port);
exports.default = ipPort;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpAddress = void 0;
function isValidIp(address) {
    if (address === "localhost") {
        return true;
    }
    // ipv4
    const [one, two, three, four, rest] = address.split(".");
    if (rest !== undefined) {
        return false;
    }
    return [one, two, three, four].every((segment) => {
        return segment !== undefined && segment.match(/^\d{1,3}$/) !== null && parseInt(segment, 10) >= 0 && parseInt(segment, 10) <= 255;
    });
}
class IpAddress {
    constructor(address) {
        if (!isValidIp(address)) {
            throw new Error(`Invalid IP address: ${address}`);
        }
        else {
            this.address = address;
        }
    }
    toString() {
        return this.address;
    }
}
exports.IpAddress = IpAddress;
const ipAddress = (address) => new IpAddress(address);
exports.default = ipAddress;

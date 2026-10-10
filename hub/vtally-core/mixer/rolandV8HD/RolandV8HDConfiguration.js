"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
class RolandV8HDConfiguration extends interfaces_1.Configuration {
    constructor() {
        super();
        this.requestInterval = RolandV8HDConfiguration.defaultRequestInterval;
    }
    fromJson(data) {
        this.loadNumber("requestInterval", this.setRequestInterval.bind(this), data);
    }
    toJson() {
        return {
            requestInterval: this.requestInterval,
        };
    }
    clone() {
        const clone = new RolandV8HDConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
    setRequestInterval(requestInterval) {
        if (requestInterval === null) {
            requestInterval = RolandV8HDConfiguration.defaultRequestInterval;
        }
        else if (typeof requestInterval === "string") {
            requestInterval = parseInt(requestInterval, 10);
            if (!Number.isFinite(requestInterval)) {
                throw new Error(`Could not parse "${requestInterval}" into a number.`);
            }
        }
        this.requestInterval = requestInterval;
        return this;
    }
    getRequestInterval() {
        return this.requestInterval;
    }
}
RolandV8HDConfiguration.defaultRequestInterval = 100;
exports.default = RolandV8HDConfiguration;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
class NullConfiguration extends interfaces_1.Configuration {
    fromJson(data) {
        // empty. Has no settings, so nothing to load
    }
    toJson() {
        return {};
    }
    clone() {
        const clone = new NullConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
}
exports.default = NullConfiguration;

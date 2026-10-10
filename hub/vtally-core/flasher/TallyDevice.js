"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TallySettingsIni_1 = __importDefault(require("./TallySettingsIni"));
class TallyDevice {
    toJson() {
        return {
            vendorId: this.vendorId,
            productId: this.productId,
            chipId: this.chipId,
            flashId: this.flashId,
            nodeMcuModules: this.nodeMcuModules,
            nodeMcuVersion: this.nodeMcuVersion,
            path: this.path,
            tallySettings: this.tallySettings ? this.tallySettings.toString() : undefined,
            errorMessage: this.errorMessage,
            update: this.update,
        };
    }
    static fromJson(data) {
        const device = new TallyDevice();
        device.vendorId = data.vendorId;
        device.productId = data.productId;
        device.chipId = data.chipId;
        device.flashId = data.flashId;
        device.nodeMcuModules = data.nodeMcuModules;
        device.nodeMcuVersion = data.nodeMcuVersion;
        device.path = data.path;
        device.tallySettings = data.tallySettings ? new TallySettingsIni_1.default(data.tallySettings) : undefined;
        device.errorMessage = data.errorMessage;
        device.update = data.update;
        return device;
    }
}
exports.default = TallyDevice;

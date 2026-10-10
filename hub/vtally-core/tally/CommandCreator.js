"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ColorScheme_1 = __importStar(require("./ColorScheme"));
class CommandCreator {
    getState(tally, programs, previews) {
        if (tally.isHighlighted()) {
            return "highlight";
        }
        else if (programs === null && tally.isPatched()) {
            // mixer is disconnected
            return "unknown";
        }
        else if (programs !== null && tally.isIn(programs)) {
            return "on-air";
        }
        else if (previews !== null && tally.isIn(previews)) {
            return "preview";
        }
        return "release";
    }
    createStateCommand(tally, programs, previews, defaultConfiguration) {
        let opColor;
        let stColor;
        let flashPattern = 0;
        let stepDuration = 0;
        const state = this.getState(tally, programs, previews);
        const stColorScheme = ColorScheme_1.default.getById(tally.configuration.getStageColorScheme() || defaultConfiguration.getStageColorScheme());
        const opColorScheme = ColorScheme_1.default.getById(tally.configuration.getOperatorColorScheme() || defaultConfiguration.getOperatorColorScheme());
        if (state === "highlight") {
            opColor = opColorScheme.highlight;
            stColor = stColorScheme.highlight;
            flashPattern = 0xAA;
            stepDuration = 125;
        }
        else if (state === "on-air") {
            opColor = opColorScheme.program;
            stColor = stColorScheme.program;
        }
        else if (state === "preview") {
            opColor = opColorScheme.preview;
            const showPreview = tally.configuration.getStageShowsPreview() === undefined ? defaultConfiguration.getStageShowsPreview() : tally.configuration.getStageShowsPreview();
            stColor = showPreview ? stColorScheme.preview : ColorScheme_1.Black;
        }
        else if (state === "release") {
            const showIdle = tally.configuration.getOperatorShowsIdle() === undefined ? defaultConfiguration.getOperatorShowsIdle() : tally.configuration.getOperatorShowsIdle();
            opColor = showIdle ? opColorScheme.idle : ColorScheme_1.Black;
            stColor = ColorScheme_1.Black;
        }
        else if (state === "unknown") {
            opColor = opColorScheme.unknown;
            stColor = ColorScheme_1.Black;
            flashPattern = 0x80;
            stepDuration = 250;
        }
        else {
            // typescript will fail if we missed a case
            ((_) => { })(state);
        }
        const operatorBrightness = tally.configuration.getOperatorLightBrightness() !== undefined ? tally.configuration.getOperatorLightBrightness() : defaultConfiguration.getOperatorLightBrightness();
        opColor = opColor.withBrightness(operatorBrightness);
        const stageBrightness = tally.configuration.getStageLightBrightness() !== undefined ? tally.configuration.getStageLightBrightness() : defaultConfiguration.getStageLightBrightness();
        stColor = stColor.withBrightness(stageBrightness);
        let command = `O${opColor.r.toString().padStart(3, "0")}/${opColor.g.toString().padStart(3, "0")}/${opColor.b.toString().padStart(3, "0")} ` +
            `S${stColor.r.toString().padStart(3, "0")}/${stColor.g.toString().padStart(3, "0")}/${stColor.b.toString().padStart(3, "0")}`;
        if (flashPattern > 0 && stepDuration > 0) {
            command += ` 0x${flashPattern.toString(16).padStart(2, "0").toUpperCase()} ${stepDuration.toString().padStart(3, "0")}`;
        }
        return command;
    }
}
exports.default = new CommandCreator();

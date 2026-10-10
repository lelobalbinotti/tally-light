"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TallyConfiguration = exports.DefaultTallyConfiguration = void 0;
const ColorScheme_1 = require("./ColorScheme");
/**
 * representation of the default values if an individual tally does not override them
 */
class DefaultTallyConfiguration {
    constructor() {
        this._stageLightBrightness = DefaultTallyConfiguration.defaultBrightness;
        this._stageColorScheme = DefaultTallyConfiguration.defaultColorScheme;
        this._operatorLightBrightness = DefaultTallyConfiguration.defaultBrightness;
        this._operatorColorScheme = DefaultTallyConfiguration.defaultColorScheme;
        this._stageShowsPreview = true;
        this._operatorShowsIdle = true;
    }
    getStageLightBrightness() { return this._stageLightBrightness; }
    setStageLightBrightness(value) {
        if (value === null || value === undefined) {
            value = DefaultTallyConfiguration.defaultBrightness;
        }
        this._stageLightBrightness = Math.min(Math.max(value, 0), 100);
    }
    getStageColorScheme() { return this._stageColorScheme; }
    setStageColorScheme(scheme) { this._stageColorScheme = scheme; }
    getOperatorLightBrightness() { return this._operatorLightBrightness; }
    setOperatorLightBrightness(value) {
        const minValue = DefaultTallyConfiguration.minOperatorLightBrightness;
        if (value === null || value === undefined) {
            value = DefaultTallyConfiguration.defaultBrightness;
        }
        else if (value < minValue) {
            console.warn(`Operator Light Brightness can not be below ${minValue} to prevent a tally light that stays dark because of configuration, but got ${value}. Using ${minValue} instead.`);
            value = minValue;
        }
        this._operatorLightBrightness = Math.min(value, 100);
    }
    getOperatorColorScheme() { return this._operatorColorScheme; }
    setOperatorColorScheme(scheme) { this._operatorColorScheme = scheme; }
    getStageShowsPreview() { return this._stageShowsPreview; }
    setStageShowsPreview(shouldItShow) { this._stageShowsPreview = shouldItShow; }
    getOperatorShowsIdle() { return this._operatorShowsIdle; }
    setOperatorShowsIdle(shouldItShow) { this._operatorShowsIdle = shouldItShow; }
    toJson() {
        return {
            stBrightness: this._stageLightBrightness,
            opBrightness: this._operatorLightBrightness,
            stColor: this._stageColorScheme,
            opColor: this._operatorColorScheme,
            stPreview: this._stageShowsPreview,
            opIdle: this._operatorShowsIdle,
        };
    }
    fromJson(valueObject) {
        valueObject.opBrightness !== undefined && this.setOperatorLightBrightness(valueObject.opBrightness);
        valueObject.stBrightness !== undefined && this.setStageLightBrightness(valueObject.stBrightness);
        valueObject.stColor !== undefined && this.setStageColorScheme(valueObject.stColor);
        valueObject.opColor !== undefined && this.setOperatorColorScheme(valueObject.opColor);
        valueObject.stPreview !== undefined && this.setStageShowsPreview(valueObject.stPreview);
        valueObject.opIdle !== undefined && this.setOperatorShowsIdle(valueObject.opIdle);
    }
    clone() {
        const clone = new DefaultTallyConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
}
exports.DefaultTallyConfiguration = DefaultTallyConfiguration;
DefaultTallyConfiguration.defaultColorScheme = ColorScheme_1.DefaultColorScheme.id;
DefaultTallyConfiguration.minOperatorLightBrightness = 1;
DefaultTallyConfiguration.defaultBrightness = 100;
/**
 * representation of an individual tally that could override DefaultTallyConfiguration
 */
class TallyConfiguration {
    constructor() {
        this._stageLightBrightness = undefined;
        this._operatorLightBrightness = undefined;
        this._stageColorScheme = undefined;
        this._operatorColorScheme = undefined;
        this._stageShowsPreview = undefined;
        this._operatorShowsIdle = undefined;
    }
    getStageLightBrightness() { return this._stageLightBrightness; }
    setStageLightBrightness(value) {
        if (value === null || value === undefined) {
            this._stageLightBrightness = undefined;
            return;
        }
        this._stageLightBrightness = Math.min(Math.max(value, 0), 100);
    }
    getStageColorScheme() { return this._stageColorScheme; }
    setStageColorScheme(scheme) { this._stageColorScheme = scheme; }
    getOperatorLightBrightness() { return this._operatorLightBrightness; }
    setOperatorLightBrightness(value) {
        const minValue = DefaultTallyConfiguration.minOperatorLightBrightness;
        if (value === null || value === undefined) {
            this._operatorLightBrightness = undefined;
            return;
        }
        else if (value < minValue) {
            console.warn(`Operator Light Brightness can not be below ${minValue} to prevent a tally light that stays dark because of configuration, but got ${value}. Using ${minValue} instead.`);
            value = minValue;
        }
        this._operatorLightBrightness = Math.min(value, 100);
    }
    getOperatorColorScheme() { return this._operatorColorScheme; }
    setOperatorColorScheme(scheme) { this._operatorColorScheme = scheme; }
    getStageShowsPreview() { return this._stageShowsPreview; }
    setStageShowsPreview(shouldItShow) { this._stageShowsPreview = shouldItShow; }
    getOperatorShowsIdle() { return this._operatorShowsIdle; }
    setOperatorShowsIdle(shouldItShow) { this._operatorShowsIdle = shouldItShow; }
    toJson() {
        return {
            stBrightness: this._stageLightBrightness,
            opBrightness: this._operatorLightBrightness,
            stColor: this._stageColorScheme,
            opColor: this._operatorColorScheme,
            stPreview: this._stageShowsPreview,
            opIdle: this._operatorShowsIdle,
        };
    }
    fromJson(valueObject) {
        this.setOperatorLightBrightness(valueObject.opBrightness);
        this.setStageLightBrightness(valueObject.stBrightness);
        this.setStageColorScheme(valueObject.stColor);
        this.setOperatorColorScheme(valueObject.opColor);
        this.setStageShowsPreview(valueObject.stPreview);
        this.setOperatorShowsIdle(valueObject.opIdle);
    }
}
exports.TallyConfiguration = TallyConfiguration;

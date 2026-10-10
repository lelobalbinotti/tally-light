"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfiguration = void 0;
const MixerDriver_1 = require("./MixerDriver");
const Channel_1 = __importDefault(require("../domain/Channel"));
const AtemConfiguration_1 = __importDefault(require("../mixer/atem/AtemConfiguration"));
const MockConfiguration_1 = __importDefault(require("../mixer/mock/MockConfiguration"));
const ObsConfiguration_1 = __importDefault(require("../mixer/obs/ObsConfiguration"));
const RolandV8HDConfiguration_1 = __importDefault(require("../mixer/rolandV8HD/RolandV8HDConfiguration"));
const RolandV60HDConfiguration_1 = __importDefault(require("../mixer/rolandV60HD/RolandV60HDConfiguration"));
const VmixConfiguration_1 = __importDefault(require("../mixer/vmix/VmixConfiguration"));
const NullConfiguration_1 = __importDefault(require("../mixer/null/NullConfiguration"));
const interfaces_1 = require("../mixer/interfaces");
const Tally_1 = __importDefault(require("../domain/Tally"));
const TestConfiguration_1 = __importDefault(require("../mixer/test/TestConfiguration"));
const TallyConfiguration_1 = require("../tally/TallyConfiguration");
class AppConfiguration extends interfaces_1.Configuration {
    constructor(emitter) {
        super();
        this.emitter = emitter;
        this.atemConfiguration = new AtemConfiguration_1.default();
        this.mockConfiguration = new MockConfiguration_1.default();
        this.nullConfiguration = new NullConfiguration_1.default();
        this.obsConfiguration = new ObsConfiguration_1.default();
        this.rolandV8HDConfiguration = new RolandV8HDConfiguration_1.default();
        this.rolandV60HDConfiguration = new RolandV60HDConfiguration_1.default();
        this.testConfiguration = new TestConfiguration_1.default();
        this.vmixConfiguration = new VmixConfiguration_1.default();
        this.tallyConfiguration = new TallyConfiguration_1.DefaultTallyConfiguration();
        this.tallies = [];
        this.channels = MixerDriver_1.MixerDriver.defaultChannels;
        this.tallyPort = 7411;
        this.tallyHighlightTime = 1000; // ms
        this.tallyKeepAlivesPerSecond = 10;
        this.tallyTimeoutDisconnected = 30000; // ms
        this.tallyTimeoutMissing = 3000; //ms
    }
    loadChannelArray(fieldName, setter, data) {
        const value = data[fieldName];
        if (value === undefined || value === null) {
            // value is not set
            return;
        }
        else if (Array.isArray(value)) {
            try {
                setter(value.map(c => Channel_1.default.fromJson(c)));
            }
            catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`);
                return;
            }
        }
        else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`);
        }
    }
    loadTallyArray(fieldName, setter, data) {
        const value = data[fieldName];
        if (value === undefined || value === null) {
            // value is not set
            return;
        }
        else if (Array.isArray(value)) {
            try {
                setter(value.map(t => Tally_1.default.fromJsonForSave(t)));
            }
            catch (err) {
                console.error(`error loading property "${fieldName}" of configuration: ${err}`);
                return;
            }
        }
        else {
            console.error(`error loading property "${fieldName}": invalid type ${typeof value}`);
        }
    }
    fromJson(data) {
        if (data.atem) {
            this.atemConfiguration.fromJson(data.atem);
        }
        if (data.mock) {
            this.mockConfiguration.fromJson(data.mock);
        }
        if (data.null) {
            this.nullConfiguration.fromJson(data.null);
        }
        if (data.obs) {
            this.obsConfiguration.fromJson(data.obs);
        }
        if (data.rolandV8HD) {
            this.rolandV8HDConfiguration.fromJson(data.rolandV8HD);
        }
        if (data.rolandV60HD) {
            this.rolandV60HDConfiguration.fromJson(data.rolandV60HD);
        }
        if (data.test) {
            this.testConfiguration.fromJson(data.test);
        }
        if (data.vmix) {
            this.vmixConfiguration.fromJson(data.vmix);
        }
        if (data.tallyDefaults) {
            this.tallyConfiguration.fromJson(data.tallyDefaults);
        }
        this.loadString("mixer", this.setMixerSelection.bind(this), data);
        this.loadChannelArray("channels", this.setChannels.bind(this), data);
        this.loadTallyArray("tallies", this.setTallies.bind(this), data);
    }
    toJson() {
        return {
            mixer: this.mixerSelection,
            atem: this.atemConfiguration.toJson(),
            mock: this.mockConfiguration.toJson(),
            "null": this.nullConfiguration.toJson(),
            obs: this.obsConfiguration.toJson(),
            rolandV8HD: this.rolandV8HDConfiguration.toJson(),
            rolandV60HD: this.rolandV60HDConfiguration.toJson(),
            test: this.testConfiguration.toJson(),
            vmix: this.vmixConfiguration.toJson(),
            tallyDefaults: this.tallyConfiguration.toJson(),
            tallies: this.tallies.map(tally => tally.toJsonForSave()),
            channels: this.channels.map(channel => channel.toJson()),
        };
    }
    clone() {
        const clone = new AppConfiguration(this.emitter);
        clone.fromJson(this.toJson());
        return clone;
    }
    getAtemConfiguration() {
        return this.atemConfiguration.clone();
    }
    setAtemConfiguration(atemConfiguration) {
        this.atemConfiguration = atemConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.atem", this.atemConfiguration);
    }
    getMockConfiguration() {
        return this.mockConfiguration.clone();
    }
    setMockConfiguration(mockConfiguration) {
        this.mockConfiguration = mockConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.mock", this.mockConfiguration);
    }
    getNullConfiguration() {
        return this.nullConfiguration.clone();
    }
    setNullConfiguration(nullConfiguration) {
        this.nullConfiguration = nullConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.null", this.nullConfiguration);
    }
    getObsConfiguration() {
        return this.obsConfiguration.clone();
    }
    setObsConfiguration(obsConfiguration) {
        this.obsConfiguration = obsConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.obs", this.obsConfiguration);
    }
    getRolandV8HDConfiguration() {
        return this.rolandV8HDConfiguration.clone();
    }
    setRolandV8HDConfiguration(rolandV8HDConfiguration) {
        this.rolandV8HDConfiguration = rolandV8HDConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.rolandV8HD", this.rolandV8HDConfiguration);
    }
    getRolandV60HDConfiguration() {
        return this.rolandV60HDConfiguration.clone();
    }
    setRolandV60HDConfiguration(rolandV60HDConfiguration) {
        this.rolandV60HDConfiguration = rolandV60HDConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.rolandV60HD", this.rolandV60HDConfiguration);
    }
    getTestConfiguration() {
        return this.testConfiguration.clone();
    }
    setTestConfiguration(testConfiguration) {
        this.testConfiguration = testConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.test", this.testConfiguration);
    }
    getVmixConfiguration() {
        return this.vmixConfiguration.clone();
    }
    setVmixConfiguration(vmixConfiguration) {
        this.vmixConfiguration = vmixConfiguration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.vmix", this.vmixConfiguration);
    }
    getTallyConfiguration() {
        return this.tallyConfiguration.clone();
    }
    setTallyConfiguration(configuration) {
        this.tallyConfiguration = configuration.clone();
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.tallyconfig", this.tallyConfiguration);
    }
    setChannels(channels) {
        this.channels = channels;
        this.emitter.emit('config.changed', this);
        this.emitter.emit('config.changed.channels', this.channels);
    }
    getChannels() {
        return this.channels;
    }
    getChannelsAsJson() {
        return this.channels.map(channel => channel.toJson());
    }
    setTallies(tallies) {
        this.tallies = tallies;
        this.emitter.emit('config.changed', this);
        this.emitter.emit('config.changed.tallies', this.tallies);
    }
    getTallies() {
        return this.tallies;
    }
    setMixerSelection(mixerSelection) {
        this.mixerSelection = mixerSelection;
        this.emitter.emit("config.changed", this);
        this.emitter.emit("config.changed.mixer", mixerSelection);
    }
    getMixerSelection() {
        return this.mixerSelection;
    }
    isDev() {
        return process.env.NODE_ENV !== 'production';
    }
    isTest() {
        return process.env.HUB_WITH_TEST === 'true';
    }
    getHttpPort() {
        return (typeof process.env.PORT === "string" && parseInt(process.env.PORT, 10)) || 3000;
    }
    getTallyPort() {
        return this.tallyPort;
    }
    getTallyHighlightTime() {
        return this.tallyHighlightTime;
    }
    // the more keep alives you send the less likely it is that
    // the tally shows a wrong state, but you send more packages
    // over the network.
    getTallyKeepAlivesPerSecond() {
        return this.tallyKeepAlivesPerSecond;
    }
    setTallyTimeoutDisconnected(timeout) {
        if (timeout < 1000) {
            throw new Error(`timeout too small: ${timeout}ms`);
        }
        this.tallyTimeoutDisconnected = timeout;
    }
    getTallyTimeoutDisconnected() {
        return this.tallyTimeoutDisconnected;
    }
    setTallyTimeoutMissing(timeout) {
        if (timeout < 1000) {
            throw new Error(`timeout too small: ${timeout}ms`);
        }
        this.tallyTimeoutMissing = timeout;
    }
    getTallyTimeoutMissing() {
        return this.tallyTimeoutMissing;
    }
}
exports.AppConfiguration = AppConfiguration;

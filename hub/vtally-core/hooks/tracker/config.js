"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const AtemConfiguration_1 = __importDefault(require("../../mixer/atem/AtemConfiguration"));
const MockConfiguration_1 = __importDefault(require("../../mixer/mock/MockConfiguration"));
const ObsConfiguration_1 = __importDefault(require("../../mixer/obs/ObsConfiguration"));
const RolandV8HDConfiguration_1 = __importDefault(require("../../mixer/rolandV8HD/RolandV8HDConfiguration"));
const RolandV60HDConfiguration_1 = __importDefault(require("../../mixer/rolandV60HD/RolandV60HDConfiguration"));
const VmixConfiguration_1 = __importDefault(require("../../mixer/vmix/VmixConfiguration"));
const TallyConfiguration_1 = require("../../tally/TallyConfiguration");
class ConfigTracker extends events_1.EventEmitter {
    constructor(socket) {
        super();
        socket.on('config.state.mixer', ({ mixerName, allowedMixers }) => {
            this.mixerName = mixerName;
            this.allowedMixers = allowedMixers;
            this.emit('mixer', this.mixerName);
            this.emit('allowedMixers', this.allowedMixers);
        });
        socket.on('config.state.atem', (atem) => {
            this.atemConfiguration = new AtemConfiguration_1.default();
            this.atemConfiguration.fromJson(atem);
            this.emit('atem', this.atemConfiguration);
        });
        socket.on('config.state.mock', (mock) => {
            this.mockConfiguration = new MockConfiguration_1.default();
            this.mockConfiguration.fromJson(mock);
            this.emit('mock', this.mockConfiguration);
        });
        socket.on('config.state.obs', (obs) => {
            this.obsConfiguration = new ObsConfiguration_1.default();
            this.obsConfiguration.fromJson(obs);
            this.emit('obs', this.obsConfiguration);
        });
        socket.on('config.state.rolandV8HD', (rolandV8HD) => {
            this.rolandV8HDConfiguration = new RolandV8HDConfiguration_1.default();
            this.rolandV8HDConfiguration.fromJson(rolandV8HD);
            this.emit('rolandV8HD', this.rolandV8HDConfiguration);
        });
        socket.on('config.state.rolandV60HD', (rolandV60HD) => {
            this.rolandV60HDConfiguration = new RolandV60HDConfiguration_1.default();
            this.rolandV60HDConfiguration.fromJson(rolandV60HD);
            this.emit('rolandV60HD', this.rolandV60HDConfiguration);
        });
        socket.on('config.state.vmix', (vmix) => {
            this.vmixConfiguration = new VmixConfiguration_1.default();
            this.vmixConfiguration.fromJson(vmix);
            this.emit('vmix', this.vmixConfiguration);
        });
        socket.on('config.state.tallyconfig', (conf) => {
            this.defaultTallyConfiguration = new TallyConfiguration_1.DefaultTallyConfiguration();
            this.defaultTallyConfiguration.fromJson(conf);
            this.emit('tally', this.defaultTallyConfiguration);
        });
        socket.emit('events.config.subscribe');
    }
}
exports.default = ConfigTracker;

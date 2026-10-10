"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixerDriver = void 0;
const AtemConnector_1 = __importDefault(require("../mixer/atem/AtemConnector"));
const VmixConnector_1 = __importDefault(require("../mixer/vmix/VmixConnector"));
const MockConnector_1 = __importDefault(require("../mixer/mock/MockConnector"));
const NullConnector_1 = __importDefault(require("../mixer/null/NullConnector"));
const ObsConnector_1 = __importDefault(require("../mixer/obs/ObsConnector"));
const RolandV8HDConnector_1 = __importDefault(require("../mixer/rolandV8HD/RolandV8HDConnector"));
const RolandV60HDConnector_1 = __importDefault(require("../mixer/rolandV60HD/RolandV60HDConnector"));
const MixerCommunicator_1 = require("./MixerCommunicator");
const Channel_1 = __importDefault(require("../domain/Channel"));
const TestConnector_1 = __importDefault(require("../mixer/test/TestConnector"));
const haveValuesChanged = (one, two) => {
    //@TODO: this could probably be more performant
    return JSON.stringify(one) !== JSON.stringify(two);
};
// Takes care of connecting to one of the supported mixers
class MixerDriver {
    constructor(configuration, emitter) {
        this.configuration = configuration;
        this.communicator = new MixerCommunicator_1.MixerCommunicator(configuration, emitter);
        this.emitter = emitter;
        this.isChangingMixer = false;
        this.changeMixer(configuration.getMixerSelection());
        this.emitter.on('config.changed', () => {
            if (this.isChangingMixer) {
                return;
            }
            let needsRefresh = false;
            if (configuration.getMixerSelection() !== this.currentMixerId) {
                // a different mixer was selected
                console.debug("A different mixer was selected");
                needsRefresh = true;
            }
            else if (this.getCurrentMixerSettings && this.currentMixerSettings) {
                const mixerSettings = this.getCurrentMixerSettings();
                if (haveValuesChanged(mixerSettings.toJson(), this.currentMixerSettings.toJson())) {
                    console.debug("mixer connection is restarted, because settings were changed");
                    needsRefresh = true;
                }
            }
            if (needsRefresh) {
                this.changeMixer(configuration.getMixerSelection());
            }
            else {
                console.debug("settings were changed, but no need to restart mixer");
            }
        });
    }
    async changeMixer(newMixerId) {
        var _a;
        if (!MixerDriver.getAllowedMixers(this.configuration.isDev(), this.configuration.isTest()).includes(newMixerId)) {
            console.error(`Can not switch to unknown mixer with id ${newMixerId}`);
            return;
        }
        this.isChangingMixer = true;
        try {
            if (this.currentMixerInstance) {
                const ret = this.currentMixerInstance.disconnect();
                this.communicator.notifyProgramPreviewChanged(null, null);
                this.communicator.notifyChannels(MixerDriver.defaultChannels);
                await Promise.resolve(ret);
            }
            console.log(`Using mixer configuration "${newMixerId}"`);
            let MixerClass;
            // @TODO: make it better extensible
            if (newMixerId === AtemConnector_1.default.ID) {
                MixerClass = AtemConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getAtemConfiguration.bind(this.configuration);
            }
            else if (newMixerId === VmixConnector_1.default.ID) {
                MixerClass = VmixConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getVmixConfiguration.bind(this.configuration);
            }
            else if (newMixerId === ObsConnector_1.default.ID) {
                MixerClass = ObsConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getObsConfiguration.bind(this.configuration);
            }
            else if (newMixerId === RolandV8HDConnector_1.default.ID) {
                MixerClass = RolandV8HDConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getRolandV8HDConfiguration.bind(this.configuration);
            }
            else if (newMixerId === RolandV60HDConnector_1.default.ID) {
                MixerClass = RolandV60HDConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getRolandV60HDConfiguration.bind(this.configuration);
            }
            else if (newMixerId === MockConnector_1.default.ID) {
                MixerClass = MockConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getMockConfiguration.bind(this.configuration);
            }
            else if (newMixerId === NullConnector_1.default.ID) {
                MixerClass = NullConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getNullConfiguration.bind(this.configuration);
            }
            else if (newMixerId === TestConnector_1.default.ID) {
                MixerClass = TestConnector_1.default;
                this.getCurrentMixerSettings = this.configuration.getTestConfiguration.bind(this.configuration);
            }
            else {
                console.error(`Someone(TM) forgot to implement the ${newMixerId} mixer in MixerDriver.js.`);
                return;
            }
            this.currentMixerId = newMixerId;
            this.currentMixerSettings = this.getCurrentMixerSettings ? this.getCurrentMixerSettings() : undefined;
            this.currentMixerInstance = new MixerClass(this.currentMixerSettings, this.communicator);
            const ret = (_a = this.currentMixerInstance) === null || _a === void 0 ? void 0 : _a.connect();
            await Promise.resolve(ret);
        }
        finally {
            this.isChangingMixer = false;
        }
    }
    getCurrentPrograms() {
        return this.communicator.getCurrentPrograms();
    }
    getCurrentPreviews() {
        return this.communicator.getCurrentPreviews();
    }
    isConnected() {
        return this.currentMixerInstance !== undefined && this.currentMixerInstance.isConnected();
    }
}
exports.MixerDriver = MixerDriver;
MixerDriver.getAllowedMixers = function (isDev, isTest) {
    let mixers = [
        MockConnector_1.default.ID,
        TestConnector_1.default.ID,
        NullConnector_1.default.ID,
        // --- order of the first items is important as they act as defaults ---
        AtemConnector_1.default.ID,
        ObsConnector_1.default.ID,
        RolandV8HDConnector_1.default.ID,
        RolandV60HDConnector_1.default.ID,
        VmixConnector_1.default.ID,
    ];
    if (!isDev) {
        mixers = mixers.filter(id => id !== MockConnector_1.default.ID);
    }
    if (!isTest) {
        mixers = mixers.filter(id => id !== TestConnector_1.default.ID);
    }
    return mixers;
};
MixerDriver.defaultChannels = Array(8).fill(null).map((_, i) => {
    return new Channel_1.default((i + 1).toString());
});

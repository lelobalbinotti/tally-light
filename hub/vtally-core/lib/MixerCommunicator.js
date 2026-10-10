"use strict";
/* helper so that video mixer connectors do not need to implement events */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixerCommunicator = void 0;
const Channel_1 = __importDefault(require("../domain/Channel"));
const haveValuesChanged = (lastArray, newArray) => {
    if (Array.isArray(lastArray) && Array.isArray(newArray)) {
        return lastArray.length !== newArray.length || lastArray.some((value, index) => value !== newArray[index]);
    }
    else {
        return lastArray !== newArray;
    }
};
class MixerCommunicator {
    constructor(configuration, emitter) {
        this.configuration = configuration;
        this.emitter = emitter;
        this.currentPrograms = null;
        this.currentPreviews = null;
        this.isConnected = null;
    }
    changeProgramsIfNecessary(programs) {
        programs = programs ? programs.map(v => v.toString()) : null;
        if (haveValuesChanged(programs, this.currentPrograms)) {
            this.currentPrograms = programs;
            return true;
        }
        else {
            return false;
        }
    }
    changePreviewsIfNecessary(previews) {
        previews = previews ? previews.map(v => v.toString()) : null;
        if (haveValuesChanged(previews, this.currentPreviews)) {
            this.currentPreviews = previews;
            return true;
        }
        else {
            return false;
        }
    }
    notifyProgramPreviewChanged(programs, previews) {
        const programChanged = this.changeProgramsIfNecessary(programs);
        const previewChanged = this.changePreviewsIfNecessary(previews);
        if (previewChanged || programChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews });
        }
    }
    notifyProgramChanged(programs) {
        const programChanged = this.changeProgramsIfNecessary(programs);
        if (programChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews });
        }
    }
    notifyPreviewChanged(previews) {
        const previewChanged = this.changePreviewsIfNecessary(previews);
        if (previewChanged) {
            this.emitter.emit('program.changed', { programs: this.currentPrograms, previews: this.currentPreviews });
        }
    }
    notifyChannelNames(count, names) {
        if (count === null) {
            this.notifyChannels(null);
        }
        else {
            // empty array with `count` elements.
            // `fill` is necessary, because Array() does not fill the array with anything - not even `undefined` ¯\_(ツ)_/¯
            const range = Array(count).fill(null);
            const channels = range.map((_, i) => {
                const name = names && names[i + 1];
                return new Channel_1.default((i + 1).toString(), name);
            });
            this.notifyChannels(channels);
        }
    }
    notifyChannels(channels) {
        channels = channels || [];
        if (JSON.stringify(channels.map(c => c.toJson())) !== JSON.stringify(this.configuration.getChannels().map(c => c.toJson()))) {
            this.configuration.setChannels(channels);
        }
    }
    notifyMixerIsConnected() {
        if (this.isConnected !== true) {
            this.isConnected = true;
            this.emitter.emit('mixer.connected');
        }
    }
    notifyMixerIsDisconnected() {
        if (this.isConnected !== false) {
            this.isConnected = false;
            this.emitter.emit('mixer.disconnected');
        }
    }
    getCurrentPrograms() {
        return this.currentPrograms;
    }
    getCurrentPreviews() {
        return this.currentPreviews;
    }
}
exports.MixerCommunicator = MixerCommunicator;

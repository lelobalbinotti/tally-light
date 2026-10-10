"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Channel_1 = __importDefault(require("../../domain/Channel"));
const interfaces_1 = require("../interfaces");
class MockConfiguration extends interfaces_1.Configuration {
    constructor() {
        super();
        this.channelCount = MockConfiguration.defaultChannelCount;
        this.channelNames = MockConfiguration.defaultChannelNames;
        this.tickTime = MockConfiguration.defaultTickTime;
    }
    loadStringArray(fieldName, setter, data) {
        const value = data[fieldName];
        const isStringArray = (data) => {
            if (!Array.isArray(data)) {
                return false;
            }
            return data.every(value => typeof value === "string");
        };
        if (value === undefined || value === null) {
            // value is not set
            return;
        }
        else if (typeof value === "string" || isStringArray(value)) {
            try {
                setter(value);
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
        this.loadNumber("channelCount", this.setChannelCount.bind(this), data);
        this.loadStringArray("channelNames", this.setChannelNames.bind(this), data);
        this.loadNumber("tickTime", this.setTickTime.bind(this), data);
    }
    toJson() {
        return {
            channelCount: this.channelCount,
            channelNames: this.channelNames,
            tickTime: this.tickTime
        };
    }
    clone() {
        const clone = new MockConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
    setTickTime(time) {
        let theTime;
        if (typeof time === "string") {
            time = parseInt(time, 10);
            if (!Number.isFinite(time)) {
                throw new Error(`Could not parse "${time}" into a number.`);
            }
        }
        if (typeof time === "number") {
            theTime = time;
        }
        else {
            theTime = MockConfiguration.defaultTickTime;
        }
        if (theTime <= 0) {
            throw new Error(`tickTime needs to be a positive number, but got ${theTime}`);
        }
        this.tickTime = theTime;
        return this;
    }
    getTickTime() {
        return this.tickTime;
    }
    setChannelCount(count) {
        if (typeof count === "string") {
            count = parseInt(count, 10);
            if (!Number.isFinite(count)) {
                throw new Error(`Could not parse "${count}" into a number.`);
            }
        }
        if (typeof count === "number") {
            if (count < 0) {
                throw new Error(`channel count needs to be a positive integer, but got ${count}`);
            }
            if (!Number.isInteger(count)) {
                throw new Error(`channel count needs to be an integer, but got ${count}`);
            }
            this.channelCount = count;
        }
        else if (count === null) {
            this.channelCount = MockConfiguration.defaultChannelCount;
        }
        return this;
    }
    setChannelNames(names) {
        if (typeof names === "string") {
            names = names.split(",");
        }
        else if (names === null) {
            names = MockConfiguration.defaultChannelNames;
        }
        this.channelNames = names.map(name => name.trim());
        return this;
    }
    getChannelNames() {
        const result = this.getChannels().filter(c => c.name).map(c => c.name);
        result.toString = () => result.join(", ");
        return result;
    }
    getChannelCount() {
        return this.channelCount;
    }
    getChannels() {
        return Array(this.channelCount).fill(null).map((_, i) => {
            return new Channel_1.default((i + 1).toString(), this.channelNames[i]);
        });
    }
}
MockConfiguration.defaultTickTime = 3000;
MockConfiguration.defaultChannelCount = 8;
MockConfiguration.defaultChannelNames = [];
exports.default = MockConfiguration;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
class TallySettingsIni {
    constructor(data = "") {
        this.lines = data.split("\n").reverse();
        if (this.lines[0] === '') {
            this.lines.shift();
        }
    }
    /**
     * returns the line number where this setting is in the current file
     *
     * @param name name of the setting
     */
    findSetting(name) {
        const matcher = new RegExp(`^${(0, escape_string_regexp_1.default)(name)}\\s*=`);
        const lineIdx = this.lines.findIndex(line => line.match(matcher));
        if (lineIdx !== -1) {
            return lineIdx;
        }
        else {
            return null;
        }
    }
    readSetting(name) {
        const lineIdx = this.findSetting(name);
        if (lineIdx !== null) {
            const line = this.lines[lineIdx];
            const idx = line.indexOf("=");
            const value = line.substr(idx + 1);
            return value;
        }
        else {
            return null;
        }
    }
    writeSetting(name, value) {
        const line = `${name}=${value}`;
        const lineIdx = this.findSetting(name);
        if (lineIdx !== null) {
            this.lines[lineIdx] = line;
        }
        else {
            this.lines.unshift(line);
        }
    }
    getStationSsid() {
        return this.readSetting("station.ssid");
    }
    setStationSsid(ssid) {
        this.writeSetting("station.ssid", ssid);
    }
    getStationPassword() {
        return this.readSetting("station.password");
    }
    setStationPassword(password) {
        this.writeSetting("station.password", password);
    }
    getHubIp() {
        return this.readSetting("hub.ip");
    }
    setHubIp(ip) {
        this.writeSetting("hub.ip", ip);
    }
    getHubPort() {
        const port = this.readSetting("hub.port");
        if (port !== null) {
            return parseInt(port, 10);
        }
        else {
            return null;
        }
    }
    setHubPort(port) {
        this.writeSetting("hub.port", port.toString());
    }
    getTallyName() {
        return this.readSetting("tally.name");
    }
    setTallyName(name) {
        this.writeSetting("tally.name", name);
    }
    toString() {
        const lines = Array.from(this.lines);
        lines.reverse();
        lines.push(''); // newline at end
        return lines.join("\n");
    }
    clone() {
        return new TallySettingsIni(this.toString());
    }
}
exports.default = TallySettingsIni;

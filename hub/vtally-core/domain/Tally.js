"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebTally = exports.UdpTally = exports.Tally = exports.ConnectionState = void 0;
const TallyConfiguration_1 = require("../tally/TallyConfiguration");
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["DISCONNECTED"] = 0] = "DISCONNECTED";
    ConnectionState[ConnectionState["CONNECTED"] = 1] = "CONNECTED";
    ConnectionState[ConnectionState["MISSING"] = 2] = "MISSING";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
class Tally {
    constructor(name, channelId) {
        this.highlight = false;
        this.logs = [];
        this.hasStageLight = true;
        this.name = name;
        this.channelId = channelId;
        this.configuration = new TallyConfiguration_1.TallyConfiguration();
    }
    isPatched() {
        return this.channelId !== undefined;
    }
    setHighlight(highlight) {
        this.highlight = highlight;
    }
    isHighlighted() {
        return this.highlight;
    }
    isWebTally() {
        return this.type === "web";
    }
    isUdpTally() {
        return this.type === "udp";
    }
    addLog(log) {
        this.logs.push(log);
        return log;
    }
    getLogs() {
        return this.logs;
    }
    getId() {
        return `${this.type}-${this.name}`;
    }
    isIn(channelNames = []) {
        if (channelNames === null)
            return false;
        if (this.channelId === undefined)
            return false;
        return channelNames.indexOf(this.channelId) !== -1;
    }
    setConfiguration(conf) {
        this.configuration = conf;
    }
    toJsonForSave() {
        return {
            name: this.name,
            type: this.type,
            channelId: this.channelId,
            ...this.configuration.toJson(),
        };
    }
    static fromJsonForSave(valueObject) {
        const tally = valueObject.type === "web" ?
            new WebTally(valueObject.name, valueObject.channelId) :
            // UdpTally was the previous default. So if no type is set we also expect an Udp Tally
            new UdpTally(valueObject.name, valueObject.channelId);
        const configuration = new TallyConfiguration_1.TallyConfiguration();
        configuration.fromJson(valueObject);
        tally.setConfiguration(configuration);
        return tally;
    }
    toJson() {
        return {
            name: this.name,
            type: this.type,
            channelId: this.channelId,
            ...this.configuration.toJson(),
        };
    }
    static fromJson(valueObject) {
        if (valueObject.type === "web") {
            return WebTally.fromJson(valueObject);
        }
        else {
            return UdpTally.fromJson(valueObject);
        }
    }
}
exports.Tally = Tally;
class UdpTally extends Tally {
    constructor(name, channelId, address, port, state = ConnectionState.DISCONNECTED) {
        super(name, channelId);
        this.type = "udp";
        this.address = address;
        this.port = port;
        this.state = state;
    }
    isConnected() {
        return this.address !== undefined && this.port !== undefined && this.state === ConnectionState.CONNECTED;
    }
    isDisconnected() {
        return !this.isActive();
    }
    isActive() {
        return this.address !== undefined && this.port !== undefined && this.state !== ConnectionState.DISCONNECTED;
    }
    isMissing() {
        return this.address !== undefined && this.port !== undefined && this.state === ConnectionState.MISSING;
    }
    toJson() {
        return {
            ...super.toJson(),
            address: this.address,
            port: this.port,
            state: this.state,
        };
    }
    static fromJson(valueObject) {
        const tally = new UdpTally(valueObject.name, valueObject.channelId, valueObject.address, valueObject.port, valueObject.state);
        tally.configuration.fromJson(valueObject);
        return tally;
    }
}
exports.UdpTally = UdpTally;
class WebTally extends Tally {
    constructor(name, channelId, connectedClients) {
        super(name, channelId);
        this.type = "web";
        this.connectedClients = connectedClients || [];
        this.hasStageLight = false;
    }
    isConnected() {
        return this.connectedClients.length > 0;
    }
    isDisconnected() {
        return !this.isConnected();
    }
    isActive() {
        return this.isConnected();
    }
    isMissing() {
        return false;
    }
    toJson() {
        return {
            ...super.toJson(),
            connectedClients: this.connectedClients
        };
    }
    static fromJson(valueObject) {
        const tally = new WebTally(valueObject.name, valueObject.channelId, valueObject.connectedClients);
        tally.configuration.fromJson(valueObject);
        return tally;
    }
}
exports.WebTally = WebTally;
exports.default = Tally;

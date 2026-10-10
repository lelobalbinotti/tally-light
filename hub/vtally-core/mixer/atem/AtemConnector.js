"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// atem-connection v2.0.0 is needed to monitor status of the connection
const atem_connection_1 = require("atem-connection");
const enums_1 = require("atem-connection/dist/enums");
const Channel_1 = __importDefault(require("../../domain/Channel"));
class AtemConnector {
    constructor(configuration, communicator) {
        this.configuration = configuration;
        this.communicator = communicator;
        this.isAtemConnected = false;
    }
    onStateChange() {
        var _a;
        if (this.myAtem) {
            const programs = this.myAtem.listVisibleInputs("program").sort().map(i => i.toString());
            const previews = this.myAtem.listVisibleInputs("preview").sort().map(i => i.toString());
            this.communicator.notifyProgramPreviewChanged(programs, previews);
            const channels = Object.values(((_a = this.myAtem.state) === null || _a === void 0 ? void 0 : _a.inputs) || {}).reduce((channels, input) => {
                if (input && input.internalPortType === enums_1.InternalPortType.External) {
                    channels.push(new Channel_1.default(input.inputId.toString(), input.longName));
                }
                return channels;
            }, []);
            this.communicator.notifyChannels(channels);
        }
    }
    connect() {
        this.myAtem = new atem_connection_1.Atem({
        // debug: true,
        });
        this.myAtem.on('info', console.log);
        this.myAtem.on('error', console.error);
        console.log(`Connecting to ATEM at ${this.configuration.getIp().toString()}:${this.configuration.getPort().toNumber()}`);
        this.myAtem.connect(this.configuration.getIp().toString(), this.configuration.getPort().toNumber());
        this.myAtem.on('connected', () => {
            this.isAtemConnected = true;
            console.log("Connected to ATEM");
            this.communicator.notifyMixerIsConnected();
            this.onStateChange();
        });
        this.myAtem.on('disconnected', () => {
            console.log(this.isAtemConnected ?
                "Lost connection to ATEM" :
                "Could not connect to ATEM. This could mean that the maximum number of devices are already connected to ATEM.");
            this.isAtemConnected = false;
            this.communicator.notifyMixerIsDisconnected();
        });
        this.myAtem.on('stateChanged', this.onStateChange.bind(this));
    }
    disconnect() {
        console.log("Cutting connection to Atem mixer.");
        this.isAtemConnected = false;
        this.communicator.notifyMixerIsDisconnected();
        if (this.myAtem) {
            this.myAtem.removeAllListeners("info");
            this.myAtem.removeAllListeners("error");
            this.myAtem.removeAllListeners("connected");
            this.myAtem.removeAllListeners("disconnected");
            this.myAtem.removeAllListeners("stateChanged");
            this.myAtem.destroy();
        }
    }
    isConnected() {
        // @TODO: is there an API function so that we do not need to track state?
        return this.isAtemConnected;
    }
}
AtemConnector.ID = "atem";
exports.default = AtemConnector;

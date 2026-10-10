"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
// @see https://static.roland.com/assets/media/pdf/V-60HD_smart_tally_eng02_W.pdf
class RolandV60HDConnector {
    constructor(configuration, communicator) {
        this.configuration = configuration;
        this.communicator = communicator;
        this.sourceConnections = [];
        this.connected = false;
        //input status array.
        // 0 = off
        // 1 = program
        // 2 = preview
        this.input_status = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    connect() {
        console.log(`Connecting to RolandV60HD at ${this.configuration.getIp().toString()}:${this.configuration.getPort().toString()}`);
        for (let i = 0; i < 8; i++) {
            this.sourceConnections[i] = setInterval(function () { this.checkRolandV60HDStatus(this.communicator, this.configuration.getIp().toString(), this.configuration.getPort().toString(), i + 1); }.bind(this), this.configuration.getRequestInterval());
        }
        this.connected = true;
        this.communicator.notifyMixerIsConnected();
    }
    checkRolandV60HDStatus(communicator, ip, port, address) {
        http_1.default.get(`http://${ip}:${port}/tally/${address.toString()}/status`, res => {
            res.setEncoding('utf8');
            res.on('data', data => this.processResponse(data, address));
        }).on('error', error => this.processResponseError(error));
    }
    processResponse(response, address) {
        // if we get response, reconnect mixer in hub
        if (!this.connected) {
            this.connected = true;
            this.communicator.notifyMixerIsConnected();
        }
        // RolandV60HD encodes tally states as words
        // unselected = off
        // onair = program
        // selected = preview
        switch (response) {
            case "onair":
                this.input_status[address - 1] = 1;
                //programs.push(`${address}`)
                break;
            case "selected":
                this.input_status[address - 1] = 2;
                //previews.push(`${address}`)
                break;
            case "unselected":
                this.input_status[address - 1] = 0;
                break;
            default:
                this.input_status[address - 1] = 0;
                break;
        }
        // Only Process Tally Information after full iteration
        if (address === 8) {
            this.processInputStatus(this.communicator);
        }
    }
    processResponseError(error) {
        // set mixer as disconnected
        console.log(`RolandV60HD Smart Tally Error: ${error}`);
        this.communicator.notifyMixerIsDisconnected();
        if (this.connected) {
            this.connected = false;
        }
    }
    processInputStatus(communicator) {
        let programs = [];
        let previews = [];
        // iterate through input status array
        for (let i = 0; i < 8; i++) {
            // process program
            if (this.input_status[i] === 1) {
                programs.push(`${i + 1}`);
            }
            // process preview
            if (this.input_status[i] === 2) {
                previews.push(`${i + 1}`);
            }
        }
        communicator.notifyProgramPreviewChanged(programs, previews);
    }
    disconnect() {
        //clean servers
        for (let i = 0; i < 8; i++) {
            clearInterval(this.sourceConnections[i]);
        }
        console.log(`RolandV60HD Smart Tally connection closed`);
        this.connected = false;
        this.communicator.notifyMixerIsDisconnected();
        return true;
    }
    isConnected() {
        return this.connected;
    }
}
RolandV60HDConnector.ID = "rolandV60HD";
exports.default = RolandV60HDConnector;

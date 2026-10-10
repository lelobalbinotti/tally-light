"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestConnector {
    constructor(configuration, communicator) {
        this.connected = false;
        this.communicator = communicator;
        this.configuration = configuration;
    }
    connect() {
        console.log("starting mock server");
        this.connected = true;
        this.communicator.notifyChannelNames(4);
        this.communicator.notifyProgramPreviewChanged(this.configuration.getPrograms(), this.configuration.getPreviews());
    }
    disconnect() {
        this.connected = false;
    }
    isConnected() {
        return this.connected;
    }
}
TestConnector.ID = "test";
exports.default = TestConnector;

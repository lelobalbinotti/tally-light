"use strict";
// a connector that does not do anything
Object.defineProperty(exports, "__esModule", { value: true });
class NullConnector {
    constructor(_, communicator) {
        this.communicator = communicator;
    }
    connect() {
        console.log("No video mixer connected.");
        this.communicator.notifyProgramPreviewChanged(null, null);
    }
    disconnect() { }
    isConnected() {
        // it is never supposed to be connected
        return false;
    }
}
NullConnector.ID = "null";
exports.default = NullConnector;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
// used for tests only
class DisconnectedClientSideSocket {
    constructor() {
        this.connected = false;
        this.clientEventEmitter = new events_1.EventEmitter();
        this.serverEventEmitter = new events_1.EventEmitter();
    }
    on(event, listener) {
        this.clientEventEmitter.on(event, listener);
        return this;
    }
    off(event, listener) {
        this.clientEventEmitter.off(event, listener);
        return this;
    }
    emit(event, ...args) {
        this.serverEventEmitter.emit(event, ...args);
        return this;
    }
    emitServerEvent(event, ...args) {
        return this.clientEventEmitter.emit(event, ...args);
    }
    onServerEvent(event, listener) {
        this.serverEventEmitter.on(event, listener);
    }
    cleanUp() {
        this.serverEventEmitter.removeAllListeners();
    }
}
exports.default = DisconnectedClientSideSocket;

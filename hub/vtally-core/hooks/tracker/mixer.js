"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class MixerTracker extends events_1.EventEmitter {
    constructor(socket) {
        super();
        this.connectionState = null;
        socket.on('mixer.state', ({ isConnected }) => {
            this.connectionState = isConnected;
            this.emit('connection', this.connectionState);
        });
        socket.emit('events.mixer.subscribe');
    }
}
exports.default = MixerTracker;

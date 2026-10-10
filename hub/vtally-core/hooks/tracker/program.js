"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class ProgramTracker extends events_1.EventEmitter {
    constructor(socket, socketEventEmitter) {
        super();
        this.programs = null;
        this.previews = null;
        socket.on('program.state', ({ programs, previews }) => {
            this.programs = programs;
            this.previews = previews;
            this.emit('program', this.programs, this.previews);
        });
        socket.emit('events.program.subscribe');
        socketEventEmitter.on("connected", () => {
            socket.emit('events.program.subscribe');
        });
    }
}
exports.default = ProgramTracker;

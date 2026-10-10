"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Tally_1 = __importDefault(require("../../domain/Tally"));
class TallyTracker extends events_1.EventEmitter {
    constructor(socket, socketEventEmitter) {
        super();
        this.tallies = null;
        socket.on('tally.state', ({ tallies }) => {
            this.tallies = tallies.map(tally => Tally_1.default.fromJson(tally));
            this.emit('tallies', this.tallies);
        });
        socket.emit('events.tally.subscribe');
        socketEventEmitter.on("connected", () => {
            socket.emit('events.tally.subscribe');
        });
    }
}
exports.default = TallyTracker;

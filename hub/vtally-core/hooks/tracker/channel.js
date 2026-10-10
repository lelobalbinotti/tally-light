"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Channel_1 = __importDefault(require("../../domain/Channel"));
class ChannelTracker extends events_1.EventEmitter {
    constructor(socket, socketEventEmitter) {
        super();
        this.channels = undefined;
        socket.on('channel.state', ({ channels }) => {
            this.channels = channels.map(channel => Channel_1.default.fromJson(channel));
            this.emit('channels', this.channels);
        });
        socket.emit('events.channel.subscribe');
        socketEventEmitter.on("connected", () => {
            socket.emit('events.channel.subscribe');
        });
    }
}
exports.default = ChannelTracker;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Log_1 = __importDefault(require("../../domain/Log"));
class TallyLogTracker extends events_1.EventEmitter {
    constructor(socket, socketEventEmitter) {
        super();
        this.logs = null;
        socket.on('tally.log.state', (data) => {
            this.logs = new Map(data.map(({ tallyId, logs }) => {
                return [
                    tallyId,
                    logs.map(log => Log_1.default.fromJson(log))
                ];
            }));
            this.logs.forEach((logs, tallyName) => {
                this.emit(`log.${tallyName}`, logs);
            });
        });
        socket.on('tally.log', ({ tallyId, log }) => {
            if (!this.logs) {
                console.warn("Disregarding logs, because did not receive the initial logs yet.");
                return;
            }
            const theLog = Log_1.default.fromJson(log);
            const entry = this.logs.get(tallyId);
            if (!entry) {
                console.warn(`Logs for ${tallyId} might be incomplete.`);
                this.logs.set(tallyId, [theLog]);
            }
            else {
                entry.push(theLog);
                this.logs.set(tallyId, entry);
            }
            this.emit(`log.${tallyId}`, this.logs.get(tallyId));
        });
        socket.emit('events.tallyLog.subscribe');
        socketEventEmitter.on("connected", () => {
            socket.emit('events.tallyLog.subscribe');
        });
    }
}
exports.default = TallyLogTracker;

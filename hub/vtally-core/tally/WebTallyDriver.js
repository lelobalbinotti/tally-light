"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandCreator_1 = __importDefault(require("./CommandCreator"));
const Log_1 = __importStar(require("../domain/Log"));
// - handles connections with Web Tallies
// - emits signals when tallies connect or disconnect
// - sends current state to Web Tallies
class WebTallyDriver {
    constructor(configuration, container) {
        this.sockets = new Map();
        this.configuration = configuration;
        this.container = container;
        this.container.addWebTallyDriver(this);
        // @TODO: check if sockets disconnected
    }
    updateTallyState(tally, lastPrograms, lastPreviews) {
        const name = tally.name;
        const command = CommandCreator_1.default.getState(tally, lastPrograms, lastPreviews);
        const sockets = this.sockets.get(name) || [];
        sockets.forEach(socket => {
            if (socket.connected) {
                socket.emit('webTally.state', {
                    tally: tally.toJson(),
                    command: command,
                });
            }
        });
    }
    updateTallyConnections(tally) {
        const connections = (this.sockets.get(tally.name) || []).map((socket) => {
            const address = socket.handshake.address;
            return { address: address };
        });
        tally.connectedClients = connections;
        this.container.update(tally);
    }
    create(tallyName, channelId) {
        const tally = this.container.getOrCreate(tallyName, "web");
        tally.name = tallyName;
        tally.channelId = channelId || undefined;
        this.container.update(tally);
    }
    unsubscribe(tallyName, socket) {
        const oldSockets = this.sockets.get(tallyName) || [];
        const newSockets = oldSockets.filter(knownSocket => knownSocket.id !== socket.id);
        if (oldSockets.length !== newSockets.length) {
            console.debug(`Disconnected ${tallyName} from ${socket.id}`);
            this.sockets.set(tallyName, newSockets);
            const tally = this.container.get(tallyName, "web");
            if (tally) {
                this.updateTallyConnections(tally);
                let logLine = `A browser disconnected from ${socket.handshake.address}. `;
                if (tally.connectedClients.length === 0) {
                    logLine += "The Tally is disconnected.";
                }
                else if (tally.connectedClients.length === 1) {
                    logLine += `There is still one client connected from ${tally.connectedClients[0].address}.`;
                }
                else {
                    logLine += `There are still ${tally.connectedClients.length} clients connected from ${tally.connectedClients.map(client => client.address).join(',')}.`;
                }
                this.container.addLog(tallyName, 'web', new Log_1.default(new Date(), Log_1.Severity.STATUS, logLine));
            }
        }
    }
    subscribe(tallyName, socket) {
        const sockets = this.sockets.get(tallyName) || [];
        if (sockets.find(knownSocket => knownSocket.id === socket.id)) {
            console.warn(`socket ${socket.id} is alreday subscribed to ${tallyName}`);
            return;
        }
        socket.on('disconnect', () => {
            this.unsubscribe(tallyName, socket);
        });
        const tally = this.container.get(tallyName, "web");
        if (tally) {
            console.debug(`Connected ${tallyName} from ${socket.id}`);
            this.sockets.set(tallyName, [...sockets, socket]);
            this.updateTallyConnections(tally);
            this.container.addLog(tallyName, 'web', new Log_1.default(new Date(), Log_1.Severity.STATUS, `A new browser connected from ${socket.handshake.address}.`));
        }
        else {
            console.error(`can not subscribe to unknown web tally "${tallyName}"`);
            socket.emit('webTally.invalid', tallyName);
        }
    }
}
exports.default = WebTallyDriver;

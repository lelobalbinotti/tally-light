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
const Tally_1 = require("../domain/Tally");
const dgram_1 = __importDefault(require("dgram"));
const CommandParser_1 = __importStar(require("./CommandParser"));
const CommandCreator_1 = __importDefault(require("./CommandCreator"));
const Log_1 = __importStar(require("../domain/Log"));
// - handles connections with Tallies.
// - emits signals when tallies connect, go missing or disconnect
class UdpTallyDriver {
    constructor(configuration, container) {
        this.lastTallyReport = new Map();
        this.configuration = configuration;
        this.container = container;
        this.container.addUdpTallyDriver(this);
        this.io = dgram_1.default.createSocket('udp4');
        this.io.on('error', (err) => {
            console.log(`server error: ${err.stack}`);
            this.io.close();
        });
        this.io.on('message', (msg, rinfo) => {
            try {
                const command = CommandParser_1.default.parse(msg.toString().trim());
                if (command.command === "tally-ho") {
                    const { tallyName } = command;
                    this.tallyReported(tallyName, rinfo);
                }
                else if (command.command === "log") {
                    const { tallyName, log } = command;
                    this.tallyReported(tallyName, rinfo);
                    this.container.addLog(tallyName, "udp", log);
                }
                else {
                    // typescript should complain if we missed a command
                    ((_) => { })(command);
                }
            }
            catch (e) {
                if (e instanceof CommandParser_1.InvalidCommandError) {
                    console.warn(e.message);
                }
                else {
                    throw e;
                }
            }
        });
        this.io.on('listening', () => {
            const address = this.io.address();
            console.log(`Listening for Tallies on ${address.address}:${address.port}`);
        });
        this.io.bind(this.configuration.getTallyPort());
        // check that all tallies are still reporting regularily
        setInterval(() => {
            const now = new Date();
            this.container.getUdpTallies().forEach(tally => {
                const lastTallyReportDate = this.lastTallyReport.get(tally.name);
                if (!lastTallyReportDate) {
                    tally.state = Tally_1.ConnectionState.DISCONNECTED;
                }
                else {
                    const diff = now.getTime() - lastTallyReportDate.getTime(); // milliseconds
                    if (diff > this.configuration.getTallyTimeoutDisconnected()) {
                        if (tally.state !== Tally_1.ConnectionState.DISCONNECTED) {
                            tally.state = Tally_1.ConnectionState.DISCONNECTED;
                            this.container.update(tally);
                            this.container.addLog(tally.name, "udp", new Log_1.default(new Date(), Log_1.Severity.STATUS, `Tally got disconnected after not reporting for ${diff}ms`));
                        }
                    }
                    else if (diff > this.configuration.getTallyTimeoutMissing()) {
                        if (tally.state !== Tally_1.ConnectionState.MISSING) {
                            tally.state = Tally_1.ConnectionState.MISSING;
                            this.container.update(tally);
                            this.container.addLog(tally.name, "udp", new Log_1.default(new Date(), Log_1.Severity.STATUS, `Tally got missing. It has not reported for ${diff}ms`));
                        }
                    }
                }
            });
        }, 500);
        // send keep-alive messages
        // - show the tally, we are still here
        // - compensate for lost packages
        setInterval(() => {
            this.container.getUdpTallies().forEach(tally => {
                this.updateTallyState(tally, this.container.lastPrograms, this.container.lastPreviews);
            });
        }, 1000 / this.configuration.getTallyKeepAlivesPerSecond());
    }
    tallyReported(tallyName, rinfo) {
        this.lastTallyReport.set(tallyName, new Date());
        let tally = this.container.getOrCreate(tallyName, "udp");
        const oldState = tally.state;
        const oldAddress = tally.address;
        const oldPort = tally.port;
        tally.state = Tally_1.ConnectionState.CONNECTED;
        tally.address = rinfo.address;
        tally.port = rinfo.port;
        if (oldState !== tally.state || oldAddress !== tally.address || oldPort !== tally.port) {
            this.container.update(tally);
        }
        return tally;
    }
    updateTallyState(tally, programs, previews) {
        if (tally.isActive()) {
            const command = CommandCreator_1.default.createStateCommand(tally, programs, previews, this.configuration.getTallyConfiguration());
            this.io.send(command, tally.port, tally.address);
        }
    }
}
exports.default = UdpTallyDriver;

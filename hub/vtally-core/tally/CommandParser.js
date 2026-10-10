"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCommandError = void 0;
const Log_1 = __importDefault(require("../domain/Log"));
class InvalidCommandError extends Error {
    constructor(...args) {
        super(...args);
        this.message = `Received an invalid command: "${this.message}"`;
    }
}
exports.InvalidCommandError = InvalidCommandError;
class TallyCommandParser {
    constructor() {
        this.parseTallyHo = function (cmd) {
            const result = cmd.match(/^([^ ]+) "(.+)"/);
            if (result === null) {
                throw new InvalidCommandError(cmd);
            }
            else {
                const [_, command, tallyName] = result;
                if (command !== "tally-ho") {
                    throw new InvalidCommandError(command);
                }
                return { command, tallyName };
            }
        };
        this.parseLog = function (cmd) {
            const result = cmd.match(/^([^ ]+) "(.+)" ([^ ]+) "(.*)"/);
            if (result === null) {
                throw new InvalidCommandError(cmd);
            }
            else {
                const [_, command, tallyName, uncleanSeverity, message] = result;
                if (command !== "log") {
                    throw new InvalidCommandError(command);
                }
                const severity = (() => {
                    if (uncleanSeverity === "INFO" || uncleanSeverity === "WARN" || uncleanSeverity === "ERROR") {
                        return uncleanSeverity;
                    }
                    else {
                        console.log(`Invalid severity "${uncleanSeverity}". Using ERROR instead.`);
                        return "ERROR";
                    }
                })();
                const log = new Log_1.default(new Date(), severity, message);
                return { command, tallyName, log };
            }
        };
    }
    parse(msg) {
        if (msg.startsWith("tally-ho ")) {
            return this.parseTallyHo(msg);
        }
        else if (msg.startsWith("log ")) {
            return this.parseLog(msg);
        }
        else {
            throw new InvalidCommandError(msg);
        }
    }
}
exports.default = new TallyCommandParser();

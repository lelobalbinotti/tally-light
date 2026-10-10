"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useSocket_1 = require("./useSocket");
const tallylog_1 = __importDefault(require("./tracker/tallylog"));
const tallyLogTracker = new tallylog_1.default(useSocket_1.socket, useSocket_1.socketEventEmitter);
function useTallyLog(tallyId) {
    var _a;
    const [logs, setLogs] = (0, react_1.useState)((_a = tallyLogTracker.logs) === null || _a === void 0 ? void 0 : _a.get(tallyId));
    (0, react_1.useEffect)(() => {
        const onChange = (logs) => {
            setLogs(Array.from(logs)); // needs a copy or refresh of component won't trigger
        };
        tallyLogTracker.on(`log.${tallyId}`, onChange);
        return () => {
            // cleanup
            tallyLogTracker.off(`log.${tallyId}`, onChange);
        };
    }, [tallyId]);
    return logs;
}
exports.default = useTallyLog;

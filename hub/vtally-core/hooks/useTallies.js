"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useSocket_1 = require("./useSocket");
const tally_1 = __importDefault(require("./tracker/tally"));
const tallyTracker = new tally_1.default(useSocket_1.socket, useSocket_1.socketEventEmitter);
function useTallies() {
    const [tallies, setTallies] = (0, react_1.useState)(tallyTracker.tallies);
    (0, react_1.useEffect)(() => {
        const onChange = (tallies) => {
            setTallies(Array.from(tallies));
        };
        tallyTracker.on("tallies", onChange);
        return () => {
            // cleanup
            tallyTracker.off("tallies", onChange);
        };
    }, []);
    return tallies;
}
exports.default = useTallies;

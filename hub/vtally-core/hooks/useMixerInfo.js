"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useSocket_1 = require("./useSocket");
const mixer_1 = __importDefault(require("./tracker/mixer"));
const mixerTracker = new mixer_1.default(useSocket_1.socket);
// the hook
function useMixerInfo() {
    const [isMixerConnected, setIsMixerConnected] = (0, react_1.useState)(mixerTracker.connectionState);
    (0, react_1.useEffect)(() => {
        const onConnectionChange = (isConnected) => {
            setIsMixerConnected(isConnected);
        };
        mixerTracker.on("connection", onConnectionChange);
        return () => {
            // cleanup
            mixerTracker.off("connection", onConnectionChange);
        };
    }, []);
    return isMixerConnected;
}
exports.default = useMixerInfo;

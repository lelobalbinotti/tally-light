"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useSocket_1 = require("./useSocket");
const channel_1 = __importDefault(require("./tracker/channel"));
const channelTracker = new channel_1.default(useSocket_1.socket, useSocket_1.socketEventEmitter);
function useChannels() {
    const [channels, setChannels] = (0, react_1.useState)(channelTracker.channels);
    const onChange = (tallies) => {
        setChannels(tallies);
    };
    (0, react_1.useEffect)(() => {
        channelTracker.on("channels", onChange);
        return () => {
            // cleanup
            channelTracker.off("channels", onChange);
        };
    }, []);
    return channels;
}
exports.default = useChannels;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useSocket_1 = require("./useSocket");
function useSocketInfo() {
    const [isHubConnected, setIsHubConnected] = (0, react_1.useState)(useSocket_1.socket.connected);
    const onConnection = () => {
        setIsHubConnected(true);
    };
    const onDisconnection = () => {
        setIsHubConnected(false);
    };
    (0, react_1.useEffect)(() => {
        useSocket_1.socketEventEmitter.on("connected", onConnection);
        useSocket_1.socketEventEmitter.on("disconnected", onDisconnection);
        return () => {
            // cleanup
            useSocket_1.socketEventEmitter.off("connected", onConnection);
            useSocket_1.socketEventEmitter.off("disconnected", onDisconnection);
        };
    }, []);
    return isHubConnected;
}
exports.default = useSocketInfo;

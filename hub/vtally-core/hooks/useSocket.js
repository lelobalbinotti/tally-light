"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = exports.socketEventEmitter = exports.useSocket = void 0;
const react_1 = require("react");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const events_1 = require("events");
const DisconnectedClientSideSocket_1 = __importDefault(require("../lib/DisconnectedClientSideSocket"));
// @TODO: remove socket event emitter. It does not have any purpose apart from announcing connection and disconnection
const socketEventEmitter = new events_1.EventEmitter();
exports.socketEventEmitter = socketEventEmitter;
const isTestEnvironment = process.env.JEST_WORKER_ID !== undefined;
const socket = isTestEnvironment ? new DisconnectedClientSideSocket_1.default() : (0, socket_io_client_1.default)();
exports.socket = socket;
const onConnection = function () {
    socketEventEmitter.emit("connected");
};
const onDisconnection = function () {
    socketEventEmitter.emit("disconnected");
};
if (typeof window !== 'undefined') {
    // on client only
    socket.on("connect", onConnection);
    socket.on("connect_error", onDisconnection);
    socket.on("connect_timeout", onDisconnection);
    socket.on("disconnected", onDisconnection);
    socket.on("reconnect", onDisconnection);
    socket.on("reconnecting", onDisconnection);
    socket.on("reconnect_error", onDisconnection);
    socket.on("reconnect_failed", onDisconnection);
}
/** @deprecated */
const useSocket = function (eventName, cb) {
    (0, react_1.useEffect)(() => {
        //@ts-ignore
        socket.on(eventName, cb);
        return function useSocketCleanup() {
            // @ts-ignore
            socket.off(eventName, cb);
        };
    }, [eventName, cb]);
    return socket;
};
exports.useSocket = useSocket;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useSocket_1 = require("./useSocket");
const program_1 = __importDefault(require("./tracker/program"));
const programTracker = new program_1.default(useSocket_1.socket, useSocket_1.socketEventEmitter);
// the hook
function useProgramPreview() {
    const [programs, setPrograms] = (0, react_1.useState)(programTracker.programs);
    const [previews, setPreviews] = (0, react_1.useState)(programTracker.previews);
    (0, react_1.useEffect)(() => {
        const onChange = (programs, previews) => {
            setPrograms(programs);
            setPreviews(previews);
        };
        programTracker.on("program", onChange);
        return () => {
            // cleanup
            programTracker.off("program", onChange);
        };
    }, []);
    return [programs, previews];
}
exports.default = useProgramPreview;

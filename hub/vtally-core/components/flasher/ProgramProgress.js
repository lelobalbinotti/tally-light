"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const StepDisplay_1 = __importDefault(require("./StepDisplay"));
function getSteps(progress) {
    const steps = [
        {
            id: "initialize",
            label: "Initializing",
            done: progress === null || progress === void 0 ? void 0 : progress.inititalizeDone,
        },
        {
            id: "connection",
            label: "Establishing connection",
            done: progress === null || progress === void 0 ? void 0 : progress.connectionDone,
        },
        {
            id: "upload",
            label: "Uploading files",
            current: progress === null || progress === void 0 ? void 0 : progress.filesUploaded,
            max: progress.filesTotal,
            done: progress.filesTotal === progress.filesUploaded,
        },
        {
            id: "reboot",
            label: "Rebooting Tally to apply settings",
            done: progress === null || progress === void 0 ? void 0 : progress.rebootDone,
        },
        {
            id: "done",
            label: "Upload Done",
            done: progress === null || progress === void 0 ? void 0 : progress.allDone,
        },
    ];
    let lastDone = true;
    let hadError = false;
    for (const step of steps) {
        step.active = lastDone && step.done === false;
        step.error = step.active && (progress === null || progress === void 0 ? void 0 : progress.error);
        step.skipped = hadError;
        if (!hadError) {
            // first step that errored
            hadError = true;
        }
        lastDone = step.done;
    }
    return steps;
}
function ProgramProgress({ progress }) {
    const steps = getSteps(progress);
    return (0, jsx_runtime_1.jsx)(StepDisplay_1.default, { steps: steps }, void 0);
}
exports.default = ProgramProgress;

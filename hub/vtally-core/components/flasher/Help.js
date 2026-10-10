"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const lab_1 = require("@material-ui/lab");
const ExternalLink_1 = __importDefault(require("../ExternalLink"));
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        warning: {
            marginBottom: theme.spacing(2),
        },
        info: {
            marginBottom: theme.spacing(2),
            "& a": {
                color: theme.palette.info.main,
            }
        }
    };
});
function Help({ tallyDevice, onReload }) {
    const classes = useStyles();
    if (tallyDevice.path === undefined) {
        const isLocalhost = (() => {
            const hostName = window.location.hostname;
            return hostName === "127.0.0.1" || hostName === "localhost" || hostName === "[::1]";
        });
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lab_1.Alert, { className: classes.warning, severity: "warning", action: (0, jsx_runtime_1.jsx)(core_1.Button, { color: "inherit", size: "small", onClick: () => onReload(), children: "Try again" }, void 0), children: "Did not find any connected device." }, void 0), (0, jsx_runtime_1.jsxs)(lab_1.Alert, { variant: "outlined", className: classes.info, severity: "info", children: [(0, jsx_runtime_1.jsx)(lab_1.AlertTitle, { children: "Possible fixes" }, void 0), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsx)("li", { children: "Plug the Tally to the computer that runs the hub via USB." }, void 0), !isLocalhost() && (0, jsx_runtime_1.jsxs)("li", { children: ["The Tally has to be connected to the computer that ", (0, jsx_runtime_1.jsx)("em", { children: "runs" }, void 0), " the hub. It does not work on ", (0, jsx_runtime_1.jsx)("em", { children: "remote machines" }, void 0), "."] }, void 0), (0, jsx_runtime_1.jsxs)("li", { children: ["Some USB cables can just be used for charging. Make sure you use an ", (0, jsx_runtime_1.jsx)("em", { children: "USB data cable" }, void 0), "."] }, void 0), (0, jsx_runtime_1.jsxs)("li", { children: ["If this has never worked from this computer ever, you might be missing the correct ", (0, jsx_runtime_1.jsx)(ExternalLink_1.default, { href: "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers", children: "USB drivers" }, void 0), "."] }, void 0)] }, void 0)] }, void 0)] }, void 0);
    }
    else if (tallyDevice.nodeMcuVersion === undefined) {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lab_1.Alert, { className: classes.warning, severity: "warning", action: (0, jsx_runtime_1.jsx)(core_1.Button, { color: "inherit", size: "small", onClick: () => onReload(), children: "Try again" }, void 0), children: "Device was found, but could not determine if LUA is running." }, void 0), (0, jsx_runtime_1.jsxs)(lab_1.Alert, { variant: "outlined", className: classes.info, severity: "info", children: [(0, jsx_runtime_1.jsx)(lab_1.AlertTitle, { children: "Possible fixes" }, void 0), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsx)("li", { children: "This happens sporadically. It could be fixed by trying again." }, void 0), (0, jsx_runtime_1.jsx)("li", { children: "Make sure a firmware is flashed. For example with esptool." }, void 0), (0, jsx_runtime_1.jsx)("li", { children: "Sometimes fault code on the Tally makes the firmware crash. Pushing the reset button might help." }, void 0)] }, void 0)] }, void 0)] }, void 0);
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {}, void 0);
}
exports.default = Help;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useSocketInfo_1 = __importDefault(require("../hooks/useSocketInfo"));
const useMixerInfo_1 = __importDefault(require("../hooks/useMixerInfo"));
const Layout_1 = __importDefault(require("../components/layout/Layout"));
const Tally_1 = __importDefault(require("../domain/Tally"));
const useTallies_1 = __importDefault(require("../hooks/useTallies"));
const Tally_2 = __importDefault(require("../components/Tally"));
const core_1 = require("@material-ui/core");
const DesktopWindows_1 = __importDefault(require("@material-ui/icons/DesktopWindows"));
const Wifi_1 = __importDefault(require("@material-ui/icons/Wifi"));
const Dns_1 = __importDefault(require("@material-ui/icons/Dns"));
const lab_1 = require("@material-ui/lab");
const TallyCreate_1 = __importDefault(require("../components/TallyCreate"));
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        buttons: {
            display: "block",
            marginBottom: theme.spacing(2),
        },
        button: {
            textTransform: "none",
        },
        buttonIcon: {
            marginRight: theme.spacing(1)
        },
        alert: {
            marginBottom: theme.spacing(2)
        },
    };
});
const countConnectedTallies = tallies => {
    if (!tallies) {
        return null;
    }
    return tallies.reduce((count, tally) => count + (Tally_1.default.fromJson(tally).isConnected() ? 1 : 0), 0);
};
const createTallyList = (tallies, showDisconnected, showUnpatched) => {
    if (!tallies) {
        return null;
    }
    return tallies.filter(tally => (tally.isActive() || showDisconnected) && (tally.isPatched() || showUnpatched)).sort((one, two) => {
        if (one.isActive() !== two.isActive()) {
            return one.isActive() ? -1 : 1;
        }
        else {
            return one.name.localeCompare(two.name);
        }
    });
};
const IndexPage = () => {
    const rawTallies = (0, useTallies_1.default)();
    const [showDisconnected, setShowDisconnected] = (0, react_1.useState)(true);
    const [showUnpatched, setShowUnpatched] = (0, react_1.useState)(true);
    const isMixerConnected = (0, useMixerInfo_1.default)();
    const isHubConnected = (0, useSocketInfo_1.default)();
    const classes = useStyles();
    const tallies = createTallyList(rawTallies, showDisconnected, showUnpatched);
    const toggleDisconnected = e => {
        setShowDisconnected(!showDisconnected);
    };
    const toggleUnpatched = e => {
        setShowUnpatched(!showUnpatched);
    };
    const nrConnectedTallies = countConnectedTallies(tallies);
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { testId: "index", children: [(0, jsx_runtime_1.jsx)("div", { className: classes.buttons, children: (0, jsx_runtime_1.jsxs)(core_1.ButtonGroup, { size: "small", variant: "contained", children: [(0, jsx_runtime_1.jsx)(core_1.Button, { "data-testid": "toggle-disconnected", className: classes.button, color: showDisconnected ? "primary" : "default", onClick: toggleDisconnected, children: "Show Disconnected" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Button, { "data-testid": "toggle-unpatched", className: classes.button, color: showUnpatched ? "primary" : "default", onClick: toggleUnpatched, children: "Show Unpatched" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { title: "Hub " + (isHubConnected ? "connected" : "disconnected"), children: (0, jsx_runtime_1.jsxs)(core_1.Button, { "data-testid": "hub-connected", className: classes.button, color: "default", variant: "outlined", children: [(0, jsx_runtime_1.jsx)(DesktopWindows_1.default, { className: classes.buttonIcon }, void 0), " ", isHubConnected ? 1 : 0] }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { title: "Video Mixer " + (isMixerConnected ? "connected" : "disconnected"), children: (0, jsx_runtime_1.jsxs)(core_1.Button, { "data-testid": "mixer-connected", className: classes.button, color: "default", variant: "outlined", children: [(0, jsx_runtime_1.jsx)(Dns_1.default, { className: classes.buttonIcon }, void 0), " ", isMixerConnected ? 1 : 0] }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { title: nrConnectedTallies + " connected tallies", children: (0, jsx_runtime_1.jsxs)(core_1.Button, { "data-testid": "tallies-connected", className: classes.button, color: "default", variant: "outlined", children: [(0, jsx_runtime_1.jsx)(Wifi_1.default, { className: classes.buttonIcon }, void 0), " ", nrConnectedTallies === null ? "?" : nrConnectedTallies] }, void 0) }, void 0)] }, void 0) }, void 0), isHubConnected ? "" : ((0, jsx_runtime_1.jsxs)(lab_1.Alert, { severity: "error", className: classes.alert, children: [(0, jsx_runtime_1.jsx)(lab_1.AlertTitle, { children: "Hub disconnected" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, children: "The displayed information might be outdated." }, void 0), (0, jsx_runtime_1.jsx)(core_1.Typography, { children: "We will try to reconnect automatically, but you might also try to reload the page." }, void 0)] }, void 0)), (0, jsx_runtime_1.jsx)(core_1.Box, { display: "flex", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "stretch", alignContent: "flex-start", children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [tallies ? tallies.map(tally => (0, jsx_runtime_1.jsx)(Tally_2.default, { tally: tally }, tally.name)) : "" /* @TODO: loading */, (0, jsx_runtime_1.jsx)(TallyCreate_1.default, {}, void 0)] }, void 0) }, void 0)] }, void 0));
};
exports.default = IndexPage;

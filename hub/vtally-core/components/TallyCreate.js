"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const lab_1 = require("@material-ui/lab");
const react_1 = require("react");
const useChannels_1 = __importDefault(require("../hooks/useChannels"));
const useSocket_1 = require("../hooks/useSocket");
const useTallies_1 = __importDefault(require("../hooks/useTallies"));
const ChannelSelector_1 = __importDefault(require("./ChannelSelector"));
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        root: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "dashed 1px " + theme.palette.grey[700],
            width: "250px",
            margin: theme.spacing(1),
            padding: theme.spacing(2),
            overflow: "hidden",
            background: "transparent",
        },
        alert: {
            marginBottom: theme.spacing(2),
        },
        formWrapper: {
            margin: "0 auto",
            maxWidth: "250px",
        },
        mb: {
            marginBottom: theme.spacing(2),
        }
    };
});
const createTally = function (tallyName, channelId) {
    useSocket_1.socket.emit('tally.create', tallyName, channelId || undefined);
};
const maxLength = 26; // same as "tally.name" in tally
function TallyCreatePopup({ classes, open, onClose }) {
    const channels = (0, useChannels_1.default)();
    const tallies = (0, useTallies_1.default)();
    const [channelId, setChannelId] = (0, react_1.useState)(undefined);
    const [name, setName] = (0, react_1.useState)("");
    const hasUdpTally = !!(tallies === null || tallies === void 0 ? void 0 : tallies.find(tally => tally.isUdpTally()));
    let errorMessage = "";
    if (name === "") {
        errorMessage = "Please enter a name";
    }
    else if (name.length > maxLength) {
        errorMessage = `name must not be longer than ${maxLength} characters`;
    }
    else if (tallies === null || tallies === void 0 ? void 0 : tallies.find(tally => tally.name === name)) {
        errorMessage = `a tally with the name ${name} already exists`;
    }
    function handleCreate() {
        console.log(channelId);
        createTally(name, channelId);
        onClose();
    }
    return ((0, jsx_runtime_1.jsxs)(core_1.Dialog, { "data-testid": "tally-create-popup", maxWidth: "xs", open: open, onClose: onClose, children: [(0, jsx_runtime_1.jsx)(core_1.DialogTitle, { children: "Create Web Tally" }, void 0), (0, jsx_runtime_1.jsxs)(core_1.DialogContent, { children: [!hasUdpTally ? ((0, jsx_runtime_1.jsx)(lab_1.Alert, { className: classes.alert, severity: "warning", variant: "outlined", "data-testid": "tally-create-warning", children: "Hardware-Tallies, based on ESP8266, will automatically register and should not be created via this form." }, void 0)) : "", (0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, children: "A Web Tally, that can be viewed in any browser." }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: classes.formWrapper, children: [(0, jsx_runtime_1.jsx)(core_1.TextField, { className: classes.mb, "data-testid": "tally-create-name", label: "Name", value: name, onChange: (e) => setName(e.target.value), autoFocus: true }, void 0), (0, jsx_runtime_1.jsx)(ChannelSelector_1.default, { value: channelId, channels: channels, onChange: setChannelId }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)(core_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(core_1.Button, { onClick: onClose, color: "default", "data-testid": "tally-create-cancel", children: "Cancel" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { title: errorMessage, children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(core_1.Button, { disabled: !!errorMessage, color: "primary", variant: "contained", "data-testid": "tally-create-ok", onClick: handleCreate, children: "Create" }, void 0) }, void 0) }, void 0)] }, void 0)] }, void 0)] }, void 0));
}
function TallyCreate() {
    const classes = useStyles();
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsxs)(core_1.Paper, { variant: "outlined", className: classes.root, children: [(0, jsx_runtime_1.jsx)(core_1.Button, { onClick: () => setModalOpen(true), "data-testid": `tally-create`, children: "Create Web Tally" }, void 0), (0, jsx_runtime_1.jsx)(TallyCreatePopup, { open: modalOpen, onClose: () => setModalOpen(false), classes: classes }, void 0)] }, void 0));
}
exports.default = TallyCreate;

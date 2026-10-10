"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ChannelSelector_1 = __importDefault(require("../components/ChannelSelector"));
const useChannels_1 = __importDefault(require("../hooks/useChannels"));
const useProgramPreview_1 = __importDefault(require("../hooks/useProgramPreview"));
const useSocket_1 = require("../hooks/useSocket");
const core_1 = require("@material-ui/core");
const core_2 = require("@material-ui/core");
const TallyMenu_1 = __importDefault(require("./TallyMenu"));
const useStyles = (0, core_2.makeStyles)(theme => {
    return {
        tally: {
            border: "solid 1px " + theme.palette.grey[800],
            width: "250px",
            margin: theme.spacing(1),
            backgroundColor: theme.palette.grey[700],
            overflow: "hidden",
        },
        borderInPreview: {
            borderColor: theme.palette.success.main,
        },
        borderInProgram: {
            borderColor: theme.palette.error.main,
        },
        borderUnpatched: {
            borderColor: theme.palette.grey[500],
        },
        bgInPreview: {
            backgroundColor: theme.palette.success.main,
        },
        bgInProgram: {
            backgroundColor: theme.palette.error.main,
        },
        bgUnpatched: {
            backgroundColor: theme.palette.grey[500],
        },
        tallyHead: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: theme.spacing(1, 1, 1, 2),
            borderBottom: "1px solid " + theme.palette.grey[800],
        },
        tallyHeadTitle: {},
        tallyHeadIcon: {},
        tallyBody: {
            padding: theme.spacing(2)
        },
        tallyFoot: {
            padding: theme.spacing(1, 2),
            borderTop: "1px solid " + theme.palette.grey[800],
            fontSize: "0.75rem",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            textTransform: "uppercase",
            fontWeight: "bold",
        },
        tallyFootMissing: {
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.getContrastText(theme.palette.warning.main)
        },
        tallyFootItem: {
            textAlign: "center",
            flexGrow: 1,
        },
    };
});
function Tally({ tally, className }) {
    const channels = (0, useChannels_1.default)();
    const [programs, previews] = (0, useProgramPreview_1.default)();
    const classes = useStyles();
    const patchTally = function (tally, channel) {
        useSocket_1.socket.emit('tally.patch', tally.name, tally.type, channel);
    };
    const classRoot = [];
    className && classRoot.push(className);
    classRoot.push(classes.tally);
    const classHead = [classes.tallyHead];
    let dataColor = "idle";
    let isActive = false;
    if (!tally.isPatched()) {
        classRoot.push(classes.borderUnpatched);
        dataColor = "unpatched";
    }
    else if (programs && tally.isIn(programs)) {
        classRoot.push(classes.borderInProgram);
        dataColor = "program";
    }
    else if (previews && tally.isIn(previews)) {
        classRoot.push(classes.borderInPreview);
        dataColor = "preview";
    }
    if (tally.isActive()) {
        isActive = true;
        if (!tally.isPatched()) {
            classHead.push(classes.bgUnpatched);
        }
        else if (programs && tally.isIn(programs)) {
            classHead.push(classes.bgInProgram);
        }
        else if (previews && tally.isIn(previews)) {
            classHead.push(classes.bgInPreview);
        }
    }
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)(core_1.Paper, { "data-color": dataColor, "data-isactive": isActive, className: classRoot.join(" "), "data-testid": `tally-${tally.name}`, children: [(0, jsx_runtime_1.jsx)("div", { className: classHead.join(" "), children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: classes.tallyHeadTitle, children: tally.name }, void 0), (0, jsx_runtime_1.jsx)(TallyMenu_1.default, { className: classes.tallyHeadIcon, tally: tally }, void 0)] }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { className: classes.tallyBody, children: (0, jsx_runtime_1.jsx)(ChannelSelector_1.default, { value: tally.channelId, channels: channels, onChange: value => patchTally(tally, value) }, void 0) }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: classes.tallyFoot + (tally.isActive() && tally.isMissing() ? " " + classes.tallyFootMissing : ""), children: [(0, jsx_runtime_1.jsx)("div", { className: classes.tallyFootItem, children: tally.isActive() ? (tally.isMissing() ? "missing" : "connected") : "disconnected" }, void 0), tally.isUdpTally() && tally.address && tally.port && ((0, jsx_runtime_1.jsxs)("div", { className: classes.tallyFootItem, children: [tally.address, ":", tally.port] }, void 0))] }, void 0)] }, void 0) }, void 0));
}
exports.default = Tally;

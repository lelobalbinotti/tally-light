"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Layout_1 = __importDefault(require("../components/layout/Layout"));
const MiniPage_1 = __importDefault(require("../components/layout/MiniPage"));
const useTallyLog_1 = __importDefault(require("../hooks/useTallyLog"));
const core_1 = require("@material-ui/core");
const react_router_dom_1 = require("react-router-dom");
const useTallies_1 = __importDefault(require("../hooks/useTallies"));
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        logLine: {
            fontFamily: "monospace",
            padding: theme.spacing(1, 2),
        },
        bgStatus: {
            backgroundColor: theme.palette.primary.main,
        },
        bgError: {
            backgroundColor: theme.palette.error.main,
        },
        bgWarning: {
            backgroundColor: theme.palette.warning.main,
        },
        logDate: {
            opacity: "0.5",
            fontSize: "0.8em",
        },
    };
});
const Log = ({ log, idx, classes }) => {
    const classNames = [classes.logLine];
    if (log.isWarning()) {
        classNames.push(classes.bgWarning);
    }
    else if (log.isError()) {
        classNames.push(classes.bgError);
    }
    else if (log.isStatus()) {
        classNames.push(classes.bgStatus);
    }
    const localTime = (log.dateTime instanceof Date ? log.dateTime : new Date(log.dateTime)).toLocaleString('pt-BR');
    return ((0, jsx_runtime_1.jsxs)("div", { "data-testid": `log-line-${idx}`, "data-severity": log.isWarning() ? "warning" : (log.isError() ? "error" : (log.isStatus() ? "status" : "info")), className: classNames.join(" "), children: [(0, jsx_runtime_1.jsx)("time", { className: classes.logDate, children: localTime }, void 0), (0, jsx_runtime_1.jsx)("div", { children: log.message }, void 0)] }, idx));
};
const TallyLogPage = () => {
    const { tallyId } = (0, react_router_dom_1.useParams)();
    const logs = (0, useTallyLog_1.default)(tallyId);
    const tallies = (0, useTallies_1.default)();
    const tally = tallies === null || tallies === void 0 ? void 0 : tallies.find(tally => tally.getId() === tallyId);
    const classes = useStyles();
    return ((0, jsx_runtime_1.jsx)(Layout_1.default, { testId: "tally-log", children: (0, jsx_runtime_1.jsx)(MiniPage_1.default, { title: `${tally === null || tally === void 0 ? void 0 : tally.name}'s Logs`, contentPadding: "0", children: logs ? logs.map((log, idx) => (0, jsx_runtime_1.jsx)(Log, { log: log, idx: idx, classes: classes }, void 0)) : "" /* @TODO: loading */ }, void 0) }, void 0));
};
exports.default = TallyLogPage;

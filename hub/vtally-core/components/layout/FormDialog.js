"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const Close_1 = __importDefault(require("@material-ui/icons/Close"));
const useStyles = (0, core_1.makeStyles)(theme => ({
    title: {
        borderBottom: "1px solid " + theme.palette.background.default,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingRight: theme.spacing(1),
    },
    content: {
        overflow: "hidden", // the bubble on the slider glitches sometimes
    },
    actions: {
        borderTop: "1px solid " + theme.palette.background.default,
        display: "flex",
        justifyContent: "space-between",
    },
    actionsLeft: {},
}));
function FormDialog(props) {
    const { label, onSubmit, onClose, isLoading } = props;
    const testId = props["data-testid"];
    const theme = (0, core_1.useTheme)();
    const fullScreen = (0, core_1.useMediaQuery)(theme.breakpoints.down('xs'));
    const classes = useStyles();
    return ((0, jsx_runtime_1.jsx)(core_1.Dialog, { fullWidth: true, fullScreen: fullScreen, maxWidth: "sm", scroll: "body", ...props, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => {
                e.preventDefault();
                onSubmit && onSubmit();
            }, children: [(0, jsx_runtime_1.jsxs)(core_1.DialogTitle, { className: classes.title, disableTypography: true, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { variant: "h1", children: label }, void 0), (0, jsx_runtime_1.jsx)(core_1.IconButton, { "aria-label": "Close Dialog", onClick: onClose, children: (0, jsx_runtime_1.jsx)(Close_1.default, {}, void 0) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(core_1.DialogContent, { className: classes.content, children: props.children }, void 0), (0, jsx_runtime_1.jsxs)(core_1.DialogActions, { className: classes.actions, children: [(0, jsx_runtime_1.jsx)(core_1.Button, { onClick: onClose, color: "default", "data-testid": `${testId}-close`, children: "Cancel" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Button, { disabled: isLoading, color: "primary", variant: "contained", "data-testid": `${testId}-submit`, type: "submit", children: "Save" }, void 0)] }, void 0)] }, void 0) }, void 0));
}
exports.default = FormDialog;

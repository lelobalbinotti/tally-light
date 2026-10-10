"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Spinner_1 = __importDefault(require("../layout/Spinner"));
const core_1 = require("@material-ui/core");
const useStyles = (0, core_1.makeStyles)(theme => ({
    text: {
        color: theme.palette.grey[600]
    },
    // disabled buttons have to be wrapped to show a tooltip
    // @see https://github.com/mui-org/material-ui/issues/8416
    tooltipWrapFix: {
        display: "inline-block",
    },
    footer: {
        borderTop: "solid 1px " + theme.palette.background.default,
        margin: theme.spacing(0, -2),
        padding: theme.spacing(2, 2, 0, 2),
        textAlign: "right",
    }
}));
function MixerSettingsWrapper({ title, testId, description, canBeSaved, isLoading, children, onSave }) {
    const classes = useStyles();
    const buttonLabel = "Save";
    const handleSubmit = e => {
        e.preventDefault();
        if (onSave) {
            onSave();
        }
    };
    if (isLoading) {
        return ((0, jsx_runtime_1.jsx)(Spinner_1.default, {}, void 0));
    }
    else {
        return ((0, jsx_runtime_1.jsxs)("div", { "data-testid": testId, children: [description ? ((0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, className: classes.text, children: description }, void 0)) : "", (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [children && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { variant: "h4", paragraph: true, children: title }, void 0), (0, jsx_runtime_1.jsx)("div", { children: children }, void 0)] }, void 0)), (0, jsx_runtime_1.jsx)("div", { className: classes.footer, children: onSave ? (canBeSaved === false ? ((0, jsx_runtime_1.jsx)(core_1.Tooltip, { title: "The form contains errors", children: (0, jsx_runtime_1.jsx)("div", { className: classes.tooltipWrapFix, children: (0, jsx_runtime_1.jsx)(core_1.Button, { "data-testid": `${testId}-submit`, variant: "contained", disabled: true, children: buttonLabel }, void 0) }, void 0) }, void 0)) : ((0, jsx_runtime_1.jsx)(core_1.Button, { "data-testid": `${testId}-submit`, type: "submit", variant: "contained", color: "primary", children: buttonLabel }, void 0))) : "" }, void 0)] }, void 0)] }, void 0));
    }
}
exports.default = MixerSettingsWrapper;

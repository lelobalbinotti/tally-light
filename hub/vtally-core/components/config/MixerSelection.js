"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = require("react");
const useConfiguration_1 = require("../../hooks/useConfiguration");
const Spinner_1 = __importDefault(require("../layout/Spinner"));
const MiniPage_1 = __importDefault(require("../layout/MiniPage"));
const useStyles = (0, core_1.makeStyles)(theme => ({
    text: {
        color: theme.palette.grey[600]
    },
    select: {
        marginBottom: theme.spacing(2),
    },
}));
function MixerOption({ id, label }) {
    return ((0, jsx_runtime_1.jsx)("option", { value: id, children: label }, id));
}
function isValidChild(child) {
    return (child === null || child === void 0 ? void 0 : child.props.id) && (child === null || child === void 0 ? void 0 : child.props.label);
}
function MixerSelection({ children }) {
    const mixerName = (0, useConfiguration_1.useMixerNameConfiguration)();
    const allowedMixers = (0, useConfiguration_1.useAllowedMixersConfiguration)();
    const [oldMixerName, setOldMixerName] = (0, react_1.useState)(mixerName);
    const [mixerId, setMixerId] = (0, react_1.useState)(mixerName);
    const classes = useStyles();
    const isLoading = mixerName === undefined || allowedMixers === undefined;
    if (mixerName !== oldMixerName) {
        setMixerId(mixerName);
        setOldMixerName(mixerName);
    }
    const availableChildren = children === null || children === void 0 ? void 0 : children.filter((child) => {
        var _a;
        if (!isValidChild(child)) {
            throw new Error(`Expected all nodes of MixerSelection to be ReactNodes implementing SettingProps, but got ${((_a = child === null || child === void 0 ? void 0 : child.constructor) === null || _a === void 0 ? void 0 : _a.name) || typeof child}`);
        }
        return allowedMixers === null || allowedMixers === void 0 ? void 0 : allowedMixers.includes(child.props.id);
    });
    const currentMixer = availableChildren === null || availableChildren === void 0 ? void 0 : availableChildren.reduce((cur, child) => {
        return child.props.id === mixerId ? child : cur;
    }, null);
    return ((0, jsx_runtime_1.jsxs)(MiniPage_1.default, { title: "Video Mixer", children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, className: classes.text, children: "Select a Video Mixer to use." }, void 0), isLoading ? (0, jsx_runtime_1.jsx)(Spinner_1.default, {}, void 0) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: classes.select, children: (0, jsx_runtime_1.jsx)(core_1.NativeSelect, { "data-testid": "mixer-select", value: mixerId, onChange: e => setMixerId(e.target.value), children: availableChildren === null || availableChildren === void 0 ? void 0 : availableChildren.map(child => {
                                return ((0, jsx_runtime_1.jsx)(MixerOption, { id: child.props.id, label: child.props.label }, child.props.id));
                            }) }, void 0) }, void 0), currentMixer] }, void 0))] }, void 0));
}
exports.default = MixerSelection;

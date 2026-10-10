"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = require("react");
const useConfiguration_1 = require("../../hooks/useConfiguration");
const useSocket_1 = require("../../hooks/useSocket");
const TallyConfiguration_1 = require("../../tally/TallyConfiguration");
const MiniPage_1 = __importDefault(require("../layout/MiniPage"));
const Spinner_1 = __importDefault(require("../layout/Spinner"));
const BrightnessSlider_1 = __importDefault(require("./BrightnessSlider"));
const ColorSchemeSelector_1 = __importDefault(require("./ColorSchemeSelector"));
const useStyle = (0, core_1.makeStyles)((theme) => ({
    input: {
        margin: theme.spacing(0, 2, 2, 0),
        display: "block",
    },
    footer: {
        borderTop: "solid 1px " + theme.palette.background.default,
        margin: theme.spacing(0, -2),
        padding: theme.spacing(2, 2, 0, 2),
        textAlign: "right",
    },
    checkboxLabel: {
        fontSize: "1em",
    }
}));
function TallySettings() {
    const settings = (0, useConfiguration_1.useDefaultTallyConfiguration)();
    const [operatorBrightness, setOperatorBrightness] = (0, react_1.useState)(undefined);
    const [stageBrightness, setStageBrightness] = (0, react_1.useState)(undefined);
    const [operatorColorScheme, setOperatorColorScheme] = (0, react_1.useState)(undefined);
    const [stageColorScheme, setStageColorScheme] = (0, react_1.useState)(undefined);
    const [stageShowsPreview, setStageShowsPreview] = (0, react_1.useState)(undefined);
    const [operatorShowsIdle, setOperatorShowsIdle] = (0, react_1.useState)(undefined);
    (0, react_1.useMemo)(() => {
        // called when setting changed
        setOperatorBrightness(settings === null || settings === void 0 ? void 0 : settings.getOperatorLightBrightness());
        setStageBrightness(settings === null || settings === void 0 ? void 0 : settings.getStageLightBrightness());
        setOperatorColorScheme(settings === null || settings === void 0 ? void 0 : settings.getOperatorColorScheme());
        setStageColorScheme(settings === null || settings === void 0 ? void 0 : settings.getStageColorScheme());
        setStageShowsPreview(settings === null || settings === void 0 ? void 0 : settings.getStageShowsPreview());
        setOperatorShowsIdle(settings === null || settings === void 0 ? void 0 : settings.getOperatorShowsIdle());
    }, [settings]);
    const classes = useStyle();
    const isLoading = !settings;
    const handleSubmit = (event) => {
        event.preventDefault();
        operatorBrightness !== undefined && settings.setOperatorLightBrightness(operatorBrightness);
        stageBrightness !== undefined && settings.setStageLightBrightness(stageBrightness);
        operatorColorScheme !== undefined && settings.setOperatorColorScheme(operatorColorScheme);
        stageColorScheme !== undefined && settings.setStageColorScheme(stageColorScheme);
        stageShowsPreview !== undefined && settings.setStageShowsPreview(stageShowsPreview);
        operatorShowsIdle !== undefined && settings.setOperatorShowsIdle(operatorShowsIdle);
        useSocket_1.socket.emit('config.change.tallyconfig', settings.toJson());
    };
    return (0, jsx_runtime_1.jsx)(MiniPage_1.default, { "data-testid": "tally-defaults", title: "Tally Defaults", children: isLoading ? (0, jsx_runtime_1.jsx)(Spinner_1.default, {}, void 0) : ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: classes.input, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, variant: "h6", children: "Operator Light Brightness" }, void 0), (0, jsx_runtime_1.jsx)(BrightnessSlider_1.default, { testId: "tally-defaults-ob", minValue: TallyConfiguration_1.DefaultTallyConfiguration.minOperatorLightBrightness, minMessage: "Operator Light can not be turned off.", value: operatorBrightness, onChange: (value) => { setOperatorBrightness(value); } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: classes.input, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, variant: "h6", children: "Operator Light Colors" }, void 0), (0, jsx_runtime_1.jsx)(ColorSchemeSelector_1.default, { testId: "tally-defaults-oc", value: operatorColorScheme, onChange: (value) => { setOperatorColorScheme(value); } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: classes.input, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, variant: "h6", children: "Operator Display" }, void 0), (0, jsx_runtime_1.jsx)(core_1.FormControlLabel, { classes: { label: classes.checkboxLabel }, control: (0, jsx_runtime_1.jsx)(core_1.Checkbox, { "data-testid": "tally-defaults-oi", "data-value": operatorShowsIdle, checked: operatorShowsIdle, color: "primary", onChange: (e) => { setOperatorShowsIdle(e.target.checked); }, size: "small" }, void 0), label: "Shows Idle State" }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: classes.input, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, variant: "h6", children: "Stage Light Brightness" }, void 0), (0, jsx_runtime_1.jsx)(BrightnessSlider_1.default, { testId: "tally-defaults-sb", value: stageBrightness, onChange: (value) => { setStageBrightness(value); } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: classes.input, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, variant: "h6", children: "Stage Light Colors" }, void 0), (0, jsx_runtime_1.jsx)(ColorSchemeSelector_1.default, { testId: "tally-defaults-sc", value: stageColorScheme, onChange: (value) => { setStageColorScheme(value); } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: classes.input, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, variant: "h6", children: "Stage Display" }, void 0), (0, jsx_runtime_1.jsx)(core_1.FormControlLabel, { classes: { label: classes.checkboxLabel }, control: (0, jsx_runtime_1.jsx)(core_1.Checkbox, { "data-testid": "tally-defaults-sp", "data-value": stageShowsPreview, checked: stageShowsPreview, color: "primary", onChange: (e) => { setStageShowsPreview(e.target.checked); }, size: "small" }, void 0), label: "Shows Preview State" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("div", { className: classes.footer, children: (0, jsx_runtime_1.jsx)(core_1.Button, { "data-testid": "tally-defaults-submit", type: "submit", variant: "contained", color: "primary", children: "Save" }, void 0) }, void 0)] }, void 0)) }, void 0);
}
exports.default = TallySettings;

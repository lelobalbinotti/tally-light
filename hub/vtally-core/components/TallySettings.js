"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = require("react");
const useConfiguration_1 = require("../hooks/useConfiguration");
const useSocket_1 = require("../hooks/useSocket");
const TallyConfiguration_1 = require("../tally/TallyConfiguration");
const BrightnessSlider_1 = __importDefault(require("./config/BrightnessSlider"));
const ColorSchemeSelector_1 = __importDefault(require("./config/ColorSchemeSelector"));
const FormDialog_1 = __importDefault(require("./layout/FormDialog"));
const Spinner_1 = __importDefault(require("./layout/Spinner"));
const TallySettingsField_1 = __importDefault(require("./TallySettingsField"));
const useStyles = (0, core_1.makeStyles)(theme => ({
    input: {
        margin: theme.spacing(0, 0, 2, 0),
    },
    checkboxLabel: {
        fontSize: "1em",
    }
}));
function TallySettings({ tally, open, onClose }) {
    const defaultSettings = (0, useConfiguration_1.useDefaultTallyConfiguration)();
    const settings = tally.configuration;
    // operatorBrightness
    const [ob, setOb] = (0, react_1.useState)(settings && settings.getOperatorLightBrightness());
    const [isObDefault, setObDefault] = (0, react_1.useState)(settings && settings.getOperatorLightBrightness() === undefined);
    // stageBrightness
    const [sb, setSb] = (0, react_1.useState)(settings && settings.getStageLightBrightness());
    const [isSbDefault, setSbDefault] = (0, react_1.useState)(settings && settings.getOperatorLightBrightness() === undefined);
    // operatorColor
    const [oc, setOc] = (0, react_1.useState)(settings ? settings.getOperatorColorScheme() : undefined);
    const [isOcDefault, setOcDefault] = (0, react_1.useState)(settings && settings.getOperatorColorScheme() === undefined);
    // stageColor
    const [sc, setSc] = (0, react_1.useState)(settings ? settings.getStageColorScheme() : undefined);
    const [isScDefault, setScDefault] = (0, react_1.useState)(settings && settings.getStageColorScheme() === undefined);
    // stageShowPreview
    const [sp, setSp] = (0, react_1.useState)(settings ? settings.getStageShowsPreview() : undefined);
    const [isSpDefault, setSpDefault] = (0, react_1.useState)(settings && settings.getStageShowsPreview() === undefined);
    // operatorShowIdle
    const [oi, setOi] = (0, react_1.useState)(settings ? settings.getOperatorShowsIdle() : undefined);
    const [isOiDefault, setOiDefault] = (0, react_1.useState)(settings && settings.getOperatorShowsIdle() === undefined);
    (0, react_1.useMemo)(() => {
        // when default settings change
        if (defaultSettings) {
            if (isObDefault) {
                setOb(defaultSettings.getOperatorLightBrightness());
            }
            if (isSbDefault) {
                setSb(defaultSettings.getStageLightBrightness());
            }
            if (isOcDefault) {
                setOc(defaultSettings.getOperatorColorScheme());
            }
            if (isScDefault) {
                setSc(defaultSettings.getStageColorScheme());
            }
            if (isSpDefault) {
                setSp(defaultSettings.getStageShowsPreview());
            }
            if (isOiDefault) {
                setOi(defaultSettings.getOperatorShowsIdle());
            }
        }
    }, [defaultSettings, isObDefault, isSbDefault, isOcDefault, isScDefault, isSpDefault, isOiDefault]);
    (0, react_1.useMemo)(() => {
        // when settings are changed
        if (settings) {
            const newIsObDefault = settings.getOperatorLightBrightness() === undefined;
            const newIsSbDefault = settings.getStageLightBrightness() === undefined;
            const newIsOcDefault = settings.getOperatorColorScheme() === undefined;
            const newIsScDefault = settings.getStageColorScheme() === undefined;
            const newIsSpDefault = settings.getStageShowsPreview() === undefined;
            const newIsOiDefault = settings.getOperatorShowsIdle() === undefined;
            setObDefault(newIsObDefault);
            setSbDefault(newIsSbDefault);
            setOcDefault(newIsOcDefault);
            setScDefault(newIsScDefault);
            setSpDefault(newIsSpDefault);
            setOiDefault(newIsOiDefault);
            if (!newIsObDefault) {
                setOb(settings.getOperatorLightBrightness());
            }
            if (!newIsSbDefault) {
                setSb(settings.getStageLightBrightness());
            }
            if (!newIsOcDefault) {
                setOc(settings.getOperatorColorScheme());
            }
            if (!newIsScDefault) {
                setSc(settings.getStageColorScheme());
            }
            if (!newIsSpDefault) {
                setSp(settings.getStageShowsPreview());
            }
            if (!newIsOiDefault) {
                setOi(settings.getOperatorShowsIdle());
            }
        }
    }, [settings]);
    const isLoading = !defaultSettings || !tally;
    const classes = useStyles();
    const handleSave = () => {
        if (!tally) {
            return;
        }
        const settings = tally.configuration;
        settings.setOperatorLightBrightness(isObDefault ? undefined : ob);
        settings.setOperatorColorScheme((isOcDefault) ? undefined : oc);
        settings.setStageLightBrightness((!tally.hasStageLight || isSbDefault) ? undefined : sb);
        settings.setStageColorScheme((!tally.hasStageLight || isScDefault) ? undefined : sc);
        settings.setStageShowsPreview((!tally.hasStageLight || isSpDefault) ? undefined : sp);
        settings.setOperatorShowsIdle((isOiDefault) ? undefined : oi);
        useSocket_1.socket.emit('tally.settings', tally.name, tally.type, settings.toJson());
        onClose && onClose();
    };
    return ((0, jsx_runtime_1.jsx)(FormDialog_1.default, { "data-testid": "tally-settings", open: open, onClose: onClose, onSubmit: handleSave, label: `${tally.name} Settings`, children: isLoading ? ((0, jsx_runtime_1.jsx)(Spinner_1.default, {}, void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(TallySettingsField_1.default, { label: "Operator Light Brightness", isDefault: isObDefault, onChange: setObDefault, testId: "tally-settings-ob", className: classes.input, children: (0, jsx_runtime_1.jsx)(BrightnessSlider_1.default, { testId: "tally-settings-ob", disabled: isObDefault, minValue: TallyConfiguration_1.DefaultTallyConfiguration.minOperatorLightBrightness, minMessage: "Operator Light can not be turned off.", value: isObDefault ? defaultSettings.getOperatorLightBrightness() : ob, onChange: (value) => { setOb(value); } }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(TallySettingsField_1.default, { label: "Operator Light Colors", isDefault: isOcDefault, onChange: setOcDefault, testId: "tally-settings-oc", className: classes.input, children: (0, jsx_runtime_1.jsx)(ColorSchemeSelector_1.default, { testId: "tally-settings-oc", value: oc, onChange: (value) => { setOc(value); }, disabled: isOcDefault }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(TallySettingsField_1.default, { label: "Operator Display", isDefault: isOiDefault, onChange: setOiDefault, testId: "tally-settings-oi", className: classes.input, children: (0, jsx_runtime_1.jsx)(core_1.FormControlLabel, { classes: { label: classes.checkboxLabel }, control: (0, jsx_runtime_1.jsx)(core_1.Checkbox, { "data-testid": "tally-settings-oi", "data-value": isOiDefault ? defaultSettings.getOperatorShowsIdle() : oi, checked: isOiDefault ? defaultSettings.getOperatorShowsIdle() : oi, disabled: isOiDefault, color: "primary", onChange: (e) => { setOi(e.target.checked); }, size: "small" }, void 0), label: "Shows Idle State" }, void 0) }, void 0), tally.hasStageLight && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(TallySettingsField_1.default, { label: "Stage Light Brightness", isDefault: isSbDefault, onChange: setSbDefault, testId: "tally-settings-sb", className: classes.input, children: (0, jsx_runtime_1.jsx)(BrightnessSlider_1.default, { testId: "tally-settings-sb", disabled: isSbDefault, value: isSbDefault ? defaultSettings.getStageLightBrightness() : sb, onChange: (value) => { setSb(value); } }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(TallySettingsField_1.default, { label: "Stage Light Colors", isDefault: isScDefault, onChange: setScDefault, testId: "tally-settings-sc", className: classes.input, children: (0, jsx_runtime_1.jsx)(ColorSchemeSelector_1.default, { testId: "tally-settings-sc", value: sc, onChange: (value) => { setSc(value); }, disabled: isScDefault }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(TallySettingsField_1.default, { label: "Stage Display", isDefault: isSpDefault, onChange: setSpDefault, testId: "tally-settings-sp", className: classes.input, children: (0, jsx_runtime_1.jsx)(core_1.FormControlLabel, { classes: { label: classes.checkboxLabel }, control: (0, jsx_runtime_1.jsx)(core_1.Checkbox, { "data-testid": "tally-settings-sp", "data-value": isSpDefault ? defaultSettings.getStageShowsPreview() : sp, checked: isSpDefault ? defaultSettings.getStageShowsPreview() : sp, disabled: isSpDefault, color: "primary", onChange: (e) => { setSp(e.target.checked); }, size: "small" }, void 0), label: "Shows Preview State" }, void 0) }, void 0)] }, void 0))] }, void 0)) }, void 0));
}
exports.default = TallySettings;

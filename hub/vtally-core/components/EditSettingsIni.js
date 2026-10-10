"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = require("react");
const TallySettingsIni_1 = __importDefault(require("../flasher/TallySettingsIni"));
const useStyles = (0, core_1.makeStyles)((theme) => {
    return {
        root: {},
        textarea: {
            fontFamily: "monospace",
            marginBottom: theme.spacing(2),
        },
        textField: {
            display: "block",
            marginBottom: theme.spacing(2),
        },
        expertMode: {
            display: "block",
            textAlign: "right",
        },
        footer: {
            borderTop: "solid 1px " + theme.palette.background.default,
            margin: theme.spacing(0, -2),
            padding: theme.spacing(2, 2, 0, 2),
            textAlign: "right",
        },
    };
});
const EditSettingsIni = ({ settingsIni, onSave, disabled }) => {
    const [ini, setIni] = (0, react_1.useState)(settingsIni);
    const [stringContent, setStringContent] = (0, react_1.useState)(settingsIni === null || settingsIni === void 0 ? void 0 : settingsIni.toString());
    const [expertMode, setExpertMode] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setIni(settingsIni);
        setStringContent(settingsIni === null || settingsIni === void 0 ? void 0 : settingsIni.toString());
    }, [settingsIni]);
    const classes = useStyles();
    return ((0, jsx_runtime_1.jsxs)("div", { className: classes.root, children: [(0, jsx_runtime_1.jsx)(core_1.FormControlLabel, { "data-testid": "tally-settings-expert", "data-expertmode": expertMode ? "true" : "false", className: classes.expertMode, control: (0, jsx_runtime_1.jsx)(core_1.Switch, { size: "small", color: "primary", disabled: disabled, checked: expertMode, onChange: () => setExpertMode(!expertMode) }, void 0), label: "Expert Mode" }, void 0), expertMode ?
                (0, jsx_runtime_1.jsx)(core_1.TextField, { multiline: true, fullWidth: true, label: "tally-settings.ini", className: classes.textarea, rows: ((ini === null || ini === void 0 ? void 0 : ini.lines.length) || 0) + 1, value: stringContent || "", disabled: disabled, "data-testid": "tally-settings-all", onChange: (e) => {
                        const value = e.currentTarget.value;
                        setIni(new TallySettingsIni_1.default(value));
                        setStringContent(value);
                    } }, void 0)
                : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(core_1.TextField, { label: "Name", disabled: disabled, value: (ini === null || ini === void 0 ? void 0 : ini.getTallyName()) || "", className: classes.textField, "data-testid": "tally-settings-name", onChange: (e) => {
                                const value = e.currentTarget.value;
                                const clone = (ini === null || ini === void 0 ? void 0 : ini.clone()) || new TallySettingsIni_1.default();
                                clone.setTallyName(value);
                                setIni(clone);
                                setStringContent(clone.toString());
                            } }, void 0), (0, jsx_runtime_1.jsx)(core_1.TextField, { label: "Ssid", disabled: disabled, value: (ini === null || ini === void 0 ? void 0 : ini.getStationSsid()) || "", className: classes.textField, "data-testid": "tally-settings-ssid", onChange: (e) => {
                                const value = e.currentTarget.value;
                                const clone = (ini === null || ini === void 0 ? void 0 : ini.clone()) || new TallySettingsIni_1.default();
                                clone.setStationSsid(value);
                                setIni(clone);
                                setStringContent(clone.toString());
                            } }, void 0), (0, jsx_runtime_1.jsx)(core_1.TextField, { label: "Password", disabled: disabled, value: (ini === null || ini === void 0 ? void 0 : ini.getStationPassword()) || "", className: classes.textField, "data-testid": "tally-settings-password", onChange: (e) => {
                                const value = e.currentTarget.value;
                                const clone = (ini === null || ini === void 0 ? void 0 : ini.clone()) || new TallySettingsIni_1.default();
                                clone.setStationPassword(value);
                                setIni(clone);
                                setStringContent(clone.toString());
                            } }, void 0), (0, jsx_runtime_1.jsx)(core_1.TextField, { label: "Hub IP", disabled: disabled, value: (ini === null || ini === void 0 ? void 0 : ini.getHubIp()) || "", className: classes.textField, "data-testid": "tally-settings-ip", onChange: (e) => {
                                const value = e.currentTarget.value;
                                const clone = (ini === null || ini === void 0 ? void 0 : ini.clone()) || new TallySettingsIni_1.default();
                                clone.setHubIp(value);
                                setIni(clone);
                                setStringContent(clone.toString());
                            } }, void 0), (0, jsx_runtime_1.jsx)(core_1.TextField, { label: "Hub Port", disabled: disabled, value: (ini === null || ini === void 0 ? void 0 : ini.getHubPort()) || "", className: classes.textField, "data-testid": "tally-settings-port", onChange: (e) => {
                                const value = e.currentTarget.value;
                                const number = parseInt(value, 10);
                                const clone = (ini === null || ini === void 0 ? void 0 : ini.clone()) || new TallySettingsIni_1.default();
                                clone.setHubPort(isNaN(number) ? 0 : number);
                                setIni(clone);
                                setStringContent(clone.toString());
                            } }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("div", { className: classes.footer, children: (0, jsx_runtime_1.jsx)(core_1.Button, { color: "primary", disabled: disabled, variant: "contained", "data-testid": "tally-settings-submit", onClick: () => { onSave(ini); }, children: "Save" }, void 0) }, void 0)] }, void 0));
};
exports.default = EditSettingsIni;

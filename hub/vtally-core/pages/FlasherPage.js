"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const lab_1 = require("@material-ui/lab");
const react_1 = require("react");
const EditSettingsIni_1 = __importDefault(require("../components/EditSettingsIni"));
const Layout_1 = __importDefault(require("../components/layout/Layout"));
const MiniPage_1 = __importDefault(require("../components/layout/MiniPage"));
const Spinner_1 = __importDefault(require("../components/layout/Spinner"));
const TallySettingsProgress_1 = __importDefault(require("../components/flasher/TallySettingsProgress"));
const TallyDevice_1 = __importDefault(require("../flasher/TallyDevice"));
const Refresh_1 = __importDefault(require("@material-ui/icons/Refresh"));
const useSocket_1 = require("../hooks/useSocket");
const Help_1 = __importDefault(require("../components/flasher/Help"));
const ProgramProgress_1 = __importDefault(require("../components/flasher/ProgramProgress"));
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        warning: {
            marginBottom: theme.spacing(2),
        },
        success: {
            marginBottom: theme.spacing(2),
        },
        footer: {
            borderTop: "solid 1px " + theme.palette.background.default,
            margin: theme.spacing(0, -2),
            padding: theme.spacing(2, 2, 0, 2),
            textAlign: "right",
        },
    };
});
function useTallyDevice(i) {
    const [tallyDevice, setTallyDevice] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        const onFlasherDevice = (device) => {
            setTallyDevice(TallyDevice_1.default.fromJson(device));
        };
        useSocket_1.socket.on('flasher.device', onFlasherDevice);
        setTallyDevice(undefined);
        useSocket_1.socket.emit('flasher.device.get');
        return () => {
            useSocket_1.socket.off('flasher.device', onFlasherDevice);
        };
    }, [i]);
    return tallyDevice;
}
const FlasherPage = () => {
    // every increment will refresh tallyDevice
    const [increment, setIncrement] = (0, react_1.useState)(1);
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [uploadingOpen, setUploadingOpen] = (0, react_1.useState)(false);
    const [uploadProgress, setUploadProgress] = (0, react_1.useState)(undefined);
    const [programProgress, setProgramProgress] = (0, react_1.useState)(undefined);
    const tallyDevice = useTallyDevice(increment);
    const isLoading = tallyDevice === undefined;
    const classes = useStyles();
    const handleReload = () => {
        setIncrement(increment + 1);
    };
    const handleSettingsIniSave = (tallySettings) => {
        setUploadProgress(undefined);
        setProgramProgress(undefined);
        setIsUploading(true);
        setUploadingOpen(true);
        const fnc = (progress) => {
            if (progress.allDone || progress.error) {
                useSocket_1.socket.off('flasher.settingsIni.progress', fnc);
                setIsUploading(false);
                if (!progress.error) {
                    handleReload();
                }
            }
            setUploadProgress(progress);
        };
        useSocket_1.socket.on('flasher.settingsIni.progress', fnc);
        useSocket_1.socket.emit('flasher.settingsIni', tallyDevice.path, tallySettings.toString());
    };
    const handleProgram = () => {
        setUploadProgress(undefined);
        setProgramProgress(undefined);
        setIsUploading(true);
        setUploadingOpen(true);
        const fnc = (progress) => {
            if (progress.allDone || progress.error) {
                useSocket_1.socket.off('flasher.program.progress', fnc);
                setIsUploading(false);
                if (!progress.error) {
                    handleReload();
                }
            }
            setProgramProgress(progress);
        };
        useSocket_1.socket.on('flasher.program.progress', fnc);
        useSocket_1.socket.emit('flasher.program', tallyDevice.path);
    };
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { testId: "flasher", children: [(0, jsx_runtime_1.jsxs)(core_1.Dialog, { "data-testid": "progress", disableBackdropClick: isUploading, disableEscapeKeyDown: isUploading, open: uploadingOpen, children: [(0, jsx_runtime_1.jsx)(core_1.DialogTitle, { children: "Upload" }, void 0), (0, jsx_runtime_1.jsxs)(core_1.DialogContent, { children: [uploadProgress && (0, jsx_runtime_1.jsx)(TallySettingsProgress_1.default, { progress: uploadProgress }, void 0), programProgress && (0, jsx_runtime_1.jsx)(ProgramProgress_1.default, { progress: programProgress }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(core_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(core_1.Button, { "data-testid": "progress-close", disabled: isUploading, onClick: () => setUploadingOpen(false), children: "Close" }, void 0) }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)(MiniPage_1.default, { title: "Tally Flasher", addHeaderContent: (0, jsx_runtime_1.jsx)(core_1.IconButton, { "aria-label": "reload", disabled: isLoading || isUploading, onClick: handleReload, children: (0, jsx_runtime_1.jsx)(Refresh_1.default, {}, void 0) }, void 0), children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { paragraph: true, children: "This tool allows to update the configuration or software of a Hardware Tally Light." }, void 0), tallyDevice === undefined ? ((0, jsx_runtime_1.jsx)(Spinner_1.default, {}, void 0)) : ((0, jsx_runtime_1.jsx)(Help_1.default, { tallyDevice: tallyDevice, onReload: handleReload }, void 0))] }, void 0), ((tallyDevice === null || tallyDevice === void 0 ? void 0 : tallyDevice.update) === "updateable" || (tallyDevice === null || tallyDevice === void 0 ? void 0 : tallyDevice.update) === "up-to-date") && (0, jsx_runtime_1.jsxs)(MiniPage_1.default, { testId: "update-software", title: "Software Update", children: [(tallyDevice === null || tallyDevice === void 0 ? void 0 : tallyDevice.update) === "up-to-date" && (0, jsx_runtime_1.jsx)(lab_1.Alert, { className: classes.success, variant: "outlined", severity: "success", children: "The software on this Tally is up to date." }, void 0), (tallyDevice === null || tallyDevice === void 0 ? void 0 : tallyDevice.update) === "updateable" && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lab_1.Alert, { className: classes.warning, severity: "warning", variant: "outlined", children: "The Software on this Tally can be updated." }, void 0), (0, jsx_runtime_1.jsx)("div", { className: classes.footer, children: (0, jsx_runtime_1.jsx)(core_1.Button, { color: "primary", variant: "contained", onClick: handleProgram, "data-testid": "update-software-now", children: "Update now" }, void 0) }, void 0)] }, void 0)] }, void 0), (tallyDevice === null || tallyDevice === void 0 ? void 0 : tallyDevice.nodeMcuVersion) !== undefined && (0, jsx_runtime_1.jsxs)(MiniPage_1.default, { title: "Edit tally-settings.ini", testId: "tally-settings", children: [!tallyDevice.tallySettings && (0, jsx_runtime_1.jsx)(lab_1.Alert, { className: classes.warning, severity: "warning", variant: "outlined", children: "tally-settings.ini does not exist yet and will be created." }, void 0), (0, jsx_runtime_1.jsx)(EditSettingsIni_1.default, { settingsIni: tallyDevice.tallySettings, onSave: handleSettingsIniSave, disabled: isLoading || isUploading }, void 0)] }, void 0)] }, void 0));
};
exports.default = FlasherPage;

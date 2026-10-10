"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MixerSettingsWrapper_1 = __importDefault(require("../../../components/config/MixerSettingsWrapper"));
const ValidatingInput_1 = __importDefault(require("../../../components/config/ValidatingInput"));
const ExternalLink_1 = __importDefault(require("../../../components/ExternalLink"));
const useConfiguration_1 = require("../../../hooks/useConfiguration");
const useSocket_1 = require("../../../hooks/useSocket");
const ObsConnector_1 = __importDefault(require("../ObsConnector"));
const ObsLiveModeSelect_1 = __importDefault(require("./ObsLiveModeSelect"));
function ObsSettings(props) {
    const configuration = (0, useConfiguration_1.useObsConfiguration)();
    const [ip, setIp] = (0, react_1.useState)(null);
    const [ipValid, setIpValid] = (0, react_1.useState)(true);
    const [port, setPort] = (0, react_1.useState)(null);
    const [portValid, setPortValid] = (0, react_1.useState)(true);
    const [liveMode, setLiveMode] = (0, react_1.useState)(null);
    const liveModeValid = liveMode !== null;
    const isLoading = !configuration;
    const isValid = ipValid && portValid && liveModeValid;
    (0, react_1.useMemo)(() => {
        // when default settings change
        if (configuration) {
            setLiveMode(configuration.getLiveMode());
        }
    }, [configuration]);
    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.");
        }
        else if (props.id !== ObsConnector_1.default.ID) {
            console.warn(`Changing id prop of ObsSettings is not supported. But got ${props.id}.`);
        }
        else {
            const config = configuration.clone();
            config.setIp(ip);
            config.setPort(port);
            config.setLiveMode(liveMode);
            useSocket_1.socket.emit('config.change.obs', config.toJson(), props.id);
        }
    };
    return ((0, jsx_runtime_1.jsx)(MixerSettingsWrapper_1.default, { title: "OBS Studio Configuration", testId: "obs", description: "Conecta ao OBS Studio via WebSocket v5 nativo (porta padrão 4455).", canBeSaved: isValid, isLoading: isLoading, onSave: handleSave, children: configuration && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Obs IP", testId: "obs-ip", object: configuration, propertyName: "ip", onValid: (newIp) => { setIp(newIp); setIpValid(true); }, onInvalid: () => setIpValid(false) }, void 0), (0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Obs Port", testId: "obs-port", object: configuration, propertyName: "port", onValid: (newPort) => { setPort(newPort); setPortValid(true); }, onInvalid: () => setPortValid(false) }, void 0), (0, jsx_runtime_1.jsx)(ObsLiveModeSelect_1.default, { label: "On-Air Status", testId: "obs-liveMode", value: liveMode, onChange: setLiveMode }, void 0)] }, void 0)) }, void 0));
}
ObsSettings.defaultProps = {
    id: ObsConnector_1.default.ID,
    label: "OBS Studio",
};
exports.default = ObsSettings;

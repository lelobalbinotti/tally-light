"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MixerSettingsWrapper_1 = __importDefault(require("../../../components/config/MixerSettingsWrapper"));
const ValidatingInput_1 = __importDefault(require("../../../components/config/ValidatingInput"));
const useConfiguration_1 = require("../../../hooks/useConfiguration");
const useSocket_1 = require("../../../hooks/useSocket");
function VmixSettings(props) {
    const configuration = (0, useConfiguration_1.useVmixConfiguration)();
    const [ip, setIp] = (0, react_1.useState)(null);
    const [ipValid, setIpValid] = (0, react_1.useState)(true);
    const [port, setPort] = (0, react_1.useState)(null);
    const [portValid, setPortValid] = (0, react_1.useState)(true);
    const isLoading = !configuration;
    const isValid = ipValid && portValid;
    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.");
        }
        else if (props.id !== "vmix") {
            console.warn(`Changing id prop of VmixSettings is not supported. But got ${props.id}.`);
        }
        else {
            const config = configuration.clone();
            config.setIp(ip);
            config.setPort(port);
            useSocket_1.socket.emit('config.change.vmix', config.toJson(), props.id);
        }
    };
    return ((0, jsx_runtime_1.jsx)(MixerSettingsWrapper_1.default, { title: "vMix", testId: "vmix", description: "Connects to any vMix over network.", canBeSaved: isValid, isLoading: isLoading, onSave: handleSave, children: configuration && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "vMix IP", testId: "vmix-ip", object: configuration, propertyName: "ip", onValid: (newIp) => { setIp(newIp); setIpValid(true); }, onInvalid: () => setIpValid(false) }, void 0), (0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "vMix Port", testId: "vmix-port", object: configuration, propertyName: "port", onValid: (newPort) => { setPort(newPort); setPortValid(true); }, onInvalid: () => setPortValid(false) }, void 0)] }, void 0)) }, void 0));
}
VmixSettings.defaultProps = {
    id: "vmix",
    label: "vMix",
};
exports.default = VmixSettings;

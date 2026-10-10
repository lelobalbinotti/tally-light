"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MixerSettingsWrapper_1 = __importDefault(require("../../../components/config/MixerSettingsWrapper"));
const ValidatingInput_1 = __importDefault(require("../../../components/config/ValidatingInput"));
const useSocket_1 = require("../../../hooks/useSocket");
const useConfiguration_1 = require("../../../hooks/useConfiguration");
function RolandV60HDSettings(props) {
    const configuration = (0, useConfiguration_1.useRolandV60HDConfiguration)();
    const [ip, setIp] = (0, react_1.useState)(null);
    const [ipValid, setIpValid] = (0, react_1.useState)(true);
    const [port, setPort] = (0, react_1.useState)(null);
    const [portValid, setPortValid] = (0, react_1.useState)(true);
    const [requestInterval, setRequestInterval] = (0, react_1.useState)(null);
    const [requestIntervalValid, setRequestIntervalValid] = (0, react_1.useState)(true);
    const isLoading = !configuration;
    const isValid = ipValid && portValid && requestIntervalValid;
    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.");
        }
        else if (props.id !== "rolandV60HD") {
            console.warn(`Changing id prop of RolandV60HDSettings is not supported. But got ${props.id}.`);
        }
        else {
            const config = configuration.clone();
            config.setIp(ip);
            config.setPort(port);
            config.setRequestInterval(requestInterval);
            useSocket_1.socket.emit('config.change.rolandV60HD', config.toJson(), props.id);
        }
    };
    return ((0, jsx_runtime_1.jsx)(MixerSettingsWrapper_1.default, { title: "RolandV60HD SmartTally", testId: "rolandV60HD", description: "RolandV60HD Mixer with suport for Roland SmartTally", canBeSaved: isValid, isLoading: isLoading, onSave: handleSave, children: configuration && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "IP", testId: "rolandV60HD-ip", object: configuration, propertyName: "ip", onValid: (newIp) => { setIp(newIp); setIpValid(true); }, onInvalid: () => setIpValid(false) }, void 0), (0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Port", testId: "rolandV60HD-port", object: configuration, propertyName: "port", onValid: (newPort) => { setPort(newPort); setPortValid(true); }, onInvalid: () => setPortValid(false) }, void 0), (0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Request Interval", testId: "rolandV60HD-requestInterval", object: configuration, propertyName: "requestInterval", onValid: (newRequestInterval) => { setRequestInterval(newRequestInterval); setRequestIntervalValid(true); }, onInvalid: () => setRequestIntervalValid(false) }, void 0)] }, void 0)) }, void 0));
}
RolandV60HDSettings.defaultProps = {
    id: "rolandV60HD",
    label: "Roland V-60HD",
};
exports.default = RolandV60HDSettings;

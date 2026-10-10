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
function RolandV8HDSettings(props) {
    const configuration = (0, useConfiguration_1.useRolandV8HDConfiguration)();
    const [requestInterval, setRequestInterval] = (0, react_1.useState)(null);
    const [requestIntervalValid, setRequestIntervalValid] = (0, react_1.useState)(true);
    const isLoading = !configuration;
    const isValid = requestIntervalValid;
    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.");
        }
        else if (props.id !== "rolandV8HD") {
            console.warn(`Changing id prop of RolandV8HDSettings is not supported. But got ${props.id}.`);
        }
        else {
            const config = configuration.clone();
            config.setRequestInterval(requestInterval);
            useSocket_1.socket.emit('config.change.rolandV8HD', config.toJson(), props.id);
        }
    };
    return ((0, jsx_runtime_1.jsx)(MixerSettingsWrapper_1.default, { title: "Roland V-8HD", testId: "rolandV8HD", description: "Roland V-8HD Mixer connected via USB-Midi", canBeSaved: isValid, isLoading: isLoading, onSave: handleSave, children: configuration && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Request Interval", testId: "rolandV8HD-request-interval", object: configuration, propertyName: "requestInterval", onValid: (newRequestInterval) => { setRequestInterval(newRequestInterval); setRequestIntervalValid(true); }, onInvalid: () => setRequestIntervalValid(false) }, void 0) }, void 0)) }, void 0));
}
RolandV8HDSettings.defaultProps = {
    id: "rolandV8HD",
    label: "Roland V-8HD",
};
exports.default = RolandV8HDSettings;

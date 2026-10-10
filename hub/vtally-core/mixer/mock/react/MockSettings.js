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
const MockConnector_1 = __importDefault(require("../MockConnector"));
function MockSettings(props) {
    const configuration = (0, useConfiguration_1.useMockConfiguration)();
    const [tickTime, setTickTime] = (0, react_1.useState)(null);
    const [tickTimeValid, setTickTimeValid] = (0, react_1.useState)(true);
    const [channelCount, setChannelCount] = (0, react_1.useState)(null);
    const [channelCountValid, setChannelCountValid] = (0, react_1.useState)(true);
    const [channelNames, setChannelNames] = (0, react_1.useState)(null);
    const [channelNamesValid, setChannelNamesValid] = (0, react_1.useState)(true);
    const isLoading = !configuration;
    const isValid = tickTimeValid && channelCountValid && channelNamesValid;
    const handleSave = () => {
        if (configuration === undefined) {
            console.error("Not saving, because there is an invalid value in the form.");
        }
        else if (props.id !== MockConnector_1.default.ID) {
            console.warn(`Changing id prop of MockSettings is not supported. But got ${props.id}.`);
        }
        else {
            const config = configuration.clone();
            config.setTickTime(tickTime);
            config.setChannelCount(channelCount);
            config.setChannelNames(channelNames);
            useSocket_1.socket.emit('config.change.mock', config.toJson(), MockConnector_1.default.ID);
        }
    };
    return ((0, jsx_runtime_1.jsx)(MixerSettingsWrapper_1.default, { title: "Mock Configuration", testId: "mock", description: "\n            This simulates a Video Mixer by changing the channels randomly at a fixed time interval.\n            It is intended for development, when you do not have a video mixer at hand, but serves\n            no purpose in productive environments.", canBeSaved: isValid, isLoading: isLoading, onSave: handleSave, children: configuration && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Tick Time", testId: "mock-tick", object: configuration, propertyName: "tickTime", onValid: (tickTime) => { setTickTime(tickTime); setTickTimeValid(true); }, onInvalid: () => setTickTimeValid(false) }, void 0), (0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Channel Count", testId: "mock-channelCount", object: configuration, propertyName: "channelCount", onValid: (channelCount) => { setChannelCount(channelCount); setChannelCountValid(true); }, onInvalid: () => setChannelCountValid(false) }, void 0), (0, jsx_runtime_1.jsx)(ValidatingInput_1.default, { label: "Channel Names", testId: "mock-channelNames", object: configuration, propertyName: "channelNames", onValid: (channelNames) => { setChannelNames(channelNames); setChannelNamesValid(true); }, onInvalid: () => setChannelNamesValid(false) }, void 0)] }, void 0)) }, void 0));
}
MockSettings.defaultProps = {
    id: MockConnector_1.default.ID,
    label: "Built-In Mock for testing",
};
exports.default = MockSettings;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const MixerSettingsWrapper_1 = __importDefault(require("../../../components/config/MixerSettingsWrapper"));
const useSocket_1 = require("../../../hooks/useSocket");
const TestConfiguration_1 = __importDefault(require("../TestConfiguration"));
function TestSettings(props) {
    const handleSave = () => {
        if (props.id !== "test") {
            console.warn(`Changing id prop of TestSettings is not supported. But got ${props.id}.`);
        }
        else {
            useSocket_1.socket.emit('config.change.test', new TestConfiguration_1.default(), "test");
        }
    };
    return ((0, jsx_runtime_1.jsx)(MixerSettingsWrapper_1.default, { title: "Test Configuration", testId: "test", description: "A mixer used for automatic testing. You should never have to select it manually.", onSave: handleSave }, void 0));
}
TestSettings.defaultProps = {
    id: "test",
    label: "Test Mixer"
};
exports.default = TestSettings;

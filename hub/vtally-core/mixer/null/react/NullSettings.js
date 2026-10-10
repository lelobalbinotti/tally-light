"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const MixerSettingsWrapper_1 = __importDefault(require("../../../components/config/MixerSettingsWrapper"));
const useSocket_1 = require("../../../hooks/useSocket");
const NullConnector_1 = __importDefault(require("../NullConnector"));
function NullSettings(props) {
    const handleSave = () => {
        if (props.id !== NullConnector_1.default.ID) {
            console.warn(`Changing id prop of NullSettings is not supported. But got ${props.id}.`);
        }
        else {
            useSocket_1.socket.emit('config.change.null', NullConnector_1.default.ID);
        }
    };
    return ((0, jsx_runtime_1.jsx)(MixerSettingsWrapper_1.default, { title: "Null Configuration", testId: "null", description: "Off", onSave: handleSave }, void 0));
}
NullSettings.defaultProps = {
    id: NullConnector_1.default.ID,
    label: "Off"
};
exports.default = NullSettings;

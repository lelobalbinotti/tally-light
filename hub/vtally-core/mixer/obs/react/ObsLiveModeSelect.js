"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const ObsConfiguration_1 = __importDefault(require("../ObsConfiguration"));
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        root: {
            marginBottom: theme.spacing(2)
        }
    };
});
const options = {
    always: {
        label: "Always",
        help: "",
    },
    stream: {
        label: "Only when streaming",
        help: "Tally Lights will not show on-air status unless OBS is streaming.",
    },
    record: {
        label: "Only when recording",
        help: "Tally Lights will not show on-air status unless OBS is recording.",
    },
    streamOrRecord: {
        label: "When recording or streaming",
        help: "Tally Lights will not show on-air status unless OBS is recording or streaming.",
    },
};
function ObsLiveModeSelect({ label, testId, value, onChange }) {
    const classes = useStyles();
    const currentOption = options[value];
    const handleChange = e => {
        const value = e.target.value.toString();
        if (ObsConfiguration_1.default.isValidLiveMode(value)) {
            onChange(value);
        }
    };
    return (0, jsx_runtime_1.jsxs)("div", { className: classes.root, children: [(0, jsx_runtime_1.jsx)(core_1.TextField, { select: true, "data-testid": testId, label: label, value: value, onChange: handleChange, children: Object.keys(options).map(key => {
                    const label = options[key].label;
                    return (0, jsx_runtime_1.jsx)("option", { value: key, label: label }, key);
                }) }, void 0), currentOption && currentOption.help && ((0, jsx_runtime_1.jsx)(core_1.FormHelperText, { disabled: true, children: currentOption.help }, void 0))] }, void 0);
}
exports.default = ObsLiveModeSelect;

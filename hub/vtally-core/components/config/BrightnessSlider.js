"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = require("react");
const useStyle = (0, core_1.makeStyles)(theme => ({
    slider: {
        padding: theme.spacing(2, 0, 0, 0)
    },
    sliderDisabled: {
        "&.MuiSlider-root": {
            color: (0, core_1.darken)(theme.palette.common.white, 0.6)
        }
    },
}));
const marks = [
    { value: 0 },
    { value: 20 },
    { value: 40 },
    { value: 60 },
    { value: 80 },
    { value: 100 },
];
function BrightnessSlider({ value, testId, onChange, minValue, minMessage, disabled }) {
    minValue = minValue || 0;
    disabled = disabled || false;
    const [isFocused, setFocused] = (0, react_1.useState)(false);
    const classes = useStyle();
    const handleChange = (e, value) => {
        value = Math.max(value, minValue);
        onChange && onChange(value);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: classes.slider, children: [(0, jsx_runtime_1.jsx)(core_1.Slider, { "data-testid": testId, value: value, min: 0, max: 100, marks: marks, disabled: disabled, color: "primary", valueLabelDisplay: "auto", valueLabelFormat: val => val === 0 ? "off" : `${val}%`, onChange: handleChange, onFocus: () => setFocused(true), onBlur: () => setFocused(false), classes: { disabled: classes.sliderDisabled } }, void 0), minMessage && isFocused && value === minValue && ((0, jsx_runtime_1.jsx)(core_1.FormHelperText, { disabled: true, children: minMessage }, void 0))] }, void 0));
}
exports.default = BrightnessSlider;

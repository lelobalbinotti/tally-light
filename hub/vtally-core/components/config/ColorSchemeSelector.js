"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = require("react");
const ColorScheme_1 = __importDefault(require("../../tally/ColorScheme"));
const ChipLikeButton_1 = __importDefault(require("../ChipLikeButton"));
const useStyle = (0, core_1.makeStyles)(theme => ({
    root: {
        "&:hover $previewContainer": {
            opacity: 1
        }
    },
    selection: {
        display: "flex",
        verticalAlign: "center",
        justifyContent: "space-between",
    },
    buttonGroup: {
        display: "inline-block",
        marginBottom: theme.spacing(1),
    },
    button: {
        marginRight: theme.spacing(1),
    },
    preview: {
        padding: theme.spacing(1, 1.6),
        display: "inline-block",
        height: "1em",
        width: "1em",
        verticalAlign: "middle",
        boxSizing: "content-box",
        border: "solid 1px " + theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
        "&:not(:last-child)": {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: "none",
        },
        "&:not(:first-child)": {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },
    },
    previewContainer: {
        opacity: 1,
        transition: "opacity .5s"
    },
    previewContainerDim: {
        opacity: 0,
    }
}));
function ColorSchemeSelector({ value, onChange, disabled, testId }) {
    const classes = useStyle();
    const schemes = ColorScheme_1.default.getAll();
    const [focusTracker, setFocusTracker] = (0, react_1.useState)(new Map(schemes.map(scheme => [scheme.id, false])));
    const isFocussed = !!Array.from(focusTracker.values()).find(bool => bool);
    const selectedScheme = value !== undefined ? ColorScheme_1.default.getById(value) : undefined;
    const handleFocus = (scheme) => {
        const newTracker = new Map(focusTracker);
        newTracker.set(scheme.id, true);
        setFocusTracker(newTracker);
    };
    const handleBlur = (scheme) => {
        const newTracker = new Map(focusTracker);
        newTracker.set(scheme.id, false);
        setFocusTracker(newTracker);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: classes.root, "data-testid": testId, "data-value": value, children: [(0, jsx_runtime_1.jsxs)("div", { className: classes.selection, children: [(0, jsx_runtime_1.jsx)("div", { className: classes.buttonGroup, children: schemes.map(scheme => {
                            const isSelected = scheme.id === value;
                            return ((0, jsx_runtime_1.jsx)(ChipLikeButton_1.default, { className: classes.button, "data-testid": `${testId}-${scheme.id}`, "data-value": value, selected: isSelected, onClick: () => { onChange(scheme.id); }, onFocus: () => { handleFocus(scheme); }, onBlur: () => { handleBlur(scheme); }, disabled: disabled, children: scheme.name }, scheme.id));
                        }) }, void 0), selectedScheme && ((0, jsx_runtime_1.jsxs)("div", { className: classes.previewContainer + (isFocussed ? "" : (" " + classes.previewContainerDim)), children: [(0, jsx_runtime_1.jsx)(core_1.Tooltip, { title: "On-Air color", children: (0, jsx_runtime_1.jsx)("span", { className: classes.preview, style: { backgroundColor: selectedScheme.program.toCss() } }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { title: "Preview color", children: (0, jsx_runtime_1.jsx)("span", { className: classes.preview, style: { backgroundColor: selectedScheme.preview.toCss() } }, void 0) }, void 0)] }, void 0))] }, void 0), selectedScheme && selectedScheme.description ? ((0, jsx_runtime_1.jsx)(core_1.FormHelperText, { disabled: true, children: selectedScheme.description }, void 0)) : ""] }, void 0));
}
exports.default = ColorSchemeSelector;

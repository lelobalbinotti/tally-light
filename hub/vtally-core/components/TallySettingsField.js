"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const ChipLikeButton_1 = __importDefault(require("./ChipLikeButton"));
const useStyle = (0, core_1.makeStyles)((theme) => ({
    label: {
        color: theme.palette.common.white,
    },
    labels: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
    }
}));
function TallySettingsField({ label, testId, isDefault, children, className, onChange }) {
    const classes = useStyle();
    return (0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsxs)("div", { className: classes.labels, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { variant: "h6", paragraph: true, className: classes.label, children: label }, void 0), (0, jsx_runtime_1.jsx)(ChipLikeButton_1.default, { "data-testid": `${testId}-toggle`, size: "small", selected: isDefault, onClick: () => onChange(!isDefault), children: isDefault ? "default" : "custom" }, void 0)] }, void 0), children] }, void 0);
}
exports.default = TallySettingsField;

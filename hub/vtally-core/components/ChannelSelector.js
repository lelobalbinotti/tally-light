"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const useStyles = (0, core_1.makeStyles)(theme => ({
    root: {
        display: "block",
        overflow: "hidden",
        marginBottom: theme.spacing(2),
    },
    select: {
        paddingTop: theme.spacing(1),
    },
}));
const ChannelSelector = ({ channels, value = null, onChange }) => {
    channels = channels || [];
    const classes = useStyles();
    const handleValueChange = (e) => {
        let val = e.target.value.toString();
        if (val === "") {
            val = null;
        }
        if (onChange) {
            onChange(val);
        }
    };
    let optionFound = value === null;
    return ((0, jsx_runtime_1.jsxs)(core_1.Select, { "data-testid": "channel-selector", native: true, autoWidth: true, className: classes.root, classes: { select: classes.select }, value: value || "", onChange: handleValueChange, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "(unpatched)" }, null), channels.map(c => {
                if (c.id === value) {
                    optionFound = true;
                }
                return (0, jsx_runtime_1.jsx)("option", { value: c.id, children: c.name || `Channel ${c.id}` }, c.id);
            }), !optionFound && value !== undefined ? ((0, jsx_runtime_1.jsxs)("option", { value: value, children: ["Channel ", value] }, value)) : ""] }, void 0));
};
exports.default = ChannelSelector;

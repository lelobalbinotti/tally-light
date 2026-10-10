"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const useStyles = (0, core_1.makeStyles)((theme) => ({
    root: {
        display: "block",
        margin: "0 auto",
    }
}));
function Spinner() {
    const classes = useStyles();
    return ((0, jsx_runtime_1.jsx)(core_1.CircularProgress, { classes: { root: classes.root }, color: "inherit" }, void 0));
}
exports.default = Spinner;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const useStyles = (0, core_1.makeStyles)(theme => ({
    root: {
        padding: theme.spacing(0, 2),
        height: theme.spacing(4),
        borderRadius: theme.spacing(4) / 2,
        textTransform: "none",
        fontWeight: "normal",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        fontSize: "0.8125rem",
    },
    contained: {
        color: theme.palette.common.white,
        backgroundColor: (0, core_1.fade)(theme.palette.common.white, 0.25),
        "&:hover, &:focus, &:active": {
            backgroundColor: (0, core_1.fade)(theme.palette.common.white, 0.4),
        }
    },
    containedPrimary: {
        color: theme.palette.getContrastText(theme.palette.primary.main),
        backgroundColor: theme.palette.primary.main,
        "&:hover, &:focus, &:active": {
            backgroundColor: (0, core_1.lighten)(theme.palette.primary.main, 0.25),
        },
        "&.Mui-disabled": {
            backgroundColor: (0, core_1.fade)(theme.palette.primary.main, 0.4),
        },
    },
    containedSecondary: {
        color: theme.palette.getContrastText(theme.palette.secondary.main),
        backgroundColor: theme.palette.secondary.main,
        "&:hover, &:focus, &:active": {
            backgroundColor: (0, core_1.lighten)(theme.palette.secondary.main, 0.25),
        },
        "&.Mui-disabled": {
            backgroundColor: (0, core_1.fade)(theme.palette.secondary.main, 0.4),
        },
    }
}));
// A button that looks like a [Chip](https://material-ui.com/components/chips/#chip)
function ChipLikeButton(props) {
    const classes = useStyles();
    return ((0, jsx_runtime_1.jsx)(core_1.Button, { "data-selected": props.selected, variant: "contained", disableElevation: true, color: props.selected ? "primary" : "default", classes: classes, ...props }, void 0));
}
exports.default = ChipLikeButton;

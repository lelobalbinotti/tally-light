"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        root: {
            marginBottom: theme.spacing(2),
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            padding: theme.spacing(1, 2),
            borderBottom: "1px solid " + theme.palette.background.default,
        },
        content: (props) => ({
            padding: theme.spacing(2, props.contentPadding || 2),
        })
    };
});
function MiniPage({ title, addHeaderContent, contentPadding, testId, children }) {
    const classes = useStyles({
        contentPadding
    });
    return ((0, jsx_runtime_1.jsx)(core_1.Container, { className: classes.root, maxWidth: "sm", "data-testid": testId, children: (0, jsx_runtime_1.jsxs)(core_1.Paper, { children: [(0, jsx_runtime_1.jsxs)("div", { className: classes.header, children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { variant: "h1", children: title }, void 0), addHeaderContent] }, void 0), (0, jsx_runtime_1.jsx)("div", { className: classes.content, children: children }, void 0)] }, void 0) }, void 0));
}
exports.default = MiniPage;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_router_dom_1 = require("react-router-dom");
const useStyles = (0, core_1.makeStyles)(theme => {
    return {
        logo: {
            height: theme.typography.h2.fontSize,
            margin: theme.spacing(1, 2, 2, 0)
        },
        contentContainer: {
            marginTop: theme.spacing(2),
        },
    };
});
const Layout = ({ testId: cypressId, children }) => {
    const classes = useStyles();
    return ((0, jsx_runtime_1.jsxs)("div", { "data-testid": `page-${cypressId}`, children: [(0, jsx_runtime_1.jsx)(core_1.AppBar, { position: "static", children: (0, jsx_runtime_1.jsxs)(core_1.Toolbar, { children: [(0, jsx_runtime_1.jsx)("img", { width: "38", height: "38", style: { borderRadius: "8px", marginRight: "16px" }, src: "/vtally_logo.png", alt: "vTally Light" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Button, { component: react_router_dom_1.Link, to: "/", children: "Tallies" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Button, { component: react_router_dom_1.Link, to: "/config", children: "Configurações" }, void 0), (0, jsx_runtime_1.jsx)(core_1.Button, { component: react_router_dom_1.Link, to: "/flasher", children: "Configurar Tally" }, void 0)] }, void 0) }, void 0), children && ((0, jsx_runtime_1.jsx)(core_1.Container, { maxWidth: false, className: classes.contentContainer, children: children }, void 0))] }, void 0));
};
exports.default = Layout;

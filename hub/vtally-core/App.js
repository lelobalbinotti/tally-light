"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const MyTheme_1 = __importDefault(require("./components/layout/MyTheme"));
const core_1 = require("@material-ui/core");
const react_router_dom_1 = require("react-router-dom");
const IndexPage_1 = __importDefault(require("./pages/IndexPage"));
const ConfigPage_1 = __importDefault(require("./pages/ConfigPage"));
const TallyLogPage_1 = __importDefault(require("./pages/TallyLogPage"));
const WebTallyPage_1 = __importDefault(require("./pages/WebTallyPage"));
const FlasherPage_1 = __importDefault(require("./pages/FlasherPage"));
function App() {
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)(MyTheme_1.default, { children: [(0, jsx_runtime_1.jsx)(core_1.CssBaseline, {}, void 0), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Switch, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { exact: true, path: "/tally/:tallyId", children: (0, jsx_runtime_1.jsx)(WebTallyPage_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { exact: true, path: "/tally/:tallyId/log", children: (0, jsx_runtime_1.jsx)(TallyLogPage_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { exact: true, path: "/config", children: (0, jsx_runtime_1.jsx)(ConfigPage_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { exact: true, path: "/flasher", children: (0, jsx_runtime_1.jsx)(FlasherPage_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", children: (0, jsx_runtime_1.jsx)(IndexPage_1.default, {}, void 0) }, void 0)] }, void 0)] }, void 0) }, void 0));
}
exports.default = App;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = __importStar(require("react"));
const Subject_1 = __importDefault(require("@material-ui/icons/Subject"));
const Delete_1 = __importDefault(require("@material-ui/icons/Delete"));
const Highlight_1 = __importDefault(require("@material-ui/icons/Highlight"));
const MoreVert_1 = __importDefault(require("@material-ui/icons/MoreVert"));
const Link_1 = __importDefault(require("@material-ui/icons/Link"));
const Tune_1 = __importDefault(require("@material-ui/icons/Tune"));
const useSocket_1 = require("../hooks/useSocket");
const react_router_dom_1 = require("react-router-dom");
const TallySettings_1 = __importDefault(require("./TallySettings"));
// @see https://material-ui.com/de/guides/composition/#list
function MenuItemLink(props) {
    const { children, to, testid } = props;
    const renderLink = react_1.default.useMemo(() => react_1.default.forwardRef((itemProps, ref) => ((0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: to, ref: ref, ...itemProps }, void 0))), [to]);
    return ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(core_1.MenuItem, { "data-testid": testid, component: renderLink, children: children }, void 0) }, void 0));
}
function TallyMenu({ tally, className }) {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const [settingsOpen, setSettingsOpen] = (0, react_1.useState)(false);
    const allowHighlight = tally.isActive();
    const allowRemove = !tally.isConnected();
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleHighlightTally = (e) => {
        e.preventDefault();
        if (!allowHighlight) {
            return;
        }
        useSocket_1.socket.emit('tally.highlight', tally.name, tally.type);
        handleClose();
    };
    const handleRemoveTally = (e) => {
        e.preventDefault();
        if (!allowRemove) {
            return;
        }
        useSocket_1.socket.emit('tally.remove', tally.name, tally.type);
        handleClose();
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { "data-testid": `tally-${tally.name}-menu`, className: className, children: [(0, jsx_runtime_1.jsx)(core_1.IconButton, { size: "small", title: `${tally.name} Menu`, "aria-controls": "menu", "aria-haspopup": "true", onClick: handleMenuClick, children: (0, jsx_runtime_1.jsx)(MoreVert_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsxs)(core_1.Menu, { id: "menu", anchorEl: anchorEl, keepMounted: true, open: Boolean(anchorEl), onClose: handleClose, children: [tally.isWebTally() && ((0, jsx_runtime_1.jsxs)(MenuItemLink, { testid: `tally-${tally.name}-web`, to: `/tally/${tally.getId()}`, children: [(0, jsx_runtime_1.jsx)(core_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(Link_1.default, { fontSize: "small" }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.ListItemText, { children: "Connect" }, void 0)] }, void 0)), (0, jsx_runtime_1.jsxs)(core_1.MenuItem, { "data-testid": `tally-${tally.name}-settings`, onClick: () => { handleClose(); setSettingsOpen(true); }, children: [(0, jsx_runtime_1.jsx)(core_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(Tune_1.default, { fontSize: "small" }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.ListItemText, { children: "Settings" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(TallySettings_1.default, { tally: tally, open: settingsOpen, onClose: () => setSettingsOpen(false) }, void 0), (0, jsx_runtime_1.jsxs)(MenuItemLink, { testid: `tally-${tally.name}-logs`, to: `/tally/${tally.getId()}/log`, children: [(0, jsx_runtime_1.jsx)(core_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(Subject_1.default, { fontSize: "small" }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.ListItemText, { children: "Logs" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { "data-testid": `tally-${tally.name}-highlight`, title: !allowHighlight ? "Tally is not connected" : "", children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(core_1.MenuItem, { component: "div", disabled: !allowHighlight, onClick: handleHighlightTally, children: [(0, jsx_runtime_1.jsx)(core_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(Highlight_1.default, { fontSize: "small" }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.ListItemText, { children: "Highlight" }, void 0)] }, void 0) }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.Tooltip, { "data-testid": `tally-${tally.name}-remove`, title: !allowRemove ? "Connected Tallies can not be removed" : "", children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(core_1.MenuItem, { disabled: !allowRemove, onClick: handleRemoveTally, children: [(0, jsx_runtime_1.jsx)(core_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(Delete_1.default, { fontSize: "small" }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(core_1.ListItemText, { children: "Remove" }, void 0)] }, void 0) }, void 0) }, void 0)] }, void 0)] }, void 0));
}
exports.default = TallyMenu;

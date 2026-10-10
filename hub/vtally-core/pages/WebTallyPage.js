"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("react-router");
const useSocket_1 = require("../hooks/useSocket");
const Tally_1 = require("../domain/Tally");
const core_1 = require("@material-ui/core");
const react_router_dom_1 = require("react-router-dom");
const Fullscreen_1 = __importDefault(require("@material-ui/icons/Fullscreen"));
const FullscreenExit_1 = __importDefault(require("@material-ui/icons/FullscreenExit"));
const react_full_screen_1 = require("react-full-screen");
const Tune_1 = __importDefault(require("@material-ui/icons/Tune"));
const nosleep_js_1 = __importDefault(require("nosleep.js"));
const PageNotFound_1 = __importDefault(require("./PageNotFound"));
const TallySettings_1 = __importDefault(require("../components/TallySettings"));
const useConfiguration_1 = require("../hooks/useConfiguration");
const ColorScheme_1 = __importDefault(require("../tally/ColorScheme"));
const useStyles = (0, core_1.makeStyles)((theme) => ({
    root: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[800],
        color: (0, core_1.fade)(theme.palette.getContrastText(theme.palette.grey[800]), 0.7)
    },
    '@keyframes highlight': {
        from: {
            backgroundColor: '#fff',
            color: (0, core_1.fade)(theme.palette.getContrastText('#fff'), 0.7)
        },
        "50%": {
            backgroundColor: '#000',
            color: (0, core_1.fade)(theme.palette.getContrastText('#000'), 0.7)
        },
        to: {
            backgroundColor: '#fff',
            color: (0, core_1.fade)(theme.palette.getContrastText('#fff'), 0.7)
        },
    },
    highlight: {
        animationName: '$highlight',
        animationDuration: '0.25s',
        animationTimingFunction: 'step-start',
        animationIterationCount: 'infinite',
        backgroundColor: '#000',
        color: (0, core_1.fade)(theme.palette.getContrastText('#000'), 0.7)
    },
    spinner: {
        width: "30vw",
        height: "30vh",
    },
    name: {
        color: "inherit",
    },
    fullscreenIcon: {
        color: "inherit",
        position: "absolute",
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
    settingsIcon: {
        color: "inherit",
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(2),
    }
}));
function useWebTally(tallyName) {
    const [tally, setTally] = (0, react_1.useState)();
    const [command, setCommand] = (0, react_1.useState)();
    const [isValid, setIsValid] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        const onChange = ({ tally: tallyData, command }) => {
            const tally = Tally_1.WebTally.fromJson(tallyData);
            setTally(tally);
            setCommand(command);
        };
        const onInvalid = (theTallyName) => {
            if (tallyName === theTallyName) {
                setTally(undefined);
                setCommand(undefined);
                setIsValid(false);
            }
        };
        const onDisconnect = () => {
            useSocket_1.socket.off('webTally.state', onChange);
            useSocket_1.socket.off('webTally.invalid', onInvalid);
            useSocket_1.socket.connected && useSocket_1.socket.emit('events.webTally.unsubscribe', tallyName);
            setTally(undefined);
            setCommand(undefined);
            setIsValid(true);
        };
        const onConnect = () => {
            useSocket_1.socket.emit('events.webTally.subscribe', tallyName);
            useSocket_1.socket.on('webTally.state', onChange);
            useSocket_1.socket.on('webTally.invalid', onInvalid);
        };
        useSocket_1.socket.on('connect', onConnect);
        useSocket_1.socket.on('disconnect', onDisconnect);
        useSocket_1.socket.connected && onConnect();
        return () => {
            // cleanup
            onDisconnect();
        };
    }, [tallyName]);
    return {
        tally,
        command,
        isValid,
    };
}
function WebTallyPage() {
    var _a, _b;
    const { tallyId } = (0, react_router_dom_1.useParams)();
    const tallyName = tallyId.replace(/^web-/, "");
    const { tally, command, isValid } = useWebTally(tallyName);
    const defaultTallyConfiguration = (0, useConfiguration_1.useDefaultTallyConfiguration)();
    const [settingsOpen, setSettingsOpen] = (0, react_1.useState)(false);
    const isLoading = !tally || !command;
    const classes = useStyles();
    const theme = (0, core_1.useTheme)();
    const handle = (0, react_full_screen_1.useFullScreenHandle)();
    // @TODO: nosleep is quite hacky, so use https://caniuse.com/?search=Wake%20Lock%20API sooner or later
    const [noSleep] = (0, react_1.useState)(new nosleep_js_1.default());
    (0, react_1.useEffect)(() => {
        return () => {
            // make sure no-sleep is turned off when unmounted
            noSleep.disable();
        };
    }, [noSleep]);
    if (isValid === false) {
        return (0, jsx_runtime_1.jsxs)(PageNotFound_1.default, { children: ["Tally with name ", (0, jsx_runtime_1.jsx)("strong", { children: tallyName }, void 0), " not found."] }, void 0);
    }
    const colorSchemeId = ((_a = tally === null || tally === void 0 ? void 0 : tally.configuration) === null || _a === void 0 ? void 0 : _a.getOperatorColorScheme()) || (defaultTallyConfiguration === null || defaultTallyConfiguration === void 0 ? void 0 : defaultTallyConfiguration.getOperatorColorScheme()) || "default";
    const colorScheme = ColorScheme_1.default.getById(colorSchemeId);
    const classRoot = [classes.root];
    let dataColor = "";
    let bgColor = theme.palette.grey[800];
    let text = "";
    let showSpinner = false;
    if (isLoading) {
        dataColor = "loading";
        text = "Waiting for data";
        showSpinner = true;
    }
    else if (command === "highlight") {
        classRoot.push(classes.highlight);
        dataColor = "highlight";
        text = "Highlight";
    }
    else if (command === "on-air") {
        bgColor = colorScheme.program.toCss();
        text = "On Program";
        dataColor = "program";
    }
    else if (command === "preview") {
        bgColor = colorScheme.preview.toCss();
        text = "On Preview";
        dataColor = "preview";
    }
    else if (command === "release") {
        bgColor = colorScheme.idle.toCss();
        dataColor = "idle";
        text = "Idle";
    }
    else if (command === "unknown") {
        dataColor = "unknown";
        text = "No connection to Mixer";
        showSpinner = true;
    }
    else {
        // if typescript fails here, we forgot a case
        ((a) => { })(command);
    }
    const brightness = (((_b = tally === null || tally === void 0 ? void 0 : tally.configuration) === null || _b === void 0 ? void 0 : _b.getOperatorLightBrightness()) || (defaultTallyConfiguration === null || defaultTallyConfiguration === void 0 ? void 0 : defaultTallyConfiguration.getOperatorLightBrightness()) || 100) / 100;
    bgColor = (0, core_1.darken)(bgColor, 1 - brightness);
    const textColor = theme.palette.getContrastText(bgColor);
    const enterFullScreen = () => {
        noSleep.enable();
        handle.enter();
    };
    const exitFullScreen = () => {
        noSleep.disable();
        handle.exit();
    };
    return (0, jsx_runtime_1.jsx)(react_full_screen_1.FullScreen, { handle: handle, children: (0, jsx_runtime_1.jsxs)("div", { "data-testid": "page-tally-web", "data-color": dataColor, "data-brightness": brightness, className: classRoot.join(" "), style: { backgroundColor: bgColor, color: textColor }, children: [showSpinner ? ((0, jsx_runtime_1.jsx)(core_1.CircularProgress, { className: classes.spinner, color: "inherit", size: "min(30vw, 30vh)" }, void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(core_1.Typography, { component: "div", variant: "h1", className: classes.name, children: (tally && tally.name) || "" }, void 0), (0, jsx_runtime_1.jsx)(core_1.IconButton, { "data-testid": "tally-settings-link", className: classes.settingsIcon, "aria-label": "Show settings", onClick: () => setSettingsOpen(true), children: (0, jsx_runtime_1.jsx)(Tune_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)(TallySettings_1.default, { tally: tally, open: settingsOpen, onClose: () => setSettingsOpen(false) }, void 0), handle.active ? ((0, jsx_runtime_1.jsx)(core_1.IconButton, { className: classes.fullscreenIcon, "aria-label": "Exit fullscreen", onClick: exitFullScreen, children: (0, jsx_runtime_1.jsx)(FullscreenExit_1.default, {}, void 0) }, void 0)) : ((0, jsx_runtime_1.jsx)(core_1.IconButton, { className: classes.fullscreenIcon, "aria-label": "Enter fullscreen", onClick: enterFullScreen, children: (0, jsx_runtime_1.jsx)(Fullscreen_1.default, {}, void 0) }, void 0))] }, void 0)), text && (0, jsx_runtime_1.jsx)(core_1.Typography, { component: "div", children: text }, void 0)] }, void 0) }, void 0);
}
exports.default = (0, react_router_1.withRouter)(WebTallyPage);

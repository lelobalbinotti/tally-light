"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Layout_1 = __importDefault(require("../components/layout/Layout"));
const AtemSettings_1 = __importDefault(require("../mixer/atem/react/AtemSettings"));
const MixerSelection_1 = __importDefault(require("../components/config/MixerSelection"));
const NullSettings_1 = __importDefault(require("../mixer/null/react/NullSettings"));
const MockSettings_1 = __importDefault(require("../mixer/mock/react/MockSettings"));
const ObsSettings_1 = __importDefault(require("../mixer/obs/react/ObsSettings"));
const RolandV8HDSettings_1 = __importDefault(require("../mixer/rolandV8HD/react/RolandV8HDSettings"));
const RolandV60HDSettings_1 = __importDefault(require("../mixer/rolandV60HD/react/RolandV60HDSettings"));
const TestSettings_1 = __importDefault(require("../mixer/test/react/TestSettings"));
const VmixSettings_1 = __importDefault(require("../mixer/vmix/react/VmixSettings"));
const TallySettings_1 = __importDefault(require("../components/config/TallySettings"));
const ConfigPage = () => {
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { testId: "config", children: [(0, jsx_runtime_1.jsxs)(MixerSelection_1.default, { children: [(0, jsx_runtime_1.jsx)(NullSettings_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(AtemSettings_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(MockSettings_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(ObsSettings_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(RolandV8HDSettings_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(RolandV60HDSettings_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(TestSettings_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(VmixSettings_1.default, {}, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(TallySettings_1.default, {}, void 0)] }, void 0));
};
exports.default = ConfigPage;

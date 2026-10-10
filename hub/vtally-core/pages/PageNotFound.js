"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Layout_1 = __importDefault(require("../components/layout/Layout"));
const MiniPage_1 = __importDefault(require("../components/layout/MiniPage"));
const PageNotFound = ({ children }) => {
    return ((0, jsx_runtime_1.jsx)(Layout_1.default, { testId: "404", children: (0, jsx_runtime_1.jsx)(MiniPage_1.default, { title: "Page Not Found", children: children }, void 0) }, void 0));
};
exports.default = PageNotFound;

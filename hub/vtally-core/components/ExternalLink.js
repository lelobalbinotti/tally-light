"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
function ExternalLink(props) {
    const myProps = { ...props, ...{
            target: "_blank",
            rel: "noreferrer noopener",
        } };
    return ((0, jsx_runtime_1.jsx)(core_1.Link, { ...myProps }, void 0));
}
exports.default = ExternalLink;

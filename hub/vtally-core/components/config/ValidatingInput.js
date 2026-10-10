"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const react_1 = require("react");
const useStyles = (0, core_1.makeStyles)(theme => ({
    input: {
        margin: theme.spacing(0, 2, 2, 0)
    }
}));
const upperCaseFirst = (value) => `${value.substr(0, 1).toUpperCase()}${value.substr(1)}`;
/* an active component that allows easy editing of values of Configuration objects
 *
 * It validates values by trying to call the setter on the object. If it does not throw an error
 * the value is assumed to be valid.
 */
function ValidatingInput({ label, testId, object, propertyName, errorMessage, onValid, onInvalid }) {
    const getterName = `get${upperCaseFirst(propertyName)}`;
    const setterName = `set${upperCaseFirst(propertyName)}`;
    if (typeof object[getterName] !== "function") {
        throw new Error(`${getterName} is not a function`);
    }
    if (typeof object[setterName] !== "function") {
        throw new Error(`${setterName} is not a function`);
    }
    const theObjectValue = object[getterName]().toString();
    const [oldValue, setOldValue] = (0, react_1.useState)(null);
    const [value, setValue] = (0, react_1.useState)(null);
    const [isValid, setIsValid] = (0, react_1.useState)(true);
    const classes = useStyles();
    if (theObjectValue !== oldValue) {
        // value in the default object was changed
        setOldValue(theObjectValue);
        setValue(theObjectValue);
        setIsValid(true);
        // we can not render a parent synchrounously
        onValid && setTimeout(() => onValid(theObjectValue), 1);
    }
    const handleChange = (e) => {
        const newValue = e.target.value === "" ? null : e.target.value;
        setValue(newValue);
        try {
            object.clone()[setterName](newValue);
            setIsValid(true);
            onValid && onValid(newValue);
        }
        catch (e) {
            setIsValid(false);
            onInvalid && onInvalid();
        }
    };
    return ((0, jsx_runtime_1.jsx)(core_1.TextField, { "data-testid": testId, label: label, value: value, onChange: handleChange, error: !isValid, helperText: !isValid ? (errorMessage || "invalid") : "", className: classes.input }, void 0));
}
exports.default = ValidatingInput;

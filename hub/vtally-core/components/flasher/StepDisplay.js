"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const core_1 = require("@material-ui/core");
const Cancel_1 = __importDefault(require("@material-ui/icons/Cancel"));
const CheckCircle_1 = __importDefault(require("@material-ui/icons/CheckCircle"));
const PauseCircleFilledRounded_1 = __importDefault(require("@material-ui/icons/PauseCircleFilledRounded"));
const useStyles = (0, core_1.makeStyles)((theme) => {
    return {
        iconCompleted: {
            color: theme.palette.success.dark,
        },
        iconError: {
            color: theme.palette.error.main,
        },
        iconCurrent: {
            color: theme.palette.primary.main,
        },
        vertical: {
            "& .MuiStepConnector-root": {
                margin: theme.spacing(0, 0, 0, 1.5),
                padding: theme.spacing(0.5, 0),
            },
            "& .MuiStepConnector-line": {
                minHeight: theme.spacing(1.5),
                borderLeftWidth: theme.spacing(0.5),
                borderColor: (0, core_1.fade)(theme.palette.common.white, 0.7),
            },
        },
    };
});
function TheStepIcon({ step, classCurrent, classDone, classError }) {
    if (step.error) {
        return (0, jsx_runtime_1.jsx)(Cancel_1.default, { className: classError }, void 0);
    }
    else if (step.done) {
        return (0, jsx_runtime_1.jsx)(CheckCircle_1.default, { className: classDone }, void 0);
    }
    else if (step.active) {
        return (0, jsx_runtime_1.jsx)(core_1.CircularProgress, { thickness: 7.2, style: { width: "1.71em", height: "1.71em" } }, void 0);
    }
    else {
        return (0, jsx_runtime_1.jsx)(PauseCircleFilledRounded_1.default, { className: classCurrent }, void 0);
    }
}
function StepDisplay({ steps }) {
    const classes = useStyles();
    const currentStep = Math.max(steps.findIndex(step => step.done === false), 0);
    return (0, jsx_runtime_1.jsx)(core_1.Stepper, { activeStep: currentStep, orientation: "vertical", classes: { vertical: classes.vertical }, children: steps.map(step => (0, jsx_runtime_1.jsx)(core_1.Step, { completed: step.done, "data-testid": `progress-step-${step.id}`, "data-done": step.done ? "true" : "false", children: (0, jsx_runtime_1.jsxs)(core_1.StepLabel, { StepIconProps: {
                    icon: (0, jsx_runtime_1.jsx)(TheStepIcon, { step: step, classDone: classes.iconCompleted, classError: classes.iconError, classCurrent: classes.iconCurrent }, void 0),
                    classes: {
                        completed: classes.iconCompleted
                    }
                }, error: step.error, children: [step.label, step.max && (step.active || step.done) && ` (${step.current}/${step.max})`] }, void 0) }, step.id)) }, void 0);
}
exports.default = StepDisplay;

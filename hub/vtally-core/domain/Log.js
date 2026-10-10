"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.Severity = void 0;
var Severity;
(function (Severity) {
    Severity[Severity["INFO"] = 0] = "INFO";
    Severity[Severity["WARNING"] = 1] = "WARNING";
    Severity[Severity["ERROR"] = 2] = "ERROR";
    Severity[Severity["STATUS"] = 3] = "STATUS";
})(Severity = exports.Severity || (exports.Severity = {}));
class Log {
    constructor(dateTime, severity, message) {
        if (typeof dateTime === "string") {
            this.dateTime = new Date(dateTime);
        }
        else if (dateTime instanceof Date) {
            this.dateTime = dateTime;
        }
        else {
            this.dateTime = new Date();
        }
        if (typeof severity === "number") {
            this.severity = severity;
        }
        else if (severity === "INFO") {
            this.severity = Severity.INFO;
        }
        else if (severity === "ERROR") {
            this.severity = Severity.ERROR;
        }
        else if (severity === "WARN") {
            this.severity = Severity.WARNING;
        }
        else {
            this.severity = Severity.STATUS;
        }
        this.message = message;
    }
    isError() {
        return this.severity === Severity.ERROR;
    }
    isWarning() {
        return this.severity === Severity.WARNING;
    }
    isInfo() {
        return this.severity === Severity.INFO;
    }
    isStatus() {
        return this.severity === Severity.STATUS;
    }
    toJson() {
        return {
            date: this.dateTime.toISOString(),
            severity: this.severity,
            message: this.message
        };
    }
}
exports.Log = Log;
Log.fromJson = function (valueObject) {
    return new Log(valueObject.date, valueObject.severity, valueObject.message);
};
exports.default = Log;

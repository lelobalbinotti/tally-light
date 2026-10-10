"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
class AppConfigurationPersistence {
    constructor(configuration, emitter, fileName) {
        this.configuration = configuration;
        this.emitter = emitter;
        this.fileName = fileName || process.env.CONFIG_FILE || (os_1.default.homedir() + "/.wifi-tally.json");
        this.load();
        this.emitter.on("config.changed", config => {
            if (config === this.configuration) {
                this.scheduleSave();
            }
        });
    }
    getConfiguration() {
        return this.configuration;
    }
    load() {
        if (fs_1.default.existsSync(this.fileName)) {
            const rawdata = fs_1.default.readFileSync(this.fileName);
            let config;
            try {
                config = JSON.parse(rawdata.toString());
            }
            catch (e) {
                if (e instanceof SyntaxError && rawdata.byteLength === 0) {
                    console.warn(`Could not parse ${this.fileName}, because file is empty. Using defaults.`);
                    return;
                }
                else {
                    console.error(`Error when parsing ${this.fileName}: ${e}`);
                    throw e;
                }
            }
            if (typeof config !== "object" || config === null) {
                throw new Error(`Expected ${this.fileName} to contain a JSON object, but got ${typeof config}`);
            }
            this.configuration.fromJson(config);
        }
        else {
            console.warn(`Configuration File ${this.fileName} does not exist. Using defaults.`);
            return;
        }
    }
    /* don't save instantly, but wait a bit to prevent too many writes in short succession */
    scheduleSave() {
        if (this.saveTimeout) {
            return;
        }
        this.saveTimeout = setTimeout(this.save.bind(this), AppConfigurationPersistence.saveDelay);
    }
    async save() {
        // @TODO: don't save if there are no changes
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = undefined;
        }
        return new Promise((resolve, reject) => {
            const data = this.configuration.toJson();
            const dataToWrite = Object.assign({
                _warning: "This file was automatically generated.",
                _warning2: "Do not edit it while the hub is running. Your changes will be lost."
            }, data);
            fs_1.default.writeFile(this.fileName, JSON.stringify(dataToWrite, null, '\t'), err => {
                if (err) {
                    console.error(`error when saving file ${this.fileName}: ${err}`);
                    reject(err);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
}
AppConfigurationPersistence.saveDelay = 500; //ms
exports.default = AppConfigurationPersistence;

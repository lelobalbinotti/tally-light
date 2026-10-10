"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tally_1 = require("../domain/Tally");
class TallyContainer {
    constructor(configuration, emitter) {
        this.configuration = configuration;
        this.tallies = new Map();
        (configuration.getTallies() || []).forEach(tally => {
            this.set(tally);
        });
        this.emitter = emitter;
        this.lastPrograms = null;
        this.lastPreviews = null;
        this.emitter.on("program.changed", ({ programs, previews }) => {
            this.lastPrograms = programs;
            this.lastPreviews = previews;
            this.updateTallyStates();
        });
        this.emitter.on("config.changed.tallyconfig", () => {
            this.updateTallyStates();
        });
    }
    addUdpTallyDriver(tallyDriver) {
        this.udpTallyDriver = tallyDriver;
    }
    addWebTallyDriver(tallyDriver) {
        this.webTallyDriver = tallyDriver;
    }
    key(tallyName, tallyType) {
        return `${tallyType}-${tallyName}`;
    }
    set(tally) {
        this.tallies.set(this.key(tally.name, tally.type), tally);
    }
    get(tallyName, tallyType) {
        const tally = this.tallies.get(this.key(tallyName, tallyType));
        return tally;
    }
    setAndAnnounceTally(tally) {
        var _a, _b;
        const oldConfigAsJson = (_a = this.get(tally.name, tally.type)) === null || _a === void 0 ? void 0 : _a.toJsonForSave();
        this.set(tally);
        this.updateTallyState(tally);
        this.emitter.emit('tally.changed', tally);
        const newConfigAsJson = (_b = this.get(tally.name, tally.type)) === null || _b === void 0 ? void 0 : _b.toJsonForSave();
        if (oldConfigAsJson !== newConfigAsJson) {
            this.configuration.setTallies(Array.from(this.tallies.values()));
        }
    }
    remove(tallyName, tallyType) {
        const tally = this.get(tallyName, tallyType);
        if (tally) {
            this.tallies.delete(this.key(tally.name, tally.type));
            this.configuration.setTallies(Array.from(this.tallies.values()));
            console.debug(`Removed tally "${tallyName}"`);
            this.emitter.emit('tally.removed', tally);
        }
    }
    getOrCreate(tallyName, tallyType) {
        let tally = this.get(tallyName, tallyType);
        if (!tally) {
            if (tallyType === "web") {
                tally = new Tally_1.WebTally(tallyName);
            }
            else {
                tally = new Tally_1.UdpTally(tallyName);
            }
            this.set(tally);
            this.updateTallyState(tally);
            console.debug(`Tally "${tallyName}" created`);
            this.emitter.emit('tally.created', tally);
            this.configuration.setTallies(Array.from(this.tallies.values()));
        }
        return tally;
    }
    update(tally) {
        // make sure the old tally existed - or create it
        this.getOrCreate(tally.name, tally.type);
        this.setAndAnnounceTally(tally);
        console.debug(`Tally "${tally.name}" updated`);
    }
    updateSettings(tallyName, tallyType, settings) {
        let tally = this.get(tallyName, tallyType);
        if (tally) {
            tally.configuration = settings;
            this.update(tally);
        }
        else {
            console.warn(`Can not update settings for unknown tally named "${tallyName}"`);
        }
    }
    highlight(tallyName, tallyType) {
        const tally = this.get(tallyName, tallyType);
        if (tally) {
            console.debug(`Tally "${tally.name}" highlighted`);
            setTimeout(() => {
                this.deHighlight(tallyName, tallyType);
            }, this.configuration.getTallyHighlightTime());
            tally.setHighlight(true);
            this.setAndAnnounceTally(tally);
        }
        else {
            console.warn(`Can not highlight unknown tally named "${tallyName}"`);
        }
    }
    deHighlight(tallyName, tallyType) {
        const tally = this.get(tallyName, tallyType);
        if (tally) {
            console.debug(`Tally "${tally.name}" de-highlighted`);
            tally.setHighlight(false);
            this.setAndAnnounceTally(tally);
        }
        else {
            console.warn(`Can not unhighlight unknown tally named "${tallyName}"`);
        }
    }
    patch(tallyName, tallyType, channelId) {
        const tally = this.get(tallyName, tallyType);
        if (tally) {
            tally.channelId = channelId ? channelId : undefined;
            this.setAndAnnounceTally(tally);
            console.debug(`Tally "${tally.name}" patched to "${channelId}"`);
        }
        else {
            console.warn(`Can not patch unknown tally named "${tallyName}"`);
        }
    }
    addLog(tallyName, tallyType, log) {
        const tally = this.get(tallyName, tallyType);
        if (tally) {
            tally.addLog(log);
            this.emitter.emit('tally.logged', { tally, log });
        }
        else {
            console.warn(`Can not log for unknown tally named "${tallyName}"`);
        }
    }
    updateTallyState(tally) {
        if (tally) {
            if (tally.isUdpTally()) {
                if (!this.udpTallyDriver) {
                    console.warn(`No UDP Tally Driver initialized. Can not update state of Tally "${tally.name}"`);
                }
                else {
                    this.udpTallyDriver.updateTallyState(tally, this.lastPrograms, this.lastPreviews);
                }
            }
            else if (tally.isWebTally()) {
                if (!this.webTallyDriver) {
                    console.warn(`No Web Tally Driver initialized. Can not update state of Tally "${tally.name}"`);
                }
                else {
                    this.webTallyDriver.updateTallyState(tally, this.lastPrograms, this.lastPreviews);
                }
            }
        }
    }
    updateTallyStates() {
        this.tallies.forEach(tally => this.updateTallyState(tally));
    }
    getTallies() {
        return Array.from(this.tallies.values());
    }
    getUdpTallies() {
        return this.getTallies().reduce((results, tally) => {
            if (tally.isUdpTally()) {
                results.push(tally);
            }
            return results;
        }, []);
    }
    getTalliesAsJson() {
        return this.getTallies().map(tally => tally.toJson());
    }
}
exports.default = TallyContainer;

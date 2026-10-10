"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
class TestConfiguration extends interfaces_1.Configuration {
    constructor() {
        super(...arguments);
        this.programs = null;
        this.previews = null;
    }
    getPort() {
        return (typeof process.env.TEST_MIXER_PORT === "string" && parseInt(process.env.TEST_MIXER_PORT, 10)) || 3030;
    }
    setPrograms(programs) {
        this.programs = programs;
    }
    getPrograms() {
        return this.programs;
    }
    setPreviews(previews) {
        this.previews = previews;
    }
    getPreviews() {
        return this.previews;
    }
    fromJson(data) {
        this.programs = data.programs;
        this.previews = data.previews;
    }
    toJson() {
        return {
            programs: this.programs,
            previews: this.previews,
        };
    }
    clone() {
        const clone = new TestConfiguration();
        clone.fromJson(this.toJson());
        return clone;
    }
}
exports.default = TestConfiguration;

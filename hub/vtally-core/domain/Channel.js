"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Channel {
    constructor(id, name) {
        this.id = id.toString();
        this.name = name;
    }
    toJson() {
        return {
            id: this.id,
            name: this.name,
        };
    }
    toString() {
        return this.name || this.id;
    }
}
Channel.fromJson = function (valueObject) {
    const channel = new Channel(valueObject.id, valueObject.name);
    return channel;
};
exports.default = Channel;

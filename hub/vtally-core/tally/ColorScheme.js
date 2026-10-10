"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YellowPinkColorScheme = exports.DefaultColorScheme = exports.Black = exports.Color = void 0;
class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    calculateChannel(value, brightness) {
        return Math.ceil(value * brightness / 100);
    }
    // brightness: 0-100
    withBrightness(brightness) {
        return new Color(this.calculateChannel(this.r, brightness), this.calculateChannel(this.g, brightness), this.calculateChannel(this.b, brightness));
    }
    toCss() {
        return `rgb(${this.r},${this.g},${this.b})`;
    }
}
exports.Color = Color;
exports.Black = new Color(0, 0, 0);
exports.DefaultColorScheme = {
    id: "default",
    name: "Padrão",
    description: "O esquema de cores tradicional para luzes de Tally.",
    program: new Color(255, 0, 0),
    preview: new Color(0, 255, 0),
    highlight: new Color(255, 255, 255),
    unknown: new Color(0, 0, 255),
    idle: new Color(0, 1, 0),
};
exports.YellowPinkColorScheme = {
    id: "yellow-pink",
    name: "Amarelo-Rosa",
    description: "Projetado para oferecer melhor contraste para pessoas com daltonismo vermelho-verde (protanopia e deuteranopia).",
    program: new Color(255, 255, 0),
    preview: new Color(255, 0, 255),
    highlight: new Color(255, 255, 255),
    unknown: new Color(0, 0, 255),
    idle: new Color(0, 1, 0),
};
const ColorSchemes = {
    getAll() {
        return [exports.DefaultColorScheme, exports.YellowPinkColorScheme];
    },
    getById(id) {
        if (id === "default") {
            return exports.DefaultColorScheme;
        }
        else if (id === "yellow-pink") {
            return exports.YellowPinkColorScheme;
        }
        else {
            // if typescript complaints, we missed an option
            ((_) => { })(id);
        }
    }
};
exports.default = ColorSchemes;

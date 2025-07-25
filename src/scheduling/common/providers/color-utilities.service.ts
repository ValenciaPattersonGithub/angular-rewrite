import { Injectable } from '@angular/core';

@Injectable()
export class ColorUtilitiesService {

    constructor() { }

    getHexToRgb(start) {
        const result = this.getHex(start);
        const final = this.getRgb(result);
        return final;
    }

    getHex(hex: string) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return '#' + r + r + g + g + b + b;
        });
        return hex;
    }

    getRgb(hex: string) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};

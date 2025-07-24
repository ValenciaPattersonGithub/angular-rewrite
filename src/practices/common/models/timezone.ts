import { Injectable } from "@angular/core";

//TODO: Research -- declarationMerging ... look up to understand how it knows the interface works with the class
export interface Timezone {
    value: string,
    display: string,
    offset: number,
    abbr: string,
    dstAbbr: string,
    momentTz: string,
    displayAbbr: string
}

@Injectable()
export class Timezone {

    constructor(value: string, display: string, offset: number , abbr: string, dstAbbr: string, momentTz: string) {
        this.value = value;
        this.display = display;
        this.offset = offset;
        this.abbr = abbr;
        this.dstAbbr = dstAbbr;
        this.momentTz = momentTz;
        this.displayAbbr = abbr; // default value
    }
}
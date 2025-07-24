import { Pipe, PipeTransform } from '@angular/core';
import { HtmlService } from 'src/@shared/providers/html.service';

@Pipe({
    name: 'highlightTextIfContains',
    pure: false
})
export class HighlightTextIfContainsPipe implements PipeTransform {
    constructor(private htmlService: HtmlService ) { }
    transform(value: any, args: any): any {
        if (!value) {
            return value;
        }
        const escapeHtmlValue = this.htmlService.escapeHtml(value);
        if (!args) {
            return escapeHtmlValue;
        }       
        const re = new RegExp(this.htmlService.escapeHtml(args), 'gi');
        const match = escapeHtmlValue.match(re);
        if (!match) {
            return escapeHtmlValue;
        }
        return escapeHtmlValue.replace(re, `<b>${match[0]}</b>`);
    }
}

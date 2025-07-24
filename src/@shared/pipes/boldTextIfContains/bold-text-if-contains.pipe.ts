import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
declare let _: any;

@Pipe({
  name: 'boldTextIfContains',
  pure: false
})

//this pipe has been created to handle dot case which is not working in HighlightTextIfContainsPipe due to regex: new RegExp(args, 'gi')
export class BoldTextIfContainsPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(value: any, args: any): any {
    const escapeValue = _.escape(value);
    if (!args || !value) {
      return escapeValue;
    }

    // match starting text of each term regardless of case
    args = args.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp('(' + args + ')', 'gi');

    if (!regex.test(escapeValue)) {
      return escapeValue;
    }

    return escapeValue.replace(regex, `<b class="bold-search-text">$1</b>`);
  }
}

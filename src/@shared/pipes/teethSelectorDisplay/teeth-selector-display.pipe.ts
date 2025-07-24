import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'teethSelectorDisplay',	
})
export class TeethSelectorDisplayPipe implements PipeTransform {
	transform(teeth: any[], triggerValue?: any): any {

		//Nothing is entered in the search
		if (!triggerValue || triggerValue === null || triggerValue === '') {
			return teeth;
        }

		if (!teeth || teeth === null) {
			return null;
		}

		if (teeth && teeth.length) {
			return teeth.filter(tooth => { return tooth.USNumber.startsWith(triggerValue) });
		}
	}
}

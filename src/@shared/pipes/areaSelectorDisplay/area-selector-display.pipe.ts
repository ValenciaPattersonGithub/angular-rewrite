import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'areaSelectorDisplay',
})
export class AreaSelectorDisplayPipe implements PipeTransform {
	transform(areas: any[], triggerValue?: any): any {

		//Nothing is entered in the search
		if (!triggerValue || triggerValue === null || triggerValue === '') {
			return areas;
		}

		if (!areas || areas === null) {
			return null;
		}

		if (areas && areas.length) {
			//return areas.filter(area => { return area.startsWith(triggerValue) });
			return areas;
		}
	}
}

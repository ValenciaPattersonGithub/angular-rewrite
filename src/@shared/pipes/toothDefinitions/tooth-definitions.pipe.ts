import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'toothDefinitions',
	pure: false
})
export class ToothDefinitionsPipe implements PipeTransform {
	transform(teeth: any[], ArchPosition: string, Description: string, reverse: boolean): any {
		if(!teeth || teeth === null) {
			return null;
		}

		if (teeth && teeth.length && reverse) {
			return teeth.filter(tooth => { return tooth.ArchPosition === ArchPosition && tooth.ToothStructure === Description; }).reverse();
		}
		else {
			return teeth.filter(tooth => { return tooth.ArchPosition === ArchPosition && tooth.ToothStructure === Description; });
		}
	}
}

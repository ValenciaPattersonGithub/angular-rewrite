import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'rotTeethDisplay',
	pure: false
})
export class RotTeethDisplayPipe implements PipeTransform {
	transform(teeth: any[]): any {
		
		if(!teeth || teeth === null) {
			return null;
		}
		
		if (teeth && teeth.length) {
			return teeth.filter(tooth => { return tooth.selected === false && tooth.visible === true && tooth.positionAlreadyTaken === false; });
		}
	}
}

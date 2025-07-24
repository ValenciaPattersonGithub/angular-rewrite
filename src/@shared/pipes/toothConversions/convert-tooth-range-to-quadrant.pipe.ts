import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
	name: 'convertToothRangeToQuadrantOrArchCode',
	pure: false
})
export class ConvertToothRangeToQuadrantOrArchCode implements PipeTransform {
	constructor(@Inject('StaticData') private staticData) {

	}

	transform(tooth: string): any {
		if (!tooth || tooth === null) {
			return null;
		}

		if (tooth && tooth.toString().indexOf('-') !== -1 && tooth.toString().indexOf(',') === -1) {
			var map = this.staticData.ToothRangeToCodeMap();
			return map[tooth] ? map[tooth] : tooth;
		}

		return tooth;
	}
}
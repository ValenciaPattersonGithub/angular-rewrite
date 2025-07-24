import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eraAdjustmentIdentifier'
})
export class EraAdjustmentIdentifierPipe implements PipeTransform {

  transform(identifier: any, ...args: any[]): any {
    if(!identifier) return identifier;
    const split = identifier.split(':');
    return split.length > 1 ? split[1] : '';
  }

}

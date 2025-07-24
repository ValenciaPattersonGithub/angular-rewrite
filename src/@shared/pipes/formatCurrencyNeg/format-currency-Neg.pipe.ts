import { Pipe, PipeTransform } from '@angular/core';
import isNumber from 'lodash/isNumber'

@Pipe({
    name: 'formatCurrencyIfNeg',
})

export class formatCurrencyIfNegPipe implements PipeTransform {
    transform(value: any): any {
        if (isNumber(value)) {
            if (value < 0) {
                var temp = Math.abs(value);
                if (temp < 0.005) {
                    return temp.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                }
                else {
                    return '(' + temp.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + ')';
                }
            } else {
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            }
        }
    }
};
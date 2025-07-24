import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'carrierLongLabel'
})
export class CarrierLongLabelPipe implements PipeTransform {

    transform(carrier: any): any {
        let longLabel = '';
        if (!carrier) {
            return '';
        }
        longLabel += carrier.Name.toString().trim();
        
        longLabel += (carrier.PayerId) ? ', ' + carrier.PayerId.toString().trim() : '';

        longLabel += (carrier.AddressLine1) ? ', ' + carrier.AddressLine1.toString().trim() : '';

        longLabel += (carrier.AddressLine2) ? ', ' + carrier.AddressLine2.toString().trim() : '';        

        longLabel += (carrier.City) ? ', ' + carrier.City.toString().trim() : '';

        longLabel += (carrier.State) ? ', ' + carrier.State.toString().trim() : '';

        longLabel += (carrier.Zip) ? ', ' + carrier.Zip.toString().trim() : '';

        longLabel += (carrier.PhoneNumbers[0] && carrier.PhoneNumbers[0].PhoneNumber) ? ', ' + carrier.PhoneNumbers[0].PhoneNumber.toString().trim() : '';

        return longLabel;
    }
}
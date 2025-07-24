import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'serviceEstInsTotal'
})
export class ServiceTotalEstinsPipe implements PipeTransform {
    transform(serviceTransaction, triggerValue?: any) {
        var total = 0;
        if (serviceTransaction["ObjectState"] && serviceTransaction["ObjectState"] !== "Delete" && serviceTransaction.InsuranceEstimates) {
            for (let estimate of serviceTransaction.InsuranceEstimates) {
                //if paid more than estimate there is no estimate left for this insurance, otherwise estimate minus paid amount for remaining estimate
                total += estimate.EstInsurance - estimate.PaidAmount < 0 ? 0 : estimate.EstInsurance - estimate.PaidAmount;
            };
        }
        return total;
    }
}

@Pipe({
    name: 'serviceAdjEstTotal'
})
export class ServiceAdjEstPipe implements PipeTransform {
    transform(service, triggerValue?: any) {
        var prop = "AdjEst";

        var total = 0;
        var amount = 0;
        if (service["ObjectState"] && service["ObjectState"] !== "Delete") {
            for (let estimate of service.InsuranceEstimates) {
                amount = estimate[prop] ? estimate[prop] : 0;
                total = total + amount;
            };
        }

        return total;
    }
}
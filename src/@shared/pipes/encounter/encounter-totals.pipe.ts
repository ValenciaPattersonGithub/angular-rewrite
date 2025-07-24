import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrUndefined, isUndefined } from 'util';


@Pipe({
    name: 'encounterTotalAmount'
})
export class EncounterTotalAmountPipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {
        var prop = 'Amount';                   

        var total = 0;
        var amount = 0;

        for (let serviceTransaction of serviceTransactionDtos) {
            if (serviceTransaction['ObjectState'] && serviceTransaction['ObjectState'] !== 'Delete') {
                amount = serviceTransaction[prop] ? serviceTransaction[prop] : 0;
                total = total + amount;
                print
            }
        };

        return Number(total.toFixed(2));
    }
}

@Pipe({
    name: 'encounterTotalAllowedAmount'
})
export class EncounterTotalAllowedAmountPipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {
        var prop = 'AllowedAmount';

        var total = 0;
        var amount = 0;

        for (let serviceTransaction of serviceTransactionDtos) {
            if (serviceTransaction['ObjectState'] && serviceTransaction['ObjectState'] !== 'Delete') {
                amount = serviceTransaction[prop] ? serviceTransaction[prop] : 0;
                total = total + amount;
                print
            }
        };

        return Number(total.toFixed(2));
    }
}

@Pipe({
    name: 'encounterTaxTotal'
})
export class EncounterTotalTaxPipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {
        var prop = "Tax";        

        var total = 0;
        var tax = 0;
        for (let value of serviceTransactionDtos) {
            if (value["ObjectState"] && value["ObjectState"] !== "Delete") {
                tax = value[prop] ? value[prop] : 0;
                total = total + tax;
            }
        };
        return total;
    }
}



@Pipe({
    name: 'encounterDiscountTotal'
})
export class EncounterTotalDiscountPipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {        
        var prop = "Discount";        

        var total = 0;
        var discount = 0;
        for(let value of serviceTransactionDtos) {
            if (value["ObjectState"] && value["ObjectState"] !== "Delete") {
                discount = value[prop] ? value[prop] : 0;
                total = total + discount;
            }
        };
        return total;
    }
}


@Pipe({
    name: 'encounterFeeTotal'
})
export class EncounterTotalFeePipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {        
        var prop = "Fee";        

        var total = 0;
        
        for (let value of serviceTransactionDtos) {
            var serviceTransactionAmount = 0;
            if (value[prop] && value["ObjectState"] && value["ObjectState"] !== "Delete") {
                if (value[prop])
                    serviceTransactionAmount = +value[prop];                    
                else {
                    serviceTransactionAmount = 0;
                }
                total = total + serviceTransactionAmount;
            }
        };
        return total;
    }
}


@Pipe({
    name: 'encounterAdjEstTotal'
})
export class EncounterTotalAdjEstPipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {        
        var prop = "AdjEst";  
        
        var total = 0;
        var amount = 0;
        for (let value of serviceTransactionDtos) {
            if (value["ObjectState"] && value["ObjectState"] !== "Delete") {
                for(let estimate of value.InsuranceEstimates) {
                    amount = estimate[prop] ? estimate[prop] : 0;
                    total = total + amount;
                };
            }
        };
        return total;
    }
}


@Pipe({
    name: 'encounterEstInsTotal'
})
export class EncounterTotalEstinsPipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {
        var total = 0;
        for (let serviceTransaction of serviceTransactionDtos) {
            if (serviceTransaction["ObjectState"] && serviceTransaction["ObjectState"] !== "Delete" && serviceTransaction.InsuranceEstimates) {
                for(let estimate of serviceTransaction.InsuranceEstimates) {
                    //if paid more than estimate there is no estimate left for this insurance, otherwise estimate minus paid amount for remaining estimate
                    total += estimate.EstInsurance - estimate.PaidAmount < 0 ? 0 : estimate.EstInsurance - estimate.PaidAmount;
                };
            }
        };
        return total;
    }
}

@Pipe({
    name: 'encounterPatientPortionTotal'
})
export class EncounterTotalPatientPortionPipe implements PipeTransform {
    transform(serviceTransactionDtos, triggerValue?: any) {
        var totalPatientPortion = 0;
        var estIns = 0;
        var adjEst = 0;

        for (let serviceTransaction of serviceTransactionDtos) {
            

            if ((!isUndefined(serviceTransaction['ObjectState'])) && (serviceTransaction['ObjectState'] !== 'Delete')) {
                totalPatientPortion += serviceTransaction.Amount;
                for (let insuranceEstimate of serviceTransaction.InsuranceEstimates) {
                    estIns = insuranceEstimate.EstInsurance;
                    adjEst = insuranceEstimate.AdjEst;
                    totalPatientPortion -= (estIns + adjEst);
                };
            }
        };

        return parseFloat(totalPatientPortion.toFixed(2));
    }
}



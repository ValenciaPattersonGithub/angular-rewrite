import { Inject, Injectable } from '@angular/core';
import { isNullOrUndefined, isUndefined } from 'util';

@Injectable()
export class ServiceEstimateCalculationService {
  isResetAllowedAmountsDisabled: boolean = false;
  constructor() {}

  // ascertain that all services have InsuranceOrder before calculating insurance estimate
  // InsuranceOrder should begin with 1 and increment accordingly
  // NOTE this could be moved to a different service, not sure which since its ServiceTransaction.InsuranceOrder
  validateInsuranceOrder(services) {
    services.forEach(serviceTransaction => {
      var order = 1;
      if (services.length > 0) {
        // get the max InsuranceOrder from list
        var last = services.reduce((a, b) =>
          a.InsuranceOrder > b.InsuranceOrder ? a : b
        );
        // increment that by 1 or if undefined set to 1
        order =
          last && !isUndefined(last.InsuranceOrder) && last.InsuranceOrder > 0
            ? last.InsuranceOrder + 1
            : 1;
      }
      // set the insurance order
      serviceTransaction.InsuranceOrder =
        isNullOrUndefined(serviceTransaction.InsuranceOrder) ||
        serviceTransaction.InsuranceOrder === 0
          ? order
          : serviceTransaction.InsuranceOrder;
    });
    // sort list
    services = services.sort((a, b) => a.InsuranceOrder - b.InsuranceOrder);
    return services;
  }

  //This will calculate all Service Transaction Line Item Amounts and
  //Total Balance
  //services param is the list of service transactions that has insurance related fields that need updated from the reacalculatedServices param list
  //recalculatedServices param is the list returned from the API called that has performed the insurance calculations
  //updateAllowedAmount param is set to true if we need to call updateAllowedAmount() otherwise we send in false
  onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(
    services,
    recalculatedServices,
    updateAllowedAmount = true
  ) {
    services.forEach(serviceTransaction => {
      // find the matching serviceTraction by InsuranceOrder
      let reCalculatedService = recalculatedServices.find(x => {
        return x.InsuranceOrder === serviceTransaction.InsuranceOrder;
      });
      if (reCalculatedService) {
        serviceTransaction.Discount = reCalculatedService.Discount;
        serviceTransaction.Amount = reCalculatedService.Amount;
        serviceTransaction.Tax = reCalculatedService.Tax;
        serviceTransaction.InsuranceEstimates =
          reCalculatedService.InsuranceEstimates;
        serviceTransaction.TotalEstInsurance =
          reCalculatedService.TotalEstInsurance;
        serviceTransaction.TotalAdjEstimate =
          reCalculatedService.TotalAdjEstimate;
        serviceTransaction.Balance = parseFloat(
          (
            serviceTransaction.Amount -
            serviceTransaction.TotalEstInsurance -
            serviceTransaction.TotalAdjEstimate
          ).toFixed(2)
        );
        //Appointment View is not using allowed amount yet so that is why this condition exists.
        if (updateAllowedAmount) {
          this.updateAllowedAmount(serviceTransaction);
        }
      }
    });
    return services;
  }

  // populate AllowedAmountDisplay on insuranceEstimate based on whether override exists
  // ie if no override, use AllowedAmount from estimate
  // populate ServiceTransaction.AllowedAmount based on lesser of AllowedAmounts on estimates
  updateAllowedAmount(serviceTransaction) {
    if (
      serviceTransaction !== null &&
      serviceTransaction !== undefined &&
      serviceTransaction.InsuranceEstimates !== null &&
      serviceTransaction.InsuranceEstimates !== undefined
    ) {
      serviceTransaction.InsuranceEstimates.forEach(insuranceEstimate => {
        insuranceEstimate.AllowedAmountDisplay =
          insuranceEstimate.AllowedAmount;
        // if AllowedAmount has been overridden update AllowedAmountDisplay based on that.
        if (
          insuranceEstimate.AllowedAmountOverride !== null &&
          insuranceEstimate.AllowedAmountOverride !== undefined
        ) {
          insuranceEstimate.AllowedAmountDisplay =
            insuranceEstimate.AllowedAmountOverride;
          this.isResetAllowedAmountsDisabled = false;
        }
        // set the service.AllowedAmount to the lesser of the AllowedAmount values (including AllowedAmountOverride) and there are multiple rows of InsuranceEstimates
        // NOTE this is dynamic value and is not persisted
        if (
          insuranceEstimate.AllowedAmountDisplay !== null &&
          insuranceEstimate.AllowedAmountDisplay !== undefined
        ) {
          if (
            serviceTransaction.AllowedAmount === null ||
            serviceTransaction.AllowedAmount === undefined
          ) {
            serviceTransaction.AllowedAmount =
              insuranceEstimate.AllowedAmountDisplay;
          } else {
            if (
              insuranceEstimate.AllowedAmountDisplay <
              serviceTransaction.AllowedAmount
            ) {
              serviceTransaction.AllowedAmount =
                insuranceEstimate.AllowedAmountDisplay;
            }
          }
        }
      });
    }
  }
}

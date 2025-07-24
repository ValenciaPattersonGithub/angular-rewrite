import { Injectable, inject } from '@angular/core';

@Injectable()
export class AppointmentServiceTransactionsService {
    private insuranceOrder: number;
    constructor() {
      this.insuranceOrder = 0;
    }
    

    //Set Insurance Order on Service Transaction when added
    //When we add a service transaction, we set the Insurance Order to keep track of the order that the service transactions were added
    setInsuranceOrderOnServiceTransaction(insuranceOrder) {

        this.insuranceOrder = insuranceOrder;
    }

    //This will return to us the latest Insurance Order added to Service Transaction
    getInsuranceOrderOnServiceTransaction() {

        return this.insuranceOrder;
    }

    //This will get the greatest InsuranceOrder value on a service transaction for an appointment
    getGreatestInsuranceOrderOnServiceTransaction(plannedServices) {
        let insuranceOrder = 0;
    
        if (plannedServices.length > 0) {
            let serviceTransactions = plannedServices.sort((a, b) => (a.InsuranceOrder < b.InsuranceOrder) ? -1 : 1);
            insuranceOrder = serviceTransactions[serviceTransactions.length - 1].InsuranceOrder;
        }
       
        return insuranceOrder;
    }

    //This will get the greatest insurance order number
    //It will set the next insurance order number
    //It will return the next/latest insurance order number
    setNextInsuranceOrderForPlannedService(plannedServices) {
        let insOrder = this.getInsuranceOrderOnServiceTransaction();
       
        //This if statement should get hit if a saved appointment is opened and has existing service transactions
        if (plannedServices.length > 0 && insOrder === 0) {
            //get the greatest InsuranceOrder number on an appointment for a Service Transaction
           insOrder = this.getGreatestInsuranceOrderOnServiceTransaction(plannedServices);
        }

        insOrder = insOrder + 1;
        this.setInsuranceOrderOnServiceTransaction(insOrder);
        return insOrder;
    }
}

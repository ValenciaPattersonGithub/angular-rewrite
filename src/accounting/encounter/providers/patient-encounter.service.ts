import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class PatientEncounterService {

    // observable notification source and observable
    private serviceHasChanged = new Subject<boolean>();
    serviceHasChanged$ = this.serviceHasChanged.asObservable();

    saveStates = {
        Add: 'Add',
        Update: 'Update',
        Delete: 'Delete',
        None: 'None'
    };
    constructor() { }

    notifyServiceHasChanged(){
        this.serviceHasChanged.next(true);
    }

    createEncounter(accountMemberId?: any, serviceTransactions?: any[]) {
        let encounter =
        {
            "Description": "",
            "Date": "01/01/0001",// this should be default date,
            "AccountMemberId": accountMemberId,
            "ServiceTransactionDtos": [],
            "Status": 2,
            "ObjectState": this.saveStates.Add
        };

       // var order = 0;
        //This code is not getting hit ever because we aren't passing in serviceTransactions to this method from any callers.
        //if (!isNullOrUndefined(serviceTransactions) && serviceTransactions.length > 0) {
        //    serviceTransactions.forEach((service) => {
        //        if (service.ObjectState != this.saveStates.Delete) {
        //            var transaction = this.buildServiceTransaction(service);
        //            encounter.Description += transaction.DisplayAs + ',';
        //            transaction.Amount = parseFloat((service.Fee - service.Discount + service.Tax).toFixed(2));
        //            transaction.InsuranceOrder = order++;
        //            encounter.ServiceTransactionDtos.push(transaction);
        //        }
        //    });

        //    //Remove last comma(,) from encounter description
        //    encounter.Description = encounter.Description.substring(0, encounter.Description.length - 1);

        //    // sync AppointmentId, EncounterId on services when adding or removing a service
        //    this.syncAppointmentIdOnService(encounter.ServiceTransactionDtos);
        //}      

        return encounter;
    }

    buildServiceTransaction(serviceTransaction, accountMemberId?: any, encounterId?: any) {
        var transaction = {
            // fields from ServiceTransactionDto
            "AccountMemberId": !isNullOrUndefined(accountMemberId) ? accountMemberId : null,
            "Amount": serviceTransaction.Amount,
            "AppointmentId": serviceTransaction.AppointmentId,
            "ClaimId": null,
            "DateCompleted": null,
            //"DateEntered": serviceTransaction.ObjectState == saveStates.Add ? $filter('setDateTime')(serviceTransaction.DateEntered) : timeZoneFactory.ConvertDateToSaveString(serviceTransaction.DateEntered, serviceLocation.Timezone),
            "DateEntered": new Date(serviceTransaction.DateEntered).toLocaleDateString(),
            "Description": serviceTransaction.Description,
            "Discount": serviceTransaction.Discount,
            "EncounterId": !isNullOrUndefined(encounterId) ? encounterId : null,
            "EnteredByUserId": serviceTransaction.EnteredByUserId ? serviceTransaction.EnteredByUserId : "",
            "Fee": serviceTransaction.Fee,
            "LocationId": serviceTransaction.LocationId,
            "Note": "",
            "ProviderUserId": serviceTransaction.ProviderUserId,
            "ProviderOnClaimsId": serviceTransaction.ProviderOnClaimsId,
            "RejectedReason": null,
            "ServiceCodeId": serviceTransaction.ServiceCodeId,
            "ServiceTransactionId": serviceTransaction.ServiceTransactionId ? serviceTransaction.ServiceTransactionId : null,
            "ServiceTransactionStatusId": 5,
            "Surface": serviceTransaction.Surface,
            "Roots": serviceTransaction.Roots,
            "Tax": serviceTransaction.Tax,
            "Tooth": serviceTransaction.Tooth,
            "TotalEstInsurance": serviceTransaction.TotalEstInsurance,
            "TransactionTypeId": 1,
            "ObjectState": serviceTransaction.ObjectState,
            "DataTag": serviceTransaction.DataTag ? serviceTransaction.DataTag : "",
            "UserModified": serviceTransaction.UserModified,
            "CreatedDate": serviceTransaction.CreatedDate,
            "IsDiscounted": serviceTransaction.isDiscounted,
            // fields that are needed on UI for next course of actions
            "DisplayAs": serviceTransaction.DisplayAs,
            "AffectedAreaId": serviceTransaction.AffectedAreaId,
            "Code": serviceTransaction.Code,
            "CdtCodeName": serviceTransaction.CdtCodeName,
            "TransactionType": serviceTransaction.TransactionType,
            "ValidDate": serviceTransaction.ValidDate,
            "InsuranceOrder": serviceTransaction.InsuranceOrder,
            "InsuranceEstimates": null,
            "invalidTooth": !isNullOrUndefined(serviceTransaction.invalidTooth) ? serviceTransaction.invalidTooth : false,
            "invalidSurface": !isNullOrUndefined(serviceTransaction.invalidSurface) ? serviceTransaction.invalidSurface : false
        };

        if (serviceTransaction.InsuranceEstimates != null) {
            transaction.InsuranceEstimates = serviceTransaction.InsuranceEstimates;
        }
        else {
            transaction.InsuranceEstimates = this.CreateInsuranceEstimateObject(transaction);
        }

        return transaction;
    };

    syncAppointmentIdOnService(serviceTransactions, appointmentId = null) {
        // if service exists with matching AppointmentId and Encounter (which means its ReadyForCheckout),
        // add that appointmmentId to all of the services on this encounter

        // if appointmentId is not passed as parameter, sync with any service on the encounter that has an appointmentId (if any)
        if (isNullOrUndefined(appointmentId )){
            var serviceWithAppointmentId = serviceTransactions.find((serviceTransaction) => { return !isNullOrUndefined(serviceTransaction.AppointmentId); });
            if (serviceWithAppointmentId){
                appointmentId = serviceWithAppointmentId.AppointmentId;
            }
        };
        // if appointmentId is passed as parameter (if called directly from an appointment) use that to sync
        if (appointmentId) {
            serviceTransactions.forEach((serviceTransaction) => {
                if (serviceTransaction.ObjectState === this.saveStates.Update || serviceTransaction.ObjectState === this.saveStates.Add) {
                    serviceTransaction.AppointmentId = appointmentId;
                }
                if (serviceTransaction.ObjectState === this.saveStates.None) {
                    serviceTransaction.AppointmentId = appointmentId;
                    serviceTransaction.ObjectState = this.saveStates.Update;
                }
            });
        }
        // if service is being removed from the encounter just set the Appointment and EncounterIds to null
        // and set the ServiceTransactionStatusId to 1 (proposed)
        // and set InsuranceOrder to null
        serviceTransactions.forEach((serviceTransaction) => {
            if (serviceTransaction.ObjectState === this.saveStates.Delete) {
                serviceTransaction.EncounterId = null;
                serviceTransaction.AppointmentId = null;
                serviceTransaction.ServiceTransactionStatusId = 1;
                serviceTransaction.InsuranceOrder = null;
                serviceTransaction.ObjectState = this.saveStates.Update;
            }
        });
        return serviceTransactions;
    };

    CreateInsuranceEstimateObject(serviceTransaction) {
        if (serviceTransaction == null) {
            serviceTransaction = {
                AccountMemberId: null,
                ServiceTransactionId: null,
                ServiceCodeId: null,
                Fee: 0
            };
        }

        return [{
            EstimatedInsuranceId: null,
            AccountMemberId: serviceTransaction.AccountMemberId,
            ServiceTransactionId: serviceTransaction.ServiceTransactionId,
            ServiceCodeId: serviceTransaction.ServiceCodeId,
            Fee: serviceTransaction.Fee,
            EstInsurance: 0,
            AdjEst: 0,
            IsUserOverRidden: false,
            IndividualDeductibleUsed: 0,
            FamilyDeductibleUsed: 0,
            CalculationDescription: "",
            ObjectState: this.saveStates.Add,
            FailedMessage: ""
        }];
    };
}

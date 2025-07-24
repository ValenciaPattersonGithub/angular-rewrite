import { Injectable, inject } from '@angular/core';

// Item is separate in case we decide to get the data from an API in the future.
@Injectable()
export class AppointmentServiceProcessingRulesService {

    constructor() { }

    // are you allowed to edit a service
    processAppointmentServiceEditRules(serviceTransaction, statusList, isFromAppointmentModal : boolean) {

        // set default - before processing state
        let state = {
            allowEditingMainFields: true,
            allowEditingProvider: true,
            showProviderSelectorForAppointmentServices: false,
            showProviderSelector: false
        }
        // ensure values passed into the method are both populated.
        if (serviceTransaction && statusList) {

            // get the Id of the Completed Status
            let statusId = null;
            for (let i = 0; i < statusList.length; i++) {
                if (statusList[i].Name && statusList[i].Name === 'Completed') {
                    statusId = statusList[i].Id;
                }
            }

            // now we have to set the boolean properties based on the rules we have in place
            if (statusId !== null && serviceTransaction.ServiceTransactionStatusId === statusId) {
                state.allowEditingMainFields = false;
                state.allowEditingProvider = false;
                state.showProviderSelectorForAppointmentServices = false;
                state.showProviderSelector = true;
            } else if (serviceTransaction.AppointmentId && isFromAppointmentModal === false) {
                state.allowEditingMainFields = false;
                state.allowEditingProvider = true;
                state.showProviderSelectorForAppointmentServices = true;
                state.showProviderSelector = false
            }

        }

        if (state.showProviderSelector === false && state.showProviderSelectorForAppointmentServices === false) {
            state.showProviderSelector = true;
        }

        return state;
    }

    processAppointmentServiceProviders(serviceTransaction, providers) {
        let addToTheList = true;

        if (providers === null || providers === undefined) {
            providers = [];
        }

        if (serviceTransaction && serviceTransaction.ProviderUserId) {
            for (let i = 0; i < providers.length; i++) {

                // if the serviceTransaction provider value is the same as one of the providers on the appointment 
                // we are not! going to add it to the list so set the local variable to false
                if (providers[i] === serviceTransaction.ProviderUserId) {
                    addToTheList = false;
                }
            }
            // add the serviceTransaction Provider to the list of available providers if they are not in the provider list already.
            // This is needed to ensure what our clients selected shows for them when editing.
            if (addToTheList) {
                providers.push(serviceTransaction.ProviderUserId);
            }
        }

        return providers;
    }

    filterProvidersForServicesWithAppointments(providerList, appointmentProviderIds) {
        let list = [];
        if (providerList && appointmentProviderIds) {
            for (let i = 0; i < providerList.length; i++) {
                for (let x = 0; x < appointmentProviderIds.length; x++) {
                    if (providerList[i].UserId === appointmentProviderIds[x]) {
                        list.push(providerList[i]);
                    }
                }
            }
        }
        return list;
    }

    formatProviderPropertiesForServices(providerList) {
        if (providerList) {
            for (let i = 0; i < providerList.length; i++) {
                providerList[i].Name = providerList[i].FirstName + ' ' + providerList[i].LastName + (providerList[i].ProfessionalDesignation ? ', ' + providerList[i].ProfessionalDesignation : '');
                providerList[i].FullName = providerList[i].FirstName + ' ' + providerList[i].LastName;
                providerList[i].ProviderId = providerList[i].ProviderId > '' ? providerList[i].ProviderId : providerList[i].UserId;
            }
        }
        else {
            providerList = [];
        }

        return providerList;
    }
}

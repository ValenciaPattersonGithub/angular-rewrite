import { Pipe, PipeTransform, Inject } from '@angular/core';
import { isNullOrUndefined, isNull } from 'util';
import cloneDeep from 'lodash/cloneDeep';

@Pipe({
    name: 'getProvidersInPreferredOrderFilter',
    pure: false
})

export class GetProvidersInPreferredOrderFilter implements PipeTransform {
    constructor(@Inject("ListHelper") private listHelper) {

    }

    transform(allProviders: any[], patientInfo: any, locationId: any): any {
        var finalListOfProviders = [];

        // These variable holds the object of preferred dentist and hygienist if have been set in the system for a provided patient
        var preferredDentist;
        var preferredHygienist;
        patientInfo = isNullOrUndefined(patientInfo.PreferredDentist) && patientInfo.Profile ? patientInfo.Profile : patientInfo;

        //#region Compose a list of providers which are other than 'Not a provider' type for This location
        // Get providers having their type as - Dentist, Hygienist, Assistant & Other

        // only include providers for this location and who have UserLocationSetup.ProviderTypeId other than 4
        var providersOtherThanNotAProvider = [];
        allProviders.forEach((provider) => {
            var userLocationSetup = provider.Locations.find((userLocationSetup) => {
                return userLocationSetup.LocationId === locationId;
            });
            if (userLocationSetup && userLocationSetup.ProviderTypeId !== 4) {
                provider.UserLocationSetup = cloneDeep(userLocationSetup);
                providersOtherThanNotAProvider.push(provider);
            }
        });

        //#endregion

        //#region Retrieve preferred dentist and hygienist for a patient searched by user

        if (patientInfo && patientInfo.PreferredDentist) {
            // Retrieve preferred dentist from the list of providers
            preferredDentist = this.listHelper.findItemByFieldValue(allProviders, "UserId", patientInfo.PreferredDentist);

            // Remove existing preferredDentist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
            var dentistRemoveIndex = this.listHelper.findIndexByFieldValue(providersOtherThanNotAProvider, "UserId", patientInfo.PreferredDentist);
            if (dentistRemoveIndex !== -1)
                providersOtherThanNotAProvider.splice(dentistRemoveIndex, 1);
        }

        if (patientInfo && patientInfo.PreferredHygienist && patientInfo.PreferredHygienist !== patientInfo.PreferredDentist) {
            // Retrieve preferred hygienist from the list of providers
            preferredHygienist = this.listHelper.findItemByFieldValue(allProviders, "UserId", patientInfo.PreferredHygienist);

            // Remove existing preferredHygienist from the providersOtherThanNotAProvider list so that it won't appear twice in the dropdown
            var hygienistRemoveIndex = this.listHelper.findIndexByFieldValue(providersOtherThanNotAProvider, "UserId", patientInfo.PreferredHygienist);
            if (hygienistRemoveIndex !== -1)
                providersOtherThanNotAProvider.splice(hygienistRemoveIndex, 1);
        }

        //#endregion

        //#region Compose a list of inactive providers
        // Get a list of inactive providers from the list of providers other than "Not a Provider" type
        // If patient has set preferred dentist and hygienist and if they are in Inactive state, they will be added at the top. Dentist at first index and then hygienist

        var copyOfProvidersOtherThanNotAProvider = cloneDeep(providersOtherThanNotAProvider);

        var inactiveProviders = copyOfProvidersOtherThanNotAProvider.filter((provider) => {
            // Find Inactive provider
            if (!provider.IsActive) {
                var inactiveRemoveIndex = this.listHelper.findIndexByFieldValue(providersOtherThanNotAProvider, "UserId", provider.UserId);
                providersOtherThanNotAProvider.splice(inactiveRemoveIndex, 1);
                return true;
            }

            return false;
        });

        // If preferred dentist is inactive, add it at the top of list of inactive providers.
        if (preferredDentist) {
            if (!preferredDentist.IsActive) {
                inactiveProviders.push(preferredDentist);
            }
        }

        // If preferred hygienist is inactive, add it to the list of inactive providers below inactive preferred dentist.
        if (preferredHygienist) {
            if (!preferredHygienist.IsActive) {
                inactiveProviders.push(preferredHygienist);
            }
        }

        //#endregion

        //#region Compose a final list of providers to be shown on screen
        var temporaryProviders = [];

        // If preferred dentist is active, add it to the top of the list
        if (preferredDentist) {
            if (preferredDentist.IsActive) {
                temporaryProviders.push(preferredDentist);
            }
        }

        // If preferred hygienist is active, add it below the active dentist in the list
        if (preferredHygienist) {
            if (preferredHygienist.IsActive) {
                temporaryProviders.push(preferredHygienist);
            }
        }

        // Add sorted active providers
        //providersOtherThanNotAProvider = $filter('orderBy')(providersOtherThanNotAProvider, 'LastName');
        providersOtherThanNotAProvider = providersOtherThanNotAProvider.sort((providerA: any, providerB: any) => {
            if (providerA.LastName !== providerB.LastName) {
                return providerA.LastName.localeCompare(providerB.LastName);
            }
            return providerA.FirstName.localeCompare(providerB.FirstName);
        });
        temporaryProviders = temporaryProviders.concat(providersOtherThanNotAProvider);

        // Add sorted inactive providers after active providers in the final list
        //inactiveProviders = $filter('orderBy')(inactiveProviders, 'LastName');
        inactiveProviders = inactiveProviders.sort((providerA: any, providerB: any) => {
            if (providerA.LastName !== providerB.LastName) {
                return providerA.LastName.localeCompare(providerB.LastName);
            }
            return providerA.FirstName.localeCompare(providerB.FirstName);
        });
        temporaryProviders = temporaryProviders.concat(inactiveProviders);

        // Create a list of providers that can be bound to UI elements
        temporaryProviders.forEach((provider) => {
            var name = provider.FirstName + ' ' + provider.LastName + (provider.ProfessionalDesignation ? ', ' + provider.ProfessionalDesignation : '');
            var fullName = provider.FirstName + ' ' + provider.LastName;

            finalListOfProviders.push({
                Name: name,
                FullName: fullName,
                ProviderId: provider.UserId,
                IsActive: provider.IsActive,
                IsPreferred: patientInfo && (provider.UserId === patientInfo.PreferredDentist || provider.UserId === patientInfo.PreferredHygienist),
                FirstName: provider.FirstName,
                LastName: provider.LastName,
                ProfessionalDesignation: provider.ProfessionalDesignation,
                UserCode: provider.UserCode,
                UserLocationSetup: provider.UserLocationSetup
            });
        });
        //#endregion

        return finalListOfProviders;
    }
}

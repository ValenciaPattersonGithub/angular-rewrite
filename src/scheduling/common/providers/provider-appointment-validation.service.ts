import { Injectable, Inject } from '@angular/core';

@Injectable()
/**
 * Validation for Provider, Provider on Service, and Examining Dentist to see if the provider selected is a valid provider
 * The appointment gets into a bad state when a user changes the Team Members ProviderType to something other than a Dentist.
 * 
 */
export class ProviderAppointmentValidationService {
   
   constructor(@Inject('referenceDataService') private referenceDataService) { }
      
   /// This function will return true or false 
   /// If the examining dentist, provider on appointment, or provider on service is in a bad state, then return false.
   isProviderValidOnAllAppointmentViewFields(examiningDentistId, locationId, providerIds, plannedServiceProviderIds, performedByProviderTypeId) {
       var examiningDentistIsValid = this.isExaminingDentistValid(examiningDentistId, locationId, performedByProviderTypeId);
       var providersAreValid = this.areProvidersValid(providerIds, locationId);
       var providersOnPlannedServicesAreValid = this.areProvidersOnPlannedServicesValid(plannedServiceProviderIds, locationId);

       if (examiningDentistIsValid && providersAreValid && providersOnPlannedServicesAreValid) {
           return true;
       }
       return false;
   }

   /// This function is used to check if the examining dentist is valid.It will return true or false.
   isExaminingDentistValid(examiningDentistId, locationId, performedByProviderTypeId) {
        var userResult;
        var locationResult;

        ///If the performedByProviderTypeId is not a Hygienist and the examiningDentistId is null, then return true for valid.
        if (performedByProviderTypeId && performedByProviderTypeId !== 2 && examiningDentistId === null) {
            return true;
        }

        var users = this.referenceDataService.get(this.referenceDataService.entityNames.users);
      
        users.forEach(function(user){
            if(examiningDentistId === user.UserId){
               userResult = user;
            }
        });

        if(userResult){
            userResult.Locations.forEach(function (location) {
               //ProviderTypeId 1 is Dentist
               if(location.LocationId === locationId && location.IsActive === true && location.ProviderTypeId === 1){
                  locationResult = location;
               }
           });
        }

        if (locationResult || examiningDentistId === null) {
            return true;
        }

        return false;
   }

   ///This checks if the Provider(s) are Valid. It will return true or false.
   areProvidersValid(providerIds, locationId) {
       var filteredUsers = [];
       var providerResults = [];
        
       var users = this.referenceDataService.get(this.referenceDataService.entityNames.users);
       providerIds.forEach(function(providerId){
           users.forEach(function(user){
              if(providerId === user.UserId){
                  filteredUsers.push(user);
              }
           });
       });
        
       if (filteredUsers) {
            filteredUsers.forEach(function(user){
                user.Locations.forEach(function(location){
                    //ProviderTypeId 1 is Dentist, 2 is Hygienist,3 is Assistant, and 5 is Other
                    if (location.LocationId === locationId && location.IsActive === true && (location.ProviderTypeId === 1 || location.ProviderTypeId === 2 || location.ProviderTypeId === 3 || location.ProviderTypeId === 5)) {
                        providerResults.push(user);
                    }
               });
            });
       }
 
       if (providerResults && providerResults.length > 0) {
           return true;
       }

       return false;
    }

   ///This checks if any Provider(s) on Planned Services are Invalid. It will return true or false.
    areProvidersOnPlannedServicesValid(providerIds, locationId) {
        var filteredUsers = [];
        var providerResults = [];

        ///If there are no providers then there are no planned services which means it is valid.
        if (providerIds.length === 0) {
            return true;
        }

        var users = this.referenceDataService.get(this.referenceDataService.entityNames.users);
        providerIds.forEach(function (providerId) {
            users.forEach(function (user) {
                if (providerId === user.UserId) {
                    filteredUsers.push(user);
                }
            });
        });

        if (filteredUsers) {
            filteredUsers.forEach(function (user) {
                user.Locations.forEach(function (location) {
                    //ProviderTypeId 1 is Dentist, 2 is Hygienist,3 is Assistant, and 5 is Other
                    if (location.LocationId === locationId && location.IsActive === true && (location.ProviderTypeId === 1 || location.ProviderTypeId === 2 || location.ProviderTypeId === 3 || location.ProviderTypeId === 5)) {
                        providerResults.push(user);
                    }
                });
            });
        }

        if (providerResults && providerResults.length > 0 && providerResults.length === filteredUsers.length) {
            return true;
        }

        return false;
    }
}

'use strict';

angular
    .module('Soar.BusinessCenter')
    .service('BusinessCenterServices', [
        '$resource',
        'CommonServices',
        function ($resource, commonServices) {
            return {
                BenefitPlan: commonServices.Insurance.BenefitPlan,
                Carrier: commonServices.Insurance.Carrier,
                FeeSchedule: commonServices.Insurance.FeeSchedule,
            };
        },
    ])
    .service('CustomFormsService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/customforms',
                {},
                {
                    //  <summary>
                    //  Create method POST a complete form object that contains sections and section items to the server. This object is further used to create new form template
                    //  </summary>
                    //  <param name='form'>
                    //      JSON object of user record to be created.
                    //  </param>
                    //  <returns>null</returns>
                    create: { method: 'POST' },
                    update: { method: 'PUT' },
                    getFormsByPublishedStatus: {
                        method: 'GET',
                        params: { isPublished: '@isPublished' },
                    },
                    getFormById: {
                        method: 'GET',
                        params: { formId: '@formId' },
                        url: '_soarapi_/customforms/:formId',
                    },
                    deleteFormById: {
                        method: 'DELETE',
                        params: { formId: '@formId' },
                        url: '_soarapi_/customforms/:formId',
                    },
                    activeOrInactiveFormById: {
                        method: 'PUT',
                        params: { formId: '@formId', isActive: '@isActive' },
                        url: '_soarapi_/customforms/activate/:formId',
                    },
                    medicalHistory: {
                        method: 'GET',
                        url: '_soarapi_/customForms/MedicalHistory/default',
                    },
                    hipaaAuthorization: {
                        method: 'GET',
                        url: '_soarapi_/customForms/HipaaAuthorization/default',
                    },
                }
            );
        },
    ])
    .service('CommunicationTemplateService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/templates/communicationTemplates',
                {},
                {
                    create: { method: 'POST' },
                    get: { method: 'GET' },
                    getById: {
                        method: 'GET',
                        params: { communicationTemplateId: '@communicationTemplateId' },
                        url:
                            '_soarapi_/templates/communicationTemplates/:communicationTemplateId',
                    },
                    updateTemplateForm: {
                        method: 'PUT',
                        url: '_soarapi_/templates/communicationTemplates/',
                    },
                    deleteTemplateForm: {
                        method: 'DELETE',
                        params: { communicationTemplateId: '@communicationTemplateId' },
                        url:
                            '_soarapi_/templates/communicationTemplates/:communicationTemplateId',
                    },
                    previewPostcard: {
                        method: 'POST',
                        url: '_soarapi_/templates/postcardPreview',
                    },
                }
            );
        },
    ])
    .service('UniqueCustomFormNameService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/customforms/duplicates/:formId/',
                {},
                {
                    //  <summary>
                    //  checkUniqueFormName method GET a form name to the server. Further based on provided parameters, form name is checked for uniqueness
                    //  </summary>
                    //  <param name='formName'>
                    //      JSON object of form name of user record to be created.
                    //  </param>
                    //  <param name='formId'>
                    //      JSON object of form id of user record to be created.
                    //  </param>
                    //  <returns>True if form name is unique, else false</returns>
                    checkUniqueFormName: {
                        method: 'GET',
                        params: { formName: '@formName', formId: '@formId' },
                    },
                }
            );
        },
    ])
    .service('CustomFormsPublishService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/customforms/publish/:formId',
                {},
                {
                    //  <summary>
                    //  publishFormById publishes a form by its id
                    //  </summary>
                    //  <param name='formId'>
                    //      JSON object of user record to be created.
                    //  </param>
                    //  <returns>Boolean result for form's publish status</returns>
                    publishFormById: { method: 'PUT', params: { formId: '@formId' } },
                }
            );
        },
    ])
    .service('ServiceCodesService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'ServiceCodesService',
                'aggressive',
                60000,
                60000
            );
            var factory = $resource(
                '_soarapi_/servicecodes',
                {},
                {
                    create: { method: 'POST', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    getServiceCodeById: {
                        method: 'GET',
                        params: { serviceCodeId: '@serviceCodeId' },
                        url: '_soarapi_/servicecodes/:serviceCodeId',
                    },
                    search: { method: 'GET', url: '_soarapi_/servicecodes/search' },
                    updateServiceCodes: {
                        method: 'PUT',
                        url: '_soarapi_/servicecodes/array',
                        cache: patCache,
                    },
                    containingSwiftCodes: {
                        method: 'GET',
                        params: { serviceCodeId: '@serviceCodeId' },
                        url: '_soarapi_/servicecodes/swiftpickcodes/:serviceCodeId',
                    },
                    checkServiceCodeUsage: {
                        method: 'GET',
                        params: { serviceCodeId: '@serviceCodeId' },
                        url: '_soarapi_/servicecodes/:serviceCodeId/usage',
                    },
                }
            );

            return factory;
        },
    ])
    .service('TreatmentPlansApiService', [
        '$http',
        'platformSessionService',
        function ($http, platformSessionService) {
            return {
                getTreatmentPlansWithServices: getTreatmentPlansWithServices,
            };

            function getTreatmentPlansWithServices(patientId) {
                return $http
                    .get(
                        '_clinicalapi_/persons/' +
                        patientId +
                        '/treatmentplanswithservices/'
                    )
                    .then(function (resp) {
                        return resp.data.Value;
                    });
            }
        },
    ])

    .service('UserServices', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'UserServices',
                'aggressive',
                60000,
                60000
            );
            return {
                ActivationHistory: $resource(
                    '_soarapi_/users/:Id/activationhistory',
                    {},
                    {}
                ),
                Users: $resource(
                    '_soarapi_/users/:Id',
                    {},
                    {
                        get: { method: 'GET', cache: patCache },
                        update: { method: 'PUT', cache: patCache },
                        save: { method: 'POST', cache: patCache },
                    }
                ),
                UsersByLocation: $resource(
                    '_soarapi_/userlocations/:locationId',
                    {},
                    {
                        get: {
                            method: 'GET',
                            params: { locationId: '@locationId' },
                            cache: patCache,
                        },
                    }
                ),
                UsersScheduleStatus: $resource(
                    '_soarapi_/users/:userId/scheduleStatus',
                    {},
                    {
                        get: {
                            method: 'GET',
                            params: { userId: '@userId' },
                            cache: patCache,
                        },
                    }
                ),
                UserRxType: $resource(
                    '_soarapi_/users/:userId/rxtype/:rxType',
                    {},
                    {
                        update: {
                            method: 'PUT',
                            params: { userId: '@userId', rxType: '@rxType' },
                            cache: patCache,
                        },
                    }
                ),
                getActiveUsers: $resource(
                    '_soarapi_/providers',
                    {},
                    {
                        get: {
                            method: 'GET',
                            params: {
                                active: true,
                                assistant: true,
                                dentist: true,
                                hygienist: true,
                                other: true,
                            },
                        },
                    }
                ),
                Contacts: $resource(
                    '_soarapi_/users/:Id/contacts',
                    {},
                    {
                        save: { method: 'PUT', params: { Id: '@Id' } },
                    }
                ),
                Licenses: $resource(
                    '_soarapi_/users/:Id/stateLicenses',
                    {},
                    {
                        get: { method: 'GET', params: { Id: '@Id' } },
                        update: {
                            method: 'PUT',
                            cache: patCache,
                            url: '_soarapi_/stateLicenses',
                        },
                    }
                ),
                UserPatientAccess: $resource(
                    '_soarapi_/userPatientAccess/:patientId',
                    {},
                    {
                        get: { method: 'GET', params: { patientId: '@patientId' } },
                        getAccountMemberAccess: {
                            method: 'GET',
                            params: { patientId: '@patientId' },
                            url: '_soarapi_/userPatientAccess/:patientId/accountMembers',
                        },
                        getUserLocationAccess: {
                            method: 'GET',
                            params: { locationId: '@locationId' },
                            url: '_soarapi_/userPatientAccess/:locationId/userLocationAccess',
                        },
                    }
                ),
                Providers: $resource('_soarapi_/providers/', {}, {}),
                ProviderShowOnSchedule: $resource(
                    '_sapischeduleapi_/users/:userId/showonschedule',
                    {},
                    {
                        get: {
                            method: 'GET',
                            url: '_sapischeduleapi_/users/showonschedule/all',
                        },
                        update: { method: 'PUT' },
                    }
                ),
                UserLocationSetups: $resource(
                    '_soarapi_/users/:userId/userProviderSetupLocation',
                    {},
                    {
                        create: {
                            method: 'POST',
                            url: '_soarapi_/userProviderSetupLocation',
                        },
                        delete: {
                            method: 'DELETE',
                            hasBody: true,
                            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                            params: { userId: '@userId' },
                        },
                        update: {
                            method: 'PUT',
                            url: '_soarapi_/userProviderSetupLocation',
                        },
                    }
                ),
                UserScheduleLocation: $resource(
                    '_soarapi_/users/:Id/userschedulelocation',
                    {},
                    {
                        update: {
                            method: 'PUT',
                            params: { Id: '@Id' },
                            url: '_soarapi_/users/:Id/userschedulelocation',
                        },
                        updateRolesAndLocations: {
                            method: 'PUT',
                            params: { Id: '@Id' },
                            url: '_soarapi_/users/:Id/updateUserAssignedRoles',
                        },
                        getInactiveUserAssignedLocations: {
                            method: 'GET',
                            params: { Id: '@Id' },
                            url: '_soarapi_/users/:Id/inactiveuserschedulelocation',
                        },
                        retainUserDeletedRoles: {
                            method: 'PUT',
                            params: { Id: '@Id' },
                            url: '_soarapi_/users/:Id/retainuserdeletedroles',
                        },
                    }
                ),
                UserFavorites: $resource(
                    '_soarapi_/users/:userId/favorites/:favoriteId',
                    {},
                    {
                        Delete: {
                            method: 'DELETE',
                            params: { userId: '@UserId', favoriteId: '@favoriteId' },
                        },
                        Update: {
                            method: 'PUT',
                            params: { userId: '@userId' },
                            url: '_soarapi_/users/:userId/favorites/',
                        },
                    }
                ),
                ChartButtonLayout: $resource(
                    '_clinicalapi_/users/current/chartButtonLayout',
                    {},
                    {
                        create: { method: 'POST' },
                        update: { method: 'PUT' },
                        importFavoritesFromUser: {
                            method: 'PUT',
                            params: { userId: '@userId' },
                            url: '_clinicalapi_/users/:userId/chartButtonLayout',
                        },
                        getAllUsersWithFavorites: {
                            method: 'GET',
                            url: '_clinicalapi_/users/chartButtonLayouts/all',
                        },
                        getFavoritesByServiceId: {
                            method: 'GET',
                            params: { serviceCodeId: '@serviceCodeId' },
                            url: '_clinicalapi_/users/favorites/:serviceCodeId',
                        },
                    }
                ),
                Roles: $resource(
                    '_webapiurl_/api/roles/',
                    {},
                    {
                        assignRole: {
                            method: 'POST',
                            params: {
                                userId: '@userId',
                                roleId: '@roleId',
                                practiceId: '@practiceId',
                            },
                            url:
                                '_webapiurl_/api/users/:userId/roles/:roleId/at-practice/:practiceId',
                        },
                        assignRoleByLocation: {
                            method: 'POST',
                            params: {
                                userId: '@userId',
                                roleId: '@roleId',
                                locationId: '@locationId',
                            },
                            url:
                                '_webapiurl_/api/users/:userId/roles/:roleId/at-location/:locationId',
                        },
                        deleteRole: {
                            method: 'DELETE',
                            params: {
                                userId: '@userId',
                                roleId: '@roleId',
                                practiceId: '@practiceId',
                            },
                            url:
                                '_webapiurl_/api/users/:userId/roles/:roleId/at-practice/:practiceId',
                        },
                        deleteRoleByLocation: {
                            method: 'DELETE',
                            params: {
                                userId: '@userId',
                                roleId: '@roleId',
                                locationId: '@locationId',
                            },
                            url:
                                '_webapiurl_/api/users/:userId/roles/:roleId/at-location/:locationId',
                        },
                        getUsersbyRole: {
                            method: 'GET',
                            params: { roleId: '@roleId' },
                            url: '_webapiurl_/api/roles/:roleId/users',
                        },
                        getUserRoles: {
                            method: 'GET',
                            params: {
                                applicationId: 2,
                                userId: '@userId',
                                practiceId: '@practiceId',
                            },
                            url:
                                '_webapiurl_/api/users/:userId/roles/at-practice/:practiceId',
                        },
                        getUserRolesByLocation: {
                            method: 'GET',
                            params: {
                                applicationId: 2,
                                userId: '@userId',
                                locationId: '@locationId',
                            },
                            url:
                                '_webapiurl_/api/users/:userId/roles/at-location/:locationId',
                        },
                        getActionsByRole: {
                            method: 'GET',
                            params: { roleId: '@roleId' },
                            url: '_webapiurl_/api/roles/:roleId/actions',
                        },
                        get: {
                            method: 'GET',
                            params: { applicationId: '@applicationId' },
                            url: '_webapiurl_/api/roles/',
                        },
                        getRoleMatrix: {
                            method: 'GET',
                            url: '_soarapi_/roledetails/matrix',
                        },
                        getAllRolesByLocation: {
                            method: 'GET',
                            params: { applicationId: 2, locationId: '@locationId' },
                            url: '_webapiurl_/api/users/roles/locations/:locationId',
                        },
                        getAllRolesByPractice: {
                            method: 'GET',
                            params: { applicationId: 2, practiceId: '@practiceId' },
                            url: '_webapiurl_/api/users/roles/practices/:practiceId',
                        },
                        assignUserProviderSetupLocationRoleUser: {
                            method: 'POST',
                            params: { userId: '@userId' },
                            url: '_soarapi_/users/:userId/userProviderSetupLocation/RoleUser',
                        },
                    }
                ),
                UserLoginTimes: $resource(
                    '_webapiurl_/api/userlogintimes/',
                    {},
                    {
                        update: {
                            method: 'PUT',
                            params: {
                                applicationId: 2,
                                practiceId: '@practiceId',
                                userId: '@userId',
                            },
                            url: '_webapiurl_/api/userlogintimes/:practiceId',
                        },
                        get: {
                            method: 'GET',
                            params: {
                                applicationId: 2,
                                practiceId: '@practiceId',
                                userId: '@userId',
                                day: '@day',
                            },
                            url: '_webapiurl_/api/userlogintimes/:practiceId',
                        },
                        delete: {
                            method: 'DELETE',
                            params: { practiceId: '@practiceId', entityId: '@entityId' },
                            url: '_webapiurl_/api/userlogintimes/:practiceId/:entityId',
                        },
                        getIsAllowed: {
                            method: 'GET',
                            params: {
                                applicationId: 2,
                                practiceId: '@practiceId',
                                userId: '@userId',
                            },
                            url: '_webapiurl_/api/userlogintimes/:practiceId/allowed',
                        },
                    }
                ),
                UserRoles: $resource(
                    '_webapiurl_/api/users/roles/:userId',
                    {},
                    {
                        get: {
                            method: 'GET',
                            url: '_webapiurl_/api/roles/for/user/:userId?applicationId=2',
                        },
                    }
                ),
                UserVerification: (enterpriseId) => {
                    return $resource(
                        '_platformUserServiceUrl_/api/v1/Users/',
                        {},
                        {
                            resendUserVerificationEmail: {
                                method: 'POST',
                                params: { userId: '@userId' },
                                url: '_platformUserServiceUrl_/api/v1/Users/:userId/verificationemail',
                            },
                            getADUser: {
                                method: 'GET',
                                params: { email: '@email' },
                                headers: { ApplicationID: 2, EnterpriseID: enterpriseId },
                                url: '_platformUserServiceUrl_/api/v1/Users/GetUserFromAD?userEmail=:email',
                            },
                        }
                    );
                },
                RxAccess: $resource(
                    '_rxapiurl_/api/locations/:locationId/rx-users',
                    {},
                    {
                        save: {
                            method: 'PUT',
                            params: { practiceId: '@practiceId' },
                            url: '_rxapiurl_/api/practices/:practiceId/rx-users',
                        },
                    }
                ),
                Modules: $resource(
                    '_webapiurl_/api/modules',
                    {},
                    {
                        getAllModules: { method: 'GET' },
                    }
                ),
                Functions: $resource(
                    '_webapiurl_/api/functions',
                    {},
                    {
                        getAllFunctions: { method: 'GET' },
                    }
                ),
                AdditionalIdentifiers: $resource(
                    '_soarapi_/users/:Id/additionalIdentifier',
                    {},
                    {
                        getAllAdditionalIdentifiers: {
                            method: 'GET',
                            params: { Id: '@Id' },
                        },
                        create: { method: 'POST', params: { Id: '@Id' } },
                        update: { method: 'PUT', params: { Id: '@Id' } },
                    }
                ),
                PerioExamSettings: $resource(
                    '_soarapi_/users/:Id/perioexamsettings',
                    {},
                    {
                        update: { method: 'PUT', params: { Id: '@Id' } },
                    }
                ),
                LoginActivityEvent: $resource(
                    '_soarapi_/users/loginactivityevent',
                    {},
                    {
                        create: { method: 'POST' },
                    }
                ),
            };
        },
    ])

    .service('ServiceCodeCrudService', [
        '$resource',
        function ($resource) {
            var standardService = function (
                name,
                idParams,
                url,
                canUpdate,
                canDelete,
                canCheckDuplicate,
                validationFunction
            ) {
                var methodParams = {};

                if (angular.isArray(idParams)) {
                    for (var i = 0; i < idParams.length; i++) {
                        methodParams[idParams[i]] = '@' + idParams[i];
                    }
                } else {
                    methodParams[idParams] = '@' + idParams;
                }

                var operations = {
                    Retrieve: { method: 'GET', params: methodParams },
                };

                if (canUpdate) {
                    operations.Create = { method: 'POST' };
                    operations.Update = { method: 'PUT' };
                } else {
                    operations.Save = { method: 'POST' };
                }

                if (canDelete) {
                    operations.Delete = { method: 'DELETE', params: methodParams };
                }

                if (canCheckDuplicate) {
                    operations.CheckDuplicate = {
                        method: 'GET',
                        params: methodParams,
                        url: '_soarapi_/servicecodes/duplicates/:ServiceCodeId',
                    };
                }

                return {
                    ObjectName: name,
                    IdField: angular.isArray(idParams) ? idParams[0] : idParams,
                    IsValid: validationFunction,
                    Operations: $resource(url, {}, operations),
                };
            };

            return {
                Dtos: {
                    ServiceCode: standardService(
                        'ServiceCode',
                        ['ServiceCodeId', 'Code'],
                        '_soarapi_/servicecodes/:ServiceCodeId',
                        true,
                        false,
                        true,
                        function (serviceCode) {
                            if (!serviceCode.IsSwiftPickCode) {
                                return (
                                    serviceCode.Code &&
                                    serviceCode.Description &&
                                    serviceCode.ServiceTypeId &&
                                    serviceCode.AffectedAreaId
                                );
                            } else {
                                return (
                                    serviceCode.Code &&
                                    serviceCode.Description &&
                                    serviceCode.SwiftPickServiceCodes.length > 0
                                );
                            }
                        }
                    ),
                },
            };
        },
    ])
    .service('EnterpriseSettingService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'EnterpriseSettingService',
                'aggressive',
                60000,
                60000
            );
            return {
                Enterprise: $resource(
                    '_pdcoenterpriseurl_/api/v1/enterprises/',
                    {},
                    {
                        get: {
                            method: 'GET',
                            params: { practiceId: '@practiceId' },
                            url:
                                '_pdcoenterpriseurl_/api/v1/enterprises/legacypracticeid/:practiceId',
                        },
                    }
                ),

                EnterpriseSettings: function (entId) {
                    return $resource(
                        '_enterprisesettingurl_/api/v1/enterprisesettings/',
                        {},
                        {
                            post: {
                                method: 'POST',
                                headers: { ApplicationID: 2, EnterpriseID: entId },
                                url: '_enterprisesettingurl_/api/v1/enterprisesettings/',
                            },
                            update: {
                                method: 'PUT',
                                headers: { ApplicationID: 2, EnterpriseID: entId },
                                url: '_enterprisesettingurl_/api/v1/enterprisesettings/',
                            },
                            getById: {
                                method: 'GET',
                                headers: { ApplicationID: 2, EnterpriseID: entId },
                                params: {
                                    enterpriseId: '@enterpriseId',
                                    enterpriseSettingName: '@enterpriseSettingName',
                                },
                                url:
                                    '_enterprisesettingurl_/api/v1/enterprisesettings/enterpriseId/:enterpriseId/enterprise-settings-name/:enterpriseSettingName?applicationId=2',
                            },
                            getAll: {
                                method: 'GET',
                                headers: { ApplicationID: 2, EnterpriseID: entId },
                                params: { enterpriseId: '@enterpriseId' },
                                url:
                                    '_enterprisesettingurl_/api/v1/enterprisesettings/enterpriseId/:enterpriseId/',
                            },
                        }
                    );
                },
            };
        },
    ])
    .service('CloseClaimService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_insurancesapi_/insurance/claims/close',
                {},
                {
                    update: { method: 'PUT' },
                    updateMultiple: {
                        method: 'PUT',
                        url: '_insurancesapi_/insurance/claims/closeMultiple',
                    },
                }
            );
        },
    ])
    .service('ClaimsService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_insurancesapi_/insurance/claims',
                {},
                {
                    getClaimById: {
                        method: 'GET',
                        params: { claimId: '@claimId', isClosed: '@isClosed' },
                        url: '_insurancesapi_/insurance/claims/getClaimById',
                    },
                    updateInsEst: {
                        method: 'PUT',
                        url: '_insurancesapi_/insurance/claims/updateInsEst',
                    },
                    getClaimEntityByClaimId: {
                        method: 'GET',
                        params: { claimId: '@claimId' },
                        url:
                            '_insurancesapi_/insurance/claims/getClaimEntityByClaimId/{claimId}',
                    },
                    updateClaimEntity: {
                        method: 'PUT',
                        url: '_insurancesapi_/insurance/claims/claimEntity',
                    },
                    search: {
                        method: 'POST',
                        url: '_insurancesapi_/insurance/claimsGrid',
                    },
                    getClaimRejectionMessage: {
                        method: 'GET',
                        params: { claimId: '@claimId' },
                        url:
                            '_insurancesapi_/insurance/claims/getClaimRejectionMessage/{claimId}',
                    },
                    getCarrierResponseByClaimId: {
                        method: 'GET',
                        params: { claimId: '@claimId' },
                        url:
                            '_insurancesapi_/insurance/claims/getCarrierResponseByClaimId/',
                    },
                    updateCarrierResponse: {
                        method: 'PUT',
                        url: '_insurancesapi_/insurance/predetermination/carrierResponse',
                    },
                    updateClaimEntityDocumentId: {
                        method: 'PUT',
                        url: '_insurancesapi_/insurance/claims/updatedocument',
                        params: {
                            claimEntityId: '@claimEntityId',
                            documentId: '@documentId',
                        },
                    },
                }
            );
        },
    ])
    .service('LocationServices', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'LocationServices',
                'aggressive',
                60000,
                60000
            );

            var patCacheForRteEligibility = cacheFactory.GetCache(
                'LocationServicesRteEligibility',
                'aggressive',
                300000,
                300000
            );

            return $resource(
                '_soarapi_/locations/:Id/:Category',
                {},
                {
                    update: { method: 'PUT', cache: patCache },
                    //update: { method: 'PUT', interceptor : {
                    //    response: function (response) {
                    //        patCache.destroy();
                    //        return response.resource;
                    //    }
                    //}},
                    updateFromEditLocation: {
                        method: 'PUT',
                        // EnterpriseId is needed for credit card payment integration
                        url: '_soarapi_/locations?enterpriseId=:enterpriseId',
                        cache: patCache,
                    },
                    IsNameUnique: {
                        method: 'GET',
                        params: { Name: '@Name', ExcludeLocationId: '@ExcludeLocationId' },
                        url: '_soarapi_/locations/IsNameUnique',
                    },
                    IsAbbreviatedNameUnique: {
                        method: 'GET',
                        params: { Name: '@Name', ExcludeLocationId: '@ExcludeLocationId' },
                        url: '_soarapi_/locations/IsAbbreviatedNameUnique',
                    },
                    getUsers: { method: 'GET', params: { Category: 'users' } },
                    getRooms: { method: 'GET', params: { Category: 'rooms' } },
                    getAdditionalIdentifiers: {
                        method: 'GET',
                        params: { Category: 'additionalIdentifier' },
                    },
                    get: { method: 'GET', cache: patCache },
                    save: { method: 'POST', cache: patCache },
                    getPermittedLocations: {
                        method: 'GET',
                        params: { ActionId: '@actionId' },
                    },
                    getDetailedPermittedLocations: {
                        method: 'GET',
                        params: { ActionId: '@actionId' },
                        url: '_soarapi_/locations/Detailed',
                    },
                    getRoomScheduleStatus: {
                        method: 'GET',
                        params: { locationId: '@locationId' },
                        url: '_soarapi_/locations/:locationId/roomScheduleStatus',
                    },
                    getLocationRteEnrollmentStatus: {
                        method: 'GET',
                        params: { locationId: '@locationId' },
                        url:
                            '_webapiurl_/api/locations/:locationId/integration-control/features/InsuranceServices/check',
                        cache: patCacheForRteEligibility
                    },
                    getLocationEraEnrollmentStatus: {
                        method: 'GET',
                        params: { locationId: '@locationId' },
                        url:
                            '_webapiurl_/api/locations/:locationId/integration-control/features/InsuranceServices/check',
                    },
                    //although estatements are enabled at the practice level, users who need to check for that status may only have location level rights to check.
                    //According to platform, checking at the location level will also check for enable/disable at the practice level, while only asking for location level rights
                    getLocationEstatementEnrollmentStatus: {
                        method: 'GET',
                        params: { locationId: '@locationId' },
                        url:
                            '_webapiurl_/api/locations/:locationId/integration-control/features/ElectronicStatements/check',
                    },
                    locationChangeActivityEvent: {
                        method: 'POST',
                        params: {
                            locationId: '@locationId',
                            oldLocationName: '@oldLocationName',
                            newLocationName: '@newLocationName',
                        },
                        url: '_soarapi_/locations/locationChangeActivityEvent',
                    },
                    getLocationSRHEnrollmentStatus: {
                        method: 'GET',
                        params: { locationId: '@locationId' },
                        url:
                            '_webapiurl_/api/locations/:locationId/integration-control/features/PatientCommunication/vendors/SolutionReach/check',
                    },
                    getMerchantRegistrationAsync: {
                        method: 'GET',
                        params: { locationId: '@locationId' },
                        url: '_soarapi_/locations/:locationId/paymentIntegrationRegistration',
                    },
                    getPaymentDevicesByLocationAsync: {
                        method: 'GET',
                        params: { locationId: '@locationId' },
                        url: '_soarapi_/locations/:locationId/cardReaders',
                    }
                }
            );
        },
    ])
    .service('IntegrationControlService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_webapiurl_/api',
                {},
                {
                    getEstatementEnrollmentStatus: {
                        method: 'GET',
                        params: { practiceId: '@practiceId' },
                        url:
                            '_webapiurl_/api/practices/:practiceId/integration-control/features/ElectronicStatements/check',
                    },
                }
            );
        },
    ])
    .service('TimestampCachedApiServices', [
        '$http',
        'platformSessionService',
        function ($http, platformSessionService) {
            var cachedDataItems = {};

            return {
                getLocationRooms: function (locationId) {
                    return get(
                        'cachedLocationRooms',
                        '_soarapi_/locations/' + locationId + '/rooms/timestamp/'
                    );
                },
                getLocationHours: function (locationId) {
                    return get(
                        'cachedLocationHours',
                        '_soarapi_/locations/' + locationId + '/hours/timestamp/'
                    );
                },
                getAllRolesByPractice: function (practice) {
                    return get(
                        'cachedUsersPracticeRoles',
                        '_webapiurl_/api/users/roles/practices/' +
                        practice.practiceId +
                        '/timestamp/'
                    );
                },
                getAllRolesByLocation: function (location) {
                    return get(
                        'cachedUsersLocationRoles',
                        '_webapiurl_/api/users/roles/locations/' +
                        location.locationId +
                        '/timestamp/'
                    );
                },
            };

            function storeData(cacheKey, data) {
                platformSessionService.setLocalStorage(cacheKey, data);
                if (!localStorage.hasOwnProperty(cacheKey)) {
                    cachedDataItems[cacheKey] = data;
                }
            }

            function get(cacheKey, url) {
                var memoryCacheItems = cachedDataItems;
                // Get cachedObj and timestamp from local storage
                var timestampCachedObj = platformSessionService.getLocalStorage(
                    cacheKey
                );
                var timestamp = '0';
                if (
                    !_.isNil(timestampCachedObj) &&
                    !_.isNil(timestampCachedObj.Timestamp)
                ) {
                    timestamp = timestampCachedObj.Timestamp;
                } else if (timestamp == '0') {
                    timestampCachedObj = memoryCacheItems[cacheKey];

                    if (
                        !_.isNil(timestampCachedObj) &&
                        !_.isNil(timestampCachedObj.Timestamp)
                    ) {
                        timestamp = timestampCachedObj.Timestamp;
                    }
                }

                return $http.get(url + timestamp).then(function (resp) {
                    // If the timestamp in local storage matches the cachedobj timestamp on the API side,
                    // API will return an empty payload
                    // Otherwise, save the new cachedObj and timestamp to the local storage and return the payload
                    if (!_.isNil(resp.data.Value)) {
                        storeData(cacheKey, resp.data.Value);
                    } else if (!_.isNil(resp.data.Result)) {
                        storeData(cacheKey, resp.data.Result);
                    }

                    var returnValue = platformSessionService.getLocalStorage(cacheKey);
                    if (!_.isNil(returnValue)) {
                        return returnValue.CachedObj;
                    }

                    return memoryCacheItems[cacheKey].CachedObj;
                });
            }
        },
    ])
    .service('AdjustmentTypesService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'AdjustmentTypesService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_insurancesapi_/adjustmenttypes',
                {},
                {
                    create: { method: 'POST', cache: patCache },
                    delete: { method: 'DELETE', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    GetAllAdjustmentTypesWithOutCheckTransactions: {
                        method: 'GET',
                        isActive: '@isActive',
                        params: { active: '@isActive' },
                        cache: patCache,
                    },
                    GetAdjustmentTypeAssociatedWithTransactions: {
                        method: 'GET',
                        isActive: '@isActive',
                        params: { adjustmentTypeId: '@adjustmentTypeId' },
                        url: '_insurancesapi_/adjustmenttypes/:adjustmentTypeId',
                    },
                    getAllAdjustmentTypes: {
                        method: 'GET',
                        isActive: '@isActive',
                        cache: patCache,
                    },
                    getAdjustmentTypeById: {
                        method: 'GET',
                        cache: patCache,
                        params: { adjustmentTypeId: '@adjustmentTypeId' },
                        url: '_insurancesapi_/adjustmenttypes/:adjustmentTypeId',
                    },
                    deleteAdjustmentTypeById: {
                        method: 'DELETE',
                        cache: patCache,
                        params: { adjustmentTypeId: '@adjustmentTypeId' },
                        url: '_insurancesapi_/adjustmenttypes/:adjustmentTypeId',
                    },
                }
            );
        },
    ])
    .service('PaymentTypesService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'PaymentTypesService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_insurancesapi_/paymenttypes',
                {},
                {
                    create: { method: 'POST', cache: patCache },
                    save: { method: 'POST', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    getAllPaymentTypes: {
                        method: 'GET',
                        isActive: '@isActive',
                        cache: patCache,
                    },
                    getPaymentTypeById: {
                        method: 'GET',
                        cache: patCache,
                        params: { paymentTypeId: '@paymentTypeId' },
                        url: '_insurancesapi_/paymenttypes/:paymentTypeId',
                    },
                    deletePaymentTypeById: {
                        method: 'DELETE',
                        cache: patCache,
                        params: { paymentTypeId: '@paymentTypeId' },
                        url: '_insurancesapi_/paymenttypes/:paymentTypeId',
                    },
                    getAllPaymentTypesMinimal: {
                        method: 'GET',
                        cache: patCache,
                        url: '_insurancesapi_/paymenttypes/minimal',
                    },
                }
            );
        },
    ])
    .service('ReferralTypeService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'ReferralTypeService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/referraltypes',
                {},
                {
                    create: { method: 'POST', cache: patCache },
                    delete: {
                        method: 'DELETE',
                        cache: patCache,
                        params: { referralTypeId: '@referralTypeId' },
                        url: '_soarapi_/referraltypes/:referralTypeId',
                    },
                    update: { method: 'PUT', cache: patCache },
                    GetAllReferralTypesAsync: {
                        method: 'GET',
                        params: {
                            referralSourceType: '@referralSourceType',
                            status: '@status',
                        },
                        cache: patCache,
                    },
                    GetReferralTypeById: {
                        method: 'GET',
                        cache: patCache,
                        params: { referralTypeId: '@referralTypeId' },
                        url: '_soarapi_/referraltypes/:referralTypeId',
                    },
                }
            );
        },
    ])
    .service('TypeOrMaterialsService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/typeormaterials/:typeOrMaterialId',
                {},
                {
                    /** using built-in angular resource calls */
                    update: { method: 'PUT' },
                }
            );
        },
    ])
    .service('ServiceButtonsService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/servicebuttons/:serviceButtonId',
                {},
                {
                    /** using built-in angular resource calls */
                    update: { method: 'PUT' },
                }
            );
        },
    ])
    .service('NoteTemplateCategoriesService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/clinicalnotes/categories',
                {},
                {
                    create: { method: 'POST' },
                    update: { method: 'PUT' },
                    delete: {
                        method: 'DELETE',
                        params: { categoryId: '@categoryId' },
                        url: '_soarapi_/clinicalnotes/categories/:categoryId',
                    },
                    categoriesWithTemplates: {
                        method: 'GET',
                        url: '_soarapi_/clinicalnotes/categoriesWithTemplates',
                    },
                }
            );
        },
    ])
    .service('NoteTemplatesService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/clinicalnotes/categories/:Id/templates',
                {},
                {
                    createTemplate: {
                        method: 'POST',
                        url: '_soarapi_/clinicalnotes/templateforms',
                    },
                    getTemplateBodyCustomFormById: {
                        method: 'GET',
                        params: { formId: '@formId' },
                        url: '_soarapi_/clinicalnotes/templateforms/:formId',
                    },
                    update: { method: 'PUT', url: '_soarapi_/clinicalnotes/templates' },
                    updateTemplateForm: {
                        method: 'PUT',
                        url: '_soarapi_/clinicalnotes/templateforms/',
                    },
                    deleteTemplate: {
                        method: 'DELETE',
                        params: { templateId: '@templateId' },
                        url: '_soarapi_/clinicalnotes/templateforms/:templateId',
                    },
                }
            );
        },
    ])
    .service('LocationIdentifierService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            /**
             * @ngdoc service
             * @name BusinessCenter.factory:LocationIdentifierService
             * @description Service to access API to supply additional identifier data
             **/
            var patCache = cacheFactory.GetCache(
                'LocationIdentifierService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/locationidentifier/:Id',
                {},
                {
                    get: { method: 'GET', cache: patCache },
                    save: { method: 'POST', cache: patCache },
                    create: { method: 'POST', cache: patCache },
                    delete: { method: 'DELETE', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    locationIdentifier: {
                        method: 'GET',
                        url: '_soarapi_/locationidentifier/:Id',
                    },
                }
            );
        },
    ])
    //.service('TeamMemberIdentifierService', ['$resource', function ($resource) {
    //    return $resource('_soarapi_/masteruseridentifiers/:Id', {}, {
    //        update: { method: 'PUT' },
    //        teamMemberIdentifier: {
    //            method: 'GET', url: '_soarapi_/masteruseridentifiers/:Id'
    //        }
    //    });
    //}])

    .service('TeamMemberIdentifierService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'TeamMemberIdentifierService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/masteruseridentifiers/:Id',
                {},
                {
                    get: { method: 'GET', cache: patCache },
                    save: { method: 'POST', cache: patCache },
                    create: { method: 'POST', cache: patCache },
                    delete: { method: 'DELETE', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    teamMemberIdentifier: {
                        method: 'GET',
                        url: '_soarapi_/masteruseridentifiers/:Id',
                    },
                }
            );
        },
    ])

    .service('PatientAdditionalIdentifierService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'PatientAdditionalIdentifierService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/masterpatientidentifiers/:Id',
                {},
                {
                    get: { method: 'GET', cache: patCache },
                    save: { method: 'POST', cache: patCache },
                    delete: { method: 'DELETE', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    additionalIdentifiersWithPatients: {
                        method: 'GET',
                        url: '_soarapi_/masterpatientidentifiers/:Id/patients',
                    },
                }
            );
        },
    ])

    .service('TreatmentConsentService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'TreatmentConsentService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/practiceSettings/treatmentConsentText',
                {},
                {
                    getConsent: { method: 'GET', cache: patCache },
                    createConsent: { method: 'POST', cache: patCache },
                    updateConsent: { method: 'PUT', cache: patCache },
                    deleteConsent: { method: 'DELETE', cache: patCache },
                }
            );
        },
    ])
    .service('InformedConsentMessageService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'InformedConsentMessageService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/practicesettings/informedconsenttext',
                {},
                {
                    get: { method: 'GET', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                }
            );
        },
    ])
    // TODO review caching
    .service('MedicalHistoryAlertsService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'MedicalHistoryAlertsService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/medicalhistoryalerts/:medicalHistoryAlertId',
                {},
                {
                    get: { method: 'GET', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                }
            );
        },
    ])

    .service('ReceivablesService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/receivables',
                {},
                {
                    getTotalBalance: {
                        method: 'POST',
                        url: '_soarapi_/receivables/totalbalance',
                    },
                    getTotalBalanceByLocation: {
                        method: 'POST',
                        url: '_soarapi_/receivables/totalbalancebylocation',
                    },
                    getGridTotals: {
                        method: 'POST',
                        url: '_soarapi_/receivables/gridtotals',
                    },
                }
            );
        },
    ])

    .service('ReceivablesTabService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/receivables/tab/:locationId',
                {},
                {
                    getData: { method: 'GET', params: { locationId: 'locationId' } },
                    ExportToCSVFile: {
                        method: 'POST',
                        params: {},
                        url: '_soarapi_/receivables/csvFile',
                        isArray: true,
                    },
                }
            );
        },
    ])

    //AllPatientTab: $resource('_soarapi_/patients/PatientTab/csvFile', {},
    //            {
    //                ExportToCSVFile: { method: 'POST', params: {}, url: '_soarapi_/patients/PatientTab/csvFile', isArray: true}
    //            }),

    .service('ReportsService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/reports/:route',
                {},
                {
                    GetCustom: {
                        method: 'GET',
                        params: {},
                        url: '_soarapi_/customReports/:customReportId',
                    },
                    CreateCustom: {
                        method: 'POST',
                        params: {},
                        url: '_soarapi_/customReports',
                    },
                    UpdateCustom: {
                        method: 'PUT',
                        params: {},
                        url: '_soarapi_/customReports/',
                    },
                    DeleteCustom: {
                        method: 'DELETE',
                        params: {},
                        url: '_soarapi_/customReports/:customReportId',
                    },
                    GetCustomReportGrid: {
                        method: 'POST',
                        params: {},
                        url: '_reportingapiurl_/api/v1/customReports/grid',
                    },
                    AddPrintedReportActivityEvent: {
                        method: 'POST',
                        params: {
                            reportId: '@reportId',
                            isCustomReport: '@isCustomReport',
                        },
                        url: '_soarapi_/reports/printed',
                    },
                    AddExportedReportActivityEvent: {
                        method: 'POST',
                        params: {
                            reportId: '@reportId',
                            isCustomReport: '@isCustomReport',
                        },
                        url: '_soarapi_/reports/exported',
                    },
                    AddViewedReportActivityEvent: {
                        method: 'POST',
                        params: {
                            reportId: '@reportId',
                            isCustomReport: '@isCustomReport',
                        },
                        url: '_soarapi_/reports/viewed',
                    },
                    AddUserFavoriteReport: {
                        method: 'POST',
                        params: {},
                        url: '_soarapi_/reports/UserFavoriteRepots',
                    },
                    AddUserDefinedFilter: {
                        method: 'POST',
                        params: { userDefinedFilterDto: '@userDefinedFilterDto' },
                        url: '_soarapi_/reports/UserDefinedFilter',
                    },
                    GetSpecificUserDefinedFilter: {
                        method: 'POST',
                        params: {},
                        url: '_soarapi_/reports/specificreportid/:reportId',
                    },
                    GetReportDataFromBlob: {
                        method: 'POST',
                        params: { blobReqDto: '@blobReqDto' },
                        url: '_reportingapiurl_/api/v1/GetBlobStorageFile',
                    },
                }
            );
        },
    ])

    .service('ReportingAPIService', [
        '$resource',
        function ($resource) {
            return $resource('_reportingapiurl_/api/v1/reports/:route', {}, {});
        },
    ])

    .service('FuseReportingHttpService', [
        '$resource',
        function ($resource) {
            return $resource('_fusereportingapiurl_/api/v1/reports/:route', {}, {});
        },
    ])

    .service('ReportingAPIServiceDownload', [
        '$http',
        '$window',
        '$sce',
        'toastrFactory',
        'localize',
        function ($http, $window, $sce, toastrFactory, localize) {
            this.executeDownload = function (
                reportRoute,
                data,
                downloadOnly,
                filterInfo,
                reportRunDate,
                isNewReportingAPI,
                blobId,
                contentType
            ) {
                if (data != null) {
                    data.FilterInfo = filterInfo;
                    data.ReportRunDate = reportRunDate.trim();
                }
                var path = (isNewReportingAPI || (blobId != null || blobId != undefined))
                    ? "_exportapiurl_" + "/api/Export/exportFile?blobId=" + blobId
                    : "_reportingapiurl_" + "/api/v1/reports/" + reportRoute + "/DownloadReport";

                if ((reportRoute == "GrossPerformanceByProviderDetailed" || reportRoute == "CollectionByProvider" )&& data != null) {
                    path = "_reportingapiurl_" + "/api/v1/reports/" + reportRoute + "/DownloadReport";
                    data.BlobId = blobId;
                }

                if ((isNewReportingAPI || (blobId != null || blobId != undefined)) && reportRoute != "GrossPerformanceByProviderDetailed" && reportRoute != "CollectionByProvider") {
                    data = {
                        BlobId: blobId,
                        Format: contentType
                    };
                }
                var config = {
                    skipLoader: true,
                    headers: {
                        Accept: 'application/octet-stream',
                    },
                    responseType: 'arraybuffer',
                };
                var message =
                    'Your report will open in a new tab when it is ready to print.';
                if (downloadOnly)
                    message = 'Your report will be downloaded momentarily.';
                toastrFactory.info(message, ' ', {
                    closeButton: true,
                    timeOut: 1000000,
                });

                $http
                    .post(
                        path,
                        data,
                        config
                       )
                    .then(function (res) {
                        var octetStreamMimePDF = 'application/pdf';
                        var octetStreamMimeCSV = 'text/csv';
                        var dt = new Date();
                        var filenamePrefix =
                            reportRoute +
                            '_' +
                            dt.getDate() +
                            dt.getHours() +
                            dt.getMinutes() +
                            dt.getSeconds();
                        var pdfFilename = filenamePrefix + '.pdf';
                        var csvFilename = filenamePrefix + '.csv';

                        //if content type is not set, set it to pdf
                        contentType = contentType == 'CSV' ? octetStreamMimeCSV : octetStreamMimePDF;

                        var urlCreator =
                            $window.URL ||
                            $window.webkitURL ||
                            $window.mozURL ||
                            $window.msURL;
                        if (urlCreator) {
                            var blob = new Blob([res.data], { type: contentType });
                            if ($window.navigator.msSaveOrOpenBlob) {
                                $window.navigator.msSaveOrOpenBlob(blob, pdfFilename);
                            } else {
                                if (!downloadOnly) {
                                    var url = urlCreator.createObjectURL(blob);
                                    $window.open(url);
                                    //return window.document.title = filename;
                                } else {
                                    var a = document.createElement('a');
                                    document.body.appendChild(a);
                                    a.style = 'display: none';
                                    var url = urlCreator.createObjectURL(blob);
                                    if (contentType === octetStreamMimePDF) {
                                        a.href = url;
                                        a.download = pdfFilename;
                                    } else if (contentType === octetStreamMimeCSV) {
                                        a.href = $sce.trustAsResourceUrl(url);
                                        a.download = csvFilename;
                                    }
                                    a.click();
                                }
                            }
                        }
                    })
                    .catch(function (e) {
                        toastrFactory.error(
                            localize.getLocalizedString('{0} {1}', [
                                'Document',
                                'failed to download.',
                            ]),
                            localize.getLocalizedString('Server Error')
                        );
                    });
            };
        },
    ])

    .service('PayerReportsService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/payerreport/:route',
                {},
                {
                    GetPayerReports: {
                        method: 'POST',
                        params: {},
                        url: '_soarapi_/payerreport/grid',
                    },
                    PracticeHasPayerReport: {
                        method: 'GET',
                        params: {},
                        url: '_insuranceapiurl_/api/v1/payerreport/any',
                    },
                    AssignReportProcessedStatus: {
                        method: 'PUT',
                        params: {
                            payerReportId: '@payerReportId',
                            isProcessed: '@isProcessed',
                        },
                        url:
                            '_soarapi_/payerreport?payerReportId=:payerReportId&isProcessed=:isProcessed',
                    },
                    ViewPayerReport: {
                        method: 'GET',
                        params: {},
                        url:
                            '_claimapiurl_/api/v1/practices/:practiceId/denticalclaims/:denticalId',
                    },
                }
            );
        },
    ])
    .service('BillingMessagesService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'BillingMessagesService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/practicesettings/billingmessages/:Id',
                {},
                {
                    get: { method: 'GET', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    deleteMessage: {
                        method: 'DELETE',
                        params: { accountStatementMessageId: '@accountStatementMessageId' },
                        url:
                            '_soarapi_/accounts/accountstatementmessage/:accountStatementMessageId',
                    },
                }
            );
        },
    ])

    .service('BatchStatementService', [
        '$resource',
        '$q',
        '$http',
        function ($resource, $q, $http) {
            return {
                Service: $resource(
                    '_soarapi_/batchStatements',
                    {},
                    {
                        saveNewBatch: {
                            method: 'POST',
                            params: { savePreferences: '@savePreferences' },
                            url: '_soarapi_/batchstatements?savePreferences=:savePreferences',
                        },
                        getBatchGrid: {
                            method: 'POST',
                            params: {},
                            url: '_soarapi_/batchstatements/grid',
                        },
                        fetchSingleAccountStatementData: {
                            method: 'POST',
                            params: { savePreferences: '@savePreferences' },
                            url:
                                '_soarapi_/batchstatements/grid/:accountId?savePreferences=:savePreferences',
                        },
                        update: { method: 'PUT' },
                        fetchFilterPreferences: {
                            method: 'GET',
                            url: '_soarapi_/batchstatements/userPreferences',
                        },
                        getSavedBatches: {
                            method: 'POST',
                            params: {},
                            url: '_soarapi_/batchstatements/batchGrid',
                        },
                        getSavedBatch: {
                            method: 'PUT',
                            params: { batchStatementId: '@batchStatementId' },
                            url: '_soarapi_/batchstatements/:batchStatementId',
                        },
                        getSelectedStatementsWithAlertsCount: {
                            method: 'GET',
                            params: { batchStatementId: '@batchStatementId' },
                            url: '_soarapi_/batchstatements/:batchStatementId/selectedStatementsWithAlertsCount',
                        },
                        getReport: {
                            method: 'GET',
                            params: { batchStatementId: '@batchStatementId' },
                            url: '_soarapi_/batchstatements/:batchStatementId/report',
                        },
                        getAccountStatementMessageById: {
                            method: 'GET',
                            params: { accountStatementId: '@accountStatementId' },
                            url: '_soarapi_/accounts/accountStatement/message',
                        },
                        updateAccountStatementMessageById: {
                            method: 'PUT',
                            params: {
                                accountStatementId: '@accountStatementId',
                                message: '@message',
                            },
                            url: '_soarapi_/accounts/accountStatement/message',
                        },
                        queueSubmission: {
                            method: 'PUT',
                            params: { submissionMethod: '@submissionMethod' },
                            url:
                                '_soarapi_/batchstatements/queueSubmission?submissionMethod=:submissionMethod',
                        },
                        updatebatchstatementstatus: {
                            method: 'PUT',
                            params: { batchStatementId: '@batchStatementId' },
                            url: '_soarapi_/batchstatements/updatebatchstatementstatus',
                        },
                        deletebatchStatement: {
                            method: 'DELETE',
                            params: { batchStatementId: '@batchStatementId' },
                            url:
                                '_soarapi_/batchstatements/deletebatchstatement/:batchStatementId',
                        },
                        updateAccountStatementIsSelectedOnBatch: {
                            method: 'PUT',
                            params: {
                                batchStatementId: '@batchStatementId',
                                accountStatementId: '@accountStatementId',
                                isSelected: '@isSelected',
                            },
                            url: '_soarapi_/batchstatements/:batchStatementId/accountStatements/:accountStatementId/isSelectedOnBatch/:isSelected',
                        },
                        updateIsSelectedOnBatchForEntireBatch: {
                            method: 'PUT',
                            params: {
                                batchStatementId: '@batchStatementId',
                                isSelected: '@isSelected',
                                onlyUpdateStatementsWithAlerts: '@onlyUpdateStatementsWithAlerts',
                            },
                            url: '_soarapi_/batchstatements/:batchStatementId/accountStatements/isSelectedOnBatch/:isSelected?onlyUpdateStatementsWithAlerts=:onlyUpdateStatementsWithAlerts',
                        },
                    }
                ),
                GetPdf: function (id) {
                    var q = $q.defer();
                    $http
                        .get('_soarapi_/batchstatements/' + id + '/pdf', {
                            responseType: 'arraybuffer',
                        })
                        .then(
                            function (res) {
                                q.resolve(res);
                            },
                            function (error) {
                                q.reject(error);
                            }
                        );
                    return q.promise;
                },
                GetSingleStatementPdfFromSettings: function (data) {
                    var q = $q.defer();
                    $http
                        .post(
                            '_soarapi_/accounts/accountstatement/GetAccountStatementPdf',
                            data,
                            {
                                responseType: 'arraybuffer',
                            }
                        )
                        .then(
                            function (res) {
                                q.resolve(res);
                            },
                            function (error) {
                                q.reject(error);
                            }
                        );
                    return q.promise;
                },
            };
        },
    ])

    .service('AccountStatementMessagesService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'AccountStatementMessagesService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/accounts/accountstatementmessage',
                {},
                {
                    all: { method: 'GET', cache: patCache },
                    save: { method: 'POST', cache: patCache },
                    update: { method: 'PUT', cache: patCache },
                    getDuplicate: {
                        method: 'GET',
                        url: '_soarapi_/accounts/accountstatementmessage/duplicates',
                    },
                }
            );
        },
    ])

    .service('CommunicationTemplateDataPointsService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/templates/communicationTemplateDataPoints',
                {},
                {
                    get: { method: 'GET' },
                }
            );
        },
    ])

    .service('BankAccountModalService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/practice/bankAccounts',
                {},
                {
                    create: {
                        method: 'POST',
                        url: '_soarapi_/practice/bankAccounts/add',
                    },
                    update: {
                        method: 'PUT',
                        url: '_soarapi_/practice/bankAccounts/update',
                    },
                }
            );
        },
    ])

    .service('PerioService', [
        '$resource',
        function ($resource) {
            return $resource('_soarapi_/perio/exampaths', {}, {});
        },
    ])
    .service('FeeListsService', [
        '$resource',
        'PatCacheFactory',
        function ($resource, cacheFactory) {
            var patCache = cacheFactory.GetCache(
                'FeeListsService',
                'aggressive',
                60000,
                60000
            );
            return $resource(
                '_soarapi_/feelists/:feelistId',
                {},
                {
                    create: { method: 'POST', cache: patCache },
                    getById: {
                        method: 'GET',
                        params: { forImport: '@forImport' },
                        cache: patCache,
                    },
                    new: { method: 'GET', url: '_soarapi_/feelists/new' },
                    update: {
                        method: 'PUT',
                        params: { saveAsDraft: '@saveAsDraft' },
                        cache: patCache,
                    },
                    get: {
                        method: 'GET',
                        cache: patCache,
                        url: '_soarapi_/feelists/locations',
                    },
                    delete: {
                        method: 'DELETE',
                        params: { draftOnly: '@draftOnly' },
                        cache: patCache,
                    },
                    nameUniqueness: {
                        method: 'GET',
                        params: { name: '@feeListName', feeListId: '@feeListId' },
                        url:
                            '_soarapi_/feelists/nameUniqueness?name=:feeListName&excludeId=:feeListId',
                    },
                    nameUniquenessNoExcludeId: {
                        method: 'GET',
                        params: { name: '@feeListName' },
                        url: '_soarapi_/feelists/nameUniqueness?name=:feeListName',
                    },
                }
            );
        },
    ])
    .service('DepositService', [
        '$resource',
        function ($resource) {
            return $resource(
                '_soarapi_/deposit/',
                {},
                {
                    create: { method: 'POST', url: '_soarapi_/deposit/add' },
                    delete: {
                        method: 'PUT',
                        params: { depositId: '@depositId' },
                        url: '_soarapi_/deposit/delete/:depositId',
                    },
                    getDepositDetails: {
                        method: 'GET',
                        params: { locationId: '@locationId', depositId: '@depositId' },
                        url: '_soarapi_/deposit/getDepositDetails/:locationId/:depositId',
                    },
                    getSelectedDeposit: {
                        method: 'POST',
                        params: { locationId: '@locationId', depositId: '@depositId' },
                        url: '_soarapi_/deposit/getSelectedDeposit/:locationId/:depositId',
                    },
                    getDepositIdByCreditTransactionId: {
                        method: 'GET',
                        params: { creditTransactionId: '@creditTransactionId' },
                        url: '_soarapi_/depositId?creditTransactionId=:creditTransactionId',
                    },
                    edit: {
                        method: 'PUT',
                        params: { editDepositId: '@editDepositId' },
                        url: '_soarapi_/deposit/edit/:editDepositId',
                    },
                }
            );
        },
    ]);

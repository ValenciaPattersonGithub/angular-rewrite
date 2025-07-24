/* global toastr:false */

'use strict';
angular.module('Soar.Schedule').factory('ProviderShowOnScheduleFactory', [
  'localize',
  '$q',
  'toastrFactory',
  'patSecurityService',
  '$filter',
  'UserServices',
  'referenceDataService',
  'StaticData',
  function (
    localize,
    $q,
    toastrFactory,
    patSecurityService,
    $filter,
    userServices,
    referenceDataService,
    staticData
  ) {
    var factory = this;
    factory.showOnScheduleExceptions = [];
    factory.providerHasEventsMessage = localize.getLocalizedString(
      'Cannot hide this provider from Schedule until provider assignments are removed.'
    );
    factory.providerTypes = {};
    staticData.ProviderTypes().then(function (res) {
      _.forEach(res.Value, function (type) {
        factory.providerTypes[type.Id] = type.Name;
      });
    });

    //TODO get correct amfa
    factory.hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };

    //#region authentication

    factory.viewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizusr-view'
      );
    };

    factory.createAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizusr-add'
      );
    };

    factory.updateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizusr-edit'
      );
    };

    factory.access = function () {
      factory.hasAccess.Create = factory.createAccess();
      factory.hasAccess.Edit = factory.updateAccess();
      factory.hasAccess.View = factory.viewAccess();
      return factory.hasAccess;
    };

    //#endregion

    //#region internal methods

    factory.createProviderShowOnScheduleDto = function (
      providerId,
      providerShowOnScheduleDto
    ) {
      if (factory.createAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        userServices.ProviderShowOnSchedule.save(
          { userId: providerId },
          providerShowOnScheduleDto
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            var displayMessage = false;
            angular.forEach(res.data.InvalidProperties, function (v, k) {
              if (
                v.ValidationMessage ===
                'User can only be hidden on the schedule if there are no assigned hours'
              ) {
                displayMessage = true;
              }
            });
            if (displayMessage) {
              // show extended toastr message
              toastr.options = {
                positionClass: 'toast-bottom-right',
                timeOut: '5000',
                showEasing: 'swing',
                hideEasing: 'linear',
                showMethod: 'fadeIn',
                hideMethod: 'fadeOut',
                'body-output-type': 'trustedHtml',
              };
              toastr.info(factory.providerHasEventsMessage, 'Show on Schedule');
            } else {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          }
        );
        return promise;
      }
    };

    factory.updateProviderShowOnScheduleDto = function (
      providerId,
      providerShowOnScheduleDto
    ) {
      if (factory.updateAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        userServices.ProviderShowOnSchedule.update(
          { userId: providerId },
          providerShowOnScheduleDto
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            var displayMessage = false;
            angular.forEach(res.data.InvalidProperties, function (v, k) {
              if (
                v.ValidationMessage ===
                'User can only be hidden on the schedule if there are no assigned hours'
              ) {
                displayMessage = true;
              }
            });
            if (displayMessage) {
              // show extended toastr message
              toastr.options = {
                positionClass: 'toast-bottom-right',
                timeOut: '5000',
                showEasing: 'swing',
                hideEasing: 'linear',
                showMethod: 'fadeIn',
                hideMethod: 'fadeOut',
                'body-output-type': 'trustedHtml',
              };
              toastr.info(factory.providerHasEventsMessage, 'Show on Schedule');
            } else {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Update was unsuccessful. Please retry your update.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          }
        );
        return promise;
      }
    };

    factory.saveProviderShowOnSchedule = function (
      providerId,
      providerShowOnScheduleDto
    ) {
      if (!providerShowOnScheduleDto.ProviderShowOnScheduleExceptionId) {
        return factory.createProviderShowOnScheduleDto(
          providerId,
          providerShowOnScheduleDto
        );
      } else {
        return factory.updateProviderShowOnScheduleDto(
          providerId,
          providerShowOnScheduleDto
        );
      }
    };

    factory.getProviderShowOnScheduleDto = function (providerId, locationId) {
      var providerShowOnScheduleExceptionDto = {
        UserId: providerId,
        LocationId: locationId,
        ShowOnSchedule: false,
      };
      return providerShowOnScheduleExceptionDto;
    };

    factory.getAllProviderShowOnScheduleExceptions = function () {
      if (factory.viewAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        userServices.ProviderShowOnSchedule.get().$promise.then(
          function (res) {
            factory.showOnScheduleExceptions = res.Value;
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again',
                ['Schedule Exceptions']
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );
        return promise;
      }
    };

    factory.getProviderLocations = function (includeShowOnSchedule) {
      if (factory.viewAccess()) {
        var defer = $q.defer();
        referenceDataService
          .getData(referenceDataService.entityNames.users)
          .then(function (data) {
            var users = data;
            if (includeShowOnSchedule === true) {
              factory
                .getAllProviderShowOnScheduleExceptions()
                .then(function (res) {
                  defer.resolve(factory.processUsers(users, res.Value));
                });
            } else {
              defer.resolve(factory.processUsers(users));
            }
          });
        return defer.promise;
      }
    };

    factory.processUsers = function (userList, showOnScheduleExceptions) {
      var providerList = [];

      var showOnScheduleLookup = {};
      if (
        !_.isNil(showOnScheduleExceptions) &&
        showOnScheduleExceptions.length > 0
      ) {
        _.forEach(showOnScheduleExceptions, function (exception) {
          if (_.isNil(showOnScheduleLookup[exception.UserId])) {
            showOnScheduleLookup[exception.UserId] = {};
          }

          var lookupEntry = showOnScheduleLookup[exception.UserId];
          lookupEntry[exception.LocationId] = exception;
        });
      }

      _.forEach(userList, function (user) {
        // need to display if user is inactive
        //if (user.IsActive !== true) return;

        _.forEach(user.Locations, function (locationSetup) {
          if (_.includes([1, 2, 3, 5], locationSetup.ProviderTypeId)) {
            var provider = {
              UserId: user.UserId,
              LocationId: locationSetup.LocationId,
              FirstName: user.FirstName,
              LastName: user.LastName,
              FullName: user.ProfessionalDesignation
                ? user.FirstName +
                  ' ' +
                  user.LastName +
                  ', ' +
                  user.ProfessionalDesignation
                : user.FirstName + ' ' + user.LastName,
              ProfessionalDesignation: user.ProfessionalDesignation,
              ProviderType: factory.providerTypes[locationSetup.ProviderTypeId],
              ProviderTypeId: locationSetup.ProviderTypeId,
              Color: locationSetup.Color,
              UserCode: user.UserCode,
              IsActive: locationSetup.IsActive,
            };

            if (!_.isNil(showOnScheduleExceptions)) {
              provider.ShowOnSchedule = false;
              if (
                locationSetup.ProviderTypeId === 1 ||
                locationSetup.ProviderTypeId === 2
              ) {
                provider.ShowOnSchedule = true;
              }

              // if have exceptions find matching and override default setting
              var lookupEntry = showOnScheduleLookup[user.UserId];
              if (!_.isNil(lookupEntry)) {
                var exception = lookupEntry[locationSetup.LocationId];
                if (!_.isNil(exception)) {
                  provider.ShowOnSchedule = exception.ShowOnSchedule;
                  provider.ShowOnScheduleException = exception;
                }
              }
            }

            providerList.push(provider);
          }
        });
      });
      // sort by IsActive, then LastName so that active users are at the top of the list
      providerList = _.orderBy(
        providerList,
        ['IsActive', 'LastName', 'FirstName'],
        ['desc', 'asc', 'asc']
      );
      return providerList;
    };

    //#endregion

    return {
      access: function () {
        return factory.access();
      },
      save: function (providerId, providerShowOnScheduleException) {
        return factory.saveProviderShowOnSchedule(
          providerId,
          providerShowOnScheduleException
        );
      },
      providerShowOnScheduleExceptionDto: function (providerId, locationId) {
        return factory.getProviderShowOnScheduleDto(providerId, locationId);
      },
      getAll: function () {
        return factory.getAllProviderShowOnScheduleExceptions();
      },
      getProviderLocations: function (includeShowOnSchedule) {
        return factory.getProviderLocations(includeShowOnSchedule);
      },
      getSavedShowOnProviderExceptions: function () {
        return factory.showOnScheduleExceptions;
      },
    };
  },
]);

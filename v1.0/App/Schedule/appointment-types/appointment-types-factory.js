'use strict';

angular.module('Soar.Schedule').factory('AppointmentTypesFactory', [
  'AppointmentTypesService',
  '$filter',
  'localize',
  '$q',
  'toastrFactory',
  '$timeout',
  'ListHelper',
  'patSecurityService',
  'referenceDataService',
  function (
    appointmentTypesService,
    $filter,
    localize,
    $q,
    toastrFactory,
    $timeout,
    listHelper,
    patSecurityService,
    referenceDataService
  ) {
    var factory = this;
    factory.appointmentTypes = [];
    var observers = [];

    //#region authentication
    factory.hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };
    factory.authCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sapttp-add'
      );
    };

    factory.authDeleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sapttp-delete'
      );
    };

    factory.authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sapttp-edit'
      );
    };

    factory.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sapttp-view'
      );
    };

    factory.authAccess = function () {
      if (!factory.authViewAccess()) {
      } else {
        factory.hasAccess.Create = factory.authCreateAccess();
        factory.hasAccess.Delete = factory.authDeleteAccess();
        factory.hasAccess.Edit = factory.authEditAccess();
        factory.hasAccess.View = true;
      }
      return factory.hasAccess;
    };

    //#endregion

    //endregion
    factory.getAppointmentTypeColors = function (appointmentTypes) {
      var appointmentTypeColors = [];
      angular.forEach(appointmentTypes, function (appointmentType) {
        var index = listHelper.findIndexByFieldValue(
          appointmentTypeColors,
          'color',
          appointmentType.AppointmentTypeColor
        );
        if (index === -1) {
          appointmentTypeColors.push({
            color: appointmentType.AppointmentTypeColor,
          });
        }
      });
      return appointmentTypeColors;
    };

    factory.addComputedColumnsToAppointmentTypes = function (appointmentTypes) {
      angular.forEach(appointmentTypes, function (appointmentType) {
        //appointmentType.$$ProviderName = factory.getProviderType(appointmentType.PerformedByProviderTypeId);
        //appointmentType.$$DefaultDuration = factory.getDurationString(appointmentType.DefaultDuration);
        //appointmentType.$$UsualAmount = ctrl.getFormattedAmount(appointmentType.UsualAmount);
      });
    };

    factory.getAppointmentTypes = function () {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authViewAccess) {
        var appointmentTypes = referenceDataService.get(
          referenceDataService.entityNames.appointmentTypes
        );
        factory.appointmentTypes = appointmentTypes;
        promise = $.extend(promise, { values: factory.appointmentTypes });
        defer.resolve({ Value: factory.appointmentTypes });
      }

      return promise;
    };

    //manage list when updated, new , or deleted
    factory.manageList = function (
      appointmentType,
      appointmentTypes,
      removeType
    ) {
      var index = listHelper.findIndexByFieldValue(
        appointmentTypes,
        'AppointmentTypeId',
        appointmentType.AppointmentTypeId
      );
      if (removeType === false) {
        if (index > -1) {
          appointmentTypes.splice(index, 1, appointmentType);
        } else {
          appointmentTypes.push(appointmentType);
        }
      } else {
        if (index > -1) {
          appointmentTypes.splice(index, 1);
        }
      }
      angular.forEach(observers, function (observer) {
        observer(appointmentTypes);
      });
    };

    factory.create = function (appointmentType, appointmentTypes) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authCreateAccess) {
        appointmentTypesService.create(appointmentType).$promise.then(
          function (res) {
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been created.', [
                'appointment type',
              ]),
              localize.getLocalizedString('Success')
            );
            var createdAppointmentType = res.Value;
            factory.manageList(createdAppointmentType, appointmentTypes, false);
            promise = $.extend(promise, { values: createdAppointmentType });
            defer.resolve(res);
            referenceDataService.forceEntityExecution(
              referenceDataService.entityNames.appointmentTypes
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Save was unsuccessful. Please retry your save.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    factory.update = function (appointmentType, appointmentTypes) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authEditAccess) {
        appointmentTypesService.update(appointmentType).$promise.then(
          function (res) {
            toastrFactory.success(
              localize.getLocalizedString('Update {0}.', ['successful']),
              localize.getLocalizedString('Success')
            );
            var updatedAppointmentType = res.Value;
            factory.manageList(updatedAppointmentType, appointmentTypes, false);
            promise = $.extend(promise, { values: updatedAppointmentType });
            defer.resolve(res);
            referenceDataService.forceEntityExecution(
              referenceDataService.entityNames.appointmentTypes
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Update was unsuccessful. Please retry your save.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    factory.delete = function (appointmentType, appointmentTypes) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authDeleteAccess) {
        var params = appointmentType;
        params.Id = appointmentType.AppointmentTypeId;
        appointmentTypesService.deleteAppointmentTypeById(params).$promise.then(
          function (res) {
            toastrFactory.success(
              localize.getLocalizedString('Delete {0}', ['successful']),
              localize.getLocalizedString('Success')
            );
            factory.manageList(appointmentType, appointmentTypes, true);
            defer.resolve(res);
            referenceDataService.forceEntityExecution(
              referenceDataService.entityNames.appointmentTypes
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Delete was unsuccessful. Please retry your delete.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    factory.appointmentTypeMinutes = function () {
      var minutes = [];
      for (var i = 5; i < 996; i += 5) {
        minutes.push(i.toString());
      }
      return minutes;
    };

    return {
      Access: function () {
        return factory.authAccess();
      },
      ObserveTypes: function (observer) {
        observers.push(observer);
      },
      AppointmentTypes: factory.getAppointmentTypes,
      AppointmentTypeColors: function (appointmentTypes) {
        return factory.getAppointmentTypeColors(appointmentTypes);
      },
      Update: function (appointmentType, appointmentTypes) {
        return factory.update(appointmentType, appointmentTypes);
      },
      Create: function (appointmentType, appointmentTypes) {
        return factory.create(appointmentType, appointmentTypes);
      },
      Delete: function (appointmentType, appointmentTypes) {
        return factory.delete(appointmentType, appointmentTypes);
      },
      AppointmentTypeMinutes: function () {
        return factory.appointmentTypeMinutes();
      },
    };
  },
]);

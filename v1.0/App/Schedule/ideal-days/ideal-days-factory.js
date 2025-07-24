'use strict';
angular.module('Soar.Schedule').factory('IdealDayTemplatesFactory', [
  'localize',
  '$q',
  'toastrFactory',
  'patSecurityService',
  '$filter',
  'StaticData',
  'ScheduleServices',
  'ListHelper',
  'CommonServices',
  function (
    localize,
    $q,
    toastrFactory,
    patSecurityService,
    $filter,
    staticData,
    scheduleServices,
    listHelper,
    commonServices
  ) {
    var factory = this;
    factory.observers = [];
    factory.templates = [];

    //TODO get correct amfa
    factory.hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };

    //#region authentication

    factory.createAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.updateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.deleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.viewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-schidl-idlprv'
      );
    };

    factory.viewAppointmentTypesAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sapttp-view'
      );
    };

    factory.viewProviderHoursAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sprvhr-view'
      );
    };

    factory.access = function () {
      if (!factory.viewAccess()) {
      } else {
        factory.hasAccess.Create = factory.createAccess();
        factory.hasAccess.Update = factory.updateAccess();
        factory.hasAccess.Delete = factory.deleteAccess();
        factory.hasAccess.View = true;
      }
      return factory.hasAccess;
    };

    //#endregion

    //#region internal methods

    factory.getProviderTypes = function () {
      return staticData.ProviderTypes();
    };

    factory.getPracticeSettings = async function () {
      return (await commonServices.PracticeSettings.Operations.Retrieve()).Value;
    };

    factory.removeTemplate = function (template) {
      var index = listHelper.findIndexByFieldValue(
        factory.templates,
        'TemplateId',
        template.TemplateId
      );
      if (index > -1) {
        factory.templates.splice(index, 1);
      }
      angular.forEach(factory.observers, function (observer) {
        observer(factory.templates);
      });
    };

    factory.updateTemplates = function (template) {
      var index = listHelper.findIndexByFieldValue(
        factory.templates,
        'TemplateId',
        template.TemplateId
      );
      if (index > -1) {
        factory.templates.splice(index, 1);
      }
      factory.templates.push(template);
      angular.forEach(factory.observers, function (observer) {
        observer(factory.templates);
      });
    };

    factory.getIdealDayTemplateById = function (idealDayTemplateId) {
      if (factory.viewAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        scheduleServices.IdealDayTemplates.get({
          templateId: idealDayTemplateId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Ideal Day Template']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.getIdealDayTemplates = function () {
      if (factory.viewAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        factory.templates = [];
        scheduleServices.IdealDayTemplates.get().$promise.then(
          function (res) {
            factory.templates = res.Value;
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Ideal Day Templates']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.createIdealDayTemplate = function (idealDayTemplate) {
      if (factory.createAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        scheduleServices.IdealDayTemplates.save(idealDayTemplate).$promise.then(
          function (res) {
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been created.', [
                'Ideal Day Template',
              ]),
              localize.getLocalizedString('Success')
            );
            factory.updateTemplates(res.Value);
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
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
        return promise;
      }
    };

    factory.deleteIdealDayTemplate = function (idealDayTemplate) {
      if (factory.deleteAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        var templateToDelete = angular.copy(idealDayTemplate);
        scheduleServices.IdealDayTemplates.delete({
          templateId: idealDayTemplate.TemplateId,
        }).$promise.then(
          function (res) {
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been deleted.', [
                'Ideal Day Template',
              ]),
              localize.getLocalizedString('Success')
            );
            factory.removeTemplate(templateToDelete);
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Delete was unsuccessful. Please retry your update.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.updateIdealDayTemplate = function (idealDayTemplate) {
      if (factory.updateAccess()) {
        var defer = $q.defer();
        var promise = defer.promise;
        scheduleServices.IdealDayTemplates.update(
          idealDayTemplate
        ).$promise.then(
          function (res) {
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been updated.', [
                'Ideal Day Template',
              ]),
              localize.getLocalizedString('Success')
            );
            factory.updateTemplates(res.Value);
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Update was unsuccessful. Please retry your update.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    factory.saveIdealDayTemplate = function (idealDayTemplate) {
      if (!idealDayTemplate.TemplateId) {
        return factory.createIdealDayTemplate(idealDayTemplate);
      } else {
        return factory.updateIdealDayTemplate(idealDayTemplate);
      }
    };

    factory.getIdealDayTemplateDto = function () {
      var idealDayTemplateDto = {
        TemplateId: null,
        Name: null,
        Details: [],
      };
      return idealDayTemplateDto;
    };

    factory.getIdealDayDetailDto = function () {
      var idealDayDetailDto = {
        StartTime: null,
        EndTime: null,
        AppointmentTypeId: null,
      };
      return idealDayDetailDto;
    };

    //#endregion

    return {
      access: function () {
        return factory.access();
      },
      get: function () {
        return factory.getIdealDayTemplates();
      },
      getById: function (templateId) {
        return factory.getIdealDayTemplateById(templateId);
      },
      PracticeSettings: async function () {
        return factory.getPracticeSettings();
      },
      ProviderTypes: function () {
        return factory.getProviderTypes();
      },
      save: function (idealDayTemplate) {
        return factory.saveIdealDayTemplate(idealDayTemplate);
      },
      delete: function (template) {
        return factory.deleteIdealDayTemplate(template);
      },
      IdealDayTemplateDto: function () {
        return factory.getIdealDayTemplateDto();
      },
      IdealDayDetailDto: function () {
        return factory.getIdealDayDetailDto();
      },
      // subscribe to changes
      observeTemplates: function (observer) {
        factory.observers.push(observer);
      },
    };
  },
]);

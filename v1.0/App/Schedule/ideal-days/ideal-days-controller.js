'use strict';

var app = angular.module('Soar.Schedule');
var idealDaysController = app.controller('IdealDaysController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  'patSecurityService',
  '$location',
  'ListHelper',
  'ModalFactory',
  '$filter',
  '$uibModalInstance',
  'IdealDayTemplatesFactory',
  'idealDayTemplates',
  'manageIdealDaysCallback',
  'referenceDataService',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    patSecurityService,
    $location,
    listHelper,
    modalFactory,
    $filter,
    $uibModalInstance,
    idealDayTemplatesFactory,
    idealDayTemplates,
    manageIdealDaysCallback,
    referenceDataService
  ) {
    var ctrl = this;
    $scope.mode = 'list';
    $scope.dataForCrudOperation = {};
    $scope.dataForCrudOperation.DataHasChanged = false;
    $scope.idealDayTemplates = idealDayTemplates;

    ctrl.init = function () {
      ctrl.getAppointmentTypes();
      ctrl.getPracticeSettings().then(() => {
        $scope.updateTemplates($scope.idealDayTemplates);
        $scope.$apply();
      })
    };

    $scope.closeModal = function () {
      $uibModalInstance.close();
    };

    //#region list

    //#endregion

    //#region crud

    $scope.newIdealDay = function () {
      $scope.mode = 'new';
      $scope.dataForCrudOperation.mode = 'new';
    };

    // modal cancelled or operation finished - revert to list view
    $scope.cancel = function () {
      $scope.mode = 'list';
      $scope.dataForCrudOperation.mode = 'list';
      $scope.dataForCrudOperation.selectedTemplateId = null;
    };

    $scope.editTemplate = function (template) {
      // get the template
      $scope.dataForCrudOperation.selectedTemplateId = template.TemplateId;
      $scope.mode = 'edit';
      $scope.dataForCrudOperation.mode = 'edit';
    };

    $scope.deleteTemplate = function (template) {
      // get the template
      $scope.mode = 'list';
      $scope.dataForCrudOperation.mode = 'list';
      var title = localize.getLocalizedString('Delete {0}', ['Template']);
      var message = localize.getLocalizedString(
        'Deleting this ideal day template will remove it from any provider hour assignments . Are you sure you want to continue?'
      );
      modalFactory
        .ConfirmModal('Delete Template', message, 'Yes', 'No')
        .then(ctrl.deleteConfirmed.bind(null, template));
    };

    ctrl.deleteCancelled = function () { };

    ctrl.deleteConfirmed = function (template) {
      idealDayTemplatesFactory.delete(template);
    };

    // update local list when it changes
    $scope.updateTemplates = function (templates) {
      ctrl.formatDuration(templates);
      $scope.idealDayTemplates = templates;
    };

    ctrl.formatDuration = function (templates) {
      if (!templates) return;

      angular.forEach(templates, function (template) {
        if (!template) return;

        var hours = Math.floor(template.Duration / 60);
        var minutes = template.Duration % 60;
        var h = hours == 1 ? 'hour' : 'hours';
        var hStr = localize.getLocalizedString('{0} ' + h, [{ skip: hours }]);
        var mStr = '';
        if (minutes > 0) {
          var m = minutes == 1 ? 'minute' : 'minutes';
          mStr =
            ', ' + localize.getLocalizedString('{0} ' + m, [{ skip: minutes }]);
        }
        template.$$Duration = '(' + hStr + mStr + ')';
      });
    };

    // subscribe to changes in templates list
    idealDayTemplatesFactory.observeTemplates($scope.updateTemplates);

    //#endregion

    //#region supporting methods

    ctrl.viewAppointmentTypesAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sapttp-view'
      );
    };

    ctrl.getAppointmentTypes = function () {
      if (ctrl.viewAppointmentTypesAccess()) {
        var appointmentTypes = referenceDataService.get(
          referenceDataService.entityNames.appointmentTypes
        );
        $scope.appointmentTypes = appointmentTypes;
        $scope.dataForCrudOperation.appointmentTypes = appointmentTypes;
      }
    };

    ctrl.getPracticeSettings = async function () {
      const practiceSettings = await idealDayTemplatesFactory.PracticeSettings();
      $scope.practiceSettings = practiceSettings;
      $scope.dataForCrudOperation.practiceSettings = practiceSettings;
    };

    //#endregion

    // #region sorting

    // scope variable that holds ordering details
    $scope.orderBy = {
      field: 'Name',
      asc: true,
    };

    // function to apply orderBy functionality
    $scope.changeSortingForGrid = function (field) {
      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
      $scope.orderBy = {
        field: field,
        asc: asc,
      };
    };

    //#endregion

    ctrl.init();
  },
]);

'use strict';
var app = angular.module('Soar.BusinessCenter');
var patientMedicalAlertsController = app.controller(
  'PatientMedicalAlertsController',
  [
    '$scope',
    '$timeout',
    'toastrFactory',
    'StaticData',
    'localize',
    'patSecurityService',
    '$location',
    'MedicalHistoryAlertsFactory',
    'ModalFactory',
    'ListHelper',
    '$filter',
    function (
      $scope,
      $timeout,
      toastrFactory,
      staticData,
      localize,
      patSecurityService,
      $location,
      medicalHistoryAlertsFactory,
      modalFactory,
      listHelper,
      $filter
    ) {
      var ctrl = this;

      //#region auth
      //TODO!!!!!!!!!!!!

      ctrl.getAccess = function () {
        $scope.access = medicalHistoryAlertsFactory.access();
        if (!$scope.access.View) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-biz-medalt-view'),
            'Not Authorized'
          );
          event.preventDefault();
          $location.path('/');
        }
      };
      ctrl.getAccess();

      //#endregion

      // initializer function
      ctrl.$onInit = function () {
        //$scope.dynamicAmfa = 'soar-biz-tpmsg-add';
        $scope.pageTitle = localize.getLocalizedString(
          'Medical History Alerts'
        );
        ctrl.createBreadCrumb();
        $scope.medicalHistoryAlerts = [];

        $scope.medicalHistoryAlerts = $filter('orderBy')(
          $scope.alerts,
          'Description'
        );
        medicalHistoryAlertsFactory.SetActiveMedicalHistoryAlerts(
          $scope.medicalHistoryAlerts
        );
      };

      //#region breadcrumbs
      ctrl.createBreadCrumb = function () {
        $scope.breadCrumbPaths = {};
        $scope.breadCrumbPaths.BreadCrumbs = [
          {
            name: localize.getLocalizedString('Practice Settings'),
            path: '/BusinessCenter/PracticeSettings/',
            title: 'Practice Settings',
          },
          {
            name: $scope.pageTitle,
            path: '/BusinessCenter/PatientAlerts/',
            title: 'Patient Alerts',
          },
        ];
      };

      // change url
      $scope.changePath = function (breadcrumb) {
        $location.url(breadcrumb.path);
        document.title = breadcrumb.title;
      };

      //#endregion

      //#region close form

      // final closing function
      $scope.closeForm = function () {
        $scope.changePath($scope.breadCrumbPaths.BreadCrumbs[0]);
      };
      // update local list when it changes
      $scope.updateMedicalHistoryAlerts = function (
        updatedMedicalHistoryAlert
      ) {
        var index = listHelper.findIndexByFieldValue(
          $scope.medicalHistoryAlerts,
          'MedicalHistoryAlertId',
          updatedMedicalHistoryAlert.MedicalHistoryAlertId
        );
        // replace in list
        if (index > -1) {
          $scope.medicalHistoryAlerts.splice(
            index,
            1,
            updatedMedicalHistoryAlert
          );
        }
      };

      // filter out premedication alert
      $scope.filterByMedicalHistoryAlertTypeId = function (alert) {
        return alert.MedicalHistoryAlertTypeId;
      };

      // subscribe to notes list changes
      medicalHistoryAlertsFactory.observeMedicalHistoryAlerts(
        $scope.updateMedicalHistoryAlerts
      );

      ctrl.$onInit();

      $scope.$watch('medicalHistoryAlerts', function (nv) {
        //  console.log(nv[0])
      });
    },
  ]
);

//TODO
// localize
// amfa
// less

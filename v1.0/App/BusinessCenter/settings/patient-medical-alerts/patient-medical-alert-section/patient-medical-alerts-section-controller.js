'use strict';
angular
  .module('Soar.BusinessCenter')
  .controller('PatientMedicalAlertsSectionController', [
    '$scope',
    '$timeout',
    'toastrFactory',
    'StaticData',
    'localize',
    'patSecurityService',
    '$location',
    'MedicalHistoryAlertsFactory',
    'ListHelper',
    function (
      $scope,
      $timeout,
      toastrFactory,
      staticData,
      localize,
      patSecurityService,
      $location,
      medicalHistoryAlertsFactory,
      listHelper
    ) {
      var ctrl = this;

      // initializer function
      ctrl.$onInit = function () {
        $scope.hasChanges = false;
        //$scope.dynamicAmfa = 'soar-biz-tpmsg-add';
        ctrl.setSectionTitle();
        ctrl.setGridForSection();
      };

      $scope.setGenerateAlert = function (item) {
        //console.log(item)
        medicalHistoryAlertsFactory.ChangeGenerateAlert(item);
        medicalHistoryAlertsFactory.ProcessQueue();
      };

      ctrl.setSectionTitle = function () {
        switch ($scope.alertTypeId) {
          case '1':
            $scope.sectionTitle = localize.getLocalizedString('Allergies');
            break;
          case '2':
            $scope.sectionTitle = localize.getLocalizedString('Medical');
            break;
          default:
            $scope.sectionTitle = localize.getLocalizedString('Other');
            break;
        }
        return $scope.sectionTitle;
      };

      //#region grid setup

      // if they choose to lose changes, reset
      ctrl.setGridForSection = function () {
        ctrl.gridDataSourceHasLoaded = false;
        $scope.gridDataSource = new kendo.data.DataSource({
          data: $scope.medicalAlerts,
          schema: {
            model: {
              fields: {
                Description: {
                  editable: false,
                },
                GenerateAlert: {
                  editable: true,
                },
                ItemSequenceNumber: {
                  editable: false,
                },
                MedicalHistoryAlertId: {
                  editable: false,
                },
                MedicalHistoryAlertTypeId: {
                  editable: false,
                },
                SectionSequenceNumber: {
                  editable: false,
                },
                UserModified: {
                  editable: false,
                },
                DateModified: {
                  editable: false,
                },
                DataTag: {
                  editable: false,
                },
              },
            },
          },
        });
      };

      // column definitions and templates
      //TODO the section header will have to go here
      $scope.gridColumns = [
        {
          field: 'Description',
          width: '60%',
          title: localize.getLocalizedString(ctrl.setSectionTitle()),
        },
        {
          title: '',
          width: '40%',
          template: kendo.template(
            '<div class="medicalHistoryAlerts__slider" >' +
              '<i class="fa fa-2x fa-toggle-on inactive" title="Premedication alerts cannot be disabled" disabled ng-if="dataItem.MedicalHistoryAlertTypeId === 3" check-auth-z="soar-biz-medalt-update"></i>' +
              '<i class="fa fa-2x fa-toggle-on active" ng-if="dataItem.GenerateAlert === true && dataItem.MedicalHistoryAlertTypeId !== 3" check-auth-z="soar-biz-medalt-update" ng-click="setGenerateAlert(dataItem);"></i>' +
              '<i class="fa fa-2x fa-toggle-on fa-rotate-180 inactive" ng-if="dataItem.GenerateAlert === false && dataItem.MedicalHistoryAlertTypeId !== 3" check-auth-z="soar-biz-medalt-update" ng-click="setGenerateAlert(dataItem);"></i>' +
              '</div>'
          ),
        },
      ];

      //#endregion

      // update local list when it changes
      $scope.updateMedicalHistoryAlerts = function (
        updatedMedicalHistoryAlert
      ) {
        var index = listHelper.findIndexByFieldValue(
          $scope.medicalAlerts,
          'MedicalHistoryAlertId',
          updatedMedicalHistoryAlert.MedicalHistoryAlertId
        );
        // replace in list
        if (index > -1) {
          $scope.medicalAlerts.splice(index, 1, updatedMedicalHistoryAlert);
        }
        // updadte the datasource
        $scope.gridDataSource.data($scope.medicalAlerts);
      };

      // subscribe to notes list changes
      medicalHistoryAlertsFactory.observeMedicalHistoryAlerts(
        $scope.updateMedicalHistoryAlerts
      );

      ctrl.$onInit();
    },
  ]);

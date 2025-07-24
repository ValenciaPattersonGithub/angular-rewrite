'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientAdditionalIdentiferController', [
    '$scope',
    '$routeParams',
    'toastrFactory',
    'localize',
    'StaticData',
    'PatientServices',
    'PatientAdditionalIdentifierService',
    function (
      $scope,
      $routeParams,
      toastrFactory,
      localize,
      staticData,
      patientServices,
      patientAdditionalIdentifierService
    ) {
      $scope.patientIdentifiers = [];

      $scope.getPatientIdentifiers = function () {
        patientServices.PatientAdditionalIdentifiers.get(
          { Id: $routeParams.patientId },
          $scope.patientIdentifiersGetSuccess,
          $scope.patientIdentifiersGetFailure
        );
      };

      // re-populate identifer additional values if edit is discarded
      $scope.$watch('editing', function (nv, ov) {
        if (nv === false && ov === true) {
          $scope.getPatientIdentifiers();
        }
      });

      $scope.patientIdentifiersGetSuccess = function (res) {
        $scope.loading = false;
        if (res.Value != null) {
          // res.Value = $.extend(res.Value, { Id: $routeParams.patientId, PatientId: $routeParams.patientId });
          $scope.patientIdentifiers = res.Value;
        }

        var result = [];

        for (var i = 0; i < res.Value.length; i++) {
          var SpecifiedListValuesDropdown = [];
          if (res.Value[i].SpecifiedListValues.length > 0) {
            angular.forEach(
              res.Value[i].SpecifiedListValues,
              function (item, index) {
                var SpecifiedListValuesDropdownObj = {};
                SpecifiedListValuesDropdownObj.Text = item;
                SpecifiedListValuesDropdownObj.Value = index + 1;
                SpecifiedListValuesDropdown.push(
                  SpecifiedListValuesDropdownObj
                );
              }
            );
          }

          result.push({
            PatientId: $routeParams.patientId,
            Description: res.Value[i].Description,
            PatientIdentifierId: res.Value[i].PatientIdentifierId,
            MasterPatientIdentifierId: res.Value[i].MasterPatientIdentifierId,
            Value: res.Value[i].Value,
            IsSpecifiedList: res.Value[i].IsSpecifiedList,
            SpecifiedListValuesDropdown: SpecifiedListValuesDropdown,
          });
        }
        //Hide panels if no AI available
        if (result.length > 0) $('.additionaIdentifierSection').show();
        else $('.additionaIdentifierSection').hide();

        angular.forEach(result, function (item) {
          if (item.IsSpecifiedList) {
            angular.forEach(
              item.SpecifiedListValuesDropdown,
              function (innerItem) {
                if (item.Value == innerItem.Text) {
                  item.Value = innerItem.Value;
                  item.SpecifiedListValue = innerItem.Text;
                }
              }
            );
          }
        });

        $scope.additionalIdentifiers = result;
      };

      $scope.patientIdentifiersGetFailure = function () {
        $scope.loading = false;
        $scope.patientIdentifiers = [];
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of additional identifiers. Refresh the page to try again.'
          ),
          localize.getLocalizedString('Error')
        );
      };

      $scope.saveFunction = function () {
        var dtoChanges = [];
        for (var i = 0; i < $scope.additionalIdentifiers.length; i++) {
          if (
            $scope.additionalIdentifiers[i].Value !=
            $scope.patientIdentifiers[i].Value
          ) {
            dtoChanges.push($scope.additionalIdentifiers[i]);
          }
        }

        angular.forEach(dtoChanges, function (item) {
          if (item.IsSpecifiedList) {
            angular.forEach(
              item.SpecifiedListValuesDropdown,
              function (innerItem) {
                if (item.Value == innerItem.Value) {
                  item.Value = innerItem.Text;
                }
              }
            );
          }
        });

        patientServices.PatientAdditionalIdentifiers.update(
          { Id: $routeParams.patientId },
          dtoChanges,
          $scope.onSaveSuccess,
          $scope.onSaveError
        );
        $scope.valid = true;
      };
      $scope.getPatientIdentifiers();

      $scope.onSaveSuccess = function (res) {
        toastrFactory.success(
          'Additional Identifiers has been saved.',
          'Success'
        );
        $scope.$parent.data.originalData = angular.copy(
          $scope.additionalIdentifiers
        );
        $scope.patientIdentifiers = angular.copy($scope.additionalIdentifiers);
        $scope.editing = false;
        $scope.getPatientIdentifiers();
      };

      $scope.onSaveError = function (error) {
        toastrFactory.error(
          'Failed to save the additional identifiers information. Refresh the page to try again.',
          'Server Error'
        );
      };

      //#endregion

      $scope.valid = true;
    },
  ]);

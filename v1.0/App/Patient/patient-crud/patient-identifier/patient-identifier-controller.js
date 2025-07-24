'use strict';

angular.module('Soar.Patient').controller('PatientIdentifierController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$location',
  'localize',
  '$timeout',
  'toastrFactory',
  'PatientServices',
  'PatientAdditionalIdentifierService',
  function (
    $scope,
    $routeParams,
    $filter,
    $location,
    localize,
    $timeout,
    toastrFactory,
    patientServices,
    patientAdditionalIdentifierService
  ) {
    $scope.additionalIdenfiers = [];
    $scope.getAdditionalIdentifier = function () {
      patientAdditionalIdentifierService.get(
        $scope.patientIdentifierGetIdenfierSuccess,
        $scope.patientIdentifierGetIdenfierFailure
      );
    };

    $scope.patientIdentifierGetIdenfierSuccess = function (res) {
      // Success
      $scope.referral = res.Value;

      var result = [];

      for (var i = 0; i < res.Value.length; i++) {
        var SpecifiedListValuesDropdown = [];
        if (res.Value[i].IsSpecifiedList) {
          if (res.Value[i].ListValues.length > 0) {
            angular.forEach(res.Value[i].ListValues, function (item, index) {
              var SpecifiedListValuesDropdownObj = {};
              SpecifiedListValuesDropdownObj.Text = item.Value;
              SpecifiedListValuesDropdownObj.Value = item.Value;
              SpecifiedListValuesDropdown.push(SpecifiedListValuesDropdownObj);
            });
          }
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

      $scope.referral = result;

      angular.forEach($scope.referral, function (value, key) {
        //identifier.Description = value.Description;
        //identifier.MasterPatientIdentifierId = value.MasterPatientIdentifierId;

        $scope.additionalIdenfiers.push({
          Value: '',
          MasterPatientIdentifierId: value.MasterPatientIdentifierId,
          Description: value.Description,
          PatientIdentifierId: 1,
          SpecifiedListValuesDropdown: value.SpecifiedListValuesDropdown,
          IsSpecifiedList: value.IsSpecifiedList,
        });
      });
      if ($scope.additionalIdenfiers.length > 0)
        $('.additionalIdentifierSection').show();
      else $('.additionalIdentifierSection').hide();
    };

    $scope.patientIdentifierGetIdenfierFailure = function () {
      // Error
      toastrFactory.error(
        localize.getLocalizedString('Patient {0}', ['identifier']) +
          ' ' +
          localize.getLocalizedString('failed to load.'),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.getAdditionalIdentifier();
    $scope.person.patientIdentifierDtos = $scope.additionalIdenfiers;
    $scope.formIsValid = true;
  },
]);

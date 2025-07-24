'use strict';

angular.module('Soar.Patient').controller('PatientDiscountsController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$location',
  'localize',
  'toastrFactory',
  'ListHelper',
  'DiscountTypesService',
  function (
    $scope,
    $routeParams,
    $filter,
    $location,
    localize,
    toastrFactory,
    listHelper,
    discountTypesService
  ) {
    $scope.LoadDiscountTypes = function () {
      discountTypesService.get().then(
        function (res) {
          $scope.LoadDiscountTypesSuccess(res);
        },
        function () {
          $scope.LoadDiscountTypesFail();
        }
      );
    };

    $scope.LoadDiscountTypesSuccess = function (result) {
      if (result) {
        $scope.discountTypes = result.Value;
      }

      $scope.SelectPatientDiscount($scope.patientDiscount);
    };

    $scope.LoadDiscountTypesFail = function (error) {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of discount types. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };

    $scope.SelectPatientDiscount = function (newDiscount, oldDiscount) {
      if (newDiscount) {
        $scope.selectedDiscountType = listHelper.findItemByFieldValue(
          $scope.discountTypes,
          'MasterDiscountTypeId',
          newDiscount.MasterDiscountTypeId
        );
      }
    };

    $scope.$watch('patientDiscount', $scope.SelectPatientDiscount, true);

    $scope.LoadDiscountTypes();

    $scope.editMode = $routeParams.patientId ? true : false;

    $scope.discountTypes = [];
  },
]);

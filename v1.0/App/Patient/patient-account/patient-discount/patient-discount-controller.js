'use strict';
angular.module('Soar.Patient').controller('PatientDiscountController', [
  '$scope',
  '$routeParams',
  'toastrFactory',
  'localize',
  'DiscountTypesService',
  'PatientServices',
  'ListHelper',
  'ModalFactory',
  '$filter',
  '$timeout',
  function (
    $scope,
    $routeParams,
    toastrFactory,
    localize,
    discountTypesService,
    patientServices,
    listHelper,
    modalFactory,
    $filter,
    $timeout
  ) {
    $scope.currentPatientId = $scope.currentPatientId
      ? $scope.currentPatientId
      : $routeParams.patientId;
    $scope.discountTypes = [];
    $scope.valid = false;
    $scope.currentDiscountName = 'No Discount Selected';
    $scope.currentDiscountId = '';

    // Build instance of existing discount
    $scope.buildInstance = function () {
      $scope.backupPatientDiscount = JSON.stringify($scope.patientDiscount);
      $scope.currentDiscountId = $scope.patientDiscount.MasterDiscountTypeId;
      $scope.valid = false;
    };

    // Revert patient if changes are not saved.
    $scope.cancelChanges = function () {
      $scope.patientDiscount = JSON.parse($scope.backupPatientDiscount);
      $scope.hasErrors = false;
      $scope.valid = false;
    };

    //#region  patient discount
    $scope.hasExistingDiscount = false;

    // get existing patient discount
    $scope.getExistingDiscount = function () {
      patientServices.Discounts.getDiscount(
        { PatientId: $scope.currentPatientId },
        $scope.getExistingDiscountSuccess,
        $scope.getExistingDiscountFail
      );
    };

    $scope.getExistingDiscountSuccess = function (res) {
      $scope.patientDiscount = undefined;
      $timeout(function () {
        $scope.patientDiscount = res.Value;

        if ($scope.patientDiscount == null) {
          $scope.patientDiscount = {
            PatientId: $scope.currentPatientId,
            MasterDiscountTypeId: '',
          };
          $scope.hasExistingDiscount = false;
          if (angular.isUndefined($scope.removePatientDCListener)) {
            $timeout(function () {
              $scope.setPatientDCListener();
            }, 100);
          }
        } else {
          $scope.hasExistingDiscount = true;
          var tmpDCTypes = $scope.discountTypes;
          var masterDCId = $scope.patientDiscount.MasterDiscountTypeId;
          $scope.buildInstance();
          //$scope.discountTypes = null;

          $timeout(function () {
            $scope.discountTypes = tmpDCTypes;
            if (angular.isUndefined($scope.removePatientDCListener)) {
              $timeout(function () {
                $scope.patientDiscount.MasterDiscountTypeId = masterDCId;
                $scope.buildInstance();
                $scope.setDiscountName($scope.patientDiscount, {});
                $scope.validatePanel($scope.patientDiscount, {});
                $scope.setPatientDCListener();
              }, 100);
            }
          }, 100);
        }
      }, 100);
    };
    $scope.getExistingDiscountFail = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          "There was an error while attempting to retrieve this patient's current discount."
        ),
        localize.getLocalizedString('Error')
      );
    };

    // save patient discount
    $scope.saveFunction = function (discount, onSuccess, onError) {
      // if has existing discount and new discount
      if ($scope.hasExistingDiscount) {
        if (
          discount.MasterDiscountTypeId != null &&
          discount.MasterDiscountTypeId != ''
        ) {
          $scope.updatePatientDiscount(discount, onSuccess, onError);
        } else {
          $scope.removePatientDiscount(discount, onSuccess, onError);
        }
      }
      // if has does not have existing discount and has new discount, add discount
      else if (discount.MasterDiscountTypeId != null) {
        $scope.createPatientDiscount(discount, onSuccess, onError);
      }
    };

    $scope.removePatientDiscount = function (discount, onSuccess, onError) {
      $scope.onSaveSuccess = $scope.removePatientDiscountSuccess;

      patientServices.Discounts.removeDiscount(
        {
          PatientId: $scope.currentPatientId,
          PatientDiscountTypeId: discount.PatientDiscountTypeId,
        },
        onSuccess,
        onError
      );
    };

    $scope.createPatientDiscount = function (discount, onSuccess, onError) {
      $scope.onSaveSuccess = $scope.savePatientDiscountSuccess;
      patientServices.Discounts.addDiscount(
        { PatientId: $scope.currentPatientId },
        discount,
        onSuccess,
        onError
      );
    };

    $scope.updatePatientDiscount = function (discount, onSuccess, onError) {
      $scope.onSaveSuccess = $scope.savePatientDiscountSuccess;
      patientServices.Discounts.updateDiscount(
        { PatientId: $scope.currentPatientId },
        discount,
        onSuccess,
        onError
      );
    };

    $scope.removePatientDiscountSuccess = function (result) {
      toastrFactory.success(
        'Patient discount type has been removed.',
        'Success'
      );

      $scope.patientDiscount = {
        PatientId: $scope.currentPatientId,
        MasterDiscountTypeId: null,
      };
      $scope.buildInstance($scope.patientDiscount);
      $scope.hasExistingDiscount = false;
    };

    $scope.savePatientDiscountSuccess = function (result) {
      toastrFactory.success('Patient discount type has been saved.', 'Success');
      $scope.buildInstance($scope.patientDiscount);
      $scope.hasExistingDiscount = true;
    };

    $scope.onSaveError = function (error) {
      toastrFactory.error(
        "Failed to save the patient's discount type.",
        'Error'
      );
    };

    //#endregion

    //#region validate required and any attributes
    $scope.validatePanel = function (nv, ov) {
      if (nv && ov !== nv) {
        $scope.patientDiscount.PatientId = $scope.currentPatientId;
        if (
          nv.MasterDiscountTypeId != '' ||
          (nv.MasterDiscountTypeId == '' && $scope.currentDiscountId != null)
        ) {
          $scope.valid = !(nv.MasterDiscountTypeId == $scope.currentDiscountId);
        } else {
          $scope.valid = false;
        }
      } else {
        $scope.valid = false;
      }
    };

    $scope.setDiscountName = function (nv, ov) {
      if (nv && ov !== nv) {
        var discount = listHelper.findItemByFieldValue(
          $scope.discountTypes,
          'MasterDiscountTypeId',
          $scope.patientDiscount.MasterDiscountTypeId
        );
        if (discount != null) {
          $scope.currentDiscountName = discount.DiscountName;
        } else {
          $scope.currentDiscountName = 'No Discount Selected';
        }
      }
    };

    $scope.setPatientDCListener = function () {
      // Validate the name and DOB
      $scope.removePatientDCListener = $scope.$watch(
        'patientDiscount',
        function (nv, ov) {
          $scope.setDiscountName(nv, ov);
          $scope.validatePanel(nv, ov);
        },
        true
      );
    };

    //#region get discount list
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
    $scope.LoadDiscountTypesSuccess = function (res) {
      $scope.discountTypes = $filter('filter')(res.Value, { IsActive: true });

      if ($scope.currentPatientId) {
        $scope.getExistingDiscount($scope.currentPatientId);
      } else {
        $scope.discountTypes.unshift({
          DiscountName: 'No Discount Selected',
          MasterDiscountTypeId: '',
        });
        $scope.setPatientDCListener();
      }
    };
    $scope.LoadDiscountTypesFail = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of discount types. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };

    var ctrl = this;

    ctrl.modalWasClosed = function () {
      $scope.modalIsOpen = false;

      // refreshing the list after the modal is closed
      $scope.listIsLoading = true;
      $scope.discountTypes = [];
      $scope.LoadDiscountTypes();
    };

    $scope.modalIsOpen = false;

    $scope.openMasterDiscountModal = function () {
      $scope.modalIsOpen = true;

      var template =
        'App/BusinessCenter/settings/discount-types/discount-types/discount-types.html';
      var title = localize.getLocalizedString('Discount Types');
      var amfaValue = 'soar-biz-bizdsc-view';

      var modalInstance = modalFactory.Modal({
        templateUrl: 'App/BusinessCenter/practice-setup/lists-modal.html',
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        windowClass: 'center-modal',
        controller: 'ListsModalController',
        amfa: amfaValue,
        resolve: {
          title: function () {
            return title;
          },
          template: function () {
            return template;
          },
        },
      });
      modalInstance.result.then(function () {}, ctrl.modalWasClosed);
    };

    $scope.LoadDiscountTypes();

    $scope.setDiscountName();
  },
]);

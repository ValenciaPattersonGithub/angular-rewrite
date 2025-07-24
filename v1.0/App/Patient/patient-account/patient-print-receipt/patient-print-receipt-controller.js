'use strict';
angular.module('Soar.Patient').controller('PatientPrintReceiptController', [
  '$scope',
  '$routeParams',
  '$timeout',
  'PatientServices',
  'FinancialService',
  '$q',
  'toastrFactory',
  'localize',
  '$uibModal',
  function (
    $scope,
    $routeParams,
    $timeout,
    patientServices,
    financialService,
    $q,
    toastrFactory,
    localize,
    $uibModal
  ) {
    var ctrl = this;
    ctrl.accountInfo = null;
    $scope.loading = true;

    // any necessary data should be in the resolve for this controller, this page should be refactored to support loading from api rather than storage
    // opening modal on page load
    ctrl.modalTimeout = $timeout(function () {
      ctrl.modal = $uibModal.open({
        template:
          '<div>' +
          '  <i class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
          '</div>',
        size: 'sm',
        windowClass: 'modal-loading',
        backdrop: 'static',
        keyboard: false,
      });
    }, 0);

    // closing modal when we have all the necessary data
    $scope.$watch(
      'loading',
      function () {
        if ($scope.loading === false) {
          ctrl.modalTimeout.then(function () {
            $timeout(function () {
              ctrl.modal.dismiss();
              ctrl.modalTimeout = null;
            });
          });
        }
      },
      true
    );

    ctrl.getResponsiblePerson = function () {
      var responsiblePersonId =
        ctrl.accountMembersDetailByAccount[0].ResponsiblePersonId;
      patientServices.Patients.get({ Id: responsiblePersonId }).$promise.then(
        res => {
          $scope.receiptDto.ResponsiblePerson = res.Value;
          $scope.loading = false;
        },
        err => {
          toastrFactory.error(
            localize.getLocalizedString('Failed to retrieve the {0}.', [
              'Responsible Person',
            ]),
            'Error'
          );
          $scope.loading = false;
        }
      );
    };

    // all things that need to happen on init
    ctrl.$onInit = function () {
      $scope.currentBalance = 0;
      var defer = $q.defer();
      var promise = defer.promise;
      ctrl.localStorageIdentifier =
        'acctPaymentReceipt_' + $routeParams.creditTransactionId;
      // getting the invoice from local storage and them removing it
      ctrl.accountInfo = JSON.parse(
        localStorage.getItem(ctrl.localStorageIdentifier)
      );
      localStorage.removeItem(ctrl.localStorageIdentifier);
      patientServices.Account.getAccountMembersDetailByAccountId({
        accountId: ctrl.accountInfo.AccountId,
      }).$promise.then(function (res) {
        if (res && res.Value) {
          ctrl.accountMembersDetailByAccount = res.Value;
          var balances = financialService.calculateAccountAndInsuranceBalances(
            res.Value,
            ctrl.accountInfo.AccountId
          );
          $scope.receiptDto = ctrl.accountInfo;
          $scope.receiptDto.ResponsiblePerson = null;
          $scope.receiptDto.DateModified = new Date();
          $scope.receiptDto.TotalBalance = balances.TotalBalance;
          $scope.receiptDto.TotalInsurance = balances.TotalInsurance;
          $scope.receiptDto.TotalAdjustedEstimate =
            balances.TotalAdjustedEstimate;
          $scope.receiptDto.TotalPatientPortion = balances.TotalPatientPortion;
          ctrl.getResponsiblePerson();
          // cleaning up the page for print/display
          angular.element('body').attr('style', 'padding-top:0;');
          angular
            .element('.view-container')
            .attr('style', 'background-color:#fff');
          angular.element('.top-header').remove();
          angular.element('.feedback-container').remove();
          $timeout(function () {
            angular.element('#walkme-player').remove();
          }, 2000);
          defer.resolve(res.Value);
        }
      });
      return promise;
    };

    $scope.makePositive = function (num) {
      var abs = Math.abs(num);
      return abs;
    };

    // calling init because it won't do it automatically here
    ctrl.$onInit();
  },
]);

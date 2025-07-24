'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('PatientCloseClaimController', [
  '$scope',
  '$uibModalInstance',
  '$filter',
  'item',
  'localize',
  'CloseClaimService',
  'toastrFactory',
  function (
    $scope,
    mInstance,
    $filter,
    item,
    localize,
    closeClaimService,
    toastrFactory
  ) {
    var ctrl = this;
    $scope.item = item;

    $scope.collectClosing = function () {
      var closingClaims = [];
      angular.forEach($scope.item.Claims, function (claim) {
        if (claim.Close) {
          closingClaims.push({
            ClaimId: claim.ClaimId,
            RecreateClaim: false,
            IsPaid: false,
          });
        }
      });
      closeClaimService.updateMultiple(
        closingClaims,
        $scope.confirm,
        ctrl.closeClaimsFailure
      );
    };

    ctrl.closeClaimsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to closed claims.'),
        localize.getLocalizedString('Failure')
      );
    };

    $scope.confirm = function () {
      mInstance.close($scope.item.Data);
    };

    $scope.close = function () {
      mInstance.dismiss();
    };

    ctrl.init = function () {
      angular.forEach($scope.item.Claims, function (claim) {
        if (claim.Type !== 1) {
          claim.ClaimDate = '';
        } else if (claim.MinServiceDate === claim.MaxServiceDate) {
          claim.ClaimDate = $filter('toShortDisplayDateUtc')(
            claim.MinServiceDate
          );
        } else {
          claim.ClaimDate =
            $filter('toShortDisplayDateUtc')(claim.MinServiceDate) +
            ' -- ' +
            $filter('toShortDisplayDateUtc')(claim.MaxServiceDate);
        }
        claim.Codes = claim.CdtCodes.join(', ');
        claim.Close = claim.Status !== 4 && claim.Status !== 9 ? true : false;
        claim.PatientName =
          claim.PatientFirstName + ' ' + claim.PatientLastName;
      });
    };

    ctrl.init();
  },
]);

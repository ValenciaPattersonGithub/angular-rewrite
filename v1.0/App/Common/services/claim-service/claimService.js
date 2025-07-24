'use strict';

var app = angular.module('Soar.Common');

app.service('ClaimService', [
  'CommonServices',
  'SaveStates',
  'toastrFactory',
  function (commonServices, saveStates, toastrFactory) {
    var claimService = {};

    // #region Creating a Claim

    claimService.CreateClaim = function (params) {
      return commonServices.Insurance.Claim.save(
        params,
        saveClaimSuccess,
        createClaimFailed
      ).$promise;
    };

    var saveClaimSuccess = function (result) {
      toastrFactory.success(
        { Message: '{0} saved successfully.', Params: 'Claim' },
        'Success'
      );

      return result;
    };

    var createClaimFailed = function (error) {
      toastrFactory.error(
        { Message: 'Failed to create {0}.', Params: 'Claim' },
        'Error'
      );
    };

    // #endregion

    // #region Updating Claim

    claimService.UpdateClaim = function (params) {
      return commonServices.Insurance.Claim.update(
        params,
        saveClaimSuccess,
        UpdateClaimFailed
      ).$promise;
    };

    var UpdateClaimFailed = function (error) {
      toastrFactory.error(
        { Message: 'Failed to update {0}.', Params: 'Claim' },
        'Error'
      );
    };

    // #endregion

    return claimService;
  },
]);

'use strict';
angular
  .module('common.controllers')
  .controller('CloseClaimCancelModalController', [
    '$scope',
    '$uibModalInstance',
    'availablePlansRes',
    'PatientServices',
    '$filter',
    '$q',
    'toastrFactory',
    'localize',
    function (
      modalScope,
      mInstance,
      availablePlansRes,
      patientServices,
      $filter,
      $q,
      toastrFactory,
      localize
    ) {
      var ctrl = this;
      modalScope.plans = [];
      modalScope.encounterIds = [];
      modalScope.selectedPlanId = '';
      modalScope.creatingClaims = false;
      modalScope.searchTerm = '';

      modalScope.confirmDiscard = function () {
        ctrl.createClaims();
      };

      modalScope.cancelDiscard = function () {
        mInstance.dismiss();
      };

      modalScope.selectPlan = function (plan) {
        if (plan != null) {
          modalScope.selectedPlanId = plan.PatientBenefitPlanId;
          modalScope.searchTerm = plan.Name;
        }
      };

      modalScope.clearContent = function () {
        modalScope.selectedPlanId = '';
        modalScope.searchTerm = '';
      };

      ctrl.initialize = function () {
        modalScope.plans = angular.copy(
          $filter('orderBy')(
            availablePlansRes.Value.PatientBenefitPlans,
            'Priority',
            false
          )
        );
        modalScope.encounterIds = availablePlansRes.Value.EncounterGuids;
        modalScope.previousClaimId = availablePlansRes.Value.ClaimId;
        var missingPlanIndicator = 0;
        angular.forEach(modalScope.plans, function (plan) {
          var priorityIdentifier = '';

          switch (plan.Priority) {
            case 0:
              priorityIdentifier = 'Primary';
              break;
            case 1:
              priorityIdentifier = 'Secondary';
              break;
            case 2:
              priorityIdentifier = '3rd';
              break;
            case 3:
              priorityIdentifier = '4th';
              break;
            case 4:
              priorityIdentifier = '5th';
              break;
            case 5:
              priorityIdentifier = '6th';
              break;
            default:
              priorityIdentifier = 'unknown';
              break;
          }
          plan.Name =
            plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name +
            ' (' +
            priorityIdentifier +
            ')';

          //set default plan, should be next in priority unless the claim just closed was the last in priority
          if (
            plan.Priority !== missingPlanIndicator &&
            modalScope.selectedPlanId === ''
          ) {
            modalScope.selectedPlanId = plan.PatientBenefitPlanId;
            modalScope.searchTerm = plan.Name;
          }
          missingPlanIndicator++;
        });
        if (modalScope.previousClaimId) {
          modalScope.gettingServiceTransactions = true;
          patientServices.Claim.getServiceTransactionsByClaimId(
            { claimId: modalScope.previousClaimId, includeServiceData: true },
            function (res) {
              modalScope.ServiceTransactionList = _.map(
                res.Value,
                function (serviceTransactionToClaim) {
                  return serviceTransactionToClaim.ServiceTransaction;
                }
              );
              modalScope.gettingServiceTransactions = false;
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString('An error has occurred while {0}', [
                  'getting claims',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
      };

      ctrl.createdClaimsFailed = function (returnObj) {
        modalScope.creatingClaims = false;
        modalScope.doingCheckout = false;
        mInstance.close(returnObj);
      };

      ctrl.createClaimsSucceeded = function (returnObj) {
        var selectedPlan = _.find(modalScope.plans, function (plan) {
          return plan.PatientBenefitPlanId === modalScope.selectedPlanId;
        });
        returnObj.selectedPlan = selectedPlan;

        modalScope.creatingClaims = false;
        modalScope.doingCheckout = false;
        mInstance.close(returnObj);
      };

      ctrl.createClaims = function () {
        var promises = [];
        var claims = [];
        modalScope.creatingClaims = true;
        if (modalScope.ServiceTransactionList) {
          var params = {
            patientBenefitPlanId: modalScope.selectedPlanId,
            calculateEstimatatedInsurance: true,
          };
          promises.push(
            patientServices.Claim.CreateClaimFromServiceTransactions(
              params,
              modalScope.ServiceTransactionList
            ).$promise.then(
              function (result) {
                claims = _.union(claims, result.Value);
                toastrFactory.success(
                  { Text: '{0} created successfully.', Params: ['Claims'] },
                  'Success'
                );
              },
              function (error) {
                claims = _.union(claims, error.Value);
                toastrFactory.error(
                  { Text: 'Failed to create {0}.', Params: ['Claims'] },
                  'Error'
                );
              }
            )
          );
        } else {
          angular.forEach(modalScope.encounterIds, function (encounter) {
            promises.push(
              patientServices.Claim.Create(
                {
                  encounterId: encounter,
                  patientBenefitPlanId: modalScope.selectedPlanId,
                  calculateEstimatatedInsurance: true,
                },
                {}
              ).$promise.then(
                function (result) {
                  claims = _.union(claims, result.Value);
                  toastrFactory.success(
                    { Text: '{0} created successfully.', Params: ['Claims'] },
                    'Success'
                  );
                },
                function (error) {
                  claims = _.union(claims, error.Value);
                  toastrFactory.error(
                    { Text: 'Failed to create {0}.', Params: ['Claims'] },
                    'Error'
                  );
                }
              )
            );
          });
        }
        $q.all(promises).then(
          function () {
            var returnObj = {
              pbpIds: [modalScope.selectedPlanId],
              claims: claims,
            };
            ctrl.createClaimsSucceeded(returnObj);
          },
          function () {
            var returnObj = {
              pbpIds: [modalScope.selectedPlanId],
              claims: claims,
            };
            ctrl.createdClaimsFailed(returnObj);
          }
        );
      };

      ctrl.initialize();
    },
  ]);

'use strict';
angular
  .module('common.controllers')
  .controller('ServiceFeeRollbackOptionsController', [
    '$scope',
    '$rootScope',
    '$filter',
    'ListHelper',
    'localize',
    '$timeout',
    'ModalFactory',
    'patSecurityService',
    'referenceDataService',
    function (
      $scope,
      $rootScope,
      $filter,
      listHelper,
      localize,
      $timeout,
      modalFactory,
      patSecurityService,
      referenceDataService
    ) {
      var ctrl = this;
      $scope.showMessage = false;
      $scope.servicesToRollback = 0;

      ctrl.checkOriginalFees = function () {
        if ($scope.services && $scope.services.length > 0) {
          $scope.servicesWithModifiedFees = $filter('filter')(
            $scope.services,
            function (item) {
              return item.PriorFee !== null;
            }
          );
          $scope.servicesToRollback = $scope.servicesWithModifiedFees.length;
          $scope.showMessage = $scope.servicesWithModifiedFees.length > 0;
        }
      };

      $scope.rollbackOption = function () {
        var rollbackServices = angular.copy($scope.servicesWithModifiedFees);
        var modalInstance = modalFactory.Modal({
          windowTemplateUrl: 'uib/template/modal/window.html',
          templateUrl:
            'App/Common/components/service-fee-rollback/service-fee-rollback.html',
          controller: 'ServiceFeeRollbackController',
          amfa: $scope.addPlannedServiceAuthAbbrev,
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          resolve: {
            servicesToRollback: function () {
              return rollbackServices;
            },
            serviceCodes: function () {
              return $scope.serviceCodes;
            },
          },
        });
        modalInstance.result.then(ctrl.mergeAfterRollback);
      };

      // merge returned services to appointment plannedServices
      ctrl.mergeAfterRollback = function (serviceWithFeesRolledBack) {
        _.forEach(serviceWithFeesRolledBack, function (service) {
          var index = listHelper.findIndexByFieldValue(
            $scope.services,
            'ServiceTransactionId',
            service.ServiceTransactionId
          );
          if (index > -1) {
            // merge data back to original dataset to preserve computed columns
            $scope.services[index].AccountMemberId = service.AccountMemberId;
            $scope.services[index].AgingDate = service.AgingDate;
            $scope.services[index].Amount = service.Amount;
            $scope.services[index].AppointmentId = service.AppointmentId;
            $scope.services[index].Balance = service.Balance;
            $scope.services[index].CreatedDate = service.CreatedDate;
            $scope.services[index].DataTag = service.DataTag;
            $scope.services[index].DateCompleted = service.DateCompleted;
            $scope.services[index].DateEntered = service.DateEntered;
            $scope.services[index].DateModified = service.DateModified;
            //$scope.services[index].Description = service.Description;
            $scope.services[index].Discount = service.Discount;
            $scope.services[index].EncounterId = service.EncounterId;
            $scope.services[index].EnteredByUserId = service.EnteredByUserId;
            $scope.services[index].FailedMessage = service.FailedMessage;
            $scope.services[index].Fee = service.Fee;
            //$scope.services[index].InsuranceEstimates = service.InsuranceEstimates;
            $scope.services[index].IsBalanceAlreadyUpdated =
              service.IsBalanceAlreadyUpdated;
            $scope.services[index].IsDeleted = service.IsDeleted;
            $scope.services[index].IsDiscounted = service.IsDiscounted;
            $scope.services[index].IsForClosingClaim =
              service.IsForClosingClaim;
            $scope.services[index].LocationId = service.LocationId;
            $scope.services[index].Note = service.Note;
            $scope.services[index].PredeterminationHasResponse =
              service.PredeterminationHasResponse;
            $scope.services[index].PriorFee = service.PriorFee;
            $scope.services[index].ProviderOnClaimsId =
              service.ProviderOnClaimsId;
            $scope.services[index].ProviderUserId = service.ProviderUserId;
            $scope.services[index].RejectedReason = service.RejectedReason;
            $scope.services[index].RootSummaryInfo = service.RootSummaryInfo;
            $scope.services[index].Roots = service.Roots;
            $scope.services[index].ServiceCodeId = service.ServiceCodeId;
            $scope.services[index].ServiceTransactionStatusId =
              service.ServiceTransactionStatusId;
            $scope.services[index].Surface = service.Surface;
            $scope.services[index].SurfaceSummaryInfo =
              service.SurfaceSummaryInfo;
            $scope.services[index].Tax = service.Tax;
            $scope.services[index].Tooth = service.Tooth;
            $scope.services[index].TotalAdjEstimate = service.TotalAdjEstimate;
            $scope.services[index].TotalEstInsurance =
              service.TotalEstInsurance;
            $scope.services[index].TotalInsurancePaidAmount =
              service.TotalInsurancePaidAmount;
            $scope.services[index].TransactionTypeId =
              service.TransactionTypeId;
            $scope.services[index].UserModified = service.UserModified;
          }
        });

        // reset after update
        ctrl.checkOriginalFees();

        if ($scope.onRollback) {
          $scope.onRollback($scope.services);
        }
      };

      function onReferenceDataServiceLocationChanged() {
        $scope.serviceCodes = referenceDataService.get(
          referenceDataService.entityNames.serviceCodes
        );
      }

      ctrl.referenceDataServiceLocationChangedReference =
        referenceDataService.registerForLocationSpecificDataChanged(
          onReferenceDataServiceLocationChanged
        );

      // if parent doesn't pass service codes load them
      ctrl.loadServiceCodes = function () {
        var serviceCodes = referenceDataService.get(
          referenceDataService.entityNames.serviceCodes
        );
        if (serviceCodes) {
          $scope.serviceCodes = serviceCodes;
        }
      };

      // check fees each time services list changes
      $scope.$watch('services', function (nv, ov) {
        ctrl.checkOriginalFees();
      });

      $scope.$on('$destroy', function () {
        referenceDataService.unregisterForLocationSpecificDataChanged(
          ctrl.referenceDataServiceLocationChangedReference
        );
      });

      ctrl.init = function () {
        if (!$scope.serviceCodes) {
          ctrl.loadServiceCodes();
        }
      };
      ctrl.init();
    },
  ]);

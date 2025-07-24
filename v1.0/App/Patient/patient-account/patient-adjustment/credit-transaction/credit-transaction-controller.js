'use strict';
angular.module('Soar.Patient').controller('CreditTransactionController', [
  '$scope',
  '$filter',
  'toastrFactory',
  'ListHelper',
  'localize',
  'PatientServices',
  '$timeout',
  'SurfaceHelper',
  'RootHelper',
  'referenceDataService',
  'LocationServices',
  'FeatureFlagService',
  'FuseFlag',
  'TimeZoneFactory',
  'StaticData',
  function (
    $scope,
    $filter,
    toastrFactory,
    listHelper,
    localize,
    patientServices,
    $timeout,
    surfaceHelper,
    rootHelper,
    referenceDataService,
    locationServices,
    featureFlagService,
    fuseFlag,
    timeZoneFactory,
    staticData
  ) {
    var ctrl = this;

    $scope.PaymentProviders = staticData.PaymentProviders();
    staticData.CurrencyTypes().then((res) => ctrl.loadCurrencyTypes(res));

    ctrl.loadCurrencyTypes = function (res) {
      if (res && res.Value) {
        $scope.CurrencyTypes = _.reduce(
          res.Value, function(accu, ct) {
            const key = ct.Name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
            return { ...accu, [key]: ct.Id};
          }, {});
      }
      $scope.CurrencyTypes = $scope.CurrencyTypes || {};
    };

    ctrl.setWriteOffDetails = function () {
      $scope.writeOffDetails = [];

      _.forEach($scope.data.ServiceAndDebitTransactionDtos, function (service) {
        _.forEach($scope.data.UnappliedTransaction.CreditTransactionDetails, function (trans) {
          if (trans.EncounterId && !trans.IsDeleted && service.EncounterId === trans.EncounterId) {
            $scope.writeOffDetails.push(angular.copy(service));
          }
        });
      });
    };

    if ($scope.data.CreditTransactionDto &&
        $scope.data.CreditTransactionDto.IsFeeScheduleWriteOff &&
        $scope.data.IsView) {

        ctrl.setWriteOffDetails();
    }

    //Getting the list of locations then filtering for the currently logged in location
    referenceDataService
      .getData(referenceDataService.entityNames.locations)
      .then(function (locations) {
        var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        var ofcLocation = _.find(locations, { LocationId: cachedLocation.id });

        ctrl.checkFeatureFlag(ofcLocation);

        ctrl.now = moment();

        // get transactionMaxDate based on timezone
        var locationTimezone = ofcLocation ? ofcLocation.Timezone : '';
        ctrl.now = timeZoneFactory.ConvertDateToMomentTZ(
          ctrl.now,
          locationTimezone
        );

        $scope.transactionMaxDate = moment([
          ctrl.now.year(),
          ctrl.now.month(),
          ctrl.now.date(),
          0,
          0,
          0,
          0,
        ]);
      });

    $scope.cardReaders = [];
    $scope.selectedCardReader = null;
    $scope.showPaymentCardReaders = false;
    $scope.hidePrompt = true;
    $scope.defaultPlaceHolder = localize.getLocalizedString(
      'Leave as Unassigned'
    );

    // Collection of options associated with adjustment distribution strategy drop-down list
    $scope.assignmentTypes = [
      {
        AssignmentTypeId: 1,
        AssignmentTypeName: localize.getLocalizedString('Oldest Balance First'),
      },
      {
        AssignmentTypeId: 2,
        AssignmentTypeName: localize.getLocalizedString('Manually'),
      },
    ];

    // Set the affected area for each service transaction
    ctrl.setServiceArea = function () {
      _.forEach(
        $scope.data.ServiceAndDebitTransactionDtos,
        function (serviceCode) {
          var area = ctrl.setServiceSurfaceInfo(serviceCode);

          if (_.isEmpty(area) || area === '') {
            area = ctrl.setServiceRootInfo(serviceCode);
          }
          serviceCode.$$area = area;
        }
      );

      if ($scope.writeOffDetails && $scope.writeOffDetails.length > 0) {
        _.forEach($scope.writeOffDetails, function (serviceCode) {
          var area = ctrl.setServiceSurfaceInfo(serviceCode);
          if (_.isEmpty(area) || area === '') {
            area = ctrl.setServiceRootInfo(serviceCode);
          }
          serviceCode.$$area = area;
        });
      }
    };

    ctrl.setServiceSurfaceInfo = function (serviceCode) {
      if (!_.isUndefined(serviceCode)) {
        if (
          !_.isUndefined(serviceCode.SurfaceSummaryInfo) &&
          !_.isEmpty(serviceCode.SurfaceSummaryInfo)
        ) {
          return serviceCode.SurfaceSummaryInfo;
        } else if (
          !_.isUndefined(serviceCode.Surface) &&
          !_.isEmpty(serviceCode.Surface)
        ) {
          // Handle surface CSV

          if (serviceCode.Surface.indexOf(',') !== -1) {
            var surfaceString = surfaceHelper.surfaceCSVStringToSurfaceString(
              serviceCode.Surface
            );
            return surfaceString;
          } else {
            //No commas means we can take it at face value,
            //either because only one surface is selected or because Surface in this case represents the summary information
            //Currently the latter only happens on Account Summary, apply adjustment from encounter
            return serviceCode.Surface;
          }
        } else {
          return '';
        }
      }
    };

    ctrl.setServiceRootInfo = function (serviceCode) {
      if (!_.isUndefined(serviceCode)) {
        if (
          !_.isUndefined(serviceCode.RootSummaryInfo) &&
          !_.isEmpty(serviceCode.RootSummaryInfo)
        ) {
          return serviceCode.RootSummaryInfo;
        } else if (
          (!_.isUndefined(serviceCode.Roots) &&
            !_.isEmpty(serviceCode.Roots)) ||
          (!_.isUndefined(serviceCode.Root) && !_.isEmpty(serviceCode.Root))
        ) {
          // Handle root CSV
          return serviceCode.Roots
            ? serviceCode.Roots.replace(/,/g, '')
            : serviceCode.Root.replace(/,/g, '');
        } else {
          return '';
        }
      }
    };

    // Find if a data item from providers drop-down list is a preferred provider for a currently searched patient
    ctrl.isPreferred = function (dataItem) {
      return (
        $scope.data.PatientInfo &&
        (dataItem.ProviderId === $scope.data.PatientInfo.PreferredDentist ||
          dataItem.ProviderId === $scope.data.PatientInfo.PreferredHygienist)
      );
    };

    ctrl.filterProviders = function () {
      ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
      if ($scope.allProviders && ctrl.location) {
        $scope.filteredProviders = $filter('filter')($scope.allProviders, {
          Locations: { LocationId: ctrl.location.id },
        });
      }
    };

    ctrl.checkFeatureFlag = function (location) {
      featureFlagService.getOnce$(fuseFlag.UsePaymentService).subscribe((value) => {
        ctrl.showPaymentProvider = value;
        $scope.data.showPaymentProvider= value;
        ctrl.loadPaymentDevices(location);
      });
    };

    ctrl.preselectCardReaders = function() {
      // If only one card reader is available, select it by default
      if ($scope.showPaymentCardReaders && $scope.cardReaders.length === 1) {
        $scope.selectedCardReader = $scope.cardReaders[0].PartnerDeviceId;
        $scope.data.selectedCardReader = $scope.cardReaders[0].PartnerDeviceId;
      }
    };

    // Load payment devices when location payment gateway is enabled && payment provider is TransactionsUI
    ctrl.loadPaymentDevices = function (location) {
      // When feature flag is off
      if (!ctrl.showPaymentProvider) 
        return;

      if (location && location.LocationId && location.IsPaymentGatewayEnabled && location.PaymentProvider === $scope.PaymentProviders.TransactionsUI) {
        locationServices.getPaymentDevicesByLocationAsync({ locationId: location.LocationId })
          .$promise.then((result) => {
            $scope.cardReaders = result.Value;
            $scope.data.cardReaders = $scope.cardReaders;
          },
          (err) => {
            console.log(err.data);
          });
      }
      else {
        // Turn off payment provider if location is not configured for TransactionsUI
        ctrl.showPaymentProvider = false;
      }
    };

    // filter and sort paymentTypes
    ctrl.loadPaymentTypes = function (paymentTypes) {
      if (paymentTypes) {
        let accountPaymentTypes = paymentTypes.filter(function (paymentType) {
          return (
            paymentType.PaymentTypeCategory === 1 &&
            paymentType.Description.toLowerCase().indexOf('vendor payment') ===
              -1
          );
        });
        accountPaymentTypes.sort((a, b) =>
          a.Description < b.Description ? -1 : 1
        );
        return accountPaymentTypes;
      }
      return [];
    };

    if ($scope.data) {
      ctrl.setServiceArea();
      //take backup of original service and debit transaction list
      ctrl.initialServiceAndDebitTransactionDtos = angular.copy(
        $scope.data.ServiceAndDebitTransactionDtos
      );
      ctrl.reloadServiceAndDebitTransactionDtos = angular.copy(
        $scope.data.ServiceAndDebitTransactionDtos
      );
      ctrl.originalServiceTransactionDtos = angular.copy(
        $scope.data.ServiceAndDebitTransactionDtos
      );
      // field to trace change in amount for edit flow from checkout screen.
      ctrl.initialAmount = $scope.data.CreditTransactionDto
        ? angular.copy($scope.data.CreditTransactionDto.Amount)
        : 0;

      // negative adjustment types
      $scope.filteredAdjustmentTypes = $scope.data.AdjustmentTypes
        ? $scope.data.AdjustmentTypes.filter(function (adjustmentType) {
            return adjustmentType.IsPositive === false;
          })
        : [];

      var defaultType;
      if ($scope.data.BenefitPlan && $scope.data.BenefitPlan.AdjustmentTypeId) {
        defaultType = _.find($scope.filteredAdjustmentTypes, function (type) {
          return (
            type.AdjustmentTypeId === $scope.data.BenefitPlan.AdjustmentTypeId
          );
        });
        if (defaultType) {
          $timeout(function () {
            $timeout(function () {
              $scope.data.CreditTransactionDto.AdjustmentTypeId =
                defaultType.AdjustmentTypeId;
            });
          });
        }
      }
      var paymentTypes = $scope.data.PaymentTypes
        ? $scope.data.PaymentTypes
        : null;
      $scope.paymentTypes = ctrl.loadPaymentTypes(paymentTypes);
      // providers
      $scope.allProviders = angular.copy($scope.data.Providers);
      ctrl.filterProviders();
      ctrl.SelectedAdjTypeIndex = $scope.data.SelectedAdjustmentTypeIndex;
      $scope.totalAdjustmentAmount = $filter('totalFilter')(
        $scope.data.ServiceAndDebitTransactionDtos,
        'AdjustmentAmount'
      );
    }

    $scope.$on('patCore:initlocation', function () {
      ctrl.filterProviders();
    });

    // Uncomment if there needs to be validation on Amount based on estimated insurance
    //$scope.checkAmount = function (event) {
    //    if ($scope.data.CreditTransactionDto.Amount === "") {
    //        $scope.data.CreditTransactionDto.Amount = 0;
    //    }

    //    if (event.currentTarget.value > ctrl.initialAmount) {
    //        $scope.isIncorrect = true;
    //        $scope.validationMsg = " Amount cannot be Greater than the Estimated Insurance";
    //    }
    //    else
    //        $scope.isIncorrect = false;
    //};

    // Toggle prompt field input depending on passed value
    ctrl.setPaymentDescription = function (paymentTypePromptValue) {
      if (!paymentTypePromptValue) {
        $scope.hidePrompt = true;
        $scope.data.CreditTransactionDto.PromptTitle = null;
      $scope.data.CreditTransactionDto.Description = null;
      } else {
        $scope.hidePrompt = false;
        $scope.data.CreditTransactionDto.PromptTitle = paymentTypePromptValue;
        $scope.data.CreditTransactionDto.Description = null;
      }
    };

    // select card reader
    $scope.cardReaderOnChange = function (deviceId) {
      $scope.selectedCardReader = deviceId;
      $scope.data.selectedCardReader = deviceId;
    };

    // Change event handler for payment type input field
    $scope.paymentTypeOnChange = function (paymentTypeId) {
      $scope.data.CreditTransactionDto.PaymentTypeId = paymentTypeId;

      // Find payment type by its display text as find by id will not provide proper results if user inputs guid ids.
      var selectedPaymentType = listHelper.findItemByFieldValue(
        $scope.paymentTypes,
        'PaymentTypeId',
        $scope.data.CreditTransactionDto.PaymentTypeId
      );
      if (selectedPaymentType == null) {
        // Clear the display value in combo-box and its corresponding id
        $scope.data.CreditTransactionDto.PaymentTypeId = null;
        $scope.showPaymentCardReaders = false;
        ctrl.setPaymentDescription(null);
      } else {
        $scope.showPaymentCardReaders = ctrl.showPaymentProvider 
                                        && (selectedPaymentType.CurrencyTypeId === $scope.CurrencyTypes.CreditCard || selectedPaymentType.CurrencyTypeId === $scope.CurrencyTypes.DebitCard);
        ctrl.preselectCardReaders();
        // Hide the prompt field if payment card readers are shown
        ctrl.setPaymentDescription($scope.showPaymentCardReaders ? null : selectedPaymentType.Prompt);
      }
      $scope.data.CreditTransactionDto.PaymentTypePromptValue = null;
    };

    // Change event handler for provider input field
    $scope.providerOnChange = function () {
      if (
        $scope.data.IsAdjustmentOnUnappliedAmount ||
        $scope.data.IsChangingAdjustmentOrPayment
      ) {
        // Set flag to denote change has been made to original data
        $scope.data.HasUnappliedAmountAdjusted = true;
      }
    };

    // Change event handler for assignment types input field
    $scope.assignmentTypesChange = function (assignedAdjustmentTypeId) {
      $scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = assignedAdjustmentTypeId;

      if ($scope.assignmentTypes) {
        // Find item by its display text as find by id will not provide proper results if user inputs digits.
        var item = listHelper.findItemByFieldValue(
          $scope.assignmentTypes,
          'AssignmentTypeId',
          $scope.data.CreditTransactionDto.AssignedAdjustmentTypeId
        );
        if (item != null) {
          //Set id corresponding to the selected item
          $scope.data.CreditTransactionDto.AssignedAdjustmentTypeId =
            item.AssignmentTypeId;
          $scope.assignedAdjustmentTypeName = item.AssignmentTypeName;
          if (item.AssignmentTypeId === 1) {
            var reloadAmount = angular.isUndefined(ctrl.reloadAmount)
              ? 0
              : ctrl.reloadAmount;
            if ($scope.data.CreditTransactionDto.Amount === reloadAmount) {
              $scope.data.ServiceAndDebitTransactionDtos = angular.copy(
                ctrl.reloadServiceAndDebitTransactionDtos
              );
              $scope.data.UnassignedAmount = ctrl.reloadunassignedAmount;
              $scope.data.HasValidationError = false;
            } else {
              ctrl.clearNegativeDistribution();
              if (
                $scope.data.CreditTransactionDto.Amount &&
                $scope.data.CreditTransactionDto.Amount !== '' &&
                $scope.data.CreditTransactionDto.Amount > 0
              ) {
                if ($scope.data.IsFeeScheduleAdjustment) {
                  ctrl.autoDistributeFeeScheduleAdjustment();
                } else {
                  ctrl.autoDistributeAdjustmentCallSetup();
                }
              } else {
                ctrl.reloadServiceAndDebitTransactionDtos = angular.copy(
                  $scope.data.ServiceAndDebitTransactionDtos
                );
                $scope.data.UnassignedAmount = 0;
                ctrl.reloadunassignedAmount = 0;
                ctrl.reloadAmount = 0;
              }
            }
            ctrl.dataHasChanged = false;
          } else {
            ctrl.dataHasChanged = true;
            ctrl.clearNegativeDistribution();
            $scope.data.UnassignedAmount = $filter(
              'totalUnassignedAmountFilter'
            )(
              angular.copy($scope.data.CreditTransactionDto),
              $scope.data.ServiceAndDebitTransactionDtos
            );
          }
        }
        $scope.totalAdjustmentAmount = $filter('totalFilter')(
          $scope.data.ServiceAndDebitTransactionDtos,
          'AdjustmentAmount'
        );
      }
    };

    // Blur event handler for negative adjustment amount input field
    $scope.negativeAdjustmentAmountOnBlur = function () {
      $scope.data.amountFocused.disableApply = false;

      if (!$scope.data.IsEditOperation) {
        // If not editing adjustment then proceed normal way
        ctrl.processAmountChange();
      } else {
        if ($scope.data.CreditTransactionDto.Amount != ctrl.initialAmount) {
          // If editing adjustment then proceed only if the amount value is actually changed
          ctrl.processAmountChange();
          // update initialAmount
          ctrl.initialAmount = angular.copy(
            $scope.data.CreditTransactionDto.Amount
          );
        }
      }
    };

    $scope.data.processAmountChange = $scope.negativeAdjustmentAmountOnBlur;
    // handle change in amount field
    ctrl.processAmountChange = function () {
      if ($scope.data.CreditTransactionDto.AssignedAdjustmentTypeId == 1) {
        if (
          !$scope.data.CreditTransactionDto.Amount ||
          $scope.data.CreditTransactionDto.Amount === 0
        ) {
          $scope.data.CreditTransactionDto.Amount = 0;
          ctrl.clearNegativeDistribution();
          ctrl.reloadAmount = 0;
          ctrl.reloadServiceAndDebitTransactionDtos = angular.copy(
            ctrl.initialServiceAndDebitTransactionDtos
          );
          ctrl.reloadunassignedAmount = 0;
        } else if (
          $scope.data.CreditTransactionDto.Amount !== ctrl.reloadAmount ||
          $scope.data.hasAccountMemberChanged ||
          ctrl.SelectedAdjTypeIndex !== $scope.data.SelectedAdjustmentTypeIndex
        ) {
          ctrl.clearNegativeDistribution();
          if (
            $scope.data.CreditTransactionDto.Amount &&
            $scope.data.CreditTransactionDto.Amount !== '' &&
            $scope.data.CreditTransactionDto.Amount > 0
          ) {
            if ($scope.data.IsFeeScheduleAdjustment) {
              ctrl.autoDistributeFeeScheduleAdjustment();
            } else {
              ctrl.autoDistributeAdjustmentCallSetup();
            }
          } else {
            ctrl.reloadServiceAndDebitTransactionDtos = angular.copy(
              $scope.data.ServiceAndDebitTransactionDtos
            );
            $scope.data.UnassignedAmount = 0;
            ctrl.reloadunassignedAmount = 0;
            ctrl.reloadAmount = 0;
            $scope.totalAdjustmentAmount = $filter('totalFilter')(
              $scope.data.ServiceAndDebitTransactionDtos,
              'AdjustmentAmount'
            );
          }
        }
      }
      ctrl.SelectedAdjTypeIndex = angular.copy(
        $scope.data.SelectedAdjustmentTypeIndex
      );

      if ($scope.data.CreditTransactionDto.AssignedAdjustmentTypeId == 2) {
        ctrl.clearNegativeDistribution();
        $scope.data.UnassignedAmount = $filter('totalUnassignedAmountFilter')(
          angular.copy($scope.data.CreditTransactionDto),
          $scope.data.ServiceAndDebitTransactionDtos
        );
        $scope.totalAdjustmentAmount = $filter('totalFilter')(
          $scope.data.ServiceAndDebitTransactionDtos,
          'AdjustmentAmount'
        );
      }
    };

    // Function to clear negative adjustment distribution
    ctrl.clearNegativeDistribution = function () {
      angular.forEach(
        $scope.data.ServiceAndDebitTransactionDtos,
        function (serviceTransaction) {
          serviceTransaction.AdjustmentAmount = 0;
        }
      );
      $scope.data.UnassignedAmount = 0;
      $scope.totalAdjustmentAmount = 0;
      $scope.data.HasValidationError = false;
    };

    $scope.setAssignedAdjustmentType = function (
      distributedTransactionData,
      flag
    ) {
      if (flag && !$scope.data.IsFeeScheduleAdjustment) {
        $scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 2;
        $scope.recalculateUnassignedAmount(distributedTransactionData);
      }
    };

    // Validation when closing a claim
    ctrl.validateDistributionForClosedClaim = function () {
      // distribution is not valid if amount distributed is more than the TotalUnpaidBalance
      $scope.data.HasValidationError =
        $scope.totalAdjustmentAmount > $scope.data.CreditTransactionDto.Amount
          ? true
          : false;
      // individual service.AdjustmentAmount should not be more than service.TotalUnpaidBalance
      // NOTE scope.data.HasValidationError disables the apply button
      $scope.data.ServiceAndDebitTransactionDtos.forEach(
        serviceTransactionOrDebit => {
          serviceTransactionOrDebit.HasValidationError = false;
          serviceTransactionOrDebit.ValidationErrorMessage = '';
          if (
            serviceTransactionOrDebit.AdjustmentAmount >
            serviceTransactionOrDebit.TotalUnpaidBalance
          ) {
            $scope.data.HasValidationError = true;
            serviceTransactionOrDebit.ValidationErrorMessage =
              'Cannot assign more than the charge / allowed amount.';
            serviceTransactionOrDebit.HasValidationError = true;
          }
        }
      );
    };

    // on change of service amount re-calculate unassigned amount
    $scope.recalculateUnassignedAmount = function (distributedTransactionData) {
      if ($scope.data.IsFeeScheduleAdjustment) {
        $scope.AmountAndServicesMisMatch =
          parseFloat(
            _.reduce(
              $scope.data.ServiceAndDebitTransactionDtos,
              function (sum, item) {
                return sum + item.AdjustmentAmount;
              },
              0
            ).toFixed(2)
          ) !== parseFloat($scope.data.CreditTransactionDto.Amount.toFixed(2));
        return;
      }
      //set total-adjustment amount 0 when account member option changed.
      if ($scope.data.hasAccountMemberChanged) {
        $scope.totalAdjustmentAmount = 0.0;
        ctrl.reloadAmount = 0;
      }
      //set adjustment-type when adjustment-amount has changed

      $scope.data.HasValidationError =
        distributedTransactionData.AdjustmentAmount >
          distributedTransactionData.TotalUnpaidBalance ||
        distributedTransactionData.AdjustmentAmount >
          distributedTransactionData.Balance
          ? true
          : false;

      $scope.data.ServiceAndDebitTransactionDtos.forEach(
        serviceTransactionOrDebit => {
          if (
            serviceTransactionOrDebit.AdjustmentAmount >
              serviceTransactionOrDebit.TotalUnpaidBalance ||
            serviceTransactionOrDebit.AdjustmentAmount >
              serviceTransactionOrDebit.Balance
          ) {
            $scope.data.HasValidationError = true;
          }
        }
      );

      if ($scope.data.CreditTransactionDto.AssignedAdjustmentTypeId == 2) {
        // Handle amount change for '-' adjustment and account payment with manual distribution
        $scope.data.UnassignedAmount = $filter('totalUnassignedAmountFilter')(
          angular.copy($scope.data.CreditTransactionDto),
          $scope.data.ServiceAndDebitTransactionDtos
        );
        $scope.totalAdjustmentAmount = $filter('totalFilter')(
          $scope.data.ServiceAndDebitTransactionDtos,
          'AdjustmentAmount'
        );
        $scope.data.ErrorFlags.providerMissing = false;
      }
      if (distributedTransactionData.IsForClosingClaim === true) {
        ctrl.validateDistributionForClosedClaim();
      }

      if ($scope.data.IsAdjustmentOnUnappliedAmount) {
        // Handle amount change for '-' adjustment on un-applied amount
        var adjustmentAmount,
          serviceAmountTotal = 0;
        angular.forEach(
          $scope.data.ServiceAndDebitTransactionDtos,
          function (service) {
            adjustmentAmount = service.AdjustmentAmount
              ? service.AdjustmentAmount
              : 0;
            serviceAmountTotal = serviceAmountTotal + adjustmentAmount;
            if (
              !service.IsForClosingClaim &&
              !$scope.data.IsFeeScheduleAdjustment &&
              (service.AdjustmentAmount > service.Amount ||
                service.AdjustmentAmount > service.TotalUnpaidBalance ||
                service.AdjustmentAmount > service.Balance)
            ) {
              $scope.data.HasValidationError = true;
            }
            // extra validation for debitTransaction
            // This code is overcomplicated because it handles too many diverse scenarios for debits, credits, adjustments
            // so validation has to be specific (like this).

            if (
              service.TransactionTypeId === 5 ||
              service.TransactionTypeId === 6
            ) {
              service.AdjustmentMoreThanBalanceError =
                service.AdjustmentAmount > service.TotalUnpaidBalance ||
                service.AdjustmentAmount > service.Balance;
              if (service.AdjustmentMoreThanBalanceError === true) {
                $scope.data.HasValidationError = true;
              }
            }
          }
        );
        $scope.data.UnassignedAmount = (
          $scope.data.UnappliedTransaction.UnassignedAmount - serviceAmountTotal
        ).toFixed(2);
        $scope.totalAdjustmentAmount = $filter('totalFilter')(
          $scope.data.ServiceAndDebitTransactionDtos,
          'AdjustmentAmount'
        );

        // Set flag to denote change has been made to original data
        $scope.data.HasUnappliedAmountAdjusted =
          ctrl.reloadunassignedAmount != $scope.data.UnassignedAmount;
      }
      if ($scope.data.IsChangingAdjustmentOrPayment) {
        // Handle amount change for 'change how payment/adjustment is applied'
        var totalDistributedAmount = 0;
        $scope.data.UnassignedAmount = parseFloat(
          $filter('totalUnassignedAmountFilter')(
            angular.copy($scope.data.CreditTransactionDto),
            $scope.data.ServiceAndDebitTransactionDtos
          )
        );
        $scope.totalAdjustmentAmount = parseFloat(
          $filter('totalFilter')(
            $scope.data.ServiceAndDebitTransactionDtos,
            'AdjustmentAmount'
          )
        );

        if ($scope.data.UnassignedAmount < 0) {
          totalDistributedAmount = parseFloat(
            $scope.totalAdjustmentAmount.toFixed(2)
          );
        } else {
          totalDistributedAmount = parseFloat(
            (
              $scope.data.UnassignedAmount + $scope.totalAdjustmentAmount
            ).toFixed(2)
          );
        }

        $scope.throwError =
          totalDistributedAmount > $scope.data.CreditTransactionDto.Amount
            ? true
            : false;

        $scope.data.HasValidationError =
          distributedTransactionData.AdjustmentAmount >
            distributedTransactionData.TotalUnpaidBalance ||
          distributedTransactionData.AdjustmentAmount >
            distributedTransactionData.Balance ||
          $scope.throwError
            ? true
            : false;

        // isChangingAdjustmentOrPayment indicates Change Distribution on Payment or Adjustment
        // service.AdjustmentAmount should not be more than service.TotalUnpaidBalance or service.Balance
        // NOTE scope.data.HasValidationError disables the apply button
        $scope.data.ServiceAndDebitTransactionDtos.forEach(
          serviceTransactionOrDebit => {
            if (
              serviceTransactionOrDebit.AdjustmentAmount >
                serviceTransactionOrDebit.TotalUnpaidBalance ||
              serviceTransactionOrDebit.AdjustmentAmount >
                serviceTransactionOrDebit.Balance
            ) {
              $scope.data.HasValidationError = true;
            }
          }
        );

        // Set flag to denote change has been made to original data
        $scope.data.HasUnappliedAmountAdjusted = ctrl.compareDistributionForChange();
      }
    };

    // Function to compare original distribution with new distribution to detect change and enable "apply" button accordingly
    ctrl.compareDistributionForChange = function () {
      var hasChange = false;
      angular.forEach(
        $scope.data.ServiceAndDebitTransactionDtos,
        function (newDistribution) {
          var originalDistribution = listHelper.findItemByFieldValue(
            ctrl.initialServiceAndDebitTransactionDtos,
            'RecordIndex',
            newDistribution.RecordIndex
          );
          if (originalDistribution) {
            if (!hasChange) {
              hasChange = !(
                originalDistribution.AdjustmentAmount ==
                  newDistribution.AdjustmentAmount ||
                (originalDistribution.AdjustmentAmount == 0 &&
                  (newDistribution.AdjustmentAmount == '' ||
                    newDistribution.AdjustmentAmount == 0))
              );
            }
          } else {
            return hasChange;
          }
        }
      );
      return hasChange;
    };

    // Function to get auto distribution of negative adjustment
    ctrl.autoDistributeAdjustmentCallSetup = function () {
      var serviceTransactionDtos = $scope.data.ServiceAndDebitTransactionDtos
        ? $scope.data.ServiceAndDebitTransactionDtos
        : [];
      //map the DebitTransactionId to the ServiceTransactionId as distribution API accepts list of ServiceTransactionDtos
      angular.forEach(serviceTransactionDtos, function (transaction) {
        if (
          transaction.TransactionTypeId === 5 ||
          transaction.TransactionTypeId === 6
        )
          transaction.ServiceTransactionId = transaction.DebitTransactionId;
      });

      // Get distributed credit transaction details
      $scope.distributedDetailsLoading = true;

      // when getting distribution on service-transactions of the more than one (pending) encounter
      ctrl.distributionParams = {
        accountMemberId:
          $scope.data.PatientInfo.PersonAccount.PersonAccountMember
            .AccountMemberId,
        amount: $scope.data.CreditTransactionDto.Amount,
      };

      patientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions(
        ctrl.distributionParams,
        serviceTransactionDtos,
        ctrl.autoCreditDistributionSuccess,
        ctrl.autoCreditDistributionFailure
      );
    };

    ctrl.autoDistributeFeeScheduleAdjustment = function () {
      var amount = $scope.data.CreditTransactionDto.Amount;
      angular.forEach(
        $scope.data.ServiceAndDebitTransactionDtos,
        function (serviceTransaction) {
          serviceTransaction.AdjustmentAmount =
            amount < serviceTransaction.TotalAdjEstimate
              ? amount
              : serviceTransaction.TotalAdjEstimate;
          amount -= serviceTransaction.AdjustmentAmount;
        }
      );
      $scope.AmountAndServicesMisMatch =
        parseFloat(
          _.reduce(
            $scope.data.ServiceAndDebitTransactionDtos,
            function (sum, item) {
              return sum + item.AdjustmentAmount;
            },
            0
          ).toFixed(2)
        ) !== parseFloat($scope.data.CreditTransactionDto.Amount.toFixed(2));
      $scope.totalAdjustmentAmount = $filter('totalFilter')(
        $scope.data.ServiceAndDebitTransactionDtos,
        'AdjustmentAmount'
      );
      return;
    };

    // Function to get patient portion of service transaction
    $scope.getPatientPortion = function (serviceTransaction) {
      var patientPortion = 0;

      var fee = serviceTransaction.Fee ? serviceTransaction.Fee : 0;
      var tax = serviceTransaction.Tax ? serviceTransaction.Tax : 0;
      var estInsurance = serviceTransaction.TotalEstInsurance
        ? serviceTransaction.TotalEstInsurance
        : 0;

      patientPortion = fee + tax - estInsurance;

      return patientPortion;
    };

    // Success callback handler for auto distribution of credit-transaction amount
    ctrl.autoCreditDistributionSuccess = function (successResponse) {
      $scope.distributedDetailsLoading = false;
      var distributedCreditTransactionDetails = successResponse.Value;
      angular.forEach(
        distributedCreditTransactionDetails,
        function (creditTransactionDetail) {
          var serviceTransactionDto;
          if (creditTransactionDetail.AppliedToServiceTransationId) {
            serviceTransactionDto = listHelper.findItemByFieldValue(
              $scope.data.ServiceAndDebitTransactionDtos,
              'ServiceTransactionId',
              creditTransactionDetail.AppliedToServiceTransationId
            );
            if (serviceTransactionDto) {
              serviceTransactionDto.AdjustmentAmount =
                creditTransactionDetail.Amount;
            }
          } else if (creditTransactionDetail.AppliedToDebitTransactionId) {
            serviceTransactionDto = listHelper.findItemByFieldValue(
              $scope.data.ServiceAndDebitTransactionDtos,
              'DebitTransactionId',
              creditTransactionDetail.AppliedToDebitTransactionId
            );
            if (serviceTransactionDto) {
              serviceTransactionDto.AdjustmentAmount =
                creditTransactionDetail.Amount;
            }
          } else {
            $scope.data.UnassignedAmount = creditTransactionDetail.Amount;
          }
        }
      );
      ctrl.reloadServiceAndDebitTransactionDtos = angular.copy(
        $scope.data.ServiceAndDebitTransactionDtos
      );
      ctrl.reloadunassignedAmount = $scope.data.UnassignedAmount;
      ctrl.reloadAmount = $scope.data.CreditTransactionDto.Amount;
      $scope.totalAdjustmentAmount = $filter('totalFilter')(
        $scope.data.ServiceAndDebitTransactionDtos,
        'AdjustmentAmount'
      );
      //this only runs when the callback from a partial payment is applied on the adjustment controller
      if ($scope.data.partialPayment) {
        $scope.data.partialPayment = false;
        $scope.data.continueAdjustment();
      }
    };

    // Error callback handler for auto distribution of credit-transaction amount
    ctrl.autoCreditDistributionFailure = function () {
      $scope.distributedDetailsLoading = false;
      toastrFactory.error(
        localize.getLocalizedString('Failed to distribute {0}', [
          $scope.data.CreditTransactionDto.TransactionTypeId == 4
            ? 'negative adjustment'
            : 'account payment',
        ]),
        localize.getLocalizedString('Server Error')
      );
      $scope.data.CreditTransactionDto.Amount = 0;
      ctrl.clearNegativeDistribution();
    };

    //#region Adjustment Amount Input-box of Service and Debit Transaction

    // Bug 432878 Wrapping the call to scrollIntoViewIfNeeded because sometimes throws scrollIntoViewIfNeeded is not a function exceptions
    $scope.scrollServiceAmountInputIntoView = function (index) {
      var element = angular.element('#inpFee' + index);
      if (element && element.get(0)) {
        element.get(0).scrollIntoViewIfNeeded();
      }
    };

    //#endregion

    // If default amount is present then call distribution for it
    $scope.SumOfAdjustedEstimates = parseFloat(
      _.reduce(
        $scope.data.ServiceAndDebitTransactionDtos,
        function (sum, item) {
          return sum + item.TotalAdjEstimate;
        },
        0
      ).toFixed(2)
    );

    if (
      $scope.data.CreditTransactionDto.Amount > 0 &&
      $scope.data.CreditTransactionDto.AssignedAdjustmentTypeId == 1
    ) {
      $scope.negativeAdjustmentAmountOnBlur();
    }
    $scope.disableApply = function () {
      $scope.data.amountFocused.disableApply = true;
    };
    //#region Adjustment Amount Input-box of Service to be in focus
    var index = 0;
    var isScrolled = false;
    $timeout(function () {
      angular.forEach(
        $scope.data.ServiceAndDebitTransactionDtos,
        function (transaction) {
          if (!isScrolled && transaction.AdjustmentAmount > 0) {
            var inputFee = angular.element('#inpFee' + index).get(0);
            inputFee.scrollIntoView(true);
            inputFee.focus();
            isScrolled = true;
          } else {
            index++;
          }
        }
      );
    }, 500);
    //#endregion

    //Watch data.UnappliedTransaction.UnassignedAmount for any changes
    $scope.$watch(
      'data.UnappliedTransaction.UnassignedAmount',
      function (nv) {
        if (nv) {
          $scope.data.UnassignedAmount = nv;
          ctrl.reloadunassignedAmount = nv;
          $scope.totalAdjustmentAmount = $filter('totalFilter')(
            $scope.data.ServiceAndDebitTransactionDtos,
            'AdjustmentAmount'
          );
        }
      },
      true
    );

    $scope.hasAdjustmentAmountChanged = true;

    // Get provider name for the service transaction only
    $scope.getProviderName = function (providerUserId) {
      var provider = listHelper.findItemByFieldValue(
        $scope.allProviders,
        'UserId',
        providerUserId
      );
      if (provider) {
        return provider.UserCode;
      } else {
        return '';
      }
    };

    $scope.$watch('showPaymentCardReaders', function(nv, ov) {
      if (ov && !nv)
        $scope.selectedCardReader = null;
    });

    $scope.$watch('data', function (nv, ov) {
      if (!_.isEqual(nv, ov)) {
        ctrl.setServiceArea();
      }
    });
  },
]);

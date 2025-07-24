'use strict';
angular.module('Soar.Patient').controller('TreatmentPlanPrintController', [
  '$scope',
  '$filter',
  'DocumentsLoadingService',
  'localize',
  '$routeParams',
  'TreatmentPlansFactory',
  'fileService',
  'toastrFactory',
  '$window',
  'TreatmentPlanDocumentFactory',
  'referenceDataService',
  function (
    $scope,
    $filter,
    documentsLoadingService,
    localize,
    $routeParams,
    treatmentPlansFactory,
    fileService,
    toastrFactory,
    $window,
    treatmentPlanDocumentFactory,
    referenceDataService
  ) {
    var ctrl = this;

    // all things that need to happen on init
    ctrl.$onInit = function () {
      // if activeTreatmentPlan is in localStorage, we are creating a snapshot
      $scope.treatmentPlanDto = JSON.parse(
        localStorage.getItem('activeTreatmentPlan')
      );
      if (!_.isNil($scope.treatmentPlanDto)) {
        $scope.treatmentPlanDto.TreatmentPlanServices = $scope.treatmentPlanDto.TreatmentPlanServices.filter(
          function (val) {
            return val.ServiceTransaction.$$IncludeInAppointment === true;
          }
        );
        var treatmentPlanPrintOptions = JSON.parse(
          localStorage.getItem('txPlanPrintOptions')
        );
      }

      // for the signature directive
      $scope.signatureTitle = localize.getLocalizedString(
        'Signature of Patient/Legal Guardian'
      );
      $scope.patientInfo = {};
      $scope.showOptions = {
        showDescription:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showDescription)
            ? treatmentPlanPrintOptions.showDescription
            : true,
        showTooth:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showTooth)
            ? treatmentPlanPrintOptions.showTooth
            : true,
        showSurface:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showSurface)
            ? treatmentPlanPrintOptions.showSurface
            : true,
        showStatus:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showStatus)
            ? treatmentPlanPrintOptions.showStatus
            : true,
        showLocation:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showLocation)
            ? treatmentPlanPrintOptions.showLocation
            : true,
        showProvider:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showProvider)
            ? treatmentPlanPrintOptions.showProvider
            : true,
        showCharges:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showCharges)
            ? treatmentPlanPrintOptions.showCharges
            : true,
        showAllowedAmount:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showAllowedAmount)
            ? treatmentPlanPrintOptions.showAllowedAmount
            : true,
        showEstAdjIns:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showEstAdjIns)
            ? treatmentPlanPrintOptions.showEstAdjIns
            : true,
        showEstIns:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showEstIns)
            ? treatmentPlanPrintOptions.showEstIns
            : true,
        showPatBalance:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showPatBalance)
            ? treatmentPlanPrintOptions.showPatBalance
            : true,
        showTotalCharges:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showTotalCharges)
            ? treatmentPlanPrintOptions.showTotalCharges
            : true,
        showEstInsurance:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showEstInsurance)
            ? treatmentPlanPrintOptions.showEstInsurance
            : true,
        showEstInsAdj:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showEstInsAdj)
            ? treatmentPlanPrintOptions.showEstInsAdj
            : true,
        showEstPatBal:
          treatmentPlanPrintOptions &&
          !_.isNil(treatmentPlanPrintOptions.showEstPatBal)
            ? treatmentPlanPrintOptions.showEstPatBal
            : true,
      };

      $scope.calculateEmptyColumnsForTotals();

      $scope.patientInfo.PatientId = $routeParams.patientId;

      // cleaning up the page for print/display
      angular.element('body').attr('style', 'padding-top:0;');
      angular.element('.view-container').attr('style', 'background-color:#fff');
      angular.element('.top-header').remove();
      angular.element('.feedback-container').remove();

      // getting docs out of localStorage and deleting
      $scope.document = documentsLoadingService.getDocument();
      if ($scope.document) {
        documentsLoadingService.setDocument(null);
        $scope.planStages = _.orderBy(
          treatmentPlansFactory.LoadPlanStages(
            $scope.treatmentPlanDto.TreatmentPlanServices,
            false
          ),
          'stageno'
        );
        ctrl.calculateInsuranceTotals();
      } else {
        ctrl.localStorageIdentifier =
          'document_' + $routeParams.signatureFileAllocationId;
        $scope.document = JSON.parse(
          localStorage.getItem(ctrl.localStorageIdentifier)
        );
        localStorage.removeItem(ctrl.localStorageIdentifier);

        if (!_.isNil($scope.document.HiddenSnapshotColumns)) {
          var hiddenColumns = $scope.document.HiddenSnapshotColumns.split(',');

          _.forEach(hiddenColumns, function (hiddenColumn) {
            switch (hiddenColumn) {
              case 'showDescription':
                $scope.showOptions.showDescription = false;
                break;
              case 'showTooth':
                $scope.showOptions.showTooth = false;
                break;
              case 'showSurface':
                $scope.showOptions.showSurface = false;
                break;
              case 'showStatus':
                $scope.showOptions.showStatus = false;
                break;
              case 'showLocation':
                $scope.showOptions.showLocation = false;
                break;
              case 'showProvider':
                $scope.showOptions.showProvider = false;
                break;
              case 'showCharges':
                $scope.showOptions.showCharges = false;
                break;
              case 'showAllowedAmount':
                $scope.showOptions.showAllowedAmount = false;
                break;
              case 'showEstAdjIns':
                $scope.showOptions.showEstAdjIns = false;
                break;
              case 'showEstIns':
                $scope.showOptions.showEstIns = false;
                break;
              case 'showPatBalance':
                $scope.showOptions.showPatBalance = false;
                break;
              case 'showTotalCharges':
                $scope.showOptions.showTotalCharges = false;
                break;
              case 'showEstInsurance':
                $scope.showOptions.showEstInsurance = false;
                break;
              case 'showEstInsAdj':
                $scope.showOptions.showEstInsAdj = false;
                break;
              case 'showEstPatBal':
                $scope.showOptions.showEstPatBal = false;
                break;
            }
          });
        }
      }

      localStorage.removeItem('activeTreatmentPlan');
      localStorage.removeItem('txPlanPrintOptions');
      ctrl.getSignature();

      // update provider display - we want to show the provider name, not the provider code
      if ($scope.document && $scope.document.planStages) {
        ctrl.updateProviderNameDisplay($scope.document);
      }
    };

    /**
     * add a 'ProviderFullName' property to each service, in each stage, of the passed in treatment plan.
     *
     * @param {*} treatmentPlanDocument
     * @returns {angular.IPromise}
     */
    ctrl.updateProviderNameDisplay = function (treatmentPlanDocument) {
      return referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (allProvidersList) {
          // for each planned stage
          for (let i = 0; i < treatmentPlanDocument.planStages.length; i++) {
            let stage = treatmentPlanDocument.planStages[i];

            // for each service within the stage
            for (let j = 0; j < stage.Details.length; j++) {
              let service = stage.Details[j];

              // service.Provider is the provider code
              let serviceProvider = allProvidersList.find(
                provider => provider.UserCode === service.Provider
              );

              if (serviceProvider) {
                service.ProviderFullName = `${serviceProvider.FirstName} ${serviceProvider.LastName}`;
              } else {
                service.ProviderFullName = service.Provider;
              }
            }
          }
        });
    };

    // loading the image into the canvas
    ctrl.loadCanvas = function (dataURL) {
      var canvas = angular.element('#existing-signature-cnv')[0];
      var context = canvas.getContext('2d');
      var imageObj = new Image();
      imageObj.onload = function () {
        context.drawImage(this, 0, 0);
      };
      imageObj.src = dataURL;
    };

    // if we get document.signatureFileAllocationId, then we are in snapshot mode and will need to retrieve the signature
    ctrl.getSignature = function () {
      if ($scope.document.signatureFileAllocationId) {
        fileService
          .downloadFile($scope.document.signatureFileAllocationId)
          .then(
            function (res) {
              ctrl.loadCanvas(res.data);
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString('{0} {1}', [
                  'Signature',
                  'failed to load.',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
      }
    };

    // after upload, treatmentPlan.TreatmentPlanHeader.SignatureFileAllocationId gets set by the signature directive
    $scope.$watch('document.newSignatureFileAllocationId', function (nv, ov) {
      if (nv) {
        // communicate each time new signature uploaded
        // use new storage item because rules for signedTxPlanInfo are different
        var signedTxPlanObject = {
          allocationId: nv,
        };
        $window.localStorage.setItem('signedTxPlan', JSON.stringify(nv));

        $scope.treatmentPlanDto.TreatmentPlanHeader.SignatureFileAllocationId = nv;
        $scope.treatmentPlanDto.TreatmentPlanHeader.HiddenSnapshotColumns = '';
        Object.keys($scope.showOptions).forEach((key, value) => {
          if ($scope.showOptions[key] == false) {
            $scope.treatmentPlanDto.TreatmentPlanHeader.HiddenSnapshotColumns +=
              key + ',';
          }
        });

        treatmentPlanDocumentFactory
          .CreateTreatmentPlanSnapshot($scope.treatmentPlanDto)
          .then(function (res) {
            if (res && res.Value) {
              // temporarily setting signedTxPlanInfo in localStorage for communication/syncing between tabs
              // the 'parent' window handles updating the txPlan to Accepted if necessary
              var signedTxPlanInfoObject = {
                treatmentPlanId: $scope.document.treatmentPlanId,
              };
              $window.localStorage.setItem(
                'signedTxPlanInfo',
                JSON.stringify(signedTxPlanInfoObject)
              );
            }
          });
      }
    });

    // !!
    // This section needed to be copied from the factory due to how we calculate deleted and rejected services in the stages
    // !!
    ctrl.sum = function (items, prop) {
      return items.reduce(function (a, b) {
        return a + b[prop];
      }, 0);
    };

    // !!
    // This section needed to be copied from the factory due to how we calculate deleted and rejected services in the stages
    // !!
    ctrl.calculateStageTotals = function (treatmentPlanServices, stages) {
      if (stages.length != 0) {
        _.forEach(stages, function (stage) {
          var servicesInStage = $filter('filter')(
            treatmentPlanServices,
            function (tpservice) {
              if (
                tpservice.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber ==
                  stage.stageno &&
                !tpservice.ServiceTransaction.IsDeleted
              ) {
                return tpservice;
              }
            }
          );

          // service count totals for stage
          stage.ServiceCountForStage = servicesInStage
            ? servicesInStage.length
            : 0;

          stage.InsuranceEstTotalForStage = 0;
          stage.PatientPortionTotalForStage = 0;
          stage.AdjEstTotalForStage = 0;
          stage.TotalFeesForStage = 0;
          stage.TotalAllowedAmountForStage = 0;
          _.forEach(servicesInStage, function (treatmentPlanService) {
            if (treatmentPlanService.ServiceTransaction.InsuranceEstimates) {
              // do not include ServiceTransactions with IsDeleted === true or ServiceTransactionStatusId === 4 or ServiceTransactionStatusId === 3 or ServiceTransactionStatusId === 2 or 8 in totals
              if (treatmentPlanService.ServiceTransaction.IsDeleted !== true) {
                if (
                  treatmentPlanService.ServiceTransaction
                    .ServiceTransactionStatusId !== 4 &&
                  treatmentPlanService.ServiceTransaction
                    .ServiceTransactionStatusId !== 8 &&
                  treatmentPlanService.ServiceTransaction
                    .ServiceTransactionStatusId !== 3 &&
                  treatmentPlanService.ServiceTransaction
                    .ServiceTransactionStatusId !== 2
                ) {
                  // total ins est per stage
                  stage.InsuranceEstTotalForStage += ctrl.sum(
                    treatmentPlanService.ServiceTransaction.InsuranceEstimates,
                    'EstInsurance'
                  );
                  if (
                    treatmentPlanService.ServiceTransaction.InsuranceEstimates
                  ) {
                    stage.PatientPortionTotalForStage -= ctrl.sum(
                      treatmentPlanService.ServiceTransaction
                        .InsuranceEstimates,
                      'EstInsurance'
                    );
                    stage.PatientPortionTotalForStage -= ctrl.sum(
                      treatmentPlanService.ServiceTransaction
                        .InsuranceEstimates,
                      'AdjEst'
                    );
                  }
                  // total patient portion stage
                  stage.PatientPortionTotalForStage +=
                    treatmentPlanService.ServiceTransaction.Amount;
                }
                // total ins est adj stage
                stage.AdjEstTotalForStage += ctrl.sum(
                  treatmentPlanService.ServiceTransaction.InsuranceEstimates,
                  'AdjEst'
                );
                // total fees stage
                stage.TotalFeesForStage +=
                  treatmentPlanService.ServiceTransaction.Fee -
                  treatmentPlanService.ServiceTransaction.Discount +
                  treatmentPlanService.ServiceTransaction.Tax;
                // total allowed amount
                stage.TotalAllowedAmountForStage +=
                  treatmentPlanService.ServiceTransaction.AllowedAmount;
              }
            }
          });
        });
      }
      return stages;
    };

    // The following section can be removed if/when the editable est ins fields are no longer needed
    ctrl.calculatePlanTotals = function () {
      $scope.stageTotals = ctrl.calculateStageTotals(
        $scope.treatmentPlanDto.TreatmentPlanServices,
        $scope.planStages
      );
    };

    $scope.getStageTotals = function (stageNumber) {
      if (!_.isNil(stageNumber)) {
        var retValue = _.find($scope.stageTotals, function (x) {
          return x.stageno === stageNumber;
        });
        if (!_.isNil(retValue)) {
          return retValue;
        }
      }

      return {
        stageno: 0,
        AppointmentId: null,
        appointmentStatus: '',
        ServiceCountForStage: 0,
        TotalFeesForStage: 0,
        TotalAllowedAmountForStage: 0,
        AdjEstTotalForStage: 0,
        InsuranceEstTotalForStage: 0,
        PatientPortionTotalForStage: 0,
      };
    };

    // calculate totals when the services change
    ctrl.calculateInsuranceTotals = function () {
      $scope.insuranceEstimateTotal = 0;
      $scope.patientPortionTotal = 0;
      $scope.adjustedEstimateTotal = 0;
      $scope.allowedAmountTotal = 0;
      if (
        $scope.treatmentPlanDto &&
        $scope.treatmentPlanDto.TreatmentPlanServices
      ) {
        _.forEach($scope.treatmentPlanDto.TreatmentPlanServices, function (ps) {
          if (
            ps.ServiceTransaction.IsDeleted !== true &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 4 &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 8 &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 3 &&
            ps.ServiceTransaction.ServiceTransactionStatusId !== 2
          ) {
            if (ps.ServiceTransaction.InsuranceEstimates) {
              $scope.insuranceEstimateTotal += $scope.sum(
                ps.ServiceTransaction.InsuranceEstimates,
                'EstInsurance'
              );
              $scope.adjustedEstimateTotal += $scope.sum(
                ps.ServiceTransaction.InsuranceEstimates,
                'AdjEst'
              );
              ps.ServiceTransaction.PatientBalance =
                ps.ServiceTransaction.Amount -
                $scope.sum(
                  ps.ServiceTransaction.InsuranceEstimates,
                  'EstInsurance'
                ) -
                $scope.sum(ps.ServiceTransaction.InsuranceEstimates, 'AdjEst');
              $scope.patientPortionTotal +=
                ps.ServiceTransaction.PatientBalance;
              $scope.allowedAmountTotal += ps.ServiceTransaction.AllowedAmount;
            } else {
              ps.ServiceTransaction.PatientBalance = ps.ServiceTransaction.Fee;
            }
          } else {
            ps.ServiceTransaction.PatientBalance = 0;
          }
        });
      }
      ctrl.calculatePlanTotals();
    };

    $scope.serviceAmountTotal = function (services) {
      var serviceAmounts = _.map(services, function (service) {
        return service.ServiceTransaction.IsDeleted !== true
          ? service.ServiceTransaction.Amount
          : 0;
      });
      var sum = _.sum(serviceAmounts);
      return sum;
    };

    $scope.recalculateTotals = function (modifiedService, field) {
      var prop = '$$' + field;
      if (
        modifiedService &&
        modifiedService.InsuranceEstimates &&
        modifiedService.InsuranceEstimates.length > 0
      ) {
        modifiedService.InsuranceEstimates[0][field] =
          modifiedService[prop] > 0 ? modifiedService[prop] : 0.0;
        modifiedService[prop] =
          modifiedService[prop] > 0 ? modifiedService[prop] : 0.0;

        if (modifiedService.InsuranceEstimates.length > 1) {
          modifiedService.InsuranceEstimates[1][field] = 0.0;
        }
      }
      ctrl.calculateInsuranceTotals();
      $scope.serviceAmountTotal();
    };

    $scope.sum = function (items, prop) {
      return items.reduce(function (a, b) {
        return a + b[prop];
      }, 0);
    };
    // End removable section

    $scope.calculateEmptyColumnsForTotals = function () {
      $scope.columnCountLeftOfTotals = 0;

      var columns = [
        $scope.showOptions.showDescription,
        $scope.showOptions.showTooth,
        $scope.showOptions.showSurface,
        $scope.showOptions.showStatus,
        $scope.showOptions.showLocation,
        $scope.showOptions.showProvider,
      ];
      columns.forEach(x => {
        if (x == true) {
          $scope.columnCountLeftOfTotals = $scope.columnCountLeftOfTotals + 1;
        }
      });
      //Subtract column count - 1, this will allow for the offset from the service count not being considered in columns
      $scope.columnCountLeftOfTotals = $scope.columnCountLeftOfTotals - 1;
    };

    // calling init because it won't do it automatically here
    ctrl.$onInit();
  },
]);

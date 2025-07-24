'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('ReportExportController', [
    '$scope',
    '$routeParams',
    'ReportsFactory',
    '$filter',
    'localize',
    ReportExportController,
  ]);
function ReportExportController(
  $scope,
  $routeParams,
  reportsFactory,
  $filter,
  localize
) {
  BaseCtrl.call(this, $scope, 'ReportExportController');
  var ctrl = this;
  var exportData = null;
  var activityLogBetaReportId = 227;
  //#region Export to CSV

  ctrl.formatMonetaryColumnValue = function (value) {
    if ($scope.exportNewApi === true) {
      value = value.replaceAll('"', '');
    }
    value = parseFloat(Math.round(value * 100) / 100).toFixed(2);
    if (value < 0) {
      value =
        '(' +
        '$' +
        value.toString().substring(1, value.toString().length) +
        ')';
    }
    value = value.toString().substring(0, 1) === '(' ? value : '$' + value;
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (value.indexOf(',') !== -1) {
      value = '"' + value + '"';
    }
    if (value === '$NaN') {
      value = '';
    }
    return value;
  };

  ctrl.formatColumnValue = function (value) {
    if (_.isNull(value)) {
      value = 'N/A';
    }
    if (typeof value == 'string') {
      var date = new Date(value);
      if (value == '') {
        value = 'N/A';
      } else if (value.charAt(0) == '-') {
        value = 'Negative' + value.substr(1);
      } else if (value.charAt(0) == '+') {
        value = 'Positive' + value.substr(1);
      } else if (
        !isNaN(date.valueOf()) &&
        value.length >= 19 &&
        value.match(new RegExp('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}'))
      ) {
        return !$scope.isCustomReport &&
            ($scope.reportId === $scope.$parent.reportIds.ActivityLogReportId || $scope.reportId == activityLogBetaReportId)
          ? $filter('toShortDisplayDateLocal')(value) +
              ' ' +
              $filter('toDisplayTime')(value)
          : date.getMonth() +
              1 +
              '/' +
              date.getDate() +
              '/' +
              date.getFullYear();
      } else {
        value =
          '"' +
          value
            .replace(new RegExp('"', 'g'), '""')
            .replace(/(?:\r\n|\r|\n)/g, '; ') +
              '"';
          value = ctrl.sanitizeForCSV(value);
      }
    }
    return value;
  };

  ctrl.sanitizeForCSV = function (value) {
      if (typeof value === 'string') {
          // Remove HTML
          let sanitized = value.replace(/<[^>]*>/g, ''); // remove anything between < and >
          return sanitized;
      }
      return value;
    }


  ctrl.getArrayKeys = function (array, skipEndLine) {
    var arrayProps = [];
    var string = '';
    for (var key in array[0]) {
      if (_.has(array[0], key) && key !== '$$hashKey') {
        if (_.isArray(array[0][key])) {
          var arrayIndex = 0;
          for (var i = 0; i < array.length; i++) {
            //Check if array is empty for initial entries to prevent headers from being excluded
            if (array[i][key].length > 0) {
              arrayIndex = i;
              break;
            }
          }
          if (typeof array[arrayIndex][key][0] == 'string') {
            key = ctrl.formatColumnValue(key.replace(/([A-Z])/g, ' $1').trim());
            string = string.concat(key + ',');
          } else {
            arrayProps.push(array[arrayIndex][key]);
          }
        } else {
          key = ctrl.formatColumnValue(key.replace(/([A-Z])/g, ' $1').trim());
          string = string.concat(key + ',');
        }
      }
    }
    if (_.isUndefined(arrayProps) || _.isEmpty(arrayProps)) {
      if (!skipEndLine) {
        string = string.substring(0, string.length - 1);
        string = string + '\r\n';
      }
      return string;
    } else {
      _.each(arrayProps, function (prop) {
        string = string + ctrl.getArrayKeys(prop, true);
      });
      return string.includes('\r\n') ? string : string + '\r\n';
    }
  };

  // Do not compare to report Id without checking if its a custom report first. Otherwise custom report export will break.
  // TODO: Write function to handle report comparisons so this custom report comparison does not always have to be added.
  ctrl.convertArrayToCSV = function (array) {
    var returnArray = [];
    _.each(array, function (item) {
      if (typeof item == 'string') {
        item = ctrl.formatColumnValue(item);
        returnArray.push(item + '\r\n');
        return returnArray;
      } else {
        var arrayProp = [];
        var string = '';
        for (var prop in item) {
          if (_.has(item, prop) && prop !== '$$hashKey') {
            if (_.isArray(item[prop])) {
              if (
                !$scope.isCustomReport &&
                prop === 'Transactions' &&
                _.isEmpty(item[prop])
              ) {
                if (
                  $scope.reportId ===
                  $scope.$parent.reportIds.NetProductionByProviderReportId
                ) {
                  string = string.concat(',,,,,,,,,0,0,0,');
                } else if (
                  $scope.reportId ===
                  $scope.$parent.reportIds.NetCollectionByProviderReportId
                ) {
                  string = string.concat(',,,,,0,0,0,');
                }
              } else {
                arrayProp.push(item[prop]);
              }
            } else {
              var temp = item[prop];
              temp = ctrl.formatColumnValue(temp);
              string = string.concat(temp + ',');
            }
          }
        }
        if (_.isUndefined(arrayProp) || _.isEmpty(arrayProp)) {
          string = string.substring(0, string.length - 1);
          returnArray.push(string + '\r\n');          
        } else {
          if (arrayProp.length == 2) {
            var tempArray = [];
            tempArray.push(ctrl.convertArrayToCSV(arrayProp[0]));
            tempArray.push(ctrl.convertArrayToCSV(arrayProp[1]));
            if (_.isEmpty(tempArray[0])) {
              if (_.isEmpty(tempArray[1])) {
                returnArray.push(
                  string + ctrl.GetEmptyColumns(true, true) + '\r\n'
                );
              } else {
                _.each(tempArray[1], function (val2) {
                  returnArray.push(
                    string + ctrl.GetEmptyColumns(true, false) + val2
                  );
                });
              }
            } else if (_.isEmpty(tempArray[1])) {
              _.each(tempArray[0], function (val1) {
                val1 = val1.replace('\r\n', ',');
                returnArray.push(
                  string + val1 + ctrl.GetEmptyColumns(false, true) + '\r\n'
                );
              });
            } else {
              _.each(tempArray[0], function (val1) {
                val1 = val1.replace('\r\n', ',');
                _.each(tempArray[1], function (val2) {
                  returnArray.push(string + val1 + val2);
                });
              });
            }
          } else {
            var stringArray = ctrl.convertArrayToCSV(arrayProp[0]);
            if (stringArray.length < 1) {
              returnArray.push(string);
            }
            _.each(stringArray, function (value) {
              returnArray.push(string + value);
            });
          }
        }
      }
    });
    return returnArray;
  };  
  ctrl.AddNonArrayPropToCSV = function (csvString) {
    var valueString = '';
    var keyString = '';
    for (var prop in exportData) {
      if (_.has(exportData, prop)) {
        if (
          !_.isArray(exportData[prop]) &&
          prop !== 'GeneratedAtDateTime' &&
          prop !== 'GeneratedByUserCode' &&
          prop !== 'LocationOrPracticeEmail' &&
          prop !== 'LocationOrPracticeName' &&
          prop !== 'LocationOrPracticePhone' &&
          prop !== 'ReportTitle'
        ) {
          keyString = keyString.concat(prop + ',');
          valueString = valueString.concat(exportData[prop] + ',');
        }
      }
    }
    var csvStringArray = csvString.split('\r\n');
    csvString = '';
    _.each(csvStringArray, function (string) {
      if (string !== '') {
        string =
          string === csvStringArray[0]
            ? keyString + string + '\r\n'
            : valueString + string + '\r\n';
        csvString = csvString.concat(string);
      }
    });
    return csvString;
  };

  ctrl.ConstructHeaderString = function (headerArray) {
    var csvString = '';
    if (!_.isEmpty(headerArray)) {
      _.each(headerArray, function (item) {
        csvString =
          csvString !== ''
            ? csvString.concat(',' + localize.getLocalizedString(item))
            : localize.getLocalizedString(item);
      });
    }
    return csvString + '\r\n';
  };

  //#Export report to csv
  ctrl.exportCSV = function () {
    $scope.$parent.isExport = true;
    if (typeof $scope.getAllData === 'function') {
        Promise.resolve($scope.getAllData()).then(ctrl.exportCSVAllDataComplete).catch(error => {
            console.error('Error while fetching data:', error);
        });
    } else {
        console.error('Error: $scope.getAllData is not a valid function.');
    }
  };

    ctrl.exportCSVAllDataComplete = function () {
    // iterate over filtered report
    var csvString = '';
    var array = [];
    exportData = angular.copy($scope.$parent.data);
    if (!$scope.isCustomReport) {
      switch ($scope.reportId) {
        case $scope.$parent.reportIds.PendingClaimsReportId:
          case $scope.$parent.reportIds.PendingClaimsBetaReportId:
          _.each(exportData.Carriers, function (car) {
            _.each(car.Patients, function (pat) {
              _.each(pat.Claims, function (claim) {
                claim.PolicyHolderId =
                  claim.PolicyHolderId !== '' && !_.isNull(claim.PolicyHolderId)
                    ? '="' + claim.PolicyHolderId + '"'
                    : claim.PolicyHolderId;
              });
            });
          });
          break;

          case $scope.$parent.reportIds.PatientsByFeeScheduleReportId:
          case $scope.$parent.reportIds.PatientsByFeeScheduleBetaReportId:

          _.each(exportData.FeeSchedules, function (feeSchedule) {
            if (exportData.IsBenefitPlanIncluded) {
              delete feeSchedule.Patients;
            } else {
              delete feeSchedule.BenefitPlans;
            }
          });
          break;
        case $scope.$parent.reportIds.ServiceTransactionsWithDiscountsReportId:
          case $scope.$parent.reportIds.ServiceTransactionsWithDiscountsBetaReportId:
          var totalDiscounts = 0;
          _.each(exportData.Locations, function (location) {
            totalDiscounts += location.TotalDiscount;
            if (
              $scope.$parent.filterModels.ReportView.FilterString != 'Summary'
            )
              delete location.Types;
            _.each(location.Dates, function (date) {
              _.each(date.Transactions, function (transaction) {
                transaction.Tooth = ctrl.formatTooth(transaction.Tooth);
              });
            });
          });
              exportData.TotalDiscounts = totalDiscounts;
          break;
        case $scope.$parent.reportIds.PatientsByFlagsReportId:
          case $scope.$parent.reportIds.PatientByFlagsBetaReportId:
          exportData.Locations = exportData.Locations.map(function (location) {
            return {
              Location: location.Name,
              Flags: location.Flags.concat(location.CustomFlags),
            };
          });
          break;
        case $scope.$parent.reportIds.PatientAnalysisReportId:
        case $scope.$parent.reportIds.PatientAnalysisBetaReportId:
          exportData.Locations = _.map(
            exportData.Locations,
            function (location) {
              var genderHeader = [{ Name: 'Gender' }];
              return {
                Location: location.Name,
                Categories: genderHeader
                  .concat(
                    location.Genders,
                    { Name: 'Ages' },
                    location.Ages,
                    { Name: 'Status' },
                    location.Statuses,
                    { Name: 'Last Service Date' },
                    location.LastServiceDates,
                    { Name: 'New Patients' },
                    location.NewPatients,
                    { Name: 'Preventive Care' },
                    location.PreventiveCare,
                    { Name: 'Appointments' },
                    location.FutureAppointments,
                    { Name: 'Insurance' },
                    location.Insurance,
                    { Name: 'Active Patients By Top Ten Zip Codes' },
                    _.map(location.ZipCodes, function (zipCode) {
                      return {
                        Name: zipCode.ZipCode + ' - ' + zipCode.City,
                        NumberActive: zipCode.Number,
                        PercentOfActive: zipCode.Percent,
                      };
                    })
                  )
                  .map(function (category) {
                    return {
                      Category: '="' + category.Name + '"',
                      NumberActive: category.NumberActive,
                      PercentOfActive:
                        category.PercentOfActive !== null &&
                        category.PercentOfActive !== undefined &&
                        !category.Name.endsWith('Patients')
                          ? $filter('percentage')(category.PercentOfActive)
                          : null,
                    };
                  }),
              };
            }
          );
          break;
        case $scope.$parent.reportIds.FeeExceptionsReportId:
        case $scope.$parent.reportIds.FeeExceptionsBetaReportId:
          if (
            !_.isUndefined($scope.$parent.filterModels.ReportView) &&
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            delete exportData.Dates;
          } else {
            _.each(exportData.Dates, function (date) {
              _.each(date.Transactions, function (item) {
                item.Tooth = ctrl.formatTooth(item.Tooth);
              });
            });
          }
          break;
        case $scope.$parent.reportIds.ProposedTreatmentReportId:
        case $scope.$parent.reportIds.ProposedTreatmentBetaReportId:
          _.each(exportData.Locations, function (loc) {
            _.each(loc.Patients, function (pat) {
              _.each(pat.Plans, function (plan) {
                _.each(plan.Services, function (serv) {
                  serv.ToothArea = ctrl.formatTooth(serv.ToothArea);
                });
              });
            });
          });
          break;
        case $scope.$parent.reportIds.ServiceHistoryReportId:
          case $scope.$parent.reportIds.ServiceHistoryBetaReportId:
          _.each(exportData.Transactions, function (transaction) {
            transaction.Tooth = ctrl.formatTooth(transaction.Tooth);
          });
          break;
        case $scope.$parent.reportIds.DeletedTransactionsReportId:
          case $scope.$parent.reportIds.DeletedTransactionsBetaReportId:
          if (
            !_.isUndefined($scope.$parent.filterModels.ReportView) &&
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            delete exportData.Dates;
          } else {
            _.each(exportData.Dates, function (date) {
              _.each(date.Transactions, function (transaction) {
                transaction.Tooth = ctrl.formatTooth(transaction.Tooth);
              });
            });
          }
          break;
        case $scope.$parent.reportIds.ProviderServiceHistoryReportId:
        case $scope.$parent.reportIds.ProviderServiceHistoryBetaReportId:
          _.each(exportData.Providers, function (Provider) {
            _.each(Provider.Patients, function (Patient) {
              _.each(Patient.Transactions, function (transaction) {
                transaction.Tooth = ctrl.formatTooth(transaction.Tooth);
              });
            });
          });
          break;
         case $scope.$parent.reportIds.NewPatientsSeenReportId:
          case $scope.$parent.reportIds.NewPatientSeenReportId:
          _.each(exportData.Locations, function (location) {
            _.each(location.Patients, function (Patient) {
              Patient.Tooth = ctrl.formatTooth(Patient.Tooth);
            });
          });
          break;
        case $scope.$parent.reportIds.NetProductionByProviderReportId:
          _.each(exportData.ProvidersAlternate, function (provider) {
            _.each(provider.Transactions, function (transaction) {
              transaction.ToothArea = ctrl.formatTooth(transaction.ToothArea);
            });
          });
          break;
        case $scope.$parent.reportIds.PerformanceByProviderDetailsReportId:
          _.each(exportData.ProviderDetails, function (provider) {
            _.each(provider.Transactions, function (transaction) {
              transaction.ToothArea = ctrl.formatTooth(transaction.ToothArea);
            });
          });
          break;
          case $scope.$parent.reportIds.ProductionExceptionsReportId:
          case $scope.$parent.reportIds.ProductionExceptionsBetaReportId:
          _.each(exportData.ProviderDetails, function (provider) {
            _.each(provider.Patients, function (Patient) {
              _.each(Patient.Transactions, function (transaction) {
                transaction.Tooth = ctrl.formatTooth(transaction.Tooth);
              });
            });
          });
          break;
        case $scope.$parent.reportIds.PatientsWithPendingEncountersReportId:
        case $scope.$parent.reportIds.PatientsWithPendingEncountersBetaReportId:
          _.each(exportData.DateLists, function (dates) {
            _.each(dates.Patients, function (Patient) {
              _.each(Patient.Encounters, function (encounter) {
                _.each(encounter.Transactions, function (transaction) {
                  transaction.Tooth = ctrl.formatTooth(transaction.Tooth);
                });
              });
            });
          });
          break;
        case $scope.$parent.reportIds.TreatmentPlanPerformanceBetaReportId:
        case $scope.$parent.reportIds.TreatmentPlanPerformanceReportId:
          _.each(exportData.Patients, function (patient) {
            _.each(patient.TreatmentPlans, function (plan) {
              _.each(plan.Stages, function (stage) {
                _.each(stage.Services, function (service) {
                  service.ToothArea = ctrl.formatTooth(service.ToothArea);
                });
              });
            });
          });
          break;
        case $scope.$parent.reportIds
          .TreatmentPlanProviderReconciliationReportId:
          case $scope.$parent.reportIds
            .TreatmentPlanProviderReconciliationBetaReportId:
          _.each(exportData.Providers, function (provider) {
            _.each(provider.Patients, function (patient) {
              _.each(patient.TreatmentPlans, function (plan) {
                _.each(plan.Locations, function (location) {
                  _.each(location.Services, function (service) {
                    service.Tooth = ctrl.formatTooth(service.Tooth);
                  });
                });
              });
            });
          });
          break;
        case $scope.$parent.reportIds.CollectionsByServiceDateReportId:
          case $scope.$parent.reportIds.CollectionsByServiceDateBetaReportId:
          _.each(exportData.Locations, function (location) {
            _.each(location.Providers, function (provider) {
              _.each(provider.Collections, function (collection) {
                collection.Tooth = ctrl.formatTooth(collection.Tooth);
              });
            });
          });
          break;
        case $scope.$parent.reportIds.EncountersByFeeScheduleReportId:
          _.each(exportData.Locations, function (location) {
            _.each(location.FeeSchedules, function (feeSchedule) {
              _.each(feeSchedule.Dates, function (date) {
                _.each(date.Patients, function (patient) {
                  patient.PolicyHolderId =
                    patient.PolicyHolderId !== '' &&
                    !_.isNull(patient.PolicyHolderId)
                      ? '="' + patient.PolicyHolderId + '"'
                      : patient.PolicyHolderId;
                  _.each(patient.Services, function (service) {
                    service.Tooth = ctrl.formatTooth(service.Tooth);
                  });
                });
              });
            });
          });
          break;
        case $scope.$parent.reportIds.BenefitPlansbyAdjustmentTypeReportId:
          case $scope.$parent.reportIds.BenefitPlansbyAdjustmentTypeBetaReportId:
        case $scope.$parent.reportIds.BenefitPlansbyInsurancePaymentType:
          _.each(exportData.Benefits, function (benefit) {
            _.each(benefit.BenefitsPlan, function (code) {
              code.PlanGroupNumber =
                code.PlanGroupNumber !== '' && !_.isNull(code.PlanGroupNumber)
                  ? '="' + code.PlanGroupNumber + '"'
                  : 'N/A';
            });
          });
          break;
        case $scope.$parent.reportIds.AppointmentsReportId:
        case $scope.$parent.reportIds.AppointmentsBetaReportId:
          _.each(exportData.Appointments, function (appointment) {
            _.each(appointment.Codes, function (code) {
              code.Tooth = ctrl.formatTooth(code.Tooth);
            });
          });
              break;
        case $scope.$parent.reportIds.AccountWithOffsettingProviderBalancesBetaReportId:
        case $scope.$parent.reportIds
          .AccountsWithOffsettingProviderBalancesReportId:
          _.each(exportData.ResponsibleParties, function (res) {
            _.each(res.ProviderLocationTotal, function (item) {
              item.AccountTotal = res.AccountTotal;
            });
          });
          break;
        case $scope.$parent.reportIds.CreditDistributionHistoryReportId:
        case $scope.$parent.reportIds.CreditDistributionHistoryBetaReportId:
          _.each(
            exportData.creditDistributionHistoryReportDto,
            function (transaction) {
              transaction.Deleted = transaction.IsDeleted ? 'Yes' : 'No';
              _.each(transaction.AppliedToTransactions, function (Patient) {
                Patient.Tooth = ctrl.formatTooth(Patient.Tooth);
                Patient.StillDistributed = Patient.IsDeleted ? 'No' : 'Yes';
              });
            }
          );
          break;
        case $scope.$parent.reportIds.PotentialDuplicatePatientsReportId:
          _.each(exportData.Patients, function (transaction) {
            _.each(transaction.Patients, function (Patient) {
              Patient.Address =
                Patient.Address.trim() !== '' ? Patient.Address : 'N/A';
              Patient.RowNumber = ' ';
            });
          });
          break;
        case $scope.$parent.reportIds.CollectionsAtCheckoutReportId:
          case $scope.$parent.reportIds.CollectionAtCheckoutBetaReportId:
          if (
            !_.isUndefined($scope.$parent.filterModels.ReportView) &&
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            _.each(exportData.Locations, function (loc) {
              loc.Transactiontype = [
                {
                  AccountPayments: 'AccountPayments',
                  AccountPaymentsValue: loc.AccountPayments,
                },
                {
                  NegativeAdjustments: 'NegativeAdjustments',
                  NegativeAdjustmentsValue: loc.NegativeAdjustments,
                },
              ];
            });
          }
          break;              
          case $scope.$parent.reportIds.ServiceCodeProductivityByProviderReportId:
              if (
                  !_.isUndefined($scope.$parent.filterModels.ReportView) &&
                  $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
              ) {
                  var providers = [];
                  _.each(exportData.ProviderDetails, function (pov) {
                      var provider = [];

                      pov.ServiceTypes = [];
                      provider.Provider = pov.Provider;
                      provider.ServiceType = " ";
                      provider.ServiceCode = " ";
                      provider.CtdCode = " ";
                      provider.Description = " ";
                      provider.Number = pov.Number;
                      provider.Fee = pov.Fee;
                      provider.AllowedAmount = pov.AllowedAmount;
                      providers.push(provider);
                  });

                  exportData.ProviderDetails = providers;
              }
              break;

        case $scope.$parent.reportIds.EncountersByCarrierReportId:
        case $scope.$parent.reportIds.EncountersByCarrierBetaReportId:
          _.each(exportData.Locations, function (location) {
            _.each(location.Carriers, function (carrier) {
              _.each(carrier.Dates, function (date) {
                _.each(date.Patients, function (patient) {
                  patient.PolicyHolderId =
                    patient.PolicyHolderId !== '' &&
                    !_.isNull(patient.PolicyHolderId)
                      ? '="' + patient.PolicyHolderId + '"'
                      : patient.PolicyHolderId;
                  _.each(patient.Services, function (service) {
                    service.Tooth = ctrl.formatTooth(service.Tooth);
                  });
                });
              });
            });
          });
          break;
        case $scope.$parent.reportIds.PaymentLocationReconciliationReportId:
        case $scope.$parent.reportIds.PaymentLocationReconciliationBetaReportId:
          _.each(exportData.Locations, function (location) {
            _.each(location.PaymentTypes, function (paymentType) {
              _.each(paymentType.Payments, function (payment) {
                _.each(
                  payment.DistributedAmounts,
                  function (distributedAmount) {}
                );
              });
            });
          });
          break;
        case $scope.$parent.reportIds.EncountersByPaymentReportId:
          _.each(exportData.Locations, function (location) {
            _.each(location.Carriers, function (carrier) {
              _.each(carrier.Dates, function (date) {
                _.each(date.Patients, function (patient) {
                  patient.PolicyHolderId =
                    patient.PolicyHolderId !== '' &&
                    !_.isNull(patient.PolicyHolderId)
                      ? '="' + patient.PolicyHolderId + '"'
                      : patient.PolicyHolderId;
                  _.each(patient.Services, function (service) {
                    service.Tooth = ctrl.formatTooth(service.Tooth);
                  });
                });
              });
            });
          });
              break;
          case $scope.$parent.reportIds.BenefitPlansByFeeScheduleBetaReportId:
              _.each(exportData.feeSchedulesBenefitPlans, function (feeschedule) {
                  _.each(feeschedule.benefitPlans, function (benefitPlan) {
                      if (!benefitPlan.hasOwnProperty('planGroupNumber')) {
                          benefitPlan.planGroupNumber = null;
                      }
                  });
              });
          case $scope.$parent.reportIds.NewPatientsSeenBetaReportId:
              _.each(exportData.locationPatients, function (location) {
                  _.each(location.patients, function (patient) {
                      patient.serviceTransactions[0].tooth = ctrl.formatTooth(patient.serviceTransactions[0].tooth );
                  });                
              });
              break;
          case $scope.$parent.reportIds.ServiceCodeByServiceTypeProductivityBetaReportId:
              _.each(exportData.Locations, function (location) {
                  _.each(location.ServiceTypes, function (serviceType) {
                      _.each(serviceType.Details, function (detail) {
                          detail.TaxType = ctrl.formatTaxServiceType(detail.TaxableServiceTypeId);
                      });

                  });
              });
              break;
      }
    }

    _.each(exportData, function (item) {
      if (_.isArray(item)) {
        if (!$scope.isCustomReport) {
          item = ctrl.checkIfTemplate(item);
        }
        if (
          !$scope.isCustomReport &&
         (($scope.reportId ===
            $scope.$parent.reportIds.PeriodReconciliationReportId) || ($scope.reportId ===$scope.$parent.reportIds.PeriodReconciliationBetaReportId)) &&
          !_.isEmpty(item)
        ) {
          if (!_.isEmpty(item[0].PostedDates)) {
            csvString = 'Location,' + ctrl.getArrayKeys(item[0].PostedDates);
          } else if (!_.isEmpty(item[0].EditedDates)) {
            csvString = 'Location,' + ctrl.getArrayKeys(item[0].EditedDates);
          } else {
            csvString = 'Location,' + ctrl.getArrayKeys(item[0].DeletedDates);
          }
          array = [];
          _.each(item, function (loc) {
            array = array.concat(
              ctrl.formatPeriodReconciliationInnerArray(
                loc,
                'PostedDates',
                'Posted Today',
                csvString
              )
            );
            array = array.concat(
              ctrl.formatPeriodReconciliationInnerArray(
                loc,
                'EditedDates',
                'Edited Today',
                csvString
              )
            );
            array = array.concat(
              ctrl.formatPeriodReconciliationInnerArray(
                loc,
                'DeletedDates',
                'Deleted Today',
                csvString
              )
            );
          });
          csvString = '';
        } 
        
        else if (
          !$scope.isCustomReport &&
          ($scope.reportId ===
            $scope.$parent.reportIds.NetProductionByProviderReportId ||
            $scope.reportId ===
              $scope.$parent.reportIds.NetCollectionByProviderReportId ||
            $scope.reportId ===
              $scope.$parent.reportIds.PatientAnalysisReportIds ||
            $scope.reportId === $scope.$parent.reportIds.AppointmentsReportId ||
            $scope.reportId ===
              $scope.$parent.reportIds.AppointmentsBetaReportId ||
            (!_.isUndefined($scope.$parent.filterModels.ReportView) &&
              $scope.$parent.filterModels.ReportView.FilterString ===
                'Summary' &&
             ( $scope.reportId !==
                        $scope.$parent.reportIds.ReceivablesByProviderReportId || 
                $scope.reportId !==
                        $scope.$parent.reportIds.ReceivablesByProviderBetaReportId
             )))
        ) {
          csvString = ''; // hard-coded later
          array = ctrl.convertArrayToCSV(item);
        } else {
            if ($scope.exportNewApi === true) {
                if ($scope.reportId == $scope.$parent.reportIds.BenefitPlansByFeeScheduleBetaReportId) {
                    csvString = '"Fee Schedule","Benefit Plan","Plan Group Number"\r\n';
                }
                else {
                    csvString = ctrl.getArrayKeys_V2(item[0]);
                }
            array = ctrl.convertArrayToCSV_V2(item);
          } else {
            csvString = ctrl.getArrayKeys(item, false);
            array = ctrl.convertArrayToCSV(item);
          }
        }
      }
    });
    if (!$scope.isCustomReport) {
      switch ($scope.reportId) {
        case $scope.$parent.reportIds.PerformanceByProviderSummaryReportId:
          array = ctrl.monetizeFinancialReport(
            array,
            [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            ctrl.createBasicTotalsString(
              'Current Totals',
              1,
              [2, 3, 4, 5],
              [1, 2, 3, 4, 5]
            ) +
              ctrl.createBasicTotalsString(
                'MTD Totals',
                6,
                [6, 7, 8],
                [6, 7, 8]
              ) +
              ctrl.createBasicTotalsString(
                'YTD Totals',
                9,
                [9, 10, 11],
                [9, 10, 11]
              )
          );
          break;

        case $scope.$parent.reportIds.PotentialDuplicatePatientsReportId:
          array = ctrl.removeColumnFromArray(array, [0, 1]);
          csvString = ctrl.removeColumnFromString(csvString, [0, 1]);
          csvString = ctrl.ConstructHeaderString([
            'Patient Name',
            'Patient ID',
            'Preferred Name',
            'DOB',
            'Address',
            'Phone',
            'Phone Number Type',
            'Email',
            'Primary Location',
            'Responsible Party',
            'Status',
          ]);
          break;
        case $scope.$parent.reportIds.ServiceCodeFeesByLocationReportId:
          case $scope.$parent.reportIds.ServiceCodeFeesByLocationBetaReportId:
          array = ctrl.monetizeFinancialReport(
            array,
            [5],
            ctrl.createBasicTotalsString('Total Service Codes', 1, [], [1])
          );
          break;
        case $scope.$parent.reportIds.ServiceCodeByServiceTypeProductivityReportId:          
        case $scope.$parent.reportIds.ServiceCodeByServicesTypeProductivityReportId:          
          array = ctrl.removeColumnFromArray(array, [1, 2, 3, 4]);
          array = ctrl.monetizeFinancialReport(
            array,
            [5, 7, 8, 10, 11],
            ctrl.createBasicTotalsString('MTD Totals', 6, [7], [1, 2]) +
              ctrl.createBasicTotalsString('YTD Totals', 9, [10], [3, 4])
          );
          csvString = ctrl.removeColumnFromString(csvString, [1, 2, 3, 4]);
              break;
          case $scope.$parent.reportIds.ServiceCodeByServiceTypeProductivityBetaReportId:
              array = ctrl.removeColumnFromArray(array, [1, 2, 3, 4, 11]);
              array = ctrl.monetizeFinancialReport(
                  array,
                  [5, 6, 7],
                  ''
              );
              csvString = ctrl.removeColumnFromString(csvString, [1, 2, 3, 4, 11]);
              array = ctrl.changeColumnSequenceInArray(array, [0, 1, 2, 3, 4, 5, 6, 8, 7]);
              csvString = ctrl.changeColumnSequenceInString(csvString, [0, 1, 2, 3, 4, 5, 6, 8, 7]);
              break;
        case $scope.$parent.reportIds.PerformanceByProviderDetailsReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 3]);
          array = ctrl.monetizeFinancialReport(
            array,
            [9, 10, 11],
            ctrl.createBasicTotalsString(
              'Current Totals',
              9,
              [9, 10, 11],
              [1, 2, 3]
            )
          );
          csvString = ctrl.ConstructHeaderString([
            'Provider',
            'Date',
            'Patient',
            'Patient Groups',
            'Transaction Type',
            'Description',
            'Original Transaction Date (voids)',
            'Tooth-Area',
            'Location',
            'Production',
            'Collection',
            'Adjustments',
          ]);
          // csvString = ctrl.removeColumnFromString(csvString, [1, 2, 3, 10, 11]);
          break;
        case $scope.$parent.reportIds.DaySheetReportId:
          array = ctrl.monetizeFinancialReport(
            array,
            [1, 2, 3, 4],
            ctrl.createBasicTotalsString(
              'Totals',
              1,
              [1, 2, 3, 4],
              [1, 2, 3, 4]
            )
          );
              break;
          case $scope.$parent.reportIds.FeeScheduleAnalysisByCarrierBetaReportId:
              array = ctrl.monetizeFinancialReport(array, [2, 3, 4, 13, 14, 15, 18, 19, 20, 22, 23, 25, 26, 27],"");
              break;
        case $scope.$parent.reportIds.ServiceCodeProductivityByProviderReportId:
        case $scope.$parent.reportIds
              .ServiceCodeProductivityByProviderBetaReportId:

              if (
                  !_.isUndefined($scope.$parent.filterModels.ReportView) &&
                  $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
              ) {
                 array = ctrl.monetizeFinancialReport(
                      array,
                      [6, 7],
                      ctrl.createBasicTotalsString('Report Totals', 5, [6, 7], [1, 2, 3])
                  );
                  
              }
              else {
                  array = ctrl.removeColumnFromArray(array, [1, 2, 3]);
                  array = ctrl.monetizeFinancialReport(
                      array,
                      [6, 7],
                      ctrl.createBasicTotalsString('Report Totals', 5, [6, 7], [1, 2, 3])
                  );
              }
              csvString = ctrl.ConstructHeaderString([
                  'Provider',
                  'Service Code',
                  'CDT Code',
                  'Service Type',
                  'Description',
                  'Number',
                  'Location Fee',
                  'Allowed Amount',
              ]);
              
          break;
        case $scope.$parent.reportIds.NetProductionByProviderReportId:
        case $scope.$parent.reportIds.NetProductionByProviderBetaReportId:
          if (
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            array = ctrl.removeColumnFromArray(
              array,
              [1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
            );
            csvString = ctrl.ConstructHeaderString([
              'Provider',
              'Production',
              'Adjustments',
              'Net Production',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [1, 2, 3],
              ctrl.createBasicTotalsString(
                'Report Totals',
                1,
                [1, 2, 3],
                [1, 2, 3]
              )
            );
          } else {
            array = ctrl.removeColumnFromArray(
              array,
              [1, 2, 3, 4, 5, 12, 13, 19]
            );
            array = ctrl.monetizeFinancialReport(
              array,
              [9, 10, 11],
              ctrl.createBasicTotalsString('Totals', 9, [9, 10, 11], [1, 2, 3])
            );
            csvString = ctrl.ConstructHeaderString([
              'Provider',
              'Date',
              'Patient',
              'Description',
              'AppliedTo',
              'AppliedToDate',
              'Original Transaction Date (voids)',
              'Tooth-Area',
              'Location',
              'Production',
              'Adjustments',
              'Net Production',
            ]);
          }
          break;
        case $scope.$parent.reportIds.AdjustmentsByProviderReportId:
          if (
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            csvString = ctrl.ConstructHeaderString(['Provider', 'Amount']);
            array = ctrl.monetizeFinancialReport(
              array,
              [1],
              ctrl.createBasicTotalsString('Report Totals', 1, [1], [1])
            );
          } else {
            array = ctrl.removeColumnFromArray(array, [1]);
            array = ctrl.monetizeFinancialReport(
              array,
              [9],
              ctrl.createBasicTotalsString('Totals', 9, [9], [1])
            );
            csvString = ctrl.removeColumnFromString(csvString, [1]);
            csvString = ctrl.ConstructHeaderString([
              'Provider',
              'Date',
              'Patient',
              'Positive Negative',
              'Adjustment Type',
              'Location',
              'Description',
              'Impaction',
              'Original Transaction Date (voids)',
              'Amount',
            ]);
          }
          break;

        case $scope.$parent.reportIds.NetCollectionByProviderReportId:
          if (
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            csvString = ctrl.ConstructHeaderString([
              'Provider',
              'Collection',
              'Adjustments',
              'Net Collection',
            ]);
            array = ctrl.removeColumnFromArray(
              array,
              [4, 5, 6, 7, 8, 9, 10, 11]
            );
            array = ctrl.monetizeFinancialReport(
              array,
              [1, 2, 3],
              ctrl.createBasicTotalsString('Totals', 1, [1, 2, 3], [1, 2, 3])
            );
          } else {
            array = ctrl.removeColumnFromArray(array, [1, 2, 3, 4]);
            array = ctrl.monetizeFinancialReport(
              array,
              [6, 7, 8],
              ctrl.createBasicTotalsString('Totals', 6, [6, 7, 8], [1, 2, 3])
            );
            csvString = ctrl.ConstructHeaderString([
              'Provider',
              'Date',
              'Patient',
              'Description',
              'Location',
              'Original Transaction Date (voids)',
              'Collection',
              'Adjustments',
              'Net Collection',
            ]);
          }
          break;
        case $scope.$parent.reportIds.ServiceCodeFeesByFeeScheduleReportId:
          array = ctrl.monetizeColumnInArray(array, [3, 5]);
          break;
        case $scope.$parent.reportIds.FeeExceptionsReportId:
        case $scope.$parent.reportIds.FeeExceptionsBetaReportId:
          if (
            !_.isUndefined($scope.$parent.filterModels.ReportView) &&
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            var reportTotalSummary =
              '\rReport Totals,,,' +
              ctrl.createBasicTotalsString('Transactions', 2, [4], [1]) +
              ctrl.createBasicTotalsString('Location Fee', 2, [2], [2]) +
              ctrl.createBasicTotalsString('Charged Fee', 2, [2], [3]) +
              ctrl.createBasicTotalsString('Difference', 2, [2], [4]);
            array = ctrl.monetizeFinancialReport(
              array,
              [2],
              reportTotalSummary
            );
          } else {
            array = ctrl.monetizeFinancialReport(
              array,
              [8, 9, 10],
              ctrl.createBasicTotalsString(
                'Report Totals',
                7,
                [8, 9, 10],
                [1, 2, 3, 4]
              )
            );
          }

          break;
        case $scope.$parent.reportIds.ServiceHistoryReportId:
          case $scope.$parent.reportIds.ServiceHistoryBetaReportId:
          array = ctrl.monetizeFinancialReport(
            array,
            [5],
            ctrl.createBasicTotalsString('Report Totals', 5, [5], [1])
          );
          break;
          case $scope.$parent.reportIds.ProductionExceptionsReportId:
          case $scope.$parent.reportIds.ProductionExceptionsBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1]);
          array = ctrl.monetizeFinancialReport(
            array,
            [9],
            ctrl.createBasicTotalsString('Report Totals', 9, [9], [1])
          );
          csvString = ctrl.removeColumnFromString(csvString, [1]);
          break;
        case $scope.$parent.reportIds.ProviderServiceHistoryReportId:
          case $scope.$parent.reportIds.ProviderServiceHistoryBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 4, 5]);
          array = ctrl.monetizeFinancialReport(
            array,
            [7, 8],
            ctrl.createBasicTotalsString('Report Totals', 7, [7, 8], [1, 2])
          );
          csvString = ctrl.removeColumnFromString(csvString, [1, 2, 4, 5]);
          break;
        case $scope.$parent.reportIds.UnassignedUnappliedCreditsReportId:
          array = ctrl.removeColumnFromArray(array, [1]);
          array = ctrl.monetizeColumnInArray(array, [7, 8]);
          csvString = ctrl.removeColumnFromString(csvString, [1]);
          break;
        case $scope.$parent.reportIds.ServiceTypeProductivityReportId:
        case $scope.$parent.reportIds.ServiceTypesProductivityReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 3, 4]);
          array = ctrl.addPercentToColumnInArray(array, [4, 7]);
          array = ctrl.monetizeFinancialReport(
            array,
            [3, 6],
            ctrl.createBasicTotalsString('MTD Totals', 2, [3], [1, 2]) +
              ctrl.createBasicTotalsString('YTD Totals', 5, [6], [3, 4])
          );
          csvString = ctrl.removeColumnFromString(csvString, [1, 2, 3, 4]);
          break;
        case $scope.$parent.reportIds.DeletedTransactionsReportId:
          case $scope.$parent.reportIds.DeletedTransactionsBetaReportId:
          if (
            !_.isUndefined($scope.$parent.filterModels.ReportView) &&
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            array = ctrl.monetizeColumnInArray(array, [10]);
            var reportTotalSummary =
              '\r\nDeleted Totals,,Amount,' +
              ctrl.createBasicTotalsString('Account Payments', 2, [2], [1]) +
              ctrl.createBasicTotalsString('Insurance Payments', 2, [2], [2]) +
              ctrl.createBasicTotalsString(
                'Negative Adjustments',
                2,
                [2],
                [3]
              ) +
              ctrl.createBasicTotalsString(
                'Positive Adjustments',
                2,
                [2],
                [4]
              ) +
              ctrl.createBasicTotalsString('Finance Charges', 2, [2], [5]) +
              ctrl.createBasicTotalsString('Services', 2, [2], [6]);
            array = ctrl.monetizeFinancialReport(
              array,
              [2],
              reportTotalSummary
            );
          } else {
            array = ctrl.monetizeColumnInArray(array, [10]);
            var reportTotalSummary =
              '\r\nDeleted Totals,,,,,,' +
              ctrl.createBasicTotalsString('Account Payments', 9, [9], [1]) +
              ctrl.createBasicTotalsString('Insurance Payments', 9, [9], [2]) +
              ctrl.createBasicTotalsString(
                'Negative Adjustments',
                9,
                [9],
                [3]
              ) +
              ctrl.createBasicTotalsString(
                'Positive Adjustments',
                9,
                [9],
                [4]
              ) +
              ctrl.createBasicTotalsString('Finance Charges', 9, [9], [5]) +
              ctrl.createBasicTotalsString('Services', 9, [9], [6]);
            array = ctrl.monetizeFinancialReport(
              array,
              [9],
              reportTotalSummary
            );
          }
          break;
        case $scope.$parent.reportIds.PatientsWithPendingEncountersReportId:
          array = ctrl.removeColumnFromArray(array, [3, 4, 5, 6]);
          csvString = ctrl.removeColumnFromString(csvString, [3, 4, 5, 6]);
          array = ctrl.monetizeFinancialReport(
            array,
            [8, 9, 10, 11],
            ctrl.createBasicTotalsString(
              'Report Totals',
              8,
              [8, 9, 10, 11],
              [1, 2, 3, 4]
            )
          );
          break;
        case $scope.$parent.reportIds.FeeScheduleMasterReportId:
          case $scope.$parent.reportIds.FeeSchedulesMasterReportId:
          array = ctrl.monetizeColumnInArray(array, [4, 5]);
          array = ctrl.addPercentToColumnInArray(array, [6]);
          break;
        case $scope.$parent.reportIds.ActivityLogReportId:
          case $scope.$parent.reportIds.ActivityLogBetaReportId:
          array = ctrl.addAreaToColumnInArray(array, [4]); // 4: Area
          array = ctrl.addTypeToColumnInArray(array, [5]); // 5: Type
          array = ctrl.addActionToColumnInArray(array, [6]); // 6: Action
          array = ctrl.monetizeColumnInArray(array, [11, 12]); // 11: Amount, 12: Total Amount
          array = ctrl.removeNasInArray(array, [7, 8, 11, 12]); // 7: Provider Name, 8: Patient Name, 11: Amount, 12: Total Amount
          var activityLogReportColumnsToRemove = [0, 4,6,8,12,16,17,18,19]; // 0: Activity Event Id, 9: Patient Id, 13: Data Tag, 14: User Modified, 15: Date Modified
          array = ctrl.removeColumnFromArray(
            array,
            activityLogReportColumnsToRemove
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            activityLogReportColumnsToRemove
          );
          csvString = csvString
            .replace('Event Date', 'Date/Time')
            .replace('Event User Name', 'Team Member')
            .replace('Provider Name', 'Provider')
            .replace('Patient Name', 'Patient');
          break;
        case $scope.$parent.reportIds.CarrierProductivityAnalysisReportId:
        case $scope.$parent.reportIds.CarrierProductivityAnalysisBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 3, 4, 5, 6, 7]);
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 4, 5, 6, 7]
          );
          array = ctrl.addPercentToColumnInArray(array, [10]);
          array = ctrl.monetizeFinancialReport(
            array,
            [12, 14, 15, 16],
            ctrl.addColumnInString(
              10,
              ctrl.createBasicTotalsString(
                'Report Totals',
                9,
                [11, 13, 14, 15],
                [1, 2, 3, 4, 5, 6, 7]
              )
            )
          );
          break;
        case $scope.$parent.reportIds.TreatmentPlanPerformanceBetaReportId:
        case $scope.$parent.reportIds.TreatmentPlanPerformanceReportId:
          array = ctrl.removeColumnFromArray(
            array,
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          );
          var reportTotalSummary =
            '\r\nReport Totals,,,,,,,,,' +
            ctrl.createBasicTotalsString('Total Proposed', 11, [11], [1]) +
            ctrl.createBasicTotalsString('', 0, [10], [7], true) +
            ctrl.createBasicTotalsString('Total Accepted', 11, [11], [2]) +
            ctrl.createBasicTotalsString('', 0, [10], [8], true) +
            ctrl.createBasicTotalsString('Total Completed', 11, [11], [3]) +
            ctrl.createBasicTotalsString('', 0, [10], [9], true) +
            ctrl.createBasicTotalsString('Total Referred', 11, [11], [4]) +
            ctrl.createBasicTotalsString('', 0, [10], [10], true) +
            ctrl.createBasicTotalsString(
              'Total Referred Completed',
              11,
              [11],
              [5]
            ) +
            ctrl.createBasicTotalsString('', 0, [10], [11], true) +
            ctrl.createBasicTotalsString('Total Rejected', 11, [11], [6]) +
            ctrl.createBasicTotalsString('', 0, [10], [12], true);
          array = ctrl.monetizeFinancialReport(
            array,
            [11, 12],
            reportTotalSummary
          );
          break;
        case $scope.$parent.reportIds.CarrierProductivityAnalysisDetailedReportId:
          case $scope.$parent.reportIds.CarrierProductivityAnalysisDetailedBetaReportId:
          array = ctrl.removeColumnFromArray(
            array,
            [1, 2, 3, 4, 5, 6, 7, 18, 19, 20, 21, 22, 23]
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 4, 5, 6, 7, 18, 19, 20, 21, 22, 23]
          );
          array = ctrl.addPercentToColumnInArray(array, [10]);
          var totalString = ctrl.addColumnInString(
            10,
            ctrl.createBasicTotalsString(
              'Report Totals',
              9,
              [11, 13, 14, 15],
              [1, 2, 3, 4, 5, 6, 7]
            )
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [13, 15, 16, 17],
            ctrl.addColumnInString(10, totalString)
          );
          break;
        case $scope.$parent.reportIds.PendingClaimsReportId:
          case $scope.$parent.reportIds.PendingClaimsBetaReportId:
          array = ctrl.removeColumnFromArray(array, [7, 8, 9, 28, 29, 30, 31]);
          csvString = ctrl.removeColumnFromString(
            csvString,
            [7, 8, 9, 28, 29, 30, 31]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [19, 20, 21, 22],
            ctrl.createBasicTotalsString(
              'Report Totals',
              19,
              [20, 21, 22],
              [1, 2, 3, 4]
            )
          );
          csvString = ctrl.fixParenthesisSpacing(csvString, [17, 18]);
          break;
        case $scope.$parent.reportIds.FeeScheduleAnalysisByCarrier:
          array = ctrl.removeColumnFromArray(
            array,
            [1, 2, 3, 4, 12, 13, 14, 15, 17, 18, 19, 20]
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 4, 12, 13, 14, 15, 17, 18, 19, 20]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [10, 11, 13, 14, 15],
            ctrl.createBasicTotalsString(
              'Report Totals',
              12,
              [13, 14, 15],
              [1, 2, 3, 4]
            )
          );
          break;
        case $scope.$parent.reportIds.TreatmentPlanProviderReconciliationReportId:
          case $scope.$parent.reportIds.TreatmentPlanProviderReconciliationBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 10]);
          csvString = ctrl.removeColumnFromString(csvString, [1, 2, 10]);
          var reportTotalSummary = ctrl.createBasicTotalsString(
            'Report Totals',
            10,
            [10],
            [2]
          );
          array = ctrl.monetizeFinancialReport(array, [10], reportTotalSummary);
          break;
        case $scope.$parent.reportIds
          .ReferralSourcesProductivityDetailedReportId:
        case $scope.$parent.reportIds
          .ReferralSourcesProductivityDetailedBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 3, 5, 6, 7]);
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 5, 6, 7]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [4, 5, 6],
            ctrl.createBasicTotalsString(
              'Report Totals',
              4,
              [4, 5, 6],
              [1, 2, 3]
            )
          );
          break;
        case $scope.$parent.reportIds.PatientsWithRemainingBenefitsReportId:
          array = ctrl.monetizeColumnInArray(array, [6, 7, 8]);
          break;
        case $scope.$parent.reportIds.AppointmentsReportId:
        case $scope.$parent.reportIds.AppointmentsBetaReportId:
          array = ctrl.monetizeColumnInArray(array, [23]);
          csvString = ctrl.ConstructHeaderString([
            'Date',
            'Location',
            'Patient',
            'Date Of Birth',
            'Phone Number',
            'Start Time',
            'End Time',
            'Duration',
            'Room',
            'Appointment Type',
            'Note',
            'Policy Holder',
            'Policy Holder Birth Date',
            'Policy Holder Id',
            'Plan',
            'Plan Number',
            'Priority',
            'Carrier',
            'Phone Number',
            'Provider',
            'Service Code',
            'Tooth',
            'Area',
            'Charge',
          ]);
          break;
        case $scope.$parent.reportIds.CollectionsAtCheckoutReportId:
          case $scope.$parent.reportIds.CollectionAtCheckoutBetaReportId:
          if (
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Transaction Type',
              'Amount',
            ]);
            array = ctrl.removeColumnFromArray(array, [1, 2]);
            var reportTotalSummary =
              '\r\nReport Totals,' +
              ctrl.createBasicTotalsString('Account Payments', 2, [2], [1]) +
              ctrl.createBasicTotalsString('Negative Adjustments', 2, [2], [2]);
            array = ctrl.monetizeFinancialReport(
              array,
              [2],
              reportTotalSummary
            );
          } else {
            array = ctrl.removeColumnFromArray(array, [1, 2, 5, 6]);
            csvString = ctrl.removeColumnFromString(csvString, [1, 2, 5, 6]);
            var reportTotalSummary =
              '\r\nReport Totals,,,,' +
              ctrl.createBasicTotalsString('Account Payments', 6, [6], [1]) +
              ctrl.createBasicTotalsString('Negative Adjustments', 6, [6], [2]);
            array = ctrl.monetizeFinancialReport(
              array,
              [6],
              reportTotalSummary
            );
          }
          break;
        case $scope.$parent.reportIds.ReferralSourcesProductivitySummaryReportId:
          case $scope.$parent.reportIds.ReferralSourcesProductivitySummaryBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 3]);
          csvString = ctrl.removeColumnFromString(csvString, [1, 2, 3]);
          array = ctrl.monetizeFinancialReport(
            array,
            [4, 5],
            ctrl.createBasicTotalsString('Report Totals', 3, [4, 5], [1, 2, 3])
          );
          break;
        case $scope.$parent.reportIds.ServiceTransactionsWithDiscountsReportId:
          case $scope.$parent.reportIds.ServiceTransactionsWithDiscountsBetaReportId:
          if (
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            array = ctrl.removeColumnFromArray(array, [1]);
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Discount Type',
              'Amount of Discount',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [2],
              ctrl.createBasicTotalsString('Report Totals', 2, [2], [1])
            );
          } else {
            array = ctrl.removeColumnFromArray(array, [1]);
            csvString = ctrl.removeColumnFromString(csvString, [1]);
            array = ctrl.addPercentToColumnInArray(array, [9]);
            array = ctrl.monetizeFinancialReport(
              array,
              [6, 7, 10],
              ctrl.createBasicTotalsString('Report Totals', 10, [10], [1])
            );
          }
          break;
        case $scope.$parent.reportIds.CollectionsByServiceDateReportId:
          case $scope.$parent.reportIds.CollectionsByServiceDateBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1, 3]);
          csvString = ctrl.removeColumnFromString(csvString, [1, 3]);
          array = ctrl.monetizeFinancialReport(
            array,
            [11],
            ctrl.createBasicTotalsString('Report Totals', 11, [11], [1])
          );
          break;
        case $scope.$parent.reportIds.EncountersByFeeScheduleReportId:
          array = ctrl.removeColumnFromArray(
            array,
            [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 20, 21, 22]
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 20, 21, 22]
          );
          var reportTotalSummary = ctrl.createBasicTotalsString(
            'Report Totals',
            11,
            [11, 12, 13],
            [2, 3, 4]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [11, 12, 13],
            reportTotalSummary
          );
          var TortalPatientsCount = ctrl.createBasicTotalsString(
            'Total Patients',
            13,
            [12],
            [1]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [14],
            TortalPatientsCount
          );
          break;
        case $scope.$parent.reportIds.NewPatientsSeenReportId:
          case $scope.$parent.reportIds.NewPatientSeenReportId:
          array = ctrl.removeColumnFromArray(array, [1]);
          csvString = ctrl.removeColumnFromString(csvString, [1]);
          array = ctrl.monetizeFinancialReport(
            array,
            [],
            ctrl.createBasicTotalsString('Total New Patients Seen', 1, [], [1])
          );
          break;
        case $scope.$parent.reportIds.PaymentReconciliationReportId:
        case $scope.$parent.reportIds.PaymentReconciliationBetaReportId:
          if (
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            array = ctrl.removeColumnFromArray(array, [1]);
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Payment Type',
              'Amount',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [2],
              ctrl.createBasicTotalsString('Report Totals', 2, [2], [1])
            );
          } else {
            array = ctrl.addNewColumnToColumnInArray(array, [10]);
            array = ctrl.removeColumnFromArray(array, [1, 3, 10]);
            csvString = ctrl.removeColumnFromString(csvString, [1, 3]);
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Payment Type',
              'Service Date',
              'Posted Date',
              'Posted By',
              'Responsible Party',
              'Patient Group',
              'Description',
              'Patient',
              'Distributed Amount',
              'Amount',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [9, 10],
              ctrl.createBasicTotalsString('Report Totals', 10, [10], [1])
            );
          }
          break;
        case $scope.$parent.reportIds.PaymentLocationReconciliationReportId:
        case $scope.$parent.reportIds.PaymentLocationReconciliationBetaReportId:
          if (
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            array = ctrl.removeColumnFromArray(array, [1]);
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Payment Type',
              'Amount',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [2],
              ctrl.createBasicTotalsString('Report Totals', 2, [2], [1])
            );
          } else {
            array = ctrl.addNewColumnToColumnInArray(array, [10]); // 10: Distributed Amount
            array = ctrl.addNewColumnToColumnInArray(array, [9]); // 9: Amount
            array = ctrl.removeColumnFromArray(array, [1, 3, 9, 10]);
            csvString = ctrl.removeColumnFromString(csvString, [1, 3, 9, 10]);
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Payment Type',
              'Service Date',
              'Posted Date',
              'Posted By',
              'Responsible Party',
              'Description',
              'Distributed Location',
              'Distributed Amount',
              'Amount',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [8, 9],
              ctrl.createBasicTotalsString('Report Totals', 8, [8], [1])
            );
          }
          break;
          case $scope.$parent.reportIds.PatientsByPatientGroupsReportId:
          case $scope.$parent.reportIds.PatientsByPatientGroupsNewReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 4]);
          csvString = ctrl.ConstructHeaderString([
            'Patient Group',
            'Patient',
            'Location',
            'Account Balance',
            'Last Visit Date',
          ]);
          array = ctrl.monetizeColumnInArray(array, [3]);
          break;
        case $scope.$parent.reportIds.PatientsByFlagsReportId:
          case $scope.$parent.reportIds.PatientByFlagsBetaReportId:
          csvString = ctrl.ConstructHeaderString([
            'Location',
            'Flag',
            'Patient',
          ]);
          break;
        case $scope.$parent.reportIds.DailyProductionCollectionSummaryReportId:
          var reportTotalSummary =
            '\r\nReport Totals,,,,' +
            ctrl.createBasicTotalsString('Total Production', 1, [1], [1]) +
            ctrl.createBasicTotalsString('Total Collections', 1, [1], [2]) +
            ctrl.createBasicTotalsString('Total Adjustments', 1, [1], [3]);
          array = ctrl.removeColumnFromArray(array, [1, 2, 3]);
          array = ctrl.monetizeFinancialReport(
            array,
            [2, 3, 4],
            reportTotalSummary
          );
          csvString = ctrl.ConstructHeaderString([
            'Location',
            'Date',
            'Production',
            'Collections',
            'Adjustments',
          ]);
          break;
        case $scope.$parent.reportIds.ReceivablesByProviderReportId:
          case $scope.$parent.reportIds.ReceivablesByProviderBetaReportId:
          if (
            !_.isUndefined($scope.$parent.filterModels.ReportView) &&
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            array = ctrl.monetizeFinancialReport(
              array,
              [3, 4, 5, 6, 7, 8, 9, 10, 11],
              ctrl.createBasicTotalsString(
                'Report Totals',
                2,
                [4, 5, 6, 7, 8, 9, 10, 11],
                [1, 2, 3, 4, 5, 6, 7, 8]
              )
            );
          } else {
            array = ctrl.monetizeFinancialReport(
              array,
              [3, 4, 5, 6, 7, 8, 9, 10, 11],
              ctrl.createBasicTotalsString(
                'Report Totals',
                4,
                [4, 5, 6, 7, 8, 9, 10, 11],
                [1, 2, 3, 4, 5, 6, 7, 8]
              )
            );
          }
          break;
        case $scope.$parent.reportIds.ReceivablesByAccountId:
        case $scope.$parent.reportIds.ReceivablesByAccountBetaId:
          if (
            !_.isUndefined($scope.$parent.filterModels.ReportView) &&
            $scope.$parent.filterModels.ReportView.FilterString === 'Summary'
          ) {
            array = ctrl.removeColumnFromArray(array, [0]);
            csvString = '';
            csvString = ctrl.ConstructHeaderString([
              'Location Name',
              'Current Balance',
              'Balance Thirty',
              'Balance Sixty',
              'Balance Ninety',
              'In Collections',
              'Account Balance',
              'Estimated Insurance',
              'Estimated Insurance Adjustments',
              'Patient Portion',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [1, 2, 3, 4, 5, 6, 7, 8, 9],
              ctrl.createBasicTotalsString(
                'Report Totals',
                1,
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9]
              )
            );
          } else {
            array = ctrl.removeColumnFromArray(
              array,
              [
                0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24, 25, 26, 27, 28,
                29, 30,
              ]
            );
            csvString = ctrl.removeColumnFromString(
              csvString,
              [
                0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19,
                20,
              ]
            );
            array = ctrl.monetizeFinancialReport(
              array,
              [2, 3, 4, 5, 6, 7, 8, 9, 10],
              ctrl.createBasicTotalsString(
                'Report Totals',
                2,
                [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
              )
            );
          }
          break;
        case $scope.$parent.reportIds.PatientsByMedicalHistoryAlertsReportId:
          case $scope.$parent.reportIds.PatientsByMedicalHistoryAlertsBetaReportId:
          csvString = ctrl.ConstructHeaderString([
            'Location',
            'Medical History Alert',
            'Patient',
          ]);
          break;
        case $scope.$parent.reportIds.ProjectedNetProductionReportId:
        case $scope.$parent.reportIds.ProjectedNetProductionBetaReportId:
          array = ctrl.removeColumnFromArray(
            array,
            [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
          );
          break;
        case $scope.$parent.reportIds.PatientsByLastServiceDateReportId:
          case $scope.$parent.reportIds.PatientsByLastServiceDateBetaReportId:
          array = ctrl.monetizeColumnInArray(array, [6]);
              break;
        case $scope.$parent.reportIds.MedicalHistoryFormAnswersReportId:
        case $scope.$parent.reportIds.MedicalHistoryFormAnswersBetaReportId:
          array = _.concat(
            array,
            ctrl.createBasicTotalsString('Report Totals', 1, [], [1, 2, 3])
          );
          break;

        case $scope.$parent.reportIds.AdjustmentsByTypeReportId:
          array = ctrl.removeColumnFromArray(array, [1, 5, 6, 8, 9]);
          if (csvString === '') {
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Adjustment Type',
              'Positive Negative',
              'Impaction',
              'Amount',
            ]);
            array = ctrl.monetizeFinancialReport(
              array,
              [4],
              ctrl.createBasicTotalsString('Report Totals', 4, [4], [1])
            );
          } else {
            csvString = ctrl.removeColumnFromString(csvString, [1, 5, 6, 8, 9]);
            array = ctrl.monetizeFinancialReport(
              array,
              [9],
              ctrl.createBasicTotalsString('Report Totals', 9, [9], [1])
            );
            csvString = ctrl.ConstructHeaderString([
              'Location',
              'Adjustment Type',
              'Positive Negative',
              'Impaction',
              'Date',
              'Responsible Party',
              'Provider',
              'Description',
              'Original Transaction Date (voids)',
              'Amount',
            ]);
          }
          break;

        case $scope.$parent.reportIds.CreditDistributionHistoryReportId:
        case $scope.$parent.reportIds.CreditDistributionHistoryBetaReportId:
          array = ctrl.removeColumnFromArray(
            array,
            [7, 8, 9, 10, 11, 12, 13, 14, 15, 28]
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            [7, 8, 9, 10, 11, 12, 13, 14, 15, 28]
          );
          array = ctrl.monetizeFinancialReport(array, [3, 18], '');
          break;

        case $scope.$parent.reportIds.ProposedTreatmentReportId:
        case $scope.$parent.reportIds.ProposedTreatmentBetaReportId:
          array = ctrl.removeColumnFromArray(array, [1, 2, 4, 5, 8, 9]);
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 4, 5, 8, 9]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [11],
            ctrl.createBasicTotalsString('Report Totals', 11, [11], [2])
          );
          array = _.concat(
            array,
            ctrl.createBasicTotalsString('Number of Services', 11, [], [1])
          );
          break;
        case $scope.$parent.reportIds.BenefitPlansbyAdjustmentTypeReportId:
          csvString = ctrl.ConstructHeaderString([
            'Adjustment Type',
            'Benefit Plan',
            'Plan/Group Number',
          ]);
          break;
        case $scope.$parent.reportIds.BenefitPlansbyInsurancePaymentTypeBetaReportId:
          csvString = ctrl.ConstructHeaderString([
            'Insurance Payment Type',
            'Benefit Plan',
            'Plan/Group Number',
          ]);
              break;
          case $scope.$parent.reportIds.AccountWithOffsettingProviderBalancesBetaReportId:
              csvString = ctrl.ConstructHeaderString([
                  'Responsible Party',
                  'Provider',
                  'Location',
                  'Provider Total',
                  'Account total',
              ]);
              array = ctrl.removeColumnFromArray(array, [0]);
              array = ctrl.monetizeFinancialReport(
                  array,
                  [3, 4],
                  ctrl.createBasicTotalsString('Report Totals', 3, [3, 4], [1, 2])
              );
              array = _.concat(
                  array,
                  ctrl.createBasicTotalsString('Total Accounts', 3, [2], [3])
              );
              break;
        case $scope.$parent.reportIds
          .AccountsWithOffsettingProviderBalancesReportId:
          csvString = ctrl.ConstructHeaderString([
            'Responsible Party',
            'Provider',
            'Location',
            'Provider Total',
            'Account total',
          ]);

          array = ctrl.removeColumnFromArray(array, [0]);
          array = ctrl.monetizeFinancialReport(
            array,
            [3, 4],
            ctrl.createBasicTotalsString('Report Totals', 3, [3, 4], [1, 2])
          );
          array = _.concat(
            array,
            ctrl.createBasicTotalsString('Total Accounts', 3, [2], [3])
          );
          break;
        case $scope.$parent.reportIds.EncountersByCarrierReportId:
        case $scope.$parent.reportIds.EncountersByCarrierBetaReportId:
          array = ctrl.removeColumnFromArray(
            array,
            [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 20, 21, 22]
          );
          csvString = ctrl.removeColumnFromString(
            csvString,
            [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 20, 21, 22]
          );
          var reportTotalSummary = ctrl.createBasicTotalsString(
            'Report Totals',
            11,
            [11, 12, 13],
            [2, 3, 4]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [11, 12, 13],
            reportTotalSummary
          );
          var TortalPatientsCount = ctrl.createBasicTotalsString(
            'Total Patients',
            13,
            [12],
            [1]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [14],
            TortalPatientsCount
          );
          break;
        case $scope.$parent.reportIds.EncountersByPaymentReportId:
          array = ctrl.removeColumnFromArray(
            array,
            [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 20, 21, 22]
          );
          csvString = ctrl.ConstructHeaderString([
            'Location',
            'Insurance',
            'Date',
            'Patient',
            'Date Of Birth',
            'Policy Holder',
            'Policy Holder Id',
            'Group Number',
            'Service',
            'Tooth',
            'Area',
            'Fee Charged',
            'Allowed Amount',
            'Difference',
            'Secondary Insurance',
          ]);
          var reportTotalSummary = ctrl.createBasicTotalsString(
            'Report Totals',
            11,
            [11, 12, 13],
            [2, 3, 4]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [11, 12, 13],
            reportTotalSummary
          );
          var TortalPatientsCount = ctrl.createBasicTotalsString(
            'Total Patients',
            13,
            [12],
            [1]
          );
          array = ctrl.monetizeFinancialReport(
            array,
            [17],
            TortalPatientsCount
          );
          break;
        case $scope.$parent.reportIds.PatientsClinicalNotesReportId:
          csvString = ctrl.ConstructHeaderString([
            'Patient Name',
            'Date',
            'Patient Notes',
          ]);
          array = ctrl.removeColumnFromArray(array, [0, 1]);

          break;

        case $scope.$parent.reportIds.PatientsByBenefitPlanBetaReportId:
          array = ctrl.formatDataInArray(array, 16, [14, ', ', 13, ' ', 15, '.']);
          array = ctrl.removeColumnFromArray(array, [1, 2,3,4, 5, 6, 7, 10, 11, 12,13,14,15]);

          var priorityList = [
            { text: 'Primary', value: 0 },
            { text: 'Secondary', value: 1 },
            { text: '3rd Supplemental', value: 2 },
            { text: '4th Supplemental', value: 3 },
            { text: '5th Supplemental', value: 4 },
            { text: '6th Supplemental', value: 5 }
          ];
          array = ctrl.mapEnumValueInArray(array, 4, priorityList);

          array = ctrl.changeColumnSequenceInArray(array, [0, 3, 2, 1, 4]);
          
           csvString = ctrl.ConstructHeaderString([
             'Benefit Plan',
             'Patient Name',
             'Patient Code',
             'Preferred Location',
             'Benefit Plan Priority'
           ]);
          break;
        case $scope.$parent.reportIds.PatientsByPatientGroupsBetaReportId:
          array = ctrl.formatDataInArray(array, 7, [8, ', ', 7, ' ', 9, '. - ', 3]);
          array = ctrl.removeColumnFromArray(array, [3, 5, 6, 8, 9]);
          array = ctrl.changeColumnSequenceInArray(array, [0, 4, 2, 3, 1]);
          array = ctrl.monetizeColumnInArray(array, [3]);
          csvString = ctrl.ConstructHeaderString([
            'Patient Group',
            'Patient',
            'Location',
            'Account Balance',
            'Last Visit Date'
          ]);
              break;
          case $scope.$parent.reportIds.ReferredPatientsBetaReportId: 
            array = ctrl.removeColumnFromArray(array, [0,2,3,5,6]);
            csvString = ctrl.ConstructHeaderString([
              'Referral Categories',
              'Referring From',
              'Referred Patient Name',
              'Referred Patient Code',
              'First Visit Date',
              'Referred Patient Location'
            ]);            
            break;
          case $scope.$parent.reportIds.NewPatientsSeenBetaReportId: 
              array = ctrl.formatDataInArray(array, 8,  [43 , ', ', 42, ' ', 44, '. - ', 8]); 
              array = ctrl.formatDataInArray(array, 18,[ 23, ', ', 22,' ', 24, '. - ', 18]); 
              array = ctrl.removeColumnFromArray(array, [6, 7, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 50, 51, 52, 53, 55, 56, 57]);          
              array = ctrl.changeColumnSequenceInArray(array, [0, 6, 1, 2, 3, 4, 5, 7, 8, 12, 10, 13, 9]);
              csvString = ctrl.ConstructHeaderString([
                  'Location',
                  'Patient',
                  'Address',
                  'Address2',
                  'City',
                  'State',
                  'Zip Code',
                  'Phone Number',
                  'Responsible Party',
                  'Service Date',
                  'Description',
                  'Tooth',
                  'Area',
              ]);             
              array = ctrl.monetizeFinancialReport(
                  array,
                  [],
                  ctrl.createBasicTotalsString('Total New Patients Seen', 1, [], [1])
              );
              break;
          case $scope.$parent.reportIds.ReferralSourceProductivityReportId:
              case $scope.$parent.reportIds.ReferralAffiliatesReportId:
      }
    } else {
      array = ctrl.removeColumnFromArray(array, [1, 2, 3]);
      // csvString = ctrl.removeColumnFromString(csvString, [1, 2, 3]);
      csvString = ctrl.ConstructHeaderString([
        'Provider',
        'Date',
        'Location',
        'Transaction Type',
        'Patient',
        'Description',
        'Original Transaction Date (voids)',
        'Production',
        'Collection',
        'Adjustments',
      ]);
      array = ctrl.monetizeFinancialReport(
        array,
        [7, 8, 9],
        ctrl.createBasicTotalsString('Report Totals', 7, [7, 8, 9], [1, 2, 3])
      );
    }

    _.each(array, function (value) {
      csvString = csvString.concat(
        $scope.$parent.reportIds.PatientsClinicalNotesReportId == 126
          ? ctrl.removeHTML(value.replace('&nbsp;', ' ').replace('&nbsp', ' '))
          : value
      );
    });
    // Add if report master DTO contains more properties than just a list of detail DTOs and is not a monetary report.
    //if (Object.keys($scope.data).length > 7) {
    //    csvString = ctrl.AddNonArrayPropToCSV(csvString);
    //}

    //console.log(csvString);
    var reportName = localize.getLocalizedString(
      $routeParams.ReportName
        ? $routeParams.ReportName
        : $scope.$parent.originalReport.Name
    );
    var blob = new Blob([decodeURIComponent(encodeURI(csvString))], {
      type: 'text/csv;charset=utf-8;',
    });
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, reportName + ' ' + new Date() + '.csv');
    } else {
      var filename = reportName + ' ' + new Date() + '.csv';

      var element = document.createElement('a');
      element.setAttribute(
        'href',
        window.URL.createObjectURL(blob, { type: 'text/plain' })
      );
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
      if ($scope.$parent.lazyLoadEnabled == true) {
        $scope.$parent.isExport = false;
        $scope.$parent.implementPaging();
      }
    }
  };

  $scope.export = function () {
      if (!$scope.exportDisabled) {
          if ($scope.reportId == $scope.$parent.reportIds.NetCollectionByProviderReportId) {
              sessionStorage.setItem('_CSVExport', true);
          }
      ctrl.exportCSV.apply(this);
      // reportsFactory.AddExportedReportActivityEvent(
      //   $scope.reportId,
      //   $scope.isCustomReport
      // );
    }
  };

  ctrl.createBasicTotalsString = function (
    totalsStringHeader,
    numberOfCommas,
    columnsToMonetize,
    dtoProperties,
    isAllowedTotal
  ) {
    var totalsString = '';

    if (isAllowedTotal) {
      totalsString = localize.getLocalizedString(totalsStringHeader);
    } else {
      totalsString = '\r\n' + localize.getLocalizedString(totalsStringHeader);
    }

    // totalsString is not an array, that's why didn't used lodash
    for (var i = 0; i < numberOfCommas; i++) {
      totalsString = totalsString.concat(',');
    }
    var column = numberOfCommas;
    var propNumber = 1;
    for (var prop in exportData) {
      if (_.has(exportData, prop)) {
        if (
          !_.isArray(exportData[prop]) &&
          prop !== 'GeneratedAtDateTime' &&
          prop !== 'GeneratedByUserCode' &&
          prop !== 'LocationOrPracticeEmail' &&
          prop !== 'LocationOrPracticeName' &&
          prop !== 'LocationOrPracticePhone' &&
          prop !== 'ReportTitle' &&
          prop !== 'FilterInfo' &&
          prop !== 'ReportRunDate'
        ) {
          if (_.includes(dtoProperties, propNumber)) {
              if (_.includes(columnsToMonetize, column) || isAllowedTotal) {
                    totalsString = totalsString.concat(
                          ctrl.formatMonetaryColumnValue(exportData[prop]) + ','
                      );
            } else {
                if (prop == "TotalCount" && ($scope.reportId == $scope.$parent.reportIds.FeeExceptionsReportId || $scope.reportId == $scope.$parent.reportIds.FeeExceptionsBetaReportId)) {
                    const totalCount = parseInt(exportData[prop], 10);
                    totalsString = totalsString.concat(totalCount + (totalCount > 1 ? ' Transactions,' : ' Transaction,'));
                }
                else if (prop == "Claims" && ($scope.reportId == $scope.$parent.reportIds.PendingClaimsBetaReportId || $scope.reportId == $scope.$parent.reportIds.PendingClaimsReportId)) {
                      const totalCount = parseInt(exportData[prop], 10);
                      totalsString = totalsString.concat(' Claims: ' + totalCount + ',');
                  }
                else {
                    totalsString = totalsString.concat(exportData[prop] + ',');
                }

            }
            column++;
          }
          propNumber++;
        }
      }
    }
    return totalsString;
  };

  ctrl.monetizeFinancialReport = function (array, columnNumbers, totalsString) {
    array = ctrl.monetizeColumnInArray(array, columnNumbers);
    return _.concat(array, totalsString);
  };

  ctrl.monetizeColumnInString = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      if (columns[column]) {
        columns[column] = ctrl.formatMonetaryColumnValue(columns[column]);
      }
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.monetizeColumnInArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.monetizeColumnInString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.addPercentToColumnInArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.addPercentToColumnInString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.addPercentToColumnInString = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      columns[column] = columns[column] + localize.getLocalizedString('%');
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.addAreaToColumnInArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.addAreaToColumnInString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.addAreaToColumnInString = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      columns[column] = $filter('getActivityArea')(parseInt(columns[column]));
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.addNewColumnToColumnInArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.addNewColumnToColumnInString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.addNewColumnToColumnInString = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      columns[columns.length] = columns[column];
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.addTypeToColumnInArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.addTypeToColumnInString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.addTypeToColumnInString = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      columns[column] = $filter('getActivityType')(parseInt(columns[column]));
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.addActionToColumnInArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.addActionToColumnInString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.addActionToColumnInString = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      columns[column] = $filter('getActivityAction')(parseInt(columns[column]));
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.removeNasInArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.removeNasFromColumnInString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.removeNasFromColumnInString = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      columns[column] =
        columns[column] === 'N/A' || columns[column] === '$NaN'
          ? ''
          : columns[column];
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.addColumnInString = function (columnNumber, string) {
    var columns = ctrl.splitStringIntoColumnArray(string);
    string = '';
    var index = 0;
    _.each(columns, function (column) {
      string = string + column + localize.getLocalizedString(',');
      index++;
      if (index == columnNumber) {
        string = string + localize.getLocalizedString(',');
      }
    });
    return string;
  };
  ctrl.removeColumnFromString = function (string, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(string);
    var rowsRemoved = 0;
    _.each(columnNumbers, function (column) {
      columns.splice(column - rowsRemoved, 1);
      rowsRemoved++;
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.removeColumnFromArray = function (array, columnNumbers) {
    var returnArray = [];
    _.each(array, function (line) {
      returnArray.push(ctrl.removeColumnFromString(line, columnNumbers));
    });
    return returnArray;
  };

  ctrl.removeHTML = function (str) {
    var tmp = document.createElement('DIV');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || '';
  };

  ctrl.fixParenthesisSpacing = function (line, columnNumbers) {
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(columnNumbers, function (column) {
      columns[column] = columns[column].replace(/(\()(\s)/g, '$2$1');
    });
    return ctrl.buildStringFromColumns(columns);
  };

  ctrl.buildStringFromColumns = function (columns) {
    var string = '';
    _.each(columns, function (column) {
      string = string.concat(column + ',');
    });
    string = string.substring(0, string.length - 1);
    return string.concat('\r\n');
  };

  ctrl.splitStringIntoColumnArray = function (line) {
    //Splits a string into columns for CSV format.
    // Handles quote, and commas embedded in strings,
    // Assumes quotes within strings are escaped as two quote chars: " -> ""
    var columns = [];
    var lineChars = line.replace(/(?:\r\n|\r|\n)/g, '').split('');
    var thisColumn = '';
    var textBlob = false;
    for (var index = 0; index < lineChars.length; index++) {
      var thisChar = lineChars[index];
      if (thisChar === ',' && !textBlob) {
        columns.push(thisColumn);
        thisColumn = '';
        continue;
      }
      thisColumn = thisColumn.concat(thisChar);
      if (thisChar === '"') {
        textBlob = !textBlob;
      }
    }
    if (!_.isEmpty(thisColumn)) {
      columns.push(thisColumn);
    }
    return columns;
  };

  ctrl.formatPeriodReconciliationInnerArray = function (
    loc,
    arrayPropName,
    title,
    csvString
  ) {
    var returnString = '';
    if (!_.isEmpty(loc[arrayPropName])) {
      var returnString = title + '\r\n' + csvString;
      _.each(ctrl.convertArrayToCSV(loc[arrayPropName]), function (line) {
        returnString = returnString.concat(
          loc.Location + ',' + ctrl.monetizeColumnInString(line, [6])
        );
      });
    }
    return returnString;
  };

  //Headers need to be added in order
  ctrl.checkIfTemplate = function (array) {
    if (
      $scope.reportId === $scope.$parent.reportIds.ReceivablesByProviderReportId ||
      $scope.reportId === $scope.$parent.reportIds.ReceivablesByProviderBetaReportId
    ) {
      if (
        !_.isUndefined($scope.$parent.filterModels.ReportView) &&
        $scope.$parent.filterModels.ReportView.FilterString === 'Detailed'
      ) {
        var headers = [
          localize.getLocalizedString('AccountBalance'),
          localize.getLocalizedString('CurrentBalance'),
          localize.getLocalizedString('BalanceThirty'),
          localize.getLocalizedString('BalanceSixty'),
          localize.getLocalizedString('BalanceNinety'),
          localize.getLocalizedString('PatientPortion'),
          localize.getLocalizedString('EstimatedInsurance'),
          localize.getLocalizedString('EstimatedInsuranceAdjustments'),
          localize.getLocalizedString('ProviderTotal'),
        ];
        _.each(array, function (loc) {
          loc = ctrl.DeleteUnneededProperties(headers, loc);
          _.each(loc.Providers, function (prov) {
            prov = ctrl.DeleteUnneededProperties(headers, prov);
            _.each(prov.ResponsibleParties, function (res) {
              res = ctrl.FillEmptyDecimalProperties(headers, res);
            });
          });
        });
      } else {
        var summaryHeaders = [
          localize.getLocalizedString('CurrentBalance'),
          localize.getLocalizedString('BalanceThirty'),
          localize.getLocalizedString('BalanceSixty'),
          localize.getLocalizedString('BalanceNinety'),
          localize.getLocalizedString('PatientPortion'),
          localize.getLocalizedString('EstimatedInsurance'),
          localize.getLocalizedString('EstimatedInsuranceAdjustments'),
          localize.getLocalizedString('ProviderTotal'),
        ];
        _.each(array, function (loc) {
          loc = ctrl.DeleteUnneededProperties(summaryHeaders, loc);
          _.each(loc.Providers, function (prov) {
            prov = ctrl.FillEmptyDecimalProperties(summaryHeaders, prov);
          });
        });
      }
    } else if (
      $scope.reportId === $scope.$parent.reportIds.ReceivablesByAccountId ||
      $scope.reportId === $scope.$parent.reportIds.ReceivablesByAccountBetaId
    ) {
      var receivablesByAccountHeaders = [
        localize.getLocalizedString('CurrentBalance'),
        localize.getLocalizedString('BalanceThirty'),
        localize.getLocalizedString('BalanceSixty'),
        localize.getLocalizedString('BalanceNinety'),
        localize.getLocalizedString('InCollections'),
        localize.getLocalizedString('AccountBalance'),
        localize.getLocalizedString('EstimatedInsurance'),
        localize.getLocalizedString('EstimatedInsuranceAdjustments'),
        localize.getLocalizedString('PatientPortion'),
      ];
      _.each(array, function (loc) {
        loc = ctrl.DeleteUnneededProperties(receivablesByAccountHeaders, loc);
        _.each(loc.ResponsibleParties, function (res) {
          res = ctrl.FillEmptyDecimalProperties(
            receivablesByAccountHeaders,
            res
          );
        });
      });
    }
    return array;
  };

  ctrl.DeleteUnneededProperties = function (headers, array) {
    _.each(headers, function (header) {
      if (array.hasOwnProperty(header)) {
        delete array[header];
      }
    });
    return array;
  };

  ctrl.FillEmptyDecimalProperties = function (headers, array) {
    _.each(headers, function (header) {
      if (!array.hasOwnProperty(header)) {
        array[header] = 0;
      } else {
        // This is done to get the correct order of properties for export
        var temp = array[header];
        delete array[header];
        array[header] = temp;
      }
    });
    return array;
  };

  ctrl.GetEmptyColumns = function (emptyFirstArray, emptySecondArray) {
    var emptyString = localize.getLocalizedString('N/A,');
    if (
      $scope.reportId === $scope.$parent.reportIds.AppointmentsReportId ||
      $scope.reportId === $scope.$parent.reportIds.AppointmentsBetaReportId
    ) {
      if (emptyFirstArray && emptySecondArray) {
        return _.repeat(emptyString, 12) + '0';
      } else if (emptyFirstArray) {
        return _.repeat(emptyString, 8);
      } else {
        return _.repeat(emptyString, 4) + '0';
      }
    }
    return '';
  };

  ctrl.formatTooth = function (tooth) {
    return tooth !== '' && !_.isNull(tooth) ? '="' + tooth + '"' : 'N/A';
  };

  ctrl.formatTaxServiceType = function (taxType) {
        if (taxType == '1')
            return 'NT'
        else if (taxType == 2)
            return 'P';
        else if (taxType == 3)
            return 'S';
    }
  ctrl.formatDataInArray = function (array, columnNumber, formatArray) {
    var returnArray = [];
    _.each(array, function (line) {
      var columns = ctrl.splitStringIntoColumnArray(line);
      var newLineString = "";
      _.each(formatArray, function (formatItem) {
        if (!isNaN(parseInt(formatItem))){
          if(columns[formatItem] != undefined){
            newLineString = newLineString + (columns[formatItem].replaceAll('"', '') != 'N/A' ? columns[formatItem].replaceAll('"', '') : '');
          }          
        } else {
          newLineString = newLineString + String(formatItem);
        }
      });
      columns[columnNumber] = '"' + newLineString + '"';
      returnArray.push(ctrl.buildStringFromColumns(columns));
    });
    return returnArray;
  };

  ctrl.changeColumnSequenceInArray = function (array, ColSeqArray) {
    var returnArray = [];    
    _.each(array, function (line) {
      var newLine = ctrl.changeColumnSequenceInString(line, ColSeqArray);
      returnArray.push(newLine);
    });
    return returnArray;
  };

  ctrl.changeColumnSequenceInString = function (line, ColSeqArray) {
    var newArr = [];
    var columns = ctrl.splitStringIntoColumnArray(line);
    _.each(ColSeqArray, function (itemIdx) {
      newArr.push(columns[itemIdx] == undefined ? "" : columns[itemIdx]);
    });
    return ctrl.buildStringFromColumns(newArr);
  };

  ctrl.mapEnumValueInArray = function (array, columnNumber, sourceEnum) {    
    var returnArray = [];
    _.each(array, function (line) {
      var columns = ctrl.splitStringIntoColumnArray(line);
      columns[columnNumber] = '"' + sourceEnum[columns[columnNumber].replaceAll('"', '')]["text"] + '"';
      returnArray.push(ctrl.buildStringFromColumns(columns));
    });
    return returnArray;
  };

  ctrl.getArrayKeys_V2 = function (obj) {
    let result = [];

    function extractProperties(obj) {

        for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          if (typeof obj[prop] !== 'object' && !Array.isArray(obj[prop])) {   
            var propName = (!!prop) ? prop.charAt(0).toUpperCase() + prop.substring(1) : '';         
            result.push(ctrl.formatColumnValue(propName.replace(/([A-Z])/g, ' $1').trim()));
          } else if (Array.isArray(obj[prop])) {
            extractProperties(obj[prop][0]);
          } else if (typeof obj[prop] === 'object') {
            extractProperties(obj[prop]);
          }          
        }
      }
    }

    extractProperties(obj);
    return (result.join(',')) + "\r\n";
  };

  ctrl.convertArrayToCSV_V2 = function (arr) {
    let result = [];

      function extractValues(obj) {
          let values = [];
          for (const prop in obj) {
              if (obj.hasOwnProperty(prop)) {
                  if (typeof obj[prop] !== 'object' && !Array.isArray(obj[prop])) {
                      values.push(ctrl.formatColumnValue(obj[prop]));
                  } else if (Array.isArray(obj[prop])) {
                      for (const item of obj[prop]) {
                          values = values.concat(extractValues(item));
                      }
                  } else {

                      if (prop == "planGroupNumber" && obj[prop] == null && $scope.reportId == $scope.$parent.reportIds.BenefitPlansByFeeScheduleBetaReportId) {
                          values.push(ctrl.formatColumnValue(obj[prop]));
                      }
                      else {
                          values = values.concat(extractValues(obj[prop]));
                      }
                  }
              }
          }
          return values;
      }
  
    for (const item of arr) {
      var lineVal = "";
      for (const prop in item) {
        if (item.hasOwnProperty(prop) && Array.isArray(item[prop])) {          
          for (const nestedItem of item[prop]) {
            const values = extractValues(nestedItem);            
            if (lineVal != ""){
              result.push((lineVal + "," + values.join(',')) + "\r\n");
            } else {
              result.push((values.join(',')) + "\r\n");
            }            
          }
        } else if (typeof item[prop] !== 'object' && !Array.isArray(item[prop])) {
          lineVal = ctrl.formatColumnValue(item[prop]);
        }
      }
    }
  
    return result;
  }; 
  //#End Export
}

ReportExportController.prototype = Object.create(BaseCtrl.prototype);

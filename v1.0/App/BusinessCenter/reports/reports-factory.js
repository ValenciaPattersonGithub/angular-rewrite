'use strict';

angular.module('Soar.BusinessCenter').factory('ReportsFactory', [
  '$q',
  'ReportsService',
  'toastrFactory',
  'localize',
  'AmfaInfo',
  '$window',
  'ReportingAPIService',
  'FuseReportingHttpService',
  '$location',
  function (
    $q,
    reportsService,
    toastrFactory,
    localize,
    amfaInfo,
    $window,
    reportingAPIService,
    fuseReportingHttpService,
    $location
  ) {
    //
    var factory = this;

    // gets all the reports metadata
    var getListOfAvailableReports = function () {
      var defer = $q.defer();
      var promise = defer.promise;
      reportsService.get().$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve();
          toastrFactory.error(
            localize.getLocalizedString('{0} {1}', [
              'Reports',
              'failed to load.',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    // helper for geting the amfa abbrev via the id returned by domain
    var getAmfaAbbrev = function (actionId) {
      for (var key in amfaInfo) {
        if (!amfaInfo.hasOwnProperty(key)) continue;
        var obj = amfaInfo[key];
        for (var prop in obj) {
          if (!obj.hasOwnProperty(prop)) continue;
          if (prop === 'ActionId' && obj[prop] == actionId) {
            return key;
          }
        }
      }
    };

    // get specific reports from report list
    var getSpecificReports = function (reportIds) {
      var defer = $q.defer();
      var promise = defer.promise;
      reportsService.save({ route: 'specific' }, reportIds).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve();
          toastrFactory.error(
            localize.getLocalizedString('{0} {1}', [
              'Report',
              'failed to load.',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };
    var getNoReportsAccess = function (reportIds) {
      var defer = $q.defer();
      var promise = defer.promise;
      reportsService.save({ route: 'specific' }, reportIds).$promise.then(
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        },
        function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(null);
        }
      );
      return promise;
    };
    // organizes reports into an array
    var getReportArray = function (reportIds) {
      var index = 1;
      var reports = [];
      getSpecificReports(reportIds).then(function (res) {
        if (res && res.Value) {
          angular.forEach(res.Value, function (rep) {
            var reportTitle = rep.Route.split('/').pop();
            reportTitle = reportTitle.replace(/([A-Z])/g, ' $1').trim();
            reports.push({
              ReportTitle: localize.getLocalizedString(reportTitle),
              ReportValue: index,
              Route:
                'BusinessCenter/' +
                rep.Route.charAt(0).toUpperCase() +
                rep.Route.slice(1),
              Amfa: getAmfaAbbrev(rep.ActionId),
              FilterProperties: rep.RequestBodyProperties,
              Id: rep.Id,
            });
            index++;
          });
        }
      });
      return reports;
    };

    var getReportArrayPromise = function (reportIds) {
      var index = 1;
      var reports = [];
      var defer = $q.defer();
      var promise = defer.promise;
      getNoReportsAccess(reportIds).then(function (res) {
        if (res && res.Value) {
          angular.forEach(res.Value, function (rep) {
            var reportTitle = rep.Route.split('/').pop();
            reportTitle = reportTitle.replace(/([A-Z])/g, ' $1').trim();
            reports.push({
              ReportTitle: localize.getLocalizedString(reportTitle),
              ReportValue: index,
              Route:
                'BusinessCenter/' +
                rep.Route.charAt(0).toUpperCase() +
                rep.Route.slice(1),
              Amfa: getAmfaAbbrev(rep.ActionId),
              FilterProperties: rep.RequestBodyProperties,
              Id: rep.Id,
            });
            if (index === res.Value.length) {
              promise = $.extend(promise, { values: reports });
              defer.resolve(reports);
            }
            index++;
          });
        } else {
          promise = $.extend(promise, { values: reports });
          defer.resolve(reports);
        }
      });
      return promise;
    };

    // initializes report page and opens report in new tab
    var openReportPage = function (report, path, notFromDashBoard) {
      report.FilterProperties
        ? sessionStorage.setItem(
          'reportBodyProperties',
          JSON.stringify(report.FilterProperties)
        )
        : sessionStorage.setItem(
          'reportBodyProperties',
          report.FilterProperties
        );
      sessionStorage.setItem('reportAmfa', report.Amfa);
      sessionStorage.setItem('reportId', report.Id);
      sessionStorage.setItem('reportPath', path);
      sessionStorage.setItem('reportCategoryId', report.Category);
      sessionStorage.setItem('fromDashboard', notFromDashBoard ? false : true);

      if (getReportContext()) {
        $window.open('/v1.0/index.html#' + report.Route);
      } else {
        sessionStorage.setItem('dateType', 'fromInsurance');
        if (!report.Category) {
          sessionStorage.setItem('reportCategoryId', 99);
        }
        $window.open('/v1.0/index.html#' + report.Route, report.Name);
      }
      addViewedReportActivityEvent(report.Id, report.IsCustomReport);
    };

    var openReportPageSameTab = function (report, path, notFromDashBoard, blobId) {
      report.FilterProperties
        ? sessionStorage.setItem(
          'reportBodyProperties',
          JSON.stringify(report.FilterProperties)
        )
        : sessionStorage.setItem(
          'reportBodyProperties',
          report.FilterProperties
        );
      sessionStorage.setItem('reportAmfa', report.Amfa);
      sessionStorage.setItem('reportId', report.Id);
      sessionStorage.setItem('reportPath', path);
      sessionStorage.setItem('reportCategoryId', report.Category);
      sessionStorage.setItem('fromDashboard', notFromDashBoard ? false : true);

      if (getReportContext()) {
        $window.open('/v1.0/index.html#' + report.Route);
      } else {
        sessionStorage.setItem('dateType', 'fromInsurance');
        if (!report.Category) {
          sessionStorage.setItem('reportCategoryId', 99);
        }
        $location.search('bid', blobId);
      }
      addViewedReportActivityEvent(report.Id, report.IsCustomReport);
    };

    // initializes report page and opens report in new tab with a context object
    var openReportPageWithContext = function (report, path, context) {
      context
        ? sessionStorage.setItem('reportContext', JSON.stringify(context))
        : sessionStorage.setItem('reportContext', context);

      openReportPage(report, path);
    };

    var getReportContext = function () {
      return sessionStorage.getItem('reportContext')
        ? JSON.parse(sessionStorage.getItem('reportContext'))
        : sessionStorage.getItem('reportContext');
    };

    var clearReportContext = function () {
      sessionStorage.removeItem('reportContext');
    };

    var copyProperties = function (fromObject, toObject) {
      for (var property in fromObject) {
        if (fromObject.hasOwnProperty(property)) {
          toObject[property] = fromObject[property];
        }
      }
    };

    // gets the report via POST or GET
      var generateReport = function (filters, reportName) {
          var defer = $q.defer();
          var promise = defer.promise;
          var reportContext = getReportContext();
          // for the dashboard call all locations
          if (filters) {
              if (Object.keys(filters).length !== 0) {
                  const exists = filters.hasOwnProperty('LocationIds');
                  if (exists) {
                      if (
                          filters.LocationIds[0] === '00000000-0000-0000-0000-000000000000'
                      ) {
                          filters.LocationIds.shift();
                      }
                  }
              }
              if (
                  reportName == 'CarriersBeta' ||
                  reportName == 'ProductionByProvider' ||
                  reportName == 'AdjustmentsByType' ||
                  reportName == 'CreditDistributionHistory' ||
                  reportName == 'CreditDistributionHistoryBeta' ||
                  reportName == 'GrossPerformanceByProviderDetailed' ||
                  reportName == 'PerformanceByProviderDetailedBeta' ||
                  reportName == 'CollectionByProvider' ||
                  reportName == 'ReferredPatients' ||
                  reportName == 'PaymentReconciliation' ||
                  reportName == 'ReceivablesByAccount' ||
                  reportName == 'PatientAnalysis' ||
                  reportName == 'AdjustmentsByProvider' ||
                  reportName == 'ProjectedProduction' ||
                  reportName == 'EncountersByCarrier' ||
                  reportName == 'EncountersByCarrierBeta' ||
                  reportName == 'PotentialDuplicatePatients' ||
                  reportName == 'ReferralSourcesProductivityDetailed' ||
                  reportName == 'ReferralSourcesProductivityDetailedBeta' ||
                  reportName == 'GrossDailyProductionCollectionSummary' ||
                  reportName == 'PaymentLocationReconciliation' ||
                  reportName == 'ScheduledAppointments' ||
                  reportName == 'ScheduledAppointmentsBeta' ||
                  reportName == 'GrossPerformanceByProviderSummary' ||
                  reportName == 'EncountersByPayment' ||
                  reportName == 'NewPatientsByComprehensiveExam' ||
                  reportName == 'PaymentReconciliationBeta' ||
                  reportName == 'ReceivablesByAccountBeta' ||
                  reportName == 'PaymentLocationReconciliationBeta' ||
                  reportName == 'PatientsWithRemainingBenefits' ||
                  reportName == 'ProjectedNetProductionBeta' ||
                  reportName == 'ReferredPatient' ||
                  reportName == 'DaySheet' ||
                  reportName == 'ProposedTreatment' ||
                  reportName == 'ProposedTreatmentBeta' ||
                  reportName == 'EncountersByFeeSchedule' ||
                  reportName == 'TreatmentPlanPerformance' ||
                  reportName == 'PatientsClinicalNotes' ||
                  reportName == 'PatientsByAdditionalIdentifiers' ||
                  reportName == "UnassignedUnappliedCredits" ||
                  reportName == "ServiceCodeByServiceTypeProductivity" ||
                  reportName == "ServiceCodeProductivityByProvider" ||
                  reportName == "FeeScheduleAnalysisByCarriers" ||
                  reportName == "ServiceCodeFeesByFeeSchedules" ||
                  reportName == "ProductionException" ||
                  reportName == "CollectionsByServiceDates" ||
                  reportName == "MedicalHistoryFormAnswer" ||
                  reportName == "ServicesHistory" ||
                  reportName == "ServiceTransactionsWithDiscount" ||
                  reportName == "ReferralSourceProductivitySummary" ||
                  reportName == "FeeException" ||
                  reportName == "CarriersProductivityAnalysis" ||
                  reportName == "CarriersProductivityAnalysisDetailed" ||
                  reportName == "TreatmentPlanProvidersReconciliation" ||
                  reportName == "ReceivableByProvider" ||
                  reportName == "PatientsByPatientGroup" ||
                  reportName == "PeriodReconciliations" ||
                  reportName == "PatientByFlags" ||
                  reportName == "ActivityLogs" ||
                  reportName == "ActivityLogsAsync" ||
                  reportName == "NewPatientSeen" ||
                  reportName == "PatientSeen" ||
                  reportName == "PatientsByLastServiceDates" ||
                  reportName == "ReferralSourceProductivity" ||
                  reportName == "PatientsByDiscounts" ||
                  reportName == "PatientsByMedicalHistoryAlert" ||
                  reportName == "PatientsByFeeSchedules" ||
                  reportName == "ReferralAffiliates" ||
                  reportName == "BenefitPlansByAdjustmentTypes" ||
                  reportName == "AppointmentsTimeElapsed" ||
                  reportName == "ProvidersServiceHistory" ||
                  reportName == "DeletedTransaction" ||
                  reportName == "PendingClaim" ||
                  reportName == "ServiceCodeFeesByLocations" ||
                  reportName == "CollectionAtCheckout" ||
                  reportName == "PatientsWithPendingEncounter" ||
                  reportName == "BenefitPlansByInsurancePaymentTypes" ||
                  reportName == "FeeSchedulesMaster" ||
                  reportName == "ServiceTypesProductivity" ||
                  reportName == "PatientsByBenefitPlans"
              ) {
                  var asyncBlobId = "";
                  if (Object.keys(filters).length !== 0){
                    const hash = window.location.hash;                    
                    if (hash) {
                        const queryParams = hash.split('?')[1];      
                        if (queryParams) {
                            const urlParams = new URLSearchParams(queryParams);
                            asyncBlobId = urlParams.get('bid');
                        }
                    }
                  }
                  
                  if (asyncBlobId != null && asyncBlobId != undefined && asyncBlobId != '' && Object.keys(filters).length !== 0 
                      && (sessionStorage.getItem(asyncBlobId + '_loaded') == null || sessionStorage.getItem(asyncBlobId + '_loaded') == 'false')) {
                        
                    reportsService
                      .GetReportDataFromBlob({ route: reportName }, {fileName: asyncBlobId + '_rawdata'})
                      .$promise.then(
                        function (res) {
                          promise = $.extend(promise, { values: res.Rows[0] });
                          defer.resolve(res);
                        },
                        function (res) {
                          promise = $.extend(promise, { values: res.Rows[0] });
                          defer.resolve();
                          toastrFactory.error(
                            localize.getLocalizedString('{0} {1}', [
                              'Report',
                              'failed to load.',
                            ]),
                            localize.getLocalizedString('Server Error')
                          );
                        }
                      );
                  } else{
                    reportingAPIService
                    .save({ route: reportName }, filters)
                    .$promise.then(
                        function (res) {
                            promise = $.extend(promise, { values: res.Value });
                            defer.resolve(res);
                        },
                        function (res) {
                            promise = $.extend(promise, { values: res.Value });
                            defer.resolve();
                            toastrFactory.error(
                                localize.getLocalizedString('{0} {1}', [
                                    'Report',
                                    'failed to load.',
                                ]),
                                localize.getLocalizedString('Server Error')
                            );
                        }
                    );
                  }
              }
              else if (reportName == "PatientByBenefitPlans" ||
                  reportName == "PatientsByFlagsBeta" ||
                  reportName == "PatientsByPatientGroupsBeta" ||                  
                  reportName == "NewPatientsSeenBeta" ||
                  reportName == "Carrier"
              ) {

                  const responseStructure = {
                      Value: null,
                  };

                  if (Object.keys(filters).length > 0) {
                      fuseReportingHttpService.getReportData(filters, reportName).subscribe({
                          next: data => {
                              responseStructure.Value = data;
                              promise = $.extend(promise, { values: responseStructure.Value });
                              defer.resolve(responseStructure);
                          },
                          error: error => {
                              promise = $.extend(promise, { values: error.Value });
                              defer.resolve();
                              if (error.statusText != "OK") {
                                  toastrFactory.error(
                                      localize.getLocalizedString('{0} {1}', [
                                          'Report',
                                          'failed to load.',
                                      ]),
                                      localize.getLocalizedString('Server Error')
                                  );
                              }
                          }
                      });
                  } else {
                      var userPractice = JSON.parse(sessionStorage.getItem('userPractice'));

                      responseStructure.Value = {
                          "generatedAtDateTime": new Date(),
                          "generatedByUserCode": "",
                          "locationOrPracticeEmail": "",
                          "locationOrPracticeName": userPractice.name,
                          "locationOrPracticePhone": userPractice.phone1,
                          "reportTitle": sessionStorage.getItem('fuseReportTitle')
                      }

                      promise = $.extend(promise, { values: responseStructure.Value });
                      defer.resolve(responseStructure);
                  }
              }
              else {
                  reportsService.save({ route: reportName }, filters).$promise.then(
                      function (res) {
                          promise = $.extend(promise, { values: res.Value });
                          defer.resolve(res);
                      },
                      function (res) {
                          promise = $.extend(promise, { values: res.Value });
                          defer.resolve();
                          toastrFactory.error(
                              localize.getLocalizedString('{0} {1}', [
                                  'Report',
                                  'failed to load.',
                              ]),
                              localize.getLocalizedString('Server Error')
                          );
                      }
                  );
              }
          }
          else if (filters == null && (reportName == "BenefitPlansByFeeScheduleBeta" || reportName == "BenefitPlansByCarrierBeta")) {
              const responseStructure = {
                  Value: null,
              };

              fuseReportingHttpService.getReportData(filters, reportName).subscribe({
                  next: data => {
                      responseStructure.Value = data;
                      promise = $.extend(promise, { values: responseStructure.Value });
                      defer.resolve(responseStructure);
                  },
                  error: error => {
                      promise = $.extend(promise, { values: error.Value });
                      defer.resolve();
                      if (error.statusText != "OK") {
                          toastrFactory.error(
                              localize.getLocalizedString('{0} {1}', [
                                  'Report',
                                  'failed to load.',
                              ]),
                              localize.getLocalizedString('Server Error')
                          );
                      }
                  }
              });

          }
          else if (filters == null && reportName == "AccountsWithOffsettingProviderBalances" || reportName == "FeeSchedulesByCarriers" || reportName == "PatientByCarrier" || reportName == "BenefitPlansByFeeSchedules") {
          reportingAPIService
              .save({ route: reportName }, filters)
              .$promise.then( 
                  function (res) {
                      promise = $.extend(promise, { values: res.Value });
                      defer.resolve(res);
                  },
                  function (res) {
                      promise = $.extend(promise, { values: res.Value });
                      defer.resolve();
                      toastrFactory.error(
                          localize.getLocalizedString('{0} {1}', [
                              'Report',
                              'failed to load.',
                          ]),
                          localize.getLocalizedString('Server Error')
                      );
                  }
              );
      }
      else {
        reportsService.get({ route: reportName }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve();
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Report',
                'failed to load.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };
    //save user defined filters
    var saveFilters = function (filters, reportName) {
      var defer = $q.defer();
      var promise = defer.promise;
      var reportContext = getReportContext();
      // if (filters) {
      reportsService
        .AddUserDefinedFilter({ route: reportName }, filters)
        .$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Filters Saved Successfully')
            );
          },
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve();
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Report',
                'failed to load.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      // }
      return promise;
    };

    var deleteCustomReport = function (customReportId) {
      var defer = $q.defer();
      var promise = defer.promise;
      reportsService
        .DeleteCustom({ customReportId: customReportId })
        .$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Report Deleted Successfully')
            );
          },
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Report',
                'failed to delete.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      return promise;
    };

    var addPrintedReportActivityEvent = function (reportId, isCustomReport) {
      var defer = $q.defer();
      var promise = defer.promise;

      reportsService
        .AddPrintedReportActivityEvent({
          reportId: reportId,
          isCustomReport: isCustomReport,
        })
        .$promise.then(function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        });

      return promise;
    };

    var addExportedReportActivityEvent = function (reportId, isCustomReport) {
      var defer = $q.defer();
      var promise = defer.promise;

      reportsService
        .AddExportedReportActivityEvent({
          reportId: reportId,
          isCustomReport: isCustomReport,
        })
        .$promise.then(function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        });

      return promise;
    };

    var addViewedReportActivityEvent = function (reportId, isCustomReport) {
      var defer = $q.defer();
      var promise = defer.promise;

      reportsService
        .AddViewedReportActivityEvent({
          reportId: reportId,
          isCustomReport: isCustomReport,
        })
        .$promise.then(function (res) {
          promise = $.extend(promise, { values: res.Value });
          defer.resolve(res);
        });

      return promise;
    };

    var getSummaryViewData = function (data, id, reportIds) {
      switch (id) {
        case reportIds.AdjustmentsByTypeReportId:
          data.isSummaryView = true;
          _.each(data.Locations, function (loc) {
            _.each(loc.AdjustmentTypes, function (adj) {
              _.each(adj.Dates, function (date) {
                date.AdjustmentRecords = [];
                delete date.Date;
              });
            });
          });
          return data;

        case reportIds.NetProductionByProviderReportId:
          data.isSummaryView = true;
          _.each(data.Providers, function (pro) {
            pro.Transactions = [];
          });
          return data;
        case reportIds.NetCollectionByProviderReportId:
          data.isSummaryView = true;
          _.each(data.Providers, function (pro) {
            pro.Transactions = [];
          });
          return data;
        case reportIds.PaymentReconciliationReportId:
        case reportIds.PaymentReconciliationBetaReportId:
          data.isSummaryView = true;
          _.each(data.Locations, function (loc) {
            _.each(loc.PaymentTypes, function (pay) {
              pay.Payments = [];
            });
          });
          return data;
        case reportIds.AdjustmentsByProviderReportId:
          data.isSummaryView = true;
          _.each(data.ProviderDetails, function (pro) {
            pro.Transactions = [];
          });
          return data;
        case reportIds.ServiceTransactionsWithDiscountsReportId:
          case reportIds.ServiceTransactionsWithDiscountsBetaReportId:
          _.each(data.Locations, function (loc) {
            loc.Dates = [];
          });
          return data;
        case reportIds.DeletedTransactionsReportId:
        case reportIds.DeletedTransactionsBetaReportId:
          data.isSummaryView = true;
          return data;
        case reportIds.FeeExceptionsReportId:
        case reportIds.FeeExceptionsBetaReportId:
          data.isSummaryView = true;
          _.each(data.Dates, function (pro) {
            pro.Transactions = [];
          });
          return data;
        case reportIds.ReceivablesByProviderReportId:
          data.isSummaryView = true;
          _.each(data.Locations, function (loc) {
            _.each(loc.Providers, function (pro) {
              pro.ResponsibleParties = [];
            });
          });
          return data;

        case reportIds.ReceivablesByAccountId:
        case reportIds.ReceivablesByAccountBetaId:
          data.isSummaryView = true;
          _.each(data.Locations, function (loc) {
            loc.ResponsibleParties = [];
          });
          return data;
        case reportIds.CollectionsAtCheckoutReportId:
        case reportIds.CollectionAtCheckoutBetaReportId:
          data.isSummaryView = true;
          _.each(data.Locations, function (loc) {
            loc.Dates = [];
          });
          return data;
        case reportIds.PaymentLocationReconciliationReportId:
        case reportIds.PaymentLocationReconciliationBetaReportId:
          data.isSummaryView = true;
          _.each(data.Locations, function (loc) {
            _.each(loc.PaymentTypes, function (pay) {
              pay.Payments = [];
            });
          });
          return data;
        case reportIds.ServiceCodeProductivityByProviderReportId:
              data.isSummaryView = true;
              _.each(data.ProviderDetails, function (pov) {
                  _.each(pov.ServiceTypes, function (pay) {
                      pay.Details = [];
                  });
              });
            return data;
      }
    };

    return {
      GetAmfa: function () {
        return sessionStorage.getItem('reportAmfa');
      },
      SetAmfa: function (amfa) {
        sessionStorage.setItem('reportAmfa', amfa);
      },
      GetFiltersApplied: function () {
        return sessionStorage.getItem('reportFilterApplied')
          ? JSON.parse(sessionStorage.getItem('reportFilterApplied'))
          : sessionStorage.getItem('reportFilterApplied');
      },
      SetFiltersApplied: function (filters) {
        filters
          ? sessionStorage.setItem(
            'reportFilterApplied',
            JSON.stringify(filters)
          )
          : sessionStorage.setItem('reportFilterApplied', filters);
      },
      GetReportPath: function () {
        return sessionStorage.getItem('reportPath');
      },
      SetReportPath: function (reportPath) {
        sessionStorage.setItem('reportPath', reportPath);
      },
      GetRequestBodyProperties: function () {
        return sessionStorage.getItem('reportBodyProperties')
          ? JSON.parse(sessionStorage.getItem('reportBodyProperties'))
          : sessionStorage.getItem('reportBodyProperties');
      },
      SetRequestBodyProperties: function (bodyProperties) {
        bodyProperties
          ? sessionStorage.setItem(
            'reportBodyProperties',
            JSON.stringify(bodyProperties)
          )
          : sessionStorage.setItem('reportBodyProperties', bodyProperties);
      },
      GetReportId: function () {
        return sessionStorage.getItem('reportId');
      },
      SetReportId: function (id) {
        sessionStorage.setItem('reportId', id);
      },
      GetFuseReportTitle: function () {
        return sessionStorage.getItem('fuseReportTitle');
      },
      SetFuseReportTitle: function (reportName) {
        sessionStorage.setItem('fuseReportTitle', reportName);
      },
      GetListOfAvailableReports: function () {
        return getListOfAvailableReports();
      },
      GenerateReport: function (filters, reportName) {
        return generateReport(filters, reportName);
      },
      SaveFilters: function (filters, reportName) {
        return saveFilters(filters, reportName);
      },
      GetSpecificReports: function (reportIds) {
        return getSpecificReports(reportIds);
      },
      GetReportArray: function (reportIds) {
        return getReportArray(reportIds);
      },
      getReportArrayPromise: function (reportIds) {
        return getReportArrayPromise(reportIds);
      },
      GetAmfaAbbrev: function (actionId) {
        return getAmfaAbbrev(actionId);
      },
      OpenReportPage: function (report, path, notFromDashBoard) {
        openReportPage(report, path, notFromDashBoard);
      },
      OpenReportPageSameTab: function (report, path, notFromDashBoard, blobId) {
        openReportPageSameTab(report, path, notFromDashBoard, blobId);
      },
      OpenReportPageWithContext: function (report, path, context) {
        openReportPageWithContext(report, path, context);
      },
      DeleteCustomReport: function (customReportId) {
        return deleteCustomReport(customReportId);
      },
      SetReportCategoryId: function (categoryId) {
        sessionStorage.setItem('reportCategoryId', categoryId);
      },
      GetReportCategoryId: function () {
        return sessionStorage.getItem('reportCategoryId');
      },
      AddPrintedReportActivityEvent: function (reportId, isCustomReport) {
        return addPrintedReportActivityEvent(reportId, isCustomReport);
      },
      AddExportedReportActivityEvent: function (reportId, isCustomReport) {
        return addExportedReportActivityEvent(reportId, isCustomReport);
      },
      AddViewedReportActivityEvent: function (reportId, isCustomReport) {
        return addViewedReportActivityEvent(reportId, isCustomReport);
      },
      GetReportContext: function () {
        return getReportContext();
      },
      ClearReportContext: function () {
        return clearReportContext();
      },
      SetNavigationFrom: function (bool) {
        sessionStorage.setItem('fromDashboard', bool);
      },
      GetNavigationFrom: function () {
        return sessionStorage.getItem('fromDashboard');
      },
      getSummaryViewData: function (data, reportId, reportIds) {
        return getSummaryViewData(data, reportId, reportIds);
      },
    };
  },
]);

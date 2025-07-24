describe('report-export-controller ->', function () {
  var ctrl,
    scope,
    parentScope,
    routeParams,
    reportsFactory,
    localize,
    q,
    filter,
    deferred;

  routeParams = {
    ReportName: 'AdjustmentsByType',
  };

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      reportsFactory = {
        AddExportedReportActivityEvent: jasmine
          .createSpy()
          .and.callFake(function () {
            var addExportedReportActivityEvent = q.defer();
            addExportedReportActivityEvent.resolve(1);
            return {
              result: addExportedReportActivityEvent.promise,
              then: function () {},
            };
          }),
      };
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q, $filter) {
    q = $q;
    filter = $filter;
    scope = $rootScope.$new();
    parentScope = $rootScope.$new();
    $rootScope.reportIds = {
      ActivityLogReportId: 24,
      AdjustmentsByProviderReportId: 22,
      AdjustmentsByTypeReportId: 60,
      AppointmentTimeElapsedReportId: 46,
      AppointmentsReportId: 41,
      CarrierProductivityAnalysisDetailedReportId: 35,
      CarrierProductivityAnalysisReportId: 33,
      CarriersReportId: 9,
      CollectionsAtCheckoutReportId: 42,
      CollectionsByServiceDateReportId: 47,
      DailyProductionCollectionSummaryReportId: 53,
      DaySheetReportId: 19,
      DeletedTransactionsReportId: 32,
      EncountersByFeeScheduleReportId: 48,
      FeeExceptionsReportId: 26,
      FeeScheduleAnalysisByCarrier: 37,
      FeeScheduleMasterReportId: 11,
      MedicalHistoryFormAnswersReportId: 59,
      NetCollectionByProviderReportId: 23,
      NetProductionByProviderReportId: 21,
      NewPatientsByComprehensiveExamReportId: 16,
      NewPatientsSeenReportId: 49,
      PatientAnalysisReportId: 58,
      PatientAnalysisBetaReportId: 66,
      PatientsByAdditionalIdentifiersReportId: 13,
      PatientsByBenfitPlansReportId: 6,
      PatientsByDiscountReportId: 3,
      PatientsByFeeScheduleReportId: 7,
      PatientsByFlagsReportId: 52,
      PatientsByLastServiceDateReportId: 57,
      PatientsByMedicalHistoryAlertsReportId: 55,
      PatientsByPatientGroupsReportId: 51,
      PatientsSeenReportId: 14,
      PatientsWithPendingEncountersReportId: 8,
      PatientsWithRemainingBenefitsReportId: 40,
      PaymentReconciliationReportId: 50,
      PendingClaimsReportId: 36,
      PerformanceByProviderDetailsReportId: 18,
      PerformanceByProviderSummaryReportId: 1,
      PeriodReconciliationReportId: 45,
      ProductionExceptionsReportId: 30,
      ProjectedNetProductionReportId: 56,
      ProposedTreatmentReportId: 61,
      ProviderServiceHistoryReportId: 29,
      ReceivablesByProviderReportId: 54,
      ReferralSourcesProductivityDetailedReportId: 39,
      ReferralSourcesProductivitySummaryReportId: 43,
      ReferredPatientsReportId: 15,
      ServiceCodeFeesByFeeScheduleReportId: 25,
      ServiceCodeFeesByLocationReportId: 12,
      ServiceCodeProductivityByProviderReportId: 20,
      ServiceCodeByServiceTypeProductivityReportId: 17,
      ServiceHistoryReportId: 27,
      ServiceTransactionsWithDiscountsReportId: 44,
      ServiceTypeProductivityReportId: 31,
      TreatmentPlanPerformanceReportId: 34,
      TreatmentPlanProviderReconciliationReportId: 38,
      UnassignedUnappliedCreditsReportId: 28,
      ReceivablesByAccountId: 62,
      CreditDistributionHistoryReportId: 64,
      PotentialDuplicatePatientsReportId: 65,
      ReferralSourcesProductivityDetailedBetaReportId: 113,
      PaymentReconciliationBetaReportId: 114,
      ReceivablesByAccountBetaId: 115,
      ProjectedNetProductionBetaReportId: 102,
      PaymentLocationReconciliationBetaReportId: 116,
      ReferredPatientsBetaReportId: 120,
      AppointmentsBetaReportId: 122,
      CreditDistributionHistoryBetaReportId: 123,
      ProposedTreatmentBetaReportId: 124,
      ServiceCodeByServiceTypeProductivityBetaReportId: 127,
      AccountWithOffsettingProviderBalancesBetaReportId: 128,
      ServiceCodeProductivityByProviderBetaReportId: 129,
    };
    $rootScope.data = {};
    scope.$parent = parentScope;
    scope.isCustomReport = false;

    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (val) {
          return val;
        }),
    };

    scope = $rootScope.$new();
    ctrl = $controller('ReportExportController', {
      $scope: scope,
      $location: location,
      $routeParams: routeParams,
      ReportsFactory: reportsFactory,
      localize: localize,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(routeParams).not.toBeNull();
      expect(reportsFactory).not.toBeNull();
      expect(localize).not.toBeNull();
    });
  });

  describe('ctrl.formatMonetaryColumnValue -> ', function () {
    it('ctrl.formatMonetaryColumnValue should be called with positive number', function () {
      var value = '1234';
      var result = ctrl.formatMonetaryColumnValue(value);
      expect(result).toEqual('"$1,234.00"');
    });

    it('ctrl.formatMonetaryColumnValue should be called with negative number', function () {
      var value = '-1234';
      var result = ctrl.formatMonetaryColumnValue(value);
      expect(result).toEqual('"($1,234.00)"');
    });
  });

  describe('ctrl.buildStringFromColumns -> ', function () {
    it('ctrl.buildStringFromColumns should be called ', function () {
      var columns = [
        '"Default Practice - MB"',
        '"Collection Positive"',
        '"Positive"',
        '"Collection"',
        '11/2/2018',
        '"Patient2, Patient2 D. Mr - PATPA3"',
        '"Kirkland, Malaysia - KIRMA1"',
        '"DELETED - Collection Positive - test"',
        '($124.00)',
      ];

      var string =
        '"Default Practice - MB","Collection Positive","Positive","Collection",11/2/2018,"Patient2, Patient2 D. Mr - PATPA3","Kirkland, Malaysia - KIRMA1","DELETED - Collection Positive - test",($124.00)';
      string = string.concat('\r\n');
      var result = ctrl.buildStringFromColumns(columns);
      expect(result).toEqual(string);
    });
  });

  describe('ctrl.formatColumnValue -> ', function () {
    it('ctrl.formatColumnValue should be called ', function () {
      var value = 'Location';
      var result = ctrl.formatColumnValue(value);
      expect(result).toEqual('"Location"');
    });
  });

  describe('ctrl.getArrayKeys -> ', function () {
    it('ctrl.getArrayKeys should be called ', function () {
      var array = [
        {
          Amount: 124,
          Location: 'Default Practice - MB',
          AdjustmentTypes: [
            {
              AdjustmentCount: 1,
              AdjustmentType: 'Adj Negative',
              Amount: 0,
              Dates: [
                {
                  Date: '2018-10-22T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
              ],
              Impaction: 'Adjustment',
              PositiveNegative: 'Negative',
            },
            {
              AdjustmentCount: 6,
              AdjustmentType: 'Collection Positive',
              Amount: 0,
              Dates: [
                {
                  Date: '2018-11-01T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-11-01T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-11-02T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-12-11T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-12-11T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-12-12T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
              ],
              Impaction: 'Collection',
              PositiveNegative: 'Positive',
            },
            {
              AdjustmentCount: 5,
              AdjustmentType: 'Prod Positive',
              Amount: 124,
              Dates: [
                {
                  Date: '2018-11-02T00:00:00',
                  Amount: 124,
                  AdjustmentCount: 1,
                  AdjustmentRecords: Array(1),
                },
                {
                  Date: '2018-12-05T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-12-05T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-12-05T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
                {
                  Date: '2018-12-06T00:00:00',
                  Amount: 0,
                  AdjustmentCount: 2,
                  AdjustmentRecords: Array(2),
                },
              ],
              Impaction: 'Production',
              PositiveNegative: 'Positive',
            },
          ],
        },
      ];
      var skipEndLine = false;
      var string =
        '"Amount","Location","Adjustment Count","Adjustment Type","Amount","Impaction","Positive Negative","Date","Amount","Adjustment Count",';
      string = string.concat('\r\n');
      var result = ctrl.getArrayKeys(array, skipEndLine);
      expect(result).toEqual(string);
    });
  });

  describe('ctrl.monetizeColumnInString -> ', function () {
    it('ctrl.monetizeColumnInString should be called ', function () {
      var columnNumbers = [8];
      var line =
        '"Default Practice - MB","Adj Negative","Negative","Adjustment",10/22/2018,"Dornala, Jagadeesh D. Mr - DORJA1","Swift, Mary Beth - SWIMA1","Adj Negative",5540';
      line = line.concat('\r\n');
      var output =
        '"Default Practice - MB","Adj Negative","Negative","Adjustment",10/22/2018,"Dornala, Jagadeesh D. Mr - DORJA1","Swift, Mary Beth - SWIMA1","Adj Negative","$5,540.00"';
      output = output.concat('\r\n');
      var result = ctrl.monetizeColumnInString(line, columnNumbers);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.removeColumnFromString -> ', function () {
    it('ctrl.removeColumnFromString should be called ', function () {
      var columnNumbers = [1, 5, 6, 8, 9];
      var string =
        '"Default Practice - MB",124,"Adj Negative","Negative","Adjustment",0,1,10/22/2018,0,2,"Dornala, Jagadeesh D. Mr - DORJA1","Swift, Mary Beth - SWIMA1","Adj Negative",-5540';
      string = string.concat('\r\n');
      var output =
        '"Default Practice - MB","Adj Negative","Negative","Adjustment",10/22/2018,"Dornala, Jagadeesh D. Mr - DORJA1","Swift, Mary Beth - SWIMA1","Adj Negative",-5540';
      output = output.concat('\r\n');
      var result = ctrl.removeColumnFromString(string, columnNumbers);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.splitStringIntoColumnArray -> ', function () {
    it('ctrl.splitStringIntoColumnArray should be called ', function () {
      var line =
        '"Default Practice - MB",124,"Adj Negative","Negative","Adjustment",0,1,10/22/2018,0,2,"Dornala, Jagadeesh D. Mr - DORJA1","Swift, Mary Beth - SWIMA1","Adj Negative",-5540';
      line = line.concat('\r\n');
      var output = [
        '"Default Practice - MB"',
        '124',
        '"Adj Negative"',
        '"Negative"',
        '"Adjustment"',
        '0',
        '1',
        '10/22/2018',
        '0',
        '2',
        '"Dornala, Jagadeesh D. Mr - DORJA1"',
        '"Swift, Mary Beth - SWIMA1"',
        '"Adj Negative"',
        '-5540',
      ];
      var result = ctrl.splitStringIntoColumnArray(line);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.ConstructHeaderString -> ', function () {
    it('ctrl.ConstructHeaderString should be called ', function () {
      var headerArray = [
        'Provider',
        'Date',
        'Patient',
        'Description',
        'Tooth',
        'Area',
        'Location',
        'Production',
        'Adjustments',
        'Net Production',
      ];

      var output =
        'Provider,Date,Patient,Description,Tooth,Area,Location,Production,Adjustments,Net Production';
      output = output.concat('\r\n');
      var result = ctrl.ConstructHeaderString(headerArray);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.createBasicTotalsString -> ', function () {
    it('ctrl.createBasicTotalsString should be called ', function () {
      var totalsStringHeader = 'Totals';
      var numberOfCommas = 7;
      var columnsToMonetize = [7, 8, 9];
      var dtoProperties = [1, 2, 3];
      var output = '';
      output = output.concat('\r\n');
      output = output.concat('Totals,,,,,,,');
      var result = ctrl.createBasicTotalsString(
        totalsStringHeader,
        numberOfCommas,
        columnsToMonetize,
        dtoProperties
      );
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.monetizeFinancialReport -> ', function () {
    it('ctrl.monetizeFinancialReport should be called ', function () {
      var columnNumbers = [7, 8, 9];
      var totalsString = '';
      totalsString = totalsString.concat('\r\n');
      totalsString = totalsString.concat('Totals,,,,,,,$60.00,$0.00,$60.00,');
      var object1 = 'Brown, Ruby - BRORU1",,,,,,,0,0,0';
      object1 = object1.concat('\r\n');
      var object2 = 'Flores, Cody - FLOCO1",,,,,,,0,0,0';
      object2 = object2.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.monetizeFinancialReport(
        array,
        columnNumbers,
        totalsString
      );
      expect(result[0]).toEqual(object1);
      expect(result[1]).toEqual(object2);
      expect(result[2]).toEqual(totalsString);
    });
  });

  describe('ctrl.monetizeColumnInArray -> ', function () {
    it('ctrl.monetizeColumnInArray should be called ', function () {
      var columnNumbers = [7, 8, 9];
      var object1 =
        '"Brown, Ruby - BRORU1",10/1/2018,"Krish, Rams - KRIRA1","D0150: comprehensive oral evaluation - new or established patient (D0150)",N/A,N/A,"Default Practice - MB",444,0,444';
      object1 = object1.concat('\r\n');
      var object2 =
        '"Dickson, Khloe - DICKH1",10/1/2018,"Krish, Rams - KRIRA1","D0120: periodic oral evaluation - established patient (D0120)",N/A,N/A,"Default Practice - MB",50,0,50';
      object2 = object2.concat('\r\n');
      var object3 =
        '"Brown, Ruby - BRORU1",10/1/2018,"Krish, Rams - KRIRA1","D0150: comprehensive oral evaluation - new or established patient (D0150)",N/A,N/A,"Default Practice - MB",$444.00,$0.00,$444.00';
      object3 = object3.concat('\r\n');
      var object4 =
        '"Dickson, Khloe - DICKH1",10/1/2018,"Krish, Rams - KRIRA1","D0120: periodic oral evaluation - established patient (D0120)",N/A,N/A,"Default Practice - MB",$50.00,$0.00,$50.00';
      object4 = object4.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.monetizeColumnInArray(array, columnNumbers);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });

  describe('ctrl.addPercentToColumnInArray -> ', function () {
    it('ctrl.addPercentToColumnInArray should be called ', function () {
      var columnNumbers = [6];
      var object1 =
        '"Jagadeesh","D0140","D0140","limited oral evaluation - problem focused",$100.00,$50.00,50';
      object1 = object1.concat('\r\n');
      var object2 =
        '"Jagadeesh","D0145","D0145","oral evaluation for a patient under three years of ago and counseling with primary caregiver",$100.00,$50.00,50';
      object2 = object2.concat('\r\n');
      var object3 =
        '"Jagadeesh","D0140","D0140","limited oral evaluation - problem focused",$100.00,$50.00,50%';
      object3 = object3.concat('\r\n');
      var object4 =
        '"Jagadeesh","D0145","D0145","oral evaluation for a patient under three years of ago and counseling with primary caregiver",$100.00,$50.00,50%';
      object4 = object4.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.addPercentToColumnInArray(array, columnNumbers);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });

  describe('ctrl.addPercentToColumnInString -> ', function () {
    it('ctrl.addPercentToColumnInString should be called ', function () {
      var columnNumbers = [6];
      var line =
        '"Jagadeesh","D0140","D0140","limited oral evaluation - problem focused",$100.00,$50.00,50';
      line = line.concat('\r\n');
      var output =
        '"Jagadeesh","D0140","D0140","limited oral evaluation - problem focused",$100.00,$50.00,50%';
      output = output.concat('\r\n');
      var result = ctrl.addPercentToColumnInString(line, columnNumbers);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.addAreaToColumnInArray -> ', function () {
    it('ctrl.addAreaToColumnInArray should be called ', function () {
      var columnNumbers = [4];
      var object1 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",12,45,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object1 = object1.concat('\r\n');
      var object2 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",2,26,8,N/A,N/A,"N/A","The report Net Production by Provider was viewed.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object2 = object2.concat('\r\n');
      var object3 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,45,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object3 = object3.concat('\r\n');
      var object4 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Business,26,8,N/A,N/A,"N/A","The report Net Production by Provider was viewed.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object4 = object4.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.addAreaToColumnInArray(array, columnNumbers);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });

  describe('ctrl.addAreaToColumnInString -> ', function () {
    it('ctrl.addAreaToColumnInString should be called ', function () {
      var columnNumbers = [4];
      var line =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",12,45,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      line = line.concat('\r\n');
      var output =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,45,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      output = output.concat('\r\n');
      var result = ctrl.addAreaToColumnInString(line, columnNumbers);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.addTypeToColumnInArray -> ', function () {
    it('ctrl.addTypeToColumnInArray should be called ', function () {
      var columnNumbers = [5];
      var object1 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,45,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object1 = object1.concat('\r\n');
      var object2 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Business,26,8,N/A,N/A,"N/A","The report Net Production by Provider was viewed.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object2 = object2.concat('\r\n');
      var object3 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object3 = object3.concat('\r\n');
      var object4 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Business,Report,8,N/A,N/A,"N/A","The report Net Production by Provider was viewed.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object4 = object4.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.addTypeToColumnInArray(array, columnNumbers);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });

  describe('ctrl.addTypeToColumnInString -> ', function () {
    it('ctrl.addTypeToColumnInString should be called ', function () {
      var columnNumbers = [5];
      var line =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,45,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      line = line.concat('\r\n');
      var output =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      output = output.concat('\r\n');
      var result = ctrl.addTypeToColumnInString(line, columnNumbers);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.addActionToColumnInArray -> ', function () {
    it('ctrl.addActionToColumnInArray should be called ', function () {
      var columnNumbers = [6];
      var object1 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object1 = object1.concat('\r\n');
      var object2 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Business,Report,8,N/A,N/A,"N/A","The report Net Production by Provider was viewed.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object2 = object2.concat('\r\n');
      var object3 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,Logged In,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object3 = object3.concat('\r\n');
      var object4 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Business,Report,Viewed,N/A,N/A,"N/A","The report Net Production by Provider was viewed.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object4 = object4.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.addActionToColumnInArray(array, columnNumbers);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });

  describe('ctrl.addActionToColumnInString -> ', function () {
    it('ctrl.addActionToColumnInString should be called ', function () {
      var columnNumbers = [6];
      var line =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,9,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      line = line.concat('\r\n');
      var output =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,Logged In,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.","N/A","N/A","N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      output = output.concat('\r\n');
      var result = ctrl.addActionToColumnInString(line, columnNumbers);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.removeNasInArray -> ', function () {
    it('ctrl.removeNasInArray should be called ', function () {
      var columnNumbers = [7, 8, 11, 12];
      var object1 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,Logged In,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.",$NaN,$NaN,"N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object1 = object1.concat('\r\n');
      var object2 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Business,Report,Viewed,N/A,N/A,"N/A","The report Net Production by Provider was viewed.",$NaN,$NaN,"N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object2 = object2.concat('\r\n');
      var object3 =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,Logged In,,,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.",,,"N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object3 = object3.concat('\r\n');
      var object4 =
        '95840,02/27/2019 12:05 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Business,Report,Viewed,,,"N/A","The report Net Production by Provider was viewed.",,,"N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      object4 = object4.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.removeNasInArray(array, columnNumbers);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });

  describe('ctrl.removeNasFromColumnInString -> ', function () {
    it('ctrl.removeNasFromColumnInString should be called ', function () {
      var columnNumbers = [6];
      var line =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,Logged In,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.",$NaN,$NaN,"N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      line = line.concat('\r\n');
      var output =
        '95839,02/27/2019 12:03 pm,"Swift, Mary Beth - SWIMA1","Default Practice - MB",Practice and Locations,Login,Logged In,N/A,N/A,"N/A","The user Swift, Mary Beth - SWIMA1 logged into Fuse.",$NaN,$NaN,"N/A","00000000-0000-0000-0000-000000000000",01/01/0001 5:53 am';
      output = output.concat('\r\n');
      var result = ctrl.removeNasFromColumnInString(line, columnNumbers);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.addColumnInString -> ', function () {
    it('ctrl.addColumnInString should be called ', function () {
      var columnNumber = 10;
      var string = '';
      string = string.concat('\r\n');
      string = string.concat(
        'Report Totals,,,,,,,,,4,0,$0.00,10,"$1,722.82",$0.00,$0.00,'
      );
      var output =
        'Report Totals,,,,,,,,,4,,0,$0.00,10,"$1,722.82",$0.00,$0.00,';
      var result = ctrl.addColumnInString(columnNumber, string);
      expect(result).toEqual(output);
    });
  });

  describe('ctrl.removeColumnFromArray -> ', function () {
    it('ctrl.removeColumnFromArray should be called ', function () {
      var columnNumbers = [1, 2, 3, 4, 5, 6, 7];
      var object1 =
        '"Default Practice - MB",4,0,0,10,1722.82,0,0,"AdenWyatt Insurance Company","Warangal Hanamkonda","Hanamkonda","Jangaon","AK","11111","1111111111","06126",2,2,0,0,10,1722.82,0,0';
      object1 = object1.concat('\r\n');
      var object2 =
        '"Default Practice - MB",4,0,0,10,1722.82,0,0,"Jagadeesh Carrier","Jangaon","N/A","Hyderabad","AK","22222","1111111111","06126",1,0.19,0,0,0,0,0,0';
      object2 = object2.concat('\r\n');
      var object3 =
        '"Default Practice - MB","AdenWyatt Insurance Company","Warangal Hanamkonda","Hanamkonda","Jangaon","AK","11111","1111111111","06126",2,2,0,0,10,1722.82,0,0';
      object3 = object3.concat('\r\n');
      var object4 =
        '"Default Practice - MB","Jagadeesh Carrier","Jangaon","N/A","Hyderabad","AK","22222","1111111111","06126",1,0.19,0,0,0,0,0,0';
      object4 = object4.concat('\r\n');
      var array = [object1, object2];
      var result = ctrl.removeColumnFromArray(array, columnNumbers);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });
  describe('ctrl.convertArrayToCSV -> ', function () {
    it('ctrl.convertArrayToCSV should be called ', function () {
      scope.ReportId = 60;
      var array = [
        {
          AdjustmentTypes: [
            {
              AdjustmentCount: 1,
              AdjustmentType: 'Adj Negative',
              Amount: 0,
              Dates: [
                {
                  AdjustmentCount: 2,
                  AdjustmentRecords: [
                    {
                      Amount: -5540,
                      Description: 'Adj Negative',
                      Provider: 'Swift, Mary Beth - SWIMA1',
                      ResponsibleParty: 'Dornala, Jagadeesh D. Mr - DORJA1',
                    },
                    {
                      Amount: 5540,
                      Description: 'DELETED - Adj Negative',
                      Provider: 'Swift, Mary Beth - SWIMA1',
                      ResponsibleParty: 'Dornala, Jagadeesh D. Mr - DORJA1',
                    },
                  ],
                  Amount: 0,
                  Date: '2018-10-22T00:00:00',
                },
              ],
              Impaction: 'Adjustment',
              PositiveNegative: 'Negative',
            },
          ],
          Amount: 124,
          Location: 'Default Practice - MB',
        },
      ];
      var object3 =
        '124,"Default Practice - MB",1,"Adj Negative",0,"Adjustment","Negative",2,0,10/22/2018,-5540,"Adj Negative","Swift, Mary Beth - SWIMA1","Dornala, Jagadeesh D. Mr - DORJA1"';
      object3 = object3 + '\r\n';
      var object4 =
        '124,"Default Practice - MB",1,"Adj Negative",0,"Adjustment","Negative",2,0,10/22/2018,5540,"DELETED - Adj Negative","Swift, Mary Beth - SWIMA1","Dornala, Jagadeesh D. Mr - DORJA1"';
      object4 = object4.concat('\r\n');
      var result = ctrl.convertArrayToCSV(array);
      expect(result[0]).toEqual(object3);
      expect(result[1]).toEqual(object4);
    });
  });

  describe('ctrl.exportCSVAllDataComplete -> ', function () {    
    beforeEach(inject(function ($rootScope) {
      $rootScope.filterModels = {
        ReportView: {
          FilterString: 'Summary',
        },
      };
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      var mockElement = {
        setAttribute: jasmine.createSpy('element.setAttribute'),
        style: { display: '' },
        click: jasmine.createSpy('element.click'),
      };
      spyOn(document, 'createElement').and.returnValue(
        mockElement
      );      
    }));
    it('ctrl.exportCSVAllDataComplete should be called with reportId 23 and report view as summary', function () {
      scope.reportId = 23;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');      
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 21 and report view as summary', function () {
      scope.reportId = 21;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');      
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 50 and report view as summary', function () {
      scope.reportId = 50;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');      
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });
    it('ctrl.exportCSVAllDataComplete should be called with reportId 22 and report view as summary', function () {
      scope.reportId = 22;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');      
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });
    it('ctrl.exportCSVAllDataComplete should be called with reportId 44 and report view as summary', function () {
      scope.reportId = 44;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');      
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 32 and report view as summary', function () {
      scope.reportId = 32;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });
    it('ctrl.exportCSVAllDataComplete should be called with reportId 26 and report view as summary', function () {
      scope.reportId = 26;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 54 and report view as summary', function () {
      scope.reportId = 54;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 62 and report view as summary', function () {
      scope.reportId = 62;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });
  });

  describe('ctrl.exportCSVAllDataComplete -> ', function () {
    beforeEach(inject(function ($rootScope) {
      $rootScope.filterModels = {
        ReportView: {
          FilterString: undefined,
        },
      };
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      var mockElement = {
        setAttribute: jasmine.createSpy('element.setAttribute'),
        style: { display: '' },
        click: jasmine.createSpy('element.click'),
      };
      spyOn(document, 'createElement').and.returnValue(
        mockElement
      );      
    }));
    it('ctrl.exportCSVAllDataComplete should be called with reportId 1', function () {
      scope.reportId = 1;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    // Need to add one test to cover  Detailed and sumary view option
    it('ctrl.exportCSVAllDataComplete should be called with reportId 60', function () {
      scope.reportId = 60;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'removeColumnFromString');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      //expect(ctrl.removeColumnFromString).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 12', function () {
      scope.reportId = 12;
      spyOn(ctrl, 'monetizeColumnInArray');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeColumnInArray).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 17', function () {
      scope.reportId = 17;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'removeColumnFromString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.removeColumnFromString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 18', function () {
      scope.reportId = 18;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 19', function () {
      scope.reportId = 19;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 20', function () {
      scope.reportId = 20;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'removeColumnFromString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 21', function () {
      scope.reportId = 21;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 22', function () {
      scope.reportId = 22;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'removeColumnFromString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.removeColumnFromString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 23', function () {
      scope.reportId = 23;
      scope.$parent.filterModels.ReportView.FilterString = 'Summary';
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'ConstructHeaderString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.ConstructHeaderString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 25', function () {
      scope.reportId = 25;
      spyOn(ctrl, 'monetizeColumnInArray');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeColumnInArray).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 26', function () {
      scope.reportId = 26;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 29', function () {
      scope.reportId = 29;
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 30', function () {
      scope.reportId = 30;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 62', function () {
      scope.reportId = 62;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'createBasicTotalsString');
      spyOn(ctrl, 'removeColumnFromString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.createBasicTotalsString).toHaveBeenCalled();
      expect(ctrl.removeColumnFromString).toHaveBeenCalled();
    });

    it('ctrl.exportCSVAllDataComplete should be called with reportId 64', function () {
      scope.reportId = 64;
      spyOn(ctrl, 'removeColumnFromArray');
      spyOn(ctrl, 'monetizeFinancialReport');
      spyOn(ctrl, 'removeColumnFromString');
      ctrl.exportCSVAllDataComplete();
      expect(ctrl.removeColumnFromArray).toHaveBeenCalled();
      expect(ctrl.monetizeFinancialReport).toHaveBeenCalled();
      expect(ctrl.removeColumnFromString).toHaveBeenCalled();
    });
  });

  describe('ctrl.DeleteUnneededProperties -> ', function () {
    it('ctrl.DeleteUnneededProperties should be called ', function () {
      var headers = [
        'AccountBalance',
        'CurrentBalance',
        'BalanceThirty',
        'BalanceSixty',
        'BalanceNinety',
        'PatientPortion',
        'EstimatedInsurance',
        'EstimatedInsuranceAdjustments',
        'ProviderTotal',
      ];
      var array = {
        BalanceNinety: 2165437.5,
        BalanceThirty: 8101.33,
        CurrentBalance: -5953.71,
        EstimatedInsurance: 14379.28,
        EstimatedInsuranceAdjustments: 45065,
        Location: 'Default Practice - MB',
        PatientPortion: 2108140.84,
        ProviderTotal: 2167585.12,
        Providers: [
          {
            BalanceNinety: 301880,
            EstimatedInsurance: 7370,
            EstimatedInsuranceAdjustments: 43700,
            PatientPortion: 250810,
            Provider: 'Brown, Ruby - BRORU1',
            ProviderTotal: 301880,
            ResponsibleParties: [
              {
                ResponsibleParty: 'Acevedo, Callie - ACECA1',
                AccountBalance: 53990.11,
                BalanceNinety: 6087.5,
                PatientPortion: 6087.5,
                ProviderTotal: 6087.5,
              },
              {
                ResponsibleParty: 'Adams, Declan - ADADE1',
                AccountBalance: 25983.75,
                BalanceNinety: 3625,
                PatientPortion: 3625,
                ProviderTotal: 3625,
              },
              {
                ResponsibleParty: 'Banks, Jax - BANJA1',
                AccountBalance: 76947.5,
                BalanceNinety: 15805,
                PatientPortion: 15805,
                ProviderTotal: 15805,
              },
            ],
          },
          {
            BalanceNinety: 216613.25,
            CurrentBalance: -3550,
            EstimatedInsurance: 1127,
            PatientPortion: 211936.25,
            Provider: 'Dickson, Khloe - DICKH1',
            ProviderTotal: 213063.25,
            ResponsibleParties: [
              {
                ResponsibleParty: 'Benson, Miracle - BENMI1',
                AccountBalance: 55587.5,
                BalanceNinety: 2673.75,
                PatientPortion: 2673.75,
                ProviderTotal: 2673.75,
              },
              {
                ResponsibleParty: 'Bowers, Waylon - BOWWA1',
                AccountBalance: 21732.5,
                BalanceNinety: 2672.5,
                PatientPortion: 2672.5,
                ProviderTotal: 2672.5,
              },
              {
                ResponsibleParty: 'Bradford, Legend - BRALE1',
                AccountBalance: 71767.5,
                BalanceNinety: 7840,
                PatientPortion: 7840,
                ProviderTotal: 7840,
              },
            ],
          },
        ],
      };
      var result = ctrl.DeleteUnneededProperties(headers, array);
      expect(result.Location).toEqual('Default Practice - MB');
      expect(result.CurrentBalance).toBeUndefined();
      expect(result.BalanceThirty).toBeUndefined();
      expect(result.BalanceNinety).toBeUndefined();
      expect(result.PatientPortion).toBeUndefined();
      expect(result.EstimatedInsurance).toBeUndefined();
      expect(result.EstimatedInsuranceAdjustments).toBeUndefined();
    });
  });

  describe('ctrl.FillEmptyDecimalProperties -> ', function () {
    it('ctrl.FillEmptyDecimalProperties should be called ', function () {
      var headers = [
        'AccountBalance',
        'CurrentBalance',
        'BalanceThirty',
        'BalanceSixty',
        'BalanceNinety',
        'PatientPortion',
        'EstimatedInsurance',
        'EstimatedInsuranceAdjustments',
        'ProviderTotal',
      ];
      var array = {
        AccountBalance: 81147.68,
        CurrentBalance: -1722.82,
        PatientPortion: -1722.82,
        ProviderTotal: -1722.82,
        ResponsibleParty: 'Abbott, Adam - ABBAD1',
      };
      var result = ctrl.FillEmptyDecimalProperties(headers, array);
      expect(result.ResponsibleParty).toEqual('Abbott, Adam - ABBAD1');
      expect(result.AccountBalance).toEqual(81147.68);
      expect(result.CurrentBalance).toEqual(-1722.82);
      expect(result.BalanceThirty).toEqual(0);
      expect(result.BalanceSixty).toEqual(0);
      expect(result.BalanceNinety).toEqual(0);
      expect(result.PatientPortion).toEqual(-1722.82);
      expect(result.EstimatedInsurance).toEqual(0);
      expect(result.EstimatedInsuranceAdjustments).toEqual(0);
      expect(result.ProviderTotal).toEqual(-1722.82);
    });
  });

  describe('ctrl.GetEmptyColumns -> ', function () {
    it('ctrl.GetEmptyColumns should be called with emptyFirstArray is true and emptySecondArray is true', function () {
      scope.reportId = 41;
      var emptyFirstArray = true;
      var emptySecondArray = true;
      var result = ctrl.GetEmptyColumns(emptyFirstArray, emptySecondArray);
      expect(result).toEqual(
        'N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,0'
      );
    });

    it('ctrl.GetEmptyColumns should be called with emptyFirstArray is true and emptySecondArray is false', function () {
      scope.reportId = 41;
      var emptyFirstArray = true;
      var emptySecondArray = false;
      var result = ctrl.GetEmptyColumns(emptyFirstArray, emptySecondArray);
      expect(result).toEqual('N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,');
    });

    it('ctrl.GetEmptyColumns should be called with emptyFirstArray is false and emptySecondArray is true', function () {
      scope.reportId = 41;
      var emptyFirstArray = false;
      var emptySecondArray = true;
      var result = ctrl.GetEmptyColumns(emptyFirstArray, emptySecondArray);
      expect(result).toEqual('N/A,N/A,N/A,N/A,0');
    });

    it('ctrl.GetEmptyColumns should be called with emptyFirstArray is false and emptySecondArray is false', function () {
      scope.reportId = 41;
      var emptyFirstArray = false;
      var emptySecondArray = false;
      var result = ctrl.GetEmptyColumns(emptyFirstArray, emptySecondArray);
      expect(result).toEqual('N/A,N/A,N/A,N/A,0');
    });

    it('ctrl.GetEmptyColumns should be called with other than appointmentReportId', function () {
      scope.reportId = 42;
      var emptyFirstArray = false;
      var emptySecondArray = false;
      var result = ctrl.GetEmptyColumns(emptyFirstArray, emptySecondArray);
      expect(result).toEqual('');
    });
  });

  describe('ctrl.checkIfTemplate -> ', function () {
    beforeEach(inject(function ($rootScope) {
      $rootScope.filterModels = {
        ReportView: {
          FilterString: 'Detailed',
        },
      };
    }));
    it('ctrl.checkIfTemplate should be called with other than appointmentReportId', function () {
      scope.reportId = 54;
      var array = [
        {
          BalanceNinety: 2165437.5,
          BalanceThirty: 8101.33,
          CurrentBalance: -5953.71,
          EstimatedInsurance: 14379.28,
          EstimatedInsuranceAdjustments: 45065,
          Location: 'Default Practice - MB',
          PatientPortion: 2108140.84,
          ProviderTotal: 2167585.12,
          Providers: [
            {
              BalanceNinety: 301880,
              EstimatedInsurance: 7370,
              EstimatedInsuranceAdjustments: 43700,
              PatientPortion: 250810,
              Provider: 'Brown, Ruby - BRORU1',
              ProviderTotal: 301880,
              ResponsibleParties: [
                {
                  ResponsibleParty: 'Acevedo, Callie - ACECA1',
                  AccountBalance: 53990.11,
                  BalanceNinety: 6087.5,
                  PatientPortion: 6087.5,
                  ProviderTotal: 6087.5,
                },
                {
                  ResponsibleParty: 'Adams, Declan - ADADE1',
                  AccountBalance: 25983.75,
                  BalanceNinety: 3625,
                  PatientPortion: 3625,
                  ProviderTotal: 3625,
                },
                {
                  ResponsibleParty: 'Banks, Jax - BANJA1',
                  AccountBalance: 76947.5,
                  BalanceNinety: 15805,
                  PatientPortion: 15805,
                  ProviderTotal: 15805,
                },
              ],
            },
            {
              BalanceNinety: 216613.25,
              CurrentBalance: -3550,
              EstimatedInsurance: 1127,
              PatientPortion: 211936.25,
              Provider: 'Dickson, Khloe - DICKH1',
              ProviderTotal: 213063.25,
              ResponsibleParties: [
                {
                  ResponsibleParty: 'Benson, Miracle - BENMI1',
                  AccountBalance: 55587.5,
                  BalanceNinety: 2673.75,
                  PatientPortion: 2673.75,
                  ProviderTotal: 2673.75,
                },
                {
                  ResponsibleParty: 'Bowers, Waylon - BOWWA1',
                  AccountBalance: 21732.5,
                  BalanceNinety: 2672.5,
                  PatientPortion: 2672.5,
                  ProviderTotal: 2672.5,
                },
                {
                  ResponsibleParty: 'Bradford, Legend - BRALE1',
                  AccountBalance: 71767.5,
                  BalanceNinety: 7840,
                  PatientPortion: 7840,
                  ProviderTotal: 7840,
                },
              ],
            },
          ],
        },
      ];
      var result = ctrl.checkIfTemplate(array);
      expect(result[0].Location).toEqual('Default Practice - MB');
      expect(result[0].Providers[0].Provider).toEqual('Brown, Ruby - BRORU1');
      expect(result[0].Providers[1].Provider).toEqual(
        'Dickson, Khloe - DICKH1'
      );
      expect(result[0].Providers[0].BalanceNinety).toBeUndefined();
      expect(result[0].Providers[0].CurrentBalance).toBeUndefined();
      expect(result[0].Providers[0].EstimatedInsurance).toBeUndefined();
      expect(result[0].Providers[0].PatientPortion).toBeUndefined();
      expect(result[0].Providers[0].ProviderTotal).toBeUndefined();
      expect(result[0].Providers[1].BalanceNinety).toBeUndefined();
      expect(result[0].Providers[1].CurrentBalance).toBeUndefined();
      expect(result[0].Providers[1].EstimatedInsurance).toBeUndefined();
      expect(result[0].Providers[1].PatientPortion).toBeUndefined();
      expect(result[0].Providers[1].ProviderTotal).toBeUndefined();
    });

    it('ctrl.checkIfTemplate should be called with other than ReceivablesByAccountId', function () {
      scope.reportId = 62;
      var array = [
        {
          InCollections: 0,
          Location: 5,
          LocationName: '@123',
          MoreThanNinetyDays: 0,
          NinetyDays: 0,
          ResponsibleParties: [
            {
              InCollections: 0,
              MoreThanNinetyDays: 0,
              NinetyDays: 0,
              ResponsibleParty: 'KCR, KCR K. Mr - KCRKC1',
              SixtyDays: 0,
              ThirtyDays: 222,
              TotalAccountBalance: 222,
              TotalEstInsurance: 39.16,
              TotalEstInsuranceAdjustment: 0,
              TotalPatientPortion: 182.84,
            },
          ],
          SixtyDays: 0,
          ThirtyDays: 222,
          TotalAccountBalance: 222,
          TotalEstInsurance: 39.16,
          TotalEstInsuranceAdjustment: 0,
          TotalPatientPortion: 182.84,
        },
      ];
      var result = ctrl.checkIfTemplate(array);
      expect(result[0].LocationName).toEqual('@123');
      expect(result[0].TotalAccountBalance).toBe(222);
      expect(result[0].TotalEstInsurance).toBe(39.16);
      expect(result[0].TotalEstInsuranceAdjustment).toBe(0);
      expect(result[0].TotalPatientPortion).toBe(182.84);
      expect(result[0].ResponsibleParties[0].ResponsibleParty).toEqual(
        'KCR, KCR K. Mr - KCRKC1'
      );
      expect(result[0].ResponsibleParties[0].TotalAccountBalance).toBe(222);
      expect(result[0].ResponsibleParties[0].TotalEstInsurance).toBe(39.16);
      expect(result[0].ResponsibleParties[0].TotalEstInsuranceAdjustment).toBe(
        0
      );
      expect(result[0].ResponsibleParties[0].TotalPatientPortion).toBe(182.84);
    });

    it('ctrl.checkIfTemplate should be called with other than CreditDistributionHistoryReportId', function () {
      scope.reportId = 64;
      var array = [
        {
          Amount: 40,
          Description: 'Account Payment - Credit',
          Date: '2019-07-02T12:19:53.714',
          Impaction: 'Collection',
          Location: 'Default Practice - MB',
          ResponsibleParty: 'Katoch1, Lokesh D. c - KATLO1',
          Total: 40,
          TransactionType: 'Account Payment',
          AppliedToTransactions: [
            {
              Amount: 40,
              Area: 'A',
              Description: 'Unapplied amount',
              Location: 'Default Practice - MB',
              Patient: 'Katoch1, Lokesh D. c - KATLO1',
              PostedDate: '2019-07-02T12:25:03.6082722',
              Provider: 'Unassigned',
              ServiceDate: '2019-07-02T12:19:53.714',
              TeamMember: 'Admin, Practice - ADMPR1',
              Tooth: '1',
            },
          ],
        },
      ];
      var result = ctrl.checkIfTemplate(array);
      expect(result[0].Amount).toEqual(40);
      expect(result[0].Description).toEqual('Account Payment - Credit');
      expect(result[0].Date).toEqual('2019-07-02T12:19:53.714');
      expect(result[0].Description).toEqual('Account Payment - Credit');
      expect(result[0].Impaction).toEqual('Collection');
      expect(result[0].Location).toEqual('Default Practice - MB');
      expect(result[0].ResponsibleParty).toEqual(
        'Katoch1, Lokesh D. c - KATLO1'
      );
      expect(result[0].Total).toEqual(40);
      expect(result[0].TransactionType).toEqual('Account Payment');

      expect(result[0].AppliedToTransactions[0].Amount).toEqual(40);
      expect(result[0].AppliedToTransactions[0].Area).toBe('A');
      expect(result[0].AppliedToTransactions[0].Description).toBe(
        'Unapplied amount'
      );
      expect(result[0].AppliedToTransactions[0].Location).toBe(
        'Default Practice - MB'
      );
      expect(result[0].AppliedToTransactions[0].Patient).toBe(
        'Katoch1, Lokesh D. c - KATLO1'
      );
      expect(result[0].AppliedToTransactions[0].PostedDate).toBe(
        '2019-07-02T12:25:03.6082722'
      );
      expect(result[0].AppliedToTransactions[0].Provider).toBe('Unassigned');
      expect(result[0].AppliedToTransactions[0].ServiceDate).toBe(
        '2019-07-02T12:19:53.714'
      );
      expect(result[0].AppliedToTransactions[0].TeamMember).toBe(
        'Admin, Practice - ADMPR1'
      );
      expect(result[0].AppliedToTransactions[0].Tooth).toBe('1');
    });
  });
});

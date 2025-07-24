describe('TreatmentPlansFactory ->', function () {
  var toastrFactory, treatmentPlansFactory, usersFactory;
  var patientServices, financialService, deferred, q, rootScope;
  var treatmentPlanHeaderMock, treatmentPlanMock, treatmentPlanServiceMock;

  //#region mocks

  var tph = {
    TreatmentPlanId: null,
    PersonId: undefined,
    StatusId: '1',
    TreatmentPlanName: 'Treatment Plan',
    TreatmentPlanDescription: null,
    RejectedReason: null,
    DaysAgo: 0,
  };
  var tp = { TreatmentPlanHeader: Object(tph), TreatmentPlanServices: [] };
  var tps = {
    TreatmentPlanServiceHeader: Object({
      TreatmentPlanServiceId: null,
      PersonId: 2,
      Priority: null,
      TreatmentPlanId: null,
      TreatmentPlanGroupNumber: 1,
      EstimatedInsurance: 0,
      PatientPortion: 0,
      ServiceTransactionId: 33,
    }),
    ServiceTransaction: Object({ ServiceTransactionId: 33 }),
  };

  var treatmentPlanServicesMock = [
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 1234,
        PersonId: 2,
        Priority: null,
        TreatmentPlanId: 123,
      },
      ServiceTransaction: {},
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 1235,
        PersonId: 2,
        Priority: null,
        TreatmentPlanId: 123,
      },
      ServiceTransaction: {},
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 1236,
        PersonId: 2,
        Priority: null,
        TreatmentPlanId: 123,
      },
      ServiceTransaction: {},
    },
  ];
  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        ClinicalNotes: {
          get: jasmine.createSpy().and.returnValue({}),
          create: jasmine.createSpy().and.returnValue({}),
          update: jasmine.createSpy().and.returnValue({}),
        },
        TreatmentPlans: {
          save: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('some value in return');
            return deferred;
          }),
          LastPriority: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('3');
            return deferred;
          }),
          NextPriority: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('3');
            return deferred;
          }),
          addServices: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('3');
            return deferred;
          }),
          DefaultPriorityOrder: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('3');
            return deferred;
          }),
        },
      };
      $provide.value('PatientServices', patientServices);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
      let newTreatmentPlansService = {
        setTreatmentPlans: jasmine.createSpy(),
        setActiveTreatmentPlan: jasmine.createSpy(),
      };
      $provide.value('NewTreatmentPlansService', newTreatmentPlansService);
      usersFactory = {
        Users: jasmine.createSpy('usersFactory.Users'),
      };
      $provide.value('UsersFactory', usersFactory);

      financialService = {};
      $provide.value('FinancialService', financialService);

      let TreatmentPlanHttpService = {
        getInsuranceInfo: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlanHttpService', TreatmentPlanHttpService);
    })
  );

  beforeEach(inject(function ($injector, $q, $rootScope) {
    q = $q;
    rootScope = $rootScope;
    treatmentPlanHeaderMock = tph;
    treatmentPlanMock = tp;
    treatmentPlanServiceMock = tps;
    treatmentPlansFactory = $injector.get('TreatmentPlansFactory');
  }));

  //#endregion

  //#region properties

  describe('properties -> ', function () {
    var activeTreatmentPlan = {};
    beforeEach(function () {
      activeTreatmentPlan = { TreatmentPlanHeader: { Status: 'status' } };
    });

    it('should set properties', function () {
      //
      treatmentPlansFactory.SetExistingTreatmentPlans({ test: 'red' });
      expect(treatmentPlansFactory.ExistingTreatmentPlans).toEqual({
        test: 'red',
      });
      //
      treatmentPlansFactory.SetActiveTreatmentPlan(activeTreatmentPlan);
      expect(treatmentPlansFactory.ActiveTreatmentPlan).toEqual(
        activeTreatmentPlan
      );
      expect(treatmentPlansFactory.TreatmentPlanCopy).toEqual(
        activeTreatmentPlan
      );
      //
      treatmentPlansFactory.SetNewTreatmentPlan({ test: 'yellow' });
      expect(treatmentPlansFactory.NewTreatmentPlan).toEqual({
        test: 'yellow',
      });
      //
      treatmentPlansFactory.AddPlannedService({ test: 'aqua' });
      expect(treatmentPlansFactory.NewPlannedService).toEqual({ test: 'aqua' });
      //
      expect(treatmentPlansFactory.DataChanged).toBe(false);
      treatmentPlansFactory.SetDataChanged(true);
      expect(treatmentPlansFactory.DataChanged).toBe(true);
      //
      expect(treatmentPlansFactory.SavingPlan).toBe(false);
      //
      expect(treatmentPlansFactory.AddingService).toBe(false);
    });
  });

  //#endregion

  //#region utility

  describe('BuildTreatmentPlanDto -> ', function () {
    it('should build blank treatment plan', function () {
      expect(treatmentPlansFactory.BuildTreatmentPlanDto(tph)).toEqual(
        treatmentPlanMock
      );
    });

    it('should build treatment plan', function () {
      treatmentPlanHeaderMock.TreatmentPlanName = 'test';
      treatmentPlanHeaderMock.PersonId = 2;
      expect(
        treatmentPlansFactory.BuildTreatmentPlanDto(treatmentPlanHeaderMock)
          .TreatmentPlanHeader.TreatmentPlanName
      ).toEqual('test');
      expect(
        treatmentPlansFactory.BuildTreatmentPlanDto(treatmentPlanHeaderMock)
          .TreatmentPlanHeader.PersonId
      ).toEqual(2);
    });
  });

  describe('BuildTreatmentPlanServiceDto -> ', function () {
    it('should build treatment plan service', function () {
      expect(
        treatmentPlansFactory.BuildTreatmentPlanServiceDto(
          { ServiceTransactionId: 33 },
          2
        )
      ).toEqual(treatmentPlanServiceMock);
    });
  });

  describe('CollapseAll -> ', function () {
    it('should set CollapsedViewVisible property to false on all plans in existing plan list', function () {
      treatmentPlanMock.TreatmentPlanHeader.CollapsedViewVisible = true;
      treatmentPlansFactory.SetExistingTreatmentPlans([treatmentPlanMock]);
      expect(
        treatmentPlansFactory.ExistingTreatmentPlans[0].TreatmentPlanHeader
          .CollapsedViewVisible
      ).toBe(true);
      treatmentPlansFactory.CollapseAll();
      expect(
        treatmentPlansFactory.ExistingTreatmentPlans[0].TreatmentPlanHeader
          .CollapsedViewVisible
      ).toBe(false);
    });
  });

  describe('GetTotalFees -> ', function () {
    it('should add total fees of all nested ', function () {
      var one = treatmentPlansFactory.BuildTreatmentPlanServiceDto(
        { ServiceTransactionId: 11, Fee: 10.12 },
        2
      );
      var two = treatmentPlansFactory.BuildTreatmentPlanServiceDto(
        { ServiceTransactionId: 14, Fee: 300.34 },
        2
      );
      treatmentPlanMock.TreatmentPlanServices = [one, two];
      expect(treatmentPlansFactory.GetTotalFees(treatmentPlanMock)).toBe(
        310.46
      );
    });
  });

  describe('MergeTreatmentPlanServicePriorityOrderDtoToPlan method', function () {
    var activeTreatmentPlan = {};
    var treatmentPlanServicePriorityOrderDto = {};
    beforeEach(function () {
      treatmentPlanServicePriorityOrderDto = {
        DataTag: 'XXXDEFG',
        ServicePriorities: [
          {
            TreatmentPlanServiceId: '1234',
            DataTag: 'xBCDE123',
            TreatmentPlanGroupNumber: 2,
            Priority: 1,
          },
          {
            TreatmentPlanServiceId: '5678',
            DataTag: 'xBCDE124',
            TreatmentPlanGroupNumber: 1,
            Priority: 2,
          },
          {
            TreatmentPlanServiceId: '9123',
            DataTag: 'xBCDE125',
            TreatmentPlanGroupNumber: 1,
            Priority: 3,
          },
        ],
      };

      activeTreatmentPlan = {
        TreatmentPlanHeader: {
          DataTag: 'ABCDEFG',
          Name: 'TreatmentPlanA',
          TreatmentPlanId: 1,
        },
        TreatmentPlanServices: [
          {
            TreatmentPlanServiceHeader: {
              TreatmentPlanServiceId: '1234',
              DataTag: 'ABCDE123',
              TreatmentPlanGroupNumber: 1,
              Priority: 1,
            },
          },
          {
            TreatmentPlanServiceHeader: {
              TreatmentPlanServiceId: '5678',
              DataTag: 'ABCDE124',
              TreatmentPlanGroupNumber: 1,
              Priority: 2,
            },
          },
          {
            TreatmentPlanServiceHeader: {
              TreatmentPlanServiceId: '9123',
              DataTag: 'ABCDE125',
              TreatmentPlanGroupNumber: 2,
              Priority: 3,
            },
          },
        ],
      };
      treatmentPlansFactory.ExistingTreatmentPlans = [
        {
          TreatmentPlanHeader: {
            DataTag: 'ABCDEFG',
            Name: 'TreatmentPlanA',
            TreatmentPlanId: 1,
          },
          TreatmentPlanServices: [
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '1234',
                DataTag: 'ABCDE123',
                TreatmentPlanGroupNumber: 1,
                Priority: 1,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '5678',
                DataTag: 'ABCDE124',
                TreatmentPlanGroupNumber: 1,
                Priority: 2,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '9123',
                DataTag: 'ABCDE125',
                TreatmentPlanGroupNumber: 2,
                Priority: 3,
              },
            },
          ],
        },
        {
          TreatmentPlanHeader: {
            DataTag: 'HIJKLMN',
            Name: 'TreatmentPlanB',
            TreatmentPlanId: 2,
          },
          TreatmentPlanServices: [
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '2222',
                DataTag: 'ABCDE123',
                TreatmentPlanGroupNumber: 1,
                Priority: 1,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '2223',
                DataTag: 'ABCDE124',
                TreatmentPlanGroupNumber: 1,
                Priority: 2,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '2224',
                DataTag: 'ABCDE125',
                TreatmentPlanGroupNumber: 2,
                Priority: 3,
              },
            },
            { DataTag: 'ABCDE223', TreatmentPlanGroupNumber: 1, Priority: 1 },
            { DataTag: 'ABCDE224', TreatmentPlanGroupNumber: 1, Priority: 2 },
            { DataTag: 'ABCDE225', TreatmentPlanGroupNumber: 2, Priority: 3 },
          ],
        },
        {
          TreatmentPlanHeader: {
            DataTag: 'OPQRSTU',
            Name: 'TreatmentPlanC',
            TreatmentPlanId: 3,
          },
          TreatmentPlanServices: [
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '3331',
                DataTag: 'ABCDE333',
                TreatmentPlanGroupNumber: 1,
                Priority: 1,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '3332',
                DataTag: 'ABCDE334',
                TreatmentPlanGroupNumber: 1,
                Priority: 2,
              },
            },
            {
              TreatmentPlanServiceHeader: {
                TreatmentPlanServiceId: '3333',
                DataTag: 'ABCDE335',
                TreatmentPlanGroupNumber: 2,
                Priority: 3,
              },
            },
          ],
        },
      ];
    });

    it('should merge the treatmentPlanServicePriorityOrderDto back to the activeTreatmentPlan ', function () {
      treatmentPlansFactory.MergeTreatmentPlanServicePriorityOrderDtoToPlan(
        activeTreatmentPlan,
        treatmentPlanServicePriorityOrderDto
      );
      expect(activeTreatmentPlan.TreatmentPlanHeader.DataTag).toEqual(
        treatmentPlanServicePriorityOrderDto.DataTag
      );
      _.forEach(activeTreatmentPlan.TreatmentPlanServices, function (tps) {
        if (tps.TreatmentPlanServiceId === '1234') {
          expect(tps.TreatmentPlanServiceHeader.DataTag).toEqual('xBCDE124');
          expect(
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
          ).toEqual(2);
          expect(tps.TreatmentPlanServiceHeader.Priority).toEqual(1);
        }
        if (tps.TreatmentPlanServiceId === '5678') {
          expect(tps.TreatmentPlanServiceHeader.DataTag).toEqual('xBCDE123');
          expect(
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
          ).toEqual(1);
          expect(tps.TreatmentPlanServiceHeader.Priority).toEqual(2);
        }
        if (tps.TreatmentPlanServiceId === '9123') {
          expect(tps.TreatmentPlanServiceHeader.DataTag).toEqual('xBCDE125');
          expect(
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
          ).toEqual(1);
          expect(tps.TreatmentPlanServiceHeader.Priority).toEqual(3);
        }
      });
    });

    it('should merge the activeTreatmentPlan back to the ExistingTreatmentPlans ', function () {
      treatmentPlansFactory.MergeTreatmentPlanServicePriorityOrderDtoToPlan(
        activeTreatmentPlan,
        treatmentPlanServicePriorityOrderDto
      );
      var found = _.find(
        treatmentPlansFactory.ExistingTreatmentPlans,
        function (tps) {
          return (
            tps.TreatmentPlanHeader.TreatmentPlanId ===
            activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
          );
        }
      );
      expect(found.TreatmentPlanHeader.DataTag).toEqual(
        treatmentPlanServicePriorityOrderDto.DataTag
      );
      _.forEach(found.TreatmentPlanServices, function (tps) {
        if (tps.TreatmentPlanServiceId === '1234') {
          expect(tps.TreatmentPlanServiceHeader.DataTag).toEqual('xBCDE124');
          expect(
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
          ).toEqual(2);
          expect(tps.TreatmentPlanServiceHeader.Priority).toEqual(1);
        }
        if (tps.TreatmentPlanServiceId === '5678') {
          expect(tps.TreatmentPlanServiceHeader.DataTag).toEqual('xBCDE123');
          expect(
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
          ).toEqual(1);
          expect(tps.TreatmentPlanServiceHeader.Priority).toEqual(2);
        }
        if (tps.TreatmentPlanServiceId === '9123') {
          expect(tps.TreatmentPlanServiceHeader.DataTag).toEqual('xBCDE125');
          expect(
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
          ).toEqual(1);
          expect(tps.TreatmentPlanServiceHeader.Priority).toEqual(3);
        }
      });
    });
  });

  describe('MergeTreatmentPlanHeaderUpdateOnlyDto method', function () {
    var activeTreatmentPlan = {};
    var res = {};
    beforeEach(function () {
      res = {
        Value: {
          DataTag: 'ABCDEFG',
          Name: 'TreatmentPlanA',
          TreatmentPlanId: 1,
          Status: 'Accepted',
          ServiceTransactionKeys: [
            { Key: '1234', Value: 'rBCDE123' },
            { Key: '1235', Value: 'rBCDE124' },
            { Key: '1236', Value: 'rBCDE125' },
          ],
        },
      };
      activeTreatmentPlan = {
        TreatmentPlanHeader: {
          DataTag: 'ABCDEFG',
          Name: 'TreatmentPlanA',
          TreatmentPlanId: 1,
          Status: 'Proposed',
        },
        TreatmentPlanServices: [
          {
            ServiceTransaction: {
              ServiceTransactionId: '1234',
              DataTag: 'ABCDE123',
              ServiceTransactionStatusId: 1,
            },
          },
          {
            ServiceTransaction: {
              ServiceTransactionId: '1235',
              DataTag: 'ABCDE124',
              ServiceTransactionStatusId: 1,
            },
          },
          {
            ServiceTransaction: {
              ServiceTransactionId: '1236',
              DataTag: 'ABCDE125',
              ServiceTransactionStatusId: 1,
            },
          },
        ],
      };
      spyOn(rootScope, '$broadcast');
    });

    it(
      'should update each treatmentPlan.TreatmentPlanServices ServiceTransaction with new ServiceTransctionStatusId to match header ' +
        'when the treatmentPlanHeaderUpdateOnlyDto.Status is updated to Accepted',
      function () {
        res.Value.Status = 'Accepted';
        var returnedValue =
          treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
            activeTreatmentPlan,
            res
          );
        var returnedValue =
          treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
            activeTreatmentPlan,
            res
          );
        expect(
          returnedValue.TreatmentPlanServices[0].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(7);
        expect(
          returnedValue.TreatmentPlanServices[1].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(7);
        expect(
          returnedValue.TreatmentPlanServices[2].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(7);
      }
    );

    it(
      'should update each treatmentPlan.TreatmentPlanServices ServiceTransaction with new ServiceTransctionStatusId to match header ' +
        'when the treatmentPlanHeaderUpdateOnlyDto.Status is updated to Rejected',
      function () {
        res.Value.Status = 'Rejected';
        var returnedValue =
          treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
            activeTreatmentPlan,
            res
          );
        expect(
          returnedValue.TreatmentPlanServices[0].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(3);
        expect(
          returnedValue.TreatmentPlanServices[1].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(3);
        expect(
          returnedValue.TreatmentPlanServices[2].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(3);
      }
    );

    it(
      'should not update treatmentPlan.TreatmentPlanServices ServiceTransaction with new ServiceTransctionStatusId to match header ' +
        'when the treatmentPlanHeaderUpdateOnlyDto.Status is updated to Accepted or Rejected but no matching ServiceTransactionId is found ',
      function () {
        res.Value.Status = 'Accepted';
        // remove last ServiceTransactionKeys
        res.Value.ServiceTransactionKeys = [
          { Key: '1234', Value: 'rBCDE123' },
          { Key: '1235', Value: 'rBCDE124' },
        ];
        var returnedValue =
          treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
            activeTreatmentPlan,
            res
          );
        var returnedValue =
          treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
            activeTreatmentPlan,
            res
          );
        expect(
          returnedValue.TreatmentPlanServices[0].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(7);
        expect(
          returnedValue.TreatmentPlanServices[1].ServiceTransaction
            .ServiceTransactionStatusId
        ).toEqual(7);
        expect(
          returnedValue.TreatmentPlanServices[2].ServiceTransaction
            .ServiceTransactionStatusId
        ).not.toEqual(7);
      }
    );

    it(
      'should update each treatmentPlan.TreatmentPlanServices ServiceTransaction with new ServiceTransctionStatusId and DataTag ' +
        'when the treatmentPlanHeaderUpdateOnlyDto.Status is updated to Rejected or Accepted',
      function () {
        var returnedValue =
          treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
            activeTreatmentPlan,
            res
          );
        var firstService = _.find(
          returnedValue.TreatmentPlanServices,
          function (treatmentPlanService) {
            return (
              treatmentPlanService.ServiceTransaction.ServiceTransactionId ===
              '1234'
            );
          }
        );
        expect(firstService.ServiceTransaction.DataTag).toBe(
          res.Value.ServiceTransactionKeys[0].Value
        );

        var secondService = _.find(
          returnedValue.TreatmentPlanServices,
          function (treatmentPlanService) {
            return (
              treatmentPlanService.ServiceTransaction.ServiceTransactionId ===
              '1235'
            );
          }
        );
        expect(secondService.ServiceTransaction.DataTag).toBe(
          res.Value.ServiceTransactionKeys[1].Value
        );

        var thirdService = _.find(
          returnedValue.TreatmentPlanServices,
          function (treatmentPlanService) {
            return (
              treatmentPlanService.ServiceTransaction.ServiceTransactionId ===
              '1236'
            );
          }
        );
        expect(thirdService.ServiceTransaction.DataTag).toBe(
          res.Value.ServiceTransactionKeys[2].Value
        );
      }
    );

    it(
      'should not update ServiceTransctionStatusId and DataTag when no matching ServiceTransactionId is found ' +
        'when the TreatmentPlanHeader.Status is updated to Rejected or Accepted',
      function () {
        // remove last ServiceTransactionKeys
        res.Value.ServiceTransactionKeys = [
          { Key: '1234', Value: 'rBCDE123' },
          { Key: '1235', Value: 'rBCDE124' },
        ];

        var returnedValue =
          treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
            activeTreatmentPlan,
            res
          );
        var selectedService = _.find(
          returnedValue.TreatmentPlanServices,
          function (treatmentPlanService) {
            return (
              treatmentPlanService.ServiceTransaction.ServiceTransactionId ===
              '1236'
            );
          }
        );
        expect(selectedService.ServiceTransaction.DataTag).toBe('ABCDE125');
      }
    );

    it('should broadcast soar:chart-services-reload-ledger if any services are updated', function () {
      treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
        activeTreatmentPlan,
        res
      );
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });

    it('should not broadcast soar:chart-services-reload-ledger if no services are updated', function () {
      res = {
        Value: {
          DataTag: 'ABCDEFG',
          Name: 'TreatmentPlanA',
          TreatmentPlanId: 1,
          Status: 'Accepted',
          ServiceTransactionKeys: [],
        },
      };
      treatmentPlansFactory.MergeTreatmentPlanHeaderUpdateOnlyDto(
        activeTreatmentPlan,
        res
      );
      expect(rootScope.$broadcast).not.toHaveBeenCalledWith(
        'soar:chart-services-reload-ledger'
      );
    });
  });

  describe('DefaultProviderOnPredetermination method', function () {
    var providers = [];
    var treatmentPlan = {};
    beforeEach(function () {
      treatmentPlan = {
        TreatmentPlanServices: [
          { ServiceTransaction: { ProviderUserId: 1234, LocationId: 1 } },
        ],
      };

      providers = [
        {
          UserId: 1234,
          FirstName: 'Bob',
          LastName: 'Johnson',
          Locations: [
            {
              IsActive: true,
              LocationId: 1,
              ProviderTypeId: 1,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
            {
              IsActive: true,
              LocationId: 2,
              ProviderTypeId: 1,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
            {
              IsActive: true,
              LocationId: 3,
              ProviderTypeId: 1,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
          ],
        },
        {
          UserId: 2345,
          FirstName: 'Larry',
          LastName: 'Johnson',
          Locations: [
            {
              IsActive: true,
              LocationId: 1,
              ProviderTypeId: 1,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
            {
              IsActive: true,
              LocationId: 3,
              ProviderTypeId: 5,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
          ],
        },
        {
          UserId: 3456,
          FirstName: 'Sid',
          LastName: 'Johnson',
          Locations: [
            {
              IsActive: true,
              LocationId: 2,
              ProviderTypeId: 1,
              ProviderOnClaimsId: 1234,
              ProviderOnClaimsRelationship: 2,
            },
            {
              IsActive: true,
              LocationId: 3,
              ProviderTypeId: 5,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
          ],
        },
        {
          UserId: 4567,
          FirstName: 'Pat',
          LastName: 'Johnson',
          Locations: [
            {
              IsActive: true,
              LocationId: 1,
              ProviderTypeId: 2,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
            {
              IsActive: true,
              LocationId: 2,
              ProviderTypeId: 2,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
            {
              IsActive: true,
              LocationId: 3,
              ProviderTypeId: 2,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
          ],
        },
        {
          UserId: 5678,
          FirstName: 'Pat',
          LastName: 'Johnson',
          Locations: [
            {
              IsActive: true,
              LocationId: 1,
              ProviderTypeId: 4,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 0,
            },
            {
              IsActive: true,
              LocationId: 2,
              ProviderTypeId: 4,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 0,
            },
            {
              IsActive: true,
              LocationId: 3,
              ProviderTypeId: 4,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 0,
            },
          ],
        },
        {
          UserId: 6789,
          FirstName: 'Lillian',
          LastName: 'Johnson',
          Locations: [
            {
              IsActive: true,
              LocationId: 1,
              ProviderTypeId: 2,
              ProviderOnClaimsId: 1234,
              ProviderOnClaimsRelationship: 2,
            },
            {
              IsActive: true,
              LocationId: 2,
              ProviderTypeId: 2,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
            {
              IsActive: true,
              LocationId: 3,
              ProviderTypeId: 2,
              ProviderOnClaimsId: null,
              ProviderOnClaimsRelationship: 1,
            },
          ],
        },
      ];
    });

    // returns the first provider is a dentist that matches the treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId if match
    it(
      'should find matching provider to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId in list of providers that has ProviderTypeId of 1' +
        'and return provider.UserId if no ProviderOnClaimsId (NOTE may return null)',
      function () {
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 1234;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(1234);
      }
    );

    it(
      'should find matching provider to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId in list of providers ' +
        ' that has ProviderTypeId of 1 and Location.LocationId matching the service.LocationId' +
        'and return ProviderOnClaimsId if other than himself (NOTE may return null)',
      function () {
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 2345;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(2345);
      }
    );

    it(
      'should find matching provider to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId in list of providers  ' +
        'that has ProviderTypeId of 1' +
        'and return provider.UserId if no ProviderOnClaimsId (NOTE may return null)',
      function () {
        treatmentPlan.TreatmentPlanServices.push({
          ServiceTransaction: { ProviderUserId: 1234 },
        });
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 4567;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(4567);
      }
    );

    // returns the first provider that is a hygienist that matches the '+
    // treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId if no matching provider who is a dentist
    it(
      'should find matching provider to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId in list of providers  that has ProviderTypeId of 2' +
        'and return provider.UserId if no ProviderOnClaimsId (NOTE may return null)',
      function () {
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 4567;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(4567);
      }
    );

    it(
      'should find matching provider to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId in list of providers  that has ProviderTypeId of 2' +
        'and return ProviderOnClaimsId (NOTE may return null)',
      function () {
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 6789;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(1234);
      }
    );

    // returns the first provider that is a dentist from the list of providers if no matching provider who is a dentist or hygienist
    it(
      'should find first provider in list of providers  that has ProviderTypeId of 1' +
        'and return provider.UserId if no match to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId (NOTE may return null)',
      function () {
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 5555;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(1234);
      }
    );

    // returns the first provider that is a hygienist from the list of providers if no matching provider who is a dentist or hygienist
    it(
      'should find first provider in list of providers  that has ProviderTypeId of 2' +
        'and return provider.UserId if no match to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId (NOTE may return null)',
      function () {
        providers = [
          {
            UserId: 4567,
            FirstName: 'Pat',
            LastName: 'Johnson',
            Locations: [
              {
                IsActive: true,
                LocationId: 1,
                ProviderTypeId: 2,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 2,
              },
              {
                IsActive: true,
                LocationId: 2,
                ProviderTypeId: 5,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 2,
              },
              {
                IsActive: true,
                LocationId: 3,
                ProviderTypeId: 3,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 1,
              },
            ],
          },
          {
            UserId: 5678,
            FirstName: 'Pat',
            LastName: 'Johnson',
            Locations: [
              {
                IsActive: true,
                LocationId: 1,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
              {
                IsActive: true,
                LocationId: 2,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
              {
                IsActive: true,
                LocationId: 3,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
            ],
          },
        ];
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 5555;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(4567);
      }
    );

    // returns the first provider that is a hygieist from the list of providers if no matching provider who is a dentist or hygienist
    it(
      'should find first provider in list of providers  that has ProviderTypeId of 1' +
        'and return provider.UserId if no match to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId (NOTE may return null)',
      function () {
        providers = [
          {
            UserId: 4567,
            FirstName: 'Pat',
            LastName: 'Johnson',
            Locations: [
              {
                IsActive: true,
                LocationId: 1,
                ProviderTypeId: 3,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 2,
              },
              {
                IsActive: true,
                LocationId: 2,
                ProviderTypeId: 5,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 1,
              },
              {
                IsActive: true,
                LocationId: 3,
                ProviderTypeId: 3,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 2,
              },
            ],
          },
          {
            UserId: 5678,
            FirstName: 'Pat',
            LastName: 'Johnson',
            Locations: [
              {
                IsActive: true,
                LocationId: 1,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
              {
                IsActive: true,
                LocationId: 2,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
              {
                IsActive: true,
                LocationId: 3,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
            ],
          },
        ];
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 5555;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(4567);
      }
    );

    // returns the first provider that is a hygieist from the list of providers if no matching provider who is a dentist or hygienist
    it(
      'should return null from list of providers  that has ProviderTypeId of 1' +
        'and return provider.UserId if no match to treatmentPlan.TreatmentPlanServices.ServiceTransaction.ProviderUserId (NOTE may return null)',
      function () {
        providers = [
          {
            UserId: 4567,
            FirstName: 'Pat',
            LastName: 'Johnson',
            Locations: [
              {
                IsActive: true,
                LocationId: 1,
                ProviderTypeId: 3,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 2,
              },
              {
                IsActive: true,
                LocationId: 2,
                ProviderTypeId: 5,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 2,
              },
              {
                IsActive: true,
                LocationId: 3,
                ProviderTypeId: 3,
                ProviderOnClaimsId: 1234,
                ProviderOnClaimsRelationship: 2,
              },
            ],
          },
          {
            UserId: 5678,
            FirstName: 'Pat',
            LastName: 'Johnson',
            Locations: [
              {
                IsActive: true,
                LocationId: 1,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
              {
                IsActive: true,
                LocationId: 2,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
              {
                IsActive: true,
                LocationId: 3,
                ProviderTypeId: 4,
                ProviderOnClaimsId: null,
                ProviderOnClaimsRelationship: 0,
              },
            ],
          },
        ];
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.ProviderUserId = 5555;
        var providerId =
          treatmentPlansFactory.DefaultProviderOnPredetermination(
            treatmentPlan,
            providers
          );
        expect(providerId).toBe(null);
      }
    );
  });

  describe('GetTreatmentPlanHeaderUpdateOnlyDto method', function () {
    var planToUpdate = {};
    var res = {};
    beforeEach(function () {
      res = {
        Value: {
          DataTag: 'ABCDEFG',
          Name: 'TreatmentPlanA',
          TreatmentPlanId: 1,
          Status: 'Proposed',
          ServiceTransactionKeys: [
            { Key: '1234', Value: 'rBCDE123' },
            { Key: '1235', Value: 'rBCDE124' },
            { Key: '1236', Value: 'rBCDE125' },
          ],
        },
      };
      planToUpdate = {
        TreatmentPlanHeader: {
          DataTag: 'ABCDEFG',
          Name: 'TreatmentPlanA',
          TreatmentPlanId: 1,
          Status: 'Accepted',
        },
        TreatmentPlanServices: [
          {
            ServiceTransaction: {
              ServiceTransactionId: '1234',
              DataTag: 'ABCDE123',
              ServiceTransactionStatusId: 1,
            },
          },
          {
            ServiceTransaction: {
              ServiceTransactionId: '1235',
              DataTag: 'ABCDE124',
              ServiceTransactionStatusId: 1,
            },
          },
          {
            ServiceTransaction: {
              ServiceTransactionId: '1236',
              DataTag: 'ABCDE125',
              ServiceTransactionStatusId: 1,
            },
          },
        ],
      };
    });

    it('should build TreatmentPlanHeaderUpdateOnlyDto object to always contain planToUpdate.TreatmentPlanHeader properties', function () {
      var treatmentPlanHeaderUpdateOnlyDto =
        treatmentPlansFactory.GetTreatmentPlanHeaderUpdateOnlyDto(
          planToUpdate,
          true
        );
      expect(treatmentPlanHeaderUpdateOnlyDto.DataTag).toEqual(
        planToUpdate.TreatmentPlanHeader.DataTag
      );
      expect(treatmentPlanHeaderUpdateOnlyDto.Name).toEqual(
        planToUpdate.TreatmentPlanHeader.Name
      );
      expect(treatmentPlanHeaderUpdateOnlyDto.TreatmentPlanId).toEqual(
        planToUpdate.TreatmentPlanHeader.TreatmentPlanId
      );
      expect(treatmentPlanHeaderUpdateOnlyDto.Status).toEqual(
        planToUpdate.TreatmentPlanHeader.Status
      );
    });

    it('should build TreatmentPlanHeaderUpdateOnlyDto object to contain empty ServiceTransactionKeys list if updateStatus paramater is false', function () {
      var treatmentPlanHeaderUpdateOnlyDto =
        treatmentPlansFactory.GetTreatmentPlanHeaderUpdateOnlyDto(
          planToUpdate,
          false
        );
      expect(treatmentPlanHeaderUpdateOnlyDto.ServiceTransactionKeys).toEqual(
        []
      );
    });

    it(
      'should build TreatmentPlanHeaderUpdateOnlyDto object to contain ServiceTransactionKeys list containing ServiceTransactionId and DataTag of each ' +
        'TreatmentPlanService.ServiceTransaction if updateStatus paramater is true',
      function () {
        var treatmentPlanHeaderUpdateOnlyDto =
          treatmentPlansFactory.GetTreatmentPlanHeaderUpdateOnlyDto(
            planToUpdate,
            true
          );
        expect(
          treatmentPlanHeaderUpdateOnlyDto.ServiceTransactionKeys[0]
        ).toEqual({ key: '1234', value: 'ABCDE123' });
        expect(
          treatmentPlanHeaderUpdateOnlyDto.ServiceTransactionKeys[1]
        ).toEqual({ key: '1235', value: 'ABCDE124' });
        expect(
          treatmentPlanHeaderUpdateOnlyDto.ServiceTransactionKeys[2]
        ).toEqual({ key: '1236', value: 'ABCDE125' });
      }
    );
  });

  describe('LoadPlanStages method -> ', function () {
    it('should return stages based on treatmentPlanServices.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber', function () {
      var treatmentPlanServices = [
        {
          TreatmentPlanServiceHeader: Object({
            TreatmentPlanServiceId: 123,
            PersonId: 2,
            Priority: null,
            TreatmentPlanId: 1234,
            TreatmentPlanGroupNumber: 1,
          }),
          ServiceTransaction: Object({ ServiceTransactionId: 331 }),
        },
        {
          TreatmentPlanServiceHeader: Object({
            TreatmentPlanServiceId: 1234,
            PersonId: 2,
            Priority: null,
            TreatmentPlanId: 12345,
            TreatmentPlanGroupNumber: 2,
          }),
          ServiceTransaction: Object({ ServiceTransactionId: 332 }),
        },
        {
          TreatmentPlanServiceHeader: Object({
            TreatmentPlanServiceId: 1235,
            PersonId: 2,
            Priority: null,
            TreatmentPlanId: 12346,
            TreatmentPlanGroupNumber: 1,
          }),
          ServiceTransaction: Object({ ServiceTransactionId: 333 }),
        },
      ];
      var planStages = treatmentPlansFactory.LoadPlanStages(
        treatmentPlanServices
      );
      expect(planStages[0].stageno).toBe(1);
      expect(planStages[1].stageno).toBe(2);
    });
  });

  describe('GetDaysAgo -> ', function () {
    it('should return number of days since treatment plan was created', function () {
      var now = new Date();
      now.setDate(now.getDate() - 5);
      now = now.toJSON();
      treatmentPlanHeaderMock.CreatedDate = now;
      expect(treatmentPlansFactory.GetDaysAgo(treatmentPlanHeaderMock)).toBe(5);
    });
  });

  describe('CreateWithNoReload method -> ', function () {
    var services = [];
    var personId = '1234';
    beforeEach(function () {
      services = [
        {
          ServiceTransaction: {
            InsuranceEstimate: {},
            AccountMemberId: 'abcd',
          },
        },
        {
          ServiceTransaction: {
            InsuranceEstimate: {},
            AccountMemberId: 'abcd',
          },
        },
      ];
      treatmentPlansFactory.NewTreatmentPlan = {
        TreatmentPlanHeader: { PersonId: personId },
        TreatmentPlanServices: [],
      };
    });

    it('should add Priority to each service before persisting', function () {
      treatmentPlansFactory.CreateWithNoReload(services, personId);
      expect(
        treatmentPlansFactory.NewTreatmentPlan.TreatmentPlanServices[0]
          .TreatmentPlanServiceHeader.Priority
      ).toBe(1);
      expect(
        treatmentPlansFactory.NewTreatmentPlan.TreatmentPlanServices[1]
          .TreatmentPlanServiceHeader.Priority
      ).toBe(2);
    });

    it('should call patientServices.TreatmentPlans.save', function () {
      treatmentPlansFactory.CreateWithNoReload(services, personId);
      expect(patientServices.TreatmentPlans.save).toHaveBeenCalled();
    });
  });

  describe('AddPriorityToServices method -> ', function () {
    var nextPriority = 3;
    beforeEach(function () {});

    it('should add Priority to each service based on nextPriority', function () {
      var treatmentPlanServices = _.cloneDeep(treatmentPlanServicesMock);
      treatmentPlansFactory.AddPriorityToServices(
        treatmentPlanServices,
        nextPriority
      );
      expect(treatmentPlanServices[0].TreatmentPlanServiceHeader.Priority).toBe(
        3
      );
      expect(treatmentPlanServices[1].TreatmentPlanServiceHeader.Priority).toBe(
        4
      );
      expect(treatmentPlanServices[2].TreatmentPlanServiceHeader.Priority).toBe(
        5
      );
    });
  });

  describe('NextPriority method -> ', function () {
    var treatmentPlanId = 333;
    beforeEach(function () {});

    it('should call patientServices.TreatmentPlans.LastPriority ', function () {
      treatmentPlansFactory.NextPriority(treatmentPlanId);
      expect(patientServices.TreatmentPlans.LastPriority).toHaveBeenCalledWith({
        Id: treatmentPlanId,
      });
    });
  });

  describe('LastPriority method -> ', function () {
    var treatmentPlanId = 333;
    beforeEach(function () {});

    it('should call patientServices.TreatmentPlans.LastPriority ', function () {
      treatmentPlansFactory.LastPriority(treatmentPlanId);
      expect(patientServices.TreatmentPlans.LastPriority).toHaveBeenCalledWith({
        Id: treatmentPlanId,
      });
    });
  });

  describe('SaveServicesToExistingTreatmentPlan method -> ', function () {
    var treatmentPlanId = 333;
    var personId = '1234';
    var treatmentPlanServices = [];
    beforeEach(function () {
      treatmentPlanServices = _.cloneDeep(treatmentPlanServicesMock);
    });

    it('should call patientServices.TreatmentPlans.LastPriority ', function () {
      treatmentPlansFactory.SaveServicesToExistingTreatmentPlan(
        personId,
        treatmentPlanId,
        treatmentPlanServices
      );
      expect(patientServices.TreatmentPlans.addServices).toHaveBeenCalledWith(
        { Id: personId, TreatmentPlanId: treatmentPlanId },
        treatmentPlanServices
      );
    });
  });

  describe('DefaultPriorityOrder method -> ', function () {
    var treatmentPlanId = 333;
    var activeTreatmentPlan = {};
    beforeEach(function () {
      activeTreatmentPlan = {
        TreatmentPlanHeader: { TreatmentPlanId: treatmentPlanId },
      };
    });

    it('should call patientServices.TreatmentPlans.DefaultPriorityOrder ', function () {
      treatmentPlansFactory.DefaultPriorityOrder(activeTreatmentPlan);
      expect(
        patientServices.TreatmentPlans.DefaultPriorityOrder
      ).toHaveBeenCalledWith({ Id: treatmentPlanId });
    });
  });

  //#endregion

  describe('CalculateInsuranceEstimateOnServices function ->', function () {
    var services, accountMemberId;
    beforeEach(function () {
      accountMemberId = 'accountMemberId';
      services = [
        {
          ServiceTransaction: {
            InsuranceEstimate: {},
            AccountMemberId: accountMemberId,
          },
        },
        {
          ServiceTransaction: {
            InsuranceEstimate: {},
            AccountMemberId: accountMemberId,
          },
        },
      ];

      financialService.CreateOrCloneInsuranceEstimateObject = jasmine
        .createSpy()
        .and.returnValue({});
      financialService.RecalculateInsuranceWithCascadingEstimates =
        jasmine.createSpy();
    });

    it('should call financialService.CreateOrCloneInsuranceEstimateObject', function () {
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(services);
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject
      ).toHaveBeenCalledWith(services[0].ServiceTransaction);
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject
      ).toHaveBeenCalledWith(services[1].ServiceTransaction);
    });

    it('should set AccountMemberId on insurance estimates', function () {
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(services);
      expect(services[0].ServiceTransaction.AccountMemberId).toBe(
        accountMemberId
      );
      expect(services[1].ServiceTransaction.AccountMemberId).toBe(
        accountMemberId
      );
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with correct services when service is not deleted', function () {
      services[0].ServiceTransaction.IsDeleted = false;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(services);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith(jasmine.objectContaining({ length: 2 }));
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with correct services when service is deleted', function () {
      services[0].ServiceTransaction.IsDeleted = true;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(services);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith(jasmine.objectContaining({ length: 1 }));
    });
  });

  describe('CalculateInsuranceEstimateOnServices function ->', function () {
    var treatmentPlanServices, accountMemberId;
    beforeEach(function () {
      accountMemberId = 'accountMemberId';
      treatmentPlanServices = [
        {
          ServiceTransaction: {
            ServiceTransactionId: '1234',
            ServiceTransactionStatusId: 1,
            InsuranceEstimate: {},
            AccountMemberId: accountMemberId,
          },
        },
        {
          ServiceTransaction: {
            ServiceTransactionId: '1235',
            ServiceTransactionStatusId: 1,
            InsuranceEstimate: {},
            AccountMemberId: accountMemberId,
          },
        },
      ];
      financialService.CreateOrCloneInsuranceEstimateObject = jasmine
        .createSpy()
        .and.returnValue({});
      financialService.RecalculateInsuranceWithCascadingEstimates =
        jasmine.createSpy();
    });

    it('should call financialService.CreateOrCloneInsuranceEstimateObject', function () {
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(
        treatmentPlanServices
      );
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject
      ).toHaveBeenCalledWith(treatmentPlanServices[0].ServiceTransaction);
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject
      ).toHaveBeenCalledWith(treatmentPlanServices[1].ServiceTransaction);
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with correct services when service is not deleted', function () {
      treatmentPlanServices[0].ServiceTransaction.IsDeleted = false;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(
        treatmentPlanServices
      );
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalled();
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(
        treatmentPlanServices
      );
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[1].ServiceTransaction]);
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[1].ServiceTransaction.IsDeleted = true;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(
        treatmentPlanServices
      );
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[0].ServiceTransaction]);
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[1].ServiceTransaction.ServiceTransactionStatusId = 3;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(
        treatmentPlanServices
      );
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[0].ServiceTransaction]);
    });
    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[1].ServiceTransaction.ServiceTransactionStatusId = 2;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(
        treatmentPlanServices
      );
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[0].ServiceTransaction]);
    });
    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[1].ServiceTransaction.ServiceTransactionStatusId = 8;
      treatmentPlansFactory.CalculateInsuranceEstimateOnServices(
        treatmentPlanServices
      );
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[0].ServiceTransaction]);
    });
  });

  describe('CalculateInsuranceEstimates function ->', function () {
    var treatmentPlan = { TreatmentPlanServices: [] };
    var treatmentPlanServices;
    beforeEach(function () {
      treatmentPlanServices = [
        {
          ServiceTransaction: {
            ServiceTransactionId: '1234',
            ServiceTransactionStatusId: 1,
            InsuranceEstimate: {},
          },
        },
        {
          ServiceTransaction: {
            ServiceTransactionId: '1235',
            ServiceTransactionStatusId: 1,
            InsuranceEstimate: {},
          },
        },
      ];
      treatmentPlan.TreatmentPlanServices = treatmentPlanServices;
      financialService.CreateOrCloneInsuranceEstimateObject = jasmine
        .createSpy()
        .and.returnValue({});
      financialService.RecalculateInsuranceWithCascadingEstimates =
        jasmine.createSpy();
    });

    it('should call financialService.CreateOrCloneInsuranceEstimateObject', function () {
      treatmentPlansFactory.CalculateInsuranceEstimates(treatmentPlan);
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject
      ).toHaveBeenCalledWith(treatmentPlanServices[0].ServiceTransaction);
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject
      ).toHaveBeenCalledWith(treatmentPlanServices[1].ServiceTransaction);
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with correct services when service is not deleted', function () {
      treatmentPlanServices[0].ServiceTransaction.IsDeleted = false;
      treatmentPlansFactory.CalculateInsuranceEstimates(treatmentPlan);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith(jasmine.objectContaining({ length: 2 }));
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      treatmentPlansFactory.CalculateInsuranceEstimates(treatmentPlan);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[1].ServiceTransaction]);
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[1].ServiceTransaction.IsDeleted = true;
      treatmentPlansFactory.CalculateInsuranceEstimates(treatmentPlan);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[0].ServiceTransaction]);
    });

    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 3;
      treatmentPlansFactory.CalculateInsuranceEstimates(treatmentPlan);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[1].ServiceTransaction]);
    });
    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 2;
      treatmentPlansFactory.CalculateInsuranceEstimates(treatmentPlan);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[1].ServiceTransaction]);
    });
    it('should call financialService.RecalculateInsuranceWithCascadingEstimates with services that are not complete and not IsDeleted ', function () {
      treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 8;
      treatmentPlansFactory.CalculateInsuranceEstimates(treatmentPlan);
      expect(
        financialService.RecalculateInsuranceWithCascadingEstimates
      ).toHaveBeenCalledWith([treatmentPlanServices[1].ServiceTransaction]);
    });
  });
});

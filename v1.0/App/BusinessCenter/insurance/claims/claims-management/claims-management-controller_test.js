describe('claims-management-controller tests -> ', function () {
  var deferred, q, httpBackend, rootScope, validateClaimMessagesFactory;
  var claimServiceMock,
    unittestscope,
    ctrl,
    patientServiceMock,
    modalFactoryMock,
    patientLandingFactoryMock,
    toastrFactory,
    location,
    mockCommonServices,
    mockPatSecurityService,
    submitClaimsMockStatusResponses,
    submitClaimsMockInvalidClaimsResponses,
    filter,
    timeout,
    personFactoryMock,
    patientValidationFactoryMock,
    globalSearchFactoryMock,
    patientLocationAuthorization,
    mockClaimAlertHistoryModalService,
    mockFeatureFlagService,
    mockFuseFlag,
    windowMock,
    mockInsuranceErrorMessageGeneratorService,
    viewClaimServiceMock;  
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {

      mockClaimAlertHistoryModalService = {
        open: jasmine.createSpy().and.returnValue({
          events: {
            pipe: jasmine
              .createSpy()
              .and.returnValue({ subscribe: jasmine.createSpy() }),
            subscribe: jasmine.createSpy(),
          },
          subscribe: jasmine.createSpy(),
          closed: jasmine.createSpy(),
        }),
        };
        $provide.value('ClaimAlertHistoryModalService', mockClaimAlertHistoryModalService );

        mockInsuranceErrorMessageGeneratorService = {
            open: jasmine.createSpy().and.returnValue({
                events: {
                    pipe: jasmine
                        .createSpy()
                        .and.returnValue({ subscribe: jasmine.createSpy() }),
                    subscribe: jasmine.createSpy(),
                },
                subscribe: jasmine.createSpy(),
                closed: jasmine.createSpy(),
            }),
        };      
        $provide.value('InsuranceErrorMessageGeneratorService', mockInsuranceErrorMessageGeneratorService);      
      
      mockFeatureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
      };
      $provide.value('FeatureFlagService', mockFeatureFlagService );

      mockFuseFlag = {};
      $provide.value('FuseFlag', mockFuseFlag );


      claimServiceMock = {
        get: jasmine.createSpy().and.callFake(function () {
          return {};
        }),
        getClaimById: jasmine.createSpy().and.callFake(function () {
          return {};
        }),
        search: jasmine.createSpy(),
        getClaimRejectionMessage: jasmine.createSpy(
          'ClaimsService.getClaimRejectionMessage'
        ),
      };
      $provide.value('ClaimsService', claimServiceMock);

      validateClaimMessagesFactory = {
        Message: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value(
        'ValidateClaimMessagesFactory',
        validateClaimMessagesFactory
      );

      modalFactoryMock = {
        Modal: jasmine.createSpy().and.callFake(function () {
          return {
            result: {
              then: function (callback) {
                callback();
              },
            },
          };
        }),
        ConfirmModal: jasmine.createSpy().and.callFake(function () {}),
      };

      patientLandingFactoryMock = {
        GetLocations: jasmine.createSpy().and.callFake(function () {
          return {
            then: function (callback) {
              return callback([
                {
                  some: 'thing',
                  hoursInfo: {
                    isOpen: true,
                  },
                },
              ]);
            },
          };
        }),
      };

      submitClaimsMockStatusResponses = [
        { TrackClaim: false, Status: 2, Type: 2, IsReprint: false },
        { TrackClaim: false, Status: 2, Type: 1, IsReprint: false },
      ];

      submitClaimsMockInvalidClaimsResponses = [];

      viewClaimServiceMock = {
        viewOrPreviewPdf: jasmine
          .createSpy('viewClaimServiceMock.viewOrPreviewPdf')
          .and.callFake(function (claim, enableEliminateStaleClaims) {
            return {
              toPromise: function () {
                return {
                  then: function (successCallback, errorCallback) {
                    successCallback();
                  },
                  finally: function (callback) {
                    callback();
                  },
                };
              },
            };
          }),
      }

      patientServiceMock = {
        Patients: {
          get: jasmine.createSpy(),
        },
        ClaimChangeStatus: {
          update: jasmine.createSpy(),
        },
        Claim: {
          CheckPayerAcceptsAttachments: jasmine
            .createSpy()
            .and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve({ Value: [] });
              return deferred;
            }),
        },
        PredChangeStatus: {
          update: jasmine.createSpy(),
        },
        PatientBenefitPlan: {
          get: jasmine.createSpy(),
        },
        ClaimsAndPredeterminations: {
          validateForAttachments: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve({ Value: [] });
            return deferred;
          }),
          submit: jasmine.createSpy(),
          submitGrid: jasmine
            .createSpy('PatientServices.ClaimsandPredeterminatins.submitGrid')
            .and.callFake(function (postObject, successCallback) {
              successCallback({
                Value: {
                  ClaimStatusDtos: submitClaimsMockStatusResponses,
                  InvalidClaims: submitClaimsMockInvalidClaimsResponses,
                },
              });
            }),
          validateById: jasmine.createSpy(),
        },
        GetClaimInformation: jasmine.createSpy().and.callFake(function () {
          return null;
        }),
      };
      $provide.value('PatientServices', patientServiceMock);
      $provide.value('ViewClaimService', viewClaimServiceMock);

      $provide.value('ModalFactory', modalFactoryMock);

      mockCommonServices = {
        Insurance: {
          Claim: {
            updateJ430DClaim: jasmine.createSpy(
              'mockCommonServices.Insurance.Claim.updateJ430DClaim'
            ),
            changeSubmissionMethod: jasmine.createSpy().and.returnValue({
              then: function () {},
            }),
          },
          ClaimPdf: jasmine
            .createSpy('mockCommonServices.Insurance.ClaimPdf')
            .and.returnValue({
              then: function () {},
            }),
          PrintClaimBatch: jasmine
            .createSpy('mockCommonServices.Insurance.PrintClaimBatch')
            .and.returnValue({
              then: function () {},
            }),
        },
      };

      mockPatSecurityService = {
        IsAuthorizedByAbbreviation: jasmine
          .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
          .and.callFake(function () {
            return true;
          }),
        generateMessage: jasmine.createSpy(
          'patSecurityService.generateMessage'
        ),
      };

      personFactoryMock = {
        getById: jasmine
          .createSpy('personFactoryMock.getById')
          .and.returnValue({
            then: function (callback) {
              var result = { Value: '' };
              callback(result);
            },
          }),
      };
      $provide.value('PersonFactory', personFactoryMock);

      patientLocationAuthorization = {
        authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false },
      };

      patientValidationFactoryMock = {
        PatientSearchValidation: jasmine
          .createSpy('patientValidationFactoryMock.PatientSearchValidation')
          .and.returnValue({
            then: function (callback) {
              callback(patientLocationAuthorization);
            },
          }),
        LaunchPatientLocationErrorModal: jasmine
          .createSpy(
            'patientValidationFactoryMock.LaunchPatientLocationErrorModal'
          )
          .and.returnValue(),
      };
      $provide.value('PatientValidationFactory', patientValidationFactoryMock);

      globalSearchFactoryMock = {
        SaveMostRecentPerson: jasmine
          .createSpy('globalSearchFactoryMock.SaveMostRecentPerson')
          .and.returnValue(),
      };
      $provide.value('GlobalSearchFactory', globalSearchFactoryMock);

      windowMock = {
        open: jasmine.createSpy('windowMock.open').and.returnValue({
          document: {
            write: jasmine
              .createSpy('windowMock.document.write')
              .and.returnValue(),
          },
        }),
      };
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $filter,
    $q,
    $httpBackend,
    $timeout
  ) {
    unittestscope = $rootScope.$new();
    rootScope = $rootScope;
    httpBackend = $httpBackend;
    timeout = $timeout;
    unittestscope.getTabCount = jasmine.createSpy();
    q = $q;
    filter = $filter;
    //mock for toastrFactory
    toastrFactory = {
      error: jasmine.createSpy('toastrFactory.error'),
      success: jasmine.createSpy('toastrFactory.success'),
    };

    //mock for location
    location = {
      path: jasmine.createSpy('location.path'),
      $$path: {
        substr: jasmine.createSpy(),
        indexOf: jasmine.createSpy(),
      },
      $$absUrl: '/test/test/BusinessCenter/Insurance',
      search: jasmine.createSpy('$location.search').and.returnValue({}),
    };

    ctrl = $controller('ClaimsManagementController', {
      $scope: unittestscope,
      ClaimsService: claimServiceMock,
      PatientServices: patientServiceMock,
      PatientLandingFactory: patientLandingFactoryMock,
      toastrFactory: toastrFactory,
      $location: location,
      CommonServices: mockCommonServices,
      patSecurityService: mockPatSecurityService,
      userSettingsDataService: {
        isNewNavigationEnabled: function () {
          return false;
        },
      },
      $window: windowMock,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected claims service', function () {
      expect(claimServiceMock).not.toBeNull();
    });

    it('should have injected patient service', function () {
      expect(patientServiceMock).not.toBeNull();
    });

    it('should have populated locations', function () {
      expect(unittestscope.locations).not.toBeNull();
    });
  });

  describe('ctrl.authClaimViewAccess -> ', function () {
    it('should call security service', function () {
      ctrl.authClaimViewAccess();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.authClaimEditAccess -> ', function () {
    it('should call security service ', function () {
      ctrl.authClaimEditAccess();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.authAccess', function () {
    it('should call not authorized if not authorized -> ', function () {
      spyOn(ctrl, 'notifyNotAuthorized');
      spyOn(ctrl, 'authClaimViewAccess').and.callFake(function () {
        return false;
      });
      ctrl.authAccess();
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
    });
    it('should set hasViewAccess if has view access -> ', function () {
      spyOn(ctrl, 'notifyNotAuthorized');
      ctrl.authAccess();
      expect(ctrl.notifyNotAuthorized).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.authPatientInsurancePaymentViewAccess -> ', function () {
    it('should call security service ', function () {
      ctrl.authPatientInsurancePaymentViewAccess();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.notifyNotAuthorized -> ', function () {
    it('should call toastr and redirect', function () {
      ctrl.notifyNotAuthorized();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(location.path).toHaveBeenCalled();
    });
  });
  
  describe('initialize -> ', function () {
    it('should call ctrl.checkFeatureFlags', function () {
      spyOn(ctrl, 'checkFeatureFlags')
      unittestscope.initialize();
      expect(ctrl.checkFeatureFlags).toHaveBeenCalled();
    });
  });

  describe('ctrl.getLocationTimezone -> ', function () {
    it('should return the timezone for the locationId parameter ', function () {
      unittestscope.masterLocations = [
        {LocationId: '456', Timezone: 'Alaskan Standard Time'},
        {LocationId: '789', Timezone: 'Central Standard Time'},
        {LocationId: '123', Timezone: 'Alaskan Standard Time'},
        {LocationId: '258', Timezone: 'Mountain Standard Time'},
      ]
      expect(ctrl.getLocationTimezone('123')).toEqual('Alaskan Standard Time')
    });
  });

  describe('ctrl.openClaimAlertHistoryModal -> ', function () {
    beforeEach(() => {
      spyOn(ctrl, 'getLocationTimezone').and.returnValue('Mountain Standard Time');
    })
    it('should return the timezone for the locationId parameter ', function () {
      const claim = {ClaimId: '1245', LocationId: '1233'};
      ctrl.openClaimAlertHistoryModal(claim)
      expect(ctrl.getLocationTimezone).toHaveBeenCalledWith(claim.LocationId);
    });

    it('should call claimAlertHistoryModalService.open with data ', function () {
      const claim = {ClaimId: '1245', LocationId: '1233'};
      const data = {        
        cancel: 'Close',
        claimId: claim.ClaimId,
        claimTimezone: 'Mountain Standard Time'
      }      
      ctrl.openClaimAlertHistoryModal(claim)
      expect(mockClaimAlertHistoryModalService.open).toHaveBeenCalledWith({data});
    });
  });

  describe('scope.viewAlerts -> ', function () {
    let claim;
    beforeEach(() => {
      claim = {ClaimId: '1245', LocationId: '1233', Status: 6};
      spyOn(ctrl, 'openClaimAlertHistoryModal');
      spyOn(ctrl, 'viewRejectedClaimAlert');
      spyOn(ctrl, 'viewClaimAlerts');
    })
    it('should call ctrl.openClaimAlertHistoryModal with Claim if claim.Status is 6 and enableClaimStatusHistory', function () {
      unittestscope.enableClaimStatusHistory = true;
      unittestscope.viewAlerts(claim);
      expect(ctrl.openClaimAlertHistoryModal).toHaveBeenCalledWith(claim);
    });

    it('should call ctrl.viewRejectedClaimAlert with Claim if claim.Status is 6 and enableClaimStatusHistory is false', function () {
      unittestscope.enableClaimStatusHistory = false;
      unittestscope.viewAlerts(claim);
      expect(ctrl.viewRejectedClaimAlert).toHaveBeenCalledWith(claim);
    });

    it('should call ctrl.openClaimAlertHistoryModal with Claim if claim.Status is not 6', function () {
      claim.Status = 5;
      unittestscope.viewAlerts(claim);
      expect(ctrl.viewClaimAlerts).toHaveBeenCalledWith(claim);
    });
  }); 

  describe('getAllClaims function -> ', function () {
    var res = {
      Value: {
        Rows: [],
        CarriersOnClaims: [],
        FilterCriteria: { CarrierIds: [] },
      },
    };
    beforeEach(function () {
      spyOn(ctrl, 'getMinMaxDates');
      spyOn(ctrl, 'getPatientName');
      spyOn(ctrl, 'getStatusNames');
      spyOn(ctrl, 'getCarriers');
    });
    it('should call supporting methods if res.Value.Rows', function () {
      res.Value.Rows = [
        {
          Type: 1,
          MinServiceDate: moment().format(),
          MaxServiceDate: moment().format(),
        },
        {
          Type: 1,
          MinServiceDate: moment().format(),
          MaxServiceDate: moment().format(),
        },
      ];
      claimServiceMock.search = function (data, success) {
        success(res);
      };
      unittestscope.getAllClaims();
      res.Value.Rows.forEach(row => {
        expect(ctrl.getMinMaxDates).toHaveBeenCalledWith(row);
        expect(ctrl.getPatientName).toHaveBeenCalledWith(row);
        expect(ctrl.getStatusNames).toHaveBeenCalledWith(row);
      });
      expect(ctrl.getCarriers).toHaveBeenCalledWith(
        res.Value.CarriersOnClaims,
        res.Value.FilterCriteria.CarrierIds
      );
    });

    it('should add Z to SubmittedDate for each row in res.Value.Rows that has a non null DateSubmitted if not already ending in z', function () {
      res.Value.Rows = [
        {
          Type: 1,
          MinServiceDate: moment().format(),
          MaxServiceDate: moment().format(),
          DateSubmitted: '2021-10-28 01:42:58.0451905',
        },
      ];
      claimServiceMock.search = function (data, success) {
        success(res);
      };
      unittestscope.getAllClaims();
      expect(res.Value.Rows[0].DateSubmitted).toBe(
        '2021-10-28 01:42:58.0451905Z'
      );
    });

    it('should do nothing to SubmittedDate for each row in res.Value.Rows that has a null DateSubmitted', function () {
      res.Value.Rows = [
        {
          Type: 1,
          MinServiceDate: moment().format(),
          MaxServiceDate: moment().format(),
          DateSubmitted: null,
        },
      ];
      claimServiceMock.search = function (data, success) {
        success(res);
      };
      unittestscope.getAllClaims();
      expect(res.Value.Rows[0].DateSubmitted).toBe(null);
    });

    it('should do nothing to SubmittedDate for each row in res.Value.Rows that a DateSubmitted ending with Z', function () {
      res.Value.Rows = [
        {
          Type: 1,
          MinServiceDate: moment().format(),
          MaxServiceDate: moment().format(),
          DateSubmitted: '2021-10-28 01:42:58.0451905Z',
        },
      ];
      claimServiceMock.search = function (data, success) {
        success(res);
      };
      unittestscope.getAllClaims();
      expect(res.Value.Rows[0].DateSubmitted).toBe(
        '2021-10-28 01:42:58.0451905Z'
      );
    });

    it('should do nothing for each row in res.Value.Rows that does not have DateSubmitted', function () {
      res.Value.Rows = [
        {
          Type: 1,
          MinServiceDate: moment().format(),
          MaxServiceDate: moment().format(),
        },
      ];
      claimServiceMock.search = function (data, success) {
        success(res);
      };
      unittestscope.getAllClaims();
      expect(res.Value.Rows[0].DateSubmitted).toBe(undefined);
    });
  });

  describe('ctrl.searchTextChanged ->', function () {
    it('should call ctrl.resentInfiniteScroll and ctrl.getCounts', function () {
      spyOn(ctrl, 'resetInfiniteScroll');
      spyOn(ctrl, 'getCounts');
      unittestscope.searchTextChanged();
      expect(ctrl.resetInfiniteScroll).toHaveBeenCalled();
      expect(ctrl.getCounts).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPostFilters ->', function () {
    beforeEach(function () {
      unittestscope.selectedLocations = [{ LocationId: 3 }];
      unittestscope.selectedSubmissionMethods = [
        { Value: 4, Text: 'All Submission Methods', Selected: true },
      ];
      unittestscope.selectedCarriers = [
        { Value: 0, CarrierName: 'All Carriers' },
      ];
      unittestscope.filterProperties = {
        selectedClaimPredoption: '1',
        selectedProvider: 2,
        selectedDateFilter: 4,
        selectedSubmittedStatuses: [{ Value: 6 }],
        selectedGeneralStatuses: [{ Value: 1 }, { Value: 2 }, { Value: 3 }],
      };
      unittestscope.searchText = 'PatientName';
    });
    it('should return correct filter options based for unsubmitted tab', function () {
      var result = ctrl.getPostFilters('unsubmitted');
      expect(result.ClaimTypes).toEqual([1]);
      expect(result.LocationIds).toEqual([3]);
      expect(result.ClaimStatuses).toEqual([1, 3]);
      expect(result.CarrierIds).toEqual([]);
      expect(result.DateSubmitted).toEqual(undefined);
      expect(result.ClaimMethods).toEqual(undefined);
      expect(result.HasErrors).toEqual(undefined);
      expect(result.IsReceived).toEqual(undefined);
      expect(result.SearchText).toEqual('PatientName');
    });
    it('should return correct filter options based for submitted tab', function () {
      var result = ctrl.getPostFilters('submitted');
      expect(result.ClaimTypes).toEqual([1]);
      expect(result.LocationIds).toEqual([3]);
      expect(result.ClaimStatuses).toEqual([6]);
      expect(result.CarrierIds).toEqual([]);
      expect(result.DateSubmitted).toEqual(4);
      expect(result.ClaimMethods).toEqual([1, 2, 3]);
      expect(result.HasErrors).toEqual(undefined);
      expect(result.IsReceived).toEqual(undefined);
      expect(result.SearchText).toEqual('PatientName');
    });
    it('should return correct filter options based for alerts tab', function () {
      var result = ctrl.getPostFilters('alerts');
      expect(result.ClaimTypes).toEqual([1]);
      expect(result.LocationIds).toEqual([3]);
      expect(result.ClaimStatuses).toEqual([6]);
      expect(result.CarrierIds).toEqual([]);
      expect(result.DateSubmitted).toEqual(undefined);
      expect(result.ClaimMethods).toEqual(undefined);
      expect(result.HasErrors).toEqual(true);
      expect(result.IsReceived).toEqual(undefined);
      expect(result.SearchText).toEqual('PatientName');
    });
    it('should return correct filter options based for all tab', function () {
      var result = ctrl.getPostFilters('all');
      expect(result.ClaimTypes).toEqual([1]);
      expect(result.LocationIds).toEqual([3]);
      expect(result.ClaimStatuses).toEqual([1, 3, 2, 4, 9, 5, 6, 6]);
      expect(result.CarrierIds).toEqual([]);
      expect(result.DateSubmitted).toEqual(4);
      expect(result.ClaimMethods).toEqual(undefined);
      expect(result.HasErrors).toEqual(true);
      expect(result.IsReceived).toEqual(false);
      expect(result.SearchText).toEqual('PatientName');
    });
  });

  describe('ctrl.getSubmittedStatuses', function () {
    it('should return correct statuses', function () {
      unittestscope.filterProperties = {
        selectedSubmittedStatuses: [
          { Value: 1 },
          { Value: 2 },
          { Value: 3 },
          { Value: 4 },
          { Value: 5 },
        ],
      };
      var result = ctrl.getSubmittedStatuses();
      expect(result).toEqual([1, 2, 3, 4, 9, 5]);
    });
  });

  describe('ctrl.getSubmissionMethods', function () {
    it('should return correct methods when 4 selected', function () {
      unittestscope.selectedSubmissionMethods = [{ Value: 4 }];

      var result = ctrl.getSubmissionMethods();
      expect(result).toEqual([1, 2, 3]);
    });
    it('should return correct methods when 2 & 3 selected', function () {
      unittestscope.selectedSubmissionMethods = [{ Value: 2 }, { Value: 3 }];
      var result = ctrl.getSubmissionMethods();
      expect(result).toEqual([2, 3]);
    });
  });

  describe('ctrl.getCarriers', function () {
    it('when 2 carriers and none selected, should return 3 carriers with "All Carriers" selected', function () {
      var carriers = [
        { Name: 'United', CarrierId: '00000000-0000-0000-0000-000000000001' },
        { Name: 'Aetna', CarrierId: '00000000-0000-0000-0000-000000000002' },
      ];
      ctrl.getCarriers(carriers);
      expect(unittestscope.carrierList.length).toEqual(3);
      expect(unittestscope.carrierList[0].Selected).toEqual(true);
    });
    it('when 2 carriers and 2 selected, should return 3 carriers with 2 carriers selected', function () {
      var carriers = [
        {
          Name: 'United',
          CarrierId: '00000000-0000-0000-0000-000000000001',
          Selected: true,
        },
        {
          Name: 'Aetna',
          CarrierId: '00000000-0000-0000-0000-000000000002',
          Selected: true,
        },
      ];
      var selectedCarriers = [carriers[0].CarrierId, carriers[1].CarrierId];
      ctrl.getCarriers(carriers, selectedCarriers);
      expect(unittestscope.carrierList.length).toEqual(3);
      expect(unittestscope.carrierList[0].Selected).toEqual(false);
      expect(unittestscope.carrierList[1].Selected).toEqual(true);
      expect(unittestscope.carrierList[2].Selected).toEqual(true);
    });
    it('should sort carriers by name', function () {
      let carrier1Name = 'United';
      let carrier2Name = 'Aetna';
      var carriers = [
        {
          Name: carrier1Name,
          CarrierId: '00000000-0000-0000-0000-000000000001',
        },
        {
          Name: carrier2Name,
          CarrierId: '00000000-0000-0000-0000-000000000002',
        },
      ];
      var selectedCarriers = [carriers[0].CarrierId, carriers[1].CarrierId];
      ctrl.getCarriers(carriers, selectedCarriers);
      expect(unittestscope.carrierList.length).toEqual(3);
      expect(unittestscope.carrierList[1].CarrierName).toEqual(carrier2Name);
      expect(unittestscope.carrierList[2].CarrierName).toEqual(carrier1Name);
    });
  });

  describe('ctrl.getSelectedCarriers', function () {
    it('when no selected carriers, returns empty array', function () {
      unittestscope.selectedCarriers = [];
      var result = ctrl.getSelectedCarriers();
      expect(result).toEqual([]);
      expect(unittestscope.isFilteredByCarrier).toEqual(false);
    });
    it('when "All Carriers" selected returns empty array', function () {
      unittestscope.selectedCarriers = [{ CarrierName: 'All Carriers' }];
      var result = ctrl.getSelectedCarriers();
      expect(result).toEqual([]);
      expect(unittestscope.isFilteredByCarrier).toEqual(false);
    });
    it('when 1 carrier selected returns 1 selected carrier', function () {
      unittestscope.selectedCarriers = [
        {
          CarrierName: 'United',
          CarrierId: '00000000-0000-0000-0000-000000000002',
          Selected: true,
        },
      ];
      var result = ctrl.getSelectedCarriers();
      expect(result).toEqual(['00000000-0000-0000-0000-000000000002']);
      expect(unittestscope.isFilteredByCarrier).toEqual(true);
    });
  });

  describe('ctrl.getGeneralStatuses', function () {
    it('should return correct statuses', function () {
      unittestscope.filterProperties = {
        selectedGeneralStatuses: [
          { Value: 1 },
          { Value: 2 },
          { Value: 3 },
          { Value: 4 },
          { Value: 5 },
        ],
      };
      var result = ctrl.getGeneralStatuses();
      expect(result).toEqual([1, 3, 2, 4, 9, 5, 6, 6, 7, 8]);
    });
  });

  describe('scope.enterCarrierResponse ->', function () {
    it('should call location.path', function () {
      location.path = jasmine.createSpy();
      unittestscope.enterCarrierResponse({
        ClaimId: 'AFB2C8BB-CC5F-E611-B258-989096E2D412',
        PatientBenefitPlanPriority: 1,
      });
      expect(location.path).toHaveBeenCalled();
    });
    it('should call not location.path', function () {
      location.path = jasmine.createSpy();
      unittestscope.enterCarrierResponse({
        ClaimId: 'AFB2C8BB-CC5F-E611-B258-989096E2D412',
        PatientBenefitPlanPriority: 2,
      });
      expect(location.path).not.toHaveBeenCalled();
    });
  });

  describe('scope.closePredetermination ->', function () {
    it('should call modalFactoryMock.Modal', function () {
      unittestscope.closePredetermination(
        'AFB2C8BB-CC5F-E611-B258-989096E2D412'
      );
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
    });

    it('should call ctrl.resetInfiniteScroll and ctrl.getCounts', function () {
      spyOn(ctrl, 'resetInfiniteScroll');
      spyOn(ctrl, 'getCounts');
      unittestscope.closePredetermination(
        'AFB2C8BB-CC5F-E611-B258-989096E2D412'
      );
      expect(ctrl.resetInfiniteScroll).toHaveBeenCalled();
      expect(ctrl.getCounts).toHaveBeenCalled();
    });
  });

  describe('ctrl.closeDoNotTrackClaims ->', function () {
    beforeEach(function () {
      unittestscope.claimMgmtsLists = [
        {
          ClaimId: 'dc7b25f9-47ec-4a2f-a759-576e0e601c1e',
          ClaimCommonId: '4744dcfc-6305-4d83-8e21-a7e10c600e76',
          Status: 2,
          LocationId: 6751370,
          TrackClaim: false,
          Type: 1,
          PatientId: '968c8fz1-93b4-40d3-b226-653b491ac541',
          IsReprint: false,
          PatientName: 'Test Name',
          DataTag: null,
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
        {
          ClaimId: 'd1q1d296-d935-4a02-81e5-abdcf47498f0',
          ClaimCommonId: '0qf204d6-7147-4520-abe8-44e619296eec',
          Status: 2,
          LocationId: 6751370,
          TrackClaim: false,
          Type: 2,
          PatientId: '96828cf1-93b4-40d3-b226-653b491ac541',
          IsReprint: false,
          PatientName: 'Test Name',
          DataTag: null,
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
      ];
    });

    it('should call ctrl.closeDoNotTrackClaims once if passed in array is empty', function () {
      unittestscope.claimMgmtsLists = [];
      spyOn(ctrl, 'closeDoNotTrackClaims').and.callThrough();
      ctrl.closeDoNotTrackClaims(unittestscope.claimMgmtsLists)();
      expect(ctrl.closeDoNotTrackClaims).toHaveBeenCalledTimes(1);
    });

    it('should call ctrl.closeDoNotTrackClaims three times if passed in array length is 2', function () {
      spyOn(ctrl, 'closeDoNotTrackClaims').and.callThrough();
      ctrl.closeDoNotTrackClaims(unittestscope.claimMgmtsLists)();
      expect(ctrl.closeDoNotTrackClaims).toHaveBeenCalledTimes(3);
    });

    it('should remove each claim/predetermination from passed in array', function () {
      expect(unittestscope.claimMgmtsLists.length).toEqual(2);
      ctrl.closeDoNotTrackClaims(unittestscope.claimMgmtsLists)();
      expect(unittestscope.claimMgmtsLists.length).toEqual(0);
    });

    it('should call modalFactoryMock.Modal and ctrl.getCounts', function () {
      spyOn(ctrl, 'getCounts');
      ctrl.closeDoNotTrackClaims(unittestscope.claimMgmtsLists)();
      expect(ctrl.getCounts).toHaveBeenCalled();
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
    });
  });

  describe('ctrl.submitClaimsAndPredeterminations ->', function () {
    beforeEach(function () {
      unittestscope.claimMgmtsLists = [
        {
          SubmittalMethod: 1,
          PatientBenefitPlanPriority: 0,
          Selected: true,
          Status: 1,
          ClaimId: 12,
        },
        {
          SubmittalMethod: 1,
          PatientBenefitPlanPriority: 0,
          Selected: true,
          HasErrors: true,
          Status: 1,
          ClaimId: 13,
        },
        {
          SubmittalMethod: 1,
          PatientBenefitPlanPriority: 0,
          Selected: false,
          HasErrors: true,
          Status: 1,
          ClaimId: 14,
        },
      ];
    });

    it('should not call to submit when no selected claims', function () {
      unittestscope.claimMgmtsLists = [];
      unittestscope.submitSelectedClaims();
      expect(
        patientServiceMock.ClaimsAndPredeterminations.submitGrid
      ).not.toHaveBeenCalled();
    });

    it('should show invalid claims when response contains invaild claims', function () {
      submitClaimsMockInvalidClaimsResponses = [
        { ClaimId: 12 },
        { ClaimId: 13 },
      ];
      unittestscope.submitSelectedClaims();
      expect(
        patientServiceMock.ClaimsAndPredeterminations.submitGrid
      ).toHaveBeenCalled();
      expect(unittestscope.claimMgmtsLists[0].HasErrors).toEqual(true);
      expect(modalFactoryMock.Modal.calls.count()).toEqual(1); //one to open the invalid claims modal
    });

    it('should close do not track claims', function () {
      unittestscope.submitSelectedClaims();
      expect(
        patientServiceMock.ClaimsAndPredeterminations.submitGrid
      ).toHaveBeenCalled();
      expect(modalFactoryMock.Modal.calls.count()).toEqual(2); //one to close the claim, one to close the predetermination
    });

    it('should call patientServiceMock.ClaimsAndPredeterminations.submitGrid when submitButtonDisabled is false', function () {
      unittestscope.submitButtonDisabled = false;
      unittestscope.submitSelectedClaims();

      expect(
        patientServiceMock.ClaimsAndPredeterminations.submitGrid
      ).toHaveBeenCalled();
    });

    it('should NOT call patientServiceMock.ClaimsAndPredeterminations.submitGrid when submitButtonDisabled is true', function () {
      unittestscope.submitButtonDisabled = true;
      unittestscope.submitSelectedClaims();

      expect(
        patientServiceMock.ClaimsAndPredeterminations.submitGrid
      ).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.submitClaimsAndPredeterminations for a general failed submit claims response ->', function () {
    beforeEach(function () {
      unittestscope.claimMgmtsLists = [{ Selected: true }];
      unittestscope.submitButtonDisabled = false;
      patientServiceMock.ClaimsAndPredeterminations = {
        submitGrid: jasmine.createSpy().and.callFake(function (_, __, fail) {
          fail({});
        }),
      };
    });

    it('should display "An error occurred on Submission" toast message', function () {
      unittestscope.submitSelectedClaims();
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'An error occurred on Submission',
        'Failure'
      );
    });
  });

  describe('ctrl.submitClaimsAndPredeterminations for a 400 response with an "already submitted" InvalidProperty message ->', function () {
    beforeEach(function () {
      unittestscope.claimMgmtsLists = [{ Selected: true }];
      unittestscope.submitButtonDisabled = false;
      patientServiceMock.ClaimsAndPredeterminations.submitGrid = jasmine
        .createSpy()
        .and.callFake(function (_, __, fail) {
          fail({
            status: 400,
            data: {
              InvalidProperties: [
                {
                  PropertyName: 'Status',
                  ValidationMessage:
                    'There are no eligible claims to submit...',
                },
              ],
            },
          });
        });
    });

    it('should display an "already submitted" toast message if submitClaims response is 400 response with a specific InvalidProperty message', function () {
      unittestscope.submitSelectedClaims();
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'One or more claim(s) have already been submitted - please refresh the page to see the latest information.',
        'Server Error'
      );
    });
  });

  describe('ctrl.claimsSubmittedSuccessfully ->', function () {
    it('should update claimMgmtsLists Status property to 4 (InProcess)', function () {
      var claimStatusDtos = [{ ClaimCommonId: 1, Status: 4 }];
      unittestscope.claimMgmtsLists = [
        {
          Status: 3,
          ClaimCommonId: 1,
          HasErrors: false,
          Selected: true,
        },
      ];

      ctrl.claimsSubmittedSuccessfully(claimStatusDtos);
      expect(unittestscope.claimMgmtsLists[0].Status).toBe(4);
    });
    it('should update claimMgmtsLists Status property to 2 (Printed)', function () {
      spyOn(ctrl, 'printValidClaim');
      var claimStatusDtos = [{ ClaimCommonId: 1, Status: 2 }];
      unittestscope.claimMgmtsLists = [
        {
          Status: 1,
          ClaimCommonId: 1,
          HasErrors: false,
          Selected: true,
        },
      ];

      ctrl.claimsSubmittedSuccessfully(claimStatusDtos);
      expect(unittestscope.claimMgmtsLists[0].Status).toBe(2);
    });
    it('should set ClaimEntity HasErrors property to false', function () {
      var claimStatusDtos = [{ ClaimCommonId: 1, Status: 4 }];
      unittestscope.claimMgmtsLists = [
        {
          Status: 3,
          ClaimCommonId: 1,
          HasErrors: true,
          Selected: true,
        },
      ];

      ctrl.claimsSubmittedSuccessfully(claimStatusDtos);
      expect(unittestscope.claimMgmtsLists[0].HasErrors).toBe(false);
    });
    it('should call ctrl.printValidClaim', function () {
      spyOn(ctrl, 'printValidClaim');
      var claimStatusDtos = [{ ClaimCommonId: 1, Status: 2 }];
      unittestscope.claimMgmtsLists = [
        {
          Status: 1,
          ClaimCommonId: 1,
          HasErrors: true,
          Selected: true,
        },
      ];

      ctrl.claimsSubmittedSuccessfully(claimStatusDtos);
      expect(ctrl.printValidClaim).toHaveBeenCalled();
    });
    it('should call ctrl.printValidClaims', function () {
      spyOn(ctrl, 'printValidClaims');
      var claimStatusDtos = [
        { ClaimCommonId: 1, Status: 2 },
        { ClaimCommonId: 2, Status: 2 },
      ];
      unittestscope.claimMgmtsLists = [
        {
          Status: 1,
          ClaimCommonId: 1,
          HasErrors: false,
          Selected: true,
        },
        {
          Status: 1,
          ClaimCommonId: 2,
          HasErrors: false,
          Selected: true,
        },
      ];

      ctrl.claimsSubmittedSuccessfully(claimStatusDtos);
      expect(ctrl.printValidClaims).toHaveBeenCalled();
    });
    it('should call toastrFactory.success', function () {
      var claimStatusDtos = [{ ClaimCommonId: 1, Status: 4 }];
      unittestscope.claimMgmtsLists = [
        {
          ClaimCommon: { Status: 3, ClaimCommonId: 1 },
          ClaimEntity: { HasErrors: false },
          Selected: true,
        },
      ];
      ctrl.claimsSubmittedSuccessfully(claimStatusDtos);
      expect(toastrFactory.success).toHaveBeenCalled();
    });
    it('should call resetInfiniteScroll', function () {
      spyOn(ctrl, 'resetInfiniteScroll').and.callThrough();
      var claimStatusDtos = [{ ClaimCommonId: 1, Status: 4 }];
      ctrl.claimsSubmittedSuccessfully(claimStatusDtos);
      timeout.flush();

      expect(ctrl.resetInfiniteScroll).toHaveBeenCalled();
    });
  });

  describe(' ctrl.openInvalidClaimsModal ->', function () {
    it('should call modalFactory.Modal', function () {
      var invalidClaimData = {};
      ctrl.openInvalidClaimsModal(invalidClaimData);
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
    });
  });

  describe(' ctrl.openRejectedClaimModal ->', function () {
    it('should call modalFactory.Modal', function () {
      var claimRejectionMsgData = {};
      ctrl.openRejectedClaimModal(claimRejectionMsgData);
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
    });
  });

  describe('ctrl.viewClaimAlerts ->', function () {
    it('should call patientServiceMock.ClaimsAndPredeterminations.validateById', function () {
      var claim = { ClaimCommon: { ClaimCommonId: '1' } };
      ctrl.viewClaimAlerts(claim);
      expect(
        patientServiceMock.ClaimsAndPredeterminations.validateById
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.viewRejectedClaimAlert ->', function () {
    it('should call claimService.getClaimRejectionMessage', function () {
      var claim = { ClaimCommon: { ClaimCommonId: '1' } };
      ctrl.viewRejectedClaimAlert(claim);
      expect(claimServiceMock.getClaimRejectionMessage).toHaveBeenCalled();
    });
  });

  describe('scope.attachments -> ', function () {
    var returnVal = { then: function () {} };
    var claim = {};
    beforeEach(function () {
      claim = {
        claimId: '8E72D522-3C21-4BB6-8F66-01098723529B',
        Status: 3,
        locationId: 14,
        EAttachmentEnabled: true,
      };
      ctrl.checkPayerAcceptsAttachment = jasmine
        .createSpy()
        .and.returnValue(returnVal);
      spyOn(ctrl, 'closeDropDown').and.callFake(function () {});
      //spyOn(ctrl, 'checkPayerAcceptsAttachment').and.callFake(function(){});
    });
    it('should call ctrl.checkPayerAcceptsAttachment', function () {
      unittestscope.attachments(claim);
      expect(ctrl.checkPayerAcceptsAttachment).toHaveBeenCalled();
    });

    it('should call closeDropDown', function () {
      unittestscope.attachments(claim);
      expect(ctrl.closeDropDown).toHaveBeenCalled();
    });

    it('should not execute if status is not UnsubmittedElectronic claims or EAttachmentEnabled is false', function () {
      claim.EAttachmentEnabled = false;
      unittestscope.attachments(claim);
      expect(ctrl.closeDropDown).not.toHaveBeenCalled();
      expect(ctrl.checkPayerAcceptsAttachment).not.toHaveBeenCalled();
    });
  });

  describe('scope.attachments if return value from ctrl.checkPayerAcceptsAttachment is true -> ', function () {
    var returnVal = { then: function () {} };
    var returnVal2 = { then: function () {} };
    var claim = {};
    beforeEach(function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      claim = {
        claimId: '8E72D522-3C21-4BB6-8F66-01098723529B',
        ClaimCommonId: '1234',
        Status: 3,
        locationId: 14,
        EAttachmentEnabled: true,
      };
      ctrl.checkPayerAcceptsAttachment = jasmine
        .createSpy()
        .and.returnValue(returnVal);
      spyOn(ctrl, 'closeDropDown').and.callFake(function () {});
      ctrl.validateForAttachments = jasmine
        .createSpy()
        .and.returnValue(returnVal2);
    });

    it('should call ctrl.validateForAttachments if return value from ctrl.checkPayerAcceptsAttachment is true', function () {
      unittestscope.attachments(claim);
      expect(ctrl.validateForAttachments).toHaveBeenCalled();
    });
  });

  describe('scope.attachments if return value from ctrl.checkPayerAcceptsAttachment is false -> ', function () {
    var returnVal = { then: function () {} };
    var returnVal2 = { then: function () {} };
    var claim = {};
    beforeEach(function () {
      returnVal.then = function (callback) {
        callback(false);
      };
      claim = {
        claimId: '8E72D522-3C21-4BB6-8F66-01098723529B',
        Status: 3,
        locationId: 14,
        EAttachmentEnabled: true,
      };
      ctrl.checkPayerAcceptsAttachment = jasmine
        .createSpy()
        .and.returnValue(returnVal);
      spyOn(ctrl, 'closeDropDown').and.callFake(function () {});
      ctrl.validateForAttachments = jasmine
        .createSpy()
        .and.returnValue(returnVal2);
    });

    it('should call ctrl.validateForAttachments if return value from ctrl.checkPayerAcceptsAttachment is true', function () {
      unittestscope.attachments(claim);
      expect(ctrl.validateForAttachments).not.toHaveBeenCalled();
    });
  });

  describe('scope.attachments if return value from ctrl.validateForAttachments indicates no invalid claims -> ', function () {
    var returnVal = { then: function () {} };
    var returnVal2 = { then: function () {} };
    var claim = {};
    beforeEach(function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      claim = {
        claimId: '8E72D522-3C21-4BB6-8F66-01098723529B',
        Status: 3,
        locationId: 14,
        EAttachmentEnabled: true,
      };
      ctrl.checkPayerAcceptsAttachment = jasmine
        .createSpy()
        .and.returnValue(returnVal);
      spyOn(ctrl, 'closeDropDown').and.callFake(function () {});
      ctrl.validateForAttachments = jasmine
        .createSpy()
        .and.returnValue(returnVal2);
      spyOn(unittestscope, 'continueAttachments').and.callFake(function () {});
      spyOn(ctrl, 'openInvalidAttachmentsModal').and.callFake(function () {});
    });

    it('should call scope.continueAttachments if return value from  ctrl.validateForAttachments is null', function () {
      returnVal2.then = function (callback) {
        callback({ Value: null });
      };
      unittestscope.attachments(claim);
      expect(unittestscope.continueAttachments).toHaveBeenCalledWith(claim);
    });

    it('should call scope.continueAttachments if ctrl.validateForAttachments returns no invalid claims', function () {
      returnVal2.then = function (callback) {
        callback({ Value: { InvalidClaims: [] } });
      };
      unittestscope.attachments(claim);
      expect(unittestscope.continueAttachments).toHaveBeenCalledWith(claim);
    });

    it('should call ctrl.openInvalidAttachmentsModal if ctrl.validateForAttachments returns invalid claims', function () {
      returnVal2.then = function (callback) {
        callback({ Value: { InvalidClaims: [{}, {}] } });
      };
      unittestscope.attachments(claim);
      expect(ctrl.openInvalidAttachmentsModal).toHaveBeenCalledWith(
        { InvalidClaims: [{}, {}] },
        false
      );
    });
  });

  describe('ctrl.validateForAttachments method -> ', function () {
    var claim = {};
    var retValue = {};
    beforeEach(function () {
      retValue = { $promise: { then: jasmine.createSpy() } };
      patientServiceMock.ClaimsAndPredeterminations = {
        validateForAttachments: jasmine.createSpy().and.callFake(function () {
          return retValue;
        }),
      };
      claim = { claimId: '8E72D522-3C21-4BB6-8F66-01098723529B' };
    });

    it('should call patientServices.ClaimsAndPredeterminations.validateForAttachments', function () {
      ctrl.validateForAttachments(claim);
      expect(
        patientServiceMock.ClaimsAndPredeterminations.validateForAttachments
      ).toHaveBeenCalledWith({ claimId: claim.ClaimId });
    });
  });

  describe('ctrl.checkPayerAcceptsAttachment method when returns result of true-> ', function () {
    var claim = {};
    var retValue = {};
    beforeEach(function () {
      retValue = {
        $promise: {
          then: function (callback) {
            callback({ Result: true });
          },
        },
      };
      patientServiceMock.Claim = {
        CheckPayerAcceptsAttachments: jasmine
          .createSpy()
          .and.callFake(function () {
            return retValue;
          }),
      };
      claim = {
        claimId: '8E72D522-3C21-4BB6-8F66-01098723529B',
        ClaimCommonId: '5678',
        LocationId: '1234',
      };
      spyOn(ctrl, 'openPayerDoesNotAcceptAttachmentsModal').and.callFake(
        function () {}
      );
    });

    it('should call patientServices.ClaimsAndPredeterminations.CheckPayerAcceptsAttachments', function () {
      ctrl.allowClaimAttachments = true;
      ctrl.allowVendorEligibilityCheckForAttachmentDialog = true;
      ctrl.checkPayerAcceptsAttachment(claim);
      expect(
        patientServiceMock.Claim.CheckPayerAcceptsAttachments
      ).toHaveBeenCalledWith({
        locationId: claim.LocationId,
        claimId: claim.ClaimCommonId,
      });
    });

    it('should not call ctrl.openPayerDoesNotAcceptAttachmentsModal', function () {
      ctrl.allowClaimAttachments = true;
      ctrl.allowVendorEligibilityCheckForAttachmentDialog = true;
      ctrl.checkPayerAcceptsAttachment(claim);
      expect(
        ctrl.openPayerDoesNotAcceptAttachmentsModal
      ).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.checkPayerAcceptsAttachment method when returns result of false-> ', function () {
    var claim = {};
    var retValue = {};
    beforeEach(function () {
      retValue = {
        $promise: {
          then: function (callback) {
            callback({ Result: false });
          },
        },
      };
      patientServiceMock.Claim = {
        CheckPayerAcceptsAttachments: jasmine
          .createSpy()
          .and.callFake(function () {
            return retValue;
          }),
      };
      claim = {
        claimId: '8E72D522-3C21-4BB6-8F66-01098723529B',
        ClaimCommonId: '5678',
        LocationId: '1234',
      };
      spyOn(ctrl, 'openPayerDoesNotAcceptAttachmentsModal').and.callFake(
        function () {}
      );
    });

    it('should call patientServices.ClaimsAndPredeterminations.CheckPayerAcceptsAttachments', function () {
      ctrl.allowClaimAttachments = true;
      ctrl.allowVendorEligibilityCheckForAttachmentDialog = true;
      ctrl.checkPayerAcceptsAttachment(claim);
      expect(
        patientServiceMock.Claim.CheckPayerAcceptsAttachments
      ).toHaveBeenCalledWith({
        locationId: claim.LocationId,
        claimId: claim.ClaimCommonId,
      });
    });

    it('should call ctrl.openPayerDoesNotAcceptAttachmentsModal', function () {
      ctrl.allowClaimAttachments = true;
      ctrl.allowVendorEligibilityCheckForAttachmentDialog = true;
      ctrl.checkPayerAcceptsAttachment(claim);
      expect(ctrl.openPayerDoesNotAcceptAttachmentsModal).toHaveBeenCalled();
    });
  });

  describe('ctrl.missingRequirementsModal method -> ', function () {
    beforeEach(function () {});

    it('should call modalFactory.ConfirmModal with message if res.data.Result.Errors', function () {
      var res = {
        data: {
          Result: {
            Errors: [
              {
                PropertyName: 'PropertyName',
                ValidationMessage: 'ValidationMessage',
              },
            ],
          },
        },
      };
      ctrl.missingRequirementsModal(res);
      expect(modalFactoryMock.ConfirmModal).toHaveBeenCalled();
    });

    it('should call validateClaimMessagesFactory.Message if res.data.Result.Errors', function () {
      var res = {
        data: {
          Result: {
            Errors: [
              {
                PropertyName: 'PropertyName',
                ValidationMessage: 'ValidationMessage',
                ValidationCode: 'ValidationCode',
              },
            ],
          },
        },
      };
      ctrl.missingRequirementsModal(res);
      expect(validateClaimMessagesFactory.Message).toHaveBeenCalledWith(
        'PropertyName',
        'ValidationCode'
      );
    });

    it('should call toastrFactory.error if no res.data.Result.Errors', function () {
      var res = { data: { Result: {} } };
      ctrl.missingRequirementsModal(res);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.changeAnswers ->', function () {
    it('should route to medical when submittalmethod is medical', function () {
      var claim = { ClaimId: 1, SubmittalMethod: 3 };
      unittestscope.changeAnswers(claim);
      expect(location.path).toHaveBeenCalledWith(
        '/BusinessCenter/Insurance/Claim/1/ChangeAnswers/Medical'
      );
    });
    it('should route to dental when submittalmethod is dental', function () {
      var claim = { ClaimId: 1, SubmittalMethod: 1 };
      unittestscope.changeAnswers(claim);
      expect(location.path).toHaveBeenCalledWith(
        '/BusinessCenter/Insurance/Claim/1/ChangeAnswers/Dental'
      );
    });
  });

  describe('ctrl.getMinMaxDates ->', function () {
    it('should set claim.startDatetoEndDate to empty string if claim.Type is 1', function () {
      var claim = {
        Type: 2,
        MinServiceDate: '2021-10-28 01:42:58.0451905',
        MaxServiceDate: '2021-10-28 01:42:58.0451905',
      };
      ctrl.getMinMaxDates(claim);
      expect(claim.startDatetoEndDate).toEqual('');
    });

    it('should set claim.startDatetoEndDate to formatted MaxServiceDate if claim.Type is 1 and MinServiceDate and MaxServiceDate are the same', function () {
      var claim = {
        Type: 1,
        MinServiceDate: '2021-10-28 01:42:58.0451905',
        MaxServiceDate: '2021-10-28 01:42:58.0451905',
      };
      ctrl.getMinMaxDates(claim);
      expect(claim.startDatetoEndDate).toEqual('10/28/2021');
    });

    it('should set claim.startDatetoEndDate to formatted max and min dates if claim.Type is 1 and MinServiceDate and MaxServiceDate are not the same', function () {
      var claim = {
        Type: 1,
        MinServiceDate: '2021-10-28 01:42:58.0451905',
        MaxServiceDate: '2021-10-29 01:42:58.0451905',
      };
      ctrl.getMinMaxDates(claim);
      expect(claim.startDatetoEndDate).toEqual('10/28/2021 -- \n10/29/2021');
    });
  });

  describe('ctrl.getPatientName ->', function () {
    var claim = {};

    it('should format name as LastName Suffix, FirstName MiddleName', function () {
      claim = {
        PatientLastName: 'Kennedy',
        PatientSuffix: 'Jr',
        PatientFirstName: 'John',
        PatientMiddleName: 'F',
      };
      ctrl.getPatientName(claim);
      expect(claim.patientName).toEqual('Kennedy Jr, John F');
    });

    it('should format name as LastName, FirstName MiddleName when Suffix is null', function () {
      claim = {
        PatientLastName: 'Kennedy',
        PatientSuffix: null,
        PatientFirstName: 'John',
        PatientMiddleName: 'F',
      };
      ctrl.getPatientName(claim);
      expect(claim.patientName).toEqual('Kennedy, John F');
    });
    it('should format name as LastName, FirstName when Suffix and MiddleName are null', function () {
      claim = {
        PatientLastName: 'Kennedy',
        PatientSuffix: null,
        PatientFirstName: 'John',
        PatientMiddleName: null,
      };
      ctrl.getPatientName(claim);
      expect(claim.patientName).toEqual('Kennedy, John');
    });
    it('should format name as LastName Suffix, FirstName when MiddleName is null', function () {
      claim = {
        PatientLastName: 'Kennedy',
        PatientSuffix: 'Jr',
        PatientFirstName: 'John',
        PatientMiddleName: null,
      };
      ctrl.getPatientName(claim);
      expect(claim.patientName).toEqual('Kennedy Jr, John');
    });
  });

  describe('scope.navToPatientProfile ->', function () {
    it('should launch patient location error modal when user is not authorized to patient location', function () {
      var personId = 'b9ac5c40-8079-4422-8d83-d3b36c67241b';
      unittestscope.navToPatientProfile(personId);
      expect(personFactoryMock.getById).toHaveBeenCalled();
      expect(
        patientValidationFactoryMock.PatientSearchValidation
      ).toHaveBeenCalled();
      expect(
        patientValidationFactoryMock.LaunchPatientLocationErrorModal
      ).toHaveBeenCalled();
    });
    it('should should call SaveMostRecentPerson when user is authorized to patient location', function () {
      var personId = 'b9ac5c40-8079-4422-8d83-d3b36c67241b';
      patientLocationAuthorization = {
        authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true },
      };
      unittestscope.navToPatientProfile(personId);
      expect(personFactoryMock.getById).toHaveBeenCalled();
      expect(
        patientValidationFactoryMock.PatientSearchValidation
      ).toHaveBeenCalled();
      expect(globalSearchFactoryMock.SaveMostRecentPerson).toHaveBeenCalledWith(
        personId
      );
    });
    it('should should call location.search with newTab when user is authorized to patient location', function () {
      var personId = 'b9ac5c40-8079-4422-8d83-d3b36c67241b';
      patientLocationAuthorization = {
        authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: true },
      };
      unittestscope.navToPatientProfile(personId);
      expect(location.search).toHaveBeenCalledWith('newTab', null);
    });
  });

  describe('updateClaimSubmissionMethod', () => {
    it('should pass the claim.DataTag as property on ClaimSubmittalMethodDto', () => {
      var claim = {
        ClaimId: '1234',
        DataTag: 'AAAAAABB',
        SubmittalMethod: 2,
        MassUpdateFailureMessage: '',
        Status: 1,
      };
      unittestscope.updateClaimSubmissionMethod(claim);
      expect(
        mockCommonServices.Insurance.Claim.changeSubmissionMethod
      ).toHaveBeenCalledWith(
        Object({ claimId: '1234' }),
        Object({ ClaimId: '1234', SubmittalMethod: 2, DataTag: 'AAAAAABB' }),
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });
    it('should disable submit button before calling changeSubmissionMethod', () => {
      var claim = { Status: 1 };
      unittestscope.submitButtonDisabled = false;
      mockCommonServices.Insurance.Claim.changeSubmissionMethod = function () {
        expect(unittestscope.submitButtonDisabled).toBe(true);
      };
      spyOn(
        mockCommonServices.Insurance.Claim,
        'changeSubmissionMethod'
      ).and.callThrough();
      unittestscope.updateClaimSubmissionMethod(claim);
      expect(
        mockCommonServices.Insurance.Claim.changeSubmissionMethod
      ).toHaveBeenCalled();
    });
    it('should re-enable submit button after call to changeSubmissionMethod succeeds', () => {
      var claim = { Status: 1 };
      var res = { Value: { Status: 1, DataTag: '' } };
      unittestscope.submitButtonDisabled = true;
      mockCommonServices.Insurance.Claim.changeSubmissionMethod = jasmine
        .createSpy()
        .and.returnValue(res)
        .and.callFake((param, param1, success, failure) => success(res));
      unittestscope.updateClaimSubmissionMethod(claim);
      expect(
        mockCommonServices.Insurance.Claim.changeSubmissionMethod
      ).toHaveBeenCalled();
      expect(unittestscope.submitButtonDisabled).toBe(false);
    });
    it('should re-enable submit button after call to changeSubmissionMethod fails', () => {
      var claim = { Status: 1 };
      unittestscope.submitButtonDisabled = true;
      mockCommonServices.Insurance.Claim.changeSubmissionMethod = jasmine
        .createSpy()
        .and.callFake((param, param1, success, failure) => failure());
      unittestscope.updateClaimSubmissionMethod(claim);
      expect(
        mockCommonServices.Insurance.Claim.changeSubmissionMethod
      ).toHaveBeenCalled();
      expect(unittestscope.submitButtonDisabled).toBe(false);
    });
  });
});

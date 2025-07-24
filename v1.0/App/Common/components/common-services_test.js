describe('common services ->', function () {
  var mockedResource;

  beforeEach(
    module('common.services', function ($provide) {
      mockedResource = jasmine.createSpy().and.returnValue('');
      $provide.value('$resource', mockedResource);
    })
  );

  describe('SoarConfig ->', function () {
    // unable to test because this is mocked in testHelper, no workaround found yet
  });

  describe('DiscountTypesService ->', function () {
    var discountTypesService, cacheFactory;
    var mockCache;

    beforeEach(
      module(function ($provide) {
        mockCache = {};

        cacheFactory = {
          GetCache: jasmine.createSpy().and.returnValue(mockCache),
        };
        $provide.value('PatCacheFactory', cacheFactory);
      })
    );

    beforeEach(inject(function ($injector) {
      discountTypesService = $injector.get('DiscountTypesService');
    }));

    it('should exist', function () {
      expect(discountTypesService).not.toBeNull();
    });

    it('should call $resource with correct parameters', function () {
      expect(mockedResource).toHaveBeenCalledWith(
        '_soarapi_/discounttypes/:Id',
        {},
        {
          get: { method: 'GET', cache: mockCache },
          save: { method: 'POST', cache: mockCache },
          update: { method: 'PUT', cache: mockCache },
          delete: { method: 'DELETE', cache: mockCache },
          patientsWithDiscount: {
            method: 'GET',
            url: '_soarapi_/discounttypes/:Id/patients',
          },
        }
      );
    });
  });

  describe('DocumentGroupsService ->', function () {
    var documentGroupsService, cacheFactory;
    var mockCache;

    beforeEach(
      module(function ($provide) {
        mockCache = {};

        cacheFactory = {
          GetCache: jasmine.createSpy().and.returnValue(mockCache),
        };
        $provide.value('PatCacheFactory', cacheFactory);
      })
    );

    beforeEach(inject(function ($injector) {
      documentGroupsService = $injector.get('DocumentGroupsService');
    }));

    it('should exist', function () {
      expect(documentGroupsService).toBeDefined();
    });

    it('should call cache factory with correct parameters', function () {
      expect(cacheFactory.GetCache).toHaveBeenCalledWith(
        'DocumentGroups',
        'aggressive',
        60000,
        60000
      );
    });

    it('should call $resource with correct parameters', function () {
      expect(mockedResource).toHaveBeenCalledWith(
        '_soarapi_/documentgroups/:Id',
        {},
        {
          get: { method: 'GET', cache: mockCache, params: { Id: '@Id' } },
          save: { method: 'POST', cache: mockCache, isArray: false },
          getAll: {
            method: 'GET',
            cache: mockCache,
            url: '_soarapi_/documentgroups',
          },
          update: { method: 'PUT', cache: mockCache, isArray: false },
          delete: { method: 'DELETE', cache: mockCache, params: { Id: '@Id' } },
        }
      );
    });
  });

  describe('DomainHeaderService ->', function () {
    var headerService, headerData;

    beforeEach(inject(function (DomainHeaderService) {
      headerData = {
        practiceId: '1',
        userId: '2',
      };
      headerService = DomainHeaderService;
    }));

    describe('headerData property ->', function () {
      it('should initially have properties set to empty strings', function () {
        expect(headerService.headerData.practiceId).toBe('');
        expect(headerService.headerData.userId).toBe('');
      });

      it('should store inputted values', function () {
        headerService.headerData.practiceId = headerData.practiceId;
        headerService.headerData.userId = headerData.userId;
        expect(headerService.headerData.practiceId).toBe(headerData.practiceId);
        expect(headerService.headerData.userId).toBe(headerData.userId);
      });
    });

    describe('addDomainHeaders function ->', function () {
      var config;

      beforeEach(function () {
        config = {
          headers: {},
        };
        headerService.headerData.practiceId = headerData.practiceId;
        headerService.headerData.userId = headerData.userId;
        headerService.addDomainHeaders(config);
      });

      it('should set header values', function () {
        expect(config.headers.PtcSoarPracticeId).toBe(headerData.practiceId);
        expect(config.headers.PtcSoarUserId).toBe(headerData.userId);
        expect(config.headers.PtcSoarUtcOffset).toEqual(
          moment().utcOffset() / 60
        );
      });
    });
  });

  describe('DomainLocatorService ->', function () {
    var locatorService, headerService;

    beforeEach(inject(function (
      DomainLocatorService,
      DomainHeaderService,
      SoarConfig
    ) {
      locatorService = DomainLocatorService;

      spyOn(SoarConfig, 'domainUrl').and.returnValue('testUrl');
      spyOn(DomainHeaderService, 'addDomainHeaders').and.returnValue('');
      headerService = DomainHeaderService;
    }));

    it('should exist', function () {
      expect(locatorService).not.toBeNull();
    });

    describe('request function ->', function () {
      var config;
      beforeEach(function () {
        config = {};
      });

      describe('if config.url contains "_soarapi_" ->', function () {
        beforeEach(function () {
          config.url = '_soarapi_/test';
          locatorService.request(config);
        });

        it('should modify url', function () {
          expect(config.url).toBe('testUrl/test');
        });

        it('should call DomainHeaderService.addDomainHeaders with config', function () {
          expect(headerService.addDomainHeaders).toHaveBeenCalledWith(config);
        });
      });

      describe('if config.url does not contain "_soarapi_" ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          locatorService.request(config);
        });

        it('should not modify url', function () {
          expect(config.url).toBe('testUrl2/test');
        });

        it('should not call DomainHeaderService.addDomainHeaders', function () {
          expect(headerService.addDomainHeaders).not.toHaveBeenCalled();
        });
      });

      describe('if config.noPatHeaders is true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };
          config.noPatHeaders = true;

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({ Accept: 'accept' });
        });
      });

      describe('if config.noPatHeaders is not true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          });
        });
      });
    });
  });

  describe('ClinicalLocatorService ->', function () {
    var locatorService, headerService;

    beforeEach(inject(function (
      ClinicalLocatorService,
      DomainHeaderService,
      SoarConfig
    ) {
      locatorService = ClinicalLocatorService;

      spyOn(SoarConfig, 'clinicalApiUrl').and.returnValue('testUrl');
      spyOn(DomainHeaderService, 'addDomainHeaders').and.returnValue('');
      headerService = DomainHeaderService;
    }));

    it('should exist', function () {
      expect(locatorService).not.toBeNull();
    });

    describe('request function ->', function () {
      var config;
      beforeEach(function () {
        config = {};
      });

      describe('if config.url contains "_clinicalapi_" ->', function () {
        beforeEach(function () {
          config.url = '_clinicalapi_/test';
          locatorService.request(config);
        });

        it('should modify url', function () {
          expect(config.url).toBe('testUrl/test');
        });

        it('should call DomainHeaderService.addDomainHeaders with config', function () {
          expect(headerService.addDomainHeaders).toHaveBeenCalledWith(config);
        });
      });

      describe('if config.url does not contain "_clinicalapi_" ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          locatorService.request(config);
        });

        it('should not modify url', function () {
          expect(config.url).toBe('testUrl2/test');
        });

        it('should not call DomainHeaderService.addDomainHeaders', function () {
          expect(headerService.addDomainHeaders).not.toHaveBeenCalled();
        });
      });

      describe('if config.noPatHeaders is true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };
          config.noPatHeaders = true;

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({ Accept: 'accept' });
        });
      });

      describe('if config.noPatHeaders is not true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          });
        });
      });
    });
  });

  describe('SAPIScheduleLocatorService ->', function () {
    var locatorService, headerService;

    beforeEach(inject(function (
      SAPIScheduleLocatorService,
      DomainHeaderService,
      SoarConfig
    ) {
      locatorService = SAPIScheduleLocatorService;

      spyOn(SoarConfig, 'sapiSchedulingApiUrl').and.returnValue('testUrl');
      spyOn(DomainHeaderService, 'addDomainHeaders').and.returnValue('');
      headerService = DomainHeaderService;
    }));

    it('should exist', function () {
      expect(locatorService).not.toBeNull();
    });

    describe('request function ->', function () {
      var config;
      beforeEach(function () {
        config = {};
      });

      describe('if config.url contains "_sapischeduleapi_" ->', function () {
        beforeEach(function () {
          config.url = '_sapischeduleapi_/test';
          locatorService.request(config);
        });

        it('should modify url', function () {
          expect(config.url).toBe('testUrl/test');
        });

        it('should call DomainHeaderService.addDomainHeaders with config', function () {
          expect(headerService.addDomainHeaders).toHaveBeenCalledWith(config);
        });
      });

      describe('if config.url does not contain "_sapischeduleapi_" ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          locatorService.request(config);
        });

        it('should not modify url', function () {
          expect(config.url).toBe('testUrl2/test');
        });

        it('should not call DomainHeaderService.addDomainHeaders', function () {
          expect(headerService.addDomainHeaders).not.toHaveBeenCalled();
        });
      });

      describe('if config.noPatHeaders is true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };
          config.noPatHeaders = true;

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({ Accept: 'accept' });
        });
      });

      describe('if config.noPatHeaders is not true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          });
        });
      });
    });
  });

  describe('InsuranceSapiLocatorService ->', function () {
    var locatorService, headerService;

    beforeEach(inject(function (
      InsuranceSapiLocatorService,
      DomainHeaderService,
      SoarConfig
    ) {
      locatorService = InsuranceSapiLocatorService;

      spyOn(SoarConfig, 'insuranceSapiUrl').and.returnValue('testUrl');
      spyOn(DomainHeaderService, 'addDomainHeaders').and.returnValue('');
      headerService = DomainHeaderService;
    }));

    it('should exist', function () {
      expect(locatorService).not.toBeNull();
    });

    describe('request function ->', function () {
      var config;
      beforeEach(function () {
        config = {};
      });

      describe('if config.url contains "_insurancesapi_" ->', function () {
        beforeEach(function () {
          config.url = '_insurancesapi_/test';
          locatorService.request(config);
        });

        it('should modify url', function () {
          expect(config.url).toBe('testUrl/test');
        });

        it('should call DomainHeaderService.addDomainHeaders with config', function () {
          expect(headerService.addDomainHeaders).toHaveBeenCalledWith(config);
        });
      });

      describe('if config.url does not contain "_insurancesapi_" ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          locatorService.request(config);
        });

        it('should not modify url', function () {
          expect(config.url).toBe('testUrl2/test');
        });

        it('should not call DomainHeaderService.addDomainHeaders', function () {
          expect(headerService.addDomainHeaders).not.toHaveBeenCalled();
        });
      });

      describe('if config.noPatHeaders is true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };
          config.noPatHeaders = true;

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({ Accept: 'accept' });
        });
      });

      describe('if config.noPatHeaders is not true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          });
        });
      });
    });
  });

  describe('InsuranceApiLocatorService ->', function () {
    var locatorService, headerService;

    beforeEach(inject(function (
      InsuranceApiLocatorService,
      DomainHeaderService,
      IdmConfig
    ) {
      locatorService = InsuranceApiLocatorService;

      spyOn(IdmConfig, 'insuranceApiUrl').and.returnValue('testUrl');
      spyOn(DomainHeaderService, 'addDomainHeaders').and.returnValue('');
      headerService = DomainHeaderService;
    }));

    it('should exist', function () {
      expect(locatorService).not.toBeNull();
    });

    describe('request function ->', function () {
      var config;
      beforeEach(function () {
        config = {};
      });

      describe('if config.url contains "_insuranceapiurl_" ->', function () {
        beforeEach(function () {
          config.url = '_insuranceapiurl_/test';
          locatorService.request(config);
        });

        it('should modify url', function () {
          expect(config.url).toBe('testUrl/test');
        });

        it('should call DomainHeaderService.addDomainHeaders with config', function () {
          expect(headerService.addDomainHeaders).toHaveBeenCalledWith(config);
        });
      });

      describe('if config.url does not contain "_insuranceapiurl_" ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          locatorService.request(config);
        });

        it('should not modify url', function () {
          expect(config.url).toBe('testUrl2/test');
        });

        it('should not call DomainHeaderService.addDomainHeaders', function () {
          expect(headerService.addDomainHeaders).not.toHaveBeenCalled();
        });
      });

      describe('if config.noPatHeaders is true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };
          config.noPatHeaders = true;

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({ Accept: 'accept' });
        });
      });

      describe('if config.noPatHeaders is not true ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          config.headers = {
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          };

          locatorService.request(config);
        });

        it('should remove the Access-Control-Expose-Headers', function () {
          expect(config.headers).toEqual({
            Accept: 'accept',
            'Access-Control-Expose-Headers': 'extra',
          });
        });
      });
    });
  });

  describe('EnterpriseLocatorService ->', function () {
    var locatorService;

    beforeEach(inject(function (EnterpriseLocatorService, SoarConfig) {
      locatorService = EnterpriseLocatorService;
      SoarConfig.enterpriseUrl = '';
      spyOn(SoarConfig, 'enterpriseUrl').and.returnValue('testUrl');
    }));

    it('should exist', function () {
      expect(locatorService).not.toBeNull();
    });

    describe('request function ->', function () {
      var config = {};

      describe('if config.url contains "_enterpriseurl_" ->', function () {
        beforeEach(function () {
          config.url = '_enterpriseurl_/test';
          locatorService.request(config);
        });

        it('should modify url', function () {
          expect(config.url).toBe('testUrl/test');
        });
      });

      describe('if config.url does not contain "_enterpriseurl_" ->', function () {
        beforeEach(function () {
          config.url = 'testUrl2/test';
          locatorService.request(config);
        });

        it('should not modify url', function () {
          expect(config.url).toBe('testUrl2/test');
        });
      });
    });
  });

  describe('GroupTypeService ->', function () {
    var groupTypeService, cacheFactory;
    var mockCache;

    beforeEach(
      module(function ($provide) {
        mockCache = {};

        cacheFactory = {
          GetCache: jasmine.createSpy().and.returnValue(mockCache),
        };
        $provide.value('PatCacheFactory', cacheFactory);
      })
    );

    beforeEach(inject(function ($injector) {
      groupTypeService = $injector.get('GroupTypeService');
    }));

    it('should exist', function () {
      expect(groupTypeService).not.toBeNull();
    });

    it('should call $resource with correct parameters', function () {
      expect(mockedResource).toHaveBeenCalledWith(
        '_soarapi_/patientgroups/:Id',
        {},
        {
          get: {
            method: 'GET',
            url: '_soarapi_/patientgroups',
            cache: mockCache,
          },
          save: { method: 'POST', cache: mockCache },
          update: { method: 'PUT', cache: mockCache },
          delete: { method: 'DELETE', cache: mockCache },
          groupTypeWithPatients: {
            method: 'GET',
            url: '_soarapi_/patientgroups/:Id/patients',
          },
        }
      );
    });
  });

  describe('MasterAlertService ->', function () {
    var service, cacheFactory;
    var mockCache;

    beforeEach(
      module(function ($provide) {
        mockCache = {};

        cacheFactory = {
          GetCache: jasmine.createSpy().and.returnValue(mockCache),
        };
        $provide.value('PatCacheFactory', cacheFactory);
      })
    );

    beforeEach(inject(function ($injector) {
      service = $injector.get('MasterAlertService');
    }));

    it('should exist', function () {
      expect(service).not.toBeNull();
    });

    it('should call $resource with correct parameters', function () {
      expect(mockedResource).toHaveBeenCalledWith(
        '_soarapi_/patientalerts/:Id',
        {},
        {
          get: { method: 'GET', cache: mockCache },
          save: { method: 'POST', cache: mockCache },
          update: { method: 'PUT', cache: mockCache },
          delete: { method: 'DELETE', cache: mockCache },
          alertsWithPatients: {
            method: 'GET',
            url: '_soarapi_/patientalerts/:Id/patients',
          },
        }
      );
    });
  });

  describe('ReferralSourcesService ->', function () {
    var service, cacheFactory;
    var mockCache;

    beforeEach(
      module(function ($provide) {
        mockCache = {};

        cacheFactory = {
          GetCache: jasmine.createSpy().and.returnValue(mockCache),
        };
        $provide.value('PatCacheFactory', cacheFactory);
      })
    );

    beforeEach(inject(function ($injector) {
      service = $injector.get('ReferralSourcesService');
    }));

    it('should exist', function () {
      expect(service).not.toBeNull();
    });

    it('should call $resource with correct parameters', function () {
      expect(mockedResource).toHaveBeenCalledWith(
        '_soarapi_/referralsources/:Id',
        {},
        {
          get: { method: 'GET', cache: mockCache },
          save: { method: 'POST', cache: mockCache },
          update: { method: 'PUT', cache: mockCache },
          delete: { method: 'DELETE', cache: mockCache },
          patientsWithSource: {
            method: 'GET',
            url: '_soarapi_/referralsources/:Id/patients',
          },
        }
      );
    });
  });

  describe('SearchService ->', function () {
    var service, $rootScope;
    beforeEach(inject(function ($injector) {
      service = $injector.get('SearchService');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should exist', function () {
      expect(service).not.toBeNull();
    });

    it('should initialize searchTerm to empty string', function () {
      expect(service.searchTerm).toBe('');
    });

    describe('observeSearchTerm function ->', function () {
      it('should return a promise', function () {
        var result = service.observeSearchTerm();
        expect(result.then).toBeDefined();
      });
    });

    describe('setTerm function ->', function () {
      it('should set searchTerm to input parameter', function () {
        expect(service.searchTerm).toBe('');
        service.setTerm('test');
        expect(service.searchTerm).toBe('test');
      });

      it('should notify promise with input value', function (done) {
        service.observeSearchTerm().then(null, null, function (value) {
          expect(value).toBe('test');
          done();
        });
        service.setTerm('test');
        $rootScope.$apply();
      });
    });
  });

  describe('StaticDataService ->', function () {
    var staticDataService;
    beforeEach(inject(function ($injector) {
      staticDataService = $injector.get('StaticDataService');
    }));

    it('should exist', function () {
      expect(staticDataService).not.toBeNull();
    });

    it('should call $resource with correct parameters', function () {
      expect(mockedResource).toHaveBeenCalledWith(
        '_soarapi_/applicationsettings/:category',
        {},
        {
          AffectedAreas: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/affectedareas',
          },
          AlertIcons: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/alerticons',
          },
          Departments: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/departments',
          },
          PhoneTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/PhoneTypes',
          },
          ProviderTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/providertypes',
          },
          ReferralTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/referraltypes',
          },
          States: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/states',
          },
          TaxonomyCodes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/taxonomycodes',
          },
          TaxableServices: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/taxableservicetypes',
          },
          PlannedServiceStatuses: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/plannedservicestatus',
          },
          ServiceTransactionStatuses: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/servicetransactionstatus',
          },
          NoteTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/notetypes',
          },
          StatusTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/statustypes',
          },
          CurrencyTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/currencytypes',
          },
          //CdtCodes: { method: 'GET', url: '_soarapi_/practicesettings/cdtcodes' },
          TransactionTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/transactiontypes',
          },
          TeethDefinitions: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/teethdefinitions',
          },
          CdtCodeGroups: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/cdtcodegroups',
          },
          ConditionStatus: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/conditionStatus',
          },
        }
      );
    });
  });

  describe('DiscardService ->', function () {
    var discardService;
    beforeEach(inject(function ($injector) {
      discardService = $injector.get('DiscardService');
    }));

    it('should exist', function () {
      expect(discardService).not.toBeNull();
    });

    it('should create list of controllers', function () {
      expect(discardService.controllers).not.toBeNull();
    });

    describe('getRelevantController ->', function () {
      it('should return controller name if it is in the list', function () {
        expect(
          discardService.getRelevantController('LocationCrudController')
        ).toBe('LocationCrudController');
      });

      it('should return undefined if a controller is passed in that is not in the list', function () {
        expect(
          discardService.getRelevantController('SomethingController')
        ).toBeUndefined();
      });
    });

    describe('hasChanges ->', function () {
      describe('PatientCrudController ->', function () {
        var createNewScope = function () {
          return {
            patient: {},
            backupPatient: {},
            dataHasChanged: false,
            updateDataHasChangedFlag: function () {
              this.dataHasChanged = !angular.equals(
                this.patient,
                this.backupPatient
              );
            },
          };
        };

        it('should return false if there are no changes', function () {
          expect(
            discardService.hasChanges(
              'PatientCrudController',
              createNewScope(),
              false
            )
          ).toBe(false);
        });

        it('should return false if not resetting', function () {
          var scope = createNewScope();
          scope.patient.something = 'something';
          expect(
            discardService.hasChanges('PatientCrudController', scope, false)
          ).toBe(false);
        });

        it('should return false if resetting and no changes', function () {
          var scope = createNewScope();
          expect(
            discardService.hasChanges('PatientCrudController', scope, true)
          ).toBe(false);
        });

        it('should return true if resetting and changes', function () {
          var scope = createNewScope();
          scope.patient.something = 'something';
          expect(
            discardService.hasChanges('PatientCrudController', scope, true)
          ).toBe(true);
        });
      });

      describe('LocationCrudController ->', function () {
        var createNewScope = function () {
          return {
            location: {},
            originalLocation: {},
            dataHasChanged: false,
            updateDataHasChangedFlag: function (resetting) {
              if (resetting === true) {
                this.location = this.originalLocation;
              }
              this.dataHasChanged = !angular.equals(
                this.location,
                this.originalLocation
              );
            },
          };
        };

        it('should return false if there are no changes', function () {
          expect(
            discardService.hasChanges(
              'LocationCrudController',
              createNewScope(),
              false
            )
          ).toBe(false);
        });

        it('should return true if there are changes', function () {
          var scope = createNewScope();
          scope.location.something = 'something';
          expect(
            discardService.hasChanges('LocationCrudController', scope, false)
          ).toBe(true);
        });

        it('should return false if resetting', function () {
          var scope = createNewScope();
          expect(
            discardService.hasChanges('LocationCrudController', scope, true)
          ).toBe(false);
        });
      });

      describe('UserCrudController ->', function () {
        var createNewScope = function () {
          return {
            user: {},
            originalUser: {},
          };
        };

        it('should return false if there are no changes', function () {
          expect(
            discardService.hasChanges(
              'UserCrudController',
              createNewScope(),
              false
            )
          ).toBe(false);
        });

        it('should return true if there are changes', function () {
          var scope = createNewScope();
          scope.user.something = 'something';
          expect(
            discardService.hasChanges('UserCrudController', scope, false)
          ).toBe(true);
        });

        it('should return false if resetting', function () {
          var scope = createNewScope();
          scope.user.something = 'something';
          expect(
            discardService.hasChanges('UserCrudController', scope, true)
          ).toBe(false);
        });
      });

      describe('CustomFormsController ->', function () {
        var createNewScope = function () {
          return {
            dataHasChanged: true,
          };
        };

        it('should return false if there are no changes', function () {
          expect(
            discardService.hasChanges(
              'CustomFormsController',
              createNewScope(),
              false
            )
          ).toBe(false);
        });

        it('should return true if there are changes', function () {
          var scope = createNewScope();
          scope.dataHasChanged = false;
          expect(
            discardService.hasChanges('CustomFormsController', scope, false)
          ).toBe(true);
        });

        it('should return false if resetting', function () {
          var scope = createNewScope();
          scope.dataHasChanged = false;
          expect(
            discardService.hasChanges('CustomFormsController', scope, true)
          ).toBe(false);
        });
      });

      describe('PatientDashboardController ->', function () {
        var createNewScope = function () {
          return {
            personalInfo: {},
            contactInfo: {
              Phones: [],
            },
            originalPersonalInfo: {},
            originalContactInfo: {
              Phones: [],
            },
          };
        };

        it('should return false if there are no changes', function () {
          expect(
            discardService.hasChanges(
              'PatientDashboardController',
              createNewScope(),
              false
            )
          ).toBe(false);
        });

        it('should return true if there are changes', function () {
          var scope = createNewScope();
          scope.dataHasChanged = 'something';
          expect(
            discardService.hasChanges(
              'PatientDashboardController',
              scope,
              false
            )
          ).toBe(true);
        });

        it('should return false if resetting', function () {
          var scope = createNewScope();
          scope.personalInfo.something = 'something';
          expect(
            discardService.hasChanges('PatientDashboardController', scope, true)
          ).toBe(false);
        });

        it('should return false if Updated is true', function () {
          var scope = createNewScope();
          scope.personalInfo.Updated = true;
          scope.contactInfo.Updated = true;
          expect(
            discardService.hasChanges(
              'PatientDashboardController',
              scope,
              false
            )
          ).toBe(false);
        });
      });
    });
  });

  describe('ObjectService ->', function () {
    var objectService;
    var obj;

    beforeEach(inject(function ($injector) {
      objectService = $injector.get('ObjectService');
      obj = {
        property1: null,
        property2: undefined,
        property3: '',
        property4: 'cheese',
        property5: '          ',
        property6: '    g      ',
        property7: 0,
      };
    }));

    it('should set empty properties to empty string', function () {
      objectService.convertEmptyProperties(obj, '');
      expect(obj.property1).toBe('');
      expect(obj.property2).toBe('');
      expect(obj.property3).toBe('');
      expect(obj.property4).toBe('cheese');
      expect(obj.property5).toBe('');
      expect(obj.property6).toBe('    g      ');
      expect(obj.property7).toBe(0);
    });

    it('should set empty properties to null', function () {
      objectService.convertEmptyProperties(obj, null);
      expect(obj.property1).toBe(null);
      expect(obj.property2).toBe(null);
      expect(obj.property3).toBe(null);
      expect(obj.property4).toBe('cheese');
      expect(obj.property5).toBe(null);
      expect(obj.property6).toBe('    g      ');
      expect(obj.property7).toBe(0);
    });

    it('should set empty properties to undefined', function () {
      objectService.convertEmptyProperties(obj, undefined);
      expect(obj.property1).toBe(undefined);
      expect(obj.property2).toBe(undefined);
      expect(obj.property3).toBe(undefined);
      expect(obj.property4).toBe('cheese');
      expect(obj.property5).toBe(undefined);
      expect(obj.property6).toBe('    g      ');
      expect(obj.property7).toBe(0);
    });

    it('should return true if objects are equal', function () {
      expect(objectService.objectAreEqual(obj, obj)).toBe(true);
    });

    it('should return false if objects are not equal', function () {
      var obj2 = angular.copy(obj);
      obj2.property4 = 'balogna';
      expect(objectService.objectAreEqual(obj, obj2)).toBe(false);
    });
  });
});

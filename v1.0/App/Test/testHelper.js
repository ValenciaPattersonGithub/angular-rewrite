/* eslint-disable no-global-assign */

var event;
// mock the localStorage
beforeEach(function () {
  var store = {};
  localStorage.getItem = jasmine.createSpy().and.callFake(function (key) {
    return store[key];
  });
  localStorage.setItem = jasmine
    .createSpy()
    .and.callFake(function (key, value) {
      store[key] = value;
      return store[key];
    });
  localStorage.clear = jasmine.createSpy().and.callFake(function () {
    store = {};
  });

  var sessionStore = {};
  sessionStorage.getItem = jasmine.createSpy().and.callFake(function (key) {
    return sessionStore[key] ? sessionStore[key] : null;
  });
  sessionStorage.setItem = jasmine
    .createSpy()
    .and.callFake(function (key, value) {
      sessionStore[key] = value;
      return sessionStore[key];
    });
  sessionStorage.clear = jasmine.createSpy().and.callFake(function () {
    sessionStore = {};
  });

  // mock prevent default for all tests
  event = { preventDefault: function () {} };
  spyOn(event, 'preventDefault').and.callFake(function () {});
});

beforeEach(function () {
  angular.module('PatWebCore', []);
  angular.module('PatWebCoreV1', []);
  angular.module('PatCoreUtility', []);
});

var _soarConfig_, _userServices_, _idmConfig_;
beforeEach(
  module('common.services', function ($provide) {
    _soarConfig_ = {
      $get: jasmine.createSpy().and.returnValue(''),
      azureApplicationId: jasmine.createSpy().and.returnValue(''),
      domainUrl: 'http://localhost:6666',
      clinicalApiUrl: 'http://localhost:6666',
      sapiSchedulingApiUrl: 'http://localhost:6666',
      insuranceSapiUrl: 'http://localhost:6666',
      scanningKey: 'scanningKey',
    };
    $provide.value('SoarConfig', _soarConfig_);

    _idmConfig_ = {
      insuranceApiUrl: 'http://localhost:7777',
    };
    $provide.value('IdmConfig', _idmConfig_);

    $provide.value('DOMAIN_API_URL', _soarConfig_.domainUrl);
    
    _userServices_ = {};
    $provide.value('UserServices', _userServices_);
  })
);

// mock patSecurityService with IsAuthorizedByAbbreviation set to true
var _authPatSecurityService_, _$location_, _platformSessionService_;
beforeEach(
  module(function ($provide, $injector) {
    _authPatSecurityService_ = {
      login: jasmine.createSpy(),
      logout: jasmine.createSpy(),
      getUser: jasmine.createSpy(),
      isAmfaAuthorizedByName: jasmine.createSpy().and.returnValue(true),
      isAmfaAuthorizedByNameAtLocation: jasmine
        .createSpy()
        .and.returnValue(true),
      isAmfaAuthorizedById: jasmine.createSpy().and.returnValue(true),
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
      IsAuthorizedByAbbreviationAtPractice: jasmine
        .createSpy()
        .and.returnValue(true),
      generateMessage: jasmine.createSpy(),
    };
    $provide.value('patSecurityService', _authPatSecurityService_);

    _$location_ = {
      path: jasmine.createSpy(),
      url: jasmine.createSpy(),
      hash: jasmine.createSpy(),
    };
    $provide.value('$location', _$location_);

    var locationProvider = $injector.get('$locationProvider');
    locationProvider.hashPrefix = function () {};

    _platformSessionService_ = {
      getLocalStorage: jasmine
        .createSpy()
        .and.returnValue(localStorage.getItem),
    };
    $provide.value('platformSessionService', _platformSessionService_);
  })
);
// mock practiceService
var _practiceService_;
beforeEach(
  module(function ($provide) {
    _practiceService_ = {
      getPractices: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
      getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 1 }),
    };
    $provide.value('practiceService', _practiceService_);
  })
);
// mock locationService
var _locationService_;
beforeEach(
  module(function ($provide) {
    _locationService_ = {
      getAllLocations: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
      selectLocation: jasmine.createSpy(),
      getCurrentLocation: jasmine.createSpy().and.returnValue({ id: 1 }),
    };
    $provide.value('locationService', _locationService_);
  })
);
// mock tabLauncher
var _tabLauncher_;
beforeEach(
  module(function ($provide) {
    _tabLauncher_ = {
      launchNewTab: jasmine.createSpy(),
    };
    $provide.value('tabLauncher', _tabLauncher_);
  })
);
// mock tabLauncher
var _referenceDataService_;
var _configSettingsService_;
beforeEach(
  module('Soar.Common', function ($provide) {
    _referenceDataService_ = {
      registerForLocationSpecificDataChanged: jasmine.createSpy(),
      unregisterForLocationSpecificDataChanged: jasmine.createSpy(),
      get: jasmine.createSpy(),
      entityNames: {},
    };
      $provide.value('referenceDataService', _referenceDataService_);

      _configSettingsService_ = {
          loadSettings: jasmine.createSpy(),
      };
      $provide.value('configSettingsService', _configSettingsService_);
  })
);
// mock GlobalSearchServices
var _GlobalSearchServices_;
beforeEach(
  module('common.services', function ($provide) {
    _GlobalSearchServices_ = {
      MostRecent: {
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            finally: jasmine.createSpy(),
          },
        }),
      },
    };
    $provide.value('GlobalSearchServices', _GlobalSearchServices_);
  })
);
// toastr
var _toastr_,
  _localize_,
  _GlobalSearchFactory_,
  cacheFactory,
  _modalFactory_,
  _localizeFactory_,
  _modalFactoryProvider_;
beforeEach(
  module('common.factories', function ($provide, $injector) {
    _toastr_ = {};
    _toastr_.error = jasmine.createSpy();
    _toastr_.success = jasmine.createSpy();
    $provide.value('toastrFactory', _toastr_);
    _localize_ = {};
    _localize_.language = '';
    _localize_.getLocalizedString = jasmine
      .createSpy()
      .and.callFake(function (val) {
        return val;
      });
    _localize_.setLanguage = jasmine.createSpy();
    _localize_.setUrl = jasmine.createSpy();
    _localize_.buildUrl = jasmine.createSpy();
    _localize_.initLocalizedResources = jasmine.createSpy();
    _localizeFactory_ = $injector.get('localizeProvider');
    $provide.value('localize', _localize_);
    _GlobalSearchFactory_ = {
      LoadRecentPersons: jasmine.createSpy(),
      ClearRecentPersons: jasmine.createSpy(),
    };
    $provide.value('GlobalSearchFactory', _GlobalSearchFactory_);

    cacheFactory = {
      GetCache: jasmine.createSpy().and.returnValue({}),
      ClearAll: jasmine.createSpy().and.returnValue({}),
      ClearCache: jasmine.createSpy().and.returnValue({}),
    };
    $provide.value('PatCacheFactory', cacheFactory);

    _modalFactoryProvider_ = $injector.get('ModalFactoryProvider');
    _modalFactory_ = {};
    $provide.value('ModalFactory', _modalFactory_);
  })
);

var Dynamsoft, EnumDWT_ImageType;
beforeEach(function () {
  Dynamsoft = {
    WebTwainEnv: {},
  };

  EnumDWT_ImageType = {
    IT_PDF: 'it_pdf',
  };
});

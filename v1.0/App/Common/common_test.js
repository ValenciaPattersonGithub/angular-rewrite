describe('common module config ->', function () {
  var httpProvider, $rootScope;

  beforeEach(
    module('Soar.Common', function ($httpProvider) {
      httpProvider = $httpProvider;
    })
  );

  beforeEach(inject(function (_$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: '1',
      },
    };
  }));

  it('should have the httpBearerTokenInterceptor as an interceptor', inject(function () {
    expect(httpProvider.interceptors).toContain('ApiCallDelayService');
    expect(httpProvider.interceptors).toContain('DomainLocatorService');
    expect(httpProvider.interceptors).toContain('EnterpriseLocatorService');
    expect(httpProvider.interceptors).toContain('ApiCallHandlerService');
    expect(httpProvider.interceptors).toContain('InsuranceApiLocatorService');
  }));
});

describe('routeChangeStart ->', function () {
  var _domainHeaderService_, _navigationData_, _authService_;

  var mockHeaderData = {
    practiceId: '100',
    userId: '63ee50c9-b373-4998-8db3-08097a34621d',
  };

  //#region mocks
  beforeEach(module('common.factories'));
  beforeEach(module('common.services'));
  beforeEach(
    module('Soar.Common', function ($provide) {
      _domainHeaderService_ = {
        headerData: jasmine
          .createSpy()
          .and.returnValue({ Value: mockHeaderData }),
      };

      $provide.value('DomainHeaderService', _domainHeaderService_);

      $provide.value('patSecurityService', _authPatSecurityService_);

      _authService_ = {
        login: jasmine.createSpy().and.returnValue(''),
        logout: jasmine.createSpy().and.returnValue(''),
        fillAuthData: jasmine.createSpy().and.returnValue(''),
        authData: jasmine.createSpy().and.returnValue(''),
      };
      $provide.value('AuthService', _authService_);

      _navigationData_ = {
        secondaryNavHeaderText: '',
        secondaryNavMenuItems: '',
      };
      $provide.value('NavigationData', _navigationData_);
    })
  );

  beforeEach(inject(function ($rootScope) {
    $rootScope.$apply();
  }));

  it('should have injected services and factories ', function () {
    expect(_domainHeaderService_).not.toBeNull();
    expect(_authService_).not.toBeNull();
    expect(_navigationData_).not.toBeNull();
    expect(_authPatSecurityService_).not.toBeNull();
  });
});

describe('errorLogService ->', function () {
  var toastrFactory;

  beforeEach(
    module(function ($provide) {
      toastrFactory = {
        error: jasmine.createSpy(),
        success: jasmine.createSpy(),
      };
      $provide.value('toastrFactory', toastrFactory);

      $provide.decorator('$exceptionHandler', function ($delegate) {
        return function log($exception) {
          toastrFactory.error($exception);
        };
      });
    })
  );

  it('should call $delegate', function () {
    inject(function ($timeout, $exceptionHandler) {
      expect($exceptionHandler).not.toBeNull();
      $timeout(function () {
        throw 'possibly unhandled rejection';
      });
      $timeout.flush();
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'possibly unhandled rejection'
      );
    });
  });
});

// top level test suite
describe('NavigationCtrl ->', function () {
  var scope,
    ctrl,
    location,
    compile,
    localize,
    toastrFactory,
    timeout,
    routeParams;
  var _domainHeaderService_,
    _navigationData_,
    _locationService_,
    _locationServices_,
    _sessionStorage_;

  var mockHeaderData = {
    practiceId: '100',
    userId: '63ee50c9-b373-4998-8db3-08097a34621d',
  };

  var mockLoginData = {
    userName: 'UserOne',
    password: 'Password',
  };

  ////#region mocks
  beforeEach(module('common.factories'));
  beforeEach(module('common.services'));
  beforeEach(
    module('Soar.Common', function ($provide) {
      //    toastrFactory = {};
      //    toastrFactory.error = jasmine.createSpy();
      //    toastrFactory.success = jasmine.createSpy();
      //    $provide.value('toastrFactory', toastrFactory);

      _domainHeaderService_ = {
        headerData: jasmine
          .createSpy()
          .and.returnValue({ Value: mockHeaderData }),
      };
      $provide.value('DomainHeaderService', _domainHeaderService_);

      _locationService_ = {
        getAllLocations: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('locationService', _locationService_);

      _locationServices_ = {
        getLocationSRHEnrollmentStatus: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('LocationServices', _locationServices_);
      _navigationData_ = {
        secondaryNavHeaderText: '',
        secondaryNavMenuItems: '',
      };
      $provide.value('NavigationData', _navigationData_);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $injector,
    $controller,
    $location,
    $routeParams,
    $compile,
    $timeout,
    $templateCache
  ) {
    location = $location;
    location.$$path = '/Path/';
    scope = $rootScope.$new();
    scope.selected = 'Selected';
    routeParams = $routeParams;
    timeout = $timeout;
    $rootScope.patAuthContext = {
      userInfo: {
        userid: 1,
      },
    };
    var userLocation = '{"Id": "101"}';
    sessionStorage.setItem('userLocation', userLocation);

    ctrl = $controller('NavigationCtrl', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
    });
    compile = $compile;
    localize = $injector.get('localize');

    scope.editMode = true;
    $rootScope.$apply();
  }));

  //var loadHtml = function () {
  //    element = angular.element('<div ng-form="patientAlertsFrm">' +
  //        '</div>)');

  //    // use compile to render the html
  //    compile(element)(scope);
  //    scope = element.isolateScope() || element.scope();
  //    scope.$digest();
  //};

  describe('when user is authorized - >', function () {
    // test specs below
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services and factories ', function () {
      expect(_domainHeaderService_).not.toBeNull();
      expect(_navigationData_).not.toBeNull();
      expect(_authPatSecurityService_).not.toBeNull();
    });

    it('should set initial properties', function () {
      expect(scope.navItems.length).toBe(5);
      expect(scope.selected).toBe('Selected');
      expect(scope.navData).toEqual(_navigationData_);
      expect(scope.loginData).toEqual({
        userName: '',
        password: '',
      });
      //expect(scope.userLocation).toEqual(0);
      expect(scope.locations).toEqual([]);
      expect(scope.userPractice).toEqual({});
    });

    describe('initNavSelect function -> ', function () {
      it('should set select property to patient when $location contains /Patient/', function () {
        location.$$path = '/Patient/';
        scope.initNavSelect();

        expect(scope.selected).toEqual('patient');
      });
    });

    describe('$watch selected function -> ', function () {
      it('should set navClicked to true when selected is changed', function () {
        scope.selected = 'patient';
        scope.$apply();

        expect(scope.navClicked).toBe(true);
      });

      it('should set selected to old value when selected is null', function () {
        // uses initial property as old value
        var value = scope.selected;
        scope.selected = null;
        scope.$apply();

        expect(scope.selected).toBe(value);
      });
    });

    describe('login function ->', function () {
      it('should call authService login', function () {
        scope.loginData = {
          userName: 'UserOne',
          password: 'Password',
        };
        scope.login();
        expect(_authPatSecurityService_.login).toHaveBeenCalledWith({
          userName: 'UserOne',
          password: 'Password',
        });
      });
    });

    describe('logout function ->', function () {
      it('should call authService logout', function () {
        scope.logout();
        expect(_authPatSecurityService_.logout).toHaveBeenCalled();
      });

      it('should set location', function () {
        scope.logout();
        expect(location.path).toHaveBeenCalledWith('/');
      });
    });

    describe('getLocations function ->', function () {
      it('should call locationService.getAllLocations', function () {
        scope.getLocations();
        expect(_locationService_.getAllLocations).toHaveBeenCalled();
      });
    });
    describe('getLocationSRHEnrollmentStatus function ->', function () {
      it('should call locationServices.getLocationSRHEnrollmentStatus', function () {
        scope.getLocationSRHEnrollmentStatus();
        expect(
          _locationServices_.getLocationSRHEnrollmentStatus
        ).toHaveBeenCalled();
        expect(
          _locationServices_.getLocationSRHEnrollmentStatus
        ).toHaveBeenCalledTimes(2);
      });
    });
  });
});

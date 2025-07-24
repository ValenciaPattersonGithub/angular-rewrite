describe('location-search -> ', function () {
  var locationServicesMock, scope, ctrl, $httpBackend;

  //#region mocks
  var locationsMock = [
    {
      LocationId: 1,
      NameLine1: 'First Office',
      AddressLine1: '123 Apple St',
      AddressLine2: 'Suite 10',
      ZipCode: '62401',
      City: 'Effingham',
      State: 'IL',
      PrimaryPhone: '5551234567',
    },
    {
      LocationId: 2,
      NameLine1: 'Second Office',
      AddressLine1: '123 Count Rd',
      AddressLine2: '',
      ZipCode: '62858',
      City: 'Louisville',
      State: 'IL',
      PrimaryPhone: '5559876543',
    },
    {
      LocationId: 3,
      NameLine1: 'Third Office',
      AddressLine1: '123 Adios St',
      AddressLine2: '',
      ZipCode: '60601',
      City: 'Chicago',
      State: 'IL',
      PrimaryPhone: '3124567890',
    },
    {
      LocationId: 4,
      NameLine1: 'Fourth Office',
      AddressLine1: '123 Hello Rd',
      AddressLine2: '',
      ZipCode: '62895',
      City: 'Wayne City',
      State: 'IL',
      PrimaryPhone: '6187894563',
      SecondaryPhone: '6181234567',
    },
  ];
  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      locationServicesMock = {
        get: jasmine.createSpy().and.returnValue(locationsMock),
      };
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    ctrl = $controller('LocationSearchController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      LocationServices: locationServicesMock,
    });

    $httpBackend = $injector.get('$httpBackend');
  }));

  describe('searchFilter function -> ', function () {
    it('should return false when filtered search does not match any of the items properties', function () {
      scope.filter = 'Ohio';
      var item = {
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(false);
    });

    it('should return true when filtered search contains same text as NameLine1', function () {
      scope.filter = 'First';
      var item = {
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(true);
    });

    it('should return true when filtered search contains same text as NameLine2', function () {
      scope.filter = 'First';
      var item = {
        LocationId: 1,
        NameLine2: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(true);
    });

    it('should return true when filtered search contains same text as ZipCode', function () {
      scope.filter = '6240';
      var item = {
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(true);
    });

    it('should return true when filtered search contains same text as City', function () {
      scope.filter = 'Effi';
      var item = {
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(true);
    });

    it('should return true when filtered search contains same text as State', function () {
      scope.filter = 'IL';
      var item = {
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(true);
    });

    it('should return true when filtered search contains same text as PrimaryPhone', function () {
      scope.filter = '555-';
      var item = {
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(true);
    });

    it('should return true when filtered search contains same text as NameLine1', function () {
      scope.filter = '618-';
      var item = {
        LocationId: 1,
        NameLine1: 'First Office',
        AddressLine1: '123 Apple St',
        AddressLine2: 'Suite 10',
        ZipCode: '62401',
        City: 'Effingham',
        State: 'IL',
        PrimaryPhone: '5551234567',
        SecondaryPhone: '6185551234',
      };

      var bool = scope.searchFilter(item);

      expect(bool).toBe(true);
    });
  });

  describe('getLocations function -> ', function () {
    it('should call locationsFactory.Locations function', function () {
      spyOn(scope, 'setStateName');
      scope.getLocations();

      expect(locationServicesMock.get).toHaveBeenCalled();
    });
  });

  describe('locationsGetSuccess function -> ', function () {
    it('should set scope property locations', function () {
      var result = {
        Value: [
          {
            LocationId: 1,
            NameLine1: 'First Office',
            AddressLine1: '123 Apple St',
            AddressLine2: 'Suite 10',
            ZipCode: '62401',
            City: 'Effingham',
            State: 'IL',
            PrimaryPhone: '5551234567',
            SecondaryPhone: '6185551234',
          },
        ],
      };

      scope.locationsGetSuccess(result);
      expect(scope.locations).toEqual(result.Value);
    });

    it('should set scope property loadingLocations to false', function () {
      scope.loadingLocations = true;
      var result = {
        Value: [
          {
            LocationId: 1,
            NameLine1: 'First Office',
            AddressLine1: '123 Apple St',
            AddressLine2: 'Suite 10',
            ZipCode: '62401',
            City: 'Effingham',
            State: 'IL',
            PrimaryPhone: '5551234567',
            SecondaryPhone: '6185551234',
          },
        ],
      };
      scope.locationsGetSuccess(result);
      expect(scope.loadingLocations).toBe(false);
    });
  });

  describe('locationGetFailure function -> ', function () {
    it('should call toastrFactory.error function', function () {
      scope.locationsGetFailure();

      expect(_toastr_.error).toHaveBeenCalled();
    });

    it('should set scope property loadingLocations to false', function () {
      scope.loadingLocations = true;
      scope.locationsGetFailure();
      expect(_toastr_.error).toHaveBeenCalled();
      expect(scope.loadingLocations).toBe(false);
    });
  });

  describe('authViewAccess ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the view amfa', function () {
      var result = ctrl.authViewAccess();

      expect(
        _authPatSecurityService_.isAmfaAuthorizedByName
      ).toHaveBeenCalledWith('soar-biz-bizloc-view');
      expect(result).toEqual(true);
    });
  });

  describe('authAccess ->', function () {
    beforeEach(function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);
      ctrl.authCreateAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.authEditAccess = jasmine.createSpy().and.returnValue(true);
    });

    it('should navigate away from the page when the user is not authorized to be on this page', function () {
      ctrl.authAccess();

      expect(scope.hasViewAccess).toEqual(false);
      expect(_$location_.path).toHaveBeenCalledWith('/');
    });
  });
});

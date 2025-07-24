describe('ProviderOnClaims Factory test ->', function () {
  var factory = {
    viewAccess: function () {
      return true;
    },
  };
  var userServices, referenceDataService, staticData;

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      userServices = {
        ProviderShowOnSchedule: jasmine.createSpy(),
      };
      $provide.value('UserServices', userServices);

      referenceDataService = {
        entityNames: { users: 'users' },
        getData: function (refType) {
          return {
            then: function (callme) {
              callme();
            },
          };
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      staticData = {
        ProviderTypes: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('StaticData', staticData);
    })
  );

  beforeEach(inject(function (ProviderShowOnScheduleFactory) {
    factory = ProviderShowOnScheduleFactory;
  }));

  it('should exist', function () {
    expect(factory).toBeTruthy();
  });

  describe('getAll function ->', function () {
    var retValue;
    beforeEach(function () {
      retValue = { $promise: { then: jasmine.createSpy() } };
      userServices.ProviderShowOnSchedule = {
        get: jasmine.createSpy().and.callFake(function () {
          return retValue;
        }),
      };
    });

    it('should call userServices.ProviderShowOnSchedule.get', function () {
      factory.getAll();

      expect(userServices.ProviderShowOnSchedule.get).toHaveBeenCalled();
      expect(retValue.$promise.then).toHaveBeenCalled();
    });

    describe('success callback ->', function () {
      var res;
      beforeEach(function () {
        res = { Value: 'res.Value' };
        retValue = {
          $promise: {
            then: function (success) {
              success(res);
            },
          },
        };
      });

      it('should extend promise', function () {
        var result = factory.getAll();

        expect(result.values).toBe(res.Value);
      });
    });

    describe('failure callback ->', function () {
      beforeEach(function () {
        retValue = {
          $promise: {
            then: function (success, failure) {
              failure();
            },
          },
        };
      });

      it('should call toastrFactory.error', function () {
        factory.getAll();

        expect(_toastr_.error).toHaveBeenCalled();
      });
    });
  });

  describe('getProviderLocations function ->', function () {
    beforeEach(function () {
      userServices.ProviderShowOnSchedule = {
        get: jasmine.createSpy().and.returnValue({
          $promise: { then: function () {} },
        }),
      };
    });

    it('should get showOnScheduleExceptions when includeShowOnSchedule is true', function () {
      factory.getProviderLocations(true);

      expect(userServices.ProviderShowOnSchedule.get).toHaveBeenCalled();
    });

    it('should not get showOnScheduleExceptions when includeShowOnSchedule is false', function () {
      factory.getProviderLocations(false);

      expect(userServices.ProviderShowOnSchedule.get).not.toHaveBeenCalled();
    });
  });
});

describe('RootsController', function () {
  var ctrl,
    scope,
    staticData,
    listHelper,
    filter,
    patientOdontogramFactory,
    q,
    timeout;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(null),
      };

      staticData = {
        TeethDefinitions: jasmine.createSpy().and.callFake(function () {
          var deferrred = q.defer();
          var result = { Value: { Teeth: [] } };
          deferrred.resolve(result);
          return deferrred.promise;
        }),
        ServiceTransactionStatuses: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      //#region mocks for factories
      patientOdontogramFactory = {
        TeethDefinitions: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $filter) {
    scope = $rootScope.$new();
    filter = $filter;
    listHelper = {};
    //creating controller
    ctrl = $controller('RootsController', {
      $scope: scope,
    });
    timeout = $injector.get('$timeout');
  }));

  //controller
  it('controller should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('watch activeTeeth ->', function () {
    beforeEach(function () {
      scope.activeTeeth = [
        {
          ToothId: 1,
          RootAbbreviations: ['DB'],
        },
      ];
    });
    it('should set Root selected to true ', function () {
      scope.data = [
        {
          RootAbbreviation: 'DB',
          RootName: 'DB',
          selected: false,
        },
        {
          RootAbbreviation: 'S',
          RootName: 'Sgl',
          selected: false,
        },
      ];
      expect(scope.data[0].selected).toBe(false);
      scope.activeTeeth.ToothId = '3';
      scope.$apply();
      scope.activeTeeth.ToothId = '4';
      scope.$apply();
      expect(scope.data[0].selected).toBe(true);
    });

    it('should set Root selected to false ', function () {
      scope.data = [
        {
          RootAbbreviation: 'S',
          RootName: 'Sgl',
          selected: false,
        },
      ];
      expect(scope.data[0].selected).toBe(false);
      scope.activeTeeth.ToothId = '3';
      scope.$apply();
      scope.activeTeeth.ToothId = '4';
      scope.$apply();
      expect(scope.data[0].selected).toBe(false);
    });
  });

  describe('scope.selectRoot function ->', function () {
    it('should set root.selected to true when it is false ', function () {
      var root = {
        RootAbbreviation: 'DB',
        RootName: 'DB',
        selected: true,
      };
      scope.selectRoot(root);
      expect(root.selected).toBe(false);
    });
    it('should set root.selected to false when it is true ', function () {
      var root = {
        RootAbbreviation: 'DB',
        RootName: 'DB',
        selected: false,
      };
      scope.selectRoot(root);
      expect(root.selected).toBe(true);
    });
  });
  describe('ctrl.setSelectedDefault function ->', function () {
    it('should set root.selected to false ', function () {
      scope.data = [
        {
          RootAbbreviation: 'DB',
          RootName: 'DB',
          selected: true,
        },
        {
          RootAbbreviation: 'S',
          RootName: 'Sgl',
          selected: true,
        },
      ];
      var flag = false;
      ctrl.setSelectedDefault(flag);
      expect(scope.data[0].selected).toBe(false);
      expect(scope.data[1].selected).toBe(false);
    });
  });
  describe('scope.showRootsForTooth function ->', function () {
    it('should set root.selected to false when activeteeth length is one and root.RootAbbreviation,scope.activeTeeth.RootAbbreviations are not equal ', function () {
      var root = {
        RootAbbreviation: 'P',
        RootName: 'DB',
        selected: true,
      };
      scope.activeTeeth = [
        {
          RootAbbreviations: ['DB'],
        },
      ];
      scope.showRootsForTooth(root);
      expect(root.selected).toBe(false);
    });
    it('should set root.selected to true when activeteeth length is one and root.RootAbbreviation,scope.activeTeeth.RootAbbreviations are  equal ', function () {
      var root = {
        RootAbbreviation: 'DB',
        RootName: 'DB',
        selected: true,
      };
      scope.activeTeeth = [
        {
          RootAbbreviations: ['DB'],
        },
      ];
      scope.showRootsForTooth(root);
      expect(root.selected).toBe(true);
    });
  });
});

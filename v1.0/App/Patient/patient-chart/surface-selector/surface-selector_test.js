describe('surface-selector-controller ->', function () {
  var routeParams,
    timeout,
    scope,
    ctrl,
    compile,
    toastr,
    q,
    staticData,
    listHelper;

  var mockSelectedSurfaces = [
    { Surface: 'M' },
    { Surface: 'D' },
    { Surface: 'F' },
  ];

  var mockTeethDefinitions = {
    DetailedSurfaces: [],
    Roots: [],
    SummarySurfaces: [
      { SummarySurfaceName: 'Mesial', SummarySurfaceAbbreviations: 'M' },
      { SummarySurfaceName: 'Distal', SummarySurfaceAbbreviations: 'D' },
      { SummarySurfaceName: 'Buccal', SummarySurfaceAbbreviations: 'B' },
      { SummarySurfaceName: 'Occlusial', SummarySurfaceAbbreviations: 'O' },
      { SummarySurfaceName: 'Incisal', SummarySurfaceAbbreviations: 'I' },
      { SummarySurfaceName: 'Buccal V', SummarySurfaceAbbreviations: 'B5' },
      { SummarySurfaceName: 'Facial V', SummarySurfaceAbbreviations: 'F5' },
      { SummarySurfaceName: 'Facial', SummarySurfaceAbbreviations: 'F' },
    ],
    Teeth: [
      { ToothId: 1, SummarySurfaceAbbreviations: ['M', 'B', 'O', 'F'] },
      { ToothId: 2, SummarySurfaceAbbreviations: ['M', 'B', 'O'] },
      { ToothId: 3, SummarySurfaceAbbreviations: ['M', 'B'] },
      { ToothId: 4, SummarySurfaceAbbreviations: ['B', 'O', 'F'] },
      { ToothId: 5, SummarySurfaceAbbreviations: ['O', 'F'] },
      { ToothId: 6, SummarySurfaceAbbreviations: ['F'] },
    ],
  };
  var mockReturnValue = -1;
  //mock for listHelper service
  listHelper = {
    findItemByFieldValue: jasmine
      .createSpy('listHelper.findItemByFieldValue')
      .and.returnValue(mockReturnValue),
    findIndexByFieldValue: jasmine
      .createSpy('listHelper.findIndexByFieldValue')
      .and.returnValue(mockReturnValue),
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      staticData = {
        TeethDefinitions: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('StaticData', staticData);
    })
  );

  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $compile,
    $timeout,
    $q
  ) {
    timeout = $timeout;
    compile = $compile;
    q = $q;
    scope = $rootScope.$new();
    ctrl = $controller('SurfaceSelectorController', {
      $scope: scope,
      StaticData: staticData,
      ListHelper: listHelper,
    });
  }));

  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  it('should set scope properties', function () {
    expect(scope.selectedSurfaces).toEqual([]);
    expect(scope.showSurfaceMessage).toBe(false);
    //expect(scope.surfaces).toEqual([]);
  });

  describe('getTeethDefinitions function -> ', function () {
    it('should call staticData.TeethDefinitions', function () {
      ctrl.getTeethDefinitions();
      expect(staticData.TeethDefinitions).toHaveBeenCalled();
    });
  });

  describe('initController function -> ', function () {
    it('should call getTeethDefinitions', function () {
      spyOn(ctrl, 'getTeethDefinitions');
      ctrl.initController();
      expect(ctrl.getTeethDefinitions).toHaveBeenCalled();
    });
  });

  describe('selectSurface function -> ', function () {
    it('should set activeTooth.SelectedSurfaces to empty array if surface not in tooth.SummarySurfaceAbbreviations', function () {
      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[0]);
      scope.selectSurface('L');
      expect(scope.activeTooth.SelectedSurfaces).toEqual([]);
    });

    it('should add surface to activeTooth.SelectedSurfaces if surface in tooth.SummarySurfaceAbbreviations', function () {
      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[0]);
      scope.selectSurface('M');
      expect(scope.activeTooth.SelectedSurfaces).toEqual([{ Surface: 'M' }]);
    });

    it('should set activeTooth.Surfaces to empty string if surface not in tooth.SummarySurfaceAbbreviations', function () {
      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[0]);
      scope.selectSurface('L');
      expect(scope.activeTooth.Surfaces).toEqual('');
    });

    it('should add surface to activeTooth.Surfaces if surface in tooth.SummarySurfaceAbbreviations', function () {
      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[0]);
      scope.selectSurface('M');
      expect(scope.activeTooth.Surfaces).toEqual('M,');
      scope.selectSurface('O');
      expect(scope.activeTooth.Surfaces).toEqual('M,O,');
    });
  });

  describe('validateSurfaces function -> ', function () {
    it('should set showSurfaceMessage to false if all selectedTeeth have surfaces', function () {
      scope.selectedTeeth = [];

      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[0]);
      scope.selectSurface('M');
      scope.selectedTeeth.push(scope.activeTooth);

      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[1]);
      scope.selectSurface('M');
      scope.selectedTeeth.push(scope.activeTooth);

      scope.validateSurfaces();
      expect(scope.showSurfaceMessage).toBe(false);
    });

    it('should set showSurfaceMessage to true if all selectedTeeth do not have surfaces', function () {
      scope.selectedTeeth = [];
      scope.selectedTeeth.push(angular.copy(mockTeethDefinitions.Teeth[0]));
      scope.selectedTeeth.push(angular.copy(mockTeethDefinitions.Teeth[1]));
      scope.validateSurfaces();
      expect(scope.showSurfaceMessage).toBe(true);
    });
  });

  describe('disableSelection watch -> ', function () {
    it('should set selectedTeeth SelectedSurfaces to [] ', function () {
      scope.disableSelection = false;
      scope.selectedTeeth = [];
      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[0]);
      scope.selectSurface('M');
      scope.selectedTeeth.push(scope.activeTooth);

      scope.activeTooth = angular.copy(mockTeethDefinitions.Teeth[1]);
      scope.selectSurface('O');
      scope.selectedTeeth.push(scope.activeTooth);
      scope.$digest();

      expect(scope.selectedTeeth[0].SelectedSurfaces).toEqual([
        { Surface: 'M' },
      ]);
      expect(scope.selectedTeeth[1].SelectedSurfaces).toEqual([
        { Surface: 'O' },
      ]);

      scope.disableSelection = true;
      scope.$digest();
      expect(scope.selectedTeeth[0].SelectedSurfaces).toEqual([]);
      expect(scope.selectedTeeth[1].SelectedSurfaces).toEqual([]);
    });
  });

  describe('hasSelectedSurfaces function -> ', function () {
    it('should call return true if selectedSurfaces contains a surface', function () {
      spyOn(scope, 'hasSelectedSurfaces');
      scope.selectedSurfaces = angular.copy(mockSelectedSurfaces);
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0);
    });

    it('should call return false if selectedSurfaces does not contain a surface', function () {
      spyOn(scope, 'hasSelectedSurfaces');
      scope.selectedSurfaces = angular.copy(mockSelectedSurfaces);
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
    });
  });

  describe('watch selectedTeeth -> ', function () {
    it('should call validateSurfaces', function () {
      spyOn(scope, 'validateSurfaces');
      scope.selectedTeeth = { ToothId: 12 };
      scope.$digest();
      scope.selectedTeeth = { ToothId: 11 };
      scope.$digest();
      expect(scope.validateSurfaces).toHaveBeenCalled();
    });

    it('should reset activeTooth to empty object if selectedTeeth.length==0', function () {
      spyOn(scope, 'validateSurfaces');
      scope.activeTooth = {};
      scope.selectedTeeth = { ToothId: 12 };
      scope.$digest();
      scope.selectedTeeth = { ToothId: 11 };
      scope.$digest();
      expect(scope.activeTooth).toEqual({});
      scope.selectedTeeth = {};
      scope.$digest();
      expect(scope.activeTooth).toEqual({});
    });
  });
});

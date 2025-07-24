describe('surface-controller ->', function () {
  var scope, ctrl, staticData, listHelper, filter, mockSurfaceHelper;

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
    PosteriorSurfaces: [
      { Surface: 'M', Selected: false, Desc: 'M', Order: 1 },
      { Surface: 'O', Selected: false, Desc: 'O', Order: 2 },
      { Surface: 'D', Selected: false, Desc: 'D', Order: 3 },
      { Surface: 'B', Selected: false, Desc: 'B', Order: 4 },
      { Surface: 'L', Selected: false, Desc: 'L', Order: 5 },
      { Surface: 'B5', Selected: false, Desc: 'B5', Order: 6 },
      { Surface: 'L5', Selected: false, Desc: 'L5', Order: 7 },
    ],
    anteriorSurfaces: [
      { Surface: 'M', Selected: false, Desc: 'M', Order: 1 },
      { Surface: 'I', Selected: false, Desc: 'I', Order: 2 },
      { Surface: 'D', Selected: false, Desc: 'D', Order: 3 },
      { Surface: 'F', Selected: false, Desc: 'F', Order: 4 },
      { Surface: 'L', Selected: false, Desc: 'L', Order: 5 },
      { Surface: 'L5', Selected: false, Desc: 'L5', Order: 6 },
      { Surface: 'F5', Selected: false, Desc: 'F5', Order: 7 },
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

  mockSurfaceHelper = {
    surfaceCSVStringToSurfaceString: jasmine
      .createSpy('SurfaceHelper.surfaceCSVStringToSurfaceString')
      .and.returnValue(''),
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
  beforeEach(inject(function ($rootScope, $controller, $injector, $filter) {
    filter = $filter;
    scope = $rootScope.$new();
    ctrl = $controller('SurfaceController', {
      $scope: scope,
      StaticData: staticData,
      ListHelper: listHelper,
      $filter: filter,
      SurfaceHelper: mockSurfaceHelper,
    });
  }));

  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  it('should set scope properties', function () {
    expect(scope.ToothType).toEqual(0);
    expect(scope.isSurfaceEditing).toEqual(false);
    expect(ctrl.allTeeth).toEqual([]);
    expect(scope.summarySurfaces).toEqual([]);
    expect(scope.teethDefinitions).toEqual([]);
  });

  //openSelectedSurface
  describe('openSelectedSurface function -> ', function () {
    it('should call ctrl.init when isSurfaceOpen is false', function () {
      spyOn(ctrl, 'init');
      scope.openSelectedSurface();
      expect(ctrl.init).toHaveBeenCalled();
    });

    it('should not call ctrl.init when isSurfaceOpen is true', function () {
      scope.isSurfaceEditing = true;
      var spy1 = spyOn(ctrl, 'init');
      scope.openSelectedSurface();
      expect(spy1).not.toHaveBeenCalled();
    });
  });

  //closeSelectedSurface
  describe('closeSelectedSurface function -> ', function () {
    it('should set isSurfaceOpen to false', function () {
      scope.closeSelectedSurface();
      expect(scope.isSurfaceEditing).toBe(false);
    });
  });

  describe('getTeethDefinitions function -> ', function () {
    it('should call staticData.TeethDefinitions', function () {
      ctrl.getTeethDefinitions();
      expect(staticData.TeethDefinitions).toHaveBeenCalled();
    });
  });

  //SetSelectedServicesForInitialize
  describe('SetSelectedServicesForInitialize function -> ', function () {
    it('should not select any surface in summary surface when incorrect surface value is given', function () {
      scope.summarySurfaces = mockTeethDefinitions.anteriorSurfaces;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      angular.forEach(scope.summarySurfaces, function (surface) {
        surface.Selected = false;
      });

      scope.selectedSurface = 'C';

      ctrl.SetSelectedServicesForInitialize();
      expect(scope.summarySurfaces[0].Selected).toBe(false);
      expect(scope.summarySurfaces[1].Selected).toBe(false);
      expect(scope.summarySurfaces[2].Selected).toBe(false);
      expect(scope.summarySurfaces[3].Selected).toBe(false);
      expect(scope.summarySurfaces[4].Selected).toBe(false);
      expect(scope.summarySurfaces[5].Selected).toBe(false);
      expect(scope.summarySurfaces[6].Selected).toBe(false);
    });

    it("should select appropriate surface in summary surface when 'F' surface is selected", function () {
      scope.summarySurfaces = mockTeethDefinitions.anteriorSurfaces;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(mockTeethDefinitions.anteriorSurfaces[3]);
      angular.forEach(scope.summarySurfaces, function (surface) {
        surface.Selected = false;
      });

      scope.selectedSurface = 'F';

      ctrl.SetSelectedServicesForInitialize();
      expect(scope.summarySurfaces[0].Selected).toBe(false);
      expect(scope.summarySurfaces[1].Selected).toBe(false);
      expect(scope.summarySurfaces[2].Selected).toBe(false);
      expect(scope.summarySurfaces[3].Selected).toBe(true);
      expect(scope.summarySurfaces[4].Selected).toBe(false);
      expect(scope.summarySurfaces[5].Selected).toBe(false);
      expect(scope.summarySurfaces[6].Selected).toBe(false);
    });
  });

  describe('init function -> ', function () {
    it('should call getTeethDefinitions', function () {
      ctrl.allTeeth = null;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(mockTeethDefinitions.Teeth[0]);
      spyOn(ctrl, 'getTeethDefinitions');
      spyOn(ctrl, 'setSummarySurfaces');
      spyOn(ctrl, 'SetSelectedServicesForInitialize');
      spyOn(ctrl, 'buildSurfaceString');

      ctrl.init();

      expect(ctrl.getTeethDefinitions).toHaveBeenCalled();
      expect(ctrl.setSummarySurfaces).toHaveBeenCalled();
      expect(ctrl.SetSelectedServicesForInitialize).toHaveBeenCalled();
      expect(ctrl.buildSurfaceString).toHaveBeenCalled();
    });

    it('should not call getTeethDefinitions when allTeeth is defined', function () {
      ctrl.allTeeth = mockTeethDefinitions.Teeth;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      spyOn(ctrl, 'getTeethDefinitions');
      spyOn(ctrl, 'setSummarySurfaces');
      spyOn(ctrl, 'SetSelectedServicesForInitialize');
      spyOn(ctrl, 'buildSurfaceString');

      ctrl.init();

      expect(ctrl.getTeethDefinitions).not.toHaveBeenCalled();
      expect(ctrl.setSummarySurfaces).not.toHaveBeenCalled();
      expect(ctrl.SetSelectedServicesForInitialize).not.toHaveBeenCalled();
      expect(ctrl.buildSurfaceString).not.toHaveBeenCalled();
    });
  });

  describe('setSummarySurfaces function -> ', function () {
    it("should set summary surfaces with posterior surfaces when summary surface contains 'O' surface", function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ Surface: 'O' });
      ctrl.setSummarySurfaces();

      expect(scope.summarySurfaces[1].Surface).toEqual(
        mockTeethDefinitions.PosteriorSurfaces[1].Surface
      );
    });

    it("should set summary surfaces with anterior surfaces when summary surface contains 'I' surface", function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      ctrl.setSummarySurfaces();

      expect(scope.summarySurfaces[1].Surface).toEqual(
        mockTeethDefinitions.anteriorSurfaces[1].Surface
      );
    });
  });

  describe('buildSurfaceString function --> ', function () {
    it('should format scope.selectedSurface when all surfaces is selected and valid for selected posterior Tooth', function () {
      mockSurfaceHelper.surfaceCSVStringToSurfaceString = jasmine.createSpy(
        'SurfaceHelper.surfaceCSVStringToSurfaceString'
      );
      ctrl.buildSurfaceString();
      expect(
        mockSurfaceHelper.surfaceCSVStringToSurfaceString
      ).toHaveBeenCalled();
    });
  });

  describe('selectSurface function -> ', function () {
    it("should unselect previously selected L5 surface when class 'L5' surface is unselected", function () {
      scope.summarySurfaces = mockTeethDefinitions.PosteriorSurfaces;
      scope.summarySurfaces[5].Selected = true;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.summarySurfaces[5]);
      var spy1 = spyOn(ctrl, 'createSurfaceCSV');
      var spy2 = spyOn(ctrl, 'buildSurfaceString');
      expect(scope.summarySurfaces[5].Selected).toEqual(true);

      scope.selectSurface('L5');

      expect(scope.summarySurfaces[5].Selected).toEqual(false);
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it("should select F5 surface when class 'F5' surface is selected", function () {
      scope.summarySurfaces = mockTeethDefinitions.PosteriorSurfaces;
      scope.summarySurfaces[6].Selected = false;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.summarySurfaces[6]);
      var spy1 = spyOn(ctrl, 'createSurfaceCSV');
      var spy2 = spyOn(ctrl, 'buildSurfaceString');
      scope.selectSurface('F5');

      expect(scope.summarySurfaces[6].Selected).toEqual(true);
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('should not update if value given that is not in the list of surfaces', function () {
      scope.summarySurfaces = mockTeethDefinitions.PosteriorSurfaces;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      var spy1 = spyOn(ctrl, 'createSurfaceCSV');
      var spy2 = spyOn(ctrl, 'buildSurfaceString');
      scope.selectSurface('C4');

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });
  });

  describe('hasSelectedSurfaces function -> ', function () {
    it('should return true if specified surface is selected in summary surfaces', function () {
      scope.summarySurfaces = mockTeethDefinitions.anteriorSurfaces;
      scope.summarySurfaces[3].Selected = true;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.summarySurfaces[3]);
      var returnValue = scope.hasSelectedSurfaces('F');

      expect(returnValue).toBe(true);
    });

    it('should return false if specified surface is not selected in summary surfaces', function () {
      scope.summarySurfaces = mockTeethDefinitions.anteriorSurfaces;
      scope.summarySurfaces[3].Selected = false;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.summarySurfaces[3]);
      var returnValue = scope.hasSelectedSurfaces('F');

      expect(returnValue).toBe(false);
    });
  });
});

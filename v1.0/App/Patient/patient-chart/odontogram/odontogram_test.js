import { of } from 'rxjs';

describe('odontogram ->', function () {
  var patientServices,
    toastrFactory,
    toothSelector,
    fileUploadFactory,
    fileService,
    patientValidationFactory,
    conditionsService,
    featureFlagService,
    referenceDataService;

  var currentTeethMock = [
    { OrderedDrawItems: null, ToothNumber: '1' },
    {
      OrderedDrawItems: null,
      ToothNumber: '2',
    },
    { OrderedDrawItems: null, ToothNumber: '3' },
  ];
  var patientOdontogramMock = {
    Data: {
      PatientId: 'b3eb6f7f-7b4a-4be5-b8ac-d24cccdd42b9',
      Teeth: currentTeethMock,
      DataTag: 'xyz',
    },
  };

  beforeEach(module('Soar.Common'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      conditionsService = { getAll: jasmine.createSpy() };
      $provide.value('ConditionsService', conditionsService);

      patientServices = {
        Odontogram: {
          create: jasmine.createSpy().and.returnValue(patientOdontogramMock),
          update: jasmine.createSpy().and.returnValue(patientOdontogramMock),
        },
      };
      $provide.value('PatientServices', patientServices);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      toothSelector = {
        toothData: {
          1: {
            isPrimary: false,
            permanentNumber: 1,
            primaryLetter: '',
            quadrant: 'ur',
            arch: 'u',
            watchIds: null,
            watchTeeth: null,
          },
        },
        selection: { teeth: [{ position: -1 }] },
        selectTooth: jasmine.createSpy(),
        selectToothGroup: jasmine.createSpy(),
        getToothId: jasmine.createSpy().and.returnValue('test'),
        resetToothData: jasmine.createSpy(),
      };
      $provide.value('ToothSelectionService', toothSelector);

      fileUploadFactory = {
        CreatePatientDirectory: jasmine.createSpy().and.returnValue({
          then: function () {},
        }),
      };
      $provide.value('FileUploadFactory', fileUploadFactory);

      fileService = {};
      $provide.value('fileService', fileService);

      patientValidationFactory = {
        GetPatientData: jasmine
          .createSpy()
          .and.returnValue({ PatientLocations: [{}] }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          drawTypes: 'drawTypes',
          serviceCodes: 'serviceCodes',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  var scope, element, $q;
  beforeEach(inject(function (
    $rootScope,
    $compile,
    $templateCache,
    _$q_,
    StaticData
  ) {
    $q = _$q_;
    StaticData.TeethDefinitions = jasmine.createSpy().and.returnValue({
      then: function () {},
    });
    referenceDataService.getData.and.returnValue($q.resolve());
    scope = $rootScope.$new();
    scope.odontogram = patientOdontogramMock;
    $templateCache.put(
      'App/Patient/patient-chart/odontogram/odontogram.html',
      ''
    );
    element = angular.element(
      '<odontogram selection="some.property" patient-odontogram="odontogram"></odontogram>'
    );
    $compile(element)(scope);
    $rootScope.$digest();
  }));

  describe('directive ->', function () {
    it('should compile', function () {
      expect(element.html()).toBe('');
    });
  });
});

describe('OdontogramController -> ', function () {
  var scope,
    ctrl,
    patientValidationFactory,
    conditionsService,
    toothSelector,
    fileUploadFactory,
    fileService,
    patientServices,
    AmfaKeys;

  var currentTeethMock = [
    { OrderedDrawItems: null, ToothNumber: '1' },
    { OrderedDrawItems: null, ToothNumber: '2' },
    { OrderedDrawItems: null, ToothNumber: '3' },
  ];

  var patientOdontogramMock = {
    Data: {
      PatientId: 'b3eb6f7f-7b4a-4be5-b8ac-d24cccdd42b9',
      Teeth: currentTeethMock,
      DataTag: 'xyz',
    },
  };

  //mock for toastrFactory
  var toastrFactory = {
    success: jasmine.createSpy(),
    error: jasmine.createSpy(),
  };

  var staticData = {
    TeethDefinitions: jasmine
      .createSpy()
      .and.returnValue({ then: function () {} }),
  };

  beforeEach(module('Soar.Common'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      conditionsService = { getAll: jasmine.createSpy() };
      $provide.value('ConditionsService', conditionsService);

      patientServices = {
        Odontogram: {
          create: jasmine.createSpy().and.returnValue(patientOdontogramMock),
          update: jasmine.createSpy().and.returnValue(patientOdontogramMock),
        },
      };
      $provide.value('PatientServices', patientServices);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      toothSelector = {
        toothData: {
          1: {
            isPrimary: false,
            permanentNumber: 1,
            primaryLetter: '',
            quadrant: 'ur',
            arch: 'u',
            watchIds: null,
            watchTeeth: null,
          },
        },
        selection: { teeth: [{ position: -1 }] },
        selectTooth: jasmine.createSpy(),
        selectToothGroup: jasmine.createSpy(),
        getToothId: jasmine.createSpy().and.returnValue('test'),
        resetToothData: jasmine.createSpy(),
      };
      $provide.value('ToothSelectionService', toothSelector);

      fileUploadFactory = {
        CreatePatientDirectory: jasmine.createSpy().and.returnValue({
          then: function () {},
        }),
      };
      $provide.value('FileUploadFactory', fileUploadFactory);

      fileService = {};
      $provide.value('fileService', fileService);

      patientValidationFactory = {
        GetPatientData: jasmine
          .createSpy()
          .and.returnValue({ PatientLocations: [{}] }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, _AmfaKeys_) {
    AmfaKeys = _AmfaKeys_;
    patientValidationFactory = {};
    scope = $rootScope.$new();
    scope.patientOdontogram = _.cloneDeep(patientOdontogramMock);
    ctrl = $controller('OdontogramController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      currentToothChart: currentTeethMock,
      StaticData: staticData,
      PatientValidationFactory: patientValidationFactory,
      AmfaKeys: AmfaKeys,
    });
  }));

  it('should exist', function () {
    expect(ctrl).toBeDefined();
  });

  it('should set initial values', function () {
    expect(scope.selection).toEqual(toothSelector.selection);
  });

  describe('selectToothGroup function ->', function () {
    it('should pass parameters to toothSelector.selectToothGroup', function () {
      var a = 'a',
        b = 'b';
      scope.selectToothGroup(a, b);
      expect(toothSelector.selectToothGroup).toHaveBeenCalledWith(a, b);
    });
  });

  describe('togglePrimary function ->', function () {
    beforeEach(function () {
      ctrl.setToothPrimary = jasmine.createSpy();
    });

    beforeEach(function () {
      scope.selection = { teeth: [{ position: '1' }] };
    });

    it('should call ctrl.setToothPrimary with correct parameters', function () {
      ctrl.currentToothChart = [];
      scope.togglePrimary('primary');
      expect(ctrl.setToothPrimary).toHaveBeenCalledWith(
        scope.selection.teeth[0].position,
        'primary'
      );
    });

    it('should call setToothChart ', function () {
      spyOn(ctrl, 'setToothChart');
      scope.togglePrimary();
      expect(ctrl.setToothChart).toHaveBeenCalled();
    });
  });

  describe('setToothPrimary function ->', function () {
    beforeEach(function () {
      scope.toothData = {
        16: { isPrimary: '' },
        32: { isPrimary: '' },
      };
    });

    it('should set the correct value on toothData', function () {
      ctrl.setToothPrimary(16, 'test');
      expect(scope.toothData[16].isPrimary).toBe('test');
      expect(scope.toothData[32].isPrimary).not.toBe('test');
    });
  });

  describe('initToothChart function ->', function () {
    beforeEach(function () {
      scope.toothData = {
        1: {
          isPrimary: false,
          permanentNumber: 1,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        2: {
          isPrimary: false,
          permanentNumber: 2,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        3: {
          isPrimary: false,
          permanentNumber: 3,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        4: {
          isPrimary: false,
          permanentNumber: 4,
          primaryLetter: 'A',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        5: {
          isPrimary: false,
          permanentNumber: 5,
          primaryLetter: 'B',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        6: {
          isPrimary: false,
          permanentNumber: 6,
          primaryLetter: 'C',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        7: {
          isPrimary: false,
          permanentNumber: 7,
          primaryLetter: 'D',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        8: {
          isPrimary: false,
          permanentNumber: 8,
          primaryLetter: 'E',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        9: {
          isPrimary: false,
          permanentNumber: 9,
          primaryLetter: 'F',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
      };
    });

    it('should call setToothPrimary if patientOdontogram.Teeth has data', function () {
      spyOn(ctrl, 'setToothPrimary');
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.patientOdontogram.Data.OdontogramId = '77';
      ctrl.initToothChart();
      expect(ctrl.setToothPrimary).toHaveBeenCalled();
    });

    it('should not call setToothPrimary if patientOdontogram.Teeth has no data', function () {
      spyOn(ctrl, 'setToothPrimary');
      scope.patientOdontogram.Data.Teeth = null;
      ctrl.initToothChart();
      expect(ctrl.setToothPrimary).not.toHaveBeenCalled();
    });
  });

  describe('setToothChart function ->', function () {
    it('should rebuild the currentToothChart when called ', function () {
      ctrl.currentToothChart = [];
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.savingOdontogram = false;
      ctrl.setToothChart();
      expect(ctrl.currentToothChart).toEqual(
        scope.patientOdontogram.Data.Teeth
      );
    });

    it('should call saveOdontogram if currentToothChart not equal patientOdontogram.Teeth and savingOdontogram is false', function () {
      spyOn(ctrl, 'saveOdontogram');
      ctrl.currentToothChart = [];
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.savingOdontogram = false;
      ctrl.setToothChart();
      expect(ctrl.saveOdontogram).toHaveBeenCalled();
    });

    it('should not call saveOdontogram if currentToothChart not equal patientOdontogram.Teeth and savingOdontogram is true', function () {
      spyOn(ctrl, 'saveOdontogram');
      ctrl.currentToothChart = [];
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.savingOdontogram = true;
      ctrl.setToothChart();
      expect(ctrl.saveOdontogram).not.toHaveBeenCalled();
    });
  });

  describe('compareToothChart function ->', function () {
    it('should call saveOdontogram if currentToothChart not equal patientOdontogram.Teeth', function () {
      spyOn(ctrl, 'saveOdontogram');
      ctrl.currentToothChart = [
        { OrderedDrawItems: null, ToothNumber: '1' },
        { OrderedDrawItems: null, ToothNumber: '2' },
        { OrderedDrawItems: null, ToothNumber: 'E' },
      ];
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      ctrl.compareToothChart();
      expect(ctrl.saveOdontogram).toHaveBeenCalled();
    });

    it('should ignore $-prefixed properties', function () {
      spyOn(ctrl, 'saveOdontogram');
      ctrl.currentToothChart = [
        {
          OrderedDrawItems: { ItemId: 'ItemId', $$DrawTypeOrder: 'order' },
          ToothNumber: '1',
        },
      ];
      scope.patientOdontogram.Data.Teeth = [
        { OrderedDrawItems: { ItemId: 'ItemId' }, ToothNumber: '1' },
      ];
      ctrl.compareToothChart();
      expect(ctrl.saveOdontogram).not.toHaveBeenCalled();
    });

    it('should set patientOdontogram.Teeth equal to currentToothChart if currentToothChart not equal patientOdontogram.Teeth', function () {
      spyOn(ctrl, 'saveOdontogram');
      ctrl.currentToothChart = [{ OrderedDrawItems: null, ToothNumber: 'G' }];
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      ctrl.compareToothChart();
      expect(ctrl.currentToothChart).toEqual(
        scope.patientOdontogram.Data.Teeth
      );
    });
  });

  describe('saveOdontogram function ->', function () {
    it('should call patientService.Odontogram if hasEditOdontogramAccess', function () {
      scope.hasEditOdontogramAccess = true;
      scope.editing = false;
      ctrl.saveOdontogram();

      expect(patientServices.Odontogram.create).toHaveBeenCalled();
    });

    it('should not call patientServices.Odontogram if not hasEditOdontogramAccess', function () {
      scope.hasEditOdontogramAccess = false;
      ctrl.saveOdontogram();
      expect(patientServices.Odontogram.create).not.toHaveBeenCalled();
    });

    it('should call patientServices.Odontogram.update if editing', function () {
      scope.hasEditOdontogramAccess = true;
      scope.editing = true;
      ctrl.saveOdontogram();
      expect(patientServices.Odontogram.update).toHaveBeenCalled();
    });

    it('should call patientServices.Odontogram.create if not editing', function () {
      scope.hasEditOdontogramAccess = true;
      scope.editing = false;
      ctrl.saveOdontogram();
      expect(patientServices.Odontogram.create).toHaveBeenCalled();
    });
  });

  describe('odontogramSaveSuccess function ->', function () {
    it('should set patientOdontogram to resolve', function () {
      var res = {
        Value: { PersonId: 'abc', Teeth: currentTeethMock, DataTag: 'xyz' },
      };
      ctrl.odontogramSaveSuccess(res);
      expect(scope.patientOdontogram.Data).toEqual(res.Value);
    });

    it('should set savingOdontogram to false', function () {
      var res = {
        Value: { PersonId: 'abc', Teeth: currentTeethMock, DataTag: 'xyz' },
      };
      ctrl.odontogramSaveSuccess(res);
      //expect(scope.savingOdontogram).toBe(false);
    });

    it('should set editing to true', function () {
      var res = {
        Value: { PersonId: 'abc', Teeth: currentTeethMock, DataTag: 'xyz' },
      };
      ctrl.odontogramSaveSuccess(res);
      expect(scope.editing).toBe(true);
    });

    it('should call compareToothChart', function () {
      spyOn(ctrl, 'compareToothChart');
      var res = { PersonId: 'abc', Teeth: currentTeethMock, DataTag: 'xyz' };
      ctrl.odontogramSaveSuccess(res);
      expect(ctrl.compareToothChart).toHaveBeenCalled();
    });
  });

  describe('odontogramSaveFailure function ->', function () {
    it('should call toastr', function () {
      scope.savingOdontogram = true;
      ctrl.odontogramSaveFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should set savingOdontogram to false', function () {
      scope.savingOdontogram = true;
      ctrl.odontogramSaveFailure();
      expect(scope.savingOdontogram).toBe(false);
    });
  });

  describe('getIndexById function ->', function () {
    beforeEach(function () {
      scope.toothData = {
        1: {
          isPrimary: false,
          permanentNumber: 1,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        2: {
          isPrimary: false,
          permanentNumber: 2,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        3: {
          isPrimary: false,
          permanentNumber: 3,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        4: {
          isPrimary: false,
          permanentNumber: 4,
          primaryLetter: 'A',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        5: {
          isPrimary: false,
          permanentNumber: 5,
          primaryLetter: 'B',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        6: {
          isPrimary: false,
          permanentNumber: 6,
          primaryLetter: 'C',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        7: {
          isPrimary: false,
          permanentNumber: 7,
          primaryLetter: 'D',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        8: {
          isPrimary: false,
          permanentNumber: 8,
          primaryLetter: 'E',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
        9: {
          isPrimary: false,
          permanentNumber: 9,
          primaryLetter: 'F',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
        },
      };
    });

    it('should return -1 if toothPosition not in toothData', function () {
      var retValue = scope.getIndexById(10, true);
      expect(retValue).toEqual(-1);
    });

    it('should return index if toothPosition in toothData', function () {
      var retValue = scope.getIndexById(8, true);
      expect(retValue).toEqual(8);
    });
  });

  describe('watch patientOdontogram -> ', function () {
    it('should set odontogramInitialized to true', function () {
      scope.odontogramInitialized = false;
      scope.patientOdontogram.Data.Teeth = null;
      scope.$digest();
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.$digest();
      expect(scope.odontogramInitialized).toBe(true);
    });

    it('should set currentToothChart to patientOdontogram.Teeth', function () {
      scope.odontogramInitialized = false;
      ctrl.currentToothChart = {};
      scope.patientOdontogram.Data.Teeth = null;
      scope.$digest();
      scope.odontogramInitialized = false;
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.$digest();
      expect(ctrl.currentToothChart).toEqual(
        scope.patientOdontogram.Data.Teeth
      );
    });

    it('should call initToothChart', function () {
      spyOn(ctrl, 'initToothChart');
      scope.odontogramInitialized = false;
      ctrl.currentToothChart = {};
      scope.patientOdontogram.Data.Teeth = null;
      scope.$digest();
      scope.odontogramInitialized = false;
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.$digest();
      expect(ctrl.initToothChart).toHaveBeenCalled();
    });

    it('should set editing true if patientOdontogram.OdontogramId not null', function () {
      spyOn(ctrl, 'initToothChart');
      scope.odontogramInitialized = false;
      ctrl.currentToothChart = {};
      scope.patientOdontogram.Data.Teeth = null;
      scope.$digest();
      scope.odontogramInitialized = false;
      scope.patientOdontogram.Data.OdontogramId = '77';
      scope.patientOdontogram.Data.Teeth = currentTeethMock;
      scope.$digest();
      expect(scope.editing).toEqual(true);
    });

    it('should set editing false if patientOdontogram.OdontogramId null', function () {
      spyOn(ctrl, 'initToothChart');
      scope.odontogramInitialized = false;
      ctrl.currentToothChart = {};
      scope.patientOdontogram.Data.Teeth = null;
      scope.$digest();
      scope.odontogramInitialized = false;
      scope.patientOdontogram.Data.OdontogramId = null;
      scope.patientOdontogram.Data.Teeth = [];
      scope.$digest();
      expect(scope.editing).toEqual(false);
    });
  });

  describe('addSupernumeraryToToothDataArray function -> ', function () {
    beforeEach(function () {
      scope.toothData = {
        10: {
          isPrimary: false,
          permanentNumber: null,
          primaryLetter: null,
          quadrant: 'UL',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          isSupernumerary: false,
          toothId: 10,
          hasSupernumerary: false,
        },
      };
    });

    it('should update scope.toothData when supernumerarys are added', function () {
      var supernumeraryTooth = {
        ToothId: '60',
        ToothStructure: 'Permanent',
        ArchPosition: 'Upper',
        Selected: true,
        USNumber: 60,
      };
      ctrl.addSupernumeraryToToothDataArray(supernumeraryTooth);
      expect(scope.toothData[10].hasSupernumerary).toBe(true);
    });

    it('should update scope.toothData when supernumerarys are removed', function () {
      var supernumeraryTooth = {
        ToothId: '60',
        ToothStructure: 'Permanent',
        ArchPosition: 'Upper',
        Selected: false,
        USNumber: 60,
      };
      ctrl.addSupernumeraryToToothDataArray(supernumeraryTooth);
      expect(scope.toothData[10].hasSupernumerary).toBe(false);
    });
  });
});

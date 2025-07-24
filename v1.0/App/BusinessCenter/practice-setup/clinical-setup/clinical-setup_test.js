import { of } from 'rsjs';

describe('clinical-setup -> ', function () {
  var scope,
    ctrl,
    _practiceSettingsService,
    localize,
    modalFactory,
    toastrFactory,
    imagingMasterService,
    imagingProviders,
    blueImagingService,
    featureFlagService;

    

  //#region mocks

  var response = {
    ExtendedStatusCode: null,
    Value: {
      SectionHeaderName: 'Clinical Setup',
      Sections: [
        { Section: 'Conditions', Count: 603 },
        { Section: 'Medical History Alerts', Count: 16 },
        { Section: 'Preventive Care', Count: 1 },
      ],
    },
    Count: null,
    InvalidProperties: null,
  };

  //#endregion

  // #region setup

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      _practiceSettingsService = {
        getPracticeSetup: jasmine.createSpy().and.returnValue(of(response))
      };

      $provide.value('PracticeSettingsService', _practiceSettingsService);
      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);

        featureFlagService = {
            getOnce$: jasmine.createSpy().and.returnValue(false),
        }
        $provide.value('FeatureFlagService', featureFlagService);

      modalFactory = {
        Modal: jasmine.createSpy(),
      };

      $provide.value('ModalFactory', modalFactory);

      imagingMasterService = {
        getServiceStatus: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('ImagingMasterService', imagingMasterService);

      blueImagingService = {
        getUrlForPreferences: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('BlueImagingService', blueImagingService);

      imagingProviders = {
        Apteryx: 'apteryx',
        Apteryx2: 'apteryx2',
        Sidexis: 'sidexis',
      };
      $provide.value('ImagingProviders', imagingProviders);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('ClinicalSetupController', {
      $scope: scope,
      PracticeSettingsService: _practiceSettingsService,
    });
    toastrFactory = {
      error: jasmine.createSpy('toastrFactory.error'),
      success: jasmine.createSpy('toastrFactory.success'),
    };
  }));

  // #endregion

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected service', function () {
      expect(_practiceSettingsService).not.toBeNull();
    });

    it('should set default values', function () {
      expect(ctrl.inputValue).toBe('Clinical Setup');
      expect(ctrl.sections).toEqual([
        'Conditions',
        'Medical History Alerts',
        'Preventive Care',
        'Treatment Consent Letter',
        'Informed Consent Message',
        'Download Dolphin Capture Agent',
        'Blue Imaging Preferences',
        'Customize Medical History'
      ]);
      expect(scope.listIsLoading).toBe(true);
      expect(scope.idPrefix).toBe('clinical-setup-');
      expect(scope.iconClass).toBe('fa-stethoscope');
      expect(scope.header).toBe('Clinical');
    });
  });

  describe('addLinks function -> ', function () {
    beforeEach(function () {
      scope.list = response.Value.Sections;
      scope.list.push({
        Count: null,
        OtherInformation: null,
        Section: ctrl.sections[3],
      });
    });

    it('should add links to each item where applicable', function () {
      ctrl.addLinks();
      expect(scope.list[0].Link).toBe('#/BusinessCenter/Conditions/');
      expect(scope.list[1].Link).toBe('#/BusinessCenter/PatientMedicalAlerts/');
      expect(scope.list[2].Link).toBe('#/BusinessCenter/PreventiveCare/');
      expect(scope.list[3].Link).toBe(
        '#/BusinessCenter/TreatmentConsentLetter/'
      );
    });
  });

  describe('success function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'addLinks');
      ctrl.success(response);
    });

    it('should set listIsLoading to false on success', function () {
      expect(scope.listIsLoading).toBe(false);
    });

    it('should populate list on success', function () {
      expect(scope.list).toEqual(response.Value.Sections);
    });

    it('should call addLinks on success', function () {
      expect(ctrl.addLinks).toHaveBeenCalled();
    });
  });

  describe('failure function -> ', function () {
    it('should set listIsLoading to false on error', function () {
      ctrl.failure();
      expect(scope.listIsLoading).toBe(false);
    });
  });

  describe('loadList function -> ', function () {
    it('should call service', function () {
      ctrl.loadList();
      expect(
        _practiceSettingsService.getPracticeSetup
      ).toHaveBeenCalledWith(
        ctrl.inputValue,
      );
    });
  });

  describe('modalWasClosed function -> ', function () {
    it('should set modalIsOpen to false', function () {
      ctrl.modalWasClosed();
      expect(scope.modalIsOpen).toBe(false);
    });

    it('should set listIsLoading to true', function () {
      ctrl.modalWasClosed();
      expect(scope.listIsLoading).toBe(true);
    });

    it('should reset list and call loadList()', function () {
      spyOn(ctrl, 'loadList');
      ctrl.modalWasClosed();
      expect(scope.list).toEqual([]);
      expect(ctrl.loadList).toHaveBeenCalled();
    });
  });

  describe('getModifierClass function -> ', function () {
    beforeEach(function () {
      scope.list = response.Value.Sections;
    });

    it('should return complete if count is greater than zero and an empty string if count is less than or equal to zero', function () {
      angular.forEach(scope.list, function (item) {
        if (item.Section === ctrl.sections[0]) {
          expect(scope.getModifierClass(item)).toBe('complete');
        }
        if (item.Section === ctrl.sections[1]) {
          expect(scope.getModifierClass(item)).toBe('complete');
        }
        if (item.Section === ctrl.sections[2]) {
          expect(scope.getModifierClass(item)).toBe('complete');
        }
        if (item.Section === ctrl.sections[3]) {
          expect(scope.getModifierClass(item)).toBe('');
        }
      });
    });
  });

  describe('displayAdditionalContent function -> ', function () {
    beforeEach(function () {
      scope.list = response.Value.Sections;
    });

    it('should return count in parens', function () {
      angular.forEach(scope.list, function (item) {
        if (item.Section === ctrl.sections[0]) {
          expect(scope.displayAdditionalContent(item)).toBe('(603)');
        }
        if (item.Section === ctrl.sections[1]) {
          expect(scope.displayAdditionalContent(item)).toBe('(16)');
        }
        if (item.Section === ctrl.sections[2]) {
          expect(scope.displayAdditionalContent(item)).toBe('(1)');
        }
        if (item.Section === ctrl.sections[3]) {
          expect(scope.displayAdditionalContent(item)).toBe('');
        }
      });
    });
  });

  describe('displayName function -> ', function () {
    beforeEach(function () {
      scope.list = response.Value.Sections;
    });

    it('should return the display name for each item', function () {
      angular.forEach(scope.list, function (item) {
        if (item.Section === ctrl.sections[0]) {
          scope.displayName(item);
          expect(localize.getLocalizedString).toHaveBeenCalledWith(
            'Conditions'
          );
        }
        if (item.Section === ctrl.sections[1]) {
          scope.displayName(item);
          expect(localize.getLocalizedString).toHaveBeenCalledWith(
            'Medical History Alerts'
          );
        }
        if (item.Section === ctrl.sections[2]) {
          scope.displayName(item);
          expect(localize.getLocalizedString).toHaveBeenCalledWith(
            'Preventive Care'
          );
        }
        if (item.Section === ctrl.sections[3]) {
          scope.displayName(item);
          expect(localize.getLocalizedString).toHaveBeenCalledWith(
            'Treatment Consent Letter'
          );
        }
      });
    });
  });

  describe('getImagingProviders method ->', function () {
    let res = {};
    beforeEach(function () {
      res = {
        sidexis: { status: 'ready', provider: 'Sidexis', error: null },
        blue: { status: 'ready', provider: 'Blue', error: null },
      };
    });

    it('should call imagingMasterService.getServiceStatus', function () {
      ctrl.getImagingProviders();
      expect(imagingMasterService.getServiceStatus).toHaveBeenCalled();
    });

    it('should set scope.enableDCADownloadLink if imagingMasterService.getServiceStatus returns Sidexis provider', function () {
      imagingMasterService.getServiceStatus = jasmine
        .createSpy('imagingMasterService.getServiceStatus')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback(res);
            },
          };
        });
      ctrl.getImagingProviders();
      expect(scope.enableDCADownloadLink).toBe(true);
    });

    it('should call ctrl.getDolphinCaptureAgentLink if imagingMasterService.getServiceStatus returns Sidexis provider', function () {
      imagingMasterService.getServiceStatus = jasmine
        .createSpy('imagingMasterService.getServiceStatus')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback(res);
            },
          };
        });
      ctrl.getDolphinCaptureAgentLink = jasmine
        .createSpy('ctrl.getDolphinCaptureAgentLink')
        .and.callFake(function () {});
      ctrl.getImagingProviders();
      expect(ctrl.getDolphinCaptureAgentLink).toHaveBeenCalled();
    });

    it('should set scope.enableBlueImagingLink if imagingMasterService.getServiceStatus returns Blue provider', function () {
      imagingMasterService.getServiceStatus = jasmine
        .createSpy('imagingMasterService.getServiceStatus')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback(res);
            },
          };
        });
      ctrl.getImagingProviders();
      expect(scope.enableBlueImagingLink).toBe(true);
    });

    it('should call ctrl.getBlueImagingLink if imagingMasterService.getServiceStatus returns Blue provider', function () {
      imagingMasterService.getServiceStatus = jasmine
        .createSpy('imagingMasterService.getServiceStatus')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback(res);
            },
          };
        });
      ctrl.getBlueImagingLink = jasmine
        .createSpy('ctrl.getBlueImagingLink')
        .and.callFake(function () {});
      ctrl.getImagingProviders();
      expect(ctrl.getBlueImagingLink).toHaveBeenCalled();
    });
  });
});

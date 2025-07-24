import { of } from 'rsjs';

describe('patient-profile-setup -> ', function () {
  var scope, ctrl, _practiceSettingsService, location, localize, _referralManagementHttpService, cachedLocation;

  //#region mocks

  var response = {
    ExtendedStatusCode: null,
    Value: {
      SectionHeaderName: 'Patient Profile Setup',
      Sections: [
        { Section: 'Additional Identifiers', Count: 2, OtherInformation: '' },
        { Section: 'Alerts', Count: 1, OtherInformation: '' },
        { Section: 'Group Types', Count: 0, OtherInformation: '' },
        { Section: 'Referral Sources', Count: 4, OtherInformation: '' },

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
      
      _referralManagementHttpService = {
        getProviderAffiliatesForCount: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      }

      cachedLocation = {
        practiceid: 26899
      };
      $provide.value('PracticeSettingsService', _practiceSettingsService);     
      $provide.value('ReferralManagementHttpService', _referralManagementHttpService);     
       
      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);
    })  
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
    scope = $rootScope.$new();
    ctrl = $controller('PatientProfileSetupController', {
      $scope: scope,
      PracticeSettingsService: _practiceSettingsService,
      ReferralManagementHttpService: _referralManagementHttpService
    });
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
      expect(ctrl.inputValue).toBe('Patients Profile');
      expect(ctrl.sections).toEqual([
        'Additional Identifiers',
        'Alerts',
        'Group Types',
        'Referral Sources',
        'Referral Affiliates'
      ]);
      expect(scope.listIsLoading).toBe(true);
      expect(scope.idPrefix).toBe('patient-profile-setup-');
      expect(scope.iconClass).toBe('fa-user');
      expect(scope.header).toBe('Patient Profile');
    });
  });

  describe('addLinks function -> ', function () {
    beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
      scope.list = response.Value.Sections;
    }));

    it('should add links to each item where applicable', function () {
      ctrl.addLinks();
      expect(scope.list[0].Link).toBe(
        '#/BusinessCenter/PatientProfile/AdditionalIdentifiers'
      );
      expect(scope.list[1].Link).toBe('#/BusinessCenter/PatientProfile/Flags');
      expect(scope.list[2].Link).toBe(
        '#/BusinessCenter/PatientProfile/GroupTypes'
      );
      expect(scope.list[3].Link).toBe(
        '#/BusinessCenter/PatientProfile/ReferralSources'
        );
    });
  });

  describe('success function -> ', function () {
    beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
      spyOn(ctrl, 'addLinks');
      ctrl.success(response);
    }));

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
        'Patient Profile Setup'
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
    beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
      scope.list = response.Value.Sections;
    }));

    it('should return complete when count is >= 0 and inactive for placeholder', function () {
      angular.forEach(scope.list, function (item, key) {
        if (item.Section === ctrl.sections[0]) {
          expect(scope.getModifierClass(item)).toBe('complete');
        }
        if (item.Section === ctrl.sections[1]) {
          expect(scope.getModifierClass(item)).toBe('complete');
        }
        if (item.Section === ctrl.sections[2]) {
          expect(scope.getModifierClass(item)).toBe('');
        }
        if (item.Section === ctrl.sections[3]) {
          expect(scope.getModifierClass(item)).toBe('complete');
        }
      });
    });
  });

  describe('displayAdditionalContent function -> ', function () {
    beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
      scope.list = response.Value.Sections;
    }));

    it('should return count or empty string for placeholder link', function () {
      angular.forEach(scope.list, function (item, key) {
        if (item.Section === ctrl.sections[0]) {
          expect(scope.displayAdditionalContent(item)).toBe('(2)');
        }
        if (item.Section === ctrl.sections[1]) {
          expect(scope.displayAdditionalContent(item)).toBe('(1)');
        }
        if (item.Section === ctrl.sections[2]) {
          expect(scope.displayAdditionalContent(item)).toBe('(0)');
        }
        if (item.Section === ctrl.sections[3]) {
          expect(scope.displayAdditionalContent(item)).toBe('(4)');
        }
      });
    });
  });

  describe('displayName function -> ', function () {
    beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
      scope.list = response.Value.Sections;
    }));

    it('should return the correct value', function () {
      var callValue;
      angular.forEach(scope.list, function (item, key) {
        localize.getLocalizedString.calls.reset();
        if (item.Section === ctrl.sections[0]) {
          scope.displayName(item);
          callValue = 'Additional Identifiers';
        }
        if (item.Section === ctrl.sections[1]) {
          scope.displayName(item);
          callValue = 'Flags';
        }
        if (item.Section === ctrl.sections[2]) {
          scope.displayName(item);
          callValue = 'Group Types';
        }
        if (item.Section === ctrl.sections[3]) {
          scope.displayName(item);
          callValue = 'Referral Sources';
        }
        expect(localize.getLocalizedString).toHaveBeenCalledWith(callValue);
      });
    });
  });
});

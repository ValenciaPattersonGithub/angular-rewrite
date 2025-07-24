import { of } from 'rsjs';

describe('patient-accounting-setup -> ', function () {
  var scope, ctrl, _practiceSettingsService, location, localize;

  //#region mocks

  var response = {
    ExtendedStatusCode: null,
    Value: {
      SectionHeaderName: 'Patient Account Settings',
      Sections: [
        { Section: 'Adjustment Types', Count: 5, OtherInformation: '' },
        { Section: 'Discount Types', Count: 0, OtherInformation: null },
        { Section: 'Payment Types', Count: 10, OtherInformation: null },
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
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
    scope = $rootScope.$new();
    ctrl = $controller('PatientAccountingSetupController', {
      $scope: scope,
      PracticeSettingsService: _practiceSettingsService,
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
      expect(ctrl.sections).toEqual([
        'Adjustment Types',
        'Discount Types',
        'Payment Types',
        'Default Messages',
        'Bank Accounts',
      ]);
      expect(scope.listIsLoading).toBe(true);
      expect(scope.idPrefix).toBe('patient-account-setup-');
      expect(scope.iconClass).toBe('fas fa-dollar-sign');
      expect(localize.getLocalizedString).toHaveBeenCalledWith('Billing');
    });
  });

  describe('addLinks function -> ', function () {
    beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
      scope.list = response.Value.Sections;
    }));

    it('should add links to each item where applicable', function () {
      ctrl.addLinks();
      expect(scope.list[0].Link).toBe('#/Business/Billing/AdjustmentTypes/');
      expect(scope.list[1].Link).toBe('#/Business/Billing/DiscountTypes/');
      expect(scope.list[2].Link).toBe('#/Business/Billing/PaymentTypes/');
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
        'Patient Account Settings',
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
          expect(scope.getModifierClass(item)).toBe('');
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
          expect(scope.displayAdditionalContent(item)).toBe('(5)');
        }
        if (item.Section === ctrl.sections[1]) {
          expect(scope.displayAdditionalContent(item)).toBe('(0)');
        }
        if (item.Section === ctrl.sections[2]) {
          expect(scope.displayAdditionalContent(item)).toBe('(10)');
        }
      });
    });
  });

  describe('displayName function -> ', function () {
    beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
      scope.list = response.Value.Sections;
    }));

    it('should return correct values', function () {
      angular.forEach(scope.list, function (item, key) {
        if (item.Section === ctrl.sections[0]) {
          expect(scope.displayName(item)).toBe('Adjustment Types');
        }
        if (item.Section === ctrl.sections[1]) {
          expect(scope.displayName(item)).toBe('Discount Types');
        }
        if (item.Section === ctrl.sections[2]) {
          expect(scope.displayName(item)).toBe('Payment Types');
        }
      });
    });
  });
});

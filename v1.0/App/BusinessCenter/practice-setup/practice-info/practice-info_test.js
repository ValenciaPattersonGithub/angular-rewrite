import { of } from 'rsjs';

describe('practice-info -> ', function () {
  var scope, ctrl, _practiceSettingsService, localize;

  //#region mocks

  var response = {
    ExtendedStatusCode: null,
    Value: {
      SectionHeaderName: 'Practice Info',
      Sections: [
        { Section: 'Location', Count: 12 },
        { Section: 'Users', Count: 0 },
        { Section: 'Additional Identifiers', Count: 10 },
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

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('PracticeInfoController', {
      $scope: scope,
      practiceSettingsService: _practiceSettingsService,
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
      expect(ctrl.inputValue).toBe('Practice Info');
      expect(ctrl.sections).toEqual([
        'Location',
        'Practice Information',
        'Additional Identifiers',
        'Add a Location',
      ]);
      expect(scope.listIsLoading).toBe(true);
      expect(scope.idPrefix).toBe('practice-info-');
      expect(scope.iconClass).toBe('fa-building');
      expect(localize.getLocalizedString).toHaveBeenCalledWith(
        'Practice & Locations'
      );
    });
  });

  describe('addLinks function -> ', function () {
    beforeEach(function () {
      scope.list = response.Value.Sections;
    });

    it('should add links to each item where applicable', function () {
      ctrl.addLinks();
      expect(scope.list[0].Link).toBe(
        '#/BusinessCenter/PracticeSettings/Locations/'
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

    it('should set locationCount variable', function () {
      expect(ctrl.locationCount).toBe(12);
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
          expect(scope.getModifierClass(item)).toBe('complete bold');
        }
      });
    });

    it('should return inactive if there are no locations created', function () {
      scope.list[0].Count = 0;
      ctrl.locationCount = scope.list[0].Count;
      expect(scope.getModifierClass(scope.list[0])).toBe('');
    });
  });

  describe('displayAdditionalContent function -> ', function () {
    beforeEach(function () {
      scope.list = response.Value.Sections;
      scope.list[0].Count = 12;
    });

    it('should return count in parens', function () {
      ctrl.locationCount = scope.list[0].Count;
      angular.forEach(scope.list, function (item) {
        if (item.Section === ctrl.sections[0]) {
          expect(scope.displayAdditionalContent(item)).toBe('(12)');
        }
        if (item.Section === ctrl.sections[1]) {
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
          var section1Name = scope.displayName(item);
          expect(section1Name).toEqual('All Locations');
        }
        if (item.Section === ctrl.sections[1]) {
          var section2Name = scope.displayName(item);
          expect(section2Name).toEqual('Practice Information');
        }
        if (item.Section === ctrl.sections[2]) {
          var section3Name = scope.displayName(item);
          expect(section3Name).toEqual('Additional Identifiers');
        }
        if (item.Section === ctrl.sections[3]) {
          var section4Name = scope.displayName(item);
          expect(section4Name).toEqual('Add a Location');
        }
      });
    });
  });
});

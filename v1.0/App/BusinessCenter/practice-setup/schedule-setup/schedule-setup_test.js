import { of } from 'rsjs';

describe('schedule setup -> ', function () {
  var scope, ctrl, localize, featureFlagService;

  //#region mocks

  //#endregion

  // #region setup

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);
      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
    scope = $rootScope.$new();
    ctrl = $controller('ScheduleSetupController', {
      $scope: scope,
    });
  }));

  // #endregion

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set default values', function () {
      expect(ctrl.inputValue).toBe('Schedule Setup');
      expect(scope.list.length).toBe(5);
      expect(scope.list).toEqual(expect.not.stringContaining('v2'));
      expect(scope.listIsLoading).toBe(true);
      expect(scope.idPrefix).toBe('schedule-setup-');
      expect(scope.iconClass).toBe('fa-calendar-alt');
      expect(scope.header).toBe('Schedule');
      expect(localize.getLocalizedString).toHaveBeenCalledWith(
        'After adding providers, you can setup your schedule and create templates that help plan your day by appointment type.'
      );
    });
  });
});

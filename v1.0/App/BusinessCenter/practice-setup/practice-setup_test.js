describe('practice-setup -> ', function () {
  var scope, ctrl, _commonServices_, listHelper;

  //#region mocks

  var response = {
    ExtendedStatusCode: null,
    Value: {
      SectionHeaderName: 'Practice Info',
      Sections: [
        { Section: 'Location', Count: 1, OtherInformation: '' },
        { Section: 'Users', Count: 3, OtherInformation: 'True' },
      ],
    },
    Count: null,
    InvalidProperties: null,
  };

  var fuseFlag = {
    ShowPrmLinkInSettings: null
  };
  var featureFlagService = {
    getOnce$: function () {
      return {
        subscribe: function (params) { }
      }
    }
  }

  //#endregion

  // #region setup

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    ctrl = $controller('PracticeSetupController', {
      $scope: scope,
      ListHelper: listHelper,
      FuseFlag: fuseFlag,
      FeatureFlagService: featureFlagService,
    });
  }));

  // #endregion

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected service', function () {
      expect(_commonServices_).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.practiceInfoList).toEqual([]);
      expect(scope.clinicalSetupList).toEqual([]);
      expect(scope.patientAccountingSetupList).toEqual([]);
      expect(scope.scheduleSetupList).toEqual([]);
      expect(scope.patientProfileSetupList).toEqual([]);
      expect(scope.prmSettingsList).toEqual([]);
    });
  });
});

describe('UserIdentificationController tests -> ', function () {
  var scope, ctrl, $httpBackend, compile, mockStaticData, html;

  // #region mocks

  var userEditMock = {
    Value: {
      UserId: '1',
      FirstName: 'John',
      LastName: 'Doe',
      NpiTypeOne: null,
      ProviderTypeId: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
    },
  };

  var mockProviderTypes = [
    { Id: '1', Name: 'ProviderType1' },
    { Id: '2', Name: 'ProviderType2' },
    { Id: '3', Name: 'ProviderType3' },
    { Id: '4', Name: 'Not a Provider' },
    { Id: '5', Name: 'ProviderType5' },
  ];

  var mockTaxonomyCodes = [
    { TaxonomyCodeId: '1', Category: 'Category1' },
    { TaxonomyCodeId: '2', Category: 'Category2' },
    { TaxonomyCodeId: '3', Category: 'Category3' },
    { TaxonomyCodeId: '4', Category: 'Category4' },
    { TaxonomyCodeId: '5', Category: 'Category5' },
  ];

  var mockStatesCodes = [
    { StateId: '1', Name: 'Alabama', Abbreviation: 'AL' },
    { StateId: '2', Name: 'Alaska', Abbreviation: 'AK' },
    { StateId: '3', Name: 'Arizona', Abbreviation: 'AZ' },
    { StateId: '4', Name: 'Arkansas', Abbreviation: 'AR' },
    { StateId: '5', Name: 'California', Abbreviation: 'CA' },
  ];

  var staticDataMock = {
    ProviderTypes: function () {
      return {
        then: function () {
          return mockProviderTypes;
        },
      };
    },
    TaxonomyCodes: function () {
      return {
        then: function () {
          scope.taxonomyCodes = angular.copy(mockTaxonomyCodes);
          scope.primaryTaxonomyCodes = angular.copy(mockTaxonomyCodes);
          scope.secondaryTaxonomyCodes = angular.copy(mockTaxonomyCodes);
          return angular.copy(mockTaxonomyCodes);
        },
      };
    },
    States: function () {
      return {
        then: function () {
          return mockStatesCodes;
        },
      };
    },
  };

  // #endregion

  // #region setup

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('kendo.directives'));
  beforeEach(module('Soar.BusinessCenter', function ($provide) {}));

  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    scope = $rootScope.$new();
    scope.user = angular.copy(userEditMock);
    compile = $compile;
    ctrl = $controller('UserIdentificationController', {
      $scope: scope,
      StaticData: staticDataMock,
    });
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .expectGET('App/BusinessCenter/components/taxonomy-dropdown.html')
      .respond([{}]);

    html =
      '<div ng-form="userIdentificationFrm">' +
      '<input class="form-input" id="inpNpiType1" placeholder="{{ "NPI Type 1" | i18n }}" ng-m ng-model=" user.NpiTypeOne" name="inpNpiType1" ng-minlength="10" ng-maxlength="10" minlength="10" maxlength="10" type="text" numeric-only />' +
      '<input id="inpPrimaryTaxonomyCode" name="inpPrimaryTaxonomyCode" type="text" ng-model="user.PrimaryTaxonomyId" />' +
      '<input id="inpSecondaryTaxonomyCode" name="inpSecondaryTaxonomyCode" type="text" ng-model="user.SecondaryTaxonomyId" />' +
      '</div>';
    var element = compile(html)(scope);
    $rootScope.$digest();
  }));

  // #endregion

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.taxonomyCodes).not.toBeNull();
      expect(scope.primaryTaxonomyCodes).not.toBeNull();
      expect(scope.secondaryTaxonomyCodes).not.toBeNull();
      expect(scope.providerTypes).not.toBeNull();
      expect(scope.editMode).toBe(false);
      expect(scope.userIdentificationSectionOpen).toBe(true);
    });
  });

  describe('filter primary taxonomy codes -> ', function () {
    it('should remove selected secondary taxonomy code from primary list', function () {
      var secondaryTaxonomyCodeSelected = {
        Category: 'Category1',
        TaxonomyCodeId: '1',
      };
      // list should be culled by one
      var lengthBeforeSplice = scope.primaryTaxonomyCodes.length;
      scope.user.SecondaryTaxonomyId =
        secondaryTaxonomyCodeSelected.TaxonomyCodeId;
      scope.filterPrimaryTaxonomyCodes();

      expect(scope.primaryTaxonomyCodes.length).toBe(lengthBeforeSplice - 1);
      // make sure that the correct one was removed
      var foundIt = false;
      angular.forEach(
        scope.primaryTaxonomyCodes,
        function (primaryTaxonomyCode) {
          if (
            primaryTaxonomyCode.TaxonomyCodeId ===
            secondaryTaxonomyCodeSelected.TaxonomyCodeId
          ) {
            foundIt = true;
          }
        }
      );
      expect(foundIt).toBe(false);
    });

    it('should not remove anything', function () {
      var lengthBeforeSplice = scope.primaryTaxonomyCodes.length;
      scope.user.SecondaryTaxonomyId = null;
      scope.filterPrimaryTaxonomyCodes();
      expect(scope.primaryTaxonomyCodes.length).toBe(lengthBeforeSplice);
    });
  });

  describe('filter secondary taxonomy codes -> ', function () {
    it('should remove selected primary taxonomy code from secondary list', function () {
      var primaryTaxonomyCodeSelected = {
        Category: 'Category1',
        TaxonomyCodeId: '1',
      };

      // list should be culled by one
      var lengthBeforeSplice = scope.secondaryTaxonomyCodes.length;
      scope.user.PrimaryTaxonomyId = primaryTaxonomyCodeSelected.TaxonomyCodeId;
      scope.filterSecondaryTaxonomyCodes();

      expect(scope.secondaryTaxonomyCodes.length).toBe(lengthBeforeSplice - 1);

      // make sure that the correct one was removed
      var foundIt = false;
      angular.forEach(
        scope.secondaryTaxonomyCodes,
        function (secondaryTaxonomyCode) {
          if (
            secondaryTaxonomyCode.TaxonomyCodeId ===
            primaryTaxonomyCodeSelected.TaxonomyCodeId
          ) {
            foundIt = true;
          }
        }
      );
      expect(foundIt).toBe(false);
    });

    it('should not remove anything', function () {
      var lengthBeforeSplice = scope.secondaryTaxonomyCodes.length;
      scope.user.PrimaryTaxonomyId = null;
      scope.filterSecondaryTaxonomyCodes();
      expect(scope.secondaryTaxonomyCodes.length).toBe(lengthBeforeSplice);
    });
  });

  describe('hasViewProviderInfoAccess ->', function () {
    it('should return the result of the authorization check', function () {
      ctrl.checkAuthorization = jasmine.createSpy().and.returnValue(true);

      var result = ctrl.hasViewProviderInfoAccess();

      expect(ctrl.checkAuthorization).toHaveBeenCalledWith(
        'soar-biz-bizusr-vwprov'
      );
      expect(result).toEqual(true);
    });
  });

  describe('hasEditProviderInfoAccess ->', function () {
    it('should return the result of the authorization check', function () {
      ctrl.checkAuthorization = jasmine.createSpy().and.returnValue(true);

      var result = ctrl.hasEditProviderInfoAccess();

      expect(ctrl.checkAuthorization).toHaveBeenCalledWith(
        'soar-biz-bizusr-etprov'
      );
      expect(result).toEqual(true);
    });
  });

  //describe('checkAuthorization ->', function () {
  //	it('should return the result of patSecurityService.IsAuthorizedByAbbreviation for a given amfa', function () {
  //		var result = ctrl.checkAuthorization("some amfa");

  //		expect(_authPatSecurityService_.isAmfaAuthorizedByName).toHaveBeenCalled();
  //		expect(result).toEqual(true);
  //	});
  //});

  describe('isProvider ->', function () {
    it('should return true when User is a Dentist (1)', function () {
      var ofcLocation = { ProviderTypeId: 1 };
      var result = ctrl.isProvider(ofcLocation);

      expect(result).toBe(true);
    });

    it('should return true when User is a Hygienist (2)', function () {
      var ofcLocation = { ProviderTypeId: 2 };
      var result = ctrl.isProvider(ofcLocation);

      expect(result).toBe(true);
    });

    it('should return true when User is an Assistant (3)', function () {
      var ofcLocation = { ProviderTypeId: 3 };
      var result = ctrl.isProvider(ofcLocation);

      expect(result).toBe(true);
    });

    it('should return false when User is NOT Provider of Service', function () {
      var ofcLocation = { ProviderTypeId: 4 };
      var result = ctrl.isProvider(ofcLocation);

      expect(result).toBe(false);
    });

    it('should return true when User is an Other (5)', function () {
      var ofcLocation = { ProviderTypeId: 5 };
      var result = ctrl.isProvider(ofcLocation);

      expect(result).toBe(true);
    });

    it('should return false when User is invalid (0)', function () {
      var ofcLocation = { ProviderTypeId: 0 };
      var result = ctrl.isProvider(ofcLocation);

      expect(result).toBe(false);
    });

    it('should return false when User is an undefined type (6)', function () {
      var ofcLocation = { ProviderTypeId: 6 };
      var result = ctrl.isProvider(ofcLocation);

      expect(result).toBe(false);
    });
  });

  describe('checkIfUserIsProviderOfService ->', function () {
    it('should return false when userLocationSetups is an empty array', function () {
      scope.userLocationSetups = {};

      var result = ctrl.checkIfUserIsProviderOfService();

      expect(result).toBe(false);
    });

    it('should return true when userLocationSetups has a provider in the first position', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 1 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
      ];

      var result = ctrl.checkIfUserIsProviderOfService();

      expect(result).toBe(true);
    });

    it('should return true when userLocationSetups has a provider in the a middle position', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 1 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
      ];

      var result = ctrl.checkIfUserIsProviderOfService();

      expect(result).toBe(true);
    });

    it('should return true when userLocationSetups has a provider in the last position', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 1 },
      ];

      var result = ctrl.checkIfUserIsProviderOfService();

      expect(result).toBe(true);
    });

    it('should return false when userLocationSetups has no providers of service in the array', function () {
      scope.userLocationSetups = [
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 4 },
      ];

      var result = ctrl.checkIfUserIsProviderOfService();

      expect(result).toBe(false);
    });
  });

  describe('$scope.$on("fuse:user-rx-changed") ->', function () {
    it('should call $scope.modalInstance.close();', function () {
      var listener = jasmine.createSpy();
      scope.isPrescribingUser = false;
      scope.$broadcast('fuse:user-rx-changed', { roles: [{ value: 1 }] });
      expect(scope.isPrescribingUser).toBe(true);
    });

    it('should call $scope.modalInstance.close();', function () {
      var listener = jasmine.createSpy();
      scope.isPrescribingUser = true;
      scope.$broadcast('fuse:user-rx-changed', { roles: [{ value: 2 }] });
      expect(scope.isPrescribingUser).toBe(false);
    });
  });
});

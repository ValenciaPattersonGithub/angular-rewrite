describe('UserGroupsController tests -> ', function () {
  var scope, ctrl, compile, patientValidationFactory;

  // #region mocks

  var userEditMock = {
    Value: {
      UserId: '1',
      FirstName: 'John',
      LastName: 'Doe',
      ProviderTypeId: null,
    },
  };

  var mockSelectedHygienistDepartment = {
    value: function () {
      return '1';
    },
    text: function () {
      return 'Hygienist';
    },
  };

  var mockProviderTypes = [
    { Id: '1', Name: 'ProviderType1' },
    { Id: '2', Name: 'ProviderType2' },
    { Id: '3', Name: 'ProviderType3' },
    { Id: '4', Name: 'Not a Provider' },
    { Id: '5', Name: 'ProviderType5' },
  ];

  var mockSelectedExecutiveDepartment = {
    value: function () {
      return '4';
    },
    text: function () {
      return 'Executive';
    },
  };

  // #endregion

  // #region setup

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientValidationFactory = {};
      $provide.value('PatientValidationFactory', patientValidationFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    scope = $rootScope.$new();
    scope.user = userEditMock.Value;

    compile = $compile;
    ctrl = $controller('UserGroupsController', {
      $scope: scope,
    });
  }));

  // #endregion

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.userGroupsSectionOpen).toBe(true);
      expect(scope.providerTypes).not.toBeNull();
      expect(scope.departmentTypes).not.toBeNull();
      expect(scope.editMode).toBe(false);
      expect(scope.user.Color).toEqual('#7F7F7F');
    });
  });

  describe('department change -> ', function () {
    it('should call setProviderType', function () {
      // TODO - need to mock a kendo combobox, etc.
      // scope.departmentTypeChanged();
    });
  });

  describe('provider type change -> ', function () {
    it('should call setSectionView', function () {
      // TODO - need to mock a kendo combobox, etc.
      // scope.providerTypeChanged();
    });
  });

  describe('setting provider type -> ', function () {
    it('should set provider type automatically when specific departments are selected', function () {
      scope.editMode = false;
      // TODO - need to mock a kendo combobox, etc.
      // scope.setProviderType(mockSelectedHygienistDepartment);
    });

    it('should not set provider type automatically for this department type', function () {
      scope.editMode = false;
      scope.user.ProviderTypeId = null;
      scope.setProviderType(mockSelectedExecutiveDepartment);
      expect(scope.user.ProviderTypeId).toBe(null);
    });
  });

  describe('set defaults -> ', function () {
    it('should set provider type on user object to 4', function () {
      scope.providerTypes = mockProviderTypes;
      scope.editMode = false;
      scope.user.ProviderTypeId = null;
      scope.setDefaults();
      expect(scope.user.ProviderTypeId).toBe('4');
    });
  });

  describe('set section view -> ', function () {
    it('should show id section for all of these types of providers', function () {
      scope.setSectionView(1);
      expect(scope.showIdentificationSection).toBe(true);
      scope.setSectionView(2);
      expect(scope.showIdentificationSection).toBe(true);
      scope.setSectionView(3);
      expect(scope.showIdentificationSection).toBe(true);
      scope.setSectionView(5);
      expect(scope.showIdentificationSection).toBe(true);
    });

    it('should hide id section for any other providers', function () {
      scope.setSectionView(0);
      expect(scope.showIdentificationSection).toBe(false);
      scope.setSectionView(4);
      expect(scope.showIdentificationSection).toBe(false);
    });
  });
});

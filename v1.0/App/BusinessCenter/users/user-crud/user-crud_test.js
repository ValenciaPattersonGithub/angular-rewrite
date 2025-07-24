describe('user-crud -> ', function () {
  var scope, ctrl, element, compile, location, userServices, modalFactory;
  var teamMemberIdentifierService,
    referenceDataService,
    toastrFactory,
    featureService,
    timeZoneFactory;
  var rxUserType,
    userLocationsSetupFactory,
    timeout,
    rootScope,
    rolesFactory,
    rxService;

  //#region mocks
  var providerTypesMock = {
    Value: [
      { Name: 'option1', ProviderTypeId: 1 },
      { Name: 'option2', ProviderTypeId: 2 },
    ],
  };
  var userNewMock = {
    $$locations: [
      {
        Location: { LocationId: 1 },
        Roles: [{ RoleId: 3 }],
        EnableSchedule: true,
      },
    ],
    $$originalUserLocationRoles: [],
    $$selectedLocations: [],
    $$originalUserScheduleLocations: [],
    $$selectedPracticeRoles: [],
    $$originalSelectedPracticeRoles: [],
    UserId: '',
    UserName: 'francis@pattcom.onmicrosoft.com',
    FirstName: null,
    LastName: null,
    Address: {},
  };
  var userAddMock = {
    $$locations: [],
    $originalUserLocationRoles: [],
    $$selectedLocations: [],
    $$originalUserScheduleLocations: [],
    $$selectedPracticeRoles: [],
    $$originalSelectedPracticeRoles: [],
    UserId: '',
    UserName: 'francis@pattcom.onmicrosoft.com',
    FirstName: 'John',
    LastName: 'Doe',
  };
  var userEditMock = {
    $$location: [],
    $originalUserLocationRoles: [],
    $$selectedLocations: [],
    $$originalUserScheduleLocations: [],
    $$selectedPracticeRoles: [{ RoleId: 3, RoleName: 'Test Role' }],
    $$originalSelectedPracticeRoles: [
      { RoleId: 1, RoleName: 'Test Role 2' },
      { RoleId: 2, RoleName: 'Test Role 3' },
    ],
    UserId: '1',
    UserName: 'francis@pattcom.onmicrosoft.com',
    FirstName: 'John',
    LastName: 'Doe',
  };

  var statesMock = { Value: [] };
  var taxonomyCodesMock = { Value: [] };
  var staticDataMock = {
    TaxonomyCodes: function () {
      return {
        then: function () {
          return taxonomyCodesMock;
        },
      };
    },
    ProviderTypes: function () {
      return {
        then: function () {
          return providerTypesMock;
        },
      };
    },
    States: function () {
      return {
        then: function () {
          return statesMock;
        },
      };
    },
  };
  var taxonomyDropdownTemplate = '';
  var soarConfigMock = {
    idaTenant: 'pattcom.onmicrosoft.com',
  };
  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      userLocationsSetupFactory = {
        SaveUserLocationSetups: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
      };
      $provide.value('UserLocationsSetupFactory', userLocationsSetupFactory);

      rolesFactory = {
        Roles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        UserPracticeRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        UserLocationRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        ProcessUserLocationRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        ProcessUserPracticeRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        UserRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        AddInactiveUserAssignedRoles: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
      };
      $provide.value('RolesFactory', rolesFactory);

      userServices = {
        Users: {
          update: jasmine
            .createSpy()
            .and.returnValue({ Value: { UserId: '1234' } }),
          save: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
        UserScheduleLocation: {
          get: jasmine.createSpy(),
          update: jasmine.createSpy(),
        },
        Roles: {
          deleteRole: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
          assignRole: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
          assignRoleByLocation: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
          deleteRoleByLocation: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
        UsersScheduleStatus: {
          get: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
        RxAccess: {
          save: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
        UserRxType: {
          update: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        },
      };
      $provide.value('UserServices', userServices);

      location = {
        path: jasmine.createSpy(),
      };
      $provide.value('$location', location);
      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        forceEntityExecution: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      modalFactory = {
        ConfirmModal: jasmine
          .createSpy()
          .and.returnValue({ then: jasmine.createSpy() }),
        CancelModal: jasmine
          .createSpy()
          .and.returnValue({ then: jasmine.createSpy() }),
      };

      $provide.value('ModalFactory', modalFactory);

      teamMemberIdentifierService = {
        teamMemberIdentifier: jasmine.createSpy().and.callFake(function () {
          return { then: jasmine.createSpy() };
        }),
      };
      $provide.value(
        'TeamMemberIdentifierService',
        teamMemberIdentifierService
      );
      featureService = {
        isEnabled: jasmine
          .createSpy()
          .and.returnValue({
            then: jasmine.createSpy().and.returnValue(false),
          }),
      };

      timeZoneFactory = {
        GetTimeZoneAbbr: jasmine.createSpy(),
        ConvertDateTZ: jasmine.createSpy(),
      };
      $provide.value('TimeZoneFactory', timeZoneFactory);

      rxService = {};
      $provide.value('RxService', rxService);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    compile = $compile;

    $rootScope.patAuthContext = { userInfo: '' };

    rxUserType = {
      ProxyUser: 'ProxyUser',
      PrescribingUser: 'PrescribingUser',
      RxAdminUser: 'PracticeAdmin',
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };
    rootScope = $rootScope;
    scope = $rootScope.$new();
    sessionStorage.setItem('userLocation', '{}');
    timeout = $injector.get('$timeout');
    scope.taxonomyDropdownTemplateData = taxonomyDropdownTemplate;
    scope.currentUserData = userNewMock;
    ctrl = $controller('UserCrudController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      currentUser: userNewMock,
      StaticData: staticDataMock,
      SoarConfig: soarConfigMock,
      RxUserType: rxUserType,
      toastrFactory: toastrFactory,
      FeatureService: featureService,
      TeamMemberIdentifierService: teamMemberIdentifierService,
    });
  }));

  //#region html mock

  var loadHtml = function () {
    element = angular.element(
      '<form name="frmUserCrud" role="form" novalidate>' +
        '<div ng-class="{error:hasErrors && !frmUserCrud.inpFirstName.$valid}">' +
        '   <input id="inpFirstName" class="form-input required valid" set-focus ng-model="user.FirstName" name="inpFirstName" maxlength="64" required alpha-only />' +
        '</div>' +
        '<div ng-class="{error:hasErrors && !frmUserCrud.inpLastName.$valid}">' +
        '   <input id="inpLastName" class="form-input required valid" set-focus ng-model="user.LastName" name="inpLastName" maxlength="64" required alpha-only />' +
        '</div>' +
        '<div ng-class="{error:hasErrors && !frmUserCrud.inpEmailAddress.$valid}">' +
        '   <input id="inpEmailAddress" class="form-input required valid" set-focus ng-model="user.EmailAddress" name="inpEmailAddress" maxlength="64"  valid-email />' +
        '</div>' +
        '<div class="col-xs-12 col-sm-7 col-md-5 col-lg-5" ng-class="{error:hasErrors &&!frmUserCrud.inpUserName.$valid}">' +
        '    <input class="form-input" id="inpUserName" placeholder="{{ "Username" | i18n }}" ng-model="user.UserName" name="inpUserName" ng-minlength="6" ng-maxlength="50" type="text" required alpha-numeric />' +
        '</div>' +
        '<div ng-class="{error:hasErrors && !frmUserCrud.inpZip.$valid}">' +
        '   <input id="inpZip" zip-field="user.ZipCode" type="text" onfocus="this.value = this.value;" class="form-input" name="inpZip" ng-model="user.ZipCode" maxlength="10" minlength="5" />' +
        '</div>'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
  };

  var setHTMLValues = function () {
    // Find the input control:
    var inpFirstName = element.find('#inpFirstName');
    var inpLastName = element.find('#inpLastName');
    var inpEmailAddress = element.find('#inpEmailAddress');
    var inpZipCode = element.find('#inpZip');
    var inpUserName = element.find('#inpUserName');
    var inpEmail = element.find('#inpEmailAddress');
    scope.validIds = true;
    scope.validTaxId = true;
    scope.validPhones = true;
    scope.validDob = true;
    scope.validStartDate = true;

    // Set some text!
    angular.element(inpFirstName).val('John').trigger('input');
    angular.element(inpLastName).val('Doe').trigger('input');
    angular.element(inpEmailAddress).val('a@a.com').trigger('input');
    angular.element(inpZipCode).val('62401').trigger('input');
    angular.element(inpUserName).val('jdoedoe').trigger('input');
    angular.element(inpEmail).val('jdoe@mchsi.com').trigger('input');
  };
  //#endregion

  it('should set scope properties', function () {
    expect(scope.personalInfoSectionOpen).toBe(true);
    expect(scope.contactInfoSectionOpen).toBe(true);
    expect(scope.hasErrors).toBeFalsy();
    expect(scope.user).toEqual(userNewMock);
    expect(scope.validDob).toBe(true);
    expect(scope.validStartDate).toBe(true);
    expect(scope.validPhones).toBe(true);
    expect(scope.formIsValid).toBe(true);
    expect(scope.usernameMaxLength).toBe(255);
    expect(scope.userNameValid).toBe(true);
  });

  describe('hasAccessForSave function -> ', function () {
    it('should return true if authorization is there for create accesss if edit mode is false', function () {
      scope.authUserCreateAccess = jasmine.createSpy().and.returnValue(true);
      scope.editMode = false;
      ctrl.hasAccessForSave();
      expect(scope.hasAccess).toEqual(true);
    });

    it('should return true if authorization is there for edit access and edit mode is true', function () {
      scope.authUserEditAccess = jasmine.createSpy().and.returnValue(true);
      scope.editMode = true;
      ctrl.hasAccessForSave();
      expect(scope.hasAccess).toEqual(true);
    });
  });

  describe('loginTimesChange function -> ', function () {
    it('should set userLoginTimes and hasInvalidTimes to true when loginTimeList has any invalid times', function () {
      scope.hasInvalidTimes = false;
      scope.loginTimesChange([{ IsValid: false }, { IsValid: true }]);

      expect(scope.hasInvalidTimes).toEqual(true);
    });

    it('should set userLoginTimes and hasInvalidTimes to false when loginTimeList has no invalid times', function () {
      scope.hasInvalidTimes = false;
      scope.loginTimesChange([{ IsValid: true }, { IsValid: true }]);

      expect(scope.hasInvalidTimes).toEqual(false);
    });
  });

  describe('cancelChanges function -> ', function () {
    describe('when ctrl has changes', function () {
      it('should call modalFactory.CancelModal', function () {
        ctrl.hasChanges = true;
        scope.userLocationSetupsDataChanged = false;
        scope.cancelChanges();
        expect(modalFactory.CancelModal).toHaveBeenCalled();
      });
    });

    describe('when ctrl has no changes', function () {
      it('should call scope.confirmCancel', function () {
        ctrl.hasChanges = false;
        scope.userLocationSetupsDataChanged = false;
        spyOn(scope, 'confirmCancel');
        scope.cancelChanges();
        expect(scope.confirmCancel).toHaveBeenCalled();
      });
    });

    describe('when ctrl has no changes but scope.userLocationSetupsDataChanged does ', function () {
      it('should call modalFactory.CancelModal', function () {
        ctrl.hasChanges = false;
        scope.userLocationSetupsDataChanged = true;
        scope.cancelChanges();
        expect(modalFactory.CancelModal).toHaveBeenCalled();
      });
    });
  });

  describe('confirmCancel function -> ', function () {
    it('should redirect back to location landing page when called', function () {
      scope.confirmCancel();

      expect(location.path).toHaveBeenCalledWith('BusinessCenter/Users/');
    });
  });

  describe('validatePanel function -> ', function () {
    beforeEach(function () {
      var temp = scope.validatePanel;
      scope.validatePanel = function () {};

      loadHtml();
      setHTMLValues();

      scope.validatePanel = temp;
      scope.frmUserCrud.userIdentificationFrm = {
        inpPrimaryTaxonomyCode: { $valid: true },
        inpSecondaryTaxonomyCode: { $valid: true },
      };
      scope.frmUserCrud.userRoleForm = {
        $valid: true,
      };
    });

    it('should return formIsValid true when all user form values are valid ', function () {
      var inpUserName = element.find('#inpUserName');

      angular
        .element(inpUserName)
        .val('francis@pattcom.onmicrosoft.com')
        .trigger('input');
      scope.$apply();
      scope.updatedLicenses = [
        {
          UserId: scope.user.UserId,
        },
      ];

      scope.validatePanel(scope.frmUserCrud);

      expect(scope.formIsValid).toBeTruthy();
    });

    it('should return inpFirstName.$valid false when first name is null because it is required', function () {
      var inpFirstName = element.find('#inpFirstName');

      angular.element(inpFirstName).val(null).trigger('input');
      scope.$apply();

      scope.validatePanel(scope.frmUserCrud);

      expect(scope.frmUserCrud.inpFirstName.$valid).toBeFalsy();
    });

    it('should return inpLastName.$valid false when last name is null becuase it is required', function () {
      var inpLastName = element.find('#inpLastName');

      angular.element(inpLastName).val(null).trigger('input');
      scope.$apply();

      scope.validatePanel(scope.frmUserCrud);

      expect(scope.frmUserCrud.inpLastName.$valid).toBeFalsy();
    });

    it('should set formIsValid to false when validDob is false', function () {
      scope.validDob = false;
      scope.validatePanel(scope.frmUserCrud);

      expect(scope.formIsValid).toBeFalsy();
    });

    it('should set formIsValid to false when validStartDate is false', function () {
      scope.validStartDate = false;
      scope.validatePanel(scope.frmUserCrud);

      expect(scope.formIsValid).toBeFalsy();
    });

    it('should return inpEmailAddress.$valid false when email is invalid', function () {
      var inpEmailAddress = element.find('#inpEmailAddress');

      angular.element(inpEmailAddress).val('a@a').trigger('input');
      scope.$apply();

      scope.validatePanel(scope.frmUserCrud);

      expect(scope.frmUserCrud.inpEmailAddress.$valid).toBeFalsy();
    });

    it('should return inpZip.$valid false when email is invalid', function () {
      var inpZip = element.find('#inpZip');

      angular.element(inpZip).val('624').trigger('input');
      scope.$apply();

      scope.validatePanel(scope.frmUserCrud);

      expect(scope.frmUserCrud.inpZip.$valid).toBeFalsy();
    });
  });

  describe('savePhones function -> ', function () {
    it('should call userContactsService.save function', function () {});
  });

  describe('saveUser method after successful save when in editMode -> ', function () {
    var res = {};
    beforeEach(inject(function () {
      scope.user = { UserId: '1234', Address: {}, $$UserPracticeRoles: [] };
      scope.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }] },
        { LocationId: 2, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }] },
      ];

      scope.userCreateDto = { PracticeRoles: [], LocationRoles: [] };

      scope.editMode = true;
      scope.formIsValid = true;

      scope.validatePanel = jasmine.createSpy().and.returnValue(true);
      spyOn(scope, 'validatePrescribingUser').and.callFake(function () {});
      spyOn(ctrl, 'validateUserLocationSetups').and.callFake(function () {});
      spyOn(ctrl, 'validateUserPracticeRoles').and.callFake(function () {});

      // mock for returned value after userServices.Users.update is successful
      res = { Value: { UserId: '1234', Address: {}, $$UserPracticeRoles: [] } };
      userServices.Users.update = function (data, success) {
        success(res);
      };
    }));

    it('should call userLocationsSetupFactory.SaveUserLocationSetups', function () {
      scope.saveUser();
      expect(
        userLocationsSetupFactory.SaveUserLocationSetups
      ).toHaveBeenCalledWith(ctrl.userLocationSetups);
    });
    it('should call rolesFactory.ProcessUserLocationRoles', function () {
      scope.saveUser();
      expect(rolesFactory.ProcessUserLocationRoles).toHaveBeenCalledWith(
        ctrl.userLocationSetups,
        scope.user.UserId
      );
    });
    it('should call rolesFactory.ProcessUserPracticeRoles', function () {
      scope.saveUser();
      expect(rolesFactory.ProcessUserPracticeRoles).toHaveBeenCalledWith(
        scope.user
      );
    });
  });

  describe('saveUser function -> ', function () {
    beforeEach(inject(function () {
      scope.validatePanel = jasmine.createSpy().and.returnValue(true);
      spyOn(scope, 'validatePrescribingUser').and.callFake(function () {});
      spyOn(ctrl, 'validateUserLocationSetups').and.callFake(function () {});
      spyOn(ctrl, 'validateUserPracticeRoles').and.callFake(function () {});
      loadHtml();
      setHTMLValues();
      scope.formIsValid = true;
      scope.user = { UserId: '1234', Address: {}, $$UserPracticeRoles: [] };
      scope.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }] },
        { LocationId: 2, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }] },
      ];
      scope.userCreateDto = { PracticeRoles: [], LocationRoles: [] };
    }));

    it('should set scope properties', function () {
      scope.saveUser();
      expect(scope.savingUser).toBe(true);
      expect(scope.formIsValid).toBe(true);
    });

    it('should have called validatePanel function', function () {
      scope.saveUser();
      expect(scope.validatePanel).toHaveBeenCalled();
    });

    it('should call userServices.update service when editMode is true', function () {
      scope.editMode = true;
      scope.saveUser();
      expect(userServices.Users.update).toHaveBeenCalled();
    });

    it('should call userServices.save service when editMode is false', function () {
      scope.editMode = false;
      scope.saveUser();
      expect(userServices.Users.save).toHaveBeenCalled();
    });

    it('should set savingUser to false when hasErrors is true', function () {
      scope.formIsValid = false;
      scope.saveUser();
      expect(scope.savingUser).toBe(false);
    });

    it('should call ctrl.validateUserLocationSetups', function () {
      scope.formIsValid = true;
      scope.saveUser();
      expect(ctrl.validateUserLocationSetups).toHaveBeenCalled();
    });

    it('should call ctrl.validateUserPracticeRoles', function () {
      scope.formIsValid = true;
      scope.saveUser();
      expect(ctrl.validateUserPracticeRoles).toHaveBeenCalled();
    });

    // if editMode, tests in see tests saveUser method after successful save when in editMode
    // if new ....
    it('should set userCreateDto.PracticeRoles based on user.$$UserPracticeRoles if not editMode', function () {
      scope.practiceId = 3;
      scope.userLocationSetups = [];
      scope.user.UserId = null;
      scope.formIsValid = true;
      scope.editMode = false;
      scope.saveUser();
    });
    it('should set userCreateDto.LocationRoles based on userLocationSetup.$$UserLocationRolesRoles if not editMode', function () {
      scope.practiceId = 3;
      scope.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }] },
        { LocationId: 2, $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }] },
      ];
      scope.user.UserId = null;
      scope.formIsValid = true;
      scope.editMode = false;
      scope.saveUser();
    });
  });

  describe('usersSaveSuccess function -> ', function () {
    it('should set scope properties', function () {
      scope.usersSaveSuccess({ Value: userAddMock }, null, null, userEditMock);

      expect(scope.user).toEqual(userAddMock);
    });
  });

  describe('userSaveFailure function -> ', function () {
    it('should set scope properties', function () {
      scope.usersSaveFailure({ data: {} }, '');

      expect(scope.savingUser).toBe(false);
    });

    it('should call toastrFactory.error function', function () {
      scope.usersSaveFailure({ data: {} }, '');

      expect(toastrFactory.error).toHaveBeenCalled();
    });

    describe('duplicate username error handling -> ', function () {
      var error;
      beforeEach(inject(function () {
        error = {
          data: {
            InvalidProperties: [],
          },
        };
      }));

      it('should set userNameValid to false if we get back the username is not unique message', function () {
        var property = {
          ValidationMessage:
            '{"Result":{"Errors":[{"AttemptedValue":"ted3334","CustomState":null,"ValidationMessage":"Name must be unique","PropertyName":"UserName"}]}}',
        };
        error.data.InvalidProperties.push(property);
        scope.usersSaveFailure(error, '');
        expect(scope.userNameValid).toBe(false);
      });

      it('should not set userNameValid to false if we get back a different message', function () {
        var property = {
          ValidationMessage:
            '{"Result":{"Errors":[{"AttemptedValue":"ted3334","CustomState":null,"ValidationMessage":"Some other error","PropertyName":"Something"}]}}',
        };
        error.data.InvalidProperties.push(property);
        scope.usersSaveFailure(error, '');
        expect(scope.userNameValid).toBe(true);
      });

      it('should not set userNameValid to false if we dont get back the not unique message', function () {
        error.data = {};
        scope.usersSaveFailure(error, '');
        expect(scope.userNameValid).toBe(true);
      });
    });
  });

  describe('authUserCreateAccess ->', function () {
    it('should return the result of the authorization check', function () {
      ctrl.checkAuthorization = jasmine.createSpy().and.returnValue(true);
      var result = scope.authUserCreateAccess();
      expect(result).toEqual(true);
    });
  });

  describe('authUserEditAccess ->', function () {
    it('should return the result of the authorization check', function () {
      ctrl.checkAuthorization = jasmine.createSpy().and.returnValue(true);

      var result = scope.authUserEditAccess();

      expect(ctrl.checkAuthorization).toHaveBeenCalledWith(
        'soar-biz-bizusr-edit'
      );
      expect(result).toEqual(true);
    });
  });

  describe('checkAuthorization ->', function () {
    it('should return the result of patSecurityService.IsAuthorizedByAbbreviation for a given amfa', function () {
      var result = ctrl.checkAuthorization('soar-biz-bizusr-add');

      expect(
        _authPatSecurityService_.isAmfaAuthorizedByName
      ).toHaveBeenCalled();
      expect(result).toEqual(true);
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

  describe('authAccess ->', function () {
    beforeEach(function () {
      scope.authUserEditAccess = jasmine.createSpy().and.returnValue(true);
      scope.authUserCreateAccess = jasmine.createSpy().and.returnValue(true);
    });

    it('should redirect to the home page when not authorized to create a user', function () {
      scope.authUserEditAccess = jasmine.createSpy().and.returnValue(false);
      scope.editMode = true;

      scope.authAccess();

      expect(location.path).toHaveBeenCalledWith('/');
    });

    it('should redirect to the home page when not authorized to create a user', function () {
      scope.authUserCreateAccess = jasmine.createSpy().and.returnValue(false);
      scope.editMode = false;

      scope.authAccess();

      expect(location.path).toHaveBeenCalledWith('/');
    });
  });

  describe('updateRxAccess ->', function () {
    it('should call createRxUser if rxAccessEnum equals a rxUserType', function () {
      spyOn(ctrl, 'createRxUser');
      scope.rxAccessEnum = rxUserType.PrescribingUser;
      ctrl.updateRxAccess();
      expect(ctrl.createRxUser).toHaveBeenCalled();
    });

    it('should call createRxUser if rxAccessEnum equals a rxUserType', function () {
      spyOn(ctrl, 'createRxUser');
      scope.rxAccessEnum = null;
      ctrl.updateRxAccess();
      expect(ctrl.createRxUser).not.toHaveBeenCalled();
    });
  });

  describe('validatePrescribingUser ->', function () {
    beforeEach(function () {
      scope.user = angular.copy(userEditMock);
    });
    
      beforeEach(function () {        
      });
     

      it('should not set formIsValid if rxSettings is null', function () {        
        scope.rxSettings = null;
        scope.formIsValid = true;
        scope.validatePrescribingUser(scope.user);
        expect(scope.formIsValid).toBe(true);
      });

      it('should not set formIsValid if rxSettings is not invalid', function () {        
        scope.rxSettings = { invalid: false };
        scope.formIsValid = true;
        scope.validatePrescribingUser(scope.user);
        expect(scope.formIsValid).toBe(true);
      });

      it('should not set formIsValid if rxSettings is not invalid', function () {        
        scope.rxSettings = { invalid: true };
        scope.formIsValid = true;
        scope.validatePrescribingUser(scope.user);
        expect(scope.formIsValid).toBe(false);
      });

      it('should set formIsValid to false when rxSettings roles contains prescribing role and no DeaNumber', function () {        
        scope.rxSettings = { invalid: false, roles: [{ value: 1 }] };
        scope.user.DeaNumber = null;
        scope.user.NpiTypeOne = 1234;
        scope.user.TaxId = 1234;
        scope.formIsValid = true;
        scope.validatePrescribingUser(scope.user);
        expect(scope.formIsValid).toBe(false);
      });

      it('should set formIsValid to false when rxSettings roles contains prescribing role and no NpiTypeOne', function () {        
        scope.rxSettings = { invalid: false, roles: [{ value: 1 }] };
        scope.user.DeaNumber = 1234;
        scope.user.NpiTypeOne = null;
        scope.user.TaxId = 1234;
        scope.formIsValid = true;
        scope.validatePrescribingUser(scope.user);
        expect(scope.formIsValid).toBe(false);
      });

      it('should set formIsValid to false when rxSettings roles contains prescribing role and no TaxId', function () {        
        scope.rxSettings = { invalid: false, roles: [{ value: 1 }] };
        scope.user.DeaNumber = 1234;
        scope.user.NpiTypeOne = 1234;
        scope.user.TaxId = null;
        scope.formIsValid = true;
        scope.validatePrescribingUser(scope.user);
        expect(scope.formIsValid).toBe(false);
      });    
  });

  describe('rxAccessSuccess method ->', function () {
    /*        it('should set doDisplayRxInfo to false if it is true', function () {
            scope.doRxCheckOnPageLoad = false;
            scope.doDisplayRxInfo = true;
            scope.rxAccessSuccess();
            expect(scope.doDisplayRxInfo).toBe(false);
        });

        it('should call toastrFactory.success if doDisplayRxInfo is true', function () {
            scope.doRxCheckOnPageLoad = false;
            scope.doDisplayRxInfo = true;
            scope.rxAccessSuccess();
            expect(toastrFactory.success).toHaveBeenCalled();
        });

        it('should set doRxCheckOnPageLoad to false if it is true', function () {
            scope.doRxCheckOnPageLoad = false;
            scope.doDisplayRxInfo = true;
            scope.rxAccessSuccess();
            expect(scope.doRxCheckOnPageLoad).toBe(false);
        });
*/
  });

  describe('watch openUploader', function () {
    beforeEach(function () {
      spyOn(ctrl, 'checkRxAccess');
      scope.rolesStatus = { Loaded: false };
      loadHtml();
    });

    //it('should do nothing if newvalue is false', function () {
    //    scope.$apply();
    //    expect(ctrl.checkRxAccess).not.toHaveBeenCalled();
    //});

    it('should call checkRxStatus if newvalue is true', function () {
      scope.rolesStatus = { Loaded: true };
      scope.$apply();
      expect(ctrl.checkRxAccess).toHaveBeenCalled();
    });
  });

  describe('setRxAccessEnum method', function () {
    it('should set rxAccessEnum based on rxUserType', function () {
      scope.user.RxUserType = 1;
      ctrl.setRxAccessEnum();
      expect(scope.rxAccessEnum).toEqual(rxUserType.PrescribingUser);

      scope.user.RxUserType = 2;
      ctrl.setRxAccessEnum();
      expect(scope.rxAccessEnum).toEqual(rxUserType.ProxyUser);

      scope.user.RxUserType = 3;
      ctrl.setRxAccessEnum();
      expect(scope.rxAccessEnum).toEqual(rxUserType.RxAdminUser);

      scope.user.RxUserType = null;
      ctrl.setRxAccessEnum();
      expect(scope.rxAccessEnum).toEqual(null);
    });
  });

  describe('checkRxAccess method', function () {
    beforeEach(function () {
      spyOn(ctrl, 'updateRxAccess');
      spyOn(ctrl, 'setRxLocationIdsForLocationRoles');
      spyOn(ctrl, 'setRxAccessEnum');
      spyOn(ctrl, 'setRxLocationIdsForPracticeRole');
      scope.user = { UserId: 1, RxUserType: 2 };
      scope.phones = [{ PhoneNumber: '1234567891' }];
      scope.rolesStatus = { Loaded: true };
      scope.doRxCheckOnPageLoad = true;
    });

    it('should call updateRxAccess after page is fully loaded', function () {
      ctrl.checkRxAccess();
      expect(ctrl.updateRxAccess).toHaveBeenCalled();
    });

    it('should call updateRxAccess after page is fully loaded', function () {
      ctrl.checkRxAccess();
      expect(ctrl.setRxAccessEnum).toHaveBeenCalled();
    });

    it('should call updateRxAccess after page is fully loaded', function () {
      ctrl.checkRxAccess();
      expect(ctrl.setRxLocationIdsForLocationRoles).toHaveBeenCalled();
    });

    it('should not call updateRxAccess if doRxCheckOnPageLoad is false', function () {
      scope.doRxCheckOnPageLoad = false;
      ctrl.checkRxAccess();
      expect(ctrl.updateRxAccess).not.toHaveBeenCalled();
    });
  });

  describe('rxAccessFailed method', function () {
    var res;
    beforeEach(function () {
      scope.doDisplayRxInfo = true;
      scope.invalidDataForRx = false;
      res = { data: 'DoseSpot error' };
    });

    it('should set doDisplayRxInfo after page loaded and rxAccessFailed called', function () {
      scope.doRxCheckOnPageLoad = false;
      expect(scope.doDisplayRxInfo).toBe(true);
      scope.rxAccessFailed(res);
      expect(scope.doDisplayRxInfo).toBe(false);
    });

    it('should set invalidDataForRx on page load', function () {
      scope.doDisplayRxInfo = true;
      scope.doRxCheckOnPageLoad = true;
      scope.rxAccessFailed(res);
      expect(scope.invalidDataForRx).toBe(true);
      expect(scope.doRxCheckOnPageLoad).toBe(false);
    });
  });

  describe('scope.changePassword function ->', function () {
    it('should call tablauncher without modifying the soarConfig.resetPasswordUrl', function () {
      let testUrl = 'fake.passwordreset.com';
      soarConfigMock.resetPasswordUrl = testUrl;

      scope.changePassword();

      expect(_tabLauncher_.launchNewTab).toHaveBeenCalledWith(testUrl);
    });
  });

  describe('ctrl.saveRxUser method ->', function () {
    beforeEach(function () {
      scope.practiceId = 1;
      scope.rxAccessEnum = 2;
      scope.phones = [{ PhoneNumber: '2175403725' }];
      scope.user = {
        UserId: 1,
        FirstName: 'Bob',
        LastName: 'Jones',
        Gender: 'Unknown',
        Address: {
          AddressLine1: '302 Santa Clause',
          AddressLine2: '',
          City: 'Effingham',
          State: 'Il',
          ZipCode: '62401',
        },
        DEANumber: 'de1234567',
        DateOfBirth: '1988-08-12 12:00:00.000',
        UserName: 'jbond@gmail.com',
        NPINumber: 'npiNumber',
        LocationIds: [],
      };
      scope.rxLocationIds = [1, 2];
      var usrContext =
        '{ "Result": { "Application": { "ApplicationId": "4" } } }';
      sessionStorage.setItem('userContext', usrContext);

      rxService.saveRxClinician = jasmine
        .createSpy()
        .and.returnValue({ then: () => {} });
    });

    it('should call userServices.RxAccess.save with scope.practiceId and scope.rxUser', function () {
      ctrl.saveRxUser();
      expect(rxService.saveRxClinician).toHaveBeenCalledWith(
        scope.user,
        scope.rxUser,
        scope.rxSettings
      );
    });

    it('should set rxUser.LocationIds to scope.rxLocationIds', function () {
      ctrl.saveRxUser();
      expect(scope.rxUser.LocationIds).toEqual(scope.rxLocationIds);
    });
  });

  describe('validateUserPracticeRoles ->', function () {
    beforeEach(function () {
      scope.user = {
        UserId: '1234',
        Address: {},
        $$isPracticeAdmin: true,
        $$UserPracticeRoles: [],
      };
    });

    it('should set formIsValid to false if user is a practiceAdmin and doesnt have a PracticeAdmin role and user.IsActive is true', function () {
      scope.user.IsActive = true;
      ctrl.validateUserPracticeRoles();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to true if user is a practiceAdmin and doesnt have a PracticeAdmin role and user.IsActive is false', function () {
      scope.user.IsActive = false;
      ctrl.validateUserPracticeRoles();
      expect(scope.formIsValid).toBe(true);
    });

    it('should set formIsValid to true if user is a practiceAdmin and has a PracticeAdmin role and user.IsActive', function () {
      scope.user.$$UserPracticeRoles.push({
        RoleId: 8,
        RoleName: 'Practice Admin/Exec. Dentist',
      });
      ctrl.validateUserPracticeRoles();
      expect(scope.formIsValid).toBe(true);
    });
  });

  describe('validateUserLocationSetups ->', function () {
    beforeEach(function () {
      scope.userLocationSetups = [
        {
          LocationId: 1,
          ObjectState: 'None',
          $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }],
        },
        {
          LocationId: 2,
          ObjectState: 'None',
          $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }],
        },
      ];
      scope.user = {
        UserId: '1234',
        Address: {},
        $$isPracticeAdmin: false,
        $$UserPracticeRoles: [],
      };
      scope.userLocationsErrors = {
        NoUserLocationsError: false,
        NoRoleForLocation: false,
      };
    });

    it('should return false if userLocationSetups with an objectState other than Delete is empty', function () {
      scope.userLocationSetups = [
        {
          LocationId: 1,
          ObjectState: 'Delete',
          $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 }],
        },
        {
          LocationId: 2,
          ObjectState: 'Delete',
          $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }],
        },
      ];
      ctrl.validateUserLocationSetups();
      expect(scope.formIsValid).toBe(false);
      timeout.flush();
      expect(scope.userLocationsErrors.NoUserLocationsError).toBe(true);
    });

    it('should return false if userLocationSetups is empty', function () {
      scope.userLocationSetups = [];
      ctrl.validateUserLocationSetups();
      expect(scope.formIsValid).toBe(false);
      timeout.flush();
      expect(scope.userLocationsErrors.NoUserLocationsError).toBe(true);
    });

    it('should return false if userLocationSetups has records but one or more has empty $$UserLocationRoles and user is not a PracticeAdmin', function () {
      scope.userLocationSetups[0].$$UserLocationRoles = [];
      scope.originalUser.IsActive = true;
      scope.user.IsActive = true;
      scope.user.$$isPracticeAdmin = false;
      ctrl.validateUserLocationSetups();
      timeout.flush();
      expect(scope.formIsValid).toBe(false);
      expect(scope.userLocationsErrors.NoRoleForLocation).toBe(true);
    });

    it('should return false if userLocationSetups has records but one or more has empty $$UserLocationRoles and user is not a PracticeAdmin and user.IsActive = false', function () {
      scope.userLocationSetups[0].$$UserLocationRoles = [];
      scope.originalUser.IsActive = false;
      scope.user.IsActive = false;
      scope.user.$$isPracticeAdmin = false;
      ctrl.validateUserLocationSetups();
      timeout.flush();
      expect(scope.formIsValid).toBe(true);
      expect(scope.userLocationsErrors.NoRoleForLocation).toBe(false);
    });

    it('should return true if userLocationSetups has records and each has at least one $$UserLocationRoles and user is not a PracticeAdmin and user.IsActive = true', function () {
      scope.originalUser.IsActive = true;
      scope.user.IsActive = true;
      ctrl.validateUserLocationSetups();
      timeout.flush();
      expect(scope.formIsValid).toBe(true);
      expect(scope.userLocationsErrors.NoUserLocationsError).toBe(false);
    });
  });

  describe('setInactiveRoles ->', function () {
    beforeEach(function () {
      scope.userLocationSetups = [
        {
          LocationId: 1,
          ObjectState: 'None',
          $$UserLocationRoles: [
            { RoleId: 1, $$ObjectState: 'None' },
            { RoleId: 2, $$ObjectState: 'None' },
          ],
        },
        {
          LocationId: 2,
          ObjectState: 'None',
          $$UserLocationRoles: [
            { RoleId: 1, $$ObjectState: 'None' },
            { RoleId: 4, $$ObjectState: 'None' },
          ],
        },
      ];
      scope.originalUser = { IsActive: true };
      scope.user = {
        UserId: '1234',
        IsActive: false,
        Address: {},
        $$isPracticeAdmin: false,
        $$UserPracticeRoles: [],
      };
      scope.practiceId = 1;
    });

    it('should return userAssignedRolesDto with a UserRoleLocationInactiveDtos for each location and role in $$UserLocationRoles if $$ObjectState = None', function () {
      var userAssignedRolesDto = ctrl.setInactiveRoles(
        scope.userLocationSetups,
        scope.user
      );
      expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[0]).toEqual({
        UserId: '1234',
        RoleId: 1,
        LocationId: 1,
      });
      expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[1]).toEqual({
        UserId: '1234',
        RoleId: 2,
        LocationId: 1,
      });
      expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[2]).toEqual({
        UserId: '1234',
        RoleId: 1,
        LocationId: 2,
      });
      expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[3]).toEqual({
        UserId: '1234',
        RoleId: 4,
        LocationId: 2,
      });
    });

    it('should set $$UserLocationRoles to Delete if $$ObjectState = None', function () {
      ctrl.setInactiveRoles(scope.userLocationSetups, scope.user);
      _.forEach(scope.userLocationSetups, function (userLocationSetup) {
        _.forEach(
          userLocationSetup.$$UserLocationRoles,
          function (userLocationRole) {
            expect(userLocationRole.$$ObjectState).toBe('Delete');
          }
        );
      });
    });

    it('should set $$UserLocationRoles to None if $$ObjectState = Add', function () {
      scope.userLocationSetups = [
        {
          LocationId: 1,
          ObjectState: 'None',
          $$UserLocationRoles: [
            { RoleId: 1, $$ObjectState: 'Add' },
            { RoleId: 2, $$ObjectState: 'Add' },
          ],
        },
        {
          LocationId: 2,
          ObjectState: 'None',
          $$UserLocationRoles: [
            { RoleId: 1, $$ObjectState: 'Add' },
            { RoleId: 4, $$ObjectState: 'Add' },
          ],
        },
      ];
      scope.originalUser = { IsActive: true };
      ctrl.setInactiveRoles(scope.userLocationSetups, scope.user);
      _.forEach(scope.userLocationSetups, function (userLocationSetup) {
        _.forEach(
          userLocationSetup.$$UserLocationRoles,
          function (userLocationRole) {
            expect(userLocationRole.$$ObjectState).toBe('None');
          }
        );
      });
    });

    it('should not add $$UserLocationRoles to the userAssignedRolesDto if they are marked ObjectState Add', function () {
      scope.userLocationSetups = [
        {
          LocationId: 1,
          ObjectState: 'None',
          $$UserLocationRoles: [
            { RoleId: 1, $$ObjectState: 'Add' },
            { RoleId: 2, $$ObjectState: 'Add' },
          ],
        },
        {
          LocationId: 2,
          ObjectState: 'None',
          $$UserLocationRoles: [
            { RoleId: 1, $$ObjectState: 'None' },
            { RoleId: 4, $$ObjectState: 'None' },
          ],
        },
      ];
      var userAssignedRolesDto = ctrl.setInactiveRoles(
        scope.userLocationSetups,
        scope.user
      );
      expect(userAssignedRolesDto.UserRoleLocationInactiveDtos.length).toBe(2);
      expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[0]).toEqual({
        UserId: '1234',
        RoleId: 1,
        LocationId: 2,
      });
      expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[1]).toEqual({
        UserId: '1234',
        RoleId: 4,
        LocationId: 2,
      });
    });

    it('should return userAssignedRolesDto with a UserRolePracticeInactiveDtos for each user.$$UserPracticeRoles  if $$ObjectState = None', function () {
      scope.userLocationSetups = [
        { LocationId: 1, ObjectState: 'None', $$UserLocationRoles: [] },
        { LocationId: 2, ObjectState: 'None', $$UserLocationRoles: [] },
      ];
      scope.user.$$UserPracticeRoles = [
        { RoleId: 1, $$ObjectState: 'None' },
        { RoleId: 4, $$ObjectState: 'None' },
      ];
      var userAssignedRolesDto = ctrl.setInactiveRoles(
        scope.userLocationSetups,
        scope.user
      );
      expect(userAssignedRolesDto.UserRolePracticeInactiveDtos[0]).toEqual({
        UserId: '1234',
        RoleId: 1,
        PracticeId: 1,
      });
      expect(userAssignedRolesDto.UserRolePracticeInactiveDtos[1]).toEqual({
        UserId: '1234',
        RoleId: 4,
        PracticeId: 1,
      });
    });

    it('should set $$UserPracticeRoles to Delete if $$ObjectState = None', function () {
      scope.user.$$UserPracticeRoles = [
        { RoleId: 1, $$ObjectState: 'None' },
        { RoleId: 4, $$ObjectState: 'None' },
      ];
      ctrl.setInactiveRoles(scope.userLocationSetups, scope.user);
      _.forEach(scope.user.$$UserPracticeRoles, function (userPracticeRole) {
        expect(userPracticeRole.$$ObjectState).toBe('Delete');
      });
    });

    it('should set $$UserPracticeRoles to None if $$ObjectState = Add', function () {
      scope.user.$$UserPracticeRoles = [
        { RoleId: 1, $$ObjectState: 'Add' },
        { RoleId: 4, $$ObjectState: 'Add' },
      ];
      ctrl.setInactiveRoles(scope.userLocationSetups, scope.user);
      _.forEach(scope.user.$$UserPracticeRoles, function (userPracticeRole) {
        expect(userPracticeRole.$$ObjectState).toBe('None');
      });
    });
  });

  describe('ctrl.unregisterStatusChangeConfirm method', function () {
    var result = { layout: null, confirm: false };
    beforeEach(function () {
      result.layout = 1;
      result.confirm = true;
      scope.user.IsActive = true;
      spyOn(scope, 'saveUser').and.callFake(function () {});
    });
    it('should set userActivated to true if scope.user.IsActive and result.layout is 1', function () {
      rootScope.$broadcast('statusChangeConfirmed', result);
      expect(scope.userActivated).toBe(true);
    });

    it('should not set userActivated to true if scope.user.IsActive is false and result.layout is 1', function () {
      scope.user.IsActive = false;
      rootScope.$on('statusChangeConfirmed');
      expect(scope.userActivated).toBe(false);
    });

    it('should not set userActivated to true if scope.user.IsActive is true and result.layout is not 1', function () {
      scope.user.IsActive = true;
      result.layout = 2;
      rootScope.$on('statusChangeConfirmed');
      expect(scope.userActivated).toBe(false);
    });
  });
});

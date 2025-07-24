describe('PersonalInfoController ->', function () {
  var routeParams,
    timeout,
    scope,
    $httpBackend,
    ctrl,
    element,
    compile,
    location,
    toastr,
    q,
    localize;
  var modalFactory, modalFactoryDeferred, personServices, saveStates;

  //#region mocks

  saveStates = {
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    None: 'None',
  };

  var mockResponsiblePerson = {
    PatientId: 'RP12345',
    FirstName: 'RPFirstName',
    LastName: 'RPLastName',
    EmailAddress: 'RPEmailAddress',
    AddressLine2: 'RPAddressLine2',
    City: 'RPCity',
  };

  var mockNewPerson = {
    Profile: {
      PatientId: null,
      FirstName: '',
      MiddleName: '',
      LastName: '',
      PreferredName: '',
      Prefix: '',
      Suffix: '',
      AddressLine1: '',
      AddressLine2: '',
      City: '',
      State: '',
      ZipCode: '',
      Sex: '',
      DateOfBirth: null,
      IsPatient: true,
      PatientCode: null,
      EmailAddress: '',
      EmailAddress2: '',
      EmailAddressRemindersOk: false,
      EmailAddress2RemindersOk: false,
      PersonAccount: null,
      ResponsiblePersonType: null,
      ResponsiblePersonId: null,
      PreferredLocation: null,
      PreferredDentist: null,
      PreferredHygienist: null,
      IsValid: false,
    },
    Phones: [],
    PreviousDentalOffice: null,
    Referral: null,
    Flags: [],
  };

  var mockStateList = [
    {
      StateName: 'Alabama',
      StateId: 'AL',
    },
    {
      StateName: 'Alaska',
      StateId: 'AK',
    },
    {
      StateName: 'Arizona',
      StateId: 'AZ',
    },
    {
      StateName: 'Arkansas',
      StateId: 'AR',
    },
  ];

  mockStateList.getStateNameById = jasmine
    .createSpy()
    .and.returnValue(mockStateList[0].StateName);

  var mockStaticData = {
    States: jasmine.createSpy().and.returnValue(mockStateList),
  };

  var mockPhones = [
    {
      PhoneNumber: '1111111111',
      ObjectState: 'Add',
      Type: 'Home',
    },
    {
      PhoneNumber: '2222222222',
      ObjectState: 'Update',
      Type: 'Home',
    },
  ];

  var mockPhonesResponse = {
    Value: [
      {
        PhoneNumber: '1111111111',
        ObjectState: 'Successful',
        Type: 'Home',
      },
      {
        PhoneNumber: '2222222222',
        ObjectState: 'Successful',
        Type: 'Home',
      },
    ],
  };

  var frmPersonalInfoMock = {
    $valid: true,
    inpFirstName: {
      $valid: true,
    },
    inpLastName: {
      $valid: true,
    },
    inpAddressEmail1: {
      $valid: true,
    },
    inpAddressEmail2: {
      $valid: true,
    },
    inputSex: {
      $valid: true,
    },
    inpZip: {
      $valid: true,
    },
  };

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  describe('when user is authorized -> ', function () {
    // Create spies for services
    beforeEach(
      module('Soar.Patient', function ($provide) {
        personServices = {
          Persons: {
            save: jasmine.createSpy(),
          },
        };
        $provide.value('PersonServices', personServices);
      })
    );

    // Create controller and scope
    beforeEach(inject(function (
      $rootScope,
      $controller,
      $injector,
      $route,
      $routeParams,
      $compile,
      $timeout,
      $location,
      $q
    ) {
      timeout = $timeout;
      compile = $compile;
      routeParams = $routeParams;
      q = $q;

      element = {
        focus: jasmine.createSpy(),
      };
      spyOn(angular, 'element').and.returnValue(element);

      scope = $rootScope.$new();
      // validatePanel needs this
      scope.frmPersonalInfo = frmPersonalInfoMock;

      ctrl = $controller('PersonalInfoController', {
        $scope: scope,
        StaticData: mockStaticData,
        SaveStates: saveStates,
        location: $location,
        localize: localize,
        timeout: $timeout,
      });
      $httpBackend = $injector.get('$httpBackend');
    }));

    //#region html mock

    var loadHtml = function () {
      element = angular.element(
        '<div ng-form="frmPersonalInfo" >' +
          '<div ng-class="{error:hasErrors && !frmPersonalInfoMock.inpFirstName.$valid}">' +
          '   <input id="inpFirstName" class="form-input required valid" set-focus ng-model="person.Profile.FirstName" name="inpFirstName" maxlength="64" required alpha-only />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPersonalInfoMock.inpLastName.$valid}">' +
          '   <input id="inpLastName" class="form-input required valid" set-focus ng-model="person.Profile.LastName" name="inpLastName" maxlength="64" required alpha-only />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPersonalInfoMock.inpAddressEmail1.$valid}">' +
          '   <input id="inpAddressEmail1" class="form-input required valid" set-focus ng-model="person.Profile.EmailAddress" name="inpAddressEmail1" maxlength="64" valid-email />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPersonalInfoMock.inpAddressEmail2.$valid}">' +
          '   <input id="inpAddressEmail2" class="form-input required valid" set-focus ng-model="person.Profile.EmailAddress2" name="inpAddressEmail2" maxlength="64"  valid-email />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPersonalInfoMock.inpZip.$valid}">' +
          '   <input id="inpZip" zip-field="person.Profile.ZipCode" type="text" onfocus="this.value = this.value;" class="form-input" name="inpZip" ng-model="person.Profile.ZipCode" maxlength="10" minlength="5" />' +
          '</div></div>'
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
      var inpAddressEmail1 = element.find('#inpAddressEmail1');
      var inpAddressEmail2 = element.find('#inpAddressEmail2');
      var inpZip = element.find('#inpZip');

      // Set some text!
      angular.element(inpFirstName).val('John').trigger('input');
      angular.element(inpLastName).val('Doe').trigger('input');
      angular.element(inpAddressEmail1).val('a@a.com').trigger('input');
      angular.element(inpAddressEmail2).val('b@b.com').trigger('input');
      angular.element(inpZip).val('62401').trigger('input');
    };
    //#endregion

    it('should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set scope initial properties', function () {
      expect(scope.hasErrors).toBe(false);
      expect(scope.responsiblePerson).toBe(null);
      expect(scope.useResponsiblePersonContact).toBe(false);
      expect(scope.validResponsiblePerson).toBe(true);
      expect(scope.focusOnResponsiblePerson).toBe(false);
      expect(scope.ageCheck).toBe(true);
      expect(scope.validDob).toBe(true);
      expect(scope.validPhones).toBe(true);
      expect(scope.showSecondEmail).toBe(false);
    });

    describe('initializeController function -> ', function () {
      it('should set stateList', function () {
        ctrl.initializeController();
        expect(scope.stateList).toEqual(mockStateList);
      });
    });

    describe('setFocusOnInput watch -> ', function () {
      it('should call setFocusOnElement', function () {
        spyOn(scope, 'setFocusOnElement');
        scope.setFocusOnInput = false;
        scope.$apply();
        scope.person = angular.copy(mockNewPerson);
        scope.setFocusOnInput = true;
        scope.$apply();
        expect(scope.setFocusOnElement).toHaveBeenCalled();
      });
    });

    describe('validateInfo function -> ', function () {
      it('should set scope.person.Profile.IsValid true based in inputs', function () {
        scope.person = angular.copy(mockNewPerson);
        scope.validDob = false;
        expect(scope.person.Profile.IsValid).toBe(false);
      });

      it('should set scope.person.Profile.IsValid false based in inputs', function () {
        scope.person = angular.copy(mockNewPerson);
        frmPersonalInfoMock.inpFirstName.$valid = false;
        expect(scope.person.Profile.IsValid).toBe(false);
      });
    });

    describe('person watch -> ', function () {
      it('should call validateInfo', function () {
        spyOn(scope, 'validateInfo');
        scope.person = angular.copy(mockNewPerson);
        scope.$apply();
        scope.person.Profile.FirstName = 'Bob';
        scope.$apply();
        timeout.flush(0);
        expect(scope.validateInfo).toHaveBeenCalled();
      });
    });

    describe('uncheckedSex function -> ', function () {
      it('should set scope.person.Profile.Sex to null if unchecked', function () {
        var ev = {
          target: { value: 'M' },
        };
        scope.person = angular.copy(mockNewPerson);
        scope.person.Profile.Sex = 'M';
        scope.uncheckedSex(ev);
        expect(scope.person.Profile.Sex).toBe(null);
      });
    });

    describe('copyContactInfo function -> ', function () {
      it('should copy responsible party info from selected responsiblePerson', function () {
        scope.useResponsiblePersonContact = true;
        scope.person = angular.copy(mockNewPerson);
        scope.person.Profile.ResponsiblePersonId = '123';
        scope.responsiblePerson = angular.copy(mockResponsiblePerson);
        scope.responsiblePerson.PatientPhoneInformationDtos = [];
        var ev = {
          target: { checked: true },
        };
        scope.copyContactInfo(ev);
        expect(scope.person.Profile.EmailAddress).toEqual(
          scope.responsiblePerson.EmailAddress
        );
      });
    });

    describe('copyContactInfo function -> ', function () {
      it('should set person.Profile fields to null', function () {
        scope.person = angular.copy(mockNewPerson);
        scope.resetPhones = jasmine.createSpy();
        scope.responsiblePerson = angular.copy(mockResponsiblePerson);
        scope.person.Profile.EmailAddress =
          scope.responsiblePerson.EmailAddress;
        scope.person.Profile.City = scope.responsiblePerson.City;
        scope.person.Profile.AddressLine2 =
          scope.responsiblePerson.AddressLine2;
        scope.clearResponsibleContactInfo();
        expect(scope.person.Profile.AddressLine1).toEqual(null);
        expect(scope.person.Profile.City).toEqual(null);
        expect(scope.person.Profile.EmailAddress).toEqual(null);
      });
    });

    describe('responsiblePerson watch -> ', function () {
      it('should call clearResponsibleContactInfo if useResponsiblePersonContact is true', function () {
        spyOn(scope, 'clearResponsibleContactInfo');
        scope.useResponsiblePersonContact = true;
        scope.responsiblePerson = angular.copy(mockResponsiblePerson);
        scope.$apply();
        expect(scope.clearResponsibleContactInfo).toHaveBeenCalled();
      });

      it('should not call clearResponsibleContactInfo if useResponsiblePersonContact is false', function () {
        spyOn(scope, 'clearResponsibleContactInfo');
        scope.useResponsiblePersonContact = false;
        scope.responsiblePerson = angular.copy(mockResponsiblePerson);
        scope.$apply();
        expect(scope.clearResponsibleContactInfo).not.toHaveBeenCalled();
      });
    });

    describe('setFocusOnElement function -> ', function () {
      beforeEach(function () {
        scope.validateInfo = jasmine.createSpy();
      });

      it('should set focus on invalid input ', function () {
        scope.frmPersonalInfo.inpFirstName.$valid = false;
        scope.setFocusOnElement();
        timeout.flush();
        expect(angular.element('#inpFirstName').focus).toHaveBeenCalled();

        scope.frmPersonalInfo.inpFirstName.$valid = true;
        scope.frmPersonalInfo.inpLastName.$valid = false;
        scope.setFocusOnElement();
        timeout.flush();
        expect(angular.element('#inpLastName').focus).toHaveBeenCalled();
      });
    });
  });
});

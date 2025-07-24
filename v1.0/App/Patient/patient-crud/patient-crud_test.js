describe('patient-crud-controller ->', function () {
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
    modalFactory,
    modalFactoryDeferred;
  var personServices;
  //#region mocks
  var patientNewMock = {
    Value: { PatientId: '', FirstName: null, LastName: null },
  };
  var patientAddMock = {
    Value: { PatientId: '', FirstName: null, LastName: null },
  };
  var patientEditMock = {
    Value: { PatientId: '1', FirstName: 'John', LastName: 'Doe' },
  };

  var duplicatePatientsMock = { Value: [] };

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
      ObjectState: 'Add',
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

  var frmPatientCrudMock = {
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
    inpZip: {
      $valid: true,
    },
  };

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  describe('when user is authorized -> ', function () {
    var patientDiscountService, patientServices;

    // Create spies for services

    // Create spies for services
    beforeEach(
      module('Soar.Patient', function ($provide) {
        personServices = {
          Persons: {
            save: jasmine.createSpy(),
          },
        };
        $provide.value('PersonServices', personServices);

        patientServices = {
          Patients: {
            get: jasmine.createSpy().and.returnValue(duplicatePatientsMock),
            duplicates: jasmine
              .createSpy()
              .and.returnValue(duplicatePatientsMock),
            update: jasmine.createSpy(),
            save: jasmine.createSpy(),
          },
          Contacts: {
            addUpdate: jasmine.createSpy().and.returnValue(mockPhonesResponse),
          },
          PreviousDentalOffice: {
            update: jasmine.createSpy(),
            create: jasmine.createSpy(),
          },
          Referrals: {
            UpdateReferral: jasmine.createSpy(),
            save: jasmine.createSpy(),
          },
          Discounts: {
            getDiscount: jasmine.createSpy(),
            update: jasmine.createSpy(),
            create: jasmine.createSpy(),
            removeDiscount: jasmine.createSpy(),
            addDiscount: jasmine.createSpy(),
          },
        };
        $provide.value('PatientServices', patientServices);
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
      location = $location;
      compile = $compile;
      routeParams = $routeParams;
      q = $q;

      scope = $rootScope.$new();
      // validatePanel needs this
      scope.frmPatientCrud = frmPatientCrudMock;

      scope.priorityList = [
        {
          Name: 'Primary Dental',
          Priority: 0,
        },
        {
          Name: 'Secondary Dental',
          Priority: 1,
        },
        {
          Name: '3rd Supplemental Dental',
          Priority: 2,
        },
        {
          Name: '4th Supplemental Dental',
          Priority: 3,
        },
        {
          Name: '5th Supplemental Dental',
          Priority: 4,
        },
        {
          Name: '6th Supplemental Dental',
          Priority: 5,
        },
      ];

      //mock of ModalFactory
      modalFactory = {
        ConfirmModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.callFake(function () {
            modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
          }),
      };

      ctrl = $controller('PatientCrudController', {
        $scope: scope,
        patSecurityService: _authPatSecurityService_,
        currentPatient: patientAddMock,
        personServices: personServices,
        StaticData: mockStaticData,
        ModalFactory: modalFactory,
        PatientBenefitPlansFactory: {},
        userSettingsDataService: {
          isNewNavigationEnabled: function () {
            return false;
          },
        },
      });

      $httpBackend = $injector.get('$httpBackend');
    }));

    //#region html mock

    var loadHtml = function () {
      element = angular.element(
        '<form name="frmPatientCrud" role="form" novalidate>' +
          '<div ng-class="{error:hasErrors && !frmPatientCrud.inpFirstName.$valid}">' +
          '   <input id="inpFirstName" class="form-input required valid" set-focus ng-model="patient.FirstName" name="inpFirstName" maxlength="64" required alpha-only />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPatientCrud.inpLastName.$valid}">' +
          '   <input id="inpLastName" class="form-input required valid" set-focus ng-model="patient.LastName" name="inpLastName" maxlength="64" required alpha-only />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPatientCrud.inpAddressEmail1.$valid}">' +
          '   <input id="inpAddressEmail1" class="form-input required valid" set-focus ng-model="patient.EmailAddress" name="inpAddressEmail1" maxlength="64" valid-email />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPatientCrud.inpAddressEmail2.$valid}">' +
          '   <input id="inpAddressEmail2" class="form-input required valid" set-focus ng-model="patient.EmailAddress2" name="inpAddressEmail2" maxlength="64"  valid-email />' +
          '</div>' +
          '<div ng-class="{error:hasErrors && !frmPatientCrud.inpZip.$valid}">' +
          '   <input id="inpZip" zip-field="patient.ZipCode" type="text" onfocus="this.value = this.value;" class="form-input" name="inpZip" ng-model="patient.ZipCode" maxlength="10" minlength="5" />' +
          '</div>' +
          '</form>'
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

    it('should set scope properties', function () {
      expect(scope.hasErrors).toBe(false);
      expect(scope.flags).toEqual({ validReferral: true });
      expect(scope.formIsValid).toBe(false);
      expect(scope.setFocusOnProfile).toBe(false);
      expect(scope.setFocusOnPreviousDental).toBe(false);
      expect(scope.setFocusOnReferrals).toBe(false);
    });

    describe('ctrl.setPriorityList ->', function () {
      it('should add to available priority list', function () {
        spyOn(scope, '$broadcast');
        scope.person = {
          PatientBenefitPlanDtos: [{}, {}],
        };
        scope.availablePriorities = [scope.priorityList[0]];
        ctrl.setPriorityList();
        expect(scope.availablePriorities).toEqual([
          scope.priorityList[0],
          scope.priorityList[1],
        ]);
        expect(scope.$broadcast).toHaveBeenCalledWith(
          'PlanPriorityChange',
          scope.availablePriorities
        );
      });
    });

    describe('scope.removeInsurance ->', function () {
      it('should remove patient benefit plan and priority option', function () {
        spyOn(scope, '$broadcast');
        scope.person = {
          PatientBenefitPlanDtos: [{ Id: 1 }, { Id: 2 }, { Id: 3 }],
        };
        scope.availablePriorities = [
          scope.priorityList[0],
          scope.priorityList[1],
          scope.priorityList[2],
        ];
        scope.removeInsurance(1);
        expect(scope.person.PatientBenefitPlanDtos).toEqual([
          { Id: 1, Priority: 0 },
          { Id: 3, Priority: 1 },
        ]);
        expect(scope.availablePriorities).toEqual([
          scope.priorityList[0],
          scope.priorityList[1],
        ]);
        expect(scope.$broadcast).toHaveBeenCalledWith(
          'PlanPriorityChange',
          scope.availablePriorities
        );
      });
    });

    describe('cancelChanges function -> ', function () {
      it('should set location', function () {
        scope.cancelChanges();
        expect(location.path).toHaveBeenCalledWith('Patient');
      });
    });

    describe('validatePerson function -> ', function () {
      it('should set formIsValid true when all forms are valid ', function () {
        scope.previousDentalOffice.IsValid = true;
        scope.person.Profile.IsValid = true;
        scope.person.Profile.PreferredLocation = true;
        scope.flags.validReferral = true;
        ctrl.validatePerson(scope.frmPatientCrud, null);
        expect(scope.formIsValid).toBe(true);
      });

      it('should set formIsValid false when all forms are not valid ', function () {
        scope.previousDentalOffice.IsValid = false;
        scope.person.Profile.IsValid = true;
        scope.flags.validReferral = true;
        ctrl.validatePerson(scope.frmPatientCrud, null);
        expect(scope.formIsValid).toBe(false);
      });
    });

    describe('addPhones function -> ', function () {
      it('should add newPhones to person.Phones', function () {
        scope.phones = angular.copy(mockPhones);
        ctrl.addPhones();
        expect(scope.person.Phones).toEqual(mockPhones);
      });
    });

    describe('savePerson function -> ', function () {
      it('should set scope properties', function () {
        scope.savePerson();
        expect(scope.setFocusOnProfile).toBe(false);
        expect(scope.setFocusOnPreviousDental).toBe(false);
        expect(scope.setFocusOnReferrals).toBe(false);
      });

      it('should remove dash from zip code', function () {
        spyOn(ctrl, 'validatePerson');
        scope.formIsValid = true;
        scope.person.Profile.ZipCode = '62401-1234';
        scope.savePerson();
        expect(scope.person.Profile.ZipCode).toEqual('624011234');
      });

      it('should call validatePerson', function () {
        spyOn(ctrl, 'validatePerson');
        scope.formIsValid = true;
        scope.savePerson();
        expect(ctrl.validatePerson).toHaveBeenCalled();
      });

      it('should call addPhones', function () {
        spyOn(ctrl, 'addPhones');
        scope.formIsValid = true;
        ctrl.validatePerson = jasmine.createSpy();
        scope.savePerson();
        expect(ctrl.addPhones).toHaveBeenCalled();
      });

      it('should call setFormFocus', function () {
        spyOn(ctrl, 'validatePerson');
        scope.formIsValid = true;
        scope.person.Profile.ZipCode = '62401-1234';
        scope.savePerson();
        expect(scope.person.Profile.ZipCode).toEqual('624011234');
      });

      it('should call personServices.Persons.save if formIsValid', function () {
        spyOn(ctrl, 'validatePerson');
        scope.formIsValid = true;
        scope.person = angular.copy(mockNewPerson);
        scope.savePerson();
        expect(personServices.Persons.save).toHaveBeenCalledWith(
          scope.person,
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });
    });

    describe('savePersonSuccess function -> ', function () {
      it('should route to patient', function () {
        scope.person = angular.copy(mockNewPerson);
        scope.originalPerson = angular.copy(mockNewPerson);
        var response = { Value: { Profile: { PatientId: 'PatientId' } } };
        ctrl.saveMostRecent = jasmine.createSpy();
        ctrl.savePersonSuccess(response);
        expect(ctrl.saveMostRecent).toHaveBeenCalledWith(
          response.Value.Profile.PatientId
        );
        expect(location.path).toHaveBeenCalledWith(
          'Patient/PatientId/Overview'
        );
      });
    });

    describe('savePersonFailure function -> ', function () {
      it('should call toastr', function () {
        scope.savePersonFailure();
        expect(_toastr_.error).toHaveBeenCalled();
      });
    });

    describe('setFormFocus function -> ', function () {
      it('should set setFocusOnProfile to true if formIsValid is false and scope.person.Profile.IsValid is false', function () {
        scope.formIsValid = false;
        scope.person = angular.copy(mockNewPerson);
        scope.person.Profile.IsValid = false;
        ctrl.setFormFocus();
        timeout.flush(0);
        expect(scope.setFocusOnProfile).toBe(true);
      });

      it('should set setFocusOnPreviousDental to true if formIsValid is false and scope.previousDentalOffice.IsValid is false', function () {
        scope.formIsValid = false;
        scope.person = angular.copy(mockNewPerson);
        scope.person.Profile.IsValid = true;
        scope.person.Profile.PreferredLocation = true;
        scope.previousDentalOffice.IsValid = false;
        ctrl.setFormFocus();
        timeout.flush(0);
        expect(scope.setFocusOnPreviousDental).toBe(true);
      });
    });
  });
});

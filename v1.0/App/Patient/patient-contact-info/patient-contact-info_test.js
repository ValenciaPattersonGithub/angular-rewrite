describe('patient-contact-info -> ', function () {
  var scope, controller, compile, element;

  //#region mocks
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

  var mockPhoneTypes = [
    { Description: 'Home', Value: 'Home' },
    { Description: 'Work', Value: 'Work' },
    { Description: 'Custom', Value: 'Add' },
  ];

  var mockEmptyPatient = {
    PrimaryPhoneNotes: null,
    SecondaryPhoneNotes: null,
  };

  var mockPatient = {
    PatientId: '1',
    FirstName: 'John',
    LastName: 'Smith',
  };

  var routeParams = {
    PatientId: '1',
  };

  mockStateList.getStateNameById = jasmine
    .createSpy()
    .and.returnValue(mockStateList[0].StateName);

  var mockStaticData = {
    States: jasmine.createSpy().and.returnValue(mockStateList),
    PhoneTypes: jasmine.createSpy().and.returnValue(mockPhoneTypes),
  };

  var mockPhones = [
    {
      ContactId: '1',
      PhoneNumber: '1111111111',
      ObjectState: 'Update',
      Type: 'Home',
    },
    {
      ContactId: '2',
      PhoneNumber: '2222222222',
      ObjectState: 'Delete',
      Type: 'Home',
    },
    {
      ContactId: '',
      PhoneNumber: '3333333333',
      ObjectState: 'Add',
      Type: 'Home',
    },
  ];

  var mockPhonesResponse = {
    Value: [
      {
        ContactId: '1',
        PhoneNumber: '1111111111',
        ObjectState: 'Successful',
        Type: 'Home',
      },
      {
        ContactId: '2',
        PhoneNumber: '2222222222',
        ObjectState: 'Successful',
        Type: 'Home',
      },
      {
        ContactId: '3',
        PhoneNumber: '3333333333',
        ObjectState: 'Successful',
        Type: 'Home',
      },
    ],
  };

  var mockForm = {
    $valid: true,
    inpPatientEmailOneAddress: {
      $valid: true,
    },
    inpPatientEmailTwoAddress: {
      $valid: true,
    },
    inpZipCode: {
      $valid: true,
    },
  };

  //#endregion

  // mock the injected factory
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // provide the PatientService and have it return the mockPatientResult when called
  var patientServices;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        Patient: {
          get: jasmine.createSpy().and.returnValue(mockPatient),
        },
        Contacts: {
          get: jasmine.createSpy().and.returnValue(mockPhonesResponse),
          addUpdate: jasmine.createSpy().and.returnValue(mockPhonesResponse),
        },
      };
      $provide.value('PatientServices', patientServices);
    })
  );

  //#endregion

  // inject the search service to controller
  beforeEach(inject(function ($rootScope, $controller, $compile) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.patient = {
      PrimaryPhoneNotes: null,
      SecondaryPhoneNotes: null,
    };

    controller = $controller('PatientContactInfoController', {
      $scope: scope,
      StaticData: mockStaticData,
      PatientServices: patientServices,
    });

    scope.phones = mockPhones;
    scope.frmPatientContactInfo = mockForm;
    scope.validPhones = true;

    scope.$apply();
  }));

  //#region html mock

  var loadHtml = function () {
    element = angular.element(
      '<form name="frmPatientContactInfo" role="form" novalidate>' +
        '<div ng-class="{error:hasErrors && !frmPatientContactInfo.inpPatientEmailOneAddress.$valid}">' +
        '   <input class="form-input" id="inpPatientEmailOneAddress" name="inpPatientEmailOneAddress" type="text" ng-model="patient.EmailAddress" ng-focus="emailOnefocus=true;" ng-blur="emailOnefocus=false;" valid-email maxlength="256">' +
        '</div>' +
        '<div ng-class="{error:hasErrors && !frmPatientContactInfo.inpPatientEmailTwoAddress.$valid}">' +
        '   <input class="form-input" id="inpPatientEmailTwoAddress" name="inpPatientEmailTwoAddress" type="text" ng-model="patient.EmailAddress2" ng-focus="emailOnefocus=true;" ng-blur="emailOnefocus=false;" valid-email maxlength="256">' +
        '</div>' +
        '<div ng-class="{error:hasErrors && !frmPatientContactInfo.inpZipCode.$valid}">' +
        '   <input class="form-input" id="inpZipCode" zip-field="patient.ZipCode" type="text" ng-focus="focus=true;" ng-blur="focus=false;" name="inpZipCode" ng-model="patient.ZipCode" maxlength="10" minlength="5" />' +
        '</div>' +
        '</form>'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
  };

  var setHtmlValues = function () {
    // Find the input control:
    var inpPatientEmailOneAddress = element.find('#inpPatientEmailOneAddress');
    var inpPatientEmailTwoAddress = element.find('#inpPatientEmailTwoAddress');
    var inpZipCode = element.find('#inpZipCode');

    // Set some text!
    angular.element(inpPatientEmailOneAddress).val('a@a.com').trigger('input');
    angular.element(inpPatientEmailTwoAddress).val('b@b.com').trigger('input');
    angular.element(inpZipCode).val('62401').trigger('input');

    scope.$apply();
  };
  //#endregion

  it('should set scope properties', function () {
    expect(scope.valid).toBe(true);
  });

  //--------------------------------
  // Have to inject a new controller to instantiate scope properties with different values
  //--------------------------------

  describe('validatePanel function -> ', function () {
    it('should set hasErrors to true when inpPatientEmailOneAddress is invalid', function () {
      loadHtml();
      setHtmlValues();

      // Find the input control:
      var inpPatientEmailOneAddress = element.find(
        '#inpPatientEmailOneAddress'
      );

      // Set some text!
      angular.element(inpPatientEmailOneAddress).val('a@acom').trigger('input');

      scope.$apply();
      scope.validatePanel(scope.patient, null);

      expect(scope.hasErrors).toBe(true);
    });

    it('should set hasErrors to true when inpPatientEmailTwoAddress is invalid', function () {
      loadHtml();
      setHtmlValues();

      // Find the input control:
      var inpPatientEmailTwoAddress = element.find(
        '#inpPatientEmailTwoAddress'
      );

      // Set some text!
      angular.element(inpPatientEmailTwoAddress).val('a@acom').trigger('input');

      scope.$apply();
      scope.validatePanel(scope.patient, null);

      expect(scope.hasErrors).toBe(true);
    });

    it('should set hasErrors to true when inpZipCode is invalid', function () {
      loadHtml();
      setHtmlValues();

      // Find the input control:
      var inpZipCode = element.find('#inpZipCode');

      // Set some text!
      angular.element(inpZipCode).val('624').trigger('input');

      scope.$apply();
      scope.validatePanel(scope.patient, null);

      expect(scope.hasErrors).toBe(true);
    });
  });

  describe('copyContactInfoFromPatient function -> ', function () {
    it("should set responsible person information in contact information when patient's responsible person id equals its patient id", function () {
      var patient = {
        PatientId: '201',
        PersonAccount: { PersonAccountMember: { ResponsiblePersonId: '201' } },
      };

      controller.copyContactInfoFromPatient(patient);

      expect(scope.contactInfo.ResponsiblePersonId).toBe('201');
      expect(scope.contactInfo.ResponsiblePersonType).toBe('1');
    });

    it("should set responsible person information in contact information when patient's responsible person id is not equal to its patient id", function () {
      var patient = {
        PatientId: '201',
        PersonAccount: { PersonAccountMember: { ResponsiblePersonId: '401' } },
      };

      controller.copyContactInfoFromPatient(patient);

      expect(scope.contactInfo.ResponsiblePersonId).toBe('401');
      expect(scope.contactInfo.ResponsiblePersonType).toBe('2');
    });
  });
});

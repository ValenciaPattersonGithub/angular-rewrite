describe('patient-previous-dental-office -> ', function () {
  var scope, routeParams, ctrl, toastr, httpBackend, localize, location;

  // #region Mock values
  var _patientServices_;
  var mockPatientId = '08039583-ed30-40e2-8ab8-8f962937ce5a';
  var mockPreviousDentalOfficeId = '67fde657-a074-48a4-9b24-2da55b97f05d';
  var patientPreviousDentalOfficeMock = {
    Value: [
      {
        PreviousDentalOfficeId: '67fde657-a074-48a4-9b24-2da55b97f05d',
        PatientId: '08039583-ed30-40e2-8ab8-8f962937ce5a',
        Name: 'Office Name',
        PhoneNumber: '123-456-7890',
        Address: {
          AddressLine1: 'Line1',
          AddressLine2: 'Line2',
          City: 'City',
          State: 'WA',
          ZipCode: '12345',
        },
        Notes: 'Note text.',
      },
    ],
  };
  // #endregion Mock values

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // #region Unit Tests
  describe('PatientPreviousDentalOfficeController when user is authorized -> ', function () {
    //#region Mock service
    beforeEach(
      module('Soar.Patient', function ($provide) {
        _patientServices_ = {
          PreviousDentalOffice: {
            get: jasmine
              .createSpy()
              .and.returnValue({ Value: patientPreviousDentalOfficeMock }),
          },
        };
        $provide.value('PatientServices', _patientServices_);
      })
    );
    //#end region Mock service

    beforeEach(inject(function (
      $route,
      $rootScope,
      $location,
      $routeParams,
      $injector,
      $controller
    ) {
      localize = $injector.get('localize');
      location = $location;
      routeParams = $routeParams;
      routeParams.patientId = 1;
      scope = $rootScope.$new();
      ctrl = $controller('PatientPreviousDentalOfficeController', {
        $scope: scope,
        patSecurityService: _authPatSecurityService_,
      });
    }));

    // test for controller exists
    it('should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    // test if the patientPreviousDentalOfficeService has been injected
    it('should have injected patientPreviousDentalOfficeService ', function () {
      expect(_patientServices_.PreviousDentalOffice).not.toBeNull();
    });

    // scope properties
    describe('scope properties', function () {
      it('should set misc scope properties', function () {
        expect(scope.isContactCollapsed).toBe(true);
        expect(scope.isNoteCollapsed).toBe(true);
      });
    });

    // test for edit mode
    describe('in edit mode', function () {
      it('should set editing to true when PatientId is not null', function () {
        expect(scope.editMode).toBe(true);
      });
    });

    // test to see if toastr message is shown on service get success
    describe('GetPatientPreviousDentalOfficeFail ->', function () {
      it('should set scope.patientPreviousDentalOffice to res.Value', function () {
        scope.GetPatientPreviousDentalOfficeSuccess(
          patientPreviousDentalOfficeMock
        );
        expect(scope.patientPreviousDentalOffice).toBe(
          patientPreviousDentalOfficeMock.Value
        );
      });
    });

    // test to see if toastr message is shown on service get failure
    describe('GetPatientPreviousDentalOfficeFail ->', function () {
      it('should call toastrFactory failure', function () {
        scope.GetPatientPreviousDentalOfficeFail();
        expect(_toastr_.error).toHaveBeenCalled();
      });
    });

    // test to see if service was called
    describe('GetPatientPreviousDentalOffice function ->', function () {
      it('should call service', function () {
        scope.GetPatientPreviousDentalOffice();
        expect(_patientServices_.PreviousDentalOffice.get).toHaveBeenCalled();
      });
    });
  });
  // #endregion Unit Tests
});

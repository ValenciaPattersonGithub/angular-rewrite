describe('PatientNotesPrintController ->', function () {
  var scope,
    ctrl,
    sce,
    localize,
    location,
    boolValue,
    routeParams,
    timeout,
    rootScope;
  var patientNotesFactory,
    usersFactory,
    personFactory,
    practiceService,
    patSecurityService;

  //#region mockTemplate

  boolValue = true;

  var mockLocalStorageItem =
    '{ "DateFrom": null, "DateTo": null, "Notes": [{ "EntityId": "acf94586-c64f-433b-8eff-7ff70c0ae943", "NoteId": "2ac36652-5551-4e83-a471-443adf5943c5", "RevisionId": "c6d60bf1-fef1-4e71-8ced-053e27c9dbea", "PatientId": "1e057990-81f7-4fed-a4b1-b991cc3a99bb", "Note": "Second note modified", "NoteTypeId": 3, "ToothNumbers": null, "StatusTypeId": 2, "CreatedDate": "2017-05-18T21:42:30.9833951", "CreatedByName": "Bond, Jamerson", "CreatedByProfessionalDesignation": null, "CreatedByUserId": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "LockNotePriorTo24Hours": true, "NoteTitle": "Clinical Note", "DataTag": "AAAAAAAB/8w=", "UserModified": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "DateModified": "2017-05-18T21:42:30.9833951", "histories": [{ "EntityId": "f37f7ee3-81d6-442f-8896-5a1f71dff18c", "NoteId": "2ac36652-5551-4e83-a471-443adf5943c5", "RevisionId": "29728721-bf38-47f2-a8df-c574d4e9dccb", "PatientId": "1e057990-81f7-4fed-a4b1-b991cc3a99bb", "Note": "Second note modified", "NoteTypeId": 3, "ToothNumbers": null, "StatusTypeId": 2, "CreatedDate": "2017-05-18T21:17:16.2627494", "CreatedByName": "Bond, Jamerson", "CreatedByProfessionalDesignation": null, "CreatedByUserId": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "LockNotePriorTo24Hours": true, "NoteTitle": "Clinical Note", "DataTag": "AAAAAAAB/8o=", "UserModified": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "DateModified": "2017-05-18T21:17:16.2627494" }, { "EntityId": "e8716ae9-8648-43a7-854e-7d9fa7581a99", "NoteId": "2ac36652-5551-4e83-a471-443adf5943c5", "RevisionId": "aeb6fca8-13da-4d3e-8892-5a7dd6a1e412", "PatientId": "1e057990-81f7-4fed-a4b1-b991cc3a99bb", "Note": "Second note mdoified", "NoteTypeId": 3, "ToothNumbers": null, "StatusTypeId": 2, "CreatedDate": "2017-05-18T21:15:44.4925296", "CreatedByName": "Bond, Jamerson", "CreatedByProfessionalDesignation": null, "CreatedByUserId": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "LockNotePriorTo24Hours": true, "NoteTitle": "Clinical Note", "DataTag": "AAAAAAAB/8c=", "UserModified": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "DateModified": "2017-05-18T21:15:44.4925296" }, { "EntityId": "7168b7b1-4b04-47f8-b127-d94ad7a89c72", "NoteId": "2ac36652-5551-4e83-a471-443adf5943c5", "RevisionId": "2ac36652-5551-4e83-a471-443adf5943c5", "PatientId": "1e057990-81f7-4fed-a4b1-b991cc3a99bb", "Note": "Second note", "NoteTypeId": 3, "ToothNumbers": null, "StatusTypeId": 1, "CreatedDate": "2017-05-18T21:15:27.4016095", "CreatedByName": "Bond, Jamerson", "CreatedByProfessionalDesignation": null, "CreatedByUserId": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "LockNotePriorTo24Hours": true, "NoteTitle": "Clinical Note", "DataTag": "AAAAAAAB/8Y=", "UserModified": "331d1784-862a-e711-8cd3-f0d5bf93e9cc", "DateModified": "2017-05-18T21:15:27.4026127" }] }] }';

  var patientMock = {
    FirstName: 'Kissy',
    LastName: 'Suzuki',
    MiddleName: null,
    DateOfBirth: '1965-12-03',
    City: '',
    State: '',
    ZipCode: '',
    Gender: 'Female',
    PhoneType: 'Home',
    Height: 0,
    Weight: 0,
    HeightMetric: 0,
    WeightMetric: 0,
    UserId: '002211225588',
    MRN: null,
    Email: '',
    ApplicationId: 2,
    Address1: '',
    Address2: '',
    PostalCode: '',
    Phone: '2175403725',
  };

  var userMock = {
    FirstName: 'James',
    LastName: 'Bond',
    MiddleName: null,
    DateOfBirth: '1965-12-03',
    AddressLine1: '',
    AddressLine2: '',
    City: '',
    State: '',
    ZipCode: '',
    EmailAddress: '',
    Phones: [{ Type: 'Home', PhoneNumber: '2175403725' }],
  };

  patSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(boolValue),
    generateMessage: jasmine.createSpy().and.returnValue(''),
  };
  //#endregion
  beforeEach(
    module('Soar.Patient', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy().and.returnValue(''),
      };
      $provide.value('localize', localize);

      patientNotesFactory = {
        getNameAndDesignation: jasmine.createSpy().and.returnValue(''),
      };
      $provide.value('PatientNotesFactory', patientNotesFactory);

      usersFactory = {
        User: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(userMock),
        }),
      };
      $provide.value('UsersFactory', usersFactory);

      personFactory = {
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(patientMock),
        }),
      };
      $provide.value('PersonFactory', personFactory);

      practiceService = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('PracticeService', practiceService);
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
    $location,
    $q,
    $sce,
    $window,
    $timeout
  ) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    location = $location;
    routeParams = $routeParams;
    var window = $window;
    routeParams.patientId = '123456789';
    routeParams.storageId = '987654321';
    timeout = $timeout;

    // create note in local storage
    localStorage.setItem(
      'clinicalNotes_' + routeParams.storageId,
      mockLocalStorageItem
    );
    sessionStorage.setItem('userLocation', JSON.stringify({}));

    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: '12345678',
      },
    };

    location = {
      path: jasmine.createSpy(),
    };

    sce = $injector.get('$sce');
    ctrl = $controller('PatientNotesPrintController', {
      patSecurityService: patSecurityService,
      PatientNotesFactory: patientNotesFactory,
      UsersFactory: usersFactory,
      PersonFactory: personFactory,
      practiceService: practiceService,
      $scope: scope,
      $location: location,
      $routeParams: routeParams,
      $sce: sce,
      $rootScope: rootScope,
      $window: window,
      $timeout: timeout,
    });
    $rootScope.$apply();
    ctrl.$onInit();
  }));

  describe('ctrl.getCurrentUser ->', function () {
    it('should call usersFactory.User', function () {
      ctrl.getCurrentUser();
      expect(usersFactory.User).toHaveBeenCalledWith(
        rootScope.patAuthContext.userInfo.userid
      );
    });
  });

  describe(' scope.getDisplayNameAndDesignationForHistory->', function () {
    it('should call patientNotesFactory.getNameAndDesignation for each note histories', function () {
      var note = scope.clinicalNotes.Notes[0];
      scope.getDisplayNameAndDesignationForHistory(note);
      angular.forEach(note.histories, function (history) {
        expect(patientNotesFactory.getNameAndDesignation).toHaveBeenCalledWith(
          history
        );
      });
    });
  });

  describe(' scope.getDisplayNameAndDesignation->', function () {
    it('should call patientNotesFactory.getNameAndDesignation', function () {
      scope.getDisplayNameAndDesignation();
      angular.forEach(scope.clinicalNotes.Notes, function (note) {
        expect(patientNotesFactory.getNameAndDesignation).toHaveBeenCalledWith(
          note
        );
      });
    });
  });

  describe('ctrl.getPatient ->', function () {
    it('should call personFactory.getById with patientId', function () {
      ctrl.getPatient();
      expect(personFactory.getById).toHaveBeenCalledWith(scope.patientId);
    });
  });
});

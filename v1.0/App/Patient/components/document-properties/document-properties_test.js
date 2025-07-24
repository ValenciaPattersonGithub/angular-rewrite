describe('DocumentPropertiesController tests ->', function () {
  var ctrl,
    scope,
    currentLocation,
    locationService,
    documentsResponse,
    routeParams,
    referenceDataService,
    keyEvent;
  var patientValidationFactory,
    patientDocumentsFactory,
    timeout,
    personFactory,
    documentGroupsService;

  documentsResponse = {
    ExtendedStatusCode: null,
    Value: {
      FileAllocationId: 2,
      DateUploaded: '2016-08-04T18:22:13.7890968',
      DocumentGroupId: 5,
      DocumentId: 2,
      MimeType: 'image/jpeg',
      Name: 'grumpy.jpg',
      OriginalFileName: 'grumpy.jpg',
      ParentId: '2bd01c8f-4f5a-e611-8d9f-8086f2269c78',
      ParentType: 'Patient',
      UploadedByUserId: '2c8e08a3-cb59-e611-95c2-a4db3021bfa0',
      NumberOfBytes: 18136,
      DataTag: "{'RowVersion':'AAAAAAAAw1M='}",
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2016-08-04T18:22:13.7970984',
    },
    Count: null,
    InvalidProperties: null,
  };

  currentLocation = {
    name: '45 Hickory Industrial Ct.',
    id: '4',
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue(currentLocation),
      };
      $provide.value('locationService', locationService);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          users: 'users',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      patientValidationFactory = {
        PatientSearchValidation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      patientDocumentsFactory = {
        UpdateDirectoryAllocationId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('PatientDocumentsFactory', patientDocumentsFactory);

      personFactory = {
        PatientSearch: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('PersonFactory', personFactory);

      documentGroupsService = {
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: success =>
              success({
                Value: [
                  { Description: 'Treatment Plans' },
                  { Description: 'Test' },
                ],
              }),
          },
        }),
      };
      $provide.value('DocumentGroupsService', documentGroupsService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $timeout, $q) {
    routeParams = {};
    timeout = $timeout;
    routeParams.patientId = '1234567890';
    scope = $rootScope.$new();
    ctrl = $controller('DocumentPropertiesController', {
      $scope: scope,
      ModalFactory: {},
      $routeParams: routeParams,
    });

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });
  }));

  describe('documentGetSuccess function -> ', function () {
    it('should set scope.document and scope.originalDocument to res.Value and call getDocumentGroups', function () {
      ctrl.getDocumentGroups = jasmine.createSpy();
      expect(scope.document).toBeUndefined();
      expect(scope.originalDocument).toBeUndefined();
      ctrl.documentGetSuccess(documentsResponse);
      scope.$apply();
      expect(scope.document).toBe(documentsResponse.Value);
      expect(scope.originalDocument).toEqual(scope.document);
      expect(ctrl.getDocumentGroups).toHaveBeenCalled();
    });
  });

  describe('getDocumentGroups function -> ', function () {
    beforeEach(function () {
      scope.docGroupChanged = jasmine.createSpy();
    });

    it('should return all document groups when  document.Mimetype is not Digital', function () {
      scope.documentGroups = [];
      scope.document = { DocumentGroupId: 1, MimeType: 'Test' };
      expect(scope.originalDocument).toBeUndefined();
      ctrl.getDocumentGroups();
      expect(scope.documentGroups).toEqual([
        { Description: 'Test' },
        { Description: 'Treatment Plans' },
      ]);
      expect(scope.docGroupChanged).toHaveBeenCalled();
    });

    it('should filter treatment plans group when  document.Mimetype is Digital', function () {
      scope.documentGroups = [];
      scope.document = { DocumentGroupId: 1, MimeType: 'Digital' };
      expect(scope.originalDocument).toBeUndefined();
      ctrl.getDocumentGroups();
      expect(scope.documentGroups).toEqual([{ Description: 'Test' }]);
      expect(scope.docGroupChanged).toHaveBeenCalled();
    });
  });

  describe('documentUpdateSuccess function -> ', function () {
    it('should set scope.document and scope.originalDocument to res.Value', function () {
      expect(scope.document).toBeUndefined();
      expect(scope.originalDocument).toBeUndefined();
      ctrl.documentUpdateSuccess(documentsResponse);
      expect(scope.document).toBe(documentsResponse.Value);
      expect(scope.originalDocument).toEqual(scope.document);
    });
  });

  describe('displayMimeType function -> ', function () {
    it('should return file extension only', function () {
      expect(scope.displayMimeType('image/jpeg')).toBe('jpeg');
    });

    it("shouldn't do anything if invalid mime type is passed", function () {
      expect(scope.displayMimeType('bad_mime_type')).toBe('bad_mime_type');
    });
  });

  describe('docGroupChanged function -> ', function () {
    beforeEach(function () {});

    it('should return true if parent id has changed', function () {
      spyOn(ctrl, 'getMatchingDocumentGroupDescription').and.returnValue('EOB');
      scope.docGroupChanged(1);
      expect(scope.patientDisabled).toBe(true);
      expect(scope.groupTypeDisabled).toBe(false);
    });

    it('should return true if parent id has changed', function () {
      spyOn(ctrl, 'getMatchingDocumentGroupDescription').and.returnValue(
        'Consent'
      );
      scope.docGroupChanged(1);
      expect(scope.patientDisabled).toBe(true);
      expect(scope.groupTypeDisabled).toBe(true);
    });

    it('should return true if parent id has changed', function () {
      spyOn(ctrl, 'getMatchingDocumentGroupDescription').and.returnValue(
        'Account'
      );
      scope.docGroupChanged(1);
      expect(scope.patientDisabled).toBe(false);
      expect(scope.groupTypeDisabled).toBe(false);
    });

    it('should return true if parent id has changed', function () {
      spyOn(ctrl, 'getMatchingDocumentGroupDescription').and.returnValue(
        'Medical History'
      );
      scope.docGroupChanged(1);
      expect(scope.patientDisabled).toBe(true);
      expect(scope.groupTypeDisabled).toBe(false);
    });
  });
  describe('scope.KeyPressed function -> ', function () {
    it('should return true if keycode is same', function () {
      keyEvent = {
        charCode: 59,
        code: 'Semicolon',
        key: ';',
        keyCode: 78,
        type: 'keypress',
      };
      var returnValue = scope.KeyPressed(keyEvent);
      expect(returnValue).toBe(false);
    });
  });

  describe('ctrl.initializeSearch method -> ', function () {});

  describe('scope.clearPerson method -> ', function () {
    it('should call initializeSearch', function () {
      spyOn(ctrl, 'initializeSearch');
      scope.clearPerson();
      expect(ctrl.initializeSearch).toHaveBeenCalled();
    });
  });

  describe('$scope.save method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'validateDocument').and.callFake(function () {});
      spyOn(ctrl, 'updateDocument').and.callFake(function () {});
      scope.document = { ParentId: '1234' };
      scope.originalDocument = { ParentId: '5234' };
    });

    it('should call validateDocument', function () {
      scope.save();
      expect(ctrl.validateDocument).toHaveBeenCalled();
    });

    it('should call patientDocumentsFactory.UpdateDirectoryAllocationId if document.ParentId has changed and formIsValid', function () {
      scope.formIsValid = true;
      scope.save();
      expect(
        patientDocumentsFactory.UpdateDirectoryAllocationId
      ).toHaveBeenCalledWith(scope.document);
    });

    it('should call ctrl.updateDocument if document.ParentId has not changed and formIsValid', function () {
      scope.formIsValid = true;
      scope.originalDocument.ParentId = scope.document.ParentId;
      scope.save();
      expect(ctrl.updateDocument).toHaveBeenCalled();
    });

    it('should not call ctrl.updateDocument if formIsValid is not', function () {
      scope.formIsValid = false;
      scope.save();
      expect(ctrl.updateDocument).not.toHaveBeenCalledWith(scope.document);
    });
  });

  describe('ctrl.changePatientOnDocument method -> ', function () {
    var differentPatient = {};
    beforeEach(function () {
      differentPatient = {
        PatientId: '4321',
        DirectoryAllocationId: '9876',
        FirstName: 'Duncan',
        LastName: 'Frapples',
        PatientCode: 'DUNFRA',
      };
      scope.document = { ParentId: '1234', $$DirectoryAllocationId: '6789' };
    });

    it('should set document.ParentId to the selected patient.PatientId', function () {
      ctrl.changePatientOnDocument(differentPatient);
      expect(scope.document.ParentId).toBe(differentPatient.PatientId);
    });

    it('should set document.$$DirectoryAllocationId to the selected patient.DirectoryAllocationId', function () {
      ctrl.changePatientOnDocument(differentPatient);
      expect(scope.document.$$DirectoryAllocationId).toBe(
        differentPatient.DirectoryAllocationId
      );
    });

    it('should set searchTerm to the selected patient name and patient code', function () {
      scope.searchTerm = 'Bob Frapples';
      var newSearchTerm =
        differentPatient.FirstName +
        ' ' +
        differentPatient.LastName +
        '          ' +
        '(' +
        differentPatient.PatientCode +
        ')';
      ctrl.changePatientOnDocument(differentPatient);
      expect(scope.searchTerm).toBe(newSearchTerm);
    });
  });

  describe('ctrl.validateSelectedPatient method -> ', function () {
    var person = {};
    beforeEach(function () {
      person = { PatientId: '1234' };
    });

    it('should call patientValidationFactory.PatientSearchValidation', function () {
      scope.document = { ParentId: '1234' };
      ctrl.validateSelectedPatient(person);
      expect(
        patientValidationFactory.PatientSearchValidation
      ).toHaveBeenCalledWith(person);
    });
  });

  describe('scope.onSelectPatient method -> ', function () {
    var differentPatient = {};
    beforeEach(function () {
      spyOn(ctrl, 'validateSelectedPatient');
      differentPatient = {
        PatientId: '4321',
        DirectoryAllocationId: '9876',
        FirstName: 'Duncan',
        LastName: 'Frapples',
        PatientCode: 'DUNFRA',
      };
    });

    it('should callctrl.validateSelectedPatient with selected person', function () {
      scope.document = { ParentId: '5555' };
      scope.onSelectPatient(differentPatient);
      expect(ctrl.validateSelectedPatient).toHaveBeenCalledWith(
        differentPatient
      );
    });
  });

  describe('ctrl.validateDocument method -> ', function () {
    beforeEach(function () {
      scope.document = {
        ParentId: '1234',
        DocumentGroupId: 4,
        Name: 'DocumentName',
      };
    });

    it('should set scope.formIsValid to false if no ParentId on document', function () {
      scope.document.ParentId = null;
      ctrl.validateDocument();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set scope.formIsValid to false if no DocumentGroupId on document', function () {
      scope.document.DocumentGroupId = null;
      ctrl.validateDocument();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set scope.formIsValid to false if no Name on document', function () {
      scope.document.Name = '';
      ctrl.validateDocument();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set scope.formIsValid to true if document has required properties', function () {
      ctrl.validateDocument();
      expect(scope.formIsValid).toBe(true);
    });
  });

  describe('ctrl.checkChanges method -> ', function () {
    beforeEach(function () {
      scope.document = {
        ParentId: '1234',
        DocumentGroupId: 4,
        Name: 'DocumentName',
        ToothNumbers: '1,2,3',
      };
      scope.originalDocument = {
        ParentId: '1234',
        DocumentGroupId: 4,
        Name: 'DocumentName',
        ToothNumbers: '1,2,3',
      };
      scope.dataHasChanged = false;
    });

    it('should set scope.dataHasChanged to true if ParentId has changed', function () {
      scope.document.ParentId = '2222';
      ctrl.checkChanges();
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should set scope.dataHasChanged to true if DocumentGroupId has changed', function () {
      scope.document.DocumentGroupId = 5;
      ctrl.checkChanges();
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should set scope.dataHasChanged to true if Name has changed', function () {
      scope.document.Name = 'DocName';
      ctrl.checkChanges();
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should set scope.dataHasChanged to true if ToothNumbers has changed', function () {
      scope.document.ToothNumbers = '1,2,3,4';
      ctrl.checkChanges();
      expect(scope.dataHasChanged).toBe(true);
    });

    it('should not set dataHasChanged to true when tooth numbers do not change', function () {
      scope.document.ToothNumbers = '1,2,3';
      ctrl.checkChanges();
      expect(scope.dataHasChanged).toBe(false);
    });
  });

  describe('ctrl.validateSearchString function ->', function () {
    it('should return true if searchString is valid for phone search (format XXX-)', function () {
      var mockSearchString = '217-';
      expect(ctrl.validateSearchString(mockSearchString)).toBe(true);

      mockSearchString = '217-999';
      expect(ctrl.validateSearchString(mockSearchString)).toBe(true);
    });

    it('should return true if searchString is valid for date search (if format XX- or XX/ allow search)', function () {
      var mockSearchString = '12-';
      expect(ctrl.validateSearchString(mockSearchString)).toBe(true);

      mockSearchString = '12/';
      expect(ctrl.validateSearchString(mockSearchString)).toBe(true);
    });

    it('should return false if searchString is not valid for phone (if format X or XX or XXX prevent search)', function () {
      var mockSearchString = '217';
      expect(ctrl.validateSearchString(mockSearchString)).toBe(false);

      mockSearchString = '21';
      expect(ctrl.validateSearchString(mockSearchString)).toBe(false);
    });

    it('should return false if searchString is not valid for date search (if format XX )', function () {
      var mockSearchString = '12';
      expect(ctrl.validateSearchString(mockSearchString)).toBe(false);
    });
  });

  describe('searchTerm watch - >', function () {
    beforeEach(function () {
      spyOn(ctrl, 'activateSearch').and.callFake(function () {});
    });

    it('should call activateSearch function if validSearch', function () {
      scope.searchTerm = '217';
      scope.$apply();
      expect(ctrl.activateSearch).not.toHaveBeenCalled();
      scope.searchTerm = '217-';
      scope.$apply();
      timeout.flush();
      expect(ctrl.activateSearch).toHaveBeenCalledWith(scope.searchTerm);
    });

    it('should not call activateSearch function if searchTerm less than 2 char', function () {
      scope.searchTerm = 'Bo';
      scope.$apply();
      expect(ctrl.activateSearch).not.toHaveBeenCalled();
      scope.searchTerm = 'Bob';
      scope.$apply();
      timeout.flush();
      expect(ctrl.activateSearch).toHaveBeenCalledWith(scope.searchTerm);
    });
  });

  describe('scope.search watch - >', function () {
    var searchParams = {};
    beforeEach(function () {
      ctrl.isQueryingServer = false;
      ctrl.resultCount = 0;
      scope.searchResults = [];
      scope.searchTerm = 'Bob';
      scope.document = { ParentId: '1234' };
      scope.searchString = 'Bob';
      ctrl.includeInactive = false;
      searchParams = {
        searchFor: scope.searchString,
        skip: scope.searchResults.length,
        take: 45,
        sortBy: 'LastName',
        includeInactive: ctrl.includeInactive,
        excludePatient: scope.document.ParentId,
      };
      scope.document = {
        ParentId: '1234',
        DocumentGroupId: 4,
        Name: 'DocumentName',
        ToothNumbers: '1,2,3',
      };
    });

    it('should do nothing if term is defined', function () {
      scope.searchString = '';
      scope.searchTerm = null;
      scope.search(scope.searchTerm);
      expect(personFactory.PatientSearch).not.toHaveBeenCalled();
    });

    it('should call personFactory with params if term meets requirements', function () {
      scope.searchString = 'Bob';
      scope.searchTerm = null;
      scope.search(null);
      expect(personFactory.PatientSearch).toHaveBeenCalledWith(searchParams);
    });
  });

  describe('ctrl.onSearchSuccess method -> ', function () {
    var res;
    beforeEach(function () {
      res = {
        Count: 3,
        Value: [
          { PatientId: '1234' },
          { PatientId: '1236' },
          { PatientId: '1239' },
        ],
      };
      scope.searchResults = [];
    });

    it('should call initializeSearch', function () {
      ctrl.onSearchSuccess(res);
      expect(ctrl.isQueryingServer).toBe(false);
      expect(ctrl.resultCount).toEqual(res.Count);
      expect(scope.searchResults.length).toEqual(res.Value.length);
    });
  });

  describe('ctrl.onSearchSuccess method -> ', function () {
    beforeEach(function () {
      scope.searchResults = [];
    });

    it('should call initializeSearch', function () {
      scope.onSearchError();
      expect(ctrl.isQueryingServer).toBe(false);
      expect(ctrl.resultCount).toEqual(0);
      expect(scope.noSearchResults).toBe(true);
    });
  });

  describe('scope.clearResult method -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'initializeSearch').and.callFake(function () {});
      scope.searchResults = [];
    });

    it('should call initializeSearch', function () {
      scope.clearResult();
      expect(scope.formattedPatientName).toBe('');
      expect(ctrl.initializeSearch).toHaveBeenCalled();

      expect(scope.disablePersonSearch).toBe(false);
      expect(scope.showPatientLocationError).toBe(false);
    });
  });

  describe('scope.clearResult method -> ', function () {
    beforeEach(function () {
      spyOn(scope, 'search').and.callFake(function () {});
      scope.searchResults = [];
      scope.searchString = 'Bob';
    });

    it('should reset search params if searchTerm is different than searchString', function () {
      var searchTerm = 'Bob F';
      ctrl.activateSearch(searchTerm);

      expect(scope.limit).toBe(15);
      expect(scope.limitResults).toBe(true);
      expect(scope.searchString).toBe(searchTerm);
      expect(ctrl.resultCount).toBe(0);
      expect(scope.searchResults).toEqual([]);
      expect(scope.search).toHaveBeenCalled();
    });
  });
});

/*
  $scope.onSearchError = function () {
            ctrl.isQueryingServer = false;
            ctrl.resultCount = 0;
            $scope.searchResults = [];
            $scope.noSearchResults = true;
        };
        */

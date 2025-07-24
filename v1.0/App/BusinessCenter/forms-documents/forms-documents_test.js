describe('FormsDocumentsController tests ->', function () {
  var deferred, http;
  var documentService;
  var ctrl,
    scope,
    cacheFactory,
    currentLocation,
    locationService,
    patients,
    documentGroupsList,
    location,
    fileUploadFactory,
    patientLogic;
  var informedConsentFactory,
    modalFactory,
    documentsLoadingService,
    formsDocumentsFactory,
    documentGroupsFactory;

  //#region mocks

  var documentListMock = [
    {
      DocumentId: 1,
      DateUploaded: '2019-04-01',
      $$FormattedName: 'Bob Frapples',
      Name: 'eob.txt',
      OriginalFileName: 'eob.txt',
      MimeType: 'Digital',
      $$FormattedDate: '04/01/2019',
    },
    {
      DocumentId: 2,
      DateUploaded: '2019-03-25',
      $$FormattedName: 'Bob Frapples',
      Name: 'specialist.docx',
      OriginalFileName: 'specialist.docx',
      MimeType: '',
      $$FormattedDate: '03/25/2019',
    },
    {
      DocumentId: 3,
      DateUploaded: '2019-02-21',
      $$FormattedName: 'Bob Frapples',
      Name: 'clinical.txt',
      OriginalFileName: 'clinical.txt',
      MimeType: '',
      $$FormattedDate: '02/21/2019',
    },
    {
      DocumentId: 4,
      DateUploaded: '2019-01-20',
      $$FormattedName: 'Bob Frapples',
      Name: 'consent.txt',
      OriginalFileName: 'consent.txt',
      MimeType: '',
      $$FormattedDate: '01/20/2019',
    },
  ];
  var documentGroupsMock = [];
  documentGroupsMock.push({
    Description: 'Medical History',
    DocumentGroupId: 1,
  });
  documentGroupsMock.push({ Description: 'Insurance', DocumentGroupId: 2 });
  documentGroupsMock.push({ Description: 'Consent', DocumentGroupId: 3 });
  documentGroupsMock.push({ Description: 'Account', DocumentGroupId: 4 });
  documentGroupsMock.push({
    Description: 'Other Clinical',
    DocumentGroupId: 5,
  });
  documentGroupsMock.push({ Description: 'Lab', DocumentGroupId: 6 });
  documentGroupsMock.push({ Description: 'EOB', DocumentGroupId: 7 });
  documentGroupsMock.push({
    Description: 'Treatment Plans',
    DocumentGroupId: 8,
  });
  documentGroupsMock.push({ Description: 'HIPAA', DocumentGroupId: 9 });
  documentGroupsMock.push({ Description: 'Specialist', DocumentGroupId: 11 });
  documentGroupsMock.push({ Description: 'Clinical', DocumentGroupId: 0 });

  //#endregion

  currentLocation = {
    name: '45 Hickory Industrial Ct.',
    id: '4',
  };

  var informedConsentMock = {
    PatientCode: null,
    TreatmentPlanId: null,
    TreatmentPlanName: null,
    ProviderComments: '',
    Notes: '',
    Message: '',
    SignatureFileAllocationId: null,
    Services: [],
  };

  var informedConsentServiceMock = {
    ServiceTransactionId: null,
  };

  patients = [
    {
      FirstName: 'Jordan',
      LastName: 'Schlansky',
      PatientCode: 'SCHJO1',
      PreferredLocation: '4',
      PatientId: 22,
      docList: [
        {
          DocumentId: 1,
          ParentId: 22,
          Name: 'scans.pdf',
          DocumentGroupId: 33,
        },
        {
          DocumentId: 1,
          ParentId: 22,
          Name: 'xrays.png',
          DocumentGroupId: 33,
        },
      ],
    },
    {
      FirstName: 'Larry',
      LastName: 'Melman',
      PatientCode: 'MELLO1',
      PreferredLocation: '2',
      PatientId: 23,
      docList: [],
    },
    {
      FirstName: 'My',
      LastName: 'Patient',
      PatientCode: 'mypatO1',
      PreferredLocation: '2',
      PatientId: 1,
      docList: [],
    },
  ];

  documentGroupsList = {
    ExtendedStatusCode: null,
    Value: [
      {
        DocumentGroupId: 1,
        Description: 'Account',
        DataTag: '{"RowVersion":"AAAAAAAAJ70="}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-08-18T21:01:27.5190874',
      },
      {
        DocumentGroupId: 2,
        Description: 'Specialist',
        DataTag: '{"RowVersion":"AAAAAAAAJ74="}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-08-18T21:01:27.5190874',
      },
      {
        DocumentGroupId: 3,
        Description: 'Lab',
        DataTag: '{"RowVersion":"AAAAAAAAJ78="}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-08-18T21:01:27.5190874',
      },
      {
        DocumentGroupId: 4,
        Description: 'Consent',
        DataTag: '{"RowVersion":"AAAAAAAAJ8A="}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-08-18T21:01:27.5700925',
      },
      {
        DocumentGroupId: 5,
        Description: 'HIPAA',
        DataTag: '{"RowVersion":"AAAAAAAAJ8E="}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-08-18T21:01:27.5810936',
      },
      {
        DocumentGroupId: 6,
        Description: 'Insurance',
        DataTag: '{"RowVersion":"AAAAAAAAJ8I="}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-08-18T21:01:27.6020957',
      },
      {
        DocumentGroupId: 7,
        Description: 'Other Clinical',
        DataTag: '{"RowVersion":"AAAAAAAAJ8M="}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-08-18T21:01:27.7661121',
      },
    ],
    Count: null,
    InvalidProperties: null,
  };

  beforeEach(module('Soar.Patient'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue(currentLocation),
      };
      $provide.value('locationService', locationService);
      cacheFactory = {
        get: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('CacheFactory', cacheFactory);

      var urlParams = { patientId: '1' };
      location = { search: jasmine.createSpy().and.returnValue(urlParams) };

      informedConsentFactory = {
        access: jasmine.createSpy().and.returnValue({}),
        InformedConsentDto: jasmine
          .createSpy()
          .and.returnValue(informedConsentMock),
        InformedConsentServiceDto: jasmine
          .createSpy()
          .and.returnValue(informedConsentServiceMock),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        view: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('InformedConsentFactory', informedConsentFactory);

      patientLogic = {
        GetPatientById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        GetFormattedName: jasmine.createSpy().and.returnValue('Bob Frapples'),
      };
      $provide.value('PatientLogic', patientLogic);

      modalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ConfirmModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Modal: jasmine.createSpy().and.returnValue({
          result: {
            then: function (fn) {
              fn();
            },
          },
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      //formsDocumentsFactory
      formsDocumentsFactory = {
        UpdateRecentDocuments: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('FormsDocumentsFactory', formsDocumentsFactory);

      documentGroupsFactory = {
        SaveDocumentGroup: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        DocumentGroups: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('DocumentGroupsFactory', documentGroupsFactory);

      documentsLoadingService = {
        executeDownload: jasmine.createSpy().and.callFake(function () {}),
      };
      $provide.value('FileUploadFactory', documentsLoadingService);

      fileUploadFactory = {
        CreatePatientDirectory: jasmine
          .createSpy()
          .and.callFake(function () {}),
      };
      $provide.value('FileUploadFactory', fileUploadFactory);

      $provide.value('PatientDocumentsFactory', {});
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q, $httpBackend) {
    http = $httpBackend;
    http.delete = function () {};

    deferred = $q.defer();
    documentService = {
      delete: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    scope = $rootScope.$new();
    ctrl = $controller('FormsDocumentsController', {
      $scope: scope,
      uriService: {},
      $location: location,
      DocumentService: documentService,
    });
    scope.documentGroups = documentGroupsList.Value;
  }));

  describe('loaded watch -> ', function () {
    beforeEach(function () {
      spyOn(scope, 'setActiveDirectory').and.callFake(function () {});
      scope.currentPatient = { PatientId: 1234 };
      scope.patientSelected = null;
    });

    it('should call scope.setActiveDirectory with scope.currentPatient and empty string if scope.patientSelected is null and loading complete', function () {
      scope.loaded = { DocumentGroups: true, Documents: false };
      scope.$apply();
      scope.loaded = { DocumentGroups: true, Documents: true };
      scope.$apply();
      expect(scope.setActiveDirectory).toHaveBeenCalledWith(
        scope.currentPatient,
        ''
      );
    });

    it('should call scope.setActiveDirectory with scope.currentPatient and Insurance if scope.patientSelected is not null and loading complete', function () {
      scope.patientSelected = true;
      scope.loaded = { DocumentGroups: true, Documents: false };
      scope.$apply();
      scope.loaded = { DocumentGroups: true, Documents: true };
      scope.$apply();
      expect(scope.setActiveDirectory).toHaveBeenCalledWith(
        scope.currentPatient,
        'Insurance'
      );
    });

    describe('ctrl.setCustomProperties function -> ', function () {
      it('should set $$FormattedDate on scope.activeDocumentList', function () {
        scope.activeDocumentList = [
          { DocumentId: 1, DateUploaded: '2019-04-01' },
          { DocumentId: 2, DateUploaded: '2019-03-25' },
        ];
        ctrl.setCustomProperties();
        expect(scope.activeDocumentList[0].$$FormattedDate).toEqual(
          '04/01/2019'
        );
        expect(scope.activeDocumentList[1].$$FormattedDate).toEqual(
          '03/25/2019'
        );
      });
    });

    describe('scope.getTab function ->', function () {
      it('should set window.location when index is 0', function () {
        scope.getTab(0);

        expect(window.location.toString()).toContain(
          '#/BusinessCenter/FormsDocuments'
        );
      });

      it('should not set window.location when index is 1', function () {
        var before = window.location;

        scope.getTab(1);

        expect(window.location).toBe(before);
      });

      it('should not set window.location when index is 2', function () {
        var before = window.location;

        scope.getTab(2);

        expect(window.location).toBe(before);
      });

      it('should set window.location when index is 3', function () {
        scope.getTab(3);

        expect(window.location.toString()).toContain(
          '#/BusinessCenter/FormsDocuments'
        );
      });

      it('should not set window.location when index is other', function () {
        var before = window.location;

        scope.getTab(4);

        expect(window.location).toBe(before);
      });
    });

    describe('cscope.filterCol function -> ', function () {
      beforeEach(function () {
        scope.activeDocumentList = _.cloneDeep(documentListMock);
        scope.listFilter = {
          Name: '',
          PatientName: '',
          OriginalFileName: '',
          Date: '',
          MimeType: '',
        };
      });

      it('filter scope.activeDocumentList by listFilter.PatientName', function () {
        scope.listFilter.PatientName = 'Larry';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([]);

        scope.listFilter.PatientName = 'Bob';

        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual(scope.activeDocumentList);
      });

      it('filter scope.activeDocumentList by listFilter.Name', function () {
        scope.listFilter.Name = 'eod.txt';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([]);

        scope.listFilter.Name = 'eob.txt';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([
          scope.activeDocumentList[0],
        ]);
      });

      it('filter scope.activeDocumentList by listFilter.OriginalFileName', function () {
        scope.listFilter.OriginalFileName = 'eod.txt';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([]);

        scope.listFilter.OriginalFileName = 'eob.txt';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([
          scope.activeDocumentList[0],
        ]);
      });

      it('filter scope.activeDocumentList by listFilter.Date', function () {
        var documentDate = new Date(
          scope.activeDocumentList[2].$$FormattedDate
        );
        // add a day
        scope.listFilter.Date = documentDate.setDate(
          documentDate.getDate() + 1
        );

        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([]);

        scope.listFilter.Date = scope.activeDocumentList[2].$$FormattedDate;
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([
          scope.activeDocumentList[2],
        ]);
      });

      it('filter scope.activeDocumentList by listFilter.MimeType', function () {
        scope.listFilter.MimeType = 'Any';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([]);

        scope.listFilter.MimeType = 'Digital';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([
          scope.activeDocumentList[0],
        ]);
      });

      it('filter scope.activeDocumentList by combinations in listFilter', function () {
        scope.listFilter.MimeType = 'Digital';
        scope.listFilter.PatientName = 'Roy';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([]);

        scope.listFilter.MimeType = 'Digital';
        scope.listFilter.PatientName = 'Bob';
        scope.filterCol();
        expect(scope.filteredDocumentList).toEqual([
          scope.activeDocumentList[0],
        ]);
      });
    });
  });

  describe('scope.setActiveDirectory function -> ', function () {
    var documentGroupDescription = '';
    var patientId = '1234';

    beforeEach(function () {
      scope.documentGroups = _.cloneDeep(documentGroupsMock);
      scope.patient = { PatientId: '1234', docList: [{}, {}, {}] };
      spyOn(ctrl, 'setCustomProperties').and.callFake(function () {});
      spyOn(ctrl, 'setDocumentCount').and.callFake(function () {});
      ctrl.recentDocumentsList = [{}, {}, {}];
      scope.patient.docList = _.cloneDeep(documentListMock);
    });

    it('should set scope.activeDocumentGroup to matching documentGroup by activeDocumentList.Descripion', function () {
      documentGroupDescription = scope.documentGroups[0].Description;
      scope.setActiveDirectory(patientId, documentGroupDescription);
      expect(scope.activeDocumentGroup).toEqual(scope.documentGroups[0]);
    });

    it('should set scope.activeDir.directory to matching documentGroup.Description by activeDocumentList.Descripion', function () {
      documentGroupDescription = scope.documentGroups[0].Description;
      scope.setActiveDirectory(patientId, documentGroupDescription);
      expect(scope.activeDir.directory).toEqual(
        scope.documentGroups[0].Description
      );
    });

    it('should set scope.activeDocumentList to recentDocumentList if documentGroupDescription is Recents', function () {
      documentGroupDescription = 'Recents';
      scope.setActiveDirectory(patientId, documentGroupDescription);
      expect(scope.activeDocumentList).toEqual(ctrl.recentDocumentsList);
    });

    it('should set scope.activeDocumentList to scope.patient.docList if documentGroupDescription is not Recents', function () {
      documentGroupDescription = scope.documentGroups[0].Description;
      scope.setActiveDirectory(patientId, documentGroupDescription);
      expect(scope.activeDocumentList).toEqual(scope.patient.docList);
    });

    it('should call ctrl.setCustomProperties if documentGroupDescription is not Recents', function () {
      documentGroupDescription = scope.documentGroups[0].Description;
      scope.setActiveDirectory(patientId, documentGroupDescription);
      expect(ctrl.setCustomProperties).toHaveBeenCalled();
      expect(ctrl.setDocumentCount).toHaveBeenCalled();
    });

    it('should cal ctrl.seCustomProperties and ctrl.setDocumentCount when setActiveDirectory is called', function () {
      scope.setActiveDirectory(patientId, documentGroupDescription);
      expect(ctrl.setCustomProperties).toHaveBeenCalled();
      expect(ctrl.setDocumentCount).toHaveBeenCalled();
    });
  });

  describe('ctrl.resetPatientDouments function -> ', function () {
    beforeEach(function () {
      scope.activeDocumentList = [
        { DocumentId: 1, DateUploaded: '2019-04-01' },
        { DocumentId: 2, DateUploaded: '2019-03-25' },
      ];
      ctrl.recentDocumentList = [
        { Name: 'Recent Docment 1' },
        { Name: 'Recent Docment 2' },
        { Name: 'Recent Docment 3' },
      ];
      scope.activeParentGroup = documentGroupsMock[0];
    });

    // TODO fix this test
    it('should reset scope.activeDocumentList to ctrl.recentDocumentList when patient is unselected', function () {
      ctrl.resetPatientDouments();
      //expect(scope.activeDocumentList).toEqual(ctrl.recentDocumentList);
      expect(scope.activeDir.directory).toEqual('Recents');
    });

    it('should reset scope.activeParentGroup to null when patient is unselected', function () {
      ctrl.resetPatientDouments();
      expect(scope.activeParentGroup).toBe(null);
    });

    it('should reset scope.documentGroups DocumentCounts to 0', function () {
      var i = 0;
      _.forEach(scope.documentGroups, function (documentGroup) {
        documentGroup.$$DocumentCount = i;
        i++;
      });
      ctrl.resetPatientDouments();
      _.forEach(scope.documentGroups, function (documentGroup) {
        expect(documentGroup.$$DocumentCount).toBe(0);
      });
    });
  });

  describe('patient watch -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'resetPatientDouments').and.callFake(function () {});
      scope.patient = { PatientId: 1234 };
    });

    it('should call scope.setActiveDirectory with scope.currentPatient and empty string if scope.patientSelected is null and loading complete', function () {
      scope.patient = { PatientId: 1234 };
      scope.$apply();
      scope.patient = null;
      scope.$apply();
      expect(ctrl.resetPatientDouments).toHaveBeenCalled();
    });
  });

  describe('scope.setActiveParentGroup function -> ', function () {
    var documentGroup = {};
    beforeEach(function () {
      documentGroup = _.cloneDeep(documentGroupsMock[0]);
    });

    it('should reset activeParentGroup to null if documentGroup does not match activeParentGroup', function () {
      scope.activeParentGroup = _.cloneDeep(documentGroupsMock[1]);
      scope.setActiveParentGroup(documentGroup);
      expect(scope.activeParentGroup).toEqual(documentGroup);
    });

    it('should reset activeParentGroup to null if documentGroup matches activeParentGroup', function () {
      scope.activeParentGroup = _.cloneDeep(documentGroupsMock[0]);
      scope.setActiveParentGroup(documentGroup);
      expect(scope.activeParentGroup).toBe(null);
    });
  });

  describe('scope.parentGroupsFilter function -> ', function () {
    var documentGroup = {};
    beforeEach(function () {
      documentGroup = _.cloneDeep(documentGroupsMock[0]);
    });

    it('should return true if documentGroup.$$parentGroupId is null', function () {
      documentGroup.$$parentGroupId = null;
      expect(scope.parentGroupsFilter(documentGroup)).toBe(true);
    });

    it('should return false if documentGroup.$$parentGroupId is not null', function () {
      documentGroup.$$parentGroupId = 10;
      expect(scope.parentGroupsFilter(documentGroup)).toBe(false);
    });
  });

  describe('ctrl.setParentGroups function -> ', function () {
    var clinicalGroup = {};
    var insuranceGroup = {};
    beforeEach(function () {
      scope.documentGroups = _.cloneDeep(documentGroupsMock);
      clinicalGroup = _.find(scope.documentGroups, function (documentGroup) {
        return documentGroup.Description === 'Clinical';
      });
      insuranceGroup = _.find(scope.documentGroups, function (documentGroup) {
        return documentGroup.Description === 'Insurance';
      });
    });

    it('should set documentGroup.$$parentGroupId to clinical DocumentGroup if Description is Lab, Consent, Specialist, HIPPA, Other Clinical', function () {
      ctrl.setParentGroups();
      _.forEach(scope.documentGroups, function (documentGroup) {
        if (
          documentGroup.Description === 'Lab' ||
          documentGroup.Description === 'Consent' ||
          documentGroup.Description === 'Specialist' ||
          documentGroup.Description === 'HIPAA' ||
          documentGroup.Description === 'Other Clinical'
        ) {
          expect(documentGroup.$$parentGroupId).toEqual(
            clinicalGroup.DocumentGroupId
          );
        }
      });
    });

    it('should set documentGroup.$$parentGroupId to insurance DocumentGroup if Description is EOB', function () {
      ctrl.setParentGroups();
      _.forEach(scope.documentGroups, function (documentGroup) {
        if (documentGroup.Description === 'EOB') {
          expect(documentGroup.$$parentGroupId).toEqual(
            insuranceGroup.DocumentGroupId
          );
        }
      });
    });

    it('should set documentGroup.$$parentGroupId to null if Description is not Lab, Consent, Specialist, HIPPA, Other Clinical, or EOB', function () {
      ctrl.setParentGroups();
      _.forEach(scope.documentGroups, function (documentGroup) {
        if (
          documentGroup.Description !== 'Lab' &&
          documentGroup.Description !== 'Consent' &&
          documentGroup.Description !== 'Specialist' &&
          documentGroup.Description !== 'HIPAA' &&
          documentGroup.Description !== 'EOB' &&
          documentGroup.Description !== 'Other Clinical'
        ) {
          expect(documentGroup.$$parentGroupId).toEqual(null);
        }
      });
    });

    it('should set documentGroup.$$childGroups for documentGroups that are parentGroups', function () {
      ctrl.setParentGroups();
      expect(clinicalGroup.$$childGroups[0].DocumentGroupId).toEqual(3);
      expect(clinicalGroup.$$childGroups[1].DocumentGroupId).toEqual(5);
      expect(clinicalGroup.$$childGroups[2].DocumentGroupId).toEqual(6);
      expect(clinicalGroup.$$childGroups[3].DocumentGroupId).toEqual(9);
      expect(clinicalGroup.$$childGroups[4].DocumentGroupId).toEqual(11);
      expect(insuranceGroup.$$childGroups[0].DocumentGroupId).toEqual(7);
    });

    it('should set documentGroup.$$IsOpen for documentGroups that are parentGroups', function () {
      ctrl.setParentGroups();
      _.forEach(scope.documentGroups, function (documentGroup) {
        if (documentGroup.$$childGroups.length === 0) {
          expect(documentGroup.$$IsOpen).toBe(false);
        } else {
          expect(documentGroup.$$IsOpen).toBe(true);
        }
      });
    });
  });

  describe('scope.parentGroupsFilter function -> ', function () {
    var documentGroup = {};
    beforeEach(function () {
      documentGroup = _.cloneDeep(documentGroupsMock[0]);
    });

    it('should return true if documentGroup.$$parentGroupId is null', function () {
      documentGroup.$$parentGroupId = null;
      expect(scope.parentGroupsFilter(documentGroup)).toBe(true);
    });

    it('should return false if documentGroup.$$parentGroupId is not null', function () {
      documentGroup.$$parentGroupId = 10;
      expect(scope.parentGroupsFilter(documentGroup)).toBe(false);
    });
  });

  describe('ctrl.addFormattedName function -> ', function () {
    var document = {};
    beforeEach(function () {
      document = _.cloneDeep(documentListMock[0]);
      document.DocumentId = 1;
      scope.activeDocumentList = [{ DocumentId: 1 }, { DocumentId: 2 }];
    });

    it('should should set $$FormattedName on document based on patient', function () {
      document.$$FormattedName = undefined;
      var patient = patients[1];
      patient.FirstName = 'Bob';
      patient.LastName = 'Frapples';
      patient.PreferredName = 'Bob';
      patient.MiddleName = 'N';
      ctrl.addFormattedName(document, patient);
      expect(document.$$FormattedName).toEqual('Bob Frapples');
    });

    it('should should set $$FormattedName on matching document in activeDocumentList', function () {
      document.$$FormattedName = undefined;
      var patient = patients[1];
      patient.FirstName = 'Bob';
      patient.LastName = 'Frapples';
      patient.PreferredName = 'Bob';
      patient.MiddleName = 'N';
      ctrl.addFormattedName(document, patient);
      expect(scope.activeDocumentList[0].$$FormattedName).toEqual(
        'Bob Frapples'
      );
    });
  });

  describe('ctrl.setDocumentCount function -> ', function () {
    beforeEach(function () {
      scope.documentGroups = _.cloneDeep(documentGroupsMock);
      scope.patient = { PatientId: '1234', docList: [] };
      scope.patient.docList = _.cloneDeep(documentListMock);
    });

    it('should set documentGroup.$$DocumentCount based on number of documents with matching DocumentGroupId', function () {
      _.forEach(scope.patient.docList, function (document) {
        document.DocumentGroupId = scope.documentGroups[0].DocumentGroupId;
      });
      var count = scope.patient.docList.length;
      ctrl.setDocumentCount();
      expect(scope.documentGroups[0].$$DocumentCount).toEqual(count);
    });

    it('should set documentGroup.$$DocumentCount to 0 based on number of documents with matching DocumentGroupId', function () {
      _.forEach(scope.patient.docList, function (document) {
        document.DocumentGroupId = scope.documentGroups[0].DocumentGroupId;
      });
      ctrl.setDocumentCount();
      expect(scope.documentGroups[1].$$DocumentCount).toEqual(0);
    });
  });

  describe('selectAllCheckBoxChanged function -> ', function () {
    it('should add all items to itemsQueuedForDownload if param is true', function () {
      scope.activeDocumentList = [{ DocumentId: 1 }, { DocumentId: 2 }];
      scope.selectAllCheckBoxChanged(true);
      expect(scope.selectAllForDownload).toBe(true);
      expect(scope.itemsQueuedForDownload).toEqual([
        { DocumentId: 1, $$Checked: true },
        { DocumentId: 2, $$Checked: true },
      ]);
    });

    it('should add no items to itemsQueuedForDownload if param is false', function () {
      scope.activeDocumentList = [{ DocumentId: 1 }, { DocumentId: 2 }];
      scope.selectAllCheckBoxChanged(false);
      expect(scope.selectAllForDownload).toBe(false);
      expect(scope.itemsQueuedForDownload).toEqual([]);
    });

    it('should do nothing if ctrl.dontUpdateDocCheckboxes is true', function () {
      scope.activeDocumentList = [{ DocumentId: 1 }, { DocumentId: 2 }];
      scope.itemsQueuedForDownload = [1];
      ctrl.dontUpdateDocCheckboxes = true;
      scope.selectAllCheckBoxChanged(true);
      expect(scope.selectAllForDownload).toBe(true);
      expect(scope.itemsQueuedForDownload).toEqual([1]);
    });
  });

  describe('downloadCheckBoxChanged function -> ', function () {
    it('should add items with $$Checked: true to itemsQueuedForDownload', function () {
      scope.activeDocumentList = [
        { DocumentId: 1, $$Checked: true },
        { DocumentId: 2, $$Checked: false },
      ];
      scope.downloadCheckBoxChanged();
      expect(scope.itemsQueuedForDownload).toEqual([
        { DocumentId: 1, $$Checked: true },
      ]);
    });
  });

  describe('downloadSelectedDocs function -> ', function () {
    var doc;

    beforeEach(function () {
      doc = {
        $$DocumentGroup: 'Account',
        MimeType: 'image/png',
        DocumentId: 22,
      };
      scope.itemsQueuedForDownload = [];
    });

    it("should call getDocumentByDocumentId if it is a 'regular' doc", function () {
      scope.itemsQueuedForDownload.push(doc);
      spyOn(scope, 'getDocumentByDocumentId');
      scope.downloadSelectedDocs();
      expect(scope.getDocumentByDocumentId).toHaveBeenCalledWith(
        22,
        false,
        true
      );
    });

    it('should call getDocumentByDocumentId with updateRecents set to false if called from downloadSelectedDocs', function () {
      scope.itemsQueuedForDownload.push(doc);
      spyOn(scope, 'getDocumentByDocumentId');
      scope.downloadSelectedDocs();
      expect(scope.getDocumentByDocumentId).toHaveBeenCalledWith(
        22,
        false,
        true
      );
    });

    it('should call viewTxPlanSnapshot if doc is a txPlan', function () {
      doc.$$DocumentGroup = 'Treatment Plans';
      doc.MimeType = 'Digital';
      scope.itemsQueuedForDownload.push(doc);
      spyOn(scope, 'viewTxPlanSnapshot');
      scope.downloadSelectedDocs();
      expect(scope.viewTxPlanSnapshot).toHaveBeenCalledWith(doc);
    });

    it('should call viewMedHistForm if doc is a MHF', function () {
      doc.$$DocumentGroup = 'Medical History';
      doc.MimeType = 'Digital';
      scope.itemsQueuedForDownload.push(doc);
      spyOn(scope, 'viewMedHistForm');
      scope.downloadSelectedDocs();
      expect(scope.viewMedHistForm).toHaveBeenCalledWith(doc);
    });
  });

  describe('viewDocument function -> ', function () {
    var doc;

    beforeEach(function () {
      doc = {
        $$DocumentGroup: 'Account',
        MimeType: 'image/png',
        DocumentId: 22,
      };
    });

    it("should call getDocumentByDocumentId if it is a 'regular' doc", function () {
      spyOn(scope, 'getDocumentByDocumentId');
      scope.viewDocument(doc);
      expect(scope.getDocumentByDocumentId).toHaveBeenCalledWith(22, true);
    });

    it('should call getDocumentByDocumentId with updateRecents set to true if called from viewDocument', function () {
      spyOn(scope, 'getDocumentByDocumentId');
      scope.viewDocument(doc);
      expect(scope.getDocumentByDocumentId).toHaveBeenCalledWith(22, true);
    });

    it('should call viewTxPlanSnapshot if doc is a txPlan', function () {
      doc.$$DocumentGroup = 'Treatment Plans';
      doc.MimeType = 'Digital';
      spyOn(scope, 'viewTxPlanSnapshot');
      scope.viewDocument(doc);
      expect(scope.viewTxPlanSnapshot).toHaveBeenCalledWith(doc);
    });

    it('should call viewMedHistForm if doc is a MHF', function () {
      doc.$$DocumentGroup = 'Medical History';
      doc.MimeType = 'Digital';
      spyOn(scope, 'viewMedHistForm');
      scope.viewDocument(doc);
      expect(scope.viewMedHistForm).toHaveBeenCalledWith(doc);
    });

    it('should call viewInformedConsent if doc is a Consent document', function () {
      doc.$$DocumentGroup = 'Consent';
      doc.MimeType = 'Digital';
      spyOn(scope, 'viewInformedConsent');
      scope.viewDocument(doc);
      expect(scope.viewInformedConsent).toHaveBeenCalledWith(doc);
    });
  });

  describe('viewInformedConsent function -> ', function () {
    beforeEach(function () {
      scope.informedConsentAccess.View = true;
    });

    it('should call informedConsentFactory.view with document', function () {
      var document = { DocumentGroupId: 1 };
      scope.viewInformedConsent(document);
      expect(informedConsentFactory.view).toHaveBeenCalledWith(document);
    });
  });

  describe('addDocumentGroup function -> ', function () {
    it('should set the $$DocumentGroup to correct description', function () {
      var documentList = [{ DocumentGroupId: 1 }, { DocumentGroupId: 3 }];
      expect(documentList[0].$$DocumentGroup).toBe(undefined);
      expect(documentList[1].$$DocumentGroup).toBe(undefined);
      ctrl.addDocumentGroup(documentList);
      expect(documentList[0].$$DocumentGroup).toEqual(
        scope.documentGroups[0].Description
      );
      expect(documentList[1].$$DocumentGroup).toEqual(
        scope.documentGroups[2].Description
      );
    });
  });

  describe('emit soar:go-back-options function ->', function () {
    beforeEach(function () {
      spyOn(scope, 'getDocumentsByPatientId');
      scope.docCtrls = { open: function () {}, close: function () {} };
      scope.patient = { PatientId: '123456789' };
      spyOn(scope, 'getRecentDocuments');
    });

    it('should call getDocumentsByPatientId ', function () {
      scope.$broadcast('soar:document-properties-edited');
      expect(scope.getDocumentsByPatientId).toHaveBeenCalledWith(scope.patient);
      expect(scope.getRecentDocuments).toHaveBeenCalled();
    });

    it('should call getDocumentsByPatientId ', function () {
      spyOn(scope.docCtrls, 'close');
      scope.$broadcast('soar:document-properties-edited');
      expect(scope.docCtrls.close).toHaveBeenCalled();
      expect(scope.getRecentDocuments).toHaveBeenCalled();
    });
  });

  describe('executeDelete function ->', function () {
    var documentId;
    beforeEach(function () {
      documentId = 123456;
    });

    it('should call documentService.delete', function () {
      ctrl.executeDelete(null, documentId);
      expect(documentService.delete).toHaveBeenCalled();
    });

    //it('should call $http.delete if uri is not null', function () {
    //    spyOn(http, 'delete');
    //    ctrl.executeDelete('something/something', documentId)
    //    deferred.resolve(100)
    //    expect(http.delete).toHaveBeenCalled();
    //});

    it('should not call $http.delete if uri is null', function () {
      spyOn(http, 'delete');
      ctrl.executeDelete(null, documentId);
      expect(http.delete).not.toHaveBeenCalled();
    });
  });

  describe('deleteInformedConsent function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'executeDelete');
      scope.hasClinicalDocumentsDeleteAccess = true;
    });

    it('should confirm delete before calling executeDelete', function () {
      var documentToDelete = { DocumentId: 123456 };
      scope.deleteInformedConsent(documentToDelete);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

  describe('validateDelete function -> ', function () {
    var documentToDelete;
    beforeEach(function () {
      documentToDelete = {
        DocumentId: 123456,
        $$DocumentGroup: 'Treatment Plans',
      };
    });

    it('should call deleteTxPlanSnapshot if $$DocumentGroup equals Treatment Plans', function () {
      spyOn(scope, 'deleteTxPlanSnapshot');
      scope.validateDelete(documentToDelete);
      expect(scope.deleteTxPlanSnapshot).toHaveBeenCalledWith(documentToDelete);
    });

    it('should call deleteInformedConsent if $$DocumentGroup equals Consent and MImeType is Digital', function () {
      spyOn(scope, 'deleteInformedConsent');
      documentToDelete.$$DocumentGroup = 'Consent';
      documentToDelete.MimeType = 'Digital';
      scope.validateDelete(documentToDelete);
      expect(scope.deleteInformedConsent).toHaveBeenCalledWith(
        documentToDelete
      );
    });

    it('should call deleteDocument if $$DocumentGroup equals Consent and MImeType is not Digital', function () {
      spyOn(scope, 'deleteDocument');
      documentToDelete.$$DocumentGroup = 'Consent';
      documentToDelete.MimeType = 'not Digital';
      scope.validateDelete(documentToDelete);
      expect(scope.deleteDocument).toHaveBeenCalledWith(documentToDelete);
    });

    it('should call deleteDocument if $$DocumentGroup not Treatment Plans or Consent', function () {
      spyOn(scope, 'deleteDocument');
      documentToDelete.$$DocumentGroup = 'Account';
      scope.validateDelete(documentToDelete);
      expect(scope.deleteDocument).toHaveBeenCalledWith(documentToDelete);
    });
  });

  describe('patientCheck function -> ', function () {
    var documentToDelete;
    beforeEach(function () {
      documentToDelete = {
        DocumentId: 123456,
        $$DocumentGroup: 'Treatment Plans',
        ParentId: '1',
      };
    });

    it('should call to get the patient by id when $scope.patient is not set', function () {
      scope.patientCheck(documentToDelete);
      expect(patientLogic.GetPatientById).toHaveBeenCalledWith(
        documentToDelete.ParentId
      );
    });

    it('should not call to get the patient by id when $scope.patient is set', function () {
      scope.patient = patients[2];
      scope.patientCheck(documentToDelete);
      expect(patientLogic.GetPatientById).not.toHaveBeenCalled();
    });
  });

  describe('updateRecentDocuments function -> ', function () {
    var document;
    beforeEach(function () {
      scope.hasClinicalDocumentsAddAccess = true;
      document = {
        DocumentId: 123456,
        $$DocumentGroup: 'Treatment Plans',
        PatientId: '1',
      };
    });

    it('should call to get the patient by id when $scope.patient is not set', function () {
      ctrl.updateRecentDocuments(document);
      expect(formsDocumentsFactory.UpdateRecentDocuments).toHaveBeenCalledWith(
        document
      );
    });
  });

  describe('scope.onUpLoadCancel method', function () {
    beforeEach(function () {
      scope.docCtrls = {
        close: jasmine.createSpy(),
      };
    });

    it('should call docCtrls.close()', function () {
      scope.onUpLoadCancel();
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });

  describe('scope.onUpLoadSuccess method', function () {
    var doc = {};
    beforeEach(function () {
      scope.patient = { docList: [] };
      scope.docCtrls = {
        close: jasmine.createSpy(),
      };
      doc = { DocumentId: 1234 };
      scope.claim = { IsReceived: false, DocumentId: null };
      spyOn(scope, 'setActiveDirectory').and.callFake(function () {});
    });

    it('should call docCtrls.close()', function () {
      scope.onUpLoadSuccess(doc);
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });
});

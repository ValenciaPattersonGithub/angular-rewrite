describe('PatientDocumentsController tests ->', function () {
  var ctrl,
    scope,
    cacheFactory,
    currentLocation,
    locationService,
    patients,
    documentGroupsList;
  var treatmentPlanDocumentFactory,
    informedConsentFactory,
    informedConsentMessageService,
    fileUploadFactory;
  var formsDocumentsFactory;
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
  ];

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

  var informedConsentMessageMock = {
    Value: { Text: 'Informed Consent Message' },
  };

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

  beforeEach(
    module('Soar.Patient', function ($provide) {
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
        printUnsigned: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('InformedConsentFactory', informedConsentFactory);

      informedConsentMessageService = {
        getInformedConsentMessage: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(informedConsentMessageMock),
        }),
      };
      $provide.value(
        'InformedConsentMessageService',
        informedConsentMessageService
      );
    })
  );

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

      formsDocumentsFactory = {
        UpdateRecentDocuments: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('FormsDocumentsFactory', formsDocumentsFactory);

      treatmentPlanDocumentFactory = {
        GetTreatmentPlanSnapshot: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value(
        'TreatmentPlanDocumentFactory',
        treatmentPlanDocumentFactory
      );

      fileUploadFactory = {
        CreatePatientDirectory: jasmine.createSpy(),
      };
      $provide.value('FileUploadFactory', fileUploadFactory);
      $provide.value('PatientLogic', {});
      $provide.value('PatientDocumentsFactory', {});
      $provide.value('PersonFactory', {});
      $provide.value('PatientValidationFactory', {});
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('PatientDocumentsController', {
      $scope: scope,
      uriService: {},
      ModalFactory: {},
    });
    scope.documentGroupsList = documentGroupsList.Value;
  }));

  describe('ctrl.createDirectoryBeforeDownload function ->', function () {
    it('should call fileUploadFactory with correct parameters', function () {
      scope.patientDirectoryId = 'directoryId';
      ctrl.createDirectoryBeforeDownload('patientId');
      expect(fileUploadFactory.CreatePatientDirectory).toHaveBeenCalledWith(
        { PatientId: 'patientId', DirectoryAllocationId: 'directoryId' },
        null,
        ctrl.soarAuthClinicalDocumentsViewKey
      );
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
      expect(scope.getDocumentByDocumentId).toHaveBeenCalledWith(22);
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
  });

  describe('sortDocuments function-> ', function () {
    it('should set asc to true if asc was false and sortColumn does not equal current orderBy.field', function () {
      scope.sortDocuments('Name');
      expect(scope.orderBy.field).toEqual('Name');
      expect(scope.orderBy.asc).toBe(true);
      expect(scope.orderBy.sortCounter).toEqual(1);
    });

    it('should set asc to false if asc was true and sortColumn equals current orderBy.field and orderBy.sortCounter equals 0', function () {
      scope.orderBy = {
        field: 'Name',
        asc: true,
        sortCounter: 0,
      };
      scope.sortDocuments('Name');
      expect(scope.orderBy.field).toEqual('Name');
      expect(scope.orderBy.asc).toBe(false);
      expect(scope.orderBy.sortCounter).toEqual(1);
    });

    it('should set orderBy.asc to be false and .field to be DateUploaded if orderBy.sortCounter equals 2', function () {
      scope.orderBy = {
        field: 'Name',
        asc: true,
        sortCounter: 2,
      };
      scope.sortDocuments('Name');
      expect(scope.orderBy.field).toEqual('DateUploaded');
      expect(scope.orderBy.asc).toBe(false);
      expect(scope.orderBy.sortCounter).toEqual(0);
    });
  });

  describe('viewTxPlanSnapshot with access function -> ', function () {
    var txPlanDocument;
    beforeEach(function () {
      scope.hasClinicalDocumentsViewAccess = true;
      txPlanDocument = {
        $$DocumentGroup: 'Treatment Plans',
        MimeType: 'Digital',
        DocumentId: 22,
        FileAllocationId: 2,
      };
    });

    it('should call viewTxPlanSnapshot if doc is a txPlan', function () {
      scope.viewTxPlanSnapshot(txPlanDocument);
      expect(
        treatmentPlanDocumentFactory.GetTreatmentPlanSnapshot
      ).toHaveBeenCalledWith(txPlanDocument.FileAllocationId);
    });

    it('should call viewTxPlanSnapshot if doc is a txPlan', function () {
      spyOn(ctrl, 'updateRecentDocuments');
      scope.viewTxPlanSnapshot(txPlanDocument);
      expect(ctrl.updateRecentDocuments).toHaveBeenCalledWith(txPlanDocument);
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

    it('should call formsDocumentsFactory.UpdateRecentDocuments', function () {
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
      doc = { DocumentId: 1234 };
      scope.docCtrls = {
        close: jasmine.createSpy(),
      };
      spyOn(scope, 'getDocumentsByPatientId').and.callFake(function () {});
    });

    it('should call docCtrls.close()', function () {
      scope.onUpLoadSuccess(doc);
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });

    it('should call ctrl.loadDocuments if ctrl.initialized.Documents = true', function () {
      scope.onUpLoadSuccess(doc);
      expect(scope.getDocumentsByPatientId).toHaveBeenCalled();
    });
  });
});

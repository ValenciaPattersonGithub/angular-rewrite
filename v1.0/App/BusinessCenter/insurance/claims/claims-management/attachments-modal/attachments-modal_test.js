describe('attachments-modal ->', function () {
  var rootScope,
    scope,
    ctrl,
    routeParams,
    mockClaim,
    mockUibModalInstance,
    mockModalFactory,
    documentGroupsService,
    mockClaimAttachmentHttpService,
    filter,
    mockAttachmentDocumentTypeResult,
    documentService;
  var mockDocumentsLoadingService;
  var mockPatientPerioExamFactory,
    mockPatientOdontogramFactory,
    mockFileUploadFactory;
  var mockInsuranceErrorMessageGeneratorService;
  var imagingMasterService,
    imagingProviders,
    patientValidationFactory,
    patientServices,
    externalImagingWorkerFactory;
  let patientNotesService, soarConfig;

  var mockDocumentGroups = [
    { DocumentGroupId: 1, Description: 'Consent', IsSystemDocumentGroup: true },
    { DocumentGroupId: 2, Description: 'HIPPA', IsSystemDocumentGroup: true },
    {
      DocumentGroupId: 6,
      Description: 'Insurance',
      IsSystemDocumentGroup: true,
    },
    { DocumentGroupId: 10, Description: 'EOB', IsSystemDocumentGroup: true },
    {
      DocumentGroupId: 8,
      Description: 'Other Clinical',
      IsSystemDocumentGroup: true,
    },
  ];

  let claimAttachmentTypes = {
    DocumentManager: 1,
    ApteryxImage: 2,
    PerioExam: 3,
    SidexisImage: 4,
    UnallocatedDocument: 5,
    };

  let clearinghouseVendors = {
    Noop: 1,
    ChangeHealthCare: 2,
    DentalXChange: 3
  };

  let externalImagesMock = [
    {
      ThirdPartyImagingRecordId: null,
      PatientId: '1234',
      ImageCreatedDate: '2020-03-10T15:30:53.207',
      ImageId: '12',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '2, 3',
    },
    {
      ThirdPartyImagingRecordId: null,
      PatientId: '1234',
      ImageCreatedDate: '2020-03-11T15:30:53.207',
      ImageId: '13',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '12,13',
    },
    {
      ThirdPartyImagingRecordId: null,
      PatientId: '1234',
      ImageCreatedDate: '2020-03-12T15:30:53.207',
      ImageId: '20',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '2,3',
    },
    {
      ThirdPartyImagingRecordId: null,
      PatientId: '1234',
      ImageCreatedDate: '2020-03-10T15:30:53.207',
      ImageId: '20',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '2,3',
    },
  ];

  let clinicalNotesMock = [
    {
      EntityId: '1234',
      NoteId: '12345',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'consectetur adipiscing elit.',
      NoteTypeId: 3,
      CreatedDate: '2020-04-17T18:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
      StatusType: 1,
      AutomaticLockTime: null,
    },
    {
      EntityId: '2345',
      NoteId: '12345',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'consectetur adipiscing elit. webbly',
      NoteTypeId: 3,
      CreatedDate: '2020-04-17T17:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
      StatusType: 1,
      AutomaticLockTime: null,
    },
    {
      EntityId: '3456',
      NoteId: '12346',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'adfdf daddaff fadfsadf',
      NoteTypeId: 3,
      CreatedDate: '2020-02-17T18:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
      StatusType: 1,
      AutomaticLockTime: null,
    },
    {
      EntityId: '4567',
      NoteId: '12355',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'dfadf dasdffd3aadf adfdffd2225adfadf',
      NoteTypeId: 3,
      CreatedDate: '2020-03-16T18:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
      StatusTypeId: 1,
      AutomaticLockTime: null,
    },
    {
      EntityId: '4568',
      NoteId: '12355',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'dfadf fdffd2225adfadf',
      NoteTypeId: 3,
      CreatedDate: '2020-03-17T18:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
      StatusTypeId: 1,
      AutomaticLockTime: null,
    },
  ];

  var mockDocuments = [
    {
      Name: 'document1.txt',
      DocumentGroupId: 1,
      DocumentId: 1,
      MimeType: 'text/plain',
      ext: 'txt',
      ClaimAttachmentType:5,
      ClearinghouseVendor: "DentalXChange"
    },
    {
      Name: 'IMG_0707.JPG',
      DocumentGroupId: 2,
      DocumentId: 2,
      MimeType: 'image/jpeg',
      ext: 'jpg',
      ClearinghouseVendor: "DentalXChange"
    },
    {
      Name: 'eob.txt',
      DocumentGroupId: 2,
      DocumentId: 4,
      MimeType: 'text/plain',
      ext: 'txt',
      ClaimAttachmentType: 5,
      ClearinghouseVendor: "DentalXChange"
    },
    {
      Name: '2010_new_hire_orientation_final.ppt',
      DocumentGroupId: 2,
      DocumentId: 5,
      MimeType: 'application/vnd.ms-powerpoint',
      ext: 'ppt',
      ClearinghouseVendor: "DentalXChange"
    },
    {
      Name: 'document2.txt',
      DocumentGroupId: 1,
      DocumentId: 6,
      MimeType: 'text/plain',
      ext: 'txt',
      ClaimAttachmentType: 5,
      ClearinghouseVendor: "DentalXChange"
    },
  ];

  mockAttachmentDocumentTypeResult = {
    documentTypes: [
      {displayDocumentName:'DentalModels', attachmentDocumentType:'DentalModels', orientationRequired:  false},
      {displayDocumentName:'Explanation Of Benefits', attachmentDocumentType:'ExplanationOfBenefits', orientationRequired:  false},
      {displayDocumentName:'Periodontal Charts', attachmentDocumentType:'PeriodontalCharts', orientationRequired:  false},
      {displayDocumentName:'X-Rays', attachmentDocumentType:'XRays', orientationRequired:  true},
      {displayDocumentName:'Narrative', attachmentDocumentType:'Narrative', orientationRequired:  false},
    ],
    validFileExtensions: ['.jpeg','.gif','.png','.apteryx','.sidexis','.blue','.perio','.pdf']
  }

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      mockClaimAttachmentHttpService = {
        getAttachmentTypes:  jasmine.createSpy().and.returnValue({
          subscribe: jasmine.createSpy().and.returnValue(mockAttachmentDocumentTypeResult)
        }),
      }
      $provide.value('ClaimAttachmentHttpService', mockClaimAttachmentHttpService);


      patientNotesService = {
        getClinicalNotes: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('PatientNotesService', patientNotesService);

      documentService = {
        get: jasmine.createSpy().and.returnValue({ Value: mockDocuments }),
      };
      $provide.value('DocumentService', documentService);

      documentGroupsService = {
        getAll: jasmine
          .createSpy()
          .and.returnValue({ Value: mockDocumentGroups }),
      };
      $provide.value('DocumentGroupsService', documentGroupsService);

      imagingMasterService = {
        getPatientByFusePatientId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getServiceStatus: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getReadyServices: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getImageBitmapByImageId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getAllByPatientId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('ImagingMasterService', imagingMasterService);

      imagingProviders = {
        Apteryx: 'apteryx',
        Apteryx2: 'apteryx2',
        Sidexis: 'sidexis',
        Blue: 'blue',
      };
      $provide.value('ImagingProviders', imagingProviders);

      soarConfig = {
        enableBlue: 'false',
      };
      $provide.value('SoarConfig', soarConfig);
    })
  );

  beforeEach(
    module('Soar.Patient', function ($provide) {
      externalImagingWorkerFactory = {
        saveImages: jasmine.createSpy().and.callFake(function () {}),
        syncImages: jasmine.createSpy().and.callFake(function () {}),
      };
      $provide.value(
        'ExternalImagingWorkerFactory',
        externalImagingWorkerFactory
      );

      patientValidationFactory = {
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      patientServices = {
        Claim: {
          AttachFilesToClaim: jasmine.createSpy().and.returnValue({}),
        },
        ExternalImages: {
          get: jasmine.createSpy().and.returnValue({
            $promise: {
              then: jasmine.createSpy().and.returnValue({
                Value: [],
              }),
            },
          }),
        },
        Patients: {
          dashboard: jasmine.createSpy().and.returnValue({
            $promise: {
              then: jasmine.createSpy().and.returnValue({
                Value: { PatientId: '1234' },
              }),
            },
          }),
        },
      };
      $provide.value('PatientServices', patientServices);
    })
  );

  let q;
  beforeEach(inject(function ($rootScope, $controller, $routeParams, $q) {
    q = $q;
    rootScope = $rootScope;
    scope = rootScope.$new();
    routeParams = $routeParams;

    mockUibModalInstance = {
      close: jasmine.createSpy('uibModalInstance.close'),
      dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
    };

    mockClaim = {
      PatientId: 1,
      HasAttachemnt: false,
      Status: 3,
    };

    mockModalFactory = {
      CancelModal: jasmine.createSpy('ModalFactory.CancelModal').and.returnValue({ then: function () { } }),
      ConfirmModal: jasmine.createSpy('ModalFactory.ConfirmModal'),
    };

    mockDocumentsLoadingService = {
      executeDownload: jasmine.createSpy(
        'documentsLoadingService.executeDownload'
      ),
    };

    mockPatientPerioExamFactory = {
      access: jasmine.createSpy('PatientPerioExamFactory.access'),
      get: jasmine.createSpy('PatientPerioExamFactory.access').and.returnValue({
        then: function () {},
      }),
    };

    mockPatientOdontogramFactory = {
      access: jasmine.createSpy('PatientOdontogramFactory.access'),
      getMouthStatus: jasmine
        .createSpy('PatientOdontogramFactory.getMouthStatus')
        .and.returnValue({
          then: function () {},
        }),
    };

    mockFileUploadFactory = {
      CreatePatientDirectory: jasmine.createSpy(),
    };

      mockInsuranceErrorMessageGeneratorService = {
          determineErrorMessages: jasmine.createSpy('InsuranceErrorMessageGeneratorService.determineErrorMessages').and.returnValue({
        primaryMessage: 'Primary Message',
        detailMessage: 'Detail Message'
      })
    };

    ctrl = $controller('AttachmentsModalController', {
      $scope: scope,
      $uibModalInstance: mockUibModalInstance,
      claim: mockClaim,
      ModalFactory: mockModalFactory,
      DocumentsLoadingService: mockDocumentsLoadingService,
      PatientPerioExamFactory: mockPatientPerioExamFactory,
      PatientOdontogramFactory: mockPatientOdontogramFactory,
      ExamState: { ViewMode: 1 },
      FileUploadFactory: mockFileUploadFactory,
        InsuranceErrorMessageGeneratorService: mockInsuranceErrorMessageGeneratorService,
    });
    scope.ClaimAttachmentTypes = claimAttachmentTypes;

    scope.attachmentTypesList = [
      { Description: 'EOB Or COB', Value: '1' },
      { Description: 'Narrative', Value: '2' },
      { Description: 'Student Verification', Value: '3' },
      { Description: 'Referral Form', Value: '4' },
      { Description: 'Diagnosis', Value: '5' },
      { Description: 'Reports', Value: '6' },
      { Description: 'Periodontal Charts', Value: '7' },
      { Description: 'Progress Notes', Value: '8' },
      { Description: 'Intraoral Image', Value: '9' },
      { Description: 'Full Mouth Series', Value: '10' },
      { Description: 'Bitewings', Value: '11' },
      { Description: 'Periapical', Value: '12' },
      { Description: 'Panoramic Film', Value: '13' },
      { Description: 'Partial Mount', Value: '14' },
      { Description: 'Cephalometric', Value: '15' },
      { Description: 'Radiographic Images', Value: '16' },
    ];
  }));

  // TODO some tests have been commented out because they use attachment types that are no longer supported
  // for the current vendor , these should be revisited
  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
      // expect(documentService.get).toHaveBeenCalled();
      // expect(mockPatientPerioExamFactory.access).toHaveBeenCalled();
      // expect(mockPatientPerioExamFactory.get).toHaveBeenCalled();
    });

    // it('should call fileUploadFactory with correct values', function () {
    //   expect(mockFileUploadFactory.CreatePatientDirectory).toHaveBeenCalledWith(
    //     { PatientId: mockClaim.PatientId },
    //     null,
    //     'plapi-files-fsys-write'
    //   );
    // });

    // DO NOT REMOVE before greenlight of Blue-Fuse beta testing
    it('should set Hide on Blue Imaging folder to true', function () {
      let blueFolder = scope.documentGroupsList[5];
      expect(blueFolder.Description).toBe('Blue Imaging');
      expect(blueFolder.Hide).toBe(true);
    });
  });

  describe('$scope.submit -> ', function () {
    let document = {};
    beforeEach(function () {
      document = {
        DocumentId: 1,
        Filename: 'file.pdf',
        EAttachmentFileId: 1,
        attachmentType: '1',
        SidexisImage: null,
      };
    });
    // it('should call patientServices.Claim.AttachFilesToClaim', function () {
    //   scope.selectedAttachments.push(document);
    //   scope.disableSubmit = false; //[CHC Outage]
    //   scope.submit();
    //   expect(patientServices.Claim.AttachFilesToClaim).toHaveBeenCalled();
    // });

    // it('should call patientServices.Claim.AttachFilesToClaim', function () {
    //   document.SidexisImage = 'data';
    //   scope.selectedAttachments.push(document);
    //   scope.disableSubmit = false; //[CHC Outage]
    //   scope.submit();
    //   expect(patientServices.Claim.AttachFilesToClaim).toHaveBeenCalled();
    // });

    it('should set SidexisImageId if document.ClaimAttachmentType is SidexisImage ', function () {
      scope.selectedAttachments = [];
      document.SidexisImage = 'data';
      document.ClaimAttachmentType = scope.ClaimAttachmentTypes.SidexisImage;
      document.SidexisImageId = '1254896332';
      scope.selectedAttachments.push(document);
      scope.submit();
      expect(scope.selectedAttachments[0].SidexisImageId).toBe(
        document.SidexisImageId
      );
    });

    it('should set UnallocatedDocumentId if document.ClaimAttachmentType is UnallocatedDocument ', function () {
      scope.selectedAttachments = [];
      document.UnallocatedDocumentAttachment = 'data';
      document.ClaimAttachmentType =
        scope.ClaimAttachmentTypes.UnallocatedDocument;
      document.UnallocatedDocumentId = 'ClinicalNote_1234';
      scope.selectedAttachments.push(document);
      scope.submit();
      expect(scope.selectedAttachments[0].UnallocatedDocumentId).toBe(
        document.UnallocatedDocumentId
      );
    });
  });

  describe('$scope.cancel -> ', function () {
    it('should call uibModalInstance.dismiss when no changes', function () {
      scope.cancel();
      expect(mockUibModalInstance.dismiss).toHaveBeenCalled();
    });
    it('should call modalFactory.CancelModal when there are changes', function () {
      scope.currentDocument = {};
      scope.cancel();
      expect(mockModalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('$scope.setCurrentDocument -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'buildNoteText');
      spyOn(ctrl, 'setNoteProperties');
      scope.attachmentDocumentTypesList = mockAttachmentDocumentTypeResult.documentTypes;
      ctrl.validExtensionsForClaims = mockAttachmentDocumentTypeResult.validFileExtensions;
    });

      it('should call getAttachment if current documents is in selected attachment and ClaimAttachmentTypes is UnallocatedDocument', function () {

          spyOn(ctrl, 'getAttachment');
          var currentDocument = {
              Name: 'Value',
              ext: '.pdf',
              ClaimAttachmentType: scope.ClaimAttachmentTypes.UnallocatedDocument,
              UnallocatedDocumentId: 'ClinicalNote_1',
              date: {},
              UniqueListId: 1
          };

          scope.selectedAttachments = [{
              Name: 'Value',
              ext: '.pdf',
              ClaimAttachmentType: scope.ClaimAttachmentTypes.UnallocatedDocument,
              UnallocatedDocumentId: 'ClinicalNote_1',
              data: {},
              UniqueListId: 1
          }];
          scope.setCurrentDocument(currentDocument);

          expect(ctrl.getAttachment).toHaveBeenCalled();
      });

      it('should not call getAttachment if current documents is not in selected attachment and ClaimAttachmentTypes is UnallocatedDocument', function () {

          spyOn(ctrl, 'getAttachment');
          var currentDocument = {
              Name: 'Value',
              ext: '.txt',
              ClaimAttachmentType: scope.ClaimAttachmentTypes.UnallocatedDocument,
              UnallocatedDocumentId: 'ClinicalNote_1',
              date: {},
              UniqueListId: 1
          };

          scope.selectedAttachments = [{
              Name: 'Value2',
              ext: '.txt',
              ClaimAttachmentType: scope.ClaimAttachmentTypes.Sidexis,
              UnallocatedDocumentId: 'ClinicalNote_2',
              data: {},
              UniqueListId: 2
          }];

          scope.setCurrentDocument(currentDocument);

          expect(ctrl.getAttachment).not.toHaveBeenCalled();
      });

    it('should set showUploadInvalidTypeMessage', function () {
      scope.showUploadInvalidTypeMessage = true;
      scope.setCurrentDocument({});
      expect(scope.showUploadInvalidTypeMessage).toBe(false);
    });
    // it('should set current document', function () {
    //   var object = {
    //     Name: 'Value',
    //     ext: '.docx',
    //   };
    //   spyOn(ctrl, 'getFile');
    //   scope.setCurrentDocument(object);
    //   expect(scope.currentDocument).toEqual(object);
    //   expect(ctrl.getFile).not.toHaveBeenCalled();
    // });
    // it('should get file if necessary', function () {
    //   var object = {
    //     Name: 'Value',
    //     ext: '.pdf',
    //   };
    //   spyOn(ctrl, 'getFile');
    //   scope.setCurrentDocument(object);
    //   expect(scope.currentDocument).toEqual(object);
    //   expect(ctrl.getFile).toHaveBeenCalled();
    // });

    it('should process files if document has an sidexis extension and imaging provider is available', function () {
      var object = {
        Name: 'Value',
        ext: '.sidexis',
        ClaimAttachmentType: scope.ClaimAttachmentTypes.SidexisImage,
      };
      scope.imagingProvider = { name: 'Sidexis', error: null };
      scope.setCurrentDocument(object);
      expect(scope.currentDocument).toBe(object);
    });

    it('should not process files if document has an sidexis extension and imaging provider is not available', function () {
      scope.imagingProvider = { name: 'Sidexis', error: true };
      var object = {
        Name: 'Value',
        ext: '.sidexis',
        ClaimAttachmentType: scope.ClaimAttachmentTypes.SidexisImage,
      };
      scope.setCurrentDocument(object);
      expect(scope.currentDocument).toBe(null);
    });

    it('should call imagingMasterService.getImageBitmapByImageId if this is document has an sidexis extension', function () {
      scope.imagingProvider = { name: 'Sidexis', error: null };
      ctrl.externalPatientId = '1234';

      let sidexis = imagingProviders.Sidexis;
      var file = {
        ImageId: 1234,
        Name: 'Value',
        ext: '.sidexis',
        ClaimAttachmentType: scope.ClaimAttachmentTypes.SidexisImage,
      };
      scope.setCurrentDocument(file);
      expect(imagingMasterService.getImageBitmapByImageId).toHaveBeenCalledWith(
        file.ImageId,
        sidexis,
        ctrl.externalPatientId,
        'jpeg'
      );
    });

    it('should call imagingMasterService.getImageBitmapByImageId if this is document has an apteryx extension', function () {
      var object = {
        Name: 'Value',
        ext: '.apteryx',
        Id: 'testId',
      };
      ctrl.externalPatientId = 'testExtPatientId';
      imagingMasterService.getImageBitmapByImageId = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });

      scope.setCurrentDocument(object);

      expect(scope.currentDocument).toEqual(object);
      expect(imagingMasterService.getImageBitmapByImageId).toHaveBeenCalledWith(
        object.Id,
        imagingProviders.Apteryx2,
        ctrl.externalPatientId,
        'jpeg'
      );
    });

    it('should call imagingMasterService.getImageBitmapByImageId if this is document has a blue extension', function () {
      var object = {
        Name: 'Value',
        ext: '.blue',
        Id: 'testId',
      };
        ctrl.externalPatientId = 'testExtPatientId';
        scope.claim = { PatientId: '1234' };
      imagingMasterService.getImageBitmapByImageId = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });

      scope.setCurrentDocument(object);

      expect(scope.currentDocument).toEqual(object);
      expect(imagingMasterService.getImageBitmapByImageId).toHaveBeenCalledWith(
        object.Id,
        imagingProviders.Blue,
        scope.claim.PatientId,
        'jpeg'
      );
    });

    it('should not call ctrl.buildNoteText if file.ClaimAttachmentType is ClaimAttachmentTypes.UnallocatedDocument and file.UnallocatedDocumentId begins with Narrative', function () {
      let file = {
        Name: 'Value',
        ext: '.txt',
        UnallocatedDocumentId: 'Narrative_123456',
        ClaimAttachmentType: scope.ClaimAttachmentTypes.UnallocatedDocument,
      };
      spyOn(ctrl, 'getFile');
      scope.setCurrentDocument(file);
      expect(ctrl.setNoteProperties).not.toHaveBeenCalledWith(file);
      expect(ctrl.buildNoteText).not.toHaveBeenCalledWith(file);
    });

    // it('should call ctrl.buildNoteText if file.ClaimAttachmentType is ClaimAttachmentTypes.UnallocatedDocument and file.UnallocatedDocumentId begins with ClinicalNote ', function () {
    //   let file = {
    //     Name: 'Value',
    //     ext: '.txt',
    //     UnallocatedDocumentId: 'ClinicalNote_123456',
    //     ClaimAttachmentType: scope.ClaimAttachmentTypes.UnallocatedDocument,
    //   };
    //   spyOn(ctrl, 'getFile');
    //   scope.setCurrentDocument(file);
    //   expect(ctrl.buildNoteText).toHaveBeenCalledWith(file);
    //   expect(ctrl.setNoteProperties).toHaveBeenCalledWith(file);
    //});

    // it('should set file.$$selected to true if value is null or undefined', function () {
    //   var object = {
    //     Name: 'Value',
    //     ext: '.docx',
    //   };
    //   scope.setCurrentDocument(object);
    //   expect(object.$$selected).toEqual(true);
    // });

    // it('should add file to multi document list', function () {
    //   var object = {
    //     Name: 'Value',
    //     ext: '.docx',
    //   };
    //   scope.setCurrentDocument(object);
    //   expect(scope.multiDocList).toEqual([object]);
    // });

    // it('should not add file to multi document list if already attached', function () {
    //   var object = {
    //     Name: 'Value',
    //     ext: '.docx',
    //   };
    //   scope.selectedAttachments.push(object);
    //   scope.setCurrentDocument(object);
    //   expect(scope.multiDocList).toEqual([]);
    // });

    // it('should not set $$selected on file if in selectedAttachments', function () {
    //   let object = {
    //     Name: 'Value',
    //     ext: '.pdf',
    //     attachmentType: '7',
    //   };
    //   ctrl.getFile = jasmine.createSpy();
    //   scope.currentDocument = object;
    //   scope.selectedAttachments = [object];
    //   scope.setCurrentDocument(object);
    //   expect(object.$$selected).toEqual(null);
    // });
  });

  describe('$scope.addCurrentAttachment -> ', function () {
    it('should add multi doc list to selected attachments', function () {
      let object = {
        Name: 'Value',
        ext: '.pdf',
        attachmentType: '7',
      };
      scope.currentDocument = object;
      scope.multiDocList = [object];
      scope.addCurrentAttachment();
      expect(scope.selectedAttachments).toEqual([object]);
    });

    it('should not add document to selected attachments if document is already in list', function () {
      let object = {
        Name: 'Value',
        ext: '.pdf',
        UniqueListId: 1,
      };
      scope.currentDocument = object;
      scope.multiDocList = [object];
      scope.addCurrentAttachment();
      scope.currentDocument = object;
      scope.addCurrentAttachment();
      expect(scope.selectedAttachments).toEqual([object]);
    });

    it('should add entire multi document list to selected attachments', function () {
      let object = {
        Name: 'Value',
        ext: '.pdf',
        UniqueListId: 1,
      };
      let object2 = {
        Name: 'Value2',
        ext: '.pdf',
        UniqueListId: 2,
      };
      scope.currentDocument = object2;
      scope.multiDocList = [object, object2];
      scope.addCurrentAttachment();
      expect(scope.selectedAttachments.length).toBe(2);
    });

    it('should make all objects with .perio ext to have attachmentType 7', function () {
      let object = {
        Name: 'Value',
        ext: '.perio',
        UniqueListId: 1,
        attachmentType: '2',
      };
      let object2 = {
        Name: 'Value2',
        ext: '.jpg',
        UniqueListId: 2,
        attachmentType: '2',
      };
      scope.currentDocument = object2;
      scope.multiDocList = [object, object2];
      scope.addCurrentAttachment();
      expect(scope.selectedAttachments[0].attachmentType).toEqual('PeriodontalCharts');
    });

    it('should call ctrl.setNarrativeProperties if no UniqueListId and there is an attachmentNote', function () {
      spyOn(ctrl, 'setNarrativeProperties');
      scope.currentDocument = {
        Name: 'Value',
        ext: '.pdf',
        attachmentNotes: 'narrative',
      };
      scope.addCurrentAttachment();
      expect(ctrl.setNarrativeProperties).toHaveBeenCalled();
    });

    it('should not call ctrl.setNarrativeProperties if UniqueListId or attachmentNotes', function () {
      spyOn(ctrl, 'setNarrativeProperties');
      scope.currentDocument = {
        Name: 'Value',
        ext: '.pdf',
        UniqueListId: 'document.txt',
      };
      scope.addCurrentAttachment();
      expect(ctrl.setNarrativeProperties).not.toHaveBeenCalled();
    });

    it('should not have any items in multidoclist after attaching', function () {
      let object = {
        Name: 'Value',
        ext: '.perio',
        UniqueListId: 1,
        attachmentType: '2',
      };
      let object2 = {
        Name: 'Value2',
        ext: '.jpg',
        UniqueListId: 2,
        attachmentType: '2',
      };
      scope.currentDocument = object2;
      scope.multiDocList = [object, object2];
      scope.addCurrentAttachment();
      expect(scope.multiDocList).toEqual([]);
    });
  });

  describe('$scope.deleteAttachment -> ', function () {
    it('should remove document from selected attachments and current document if necessary', function () {
      var object = {
        Name: 'Value',
        ext: '.pdf',
        UniqueListId: 1,
      };
      var object2 = {
        Name: 'Value',
        ext: '.pdf',
        UniqueListId: 2,
      };
      scope.selectedAttachments = [object, object2];
      scope.currentDocument = object2;
      scope.deleteAttachment(object2);
      expect(scope.selectedAttachments).toEqual([object]);
      expect(scope.currentDocument).toEqual(null);
    });
  });

  describe('ctrl.validAttachmentTypeForClaims function --> ', function () {
    it('should return true if file extension is one of the valid attachment types for claims regardless of case', function () {
      ctrl.validExtensionsForClaims = mockAttachmentDocumentTypeResult.validFileExtensions;
      console.log(ctrl.validExtensionsForClaims)
      // TODO fix this
      //expect(ctrl.validAttachmentTypeForClaims('.JPG')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.JPEG')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.PNG')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.BLUE')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.SIDEXIS')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.APTERYX')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.PERIO')).toBe(true);
      // TODO fix this
      //expect(ctrl.validAttachmentTypeForClaims('.jpg')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.jpeg')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.png')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.gif')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.apteryx')).toBe(true);
      expect(ctrl.validAttachmentTypeForClaims('.perio')).toBe(true);
    });

    it('should return false if file extension is not one of the valid attachment types for claims', function () {
      expect(ctrl.validAttachmentTypeForClaims('.js')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.gzip')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.7zip')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.vb')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.cs')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.ps1')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.exe')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.dc3')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.dic')).toBe(false);
      expect(ctrl.validAttachmentTypeForClaims('.dcm30')).toBe(false);
    });
  });

  describe('ctrl.setValidAttachmentTypeForClaims method --> ', function () {
    var group = { files: [] };
    beforeEach(function () {
      group.files = _.cloneDeep(mockDocuments);
      spyOn(ctrl, 'validAttachmentTypeForClaims');
    });

    it('should set file.$$AppendText to ctrl.invalidTypeText if file.$$ValidAttachmentTypeForClaims = false', function () {
      ctrl.setValidAttachmentTypeForClaims(group.files);
      _.forEach(group.files, function (file) {
        if (file.$$ValidAttachmentTypeForClaims === false) {
          expect(file.$$AppendText).toEqual('Invalid Text');
        }
      });
    });

    it('should set file.$$AppendText to empty string if file.$$ValidAttachmentTypeForClaims = true', function () {
      ctrl.setValidAttachmentTypeForClaims(group.files);
      _.forEach(group.files, function (file) {
        if (file.$$ValidAttachmentTypeForClaims === true) {
          expect(file.$$AppendText).toEqual('');
        }
      });
    });

    it('should call ctrl.validAttachmentTypeForClaims for each file in group', function () {
        ctrl.setValidAttachmentTypeForClaims(group.files);

        expect(ctrl.validAttachmentTypeForClaims).toHaveBeenCalledWith(
            'ppt', undefined
        );
        expect(ctrl.validAttachmentTypeForClaims).toHaveBeenCalledWith(
            'jpg', undefined
        );
        expect(ctrl.validAttachmentTypeForClaims).toHaveBeenCalledWith(
            'txt', 5
        );
    });
  });

  describe('ctrl.processDocuments function ->', function () {
    it('should set values on passed in documents', function () {
      var documents = [
        { Name: '1.txt', DocumentId: 'Doc1' },
        { Name: '2.doc', DocumentId: 'Doc2' },
      ];

      ctrl.processDocuments(documents);

      expect(documents[0]).toEqual(
        jasmine.objectContaining({
          ext: '.txt',
          UniqueListId: 'Doc_Doc1',
          ClaimAttachmentType: scope.ClaimAttachmentTypes.DocumentManager,
        })
      );
      expect(documents[1]).toEqual(
        jasmine.objectContaining({
          ext: '.doc',
          UniqueListId: 'Doc_Doc2',
          ClaimAttachmentType: scope.ClaimAttachmentTypes.DocumentManager,
        })
      );
    });
  });

  describe('ctrl.createImageDescription method -> ', function () {
    it('should add modality to description if exists', function () {
      var modality = '';
      var image = {
        AdultTeeth: '1,2,3,4,5',
        DeciduousTeeth: '',
        Comments: 'PA 1, 2, 3, 4, 5 ',
      };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' 1,2,3,4,5 (PA 1, 2, 3, 4, 5 )'
      );
      modality = 'DX';
      image = {
        AdultTeeth: '1,2,3,4,5',
        DeciduousTeeth: '',
        Comments: 'PA 1, 2, 3, 4, 5 ',
      };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' DX 1,2,3,4,5 (PA 1, 2, 3, 4, 5 )'
      );
    });

    it('should add image.AdultTeeth to description if exists', function () {
      var modality = 'DX';
      var image = {
        AdultTeeth: '',
        DeciduousTeeth: '',
        Comments: 'PA 1, 2, 3, 4, 5 ',
      };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' DX (PA 1, 2, 3, 4, 5 )'
      );
      image = {
        AdultTeeth: '1,2,3,4,5',
        DeciduousTeeth: '',
        Comments: 'PA 1, 2, 3, 4, 5 ',
      };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' DX 1,2,3,4,5 (PA 1, 2, 3, 4, 5 )'
      );
    });

    it('should add image.DeciduousTeeth to description if exists', function () {
      var modality = 'DX';
      var image = {
        AdultTeeth: '',
        DeciduousTeeth: '',
        Comments: 'PA A, B, C ',
      };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' DX (PA A, B, C )'
      );
      image = {
        AdultTeeth: '',
        DeciduousTeeth: 'A,B,C',
        Comments: 'PA A, B, C ',
      };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' DX A,B,C (PA A, B, C )'
      );
    });

    it('should add image.Comments to description if exists', function () {
      var modality = 'DX';
      var image = { AdultTeeth: '1,2,3,4,5', DeciduousTeeth: '', Comments: '' };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' DX 1,2,3,4,5'
      );
      image = {
        AdultTeeth: '1,2,3,4,5',
        DeciduousTeeth: '',
        Comments: 'PA 1, 2, 3, 4, 5 ',
      };
      expect(ctrl.createImageDescription(modality, image)).toEqual(
        ' DX 1,2,3,4,5 (PA 1, 2, 3, 4, 5 )'
      );
    });
  });

  describe('ctrl.setupPerios function --> ', function () {
    var res = { Value: [] };
    beforeEach(function () {
      res.Value = [
        {
          ExamDate: '2019-09-24',
          ExamId: '888555',
          IsDeleted: false,
          PatientId: '1234',
          Title: '09/24/2019',
        },
      ];
    });

    it('should always set perio.$$ValidAttachmentTypeForClaims to true', function () {
      ctrl.setupPerios(res);
      _.forEach(res.Value, function (perio) {
        expect(perio.$$ValidAttachmentTypeForClaims).toBe(true);
      });
    });
  });

  describe('ctrl.setupImages function --> ', function () {
    var exams = [];
    beforeEach(function () {
      exams = [
        {
          Series: [
            {
              CaptureStationName: '6FSSN72-LT',
              Date: '2019-09-04',
              Description: 'PX',
              Id: 47,
              Images: [
                {
                  AcquisitionDate: '2019-09-04T14:34:51',
                  AdultTeeth: '',
                  Comments: 'PX',
                  DeciduousTeeth: '',
                  Id: 94,
                },
              ],
              Modality: 'PX',
              SeriesNumber: 1,
            },
          ],
        },
      ];
    });
    it('should always set image.$$ValidAttachmentTypeForClaims to true', function () {
      ctrl.setupImages(exams);
      _.forEach(exams, function (exam) {
        _.forEach(exam.Series, function (series) {
          _.forEach(series.Images, function (image) {
            expect(image.$$ValidAttachmentTypeForClaims).toBe(true);
          });
        });
      });
    });
  });

  describe('scope.launchDocumentUpload function ->', function () {
    beforeEach(function () {
      routeParams.patientId = 'originalPatientId';
      ctrl.openDocUploader = jasmine.createSpy();
    });

    it('should call ctrl.openDocUploader and set $routeParams.patientId', function () {
      var patientId = 'patientId';
      scope.claim = { PatientId: patientId };

      scope.launchDocumentUpload();

      expect(ctrl.openDocUploader).toHaveBeenCalled();
      expect(routeParams.patientId).toBe(patientId);
    });
  });

  describe('scope.onUpLoadCancel method', function () {
    it('should call docCtrls.close()', function () {
      scope.docCtrls = { close: jasmine.createSpy() };
      scope.onUpLoadCancel();
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });

  describe('scope.onUpLoadSuccess method', function () {
    let newDoc = {};
    beforeEach(function () {
      newDoc = { id: 'docId' };
      ctrl.insertUploadedDocument = jasmine.createSpy();
      scope.setCurrentDocument = jasmine.createSpy();
      scope.showUploadInvalidTypeMessage = false;
      scope.docCtrls = { close: jasmine.createSpy() };
    });

    it('should call docCtrls.close()', function () {
      scope.onUpLoadSuccess(newDoc);
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });

    it('should call ctrl.insertUploadedDocument with correct parameter', function () {
      scope.onUpLoadSuccess(newDoc);
      expect(ctrl.insertUploadedDocument).toHaveBeenCalledWith(newDoc);
    });

    describe('when newDoc is valid for attachments ->', function () {
      beforeEach(function () {
        newDoc.$$ValidAttachmentTypeForClaims = true;
      });

      it('should call scope.setCurrentDocument with correct parameter', function () {
        scope.onUpLoadSuccess(newDoc);
        expect(scope.setCurrentDocument).toHaveBeenCalledWith(newDoc);
      });

      it('should not set showUploadInvalidTypeMessage', function () {
        scope.onUpLoadSuccess(newDoc);
        expect(scope.showUploadInvalidTypeMessage).toBe(false);
      });
    });

    describe('when newDoc is not valid for attachments ->', function () {
      beforeEach(function () {
        newDoc.$$ValidAttachmentTypeForClaims = false;
      });

      it('should not call scope.setCurrentDocument', function () {
        scope.onUpLoadSuccess(newDoc);
        expect(scope.setCurrentDocument).not.toHaveBeenCalled();
      });

      it('should set showUploadInvalidTypeMessage to true', function () {
        scope.onUpLoadSuccess(newDoc);
        expect(scope.showUploadInvalidTypeMessage).toBe(true);
      });
    });
  });

  describe('ctrl.openDocUploader function ->', function () {
    beforeEach(function () {
      scope.docCtrls = {
        content: jasmine.createSpy(),
        setOptions: jasmine.createSpy(),
        open: jasmine.createSpy(),
      };
    });

    it('should call scope.docCtrls functions', function () {
      ctrl.openDocUploader();

      expect(scope.docCtrls.content).toHaveBeenCalled();
      expect(scope.docCtrls.setOptions).toHaveBeenCalled();
      expect(scope.docCtrls.open).toHaveBeenCalled();
    });
  });

  describe('ctrl.insertUploadedDocument function ->', function () {
    beforeEach(function () {
      ctrl.processDocuments = jasmine.createSpy();
      ctrl.setValidAttachmentTypeForClaims = jasmine.createSpy();

      scope.documentGroupsList[0].Children = [
        { Children: [{ Description: 'Lab', DocumentGroupId: 1, files: [] }] },
        { DocumentGroupId: 2, files: [] },
      ];
    });

    it('should call processDocuments and setValidAttachmentTypeForClaims', function () {
      var newDoc = 'newDoc';

      ctrl.insertUploadedDocument(newDoc);

      expect(ctrl.processDocuments).toHaveBeenCalledWith([newDoc]);
      expect(ctrl.setValidAttachmentTypeForClaims).toHaveBeenCalledWith([
        newDoc,
      ]);
    });

    it('should add document to correct group when group is a child', function () {
      var newDoc = { DocumentGroupId: 1 };

      ctrl.insertUploadedDocument(newDoc);

      expect(
        scope.documentGroupsList[0].Children[0].Children[0].files.length
      ).toBe(1);
      expect(scope.documentGroupsList[0].open).toBe(true);
      expect(scope.documentGroupsList[0].Children[0].open).toBe(true);
      expect(scope.documentGroupsList[0].Children[0].Children[0].open).toBe(
        true
      );
      expect(scope.documentGroupsList[0].Children[1].files.length).toBe(0);
    });

    it('should add document to correct group when group is not a child', function () {
      var newDoc = { DocumentGroupId: 2 };

      ctrl.insertUploadedDocument(newDoc);

      expect(scope.documentGroupsList[0].Children[1].files.length).toBe(1);
      expect(scope.documentGroupsList[0].open).toBe(true);
      expect(scope.documentGroupsList[0].Children[1].open).toBe(true);
      expect(
        scope.documentGroupsList[0].Children[0].Children[0].files.length
      ).toBe(0);
    });

    it('should not add document to a group when group is not found', function () {
      var newDoc = { DocumentGroupId: 3 };

      ctrl.insertUploadedDocument(newDoc);

      expect(scope.documentGroupsList[0].Children[1].files.length).toBe(0);
      expect(scope.documentGroupsList[0].open).not.toBe(true);
      expect(scope.documentGroupsList[0].Children[1].open).not.toBe(true);
      expect(
        scope.documentGroupsList[0].Children[0].Children[0].files.length
      ).toBe(0);
    });
  });

  describe('ctrl.getAllDocuments function ->', function () {
    let documentsReturn = { Value: [] };
    let documentGroupsReturn = { Value: [] };
    let mockDocs = [];
    beforeEach(function () {
      mockDocs = [
        {
          Name: 'document3.txt',
          DocumentGroupId: 1,
          DocumentId: 1,
          MimeType: 'text/plain',
          ext: 'txt',
          DateModified: '2020-04-22 15:00:11.2028845',
        },
        {
          Name: 'document4.txt',
          DocumentGroupId: 1,
          DocumentId: 1,
          MimeType: 'text/plain',
          ext: 'txt',
          DateModified: '2020-03-29 15:00:11.2028845',
        },
        {
          Name: 'document1.txt',
          DocumentGroupId: 1,
          DocumentId: 1,
          MimeType: 'text/plain',
          ext: 'txt',
          DateModified: '2020-04-29 15:00:11.2028845',
        },
        {
          Name: 'document2.txt',
          DocumentGroupId: 1,
          DocumentId: 1,
          MimeType: 'text/plain',
          ext: 'txt',
          DateModified: '2020-04-29 14:00:11.2028845',
        },
      ];
      documentsReturn.Value = _.clone(mockDocs);
      documentGroupsReturn.Value = _.clone(mockDocumentGroups);
      spyOn(ctrl, 'processDocuments');
    });

    it('should call documentService.get', function () {
      ctrl.getAllDocuments();
      expect(documentService.get).toHaveBeenCalled();
    });

    it('should call ctrl.processDocuments after successful documentService.get', function () {
      documentService.get = function (data, success) {
        success(documentsReturn);
      };
      ctrl.getAllDocuments();
      expect(ctrl.processDocuments).toHaveBeenCalled();
    });

    it('should call documentGroupsService.getAll after successful documentService.get', function () {
      documentService.get = function (data, success) {
        success(documentsReturn);
      };
      ctrl.getAllDocuments();
      expect(documentGroupsService.getAll).toHaveBeenCalled();
    });

    it('should add documents to groups based on groupId and sort each group of files by DateModified desc ', function () {
      documentService.get = function (data, success) {
        success(documentsReturn);
      };
      documentGroupsService.getAll = function (success) {
        success(documentGroupsReturn);
      };
      ctrl.getAllDocuments();
      _.forEach(scope.documentGroupsList[0].Children, function (doc) {
        _.forEach(doc.Children, function (child) {
          if (child.files.length > 0) {
            expect(child.files[0].DateModified).toBe(
              '2020-04-29 15:00:11.2028845'
            );
            expect(child.files[1].DateModified).toBe(
              '2020-04-29 14:00:11.2028845'
            );
            expect(child.files[2].DateModified).toBe(
              '2020-04-22 15:00:11.2028845'
            );
            expect(child.files[3].DateModified).toBe(
              '2020-03-29 15:00:11.2028845'
            );
          }
        });
      });
    });
  });

  describe('ctrl.initExternalExams function ->', function () {
    let res = {};
    beforeEach(function () {
      spyOn(ctrl, 'getPatientInfo');
      spyOn(ctrl, 'getImagingProvider');
      spyOn(ctrl, 'getExternalImages');
      spyOn(ctrl, 'getExternalPatientId').and.callFake(function () {
        return { then: function () {} };
      });
      res = [{}];
      q.all = function () {
        return {
          then: function (callback) {
            callback(res);
          },
        };
      };
    });

    it('should call ctrl.getPatientInfo functions', function () {
      ctrl.initExternalExams();
      expect(ctrl.getPatientInfo).toHaveBeenCalled();
    });
    it('should call ctrl.getImagingProvider functions', function () {
      ctrl.initExternalExams();
      expect(ctrl.getImagingProvider).toHaveBeenCalled();
    });
    it('should call ctrl.getExternalPatientId after queued functions are finished if ctrl.patientInfo.Profile.ThirdPartyPatientId is valid', function () {
      ctrl.patientInfo = { Profile: { ThirdPartyPatientId: 500 } };
      scope.imagingProvider = { name: 'Sidexis', error: null };
      ctrl.initExternalExams();
      expect(ctrl.getExternalPatientId).toHaveBeenCalled();
    });

    it('should call ctrl.getExternalImages after queued functions are finished if imagingProvider is not available', function () {
      ctrl.patientInfo = { Profile: { ThirdPartyPatientId: 0 } };
      scope.imagingProvider = { name: 'Sidexis', error: true };
      ctrl.initExternalExams();
      expect(ctrl.getExternalImages).toHaveBeenCalled();
    });

    it('should call ctrl.getExternalImages after queued functions are finished if imagingProvider is available', function () {
      ctrl.patientInfo = { Profile: { ThirdPartyPatientId: 0 } };
      scope.imagingProvider = { name: 'Sidexis' };
      ctrl.initExternalExams();
      expect(ctrl.getExternalImages).toHaveBeenCalled();
    });
  });

  describe('ctrl.getExternalPatientId function ->', function () {
    let res = {};
    beforeEach(function () {
      res = { sidexis: { result: { id: 1234 }, success: true } };
      ctrl.patientInfo = { Profile: { ThirdPartyPatientId: 500 } };
    });

    it('should call imagingMasterService.getPatientByFusePatientId', function () {
      ctrl.getExternalPatientId(ctrl.patientInfo);
      expect(imagingMasterService.getPatientByFusePatientId).toHaveBeenCalled();
    });

    it('should set ctrl.externalPatientId if imagingMasterService.getPatientByFusePatientId is successful', function () {
      imagingMasterService.getPatientByFusePatientId = jasmine
        .createSpy('imagingMasterService.getPatientByFusePatientId')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback(res);
            },
          };
        });
      ctrl.getExternalPatientId(ctrl.patientInfo);
      expect(ctrl.externalPatientId).toBe(1234);
    });
  });

  describe('ctrl.getImagingProvider function ->', function () {
    let res = {};
    beforeEach(function () {
      res = { sidexis: { status: 'ready', provider: 'Sidexis', error: null } };
    });

    it('should call imagingMasterService.getPatientByFusePatientId', function () {
      ctrl.getImagingProvider();
      expect(imagingMasterService.getServiceStatus).toHaveBeenCalled();
    });

    it('should set scope.imagingProvider if imagingMasterService.getServiceStatus returns Sidexis provider', function () {
      imagingMasterService.getServiceStatus = jasmine
        .createSpy('imagingMasterService.getServiceStatus')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback(res);
            },
          };
        });
      ctrl.getImagingProvider();
      expect(scope.imagingProvider.name).toBe('Sidexis');
      expect(scope.imagingProvider.error).toBe(undefined);
      expect(scope.imagingProvider.provider).toBe('Sidexis');
    });
  });

  describe('ctrl.getPatientInfo function ->', function () {
    let res = { Value: {} };
    beforeEach(function () {
      res.Value = { Profile: { PatientId: '1234' } };
    });

    it('should call patientServices.Patients.dashboard', function () {
      ctrl.getPatientInfo();
      expect(patientServices.Patients.dashboard).toHaveBeenCalled();
    });

    it('should set ctrl.patientInfo if patientServices.Patients.dashboard returns patient', function () {
      patientServices.Patients.dashboard = jasmine
        .createSpy('patientServices.Patients.dashboard')
        .and.callFake(function () {
          return {
            $promise: {
              then: function (callback) {
                callback(res);
              },
            },
          };
        });
      ctrl.getPatientInfo();
      expect(ctrl.patientInfo).toBe(res.Value);
    });
  });

  describe('ctrl.getSidexisExternalImageExams function ->', function () {
    let res = { Value: {} };
    beforeEach(function () {
      res.result = [];
      scope.imagingProvider = { name: 'Sidexis', error: null };
      spyOn(ctrl, 'processSidexisStudies').and.callFake(function () {
        return [];
      });
      spyOn(ctrl, 'processExternalImages');
      spyOn(ctrl, 'syncExternalImages');
      ctrl.externalPatientId = '123345';
      ctrl.existingExternalImages = [{}, {}];
      ctrl.externalImageStudies = [{}];
    });

    it('should call imagingMasterService.getAllByPatientId', function () {
      ctrl.externalPatientId = '1234';
      ctrl.getSidexisExternalImageExams();
      expect(imagingMasterService.getAllByPatientId).toHaveBeenCalledWith(
        ctrl.externalPatientId,
        'sidexis'
      );
    });

    it('should set call syncExternalImages if imagingMasterService.getAllByPatientId returns patient records', function () {
      imagingMasterService.getAllByPatientId = jasmine
        .createSpy('imagingMasterService.getAllByPatientId')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback({ result: [{}, {}] });
            },
          };
        });
      ctrl.getSidexisExternalImageExams();
      expect(ctrl.syncExternalImages).toHaveBeenCalledWith(
        ctrl.existingExternalImages,
        ctrl.externalImageStudies
      );
    });

    it('should set ctrl.externalImageStudies if imagingMasterService.getAllByPatientId returns patient', function () {
      imagingMasterService.getAllByPatientId = jasmine
        .createSpy('imagingMasterService.getAllByPatientId')
        .and.callFake(function () {
          return {
            then: function (callback) {
              callback(res);
            },
          };
        });
      ctrl.getSidexisExternalImageExams();
      expect(ctrl.externalImageStudies).toEqual(res.result);
    });
  });

  describe('ctrl.filterCurrentNotes function ->', function () {
    let notes = [];
    beforeEach(function () {
      notes = _.cloneDeep(clinicalNotesMock);
    });

    it('should filter all clinical notes for the latest version', function () {
      _.forEach(notes, function (note) {
        note.StatusTypeId = 1;
      });
      expect(notes.length).toEqual(5);
      let currentNotes = ctrl.filterCurrentNotes(notes);
      expect(currentNotes.length).toEqual(3);
    });

    it('should filter out all clinical notes that have deleted status', function () {
      _.forEach(notes, function (note) {
        note.StatusTypeId = 3;
      });
      expect(notes.length).toEqual(5);
      let currentNotes = ctrl.filterCurrentNotes(notes);
      expect(currentNotes.length).toEqual(0);
    });

    it('should filter out all clinical notes that have AutomaticLockTime not null', function () {
      _.forEach(notes, function (note) {
        note.AutomaticLockTime = '2020-04-30';
      });
      expect(notes.length).toEqual(5);
      let currentNotes = ctrl.filterCurrentNotes(notes);
      expect(currentNotes.length).toEqual(0);
    });

    it('should sort filtered notes by CreatedDate desc', function () {
      expect(notes.length).toEqual(5);
      let currentNotes = ctrl.filterCurrentNotes(notes);
      expect(currentNotes.length).toEqual(3);
      expect(currentNotes[0].CreatedDate).toEqual(
        '2020-04-17T18:20:03.8791182'
      );
      expect(currentNotes[1].CreatedDate).toEqual(
        '2020-03-16T18:20:03.8791182'
      );
      expect(currentNotes[2].CreatedDate).toEqual(
        '2020-02-17T18:20:03.8791182'
      );
    });
  });

  describe('ctrl.buildNoteText function ->', function () {
    let note = {};
    beforeEach(function () {
      note = {
        EntityId: '1234',
        NoteId: '12345',
        PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
        Note: 'consectetur adipiscing elit.',
        NoteTypeId: 3,
        CreatedDate: '2020-04-17T18:20:03.8791182',
        CreatedByName: 'Bond, James',
        NoteTitle: 'Clinical Note',
        StatusType: 1,
        AutomaticLockTime: null,
      };
    });

    it('should create first line of note with NoteTitle and CreatedDate', function () {
      ctrl.buildNoteText(note);
      let sections = note.UnallocatedDocumentAttachment.split('\r\n\r\n');
      expect(sections[0]).toBe('Clinical Note - 04/17/2020');
    });

    it('should create second line of note with last updated date and by', function () {
      ctrl.buildNoteText(note);
      let sections = note.UnallocatedDocumentAttachment.split('\r\n\r\n');
      //expect(sections[1]).toBe('last update by Bond, James on April 17, 2020 at 1:20 PM');
    });

    it('should add header information to note text', function () {
      ctrl.buildNoteText(note);
      //expect(note.UnallocatedDocumentAttachment).toBe('Clinical Note - 04/17/2020\r\n\r\nlast update by Bond, James on April 17, 2020 at 1:20 PM\r\n\r\nconsectetur adipiscing elit.');
    });

    it('should filter all markup from the note body', function () {
      note.Note =
        '<strong>Lorem ipsum dolor sit amet, </strong>uspendisse eu ipsum vitae nisl consectetur scelerisque tincidunt sit amet nisi. Aliquam et lorem risus.';
      ctrl.buildNoteText(note);
      let sections = note.UnallocatedDocumentAttachment.split('\r\n\r\n');
      expect(sections[2]).toBe(
        'Lorem ipsum dolor sit amet, uspendisse eu ipsum vitae nisl consectetur scelerisque tincidunt sit amet nisi. Aliquam et lorem risus.'
      );
    });

    it('should add toothNumbers if they exist', function () {
      note.ToothNumbers = [1, 2, 3, 4];
      note.Note =
        '<strong>Lorem ipsum dolor sit amet, </strong>uspendisse eu ipsum vitae nisl consectetur scelerisque tincidunt sit amet nisi. Aliquam et lorem risus.';
      ctrl.buildNoteText(note);
      let sections = note.UnallocatedDocumentAttachment.split('\r\n\r\n');
      expect(sections[2]).toEqual('Teeth: 1, 2, 3, 4');
    });
  });

  describe('ctrl.addNotesToDocumentGroup function ->', function () {
    let clinicalNotes = [];
    beforeEach(function () {
      clinicalNotes = _.cloneDeep(clinicalNotesMock);
    });

    it('should add computed fields to each note', function () {
      ctrl.addNotesToDocumentGroup(clinicalNotes);
      _.forEach(clinicalNotes, function (note) {
        expect(note.UniqueListId).toEqual('Note_' + note.NoteId);
        expect(note.Name).toEqual(
          note.NoteTitle +
            ' ' +
            moment(moment.utc(note.CreatedDate).toDate()).format(
              'MM/DD/YYYY h:mm a'
            )
        );
        expect(note.ClaimAttachmentType).toEqual(
          scope.ClaimAttachmentTypes.UnallocatedDocument
        );
        expect(note.ext).toEqual('.txt');
        expect(note.$$ValidAttachmentTypeForClaims).toEqual(true);
      });
    });
  });

  describe('ctrl.processExternalImages function ->', function () {
    let externalImages = [];
    beforeEach(function () {
      externalImages = _.cloneDeep(externalImagesMock);
    });

    it('should organize images into exams grouped by date', function () {
      ctrl.processExternalImages(externalImages);
      expect(scope.documentGroupsList[3].Children.length).toBe(3);
    });

    it('should organize images into exams grouped by date in desc order', function () {
      ctrl.processExternalImages(externalImages);
      expect(scope.documentGroupsList[3].Children.length).toBe(3);
      expect(
        scope.documentGroupsList[3].Children[0].files[0].$$ExamDate
      ).toEqual('Thursday, March 12 2020');
      expect(
        scope.documentGroupsList[3].Children[1].files[0].$$ExamDate
      ).toEqual('Wednesday, March 11 2020');
      expect(
        scope.documentGroupsList[3].Children[2].files[0].$$ExamDate
      ).toEqual('Tuesday, March 10 2020');
    });

    it('should set computed properties on each image', function () {
      ctrl.processExternalImages(externalImages);
      _.forEach(scope.documentGroupsList[2].Children, function (group) {
        _.forEach(group.files, function (file) {
          expect(file.UniqueListId).toEqual('Image_' + file.ImageId);
          expect(file.ClaimAttachmentType).toEqual(
            scope.ClaimAttachmentTypes.SidexisImage
          );
          expect(file.ext).toEqual('.sidexis');
          expect(file.SidexisImageId).toEqual(file.ImageId);
        });
      });
    });
  });

  describe('ctrl.setupAttachedFiles function ->', function () {
    let res = { Value: [] };
    beforeEach(function () {
      let attachments = _.clone(mockDocuments);
      res.Value = { Attachments: attachments };
        spyOn(ctrl, 'determineTypeOfUnallocatedDocument');
        spyOn(ctrl, 'clearinghouseVendors').and.returnValue(clearinghouseVendors);
    });

    it('should call determineTypeOfUnallocatedDocument for each file', function () {
      ctrl.setupAttachedFiles(res);
      _.forEach(res.Value.Attachments, function (attachment) {
        expect(ctrl.determineTypeOfUnallocatedDocument).toHaveBeenCalledWith(
          attachment
        );
      });
    });

    it('should notify user to modify attachment', function () {
      var vendorDocs = [
        {
          Name: 'document3.txt',
          DocumentGroupId: 1,
          DocumentId: 6,
          MimeType: 'text/plain',
          ext: 'txt',
          ClearinghouseVendor: "ChangeHealthCare"
        }
      ];
      res.Value = { Attachments: vendorDocs };
      ctrl.setupAttachedFiles(res);
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should not notify user to modify attachment', function () {
      var vendorDocs = [
        {
          Name: 'document3.txt',
          DocumentGroupId: 1,
          DocumentId: 6,
          MimeType: 'text/plain',
          ext: 'txt',
          ClearinghouseVendor: "DentalXChange"
        }        
      ];
      res.Value = { Attachments: vendorDocs };
      ctrl.setupAttachedFiles(res);
      expect(mockModalFactory.ConfirmModal).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.determineTypeOfUnallocatedDocument function ->', function () {
    beforeEach(function () {
      scope.ClaimAttachmentTypes = {
        DocumentManager: 1,
        ApteryxImage: 2,
        PerioExam: 3,
        SidexisImage: 4,
        UnallocatedDocument: 5,
      };
      scope.currentDocument = {
        ClaimAttachmentType: scope.ClaimAttachmentTypes.UnallocatedDocument,
        UnallocatedDocumentId: 'ClinicalNote_12345',
        ext: 'txt',
      };
    });

    it('should not set $$IsClinicalNote if currentDocument has ClaimAttachmentType of UnallocatedDocument and UnallocatedDocumentId starts with ClinicalNote', function () {
      ctrl.determineTypeOfUnallocatedDocument(scope.currentDocument);
      expect(scope.currentDocument.$$IsNarrative).toEqual(false);
      expect(scope.currentDocument.$$IsClinicalNote).toEqual(true);
    });

    it('should set $$IsNarrative if currentDocument has ClaimAttachmentType of UnallocatedDocument and UnallocatedDocumentId starts with Narrative', function () {
      scope.currentDocument.UnallocatedDocumentId = 'Narrative_12345';
      ctrl.determineTypeOfUnallocatedDocument(scope.currentDocument);
      expect(scope.currentDocument.$$IsNarrative).toEqual(true);
      expect(scope.currentDocument.$$IsClinicalNote).toEqual(false);
    });

    it('should set $$IsNarrative if currentDocument has ClaimAttachmentType of UnallocatedDocument and UnallocatedDocumentId starts with Narrative', function () {
      scope.currentDocument.UnallocatedDocumentId = 'Narrative_12345';
      ctrl.determineTypeOfUnallocatedDocument(scope.currentDocument);
      expect(scope.currentDocument.$$IsNarrative).toEqual(true);
    });
  });

  describe('ctrl.setNarrativeProperties function ->', function () {
    beforeEach(function () {
      scope.currentDocument = { attachmentType: '2' };
      scope.currentDocument.attachmentNotes = 'notes';
    });

    it('should set propeties for document if this is a Narrative only type document', function () {
      ctrl.setNarrativeProperties(scope.currentDocument);
      expect(scope.currentDocument.attachmentType).toEqual('2');
      expect(
        scope.currentDocument.UniqueListId.substring(
          0,
          scope.currentDocument.UniqueListId.indexOf('_')
        )
      ).toEqual('Narrative');
      expect(
        scope.currentDocument.UnallocatedDocumentId.substring(
          0,
          scope.currentDocument.UnallocatedDocumentId.indexOf('_')
        )
      ).toEqual('Narrative');
      expect(scope.currentDocument.$$IsNarrative).toEqual(true);
      expect(scope.currentDocument.UnallocatedDocumentAttachment).toEqual(
        scope.currentDocument.attachmentNotes
      );
    });
  });

  describe('scope.attachmentTypeSelected function ->', function () {
    beforeEach(function () {
      scope.attachmentDocumentTypesList = mockAttachmentDocumentTypeResult.documentTypes;
    });
    
    it('should new currentDocument with attachmentType of Narrative if Narrative selected but no currentDocument', function () {
      scope.currentDocument = null;
      scope.attachmentTypeSelected('Narrative');
      expect(scope.currentDocument.attachmentType).toEqual('Narrative')
    });

    it('should not create new currentDocument if not null attachmentType is not Narrative', function () {
      scope.currentDocument = null;
      scope.attachmentTypeSelected('XRays');
      expect(scope.currentDocument).toBeNull();
    });

    // it('should not create new currentDocument if not null', function () {
    //   scope.currentDocument = _.clone(mockDocuments[3]);
    //   scope.attachmentTypeSelected('Narrative');
    //   expect(scope.currentDocument).toEqual(_.clone(mockDocuments[3]));
    // });
  });

  describe('needsOrientation ->', function () {   
    beforeEach(inject(function ($filter) {      
      filter = $filter('needsOrientation');
      scope.attachmentDocumentTypesList = mockAttachmentDocumentTypeResult.documentTypes;
    }));

    it('should return true if attachmentType.orientationRequired is true', function () {      
      const attachmentType = 'XRays';
      expect(filter(attachmentType, scope.attachmentDocumentTypesList)).toBe(true);
    });

    it('should return false if attachmentType.orientationRequired is false ', function () {
      const attachmentType = 'DentalModels';
      expect(filter(attachmentType, scope.attachmentDocumentTypesList)).toBe(false);
    });

    it('should return false if attachmentType is not in list ', function () {
      const attachmentType = 'attachmentDocumentTypeNotInList';
      expect(filter(attachmentType, scope.attachmentDocumentTypesList)).toBe(false);
    });
  });

  
  
});

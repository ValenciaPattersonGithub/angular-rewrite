describe('FormsTemplatesController tests ->', function () {
  var ctrl,
    ctrl2,
    scope,
    cacheFactory,
    currentLocation,
    locationService,
    patients,
    documentGroupsList,
    communicationTemplateDataPointsService,
    datapoints,
    location,
    fileUploadFactory,
    referenceDataService;

  currentLocation = {
    name: '45 Hickory Industrial Ct.',
    id: '4',
  };

  datapoints = {
    group: 'Patient',
    displayName: 'Full Name',
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

      communicationTemplateDataPointsService = {
        getTemplateDataPoints: jasmine.createSpy().and.returnValue(datapoints),
      };

      $provide.value(
        'communicationTemplateDataPointsService',
        communicationTemplateDataPointsService
      );

      cacheFactory = {
        get: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('CacheFactory', cacheFactory);

      var urlParams = { patientId: '1' };
      location = { search: jasmine.createSpy().and.returnValue(urlParams) };

      fileUploadFactory = {};
      $provide.value('FileUploadFactory', fileUploadFactory);

      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        entityNames: {
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
      $provide.value('MedicalHistoryFactory', {
        access: jasmine.createSpy().and.returnValue({ View: true })
      });
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('FormsTemplatesController', {
      $scope: scope,
      uriService: {},
      ModalFactory: {},
      $location: location,
    });

    ctrl2 = $controller('FormsTemplatesController', {
      $scope: scope,
      uriService: {},
    });
    scope.documentGroupsList = documentGroupsList.Value;
  }));

  describe('getTemplateDataPoints function -> ', function () {
    it('should call API tempate data points', function () {
      spyOn(ctrl2, 'getTemplateDataPoints');
      ctrl2.getTemplateDataPoints();
      expect(ctrl2.getTemplateDataPoints).toHaveBeenCalled();
    });
  });

  describe('populateGrid function -> ', function () {
    var docList;
    var emptyDocList;

    beforeEach(function () {
      docList = [
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
      ];
    });

    it('should set the set the emptyGrid variable to false if the docList has values', function () {
      expect(docList.length).toBe(2);
      scope.populateGrid(docList);
      expect(scope.emptyGrid).toBe(false);
    });

    it('should set the set the emptyGrid variable to true if the docList has NO values', function () {
      expect(emptyDocList).toBeUndefined();
      scope.populateGrid(emptyDocList);
      expect(scope.emptyGrid).toBe(true);
    });
  });

  describe('updateCounts function -> ', function () {
    var allPatientDocs;

    beforeEach(function () {
      allPatientDocs = [
        { DocumentGroupId: 1 },
        { DocumentGroupId: 1 },
        { DocumentGroupId: 3 },
      ];
      scope.documentGroupsList = [
        { DocumentGroupId: 1, Description: 'Clinical' },
        { DocumentGroupId: 2, Description: 'Account' },
        { DocumentGroupId: 3, Description: 'Insurance' },
      ];
    });

    it('should set parent folder counts', function () {
      expect(scope.clinicalCount).toBeUndefined();
      expect(scope.accountCount).toBeUndefined();
      expect(scope.insuranceCount).toBeUndefined();
      ctrl.updateCounts(allPatientDocs);
      expect(scope.clinicalCount).toBe(2);
      expect(scope.accountCount).toBe(0);
      expect(scope.insuranceCount).toBe(1);
    });

    it('should set counts on sub-groups', function () {
      expect(scope.documentGroupsList[0].$$Count).toBeUndefined();
      expect(scope.documentGroupsList[1].$$Count).toBeUndefined();
      expect(scope.documentGroupsList[2].$$Count).toBeUndefined();
      ctrl.updateCounts(allPatientDocs);
      expect(scope.documentGroupsList[0].$$Count).toBe(2);
      expect(scope.documentGroupsList[1].$$Count).toBe(0);
      expect(scope.documentGroupsList[2].$$Count).toBe(1);
    });
  });
});

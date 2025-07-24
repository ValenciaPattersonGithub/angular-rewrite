describe('ImagingExamPreviewController ->', function () {
  var scope, ctrl, imagingUtilities, modalInstance, localize;
  var imagingMasterService, imagingProviders, http;
  var serviceStatus = {
    apteryx: { status: 'notAvailable' },
    sidexis: { status: 'ready' },
  };
  var patientInfoMock = { ThirdPartyPatientId: '1234', PreferredHygienist: '' };

  var exam = {
    Provider: 'testProvider',
    Id: 1,
    Series: [
      {
        Images: [{ Id: 1 }, { Id: 2 }],
      },
      {
        Images: [{ Id: 1 }, { Id: 2 }, { Id: 1 }, { Id: 2 }],
      },
    ],
  };

  var activateTab = jasmine.createSpy();

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Patient'));

  // create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      imagingMasterService = {
        getUrlForExamByPatientIdExamId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getServiceStatus: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(serviceStatus),
        }),
      };
      $provide.value('ImagingMasterService', imagingMasterService);

      imagingProviders = {};
      $provide.value('ImagingProviders', imagingProviders);

      imagingUtilities = {
        retrieveImagesForExam: function () {},
      };
      modalInstance = {
        close: jasmine.createSpy(),
      };
      $provide.value('ImagingUtilities', imagingUtilities);
      $provide.value('$uibModalInstance', modalInstance);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $httpBackend) {
    http = $httpBackend;
    scope = $rootScope.$new();
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue('20 Images'),
    };
    ctrl = $controller('ImagingExamPreviewController', {
      $scope: scope,
      exam: exam,
      patientInfo: _.clone(patientInfoMock),
      activateTab: activateTab,
      localize: localize,
    });
  }));

  it('should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('$onInit function ->', function () {
    beforeEach(function () {
      scope.exam = null;
      scope.hasChanges = true;
      scope.imagesLoaded = true;
      ctrl.loadImages = jasmine.createSpy();
      ctrl.setTitle = jasmine.createSpy();
      spyOn(ctrl, 'getImagingOptions');
      ctrl.$onInit();
    });

    it('should set default values', function () {
      expect(scope.exam).toEqual(exam);
      expect(scope.hasChanges).toBe(false);
      expect(scope.imagesLoaded).toBe(false);
      expect(ctrl.loadImages).toHaveBeenCalledWith(exam);
      expect(ctrl.setTitle).toHaveBeenCalled();
      expect(ctrl.getImagingOptions).toHaveBeenCalled();
    });
  });

  describe('ctrl.loadImages function ->', function () {
    beforeEach(function () {
      imagingUtilities.retrieveImagesForExam = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });
      ctrl.loadImages(exam);
    });

    it('should call imagingUtilities.retrieveImagesForExam with exam', function () {
      expect(imagingUtilities.retrieveImagesForExam).toHaveBeenCalledWith(exam);
    });
  });

  describe('ctrl.setTitle function ->', function () {
    beforeEach(function () {
      exam.ImageCount = 20;
      exam.Description = 'Mock Description';
      exam.Date = '2019-07-02 03:02:52.7650000';
      moment.tz.setDefault('America/Chicago');
    });

    it('should set display correct date for exam based on utc', function () {
      ctrl.setTitle();
      expect(scope.title).toEqual('07/01/2019 - Mock Description (20 Images)');
    });

    it('should display exam.Description as blank if value is null', function () {
      exam.Description = null;
      ctrl.setTitle();
      expect(exam.Description).toEqual('');
    });

    afterEach(function () {
      moment.tz.setDefault();
    });
  });

  describe('ctrl.setTitle function test 2 ->', function () {
    beforeEach(function () {
      exam.ImageCount = 20;
      exam.Description = 'Mock Description';
      exam.Date = '2019-07-02 11:02:52.7650000';
      moment.tz.setDefault('America/Chicago');
    });

    it('should set display correct date for exam based on utc', function () {
      ctrl.setTitle();
      expect(scope.title).toEqual('07/02/2019 - Mock Description (20 Images)');
    });

    afterEach(function () {
      moment.tz.setDefault();
    });
  });

  describe('ctrl.setTitle function test 3 ->', function () {
    beforeEach(function () {
      exam.ImageCount = 20;
      exam.Description = 'Mock Description';
      exam.Date = '2019-07-02 23:02:52.7650000';
      moment.tz.setDefault('America/Chicago');
    });

    it('should set display correct date for exam based on utc', function () {
      ctrl.setTitle();
      expect(scope.title).toEqual('07/02/2019 - Mock Description (20 Images)');
    });

    afterEach(function () {
      moment.tz.setDefault();
    });
  });

  describe('ctrl.loadImagesFailure function test  ->', function () {
    beforeEach(function () {});

    it('should set imagesLoaded to true', function () {
      ctrl.loadImagesFailure();
      expect(scope.imagesLoaded).toBe(true);
      expect(scope.noImagesAvailableError).toBe(true);
    });
  });

  describe('scope.showExamInImaging method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'viewExternalImage');
      spyOn(scope, 'close');
    });

    it('should call ctrl.viewExternalImage if Sidexis Exam', function () {
      exam.Description = 'Sidexis Exam';
      scope.showExamInImaging();
      expect(ctrl.viewExternalImage).toHaveBeenCalled();
    });

    it('should call activateTab if Description is not Sidexis Exam', function () {
      exam.Description = 'Not Sidexis Exam';
      scope.showExamInImaging();
      expect(ctrl.viewExternalImage).not.toHaveBeenCalled();
      expect(activateTab).toHaveBeenCalledWith('imaging', {
        examId: exam.Id,
        provider: exam.Provider,
      });
      expect(scope.close).toHaveBeenCalled();
    });
  });

  describe('ctrl.viewExternalImage method ->', function () {
    beforeEach(function () {
      scope.patientInfo = _.clone(patientInfoMock);
      // sidexis exam
      scope.exam = {
        Description: 'Sidexis Exam',
        Series: [
          {
            Images: [
              {
                ImageId: 'f11ac445-1b63-45b4',
                ThirdPartyImagingRecordId: 458821,
                FileAllocationId: 1234,
              },
              {
                ImageId: 'f11ac445-1b63-46b5',
                ThirdPartyImagingRecordId: 458822,
                FileAllocationId: 1234,
              },
            ],
          },
        ],
        date: '2020-04-08',
        ImageCount: 2,
      };
      imagingProviders = [
        { name: 'XVWeb', provider: 'Apteryx2' },
        { name: 'XVWeb', provider: 'Sidexis' },
      ];
    });

    it('should call imagingMasterService.getUrlForExamByPatientIdExamId', function () {
      ctrl.viewExternalImage();
      expect(
        imagingMasterService.getUrlForExamByPatientIdExamId
      ).toHaveBeenCalledWith(
        scope.patientInfo.ThirdPartyPatientId,
        imagingProviders.Sidexis,
        scope.exam.Series[0].Images[0].ImageId
      );
    });
  });

  describe('ctrl.getImagingOptions method ->', function () {
    beforeEach(function () {
      scope.exam = _.cloneDeep(exam);
    });

    it('should call imagingMasterService.getServiceStatus if exam.Description is Sidexis Exam', function () {
      exam.Description = 'Sidexis Exam';
      ctrl.getImagingOptions();
      expect(imagingMasterService.getServiceStatus).toHaveBeenCalled();
    });

    it('should not call imagingMasterService.getServiceStatus if exam.Description is not Sidexis Exam', function () {
      exam.Description = 'Other';
      ctrl.getImagingOptions();
      expect(imagingMasterService.getServiceStatus).not.toHaveBeenCalled();
    });

    it('should set scope.imagingProviderNotAvailable to true if exam.Description is Sidexis Exam and sidexis provider has error', function () {
      exam.Description = 'Sidexis Exam';
      expect(scope.imagingProviderNotAvailable).toEqual(false);
      serviceStatus = {
        apteryx: { status: 'notAvailable' },
        sidexis: { status: 'error' },
      };
      imagingMasterService.getServiceStatus = jasmine
        .createSpy()
        .and.returnValue({ then: cb => cb(serviceStatus) });
      ctrl.getImagingOptions();
      expect(scope.imagingProviderNotAvailable).toEqual(true);
    });

    it('should set scope.imagingProviderNotAvailable to false if exam.Description is Sidexis Exam and sidexis provider has error', function () {
      exam.Description = 'Other';
      expect(scope.imagingProviderNotAvailable).toEqual(false);
      serviceStatus = {
        apteryx: { status: 'notAvailable' },
        sidexis: { status: 'error' },
      };
      imagingMasterService.getServiceStatus = jasmine
        .createSpy()
        .and.returnValue({ then: cb => cb(serviceStatus) });
      ctrl.getImagingOptions();
      expect(scope.imagingProviderNotAvailable).toEqual(false);
    });

    it('should set scope.imagingProviderNotAvailable to false if sidexis provider is ready', function () {
      exam.Description = 'Sidexis Exam';
      expect(scope.imagingProviderNotAvailable).toEqual(false);
      serviceStatus = {
        apteryx: { status: 'notAvailable' },
        sidexis: { status: 'ready' },
      };
      imagingMasterService.getServiceStatus = jasmine
        .createSpy()
        .and.returnValue({ then: cb => cb(serviceStatus) });
      ctrl.getImagingOptions();
      expect(scope.imagingProviderNotAvailable).toEqual(false);
    });
  });
});

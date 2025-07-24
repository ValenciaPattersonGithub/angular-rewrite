describe('PatientImagingController ->', function () {
    var scope, ctrl, window;
  var locationServices, sce, imagingMasterService, imagingProviders;
  let getReadyServicesReturnValue, imagingProvider;

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Patient'));

  // create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      locationServices = {
        get: jasmine.createSpy(),
      };
      $provide.value('LocationServices', locationServices);

      getReadyServicesReturnValue = {};
      imagingProvider = { apteryx: { status: 'ready', service: {} } };
      getReadyServicesReturnValue.then = function (callback) {
        callback(imagingProvider);
      };
      imagingMasterService = {
        getReadyServices: jasmine
          .createSpy()
          .and.returnValue(getReadyServicesReturnValue),
      };
      $provide.value('ImagingMasterService', imagingMasterService);

      imagingProviders = {
        Apteryx: 'apteryx',
        Apteryx2: 'apteryx2',
        Sidexis: 'sidexis',
        Blue: 'blue',
      };
      $provide.value('ImagingProviders', imagingProviders);

      $provide.value('IndexedDbCacheService', {
        remove: (_) => {},
      })
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    sce = {
      trustAsResourceUrl: jasmine.createSpy().and.callFake(function (url) {
        return url;
      }),
      };

      window = {
          innerHeight: 800,
          addEventListener: jasmine.createSpy(),
          removeEventListener: jasmine.createSpy(),
      };

    ctrl = $controller('PatientImagingController', {
      $scope: scope,
      $sce: sce,
      $window: window
    });
  }));

  it('should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('ctrl.loadImagingForNewPatient function ->', function () {
    var url;
    beforeEach(function () {
      url = 'url';
      imagingMasterService.getUrlForNewPatient = jasmine
        .createSpy()
        .and.returnValue({ then: cb => cb({ result: url }) });
      scope.loading = true;
      scope.imagingPatientNotFound = true;
      scope.frameSource = '';
      scope.personId = 'person-id';
      scope.patient = {
        LastName: 'lastName',
        FirstName: 'firstName',
        Sex: 'sex',
        DateOfBirth: 'dob',
        PreferredLocation: 'preferredLocation'
      };
      scope.imagingProvider = 'imaging';        
      spyOn(scope, 'calculateIframeHeight').and.callFake(function () { });
    });

    it('should set values correctly', function () {
      ctrl.loadImagingForNewPatient();

      expect(scope.loading).toBe(false);
      expect(scope.imagingPatientNotFound).toBe(false);
      expect(scope.frameSource).toBe(url);
      expect(imagingMasterService.getUrlForNewPatient).toHaveBeenCalledWith(
        {
          patientId: scope.personId,
          lastName: encodeURIComponent(scope.patient.LastName),
          firstName: encodeURIComponent(scope.patient.FirstName),
          gender: scope.patient.Sex,
          birthDate: scope.patient.DateOfBirth,
          primLocation: scope.patient.PreferredLocation
        },
        scope.imagingProvider
      );
    });
  });

  describe('ctrl.getImagingPatientSuccess function ->', function () {
    let provider;
    beforeEach(function () {
      provider = 'testProvider';
      scope.imagingProvider = provider;

      ctrl.getImagingPatientFailure = jasmine.createSpy();
      ctrl.loadImagingForNewPatient = jasmine.createSpy();
    });

    it('should call ctrl.getImagingPatientFailure if results are null', function () {
      let results = null;

      ctrl.getImagingPatientSuccess(results);

      expect(ctrl.getImagingPatientFailure).toHaveBeenCalled();
    });

    it('should call ctrl.getImagingPatientFailure if results for the provider are null', function () {
      let results = {};
      results[provider] = null;

      ctrl.getImagingPatientSuccess(results);

      expect(ctrl.getImagingPatientFailure).toHaveBeenCalled();
    });

    it('should call ctrl.getImagingPatientFailure if results for the provider are unsuccessful', function () {
      let results = {};
      results[provider] = { success: false };

      ctrl.getImagingPatientSuccess(results);

      expect(ctrl.getImagingPatientFailure).toHaveBeenCalled();
    });

    describe('when provider results are not null', function () {
      let provider;
      beforeEach(function () {
        provider = 'testProvider';
        scope.imagingProvider = provider;
        ctrl.permissionsFlag = false;
        scope.imagingPatientNotFound = false;
        scope.notFoundMessage = '';
        scope.patient = {};
        scope.loading = false;
        ctrl.imagingPatient = null;
      });

      it('should set not found properties when res is null', function () {
        let results = {};
        results[provider] = {
          success: true,
          result: null,
        };

        let result = ctrl.getImagingPatientSuccess(results);

        expect(result).toBe(false);
        expect(scope.imagingPatientNotFound).toBe(true);
        expect(scope.notFoundMessage).toBe(
          'There are no saved images for {0}.'
        );
      });

      it('should set not found properties when res.Value is null and res.data is null', function () {
        let results = {};
        results[provider] = {
          success: true,
          result: { data: null },
        };

        let result = ctrl.getImagingPatientSuccess(results);

        expect(result).toBe(false);
        expect(scope.imagingPatientNotFound).toBe(true);
        expect(scope.notFoundMessage).toBe(
          'There are no saved images for {0}.'
        );
      });

      it('should set not found properties when res.Value is null and res.data.Records is null', function () {
        let results = {};
        results[provider] = {
          success: true,
          result: { data: { Records: null } },
        };

        let result = ctrl.getImagingPatientSuccess(results);

        expect(result).toBe(false);
        expect(scope.imagingPatientNotFound).toBe(true);
        expect(scope.notFoundMessage).toBe(
          'There are no saved images for {0}.'
        );
      });

      it('should set not found properties when res.Value is null and res.data.Records is empty', function () {
        let results = {};
        results[provider] = {
          success: true,
          result: { data: { Records: [] } },
        };

        let result = ctrl.getImagingPatientSuccess(results);

        expect(result).toBe(false);
        expect(scope.imagingPatientNotFound).toBe(true);
        expect(scope.notFoundMessage).toBe(
          'There are no saved images for {0}.'
        );
      });

      it('should not set not found properties when res.Value is null and res.data.Records is not empty', function () {
        let results = {};
        results[provider] = {
          success: true,
          result: { data: { Records: [{}] } },
        };

        let result = ctrl.getImagingPatientSuccess(results);

        expect(result).toBe(true);
        expect(scope.imagingPatientNotFound).toBe(false);
        expect(scope.notFoundMessage).toBe('');

        expect(scope.loading).toBe(false);
        expect(ctrl.imagingPatient).not.toBeNull();
      });

      it('should not set not found properties when res.Value is not null', function () {
        let results = {};
        results[provider] = {
          success: true,
          result: { Value: {} },
        };

        let result = ctrl.getImagingPatientSuccess(results);

        expect(result).toBe(true);
        expect(scope.imagingPatientNotFound).toBe(false);
        expect(scope.notFoundMessage).toBe('');

        expect(scope.loading).toBe(false);
        expect(ctrl.imagingPatient).not.toBeNull();
      });

      it('should call ctrl.loadImagingForNewPatient if patient not found and permissions flag set', function () {
        ctrl.permissionsFlag = true;

        let results = {};
        results[provider] = {
          success: true,
          result: { data: { Records: [] } },
        };

        ctrl.getImagingPatientSuccess(results);

        expect(ctrl.loadImagingForNewPatient).toHaveBeenCalledWith();
      });

      it('should not call ctrl.loadImagingForNewPatient if patient not found and permissions flag not set', function () {
        ctrl.permissionsFlag = false;

        let results = {};
        results[provider] = {
          success: true,
          result: { data: { Records: [] } },
        };

        ctrl.getImagingPatientSuccess(results);

        expect(ctrl.loadImagingForNewPatient).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('scope.launchFullscreen function ->', function () {
    beforeEach(function () {
      scope.personId = 1;
    });

    it('should not call tabLauncher when ctrl.fullscreenParams is null', function () {
      ctrl.fullscreenParams = null;

      scope.launchFullscreen();

      expect(_tabLauncher_.launchNewTab).not.toHaveBeenCalled();
    });

    it('should not call tabLauncher when ctrl.fullscreenParams.patient is null', function () {
      ctrl.fullscreenParams = {};

      scope.launchFullscreen();

      expect(_tabLauncher_.launchNewTab).not.toHaveBeenCalled();
    });

    it('should call tabLauncher with correct value when ctrl.fullscreenParams.exam is null', function () {
      ctrl.fullscreenParams = {
        patient: 123,
        imagingPovider: 'imaging',
      };

      scope.launchFullscreen();

      expect(_tabLauncher_.launchNewTab).toHaveBeenCalledWith(
        `#/Patient/${scope.personId}/Imaging/FullScreen?patient=${ctrl.fullscreenParams.patient}&imagingProvider=${ctrl.fullscreenParams.imagingProvider}`
      );
    });

    it('should call tabLauncher with correct value when ctrl.fullscreenParams.exam is not null', function () {
      ctrl.fullscreenParams = {
        patient: 123,
        exam: 234,
      };

      scope.launchFullscreen();

      expect(_tabLauncher_.launchNewTab).toHaveBeenCalledWith(
        `#/Patient/${scope.personId}/Imaging/FullScreen?patient=${ctrl.fullscreenParams.patient}&imagingProvider=${ctrl.fullscreenParams.imagingProvider}&exam=${ctrl.fullscreenParams.exam}`
      );
    });
  });

  describe('scope.calculateIframeHeight function ->', function () {      
    it('should set scope.iframeHeight to 642px when difference is less than 642', function () {            
      //Make iframe.getBoundingClientRect().top return 250                          
      spyOn(document, 'getElementById').and.returnValue({
            style: {height:0},
            getBoundingClientRect: function () { return { top: 250 } }
        });
      
      scope.calculateIframeHeight();
    
      expect(scope.iframeHeight).toBe('642px');
    });
    
    it('should set scope.iframeHeight to 690px when difference is less than 642', function () {            
      //Make iframe.getBoundingClientRect().top return 100      
      spyOn(document, 'getElementById').and.returnValue({
            style: {height:0},
            getBoundingClientRect: function () { return { top: 100 } }
        });
      
      scope.calculateIframeHeight();
      
      expect(scope.iframeHeight).toBe('690px');
    });
  });

  describe('ctrl.$onInit method ->', function () {
    let returnVal = {};
    beforeEach(function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      spyOn(ctrl, 'checkUserAuthorization').and.returnValue(returnVal);
      spyOn(ctrl, 'setFrameSource').and.callFake(function () {});
        spyOn(ctrl, 'getSiteNameFailure').and.callFake(function () { });
        //spy on $scope.calculateIframeHeight
      spyOn(scope, 'calculateIframeHeight').and.callFake(function () { });
    });

      it('should call calculateIframeHeight', function () {
        ctrl.$onInit();
        expect(scope.calculateIframeHeight).toHaveBeenCalled();
      });

    it('should call imagingMasterService.getReadyServices', function () {
      returnVal.then = function (callback) {
        callback(false);
      };
      ctrl.$onInit();
      expect(imagingMasterService.getReadyServices).toHaveBeenCalled();
    });

    it('should set imagingProvider to Apteryx if imagingMasterService.getReadyServices returns res.apteryx.status as ready', function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      scope.imagingProvider = imagingProviders.Apteryx;
      ctrl.$onInit();
      expect(ctrl.setFrameSource).toHaveBeenCalled();
      expect(ctrl.imagingService).toBe(imagingProvider.apteryx.service);
    });

    it('should set imagingProvider to Apteryx2 if imagingMasterService.getReadyServices returns res.apteryx2.status as ready', function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      imagingProvider = { apteryx2: { status: 'ready', service: {} } };
      scope.imagingProvider = imagingProviders.Apteryx2;
      ctrl.$onInit();
      expect(ctrl.setFrameSource).toHaveBeenCalled();
      expect(ctrl.imagingService).toBe(imagingProvider.apteryx2.service);
    });

    it('should set imagingProvider to Blue if imagingMasterService.getReadyServices returns res.blue.status as ready', function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      imagingProvider = { blue: { status: 'ready', service: {} } };
      scope.imagingProvider = imagingProviders.Blue;
      ctrl.$onInit();
      expect(ctrl.setFrameSource).toHaveBeenCalled();
      expect(ctrl.imagingService).toBe(imagingProvider.blue.service);
    });

    it('should set loadingMessage if imagingMasterService.getReadyServices returns no service', function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      imagingProvider = { apteryx2: { status: 'ready', service: {} } };
      ctrl.$onInit();
      expect(scope.loadingMessage).toBe(
        'No Imaging Provider is Active for this Practice'
      );
    });

    it('should call ctrl.getSiteNameFailure if imagingMasterService.getReadyServices returns no service', function () {
      returnVal.then = function (callback) {
        callback(true);
      };
      imagingProvider = { apteryx2: { status: 'ready', service: {} } };
      ctrl.$onInit();
      expect(ctrl.getSiteNameFailure).toHaveBeenCalled();
    });
  });

  describe('ctrl.setFrameSource method ->', function () {
    let returnVal = {};
    beforeEach(function () {
      scope.personId = '1234';
      returnVal.then = function (callback) {
        callback({ then: {} });
      };
      ctrl.imagingService = {
        getPatientByPDCOPatientId: jasmine
          .createSpy()
          .and.returnValue(returnVal),
      };
      spyOn(ctrl, 'loadImagingForNewPatient').and.callFake(function () {});
      spyOn(ctrl, 'setFrameSource_getUrlForExam').and.callFake(function () {});
    });

    it('should call ctrl.setFrameSource_getUrlForExam if ctrl.imagingPatient.Id is not null or undefined', function () {
      ctrl.imagingPatient.Id = '1234';
      ctrl.setFrameSource();
      expect(ctrl.setFrameSource_getUrlForExam).toHaveBeenCalled();
    });
  });

  describe('scope.blueCapture function ->', function () {
    var result;
    beforeEach(function () {
      scope.personId = 'personId';
      scope.patient = {
        LastName: 'lastName',
        FirstName: 'firstName',
        Sex: 'sex',
        DateOfBirth: 'dateOfBirth',
        PreferredLocation: 'preferredLocation'
      };
      scope.imagingProvider = imagingProviders.Blue;

      result = {};
      imagingMasterService.getUrlForNewPatient = jasmine
        .createSpy()
        .and.returnValue({ then: cb => cb(result) });

        scope.frameSource = '';
        //spy on $scope.calculateIframeHeight
      spyOn(scope, 'calculateIframeHeight').and.callFake(function () { });
    });

    it('should not call imagingMasterService.getUrlForNewPatient when scope.imagingProvider is not blue', function () {
      scope.imagingProvider = imagingProviders.Apteryx2;

      scope.blueCapture();

      expect(imagingMasterService.getUrlForNewPatient).not.toHaveBeenCalled();
    });

    it('should call imagingMasterService.getUrlForNewPatient with correct parameters when scope.imagingProvider is blue', function () {
      scope.blueCapture();

      expect(imagingMasterService.getUrlForNewPatient).toHaveBeenCalledWith(
        {
          patientId: scope.personId,
          lastName: scope.patient.LastName,
          firstName: scope.patient.FirstName,
          gender: scope.patient.Sex,
          birthDate: scope.patient.DateOfBirth,
          primLocation: scope.patient.PreferredLocation

        },
        scope.imagingProvider
      );
    });

    describe('getUrlForNewPatient callback ->', function () {
      it('should not set scope.frameSource if res is null', function () {
        imagingMasterService.getUrlForNewPatient = jasmine
          .createSpy()
          .and.returnValue({ then: cb => cb() });

        scope.blueCapture();

        expect(scope.frameSource).toBe('');
      });

      it('should not set scope.frameSource if res.result is null', function () {
        scope.blueCapture();

        expect(scope.frameSource).toBe('');
      });

      it('should set scope.frameSource if res.result is not null', function () {
        result.result = 'url';

        scope.blueCapture();

        expect(scope.frameSource).toBe(result.result);
      });

      it('should set scope.frameSource if studyId is present', function () {
        result.result = 'url';
        let studyId = 'testStudy';

        scope.blueCapture(studyId);

        expect(scope.frameSource).toBe(`${result.result}&initTpId=${studyId}`);
      });
    });
  });
});

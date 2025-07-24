describe('odontogramSnapshot ->', function () {
  var patientOdontogramFactory,
    toastrFactory,
    fileService,
    fileUploadFactory,
    snapshotWorkerFactory;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientOdontogramFactory = {
        access: jasmine
          .createSpy()
          .and.returnValue({ View: true, Create: true, Edit: true }),
        save: jasmine.createSpy().and.returnValue({ then: function () {} }),
        get: jasmine.createSpy().and.returnValue({ then: function () {} }),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      fileService = {
        downloadFile: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('fileService', fileService);

      fileUploadFactory = {
        CreatePatientDirectory: jasmine.createSpy().and.returnValue({
          then: function (success) {
            success();
          },
        }),
      };
      $provide.value('FileUploadFactory', fileUploadFactory);

      snapshotWorkerFactory = {};
      $provide.value('OdontogramSnapshotWorkerFactory', snapshotWorkerFactory);
    })
  );

  describe('directive ->', function () {
    var scope, element;
    beforeEach(inject(function ($rootScope, $compile, $templateCache) {
      scope = $rootScope.$new();
      $templateCache.put(
        'App/Patient/patient-chart/odontogram/odontogramSnapshot.html',
        ''
      );
      element = angular.element(
        '<odontogram-snapshot person-id="some.property"></odontogram-snapshot>'
      );
      $compile(element)(scope);
      $rootScope.$digest();
    }));

    it('should compile', function () {
      expect(element.html()).toBe('');
    });
  });

  describe('controller -> ', function () {
    var scope, ctrl;

    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      scope.personId = 'personid';
      ctrl = $controller('OdontogramSnapshotController', {
        $scope: scope,
        toastrFactory: toastrFactory,
      });
    }));

    it('should exist', function () {
      expect(ctrl).toBeDefined();
    });

    describe('ctrl.$onInit function ->', function () {
      it('should call patientOdontogramFactory access', function () {
        ctrl.init();
        expect(patientOdontogramFactory.access).toHaveBeenCalled();
      });

      it('should call patientOdontogramFactory when personId exists', function () {
        scope.personId = 'personId';
        ctrl.init();
        expect(patientOdontogramFactory.get).toHaveBeenCalledWith(
          scope.personId
        );
      });

      it('should not call patientOdontogramFactory when personId does not exist', function () {
        scope.personId = null;
        ctrl.init();
        expect(patientOdontogramFactory.get).not.toHaveBeenCalledWith(
          scope.personId
        );
      });
    });

    describe('retrievalFailure function ->', function () {
      it('should call toastrFactory.error', function () {
        var res = { status: '500' };
        ctrl.retrievalFailure(res);
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('ctrl.odontogramGetSuccess function ->', function () {
      describe('when result does not exist ->', function () {
        it('should set scope.imageSrc to default value', function () {
          scope.imageSrc = 'test';
          ctrl.odontogramGetSuccess();
          expect(fileService.downloadFile).not.toHaveBeenCalled();

          scope.imageSrc = 'test';
          ctrl.odontogramGetSuccess({});
          expect(fileService.downloadFile).not.toHaveBeenCalled();
        });
      });

      describe('when SnapshotAllocationId does not exist ->', function () {
        it('should not call fileService.downloadFile', function () {
          scope.imageSrc = 'test';
          ctrl.odontogramGetSuccess({ Value: {} });
          expect(
            fileUploadFactory.CreatePatientDirectory
          ).not.toHaveBeenCalled();
          expect(fileService.downloadFile).not.toHaveBeenCalled();
        });
      });

      describe('when SnapshotAllocationId exists ->', function () {
        it('should call fileService.downloadFile with SnapshotAllocationId', function () {
          scope.imageSrc = 'test';
          scope.patientDirectoryId = 'directoryId';
          var snapshotId = 100;
          ctrl.odontogramGetSuccess({
            Value: { SnapshotAllocationId: snapshotId },
          });
          expect(fileUploadFactory.CreatePatientDirectory).toHaveBeenCalledWith(
            { PatientId: scope.personId, DirectoryAllocationId: 'directoryId' },
            null,
            'plapi-files-fsys-write'
          );
          expect(fileService.downloadFile).toHaveBeenCalledWith(snapshotId);
          expect(scope.imageSrc).toBe('test');
        });
      });

      describe('when SnapshotIsDirty is false ->', function () {
        it('should not set scope.snapshotIsDirty', function () {
          scope.snapshotIsDirty = false;
          ctrl.odontogramGetSuccess({ Value: { SnapshotIsDirty: false } });
          expect(scope.snapshotIsDirty).toBe(false);
        });

        it('should not call scope.updateSnapshot', function () {
          scope.updateSnapshot = jasmine.createSpy();
          ctrl.odontogramGetSuccess({ Value: { SnapshotIsDirty: false } });
          expect(scope.updateSnapshot).not.toHaveBeenCalled();
        });
      });

      describe('when SnapshotIsDirty is true ->', function () {
        it('should set scope.snapshotIsDirty', function () {
          scope.snapshotIsDirty = false;
          ctrl.odontogramGetSuccess({ Value: { SnapshotIsDirty: true } });
          expect(scope.snapshotIsDirty).toBe(true);
        });

        describe('when SnapshotUpdateQueued is false ->', function () {
          it('should call scope.updateSnapshot', function () {
            scope.updateSnapshot = jasmine.createSpy();
            ctrl.odontogramGetSuccess({
              Value: { SnapshotIsDirty: true, SnapshotUpdateQueued: false },
            });
            expect(scope.updateSnapshot).toHaveBeenCalled();
          });
        });

        describe('when SnapshotUpdateQueued is true ->', function () {
          it('should not call scope.updateSnapshot when SnapshotDateInvalidated is null', function () {
            scope.updateSnapshot = jasmine.createSpy();
            ctrl.odontogramGetSuccess({
              Value: {
                SnapshotIsDirty: true,
                SnapshotUpdateQueued: true,
                SnapshotDateInvalidated: null,
              },
            });
            expect(scope.updateSnapshot).not.toHaveBeenCalled();
          });

          it('should not call scope.updateSnapshot when SnapshotDateInvalidated is less than 5 minutes ago', function () {
            scope.updateSnapshot = jasmine.createSpy();
            ctrl.odontogramGetSuccess({
              Value: {
                SnapshotIsDirty: true,
                SnapshotUpdateQueued: true,
                SnapshotDateInvalidated: moment().utc().subtract(4, 'minutes'),
              },
            });
            expect(scope.updateSnapshot).not.toHaveBeenCalled();
          });

          it('should call scope.updateSnapshot when SnapshotDateInvalidated is more than 5 minutes ago', function () {
            scope.updateSnapshot = jasmine.createSpy();
            ctrl.odontogramGetSuccess({
              Value: {
                SnapshotIsDirty: true,
                SnapshotUpdateQueued: true,
                SnapshotDateInvalidated: moment().utc().subtract(6, 'minutes'),
              },
            });
            expect(scope.updateSnapshot).toHaveBeenCalled();
          });
        });
      });
    });

    describe('ctrl.fileDownloadSuccess function ->', function () {
      beforeEach(function () {
        ctrl.retrievalFailure = jasmine.createSpy();
      });

      describe('when parameter does not exist ->', function () {
        it('should call retrievalFailure', function () {
          scope.imageSrc = 'test';
          ctrl.fileDownloadSuccess();
          expect(ctrl.retrievalFailure).toHaveBeenCalled();
          expect(scope.imageSrc).toBe('test');
        });
      });

      describe('when parameter does not contain data ->', function () {
        it('should call retrievalFailure', function () {
          scope.imageSrc = 'test';
          ctrl.fileDownloadSuccess({});
          expect(ctrl.retrievalFailure).toHaveBeenCalled();
          expect(scope.imageSrc).toBe('test');
        });
      });

      describe('when parameter contains data ->', function () {
        it('should set imageSrc', function () {
          scope.imageSrc = 'test';
          ctrl.fileDownloadSuccess({ data: 'data' });
          expect(ctrl.retrievalFailure).not.toHaveBeenCalled();
          expect(scope.imageSrc).toBe('data');
        });
      });
    });

    describe('scope.updateSnapshot function ->', function () {
      beforeEach(function () {
        scope.showRetryMessage = true;
        snapshotWorkerFactory.getSnapshot = jasmine.createSpy();
      });

      it('should set showRetryMessage to true and call snapshotWorkerFactory', function () {
        scope.updateSnapshot();
        expect(scope.showRetryMessage).toBe(false);
        expect(snapshotWorkerFactory.getSnapshot).toHaveBeenCalledWith(
          scope.personId,
          ctrl.snapshotWorkerSuccess,
          ctrl.snapshotWorkerFailure
        );
      });
    });

    describe('ctrl.snapshotWorkerSuccess function ->', function () {
      var imageSrc = 'originalImageSrc';

      beforeEach(function () {
        scope.imageSrc = imageSrc;
        scope.snapshotIsDirty = true;
        scope.showRetryMessage = false;
        ctrl.odontogramGetSuccess = jasmine.createSpy();
      });

      it('should set correct values and not call odontogramGetSuccess when res is null', function () {
        ctrl.snapshotWorkerSuccess(null);
        expect(scope.imageSrc).toBe(imageSrc);
        expect(scope.snapshotIsDirty).toBe(true);
        expect(ctrl.odontogramGetSuccess).not.toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(true);
      });

      it('should set correct values and not call odontogramGetSuccess when res.Value is null', function () {
        ctrl.snapshotWorkerSuccess({});
        expect(scope.imageSrc).toBe(imageSrc);
        expect(scope.snapshotIsDirty).toBe(true);
        expect(ctrl.odontogramGetSuccess).not.toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(true);
      });

      it('should call odontogramGetSuccess and not set values when res.Value.ImageData is null', function () {
        ctrl.snapshotWorkerSuccess({ Value: {} });
        expect(scope.imageSrc).toBe(imageSrc);
        expect(scope.snapshotIsDirty).toBe(true);
        expect(ctrl.odontogramGetSuccess).toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(false);
      });

      it('should call odontogramGetSuccess and not set values when res.Value.ImageData is empty string', function () {
        ctrl.snapshotWorkerSuccess({ Value: { ImageData: '' } });
        expect(scope.imageSrc).toBe(imageSrc);
        expect(scope.snapshotIsDirty).toBe(true);
        expect(ctrl.odontogramGetSuccess).toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(false);
      });

      it('should set values and not call odontogramGetSuccess when res.Value.ImageData is not empty string', function () {
        ctrl.snapshotWorkerSuccess({ Value: { ImageData: 'imageData' } });
        expect(scope.imageSrc).toBe('imageData');
        expect(scope.snapshotIsDirty).toBe(false);
        expect(ctrl.odontogramGetSuccess).not.toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(false);
      });
    });

    describe('ctrl.snapshotWorkerFailure function ->', function () {
      beforeEach(function () {
        scope.showRetryMessage = false;
        ctrl.odontogramGetSuccess = jasmine.createSpy();
      });

      it('should set showRetryMessage and not call odontogramGetSuccess when res is null', function () {
        ctrl.snapshotWorkerFailure(null);
        expect(ctrl.odontogramGetSuccess).not.toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(true);
      });

      it('should set showRetryMessage and not call odontogramGetSuccess when res.Value is null', function () {
        ctrl.snapshotWorkerFailure({});
        expect(ctrl.odontogramGetSuccess).not.toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(true);
      });

      it('should set showRetryMessage and not call odontogramGetSuccess when SnapshotIsDirty is true', function () {
        ctrl.snapshotWorkerFailure({ Value: { SnapshotIsDirty: true } });
        expect(ctrl.odontogramGetSuccess).not.toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(true);
      });

      it('should call odontogramGetSuccess and not set showRetryMessage when SnapshotIsDirty is false', function () {
        ctrl.snapshotWorkerFailure({ Value: { SnapshotIsDirty: false } });
        expect(ctrl.odontogramGetSuccess).toHaveBeenCalled();
        expect(scope.showRetryMessage).toBe(false);
      });
    });
  });
});

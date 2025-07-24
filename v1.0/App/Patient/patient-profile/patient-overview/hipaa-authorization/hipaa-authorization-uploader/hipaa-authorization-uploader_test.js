describe('HipaaAuthorizationUploaderController ->', function () {
  var ctrl,
    scope,
    directoryService,
    directoryModel,
    fileModel,
    fileService,
    toastrFactory,
    mockDirectoryServiceResponse,
    mockCreateDirectoryResponse,
    fileUploadFactory;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      // directoryService
      mockDirectoryServiceResponse = {
        data: {
          Result: [
            { Name: 'signatures', DirectoryAllocationId: 'sigs_id' },
            { Name: '2', DirectoryAllocationId: 'other_id' },
          ],
        },
      };
      mockCreateDirectoryResponse = {
        data: {
          Result: [{ Name: 'signatures', DirectoryAllocationId: 'sigs_id' }],
        },
      };
      directoryService = {
        getRootDirectories: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            return callback(mockDirectoryServiceResponse);
          },
        }),
        createDirectory: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            return callback(mockCreateDirectoryResponse);
          },
        }),
      };
      $provide.value('directoryService', directoryService);

      // directoryModel
      directoryModel = {
        build: jasmine.createSpy().and.returnValue(),
      };
      $provide.value('directoryModel', directoryModel);

      // fileModel
      fileModel = {
        build: jasmine.createSpy().and.returnValue(),
      };
      $provide.value('fileModel', fileModel);

      // fileService
      fileService = {
        allocateFile: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
      };
      $provide.value('fileService', fileService);

      // toastrFactory
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    fileUploadFactory = {};
    scope = $rootScope.$new();
    ctrl = $controller('HipaaAuthorizationUploaderController', {
      $scope: scope,
      FileUploadFactory: fileUploadFactory,
    });
  }));

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('$scope.createDirectory function ->', function () {
    describe('when ctrl.directoryAllocationId is null ->', function () {
      var returnVal = { then: function () {} };
      beforeEach(function () {
        ctrl.directoryAllocationId = null;
        ctrl.allocateFile = jasmine.createSpy();
        fileUploadFactory.CreateSignaturesDirectory = jasmine
          .createSpy()
          .and.returnValue(returnVal);
      });

      it('should call fileUploadFactory with correct AMFA', function () {
        scope.createDirectory();

        expect(
          fileUploadFactory.CreateSignaturesDirectory
        ).toHaveBeenCalledWith('soar-per-perhst-add');
      });

      describe('when result is null ->', function () {
        beforeEach(function () {
          returnVal.then = function (callback) {
            callback(null);
          };
        });

        it('should not take action', function () {
          scope.createDirectory();

          expect(ctrl.directoryAllocationId).toBeNull();
          expect(scope.saving).toBe(false);
          expect(ctrl.allocateFile).not.toHaveBeenCalled();
        });
      });

      describe('when result is not null ->', function () {
        beforeEach(function () {
          returnVal.then = function (callback) {
            callback('result');
          };
        });

        it('should take action', function () {
          scope.createDirectory();

          expect(ctrl.directoryAllocationId).toBe('result');
          expect(scope.saving).toBe(true);
          expect(ctrl.allocateFile).toHaveBeenCalled();
        });
      });
    });

    describe('when ctrl.directoryAllocationId is not null ->', function () {
      beforeEach(function () {
        ctrl.directoryAllocationId = 'notnull';
        ctrl.allocateFile = jasmine.createSpy();
        fileUploadFactory.CreateSignaturesDirectory = jasmine
          .createSpy()
          .and.returnValue({ then: function () {} });
      });

      it('should call ctrl.allocateFile without calling fileUploadFactory', function () {
        scope.createDirectory();

        expect(ctrl.allocateFile).toHaveBeenCalled();
        expect(
          fileUploadFactory.CreateSignaturesDirectory
        ).not.toHaveBeenCalled();
      });
    });
  });
});

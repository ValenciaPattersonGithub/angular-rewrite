describe('SignatureCaptureController ->', function () {
  var scope, fileUploadFactory, ctrl;

  //#region mocks

  //#endregion

  //#region before each

  beforeEach(
    module('Soar.Common', function ($provide) {
      fileUploadFactory = {};
      $provide.value('FileUploadFactory', fileUploadFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('SignatureCaptureController', {
      $scope: scope,
    });
  }));

  describe('ctrl.$onInit function ->', function () {
    beforeEach(function () {
      ctrl.directoryAllocationId = 'test';
      ctrl.createDirectories = jasmine.createSpy();
      ctrl.setSignatureTitle = jasmine.createSpy();
    });

    it('should set initial values and call functions', function () {
      ctrl.$onInit();

      expect(ctrl.directoryAllocationId).toBeNull();
      expect(ctrl.createDirectories).toHaveBeenCalled();
      expect(ctrl.setSignatureTitle).toHaveBeenCalled();
    });
  });

  describe('ctrl.createDirectories function ->', function () {
    var returnVal = { then: function () {} };
    beforeEach(function () {
      fileUploadFactory.CreateSignaturesDirectory = jasmine
        .createSpy()
        .and.returnValue(returnVal);
    });

    describe('when ctrl.directoryAllocationId is null ->', function () {
      beforeEach(function () {
        ctrl.directoryAllocationId = null;
      });

      it('should call fileUploadFactory with correct amfa', function () {
        ctrl.createDirectories();

        expect(
          fileUploadFactory.CreateSignaturesDirectory
        ).toHaveBeenCalledWith('soar-per-perhst-add');
      });

      describe('when result is null ->', function () {
        beforeEach(function () {
          returnVal.then = function (callback) {
            callback(null);
          };
          scope.enableSave = false;
        });

        it('should not set values', function () {
          ctrl.createDirectories();

          expect(ctrl.directoryAllocationId).toBe(null);
          expect(scope.enableSave).toBe(false);
        });
      });

      describe('when result is not null ->', function () {
        beforeEach(function () {
          returnVal.then = function (callback) {
            callback('result');
          };
          scope.enableSave = false;
        });

        it('should set values', function () {
          ctrl.createDirectories();

          expect(ctrl.directoryAllocationId).toBe('result');
          expect(scope.enableSave).toBe(true);
        });
      });
    });

    describe('when ctrl.directoryAllocationId is not null ->', function () {
      beforeEach(function () {
        ctrl.directoryAllocationId = 'notnull';
      });

      it('should not call fileUploadFactory', function () {
        ctrl.createDirectories();

        expect(
          fileUploadFactory.CreateSignaturesDirectory
        ).not.toHaveBeenCalled();
      });
    });
  });

  describe('watch title -->', function () {
    it('should call ctrl.setSignatureTitle', function () {
      scope.sigTitle = 'initial';
      spyOn(ctrl, 'setSignatureTitle');
      scope.$apply();
      scope.sigTitle = 'modified';
      scope.$apply();
      expect(ctrl.setSignatureTitle).toHaveBeenCalled();
    });
  });

  describe('onClearSignature ->', function () {
    it('should set fileAllocationId to null', function () {
      scope.fileAllocationId = 'test';
      scope.onClearSignature();
      expect(scope.fileAllocationId).toBeNull();
    });
  });
});

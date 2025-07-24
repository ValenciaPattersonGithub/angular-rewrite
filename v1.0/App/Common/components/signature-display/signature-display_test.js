describe('SignatureDisplayController ->', function () {
  var scope, fileService, ctrl;

  //#region mocks

  //#endregion

  //#region before each

  beforeEach(
    module('Soar.Common', function ($provide) {
      fileService = {};
      $provide.value('fileService', fileService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('SignatureDisplayController', {
      $scope: scope,
    });
  }));

  describe('watch fileAllocationId -->', function () {
    it('should call ctrl.getSignature', function () {
      scope.fileAllocationId = '123';
      spyOn(ctrl, 'getSignature');
      scope.$apply();
      scope.fileAllocationId = '456';
      scope.$apply();
      expect(ctrl.getSignature).toHaveBeenCalled();
    });

    it('should clear scope.properties before calling ctrl.getSignature to display correct signature', function () {
      scope.fileAllocationId = '123';
      spyOn(ctrl, 'getSignature').and.callFake(function () {});
      scope.$apply();
      scope.fileAllocationId = '456';
      scope.$apply();
      expect(scope.hasSignature).toBe(false);
      expect(scope.base64Signature).toBe('');
    });
  });
});

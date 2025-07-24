describe('reorder-column-modal-controller test ->', function () {
  var scope, modalInstance, modalResolve, ctrl;

  beforeEach(module('common.controllers'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    modalInstance = {
      close: jasmine.createSpy(),
      dismiss: jasmine.createSpy(),
    };

    modalResolve = {
      list: 'some list',
      display: 'some property',
    };

    ctrl = $controller('ReorderColumnModalController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      modalResolve: modalResolve,
    });
  }));

  describe('mouseEnter ->', function () {
    it('should set hoverIndex to the index passed to the function', function () {
      scope.mouseEnter(123);

      expect(scope.hoverIndex).toEqual(123);
    });
  });

  describe('mouseDown ->', function () {
    it('should set dragIndex to the index passed to the function', function () {
      scope.mouseDown(123);

      expect(scope.dragIndex).toEqual(123);
    });
  });

  describe('mouseUp ->', function () {
    it('should move the dragged item above the item hovered over if the item being hover index is less than the drag index', function () {
      scope.list = [1, 2, 3, 4, 5];
      scope.hoverIndex = 1;
      scope.dragIndex = 3;

      scope.mouseUp(123);

      expect(scope.list).toEqual([1, 4, 2, 3, 5]);
    });

    it('should move the dragged item below the item hovered over if the item being hover index is greater than the drag index', function () {
      scope.list = [1, 2, 3, 4, 5];
      scope.hoverIndex = 3;
      scope.dragIndex = 1;

      scope.mouseUp(123);

      expect(scope.list).toEqual([1, 3, 4, 2, 5]);
    });

    it('should reset the dragIndex to -1', function () {
      scope.dragIndex = 3;

      scope.mouseUp(123);

      expect(scope.dragIndex).toEqual(-1);
    });
  });

  describe('restoreDefaults ->', function () {
    it('should call modalInstance.close with an empty array', function () {
      scope.restoreDefaults();

      expect(modalInstance.close).toHaveBeenCalledWith([]);
    });
  });

  describe('save ->', function () {
    it('should call modalInstance.close with scope.list', function () {
      scope.list = [1, 2, 3];

      scope.save();

      expect(modalInstance.close).toHaveBeenCalledWith(scope.list);
    });
  });

  describe('cancel ->', function () {
    it('should call modalInstance.dismiss', function () {
      scope.cancel();

      expect(modalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('initialize ->', function () {
    it('should set some properties', function () {
      scope.initialize();

      expect(scope.list).toEqual(modalResolve.list);
      expect(scope.display).toEqual(modalResolve.display);
      expect(scope.dragIndex).toEqual(-1);
      expect(scope.hoverIndex).toEqual(-1);
    });
  });
});

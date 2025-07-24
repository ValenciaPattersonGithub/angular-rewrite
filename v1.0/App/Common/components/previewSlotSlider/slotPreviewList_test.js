describe('SlotPreviewListController tests ->', function () {
  var ctrl, scope;

  beforeEach(module('common.controllers'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();

    ctrl = $controller('SlotPreviewListController', {
      $scope: scope,
    });
    scope.onPreview = function () {};
    scope.onClose = function () {};
  }));

  describe('hideFilters function -> ', function () {
    beforeEach(function () {});
    it('should set the day selected if it was not selected', function () {
      spyOn(scope, 'onClose');
      scope.hideFilters();
      expect(scope.onClose).toHaveBeenCalled();
    });
  });

  describe('previewSlot function -> ', function () {
    var slot = {};
    var index = 2;
    beforeEach(function () {
      slot = { LocationStartTime: new Date(), LocationEndTime: new Date() };
      scope.previewParam = {
        SelectedSlot: { Start: null, End: null },
        SelectedSlotIndex: null,
      };
    });
    it('should load scope.previewParam', function () {
      scope.previewSlot(index, slot);
      expect(scope.previewParam.SelectedSlot.End).toEqual(slot.LocationEndTime);
    });

    it('should call onPreview', function () {
      spyOn(scope, 'onPreview');
      scope.previewSlot(index, slot);
      expect(scope.onPreview).toHaveBeenCalled();
    });
  });
});

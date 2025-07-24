describe('multi-select test ->', function () {
  beforeEach(module('kendo.directives'));
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  var scope, ctrl, patSecurityService;

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    scope = $rootScope.$new();

    ctrl = $controller('MultiSelectController', {
      $scope: scope,
      patSecurityService: patSecurityService,
    });
  }));

  it('should initialize the controller', function () {
    expect(ctrl).not.toBeNull();
  });

  it('should default some values', function () {
    expect(ctrl.selected).toEqual([]);
    expect(scope.open).toEqual(false);
    expect(scope.list).toEqual([]);
    expect(scope.selectedCount).toEqual(0);
  });

  describe('populateSelected ->', function () {
    it('should clear the existing list of selected items with each call', function () {
      ctrl.selected = [1, 2, 3];

      ctrl.populateSelected();

      expect(ctrl.selected).toEqual([]);
    });

    it('should add any items with a Selected property set to true to the ctrl.selected list', function () {
      ctrl.selected = [1, 2, 3];
      scope.list = [
        { Id: 1, Selected: false },
        { Id: 2, Selected: true },
        { Id: 3 },
      ];

      ctrl.populateSelected();

      expect(ctrl.selected.length).toEqual(1);
      expect(ctrl.selected[0]).toEqual(scope.list[1]);
    });

    it('should call updateSelected', function () {
      spyOn(ctrl, 'updateSelected');

      ctrl.populateSelected();

      expect(ctrl.updateSelected).toHaveBeenCalled();
    });
  });

  describe('updateSelected ->', function () {
    it('should set scope.selected equal to ctrl.selected', function () {
      ctrl.selected = [1, 2, 3];
      scope.selected = [1, 2, 3, 4, 5];
      scope.list = [1, 2, 3, 4, 5, 6, 7];

      ctrl.updateSelected();

      expect(scope.selected).toEqual(ctrl.selected);
    });
  });

  describe('clickItem ->', function () {
    // The commented out case illustrates a point about behavior with objects vs primitives.
    it("should invert the item's Selected property", function () {
      //var nonObject = 1;
      var undefintedProperty = { id: 1 };
      var falseProperty = { id: 1, Selected: false };
      var trueProperty = { id: 1, Selected: true };

      //scope.clickItem(nonObject);
      scope.clickItem(undefintedProperty);
      scope.clickItem(falseProperty);
      scope.clickItem(trueProperty);

      //expect(nonObject.Selected).toEqual(true);
      expect(undefintedProperty.Selected).toEqual(true);
      expect(falseProperty.Selected).toEqual(true);
      expect(trueProperty.Selected).toEqual(false);
    });
  });

  describe('toggleAll ->', function () {
    describe('when selecting all items', function () {
      beforeEach(function () {
        scope.selectedCount = 1;
        scope.list = [
          { id: 1, Selected: true },
          { id: 2, Selected: false },
        ];
        spyOn(ctrl, 'updateSelected');
        scope.toggleAll();
      });

      it('should set the Selected property of all items to true', function () {
        expect(scope.list[0].Selected).toEqual(true);
        expect(scope.list[1].Selected).toEqual(true);
      });

      it('should copy scope.list to ctrl.selected', function () {
        expect(ctrl.selected).toEqual(scope.list);
      });

      it('should call updateSelected', function () {
        expect(ctrl.updateSelected).toHaveBeenCalled();
      });

      it('should set the selectedCount to the length of the list', function () {
        expect(scope.selectedCount).toEqual(2);
      });
    });

    describe('when deselecting all items', function () {
      beforeEach(function () {
        scope.selectedCount = 2;
        scope.list = [
          { id: 1, Selected: true },
          { id: 2, Selected: true },
        ];
        spyOn(ctrl, 'updateSelected');
        scope.toggleAll();
      });

      it('should set the Selected property of all items to false', function () {
        expect(scope.list[0].Selected).toEqual(false);
        expect(scope.list[1].Selected).toEqual(false);
      });

      it('should copy scope.list to ctrl.selected', function () {
        expect(ctrl.selected).toEqual(scope.list);
      });

      it('should call updateSelected', function () {
        expect(ctrl.updateSelected).toHaveBeenCalled();
      });

      it('should set the selectedCount to the zero', function () {
        expect(scope.selectedCount).toEqual(0);
      });
    });
  });
});

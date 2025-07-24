describe('controller -> ', function () {
  var ctrl, scope, listHelper, staticData, q;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();
    q = $q;

    //mock for listHelper service
    listHelper = {
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
    };

    staticData = {
      TeethDefinitions: jasmine.createSpy().and.callFake(function () {
        var deferred = q.defer();
        var result = { Value: { Teeth: [] } };
        deferred.resolve(result);
        return deferred.promise;
      }),
    };

    ctrl = $controller('ToothQuadrantController', {
      $scope: scope,
      ListHelper: listHelper,
      StaticData: staticData,
    });
  }));

  //controller
  it('ToothQuadrantController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('setSelected function ->', function () {
    it('when showTeethDetail is true, it should toggle to false', function () {
      scope.showTeethDetail = true;
      scope.selectedTeethChanged = false;
      var spy1 = spyOn(ctrl, 'scopeInitilize');

      scope.setSelected();

      expect(scope.showTeethDetail).toEqual(false);
      expect(scope.selectedTeethChanged).toEqual(false);
      expect(spy1).not.toHaveBeenCalled();
    });

    it('when showTeethDetail is false, it should toggle to true', function () {
      scope.showTeethDetail = false;
      scope.selectedTeethChanged = false;
      var spy1 = spyOn(ctrl, 'scopeInitilize');

      scope.setSelected();

      expect(scope.showTeethDetail).toEqual(true);
      expect(scope.selectedTeethChanged).toEqual(true);
      expect(spy1).toHaveBeenCalled();
    });
  });

  describe('closeSelected function ->', function () {
    it('showTeethDetail should be false', function () {
      scope.closeSelected();

      expect(scope.showTeethDetail).toEqual(false);
    });
  });

  describe('selectQuadrant function ->', function () {
    it('should set quadrant.selected as false and selectedTeeth to empty if ids are equal and selected is true', function () {
      var quadrant = { Id: 1, Selected: true };
      scope.allQuadrant = [{ Id: 1, Selected: true }];

      scope.selectQuadrant(quadrant);

      expect(quadrant.Selected).toEqual(false);
      expect(scope.selectedTeeth).toEqual('');
    });
    it('should set quadrant.selected as true and selectedTeeth to Desc if ids are equal and selected is false', function () {
      var quadrant = { Id: 1, Selected: false, Desc: 'Desc' };
      scope.allQuadrant = [{ Id: 1, Selected: true, Desc: 'Desc' }];

      scope.selectQuadrant(quadrant);

      expect(quadrant.Selected).toEqual(true);
      expect(scope.selectedTeeth).toEqual('Desc');
    });
    it('should set existingQuadrant.selected as false if ids are not equal', function () {
      var quadrant = { Id: 1, Selected: true, Desc: 'Desc' };
      scope.allQuadrant = [{ Id: 2, Selected: true, Desc: 'Desc' }];

      scope.selectQuadrant(quadrant);

      expect(scope.allQuadrant[0].Selected).toEqual(false);
    });
  });

  describe('scopeInitilize function ->', function () {
    it('should set selectedTeeth to actualteeth when item is null', function () {
      scope.quadrantSelectionOnly = false;
      scope.selectedTeeth = 1;
      var itemMock = null;
      var actualteeth = [];

      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(function (isItem) {
          if (isItem == 'item') {
            return itemMock;
          }
          return null;
        });

      ctrl.scopeInitilize();

      expect(scope.dataForTeeth.selectedTeeth).toEqual(actualteeth);
    });

    it('should set quadrant.Selected to true when quadrantSelectionOnly is false and selectedTeeth is true', function () {
      scope.quadrantSelectionOnly = true;
      scope.selectedTeeth = 2;
      scope.allQuadrant = [{ Desc: 2, Selected: false }];

      ctrl.scopeInitilize();

      expect(scope.allQuadrant[0].Selected).toEqual(true);
    });

    it('should set quadrant.Selected to false when quadrant.Desc is not equal to scope.selectedTeeth', function () {
      scope.quadrantSelectionOnly = true;
      scope.selectedTeeth = 2;
      scope.allQuadrant = [{ Desc: 5, Selected: false }];

      ctrl.scopeInitilize();

      expect(scope.allQuadrant[0].Selected).toEqual(false);
    });
  });

  describe('$on broadcast function ->', function () {
    it('should alreadySelected equal to nv when quadrantSelectionOnly is false ', function () {
      var nv = [{ ToothId: 1 }];
      scope.quadrantSelectionOnly = false;
      var itemMock = null;

      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(itemMock);

      scope.$broadcast('selectedTeeth-modified', nv);

      expect(ctrl.alreadySelected).toEqual(nv);
    });

    it('should alreadySelected equal to nv and selectedTeeth equal to USNumber when quadrantSelectionOnly is false and item has value', function () {
      var nv = [{ ToothId: 1 }];
      scope.quadrantSelectionOnly = false;
      var itemMock = { USNumber: 'USNumber' };
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(itemMock);

      scope.$broadcast('selectedTeeth-modified', nv);

      expect(ctrl.alreadySelected).toEqual(nv);
      expect(scope.selectedTeeth).toEqual(itemMock.USNumber);
    });
  });

  describe('selectedTeeth watch ->', function () {
    it('should set selectedTeethChanged to true if quadrantSelectionOnly is false', function () {
      scope.selectedTeeth = 1;

      scope.quadrantSelectionOnly = false;
      spyOn(ctrl, 'scopeInitilize').and.callFake(function () {});
      scope.selectedTeeth = 2;
      scope.$apply();
      expect(scope.selectedTeethChanged).toEqual(true);
    });
  });

  describe('selectedQuadrant watch ->', function () {
    it('should set selectedTeethChanged to true', function () {
      scope.selectedQuadrant = 1;
      scope.$apply();
      scope.selectedQuadrant = 2;
      scope.$apply();
      expect(scope.selectedTeethChanged).toEqual(true);
    });
  });

  describe('activatePreselectedTeeth function ->', function () {
    it('', function () {
      var selectedTeeth = [{ ToothId: 1 }];
      scope.allTeeth = true;
      var itemMock = { Selected: false };
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(itemMock);

      ctrl.activatePreselectedTeeth(selectedTeeth);

      expect(itemMock.Selected).toEqual(true);
    });
  });
});

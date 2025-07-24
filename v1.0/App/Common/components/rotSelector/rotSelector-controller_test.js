describe('RotSelectorController tests ->', function () {
  var scope, ctrl, staticData;

  var mockTeeth = [
    { USNumber: '1', ToothId: 1 },
    { USNumber: '2', ToothId: 2 },
    { USNumber: '3', ToothId: 3 },
  ];

  beforeEach(module('Soar.Common'));

  beforeEach(inject(function ($rootScope, $controller) {
    //
    staticData = {
      TeethDefinitions: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
    };
    //
    scope = $rootScope.$new();
    //
    ctrl = $controller('RotSelectorController', {
      $scope: scope,
      StaticData: staticData,
    });
  }));

  describe('enter function -> ', function () {
    beforeEach(function () {
      scope.input = '';
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should call selectIndividual if there is no dash', function () {
      spyOn(ctrl, 'selectIndividual');
      scope.input = '8';
      scope.enter();
      expect(ctrl.selectIndividual).toHaveBeenCalled();
    });

    it('should call selectRange if there is a dash', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = '1-8';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalled();
    });

    it('should call both selectIndividual and selectRange if both types were entered', function () {
      spyOn(ctrl, 'selectIndividual');
      spyOn(ctrl, 'selectRange');
      scope.input = '1-8,k';
      scope.enter();
      expect(ctrl.selectIndividual).toHaveBeenCalled();
      expect(ctrl.selectRange).toHaveBeenCalled();
    });
  });

  describe('input watch -> ', function () {
    beforeEach(function () {
      scope.input = '';
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should set showTeethList to false if nv is falsy', function () {
      scope.$apply();
      expect(scope.showTeethList).toBe(false);
    });

    it('should call filterBasedOnInput if there is no dash', function () {
      spyOn(ctrl, 'filterBasedOnInput');
      scope.input = '17';
      scope.$apply();
      expect(ctrl.filterBasedOnInput).toHaveBeenCalled();
    });

    it('should set showTeethList to true if nv does not contain a comma or slash', function () {
      scope.input = 'a';
      scope.$apply();
      expect(scope.showTeethList).toBe(true);
    });
  });

  describe('select function -> ', function () {
    var tooth;

    beforeEach(function () {
      tooth = {};
      scope.showTeethList = true;
      scope.selected = [];
      scope.teethDefinitions = {};
    });

    it('should set showTeethList to true and input to null', function () {
      scope.select(tooth);
      expect(scope.showTeethList).toBe(false);
      expect(scope.input).toBe(null);
    });

    it('should assign $$Selected property to tooth and set it to true', function () {
      expect(tooth.$$Selected).toBeUndefined();
      scope.select(tooth);
      expect(tooth.$$Selected).toBe(true);
    });
  });

  describe('remove function -> ', function () {
    var tooth;

    beforeEach(function () {
      tooth = '';
    });

    it('should call removeIndividual if there is no dash', function () {
      spyOn(ctrl, 'removeIndividual');
      tooth = '1';
      scope.remove(tooth);
      expect(ctrl.removeIndividual).toHaveBeenCalled();
    });

    it('should call removeRange if there is a dash', function () {
      spyOn(ctrl, 'removeRange');
      tooth = '1-8';
      scope.remove(tooth);
      expect(ctrl.removeRange).toHaveBeenCalled();
    });
  });

  describe('getTeethDefinitions function -> ', function () {
    it('should call staticData.TeethDefinitions', function () {
      ctrl.getTeethDefinitions();
      expect(staticData.TeethDefinitions).toHaveBeenCalled();
    });
  });

  describe('selectIndividual function -> ', function () {
    beforeEach(function () {
      scope.selected = [];
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should set to tooth to $$Selected = true and call updateSelected', function () {
      spyOn(ctrl, 'updateSelected');
      expect(scope.teethDefinitions.Teeth[1]).toEqual({
        USNumber: '2',
        ToothId: 2,
      });
      ctrl.selectIndividual('2');
      expect(scope.teethDefinitions.Teeth[1]).toEqual({
        USNumber: '2',
        ToothId: 2,
        $$Selected: true,
      });
      expect(ctrl.updateSelected).toHaveBeenCalled();
    });
  });

  describe('selectRange function -> ', function () {
    beforeEach(function () {
      scope.selected = [];
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should set all teeth in range to $$Selected = true and call updateSelected', function () {
      spyOn(ctrl, 'updateSelected');
      expect(scope.teethDefinitions.Teeth[0]).toEqual({
        USNumber: '1',
        ToothId: 1,
      });
      expect(scope.teethDefinitions.Teeth[1]).toEqual({
        USNumber: '2',
        ToothId: 2,
      });
      ctrl.selectRange('1-2');
      expect(scope.teethDefinitions.Teeth[0]).toEqual({
        USNumber: '1',
        ToothId: 1,
        $$Selected: true,
      });
      expect(scope.teethDefinitions.Teeth[1]).toEqual({
        USNumber: '2',
        ToothId: 2,
        $$Selected: true,
      });
      expect(ctrl.updateSelected).toHaveBeenCalled();
    });

    it('should not call ctrl.updateSelected if teeth in range are mixed dentition', function () {
      spyOn(ctrl, 'updateSelected');
      scope.teethDefinitions.Teeth[0].ToothStructure = 'Permanent';
      scope.teethDefinitions.Teeth[1].ToothStructure = 'Primary';
      ctrl.selectRange('1-2');
      expect(ctrl.updateSelected).not.toHaveBeenCalled();
    });
  });

  describe('removeIndividual function -> ', function () {
    beforeEach(function () {
      scope.selected = [];
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should set to tooth to $$Selected = false and call updateSelected', function () {
      spyOn(ctrl, 'updateSelected');
      expect(scope.teethDefinitions.Teeth[2]).toEqual({
        USNumber: '3',
        ToothId: 3,
      });
      ctrl.removeIndividual('3');
      expect(scope.teethDefinitions.Teeth[2]).toEqual({
        USNumber: '3',
        ToothId: 3,
        $$Selected: false,
      });
      expect(ctrl.updateSelected).toHaveBeenCalled();
    });
  });

  describe('removeRange function -> ', function () {
    beforeEach(function () {
      scope.selected = [];
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should set all teeth in range to $$Selected = false and call updateSelected', function () {
      spyOn(ctrl, 'updateSelected');
      expect(scope.teethDefinitions.Teeth[1]).toEqual({
        USNumber: '2',
        ToothId: 2,
      });
      expect(scope.teethDefinitions.Teeth[2]).toEqual({
        USNumber: '3',
        ToothId: 3,
      });
      ctrl.removeRange('2-3');
      expect(scope.teethDefinitions.Teeth[1]).toEqual({
        USNumber: '2',
        ToothId: 2,
        $$Selected: false,
      });
      expect(scope.teethDefinitions.Teeth[2]).toEqual({
        USNumber: '3',
        ToothId: 3,
        $$Selected: false,
      });
      expect(ctrl.updateSelected).toHaveBeenCalled();
    });
  });

  describe('filterBasedOnInput function -> ', function () {
    beforeEach(function () {
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should filter teethDefinitions based on input', function () {
      ctrl.filterBasedOnInput('2');
      expect(scope.teethDefinitions.Teeth[0].$$Visible).toBe(false);
      expect(scope.teethDefinitions.Teeth[1].$$Visible).toBe(true);
      expect(scope.teethDefinitions.Teeth[2].$$Visible).toBe(false);
    });

    it('should highlight first item in filtered list', function () {
      scope.teethDefinitions.Teeth[0].USNumber = '20';
      scope.teethDefinitions.Teeth[1].USNumber = '21';
      scope.teethDefinitions.Teeth[2].USNumber = '22';
      ctrl.filterBasedOnInput('2');
      expect(scope.teethDefinitions.Teeth[0].$$Visible).toBe(true);
      expect(scope.teethDefinitions.Teeth[0].$$Highlight).toBe(true);
      expect(scope.teethDefinitions.Teeth[1].$$Visible).toBe(true);
      expect(scope.teethDefinitions.Teeth[1].$$Highlight).toBeUndefined();
      expect(scope.teethDefinitions.Teeth[2].$$Visible).toBe(true);
      expect(scope.teethDefinitions.Teeth[2].$$Highlight).toBeUndefined();
    });
  });

  describe('updateSelected function -> ', function () {
    beforeEach(function () {
      scope.selected = [];
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should create tooth range if items are in a contiguous group', function () {
      scope.teethDefinitions.Teeth[0].$$Selected = true;
      scope.teethDefinitions.Teeth[1].$$Selected = true;
      scope.teethDefinitions.Teeth[2].$$Selected = true;
      ctrl.updateSelected();
      expect(scope.selected).toEqual(['1-3']);
    });

    it('should create individual teeth if they are not contiguous', function () {
      scope.teethDefinitions.Teeth[0].$$Selected = true;
      scope.teethDefinitions.Teeth[2].$$Selected = true;
      ctrl.updateSelected();
      expect(scope.selected).toEqual(['1', '3']);
    });
  });

  describe('toggle$$SelectProperty function -> ', function () {
    var tooth;

    beforeEach(function () {
      tooth = {};
      scope.teethDefinitions = { Teeth: angular.copy(mockTeeth) };
    });

    it('should set $$Selected to true if true was passed', function () {
      expect(tooth.$$Selected).toBeUndefined();
      ctrl.toggle$$SelectProperty(tooth, true);
      expect(tooth.$$Selected).toBe(true);
    });

    it('should set $$Selected to false if false was passed', function () {
      expect(tooth.$$Selected).toBeUndefined();
      ctrl.toggle$$SelectProperty(tooth, false);
      expect(tooth.$$Selected).toBe(false);
    });

    it('should set $$PositionAlreadyTaken to true if $$ToothIdOfOtherDentitionInSamePosition is truthy and true is passed', function () {
      tooth.$$ToothIdOfOtherDentitionInSamePosition = 2;
      expect(tooth.$$PositionAlreadyTaken).toBeUndefined();
      ctrl.toggle$$SelectProperty(tooth, true);
      expect(tooth.$$Selected).toBe(true);
      expect(scope.teethDefinitions.Teeth[1].$$PositionAlreadyTaken).toBe(true);
    });

    it('should set $$PositionAlreadyTaken to false if $$ToothIdOfOtherDentitionInSamePosition is truthy and false is passed', function () {
      tooth.$$ToothIdOfOtherDentitionInSamePosition = 3;
      expect(tooth.$$PositionAlreadyTaken).toBeUndefined();
      ctrl.toggle$$SelectProperty(tooth, false);
      expect(tooth.$$Selected).toBe(false);
      expect(scope.teethDefinitions.Teeth[2].$$PositionAlreadyTaken).toBe(
        false
      );
    });
  });

  describe('enter function -> ', function () {
    it('should select 1-8 if ent is UR', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = 'UR';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalledWith('1-8');
    });

    it('should select 9-16 if ent is UL', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = 'UL';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalledWith('9-16');
    });

    it('should select 1-16 if ent is UA', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = 'UA';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalledWith('1-16');
    });

    it('should select 25-32 if ent is LR', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = 'LR';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalledWith('25-32');
    });

    it('should select 17-32 if ent is LA', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = 'LA';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalledWith('17-32');
    });

    it('should select 17-32 if ent is LA', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = 'LA';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalledWith('17-32');
    });

    it('should select 1-32 if ent is FM', function () {
      spyOn(ctrl, 'selectRange');
      scope.input = 'FM';
      scope.enter();
      expect(ctrl.selectRange).toHaveBeenCalledWith('1-32');
    });
  });
});

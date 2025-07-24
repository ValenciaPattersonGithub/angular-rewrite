describe('ActiveButtonLayoutController tests ->', function () {
  var ctrl, scope, layoutItems;

  layoutItems = [
    {
      Id: '1,9db58108-8b45-e611-9a6b-a4db3021bfa0',
      Text: 'Internal Root Resorption',
    },
    {
      Id: '2,c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
      Text: 'Crown3/4Resin',
    },
    {
      Id: '3,9371c260-c84a-e611-8e06-8086f2269c78',
      Text: 'Swift Code',
    },
    {
      Id: '4,00000000-0000-0000-0000-000000000000',
      Text: 'Bad',
    },
  ];

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('ActiveButtonLayoutController', {
      $scope: scope,
    });
    scope.selectedLayoutItems = [];
  }));

  describe('onDrop function -> ', function () {
    it('should call add function', function () {
      spyOn(ctrl, 'add');
      var element = { draggable: { element: [{}] } };
      scope.onDrop(element);
      expect(ctrl.add).toHaveBeenCalled;
    });
  });

  describe('add function -> ', function () {
    beforeEach(function () {
      scope.selectedLayoutItems.length = 0;
    });

    it('should add button object to selectedLayoutItems list', function () {
      expect(scope.selectedLayoutItems.length).toBe(0);
      ctrl.add({
        id: '2,c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
        innerText: 'Crown3/4Resin',
      });
      expect(scope.selectedLayoutItems[0]).toEqual({
        Id: '2,c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
        Text: 'Crown3/4Resin',
      });
    });

    it('should not add button object to selectedLayoutItems list if id is falsy or it equals selectedButtons', function () {
      expect(scope.selectedLayoutItems.length).toBe(0);
      ctrl.add({ id: '', innerText: 'Crown3/4Resin' });
      expect(scope.selectedLayoutItems.length).toBe(0);
      ctrl.add({ id: 'selectedButtons', innerText: 'Crown3/4Resin' });
      expect(scope.selectedLayoutItems.length).toBe(0);
    });
  });

  describe('remove function -> ', function () {
    beforeEach(function () {
      scope.selectedLayoutItems.length = 0;
    });

    it('should remove item if it is in the list', function () {
      expect(scope.selectedLayoutItems.length).toBe(0);
      ctrl.add({
        id: '2,c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
        innerText: 'Crown3/4Resin',
      });
      expect(scope.selectedLayoutItems.length).toBe(1);
      scope.remove({ Id: '2,c3ac9626-8b45-e611-9a6b-a4db3021bfa0' });
      expect(scope.selectedLayoutItems.length).toBe(0);
    });

    it('should not remove item if it is not in the list', function () {
      ctrl.add({
        id: '2,c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
        innerText: 'Crown3/4Resin',
      });
      expect(scope.selectedLayoutItems.length).toBe(1);
      scope.remove({ Id: '1,9db58108-8b45-e611-9a6b-a4db3021bfa0' });
      expect(scope.selectedLayoutItems.length).toBe(1);
    });
  });

  describe('getButtonColorClass function -> ', function () {
    it('should return condition color class if layout item id is 1', function () {
      expect(scope.getButtonColorClass(layoutItems[0])).toBe('conditionColor');
    });

    it('should return condition color class if layout item id is 2', function () {
      expect(scope.getButtonColorClass(layoutItems[1])).toBe('svcBtnColor');
    });

    it('should return empty string if layout item id is invalid', function () {
      expect(scope.getButtonColorClass(layoutItems[2])).toBe(
        'swiftCodeBtnColor'
      );
    });

    it('should return empty string if layout item id is invalid', function () {
      expect(scope.getButtonColorClass(layoutItems[3])).toBe('');
    });
  });
});

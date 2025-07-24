describe('toothPicker directive ->', function () {
  beforeEach(module('Soar.Patient'));

  describe('directive ->', function () {
    var scope, element, templateHtml;

    beforeEach(inject(function ($rootScope, $compile, $templateCache) {
      scope = $rootScope.$new();

      $templateCache.put(
        'App/Patient/patient-chart/tooth-picker/tooth-picker.html',
        ''
      );

      element = angular.element(
        '<tooth-picker selected-teeth="note.ToothNumbers" multi-select-enabled="true"></tooth-picker>'
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

    var mockTeeth = [
      {
        Half: 'U',
        Position: '1',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '2',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '3',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '4',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '5',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '6',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '7',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '8',
        IsPrimary: false,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '9',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '10',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '11',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '12',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '13',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '14',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '15',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: '16',
        IsPrimary: false,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '17',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '18',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '19',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '20',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '21',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '22',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '23',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '24',
        IsPrimary: false,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '25',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '26',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '27',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '28',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '29',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '30',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '31',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: '32',
        IsPrimary: false,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'A',
        IsPrimary: true,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'B',
        IsPrimary: true,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'C',
        IsPrimary: true,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'D',
        IsPrimary: true,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'E',
        IsPrimary: true,
        Quadrant: 'UR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'F',
        IsPrimary: true,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'G',
        IsPrimary: true,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'H',
        IsPrimary: true,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'I',
        IsPrimary: true,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'U',
        Position: 'J',
        IsPrimary: true,
        Quadrant: 'UL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'K',
        IsPrimary: true,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'L',
        IsPrimary: true,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'M',
        IsPrimary: true,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'N',
        IsPrimary: true,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'O',
        IsPrimary: true,
        Quadrant: 'LL',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'P',
        IsPrimary: true,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'Q',
        IsPrimary: true,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'R',
        IsPrimary: true,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'S',
        IsPrimary: true,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
      {
        Half: 'L',
        Position: 'T',
        IsPrimary: true,
        Quadrant: 'LR',
        Selected: false,
        Enabled: false,
      },
    ];

    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('ToothPickerController', { $scope: scope });
    }));

    describe('initial setup -> ', function () {
      it('controller should exist', function () {
        expect(ctrl).toBeDefined();
      });

      it('should set initial values', function () {
        expect(scope.permanentActive).toBe(true);
        expect(scope.primaryActive).toBe(false);
        expect(scope.ulActivePermanent).toBe(false);
        expect(scope.urActivePermanent).toBe(false);
        expect(scope.uActivePermanent).toBe(false);
        expect(scope.allActivePermanent).toBe(false);
        expect(scope.lActivePermanent).toBe(false);
        expect(scope.llActivePermanent).toBe(false);
        expect(scope.lrActivePermanent).toBe(false);
        expect(scope.noneActivePermanent).toBe(false);
        expect(scope.ulActivePrimary).toBe(false);
        expect(scope.urActivePrimary).toBe(false);
        expect(scope.uActivePrimary).toBe(false);
        expect(scope.allActivePrimary).toBe(false);
        expect(scope.lActivePrimary).toBe(false);
        expect(scope.llActivePrimary).toBe(false);
        expect(scope.lrActivePrimary).toBe(false);
        expect(scope.noneActivePrimary).toBe(false);
      });
    });

    describe('getDefaultTeethObject function -> ', function () {
      it('should set scope.teeth to initial value', function () {
        var teeth = ctrl.getDefaultTeethObject();
        expect(teeth).toEqual(mockTeeth);
      });
    });

    describe('toggle function -> ', function () {
      it('should unselect all primary teeth', function () {
        scope.toggle('NONE', true);
        angular.forEach(scope.teeth, function (tooth) {
          if (tooth.IsPrimary) {
            expect(tooth.Selected).toEqual(false);
          }
        });
      });

      it('should unselect all permanent teeth', function () {
        scope.toggle('NONE', false);
        angular.forEach(scope.teeth, function (tooth) {
          if (!tooth.IsPrimary) {
            expect(tooth.Selected).toEqual(false);
          }
        });
      });

      it('should select all primary teeth', function () {
        scope.toggle('ALL', true);
        angular.forEach(scope.teeth, function (tooth) {
          if (tooth.IsPrimary) {
            expect(tooth.Selected).toEqual(true);
          }
        });
      });

      it('should select all permanent teeth', function () {
        scope.toggle('ALL', false);
        angular.forEach(scope.teeth, function (tooth) {
          if (!tooth.IsPrimary) {
            expect(tooth.Selected).toEqual(true);
          }
        });
      });

      it('should select all permanent teeth in UL quadrant', function () {
        scope.toggle('UL', false);
        angular.forEach(scope.teeth, function (tooth) {
          if (!tooth.IsPrimary && tooth.Quadrant === 'UL') {
            expect(tooth.Selected).toEqual(true);
          }
        });
      });

      it('should select all primary teeth in L half', function () {
        scope.toggle('L', false);
        angular.forEach(scope.teeth, function (tooth) {
          if (!tooth.IsPrimary && tooth.Half === 'L') {
            expect(tooth.Selected).toEqual(true);
          }
        });
      });
    });
  });
});

describe('odontogramTooth directive ->', function () {
  var scope, element, svg, sce;

  // #region setup

  var toothData = {
    isPrimary: true,
    primaryLetter: 'Z',
    permanentNumber: '99',
  };

  var mockToothSelector = {
    selection: { teeth: [{ position: -1 }] },
    selectTooth: jasmine.createSpy(),
  };

  var staticData = {
    ServiceTransactionStatuses: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({}),
    }),
  };

  var mockChartColorsService = {
    getChartColor: jasmine.createSpy(),
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      $provide.value('ToothSelectionService', mockToothSelector);
      $provide.value('StaticData', staticData);
      $provide.value('ChartColorsService', mockChartColorsService);
    })
  );

  beforeEach(module('soar.templates'));

  beforeEach(inject(function ($rootScope, $compile, $templateCache, $injector) {
    svg =
      '<svg>' +
      '  <div id="' +
      toothData.primaryLetter +
      '_R"></div>' +
      '  <div id="' +
      toothData.primaryLetter +
      '_S"></div>' +
      '  <div id="' +
      toothData.primaryLetter +
      '_T"></div>' +
      '</svg>';

    var $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .expectGET(
        'Images/Teeth/Tooth' + toothData.primaryLetter + '_Layered.svg'
      )
      .respond(svg);

    sce = $injector.get('$sce');

    scope = $rootScope.$new();
    scope.toothData = toothData;
    scope.getIdentifier = function () {
      return toothData.primaryLetter;
    };
    scope.position = 'position';
    scope.services = [];
    scope.bridgeData = {};
    scope.conditions = [
      {
        ConditionId: 1,
        Description: 'Abscess',
      },
    ];
    $templateCache.put(
      'App/Patient/patient-chart/odontogram/odontogramTooth.html',
      '<div></div>'
    );
    var parentElement = $compile(
      '<odontogram-tooth tooth-data="toothData" position="position" chart-ledger-services="services" bridge-data="bridgeData"></odontogram-tooth>'
    )(scope);
    $rootScope.$digest();

    element = parentElement.find('div');
    element.html(svg);
    scope = element.scope();
  }));

  // #endregion

  describe('link function -> ', function () {
    it('should set default values', function () {
      expect(scope.isSelected).toBe(false);
      expect(scope.selection).toEqual(mockToothSelector.selection);
    });

    describe('getIdentifier function ->', function () {
      describe('when toothData.isPrimary is true ->', function () {
        beforeEach(function () {
          scope.toothData = { isPrimary: true, primaryLetter: 'z' };
        });

        it('should return correct id', function () {
          expect(scope.getIdentifier()).toBe(scope.toothData.primaryLetter);
          scope.toothData.primaryLetter = '';
          expect(scope.getIdentifier()).toBe('empty');
        });
      });

      describe('when toothData.isPrimary is false ->', function () {
        beforeEach(function () {
          scope.toothData = { isPrimary: false, permanentNumber: '99' };
        });

        it('should return correct id', function () {
          expect(scope.getIdentifier()).toBe(scope.toothData.permanentNumber);
          scope.toothData.permanentNumber = '';
          expect(scope.getIdentifier()).toBe('empty');
        });
      });
    });

    describe('selectTooth function ->', function () {
      var event;
      beforeEach(function () {
        scope.isSelected = false;
        scope.toothData = { isPrimary: true, primaryLetter: 'z' };
        event = {
          stopPropagation: jasmine.createSpy(),
        };
      });

      it('should set isSelected to true', function () {
        scope.selectTooth(event);
        expect(scope.isSelected).toBe(true);
      });

      it('should call toothSelector.setSelection with correct parameters', function () {
        scope.position = 'position';
        scope.selectTooth(event);
        expect(mockToothSelector.selectTooth).toHaveBeenCalled();
      });

      it('should call event.stopPropagation', function () {
        scope.position = 'position';
        scope.selectTooth(event);
        expect(event.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('selection watch function ->', function () {
      beforeEach(function () {
        scope.position = 12;
      });

      it('should set isSelected to true when tooth selected', function () {
        scope.isSelected = false;
        scope.selection.teeth = [{ position: '12' }];
        scope.$digest();
        expect(scope.isSelected).toBe(true);
      });

      it('should set isSelected to false when tooth not selected', function () {
        scope.isSelected = true;
        scope.selection.teeth = [{ position: 'junk' }];
        scope.$digest();
        expect(scope.isSelected).toBe(false);
      });
    });

    describe('scope.isSelectedWatch function ->', function () {
      var selectedClass = 'odoSelected';

      it('should not fail if scope.svg is not set', function () {
        scope.svg = null;
        scope.isSelected = true;

        scope.isSelectedWatch();

        //expect no failures
      });

      describe('when isSelected is changed to true ->', function () {
        var startClass = 'test';

        beforeEach(function () {
          scope.svg = angular.element(svg);

          scope.svg.attr('class', startClass);
        });

        it('should set svg class to correct value', function () {
          scope.isSelected = true;

          scope.isSelectedWatch();

          expect(scope.svg.attr('class')).toBe(
            startClass + ' ' + selectedClass
          );
        });
      });

      describe('when isSelected is changed to false ->', function () {
        var startClass = 'test ' + selectedClass;

        beforeEach(function () {
          scope.svg = angular.element(svg);

          scope.svg.attr('class', startClass);
        });

        it('should set svg class to correct value', function () {
          scope.isSelected = false;

          scope.isSelectedWatch();

          expect(scope.svg.attr('class')).toBe(
            startClass.replace(selectedClass, '').trim()
          );
        });
      });

      describe('rebuildMenu parameter ->', function () {
        beforeEach(function () {
          scope.svg = angular.element(svg);
          scope.svg.attr('class', `test ${selectedClass}`);
          scope.buildToothMenu = jasmine.createSpy();
        });

        it('should call buildToothMenu when conditions are satisfied and rebuildMenu is true', function () {
          scope.isSelected = true;

          scope.isSelectedWatch(true);

          expect(scope.buildToothMenu).toHaveBeenCalled();
        });

        it('should not call buildToothMenu when rebuildMenu is false', function () {
          scope.isSelected = true;

          scope.isSelectedWatch(false);

          expect(scope.buildToothMenu).not.toHaveBeenCalled();
        });

        it('should not call buildToothMenu when rebuildMenu is undefined', function () {
          scope.isSelected = true;

          scope.isSelectedWatch();

          expect(scope.buildToothMenu).not.toHaveBeenCalled();
        });

        it('should not call buildToothMenu when scope.isSelected is false', function () {
          scope.isSelected = false;

          scope.isSelectedWatch(true);

          expect(scope.buildToothMenu).not.toHaveBeenCalled();
        });

        it('should not call buildToothMenu when scope.svg does not exist', function () {
          scope.isSelected = true;
          scope.svg = null;

          scope.isSelectedWatch(true);

          expect(scope.buildToothMenu).not.toHaveBeenCalled();
        });
      });
    });

    describe('svgLoaded function ->', function () {
      it('should take no action if scope.elem has contains no svg', function () {
        scope.elem = angular.element('<div></div>');
        spyOn(angular, 'element');
        scope.svgLoaded();

        expect(angular.element).not.toHaveBeenCalled();
      });

      it('should set scope.svg', function () {
        scope.svg = null;
        scope.svgLoaded();
        expect(scope.svg).not.toBeNull();
      });

      describe('when scope.svg exists ->', function () {
        var testClass = 'test';

        beforeEach(function () {
          scope.svg = angular.element(svg);
          var svg = angular.element(scope.elem.find('svg')[0]);
          svg.attr('class', testClass);
          spyOn(svg, 'attr');
        });

        it('should preserve existing classes on svg element', function () {
          scope.svgLoaded();
          expect(scope.svg.attr('class')).toBe(testClass);
        });
      });

      describe('when scope.svg does not exist ->', function () {
        var testClass = 'test';
        var toothClass = 'odoTooth';

        beforeEach(function () {
          scope.svg = null;
          var svg = angular.element(scope.elem.find('svg')[0]);
          svg.attr('class', testClass);
          spyOn(svg, 'attr');
        });

        it('should preserve existing classes on svg element', function () {
          scope.svgLoaded();
          expect(scope.svg.attr('class')).toBe(toothClass);
        });
      });
    });

    describe('buildToothMenuHtml function ->', function () {
      beforeEach(function () {
        scope.serviceTransactionStatuses = [
          {
            Id: 1,
            Name: 'Proposed',
          },
        ];
        scope.$parent.conditions = [
          {
            ConditionId: 1,
            Description: 'Abscess',
          },
        ];
        scope.conditions = [
          {
            ConditionId: 1,
            Description: 'Abscess',
          },
        ];
      });

      it('should return HTML including "No services or conditions found." if there are no chart ledger services for the tooth', function () {
        scope.buildToothMenuHtml();
        expect(sce.getTrustedHtml(scope.toothMenuHtml)).toEqual(
          '<div><div class="fuseGrid pull-left col-md-9"><div class="row body" ng-click="moveToTop($event)">No services or conditions found.</div></div>'
        );
      });

      it('should return HTML including service transaction information if there is a chart ledger service of RecordType "ServiceTransaction" for the tooth', function () {
        scope.chartLedgerServices = {
          Z: [
            {
              RecordType: 'ServiceTransaction',
              CreationDate: new Date('12/08/2001'),
              Description: 'D5110: complete denture - maxillary (D5110)',
              StatusId: 1,
              IsDeleted: false,
            },
          ],
        };
        scope.buildToothMenuHtml();
        expect(sce.getTrustedHtml(scope.toothMenuHtml)).toEqual(
          '<div><div class="col-md-3"><a id="bringToTop" class="btn btn-default" ng-click="showServicesAndConditionsGrid()">Bring to Top <span class="fa fa-angle-right"></span></a></div><div class="fuseGrid pull-left col-md-9" ng-if="showGrid"><div class="row body" id="undefined" ng-click="moveToTop($event)">12/08/2001 - D5110: complete denture - maxillary (D5110) - Proposed</div></div></div>'
        );
        scope.chartLedgerServices.Z[0].Description =
          'D3450: root amputation - per root (D3450)';
        scope.chartLedgerServices.Z[0].Area = 'P';
        scope.buildToothMenuHtml();
        expect(sce.getTrustedHtml(scope.toothMenuHtml)).toEqual(
          '<div><div class="col-md-3"><a id="bringToTop" class="btn btn-default" ng-click="showServicesAndConditionsGrid()">Bring to Top <span class="fa fa-angle-right"></span></a></div><div class="fuseGrid pull-left col-md-9" ng-if="showGrid"><div class="row body" id="undefined" ng-click="moveToTop($event)">12/08/2001 - D3450: root amputation - per root (D3450) (P) - Proposed</div></div></div>'
        );
      });

      it('should return HTML including condition information if there is a chart ledger service of RecordType "Condition" for the tooth', function () {
        scope.chartLedgerServices = {
          Z: [
            {
              RecordType: 'Condition',
              CreationDate: new Date('10/22/2004'),
              ConditionId: 1,
              IsDeleted: false,
            },
          ],
        };
        scope.buildToothMenuHtml();
        expect(sce.getTrustedHtml(scope.toothMenuHtml)).toEqual(
          '<div><div class="col-md-3"><a id="bringToTop" class="btn btn-default" ng-click="showServicesAndConditionsGrid()">Bring to Top <span class="fa fa-angle-right"></span></a></div><div class="fuseGrid pull-left col-md-9" ng-if="showGrid"><div class="row body" id="undefined" ng-click="moveToTop($event)">10/22/2004 - Abscess - Condition</div></div></div>'
        );
        scope.chartLedgerServices.Z[0].Area = 'DBPMB';
        scope.buildToothMenuHtml();
        expect(sce.getTrustedHtml(scope.toothMenuHtml)).toEqual(
          '<div><div class="col-md-3"><a id="bringToTop" class="btn btn-default" ng-click="showServicesAndConditionsGrid()">Bring to Top <span class="fa fa-angle-right"></span></a></div><div class="fuseGrid pull-left col-md-9" ng-if="showGrid"><div class="row body" id="undefined" ng-click="moveToTop($event)">10/22/2004 - Abscess (DBPMB) - Condition</div></div></div>'
        );
      });

      it('should return HTML excluding service transaction irrespective of record type that has IsDeleted equals true', function () {
        scope.chartLedgerServices = {
          Z: [
            {
              RecordType: 'Condition',
              CreationDate: new Date('10/22/2004'),
              ConditionId: 1,
              IsDeleted: true,
            },
          ],
        };
        scope.buildToothMenuHtml();
        expect(sce.getTrustedHtml(scope.toothMenuHtml)).toEqual(
          '<div><div class="fuseGrid pull-left col-md-9"><div class="row body" ng-click="moveToTop($event)">No services or conditions found.</div></div>'
        );
        scope.chartLedgerServices.Z[0].Area = 'DBPMB';
        scope.buildToothMenuHtml();
        expect(sce.getTrustedHtml(scope.toothMenuHtml)).toEqual(
          '<div><div class="fuseGrid pull-left col-md-9"><div class="row body" ng-click="moveToTop($event)">No services or conditions found.</div></div>'
        );
      });
    });

    describe('buildToothMenu function ->', function () {
      it('should build template with odontogram__toothMenuTop class applied for upper arch', function () {
        scope.toothData.arch = 'u';
        scope.buildToothMenu();
        expect(scope.toothMenuTemplate).toBe(
          '<span uib-popover-html="toothMenuHtml" popover-is-open="popoverIsOpen" popover-append-to-body="true" popover-placement="bottom-left" popover-class="odontogram__toothMenuPopover odontogram__toothMenuPopover_position" popover-trigger="outsideClick" class="odontogram__toothMenu odontogram__toothMenuTop" id="toothMenuposition" uib-tooltip-html="toolTipHtml" tooltip-append-to-body="true" tooltip-placement="top" ng-click="showToothMenu($event)" ng-hide="hideToothMenu">&hellip;</span>'
        );
      });

      it('should build template with odontogram__toothMenuBottom class applied for lower arch', function () {
        scope.toothData.arch = 'l';
        scope.buildToothMenu();
        expect(scope.toothMenuTemplate).toBe(
          '<span uib-popover-html="toothMenuHtml" popover-is-open="popoverIsOpen" popover-append-to-body="true" popover-placement="bottom-left" popover-class="odontogram__toothMenuPopover odontogram__toothMenuPopover_position" popover-trigger="outsideClick" class="odontogram__toothMenu odontogram__toothMenuBottom" id="toothMenuposition" uib-tooltip-html="toolTipHtml" tooltip-append-to-body="true" tooltip-placement="top" ng-click="showToothMenu($event)" ng-hide="hideToothMenu">&hellip;</span>'
        );
      });

      it('should build template with odontogram__toothMenuBottom class applied for upper arch', function () {
        spyOn(scope, 'buildToothMenuHtml');
        scope.buildToothMenu();
        expect(scope.buildToothMenuHtml).toHaveBeenCalled();
      });
    });

    describe('moveToTop function ->', function () {
      var e = {};

      beforeEach(function () {
        scope.toothData = { isPrimary: false, permanentNumber: 4 };
        e = { currentTarget: { id: '2' } };
        scope.chartLedgerServices = {
          4: [
            { RecordId: '1', RecordType: 'ServiceTransaction' },
            { RecordId: '2', RecordType: 'Condition' },
            { RecordId: '3', RecordType: 'ServiceTransaction' },
          ],
          A: undefined,
        };
      });

      it('should call showServicesAndConditionsGrid with false', function () {
        spyOn(scope, 'showServicesAndConditionsGrid');
        scope.moveToTop(e);
        expect(scope.showServicesAndConditionsGrid).toHaveBeenCalledWith(false);
      });

      it('should set correct index on $$DrawTypeOrder based on the currentTarget.id passed', function () {
        scope.moveToTop(e);
        expect(scope.chartLedgerServices[4][0].$$DrawTypeOrder).toBeUndefined();
        expect(scope.chartLedgerServices[4][1].$$DrawTypeOrder).toBe(0);
        expect(scope.chartLedgerServices[4][2].$$DrawTypeOrder).toBeUndefined();
      });

      it('should set correct index on $$DrawTypeOrder based on the currentTarget.id passed', function () {
        e.currentTarget.id = '1';
        scope.moveToTop(e);
        expect(scope.chartLedgerServices[4][0].$$DrawTypeOrder).toBe(0);
        expect(scope.chartLedgerServices[4][1].$$DrawTypeOrder).toBeUndefined();
        expect(scope.chartLedgerServices[4][2].$$DrawTypeOrder).toBeUndefined();
      });

      it('should not set any item to zero if bad id is passed', function () {
        e.currentTarget.id = 'bad';
        scope.moveToTop(e);
        expect(scope.chartLedgerServices[4][0].$$DrawTypeOrder).toBeUndefined();
        expect(scope.chartLedgerServices[4][1].$$DrawTypeOrder).toBeUndefined();
        expect(scope.chartLedgerServices[4][2].$$DrawTypeOrder).toBeUndefined();
      });

      it('should keep existing order of non-selected items and just put selected one at the top', function () {
        e.currentTarget.id = '2';
        scope.chartLedgerServices[4][0].$$DrawTypeOrder = 0;
        scope.chartLedgerServices[4][1].$$DrawTypeOrder = 1;
        scope.chartLedgerServices[4][2].$$DrawTypeOrder = 2;
        scope.moveToTop(e);
        expect(scope.chartLedgerServices[4][0].$$DrawTypeOrder).toBe(1);
        expect(scope.chartLedgerServices[4][1].$$DrawTypeOrder).toBe(0);
        expect(scope.chartLedgerServices[4][2].$$DrawTypeOrder).toBe(2);
      });

      it('should keep existing order of non-selected items and just put selected one at the top', function () {
        e.currentTarget.id = '3';
        scope.chartLedgerServices[4][0].$$DrawTypeOrder = 0;
        scope.chartLedgerServices[4][1].$$DrawTypeOrder = 1;
        scope.chartLedgerServices[4][2].$$DrawTypeOrder = 2;
        scope.moveToTop(e);
        expect(scope.chartLedgerServices[4][0].$$DrawTypeOrder).toBe(1);
        expect(scope.chartLedgerServices[4][1].$$DrawTypeOrder).toBe(2);
        expect(scope.chartLedgerServices[4][2].$$DrawTypeOrder).toBe(0);
      });

      it('should keep existing order of non-selected items and just put selected one at the top', function () {
        e.currentTarget.id = '1';
        scope.chartLedgerServices[4][0].$$DrawTypeOrder = 2;
        scope.chartLedgerServices[4][1].$$DrawTypeOrder = 0;
        scope.chartLedgerServices[4][2].$$DrawTypeOrder = 1;
        scope.moveToTop(e);
        expect(scope.chartLedgerServices[4][0].$$DrawTypeOrder).toBe(0);
        expect(scope.chartLedgerServices[4][1].$$DrawTypeOrder).toBe(1);
        expect(scope.chartLedgerServices[4][2].$$DrawTypeOrder).toBe(2);
      });

      it('should call onDrawingReordering with odontogramToothDto', function () {
        spyOn(scope, 'onDrawingReordering');
        scope.moveToTop(e);
        expect(scope.onDrawingReordering).toHaveBeenCalledWith({
          odontogramToothDto: {
            ToothNumber: '4',
            OrderedDrawItems: [
              { ItemTypeId: 2, ItemId: '2', $$DrawTypeOrder: 0 },
            ],
          },
        });
      });

      it('should call chartLedgerServicesChanged', function () {
        spyOn(scope, 'chartLedgerServicesChanged');
        scope.moveToTop(e);
        expect(scope.chartLedgerServicesChanged).toHaveBeenCalled();
      });

      it('should call buildToothMenuHtml and set popoverIsOpen to false', function () {
        scope.popoverIsOpen = true;
        spyOn(scope, 'buildToothMenuHtml');
        scope.moveToTop(e);
        expect(scope.buildToothMenuHtml).toHaveBeenCalled();
        expect(scope.popoverIsOpen).toBe(false);
      });
    });

    describe('selection watch function ->', function () {
      beforeEach(function () {
        scope.toothData.$loaded = false;
        spyOn(scope, 'removeOrphanedTemplates');
      });

      it('should set $loaded property', function () {
        scope.alertFinished();
        expect(scope.toothData.$loaded).toBe(true);
      });
    });

    describe('selection watch function ->', function () {
      beforeEach(function () {
        scope.toothData.isPrimary = true;
        spyOn(scope, 'removeOrphanedTemplates');
      });

      it('should call scope.removeOrphanedTemplates to remove all templates for this tooth scope.toothData.isPrimary changes', function () {
        scope.toothData.isPrimary = false;
        scope.$apply();
        expect(scope.removeOrphanedTemplates).toHaveBeenCalledWith(0);
      });
    });

    // NOTE investigate this causes backend request errors
    // describe('buildToothMenu function ->', function () {

    //     beforeEach(function () {
    //         spyOn(scope,'removeOrphanedTemplates').and.callFake(function(){});
    //         spyOn(scope, 'buildToothMenu').and.callFake(function(){});
    //     });

    //     it('should call removeOrphanedTemplates if scope.showGrid is true', function () {
    //         scope.showGrid=true;
    //         scope.showServicesAndConditionsGrid(true);
    //         expect(scope.removeOrphanedTemplates).toHaveBeenCalledWith(1);
    //     });
    // });
  });
});

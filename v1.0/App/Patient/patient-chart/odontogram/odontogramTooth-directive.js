(function (module) {
  'use strict';

  module.directive('odontogramTooth', odontogramTooth);

  odontogramTooth.$inject = [
    'ToothSelectionService',
    '$filter',
    '$timeout',
    'PatientOdontogramFactory',
    'ListHelper',
    '$http',
    '$compile',
    'localize',
    '$sce',
    'StaticData',
    '$window',
    '$rootScope',
    'ChartColorsService',
  ];
  function odontogramTooth(
    toothSelector,
    $filter,
    $timeout,
    patientOdontogramFactory,
    listHelper,
    $http,
    $compile,
    localize,
    $sce,
    staticData,
    $window,
    $rootScope,
    chartColorsService
  ) {
    return {
      restrict: 'E',
      scope: {
        position: '=',
        toothData: '=',
        chartLedgerServices: '=',
        bridgeData: '=',
        activeToothMenu: '=?',
        onDrawingReordering: '&',
        conditions: '<'
      },
      templateUrl: 'App/Patient/patient-chart/odontogram/odontogramTooth.html',
      link: function link(scope, elem) {
        scope.isSelected = false;
        scope.selection = toothSelector.selection;
        scope.drawTimeout = null;

        staticData.ServiceTransactionStatuses().then(function (res) {
          if (res && res.Value) {
            scope.serviceTransactionStatuses = res.Value;
          }
        });

        scope.$watch(
          function () {
            return patientOdontogramFactory.CloseToothOptions;
          },
          function () {
            scope.popoverIsOpen = false;
            scope.hideToothMenu = false;
          }
        );

        scope.getIdentifier = function () {
          var id = scope.toothData.isPrimary
            ? scope.toothData.primaryLetter
            : scope.toothData.permanentNumber;
          if (id == '') {
            id = 'empty';
          }

          return id;
        };

        scope.getSvg = function () {
          var id = scope.getIdentifier();
          var url = 'Images/Teeth/';
          if (id === 'empty') {
            url += 'empty.svg';
          } else {
            url += 'Tooth' + id + '_Layered.svg';
          }
          scope.svgUrl = url;
          $http({
            method: 'GET',
              url: url,
            cache: true,
          }).then(
            function success(res) {
              if (res.config.url !== scope.svgUrl) return;

              var inlineSvg = res.data;

              $timeout(function () {
                angular.element('#tooth' + scope.position).html(inlineSvg);
                scope.svgLoaded();
                scope.isSelectedWatch(true);
              });
            },
            function error(res) {
              // eslint-disable-next-line no-console
              console.error(res);
            }
          );
        };

        scope.getSvg();

        // get the toothId when selected
        scope.selectTooth = function (event) {
          scope.isSelected = !scope.isSelected;
          var toothId = scope.getIdentifier();
          toothSelector.selectTooth(
            { position: scope.position, toothId: toothId },
            scope.isSelected
          );
          if (scope.isSelected) {
            patientOdontogramFactory.setSelectedTeeth(toothId);
          } else {
            // if tooth is deselected remove the popover (if exists)
            scope.showServicesAndConditionsGrid(false);
            var index = patientOdontogramFactory.selectedTeeth.indexOf(toothId);
            if (index > -1)
              patientOdontogramFactory.selectedTeeth.splice(index, 1);
          }
          event.stopPropagation();
          $window.event.cancelBubble;
        };

        scope.viewWatch = function () {
          var selectedWatchId = null;
          // broadcasting the appropriate tooth number (primary or permanent) for view watch
          if (scope.toothData.isPrimary) {
            _.forEach(scope.toothData.watchTeeth, function (tooth, key) {
              if (selectedWatchId === null && isNaN(tooth)) {
                selectedWatchId = scope.toothData.watchIds[key];
              }
            });
          } else {
            _.forEach(scope.toothData.watchTeeth, function (tooth, key) {
              if (selectedWatchId === null && !isNaN(tooth)) {
                selectedWatchId = scope.toothData.watchIds[key];
              }
            });
          }
          scope.$emit('view-watch', selectedWatchId);
        };

        // watch indicator
        scope.hasWatch = function () {
          var identifier = scope.getIdentifier();
          identifier = !isNaN(identifier) ? identifier.toString() : identifier;
          var index = scope.toothData.watchTeeth.indexOf(identifier);
          return index !== -1;
        };

        scope.$watch(
          'selection',
          function () {
            if (_.isEmpty(scope.selection.teeth)) {
              if (scope.isSelected === true) {
                scope.isSelected = false;
              }
              return;
            }
            var found = false;
            // convert scope.selection.teeth to int for comparison
            _.forEach(scope.selection.teeth, function (tooth) {
              if (parseInt(tooth.position) === scope.position) {
                found = true;
              }
            });
            scope.isSelected = found;
          },
          true
        );

        scope.chartLedgerServicesChanged = function () {
          scope.updateDrawing();
          scope.buildToothMenu();
        };

        scope.alertFinished = function () {
          scope.toothData.$loaded = true;
          var id = scope.getIdentifier();
          scope.$emit('soar:odo-tooth-finished', id);
        };

        scope.$watch(
          'chartLedgerServices',
          function () {
            scope.chartLedgerServicesChanged();
          },
          true
        );

        scope.$watch(
          function () {
            var bData = scope.bridgeData[scope.getIdentifier()];
            return bData ? bData.type + ':' + (bData.direction || '') : '';
          },
          function (nv, ov) {
            if (nv != ov && (nv != '' || ov != '')) {
              scope.updateDrawing();
            }
          }
        );

        var lastIsPrimary = scope.toothData.isPrimary;
        scope.$watch('toothData.isPrimary', function (nv) {
          if (nv != lastIsPrimary) {
            // tooth has been switched to primary remove all popovers
            scope.removeOrphanedTemplates(0);
            if (!scope.drawTimeout) {
              scope.drawTimeout = $timeout(function () {
                scope.drawTimeout = null;
                scope.getSvg();
              }, 100);
            }
          }

          lastIsPrimary = nv;
        });

        // resizing the associated tooth if it has a little buddy tooth
        scope.$watch('toothData.hasSupernumerary', function (nv) {
          if (nv === true) {
            scope.svgLoaded();
          }
        });

        scope.updateDrawing = function () {
          if (!scope.chartLedgerServices) {
            scope.chartLedgerServices = {};
          }
          var items = scope.chartLedgerServices[scope.getIdentifier()];
          if (_.isEmpty(items)) {
            if (scope.svg) {
              scope.svg.find('use').remove();
            }
            return;
          }

          if (scope.svg) {
            scope.svg.find('use').remove();
          }

          //if no $$DrawTypeOrder  default order is by service.CreationDate desc
          items = $filter('orderBy')(items, [
            '-$$DrawTypeOrder',
            '-$$DrawTypeOrderGroup',
            'CreationDate',
          ]);

          _.forEach(items, function (item) {
            if (!item.DrawType || item.DrawType.GroupNumber === 0) {
              return;
            }

            // Group 4 - check for existence and ignore other groups
            if (item.DrawType.GroupNumber === 4) {
              scope.makePathVisible(item.DrawType.PathLocator);
              return;
            }

            var color = chartColorsService.getChartColor(
              item.RecordType,
              item.StatusId
            );

            // Group 2 & 3 - set draw type opacity to 100%
            if (
              item.DrawType.GroupNumber &&
              item.DrawType.PathLocator &&
              (item.DrawType.GroupNumber == 2 || item.DrawType.GroupNumber == 3)
            ) {
              var fixBgBox = false;
              if (
                item.DrawType.GroupNumber === 3 ||
                item.DrawType.PathLocator.indexOf('#implant') === 0 ||
                item.DrawType.PathLocator === '#denture'
              ) {
                fixBgBox = true;
              }

              var path = item.DrawType.PathLocator;

              if (item.DrawType.PathLocator.indexOf('bridge_abutment') !== -1) {
                scope.resetBridgeOpacity(item.DrawType.PathLocator);
                var status = scope.bridgeData[scope.getIdentifier()];
                if (status && status.direction) {
                  var direction = status.direction;
                  if (direction !== 'both' && direction !== '') {
                    path = path + '_' + direction;
                  }
                }
              }

              scope.makePathVisible(
                path,
                fixBgBox,
                item.DrawType.PathLocator === '#missing_crown',
                color
              );
            }

            // Group 1 - set surface draw type opacity to 100%
            if (item.DrawType.GroupNumber == 1) {
              _.forEach(item.SummarySurfaces, function (surface) {
                scope.makePathVisible(
                  item.DrawType.PathLocator + surface.PathLocator,
                  false,
                  false,
                  color
                );
              });
            }
          });
        };

        scope.makePathVisible = function (
          locator,
          fixBgBox,
          missingCrown,
          color
        ) {
          if (scope.svg) {
            var elem = scope.svg.find('g' + locator);
            if (fixBgBox) {
              var rect = elem.find(
                'rect' + (missingCrown ? '' : ':first-of-type')
              );
              rect.attr('class', 'draw-type-background');
            }

            var id = scope.getIdentifier();
            var nonSuperId = id;

            if (scope.toothData.isPrimary) {
              nonSuperId = id.charAt(0);
            } else {
              nonSuperId = id > 50 ? id - 50 : id;
            }

            var parts = ['a', 'b', 'c'];
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];

              var useElemDom = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'use'
              );

              var locatorId = part + id + '_' + locator.replace('#', '');

              // the 'B' view does not contain mesial and distal bridge abutment paths - need to compensate
              if (
                part == 'b' &&
                (locator === '#bridge_abutment_mesial' ||
                  locator === '#bridge_abutment_distal')
              ) {
                locatorId = locatorId
                  .replace('_mesial', '')
                  .replace('_distal', '');
              }

              var elemId = locatorId + '_use';
              angular.element('#' + elemId).remove();
              useElemDom.setAttribute('href', '#' + locatorId);
              useElemDom.setAttribute('id', elemId);
              var style = '';
              if (color && color.length > 0) {
                style += 'fill:' + color + ';stroke:' + color;
              }
              useElemDom.setAttribute('style', style);

              var groupNode = scope.svg.find(
                '.' + part + nonSuperId + '-cls-1'
              );
              if (groupNode.length > 0) {
                groupNode[0].appendChild(useElemDom);
              }
            }
          }
        };

        scope.resetBridgeOpacity = function (locator) {
          // JRW - may need to consider resetting opacity of all draw types (search on opacity:1?) to reset drawing each time
          if (scope.svg) {
            _.forEach(['', '_mesial', '_distal'], function (suffix) {
              var elem = scope.svg.find('g' + locator + suffix);
              elem.css('opacity', '0');
            });
          }
        };

        scope.isSelectedWatch = function (rebuildMenu) {
          if (scope.svg) {
            var svgClass = scope.svg
              .attr('class')
              .replace('odoSelected', '')
              .trim();
            if (scope.isSelected) {
              svgClass += ' odoSelected';
              if (rebuildMenu === true) {
                scope.buildToothMenu();
              }
              if (!angular.element('#toothMenu' + scope.position)[0]) {
                angular
                  .element('#tooth' + scope.position)
                  .prepend(scope.toothMenuTemplate);
                $compile(angular.element('#tooth' + scope.position).contents())(
                  scope
                );
              }
              scope.hideToothMenu = false;
            } else {
              scope.hideToothMenu = true;
            }
            scope.svg.attr('class', svgClass);
          }
        };

        scope.$watch('isSelected', scope.isSelectedWatch);

        scope.elem = elem;
        scope.svgLoaded = function () {
          var svgs = scope.elem.find('svg');
          if (svgs.length > 0) {
            var svg = angular.element(svgs[0]);
            if (scope.svg && !scope.toothData.hasSupernumerary) {
              svg.attr('class', scope.svg.attr('class'));
            } else {
              if (
                scope.toothData.isSupernumerary === true ||
                scope.toothData.hasSupernumerary === true
              ) {
                var classes = scope.isSelected
                  ? 'odoTooth odoToothMedium odoSelected'
                  : 'odoTooth odoToothMedium';
                svg.attr('class', classes);
              } else {
                svg.attr('class', 'odoTooth');
              }
            }
            // making room for the tooth menu on top of the tooth for the upper arch
            if (scope.toothData.arch === 'u') {
              svg.attr('style', 'margin-top: 30px;');
            }
            scope.svg = svg;
          }
          scope.updateDrawing();
          scope.alertFinished();
        };

        //#region tooth menu

        scope.buildToothMenuHtml = function () {
          var template = '';
          var items = scope.chartLedgerServices[scope.getIdentifier()];

          items = $filter('orderBy')(
            items,
            ['-$$DrawTypeOrder', '-$$DrawTypeOrderGroup', 'CreationDate'],
            true
          );
          items = $filter('filter')(items, { IsDeleted: false });

          if (items != undefined && items.length > 0) {
            //if (items) {
            var grid =
              '<div class="fuseGrid pull-left col-md-9" ng-if="showGrid">';
            _.forEach(items, function (item) {
              var string = '';
              string =
                string + $filter('toShortDisplayDate')(item.CreationDate);
              if (item.RecordType === 'ServiceTransaction') {
                string = string + ' - ' + item.Description;
                if (item.Area) {
                  string = string + ' (' + item.Area + ')';
                }
                // get the status name for display
                var status = listHelper.findItemByFieldValue(
                  scope.serviceTransactionStatuses,
                  'Id',
                  item.StatusId
                );
                if (status) {
                  string = string + ' - ' + status.Name;
                }
              } else if (item.RecordType === 'Condition') {
                // need to look up the desc from conditions list, seems like this directive will always be a child of the odontogram directive so chose not to pass in conditions list at this time
                var condition = listHelper.findItemByFieldValue(
                  scope.conditions,
                  'ConditionId',
                  item.ConditionId
                );
                if (condition) {
                  string = string + ' - ' + _.escape(condition.Description);
                }
                if (item.Area) {
                  string = string + ' (' + item.Area + ')';
                }
                string = string + ' - ' + item.RecordType;
              }
              grid =
                grid +
                '<div class="row body" id="' +
                item.RecordId +
                '" ng-click="moveToTop($event)">' +
                string +
                '</div>';
            });
            grid = grid + '</div>';
            var btns =
              '<div class="col-md-3"><a id="bringToTop" class="btn btn-default" ng-click="showServicesAndConditionsGrid()">' +
              localize.getLocalizedString('Bring to Top') +
              ' <span class="fa fa-angle-right"></span></a></div>';
            template = '<div>' + btns + grid + '</div>';
          } else {
            template =
              '<div><div class="fuseGrid pull-left col-md-9"><div class="row body" ng-click="moveToTop($event)">' +
              localize.getLocalizedString('No services or conditions found.') +
              '</div></div>';
          }
          scope.toothMenuHtml = $sce.trustAsHtml(template);
        };

        scope.buildToothMenu = function () {
          var toothMenuSecondaryClassName =
            scope.toothData.arch === 'u'
              ? 'odontogram__toothMenuTop'
              : 'odontogram__toothMenuBottom';
          var toothMenuTooltip = localize.getLocalizedString('Tooth Options');
          scope.buildToothMenuHtml();
          scope.toolTipHtml = $sce.trustAsHtml(
            "<div id='toothOptionsTooltip'>" + toothMenuTooltip + '</div>'
          );
          scope.toothMenuTemplate =
            '<span uib-popover-html="toothMenuHtml" popover-is-open="popoverIsOpen" popover-append-to-body="true" popover-placement="bottom-left" popover-class="odontogram__toothMenuPopover odontogram__toothMenuPopover_' +
            scope.position +
            '" popover-trigger="outsideClick" class="odontogram__toothMenu ' +
            toothMenuSecondaryClassName +
            '" id="toothMenu' +
            scope.position +
            '" uib-tooltip-html="toolTipHtml" tooltip-append-to-body="true" tooltip-placement="top" ng-click="showToothMenu($event)" ng-hide="hideToothMenu">&hellip;</span>';
        };

        scope.showToothMenu = function (event) {
          scope.showServicesAndConditionsGrid(false);
          $timeout(function () {
            $compile(
              angular
                .element(
                  '.odontogram__toothMenuPopover_' +
                    scope.position +
                    ' .popover-inner .popover-content'
                )
                .contents()
            )(scope);
          });
          // making sure the tooth stays selected when the menu is clicked
          scope.isSelected = true;
          scope.activeToothMenu = 'toothMenu' + scope.position;
          event.stopPropagation();
          $window.event.cancelBubble;
        };

        // navigate to other page will close the tooth
        $rootScope.$on('toothClose', function () {
          scope.showServicesAndConditionsGrid(false);
          scope.isSelected = false;
          // clears the previous selection when you navigate away
          scope.selection.teeth = [];
          patientOdontogramFactory.selectedTeeth = [];
        });

        // we need to remove any extra popovers for this tooth that might exist
        // any time we rebuild the menu (this happens when switching from Primary to Permanent or Permanent to Primary)
        scope.removeOrphanedTemplates = function (ndx) {
          var targets = document.getElementsByClassName(
            'popover bottom odontogram__toothMenuPopover odontogram__toothMenuPopover_' +
              scope.position
          );
          var i;
          if (ndx === 0) {
            for (i = targets.length - 1; i >= 0; --i) {
              targets[i].remove();
            }
          } else {
            for (i = targets.length - 1; i >= 0; --i) {
              if (targets[i].style.cssText === 'top: 0px; left: 0px;') {
                targets[i].remove();
              }
            }
          }
        };

        scope.showServicesAndConditionsGrid = function (flag) {
          scope.showGrid = _.isUndefined(flag) ? true : flag;
          if (scope.showGrid) {
            // make sure there is only one popover
            scope.removeOrphanedTemplates(1);
          }
        };

        scope.moveToTop = function (e) {
          scope.showServicesAndConditionsGrid(false);
          var items = scope.chartLedgerServices[scope.getIdentifier()];
          items = $filter('orderBy')(items, '$$DrawTypeOrder');
          if (items) {
            var orderedDrawItems = [];
            var i = 1;
            _.forEach(items, function (item) {
              var odontogramDrawItemDto = {
                ItemTypeId: item.RecordType === 'ServiceTransaction' ? 1 : 2,
                ItemId: item.RecordId,
              };
              var addToList = false;
              if (item.RecordId === e.currentTarget.id) {
                item.$$DrawTypeOrder = 0;
                odontogramDrawItemDto.$$DrawTypeOrder = 0;
                addToList = true;
              } else if (typeof item.$$DrawTypeOrder !== 'undefined') {
                item.$$DrawTypeOrder = i;
                odontogramDrawItemDto.$$DrawTypeOrder = i;
                i++;
                addToList = true;
              }

              if (addToList === true) {
                orderedDrawItems.push(odontogramDrawItemDto);
              }
            });
            var odontogramToothDto = {
              ToothNumber: scope.getIdentifier().toString(),
              OrderedDrawItems: $filter('orderBy')(
                orderedDrawItems,
                '$$DrawTypeOrder'
              ),
            };
            scope.onDrawingReordering({
              odontogramToothDto: odontogramToothDto,
            });
            scope.chartLedgerServicesChanged();
          }
          scope.popoverIsOpen = false;
          scope.buildToothMenuHtml();
        };

        // listening for changes to activeToothMenu, if it does not match this tooth and this tooth has a menu open, close it to keep from having more than one tooth menu open
        scope.$watch('activeToothMenu', function (nv) {
          scope.showServicesAndConditionsGrid(false);
          if (
            nv &&
            nv !== 'toothMenu' + scope.position &&
            scope.popoverIsOpen === true
          ) {
            scope.popoverIsOpen = false;
          }
        });

        $('#btnActivateConditionSearch').click(function (event) {
          if (scope.isSelected === true) {
            $timeout(function () {
              scope.popoverIsOpen = false;
              scope.showGrid = false;
            });
          }
        });

        $('#btnActivateServiceSearch').click(function (event) {
          if (scope.isSelected === true) {
            $timeout(function () {
              scope.popoverIsOpen = false;
              scope.showGrid = false;
            });
          }
        });

        //#endregion

        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  }
})(angular.module('Soar.Patient'));

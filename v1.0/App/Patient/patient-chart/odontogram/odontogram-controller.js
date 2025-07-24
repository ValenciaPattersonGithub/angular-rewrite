(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('OdontogramController', OdontogramController);

  OdontogramController.$inject = [
    '$scope',
    '$filter',
    '$timeout',
    '$q',
    'AmfaKeys',
    'ListHelper',
    'toastrFactory',
    'localize',
    'patSecurityService',
    'PatientServices',
    'ToothSelectionService',
    'PatientOdontogramFactory',
    'StaticData',
    'referenceDataService',
    'FileUploadFactory',
    'fileService',
    'OdontogramUtilities',
    'PatientValidationFactory',
    '$window',
    'DrawTypesService',
    'FeatureFlagService',
    'FuseFlag',
    'ConditionsService',
  ];

  function OdontogramController(
    $scope,
    $filter,
    $timeout,
    $q,
    AmfaKeys,
    listHelper,
    toastrFactory,
    localize,
    patSecurityService,
    patientServices,
    toothSelectionService,
    patientOdontogramFactory,
    staticData,
    referenceDataService,
    fileUploadFactory,
    fileService,
    utilities,
    patientValidationFactory,
    $window,
    drawTypesService,
    featureFlagService,
    fuseFlag,
    conditionsService,
  ) {
    BaseCtrl.call(this, $scope, 'OdontogramController');
      
    toothSelectionService.resetToothData();
    var toothData = toothSelectionService.toothData;

    // removing any left over supernumerary teeth from previously viewed patient, if current patient has any, they will be loaded below
    _.forEach(toothData, function (tooth) {
      if (tooth.isSupernumerary === true) {
        delete toothData[tooth.toothId];
      } else if (tooth.hasSupernumerary === true) {
        delete tooth.hasSupernumerary;
      }
    });
    $scope.toothData = toothData;

    $scope.parsedLedgerServices = {};
    $scope.bridgeData = {};
    $scope.activeToothMenu = '';
    $scope.allTeethLoaded = false;

    var ctrl = this;

    //#region Authorization

    $scope.ogmEditAuthAbbrev = AmfaKeys.SoarClinCodogmEdit;

    $scope.hasEditOdontogramAccess = patSecurityService.IsAuthorizedByAbbreviation(
      AmfaKeys.SoarClinCodogmEdit
    );

    //#endregion

    // clearing old tooth selection whenever odontogram is loaded
    toothSelectionService.selection.teeth = [];
    $scope.selection = toothSelectionService.selection;

    // flag while saving odontogram
    $scope.savingOdontogram = false;

    $scope.selectToothGroup = function (type, position) {
      toothSelectionService.selectToothGroup(type, position);
    };

    ctrl.selectTooth = function (tooth, selected) {
      toothSelectionService.selectTooth(tooth, selected);
    };

    $scope.$on('soar:odo-toggle-primary', function (event, isPrimary) {
      $scope.togglePrimary(isPrimary);
    });

    // helper for converting quadrant name to abbrev
    ctrl.getQuadrantAbbrev = function (quadName) {
      switch (quadName) {
        case 'Upper Right':
          return 'ur';
        case 'Upper Left':
          return 'ul';
        case 'Lower Right':
          return 'lr';
        case 'Lower Left':
          return 'll';
      }
      return quadName;
    };

    // used to update $scope.toothData on load and when new supernumerarys are added or removed
    ctrl.addSupernumeraryToToothDataArray = function (snt) {
      var num = snt.USNumber;
      if (snt.Selected === false) {
        // supernumerary has been removed
        delete $scope.toothData[snt.ToothId];
      } else {
        $scope.toothData[snt.ToothId] = {
          isPrimary: snt.ToothStructure === 'Primary',
          permanentNumber: snt.ToothStructure === 'Permanent' ? num : null,
          primaryLetter: snt.ToothStructure === 'Primary' ? num : null,
          quadrant: ctrl.getQuadrantAbbrev(snt.QuadrantName),
          arch: snt.ArchPosition === 'Upper' ? 'u' : 'l',
          watchIds: null,
          watchTeeth: null,
          isSupernumerary: snt.Selected === true,
          toothId: snt.ToothId,
        };
      }
      if (snt.ToothStructure === 'Permanent') {
        $scope.toothData[num - 50].hasSupernumerary = snt.Selected === true;
      } else if (snt.ToothStructure === 'Primary') {
        _.forEach($scope.toothData, function (tooth) {
          if (tooth.primaryLetter === num.slice(0, 1)) {
            tooth.hasSupernumerary = snt.Selected === true;
          }
        });
      }
    };

    // following the same pattern that is used when primary/permanent toggle is flipped, this is broadcast by the quadrant selector directive
    $scope.$on(
      'soar:odo-supernumerary-update',
      function (event, updatedSupernumeraryList) {
        _.forEach(updatedSupernumeraryList, function (snt) {
          ctrl.addSupernumeraryToToothDataArray(snt);
        });
        ctrl.setToothChart();
        $timeout(function () {
          ctrl.updateArchWidths();
        });
      }
    );

    $scope.$on('soar:odo-tooth-finished', function (event, id) {
      var allTeethLoaded = true;

      _.forEach($scope.toothData, function (tooth) {
        if (!tooth.$loaded) {
          allTeethLoaded = false;
        }
      });
        $timeout(function () {
            $scope.allTeethLoaded = allTeethLoaded;
        });
      
    });

    $scope.togglePrimary = function (primary) {
      var preselectedTeeth = patientOdontogramFactory.selectedTeeth;

      if ($scope.selection.teeth.length < 1) {
        _.forEach($scope.toothData, function (tooth) {
          ctrl.setToothPrimary(tooth.toothId, primary);
        });
      } else {
        _.forEach($scope.selection.teeth, function (tooth) {
          var index = preselectedTeeth.indexOf(tooth.toothId);
          var isMissingPrimary = tooth.toothId === '';
          ctrl.setToothPrimary(tooth.position, primary);
          tooth.toothId = toothSelectionService.getToothId(tooth.position);
          if (index > -1) {
            preselectedTeeth.splice(index, 1);
            if (tooth.toothId !== '') {
              preselectedTeeth.push(tooth.toothId);
            }
          } else if (isMissingPrimary && tooth.toothId !== '') {
            preselectedTeeth.push(tooth.toothId);
          }
        });
      }
      // modify the odontogram when teeth are toggled
      ctrl.setToothChart();
    };

    ctrl.setToothPrimary = function (position, primary) {
      if (!$scope.toothData[position].isSupernumerary) {
        $scope.toothData[position].isPrimary = primary;
      } else {
        // special handling for supernumerary teeth, need to set primaryLetter/permanentNumber when toggling
        if (primary) {
          var permanentToothDefinition = listHelper.findItemByFieldValue(
            ctrl.teethDefinitions.Teeth,
            'ToothId',
            $scope.toothData[position].toothId
          );
          _.forEach(ctrl.teethDefinitions.Teeth, function (tooth) {
            var foundPrimaryToothEquivelant =
              tooth.Description ===
                permanentToothDefinition.Description.replace(
                  'Permanent',
                  'Primary'
                ) && tooth.ToothStructure === 'Primary';
            if (foundPrimaryToothEquivelant) {
              $scope.toothData[position].isPrimary = primary;
              if (tooth.USNumber.length > 1) {
                $scope.toothData[position].primaryLetter = tooth.USNumber;
              }
            }
          });
        } else {
          var primaryToothDefinition = listHelper.findItemByFieldValue(
            ctrl.teethDefinitions.Teeth,
            'ToothId',
            $scope.toothData[position].toothId
          );
          _.forEach(ctrl.teethDefinitions.Teeth, function (tooth) {
            var foundPermanentToothEquivelant =
              tooth.Description ===
                primaryToothDefinition.Description.replace(
                  'Primary',
                  'Permanent'
                ) && tooth.ToothStructure === 'Permanent';
            if (foundPermanentToothEquivelant) {
              $scope.toothData[position].isPrimary = primary;
              if (tooth.USNumber > 50) {
                $scope.toothData[position].permanentNumber = tooth.USNumber;
              }
            }
          });
        }
      }
    };

    //#region Patient Watch
    var patientWatches = [];

    ctrl.setToothWatch = function () {
      _.forEach($scope.toothData, function (tooth) {
        tooth.watchIds = [];
        tooth.watchTeeth = [];
      });
      _.forEach(patientWatches, function (watch) {
        for (var i = 1; i <= 32; i++) {
          if (
            $scope.toothData[i].permanentNumber === parseInt(watch.Tooth) ||
            $scope.toothData[i].primaryLetter === watch.Tooth
          ) {
            $scope.toothData[i].watchIds.push(watch.RecordId);
            $scope.toothData[i].watchTeeth.push(watch.Tooth);
          }
        }
      });
    };

    // filter chartLedgerServices for watch(s) only
    ctrl.getPatientWatchList = function () {
      var watches = _.filter($scope.chartLedgerServices, {
        RecordType: 'Watch',
      });
      if (watches) {
        patientWatches = watches;
        ctrl.setToothWatch();
      }
    };
    ctrl.getPatientWatchList();

    $scope.$watch(
      'chartLedgerServices',
      function (nv, ov) {
        if (!_.isEqual(nv, ov)) {
          ctrl.getPatientWatchList();
          ctrl.addDrawTypeData(
            $scope.chartLedgerServices,
            $scope.conditions,
            ctrl.serviceCodes,
            ctrl.drawTypes,
            ctrl.teethDefinitions
          );
        } else {
          ctrl.dataRetrieved = true;
        }
      },
      true
    );

    $scope.$on('soar:service-codes-loaded', function () {
      ctrl.addDrawTypeData(
        $scope.chartLedgerServices,
        $scope.conditions,
        ctrl.serviceCodes,
        ctrl.drawTypes,
        ctrl.teethDefinitions
      );
    });

    ctrl.parseServices = function (services) {
      $scope.parsedLedgerServices = {};
      var toothServices = {};
      _.forEach(services, function (service) {
        var teeth = utilities.getTeethInRange(service.Tooth);
        service.$$DrawTypeOrderGroup = utilities.getOrderGroup(service);

        _.forEach(teeth, function (tooth) {
          if (!toothServices[tooth]) {
            toothServices[tooth] = [];
          }
          // if odontogram has draw type ordering, set it on the service for ordering of draw types in odontogramTooth-directive.js
          var odontogramToothDto = listHelper.findItemByFieldValue(
            $scope.patientOdontogram.Data.Teeth,
            'ToothNumber',
            tooth
          );
          if (odontogramToothDto) {
            _.forEach(
              odontogramToothDto.OrderedDrawItems,
              function (item, key) {
                if (item.ItemId === service.RecordId) {
                  service.$$DrawTypeOrder = key;
                }
              }
            );
          }
          toothServices[tooth].push(_.cloneDeep(service));
        });
      });

      var tempParsedLedgerServices = {};
      _.forEach($scope.toothData, function (data, key) {
        var parsedLedgerServicesKey = {};
        parsedLedgerServicesKey[data.primaryLetter] =
          toothServices[data.primaryLetter];
        parsedLedgerServicesKey[data.permanentNumber] =
          toothServices[data.permanentNumber];

        tempParsedLedgerServices[key] = parsedLedgerServicesKey;
      });
      $scope.parsedLedgerServices = tempParsedLedgerServices;
    };

    ctrl.addDrawTypeData = function (
      ledgerServices,
      conditions,
      serviceCodes,
      drawTypes,
      teethDefinitions
    ) {
      // ledgerServices is a scope variable, passed by reference. Clone, process, set it to avoid multiple digests and watch firing.
      var tempLedgerServices = _.cloneDeep(ledgerServices);

      if (
        _.isEmpty(tempLedgerServices) ||
        _.isEmpty(drawTypes) ||
        _.isEmpty(teethDefinitions) ||
        _.isEmpty(conditions) ||
        _.isEmpty(serviceCodes)
      ) {
        return;
      }

      $scope.bridgeData = {};
      var tempBridgeData = {};

      _.forEach(tempLedgerServices, function (service) {
        var lookupList;
        var lookupField;
        var lookupId;
        var IsDeleted;
        switch (service.RecordType) {
          case 'Condition':
            lookupList = conditions;
            lookupField = 'ConditionId';
            lookupId = service.ConditionId;
            IsDeleted = service.IsDeleted;
            break;
          case 'ServiceTransaction':
            lookupList = serviceCodes;
            lookupField = 'ServiceCodeId';
            lookupId = service.ServiceCodeId;
            IsDeleted = service.IsDeleted;
            break;
          default:
            return;
        }

        var conditionOrCode = listHelper.findItemByFieldValue(
          lookupList,
          lookupField,
          lookupId
        );
        if (
          IsDeleted === false &&
          conditionOrCode &&
          conditionOrCode.DrawTypeId
        ) {
          service.DrawType = listHelper.findItemByFieldValue(
            drawTypes,
            'DrawTypeId',
            conditionOrCode.DrawTypeId
          );

          if (service.DrawType && service.DrawType.Description) {
            var desc = service.DrawType.Description.toLowerCase();

            var type = null;
            if (_.includes(desc, 'bridge')) {
              type = _.includes(desc, 'pontic') ? 'pontic' : 'abutment';
            } else if (_.includes(desc, 'implant')) {
              type = 'implant';
            } else if (desc === 'missing tooth' || desc === 'extracted tooth') {
              type = 'missing';
            }

            if (type) {
              var tooth = service.Tooth.toString();
              var teethInRange = utilities.getTeethInRange(tooth);
              _.forEach(teethInRange, function (t) {
                var tempData = tempBridgeData[t];
                if (!tempData || tempData.date < service.CreationDate) {
                  tempBridgeData[t] = {
                    type: type,
                    date: service.CreationDate,
                  };
                }
              });
            }
          }
        }

        if (service.SurfacesList && service.Tooth !== 0) {
          // add detailed surface info to service object
          var summarySurfaces = service.SurfacesList.split(',');

          var match = _.find(ctrl.teethDefinitions.Teeth, {
            USNumber: _.toString(service.Tooth),
          });
          if (!_.isEmpty(match)) {
            var summarySurfacesForTooth = match.SummarySurfaceAbbreviations;

            service.SummarySurfaces = listHelper.findAllByPredicate(
              ctrl.teethDefinitions.SummarySurfaces,
              function (summarySurface) {
                return (
                  summarySurfacesForTooth.indexOf(
                    summarySurface.SummarySurfaceAbbreviation
                  ) !== -1 &&
                  summarySurfaces.indexOf(
                    summarySurface.SummarySurfaceAbbreviation
                  ) !== -1
                );
              }
            );
          }
        }
      });

      var chartedTeeth = '';
      _.forEach($scope.toothData, function (tooth) {
        if (tooth.isSupernumerary) {
          return;
        }
        if (tooth.isPrimary) {
          chartedTeeth += tooth.primaryLetter + ';';
        } else {
          chartedTeeth += tooth.permanentNumber + ';';
        }
      });

      // Remove last separator
      chartedTeeth = chartedTeeth.substring(0, chartedTeeth.lastIndexOf(';'));
      $scope.bridgeData = utilities.calculateBridgeData(
        tempBridgeData,
        chartedTeeth
      );

      ctrl.parseServices(tempLedgerServices);
      $timeout(function () {
        ctrl.dataRetrieved = true;
      });
      ledgerServices = tempLedgerServices;
    };

    //#endregion

    //#region persist toothChart
    $scope.odontogramInitialized = false;
    ctrl.$onInit = function () {
      ctrl.toothChartInitialized = false;
      ctrl.savedSnapshot = null;
      ctrl.dataRetrieved = false;
      ctrl.getDrawTypes()
          .then(function () {
            return referenceDataService
              .getData(referenceDataService.entityNames.serviceCodes)
              .then(function (serviceCodes) {
                ctrl.serviceCodes = serviceCodes;
              });
          })
          .then(function () {
            return staticData.TeethDefinitions().then(function (res) {
              if (res && res.Value) {
                ctrl.teethDefinitions = res.Value;
                utilities.setTeethDefinitions(res.Value);
                ctrl.addDrawTypeData(
                  $scope.chartLedgerServices,
                  $scope.conditions,
                  ctrl.serviceCodes,
                  ctrl.drawTypes,
                  ctrl.teethDefinitions
                );
              }
            });
          });
    };

    /**
     * Get draw types resources.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getDrawTypes = function () {
      return drawTypesService.getAll().then(drawTypes => {
        ctrl.drawTypes = drawTypes;
        ctrl.addDrawTypeData(
          $scope.chartLedgerServices,
          $scope.conditions,
          ctrl.serviceCodes,
          ctrl.drawTypes,
          ctrl.teethDefinitions
        );
      })
    };

    ctrl.initToothChart = function () {
      if (_.isEmpty($scope.patientOdontogram.Data.Teeth)) {
        return;
      }
      // check for supernumerary teeth
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          var teethDefinitions = res.Value.Teeth;
          var adjustSnapshot = false;
          _.forEach($scope.patientOdontogram.Data.Teeth, function (tooth) {
            if (
              tooth.ToothNumber > 32 ||
              (isNaN(parseInt(tooth.ToothNumber)) &&
                tooth.ToothNumber.length > 1)
            ) {
              var snt = listHelper.findItemByFieldValue(
                teethDefinitions,
                'USNumber',
                tooth.ToothNumber
              );
              ctrl.addSupernumeraryToToothDataArray(snt);
              adjustSnapshot = true;
            }
          });
          ctrl.addDrawTypeData(
            $scope.chartLedgerServices,
            $scope.conditions,
            ctrl.serviceCodes,
            ctrl.drawTypes,
            ctrl.teethDefinitions
          );
          ctrl.toothChartInitialized = true;
          if (adjustSnapshot) {
            ctrl.updateArchWidths();
          }
        }
      });

      // set all position to primary
      _.forEach($scope.toothData, function (tooth) {
        tooth.isPrimary = true;
      });

      for (var i = 0; i < $scope.patientOdontogram.Data.Teeth.length; i++) {
        var itemIndex = 0;
        var toothAtPosition = $scope.patientOdontogram.Data.Teeth[i];
        itemIndex = $scope.getIndexById(toothAtPosition.ToothNumber, true);
        if (itemIndex > 0) {
          ctrl.setToothPrimary(itemIndex, false);
        } else {
          itemIndex = $scope.getIndexById(toothAtPosition.ToothNumber, false);
          if (itemIndex >= 0) {
            ctrl.setToothPrimary(itemIndex, true);
          }
        }
      }
    };

    // rebuilds the currentToothChart when IsPrimary is toggled
    ctrl.setToothChart = function () {
      var chartedTeeth = [];
      _.forEach($scope.toothData, function (tooth) {
        if (tooth.isPrimary) {
          if (tooth.primaryLetter !== '') {
            chartedTeeth.push(tooth.primaryLetter);
          }
        } else {
          if (tooth.permanentNumber !== '') {
            chartedTeeth.push(tooth.permanentNumber);
          }
        }
      });

      // store the current toothChart
      var previousToothChart = _.cloneDeep(ctrl.currentToothChart);
      ctrl.currentToothChart.length = 0;
      _.forEach(chartedTeeth, function (th) {
        var prevTooth = listHelper.findItemByFieldValue(
          previousToothChart,
          'ToothNumber',
          th
        );
        var toothObject = {};
        toothObject.ToothNumber = th.toString();
        toothObject.OrderedDrawItems = prevTooth
          ? prevTooth.OrderedDrawItems
          : null;
        ctrl.currentToothChart.push(toothObject);
      });

      // only call the save function if not currently saving and currentToothChart doesn't match patientOdontogram.Teeth
      if (
        !$scope.savingOdontogram &&
        !_.isEqual(ctrl.currentToothChart, $scope.patientOdontogram.Data.Teeth)
      ) {
        $scope.patientOdontogram.Data.Teeth = _.cloneDeep(
          ctrl.currentToothChart
        );
        ctrl.saveOdontogram();
      }
    };

    // check to see if current toothChart matches saved toothChart
    ctrl.compareToothChart = function () {
      // this needs to be left as angular.equals to ignore $-prefixed properties that may exist on one
      // object but not the other.  This is enforced by a unit test.
      if (
        !angular.equals(
          ctrl.currentToothChart,
          $scope.patientOdontogram.Data.Teeth
        )
      ) {
        $scope.patientOdontogram.Data.Teeth = _.cloneDeep(
          ctrl.currentToothChart
        );
        ctrl.saveOdontogram();
      }
    };

    //#endregion

    //#region persist odontogram to storage
    ctrl.saveOdontogram = function (suppressMessage) {
      if ($scope.hasEditOdontogramAccess && !$scope.savingOdontogram) {
        $scope.savingOdontogram = true;
        if ($scope.editing) {
          patientServices.Odontogram.update(
            { Id: $scope.personId },
            $scope.patientOdontogram.Data,
            ctrl.odontogramSaveSuccess,
            function () {
              ctrl.odontogramSaveFailure(suppressMessage);
            }
          );
        } else {
          patientServices.Odontogram.create(
            { Id: $scope.personId },
            $scope.patientOdontogram.Data,
            ctrl.odontogramSaveSuccess,
            function () {
              ctrl.odontogramSaveFailure(suppressMessage);
            }
          );
        }
      }
    };

    ctrl.odontogramSaveSuccess = function (res) {
      $scope.patientOdontogram.Data = res.Value;
      $scope.savingOdontogram = false;
      $scope.editing = true;
      ctrl.compareToothChart();
      if (ctrl.savedSnapshot) {
        ctrl.savedSnapshot = ctrl.newSnapshotData;
      }
    };

    //TODO what message should we show if fail
    ctrl.odontogramSaveFailure = function (suppressMessage) {
      if (!suppressMessage) {
        toastrFactory.error(
          localize.getLocalizedString(
            'An error occurred while saving the odontogram.'
          ),
          localize.getLocalizedString('Server Error')
        );
      }
      $scope.savingOdontogram = false;
    };

    //#endregion

    $scope.$watch(
      'patientOdontogram',
      function (nv) {
        // this only happens once
        if (nv && $scope.odontogramInitialized === false) {
          if (_.isEmpty($scope.patientOdontogram.Data.Teeth)) {
            var teeth = [];
            for (var i = 1; i < 33; i++) {
              teeth.push({
                OrderedDrawItems: null,
                ToothNumber: i.toString(),
              });
            }
            $scope.patientOdontogram.Data.Teeth = teeth;
          }

          // store the current toothChart on init
          ctrl.currentToothChart = _.cloneDeep(
            $scope.patientOdontogram.Data.Teeth
          );

          // set the odontogram to the current toothChart on init
          ctrl.initToothChart();

          // determine whether creating or editing odontogram
          $scope.editing =
            !_.isUndefined($scope.patientOdontogram.Data.OdontogramId) &&
            !_.isNull($scope.patientOdontogram.Data.OdontogramId);

          $scope.odontogramInitialized = true;
        }
      },
      true
    );

    //#endregion

    $scope.getIndexById = function (toothPosition, permanent) {
      var retValue = -1;
      _.forEach($scope.toothData, function (tooth, key) {
        if (permanent) {
          if (
            tooth.permanentNumber &&
            tooth.permanentNumber.toString() === toothPosition.toString()
          ) {
            retValue = parseInt(key);
          }
        }
        if (!permanent) {
          if (
            tooth.primaryLetter &&
            tooth.primaryLetter.toString() === toothPosition.toString()
          ) {
            retValue = parseInt(key);
          }
        }
      });
      return retValue;
    };

    ctrl.updateArchWidths = function () {
      var upperTeeth = 0;
      var lowerTeeth = 0;

      _.forEach($scope.toothData, function (tooth) {
        if (tooth.arch === 'l') {
          lowerTeeth++;
        } else if (tooth.arch === 'u') {
          upperTeeth++;
        }
      });

      var tempUpperArchWidth = ctrl.calculateArchWidth(upperTeeth);
      var tempLowerArchWidth = ctrl.calculateArchWidth(lowerTeeth);

      if (
        $scope.upperArchWidth !== tempUpperArchWidth ||
        $scope.lowerArchWidth !== tempLowerArchWidth
      ) {
        $scope.upperArchWidth = tempUpperArchWidth;
        $scope.lowerArchWidth = tempLowerArchWidth;
        var upperArchWidth = $scope.upperArchWidth + 'px';
        var lowerArchWidth = $scope.lowerArchWidth + 'px';

        angular.element('#upperArch .odoTooth').css('width', upperArchWidth);
        angular.element('#lowerArch .odoTooth').css('width', lowerArchWidth);

        if (upperTeeth > 22) {
          ctrl.adjustTextSize('#upperArch', upperArchWidth);
        }
        if (lowerTeeth > 22) {
          ctrl.adjustTextSize('#lowerArch', lowerArchWidth);
        }
      }
    };

    ctrl.adjustTextSize = function (archLocator, toothWidth) {
      _.forEach(
        angular.element(
          archLocator + ' .odoTooth>g:first-of-type>g:first-of-type text'
        ),
        function (elem) {
          var ngElem = angular.element(elem);
          if (!ngElem.attr('data-base-transform')) {
            ngElem.attr('data-base-transform', ngElem.attr('transform'));
          }
          var width = ngElem.width();
          var scale = Math.sqrt(48 / parseFloat(toothWidth.replace('px', '')));
          var offset = (width * (1 - scale)) / 2;
          var transform = ngElem.attr('data-base-transform');

          ngElem.attr(
            'transform',
            'translate(' + offset + ' 0) ' + transform + 'scale(' + scale + ')'
          );
        }
      );
    };

    ctrl.calculateArchWidth = function (numTeeth) {
      // teeth were wrapping at smaller resolutions, making this more responsive for lower resolutions
      var delta = 0;
      var retVal = '';

      if (window.innerWidth <= 1366 && window.innerWidth >= 1211) {
        delta = 6.5;
        retVal = Math.round((813.5 - delta * numTeeth) / numTeeth);
      } else if (window.innerWidth >= 1025 && window.innerWidth <= 1210) {
        delta = 6.5;
        retVal = Math.round((708.27 - delta * numTeeth) / numTeeth);
      } else if (window.innerWidth <= 1024) {
        delta = 7.5;
        retVal = Math.round((624.63 - delta * numTeeth) / numTeeth);
      } else {
        delta = 3.5;
        retVal = Math.round((813.5 - delta * numTeeth) / numTeeth);
      }

      return retVal;
    };

    $scope.$watch(
      function () {
        return $window.innerWidth;
      },
      function (value) {
        $scope.windowWidth = value;
        ctrl.updateArchWidths();
      },
      true
    );

    angular.element($window).bind('resize', function () {
      $scope.$apply();
    });

    // gets called by odontogramTooth-directive when user re-orders draw types, need to save odontogram
    $scope.drawingReorderingHandler = function (odontogramToothDto) {
      _.forEach($scope.patientOdontogram.Data.Teeth, function (tooth) {
        if (tooth.ToothNumber === odontogramToothDto.ToothNumber) {
          tooth.OrderedDrawItems = odontogramToothDto.OrderedDrawItems;
        }
      });
      ctrl.currentToothChart = _.cloneDeep($scope.patientOdontogram.Data.Teeth);
      ctrl.saveOdontogram();
    };
  }

  OdontogramController.prototype = Object.create(BaseCtrl);
})();

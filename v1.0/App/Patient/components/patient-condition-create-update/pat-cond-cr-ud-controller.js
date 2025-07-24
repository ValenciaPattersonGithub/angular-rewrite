(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller(
      'PatientConditionCreateUpdateController',
      PatientConditionCreateUpdateController
    );

  PatientConditionCreateUpdateController.$inject = [
    '$scope',
    '$location',
    '$attrs',
    '$filter',
    'StaticData',
    '$rootScope',
    'PatientOdontogramFactory',
    'patSecurityService',
    'ListHelper',
    'ConditionsService',
    'PatientServices',
    'PatientLogic',
    '$routeParams',
    'localize',
    'toastrFactory',
    'SaveStates',
    'TreatmentPlansFactory',
    'UserServices',
    'UsersFactory',
    '$timeout',
    'PatientServicesFactory',
    'PatientConditionsFactory',
    '$q',
  ];

  function PatientConditionCreateUpdateController(
    $scope,
    $location,
    $attrs,
    $filter,
    staticData,
    $rootScope,
    patientOdontogramFactory,
    patSecurityService,
    listHelper,
    conditionsService,
    patientServices,
    patientLogic,
    $routeParams,
    localize,
    toastrFactory,
    saveStates,
    treatmentPlansFactory,
    userServices,
    usersFactory,
    $timeout,
    patientServicesFactory,
    patientConditionsFactory,
    $q
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.maxDate = moment(new Date());
      $scope.dataHasChanged = false;
      $scope.formIsValid = false;
      $scope.loading = true;
      $scope.isEdit = $attrs.editing ? JSON.parse($attrs.editing) : false;
      $scope.originalActiveTeeth = [];
      $scope.teethDefinitions = patientOdontogramFactory.TeethDefinitions;
      $scope.roots = $scope.teethDefinitions.Roots;
      $scope.patTeeth = new kendo.data.DataSource({
        data: patientOdontogramFactory.TeethDefinitions.Teeth,
      });
      $scope.validDate = true;
      $scope.personId = $routeParams.patientId;
      $scope.errorMessage = false;
      patientLogic.GetPatientById($scope.personId).then(function (patientInfo) {
        $scope.patientInfo = patientInfo;
        $scope.getChartButton(patientOdontogramFactory.selectedChartButtonId);
      });
      ctrl.setToothData();
      $scope.activeQuadrant = {};
      $scope.activeSurfaces = [];
      $scope.activeArch = {};
      ctrl.originalSurfaces = [];
      ctrl.originalRoots = [];
      ctrl.isToothModified = false;
      ctrl.isSurfaceModified = false;
      ctrl.isRootModified = false;
      ctrl.isDateModified = false;
      ctrl.isStatusModified = false;
      ctrl.getConditionStatuses();
      // need to load kendo-multi-select on another thread to keep from getting '$digest already in progress', the second time this controller is instantiated
      $timeout(function () {
        $scope.loadKendoWidgets = true;
      });
      $scope.detailedActiveTeeth = [];
      $scope.teethSelectOptions = {
        placeholder: 'Select teeth...',
        dataSource: $scope.patTeeth,
        dataTextField: 'USNumber',
        dataValueField: 'USNumber',
        valuePrimitive: true,
        autoBind: false,
      };
    };

    //#region get
    $scope.getChartButton = function (buttonId) {
      conditionsService.get(buttonId).then(
        function (res) {
          ctrl.success(res);
        },
        function () {
          ctrl.failure();
        }
      );
    };

    $scope.ConditionStatus = [];
    // To fill the data to dropdown
    ctrl.getConditionStatuses = function () {
      staticData.ConditionStatus().then(function (res) {
        if (res && res.Value) {
          $scope.ConditionStatus = res.Value;
        }
      });
    };
    // status is changed
    ctrl.serviceTransactionConditionStatusIdChanged = function (nv, ov) {
      if (_.isNil(nv)) {
        $scope.Status = 1;
      }
      $scope.Status = nv;
      if (!_.isNil(nv)) {
        // condition is 'Resolved change to current date'
        if (ov != undefined) {
          if (nv == 2) {
            var dateNow = moment().format('MM/DD/YYYY');
            $scope.patientCondition.ConditionDate = $filter('setDateTime')(
              dateNow
            );
          }
        }
        if (
          ctrl.originalPatientCondition &&
          ctrl.originalPatientCondition.Status &&
          nv &&
          nv.toString() == ctrl.originalPatientCondition.Status.toString()
        ) {
          $scope.saving = true;
          ctrl.isStatusModified = false;
          ctrl.saveDisable();
        } else {
          ctrl.isStatusModified = true;
          ctrl.saveDisable();
        }
      }
    };
    $scope.$watch('patientCondition.Status', (nv, ov) =>
      ctrl.serviceTransactionConditionStatusIdChanged(nv, ov)
    );

    ctrl.success = function (res) {
      if (res && res.Value) {
        $scope.selectedChrtBtn = res.Value;
        $scope.area = res.Value.AffectedAreaId;
        // special handling for some areas
        switch ($scope.area) {
          case 1:
            $scope.activeTeeth = [];
            break;
          case 3:
            //
            break;
          case 4:
            $scope.formIsValid = false;
            break;
        }
        if ($scope.isEdit) {
          $scope.patientCondition = ctrl.editPatientCondition();
        } else {
          $scope.patientCondition = ctrl.createPatientCondition(null, true);
          ctrl.setActiveTeeth();
        }
        $scope.loading = false;
      }
    };

    ctrl.failure = function (err) {};

    //#endregion

    //#region crud

    ctrl.createPatientCondition = function (tooth, blank) {
      var dateNow = moment().format('MM/DD/YYYY');
      var conditionDate = $filter('setDateTime')(dateNow);
      var selectedSurfaces = [];
      var status = _.isNil($scope.Status) ? 1 : $scope.Status;
      return {
        PatientConditionId: null,
        PatientId: $scope.personId,
        ConditionId: $scope.selectedChrtBtn.ConditionId,
        ConditionDate: blank
          ? conditionDate
          : $scope.patientCondition.ConditionDate,
        Tooth: blank ? null : tooth.USNumber,
        Surfaces: blank ? null : $scope.getselectedSurfaces(tooth),
        Roots: blank ? null : $scope.getrootsForTooth(tooth),
        Status: status,
        IsActive: true,
      };
    };

    $scope.patientConditionSuccess = function (res) {
      $scope.saving = false;
      $scope.canCloseModal = true;
      var msg;
      if ($scope.editMode) {
        msg = localize.getLocalizedString('{0} {1}', [
          'Your patient condition',
          'has been updated.',
        ]);
      } else {
        msg = localize.getLocalizedString('{0} {1}', [
          'Your patient condition',
          'has been created.',
        ]);
      }
      toastrFactory.success(msg, localize.getLocalizedString('Success'));
      var savedConditions = res && res.Value ? res.Value : [];
      $scope.$emit('soar:chart-services-reload-ledger');
      $scope.close();
    };

    $scope.savePatientCondition = function () {
      $scope.validateForm();
      if ($scope.formIsValid) {
        $scope.saving = true;
        if ($scope.editMode) {
          ctrl.updatePatientCondition();
        } else {
          var params = {
            Id: $scope.patientCondition.PatientId,
          };
          // building a temporary list of patient conditions dtos based on selected teeth/surfaces
          var patientConditionsTemp = [];
          angular.forEach($scope.activeTeeth, function (tooth) {
            var toothItem = ctrl.getToothDetails(tooth);
            let patientCondition = ctrl.createPatientCondition(
              toothItem,
              false
            );
            delete patientCondition.PatientConditionId;
            patientConditionsTemp.push(patientCondition);
          });
          patientServices.Conditions.save(
            params,
            patientConditionsTemp,
            $scope.patientConditionSuccess,
            function () {
              $scope.saving = false;
            }
          );
        }
      }
    };

    ctrl.editPatientCondition = function () {
      $scope.editMode = true;
      $scope.patientConditionId =
        patientConditionsFactory.ActivePatientConditionId;
      if ($scope.patientConditionId) {
        patientConditionsFactory
          .getById($scope.personId, $scope.patientConditionId)
          .then(function (res) {
            $scope.patientCondition = res.Value;
            $scope.patientCondition.AffectedAreaId = $scope.area;
            // set tooth info
            ctrl.setToothInfo($scope.patientCondition.Tooth);
            // set surfaces
            ctrl.setActiveSurfaces(
              $scope.patientCondition.AffectedAreaId,
              $scope.patientCondition.Surfaces
            );
            // set roots
            ctrl.setActiveRoots(
              $scope.patientCondition.AffectedAreaId,
              $scope.patientCondition.Roots
            );
            // convert the date to local time before updating
            var conditionDate = $scope.patientCondition.ConditionDate
              ? moment.utc($scope.patientCondition.ConditionDate).toDate()
              : moment();
            $scope.patientCondition.ConditionDate = conditionDate;
            // backup needed?
            ctrl.originalPatientCondition = angular.copy(
              $scope.patientCondition
            );
          });
      }
      // reset ActiveServiceTransactionId to null
      patientConditionsFactory.setActivePatientConditionId(null);
      return $scope.patientCondition;
    };

    ctrl.updatePatientCondition = function () {
      // add changes from surfaces, roots , tooth
      ctrl.captureConditionToothInfo();
      // set object state
      $scope.patientCondition.ObjectState = saveStates.Update;
      patientConditionsFactory
        .update($scope.patientCondition)
        .then(function (res) {
          $scope.saving = false;
          $scope.canCloseModal = true;
          var savedPatientConditions = res.Value;
          if (savedPatientConditions) {
            // NOTE TODO the next two should be replaced by a property on the factory but that should be part of an nfr
            $scope.$emit('soar:chart-services-reload-ledger');
            $scope.close();
            $scope.saving = false;
          }
        });
    };

    //#endregion

    //#region watches

    $scope.$watch('validDate', function (nv, ov) {
      if (
        nv &&
        ctrl.originalPatientCondition &&
        ctrl.originalPatientCondition.ConditionDate
      ) {
        ctrl.checkDateChange();
      }
      $scope.validateForm();
    });

    $scope.$watch('patientCondition.ConditionDate', function (nv, ov) {
      if (
        nv &&
        ctrl.originalPatientCondition &&
        ctrl.originalPatientCondition.ConditionDate
      ) {
        ctrl.checkDateChange();
      }
      $scope.validateForm();
    });

    ctrl.checkDateChange = function () {
      ctrl.originalPatientCondition.ConditionDate.setHours(0, 0, 0, 0);
      $scope.patientCondition.ConditionDate.setHours(0, 0, 0, 0);
      if (
        _.isEqual(
          ctrl.originalPatientCondition.ConditionDate,
          $scope.patientCondition.ConditionDate
        )
      ) {
        $scope.saving = true;
        ctrl.isDateModified = false;
        ctrl.saveDisable();
      } else {
        ctrl.isDateModified = true;
        ctrl.saveDisable();
      }
    };

    $scope.$watch(
      'activeTeeth',
      function (nv, ov) {
        // special handling for range of teeth because in some instances they are split in the rot directive
        if (
          $scope.currentServiceCode &&
          $scope.currentServiceCode.UseCodeForRangeOfTeeth === true &&
          nv &&
          nv.length > 1 &&
          ov &&
          ov.length === 1 &&
          nv.length !== ov.length
        ) {
          ov = ov[0].split(',');
          if (
            $scope.originalActiveTeeth &&
            $scope.originalActiveTeeth.length == 0 &&
            $scope.originalActiveTeeth != null
          ) {
            $scope.originalActiveTeeth = angular.copy(ov);
          }
        }
        if (
          nv &&
          ov &&
          nv.toString() != ov.toString() &&
          nv.length > 0 &&
          nv.toString() != $scope.originalActiveTeeth.toString()
        ) {
          $scope.dataHasChanged = true;
        } else if (
          $scope.originalActiveTeeth &&
          nv &&
          nv.toString() == $scope.originalActiveTeeth.toString()
        ) {
          $scope.dataHasChanged = false;
        }
        if (
          ctrl.originalPatientCondition &&
          ctrl.originalPatientCondition.Tooth &&
          nv &&
          nv.toString() == ctrl.originalPatientCondition.Tooth.toString()
        ) {
          $scope.saving = true;
          ctrl.isToothModified = false;
          ctrl.saveDisable();
        } else {
          ctrl.isToothModified = true;
          ctrl.saveDisable();
        }
        if (nv) {
          $scope.detailedActiveTeeth.length = 0;
          ctrl.setToothData();
        }
        $scope.validateForm();
      },
      true
    );

    $scope.$watch('activeSurfaces', function (nv, ov) {
      if (nv && nv.length != 0) {
        $scope.dataHasChanged = true;
      }
      if ($scope.errorMessage && $scope.activeSurfaces.length > 1) {
        $scope.errorMessage = false;
      }
    });

    $scope.$watch(
      'roots',
      function (nv, ov) {
        if (nv && ctrl.originalRoots.length > 0) {
          if (angular.equals(ctrl.originalRoots, nv)) {
            $scope.saving = true;
            ctrl.isRootModified = false;
            ctrl.saveDisable();
          } else {
            ctrl.isRootModified = true;
            ctrl.saveDisable();
          }
        }
        $scope.validateForm();
      },
      true
    );

    $scope.$watch(
      'surfaces',
      function (nv, ov) {
        if (nv && ctrl.originalSurfaces.length > 0) {
          if (
            angular.equals(ctrl.originalSurfaces, nv) &&
            $scope.saving === false
          ) {
            $scope.saving = true;
            ctrl.isSurfaceModified = false;
            ctrl.saveDisable();
          } else {
            ctrl.isSurfaceModified = true;
            ctrl.saveDisable();
          }
        }
        if (
          $scope.activeSurfaces.length > 0 &&
          ctrl.originalSurfaces.length === 0
        ) {
          ctrl.originalSurfaces = angular.copy(nv);
          $scope.saving = true;
        }
        $scope.validateForm();
      },
      true
    );

    //#endregion

    //#region teeth, quad, roots, surfaces, arches, etc.

    $scope.surfaces = [
      {
        SurfaceText: 'M',
        SurfaceAbbreviation: 'M',
        SurfaceName: 'Mesial',
      },
      {
        SurfaceText: 'O/I',
        SurfaceAbbreviation: 'O/I',
        SurfaceName: 'Occl/Incsl',
      },
      {
        SurfaceText: 'D',
        SurfaceAbbreviation: 'D',
        SurfaceName: 'Distal',
      },
      {
        SurfaceText: 'B/F',
        SurfaceAbbreviation: 'B/F',
        SurfaceName: 'Buccal/Facl',
      },
      {
        SurfaceText: 'L',
        SurfaceAbbreviation: 'L',
        SurfaceName: 'Lingual',
      },
      {
        SurfaceText: 'B/F5',
        SurfaceAbbreviation: 'B5/F5',
        SurfaceName: 'Buccal/Facl V',
      },
      {
        SurfaceText: 'L5',
        SurfaceAbbreviation: 'L5',
        SurfaceName: 'Lingual V',
      },
    ];

    $scope.quadrants = [
      {
        QuadrantName: 'UR',
      },
      {
        QuadrantName: 'LR',
      },
      {
        QuadrantName: 'UL',
      },
      {
        QuadrantName: 'LL',
      },
    ];

    $scope.arches = [
      {
        ArchName: 'UA',
      },
      {
        ArchName: 'LA',
      },
    ];

    // k-change on kendo-multi-select uses this to keep activeTeeth updated
    // only allow one tooth choice on edit of service or condition
    $scope.activeTeethUpdated = function (e) {
      var selectedTeeth = this.value();
      if ($scope.isEdit && selectedTeeth.length > 1) {
        $scope.activeTeeth = selectedTeeth.slice(-1)[0];
        this.dataSource.filter({});
        this.value($scope.activeTeeth);
      } else {
        $scope.activeTeeth = this.value();
      }
      $scope.validateForm();
      $scope.$apply();
    };

    // capture surface root quadrant info
    ctrl.captureConditionToothInfo = function () {
      // set tooth number based on active teeth
      var toothItem = null;
      if ($scope.activeTeeth.length > 0) {
        $scope.patientCondition.Tooth = $scope.activeTeeth[0];
        toothItem = ctrl.getToothDetails($scope.patientCondition.Tooth);
      }
      switch ($scope.patientCondition.AffectedAreaId) {
        case 3:
          var roots = $scope.getrootsForTooth(toothItem);
          $scope.patientCondition.Roots = roots ? roots : null;
          break;
        case 4:
          var surfaces = $scope.getselectedSurfaces(toothItem);
          $scope.patientCondition.Surfaces = surfaces ? surfaces : null;
          break;
      }
    };

    ctrl.setActiveRoots = function (affectedAreaId, roots) {
      if (affectedAreaId === 3) {
        if (roots) {
          var selectedRoots = roots.split(',');
          angular.forEach(selectedRoots, function (root) {
            // find root in activeRoots
            angular.forEach($scope.roots, function (rt) {
              rt.selected = _.isUndefined(rt.selected) ? false : rt.selected;
              var contains = rt.RootAbbreviation === root ? true : false;
              if (!rt.selected) {
                if (contains) {
                  rt.selected = true;
                }
              }
            });
          });
          if (ctrl.originalRoots.length === 0) {
            ctrl.originalRoots = angular.copy($scope.roots);
          }
        }
      }
    };

    // set active surfaces
    ctrl.setActiveSurfaces = function (affectedAreaId, surface) {
      if (affectedAreaId === 4) {
        if (surface) {
          var selectedSurfaces = surface.split(',');
          angular.forEach(selectedSurfaces, function (surface) {
            angular.forEach($scope.surfaces, function (sfc) {
              sfc.selected = _.isUndefined(sfc.selected) ? false : sfc.selected;
              // split surface abbreviations by /
              var surfaceAbbreviations = sfc.SurfaceAbbreviation.split('/');
              angular.forEach(surfaceAbbreviations, function (sfca) {
                if (sfca === surface) var contains = sfca === surface;
                if (contains) {
                  sfc.selected = true;
                  $scope.activeSurfaces.push(sfc);
                }
              });
            });
          });
        }
      }
    };

    // populate active tooth
    ctrl.setToothInfo = function (tooth) {
      // set active teeth
      $scope.activeTeeth = [];
      if (tooth) {
        $scope.activeTeeth.push(tooth);
      }
      ctrl.setToothData();
    };

    // capture surface root quadrant info
    ctrl.captureToothInfo = function (serviceTransaction) {
      // set tooth number based on active teeth
      var toothItem = null;
      if ($scope.activeTeeth.length > 0) {
        if (
          angular.isUndefined($scope.serviceTransaction.UseCodeForRangeOfTeeth)
        ) {
          var serviceCode = listHelper.findItemByFieldValue(
            $scope.serviceCodes,
            'ServiceCodeId',
            $scope.serviceTransaction.ServiceCodeId
          );
          if (serviceCode) {
            $scope.serviceTransaction.UseCodeForRangeOfTeeth =
              serviceCode.UseCodeForRangeOfTeeth;
          }
        }
        $scope.serviceTransaction.Tooth = $scope.serviceTransaction
          .UseCodeForRangeOfTeeth
          ? $scope.activeTeeth.join(',')
          : $scope.activeTeeth[0];
        toothItem = ctrl.getToothDetails($scope.serviceTransaction.Tooth);
      }
      switch ($scope.serviceTransaction.AffectedAreaId) {
        case 3:
          var roots = $scope.getrootsForTooth(toothItem);
          $scope.serviceTransaction.Roots = roots ? roots : null;
          break;
        case 4:
          var surfaces = $scope.getselectedSurfaces(toothItem);
          $scope.serviceTransaction.Surface = surfaces ? surfaces : null;
          break;
      }
    };

    ctrl.setActiveTeeth = function () {
      var activeTeeth = [];
      if ($scope.serviceTransaction && $scope.serviceTransaction.Tooth) {
        activeTeeth.push($scope.serviceTransaction.Tooth);
      }
      if ($scope.area != 1) {
        angular.forEach(
          patientOdontogramFactory.selectedTeeth,
          function (tooth) {
            var item = listHelper.findItemByFieldValue(
              $scope.patTeeth.options.data,
              'USNumber',
              tooth
            );
            if (item) {
              activeTeeth.push(tooth);
            }
          }
        );
      }
      $scope.activeTeeth = activeTeeth;
    };

    $scope.getrootsForTooth = function (tooth) {
      var rootsAvailable = '';
      if ($scope.activeTeeth.length != 0 && $scope.area == 3) {
        if (tooth.USNumber && tooth.RootAbbreviations) {
          angular.forEach($scope.roots, function (root) {
            var contains =
              tooth.RootAbbreviations.indexOf(root.RootAbbreviation) > -1;
            // if there is more than one tooth in $scope.activeTeeth, we need to set all roots to selected because selector will not be visible
            if ($scope.activeTeeth && $scope.activeTeeth.length > 1) {
              root.selected = true;
            }
            if (contains && root.selected) {
              rootsAvailable = rootsAvailable + root.RootAbbreviation + ',';
            }
          });
        }
      }
      rootsAvailable = rootsAvailable.substr(0, rootsAvailable.length - 1);
      return rootsAvailable;
    };

    $scope.getselectedSurfaces = function (tooth) {
      var selectedSurfaces = '';
      if ($scope.activeTeeth.length != 0 && $scope.area == 4) {
        if (tooth.USNumber && tooth.SummarySurfaceAbbreviations) {
          angular.forEach($scope.surfaces, function (surface) {
            var surfaces = surface.SurfaceAbbreviation.split('/');
            angular.forEach(surfaces, function (surf) {
              var contains =
                tooth.SummarySurfaceAbbreviations.indexOf(surf) > -1;
              if (contains && surface.selected) {
                selectedSurfaces = selectedSurfaces + surf + ',';
              }
            });
          });
        }
      }
      selectedSurfaces = selectedSurfaces.substr(
        0,
        selectedSurfaces.length - 1
      );
      return selectedSurfaces;
    };

    ctrl.getToothDetails = function (tooth) {
      return listHelper.findItemByFieldValue(
        angular.copy(patientOdontogramFactory.TeethDefinitions.Teeth),
        'USNumber',
        tooth
      );
    };

    ctrl.setToothData = function () {
      if ($scope.activeTeeth && !angular.isArray($scope.activeTeeth)) {
        $scope.activeTeeth = [$scope.activeTeeth];
      }
      angular.forEach($scope.activeTeeth, function (tooth) {
        var selectedTooth = ctrl.getToothDetails(tooth);
        $scope.detailedActiveTeeth.push(selectedTooth);
      });
      // if there is more than one tooth in $scope.activeTeeth, we need to set all roots to selected because selector will not be visible
      if (
        $scope.area === 3 &&
        $scope.activeTeeth &&
        $scope.activeTeeth.length > 1
      ) {
        var roots = '';
        angular.forEach($scope.roots, function (root) {
          root.selected = true;
          roots = roots.concat(root.RootAbbreviation + ',');
        });
        ctrl.setActiveRoots(3, roots);
      }
    };

    // get a list of teeth definitions which includes the summary surfaces info and root info
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        $scope.teethDefinitions = res.Value;
      });
    };

    //#endregion

    //#region misc

    // hitting the close x in these windows leaves the calendar widget orphaned on the screen if it is open, can't find a better way to resolve this
    $timeout(function () {
      var kendoWindow = angular
        .element('#toothCtrlsWindowPatChart')
        .data('kendoWindow');
      if (kendoWindow) {
        kendoWindow.wrapper.find('.k-i-close').click(function (e) {
          angular
            .element('.uib-datepicker-popup')
            .attr('style', 'display:none;');
        });
      }
      var kendoWindow2 = angular
        .element('#toothCtrlsWindow')
        .data('kendoWindow');
      if (kendoWindow2) {
        kendoWindow2.wrapper.find('.k-i-close').click(function (e) {
          angular
            .element('.uib-datepicker-popup')
            .attr('style', 'display:none;');
        });
      }
    }, 1000);

    $scope.close = function () {
      $scope.activeTeeth = [];
      $rootScope.$broadcast('close-patient-condition-create-update');
    };

    //#endregion

    //#region validation

    $scope.validateForm = function () {
      $scope.formIsValid = true;
      var index;
      if (
        $scope.activeTeeth &&
        $scope.activeTeeth.length == 0 &&
        $scope.area != 1
      ) {
        $scope.formIsValid = false;
        return;
      }
      if ($scope.area == 4) {
        index = listHelper.findIndexByFieldValue(
          $scope.surfaces,
          'selected',
          true
        );
        if (index == -1) {
          $scope.formIsValid = false;
          return;
        }
      }
      // roots do not display if multiple teeth, only do this validation if one
      if ($scope.area == 3) {
        if ($scope.activeTeeth && $scope.activeTeeth.length === 1) {
          index = listHelper.findIndexByFieldValue(
              $scope.roots,
              'selected',
              true
          );
          if (index == -1) {
            $scope.formIsValid = false;
            return;
          }
        } else if (!$scope.activeTeeth || $scope.activeTeeth.length === 0) {
          $scope.formIsValid = false;
          return;
        }
      }

      if (!$scope.validDate) {
        $scope.formIsValid = false;
        return;
      }
    };

    ctrl.saveDisable = function () {
      if (
        ctrl.isToothModified ||
        ctrl.isSurfaceModified ||
        ctrl.isRootModified ||
        ctrl.isDateModified ||
        ctrl.isStatusModified
      ) {
        $scope.saving = false;
      }
    };

    //#endregion
  }
})();

'use strict';
angular.module('Soar.Patient').controller('PatientConditionCrudController', [
  '$scope',
  '$routeParams',
  'toastrFactory',
  'localize',
  'teeth',
  'selectedConditionData',
  'conditions',
  'personId',
  'patientInfo',
  'providers',
  'PatientServices',
  'patientCondition',
  '$uibModalInstance',
  '$uibModal',
  'ModalFactory',
  'ListHelper',
  '$filter',
  'StaticData',
  'patSecurityService',
  '$location',
  '$rootScope',
  function (
    $scope,
    $routeParams,
    toastrFactory,
    localize,
    teeth,
    selectedConditionData,
    conditions,
    personId,
    patientInfo,
    providers,
    patientServices,
    patientCondition,
    $uibModalInstance,
    modal,
    modalFactory,
    listHelper,
    $filter,
    staticData,
    patSecurityService,
    $location,
    $rootScope
  ) {
    //#region initialization

    var ctrl = this;

    $scope.editMode = patientCondition ? true : false;

    //#region Authorization

    $scope.amfa = $scope.editMode
      ? 'soar-clin-ccond-edit'
      : 'soar-clin-ccond-add';

    ctrl.authPatientConditionCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation($scope.amfa);
    };

    ctrl.authAccess = function () {
      if (ctrl.authPatientConditionCreateAccess()) {
        $scope.hasPatientConditionCreateAccess = true;
      }
    };

    ctrl.authAccess();

    //#endregion

    $scope.savingForm = false;
    $scope.canCloseModal = true;
    $scope.maxDate = moment(new Date());

    $scope.formIsValid = true;

    $scope.previewTextColor = 'ff0000';

    //$scope.providers = $filter('filter')(providers, { IsActive: true });
    $scope.providers = providers;
    $scope.conditions = conditions;
    $scope.personId = personId;
    $scope.patientInfo = patientInfo;
    $scope.activeTooth = {};
    $scope.preSelectedTeeth = teeth;
    $scope.surfaceSelectionDisabled = true;
    $scope.rootSelectionDisabled = true;
    $scope.quadrantSelectionOnly = false;
    ctrl.preSelectedConditionData = selectedConditionData;

    //#endregion

    //#region add roots to condition
    ctrl.addRootsToCondition = function (tooth) {
      // add roots to condition if applicable
      var roots = null;
      if (
        tooth &&
        tooth.Roots &&
        tooth.Roots.length > 0 &&
        !$scope.rootSelectionDisabled
      ) {
        roots = tooth.Roots;
      }
      return roots;
    };

    //#endregion

    // populating selectedTeeth array
    ctrl.addSelectedTeeth = function (allTeeth) {
      $scope.selectedTeeth = [];
      angular.forEach($scope.preSelectedTeeth, function (tooth) {
        var item = listHelper.findItemByFieldValue(
          allTeeth,
          'USNumber',
          tooth.toothId
        );
        if (item) {
          if (patientCondition && patientCondition.Surfaces) {
            var surfaces = patientCondition.Surfaces.split(',');
            item.SelectedSurfaces = [];
            angular.forEach(surfaces, function (sfc) {
              item.SelectedSurfaces.push({ Surface: sfc });
            });
          }
          // add roots to selected teeth
          if (patientCondition && patientCondition.Roots) {
            var roots = patientCondition.Roots.split(',');
            item.SelectedRoots = [];
            angular.forEach(roots, function (rts) {
              item.SelectedRoots.push({ Roots: rts });
            });
            item.Roots = patientCondition.Roots;
          }
          $scope.selectedTeeth.push(item);
        } else {
          // when toothId is a quadrant abbrev
          var abbrevs = staticData.TeethQuadrantAbbreviations();
          var quadrantName;
          for (var prop in abbrevs) {
            if (
              abbrevs.hasOwnProperty(prop) &&
              abbrevs[prop] === tooth.toothId
            ) {
              quadrantName = prop;
            }
          }
          angular.forEach(allTeeth, function (item) {
            // auto-selecting permanent quadrant per BA
            if (
              item.QuadrantName === quadrantName &&
              item.ToothStructure === 'Permanent'
            ) {
              $scope.selectedTeeth.push(item);
            }
          });
        }
      });
      $scope.originalSelectedTeeth = angular.copy($scope.selectedTeeth);
    };

    // getting the full teeth list from the factory
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          ctrl.addSelectedTeeth(res.Value.Teeth);
        }
      });
    };

    // calling on load
    ctrl.getTeethDefinitions();

    // helper for creating patient conditions dtos
    ctrl.createPatientCondition = function (tooth, blank) {
      // create the condition date
      var dateNow = moment().format('MM/DD/YYYY');
      var conditionDate = $filter('setDateTime')(dateNow);
      var selectedSurfaces = [];
      if (tooth && !$scope.surfaceSelectionDisabled) {
        angular.forEach(tooth.SelectedSurfaces, function (ss) {
          selectedSurfaces.push(ss.Surface);
        });
      }
      // add roots to condition
      var roots = ctrl.addRootsToCondition(tooth);
      return {
        PatientConditionId: null,
        PatientId: $scope.personId,
        ProviderId: blank ? null : $scope.patientCondition.ProviderId,
        ConditionId: blank ? '' : $scope.patientCondition.ConditionId,
        ConditionDate: blank
          ? conditionDate
          : $scope.patientCondition.ConditionDate,
        Tooth: blank ? null : tooth.USNumber,
        Surfaces: blank ? null : selectedSurfaces.toString(),
        Roots: roots,
        IsActive: true,
      };
    };

    /*var test = [
        {"Id": 1, "Name": "Mouth", "Order": 1},
        {"Id": 2, "Name": "Quadrant", "Order": 2},
        {"Id": 3, "Name": "Root", "Order": 3},
        {"Id": 4, "Name": "Surface", "Order": 4 },
        {"Id": 5, "Name": "Tooth", "Order": 5}
    ];*/

    ctrl.setAreaDisabledFlag = function (conditionId) {
      $scope.quadrantSelectionOnly = false;
      var condition = listHelper.findItemByFieldValue(
        $scope.conditions,
        'ConditionId',
        conditionId
      );
      if (condition != null) {
        switch (condition.AffectedAreaId) {
          // When affected area = Quadrant tooth selections are made via quadrant ONLY (UR, UL, LR, LL)
          case 2:
            $scope.quadrantSelectionOnly = true;
            $scope.surfaceSelectionDisabled = true;
            $scope.rootSelectionDisabled = true;
            break;
          // If Condition affected area = Root add ability to select affected surface, display Root Selector
          case 3:
            $scope.surfaceSelectionDisabled = true;
            $scope.rootSelectionDisabled = false;
            break;
          // If Condition affected area = Surface add ability to select affected surface, display Summary Surfaces
          case 4:
            $scope.surfaceSelectionDisabled = false;
            $scope.rootSelectionDisabled = true;
            break;
          default:
            $scope.surfaceSelectionDisabled = true;
            $scope.rootSelectionDisabled = true;
            break;
        }
      } else {
        $scope.surfaceSelectionDisabled = true;
        $scope.rootSelectionDisabled = true;
      }
    };

    ctrl.isPreferred = function (dataItem) {
      return (
        $scope.patientInfo &&
        dataItem.UserId === $scope.patientInfo.PreferredDentist
      );
    };

    //#region initialize patientCondition

    ctrl.init = function () {
      if (patientCondition === null) {
        $scope.patientCondition = ctrl.createPatientCondition(null, true);
        ctrl.setPreSelectedConditionData();

        $scope.originalPatientCondition = angular.copy($scope.patientCondition);
      } else {
        $scope.patientCondition = patientCondition;
        $scope.originalPatientCondition = angular.copy($scope.patientCondition);
        ctrl.setAreaDisabledFlag($scope.patientCondition.ConditionId);
      }

      var providersToFilter = angular.copy($scope.providers);
      angular.forEach(providersToFilter, function (provider) {
        provider.IsPreferred = ctrl.isPreferred(provider);
      });

      var preferredDentist = providersToFilter.filter(function (p) {
        return p.IsPreferred == true;
      });
      if (preferredDentist.length > 0) {
        $scope.patientCondition.ProviderId = preferredDentist[0].UserId;
      }
    };

    // Function to set pre-selected patient condition properties
    ctrl.setPreSelectedConditionData = function () {
      if (
        ctrl.preSelectedConditionData &&
        ctrl.preSelectedConditionData.ConditionId
      ) {
        $scope.patientCondition.ConditionId =
          ctrl.preSelectedConditionData.ConditionId;
        ctrl.setAreaDisabledFlag(ctrl.preSelectedConditionData.ConditionId);
      }
    };

    ctrl.init();

    //#endregion

    //#region save patient condition

    $scope.savePatientCondition = function () {
      ctrl.validateForm();
      if ($scope.formIsValid && $scope.hasPatientConditionCreateAccess) {
        $scope.savingForm = true;
        var params = { Id: $scope.patientCondition.PatientId };
        var condition = listHelper.findItemByFieldValue(
          $scope.conditions,
          'ConditionId',
          $scope.patientCondition.ConditionId
        );
        var abbrevs = staticData.TeethQuadrantAbbreviations();
        if ($scope.editMode) {
          $scope.patientCondition.Tooth = $scope.selectedTeeth[0].USNumber;
          var selectedSurfaces = [];
          angular.forEach(
            $scope.selectedTeeth[0].SelectedSurfaces,
            function (ss) {
              selectedSurfaces.push(ss.Surface);
            }
          );
          $scope.patientCondition.Surfaces = selectedSurfaces.toString();
          // add roots to condition (only one tooth on edit)
          var selectedTooth = $scope.selectedTeeth[0];
          var roots = ctrl.addRootsToCondition(selectedTooth);
          $scope.patientCondition.Roots = roots;

          patientServices.Conditions.update(
            params,
            $scope.patientCondition,
            $scope.patientConditionSuccess,
            $scope.patientConditionFailed
          );
        } else {
          // building a temporary list of patient conditions dtos based on selected teeth/surfaces
          var patientConditionsTemp = [];
          angular.forEach($scope.selectedTeeth, function (tooth) {
            patientConditionsTemp.push(
              ctrl.createPatientCondition(tooth, false)
            );
          });
          patientServices.Conditions.save(
            params,
            patientConditionsTemp,
            $scope.patientConditionSuccess,
            $scope.patientConditionFailed
          );
        }
      }
    };

    $scope.patientConditionSuccess = function (res) {
      $scope.savingForm = false;
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
      $rootScope.$broadcast('soar:chart-services-reload-ledger');
      $scope.closeModal(savedConditions);
    };

    $scope.patientConditionFailed = function () {
      $scope.savingForm = false;
      var msg;
      if ($scope.editMode) {
        msg = localize.getLocalizedString('{0} {1}', [
          'There was an error while updating',
          'Your patient condition',
        ]);
      } else {
        msg = localize.getLocalizedString('{0} {1}', [
          'There was an error while adding',
          'Your patient condition',
        ]);
      }
      toastrFactory.error(msg, localize.getLocalizedString('Server Error'));
    };

    //#endregion

    //#region condition selection

    $scope.$watch(
      'patientCondition.ConditionId',
      function (nv, ov) {
        if (!angular.equals(nv, ov)) {
          ctrl.setAreaDisabledFlag(nv);
        }
      },
      true
    );

    //#endregion

    $scope.$on('selectedTeeth-modified', function (event, nv) {
      $scope.selectedTeeth = nv;
      ctrl.checkForChanges();
      ctrl.validateForm();
    });

    //#region validation

    ctrl.checkForChanges = function () {
      // a little manipulation required before comparison
      var selectedTeethTemp = angular.copy($scope.selectedTeeth);
      angular.forEach(selectedTeethTemp, function (tooth) {
        if (!$scope.editMode) {
          delete tooth.Selected;
          delete tooth.SelectedSurfaces;
        } else {
          delete tooth.Surfaces;
        }
      });
      if (
        angular.equals(selectedTeethTemp, $scope.originalSelectedTeeth) &&
        angular.equals($scope.patientCondition, $scope.originalPatientCondition)
      ) {
        $scope.canCloseModal = true;
      } else {
        $scope.canCloseModal = false;
      }
    };

    // check that all teeth have surfaces selected
    this.teethHaveSurfaces = function () {
      var returnVal = true;
      angular.forEach($scope.selectedTeeth, function (tooth) {
        if (!tooth.SelectedSurfaces || tooth.SelectedSurfaces.length === 0) {
          returnVal = false;
        }
      });
      return returnVal;
    };

    // check that all teeth have roots selected if applicable
    this.teethHaveRoots = function () {
      var returnVal = true;
      angular.forEach($scope.selectedTeeth, function (tooth) {
        if (!tooth.SelectedRoots || tooth.SelectedRoots.length === 0) {
          returnVal = false;
        }
      });
      return returnVal;
    };

    ctrl.validateForm = function () {
      // condition selected?
      if (
        $scope.patientCondition &&
        $scope.patientCondition.ConditionId !== ''
      ) {
        // teeth selected?
        if ($scope.selectedTeeth && $scope.selectedTeeth.length > 0) {
          $scope.formIsValid = true;
          // is surface required
          if (!$scope.surfaceSelectionDisabled) {
            if (ctrl.teethHaveSurfaces() === false) {
              $scope.formIsValid = false;
            }
          }
          // is roots required
          if (!$scope.rootSelectionDisabled) {
            if (ctrl.teethHaveRoots() === false) {
              $scope.formIsValid = false;
            }
          }
        } else {
          $scope.formIsValid = false;
        }
        // provider and date check
        if (!$scope.patientCondition.ProviderId || $scope.validDate === false) {
          $scope.formIsValid = false;
        }
      } else {
        $scope.formIsValid = false;
      }
    };

    ctrl.validateForm();

    // validate the condition
    $scope.$watch(
      'patientCondition',
      function (nv, ov) {
        if (nv && !angular.equals(nv, ov)) {
          ctrl.checkForChanges();
          ctrl.validateForm();
        }
      },
      true
    );

    //#endregion

    //#region handle close

    //Watch service code data for any changes

    // close and pass saved plannedService
    $scope.closeModal = function (savedPatientConditions) {
      $uibModalInstance.close(savedPatientConditions);
    };

    // close dialog on cancel
    $scope.showCancelModal = function () {
      modalFactory.CancelModal().then($scope.confirmCancel);
    };

    $scope.confirmCancel = function () {
      $uibModalInstance.close(null);
    };

    $scope.cancelChanges = function () {
      if ($scope.canCloseModal) {
        $uibModalInstance.close(null);
      } else {
        modalFactory.CancelModal().then($scope.confirmCancel);
      }
    };

    //#endregion

    // prevent empty lists
    $scope.$on('providers:loaded', function (event, providerList) {
      $scope.providers = $filter('filter')(providerList, { IsActive: true });
    });

    $scope.$on('conditions:loaded', function (event, conditionsList) {
      //$scope.conditions = $filter('filter')(conditionsList, conditionFilter);
    });
  },
]);

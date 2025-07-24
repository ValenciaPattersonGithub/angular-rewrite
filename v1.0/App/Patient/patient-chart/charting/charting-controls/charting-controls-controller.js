(function () {
  'use strict';
  angular
    .module('Soar.Patient')
    .controller('ChartingControlsController', [
      '$scope',
      '$rootScope',
      'patSecurityService',
      'UserServices',
      'toastrFactory',
      'ListHelper',
      'localize',
      'ModalFactory',
      'referenceDataService',
      'StaticData',
      'PatientOdontogramFactory',
      '$routeParams',
      'PatientLogic',
      'PatientServices',
      '$filter',
      'ChartingFavoritesFactory',
      'ConditionsService',
      'FeatureFlagService',
      'FuseFlag',
      ChartingControlsController,
    ]);
  function ChartingControlsController(
    $scope,
    $rootScope,
    patSecurityService,
    userServices,
    toastrFactory,
    listHelper,
    localize,
    modalFactory,
    referenceDataService,
    staticData,
    patientOdontogramFactory,
    $routeParams,
    patientLogic,
    patientServices,
    $filter,
    chartingFavoritesFactory,
    conditionsService,
    featureFlagService,
    fuseFlag
  ) {
    BaseCtrl.call(this, $scope, 'ChartingControlsController');
    var ctrl = this;

    // Creating a new range to control the dot navigation
    $scope.range = _.range(0, 5);

    ctrl.$onInit = function () {
      $scope.list = [];
      $scope.selectedFavorite = {};
      $scope.favoritesDropdownDisabled = true;
      $scope.layoutItems = null;
      $scope.conditions = [];
      $scope.services = [];
      $scope.personId = $routeParams.patientId;
      $scope.getPatient($scope.personId);
      ctrl.getTeethDefinitions();
      featureFlagService.getOnce$(fuseFlag.UsePracticeApiForConditions).subscribe(value => {
        ctrl
          .getConditions(value)
          .then(function () {
            return ctrl.getServices();
          })
          .then(function () {
            $scope.SwiftCodesProgress = '';
            $scope.chartingButtonLayout = {};
            $scope.grouping = false;
            $scope.groupView = false;
            $scope.groupTitle = {
              Title: '',
            };
            $scope.newGroupTitle = '';
            $scope.favoritesBackup = null;
            $scope.sorting = false;
            $scope.currentGroupIndex = null;
            $scope.titleBackup = {};
            $scope.editMode = false;
            $scope.pageSelected = 0;
            $scope.showCloseButton = false;
            $scope.editTitle = false;
            $scope.navigationEnabled = false;
            $scope.currentPageCopy = null;
            // subscribe to charting layout changes
            chartingFavoritesFactory.observeChartButtonLayout(
              $scope.updateChartingLayout
            );
            chartingFavoritesFactory.observeCurrentPage($scope.setCurrentPage);
            ctrl.propServPrebuilt = false;

            $scope.disableImport = true;
            $scope.disableImportMessage = localize.getLocalizedString(
              'Retrieving data'
            );
            return ctrl.getUserListForImport();
          });
      });
    };

    // create/edit favorites click handler
    $scope.openChartButtonLayoutCrud = function () {
      $scope.viewSettings.expandView = true;
      $scope.viewSettings.activeExpand = 4;
      $scope.toggleSorting();
      $scope.addManageDnD();

      // Update the current list of favorites in the factory
      chartingFavoritesFactory.SetSelectedChartingFavorites(
        $scope.layoutItems,
        $scope.chartingButtonLayout,
        false,
        $scope.pageSelected
      );
    };

    // Close add favorites window
    $scope.closeChartButtonLayoutCrud = function () {
      $scope.viewSettings.expandView = false;
      $scope.viewSettings.activeExpand = 0;
      $scope.toggleSorting();
    };

    /**
     * Get user list for import.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getUserListForImport = function () {
      return ctrl.processUsers().then(function (usersDict) {
        ctrl.usersDict = usersDict;
        return userServices.ChartButtonLayout.getAllUsersWithFavorites(
          ctrl.getUserListForImportSuccess,
          ctrl.getUserListForImportFailure
        ).$promise;
      });
    };

    ctrl.getUserListForImportSuccess = function (res) {
      if (
        _.isNil(res) ||
        _.isNil(res.Value) ||
        res.Value.length === 0 ||
        _.isNil(ctrl.usersDict)
      ) {
        ctrl.getUserListForImportFailure();
      } else {
        ctrl.processUserListForImport(res.Value);
      }
    };

    ctrl.getUserListForImportFailure = function () {
      $scope.disableImport = true;
      $scope.disableImportMessage = localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['users for import']
      );
    };

    /**
     * Users map keyed by 'UserId'.
     *
     * @returns {angular.IPromise<any>}
     */
    ctrl.processUsers = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (users) {
          return _.isNil(users) || users.length === 0
            ? null
            : _.keyBy(users, 'UserId');
        });
    };

    ctrl.processUserListForImport = function (usersWithFavorites) {
      ctrl.usersForImport = [];

      _.forEach(usersWithFavorites, function (userId) {
        if (userId !== $rootScope.patAuthContext.userInfo.userid) {
          var user = ctrl.usersDict[userId];
          if (!_.isNil(user)) {
            ctrl.usersForImport.push({
              UserId: user.UserId,
              Name: `${user.FirstName} ${user.LastName}${
                user.ProfessionalDesignation
                  ? ', ' + user.ProfessionalDesignation
                  : ''
              }`,
              LastName: user.LastName,
            });
          }
        }
      });

      if (ctrl.usersForImport.length > 0) {
        $scope.disableImport = false;
        $scope.disableImportMessage = '';
      } else {
        $scope.disableImport = true;
        $scope.disableImportMessage = localize.getLocalizedString(
          'No saved favorites available for import.'
        );
      }
    };

    $scope.openChartButtonLayoutImport = function () {
      var amfa =
        _.isNil($scope.layoutItems) || $scope.layoutItems.length === 0
          ? 'soar-biz-bizusr-achbtn'
          : 'soar-biz-bizusr-echbtn';
      if (patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
        // open modal
        var modalInstance = modalFactory.Modal({
          templateUrl:
            'App/Patient/patient-chart/charting/charting-controls/import-layout/import-layout.html',
          controller: 'ImportChartButtonLayoutController',
          amfa: amfa,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'center-modal',
          size: 'sm',
          resolve: {
            usersList: function () {
              return $filter('orderBy')(ctrl.usersForImport, 'LastName');
            },
          },
        });
        modalInstance.result.then(ctrl.handleImportSuccess);
      }
    };

    ctrl.handleImportSuccess = function (layout) {
      if (!_.isNil(layout)) {
        ctrl.getChartButtonLayoutSuccess({ Value: layout });
        $scope.selectPage(0);
      }
    };

    $scope.$on('buttonStateChange', function (event, newValues) {
      $scope.buttonTooltip = newValues[0];
      $scope.disableWhenPatientInactive = newValues[1];
    });

    // setting background class based on button type
    $scope.getButtonColorClass = function (layoutItem) {
      var cssClass = '';
      switch (layoutItem.TypeId.toString()) {
        case '1':
          cssClass = 'condBtnColor';
          break;
        case '2':
          cssClass = 'svcBtnColor';
          break;
        case '3':
          cssClass = 'swiftCodeBtnColor';
          break;
        case '4':
          cssClass = 'groupColor';
          break;
      }
      return cssClass;
    };

    $scope.getPatient = function (personId) {
      if (!$scope.patientInfo) {
        patientLogic
          .GetPatientById($scope.personId)
          .then(function (patientInfo) {
            $scope.patientInfo = patientInfo;
          });
      }
    };

    // favorite clicked
    $scope.utilizeFavorite = function (favorite, index) {
      var buttonType = parseInt(favorite.TypeId);
      var buttonId = favorite.Id;

      patientOdontogramFactory.setselectedChartButton(buttonId);
      var params = {
        Id: $scope.personId,
      };

      if (
        !$scope.viewSettings.expandView &&
        !$scope.grouping &&
        buttonId != null &&
        !$scope.editMode
      ) {
        switch (buttonType) {
          case '1':
          case 1:
            $scope.SwiftCodesProgress = '';
            var conditionSelected = _.find($scope.conditions, {
              ConditionId: buttonId,
            });
            if (
              conditionSelected &&
              conditionSelected.AffectedAreaId >= 2 &&
              conditionSelected.AffectedAreaId <= 5
            )
              $scope.openPropServCtrls(
                'Condition',
                favorite.Text,
                false,
                false,
                true
              );
            else {
              var patientConditionsTemp = [];
              patientConditionsTemp.push(
                ctrl.createPatientCondition(false, true, buttonId)
              );
              patientServices.Conditions.save(
                params,
                patientConditionsTemp,
                $scope.patientConditionSuccess,
                $scope.patientConditionFailed
              );
            }
            break;
          case 2:
            $scope.SwiftCodesProgress = '';
            var selectedCode = _.find($scope.services, {
              ServiceCodeId: buttonId,
            });
            if (selectedCode) {
              $scope.openPropServCtrls(
                'Service',
                selectedCode.Code,
                false,
                true,
                false
              );
            }
            break;
          case 3:
            $scope.swiftPickSelected = listHelper.findItemByFieldValue(
              $scope.services,
              'ServiceCodeId',
              buttonId
            );
            var firstCode = false;
            var lastCode = false;
            if (!_.isEmpty($scope.swiftPickSelected.SwiftPickServiceCodes)) {
              $scope.SwiftCodesProgress = localize.getLocalizedString(
                ' - ({0} of {1})',
                [1, $scope.swiftPickSelected.SwiftPickServiceCodes.length]
              );
              firstCode = true;
              if ($scope.swiftPickSelected.SwiftPickServiceCodes.length === 1)
                lastCode = true;
              patientOdontogramFactory.setselectedChartButton(
                $scope.swiftPickSelected.SwiftPickServiceCodes[0].ServiceCodeId
              );
              patientOdontogramFactory.setSelectedSwiftPickCode(
                $scope.swiftPickSelected.SwiftPickServiceCodes[0]
                  .SwiftPickServiceCodeId
              );
              var title =
                $scope.swiftPickSelected.SwiftPickServiceCodes[0].Code +
                $scope.SwiftCodesProgress;
              $scope.openPropServCtrls(
                'Service',
                title,
                true,
                firstCode,
                lastCode
              );
            }
            break;
        }
      } else {
        $scope.viewGroup(favorite, index);
      }
    };

    $scope.nextSwftPkServCode = function () {
      var index = listHelper.findIndexByFieldValue(
        $scope.swiftPickSelected.SwiftPickServiceCodes,
        'SwiftPickServiceCodeId',
        patientOdontogramFactory.selectedSwiftPickCode
      );
      if (
        index > -1 &&
        index != $scope.swiftPickSelected.SwiftPickServiceCodes.length - 1
      ) {
        var firstCode = false;
        var lastindex = false;
        var nextIndex = index + 1;
        $scope.SwiftCodesProgress = localize.getLocalizedString(
          ' - ({0} of {1})',
          [nextIndex + 1, $scope.swiftPickSelected.SwiftPickServiceCodes.length]
        );
        if (
          nextIndex ==
          $scope.swiftPickSelected.SwiftPickServiceCodes.length - 1
        )
          lastindex = true;
        patientOdontogramFactory.setselectedChartButton(
          $scope.swiftPickSelected.SwiftPickServiceCodes[index + 1]
            .ServiceCodeId
        );
        patientOdontogramFactory.setSelectedSwiftPickCode(
          $scope.swiftPickSelected.SwiftPickServiceCodes[index + 1]
            .SwiftPickServiceCodeId
        );
        var title =
          $scope.swiftPickSelected.SwiftPickServiceCodes[index + 1].Code +
          $scope.SwiftCodesProgress;
        $scope.openPropServCtrls('Service', title, true, firstCode, lastindex);
      } else {
        $scope.closeWindow();
      }
    };

    ctrl.createPatientCondition = function (tooth, blank, conditionId) {
      var dateNow = moment().format('MM/DD/YYYY');
      var conditionDate = $filter('setDateTime')(dateNow);
      var selectedSurfaces = [];

      return {
        PatientConditionId: null,
        PatientId: $scope.personId,
        ConditionId: conditionId,
        ConditionDate: blank
          ? conditionDate
          : $scope.patientCondition.ConditionDate,
        Tooth: blank ? null : tooth.USNumber,
        Surfaces: blank ? null : $scope.getselectedSurfaces(),
        Roots: blank ? null : $scope.getrootsForTooth(tooth),
        IsActive: true,
      };
    };

    $scope.patientConditionSuccess = function (res) {
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
    };

    //#region api calls

    //#region conditions api

    /**
     * getting the list of conditions.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getConditions = function (usePracticesApi) {
      if (usePracticesApi) {
        return conditionsService.getAll()
          .then(conditions => {
            $scope.conditions = conditions;
            ctrl.getChartButtonLayout();
          })
      } else {
        return referenceDataService
          .getData(referenceDataService.entityNames.conditions)
          .then(function (conditions) {
            $scope.conditions = conditions;
            ctrl.getChartButtonLayout();
          });
      }
    };

    //#endregion

    //#region services api

    /**
     * getting the list of services.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getServices = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (services) {
          $scope.services = services;
          patientOdontogramFactory.serviceCodes = $scope.services;
          ctrl.getChartButtonLayout();
        });
    };

    //#endregion

    //#region get chart button layout api

    // getting the chart button layout for user
    ctrl.getChartButtonLayout = function () {
      if (!_.isEmpty($scope.conditions) > 0 && !_.isEmpty($scope.services)) {
        userServices.ChartButtonLayout.get(
          ctrl.getChartButtonLayoutSuccess,
          ctrl.getChartButtonLayoutFailure
        );
      }
    };

    // success callback handler for get chart button layout, making the buttons
    ctrl.getChartButtonLayoutSuccess = function (res) {
      $scope.layoutItems = [];
      $scope.chartingButtonLayout = res.Value;
      ctrl.prebuildToothControls();
      if (res && res.Value) {
        $scope.setFavoritesLayout();
        // Update the current list of favorites in the factory
        chartingFavoritesFactory.SetSelectedChartingFavorites(
          $scope.layoutItems,
          $scope.chartingButtonLayout,
          false,
          $scope.pageSelected
        );
      }
    };

    // failure callback handler for get chart button layout
    ctrl.getChartButtonLayoutFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Refresh the page to try again.',
          ['Chart Button Layout']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.setFavoritesLayout = function () {
      var convertedItem = null;
      // Set the pages array with enough items to display for the page selected
      if ($scope.chartingButtonLayout.Pages.length < $scope.pageSelected + 1) {
        for (
          var i = $scope.chartingButtonLayout.Pages.length;
          i <= $scope.pageSelected;
          i++
        ) {
          $scope.chartingButtonLayout.Pages.push({ Favorites: [] });
        }
      }

      $scope.layoutItems = [];
      var layoutItems =
        $scope.chartingButtonLayout.Pages[$scope.pageSelected].Favorites;

      for (
        var layoutItemIndex = 0;
        layoutItemIndex < layoutItems.length;
        layoutItemIndex++
      ) {
        if (!_.isEmpty(layoutItems[layoutItemIndex].Button)) {
          // Set the favorites list
          convertedItem = chartingFavoritesFactory.SetChartingButtonLayout(
            layoutItems[layoutItemIndex].Button,
            $scope.services,
            $scope.conditions
          );
          if (!_.isEmpty(convertedItem)) {
            $scope.layoutItems.push(convertedItem);
          } else {
            // Remove the item if it does not exist in the current list of conditions/service/swift codes
            $scope.chartingButtonLayout.Pages[
              $scope.pageSelected
            ].Favorites.splice(
              $scope.chartingButtonLayout.Pages[
                $scope.pageSelected
              ].Favorites.indexOf(layoutItems[layoutItemIndex]),
              1
            );
            //Decrement the index because we are splicing and don't want to skip the next item in the array
            layoutItemIndex--;
            chartingFavoritesFactory.SetSelectedChartingFavorites(
              $scope.layoutItems,
              $scope.chartingButtonLayout,
              false,
              $scope.pageSelected
            );
          }
        } else {
          if (!_.isEmpty(layoutItems[layoutItemIndex].ButtonGroup)) {
            // Set the favorites list
            $scope.layoutItems.push(
              chartingFavoritesFactory.SetChartingButtonLayout(
                layoutItems[layoutItemIndex].ButtonGroup,
                $scope.services,
                $scope.conditions
              )
            );
          }
        }
      }
      $scope.getNavigationStatus();
    };

    $scope.setupModal = function (type, buttonId) {
      patientOdontogramFactory.setselectedChartButton(buttonId);
      $scope.openPropServCtrls('Condition');
    };

    ctrl.getTeethDefinitions = function () {
      $scope.smartCodeDefinitions = {};
      staticData.TeethDefinitions().then(function (res) {
        $scope.teethDefinitions = res.Value;
        var PosteriorTeeth = listHelper.findAllByPredicate(
          res.Value.Teeth,
          function (item, index) {
            return item.ToothPosition == 'Posterior';
          }
        );
        patientOdontogramFactory.TeethDefinitions = res.Value;
      });
      staticData.CdtCodeGroups().then(function (res) {
        $scope.cdtCodeGroups = res.Value;
        patientOdontogramFactory.CdtCodeGroups = res.Value;
        $scope.smartCodeDefinitions.CdtCodeGroups = res.Value;
      });
    };

    $scope.closeWindow = function () {
      $scope.propServCtrls.close();
      $scope.patientConditionCreateUpdate.setOptions({
          title: '',
      });
      $scope.patientConditionCreateUpdate.close();

      if (ctrl.propServPrebuilt === true) {
        $scope.updatedpropServCtrlsParams = {
          rand: Math.random(),
          windowClosed: true,
        };
      }
    };

    $scope.$on('close-tooth-window', function (e) {
      $scope.closeWindow();
    });

    $scope.$on('close-patient-condition-create-update', function (e) {
      $scope.closeWindow();
    });

    $scope.$watch('propServCtrlsOpen', function (nv) {
      if (nv === false) {
        $scope.closeWindow();
      }
    });

    $scope.$on('soar:chart-services-reload-ledger', function (event) {
      $scope.backToFavorites();
    });

    // this sets the content on $scope.propServCtrls based on the first service favorite that it can find so that it is pre-built and ready to open faster (beta feedback)
    // when openPropServCtrls is called it will just need to make the necessary updates based on the service that was selected
    ctrl.prebuildToothControls = function () {
      if ($scope.propServCtrls) {
        ctrl.firstServiceFavorite = '';
        if (!$scope.chartingButtonLayout) {
          $scope.chartingButtonLayout = {};
          if (
            !$scope.chartingButtonLayout.Pages ||
            $scope.chartingButtonLayout.Pages == null
          ) {
            $scope.chartingButtonLayout.Pages = [];
          }
        }
        angular.forEach($scope.chartingButtonLayout.Pages, function (page) {
          angular.forEach(page.Favorites, function (favorite) {
            if (
              !ctrl.firstServiceFavorite &&
              favorite.Button &&
              favorite.Button.ItemTypeId === 2
            ) {
              ctrl.firstServiceFavorite = favorite.Button.ItemId;
            }
          });
        });
        if (!ctrl.firstServiceFavorite) {
          angular.forEach($scope.services, function (svc) {
            if (!ctrl.firstServiceFavorite && svc.IsSwiftPickCode === false) {
              ctrl.firstServiceFavorite = svc.ServiceCodeId;
            }
          });
        }
        patientOdontogramFactory.setselectedChartButton(
          ctrl.firstServiceFavorite
        );
        $scope.propServCtrls.center();
        $scope.propServCtrls.content(
          '<multi-location-proposed-service mode="Service" isswiftcode="false" isfirstcode="true" islastcode="false"></multi-location-proposed-service>'
        );
        ctrl.previousMode = 'Service';
        ctrl.propServPrebuilt = true;
      }
    };

    // Displays the "Add Service"/"Add Condition" kendo window
    $scope.openPropServCtrls = function (
      mode,
      title,
      isSwiftCode,
      firstCode,
      lastCode
    ) {
      if (mode === 'Service') {
        // if proposedServiceModal has been instanced no need to do so again
        if (ctrl.propServPrebuilt === true) {
          $scope.updatedpropServCtrlsParams = {
            mode: mode,
            isswiftcode: isSwiftCode,
            isfirstcode: firstCode,
            islastcode: lastCode,
            newId: patientOdontogramFactory.selectedChartButtonId,
            rand: Math.random(),
            windowClosed: false,
          };
        } else {
          $scope.propServCtrls.content(
            '<multi-location-proposed-service mode="Service" isswiftcode="' +
              _.escape(isSwiftCode) +
              '" isfirstcode="' +
              _.escape(firstCode) +
              '" islastcode="' +
              _.escape(lastCode) +
              '" ></multi-location-proposed-service>'
          );
        }
        $scope.propServCtrls.setOptions({
          title: 'Add ' + mode + ' - ' + title,
        });
        $scope.propServCtrls.center();
        $scope.propServCtrls.open();
      } else if (mode === 'Condition') {
        $scope.patientConditionCreateUpdate.content(
          '<patient-condition-create-update editing="false"></patient-condition-create-update>'
        );
        $scope.patientConditionCreateUpdate.setOptions({
          title: 'Add ' + mode + ' - ' + title,
        });
        $scope.patientConditionCreateUpdate.center();
          $scope.patientConditionCreateUpdate.open();        
      }
      ctrl.previousMode = mode;
    };

    // static tooth control options
    $scope.propServCtrlsOptions = {
      resizable: false,
      minWidth: 300,
      scrollable: false,
      iframe: false,
      actions: ['Close'],
      modal: true,
    };
    //#endregion

    //#region inactivated patient
    $scope.patientIsInactive = false;
    $scope.$watch('patientInfo', function (nv, ov) {
      if (nv) {
        $scope.patientIsInactive = nv.IsActive;
        ctrl.setButtonState();
      }
    });

    $scope.buttonTooltip = '';
    $scope.disableWhenPatientInactive = false;
    // set button state for buttons based on active state of patient
    ctrl.setButtonState = function () {
      if ($scope.patientInfo.IsActive === false) {
        $scope.buttonTooltip = localize.getLocalizedString(
          'Cannot add services or conditions for an inactive patient'
        );
        $scope.disableWhenPatientInactive = true;
      } else {
        $scope.buttonTooltip = '';
        $scope.disableWhenPatientInactive = false;
      }
    };

    $scope.getButtonTooltip = function (service) {
      if ($scope.patientInfo.IsActive === false) {
        return localize.getLocalizedString(
          'Cannot add services or conditions for an inactive patient'
        );
      } else {
        return service.Text;
      }
    };

    //#endregion

    //#region Button icons

    $scope.getServiceChartIconUrl = function (service) {
      var url = 'Images/ChartIcons/';
      var path = angular.copy(service.IconName);
      if (!path || path === null) {
        url += service.IsSwiftPickCode
          ? 'default_swift_code.svg'
          : 'default_service_code.svg';
      } else {
        url += path + '.svg';
      }
      return url;
    };

    $scope.getConditionChartIconUrl = function (condition) {
      var url = 'Images/ConditionIcons/';
      var path = angular.copy(condition.IconName);
      if (!path) {
        url += 'default_condition.svg';
      } else {
        url += path + '.svg';
      }
      return url;
    };

    $scope.getTemplateType = function (object) {
      var template;
      if (object.TypeId) {
        var id = object.TypeId;
        if (id == '1') {
          template = 'chartingFavoritesConditionsTooltipTemplate.html';
        } else if (id == '2') {
          template = 'chartingFavoritesTooltipTemplate.html';
        } else if (id == '3') {
          template = 'chartingFavoritesSwiftCodeTooltipTemplate.html';
        } else if (id == '4') {
          template = 'chartingFavoritesGroupTooltipTemplate.html';
        }
        return template;
      }
    };

    //#endregion

    // Drop handlers
    $scope.addFavorite = function (item) {
      // Set the favorites list
      $scope.layoutItems.push(
        chartingFavoritesFactory.SetChartingButtonLayout(
          item.Button,
          $scope.services,
          $scope.conditions
        )
      );

      // Update the current list of favorites in the factory
      chartingFavoritesFactory.SetSelectedChartingFavorites(
        $scope.layoutItems,
        $scope.chartingButtonLayout,
        true,
        $scope.pageSelected
      );
    };

    // remove items from selectedLayoutItems
    $scope.remove = function (buttonObject) {
      var index = listHelper.findIndexByFieldValue(
        $scope.layoutItems,
        'Id',
        buttonObject.Id
      );
      if (index !== -1) {
        if ($scope.editMode) {
          if ($scope.layoutItems.length > 1) {
            $scope.layoutItems.splice(index, 1);
            $scope.layoutItems.$$layoutUpdated = true;

            $scope.updateGroup();
          } else {
            toastrFactory.error(
              localize.getLocalizedString(
                'You cant remove the last item from a {0}.',
                ['group']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        } else {
          $scope.layoutItems.splice(index, 1);
          $scope.layoutItems.$$layoutUpdated = true;

          // Update the current list of favorites in the factory
          chartingFavoritesFactory.SetSelectedChartingFavorites(
            $scope.layoutItems,
            $scope.chartingButtonLayout,
            true,
            $scope.pageSelected
          );
        }
        $scope.getNavigationStatus();
      }
    };

    // Sorting function for timeline favorites
    $scope.toggleSorting = function () {
      if ($scope.viewSettings.expandView || $scope.editMode) {
        angular.element('#sortable').kendoSortable({
          change: function (e) {
            $scope.showCloseButton = false;
            // re-ordering actually list
            var itemMoved = $scope.layoutItems[e.oldIndex];
            $scope.layoutItems.splice(e.oldIndex, 1);
            $scope.layoutItems.splice(e.newIndex, 0, itemMoved);
            $scope.layoutItems.$$layoutUpdated = true;
            // need this to keep ng-repeat in sync
            $scope.$apply();

            // Update the current list of favorites in the factory
            if ($scope.editMode) {
              $scope.updateGroup();
            } else {
              chartingFavoritesFactory.SetSelectedChartingFavorites(
                $scope.layoutItems,
                $scope.chartingButtonLayout,
                true,
                $scope.pageSelected
              );
            }
          },
          hint: $scope.groupingDraggableHint,
          start: $scope.onSortingStart,
          end: $scope.onSortingEnd,
        });
      } else {
        angular.element('#sortable').data('kendoSortable').destroy();
        angular.element('#sortable').removeClass('k-state-selected');
      }
    };

    // Function to control the sorting start point
    $scope.onSortingStart = function (e) {
      $scope.sorting = true;
      $scope.showCloseButton = false;
    };

    // Function to control when sorting finishes
    $scope.onSortingEnd = function (e) {
      $scope.sorting = false;
      var draggable = angular.element(e);
      draggable.removeClass('hollow');
    };

    // observer for watching the predetermination list for changes
    $scope.updateChartingLayout = function (chartingLayout) {
      if (chartingLayout && chartingLayout.DataTag) {
        $scope.chartingButtonLayout = chartingLayout;
      }
    };

    // fires when the button is dropped, updating list
    // If not grouping
    $scope.onDrop = function (e) {
      if (!$scope.grouping && !$scope.sorting) {
        ctrl.add(e.draggable.element[0]);
        $scope.$apply(function () {
          $scope.draggableClass = '';
        });
      }
    };

    // adds items to selectedLayoutItems
    ctrl.add = function (element) {
      var layoutItem = {};
      layoutItem.Button = JSON.parse(
        angular.element(element).attr('data-layoutitem')
      );
      if (layoutItem && layoutItem.ItemId !== 'selectedButtons') {
        $scope.addFavorite(layoutItem);
      }
    };

    // #region favorites grouping

    // Adding the kendo classes when grouping favorites
    $scope.addGroupingDnD = function () {
      $scope.grouping = true;

      //create a draggable for the parent container
      $('#selectedButtons').kendoDraggable({
        filter: '.groupableItem', //specify which items will be draggable
        hint: $scope.groupingDraggableHint,
        dragstart: $scope.onGroupingDragStart,
        dragend: $scope.onGroupingDragEnd,
      });

      //create droppable button containers
      $('#selectedButtons').kendoDropTargetArea({
        filter: '.groupableContainer', //specify which items will be draggable
        hint: $scope.groupingDraggableHint,
        drop: $scope.createGroup,
      });
    };

    // Adding the kendo classes when managing favorites
    $scope.addManageDnD = function () {
      //create droppable button containers
      $('#selectedButtons').kendoDropTargetArea({
        filter: '.droppable', //specify which items will be droppable
        drop: $scope.onDrop,
      });

      //create droppable page containers
      $('#dotNavigation').kendoDropTargetArea({
        filter: '.droppablePage', //specify which items will be droppable
        drop: $scope.changePage,
      });
    };

    $scope.createGroup = function (e) {
      // The item being drug on top of the container
      var groupedItem = JSON.parse(
        angular.element(e.draggable.currentTarget[0]).attr('data-layoutitem')
      );

      // The item being dropped on
      var groupContainer = JSON.parse(
        angular.element(e.dropTarget[0]).attr('data-layoutitem')
      );

      //If the item being dropped on is the item being dragged, do nothing.
      //Only start creating a group if the dropped on item is different from the item being dragged.
      if (groupedItem.ItemId !== groupContainer.ItemId) {
        var buttonObject = {
          Id: null,
          Text: '',
          IconUrl: null,
          TypeId: 4,
          Service: null,
          $$button: {},
        };

        if (groupContainer.ItemId) {
          modalFactory
            .Modal({
              templateUrl:
                'App/Patient/patient-chart/charting/charting-controls/charting-groups/charting-groups-template.html',
              backdrop: 'static',
              keyboard: false,
              size: 'md',
              windowClass: 'center-modal',
              controller: 'ChartingGroupsController',
              amfa: 'soar-clin-codogm-view',
              resolve: {
                //Group: group
              },
            })
            .result.then(function (res) {
              if (res && res != '' && res != null) {
                buttonObject.Text = res;
                buttonObject.$$button.Buttons = [];
                buttonObject.$$button.Buttons.push(groupContainer, groupedItem);
                buttonObject.$$button.GroupName = res;
                buttonObject.$$new = true;

                $scope.reorderList(groupContainer, groupedItem, buttonObject);
              }
            });
        } else {
          if (groupContainer.Buttons.length < 20) {
            buttonObject.Text = groupContainer.GroupName;
            buttonObject.$$button.GroupName = groupContainer.GroupName;
            buttonObject.$$button.Buttons = groupContainer.Buttons;
            buttonObject.$$button.Buttons.push(groupedItem);
            buttonObject.$$new = false;

            $scope.reorderList(groupContainer, groupedItem, buttonObject);
          } else {
            toastrFactory.error(
              localize.getLocalizedString(
                'You may only have 20 items per page/group. Please retry your save.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        }
      }
    };

    $scope.endGrouping = function (e) {
      if (!$scope.editMode) {
        $scope.grouping = false;
        $scope.backToFavorites();
      } else {
        $scope.editMode = false;
        $scope.toggleSorting();
        $scope.editTitle = false;
      }
    };

    // used by k-hint to draw duplicate button to display while dragging
    $scope.groupingDraggableHint = function (e) {
      $scope.showCloseButton = false;
      var clone = angular.element(e[0].children[1]).clone();
      clone.addClass('hollow');
      return clone;
      //el.first().attr('class', 'chartingControls__removeBtn').css('display', 'none');
    };

    // used by k-dragend to cleanup up hollow class
    $scope.onGroupingDragEnd = function (e) {
      var draggable = angular.element(e);
      draggable.removeClass('hollow');
    };

    // used by k-dragstart to add hollow class
    $scope.onGroupingDragStart = function () {
      $scope.$apply(function () {
        $scope.draggableClass = 'hollow';
      });
    };

    $scope.reorderList = function (groupContainer, groupedItem, buttonObject) {
      var selectedItemIndex = $filter('filter')(
        $scope.layoutItems,
        { Id: groupedItem.ItemId },
        true
      );

      // If its a new group, we need to remove both items and replace the drop container with the new group
      if (buttonObject.$$new) {
        // Remove the grouped item from the list of favorites, it has been added to a group
        var selectedContainerIndex = $filter('filter')(
          $scope.layoutItems,
          { Id: groupContainer.ItemId },
          true
        );

        $scope.layoutItems.splice(
          $scope.layoutItems.indexOf(selectedItemIndex[0]),
          1
        );
        $scope.layoutItems.splice(
          $scope.layoutItems.indexOf(selectedContainerIndex[0]),
          1,
          buttonObject
        );
      } else {
        var index = 0;
        angular.forEach($scope.layoutItems, function (item) {
          if (item.$$button.GroupName == buttonObject.$$button.GroupName) {
            item.$$button.Buttons = buttonObject.$$button.Buttons;
          }
        });
        $scope.layoutItems.splice(
          $scope.layoutItems.indexOf(selectedItemIndex[0]),
          1
        );
      }

      // Update the current list of favorites in the factory
      chartingFavoritesFactory.SetSelectedChartingFavorites(
        $scope.layoutItems,
        $scope.chartingButtonLayout,
        true,
        $scope.pageSelected
      );
    };

    // Create view for groups
    $scope.viewGroup = function (group, index) {
      if (
        !$scope.grouping &&
        !$scope.viewSettings.expandView &&
        !$scope.editMode
      ) {
        $scope.currentGroupIndex = index;
        $scope.groupView = true;
        $scope.favoritesBackup = angular.copy($scope.layoutItems);
        $scope.groupTitle.Title = group.$$button.GroupName;
        $scope.layoutItems = [];

        angular.forEach(group.$$button.Buttons, function (item) {
          $scope.displayGroup = true;

          var returnedLayoutItem = chartingFavoritesFactory.SetChartingButtonLayout(
              item,
              $scope.services,
              $scope.conditions
          );
          if (returnedLayoutItem != null) {              
              $scope.layoutItems.push(returnedLayoutItem);
          }
        });
      }
    };

    ctrl.deletingGroup = false;
    // Return to full charting button view
    $scope.backToFavorites = function () {
      if (
        $scope.layoutItems.length == 1 &&
        $scope.groupView &&
        !ctrl.deletingGroup
      ) {
        $scope.deleteGroup($scope.layoutItems[0]);
      } else {
        if ($scope.favoritesBackup != null) {
          $scope.groupTitle.Title = '';
          $scope.layoutItems = $scope.favoritesBackup;
        }
        $scope.groupView = false;
        $scope.currentGroupIndex = null;
      }
      $scope.selectPage($scope.pageSelected);
    };

    // Delete a group object from the list
    $scope.deleteGroup = function (buttonObject) {
      ctrl.deletingGroup = true;
      if (!_.isUndefined($scope.currentGroupIndex) && _.isEmpty(buttonObject)) {
        $scope.layoutItems = $scope.favoritesBackup;
        $scope.layoutItems.splice($scope.currentGroupIndex, 1);

        chartingFavoritesFactory.SetSelectedChartingFavorites(
          $scope.layoutItems,
          $scope.chartingButtonLayout,
          true,
          $scope.pageSelected
        );
        $scope.backToFavorites();
      } else if (!_.isEmpty(buttonObject)) {
        $scope.layoutItems = $scope.favoritesBackup;
        $scope.layoutItems.splice($scope.currentGroupIndex, 1, buttonObject);

        chartingFavoritesFactory.SetSelectedChartingFavorites(
          $scope.layoutItems,
          $scope.chartingButtonLayout,
          true,
          $scope.pageSelected
        );
        $scope.backToFavorites();
      }
      ctrl.deletingGroup = false;
    };

    // Allow user to edit group info
    $scope.enterEditMode = function () {
      $scope.editMode = true;
      $scope.toggleSorting();
    };

    $scope.updateGroup = function (groupTitle) {
      var updatedFavorites = $scope.favoritesBackup;
      var group = updatedFavorites[$scope.currentGroupIndex];

      if (groupTitle) {
        $scope.groupTitle.Title = groupTitle;
      }

      group.Text = $scope.groupTitle.Title;
      group.Buttons = $scope.layoutItems;
      group.$$button.Buttons = [];

      // Update the item that will be sent back to domain
      angular.forEach($scope.layoutItems, function (item) {
        var button = {
          ItemId: item.Id,
          ItemTypeId: item.TypeId,
        };

        group.$$button.Buttons.push(button);
        group.$$button.GroupName = $scope.groupTitle.Title;
      });

      chartingFavoritesFactory.SetSelectedChartingFavorites(
        updatedFavorites,
        $scope.chartingButtonLayout,
        true,
        $scope.pageSelected
      );

      // Reset the backup
      $scope.favoritesBackup = angular.copy(updatedFavorites);
      $scope.editTitle = false;
    };

    $scope.editGroupTitle = function (editTitle) {
      //switch to toggle editing of the group title
      $scope.editTitle = editTitle;
      if (editTitle) {
        $scope.titleBackup = angular.copy($scope.groupTitle);
      } else {
        $scope.groupTitle = $scope.titleBackup;
      }
    };

    // #end region

    //cancel modal
    $scope.cancelModal = function () {
      var message = localize.getLocalizedString(
        'Are you sure you want to delete this group?'
      );
      var title = localize.getLocalizedString('Delete this group?');
      var buttonYes = localize.getLocalizedString('Yes');
      var buttonNo = localize.getLocalizedString('No');

      modalFactory.ConfirmModal(title, message, buttonYes, buttonNo).then(
        function () {
          // They chose yes, so continue with deleting the group
          $scope.deleteGroup(null);
        },
        function () {
          // Do nothing
        }
      );
    };

    // Dot navigation functions
    $scope.selectPage = function (page) {
      if ($scope.grouping) {
        $scope.endGrouping();
      }
      $scope.pageSelected = page;
      $scope.setFavoritesLayout();
    };

    $scope.changePage = function (e) {
      // The item being drug on top of the container
      var item = {};
      var group = false;
      var hint = JSON.parse(
        angular.element(e.draggable.hint[0]).attr('data-layoutitem')
      );

      if (hint.ItemId) {
        item.Button = hint;
        item.ButtonGroup = null;
      } else {
        item.ButtonGroup = hint;
        item.Button = null;
        group = true;
      }

      hint.Id = hint.ItemId;
      hint.TypeId = hint.ItemTypeId;
      hint.$$button = {
        ItemId: hint.Id,
        ItemTypeId: hint.TypeId,
      };

      // The item being dropped on
      var pageNumber = angular
        .element(e.dropTarget[0].children[0])
        .attr('data-pagenumber');
      var index = null;

      if (group) {
        index = listHelper.findIndexByFieldValue(
          $scope.layoutItems,
          'Text',
          hint.GroupName
        );

        if (index != -1) {
          $scope.setEmptyPages(pageNumber);
          $scope.layoutItems.splice(index, 1);
          $scope.chartingButtonLayout.Pages[pageNumber].Favorites.push(item);
          chartingFavoritesFactory.SetSelectedChartingFavorites(
            $scope.layoutItems,
            $scope.chartingButtonLayout,
            true,
            $scope.pageSelected
          );
        }
      } else {
        if (pageNumber == $scope.pageSelected) {
          $scope.layoutItems.push(
            chartingFavoritesFactory.SetChartingButtonLayout(
              hint,
              $scope.services,
              $scope.conditions
            )
          );
          chartingFavoritesFactory.SetSelectedChartingFavorites(
            $scope.layoutItems,
            $scope.chartingButtonLayout,
            true,
            $scope.pageSelected
          );
        } else if (hint && hint.ItemId && hint.ItemId !== 'selectedButtons') {
          if (!$scope.chartingButtonLayout.Pages[pageNumber]) {
            $scope.chartingButtonLayout.Pages[pageNumber] = { Favorites: [] };
          }
          $scope.chartingButtonLayout.Pages[pageNumber].Favorites.push(item);

          index = listHelper.findIndexByFieldValue(
            $scope.layoutItems,
            'Id',
            hint.Id
          );
          if (index != -1) {
            $scope.layoutItems.splice(index, 1);
          }
          chartingFavoritesFactory.SetSelectedChartingFavorites(
            $scope.layoutItems,
            $scope.chartingButtonLayout,
            true,
            $scope.pageSelected
          );
        }
      }
    };

    $scope.getServiceCode = function (serviceCode) {
      var index = null;
      index = listHelper.findIndexByFieldValue(
        $scope.services,
        'ServiceCodeId',
        serviceCode
      );
      if (index !== -1) {
        return $scope.services[index].Code;
      }
    };

    // Watch the factory for when the page changes
    $scope.setCurrentPage = function (nv) {
      if (_.isNumber(nv)) {
        $scope.currentPageCopy = _.clone(nv);
        $scope.selectPage(nv);
      } else {
        if ((!_.isEmpty(nv) && !_.isUndefined(nv) && !nv.DataTag) || nv == 0) {
          $scope.selectPage($scope.currentPageCopy);
        }
      }
    };

    // Check all pages for charting buttons to keep the navigation available
    $scope.getNavigationStatus = function () {
      $scope.navigationEnabled = false;
      if ($scope.chartingButtonLayout) {
        angular.forEach($scope.chartingButtonLayout.Pages, function (page) {
          if (page.Favorites.length > 0) {
            $scope.navigationEnabled = true;
          }
        });
      }
    };

    // Set empty pages
    $scope.setEmptyPages = function (pageToCreate) {
      for (var i = 0; i <= pageToCreate; i++) {
        if (!$scope.chartingButtonLayout.Pages[i]) {
          $scope.chartingButtonLayout.Pages[i] = { Favorites: [] };
        }
      }
    };
  }

  ChartingControlsController.prototype = Object.create(BaseCtrl);
})();

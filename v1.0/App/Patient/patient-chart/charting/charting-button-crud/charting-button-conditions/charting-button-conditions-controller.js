'use strict';
angular
  .module('Soar.Patient')
  .controller('ChartingButtonConditionsController', [
    '$scope',
    '$timeout',
    'referenceDataService',
    'ListHelper',
    'toastrFactory',
    '$filter',
    'localize',
    'ChartingFavoritesFactory',
    'ConditionsService',
    'FeatureFlagService',
    'FuseFlag',
    function (
      $scope,
      $timeout,
      referenceDataService,
      listHelper,
      toastrFactory,
      $filter,
      localize,
      chartingFavoritesFactory,
      conditionsService,
      featureFlagService,
      fuseFlag
    ) {
      var ctrl = this;

      ctrl.$onInit = function () {
        $scope.conditions = [];
        $scope.filterBy = '';
        ctrl.getConditions();
      };

      // filtering function
      $scope.conditionsFilter = function (item) {
        var filter = $scope.filterBy;
        filter = filter.toLowerCase();
        if (
          (item.Description &&
            item.Description.toLowerCase().indexOf(filter) !== -1) ||
          filter.length == 0
        ) {
          return true;
        }
        return false;
      };

      // updating conditions when items are added or removed from selectedLayoutItems
      $scope.$watch(
        function () {
          return chartingFavoritesFactory.SelectedChartingFavorites;
        },
        function (nv, ov) {
          $scope.filterConditions();
        },
        true
      );

      //#region conditions api

      /**
       * getting the list of conditions.
       *
       */
      ctrl.getConditions = function () {
        featureFlagService.getOnce$(fuseFlag.UsePracticeApiForConditions).subscribe(value => {
          if (value) {
            return conditionsService.getAll()
              .then(conditions => {
                ctrl.copyConditionsForController(conditions);
              })
          } else {
            return referenceDataService
              .getData(referenceDataService.entityNames.conditions)
              .then(function (conditions) {
                ctrl.copyConditionsForController(conditions);
              });
          }
        })
      };

      ctrl.copyConditionsForController = function (conditions) {
        $scope.loadingConditions = false;
        if (conditions) {
          angular.forEach(conditions, function (cond) {
            cond.$$button = {
              ItemTypeId: '1',
              ItemId: cond.ConditionId,
            };
            cond.IconUrl = $scope.getConditionChartIconUrl(cond);
            $scope.conditionsBackup.push(cond);
          });
          $scope.conditions = angular.copy(conditions);
        }
        $scope.filterConditions();
      }

      //#endregion

      //#region drag directive functions

      // used by k-hint to draw duplicate button to display while dragging
      $scope.draggableHint = function (e) {
        return angular.element(e).clone();
      };

      // used by k-dragend to cleanup up hollow class
      $scope.onDragEnd = function (e) {
        var draggable = angular.element(e);
        draggable.removeClass('hollow');
      };

      // used by k-dragstart to add hollow class
      $scope.onDragStart = function () {
        $scope.$apply(function () {
          $scope.draggableClass = 'hollow';
        });
      };

      //#endregion

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

      $scope.filterConditions = function () {
        var selectedCondIds = [];
        angular.forEach(
          chartingFavoritesFactory.SelectedChartingFavorites,
          function (page) {
            angular.forEach(page.Favorites, function (layoutItem) {
              // only looking for conditions
              if (layoutItem.Button != null) {
                var condId = layoutItem.Button.ItemId;
                selectedCondIds.push(condId);
                var index = listHelper.findIndexByFieldValue(
                  $scope.conditions,
                  'ConditionId',
                  condId
                );
                if (index >= 0) {
                  // if we find in conditions we need to refresh the iconUrl
                  layoutItem.IconUrl = $scope.getConditionChartIconUrl(
                    $scope.conditions[index]
                  );
                  // if we find it in conditions, then it needs to be removed
                  $scope.conditions.splice(index, 1);
                }
              } else if (layoutItem.ButtonGroup != null) {
                angular.forEach(
                  layoutItem.ButtonGroup.Buttons,
                  function (button) {
                    var condId = button.ItemId;
                    selectedCondIds.push(condId);
                    var index = listHelper.findIndexByFieldValue(
                      $scope.conditions,
                      'ConditionId',
                      condId
                    );
                    if (index >= 0) {
                      // if we find it in conditions, then it needs to be removed
                      $scope.conditions.splice(index, 1);
                    }
                  }
                );
              }
            });
          }
        );
        angular.forEach($scope.conditionsBackup, function (cond) {
          var indexInConds = listHelper.findIndexByFieldValue(
            $scope.conditions,
            'ConditionId',
            cond.ConditionId
          );
          var indexInSelectedConds = selectedCondIds.indexOf(cond.ConditionId);
          if (indexInConds === -1 && indexInSelectedConds === -1) {
            // if cond from conditionsBackup is not in conditions or selectedCondIds, we need to add it back to conditions (remove scenario)
            $scope.conditions.push(cond);
          }
        });
      };
    },
  ]);

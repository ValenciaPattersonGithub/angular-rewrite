(function () {
  'use strict';

  angular
    .module('Soar.BusinessCenter')
    .controller('FeeScheduleEditController', FeeScheduleEditController);

  FeeScheduleEditController.$inject = [
    '$rootScope',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'localize',
    '$location',
    '$routeParams',
    '$scope',
    'BusinessCenterServices',
    'ModalFactory',
    'SaveStates',
    'ListHelper',
    'referenceDataService',
    'LocationServices',
    'AmfaInfo',
    'serviceCodes',
    'feeLists',
    'ServiceTypesService',
    'FeatureFlagService',
    'FuseFlag',
  ];

  function FeeScheduleEditController(
    $rootScope,
    toastrFactory,
    $timeout,
    patSecurityService,
    localize,
    $location,
    $routeParams,
    $scope,
    businessCenterServices,
    modalFactory,
    saveStates,
    listHelper,
    referenceDataService,
    locationServices,
    amfaInfo,
    serviceCodes,
    feeLists,
    serviceTypesService,
    featureFlagService,
    fuseFlag,
  ) {
    var ctrl = this;
    ctrl.feeScheduleId = $routeParams.guid;
    $scope.editing = $routeParams.guid != null;
    if ($routeParams.IsCopy && $routeParams.IsCopy === 'true') {
      $scope.IsCopy = true;
      $scope.editing = false;
    } else {
      $scope.IsCopy = false;
    }
    $scope.hasErrors = false;
    $scope.feeScheduleName = '';
    $scope.serviceCodeGridDisplayData = [];
    $scope.serviceTypes = [];
    $scope.IsManagedCareAll = true;
    ctrl.feeScheduleData = {
      FeeScheduleGroupDtos: [],
      FeeScheduleDetailDtos: [],
    };
    $scope.locations = [];
    $scope.allowedLocations = [];
    $scope.permittedLocations = [];
    $scope.orderBy = {
      column: 'Code',
      asc: true,
    };
    $scope.currentMax = 0;

    $scope.serviceAmtForRow = function (row) {
      return _.isNumber(row.ServiceGroupDetails[0].AllowedAmount) &&
        row.ServiceGroupDetails[0].AllowedAmount < row.LocationFee
        ? row.LocationFee - row.ServiceGroupDetails[0].AllowedAmount
        : 0;
    };

    // Authorization
    ctrl.authAddAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-ifsch-add'
      );
    };

    ctrl.authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-ifsch-edit'
      );
    };

    ctrl.authAccess = function () {
      if ($scope.editing) {
        if (!ctrl.authEditAccess()) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-ins-ifsch-edit'),
            'Not Authorized'
          );
          $location.path('/');
        } else {
          ctrl.hasEditAccess = true;
        }
      } else {
        if (!ctrl.authAddAccess()) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-ins-ifsch-add'),
            'Not Authorized'
          );
          $location.path('/');
        } else {
          ctrl.hasAddAccess = true;
        }
      }
    };

    ctrl.authAccess();

    // Watches
    $scope.$watch('selectedServiceType', function (nv) {
      if (nv === '' && $scope.searchServiceCodesKeyboard === '') {
        $scope.serviceCodeGridDisplayData =
          $scope.serviceCodeGridDisplayDataAll;
      } else {
        ctrl.filterData();
      }
    });

    $scope.$watch('searchServiceCodesKeyword', function () {
      ctrl.filterData();
    });

    //service callbacks
    ctrl.saveOnSuccess = function () {
      referenceDataService.forceEntityExecution(
        referenceDataService.entityNames.feeLists
      );
      referenceDataService.forceEntityExecution(
        referenceDataService.entityNames.serviceCodes
      );
      if ($scope.editing) {
        toastrFactory.success(
          localize.getLocalizedString('Fee Schedule updated successfully'),
          localize.getLocalizedString('Success')
        );
        $location.path(
          '/BusinessCenter/Insurance/FeeSchedule/FeeScheduleDetails/' +
            ctrl.feeScheduleId
        );
      } else {
        toastrFactory.success(
          localize.getLocalizedString('Fee Schedule created successfully'),
          localize.getLocalizedString('Success')
        );
        $location.path('/BusinessCenter/Insurance/FeeSchedule');
      }
    };

    ctrl.saveOnError = function () {
      if ($scope.editing) {
        toastrFactory.error(
          localize.getLocalizedString('Failed to update Fee Schedule'),
          localize.getLocalizedString('Server Error')
        );
      } else {
        toastrFactory.error(
          localize.getLocalizedString('Failed to create Fee Schedule'),
          localize.getLocalizedString('Server Error')
        );
      }
      ctrl.scrollFeeScheduleInputIntoView();
    };

    $scope.checkForDuplicatesGetSuccess = function (successResponse) {
      $scope.duplicateFeeScheduleName = successResponse.Value;

      if ($scope.duplicateFeeScheduleName) {
        $scope.uniqueFeeScheduleServerMessage = localize.getLocalizedString(
          'Fee Schedule name must be unique'
        );
      }
    };

    $scope.checkForDuplicatesGetFailure = function () {
      $scope.duplicateFeeScheduleName = true;
      $scope.uniqueFeeScheduleServerMessage = localize.getLocalizedString(
        'Could not verify unique fee schedule name. Please try again'
      );
    };

    ctrl.getFeeScheduleByIdSuccess = function (successResponse) {
      ctrl.feeScheduleData = successResponse.Value;
    };

    ctrl.getFeeScheduleByIdFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error while attempting to retrieve fee schedule details.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    ctrl.getPermittedLocationsSuccess = function (res) {
      $scope.permittedLocations = res.Value;
    };

    //Click Events
    $scope.save = function () {
      if (!ctrl.validate()) {
        return;
      }
      var submitObject = angular.copy(ctrl.feeScheduleData);
      //First, add FeeScheduleGroups that didn't previously exist
      _.each($scope.LocationGroups, function (newGroup) {
        if (!newGroup.FeeScheduleGroupId) {
          submitObject.FeeScheduleGroupDtos.push({
            ObjectState: saveStates.Add,
            FeeScheduleId: submitObject.FeeScheduleId,
            LocationIds: _.map(newGroup.Locations, 'LocationId'),
            SortOrder: newGroup.SortOrder,
            FeeScheduleGroupDetails: [],
          });
        }
      });
      //Next, loop through each service to figure out detail and group details
      _.each($scope.serviceCodeGridDisplayDataAll, function (service) {
        //foreach service
        var needsDetail = false;
        _.each(service.ServiceGroupDetails, function (groupDetail) {
          //foreach group detail on that service
          //either update the existing detail on the group or add a new detail to the group
          var group = _.find(
            submitObject.FeeScheduleGroupDtos,
            function (group) {
              return group.SortOrder == groupDetail.SortOrder;
            }
          );
          if (
            groupDetail.FeeScheduleGroupDetailId != null &&
            groupDetail.FeeScheduleGroupDetailId != 0
          ) {
            var detail = _.find(group.FeeScheduleGroupDetails, function (dt) {
              return (
                dt.FeeScheduleGroupDetailId ==
                groupDetail.FeeScheduleGroupDetailId
              );
            });
            if (detail.AllowedAmount !== groupDetail.AllowedAmount) {
              detail.ObjectState =
                _.isNumber(groupDetail.AllowedAmount) &&
                groupDetail.AllowedAmount >= 0
                  ? saveStates.Update
                  : saveStates.Delete;
              detail.AllowedAmount = groupDetail.AllowedAmount;
            } else {
              detail.ObjectState = saveStates.None;
            }
            needsDetail =
              detail.ObjectState == saveStates.Delete ? needsDetail : true;
          } else {
            //if detail didn't exist
            if (
              _.isNumber(groupDetail.AllowedAmount) &&
              groupDetail.AllowedAmount >= 0
            ) {
              //there is an allowed amount, add it to the corresponding location group
              group.FeeScheduleGroupDetails.push({
                ObjectState: saveStates.Add,
                FeeScheduleGroupId: group.FeeScheduleGroupId,
                ServiceCodeId: service.ServiceCodeId,
                AllowedAmount: groupDetail.AllowedAmount,
              });
              needsDetail = true;
            }
          }
        });

        //figure out detail object state
        var detail = _.find(submitObject.FeeScheduleDetailDtos, function (dt) {
          return dt.ServiceCodeId === service.ServiceCodeId;
        });
        if (detail && needsDetail) {
          //update or none if have and need
          detail.ObjectState =
            detail.IsManagedCare != service.IsManagedCare
              ? saveStates.Update
              : saveStates.None;
          detail.IsManagedCare = service.IsManagedCare;
        } else if (needsDetail) {
          //add if need and don't have
          submitObject.FeeScheduleDetailDtos.push({
            ServiceCodeId: service.ServiceCodeId,
            IsManagedCare: service.IsManagedCare,
            ObjectState: saveStates.Add,
            FeeScheduleId: submitObject.FeeScheduleId,
          });
        } else if (detail) {
          //delete if have and don't need
          detail.ObjectState = saveStates.Delete;
        } //do nothing if don't have and don't need
      });

      //Finally, figure out object states for FeeScheduleGroups that already existed
      _.each(submitObject.FeeScheduleGroupDtos, function (group) {
        if (group.ObjectState !== saveStates.Add) {
          var newGroup = _.find($scope.LocationGroups, function (gp) {
            return gp.FeeScheduleGroupId == group.FeeScheduleGroupId;
          });
          if (newGroup) {
            var detail = _.find(group.FeeScheduleGroupDetails, function (dt) {
              return dt.ObjectState !== saveStates.None;
            });
            var newIds = _.map(newGroup.Locations, 'LocationId');
            group.ObjectState =
              _.isEqual(
                _.sortBy(group.LocationIds, function (num) {
                  return num;
                }),
                _.sortBy(newIds, function (num) {
                  return num;
                })
              ) && !detail
                ? saveStates.None
                : saveStates.Update;
            group.LocationIds = newIds;
          } else {
            group.ObjectState = saveStates.Delete;
          }
        }
      });

      submitObject.FeeScheduleName = $scope.feeScheduleName;
      if ($scope.editing) {
        businessCenterServices.FeeSchedule.update(
          submitObject,
          ctrl.saveOnSuccess,
          ctrl.saveOnError
        );
      } else {
        businessCenterServices.FeeSchedule.save(
          submitObject,
          ctrl.saveOnSuccess,
          ctrl.saveOnError
        );
      }
    };

    $scope.cancel = function () {
      if (
        angular.equals(
          ctrl.initialData,
          $scope.serviceCodeGridDisplayDataAll
        ) &&
        !$scope.feeScheduleName
      ) {
        $location.path('/BusinessCenter/Insurance/FeeSchedule');
      } else {
        modalFactory.CancelModal().then(ctrl.confirmCancel);
      }
    };
    ctrl.confirmCancel = function () {
      $location.path('/BusinessCenter/Insurance/FeeSchedule');
    };

    ctrl.scrollFeeScheduleInputIntoView = function () {
      var element = angular.element('#formDiv');
      element.get(0).scrollIntoView();
    };

    $scope.changeGridSorting = function (column) {
      var asc = $scope.orderBy.column === column ? !$scope.orderBy.asc : true;
      $scope.orderBy = {
        column: column,
        asc: asc,
      };
    };

    $scope.checkForDuplicates = function () {
      if ($scope.feeScheduleName) {
        var feeScheduleId = $scope.editing
          ? ctrl.feeScheduleId
          : '00000000-0000-0000-0000-000000000000';
        businessCenterServices.FeeSchedule.checkDuplicateFeeScheduleName(
          {
            feeScheduleId: feeScheduleId,
            feeScheduleName: $scope.feeScheduleName,
          },
          $scope.checkForDuplicatesGetSuccess,
          $scope.checkForDuplicatesGetFailure
        );
      } else {
        $scope.duplicateFeeScheduleName = false;
      }
    };

    $scope.ToggleIsManagedCare = function () {
      $scope.IsManagedCareAll = !$scope.IsManagedCareAll;
      _.each($scope.serviceCodeGridDisplayData, function (row) {
        row.IsManagedCare = $scope.IsManagedCareAll;
      });
    };

    $scope.addNewColumn = function () {
      var maxGroup = _.maxBy($scope.LocationGroups, function (location) {
        return location.SortOrder;
      });
      maxGroup = _.maxBy(
        [$scope.currentMax, maxGroup.SortOrder],
        function (num) {
          return num;
        }
      ); //to make sure a new column doesn't get a deleted columns sortorder
      $scope.LocationGroups.push({
        Locations: [],
        SortOrder: maxGroup + 1,
        selectorValue: '',
        CanEdit: true,
      });
      _.each(ctrl.serviceCodesFiltered, function (service) {
        service.ServiceGroupDetails.push({
          SortOrder: maxGroup + 1,
          CanEdit: true,
        });
      });
    };

    $scope.updateGroup = function (group) {
      if (group.selectorValue) {
        if (
          !_.find(group.Locations, function (loc) {
            return loc.LocationId == group.selectorValue;
          })
        ) {
          group.Locations.push(
            _.find($scope.allowedLocations, function (loc) {
              return loc.LocationId == group.selectorValue;
            })
          );
          group.Locations = _.sortBy(group.Locations, function (loc) {
            return loc.NameLine1.toLowerCase();
          });
          $scope.allowedLocations = _.reject(
            $scope.allowedLocations,
            function (loc) {
              return loc.LocationId == group.selectorValue;
            }
          );
        }
        group.selectorValue = '';
      }
    };

    $scope.removeLocation = function (group, locationId) {
      group.Locations = _.reject(group.Locations, function (loc) {
        return loc.LocationId === locationId;
      });
      $scope.allowedLocations.push(
        _.find($scope.locations, function (loc) {
          return loc.LocationId === locationId;
        })
      );
      $scope.allowedLocations = _.sortBy(
        $scope.allowedLocations,
        function (loc) {
          return loc.NameLine1.toLowerCase();
        }
      );
    };

    $scope.removeGroup = function (group) {
      $scope.LocationGroups = _.reject($scope.LocationGroups, function (loc) {
        return loc.SortOrder === group.SortOrder;
      });
      $scope.allowedLocations = $scope.allowedLocations.concat(
        _.filter(group.Locations, function (loc) {
          return !loc.DeactivationTimeUtc;
        })
      );
      $scope.allowedLocations = _.sortBy(
        $scope.allowedLocations,
        function (loc) {
          return loc.NameLine1.toLowerCase();
        }
      );
      _.each(ctrl.serviceCodesFiltered, function (service) {
        service.ServiceGroupDetails = _.reject(
          service.ServiceGroupDetails,
          function (gp) {
            return gp.SortOrder == group.SortOrder;
          }
        );
      });
    };

    //helper methods
    ctrl.validate = function () {
      var missingAmount = false;
      //look for groups with no locations
      var missingGroup = _.find($scope.LocationGroups, function (group) {
        return !group.Locations || group.Locations.length === 0;
      });
      //look for groups with no allowed amounts
      _.each($scope.LocationGroups, function (group) {
        if (
          !_.find($scope.serviceCodeGridDisplayDataAll, function (service) {
            return _.find(service.ServiceGroupDetails, function (detail) {
              return (
                detail.SortOrder === group.SortOrder &&
                _.isNumber(detail.AllowedAmount) &&
                detail.AllowedAmount >= 0
              );
            });
          })
        ) {
          missingAmount = true;
          group.missingAmount = true;
        } else {
          group.missingAmount = false;
        }
      });
      $scope.hasErrors = !(
        $scope.frmFeeSchdl.$valid &&
        $scope.frmFeeSchdl.inpFeeSchdlName.$valid &&
        !$scope.duplicateFeeScheduleName &&
        !missingAmount &&
        !missingGroup
      );
      return !$scope.hasErrors;
    };

    ctrl.filterRowsByKeyword = function (rows) {
      return _.filter(rows, function (row) {
        if (
          row.Code.toLowerCase().includes(
            $scope.searchServiceCodesKeyword.toLowerCase()
          ) ||
          row.CdtCodeName.toLowerCase().includes(
            $scope.searchServiceCodesKeyword.toLowerCase()
          ) ||
          row.Description.toLowerCase().includes(
            $scope.searchServiceCodesKeyword.toLowerCase()
          )
        )
          return true;
      });
    };

    ctrl.filterRowsByServiceTypeId = function (rows) {
      return _.filter(rows, function (item) {
        if (item.ServiceTypeId == $scope.selectedServiceType) return true;
      });
    };

    ctrl.filterData = function () {
      if ($scope.searchServiceCodesKeyword && $scope.selectedServiceType) {
        // Service Type selected AND keyword search
        var filteredByServiceTypeGridDisplayData = ctrl.filterRowsByServiceTypeId(
          $scope.serviceCodeGridDisplayDataAll
        );
        $scope.serviceCodeGridDisplayData = ctrl.filterRowsByKeyword(
          filteredByServiceTypeGridDisplayData
        );
      } else if ($scope.searchServiceCodesKeyword) {
        // JUST keyword search
        $scope.serviceCodeGridDisplayData = ctrl.filterRowsByKeyword(
          $scope.serviceCodeGridDisplayDataAll
        );
      } else if ($scope.selectedServiceType) {
        // JUST Service Type selected
        $scope.serviceCodeGridDisplayData = ctrl.filterRowsByServiceTypeId(
          $scope.serviceCodeGridDisplayDataAll
        );
      } else {
        // filter cleared
        $scope.serviceCodeGridDisplayData =
          $scope.serviceCodeGridDisplayDataAll;
      }
    };

    ctrl.attachScroll = function () {
      $timeout(function () {
        var target1 = $('#allowed-amount-header');
        var target2 = $('#allowed-amount-body');
        var target3 = $('#allowed-amount-scroller');
        target1.scroll(function () {
          target2[0].scrollTop = this.scrollTop;
          target2[0].scrollLeft = this.scrollLeft;
          target3[0].scrollTop = this.scrollTop;
          target3[0].scrollLeft = this.scrollLeft;
        });
        target2.scroll(function () {
          target1[0].scrollTop = this.scrollTop;
          target1[0].scrollLeft = this.scrollLeft;
          target3[0].scrollTop = this.scrollTop;
          target3[0].scrollLeft = this.scrollLeft;
        });
        target3.scroll(function () {
          target1[0].scrollTop = this.scrollTop;
          target1[0].scrollLeft = this.scrollLeft;
          target2[0].scrollTop = this.scrollTop;
          target2[0].scrollLeft = this.scrollLeft;
        });
      });
    };

    //Initialize
    ctrl.setupPage = function () {
      $scope.userLocationId = JSON.parse(
        sessionStorage.getItem('userLocation')
      ).id;

      _.each($scope.locations, function (loc) {
        if (
          _.find($scope.permittedLocations, function (permLoc) {
            return loc.LocationId === permLoc.LocationId;
          })
        ) {
          loc.CanEdit = true;
        }
      });

      if ($scope.editing || $scope.IsCopy) {
        $scope.feeScheduleName = ctrl.feeScheduleData
          ? ctrl.feeScheduleData.FeeScheduleName
          : '';
        ctrl.originalFeeSchedule = angular.copy(ctrl.feeScheduleData);

        //set up Location Groups - mapped from fee schedule groups and location objects
        $scope.LocationGroups = [];
        $scope.allowedLocations = _.sortBy(
          _.filter($scope.locations, function (loc) {
            return !loc.DeactivationTimeUtc;
          }),
          function (loc) {
            return loc.NameLine1.toLowerCase();
          }
        );
        _.each(
          _.sortBy(ctrl.feeScheduleData.FeeScheduleGroupDtos, function (group) {
            return group.SortOrder;
          }),
          function (group) {
            //can only edit the column if can edit all of the locations in the column
            var canEdit = !_.find($scope.locations, function (loc) {
              return (
                _.includes(group.LocationIds, loc.LocationId) && !loc.CanEdit
              );
            });
            $scope.LocationGroups.push({
              Locations: angular.copy(
                _.sortBy(
                  _.filter($scope.locations, function (loc) {
                    return _.includes(group.LocationIds, loc.LocationId);
                  }),
                  function (loc) {
                    return loc.NameLine1.toLowerCase();
                  }
                )
              ),
              CanEdit: canEdit ? true : false,
              SortOrder: group.SortOrder,
              selectorValue: '',
              FeeScheduleGroupId: group.FeeScheduleGroupId,
            });
            $scope.allowedLocations = _.reject(
              $scope.allowedLocations,
              function (loc) {
                return (
                  _.includes(group.LocationIds, loc.LocationId) || !loc.CanEdit
                );
              }
            );

            // each service code needs a detail per group
            _.each(ctrl.serviceCodesFiltered, function (service) {
              var detail = _.find(group.FeeScheduleGroupDetails, function (dt) {
                return dt.ServiceCodeId == service.ServiceCodeId;
              });
              service.ServiceGroupDetails = service.ServiceGroupDetails
                ? service.ServiceGroupDetails
                : [];
              service.ServiceGroupDetails.push({
                SortOrder: group.SortOrder,
                AllowedAmount: detail ? detail.AllowedAmount : null,
                CanEdit: canEdit ? true : false,
                FeeScheduleGroupDetailId: detail
                  ? detail.FeeScheduleGroupDetailId
                  : null,
              });
              var specific = _.find(service.LocationSpecificInfo, {
                LocationId: $scope.userLocationId,
              });
              if (_.isNil(specific)) {
                service = referenceDataService.setFeesByLocation(
                  service,
                  $scope.userLocationId
                );
                service.LocationFee = service.$$locationFee;
              } else {
                service.LocationFee = specific.Fee;
              }
            });
            $scope.currentMax = group.SortOrder;
          }
        );

        //each service code needs a detail to hold the IsManagedCare flag
        _.each(ctrl.serviceCodesFiltered, function (service) {
          var detail = _.find(
            ctrl.feeScheduleData.FeeScheduleDetailDtos,
            function (dt) {
              return dt.ServiceCodeId === service.ServiceCodeId;
            }
          );
          service.IsManagedCare = detail ? detail.IsManagedCare : true;
        });
      } else {
        $scope.LocationGroups = [
          {
            Locations: angular.copy(
              _.sortBy(
                _.filter($scope.locations, function (loc) {
                  return loc.CanEdit && !loc.DeactivationTimeUtc;
                }),
                function (loc) {
                  return loc.NameLine1.toLowerCase();
                }
              )
            ),
            CanEdit: true,
            SortOrder: 0,
            selectorValue: '',
          },
        ];
        _.each(ctrl.serviceCodesFiltered, function (service) {
          service.ServiceGroupDetails = _.map(
            $scope.LocationGroups,
            function (location) {
              return {
                SortOrder: location.SortOrder,
                AllowedAmount: null,
                CanEdit: $scope.LocationGroups[0].CanEdit,
              };
            }
          );
          service.IsManagedCare = true;
          var specific = _.find(service.LocationSpecificInfo, {
            LocationId: $scope.userLocationId,
          });
          if (_.isNil(specific)) {
            service = referenceDataService.setFeesByLocation(
              service,
              $scope.userLocationId
            );
            service.LocationFee = service.$$locationFee;
          } else {
            service.LocationFee = specific.Fee;
          }
        });
      }
      ctrl.initialData = angular.copy(ctrl.serviceCodesFiltered);
      $scope.serviceCodeGridDisplayData = ctrl.serviceCodesFiltered;
      $scope.serviceCodeGridDisplayDataAll = ctrl.serviceCodesFiltered;
      ctrl.attachScroll();
      if ($scope.IsCopy) {
        // if copy, we want to treat it like it is new after loading in all the data from the copy
        ctrl.feeScheduleData = {
          FeeScheduleGroupDtos: [],
          FeeScheduleDetailDtos: [],
        };
      }
      $timeout(function () {
        $rootScope.$broadcast('reset-top');
      });
    };

    ctrl.setupCalls = function () {
      var services = [
        {
          Call: locationServices.getPermittedLocations,
          Params: { actionId: amfaInfo['soar-ins-ifsch-edit'].ActionId },
          OnSuccess: ctrl.getPermittedLocationsSuccess,
          OnError: ctrl.getPermittedLocationsFailure,
        },
      ];

      if ($scope.editing || $scope.IsCopy) {
        services.push({
          Call: businessCenterServices.FeeSchedule.getById,
          Params: { feeScheduleId: ctrl.feeScheduleId, IsCopy: $scope.IsCopy },
          OnSuccess: ctrl.getFeeScheduleByIdSuccess,
          OnError: ctrl.getFeeScheduleByIdFailure,
        });
      }

      return services;
    };

    ctrl.init = function () {
      $scope.locations = referenceDataService.get(
        referenceDataService.entityNames.locations
      );
      ctrl.serviceCodesFiltered = _.filter(
        serviceCodes,
        function (serviceCode) {
          return (
            !serviceCode.IsSwiftPickCode &&
            serviceCode.CdtCodeName &&
            serviceCode.IsActive
          );
        }
      );

      modalFactory.LoadingModal(ctrl.setupCalls).then(ctrl.setupPage);
      serviceTypesService.getAll()
        .then(function (serviceTypes) {
          $scope.serviceTypes = serviceTypes;
        });
    };

    ctrl.init();
  }
})();

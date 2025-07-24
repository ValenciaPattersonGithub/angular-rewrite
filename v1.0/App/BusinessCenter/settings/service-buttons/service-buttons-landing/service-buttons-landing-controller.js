'use strict';

var app = angular.module('Soar.BusinessCenter');
var ServiceButtonsLandingController = app.controller(
  'ServiceButtonsLandingController',
  [
    '$scope',
    'localize',
    'patSecurityService',
    '$location',
    'ServiceButtons',
    'ServiceButtonsService',
    'ListHelper',
    'ModalFactory',
    'toastrFactory',
    function (
      $scope,
      localize,
      patSecurityService,
      $location,
      serviceButtons,
      serviceButtonsService,
      listHelper,
      modalFactory,
      toastrFactory
    ) {
      var ctrl = this;
      $scope.loadingList = true;
      $scope.filteringList = false;
      $scope.filteringMessageNoResults = localize.getLocalizedString(
        'There are no {0} that match the filter.',
        ['Service Buttons']
      );
      $scope.loadingMessageNoResults = localize.getLocalizedString(
        'There are no {0}.',
        ['Service Buttons']
      );

      ctrl.serviceButtonMarkedForDeletion = null;

      // getting the service buttons from the resolve
      $scope.serviceButtons = [];
      if (serviceButtons.Value) {
        $scope.serviceButtons = serviceButtons.Value;
        $scope.loadingList = false;
      }

      // ensure that only one modal can open at once
      $scope.modalIsOpen = false;
      // instantiate add/edit modal and pass data to it, etc.
      $scope.addOrEditServiceButton = function (serviceButtonSelected) {
        if ($scope.modalIsOpen == false) {
          $scope.modalIsOpen = true;
          var hasAccess = false;

          var serviceButton;
          if (!serviceButtonSelected) {
            serviceButton = {
              ServiceButtonId: '',
              Description: '',
            };
          } else {
            serviceButton = angular.copy(serviceButtonSelected);
          }

          if (!serviceButtonSelected) {
            hasAccess = ctrl.authAddAccess();
          } else {
            hasAccess = ctrl.authEditAccess();
          }

          if (hasAccess) {
            var modalInstance = modalFactory.Modal({
              templateUrl:
                'App/BusinessCenter/settings/service-buttons/service-buttons-crud/service-buttons-crud.html',
              controller: 'ServiceButtonsCrudController',
              windowClass: 'modal-65',
              backdrop: 'static',
              amfa: !serviceButtonSelected
                ? 'soar-biz-svcbtn-add'
                : 'soar-biz-svcbtn-edit',
              resolve: {
                ServiceButton: function () {
                  return serviceButton;
                },
                ServiceButtons: function () {
                  return $scope.serviceButtons;
                },
              },
            });
            modalInstance.result.then(ctrl.serviceButtonEditedOrAdded);
          } else {
            ctrl.notifyNotAuthorized();
          }
        }
      };

      // Handle response from modal pop-up after user add or edit service button
      ctrl.serviceButtonEditedOrAdded = function (
        serviceButtonReturnedFromModal
      ) {
        ctrl.serviceButtonReturnedFromModal = serviceButtonReturnedFromModal;
        $scope.modalIsOpen = false;
        // if we don't get back a service button from the modal, there was no create/update, no need to refresh the list
        if (serviceButtonReturnedFromModal) {
          serviceButtonsService.get(
            ctrl.serviceButtonsGetSuccess,
            ctrl.serviceButtonsGetFailure
          );
        }
        ctrl.serviceButtonReturnedFromModal = null;
      };

      // Handle success response from modal pop-up after user has added or updated service button
      ctrl.serviceButtonsGetSuccess = function (res) {
        if (res.Value) {
          // refreshing the list on successful get all, should have new/updated service button
          $scope.serviceButtons = res.Value;
        }
      };

      // Handle error response from modal pop-up if something goes wrong after user has added or updated service button
      ctrl.serviceButtonsGetFailure = function (res) {
        // manually updating the service buttons list if get all fails
        var index = listHelper.findIndexByFieldValue(
          $scope.serviceButtons,
          'ServiceButtonId',
          ctrl.serviceButtonReturnedFromModal.Value.ServiceButtonId
        );
        if (index !== -1) {
          $scope.serviceButtons[index] =
            ctrl.serviceButtonReturnedFromModal.Value;
        } else {
          $scope.serviceButtons.push(ctrl.serviceButtonReturnedFromModal.Value);
        }
      };

      // Ask user a confirmation before proceeding to delete service button
      $scope.deleteServiceButton = function (serviceButtonSelected) {
        if (ctrl.authDeleteAccess()) {
          ctrl.serviceButtonMarkedForDeletion = serviceButtonSelected;
          modalFactory
            .DeleteModal(
              'Service Button',
              serviceButtonSelected.Description,
              true,
              'This service button will be deleted from all service codes and user favorites.'
            )
            .then(ctrl.confirmDelete, ctrl.cancelDelete);
        } else {
          ctrl.notifyNotAuthorized();
        }
      };

      // Make call to server API for deleting service button
      ctrl.confirmDelete = function () {
        if (ctrl.authDeleteAccess()) {
          var params = {};
          params.serviceButtonId =
            ctrl.serviceButtonMarkedForDeletion.ServiceButtonId;
          serviceButtonsService.delete(
            params,
            ctrl.serviceButtonDeletionSuccess,
            ctrl.serviceButtonDeletionFailure
          );
        } else {
          ctrl.notifyNotAuthorized();
        }
      };

      // Handle success response from server after user has requested to delete service button
      ctrl.serviceButtonDeletionSuccess = function (res) {
        toastrFactory.success(
          localize.getLocalizedString('Delete successful.'),
          localize.getLocalizedString('Success')
        );
        $scope.serviceButtons.splice(
          listHelper.findIndexByFieldValue(
            $scope.serviceButtons,
            'ServiceButtonId',
            ctrl.serviceButtonMarkedForDeletion.ServiceButtonId
          ),
          1
        );
        ctrl.serviceButtonMarkedForDeletion = null;
      };

      // Handle error from server after user has requested to delete service button
      ctrl.serviceButtonDeletionFailure = function (res) {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to delete the {0}. Please try again.',
            ['Service Button']
          ),
          localize.getLocalizedString('Server Error')
        );
        ctrl.serviceButtonMarkedForDeletion = null;
      };

      // un-mark service button for deletion
      ctrl.cancelDelete = function () {
        ctrl.serviceButtonMarkedForDeletion = null;
      };

      // #region sorting

      // scope variable that holds ordering details
      $scope.orderBy = {
        field: 'Description',
        asc: true,
      };

      // function to apply orderBy functionality
      $scope.changeSortingForGrid = function (field) {
        var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
        $scope.orderBy = {
          field: field,
          asc: asc,
        };
      };

      // #endregion

      //#region authorization
      $scope.soarAuthServiceButtonViewKey = 'soar-biz-svcbtn-view';
      $scope.soarAuthServiceButtonAddKey = 'soar-biz-svcbtn-add';
      $scope.soarAuthServiceButtonEditKey = 'soar-biz-svcbtn-edit';
      $scope.soarAuthServiceButtonDeleteKey = 'soar-biz-svcbtn-delete';

      // Check if user has access to view this area
      ctrl.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthServiceButtonViewKey
        );
      };

      // Check if user has access to view this area
      ctrl.authAddAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthServiceButtonAddKey
        );
      };

      // Check if user has access to view this area
      ctrl.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthServiceButtonEditKey
        );
      };

      // Check if user has access to view this area
      ctrl.authDeleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthServiceButtonDeleteKey
        );
      };

      // Check user access for different actions available on screen
      $scope.authAccess = function () {
        if (!ctrl.authViewAccess()) {
          ctrl.notifyNotAuthorized();
          $location.path('/');
        }
      };

      $scope.authAccess();

      //Notify user, he is not authorized to access current area
      ctrl.notifyNotAuthorized = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
      };
      //#endregion

      //#region filter

      $scope.filteredServiceButtons = $scope.ServiceButtons;

      // contains filter
      $scope.filterBy = '';
      $scope.serviceButtonsFilter = function (item) {
        var filter = $scope.filterBy;
        filter = filter.toLowerCase();
        if (
          (item.Description &&
            item.Description.toLowerCase().indexOf(filter) != -1) ||
          filter.length == 0
        ) {
          return true;
        }
        return false;
      };

      $scope.$watch(
        'filterBy',
        function (nv) {
          $scope.filteringList = true;
        },
        true
      );

      //#endregion
    },
  ]
);

ServiceButtonsLandingController.resolveServiceButtons = {
  ServiceButtons: [
    'ServiceButtonsService',
    function (serviceButtonsService) {
      return serviceButtonsService.get().$promise;
    },
  ],
};

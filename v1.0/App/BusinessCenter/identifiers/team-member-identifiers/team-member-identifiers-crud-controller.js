'use strict';

var app = angular.module('Soar.BusinessCenter');

var TeamMemberIdentifierController = app.controller(
  'TeamMemberIdentifierController',
  [
    '$scope',
    '$timeout',
    'toastrFactory',
    'localize',
    'patSecurityService',
    'AuthZService',
    '$location',
    '$rootScope',
    '$routeParams',
    'ListHelper',
    'ModalFactory',
    'KendoGridFactory',
    'TeamMemberIdentifierService',
    'TeamMemberIdentifierKendoFactory',
    'TeamMemberIdentifierFactory',
    'MasterTeamMemberIdentifierQualifiers',
    function (
      $scope,
      $timeout,
      toastrFactory,
      localize,
      patSecurityService,
      authZ,
      $location,
      $rootScope,
      $routeParams,
      listHelper,
      modalFactory,
      kendoGridFactory,
      teamMemberIdentifierService,
      teamMemberIdentifierKendoFactory,
      teamMemberIdentifierFactory,
      masterTeamMemberIdentifierQualifiers
    ) {
      //breadcrumbs
      $scope.dataForCrudOperation = {};
      $scope.dataForCrudOperation.DataHasChanged = false;
      $scope.dataForCrudOperation.BreadCrumbs = [
        {
          name: localize.getLocalizedString('Practice Settings'),
          path: '/BusinessCenter/PracticeSettings/',
          title: 'Practice Settings',
        },
        {
          name: localize.getLocalizedString(
            'Team Member Additional Identifiers'
          ),
          path: '/Users/UserIdentifiers/',
          title: 'Team Member Additional Identifiers',
        },
      ];

      var ctrl = this;
      $scope.editMode = false;
      // filter list
      $scope.searchFilter = '';
      // list of locations with additional identifier we are deleting
      $scope.locationsWithIdentifier = [];
      // indicator we are searching for locations with the additional identifier to be deleted
      $scope.checkingForLocations = false;
      // indicator that additional identifier is being deleted
      $scope.deletingIdentifier = false;
      // indicator that we are loading the list
      $scope.loading = true;
      // master list
      $scope.teamMemberAdditionalIdentifiers = [];
      //kendo version of list for kendo - must contain something
      $scope.identifiersKendo = new kendo.data.ObservableArray(
        $scope.teamMemberAdditionalIdentifiers
      );

      // turning off back button for use in modal on new practice setup page
      $scope.showBackButton =
        $routeParams.subcategory === 'UserIdentifiers' ? true : false;

      //#region manage breadcrumbs

      // handle URL update for breadcrumbs
      $scope.changePageState = function (breadcrumb) {
        ctrl.currentBreadcrumb = breadcrumb;
        if (
          $scope.dataForCrudOperation.DataHasChanged &&
          $scope.dataForCrudOperation.BreadCrumbs.length > 2
        ) {
          modalFactory.CancelModal().then(ctrl.changePath);
        } else {
          ctrl.changePath();
        }
        document.title = breadcrumb.title;
      };

      // change URL
      ctrl.changePath = function () {
        if (
          ctrl.currentBreadcrumb.name ===
          localize.getLocalizedString('Additional Identifiers')
        ) {
          // Show the adjustment types
          $timeout(function () {
            ctrl.resetDataForCrud();
          }, 0);
        } else {
          // Jump to business-center page
          $location.url(ctrl.currentBreadcrumb.path);
          //cancel adding/modifying of additional identifier
          $scope.teamMemberIdentifiersGrid.dataSource.cancelChanges();
        }
      };
      //#endregion

      //#region Authorization

      $scope.hasCreateAccess = false;
      $scope.hasDeleteAccess = false;
      $scope.hasEditAccess = false;

      $scope.authCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-aitm-manage'
        );
      };

      $scope.authDeleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-aitm-manage'
        );
      };

      $scope.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-aitm-manage'
        );
      };

      $scope.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-aitm-view'
        );
      };

      $scope.authAccess = function () {
        if (!$scope.authViewAccess()) {
          toastrFactory.error(
            localize.getLocalizedString(
              'User is not authorized to access this area.'
            ),
            localize.getLocalizedString('Not Authorized')
          );
          event.preventDefault();
          $location.path('/');
        } else {
          $scope.hasCreateAccess = $scope.authCreateAccess();
          $scope.hasDeleteAccess = $scope.authDeleteAccess();
          $scope.hasEditAccess = $scope.authEditAccess();
        }
      };
      $scope.authAccess();

      var isLoading = true;
      //#endregion
      //#region buttons
      // Handle click event to create additional identifier
      $scope.createUserIdentifier = function () {
        //if (!$scope.teamMemberIdentifiersGrid.dataSource._filter) {
        isLoading = false;
        $scope.teamMemberIdentifiersGrid.dataSource.filter(null);
        $scope.teamMemberIdentifiersGrid.dataSource.cancelChanges();
        $scope.editMode = false;
        $scope.teamMemberIdentifiersGrid.addRow();
        //}
      };

      // Handle click event to edit
      $scope.editUserIdentifier = function (userIdentifier) {
        teamMemberIdentifierFactory.set(userIdentifier);
        $scope.locationIdentifierId =
          userIdentifier.MasterTeamMemberIdentifierId;
        $scope.editMode = true;
      };

      // Handle click event to return to business center
      $scope.goToSettings = function () {
        $rootScope.$broadcast('soar:go-back-options');
      };

      //#endregion

      //#region master list

      // Method to get the master list

      $scope.getUserIdentifiers = function () {
        teamMemberIdentifierService.get(
          $scope.userIdentifiersGetSuccess,
          $scope.userIdentifiersGetFailure
        );
      };

      $scope.userIdentifiersGetSuccess = function (res) {
        // indicate we are getting the list
        $scope.loading = false;
        $scope.userIdentifiers = res.Value;

        //populate kendo grid
        $scope.userIdentifiersKendo = new kendo.data.ObservableArray(
          $scope.userIdentifiers
        );
        //if (!$scope.teamMemberIdentifiersGrid)
        //    $scope.teamMemberIdentifiersGrid.dataSource.read();
      };

      $scope.userIdentifiersGetFailure = function () {
        $scope.loading = false;
        $scope.userIdentifiers = [];
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of additional identifiers. Refresh the page to try again.'
          ),
          localize.getLocalizedString('Error')
        );
      };

      $scope.getUserIdentifiers();

      //#endregion

      //#region delete additional identifier
      $scope.userIdentifierToDelete = {};

      // confirm the delete with user
      $scope.confirmingDelete = false;
      $scope.confirmDelete = function () {
        $scope.confirmingDelete = true;
      };

      $scope.deleteUserIdentifier = function () {
        $scope.confirmingDelete = false;
        $scope.deletinguserIdentifier = true;

        teamMemberIdentifierService.delete(
          { Id: $scope.userIdentifierToDelete.MasterLocationIdentifierId },
          function () {
            $scope.deleteUserIdentifierSuccess();
          },
          $scope.deleteUserIdentifierFailure
        );
      };

      $scope.deleteUserIdentifierSuccess = function () {
        //Refreshes the Kendo grid
        var index = listHelper.findIndexByFieldValue(
          $scope.userIdentifiers,
          'UserIdentifierName',
          $scope.userIdentifierToDelete.UserIdentifierName
        );
        if (index !== -1) {
          $scope.userIdentifiers.splice(index, 1);
        }
        toastrFactory.success(
          localize.getLocalizedString(
            'Successfully deleted the location additional identifier.'
          ),
          localize.getLocalizedString('Success')
        );
        $scope.deletingLocationIdentifier = false;
        $scope.userIdentifierToDelete = {};
      };

      $scope.deleteUserIdentifierFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to delete the location additional identifier. Try again.'
          ),
          localize.getLocalizedString('Error')
        );
        $scope.deletingLocationIdentifier = false;
        $scope.userIdentifierToDelete = {};
      };

      //Discard changes (delete);
      $scope.cancelDelete = function () {
        $scope.usersWithLocationIdentifier = [];
        $scope.checkingForLocations = false;
        $scope.confirmingDelete = false;
        $scope.userIdentifierToDelete = {};
      };

      //#endregion

      // Listens for changes to list and making kendo version of list
      $scope.$watch(
        'userIdentifiers',
        function (nv, ov) {
          if (!angular.equals(nv, ov)) {
            $scope.userIdentifiersKendo = new kendo.data.ObservableArray(
              $scope.userIdentifiers
            );
          }
        },
        true
      );

      //Kendo Grid
      $scope.locationIdentifiersList = {
        sortable: true,
        pageable: false,
        filterable: {
          mode: 'row',
          operators: {
            string: {
              startswith: 'Starts with',
              eq: 'Is equal to',
              neq: 'Is not equal to',
            },
          },
        },
        columns: [
          {
            field: 'Description',
            title: 'Additional Identifiers',
            filterable: {
              cell: {
                operator: 'contains',
              },
            },
          },
          {
            field: 'Qualifier',
            title: 'Qualifier',
          },
          {
            field: '',
            title: '',
            width: 40,
            template:
              '<button id="deleteButton{{ $index }}" check-auth-z="soar-biz-bizgrp-delete" ng-click="validateDelete(dataItem)" ng-disabled="deletingLocationIdentifier == true"class="pull-right icon-button"><i class="far fa-trash-alt fa-lg "></i></button>',
          },
        ],
      };

      $scope.teamMemberIdentifierConfirmOpt = {
        visible: false,
        resizable: false,
        scrollable: false,
        iframe: false,
        appendTo: 'body',
        actions: [],
      };

      ctrl.onDataBound = function () {
        if (!$scope.teamMemberIdentifiersGrid) {
          $scope.teamMemberIdentifiersGrid = angular
            .element('#teamMemberIdentifiersGrid')
            .data('kendoGrid');
        }
        var message = authZ.generateTitleMessage();
        var deleteBtn =
          '<button class="k-button k-button-icontext k-grid-customDelete disabled" disabled="disabled" title="' +
          message +
          '"><span class="k-icon k-delete"></span></button>';
        var editBtn =
          '<button class="k-button k-button-icontext k-grid-edit disabled" disabled="disabled" title="' +
          message +
          '"><span class="k-icon k-edit"></span></button>';
        angular.forEach(
          $scope.teamMemberIdentifiersGrid.items(),
          function (item) {
            if (!$scope.hasDeleteAccess) {
              angular
                .element(item)
                .find('.k-grid-customDelete')
                .replaceWith(deleteBtn);
            }
            if (!$scope.hasEditAccess) {
              angular.element(item).find('.k-grid-edit').replaceWith(editBtn);
            }
          }
        );
      };

      var gridEvent;
      $scope.teamMemberIdentifierKendo = {
        dataSource: teamMemberIdentifierKendoFactory.dataSource,
        sortable: true,
        pageable: false,
        editable: {
          mode: 'inline',
          createAt: 'top',
        },
        dataBound: function (e) {
          if ($('#txtSearch').prop('disabled')) {
            $('#txtSearch').prop('disabled', false);
            $scope.teamMemberIdentifiersGrid.dataSource.cancelChanges();
          }

          //if (isLoading) {
          //    if (this.dataSource) {
          //        isLoading = false;
          //        this.dataSource.data([]);
          //    }
          //}

          ctrl.onDataBound();
        },
        edit: function (e) {
          e.container.trigger('DOMNodeInserted');
          e.container.find('input[name=Description]').attr('maxlength', 24);
          $('#txtSearch').prop('disabled', true);
        },
        save: function (e) {
          //confirmation to modify the identifier will be displayed only for update, not for NEW
          if (!e.model.isNew()) {
            e.preventDefault();
            var msg =
              'Changes will take effect for all team members. Continue?';
            kendoGridFactory.openUpdateConfirm(
              gridEvent,
              e.model.uid,
              $scope.teamMemberIdentifiersGrid,
              $scope.teamMemberIdentifiersConfirm,
              msg
            );
          }
        },
        cancel: function (e) {
          $('#txtSearch').prop('disabled', false);
        },
        filterable: {
          mode: 'row',
        },
        columns: [
          {
            field: 'Description',
            title: 'Team Member Identifiers',
            filterable: {
              cell: {
                enabled: true,
                delay: 100,
                showOperators: false,
                operator: 'contains',
                template: function (args) {
                  kendoGridFactory.liveFilter(args);
                },
              },
            },
          },
          {
            field: 'Qualifier.Value',
            title: 'Qualifier',
            filterable: {
              cell: {
                template: function (args) {
                  args.element.kendoDropDownList({
                    dataSource: masterTeamMemberIdentifierQualifiers,
                    dataTextField: 'Text',
                    dataValueField: 'Value',
                    valuePrimitive: true,
                  });
                },
                showOperators: false,
              },
            },
            editor: function (container, options) {
              $("<input name='" + options.field + "'>")
                .appendTo(container)
                .kendoDropDownList({
                  dataSource: masterTeamMemberIdentifierQualifiers,
                  dataTextField: 'Text',
                  dataValueField: 'Value',
                  valuePrimitive: true,
                });
            },
            template: '#=Qualifier.Text#',
          },
          {
            attributes: { class: 'k-grid-commands' },
            command: [
              {
                name: 'customDelete',
                text: '',
                iconClass: 'fas fa-trash-alt',
                click: function (e) {
                  e.preventDefault();
                  if ($scope.hasDeleteAccess) {
                    var rowName = kendoGridFactory.rowDataItem(
                      e,
                      $scope.teamMemberIdentifiersGrid
                    ).Description;
                    var msg =
                      localize.getLocalizedString('Deleting ') +
                      '"' +
                      _.escape(rowName) +
                      '" will result in a loss of all information entered for this Additional Identifier. Continue?';
                    kendoGridFactory.openConfirm(
                      e,
                      $scope.teamMemberIdentifiersGrid,
                      $scope.teamMemberIdentifiersConfirm,
                      msg
                    );
                  }
                },
              },
              {
                name: 'edit',
                iconClass: 'fas fa-pencil-alt',
                text: { update: '', cancel: '', edit: '' },
                click: function (e) {
                  e.preventDefault();
                  gridEvent = e;
                },
              },
            ],

            title: '',
            width: '10%',
          },
        ],
      };
    },
  ]
);

// TODO : remove this later
// 'use strict';
// var app = angular.module('Soar.BusinessCenter');
// var AdjustmentTypesController = app.controller('AdjustmentTypesController', [
//   '$scope',
//   '$timeout',
//   'toastrFactory',
//   'AdjustmentTypesService',
//   'localize',
//   '$location',
//   '$rootScope',
//   'ModalFactory',
//   '$routeParams',
//   'patSecurityService',
//   'AuthZService',
//   'ListHelper',
//   function (
//     $scope,
//     $timeout,
//     toastrFactory,
//     adjustmentTypesService,
//     localize,
//     $location,
//     $rootScope,
//     modalFactory,
//     $routeParams,
//     patSecurityService,
//     authZ,
//     listHelper
//   ) {
//     //breadcrumbs
//     $scope.dataForCrudOperation = {};
//     $scope.dataForCrudOperation.DataHasChanged = false;
//     $scope.dataForCrudOperation.BreadCrumbs = [
//       {
//         name: localize.getLocalizedString('Practice Settings'),
//         path: '/BusinessCenter/PracticeSettings/',
//         title: 'Practice Settings',
//       },
//       {
//         name: localize.getLocalizedString('Adjustment Types'),
//         path: '/Business/Billing/AdjustmentTypes/',
//         title: 'Adjustment Types',
//       },
//     ];

//     var ctrl = this;
//     $scope.editMode = false;
//     // indicator that type is being deleted
//     $scope.deletingType = false;
//     // master list
//     $scope.adjustmentTypes = [];
//     //kendo version of list for kendo - must contain something
//     $scope.adjustmentTypesKendo = new kendo.data.ObservableArray(
//       $scope.adjustmentTypes
//     );

//     $scope.loadingAdjustmentTypes = false;

//     // turning off back button for use in modal on new practice setup page
//     $scope.showBackButton =
//       $routeParams.subcategory === 'AdjustmentTypes' ? true : false;

//     //#region manage breadcrumbs

//     // handle URL update for breadcrumbs
//     $scope.changePageState = function (breadcrumb) {
//       ctrl.currentBreadcrumb = breadcrumb;
//       if (
//         $scope.dataForCrudOperation.DataHasChanged &&
//         $scope.dataForCrudOperation.BreadCrumbs.length > 2
//       ) {
//         modalFactory.CancelModal().then(ctrl.changePath);
//       } else {
//         ctrl.changePath();
//       }
//       document.title = breadcrumb.title;
//     };

//     // change URL
//     ctrl.changePath = function () {
//       if (
//         ctrl.currentBreadcrumb.name ===
//         localize.getLocalizedString('Adjustment Types')
//       ) {
//         // Show the adjustment types
//         $timeout(function () {
//           ctrl.resetDataForCrud();
//         }, 0);
//       } else {
//         // Jump to business-center page
//         $location.url(_.escape(ctrl.currentBreadcrumb.path));
//       }
//       document.title = ctrl.currentBreadcrumb.title;
//     };
//     //#endregion

//     //#region buttons
//     // Handle click event to create type
//     $scope.createType = function () {
//       $scope.adjustmentTypeId = '';
//       $scope.editMode = true;

//       // Reset focus
//       $timeout(function () {
//         angular.element('#inpDescription').focus();
//       }, 100);
//     };

//     // Handle click event to edit type
//     $scope.editType = function (type) {
//       $scope.adjustmentTypeId = type.AdjustmentTypeId;
//       $scope.editMode = true;
//     };

//     // Handle click event to return to business center
//     $scope.goToSettings = function () {
//       $rootScope.$broadcast('soar:go-back-options');
//     };

//     //#endregion

//     //#region Method to get the adjustment types list

//     // Success callback handler to notify user after getting all adjustment types
//     ctrl.adjustmentTypesGetSuccess = function (successResponse) {
//       $scope.adjustmentTypes = successResponse.Value;

//       _.each($scope.adjustmentTypes, function (obj) {
//         obj.Category = obj.IsPositive ? 'Positive (+)' : 'Negative (-)';
//       });

//       $scope.loadingAdjustmentTypes = false;

//       //populate kendo grid
//       $scope.adjustmentTypesKendo = new kendo.data.ObservableArray(
//         $scope.adjustmentTypes
//       );
//     };

//     // Error callback handler to notify user after it failed to retrive all adjustment types
//     ctrl.adjustmentTypesGetFailure = function () {
//       $scope.adjustmentTypes = [];
//       $scope.loadingAdjustmentTypes = false;
//       toastrFactory.error(
//         localize.getLocalizedString(
//           'Failed to retrieve the list of {0}. Refresh the page to try again.',
//           ['Adjustment Types']
//         ),
//         localize.getLocalizedString('Server Error')
//       );
//     };

//     ctrl.getAdjustmentTypes = function () {
//       $scope.loadingAdjustmentTypes = true;
//       adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions(
//         { active: false },
//         ctrl.adjustmentTypesGetSuccess,
//         ctrl.adjustmentTypesGetFailure
//       );
//     };

//     // Get list of all adjustment types
//     ctrl.getAdjustmentTypes();
//     //#endregion
//     //#region Determine if the type can be deleted.
//     $scope.validateDelete = function (type) {
//       $scope.typeToDelete = type;
//       $scope.deletingType = true;
//       adjustmentTypesService.GetAdjustmentTypeAssociatedWithTransactions(
//         { adjustmentTypeId: type.AdjustmentTypeId },
//         ctrl.deleteCheckSuccess,
//         ctrl.deleteCheckFailure
//       );
//     };

//     ctrl.deleteCheckSuccess = function (resp) {
//       ctrl.confirmDelete(
//         resp.Value.IsAdjustmentTypeAssociatedWithTransactions,
//         resp.Value.IsSystemType,
//         resp.Value.IsDefaultTypeOnBenefitPlan
//       );
//       $timeout(function () {
//         angular.element('#btnConfirmDiscard').focus();
//       }, 300);
//     };

//     ctrl.deleteCheckFailure = function () {
//       $scope.deletingType = false;
//       $scope.typeToDelete = {};
//       toastrFactory.error(
//         localize.getLocalizedString(
//           'Failed to delete the AdjustmentType of {0}. Refresh the page to try again.',
//           ['Adjustment Types Delete']
//         ),
//         localize.getLocalizedString('Server Error')
//       );
//     };

//     //#endregion

//     //#region validateEdit functions
//     $scope.validateEdit = function (type) {
//       adjustmentTypesService.GetAdjustmentTypeAssociatedWithTransactions(
//         { adjustmentTypeId: type.AdjustmentTypeId },
//         ctrl.editSuccess,
//         ctrl.editFailure
//       );
//     };
//     ctrl.editSuccess = function (type) {
//       $scope.associatedAdjustment = type.Value;
//       $scope.editType(type.Value);
//     };

//     ctrl.editFailure = function () {
//       toastrFactory.error(
//         localize.getLocalizedString(
//           'Failed to edit the AdjustmentType of {0}. Refresh the page to try again.',
//           ['Adjustment Types Edit']
//         ),
//         localize.getLocalizedString('Server Error')
//       );
//     };
//     //#endregion

//     //#region deleteType functions
//     // confirm the delete with user
//     ctrl.confirmDelete = function (
//       IsAdjustmentTypeAssociatedWithTransactions,
//       IsSystemType,
//       IsDefaultTypeOnBenefitPlan
//     ) {
//       var title = localize.getLocalizedString('Delete Adjustment Type');
//       if (
//         IsAdjustmentTypeAssociatedWithTransactions &&
//         IsDefaultTypeOnBenefitPlan
//       ) {
//         var message = localize.getLocalizedString(
//           'This adjustment type is set as the default for one or more benefit plans and cannot be {0}.',
//           ['deleted']
//         );
//         var buttonOkText = localize.getLocalizedString('OK');
//         modalFactory.ConfirmModal(title, message, buttonOkText);
//       } else if (IsAdjustmentTypeAssociatedWithTransactions && !IsSystemType) {
//         var message = localize.getLocalizedString(
//           'This adjustment type has already been used and cannot be deleted.'
//         );
//         var buttonOkText = localize.getLocalizedString('OK');
//         modalFactory.ConfirmModal(title, message, buttonOkText);
//       } else if (IsSystemType) {
//         var message = localize.getLocalizedString(
//           'System required items cannot be edited or deleted.'
//         );
//         var buttonOkText = localize.getLocalizedString('OK');
//         modalFactory.ConfirmModal(title, message, buttonOkText);
//       } else if (IsDefaultTypeOnBenefitPlan) {
//         var message = localize.getLocalizedString(
//           'This adjustment type is set as the default for one or more benefit plans and cannot be {0}.',
//           ['deleted']
//         );
//         var buttonOkText = localize.getLocalizedString('OK');
//         modalFactory.ConfirmModal(title, message, buttonOkText);
//       } else {
//         var title = localize.getLocalizedString('Delete {0}', [
//           'Adjustment Type',
//         ]);
//         var message = localize.getLocalizedString(
//           'Are you sure you want to delete this {0}?',
//           ['Adjustment Type']
//         );
//         modalFactory
//           .ConfirmModal(
//             title,
//             message,
//             localize.getLocalizedString('Yes'),
//             localize.getLocalizedString('No')
//           )
//           .then(
//             function () {
//               $scope.deleteType();
//               $scope.deletingType = true;
//             },
//             function () {
//               $scope.cancelDelete();
//               $scope.deletingType = false;
//             }
//           );
//       }
//     };

//     // Success callback handler to notify user after deleting a adjustment type
//     ctrl.deleteTypeSuccess = function () {
//       //$scope.adjustmentTypes.splice($scope.adjustmentTypes.indexOf($scope.typeToDelete), 1);

//       //Refreshes the kendo grid
//       var index = listHelper.findIndexByFieldValue(
//         $scope.adjustmentTypes,
//         'Description',
//         $scope.typeToDelete.Description
//       );
//       if (index !== -1) {
//         $scope.adjustmentTypes.splice(index, 1);
//       }
//       $scope.deletingType = false;
//       $scope.typeToDelete = {};
//       toastrFactory.success(
//         localize.getLocalizedString(
//           'Successfully deleted the adjustment type.'
//         ),
//         localize.getLocalizedString('Success')
//       );
//     };

//     // Error callback handler to notify user after it failed to delete a adjustment type
//     ctrl.deleteTypeFailure = function (resp) {
//       $scope.deletingType = false;
//       $scope.typeToDelete = {};
//       toastrFactory.error(
//         localize.getLocalizedString(
//           resp.data.InvalidProperties[0].ValidationMessage
//         ),
//         localize.getLocalizedString('Error')
//       );
//     };

//     // delete the adjustment Type
//     $scope.deleteType = function () {
//       $scope.deletingType = true;
//       //adjustmentTypesService.deleteAdjustmentTypeById({ adjustmentTypeId: $scope.typeToDelete.AdjustmentTypeId },
//       //    ctrl.deleteTypeSuccess, ctrl.deleteTypeFailure);
//       modalFactory.LoadingModal(ctrl.adjustmentTypeDeleteCallSetup);
//     };

//     ctrl.adjustmentTypeDeleteCallSetup = function () {
//       return [
//         {
//           Call: adjustmentTypesService.deleteAdjustmentTypeById,
//           Params: { adjustmentTypeId: $scope.typeToDelete.AdjustmentTypeId },
//           OnSuccess: ctrl.deleteTypeSuccess,
//           OnError: ctrl.deleteTypeFailure,
//         },
//       ];
//     };

//     //#endregion

//     //Discard changes (delete);
//     $scope.cancelDelete = function () {
//       $scope.typeToDelete = {};
//     };

//     //#region Authorization
//     ctrl.authViewAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         'soar-biz-badjtp-view'
//       );
//     };

//     ctrl.authCreateAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         'soar-biz-badjtp-add'
//       );
//     };

//     ctrl.authEditAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         'soar-biz-badjtp-edit'
//       );
//     };

//     ctrl.authDeleteAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         'soar-biz-badjtp-delete'
//       );
//     };

//     ctrl.authAccess = function () {
//       $scope.hasViewAccess = ctrl.authViewAccess();
//       $scope.hasEditAccess = ctrl.authEditAccess();
//       $scope.hasCreateAccess = ctrl.authCreateAccess();
//       $scope.hasDeleteAccess = ctrl.authDeleteAccess();

//       if (!$scope.hasViewAccess) {
//         toastrFactory.error(
//           'User is not authorized to access this area.',
//           'Not Authorized'
//         );
//         $location.path(_.escape('/'));
//       }
//     };

//     ctrl.authAccess();
//     //#endregion

//     //Listens for changes to list and making kendo version of list
//     $scope.$watch(
//       'adjustmentTypes',
//       function (nv, ov) {
//         if (!angular.equals(nv, ov)) {
//           $scope.adjustmentTypesKendo = new kendo.data.ObservableArray(
//             $scope.adjustmentTypes
//           );
//         }
//       },
//       true
//     );

//     //function to create kendo button template
//     $scope.actionBtnTemplate = function (type, disabled, error) {
//       if (type == 'edit') {
//         return (
//           '<div >' +
//           '<button id="btnEdit{{ $index }}" title="' +
//           _.escape(error) +
//           '" ng-click="validateEdit(dataItem)" ng-disabled="' +
//           _.escape(disabled) +
//           '" class="pull-right icon-button' +
//           (disabled ? ' disabled' : '') +
//           '" disabled="' +
//           _.escape(disabled) +
//           '">' +
//           '<i class="fas fa-pencil-alt fa-lg">' +
//           '</i>' +
//           '</button>' +
//           '</div>'
//         );
//       } else if (type == 'delete') {
//         return (
//           '<div >' +
//           '<button id="btnDelete{{ $index }}" title="' +
//           _.escape(error) +
//           '" ng-click="validateDelete(dataItem)" ng-disabled="' +
//           _.escape(disabled) +
//           '" class="pull-right icon-button' +
//           (disabled ? ' disabled' : '') +
//           '" disabled="' +
//           _.escape(disabled) +
//           '">' +
//           '<i class="far fa-trash-alt fa-lg">' +
//           '</i>' +
//           '</button>' +
//           '</div>'
//         );
//       }
//     };

//     //Kendo Grid

//     $scope.adjustmentTypesList = {
//       sortable: true,
//       pageable: false,
//       filterable: {
//         mode: 'row',
//         operators: {
//           string: {
//             startswith: 'Starts with',
//             eq: 'Is equal to',
//             neq: 'Is not equal to',
//           },
//         },
//       },

//       columns: [
//         {
//           field: 'Description',
//           title: 'Description',
//           filterable: {
//             cell: {
//               operator: 'contains',
//             },
//           },
//         },
//         {
//           field: 'Category',
//           title: 'Category',
//           filterable: {
//             cell: {
//               operator: 'contains',
//             },
//           },
//         },
//         {
//           field: '',
//           title: '',
//           width: 40,
//           //function for editing adjustment types
//           template: function (dataItem) {
//             if (!$scope.hasEditAccess) {
//               return $scope.actionBtnTemplate(
//                 'edit',
//                 true,
//                 authZ.generateTitleMessage()
//               );
//             } else if (dataItem.IsSystemType) {
//               return $scope.actionBtnTemplate(
//                 'edit',
//                 true,
//                 'System required items cannot be edited or deleted.'
//               );
//             } else {
//               return $scope.actionBtnTemplate('edit', false, '');
//             }
//           },
//         },
//         {
//           field: '',
//           title: '',
//           width: 40,
//           //function for deleting adjustment types
//           template: function (dataItem) {
//             if (!$scope.hasDeleteAccess) {
//               return $scope.actionBtnTemplate(
//                 'delete',
//                 false,
//                 authZ.generateTitleMessage()
//               );
//             } else if (dataItem.IsSystemType) {
//               return $scope.actionBtnTemplate(
//                 'delete',
//                 true,
//                 'System required items cannot be edited or deleted.'
//               );
//             } else if (dataItem.IsAdjustmentTypeAssociatedWithTransactions) {
//               return $scope.actionBtnTemplate('delete', false, '');
//             } else if (dataItem.IsDefaultTypeOnBenefitPlan) {
//               return $scope.actionBtnTemplate(
//                 'delete',
//                 false,
//                 localize.getLocalizedString('')
//               );
//             } else {
//               return $scope.actionBtnTemplate('delete', false, '');
//             }
//           },
//         },
//       ],
//     };

//     dataSource: {
//       schema: {
//         model: {
//           fields: {
//             Description: {
//               type: 'String';
//             }
//           }
//         }
//       }
//     }
//   },
// ]);

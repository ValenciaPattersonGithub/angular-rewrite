// To Do - Remove this file when doing cleanup of payment-types
// 'use strict';
// var app = angular.module('Soar.BusinessCenter');
// app.controller('PaymentTypesController', [
//   '$scope',
//   '$timeout',
//   'toastrFactory',
//   'PaymentTypesService',
//   'StaticData',
//   'localize',
//   '$location',
//   '$rootScope',
//   'ModalFactory',
//   '$routeParams',
//   'patSecurityService',
//   'ListHelper',
//   '$filter',
//   function (
//     $scope,
//     $timeout,
//     toastrFactory,
//     paymentTypesService,
//     staticData,
//     localize,
//     $location,
//     $rootScope,
//     modalFactory,
//     $routeParams,
//     patSecurityService,
//     listHelper,
//     $filter
//   ) {
//     var ctrl = this;

//     ctrl.$onInit = function () {
//       ctrl.authAccess();
//       $scope.creatingPaymentType = false;
//       $scope.editingPaymentType = false;
//       $scope.newPaymentType = {};
//       $scope.typeToEdit = {};
//       ctrl.getCurrencyTypes();
//       ctrl.getPaymentTypes();
//     };

//     //#region authorization

//     $scope.viewAuthAbbreviation = 'soar-biz-bpmttp-view';
//     $scope.editAuthAbbreviation = 'soar-biz-bpmttp-edit';
//     $scope.createAuthAbbreviation = 'soar-biz-bpmttp-add';
//     $scope.deleteAuthAbbreviation = 'soar-biz-bpmttp-delete';

//     ctrl.authViewAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         $scope.viewAuthAbbreviation
//       );
//     };

//     ctrl.authCreateAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         $scope.createAuthAbbreviation
//       );
//     };

//     ctrl.authEditAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         $scope.editAuthAbbreviation
//       );
//     };

//     ctrl.authDeleteAccess = function () {
//       return patSecurityService.IsAuthorizedByAbbreviation(
//         $scope.deleteAuthAbbreviation
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
//         $location.path('/');
//       }
//     };

//     //#endregion

//     //#region navigation

//     $scope.dataForCrudOperation = {};
//     $scope.dataForCrudOperation.DataHasChanged = false;
//     $scope.dataForCrudOperation.BreadCrumbs = [
//       {
//         name: localize.getLocalizedString('Practice Settings'),
//         path: '/BusinessCenter/PracticeSettings/',
//         title: 'Practice Settings',
//       },
//       {
//         name: localize.getLocalizedString('Payment Types'),
//         path: '/Business/Billing/PaymentTypes/',
//         title: 'Payment Types',
//       },
//     ];

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

//     ctrl.changePath = function () {
//       if (
//         ctrl.currentBreadcrumb.name ===
//         localize.getLocalizedString('Payment Types')
//       ) {
//         $timeout(function () {
//           ctrl.resetDataForCrud();
//         }, 0);
//       } else {
//         $location.url(ctrl.currentBreadcrumb.path);
//       }
//     };

//     //#endregion

//     // #region get data for view

//     ctrl.getPaymentTypes = function () {
//       paymentTypesService.get(
//         function (res) {
//           if (res && res.Value) {
//             $scope.paymentTypes = $filter('filter')(res.Value, function (val) {
//               return val.PaymentTypeCategory != 2;
//             });
//             ctrl.orderList();
//           }
//         },
//         function () {
//           $scope.paymentTypes = [];
//           toastrFactory.error(
//             localize.getLocalizedString(
//               'Failed to retrieve the list of payment types. Refresh the page to try again.'
//             ),
//             localize.getLocalizedString('Server Error')
//           );
//         }
//       );
//     };

//     ctrl.getCurrencyTypes = function () {
//       staticData.CurrencyTypes().then(function (res) {
//         if (res && res.Value) {
//           $scope.currencyTypes = res.Value;
//         } else {
//           $scope.currencyTypes = [];
//         }
//       });
//     };

//     //#endregion

//     //#region helpers

//     $scope.search = function (pt) {
//       var result = false;
//       if ($scope.searchText) {
//         if (
//           pt.Description &&
//           pt.Description.toLowerCase().indexOf(
//             $scope.searchText.toLowerCase()
//           ) !== -1
//         ) {
//           result = true;
//         } else if (
//           pt.Prompt &&
//           pt.Prompt.toLowerCase().indexOf($scope.searchText.toLowerCase()) !==
//             -1
//         ) {
//           result = true;
//         } else if (
//           pt.CurrencyTypeName &&
//           pt.CurrencyTypeName.toLowerCase().indexOf(
//             $scope.searchText.toLowerCase()
//           ) !== -1
//         ) {
//           result = true;
//         }
//       } else {
//         result = true;
//       }
//       return result;
//     };

//     ctrl.orderList = function () {
//       $scope.paymentTypes = $filter('orderBy')(
//         $scope.paymentTypes,
//         'Description'
//       );
//     };

//     $scope.checkForDuplicates = function (type, create) {
//       $scope.descriptionIsDuplicate = false;
//       var count = 0;
//       angular.forEach($scope.paymentTypes, function (pt) {
//         if (pt.Description.toLowerCase() === type.Description.toLowerCase()) {
//           count++;
//         }
//       });
//       if ((create && count === 1) || (!create && count > 1)) {
//         $scope.descriptionIsDuplicate = true;
//       }
//     };

//     //#endregion

//     //#region create

//     $scope.createPaymentType = function () {
//       $scope.creatingPaymentType = true;
//       $scope.newPaymentType = {};
//       $scope.newPaymentType.IsActive = true;
//       $timeout(function () {
//         var dropdownlist = angular
//           .element('select#lstCurrencyTypeCreate')
//           .data('kendoDropDownList');
//         if (dropdownlist) {
//           dropdownlist.select(0);
//           dropdownlist.trigger('change');
//         }
//         angular.element('#inpDescriptionCreate').focus();
//       });
//     };

//     $scope.create = function () {
//       paymentTypesService.save(
//         $scope.newPaymentType,
//         function (res) {
//           if (res && res.Value) {
//             $scope.creatingPaymentType = false;
//             $scope.newPaymentType = {};
//             var currenyTypeItem = listHelper.findItemByFieldValue(
//               $scope.currencyTypes,
//               'Id',
//               res.Value.CurrencyTypeId
//             );
//             if (currenyTypeItem) {
//               res.Value.CurrencyTypeName = currenyTypeItem.Name;
//             }
//             $scope.paymentTypes.push(res.Value);
//             ctrl.orderList();
//             toastrFactory.success(
//               localize.getLocalizedString(
//                 'Your payment type has been created.'
//               ),
//               localize.getLocalizedString('Success')
//             );
//           }
//         },
//         function () {
//           toastrFactory.error(
//             localize.getLocalizedString(
//               'There was an error and your payment type was not created.'
//             ),
//             localize.getLocalizedString('Server Error')
//           );
//         }
//       );
//     };

//     ctrl.resetCreate = function () {
//       $scope.creatingPaymentType = false;
//       $scope.newPaymentType = {};
//       $scope.descriptionIsDuplicate = false;
//     };

//     $scope.hasCreateChanges = function () {
//       return Object.keys($scope.newPaymentType).length !== 0;
//     };

//     $scope.cancelCreate = function () {
//       if ($scope.hasCreateChanges()) {
//         modalFactory.CancelModal().then(function () {
//           ctrl.resetCreate();
//         });
//       } else {
//         ctrl.resetCreate();
//       }
//     };

//     //#endregion

//     //#region edit

//     $scope.editRow = function (type) {
//       if (!type.IsSystemType) {
//         type.$$OriginalDescription = angular.copy(type.Description);
//         type.$$OriginalPrompt = angular.copy(type.Prompt);
//         type.$$OriginalIsActive = angular.copy(type.IsActive);
//         type.$$OriginalCurrencyTypeId = angular.copy(type.CurrencyTypeId);
//         type.$$OriginalCurrencyTypeName = angular.copy(type.CurrencyTypeName);
//         type.$$Editing = true;
//         $scope.editingPaymentType = true;
//         $scope.typeToEdit = type;
//         $timeout(function () {
//           angular.element('[id ^= inpDescriptionEdit]').focus();
//         });
//       }
//     };

//     $scope.edit = function (type) {
//       paymentTypesService.update(
//         type,
//         function (res) {
//           if (res && res.Value) {
//             var updatedType = res.Value;
//             $scope.editingPaymentType = false;
//             $scope.typeToEdit = null;
//             var currenyTypeItem = listHelper.findItemByFieldValue(
//               $scope.currencyTypes,
//               'Id',
//               updatedType.CurrencyTypeId
//             );
//             if (currenyTypeItem) {
//               updatedType.CurrencyTypeName = currenyTypeItem.Name;
//             }
//             var index = listHelper.findIndexByFieldValue(
//               $scope.paymentTypes,
//               'PaymentTypeId',
//               updatedType.PaymentTypeId
//             );
//             if (index !== -1) {
//               $scope.paymentTypes.splice(index, 1, updatedType);
//             }
//             ctrl.orderList();
//             toastrFactory.success(
//               localize.getLocalizedString(
//                 'Your payment type has been updated.'
//               ),
//               localize.getLocalizedString('Success')
//             );
//           }
//         },
//         function () {
//           toastrFactory.error(
//             localize.getLocalizedString(
//               'There was an error and your payment type was not updated.'
//             ),
//             localize.getLocalizedString('Server Error')
//           );
//         }
//       );
//     };

//     ctrl.resetEdit = function () {
//       $scope.typeToEdit.Description = angular.copy(
//         $scope.typeToEdit.$$OriginalDescription
//       );
//       $scope.typeToEdit.Prompt = angular.copy(
//         $scope.typeToEdit.$$OriginalPrompt
//       );
//       $scope.typeToEdit.IsActive = angular.copy(
//         $scope.typeToEdit.$$OriginalIsActive
//       );
//       $scope.typeToEdit.CurrencyTypeId = angular.copy(
//         $scope.typeToEdit.$$OriginalCurrencyTypeId
//       );
//       $scope.typeToEdit.CurrencyTypeName = angular.copy(
//         $scope.typeToEdit.$$OriginalCurrencyTypeName
//       );
//       $scope.typeToEdit.$$Editing = false;
//       $scope.editingPaymentType = false;
//       $scope.typeToEdit = {};
//       $scope.descriptionIsDuplicate = false;
//     };

//     $scope.hasEditChanges = function () {
//       return (
//         $scope.typeToEdit.Description !=
//           $scope.typeToEdit.$$OriginalDescription ||
//         $scope.typeToEdit.Prompt != $scope.typeToEdit.$$OriginalPrompt ||
//         $scope.typeToEdit.IsActive != $scope.typeToEdit.$$OriginalIsActive ||
//         $scope.typeToEdit.CurrencyTypeId !=
//           $scope.typeToEdit.$$OriginalCurrencyTypeId ||
//         $scope.typeToEdit.CurrencyTypeName !=
//           $scope.typeToEdit.$$OriginalCurrencyTypeName
//       );
//     };

//     $scope.cancelEdit = function () {
//       if ($scope.hasEditChanges()) {
//         modalFactory.CancelModal().then(function () {
//           ctrl.resetEdit();
//         });
//       } else {
//         ctrl.resetEdit();
//       }
//     };

//     //#endregion

//     //#region delete

//     $scope.deleteRow = function (event, type) {
//       if (!type.IsSystemType) {
//         var elementRectangle = event.currentTarget.getBoundingClientRect();
//         var x = elementRectangle.left - 130;
//         var y = elementRectangle.top - 34;
//         angular
//           .element('.pmtTypes__gridConfirm')
//           .attr('style', 'left: ' + x + 'px' + ';' + 'top: ' + y + 'px');
//         $scope.attemptingToDelete = true;
//         $scope.typeToDelete = type;
//         if (!$scope.typeToDelete.IsUsedInCreditTransactions) {
//           $scope.deleteMessage =
//             $scope.typeToDelete.Description +
//             ' ' +
//             localize.getLocalizedString('will be deleted') +
//             '.';
//         } else {
//           $scope.deleteMessage = localize.getLocalizedString(
//             'This payment type has been used on a transaction and cannot be deleted.'
//           );
//         }
//       }
//     };

//     $scope.delete = function () {
//       paymentTypesService.deletePaymentTypeById(
//         { paymentTypeId: $scope.typeToDelete.PaymentTypeId },
//         function (res) {
//           if (res) {
//             var index = listHelper.findIndexByFieldValue(
//               $scope.paymentTypes,
//               'PaymentTypeId',
//               $scope.typeToDelete.PaymentTypeId
//             );
//             if (index !== -1) {
//               $scope.paymentTypes.splice(index, 1);
//             }
//             $scope.cancelDelete();
//             toastrFactory.success(
//               localize.getLocalizedString(
//                 'Successfully deleted the payment type.'
//               ),
//               localize.getLocalizedString('Success')
//             );
//           }
//         },
//         function () {
//           $scope.cancelDelete();
//           toastrFactory.error(
//             localize.getLocalizedString(
//               'Failed to delete the payment type. Try again.'
//             ),
//             localize.getLocalizedString('Error')
//           );
//         }
//       );
//     };

//     $scope.cancelDelete = function () {
//       $scope.attemptingToDelete = false;
//       $scope.typeToDelete = {};
//     };

//     //#endregion

//     $scope.resetData = function () {
//       ctrl.resetCreate();
//       ctrl.resetEdit();
//     };

//     ctrl.$onInit();
//   },
// ]);

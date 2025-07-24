// TODO : remove this later
// 'use strict';

// var app = angular.module('Soar.BusinessCenter');
// var AdjustmentTypeCrudController = app.controller(
//   'AdjustmentTypeCrudController',
//   [
//     '$scope',
//     '$timeout',
//     'toastrFactory',
//     'AdjustmentTypesService',
//     'StaticData',
//     'localize',
//     'ListHelper',
//     'ModalFactory',
//     '$uibModalStack',
//     function (
//       $scope,
//       $timeout,
//       toastrFactory,
//       adjustmentTypesService,
//       staticData,
//       localize,
//       listHelper,
//       modalFactory,
//       $uibModalStack
//     ) {
//       //#region variables
//       var ctrl = this;
//       $scope.hasErrors = false;
//       $scope.descriptionIsDuplicate = false;
//       $scope.editMode = false;
//       $scope.editing = false;
//       $scope.formIsValid = true;
//       $scope.isActive = true;
//       $scope.displayActiveStatusConfirmation = false;
//       $scope.focusIsActiveConfirm = false;
//       $scope.focusDiscardConfirm = false;

//       //#endregion
//       $scope.staticStorageTypeName = 'cachedAdjustmentTypes';
//       angular.element('#chkIsActive').prop('checked', true);
//       // initialize empty adjustment type for create
//       $scope.adjustmentType = null;

//       // initialize default adjustment type
//       $scope.initAdjustmentType = function () {
//         $scope.adjustmentType = {
//           AdjustmentTypeId: null,
//           IsSystemType: false,
//           Description: '',
//           IsActive: true,
//           IsPositive: null,
//           IsAdjustmentTypeAssociatedWithTransactions: false,
//           IsDefaultTypeOnBenefitPlan: false,
//           ImpactType: 3,
//         };
//       };

//       $scope.impacts = [
//         { Name: 'Production', Value: 1 },
//         { Name: 'Collection', Value: 2 },
//         { Name: 'Adjustments', Value: 3 },
//       ];

//       // initialize adjustment type
//       $scope.initAdjustmentType();

//       // reset the adjustment type
//       ctrl.resetVars = function () {
//         $scope.initAdjustmentType();
//         $scope.typeId = null;
//         $scope.editMode = false;
//         $scope.editing = false;
//         $scope.hasErrors = false;
//         $scope.descriptionIsDuplicate = false;
//       };

//       // Determine if we are in edit or create mode
//       $scope.editing = $scope.typeId ? true : false;

//       // Watch for adjustment type id
//       $scope.$watch(
//         'typeId',
//         function (newValue, oldValue) {
//           if (newValue) {
//             ctrl.getAdjustmentTypes();
//           }
//         },
//         true
//       );

//       // Method to get the adjustment types from the factory
//       ctrl.getAdjustmentTypes = function () {
//         if ($scope.typeId) {
//           $scope.editing = true;
//           $scope.adjustmentType = angular.copy(
//             listHelper.findItemByFieldValue(
//               $scope.types,
//               'AdjustmentTypeId',
//               $scope.typeId
//             )
//           );
//           ctrl.existingAdjustmentType = angular.copy($scope.adjustmentType);
//           if (!$scope.adjustmentType) {
//             toastrFactory.error(
//               localize.getLocalizedString(
//                 'Failed to retrieve the adjustment type. Refresh the page to try again.'
//               ),
//               localize.getLocalizedString('Error')
//             );
//           }
//         }
//       };

//       // Get the adjustment types from the factory
//       ctrl.getAdjustmentTypes();

//       // Method to build instance of current adjustment type
//       ctrl.buildInstance = function (currentAdjustmentType) {
//         $scope.backupAdjustmentType = JSON.stringify(currentAdjustmentType);
//       };

//       // Build instance of current adjustment type
//       ctrl.buildInstance($scope.adjustmentType);

//       // Discard changes if user do not want to save adjustment type
//       $scope.discardChanges = function () {
//         $scope.confirmingDiscard = false;
//         $scope.displayActiveStatusConfirmation = false;
//         $scope.focusIsActiveConfirm = false;
//         $scope.adjustmentType.IsActive = true;
//         angular.element('#chkIsActive').prop('checked', true);
//         ctrl.resetVars();
//       };

//       // Confirms that user wants to discard save
//       $scope.confirmingDiscard = false;
//       $scope.confirmDiscard = function () {
//         $scope.confirmingDiscard = true;
//         $scope.focusIsActiveConfirm = false;
//         $scope.focusDiscardConfirm = true;
//         modalFactory.WarningModal().then(function (result) {
//           if (result === true) {
//             $scope.discardChanges();
//           } else if (result === false) {
//             $scope.cancelDiscard();
//           }
//         });
//       };

//       // cancel discard to save changes
//       $scope.cancelDiscard = function () {
//         $scope.confirmingDiscard = false;
//         $scope.focusIsActiveConfirm = false;
//         $scope.focusDiscardConfirm = false;
//       };

//       // clear cache for adjustment type
//       $scope.clearLocalStorage = function () {
//         if (localStorage.getItem($scope.staticStorageTypeName)) {
//           localStorage.removeItem($scope.staticStorageTypeName);
//         }
//       };

//       // Check for a duplicate type
//       $scope.checkForDuplicates = function (type) {
//         $scope.frmAdjustmentTypeCrud.inpDescription.$setValidity(
//           'uniqueDescription',
//           true
//         );
//         $scope.descriptionIsDuplicate = false;

//         var item = listHelper.findItemByFieldValueIgnoreCase(
//           $scope.types,
//           'Description',
//           type.Description
//         );
//         if (item != null) {
//           if (item.AdjustmentTypeId !== type.AdjustmentTypeId) {
//             $scope.descriptionIsDuplicate = true;
//             $scope.formIsValid = false;
//             $scope.duplicateDescrption = true;
//             $scope.frmAdjustmentTypeCrud.inpDescription.$setValidity(
//               'uniqueDescription',
//               false
//             );
//           }
//         } else {
//           $scope.duplicateDescrption = false;
//         }
//         return null;
//       };

//       // validate required and any attributes
//       ctrl.validateForm = function () {
//         if (
//           $scope.adjustmentType &&
//           $scope.adjustmentType.IsPositive != null &&
//           $scope.adjustmentType.Description &&
//           $scope.adjustmentType.ImpactType
//         ) {
//           $scope.checkForDuplicates($scope.adjustmentType);
//           $scope.formIsValid = !(
//             $scope.adjustmentType.Description === null ||
//             $scope.adjustmentType.Description.length == 0 ||
//             $scope.descriptionIsDuplicate == true ||
//             $scope.adjustmentType.IsPositive == null
//           );
//           // check for errors
//           $scope.hasErrors = !$scope.formIsValid;
//         } else {
//           $scope.formIsValid = false;
//         }
//         $scope.hasErrors = !$scope.formIsValid;
//       };

//       // Watch for adjustment type
//       $scope.$watch(
//         'adjustmentType',
//         function (newValue, oldValue) {
//           if (newValue != oldValue) {
//             $scope.checkForDuplicates(newValue);
//           }
//         },
//         true
//       );

//       //#region Save type
//       $scope.saveType = function () {
//         // disable buttons while saving
//         $scope.savingType = true;
//         // validate form
//         ctrl.validateForm();

//         if (!$scope.hasErrors && $scope.formIsValid) {
//           if ($scope.editing == true) {
//             // update
//             if (
//               ctrl.existingAdjustmentType.IsUsedInCreditTransactions &&
//               (ctrl.existingAdjustmentType.Description !=
//                 $scope.adjustmentType.Description ||
//                 ctrl.existingAdjustmentType.IsPositive !=
//                   $scope.adjustmentType.IsPositive)
//             ) {
//               var message = localize.getLocalizedString(
//                 'This adjustment type has been used in previous transactions and can only be activated/inactivated.'
//               );
//               var title = localize.getLocalizedString(
//                 'Adjustment Type Validation'
//               );
//               var button1Text = localize.getLocalizedString('OK');
//               modalFactory
//                 .ConfirmModal(title, message, button1Text)
//                 .then(ctrl.reloadBackUpValues);
//             } else {
//               if (
//                 ctrl.existingAdjustmentType.ImpactType !=
//                 $scope.adjustmentType.ImpactType
//               ) {
//                 var message = localize.getLocalizedString(
//                   'Changing the Impacts value will not affect previous adjustments, but will apply to future adjustments.'
//                 );
//                 var title = localize.getLocalizedString('Warning');
//                 var button1Text = localize.getLocalizedString('Save');
//                 var button2Text = localize.getLocalizedString('Cancel');
//                 modalFactory
//                   .ConfirmModal(title, message, button1Text, button2Text)
//                   .then(function () {
//                     modalFactory.LoadingModal(
//                       ctrl.adjustmentTypeUpdateCallSetup
//                     );
//                   });

//                 $scope.$on('$routeChangeStart', function () {
//                   $uibModalStack.dismissAll();
//                 });
//               } else {
//                 modalFactory.LoadingModal(ctrl.adjustmentTypeUpdateCallSetup);
//               }
//             }
//           } else {
//             // insert
//             modalFactory.LoadingModal(ctrl.adjustmentTypeAddCallSetup);
//           }
//         } else {
//           // enable button after save
//           $timeout(function () {
//             $scope.savingType = false;
//           }, 500);
//         }
//       };

//       ctrl.adjustmentTypeUpdateCallSetup = function () {
//         $scope.associatedAdjustment.IsActive = $scope.adjustmentType.IsActive;
//         $scope.associatedAdjustment.IsPositive =
//           $scope.adjustmentType.IsPositive;
//         $scope.associatedAdjustment.Description =
//           $scope.adjustmentType.Description;
//         $scope.associatedAdjustment.ImpactType =
//           $scope.adjustmentType.ImpactType;
//         return [
//           {
//             Call: adjustmentTypesService.update,
//             Params: $scope.associatedAdjustment,
//             OnSuccess: ctrl.updateTypeSuccessful,
//             OnError: ctrl.updateTypeFailed,
//           },
//         ];
//       };

//       ctrl.adjustmentTypeAddCallSetup = function () {
//         return [
//           {
//             Call: adjustmentTypesService.save,
//             Params: $scope.adjustmentType,
//             OnSuccess: ctrl.createTypeSuccessful,
//             OnError: ctrl.createTypeFailed,
//           },
//         ];
//       };

//       // Success callback handler to notify user after saving adjustment type
//       ctrl.createTypeSuccessful = function (successResponse) {
//         toastrFactory.success(
//           localize.getLocalizedString('Your adjustment type has been created.'),
//           localize.getLocalizedString('Success')
//         );
//         successResponse.Value.Category = successResponse.Value.IsPositive
//           ? 'Positive (+)'
//           : 'Negative (-)';
//         $scope.types.push(successResponse.Value);
//         ctrl.resetVars();
//         $scope.savingType = false;
//         $scope.clearLocalStorage();
//       };

//       // Error callback handler to notify user after it failed to save adjustment type
//       ctrl.createTypeFailed = function (errorResponse) {
//         toastrFactory.error(
//           localize.getLocalizedString(
//             'There was an error and your adjustment type was not created.'
//           ),
//           localize.getLocalizedString('Server Error')
//         );
//         $scope.savingType = false;
//       };

//       // Success callback handler to notify user after updating adjustment type
//       ctrl.updateTypeSuccessful = function (successResponse) {
//         toastrFactory.success(
//           localize.getLocalizedString('Update successful.'),
//           localize.getLocalizedString('Success')
//         );
//         successResponse.Value.Category = successResponse.Value.IsPositive
//           ? 'Positive (+)'
//           : 'Negative (-)';
//         // replace the edited adjustment type in list
//         $scope.types.splice(
//           listHelper.findIndexByFieldValue(
//             $scope.types,
//             'AdjustmentTypeId',
//             $scope.typeId
//           ),
//           1
//         );
//         $scope.types.push(successResponse.Value);

//         // reset the adjustment type
//         ctrl.resetVars();
//         $scope.savingType = false;
//         $scope.clearLocalStorage();
//       };

//       // Error callback handler to notify user after it failed to update adjustment type
//       ctrl.updateTypeFailed = function (errorResponse) {
//         var message = localize.getLocalizedString(
//           'This adjustment type has been used in previous transactions and can only be activated/inactivated.'
//         );
//         var title = localize.getLocalizedString('Adjustment Type Validation');
//         var button1Text = localize.getLocalizedString('OK');
//         modalFactory
//           .ConfirmModal(title, message, button1Text)
//           .then(ctrl.reloadBackUpValues);
//       };
//       ctrl.reloadBackUpValues = function () {
//         $scope.savingType = false;
//         $scope.adjustmentType.Description =
//           ctrl.existingAdjustmentType.Description;
//         $scope.adjustmentType.IsPositive =
//           ctrl.existingAdjustmentType.IsPositive;
//       };
//       //Function to reset the IsActive property
//       $scope.cancelStatusConfirmation = function () {
//         $timeout(function () {
//           $scope.displayActiveStatusConfirmation = false;
//           $scope.focusIsActiveConfirm = false;
//           $scope.adjustmentType.IsActive = true;
//           angular.element('#chkIsActive').prop('checked', true);
//         }, 300);
//       };

//       //Function to reset the IsActive property
//       $scope.okStatusConfirmation = function () {
//         $timeout(function () {
//           $scope.displayActiveStatusConfirmation = false;
//           $scope.focusIsActiveConfirm = false;
//           $scope.adjustmentType.IsActive = false;
//           angular.element('#chkIsActive').prop('checked', false);
//         }, 300);
//       };

//       //Callback function to handle change event for IsActive checkbox
//       $scope.adjustmentTypeIsActiveOnChange = function () {
//         //Activate adjustment type
//         $timeout(function () {
//           if ($scope.adjustmentType.IsActive == false) {
//             $scope.displayActiveStatusConfirmation = true;
//             $scope.focusIsActiveConfirm = true;
//             $scope.adjustmentType.IsActive = false;
//             angular.element('#chkIsActive').prop('checked', false);
//           } else {
//             $scope.displayActiveStatusConfirmation = false;
//             $scope.focusIsActiveConfirm = false;
//             $scope.adjustmentType.IsActive = true;
//             angular.element('#chkIsActive').prop('checked', true);
//           }
//         }, 300);
//       };
//       //#endregion
//     },
//   ]
// );

// TODO : need to remove this later
// 'use strict';

// var app = angular.module('Soar.BusinessCenter');

// app.controller('ServiceCodeSearchController', ['$scope', '$rootScope', '$uibModal', '$filter', 'StaticData', 'toastrFactory', 'localize', 'ListHelper', 'ModalFactory', '$timeout', '$route', '$location', 'patSecurityService', 'ServiceCodesFactory', 'ReportsFactory', 'AmfaInfo', 'PreventiveCareFactory', 'ChartingFavoritesFactory', 'referenceDataService',
//     ServiceCodeSearchController
// ]);

// function ServiceCodeSearchController($scope, $rootScope, $uibModal, $filter, staticData, toastrFactory, localize, listHelper, modalFactory, $timeout, $route, $location, patSecurityService, serviceCodesFactory, reportsFactory, amfaInfo, preventiveCareFactory, chartingFavoritesFactory, referenceDataService) {
//     BaseCtrl.call(this, $scope, 'ServiceCodeSearchController');
//     //#region member variables
//     var ctrl = this;

//     ctrl.viewServiceCodeAmfa = 'soar-biz-bsvccd-view';
//     $scope.addServiceCodeAmfa = 'soar-biz-bsvccd-add';
//     $scope.editServiceCodeAmfa = 'soar-biz-bsvccd-edit';
//     $scope.editSwiftCodeAmfa = 'soar-biz-bsvccd-eswift';
//     $scope.addSwiftCodeAmfa = 'soar-biz-bsvccd-aswift';
//     ctrl.viewReportAmfa = 'soar-report-report-view';
//     ctrl.viewChartButtonAmfa = 'soar-biz-bizusr-vchbtn';
//     $scope.dataForCrudOperation = {
//     };
//     $scope.dataForCrudOperation.DataHasChanged = false;

//     $scope.dataForCrudOperation.BreadCrumbs = [
//         {
//             name: localize.getLocalizedString('Practice Settings'),
//             path: '/BusinessCenter/PracticeSettings/',
//             title: 'Practice Settings'
//         },
//         {
//             name: localize.getLocalizedString('Service & Swift Codes'),
//             path: '/BusinessCenter/ServiceCode/',
//             title: 'Service & Swift Codes'
//         }

//     ];

//     $scope.dataForCrudOperation.ShowServiceCodesList = true;
//     $scope.loadingServices = false;
//     $scope.backupServiceCodes = [];
//     $scope.filteringServices = false;
//     $scope.filtersVisible = false;
//     // Gets options for service type select element
//     $scope.dataForCrudOperation.ServiceTypes = $scope.initialData.ServiceTypes;
//     $scope.serviceTypes = $scope.initialData.ServiceTypes;
//     $scope.serviceAndSwiftTypes = angular.copy($scope.serviceTypes);
//     $scope.serviceAndSwiftTypes.push({
//         Description: 'Swift Code'
//     });
//     $scope.filterServiceList = '';
//     // Gets options for taxable service select element
//     $scope.dataForCrudOperation.TaxableServices = $scope.initialData.TaxableServices.Value;
//     // Gets options for affected area select element
//     $scope.dataForCrudOperation.AffectedAreas = $scope.initialData.AffectedAreas.Value;
//     // Gets options for usually performed by select element
//     $scope.dataForCrudOperation.UsuallyPerformedByProviderTypes = $scope.initialData.ProviderTypes;
//     // Gets options for draw type select element
//   $scope.dataForCrudOperation.DrawTypes = $scope.initialData.DrawTypes;
//     // Sets up the list for the directive to use
//     $scope.dataForCrudOperation.SwiftCodes = [];
//     $scope.dataForCrudOperation.PreventiveServices = [];
//     $scope.dataForCrudOperation.Favorites = [];
//     $scope.updatingList = false;
//     $scope.updatedServiceCodes = [];
//     $scope.updatedServiceCodesWithErrors = [];
//     $scope.saveUpdatedListMessage = '';
//     $scope.loadingMessage = localize.getLocalizedString('Loading') + '...';
//     $scope.savingMessage = localize.getLocalizedString('Saving Changes') + '...';
//     $scope.updateDisabled = false;

//     //#endregion

//     ctrl.$onInit = function () {
//         //ctrl.getListOfServiceReports();
//     };

//     //#region Authentication check

//     // check if user has access for add service code
//     ctrl.authAddServiceCodeAccess = function () {
//         return patSecurityService.IsAuthorizedByAbbreviation($scope.addServiceCodeAmfa);
//     };

//     // check if user has access for edit service code
//     ctrl.authEditServiceCodeAccess = function () {
//         return patSecurityService.IsAuthorizedByAbbreviation($scope.editServiceCodeAmfa);
//     };

//     // check if user has access for add swift code
//     ctrl.authAddSwiftCodeAccess = function () {
//         return patSecurityService.IsAuthorizedByAbbreviation($scope.addSwiftCodeAmfa);
//     };

//     // check if user has access for edit swift code
//     ctrl.authEditSwiftCodeAccess = function () {
//         return patSecurityService.IsAuthorizedByAbbreviation($scope.editSwiftCodeAmfa);
//     };

//     ctrl.authViewChartButtonAccess = function () {
//         return patSecurityService.IsAuthorizedByAbbreviation(ctrl.viewChartButtonAmfa);
//     };

//     //Notify user, he is not authorized to access current area
//     ctrl.notifyNotAuthorized = function (authMessageKey) {
//         toastrFactory.error(patSecurityService.generateMessage(authMessageKey), 'Not Authorized');
//     };

//     //Check view access
//     ctrl.authViewAccess = function () {
//         if (!patSecurityService.IsAuthorizedByAbbreviation(ctrl.viewServiceCodeAmfa)) {
//             ctrl.notifyNotAuthorized(ctrl.viewServiceCodeAmfa);
//             $location.path('/');
//         }

//         $scope.hasReportAccess = patSecurityService.IsAuthorizedByAbbreviation(ctrl.viewReportAmfa);
//     };

//     ctrl.authViewAccess();
//     //#endregion

//     //#region manage breadcrumbs

//     // handle URL update for breadcrumbs
//     $scope.changePageState = function (breadcrumb) {
//         ctrl.currentBreadcrumb = breadcrumb;
//         if ($scope.dataForCrudOperation.DataHasChanged && $scope.dataForCrudOperation.BreadCrumbs.length > 2) {
//             modalFactory.CancelModal().then(ctrl.changePath);
//         } else {
//             ctrl.changePath();
//         }
//         document.title = breadcrumb.title;
//     };

//     // change URL
//     ctrl.changePath = function () {
//         if (ctrl.currentBreadcrumb.name === localize.getLocalizedString('Service & Swift Codes')) {
//             // Show the service-code list
//             $timeout(function () {
//                 ctrl.resetDataForCrud();
//             }, 0);
//         } else {
//             // Jump to business-center page
//             $location.url(ctrl.currentBreadcrumb.path);
//         }
//         document.title = ctrl.currentBreadcrumb.title;
//     };
//     //#endregion

//     $scope.filterServiceCodes = function () {
//         var resultSet = [];
//         resultSet = $filter('filter')($scope.serviceCodes, $scope.filterServiceType);
//         resultSet = $filter('orderBy')(resultSet, $scope.orderBy.field, !$scope.orderBy.asc);
//         if ($scope.searchServiceCodesKeyword) {
//             resultSet = $filter('searchOnParticularColumn')(resultSet, $scope.searchServiceCodesKeyword, ['Code', 'CdtCodeName', 'Description', 'Fee']);
//         }

//         $scope.filteredServiceCodes = resultSet;

//         if ($scope.scroller && $scope.scroller.adapter && $scope.scroller.adapter.reload) {
//             $scope.scroller.adapter.reload(0);
//         }
//     };

//     //#region inline edit

//     // handling update button
//     $scope.updatedList = function () {
//         $scope.loadingServices = true;
//         $timeout(function () {
//             $scope.filteredServiceCodesForEdit = angular.copy($scope.filteredServiceCodes);
//             $scope.filteredServiceCodesForEdit = $filter('filter')($scope.filteredServiceCodesForEdit, function (sc) { return !sc.SwiftPickServiceCodes; });
//             $scope.updatingList = true;
//             $scope.loadingServices = false;
//         });
//     };

//     // up and down arrow handling
//     angular.element(document).on('keyup', function (event) {
//         if ((event.keyCode === 38 || event.keyCode === 40) && event.target.id) {
//             var indexOfFirstNumber = event.target.id.indexOf(event.target.id.match(/\d/));
//             var string = event.target.id.slice(0, indexOfFirstNumber);
//             var number = parseInt(event.target.id.slice(indexOfFirstNumber));
//             var nextNumber = event.keyCode === 40 ? number + 1 : number - 1;
//             var nextId = string + nextNumber;
//             if (angular.element('#' + nextId)) {
//                 angular.element('#' + nextId).focus();
//             }
//         }
//     });

//     // used to manage yes and no checkboxes in grid edit mode
//     $scope.checkboxChanged = function (serviceCode, propertyName, flag) {
//         serviceCode['$$' + propertyName + 'No'] = flag ? false : true;
//         serviceCode['$$' + propertyName + 'Yes'] = !flag ? false : true;
//         serviceCode[propertyName] = flag;
//         $scope.dataChanged(serviceCode);
//     };

//     // used to determine which rows have changes and if any of those have validation errors
//     $scope.dataChanged = function (serviceCode) {
//         var original = listHelper.findItemByFieldValue($scope.backupServiceCodes, 'ServiceCodeId', serviceCode.ServiceCodeId);
//         serviceCode.$$Dirty = !angular.equals(serviceCode, original);
//         $scope.updatedServiceCodes = $filter('filter')($scope.filteredServiceCodesForEdit, { $$Dirty: true });
//         $scope.updatedServiceCodesWithErrors = $filter('filter')($scope.updatedServiceCodes, function (upsc) { return !upsc.Description; });
//     };

//     // handling save
//     $scope.saveUpdatedList = function () {
//         $scope.loadingServices = true;
//         // if the affected area has changed, we need to clear the Draw Type like in the CRUD window because it will no longer be valid
//         angular.forEach($scope.updatedServiceCodes, function (usc) {
//             if (!angular.equals(usc.AffectedAreaId, usc.$$OriginalAffectedAreaId) && usc.DrawTypeId) {
//                 usc.DrawTypeId = null;
//             }
//         });
//         serviceCodesFactory.UpdateServiceCodes($scope.updatedServiceCodes).then(function (res) {
//             if (res && res.Value) {
//                 angular.forEach(res.Value, function (updatedServiceCode) {
//                     ctrl.assignCustomProperties(updatedServiceCode);
//                     var index = listHelper.findIndexByFieldValue($scope.serviceCodes, 'ServiceCodeId', updatedServiceCode.ServiceCodeId);
//                     if (index !== -1) {
//                         $scope.serviceCodes.splice(index, 1, updatedServiceCode);
//                     }
//                 });
//                 $scope.backupServiceCodes = angular.copy($scope.serviceCodes);
//                 $scope.resetDataForInlineEdit(false);
//                 $scope.loadingServices = false;
//             }
//             else {
//                 $scope.loadingServices = false;
//             }
//             referenceDataService.forceEntityExecution(referenceDataService.entityNames.serviceCodes);
//             $scope.filterServiceCodes();
//         });
//     };

//     // reset helper
//     $scope.resetDataForInlineEdit = function (resetServiceCodesList) {
//         if (resetServiceCodesList) {
//             $scope.serviceCodes = angular.copy($scope.backupServiceCodes);
//             $scope.filterServiceCodes();
//         }
//         $scope.updatedServiceCodes.length = 0;
//         $scope.updatedServiceCodesWithErrors.length = 0;
//         $scope.updatingList = false;
//     };

//     // handling cancel
//     $scope.cancelUpdatedList = function () {
//         if ($scope.updatedServiceCodes.length > 0) {
//             modalFactory.CancelModal().then(function () {
//                 $scope.resetDataForInlineEdit(true);
//             });
//         }
//         else {
//             $scope.updatedServiceCodesWithErrors.length = 0;
//             $scope.updatingList = false;
//         }
//     };

//     // helper for assigning custom properties used by inline edit
//     ctrl.assignCustomProperties = function (serviceCode) {
//         var serviceCodes = serviceCode ? [serviceCode] : $scope.serviceCodes;
//         angular.forEach(serviceCodes, function (sc) {
//             // Dirty
//             sc.$$Dirty = false;
//             // ServiceTypeDescription
//             var serviceType = _.find($scope.dataForCrudOperation.ServiceTypes, function(serviceType){
//                 return serviceType.ServiceTypeId === sc.ServiceTypeId;
//             });
//             sc.ServiceTypeDescription = serviceType ? serviceType.Description : sc.ServiceTypeDescription;
//             // AffectedArea
//             var affectedArea = listHelper.findItemByFieldValue($scope.dataForCrudOperation.AffectedAreas, 'Id', sc.AffectedAreaId);
//             sc.$$AffectedAreaName = affectedArea ? affectedArea.Name : '';
//             sc.AffectedAreaId = sc.AffectedAreaId ? sc.AffectedAreaId.toString() : null;
//             sc.$$OriginalAffectedAreaId = angular.copy(sc.AffectedAreaId);
//             // UsuallyPerformedByProviderType
//             var usuallyPerformedByProviderType = listHelper.findItemByFieldValue($scope.dataForCrudOperation.UsuallyPerformedByProviderTypes, 'Id', sc.UsuallyPerformedByProviderTypeId);
//             sc.$$UsuallyPerformedByProviderTypeName = usuallyPerformedByProviderType ? usuallyPerformedByProviderType.Name : '';
//             sc.UsuallyPerformedByProviderTypeId = sc.UsuallyPerformedByProviderTypeId ? sc.UsuallyPerformedByProviderTypeId.toString() : null;
//             // SubmitOnInsurance
//             sc.$$SubmitOnInsuranceName = localize.getLocalizedString(sc.SubmitOnInsurance ? 'Yes' : 'No');
//             sc.$$SubmitOnInsuranceName = sc.SwiftPickServiceCodes === null ? sc.$$SubmitOnInsuranceName : '';
//             sc.$$SubmitOnInsuranceNo = sc.SubmitOnInsurance ? false : true;
//             sc.$$SubmitOnInsuranceYes = !sc.SubmitOnInsurance ? false : true;
//             // IsEligibleForDiscount
//             sc.$$IsEligibleForDiscountName = localize.getLocalizedString(sc.IsEligibleForDiscount ? 'Yes' : 'No');
//             sc.$$IsEligibleForDiscountName = sc.SwiftPickServiceCodes === null ? sc.$$IsEligibleForDiscountName : '';
//             sc.$$IsEligibleForDiscountNo = sc.IsEligibleForDiscount ? false : true;
//             sc.$$IsEligibleForDiscountYes = !sc.IsEligibleForDiscount ? false : true;
//             // IsActive
//             sc.$$IsActiveName = localize.getLocalizedString(sc.IsActive ? 'Active' : 'Inactive');
//             sc.$$IsActiveNo = sc.IsActive ? false : true;
//             sc.$$IsActiveYes = !sc.IsActive ? false : true;
//             sc.UseSmartCodes = sc.UseSmartCodes ? sc.UseSmartCodes : false,
//                 sc.SmartCode1Id = sc.SmartCode1Id ? sc.SmartCode1Id : null;
//             sc.SmartCode2Id = sc.SmartCode2Id ? sc.SmartCode2Id : null;
//             sc.SmartCode3Id = sc.SmartCode3Id ? sc.SmartCode3Id : null;
//             sc.SmartCode4Id = sc.SmartCode4Id ? sc.SmartCode4Id : null;
//             sc.SmartCode5Id = sc.SmartCode5Id ? sc.SmartCode5Id : null;
//         });
//     };

//     //#endregion

//     //#region Get service-codes

//     // setup all required data.
//     $scope.initializeServiceCodeSearchData = function () {
//         // scope variable that holds ordering details
//         $scope.orderBy = {
//             field: 'Code',
//             asc: true
//         };
//         $scope.loadingServices = false;
//         // get all service codes from server.
//         ctrl.assignCustomProperties();
//         $scope.backupServiceCodes = angular.copy($scope.serviceCodes);
//         $scope.filterServiceCodes();
//     };

//     // call initializer
//     $scope.initializeServiceCodeSearchData();

//     //#endregion

//     //#region Sorting
//     $scope.allowInactive = false;
//     $scope.filterServiceType = function (code) {
//         return ((code.ServiceTypeDescription == $scope.filterServiceList || $scope.filterServiceList == "") && ($scope.allowInactive || code.IsActive));
//     };
//     $scope.changeFilter = function (model) {
//         $scope.filterServiceList = model;
//         $scope.updateDisabled = $scope.filterServiceList === 'Swift Code' ? true : false;
//         $scope.filterServiceCodes();
//     };
//     $scope.newChangeSortingForGrid = function (field) {
//         var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
//         $scope.orderBy = { field: field, asc: asc };
//         $scope.filterServiceCodes();
//     };
//     // function to apply orderBy functionality on grid
//     $scope.changeSortingForGrid = function (field) {
//         if ($scope.swiftPickFilter && (field === 'CdtCodeName' || field === 'ServiceTypeDescription')) {

//         } else if (field === 'TimesUsed' || field === 'LastUsedDate') {
//             // special handling for these 2 fields based on filtering modal
//             $scope.orderBy = { field: field, asc: false };
//         } else {
//             var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
//             $scope.orderBy = { field: field, asc: asc };
//         }
//         $scope.filterServiceCodes();
//     };

//     // watch swift code filter check-box for change and reset sorting accordingly
//     $scope.resetSorting = function () {
//         $timeout(function () {
//             // if swiftPickFilter is true and sorting is already applied on 'CdtCodeName' or 'ServiceTypeDescription' then reset it.
//             if ($scope.swiftPickFilter && ($scope.orderBy.field === 'CdtCodeName' || $scope.orderBy.field === 'ServiceTypeDescription')) {
//                 $scope.orderBy = {
//                     field: '', asc: true
//                 };
//             }
//         }, 0);
//     };
//     //#endregion

//     //#region success/error handles for service-code-crud actions

//     // success handler for service-code create action.
//     $scope.serviceCodeCreated = function (newServiceCode) {
//         if (newServiceCode) {
//             newServiceCode = referenceDataService.setFeesByLocation(newServiceCode);
//             ctrl.assignCustomProperties(newServiceCode);
//             $scope.serviceCodes.push(newServiceCode);
//             $scope.backupServiceCodes.push(newServiceCode);
//             if (!newServiceCode.IsSwiftPickCode) {
//                 ctrl.resetDataForCrud();
//             }
//             referenceDataService.forceEntityExecution(referenceDataService.entityNames.serviceCodes);
//             $scope.filterServiceCodes();
//         } else {
//             ctrl.resetDataForCrud();
//         }
//     };

//     // success handler for service-code update action.
//     $scope.serviceCodeUpdated = function (updatedServiceCode) {
//         if (updatedServiceCode) {
//             updatedServiceCode = referenceDataService.setFeesByLocation(updatedServiceCode);
//             ctrl.assignCustomProperties(updatedServiceCode);
//             var copy = angular.copy(updatedServiceCode);

//             //Update swift pick code on update of swift pick code and referenced service codes
//             if (updatedServiceCode.IsSwiftPickCode) {
//                 ctrl.updateSwiftPickCodeServiceCodes(copy);
//             } else
//                 ctrl.resetDataForCrud();
//             // replace the existing service code in service codes list
//             var index = listHelper.findIndexByFieldValue($scope.serviceCodes, 'ServiceCodeId', updatedServiceCode.ServiceCodeId);
//             if (index > -1) {
//                 $scope.serviceCodes.splice(index, 1, copy);
//             }
//             // replace the existing service code in backup service codes list
//             var indx = listHelper.findIndexByFieldValue($scope.backupServiceCodes, 'ServiceCodeId', updatedServiceCode.ServiceCodeId);
//             if (indx > -1) {
//                 $scope.backupServiceCodes.splice(indx, 1, copy);
//             }
//             //Update swift pick code on update of service code
//             angular.forEach($scope.serviceCodes, function (s) {
//                 if (s.IsSwiftPickCode) {
//                     ctrl.updateSwiftPickCodeServiceCodes(s);
//                 }
//             });
//             referenceDataService.forceEntityExecution(referenceDataService.entityNames.serviceCodes);
//             $scope.filterServiceCodes();
//         } else {
//             ctrl.resetDataForCrud();
//         }
//     };
//     ctrl.resetTop = function () {
//         //recalculate the point at which the keeptop directive will fix the header
//         $timeout(function () {
//             $rootScope.$broadcast('reset-top');
//         }, 100);
//     };
//     //Update swift pick code service codes data
//     ctrl.updateSwiftPickCodeServiceCodes = function (serviceCode) {
//         serviceCode.Fee = 0;
//         angular.forEach(serviceCode.SwiftPickServiceCodes, function (s) {
//             var item = listHelper.findItemByFieldValue($scope.backupServiceCodes, 'ServiceCodeId', s.ServiceCodeId);
//             s.DataTag = item.DataTag;
//             s.Code = item.Code;
//             s.Description = item.Description;
//             s.CdtCodeName = item.CdtCodeName;
//             s.Fee = item.Fee;
//             serviceCode.Fee += item.Fee;
//         });
//     };
//     //#endregion

//     //#region create service-code
//     ctrl.emptyPromise = {
//         $$state: { status: 1 },
//         values: []
//     };

//     // function to open screen for creating new service code
//     $scope.createServiceCode = function () {
//         if (ctrl.authAddServiceCodeAccess()) {
//             if ($scope.dataForCrudOperation.ServiceTypes) {
//                 var emptyServiceCode = {
//                     ServiceCodeId: null,
//                     CdtCodeId: null,
//                     CdtCodeName: '',
//                     Code: '',
//                     Description: '',
//                     ServiceTypeId: null,
//                     ServiceTypeDescription: null,
//                     DisplayAs: '',
//                     Fee: '',
//                     TaxableServiceTypeId: $scope.dataForCrudOperation.TaxableServices ? $scope.dataForCrudOperation.TaxableServices[0].Id : null,
//                     TaxableServiceTypeName: $scope.dataForCrudOperation.TaxableServices ? $scope.dataForCrudOperation.TaxableServices[0].Name : null,
//                     AffectedAreaId: $scope.dataForCrudOperation.AffectedAreas ? $scope.dataForCrudOperation.AffectedAreas[0].Id : null,
//                     AffectedAreaName: $scope.dataForCrudOperation.AffectedAreas ? $scope.dataForCrudOperation.AffectedAreas[0].Name : null,
//                     DrawTypeId: null,
//                     DrawTypeDescription: null,
//                     UsuallyPerformedByProviderTypeId: null,
//                     UsuallyPerformedByProviderTypeName: null,
//                     UseCodeForRangeOfTeeth: false,
//                     IsActive: true,
//                     IsEligibleForDiscount: false,
//                     Notes: '',
//                     SubmitOnInsurance: true,
//                     IsSwiftPickCode: false,
//                     UseSmartCodes: false,
//                     SmartCode1Id: null,
//                     SmartCode2Id: null,
//                     SmartCode3Id: null,
//                     SmartCode4Id: null,
//                     SmartCode5Id: null,
//                 };

//                 $scope.dataForCrudOperation.ServiceCode = angular.copy(emptyServiceCode);
//                 $scope.dataForCrudOperation.ServiceCodeId = null;
//                 $scope.dataForCrudOperation.BreadCrumbs.push({ name: localize.getLocalizedString('Add a Service Code') });
//                 $scope.dataForCrudOperation.SwiftCodes = angular.copy(ctrl.emptyPromise);
//                 preventiveCareFactory.accessForServiceCode();
//                 $scope.dataForCrudOperation.PreventiveServices = angular.copy(ctrl.emptyPromise);
//                 $scope.dataForCrudOperation.Favorites = angular.copy(ctrl.emptyPromise);
//                 $scope.dataForCrudOperation.IsCreateOperation = true;
//                 $scope.dataForCrudOperation.DataHasChanged = false;
//                 $scope.dataForCrudOperation.ShowServiceCodesList = false;
//                 ctrl.resetTop();
//             } else {
//                 toastrFactory.error(localize.getLocalizedString('There was an error while attempting to retrieve service types.'), localize.getLocalizedString('Server Error'));
//             }
//         } else {
//             ctrl.notifyNotAuthorized($scope.addServiceCodeAmfa);
//         }
//     };
//     //#endregion

//     //#region edit service-code

//     // function to open screen for editing service code
//     $scope.editServiceCode = function (serviceCode) {
//         if (ctrl.authEditServiceCodeAccess()) {
//             if (serviceCode) {
//                 var defaultItem = listHelper.findItemByFieldValue($scope.dataForCrudOperation.TaxableServices, 'Id', serviceCode.TaxableServiceTypeId);
//                 if (defaultItem != null) {
//                     serviceCode.TaxableServiceTypeName = defaultItem.Name;
//                 }
//                 defaultItem = listHelper.findItemByFieldValue($scope.dataForCrudOperation.AffectedAreas, 'Id', serviceCode.AffectedAreaId);

//                 if (defaultItem != null) {
//                     serviceCode.AffectedAreaName = defaultItem.Name;
//                 } else {
//                     serviceCode.AffectedAreaName = null;
//                 }

//                 defaultItem = listHelper.findItemByFieldValue($scope.dataForCrudOperation.DrawTypes, 'DrawTypeId', serviceCode.DrawTypeId);

//                 if (defaultItem != null) {
//                     serviceCode.DrawTypeDescription = defaultItem.Description;
//                 } else {
//                     serviceCode.DrawTypeDescription = null;
//                 }

//                 defaultItem = listHelper.findItemByFieldValue($scope.dataForCrudOperation.UsuallyPerformedByProviderTypes, 'Id', serviceCode.UsuallyPerformedByProviderTypeId);

//                 if (defaultItem != null) {
//                     serviceCode.UsuallyPerformedByProviderTypeName = defaultItem.Name;
//                 } else {
//                     serviceCode.UsuallyPerformedByProviderTypeName = null;
//                 }

//                 serviceCode.$$locationFee = serviceCode.$$locationFee == 0 ? '' : serviceCode.$$locationFee;

//                 $scope.dataForCrudOperation.ServiceCode = angular.copy(serviceCode);
//                 $scope.dataForCrudOperation.ServiceCodeId = angular.copy(serviceCode.ServiceCodeId);
//                 $scope.dataForCrudOperation.BreadCrumbs.push({
//                     name: localize.getLocalizedString('Edit a Service Code')
//                 });
//                 $scope.dataForCrudOperation.SwiftCodes = serviceCodesFactory.GetSwiftCodesAttachedToServiceCode(serviceCode.ServiceCodeId);
//                 preventiveCareFactory.accessForServiceCode();
//                 $scope.dataForCrudOperation.PreventiveServices = preventiveCareFactory.GetPreventiveServicesForServiceCode(serviceCode.ServiceCodeId);
//                 $scope.dataForCrudOperation.Favorites = chartingFavoritesFactory.GetAllFavoritesContainingServiceId(serviceCode.ServiceCodeId);
//                 $scope.dataForCrudOperation.IsCreateOperation = false;
//                 $scope.dataForCrudOperation.DataHasChanged = false;
//                 $scope.dataForCrudOperation.ShowServiceCodesList = false;
//                 ctrl.resetTop();
//             } else {
//                 toastrFactory.error(localize.getLocalizedString('There was an error while attempting to retrieve service code.'), localize.getLocalizedString('Server Error'));
//             }
//         } else {
//             ctrl.notifyNotAuthorized($scope.editServiceCodeAmfa);
//         }
//     };
//     //#endregion

//     //#region create swift code

//     // function to open screen for creating new swift code
//     $scope.createSwiftPickCode = function () {
//         var emptyServiceCode = {
//             ServiceCodeId: null,
//             Code: '',
//             Description: '',
//             ServiceTypeDescription: 'Swift Code',
//             DisplayAs: '',
//             IsActive: true,
//             IsSwiftPickCode: true,
//             SwiftPickServiceCodes: []
//         };
//         var modalInstance = modalFactory.Modal({
//             templateUrl: 'App/BusinessCenter/service-code/swiftpick-code-crud/swiftpick-code-crud.html',
//             keyboard: false,
//             windowClass: 'modal-dialog-large',
//             backdrop: 'static',
//             controller: 'SwiftPickCodeCrudController',
//             amfa: 'soar-biz-bsvccd-aswift',
//             resolve: {
//                 ServiceCode: function () {
//                     return emptyServiceCode;
//                 }
//             }
//         });
//         modalInstance.result.then($scope.serviceCodeCreated);
//     };
//     //#endregion

//     //#region edit swift code

//     // function to open screen for editing swift code
//     $scope.editSwiftPickCode = function (serviceCode) {
//         if (serviceCode) {
//             var modalInstance = modalFactory.Modal({
//                 templateUrl: 'App/BusinessCenter/service-code/swiftpick-code-crud/swiftpick-code-crud.html',
//                 keyboard: false,
//                 windowClass: 'modal-dialog-large',
//                 backdrop: 'static',
//                 controller: 'SwiftPickCodeCrudController',
//                 amfa: 'soar-biz-bsvccd-eswift',
//                 resolve: {
//                     ServiceCode: function () {
//                         return angular.copy(serviceCode);
//                     }
//                 }
//             });
//             modalInstance.result.then($scope.serviceCodeUpdated);
//         } else {
//             toastrFactory.error(localize.getLocalizedString('There was an error while attempting to retrieve swift code.'), localize.getLocalizedString('Server Error'));
//         }
//     };
//     //#endregion

//     //#region watchers

//     // watch searchServiceCodesKeyword and fire search action
//     $scope.$watch('searchServiceCodesKeyword', function (nv) {
//         if (nv) {
//             $scope.filteringServices = true;
//         }
//         $scope.filterServiceCodes();
//     }, true);
//     //#endregion

//     $scope.$watch('allowInactive', function (nv) {
//         $scope.filterServiceCodes();
//     }, true);

//     //#region utility functions

//     // show filter screen
//     $scope.showFilters = function () {
//         angular.element('.slidePanel').addClass('open');
//     };

//     // reset data
//     ctrl.resetDataForCrud = function () {
//         $scope.dataForCrudOperation.DataHasChanged = false;
//         $scope.dataForCrudOperation.ShowServiceCodesList = true;
//         $scope.dataForCrudOperation.ServiceCode = null;
//         $scope.serviceCodes = $filter('orderBy')($scope.serviceCodes, 'Code');
//         $scope.dataForCrudOperation.BreadCrumbs.pop();
//     };
//     //#endregion

//     $scope.editOptionClicked = function (serviceCode) {
//         if (serviceCode.IsSwiftPickCode)
//             $scope.editSwiftPickCode(serviceCode);
//         else
//             $scope.editServiceCode(serviceCode);
//     };

//     //#region Initialize Report Data

//     $scope.reports = [];
//     $scope.selectedReport = { ReportId: 0 };
//     ctrl.ServiceCodeByServiceTypeProductivityReportId = 17;
//     if ($scope.hasReportAccess) {
//         $scope.reports = reportsFactory.GetReportArray([ctrl.ServiceCodeByServiceTypeProductivityReportId]);
//     }

//     //#endregion

//     //#region Generate Reports

//     // function to open the selected report
//     $scope.$watch('selectedReport.ReportId', function (nv, ov) {
//         if (nv != ov && nv > 0) {
//             var currentReport = $scope.reports[$scope.selectedReport.ReportId - 1];
//             reportsFactory.OpenReportPage(currentReport,
//                 '/BusinessCenter/ServiceCode/' + currentReport.ReportTitle.replace(/\s/g, ''),true);
//             $scope.selectedReport.ReportId = 0;
//         }
//     });

//     //#endregion

//     ctrl.$onInit();
// }

// ServiceCodeSearchController.prototype = Object.create(BaseCtrl.prototype);

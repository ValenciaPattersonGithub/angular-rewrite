// TODO - need to remove this later
// / <reference path="location-landing-controller.js" />
// 'use strict';

// angular.module('Soar.BusinessCenter').controller('LocationLandingController', ['$scope', 'ListHelper', 'LocationIdentifierService', 'patSecurityService', 'toastrFactory', 'localize', '$location', function ($scope, listHelper, locationIdentifierService, patSecurityService, toastrFactory, localize, $location) {
//     var ctrl = this;

//     $scope.locations = [];
//     $scope.loadingLocations = true;
//     $scope.dataForCrudOperation = { DataHasChanged: false };

//     ctrl.hasAdditionalIdentifierAccess = false;

//     //breadcrumbs
//     $scope.dataForCrudOperation = {};
//     var locationString = "";
//     if ($location.search().locationId != undefined && $location.search().locationId > 0) {
//         locationString = "All Locations";
//     } else {
//         locationString = "Add a Location";
//     }
//     $scope.dataForCrudOperation.BreadCrumbs = [{
//         name: localize.getLocalizedString('Practice Settings'),
//         path: '/BusinessCenter/PracticeSettings/',
//         title: 'Practice Settings'
//     },
//     {
//         name: localize.getLocalizedString(locationString),
//         title: locationString
//     }];
//     //#region manage breadcrumbs

//     // handle URL update for breadcrumbs
//     $scope.changePageState = function (breadcrumb) {
//         ctrl.currentBreadcrumb = breadcrumb;
//         document.title = breadcrumb.title;
//         $location.url(ctrl.currentBreadcrumb.path);
//     };
//     //#endregion

//     ctrl.authAdditionalIdentifierAccess = function () {
//         ctrl.hasAdditionalIdentifierAccess = patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view');
//     };

//     ctrl.authAccess = function () {
//         ctrl.authAdditionalIdentifierAccess();
//     };
//     ctrl.authAccess();

//     ctrl.locationDto = {
//         LocationId: null,
//         NameLine1: null,
//         NameLine2: null,
//         NameAbbreviation: null,
//         Website: null,
//         AddressLine1: null,
//         AddressLine2: null,
//         City: null,
//         State: null,
//         ZipCode: null,
//         Email: null,
//         PrimaryPhone: null,
//         SecondaryPhone: null,
//         Fax: null,
//         TaxId: null,
//         TypeTwoNpi: null,
//         TaxonomyId: null,
//         Timezone: 'Central Standard Time',
//         LicenseNumber: null,
//         ProviderTaxRate: null,
//         SalesAndUseTaxRate: null,
//         Rooms: [],
//         AdditionalIdentifiers: [],
//         DefaultFinanceCharge: null,
//         DeactivationTimeUtc: null,
//         AccountsOverDue: null,
//         MinimumFinanceCharge: null,
//         MerchantId: null,
//         RemitAddressSource: 0, // Default to this location's address
//         RemitOtherLocationId: null,
//         RemitToNameLine1: null,
//         RemitToNameLine2: null,
//         RemitToAddressLine1: null,
//         RemitToAddressLine2: null,
//         RemitToCity: null,
//         RemitToState: null,
//         RemitToZipCode: null,
//         RemitToPrimaryPhone: null,
//         DisplayCardsOnEstatement: false
//     };

//     $scope.selectedLocation = angular.copy(ctrl.locationDto);

//     $scope.$watch('selectedLocation', function (nv) {
//         if (nv) {
//             /** do nothing */
//         }
//         else {
//             $scope.isAdding = true;
//             $scope.selectedLocation = angular.copy(ctrl.locationDto);
//         }
//     });

//     $scope.addLocation = function () {
//         $scope.isAdding = true;

//         $scope.getLocationIdentifiers();
//     };

//     //TODO: Temp Solution
//     $scope.getLocationIdentifiers = function () {
//         if (ctrl.hasAdditionalIdentifierAccess) {
//             locationIdentifierService.get($scope.locationIdentifiersGetSuccess, $scope.locationIdentifiersGetFailure);
//         }
//         else {
//             $scope.loading = false;
//             $scope.selectedLocation = angular.copy(ctrl.locationDto);
//         }
//     };

//     $scope.locationIdentifiersGetSuccess = function (res) {
//         $scope.loading = false;
//         var result = [];
//         for (var i = 0; i < res.Value.length; i++) {
//             var index = listHelper.findIndexByFieldValue($scope.selectedLocation.AdditionalIdentifiers,
//                 'MasterLocationIdentifierId',
//                 res.Value[i].MasterLocationIdentifierId);
//             result.push({
//                 Description: res.Value[i].Description,
//                 MasterLocationIdentifierId: res.Value[i].MasterLocationIdentifierId,
//                 Value: index.Value
//             });
//         }

//         ctrl.locationDto.AdditionalIdentifiers = result;
//         $scope.selectedLocation = angular.copy(ctrl.locationDto);
//     };

//     $scope.locationIdentifiersGetFailure = function () {
//         $scope.loading = false;
//         $scope.locationIdentifiers = [];
//         toastrFactory.error(localize.getLocalizedString('Failed to retrieve the list of additional identifiers. Refresh the page to try again.'), localize.getLocalizedString('Error'));
//     };
//     //END TODO: Temp Solution

//     $scope.onEditBtnClicked = function () {
//         $scope.isEditing = true;
//         $scope.editLocation();
//         document.title = 'Edit Location';
//     };

//     $scope.onCancelBtnClicked = function () {
//         $scope.cancelAddEdit();
//         document.title = 'Locations';
//     };

//     $scope.onCancelConfirm = function (overrideAdd) {
//         /** have to override how add is handled so when you cancel out of adding a location it can default to a location */
//         if (!overrideAdd) {
//             $scope.isAdding = false;
//             $scope.selectedLocation = !$scope.selectedLocation.LocationId ? $scope.locations.length > 0 ? $scope.locations[0] : null : $scope.selectedLocation;
//         }

//         $scope.isEditing = false;
//     };

//     $scope.onSaveBtnClicked = function () {
//         $scope.saveLocation();
//     };

//     $scope.onSaveSuccess = function (value) {
//         var ofcLocation = value;

//         if (ofcLocation && ofcLocation.LocationId) {
//             var index = listHelper.findIndexByFieldValue($scope.locations, 'LocationId', ofcLocation.LocationId);

//             if (index > -1) {
//                 $scope.locations.splice(index, 1, ofcLocation);
//             }
//             else {
//                 $scope.locations.push(ofcLocation);
//             }
//         }

//         $scope.isAdding = false;
//         $scope.isEditing = false;
//     };

//     $scope.resetData = function () {
//         $scope.dataForCrudOperation.DataHasChanged = false;
//     };
// }]);

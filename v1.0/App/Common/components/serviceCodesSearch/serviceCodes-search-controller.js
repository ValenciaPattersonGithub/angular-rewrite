// TODO : need to remove this later
// 'use strict';

// angular.module("common.controllers")
//     .controller('ServiceCodesSearchController', [
//         '$scope', '$timeout', '$filter', '$rootScope', 'localize', 'toastrFactory', 'patSecurityService', 'ServiceCodesService', 'referenceDataService',
//         function ($scope, $timeout, $filter, $rootScope, localize, toastrFactory, patSecurityService, serviceCodesService, referenceDataService) {
//             var ctrl = this;
//             $scope.orderBy = {
//                 field: '',
//                 asc: true
//             };

//             $scope.searchResults = [];

//             //Begin - Service Code Search
//             $scope.initializeSearch = function () {
//                 // initial take amount
//                 $scope.takeAmount = 45;
//                 // initial limit (rows showing)
//                 $scope.limit = 15;
//                 $scope.limitResults = true;
//                 // Empty string for search
//                 $scope.searchTerm = "";
//                 //current searchString
//                 $scope.searchString = "";
//                 // Set the default search variables
//                 $scope.resultCount = 0;
//                 // to hold result list
//                 $scope.searchResults = [];
//                 // Search timeout queue
//                 $scope.searchTimeout = null;
//             };

//             $scope.initializeSearch();

//             // Boolean to display search loading gif
//             $scope.searchIsQueryingServer = false;

//             // Watch the input
//             $scope.$watch('searchTerm', function (nv, ov) {
//                 if (nv && nv.length > 0 && nv != ov) {
//                     if ($scope.searchTimeout) {
//                         $timeout.cancel($scope.searchTimeout);
//                     }
//                     $scope.searchTimeout = $timeout(function () {
//                         $scope.activateSearch(nv);
//                     }, 500);
//                 } else if (ov && ov.length > 0 && nv != ov) {
//                     if ($scope.searchTimeout) {
//                         $timeout.cancel($scope.searchTimeout);
//                     }
//                     $scope.searchTimeout = $timeout(function () {
//                         $scope.activateSearch(nv);
//                     }, 500);
//                 }
//             });

//             // Perform the search
//             $scope.search = function (term) {
//                 // Don't search if not needed!
//                 if (angular.isUndefined(term)) {
//                     if ($scope.searchIsQueryingServer || ($scope.resultCount > 0 && $scope.searchResults.length == $scope.resultCount) || $scope.searchString.length === 0) {
//                         return;
//                     }

//                     // set variable to indicate status of search
//                     $scope.searchIsQueryingServer = true;
//                     $scope.showFilterServiceCodes = false;
//                     var searchParams = {
//                         search: $scope.searchString,
//                         skip: $scope.searchResults.length,
//                         take: $scope.takeAmount,
//                         sortBy: $scope.sortCol,
//                         includeInactive: $scope.includeInactive
//                     };
//                     serviceCodesService.search(searchParams, $scope.searchGetOnSuccess, $scope.searchGetOnError);
//                 }
//             };

//             $scope.searchGetOnSuccess = function (res) {
//                 $scope.resultCount = res.Count;
//                 if ($scope.resultCount === 1) {
//                     $scope.onSelect(res.Value[0]);
//                 }
//                 // Set the cdt code list
//                 $scope.searchResults = referenceDataService.setFeesByLocation(res.Value);
//                 // set variable to indicate whether any results
//                 $scope.noSearchResults = $scope.searchString.length <= 0 ? false : ($scope.resultCount === 0);
//                 // reset  variable to indicate status of search = false
//                 $scope.searchIsQueryingServer = false;
//                 $scope.showFilterServiceCodes = false;
//                 if (angular.isDefined($scope.selectAutoFocus)) {
//                     $scope.selectAutoFocus.value = false;
//                 }
//             };

//             $scope.searchGetOnError = function () {
//                 // Toastr alert to show error
//                 toastrFactory.error(localize.getLocalizedString('Please search again.'), localize.getLocalizedString('Server Error'));
//                 // if search fails reset all scope var
//                 $scope.searchIsQueryingServer = false;
//                 $scope.showFilterServiceCodes = false;
//                 $scope.resultCount = 0;
//                 $scope.searchResults = [];
//                 $scope.noSearchResults = true;
//                 if (angular.isDefined($scope.selectAutoFocus)) {
//                     $scope.selectAutoFocus.value = false;
//                 }
//             };

//             // Display service codes associated with selected Service Button and Type Or Material
//             $scope.displayFilterServiceCodes = function () {
//                 if (($scope.serviceButtonId) || ($scope.typeOrMaterialId)) {
//                     if (($scope.serviceButtonIdOriginal !== $scope.serviceButtonId) || ($scope.typeOrMaterialIdOriginal !== $scope.typeOrMaterialId)) {
//                         $scope.serviceButtonIdOriginal = angular.copy($scope.serviceButtonId);
//                         $scope.typeOrMaterialIdOriginal = angular.copy($scope.typeOrMaterialId);

//                         $scope.searchIsQueryingServer = true;
//                         $scope.showFilterServiceCodes = true;

//                         $scope.searchResults = [];
//                         $scope.searchString = "";
//                         var searchParams = {
//                             search: $scope.searchString,
//                             skip: $scope.searchResults.length,
//                             take: $scope.takeAmount,
//                             sortBy: $scope.sortCol,
//                             includeInactive: $scope.includeInactive
//                         };

//                         searchParams = $scope.serviceButtonId ? $.extend(true, searchParams, { serviceButtonId: $scope.serviceButtonId }) : searchParams;
//                         searchParams = $scope.typeOrMaterialId ? $.extend(true, searchParams, { typeOrMaterialId: $scope.typeOrMaterialId }) : searchParams;
//                         serviceCodesService.search(searchParams, $scope.searchGetOnSuccess, $scope.searchGetOnError);
//                     } else {
//                         if (angular.isDefined($scope.selectAutoFocus)) {
//                             $scope.selectAutoFocus.value = false;
//                         }
//                     }
//                 } else {
//                     $scope.searchResults = [];
//                     $scope.searchIsQueryingServer = false;
//                     $scope.showFilterServiceCodes = false;
//                     if (angular.isDefined($scope.selectAutoFocus)) {
//                         $scope.selectAutoFocus.value = false;
//                     }
//                 }
//             };

//             // notify of searchstring change
//             $scope.activateSearch = function (searchTerm) {
//                 if ($scope.searchString != searchTerm) {
//                     // reset limit when search changes
//                     $scope.limit = 15;
//                     $scope.limitResults = true;
//                     $scope.searchString = searchTerm;
//                     $scope.resultCount = 0;
//                     $scope.searchResults = [];
//                     $scope.search();
//                 } else {
//                     $scope.noSearchResults = false;
//                 }
//             };

//             // function to perform select service code operation
//             $scope.selectResult = function (serviceCode) {
//                 $scope.onSelect(serviceCode);
//             };
//         }
//     ]);

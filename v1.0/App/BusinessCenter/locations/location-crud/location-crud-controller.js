// TODO - need to remove this later
// 'use strict';
// var app = angular.module('Soar.BusinessCenter');

// var LocationCrudController = app.controller('LocationCrudController', ['$scope', '$routeParams', 'PatCacheFactory', 'StaticData', 'LocationServices', 'toastrFactory', 'localize', 'patSecurityService', '$location', '$filter', '$timeout', 'ModalFactory', 'ObjectService', 'SaveStates', 'LocationIdentifierService', 'ListHelper', 'AccountsOverdueValues', 'TimeZones', 'locationService', '$rootScope', 'referenceDataService', 'RxService',
//     function ($scope, $routeParams, cacheFactory, staticData, locationServices, toastrFactory, localize, patSecurityService, $location, $filter, $timeout, modalFactory, objectService, saveStates, locationIdentifierService, listHelper, AccountsOverdueValues, timeZones, locationService, $rootScope, referenceDataService, rxService) {
//         var ctrl = this;
//         $scope.pageLoading = true;
//         $scope.dataHasChanged = false;

//         $scope.hasAdditionalIdentifierViewAccess = false;
//         $scope.hasAdditionalIdentifierEditAccess = false;
//         $scope.hasTreatmentRoomsViewAccess = false;

//         ctrl.authAdditionalIdentifierAccess = function () {
//             $scope.hasAdditionalIdentifierViewAccess = patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view');
//             $scope.hasAdditionalIdentifierEditAccess = patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-manage');
//             $scope.hasTreatmentRoomsViewAccess = patSecurityService.IsAuthorizedByAbbreviation('soar-sch-stmtrm-view');
//         };

//         ctrl.authAccess = function () {
//             ctrl.authAdditionalIdentifierAccess();
//         };
//         ctrl.authAccess();

//         // template should get retrieved in the resolve
//         //$http.get('App/BusinessCenter/components/taxonomy-dropdown.html', function (res) {
//         //});
//         $scope.taxonomyDropdownTemplate =
//             '<div id="template" type="text/x-kendo-template">' +
//             '<span class="k-state-default">#: Category # / #: Code #</span>' +
//             '</div>';

//         // misc scope vars
//         $scope.editMode = $routeParams.locationId < 0;
//         $scope.formIsValid = true;
//         $scope.locationSectionOpen = true;
//         $scope.contactSectionOpen = true;
//         $scope.savingLocation = false;
//         $scope.selectedLocation = null;
//         $scope.originalLocation = null;
//         $scope.hasCreateAccess = false;
//         $scope.hasEditAccess = false;
//         $scope.locationNameIsUnique = true;
//         $scope.displayNameIsUnique = true;
//         $scope.locationIdentifiers = [];
//         $scope.displayTimezone = '';
//         var phoneNumberPlaceholder = '';
//         var taxIdPlaceholder = '         ';
//         var additionalIdentifiers = [];

//         $scope.enableAccountsOverDueList = true;
//         $scope.accountsOverdueValues = AccountsOverdueValues;
//         $scope.defaultFinanceChargePattern = /^\d{0,2}(\.\d{0,2})?$/;
//         $scope.timeZones = angular.copy(timeZones);
//         $scope.isEstatementsEnabled = false;

//         $scope.loadingStatus = true;

//         ctrl.remitAddressSourceToString = function (source) {
//             switch (source) {
//                 case 0:
//                 case '0':
//                     return 'this location';
//                 case 1:
//                 case '1':
//                     return 'different location';
//                 case 2:
//                 case '2':
//                     return 'different address';
//                 default:
//                     return null;
//             }
//         };

//         // Method to get the location identifier list
//         $scope.getLocationIdentifiers = function () {
//             //locationIdentifierService.get($scope.locationIdentifiersGetSuccess, $scope.locationIdentifiersGetFailure);
//             //locationServices.getLocationIdentifiers({ Id: '3' }, $scope.locationIdentifiersGetSuccess, $scope.locationIdentifiersGetFailure);
//             //$routeParams.location.LocationId
//             //var mId = $routeParams.param1; //$scope.selectedLocation.LocationId;
//             if ($scope.hasAdditionalIdentifierViewAccess) {
//                 locationIdentifierService.get($scope.locationIdentifiersGetSuccess, $scope.locationIdentifiersGetFailure);
//             }
//         };

//         $scope.locationIdentifiersGetSuccess = function (res) {
//             $scope.loading = false;
//             var result = [];
//             for (var i = 0; i < res.Value.length; i++) {
//                 var index = listHelper.findIndexByFieldValue($scope.selectedLocation.AdditionalIdentifiers, 'MasterLocationIdentifierId', res.Value[i].MasterLocationIdentifierId);
//                 result.push({ Description: res.Value[i].Description, MasterLocationIdentifierId: res.Value[i].MasterLocationIdentifierId, Value: index.Value });
//             }

//             $scope.selectedLocation.AdditionalIdentifiers = result;
//         };

//         $scope.locationIdentifiersGetFailure = function () {
//             $scope.loading = false;
//             $scope.locationIdentifiers = [];
//             toastrFactory.error(localize.getLocalizedString('Failed to retrieve the list of additional identifiers. Refresh the page to try again.'), localize.getLocalizedString('Error'));
//         };

//         $scope.getLocationIdentifiers();

//         ctrl.getPracticeSettings = function () {
//             $scope.practiceSettings = referenceDataService.get(referenceDataService.entityNames.practiceSettings);
//         };

//         ctrl.getPracticeSettings();

//         ctrl.getEstatementEnrollmentStatus = function () {
//             var locationId = locationService.getCurrentLocation().id;
//             locationServices.getLocationEstatementEnrollmentStatus({ locationId: locationId }, ctrl.getEstatementEnrollmentStatusSuccess, ctrl.getEstatementEnrollmentStatusFailure);
//         };

//         ctrl.getEstatementEnrollmentStatusSuccess = function (res) {
//             $scope.isEstatementsEnabled = res.Result;
//         };

//         ctrl.getEstatementEnrollmentStatusFailure = function () {
//             toastrFactory.error(localize.getLocalizedString('Failed to retrieve eStatement Enrollment Status'), localize.getLocalizedString('Error'));
//         };

//         ctrl.getEstatementEnrollmentStatus();

//         // sorting the taxonomy codes after promise
//         $scope.taxonomyCodesSpecialties = staticData.TaxonomyCodes();
//         $scope.taxonomyCodesSpecialties.then(function (result) {
//             if (result) {
//                 $scope.taxonomyCodesSpecialties.values = $filter('orderBy')(result.Value, 'Category');
//             }
//         });

//         $scope.displayTaxonomyCodeByField = function (id, field) {
//             var result = listHelper.findItemByFieldValue($scope.taxonomyCodesSpecialties.values, 'TaxonomyCodeId', id);
//             return result ? result[field] : '';
//         };

//         ctrl.setDefaultValues = function (location) {
//             // ie hack, if these fields are empty it is messing up the scroll position in ie, something to do with ui-mask
//             if (!location.PrimaryPhone) {
//                 location.PrimaryPhone = phoneNumberPlaceholder;
//             }
//             if (!location.SecondaryPhone) {
//                 location.SecondaryPhone = phoneNumberPlaceholder;
//             }
//             if (!location.Fax) {
//                 location.Fax = phoneNumberPlaceholder;
//             }
//             if (!location.TaxId) {
//                 location.TaxId = taxIdPlaceholder;
//             }
//             //add identifier
//             //if (!location.AdditionalIdentifiers)
//             //{
//             //    location.AdditionalIdentifiers = selectedLocation.LocationAdditionalIdentifiers;
//             //}

//             $scope.enableAccountsOverDue = location.DefaultFinanceCharge ? true : false;

//             // conversion from decimal to percentage for view
//             if (angular.isNumber(location.ProviderTaxRate) && location.ProviderTaxRate <= 1) {
//                 //location.ProviderTaxRate *= 100;
//                 var provtaxRate = location.ProviderTaxRate * 100;
//                 provtaxRate = +provtaxRate.toFixed(3);
//                 location.ProviderTaxRate = provtaxRate;
//             }
//             if (angular.isNumber(location.SalesAndUseTaxRate) && location.SalesAndUseTaxRate <= 1) {
//                 //location.SalesAndUseTaxRate *= 100;
//                 var salestaxRate = location.SalesAndUseTaxRate * 100;
//                 salestaxRate = +salestaxRate.toFixed(3);
//                 location.SalesAndUseTaxRate = salestaxRate;
//             }
//         };

//         ctrl.locationWatch = function (nv, ov) {
//             if (nv) {
//                 var ofcLocation = angular.copy(nv);

//                 if (!$scope.selectedLocation || !$scope.selectedLocation.LocationId || (ofcLocation && ofcLocation.LocationId != $scope.selectedLocation.LocationId)) {
//                     /** user could have clicked another location, but has made changes */
//                     if (ctrl.hasChanges()) {
//                         $scope.cancelFunc();
//                         return;
//                     }
//                     else {
//                         /** we need to do a little logic override when cancelling out of an add location */
//                         var isNewLocation = ofcLocation != null ? !ofcLocation.LocationId : true;
//                         $scope.editMode = false;
//                         $scope.cancelConfirmed(isNewLocation);
//                     }

//                     // set to edit mode if no location id is found and locations have been loaded.
//                     if ($scope.loadingLocations === false || !ofcLocation.LocationId) {
//                         //$scope.editMode = location.LocationId ? false : true;
//                         $scope.editMode = false;
//                         if ($location.search().locationId != null) {
//                             if ($location.search().locationId === -1 || $location.search().locationId === '-1') {
//                                 $scope.editMode = true;
//                             }
//                         }
//                     }
//                     //$scope.editMode = false;
//                     //if ($location.search().locationId != null) {
//                     //    if ($location.search().locationId === -1) {
//                     //        $scope.editMode = true;
//                     //    }
//                     //}

//                     if ($scope.editMode) {
//                         document.title = "Add a Location";
//                     }
//                     ctrl.getUsersByLocation(ofcLocation);
//                     ctrl.getRoomsByLocation(ofcLocation);
//                     ctrl.getIdentifierByLocation(ofcLocation);
//                     if (ofcLocation) {
//                         ctrl.setDefaultValues(ofcLocation);
//                     }

//                     $scope.originalLocation = angular.copy(nv);
//                     $scope.selectedLocation = angular.copy(nv);
//                     if ($scope.selectedLocation) {
//                         ctrl.selectedLocInit();
//                     }

//                     $timeout(function () {
//                         ctrl.setDisplayTimezone();
//                     }, 200);

//                     if ($scope.editMode && $scope.selectedLocation && !$scope.selectedLocation.LocationId && $routeParams.locationId < 0 && !$scope.hasCreateAccess) {
//                         toastrFactory.error(localize.getLocalizedString('User is not authorized to access this area.'), localize.getLocalizedString('Not Authorized'));
//                         $location.path('/');
//                     }

//                     $scope.formIsValid = true;
//                 }
//             }
//         };

//         $scope.$watch('location', ctrl.locationWatch, true);

//         ctrl.selectedLocationWatch = function (nv, ov) {
//             if (nv && ov && nv.LocationId && ov.LocationId && nv.LocationId == ov.LocationId) {
//                 $scope.updateDataHasChangedFlag(false);
//             }
//         };

//         ctrl.setDisplayTimezone = function () {
//             if ($scope.selectedLocation && $scope.selectedLocation.Timezone) {
//                 $scope.displayTimezone = listHelper.findItemByFieldValue($scope.timeZones, 'Value', $scope.selectedLocation.Timezone).Display;
//             }
//         };

//         $scope.$watch('selectedLocation', ctrl.selectedLocationWatch, true);

//         $scope.paymentGatewayChanged = function () {
//             if (!$scope.selectedLocation.IsPaymentGatewayEnabled) {//new value has it turned off
//                 ctrl.disablePaymentGatewayWarning().then(null, function () { $scope.selectedLocation.IsPaymentGatewayEnabled = true; });
//             }
//         };

//         ctrl.disablePaymentGatewayWarning = function () {
//             var message = localize.getLocalizedString('By disabling Credit Card/Debit Card Processing, credit cards will no longer be charged using the credit card integration.  Are you sure you want to continue?');
//             var title = localize.getLocalizedString('Credit Card Integration');
//             var button2Text = localize.getLocalizedString('Cancel');
//             var button1Text = localize.getLocalizedString('Ok');
//             return modalFactory.ConfirmModal(title, message, button1Text, button2Text);
//         };

//         $scope.displayCardsOnEstatementChange = function (value) {
//             if (value) {
//                 $scope.selectedLocation.AcceptMasterCardOnEstatement = true;
//                 $scope.selectedLocation.AcceptDiscoverOnEstatement = true;
//                 $scope.selectedLocation.AcceptVisaOnEstatement = true;
//                 $scope.selectedLocation.AcceptAmericanExpressOnEstatement = true;
//                 $scope.selectedLocation.IncludeCvvCodeOnEstatement = false;
//             } else {
//                 $scope.selectedLocation.AcceptMasterCardOnEstatement = false;
//                 $scope.selectedLocation.AcceptDiscoverOnEstatement = false;
//                 $scope.selectedLocation.AcceptVisaOnEstatement = false;
//                 $scope.selectedLocation.AcceptAmericanExpressOnEstatement = false;
//                 $scope.selectedLocation.IncludeCvvCodeOnEstatement = false;
//             }
//         };

//         // used to determine whether or not to show global discard modal
//         $scope.updateDataHasChangedFlag = function (resetting) {
//             if ($scope.editMode) {
//                 if (resetting === true) {
//                     $scope.selectedLocation = angular.copy($scope.location);
//                     ctrl.setDisplayTimezone();
//                 }
//                 $scope.dataHasChanged = !objectService.objectAreEqual(angular.copy($scope.originalLocation), angular.copy($scope.selectedLocation));
//                 $scope.hasChanges = $scope.dataHasChanged;
//             }
//         };

//         $scope.remitAddressSourceChanged = function () {
//             if ($scope.selectedLocation.RemitAddressSource !== '2') {
//                 $scope.selectedLocation.RemitToNameLine1 = '';
//                 $scope.selectedLocation.RemitToNameLine2 = '';
//                 $scope.selectedLocation.RemitToAddressLine1 = '';
//                 $scope.selectedLocation.RemitToAddressLine2 = '';
//                 $scope.selectedLocation.RemitToCity = '';
//                 $scope.selectedLocation.RemitToState = '';
//                 $scope.selectedLocation.RemitToZipCode = '';
//                 $scope.selectedLocation.RemitToPrimaryPhone = '';
//             }
//             if ($scope.selectedLocation.RemitAddressSource !== '1') {
//                 $scope.selectedLocation.RemitOtherLocationId = '';
//             }
//         };
//         $scope.remittanceInsuranceSourceChanged = function () {
//             if ($scope.selectedLocation.InsuranceRemittanceAddressSource !== '2') {
//                 $scope.selectedLocation.InsuranceRemittanceNameLine1 = '';
//                 $scope.selectedLocation.InsuranceRemittanceNameLine2 = '';
//                 $scope.selectedLocation.InsuranceRemittanceAddressLine1 = '';
//                 $scope.selectedLocation.InsuranceRemittanceAddressLine2 = '';
//                 $scope.selectedLocation.InsuranceRemittanceCity = '';
//                 $scope.selectedLocation.InsuranceRemittanceState = '';
//                 $scope.selectedLocation.InsuranceRemittanceZipCode = '';
//                 $scope.selectedLocation.InsuranceRemittancePrimaryPhone = '';
//                 $scope.InsuranceRemittanceTaxId = '';
//                 $scope.InsuranceRemittanceTypeTwoNpi = '';
//                 $scope.InsranceRemittanceLicenseNumber = '';
//             }
//             if ($scope.selectedLocation.InsuranceRemittanceAddressSource !== '1') {
//                 $scope.selectedLocation.InsuranceRemittanceOtherLocationId = '';
//             }
//         };

//         ctrl.hasChanges = function () {
//             $scope.hasChanges = $scope.dataHasChanged;
//             return $scope.dataHasChanged;
//         };

//         ctrl.getUsersByLocation = function (location) {
//             /** default to zero before retrieving */
//             $scope.userCount = 0;

//             if (location && location.LocationId) {
//                 locationServices.getUsers({ Id: location.LocationId }, function (res) {
//                     $scope.userCount = res.Value.length;
//                 }, function (err) {
//                     toastrFactory.error({ Text: 'Failed to retrieve the {0} for {1}.', Params: ['team members', 'location'] }, 'Error');
//                 });
//             }
//         };

//         ctrl.getRoomsByLocation = function (location) {
//             if (location && location.LocationId && $scope.hasTreatmentRoomsViewAccess) {
//                 locationServices.getRooms({ Id: location.LocationId }, function (res) {
//                     var rooms = $filter('orderBy')(res.Value, '[Name]', false);

//                     /** add $duplicate property for validation on HTML */
//                     angular.forEach(rooms, function (room) {
//                         room.$duplicate = false;
//                         room.ObjectState = saveStates.None;
//                     });

//                     locationServices.getRoomScheduleStatus({ locationId: location.LocationId }, function (scheduleRooms) {
//                         angular.forEach(rooms, function (room) {
//                             var item = listHelper.findItemByFieldValue(scheduleRooms.Value, 'RoomId', room.RoomId);
//                             if (item && item.HasRoomAppointments || item && item.HasProviderRoomOccurrences) {
//                                 room.$hasAppointments = true;
//                             } else {
//                                 room.$hasAppointments = false;
//                             }
//                         });
//                         /** update rooms */
//                         $scope.selectedLocation.Rooms = angular.copy(rooms);
//                         $scope.originalLocation.Rooms = angular.copy(rooms);
//                         $scope.location.Rooms = angular.copy(rooms);
//                     },
//                         function (err) {
//                             toastrFactory.error({ Text: 'Failed to retrieve the {0} for {1}.', Params: ['rooms schedule status', 'location'] }, 'Error');
//                         });
//                 }, function (err) {
//                     toastrFactory.error({ Text: 'Failed to retrieve the {0} for {1}.', Params: ['treatment rooms', 'location'] }, 'Error');
//                 });
//             }
//         };
//         ctrl.getIdentifierByLocation = function (location) {
//             if (location && location.LocationId && $scope.hasAdditionalIdentifierViewAccess) {
//                 locationServices.getAdditionalIdentifiers({ Id: location.LocationId }, function (res) {
//                     var identifiers = $filter('orderBy')(res.Value, '[Description]', false);

//                     /** add $duplicate property for validation on HTML */
//                     angular.forEach(identifiers, function (identifier) {
//                         identifier.$duplicate = false;
//                         identifier.ObjectState = saveStates.None;
//                     });

//                     /** update rooms */
//                     $scope.selectedLocation.AdditionalIdentifiers = angular.copy(identifiers);
//                     $scope.originalLocation.AdditionalIdentifiers = angular.copy(identifiers);
//                     $scope.location.AdditionalIdentifiers = angular.copy(identifiers);
//                 }, function (err) {
//                     toastrFactory.error({ Text: 'Failed to retrieve the {0} for {1}.', Params: ['additional identifiers', 'location'] }, 'Error');
//                 });
//             }
//         };
//         // #region scope functions used by the view

//         $scope.editFunc = function () {
//             $scope.selectedLocation = angular.copy($scope.originalLocation);
//             $scope.editMode = true;
//             $scope.selectedLocation.Rooms = $filter('orderBy')($scope.selectedLocation.Rooms, ['Name'], false);
//             $scope.originalLocation.Rooms = $filter('orderBy')($scope.originalLocation.Rooms, ['Name'], false);
//             ctrl.selectedLocInit();
//         };

//         // need validate both location name line 1 and display as before saving
//         $scope.saveFunc = function () {
//             var ofcLocation = $scope.selectedLocation;
//             $scope.savingLocation = true;

//             ctrl.validateForm();
//             if ($scope.formIsValid) {
//                 locationServices.IsNameUnique({ 'Name': _.escape(ofcLocation.NameLine1), 'ExcludeLocationId': ofcLocation.LocationId ? ofcLocation.LocationId : null },
//                     $scope.saveCheckForUniqueLocationNameSuccess,
//                     $scope.checkForUniqueLocationNameFailure);
//             }
//             else {
//                 $scope.savingLocation = false;
//             }
//         };

//         // creating/editing location
//         $scope.valid = true;
//         $scope.nowDate = moment().format('MM/DD/YYYY');
//         $scope.canUpdateInactivation = true;

//         ctrl.selectedLocInit = function () {
//             $scope.isActiveLoc = $scope.selectedLocation.DeactivationTimeUtc === null;
//             $scope.defaultDate = moment();//moment().format('MM/DD/YYYY');
//             $scope.canUpdateInactivation = true;
//             if (!$scope.isActiveLoc) {
//                 var toCheck = moment(new Date($scope.selectedLocation.DeactivationTimeUtc)).format('MM/DD/YYYY');
//                 var dateNow = moment().format('MM/DD/YYYY');

//                 if (moment(toCheck).isBefore(dateNow) || moment(toCheck).isSame(dateNow)) {
//                     $scope.canUpdateInactivation = false;
//                     $scope.defaultDate = moment();
//                 } else {
//                     $scope.defaultDate = $scope.selectedLocation.DeactivationTimeUtc;
//                     $scope.canUpdateInactivation = true;
//                 }
//             }

//             $scope.tempTz = $scope.selectedLocation.Timezone;
//             $scope.tempState = $scope.selectedLocation.State;

//             $scope.selectedLocation.Timezone = null;
//             $scope.selectedLocation.State = null;

//             $timeout(function () {
//                 $scope.loadingStatus = false;
//             }, 100);

//             $timeout(function () {
//                 $scope.selectedLocation.Timezone = $scope.tempTz;
//                 $scope.selectedLocation.State = $scope.tempState;
//             }, 100);
//         };

//         $scope.saveLocationAfterUniqueChecks = function () {
//             $scope.savingLocation = true;
//             $scope.invalidDataForRx = false;
//             var params = angular.copy($scope.selectedLocation);

//             // part 2 of ie hack, see above
//             if (params.PrimaryPhone === phoneNumberPlaceholder) { params.PrimaryPhone = null; }
//             if (params.SecondaryPhone === phoneNumberPlaceholder) { params.SecondaryPhone = null; }
//             if (params.Fax === phoneNumberPlaceholder) { params.Fax = null; }
//             if (params.TaxId === taxIdPlaceholder) { params.TaxId = null; }

//             params.ZipCode = params.ZipCode.replace(/-/g, '');

//             if (params.RemitToZipCode) {
//                 params.RemitToZipCode = params.RemitToZipCode.replace(/-/g, '');
//             }

//             if (params.InsuranceRemittanceZipCode) {
//                 params.InsuranceRemittanceZipCode = params.InsuranceRemittanceZipCode.replace(/-/g, '');
//             }

//             // conversion from percentage to decimal for the back-end
//             if (params.ProviderTaxRate) {
//                 //params.ProviderTaxRate /= 100;
//                 var provtaxRate = params.ProviderTaxRate / 100;
//                 provtaxRate = +provtaxRate.toFixed(6);
//                 params.ProviderTaxRate = provtaxRate;
//             }
//             if (params.SalesAndUseTaxRate) {
//                 //params.SalesAndUseTaxRate /= 100;
//                 var salestaxRate = params.SalesAndUseTaxRate / 100;
//                 salestaxRate = +salestaxRate.toFixed(6);
//                 params.SalesAndUseTaxRate = salestaxRate;
//             }

//             var scCache = cacheFactory.GetCache('ServiceCodesService');
//             if ($scope.editMode && params.LocationId && $scope.hasEditAccess) {
//                 if (!$scope.isActiveLoc && !$scope.defaultDate) {
//                     return false;
//                 }
//                 if (!$scope.isActiveLoc) {
//                     if ($scope.toUpdate || !$scope.isModify) {
//                         //params.DeactivationTimeUtc = new Date($scope.defaultDate + 'UTC').toLocaleString();
//                         params.DeactivationTimeUtc = $scope.defaultDate;
//                     }
//                     else {
//                         params.DeactivationTimeUtc = $scope.selectedLocation.DeactivationTimeUtc;
//                     }
//                 }
//                 else {
//                     params.DeactivationTimeUtc = null;
//                 }

//                 //$scope.defaultDate = moment().format('MM/DD/YYYY');
//                 locationServices.update(params,
//                     function (res) {
//                         var msg = 'Update successful.';
//                         ctrl.locationAddUpdateSuccess(res, msg);
//                     },
//                     function (res) {
//                         var msg = 'Update was unsuccessful. Please retry your save.';
//                         ctrl.locationAddUpdateFailure(res, msg);
//                     }
//                 );
//                 if (scCache) {
//                     cacheFactory.ClearCache(scCache);
//                 }
//             }
//             else if ($scope.hasCreateAccess) {
//                 locationServices.save(params,
//                     function (res) {
//                         var msg = 'Your location has been created.';
//                         ctrl.locationAddUpdateSuccess(res, msg);
//                     },
//                     function (res) {
//                         var msg = 'There was an error and your location was not created.';
//                         ctrl.locationAddUpdateFailure(res, msg);
//                     }
//                 );
//                 if (scCache) {
//                     cacheFactory.ClearCache(scCache);
//                 }
//             }
//         };

//         // cancel
//         $scope.cancelFunc = function () {
//             var locationChanges = null;
//             if (!$scope.selectedLocation.LocationId) {
//                 if ($scope.selectedLocation.FeeListId === '') {
//                     if ($scope.originalLocation != null) {
//                         $scope.originalLocation.FeeListId = '';
//                     }
//                 }
//             }

//             if ($scope.originalLocation == null) {
//                 locationChanges = true;
//             } else {
//                 // Fix (hack) on initial login additional property
//                 if (!$scope.originalLocation.InsuranceRemittanceOtherLocationId &&
//                     $scope.selectedLocation.InsuranceRemittanceOtherLocationId == '') {
//                     $scope.originalLocation.InsuranceRemittanceOtherLocationId = '';
//                 }
//                 locationChanges = objectService.objectAreEqual(angular.copy($scope.originalLocation), angular.copy($scope.selectedLocation));
//             }

//             if (locationChanges) {
//                 ctrl.selectedLocInit();
//                 $scope.editMode = false;
//                 $scope.cancelConfirmed();
//             } else {
//                 if ($scope.location.LocationId === $scope.selectedLocation.LocationId) {
//                     modalFactory.CancelModal().then($scope.confirmCancel, function () {
//                         ctrl.selectedLocInit();
//                     });
//                 }
//             }
//         };

//         $scope.confirmCancel = function () {
//             ctrl.selectedLocInit();
//             /** need to change the location now */
//             var ofcLocation = angular.copy($scope.location);

//             ctrl.getUsersByLocation(ofcLocation);
//             ctrl.getRoomsByLocation(ofcLocation);
//             ctrl.getIdentifierByLocation(ofcLocation);
//             ctrl.setDefaultValues(ofcLocation);

//             $scope.originalLocation = angular.copy(location);
//             $scope.selectedLocation = angular.copy(location);
//             ctrl.setDisplayTimezone();

//             /** reset the flag */
//             $scope.updateDataHasChangedFlag(true);
//             $scope.hasChanges = false;
//             $scope.editMode = false;

//             $scope.cancelConfirmed();
//         };

//         // check for unique location name before saving
//         $scope.saveCheckForUniqueLocationNameSuccess = function (successResponse) {
//             var isUnique = successResponse.Value;

//             if (isUnique != null) {
//                 if (isUnique == true) {
//                     if ($scope.selectedLocation.NameAbbreviation > '') {
//                         $scope.locationNameIsUnique = true;

//                         locationServices.IsAbbreviatedNameUnique({
//                             'Name': $scope.selectedLocation.NameAbbreviation, 'ExcludeLocationId': $scope.selectedLocation.LocationId ? $scope.selectedLocation.LocationId : null
//                         }, $scope.saveCheckForUniqueDisplayNameSuccess,
//                             $scope.checkForUniqueDisplayNameFailure
//                         );
//                     }
//                 }
//                 else {
//                     $scope.uniqueLocationServerMessage = localize.getLocalizedString('A location with this name already exists.');
//                     $scope.locationNameIsUnique = false;
//                 }
//             } else {
//                 $scope.savingLocation = false;
//             }
//         };

//         // check for unique display name before saving
//         $scope.saveCheckForUniqueDisplayNameSuccess = function (successResponse) {
//             var isUnique = successResponse.Value;

//             if (isUnique != null) {
//                 if (isUnique == true) {
//                     $scope.displayNameIsUnique = true;
//                     ctrl.validateRxClinic();
//                 }
//                 else {
//                     $scope.uniqueDisplayNameServerMessage = localize.getLocalizedString('A location with this display name already exists.');
//                     $scope.displayNameIsUnique = false;
//                     $scope.savingLocation = false;
//                 }
//             } else {
//                 $scope.savingLocation = false;
//             }
//         };

//         // check for duplicate location name from server
//         $scope.checkForUniqueLocationName = function () {
//             var ofcLocation = $scope.selectedLocation;

//             if (ofcLocation && ofcLocation.NameLine1 > '') {
//                 locationServices.IsNameUnique({
//                     'Name': ofcLocation.NameLine1, 'ExcludeLocationId': ofcLocation.LocationId ? ofcLocation.LocationId : null
//                 }, $scope.checkForUniqueLocationNameSuccess,
//                     $scope.checkForUniqueLocationNameFailure
//                 );
//             } else {
//                 $scope.locationNameIsUnique = true;
//             }
//         };

//         $scope.checkForUniqueLocationNameSuccess = function (successResponse) {
//             var isUnique = successResponse.Value;

//             if (isUnique != null) {
//                 if (isUnique == true) {
//                     $scope.locationNameIsUnique = true;
//                 }
//                 else {
//                     $scope.uniqueLocationServerMessage = localize.getLocalizedString('A location with this name already exists.');
//                     $scope.locationNameIsUnique = false;
//                 }
//             }
//         };

//         $scope.checkForUniqueLocationNameFailure = function (errorResponse) {
//             $scope.locationNameIsUnique = false;
//             $scope.uniqueLocationServerMessage = localize.getLocalizedString('Could not verify unique location name. Please try again.');
//             $scope.savingLocation = false;
//         };

//         // check for duplicate display name from server
//         $scope.checkForUniqueDisplayName = function () {
//             if ($scope.selectedLocation.NameAbbreviation > '') {
//                 locationServices.IsAbbreviatedNameUnique({
//                     'Name': $scope.selectedLocation.NameAbbreviation, 'ExcludeLocationId': $scope.selectedLocation.LocationId ? $scope.selectedLocation.LocationId : null
//                 }, $scope.checkForUniqueDisplayNameSuccess,
//                     $scope.checkForUniqueDisplayNameFailure
//                 );
//             }
//             else {
//                 $scope.displayNameIsUnique = true;
//             }
//         };

//         $scope.checkForUniqueDisplayNameSuccess = function (successResponse) {
//             var isUnique = successResponse.Value;

//             if (isUnique != null) {
//                 if (isUnique == true) {
//                     $scope.displayNameIsUnique = true;
//                 }
//                 else {
//                     $scope.uniqueDisplayNameServerMessage = localize.getLocalizedString('A location with this display name already exists.');
//                     $scope.displayNameIsUnique = false;
//                 }
//             }
//         };

//         $scope.checkForUniqueDisplayNameFailure = function (errorResponse) {
//             $scope.displayNameIsUnique = false;
//             $scope.uniqueDisplayNameServerMessage = localize.getLocalizedString('Could not verify unique display name. Please try again.');
//             $scope.savingLocation = false;
//         };

//         // enabling/disabling save button based on access
//         $scope.hasAccessForRelevantOperation = function () {
//             var hasAccess = false;
//             if ($scope.editMode && $scope.selectedLocation.LocationId == null && $scope.hasCreateAccess) {
//                 hasAccess = true;
//             }
//             else if ($scope.editMode && $scope.hasEditAccess) {
//                 hasAccess = true;
//             }
//             return hasAccess;
//         };

//         // if they have left a bad value in the taxonomy combobox, clear it
//         $scope.taxonomyIdBlur = function (value) {
//             if ($scope.frmLocationCrud.$dirty) {
//                 var newValueIsInList = false;
//                 angular.forEach($scope.taxonomyCodesSpecialties.values, function (item) {
//                     if (!newValueIsInList && value == item.TaxonomyCodeId) {
//                         newValueIsInList = true;
//                     }
//                 });
//                 if (!newValueIsInList) {
//                     $scope.selectedLocation.TaxonomyId = null;
//                 }
//             }
//         };

//         $scope.setAccountsOverDue = function (location) {
//             if (location.DefaultFinanceCharge) {
//                 $scope.enableAccountsOverDue = true;
//                 if (location.DefaultFinanceCharge.length == 1) {
//                     // reinitialize the component
//                     $scope.enableAccountsOverDueList = false;
//                     $timeout(function () {
//                         $scope.enableAccountsOverDueList = true;
//                     }, 100);
//                 }
//             } else {
//                 location.AccountsOverDue = null;
//                 $scope.enableAccountsOverDue = false;
//             }
//         };

//         // clearing any numbers that were pasted in
//         $scope.validatePaste = function () {
//             $timeout(function () {
//                 if (/\d/.test($scope.selectedLocation.City)) {
//                     $scope.selectedLocation.City = $scope.selectedLocation.City.replace(/[0-9]/g, '');
//                 }
//             });
//         };

//         // #endregion

//         // #region Treatment Rooms

//         $scope.addRoom = function () {
//             if ($scope.selectedLocation && $scope.selectedLocation.Rooms) {
//                 $scope.selectedLocation.Rooms.push({ RoomId: null, Name: null, ObjectState: saveStates.Add, $unique: true });

//                 $timeout(function () {
//                     angular.element('#inpRoom' + ($scope.selectedLocation.Rooms.length - 1)).focus();
//                 }, 100);
//             }
//         };

//         $scope.roomOnChange = function (room, index) {
//             if (room.RoomId) {
//                 room.ObjectState = saveStates.Update;
//             }

//             ctrl.checkForRoomDuplicates(room, index);
//         };

//         ctrl.checkForRoomDuplicates = function (room, index) {
//             $timeout.cancel(ctrl.roomDupeTimeout);

//             ctrl.roomDupeTimeout = $timeout(function () {
//                 var rooms = $scope.selectedLocation.Rooms;
//                 var originalRooms = $scope.originalLocation.Rooms;

//                 /** now see if there are dupes amongst new ones */
//                 if (rooms.length > 0) {
//                     for (var i = 0; i < rooms.length && !isNewRoomDuplicate; i++) {
//                         if (rooms[i].ObjectState == saveStates.Update) {
//                             var hasDuplicates = false;
//                             var originalDupeId = '';

//                             /** compare vs original copy so we can mark the correct dupe */
//                             for (var j = 0; j < originalRooms.length && !hasDuplicates; j++) {
//                                 if (rooms[i].Name && originalRooms[j].Name
//                                     && rooms[i].Name.toLowerCase() == originalRooms[j].Name.toLowerCase()
//                                     && rooms[i].RoomId != originalRooms[j].RoomId) {
//                                     hasDuplicates = true;
//                                     originalDupeId = originalRooms[j].RoomId;
//                                 }
//                             }

//                             /** compare if dupe was found in original, but see if the original has been updated */
//                             /** DOMAIN DOESN"T SUPPORT THIS */
//                             //if (originalDupeId.length > 0) {
//                             //    var room = listHelper.findItemByFieldValue(rooms, 'RoomId', originalDupeId);
//                             //    if (room) {
//                             //        hasDuplicates = room.Name.toLowerCase() == rooms[i].Name.toLowerCase();
//                             //    }
//                             //}

//                             rooms[i].$duplicate = hasDuplicates;
//                         }
//                         else if (rooms[i].ObjectState == saveStates.Add) {
//                             var isNewRoomDuplicate = false;
//                             for (var k = 0; k < rooms.length; k++) {
//                                 if (rooms[i].Name && rooms[k].Name
//                                     && rooms[i].Name.toLowerCase() == rooms[k].Name.toLowerCase()
//                                     && rooms[k].ObjectState != saveStates.Delete && i != k) {
//                                     isNewRoomDuplicate = true;
//                                 }
//                             }
//                             rooms[i].$duplicate = isNewRoomDuplicate;
//                         }
//                     }
//                 }
//             }, 1000);
//         };

//         $scope.deleteRoom = function (room, index) {
//             if (room && room.RoomId) {
//                 room.ObjectState = saveStates.Delete;
//             }
//         };

//         // #endregion

//         // #region helper functions used by the controller only

//         // location add/update success handler
//         this.locationAddUpdateSuccess = function (res, msg) {
//             $scope.editMode = false;

//             toastrFactory.success(localize.getLocalizedString(msg), localize.getLocalizedString('Success'));
//             referenceDataService.forceEntityExecution(referenceDataService.entityNames.locations);
//             $scope.savingLocation = false;
//             $scope.updateDataHasChangedFlag(true);

//             /** make sure we are ordering the rooms */
//             var result = angular.copy(res.Value);
//             result.Rooms = $filter('orderBy')(res.Value.Rooms, '[Name]', false);
//             //result.Timezone = 'Central Standard Time';

//             /** add $duplicate property for validation on HTML */
//             angular.forEach(result.Rooms, function (room) {
//                 room.$duplicate = false;
//                 room.ObjectState = saveStates.None;
//             });

//             /** update location objects */

//             $scope.location = res.Value;

//             // create rx location
//             ctrl.saveRxClinic($scope.location);

//             $scope.saveSuccessful(res.Value);

//             ctrl.setDefaultValues(result);

//             $scope.originalLocation = angular.copy(result);
//             $scope.selectedLocation = angular.copy(result);
//             ctrl.setDisplayTimezone();

//             $rootScope.$broadcast('update-locations-dropdown', result);

//             ctrl.selectedLocInit();
//         };

//         // location add/update failure handler
//         this.locationAddUpdateFailure = function (res, msg) {
//             toastrFactory.error(localize.getLocalizedString(msg), localize.getLocalizedString('Server Error'));
//             $scope.savingLocation = false;
//         };

//         // validating the form

//         this.validateForm = function () {
//             var ofcLocation = $scope.selectedLocation;
//             $scope.formIsValid = true;

//             ofcLocation.Rooms.$valid = true;

//             var roomRequired = false;
//             for (var i = 0; i < ofcLocation.Rooms.length; i++) {
//                 if (ofcLocation.Rooms[i].Name == null || ofcLocation.Rooms[i].Name == '') {
//                     if (ofcLocation.Rooms[i].ObjectState == saveStates.Add) {
//                         ofcLocation.Rooms.splice(i, 1);
//                     }
//                     else {
//                         roomRequired = true;
//                     }
//                 }
//             }
//             var roomDuplicates = $filter('filter')(ofcLocation.Rooms, { $duplicate: true }).length > 0;

//             ofcLocation.Rooms.$valid = !roomRequired && !roomDuplicates;

//             if (ofcLocation && $scope.frmLocationCrud.$valid && ofcLocation.State && $scope.locationNameIsUnique && $scope.displayNameIsUnique && ofcLocation.Rooms.$valid) {
//                 $scope.formIsValid = true;
//             }
//             else {
//                 $scope.formIsValid = false;
//             }
//             var maxMinimumFinanceChargeValue = 999999.99;
//             if ((ofcLocation.MinimumFinanceCharge !== null) && (ofcLocation.MinimumFinanceCharge !== '') && (ofcLocation.MinimumFinanceCharge <= 0 || ofcLocation.MinimumFinanceCharge > maxMinimumFinanceChargeValue)) {
//                 $scope.formIsValid = false;
//             }
//             if (ofcLocation.DefaultFinanceCharge && !ofcLocation.AccountsOverDue) {
//                 $scope.formIsValid = false;
//             }
//             var maxDefaultFinanceChargeValue = 99.99;
//             if ((ofcLocation.DefaultFinanceCharge !== null) && (ofcLocation.DefaultFinanceCharge !== '') && (ofcLocation.DefaultFinanceCharge <= 0 || ofcLocation.DefaultFinanceCharge > maxDefaultFinanceChargeValue)) {
//                 $scope.formIsValid = false;
//             }
//             if (ofcLocation.IsPaymentGatewayEnabled && (ofcLocation.MerchantId === null || ofcLocation.MerchantId === "")) {
//                 $scope.formIsValid = false;
//             }

//             if (ofcLocation.DisplayCardsOnEstatement &&
//                 !ofcLocation.AcceptMasterCardOnEstatement &&
//                 !ofcLocation.AcceptDiscoverOnEstatement &&
//                 !ofcLocation.AcceptVisaOnEstatement &&
//                 !ofcLocation.AcceptAmericanExpressOnEstatement) {
//                 $scope.formIsValid = false;
//             }

//             if (!ofcLocation.DisplayCardsOnEstatement &&
//                 (ofcLocation.AcceptMasterCardOnEstatement ||
//                 ofcLocation.AcceptDiscoverOnEstatement ||
//                 ofcLocation.AcceptVisaOnEstatement ||
//                 ofcLocation.AcceptAmericanExpressOnEstatement ||
//                 ofcLocation.IncludeCvvCodeOnEstatement)) {
//                 $scope.formIsValid = false;
//             }
//             if (ofcLocation.InsuranceRemittanceAddressSource && ofcLocation.InsuranceRemittanceAddressSource.toString() === "2") {
//                 if ($scope.frmLocationCrud.inpRemitInsToNameLine1.$error.required)
//                     angular.element('#inpRemitInsToNameLine1').focus();
//                 else if ($scope.frmLocationCrud.inpRemitInsToAddressLine1.$error.required)
//                     angular.element('#inpRemitInsToAddressLine1').focus();
//                 else if ($scope.frmLocationCrud.inpRemitInsToCity.$error.required)
//                     angular.element('#inpRemitInsToCity').focus();
//                 else if (!ofcLocation.InsuranceRemittanceState) {
//                     $($("#inpRemitInsToState .k-widget.k-dropdown").find('select')[0]).data('kendoDropDownList').focus();
//                     $scope.formIsValid = false;
//                 }
//                 else if ($scope.frmLocationCrud.inpRemitInsToZipCode.$error.required)
//                     angular.element('#inpRemitInsToZipCode').focus();
//                 else if (!$scope.frmLocationCrud.inpEditRemitInsTaxId.$valid)
//                     angular.element('#inpEditRemitInsTaxId').focus();
//                 else if (!ofcLocation.InsuranceRemittanceTypeTwoNpi || ofcLocation.InsuranceRemittanceTypeTwoNpi.length !== 10)
//                     angular.element('#inpEditRemitInsBillingEntityNPI').focus();
//                 else if (!$scope.frmLocationCrud.inpEditRemitInsLicenseNumber.$valid)
//                     angular.element('#inpEditRemitInsLicenseNumber').focus();
//             }
//         };

//         // #endregion

//         // #region authorization

//         // view access
//         this.authViewAccess = function () {
//             return patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizloc-view');
//         };

//         // create access
//         this.authCreateAccess = function () {
//             return patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizloc-add');
//         };

//         // edit access
//         this.authEditAccess = function () {
//             return patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizloc-edit');
//         };

//         // checking access
//         this.authAccess = function () {
//             $scope.hasViewAccess = ctrl.authViewAccess();
//             $scope.hasCreateAccess = ctrl.authCreateAccess();
//             $scope.hasEditAccess = ctrl.authEditAccess();

//             if (!$scope.hasViewAccess) {
//                 toastrFactory.error(localize.getLocalizedString('User is not authorized to access this area.'), localize.getLocalizedString('Not Authorized'));
//                 $location.path('/');
//             }
//         };

//         // authorization
//         ctrl.authAccess();

//         // #endregion

//         //#region rx clinic

//         ctrl.confirmNoRxAccessOnSave = function () {
//             var message = localize.getLocalizedString('{0}\n\n {1}', ['Rx access requires Primary Phone and Fax.', 'Would you like to add these before continuing?']);
//             var title = localize.getLocalizedString('Confirm before saving');
//             var button2Text = localize.getLocalizedString('No');
//             var button1Text = localize.getLocalizedString('Yes');
//             modalFactory.ConfirmModal(title, message, button1Text, button2Text).then(ctrl.cancelSave, ctrl.resumeSave);
//         };

//         ctrl.cancelSave = function () {
//         };

//         ctrl.resumeSave = function () {
//             $scope.saveLocationAfterUniqueChecks();
//         };

//         // location must have phone and fax to have rx access
//         ctrl.validateRxClinic = function () {
//             if (!$scope.selectedLocation.NameLine1 ||
//                 !$scope.selectedLocation.City ||
//                 !$scope.selectedLocation.AddressLine1 ||
//                 !$scope.selectedLocation.State ||
//                 !$scope.selectedLocation.ZipCode ||
//                 !$scope.selectedLocation.Fax || !$scope.selectedLocation.Fax.length > 0 ||
//                 !$scope.selectedLocation.PrimaryPhone || !$scope.selectedLocation.PrimaryPhone.length > 0) {
//                 $scope.addRxClinic = false;
//                 // confirm that they want to save without phone and fax
//                 ctrl.confirmNoRxAccessOnSave();
//             } else {
//                 $scope.addRxClinic = true;
//                 $scope.saveLocationAfterUniqueChecks();
//             }
//         };

//         // template for clinic save
//         ctrl.createRxLocation = function (location) {
//             var formattedZipCode = $filter('zipCode')(location.ZipCode);

//             // get the application id
//             var userContext = JSON.parse(sessionStorage.getItem('userContext'));
//             var applicationId = userContext.Result.Application.ApplicationId;
//             var rxLocation = {
//                 Name: location.NameLine1,
//                 ApplicationId: applicationId,
//                 Fax: location.Fax,
//                 Address1: location.AddressLine1,
//                 Address2: location.AddressLine2,
//                 City: location.City,
//                 State: location.State,
//                 PostalCode: formattedZipCode,
//                 Phone: location.PrimaryPhone
//             };
//             return rxLocation;
//         };
//         $scope.$watch('location.LocationId', function (nv, ov) {
//             if (nv) {
//                 $scope.invalidDataForRx = false;
//                 $scope.addRxClinic = true;
//                 ctrl.saveRxClinic($scope.location);
//             }
//         });

//         ctrl.saveRxClinicSuccess = function (res) {
//             $scope.invalidDataForRx = false;
//             if ($scope.editMode) {
//                 //toastrFactory.error(localize.getLocalizedString('{0} {1} was unsuccessful. Please retry your save.', ['Rx Access', 'save'], localize.getLocalizedString('Server Error')));
//             }
//         };

//         ctrl.saveRxClinicFailed = function () {
//             // show rx message
//             $scope.invalidDataForRx = true;
//             if ($scope.editMode) {
//                 //toastrFactory.success(localize.getLocalizedString('Your Rx location has been saved.'), localize.getLocalizedString('Success'));
//             }
//         };

//         $scope.addRxClinic = false;
//         // save clinic info
//         ctrl.saveRxClinic = function (location) {
//             if ($scope.hasCreateAccess && $scope.addRxClinic) {
//                 var rxLocation = ctrl.createRxLocation(location);
//                 rxService.saveRxClinic(location, rxLocation).then(
//                     function (res) {
//                         ctrl.saveRxClinicSuccess(res);
//                     },
//                     function (res) {
//                         ctrl.saveRxClinicFailed(res);
//                     });
//                 $scope.addRxClinic = false;
//             }
//         };

//         //#endregion
//     }
// ]).filter('anyCardTypeSelected', function () {
//     return function (selectedLocation) {
//         if (selectedLocation) {
//             return selectedLocation.AcceptMasterCardOnEstatement ||
//                 selectedLocation.AcceptDiscoverOnEstatement ||
//                 selectedLocation.AcceptVisaOnEstatement ||
//                 selectedLocation.AcceptAmericanExpressOnEstatement;
//         }
//         return false;
//     };
// });

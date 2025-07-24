// TODO - need to remove this later
// describe('location-crud -> ', function () {
//     var scope, location, ctrl, $httpBackend, q, toastrFactory, listHelper, _locationServicesMock_, _patientServices_;
//     var modalFactory, selectedLocation, referenceDataService, rxService;
//     //#region mocks

//     var locationMock = { Value: { ProviderTaxRate: .0234, SalesAndUseTaxRate: .11567, State: 'IL', ZipCode: '62401' } };
//     var taxonomyListMock = [
//         { TaxonomyCodeId: 1, Code: "122300000X", Category: "Dentist", IsDentalSpecialty: true, Order: 0 },
//         { TaxonomyCodeId: 10, Code: "1223D0008X", Category: "Oral & Maxillofacial Radiology", IsDentalSpecialty: true, Order: 0 }
//     ];

//     var mockPatientResult = [
//         {
//             PatientId: '20000000-0000-0000-0000-000000000001',
//             FirstName: 'Robert',
//             LastName: 'Jackson',
//             PreferredName: 'Bob',
//             DateOfBirth: Date,
//             IsActive: true,
//             IsPatient: true,
//             PhoneNumber: '1112223333'
//         },
//         {
//             PatientId: '20000000-0000-0000-0000-00000000003',
//             FirstName: 'Patricia',
//             LastName: 'Jackson',
//             PreferredName: 'Pat',
//             DateOfBirth: Date,
//             IsActive: true,
//             IsPatient: true,
//             PhoneNumber: '3334445555'
//         },
//         {
//             PatientId: '20000000-0000-0000-0000-00000000002',
//             FirstName: 'Sidney',
//             LastName: 'Jackson',
//             PreferredName: 'Sid',
//             DateOfBirth: Date,
//             IsActive: true,
//             IsPatient: false,
//             PhoneNumber: '2223334444'
//         }
//     ];

//     //#endregion

//     // #region setup

//     beforeEach(module("Soar.Common", function ($provide) {
//         toastrFactory = {};
//         toastrFactory.error = jasmine.createSpy();
//         toastrFactory.success = jasmine.createSpy();
//         $provide.value('toastrFactory', toastrFactory);

//         listHelper = {
//             findItemByFieldValue: jasmine.createSpy('findItemByFieldValue')
//         };
//         $provide.value('ListHelper', listHelper);
//         referenceDataService = {
//             forceEntityExecution: jasmine.createSpy(),
//             get: jasmine.createSpy().and.returnValue({}),
//             entityNames: {
//                 practiceSettings: 'practiceSettings',
//                 locations: 'locations'
//             }
//         };

//         $provide.value('referenceDataService', referenceDataService);
//     }));
//     beforeEach(module("common.factories"));

//     beforeEach(module("Soar.BusinessCenter", function () {
//         _locationServicesMock_ = {
//             save: jasmine.createSpy().and.returnValue(''),
//             update: jasmine.createSpy().and.returnValue(''),
//             getUsers: jasmine.createSpy().and.returnValue('getUsers'),
//             getRooms: jasmine.createSpy().and.returnValue('getRooms'),
//             IsNameUnique: jasmine.createSpy().and.returnValue('IsNameUnique'),
//             saveRxClinic: jasmine.createSpy().and.callFake(function () {
//                 var deferred = q.defer();
//                 deferred.$promise = deferred.promise;
//                 deferred.resolve({});
//                 return deferred;
//             }),
//             locationsRoomUsageStatus: jasmine.createSpy().and.returnValue('locationRoomUsageStatus'),
//             getAdditionalIdentifiers: jasmine.createSpy(),
//             getLocationEstatementEnrollmentStatus: jasmine.createSpy()
//         };
//     }));

//     var mockServiceReturnWrapper = {
//         Value: mockPatientResult,
//         Count: 3
//     };

//     beforeEach(module("Soar.Patient", function ($provide) {
//         _patientServices_ = {
//             Patients: {
//                 search: jasmine.createSpy().and.returnValue(mockServiceReturnWrapper),
//             }
//         };
//         $provide.value('PatientServices', _patientServices_);
//     }));

//     beforeEach(inject(function ($rootScope, $controller, $injector, $location, $q) {
//         q = $q;
//         scope = $rootScope.$new();
//         location = $location;
//         location.path = jasmine.createSpy();

//         //modalFactory mock
//         modalFactory = {
//             ConfirmModal: jasmine.createSpy('modalFactory.ConfirmModal').and.callFake(function () {
//                 var deferred = q.defer();
//                 deferred.resolve('some value in return');
//                 return {
//                     result: deferred.promise,
//                     then: function () { }
//                 };
//             }),
//         };

//         rxService = {};

//         ctrl = $controller('LocationCrudController', {
//             $scope: scope,
//             //patSecurityService: _authPatSecurityService_,
//             LocationServices: _locationServicesMock_,
//             ModalFactory: modalFactory,
//             RxService: rxService
//         });
//         scope.loadingLocations = false;

//         var soarConfig = $injector.get('SoarConfig');
//         $httpBackend = $injector.get('$httpBackend');
//         $httpBackend.expectGET(soarConfig.domainUrl + '/applicationsettings/taxonomycodes').respond(taxonomyListMock);
//         scope.frmLocationCrud = {
//             $valid: true,
//             inpProviderTaxRate: 0,
//             inpSalesAndUseTaxRate: 0,
//             $setPristine: function () { }
//         };
//     }));

//     // #endregion

//     describe('ctrl.locationWatch function ->', function () {
//         beforeEach(function () {
//             ctrl.hasChanges = jasmine.createSpy('hasChanges').and.returnValue(false);
//             scope.cancelConfirmed = jasmine.createSpy('cancelConfirmed');
//             ctrl.getUsersByLocation = jasmine.createSpy('getUsersByLocation');
//             ctrl.getRoomsByLocation = jasmine.createSpy('getRoomsByLocation');
//             ctrl.setDefaultValues = jasmine.createSpy('setDefaultValues');
//             location.search = jasmine.createSpy().and.returnValue({ locationId: 123 });

//             scope.selectedLocation = null;
//             ctrl.locationWatch({ LocationId: null }, null);
//         });

//         it('should call ctrl.getUsersByLocation', function () {
//             expect(ctrl.getUsersByLocation).toHaveBeenCalled();
//         });

//         it('should call ctrl.getRoomsByLocation', function () {
//             expect(ctrl.getRoomsByLocation).toHaveBeenCalled();
//         });

//         it('should call ctrl.setDefaultValues', function () {
//             expect(ctrl.setDefaultValues).toHaveBeenCalled();
//         });
//     });

//     describe('ctrl.locationWatch set edit mode function ->', function () {
//         beforeEach(function () {
//             ctrl.hasChanges = jasmine.createSpy('hasChanges').and.returnValue(false);
//             scope.cancelConfirmed = jasmine.createSpy('cancelConfirmed');
//             ctrl.getUsersByLocation = jasmine.createSpy('getUsersByLocation');
//             ctrl.getRoomsByLocation = jasmine.createSpy('getRoomsByLocation');
//             ctrl.setDefaultValues = jasmine.createSpy('setDefaultValues');
//             scope.selectedLocation = null;
//             location.search = jasmine.createSpy().and.returnValue(123);
//         });

//         it('should set editMode to true if no locations and locationLoading is false', function () {
//             scope.loadingLocations = false;
//             ctrl.locationWatch({ LocationId: null }, null);
//             expect(scope.editMode).toBe(false);
//         });

//         it('should set editMode to false if no locations and locationLoading is false', function () {
//             scope.loadingLocations = false;
//             ctrl.locationWatch({ LocationId: 1 }, null);
//             expect(scope.editMode).toBe(false);
//         });
//     });

//     describe('ctrl.getUsersByLocation function ->', function () {
//         it('should call locationServices.getUsers API when location has a LocationId', function () {
//             var ofcLocation = { LocationId: 1 };

//             ctrl.getUsersByLocation(ofcLocation);

//             expect(_locationServicesMock_.getUsers).toHaveBeenCalled();
//         });
//     });

//     describe('ctrl.getRoomsByLocation function ->', function () {
//         it('should call locationServices.getRooms API when location has a LocationId', function () {
//             var ofcLocation = { LocationId: 1 };
//             scope.hasTreatmentRoomsViewAccess = true;

//             ctrl.getRoomsByLocation(ofcLocation);

//             expect(_locationServicesMock_.getRooms).toHaveBeenCalled();
//         });
//     });

//     describe('$scope.saveFunc function ->', function () {
//         it('should call locationServices.IsNameUnique API if location has NameLine1 filled', function () {
//             scope.selectedLocation = { LocationId: null, NameLine1: 'Test', Rooms: [], State: "CA", FeeListId: 1 };

//             scope.saveFunc();

//             expect(_locationServicesMock_.IsNameUnique).toHaveBeenCalled();
//             expect(scope.formIsValid).toEqual(true);
//         });

//         it('should not call locationServices.IsNameUnique API if location has MinimumFinanceCharge greater than 999999.99', function () {
//             scope.selectedLocation = { LocationId: null, NameLine1: 'Test', Rooms: [], MinimumFinanceCharge: 1000000, FeeListId: 1 };

//             scope.saveFunc();

//             expect(scope.formIsValid).toEqual(false);
//         });

//         it('should not call locationServices.IsNameUnique API if location has DefaultFinanceCharge filled but AccountsOverdue is not filled', function () {
//             scope.selectedLocation = { LocationId: null, NameLine1: 'Test', Rooms: [], DefaultFinanceCharge: 15.25, FeeListId: 1 };
//             scope.saveFunc();
//             expect(scope.formIsValid).toEqual(false);
//         });
//     });

//     describe('$scope.setAccountsOverDue function ->', function () {
//         it('should enable AccountsOverDue when DefaultFinanceCharge is filled', function () {
//             var selectedLocation = { DefaultFinanceCharge: 11.22, AccountsOverDue: null };
//             scope.setAccountsOverDue(selectedLocation);
//             expect(scope.enableAccountsOverDue).toEqual(true);
//         });

//         it('should disable AccountsOverDue when DefaultFinanceCharge is not filled', function () {
//             var selectedLocation = { DefaultFinanceCharge: null };
//             scope.setAccountsOverDue(selectedLocation);
//             expect(scope.enableAccountsOverDue).toEqual(false);
//             expect(selectedLocation.AccountsOverDue).toEqual(null);
//         });
//     });

//     describe('$scope.confirmCancel function ->', function () {
//         beforeEach(function () {
//             ctrl.setDefaultValues = jasmine.createSpy('setDefaultValues');
//             scope.updateDataHasChangedFlag = jasmine.createSpy('updateDataHasChangedFlag');
//             scope.cancelConfirmed = jasmine.createSpy('cancelConfirmed');
//             ctrl.selectedLocInit = jasmine.createSpy();

//             scope.confirmCancel();
//         });

//         it('should call ctrl.setDefaultValues', function () {
//             expect(ctrl.setDefaultValues).toHaveBeenCalled();
//         });

//         it('should call scope.updateDataHasChangedFlag', function () {
//             expect(scope.updateDataHasChangedFlag).toHaveBeenCalledWith(true);
//         });

//         it('should call scope.cancelConfirmed', function () {
//             expect(scope.cancelConfirmed).toHaveBeenCalled();
//         });
//     });

//     describe('$scope.saveCheckForUniqueDisplayNameSuccess function ->', function () {
//         beforeEach(function () {
//             spyOn(ctrl, 'validateRxClinic');
//         });

//         it('should call ctrl.validateRxClinic()', function () {
//             scope.saveCheckForUniqueDisplayNameSuccess({ Value: true });
//             expect(ctrl.validateRxClinic).toHaveBeenCalled();
//         });

//         it('should call ctrl.validateRxClinic()', function () {
//             scope.saveCheckForUniqueDisplayNameSuccess({ Value: false });
//             expect(ctrl.validateRxClinic).not.toHaveBeenCalled();
//         });
//     });

//     describe('$scope.checkForUniqueLocationName function ->', function () {
//         it('should call locationServices.IsNameUnique API if location has NameLine1 filled', function () {
//             scope.selectedLocation = { LocationId: null, NameLine1: 'Test' };

//             scope.checkForUniqueLocationName();

//             expect(_locationServicesMock_.IsNameUnique).toHaveBeenCalled();
//         });
//     });

//     describe('$scope.addRoom function ->', function () {
//         it('should set new room ObjectState to Add', function () {
//             scope.selectedLocation = {
//                 Rooms: []
//             };

//             scope.addRoom();

//             expect(scope.selectedLocation.Rooms[0].ObjectState).toEqual('Add');
//         });
//     });

//     describe('$scope.roomOnChange function ->', function () {
//         var room = { RoomId: 1, ObjectState: 'None' };
//         beforeEach(function () {
//             ctrl.checkForRoomDuplicates = jasmine.createSpy('checkForRoomDuplicates');
//             scope.selectedLocation = {
//                 Rooms: []
//             };
//             scope.selectedLocation.Rooms.push(room);

//             scope.roomOnChange(room, 0);
//         });

//         it('should set room ObjectState to Update if room has a RoomId', function () {
//             expect(scope.selectedLocation.Rooms[0].ObjectState).toEqual('Update');
//         });

//         it('should call checkForRoomDuplicates', function () {
//             expect(ctrl.checkForRoomDuplicates).toHaveBeenCalledWith(room, 0);
//         });
//     });

//     describe('$scope.deleteRoom function ->', function () {
//         it('should call remove room from selectecLocation with room has a RoomId', function () {
//             var room = { RoomId: 1, ObjectState: 'None' };
//             scope.deleteRoom(room, 0);

//             expect(room.ObjectState).toEqual('Delete');
//         });
//     });

//     describe('this.locationAddUpdateSuccess function ->', function () {
//         var result = {
//             Value: {
//                 Rooms: [],
//                 Timezone: 'Central Standard Time'
//             }
//         };
//         beforeEach(function () {
//             scope.updateDataHasChangedFlag = jasmine.createSpy('updateDataHasChangedFlag');
//             scope.saveSuccessful = jasmine.createSpy('saveSuccessful');
//             ctrl.setDefaultValues = jasmine.createSpy('setDefaultValues');
//             ctrl.setDisplayTimezone = jasmine.createSpy();

//             ctrl.locationAddUpdateSuccess(result);
//         });

//         it('should call scope.updateDataHasChangedFlag with true', function () {
//             expect(scope.updateDataHasChangedFlag).toHaveBeenCalledWith(true);
//         });

//         it('should call scope.saveSuccessful with result.Value', function () {
//             expect(scope.saveSuccessful).toHaveBeenCalledWith(result.Value);
//         });

//         it('should call ctrl.setDefaultValues with result', function () {
//             expect(ctrl.setDefaultValues).toHaveBeenCalledWith(result.Value);
//         });

//         //it('should call ctrl.saveRxClinic with result', function () {
//         //    spyOn(ctrl, 'saveRxClinic');
//         //    expect(ctrl.saveRxClinic).toHaveBeenCalledWith(result.Value);
//         //});
//     });

//     describe('this.validateForm function ->', function () {
//         it('should validate if the Default Finance Charge is greater than 0', function () {
//             locationMock.DefaultFinanceCharge = 10; // 10 percent
//             locationMock.MinimumFinanceCharge = 15; // 15 dollars
//             locationMock.Rooms = [];
//             locationMock.State = 'MN';
//             locationMock.AccountsOverDue = 30;
//             locationMock.FeeListId = 1;
//             scope.selectedLocation = locationMock;
//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(true);
//         });
//     });

//     describe('this.validateForm function ->', function () {
//         it('should not validate if the Default Finance Charge is equal to 0', function () {
//             locationMock.DefaultFinanceCharge = 0; // 0 percent
//             locationMock.MinimumFinanceCharge = 15; // 15 dollars
//             locationMock.Rooms = [];
//             locationMock.State = 'MN';
//             locationMock.AccountsOverDue = 30;
//             scope.selectedLocation = locationMock;
//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(false);
//         });
//     });

//     describe('this.validateForm function ->', function () {
//         it('should validate if the Minimum Finance Charge is greater than 0', function () {
//             locationMock.DefaultFinanceCharge = 10; // 10 percent
//             locationMock.MinimumFinanceCharge = 15; // 15 dollars
//             locationMock.Rooms = [];
//             locationMock.State = 'MN';
//             locationMock.AccountsOverDue = 30;
//             locationMock.FeeListId = 1;
//             scope.selectedLocation = locationMock;
//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(true);
//         });
//     });

//     describe('this.validateForm function ->', function () {
//         it('should not validate if the Minimum Finance Charge is equal to 0', function () {
//             locationMock.DefaultFinanceCharge = 10; // 10 percent
//             locationMock.MinimumFinanceCharge = 0; // 0 dollars
//             locationMock.Rooms = [];
//             locationMock.State = 'MN';
//             locationMock.AccountsOverDue = 30;
//             scope.selectedLocation = locationMock;
//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(false);
//         });
//     });

//     describe('this.validateForm function ->', function () {
//         it('should not validate if the IsPaymentGatewayEnabled is true and MerchantId is empty', function () {
//             locationMock.DefaultFinanceCharge = 15; // 15 percent
//             locationMock.MinimumFinanceCharge = 15; // 15 dollars
//             locationMock.Rooms = [];
//             locationMock.State = 'MN';
//             locationMock.AccountsOverDue = 30;
//             locationMock.MerchantId = '';
//             locationMock.IsPaymentGatewayEnabled = true;
//             scope.selectedLocation = locationMock;
//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(false);
//         });
//     });

//     describe('this.validateForm function ->', function () {
//         it('should validate if the IsPaymentGatewayEnabled is true and MerchantId is not empty', function () {
//             locationMock.DefaultFinanceCharge = 15; // 15 percent
//             locationMock.MinimumFinanceCharge = 15; // 15 dollars
//             locationMock.Rooms = [];
//             locationMock.State = 'MN';
//             locationMock.AccountsOverDue = 30;
//             locationMock.MerchantId = 'somemerchantid123';
//             locationMock.IsPaymentGatewayEnabled = true;
//             locationMock.FeeListId = 1;
//             scope.selectedLocation = locationMock;

//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(true);
//         });
//     });

//     describe('this.validateForm function ->', function () {
//         it('should not validate if DisplayCardsOnEstatement is false and other card fields are true', function () {
//             locationMock.DisplayCardsOnEstatement = false;
//             locationMock.AcceptMasterCardOnEstatement = true;
//             scope.selectedLocation = locationMock;
//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(false);
//         });
//     });

//     describe('this.validateForm function ->', function () {
//         it('should not validate if DisplayCardsOnEstatement is true and all card box fields are false', function () {
//             locationMock.DisplayCardsOnEstatement = true;
//             locationMock.AcceptMasterCardOnEstatement = false;
//             scope.selectedLocation = locationMock;
//             ctrl.validateForm();
//             expect(scope.formIsValid).toEqual(false);
//         });
//     });

//     describe('ctrl.confirmNoRxAccessOnSave function ->', function () {
//         it('should call ConfirmModal', function () {
//             ctrl.confirmNoRxAccessOnSave();
//             expect(modalFactory.ConfirmModal).toHaveBeenCalled();
//         });
//     });

//     describe('ctrl.resumeSave function ->', function () {
//         it('should call ConfirmModal ', function () {
//             spyOn(scope, 'saveLocationAfterUniqueChecks');
//             scope.selectedLocation = {
//                 ProviderTaxRate: 0.0,
//                 PrimaryPhone: '',
//                 ZipCode: '',
//                 Fax: '',
//                 SecondaryPhone: '',
//                 TaxId: '',
//                 SalesAndUseTaxRate: 0.0
//             };
//             ctrl.resumeSave();
//             expect(scope.saveLocationAfterUniqueChecks).toHaveBeenCalled();
//         });
//     });

//     describe('ctrl.validateRxClinic function ->', function () {
//         it('should set scope.addRxClinic false if not valid for rx access ', function () {
//             scope.selectedLocation = {
//                 ProviderTaxRate: 0.0,
//                 PrimaryPhone: '',
//                 ZipCode: '',
//                 Fax: '',
//                 SecondaryPhone: '',
//                 TaxId: '',
//                 SalesAndUseTaxRate: 0.0
//             };
//             ctrl.validateRxClinic();
//             expect(scope.addRxClinic).toBe(false);
//         });

//         it('should call ctrl.confirmNoRxAccessOnSave if not valid for rx access ', function () {
//             spyOn(ctrl, 'confirmNoRxAccessOnSave');
//             scope.selectedLocation = {
//                 ProviderTaxRate: 0.0,
//                 PrimaryPhone: '',
//                 ZipCode: '',
//                 Fax: '',
//                 SecondaryPhone: '',
//                 TaxId: '',
//                 SalesAndUseTaxRate: 0.0
//             };
//             ctrl.validateRxClinic();
//             expect(ctrl.confirmNoRxAccessOnSave).toHaveBeenCalled();
//         });

//         it('should set scope.addRxClinic true if valid for rx access ', function () {
//             spyOn(scope, 'saveLocationAfterUniqueChecks');
//             scope.selectedLocation = {
//                 NameLine1: 'AnyName',
//                 PrimaryPhone: '1222225555',
//                 ZipCode: '62401',
//                 Fax: '1222225555',
//                 City: 'AnyTown',
//                 State: 'IL',
//                 AddressLine1: 'AnyAddress',
//             };
//             ctrl.validateRxClinic();
//             expect(scope.addRxClinic).toBe(true);
//             expect(scope.saveLocationAfterUniqueChecks).toHaveBeenCalled();
//         });
//     });

//     describe('ctrl.createRxLocation function ->', function () {
//         it('should return rxLocation object with ApplicationId from userContext ', function () {
//             var usrContext = '{ "Result": { "Application": { "ApplicationId": "4" } } }';
//             sessionStorage.setItem('userContext', usrContext);
//             scope.selectedLocation = {
//                 NameLine1: 'AnyName',
//                 PrimaryPhone: '1222225555',
//                 ZipCode: '62401',
//                 Fax: '1222225555',
//                 City: 'AnyTown',
//                 State: 'IL',
//                 AddressLine1: 'AnyAddress',
//             };
//             expect((ctrl.createRxLocation(scope.selectedLocation)).ApplicationId).toEqual('4');
//             expect((ctrl.createRxLocation(scope.selectedLocation)).Name).toEqual(scope.selectedLocation.NameLine1);
//             expect((ctrl.createRxLocation(scope.selectedLocation)).Phone).toEqual(scope.selectedLocation.PrimaryPhone);
//         });
//     });

//     describe('ctrl.saveRxClinic function ->', function () {

//         beforeEach(function () {
//             scope.hasCreateAccess = true;
//             scope.selectedLocation = {
//                 LocationId: '123',
//                 NameLine1: 'AnyName',
//                 PrimaryPhone: '1222225555',
//                 ZipCode: '62401',
//                 Fax: '1222225555',
//                 City: 'AnyTown',
//                 State: 'IL',
//                 AddressLine1: 'AnyAddress',
//             };
//             spyOn(ctrl, 'createRxLocation').and.returnValue({ Name: 'AnyName' });
//             scope.hasCreateAccess = true;
//             scope.addRxClinic = true;

//             rxService.saveRxClinic = jasmine.createSpy().and.returnValue({ then: () => {} });
//         });

//         it('should call locationServices.saveRxClinic if hasCreateAccess and addRxClinic is true ', function () {
//             ctrl.saveRxClinic(scope.selectedLocation);
//             expect(rxService.saveRxClinic).toHaveBeenCalledWith(scope.selectedLocation, { Name: 'AnyName' });
//         });

//         it('should call createRxLocation if hasCreateAccess and addRxClinic is true ', function () {
//             ctrl.saveRxClinic(scope.selectedLocation);
//             expect(ctrl.createRxLocation).toHaveBeenCalledWith(scope.selectedLocation);
//         });

//         it('should not call locationServices.saveRxClinic if not hasCreateAccess or addRxClinic is false ', function () {
//             scope.hasCreateAccess = false;
//             scope.addRxClinic = false;
//             expect(rxService.saveRxClinic).not.toHaveBeenCalled();
//         });

//         describe('success callback ->', function() {

//             let result;
//             beforeEach(function() {
//                 result = 'saveResults';
//                 rxService.saveRxClinic = jasmine.createSpy().and.returnValue({ then: s => s(result) });
//                 ctrl.saveRxClinicSuccess = jasmine.createSpy();
//             });

//             it('should call ctrl.saveRxClinicSuccess with result', function() {
//                 ctrl.saveRxClinic(scope.selectedLocation);

//                 expect(ctrl.saveRxClinicSuccess).toHaveBeenCalledWith(result);
//             });

//         });

//         describe('failure callback ->', function() {

//             let result;
//             beforeEach(function() {
//                 result = 'saveResults';
//                 rxService.saveRxClinic = jasmine.createSpy().and.returnValue({ then: (s, f) => f(result) });
//                 ctrl.saveRxClinicFailed = jasmine.createSpy();
//             });

//             it('should call ctrl.saveRxClinicSuccess with result', function() {
//                 ctrl.saveRxClinic(scope.selectedLocation);

//                 expect(ctrl.saveRxClinicFailed).toHaveBeenCalledWith(result);
//             });

//         });

//     });

//     describe('scope.remitAddressSourceChanged function ->', function () {
//         it('should null RemitOtherLocationId when RemitAddressSourceNot 1', function () {
//             scope.selectedLocation = {
//                 RemitAddressSource: 0,
//                 RemitOtherLocationId: 14
//             };
//             scope.remitAddressSourceChanged();
//             expect(scope.selectedLocation.RemitOtherLocationId).toEqual('');
//         });
//     });

//     describe('scope.remitAddressSourceChanged function ->', function () {
//         it('should null remit address fields when RemitAddressSourceNot 2', function () {
//             scope.selectedLocation = {
//                 RemitAddressSource: 0,
//                 RemitToNameLine1: "Some Name",
//                 RemitToNameLine2: "Some Name 2",
//                 RemitToAddressLine1: "Some Street Address",
//                 RemitToAddressLine2: "Some Street Address 2",
//                 RemitToCity: "Some City",
//                 RemitToState: "Some State",
//                 RemitToZipCode: "55555",
//                 RemitToPrimaryPhone: "555-555-5555"
//             };
//             scope.remitAddressSourceChanged();
//             expect(scope.selectedLocation.RemitToNameLine1).toEqual('');
//             expect(scope.selectedLocation.RemitToNameLine2).toEqual('');
//             expect(scope.selectedLocation.RemitToAddressLine1).toEqual('');
//             expect(scope.selectedLocation.RemitToAddressLine2).toEqual('');
//             expect(scope.selectedLocation.RemitToCity).toEqual('');
//             expect(scope.selectedLocation.RemitToState).toEqual('');
//             expect(scope.selectedLocation.RemitToZipCode).toEqual('');
//             expect(scope.selectedLocation.RemitToPrimaryPhone).toEqual('');
//         });
//     });

//     describe('anyCardTypeSelected -> ', function () {
//         var filter;

//         beforeEach(inject(function ($filter) {
//             filter = $filter('anyCardTypeSelected');
//             selectedLocation = { AcceptMasterCardOnEstatement: false, AcceptDiscoverOnEstatement: false, AcceptVisaOnEstatement: false, AcceptAmericanExpressOnEstatement: false };
//         }));

//         it('should return true if selectedLocation has any credit card marked true for statements', function () {
//             selectedLocation.AcceptMasterCardOnEstatement = true;
//             expect(filter(selectedLocation)).toBe(true);

//             selectedLocation.AcceptMasterCardOnEstatement = false;
//             selectedLocation.AcceptDiscoverOnEstatement = true;
//             expect(filter(selectedLocation)).toBe(true);

//             selectedLocation.AcceptVisaOnEstatement = true;
//             selectedLocation.AcceptDiscoverOnEstatement = false;
//             expect(filter(selectedLocation)).toBe(true);

//             selectedLocation.AcceptVisaOnEstatement = false;
//             selectedLocation.AcceptAmericanExpressOnEstatement = true;
//             expect(filter(selectedLocation)).toBe(true);
//         });

//         it('should return false if selected location has no credit card marked true for statements', function () {
//             expect(filter(selectedLocation)).toBe(false);
//         });
//         it('should return false if no selectedLocation', function () {
//             selectedLocation = null;
//             expect(filter(selectedLocation)).toBe(false);
//         });
//     });

//     // TODO fix this
//     //describe('location.LocationId watch - >', function () {
//     //    it('should call saveRxClinic when new value', function () {
//     //        spyOn(ctrl, 'saveRxClinic');
//     //        scope.location = { LocationId: '123' }
//     //        scope.$apply();
//     //        scope.location = { LocationId: '456' }
//     //        scope.$apply();
//     //        expect(ctrl.saveRxClinic).toHaveBeenCalledWith(scope.location);
//     //    });
//     //});

//     describe('ctrl.saveRxClinicSuccess function ->', function () {
//         it('should invalidDataForRx to false', function () {
//             var res = {};
//             ctrl.saveRxClinicSuccess(res);
//             expect(scope.invalidDataForRx).toBe(false);
//         });
//     });

//     describe('ctrl.saveRxClinicFailed function ->', function () {
//         it('should invalidDataForRx to true', function () {
//             var res = {};
//             ctrl.saveRxClinicFailed(res);
//             expect(scope.invalidDataForRx).toBe(true);
//         });
//     });
// });

// TODO : need to remove this later
// describe('Controller: ServiceCodeCrudController', function () {
//     var ctrl, scope, rootScope, toastrFactory, localize, animate, timeout, element, modalFactory;
//     var data, patSecurityService, boundObjectFactory, serviceCodeCrudService, searchFactory, cdtCodeService;
//     var listHelper, mockCdtCodeResult, mockServiceReturnWrapperNoCdtCodes, mockServiceReturnWrapper, q, locationProvider;
//     var preventiveCareFactory, chartingFavoritesFactory, usersFactory, serviceCodesFactory, referenceDataService;

//     var serviceCode = {
//         ServiceCodeId: 2,
//         CdtCodeId: 2,
//         Code: 'myCode2',
//         Description: 'myDescription2',
//         ServiceTypeId: 2,
//         DisplayAs: 'customName2',
//         Fee: '44',
//         TaxableServiceTypeId: 0,
//         AffectedAreaId: 0,
//         UsuallyPerformedByProviderTypeId: '',
//         UseCodeForRangeOfTeeth: false,
//         SetsToothAsMissing: false,
//         IsActive: true,
//         IsEligibleForDiscount: false,
//         Notes: 'myNotes2',
//         SubmitOnInsurance: true,
//         IconName: null,
//         UseSmartCodes: true,
//         SmartCode1Id: null,
//         SmartCode2Id: null,
//         SmartCode3Id: null,
//         SmartCode4Id: null,
//         SmartCode5Id: null,
//     };

//     beforeEach(module("Soar.Common"));
//     beforeEach(module("common.factories"));
//     beforeEach(module('Soar.BusinessCenter', function ($provide) {
//         referenceDataService = {
//             get: jasmine.createSpy().and.callFake(function () {
//                 return [];
//             }),
//             setFeesByLocation: jasmine.createSpy(),
//             forceEntityExecution: jasmine.createSpy(),
//             entityNames: {
//                 serviceTypes: 'serviceTypes',
//                 preventiveServiceTypes: 'preventiveServiceTypes',
//                 serviceCodes: 'serviceCodes'
//             }
//         };

//         $provide.value('referenceDataService', referenceDataService);
//     }));
//     beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
//         scope = $rootScope.$new();
//         scope.data = {};
//         q = $q;
//         rootScope = $rootScope;

//         //mock for listHelper service
//         listHelper = {
//             findItemByFieldValue: jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null),
//             findIndexByFieldValue: jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(0)
//         }

//         //serviceCode object
//         scope.data.ServiceCode = {
//             ServiceCodeId: 1,
//             CdtCodeId: 1,
//             Code: 'myCode',
//             Description: 'myDescription',
//             ServiceTypeId: 1,
//             DisplayAs: 'customName',
//             Fee: '10.6',
//             TaxableServiceTypeId: 0,
//             AffectedAreaId: 0,
//             UsuallyPerformedByProviderTypeId: '',
//             UseCodeForRangeOfTeeth: false,
//             SetsToothAsMissing: false,
//             IsActive: true,
//             IsEligibleForDiscount: false,
//             Notes: 'myNotes',
//             SubmitOnInsurance: true,
//             IconName: null,
//             UseSmartCodes: false,
//             SmartCode1Id: null,
//             SmartCode2Id: null,
//             SmartCode3Id: null,
//             SmartCode4Id: null,
//             SmartCode5Id: null,
//         };

//         scope.swiftPickServiceCodesDummyList = [
//             { "ServiceCodeId": "00000000-0000-0000-0000-000000000001" },
//             { "ServiceCodeId": "00000000-0000-0000-0000-000000000002" }
//         ];
//         scope.swiftCode = {
//             Data: {
//                 SwiftPickServiceCodes: [],
//                 IsActive: true
//             }
//         }
//         scope.serviceCode = {
//             Data: {
//                 ServiceCodeId: "00000000-0000-0000-0000-000000001234"
//             }
//         }
//         //serviceTypes data
//         scope.data.ServiceTypes = [
//             { "ServiceTypeId": "e928ed50-1c73-4836-8a07-11d4ac39e947", "IsSystemType": true, "Description": "Adjunctive General Services", "IsAssociatedWithServiceCode": false },
//             { "ServiceTypeId": "c44c441e-d3c5-47ff-83b3-617e7c59804c", "IsSystemType": false, "Description": "custom servicetype", "IsAssociatedWithServiceCode": false },
//             { "ServiceTypeId": "9f8e66fa-350b-4970-8dfa-873a69e7f10f", "IsSystemType": false, "Description": "custom servicetype2", "IsAssociatedWithServiceCode": false },
//             { "ServiceTypeId": "cc08eb08-425d-43af-9d9d-ce976a208489", "IsSystemType": true, "Description": "Diagnostic", "IsAssociatedWithServiceCode": false }
//         ];

//         //taxableServices data
//         scope.data.TaxableServices =
//             [
//                 { "Id": 0, "Name": "Not A Taxable Service", "Order": 1, "IsVisible": false, "IsActive": false },
//                 { "Id": 1, "Name": "Provider", "Order": 2, "IsVisible": false, "IsActive": false },
//                 { "Id": 2, "Name": "Sales and Use", "Order": 3, "IsVisible": false, "IsActive": false }
//             ];

//         //affectedAreas data
//         scope.data.AffectedAreas = [
//             { "Id": 0, "Name": "Mouth", "Order": 1, "IsVisible": false, "IsActive": false },
//             { "Id": 1, "Name": "Quadrant", "Order": 2, "IsVisible": false, "IsActive": false },
//             { "Id": 2, "Name": "Root", "Order": 3, "IsVisible": false, "IsActive": false },
//             { "Id": 3, "Name": "Surface", "Order": 4, "IsVisible": false, "IsActive": false },
//             { "Id": 4, "Name": "Tooth", "Order": 5, "IsVisible": false, "IsActive": false }
//         ];

//         //serviceTypes data
//         scope.data.DrawTypes = [
//             { DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730", Description: "DrawTypeOne", AffectedAreaId: 5, DrawType: "Static" },
//             { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo", AffectedAreaId: 4, DrawType: "Static" },
//             { DrawTypeId: "9dc35f12-ecb6-552c-99d3-ebb6ea163730", Description: "DrawTypeThree", AffectedAreaId: 5, DrawType: "Static" },
//             { DrawTypeId: "cdc35f12-ecb6-542c-99d3-ebb6ea163732", Description: "DrawTypeFour", AffectedAreaId: 3, DrawType: "Static" }
//         ];

//         //providerTypes data
//         scope.data.UsuallyPerformedByProviderTypes = [
//             { "ProviderTypeId": 4, "Name": "Not a Provider", "Order": 1, "IsAppointmentType": false },
//             { "ProviderTypeId": 1, "Name": "Dentist", "Order": 2, "IsAppointmentType": true },
//             { "ProviderTypeId": 2, "Name": "Hygienist", "Order": 3, "IsAppointmentType": true },
//             { "ProviderTypeId": 3, "Name": "Assistant", "Order": 4, "IsAppointmentType": false },
//             { "ProviderTypeId": 5, "Name": "Other", "Order": 5, "IsAppointmentType": false }
//         ];

//         // mock for boundObjectFactory
//         boundObjectFactory = {
//             Create: jasmine.createSpy().and.returnValue({
//                 AfterDeleteSuccess: null,
//                 AfterSaveError: null,
//                 AfterSaveSuccess: null,
//                 Data: {},
//                 Deleting: false,
//                 IdField: "ServiceCodeId",
//                 Loading: true,
//                 Name: "ServiceCode",
//                 Saving: false,
//                 Valid: true,
//                 Load: jasmine.any(Function),
//                 Save: jasmine.createSpy().and.returnValue(''),
//                 Validate: jasmine.createSpy().and.returnValue(''),
//                 CheckDuplicate: jasmine.createSpy().and.returnValue('')
//             })
//         };

//         //mock for serviceCodeCrudService
//         serviceCodeCrudService = {
//             Dtos: {
//                 ServiceCode: jasmine.createSpy().and.returnValue({
//                     IdField: "ServiceCodeId",
//                     ObjectName: "ServiceCode",
//                     Operations:
//                     {
//                         Create: jasmine.any(Function),
//                         Retrieve: jasmine.any(Function),
//                         Update: jasmine.any(Function),
//                         delete: jasmine.any(Function),
//                         get: jasmine.any(Function),
//                         query: jasmine.any(Function),
//                         remove: jasmine.any(Function),
//                         save: jasmine.any(Function)
//                     },
//                     IsValid: jasmine.any(Function)
//                 })
//             }
//         }
//         preventiveCareFactory = {
//             GetPreventiveServicesForServiceCode: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy()
//             }),
//             RemovePreventiveServiceById: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy()
//             }),
//             accessForServiceType: jasmine.createSpy(),
//             prevCareItems: jasmine.createSpy().and.returnValue()
//         }
//         chartingFavoritesFactory = {
//             GetAllFavoritesContainingServiceId: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy()
//             })
//         };

//         serviceCodesFactory = {
//             checkForServiceCodeUsage: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy()
//             }),
//             ServiceCodesByTimestamp: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy().and.returnValue(scope.serviceCode.Data)
//             }),
//             SetFeesByLocation: jasmine.createSpy().and.returnValue()
//         };

//         usersFactory = {
//             access: jasmine.createSpy(),
//             UserName: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy()
//             })
//         }
//         //mock for searchFactory
//         searchFactory = {
//             CreateSearch: jasmine.createSpy().and.returnValue(''),
//             GetDefaultSearchParameters: jasmine.createSpy().and.returnValue('')
//         };

//         //mock for patSecurityService
//         patSecurityService = {
//             IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(true),
//             generateMessage: jasmine.createSpy("patSecurityService.generateMessage")
//         };

//         mockCdtCodeResult = [{ "CdtCodeId": "006b48e7-95eb-4215-be3d-392a1ade990a", "Code": "D7820", "Description": "closed reduction of dislocation", "DisplayAs": "", "ServiceTypeId": "2f3d06e1-16c5-433e-b090-728b5c089eab", "SubmitOnInsurance": true, "TaxableServiceTypeId": 1, "AffectedAreaId": 1 }];
//         mockServiceReturnWrapperNoCdtCodes = {
//             Value: null,
//             Count: 0
//         };
//         mockServiceReturnWrapper = {
//             Value: mockCdtCodeResult,
//             Count: 1
//         };

//         //mock for cdtCodeService
//         cdtCodeService = {
//             search: jasmine.createSpy().and.returnValue(mockServiceReturnWrapper),
//             IsValid: jasmine.createSpy()
//         };

//         //mock for toastrFactory
//         toastrFactory = {
//             success: jasmine.createSpy(),
//             error: jasmine.createSpy()
//         };

//         //mock of modalFactory
//         modalFactory = {
//             CancelModal: jasmine.createSpy().and.returnValue({
//                 then: jasmine.createSpy()
//             }),
//             Modal: jasmine.createSpy().and.returnValue({
//                 result: { then: jasmine.createSpy() }
//             })
//         };

//         locationProvider = {
//             path: jasmine.createSpy()
//         };

//         localize = {
//             getLocalizedString: jasmine.createSpy().and.returnValue('some value')
//         };

//         referenceDataService = {
//             forceEntityExecution: jasmine.createSpy(),
//             setFeesByLocation: jasmine.createSpy(),
//             get: jasmine.createSpy(),
//             entityNames: {
//                 serviceTypes: 'serviceTypes',
//                 serviceCodes: 'serviceCodes'
//             }
//         };

//         ctrl = $controller('ServiceCodeCrudController', {
//             $scope: scope,
//             toastrFactory: toastrFactory,
//             $location: locationProvider,
//             patSecurityService: patSecurityService,
//             BoundObjectFactory: boundObjectFactory,
//             ServiceCodeCrudService: serviceCodeCrudService,
//             SearchFactory: searchFactory,
//             CdtCodeService: cdtCodeService,
//             localize: localize,
//             ListHelper: listHelper,
//             ModalFactory: modalFactory,
//             PreventiveCareFactory: preventiveCareFactory,
//             ChartingFavoritesFactory: chartingFavoritesFactory,
//             UsersFactory: usersFactory,
//             ServiceCodesFactory: serviceCodesFactory,
//             referenceDataService: referenceDataService
//         });

//         animate = $injector.get('$animate');
//         timeout = $injector.get('$timeout');
//         data = {
//             value: jasmine.createSpy().and.returnValue(1),
//             text: jasmine.createSpy().and.returnValue('a'),
//             focus: jasmine.createSpy()
//         };
//         element = {
//             data: jasmine.createSpy().and.returnValue(data),
//             focus: jasmine.createSpy(),
//             prop: jasmine.createSpy(),
//             find: jasmine.createSpy().and.returnValue(data),
//         };
//         spyOn(angular, 'element').and.returnValue(element);
//         spyOn(timeout, 'cancel');
//     }));

//     //controller
//     it('ServiceCodeCrudController:should check if controller exists', function () {
//         expect(ctrl).not.toBeNull();
//     });

//     //toastrFactory
//     it('should check that toastrFactory is not null', function () {
//         expect(toastrFactory).not.toBe(null);
//     });

//     it('should check that toastrFactory is not undefined', function () {
//         expect(toastrFactory).not.toBeUndefined();
//     });

//     // saveServiceCode
//     describe('saveServiceCode function ->', function () {

//         it('should throw focus on service code input field when IsDuplicate flag is true', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.IsDuplicate = true;
//             spyOn(ctrl, 'scrollFieldInViewArea');
//             scope.saveServiceCode();

//             expect(scope.serviceCode.IsDuplicate).toEqual(true);
//             expect(scope.uniqueServiceCodeServerMessage).not.toBeUndefined();
//             expect(angular.element('#inpServiceCode').focus).not.toHaveBeenCalled();
//             timeout.flush(1);
//             expect(angular.element('#inpServiceCode').focus).toHaveBeenCalled();
//         });

//         it('should fire service call to check if CDT code is valid or not when searchTerm is present and it is not blank and cdtCodeId is not null', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.IsDuplicate = false;
//             scope.searchParams = { searchTerm: 'code' };
//             scope.addServiceCodeForm = { inpFee: { $error: { maxValue: false } } };
//             scope.searchString = "co";
//             scope.saveServiceCode();

//             expect(scope.serviceCode.IsDuplicate).toEqual(false);
//             expect(scope.uniqueServiceCodeServerMessage).toBeUndefined();
//             expect(cdtCodeService.IsValid).toHaveBeenCalledWith({ "Code": scope.searchString }, jasmine.any(Function), jasmine.any(Function));
//         });

//         it('should fire service call to save service-code when searchTerm is not present and cdtCodeId is null', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.IsDuplicate = false;
//             scope.searchParams = { searchTerm: '' };
//             scope.addServiceCodeForm = { inpFee: { $error: { maxValue: false } } };
//             scope.searchString = "";
//             scope.displayActiveStatusConfirmation = true;
//             scope.saveServiceCode();

//             expect(scope.serviceCode.IsDuplicate).toEqual(false);
//             expect(scope.uniqueServiceCodeServerMessage).toBeUndefined();
//             expect(scope.serviceCode.Save).toHaveBeenCalled();
//         });

//     });

//     //saveServiceCodeSuccessHandler
//     describe('saveServiceCodeSuccessHandler function ->', function () {
//         it('should handle success flow of adding service code with valid successResponse and should call serviceCode.Save when isFeeInRange is true', function () {
//             var successResponse = { Value: "i am of some value" };
//             ctrl.isFeeInRange = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.saveServiceCodeSuccessHandler(successResponse);

//             expect(scope.validCdtCodeServerMessage).toEqual('');
//             expect(scope.serviceCode.Save).toHaveBeenCalled();
//         });

//         it('should save service code as active when isFeeInRange and displayActiveStatusConfirmation flags are true ', function () {
//             var successResponse = { Value: "i am of some value" };
//             ctrl.isFeeInRange = true;
//             scope.displayActiveStatusConfirmation = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.IsActive = false;

//             scope.saveServiceCodeSuccessHandler(successResponse);
//             expect(scope.validCdtCodeServerMessage).toEqual('');
//             expect(scope.serviceCode.Data.IsActive).toBe(true);
//             expect(scope.serviceCode.Save).toHaveBeenCalled();
//         });

//         it('should handle success flow of adding service code with invalid successResponse by setting error message', function () {
//             var successResponse = { Value: null };

//             scope.saveServiceCodeSuccessHandler(successResponse);
//             expect(scope.validCdtCodeServerMessage).not.toBe(null);
//         });
//     });

//     //saveServiceCodeErrorHandler
//     describe('saveServiceCodeErrorHandler function ->', function () {
//         it('saveServiceCodeErrorHandler should handle error flow of adding service code by setting the error message', function () {
//             scope.saveServiceCodeErrorHandler();

//             expect(scope.isValidCdtCode).toBe(false);
//             expect(scope.validCdtCodeServerMessage).not.toEqual('');
//         });
//     });

//     //cancelChanges
//     it('cancelChanges should cancel and close the crud screen', function () {
//         scope.updateServiceCodeList = function () { };
//         spyOn(scope, 'updateServiceCodeList');
//         scope.cancelChanges();
//         expect(scope.updateServiceCodeList).toHaveBeenCalled();
//     });

//     //serviceTypeBlur
//     describe('serviceTypeBlur function ->', function () {
//         it('should do nothing when serviceTypes is not present', function () {
//             scope.serviceTypes = null;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             var originalData = scope.serviceCode.Data;

//             scope.serviceTypeBlur();
//             expect(scope.serviceCode.Data).toEqual(originalData);
//         });

//         it('should clear the service type soar-select-list when it has bad value', function () {
//             scope.serviceTypes = [{ Description: 'option1', ServiceTypeId: 1 }];
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);

//             scope.serviceTypeBlur();
//             expect(scope.serviceCode.Data.ServiceTypeDescription).toBeNull();
//             expect(scope.serviceCode.Data.ServiceTypeId).toBeNull();
//         });

//         it('should set service type id corresponding to soar-select-list value when it has proper value', function () {
//             var correctItem = { ServiceTypeId: 2 };
//             scope.serviceCode = { Data: { ServiceTypeId: 1 } }
//             scope.serviceTypes = [{ Description: 'option1', ServiceTypeId: 1 }, { Description: 'option2', ServiceTypeId: 2 }];
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(correctItem);

//             scope.serviceTypeBlur();
//             expect(scope.serviceCode.Data.ServiceTypeId).toEqual(2);
//         });
//     });

//     //affectedAreaBlur
//     describe('affectedAreaBlur function ->', function () {
//         it('should do nothing when affectedAreas is not present', function () {
//             scope.affectedAreas = null;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             var originalData = scope.serviceCode.Data;

//             scope.affectedAreaBlur();
//             expect(scope.serviceCode.Data).toEqual(originalData);
//         });

//         it('should set affected area soar-select-list to default value when it has bad value', function () {
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);
//             scope.affectedAreas = [{ Name: 'option1', Id: 1 }, { Name: 'option2', Id: 2 }];
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             spyOn(ctrl, 'getDefaultValue').and.returnValue({ Name: 'option1', Id: 1 });

//             scope.affectedAreaBlur();
//             expect(scope.serviceCode.Data.AffectedAreaName).not.toBeNull();
//             expect(scope.serviceCode.Data.AffectedAreaId).not.toBeNull();
//         });

//         it('should not set affected area defaults for service code data, when the default item does not exists', function () {
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);
//             scope.affectedAreas = [{ Name: 'option1', Id: 1 }, { Name: 'option2', Id: 2 }];
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.AffectedAreaName = null;
//             scope.serviceCode.Data.AffectedAreaId = null;
//             spyOn(ctrl, 'getDefaultValue').and.returnValue(null);

//             scope.affectedAreaBlur();
//             expect(scope.serviceCode.Data.AffectedAreaName).toBeNull();
//             expect(scope.serviceCode.Data.AffectedAreaId).toBeNull();
//         });

//         it('should set affected area id corresponding to soar-select-list value when it has proper value', function () {
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({ Name: 'option1', Id: 1 });
//             scope.affectedAreas = [{ Name: 'option1', Id: 1 }, { Name: 'option2', Id: 2 }];
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);

//             scope.affectedAreaBlur();
//             expect(scope.serviceCode.Data.AffectedAreaName).toBe('option1');
//             expect(scope.serviceCode.Data.AffectedAreaId).toBe(1);
//         });

//         it('should uncheck ROT and missing tooth when affectedAreas is 5', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.affectedAreas = 5;

//             scope.affectedAreaBlur();
//             expect(scope.serviceCode.Data.UseCodeForRangeOfTeeth).toBe(false);
//             expect(scope.serviceCode.Data.SetsToothAsMissing).toBe(false);
//         });
//     });

//     //usuallyPerformedByProviderTypeBlur
//     describe('usuallyPerformedByProviderTypeBlur function ->', function () {
//         it('should clear the usually performed by soar-select-list when it has bad value', function () {
//             scope.providerTypes = [{ Name: 'option1', ProviderTypeId: 1 }];
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.usuallyPerformedByProviderTypeBlur();

//             expect(scope.serviceCode.Data.UsuallyPerformedByProviderTypeId).toBeNull();
//             expect(scope.serviceCode.Data.UsuallyPerformedByProviderTypeName).toBeNull();
//         });

//         it('should set usually performed by provider type id corresponding to soar-select-list value when it has proper value', function () {
//             var correctItem = { Id: 2 };
//             scope.serviceCode = { Data: { UsuallyPerformedByProviderTypeId: 1 } }
//             scope.providerTypes = [{ Name: 'option1', ProviderTypeId: 1 }, { Name: 'option2', ProviderTypeId: 2 }];
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(correctItem);

//             scope.usuallyPerformedByProviderTypeBlur();
//             expect(scope.serviceCode.Data.UsuallyPerformedByProviderTypeId).toEqual(2);
//         });
//     });

//     //drawTypeBlur
//     describe('drawTypeBlur function ->', function () {
//         it('should do nothing when drawTypes is not present', function () {
//             scope.drawTypes = null;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             var originalData = scope.serviceCode.Data;

//             scope.drawTypeBlur();
//             expect(scope.serviceCode.Data).toEqual(originalData);
//         });

//         it('should clear the service code draw-type when soar-select-list has bad value', function () {
//             // use mock to return this when blur on dd
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);

//             scope.drawTypeBlur();
//             expect(scope.serviceCode.Data.DrawTypeDescription).toBeNull();
//             expect(scope.serviceCode.Data.DrawTypeId).toBeNull();
//         });

//         it('should set service code draw-type-id to soar-select-list value when it has value from list', function () {
//             // mock item selected in dd
//             var selectedDrawType = { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo" };
//             // use mock to return this when blur
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(selectedDrawType);
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);

//             scope.drawTypeBlur();
//             expect(scope.serviceCode.Data.DrawTypeId).toEqual(selectedDrawType.DrawTypeId);
//         });
//     });

//     //checkUniqueServiceCode
//     describe('checkUniqueServiceCode function and it\'s handlers ', function () {
//         it('should verify unique service code from server with valid scope.serviceCode.Data.ServiceCodeId', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.checkUniqueServiceCode();
//             expect(scope.serviceCode.CheckDuplicate).toHaveBeenCalled();
//         });

//         it('should verify unique service code from server with null scope.serviceCode.Data.ServiceCodeId', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.ServiceCodeId = null;
//             scope.checkUniqueServiceCode();
//             expect(scope.serviceCode.CheckDuplicate).toHaveBeenCalled();
//         });

//         it('should do nothing when scope.serviceCode.Data.Code is null', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.Code = null;
//             scope.checkUniqueServiceCode();
//             expect(scope.serviceCode.CheckDuplicate).not.toHaveBeenCalled();
//         });

//         //checkUniqueServiceCodeGetSuccess
//         it('should do nothing if service code is unique', function () {
//             scope.serviceCode = { IsDuplicate: false };

//             scope.checkUniqueServiceCodeGetSuccess();
//             expect(scope.uniqueServiceCodeServerMessage).toBeUndefined();
//         });

//         it('should notify user if service code is not unique', function () {
//             scope.serviceCode = { IsDuplicate: true };

//             scope.checkUniqueServiceCodeGetSuccess();
//             expect(scope.uniqueServiceCodeServerMessage).not.toEqual('');
//         });

//         //checkUniqueServiceCodeGetFailure
//         it('should notify user after it failed to verify unique service code', function () {
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.checkUniqueServiceCodeGetFailure();
//             expect(scope.serviceCode.IsDuplicate).toEqual(true);
//             expect(scope.uniqueServiceCodeServerMessage).not.toEqual('');
//         });
//     });

//     //serviceCodeOnChange
//     it('serviceCodeOnChange should reset duplicate flag on service-code value change', function () {
//         scope.serviceCode = boundObjectFactory.Create();
//         scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//         scope.serviceCodeOnChange();
//         expect(scope.serviceCode.IsDuplicate).toEqual(false);
//     });

//     //getDefaultValue
//     describe('getDefaultValue function ->', function () {
//         it('should search the item in the array and return null if not found', function () {
//             var data = [{ Id: 1 }, { Id: 2 }, { Id: 3 }];
//             var property = 'Id';
//             var value = 4;
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);

//             var defaultItem = ctrl.getDefaultValue(data, property, value);

//             expect(defaultItem).toBeNull();
//         });

//         it('should search the item in the array and return item if found', function () {
//             var data = [{ Id: 1 }, { Id: 2 }, { Id: 3 }];
//             var property = 'Id';
//             var value = 2;
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({ Id: 2 });

//             var defaultItem = ctrl.getDefaultValue(data, property, value);

//             expect(defaultItem.Id).toBe(2);
//         });
//     });

//     //cancelStatusConfirmation
//     it('cancelStatusConfirmation should reset the displayActiveStatusConfirmation properties to false', function () {
//         scope.serviceCode = boundObjectFactory.Create();
//         scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//         scope.cancelStatusConfirmation();
//         timeout.flush(300);
//         expect(scope.displayActiveStatusConfirmation).toEqual(false);
//         expect(scope.serviceCode.Data.IsActive).toEqual(true);
//     });

//     //okStatusConfirmation
//     it('okStatusConfirmation should reset the displayActiveStatusConfirmation property to false', function () {
//         scope.serviceCode = {
//             Data: angular.copy(scope.data.ServiceCode)
//         };
//         scope.okStatusConfirmation();

//         expect(scope.serviceCode.Data.IsActive).toEqual(true);
//         timeout.flush(300);
//         expect(scope.displayActiveStatusConfirmation).toEqual(false);
//     });

//     //serviceCodeIsActiveOnChange
//     it('serviceCodeIsActiveOnChange should make displayActiveStatusConfirmation false when IsActive flag is true', function () {
//         scope.serviceCode = boundObjectFactory.Create();
//         scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//         scope.serviceCode.Data.IsActive = true;
//         scope.displayActiveStatusConfirmation = false;

//         scope.serviceCodeIsActiveOnChange();
//         timeout.flush(300);
//         expect(scope.displayActiveStatusConfirmation).toBe(false);
//     });

//     describe('ctrl.setDataHasChanged method', function () {

//         it('should return true when serviceCode.data original properties are different than serviceCodeInitial properties', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = false;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.Code = 'Code1';
//             scope.$apply();
//             scope.serviceCode.Data.Code = 'Code2';
//             expect(ctrl.setDataHasChanged(scope.serviceCode.Data,scope.serviceCodeInitial )).toBe(true);
//         });

//         it('should not return true when serviceCode.data dynamic columns are different than serviceCodeInitial dynamic columns', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = false;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.DrawTypeDescription = 'DrawTypeDescription';
//             scope.$apply();
//             scope.serviceCode.Data.DrawTypeDescription = 'DrawTypeDescription2';
//             scope.$apply();
//             expect(ctrl.setDataHasChanged(scope.serviceCode.Data,scope.serviceCodeInitial )).toBe(false);
//         });
//     });

//     describe('validateAffectedAreaChange', function(){
//         beforeEach(function(){
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             spyOn(ctrl, 'validateServiceCode');
//         });

//         it('should call ctrl.validateServiceCode', function(){
//             scope.validateAffectedAreaChange(1234);
//             expect(ctrl.validateServiceCode).toHaveBeenCalledWith(scope.serviceCode.Data);
//         });

//     });

//     //watcher over service code data
//     describe('watcher for serviceCode.Data', function () {

//         beforeEach(function(){
//             spyOn(ctrl, 'validateServiceCode');
//         });
//         it('serviceCode.Data watch statement should not modify dataHasChanged, when dataHasChanged is already set to true', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.Code = 'a';
//             scope.$apply();
//             scope.serviceCode.Data.Code = 'b';
//             expect(scope.data.DataHasChanged).toBe(true);
//         });

//         it('serviceCode.Data watch statement should modify dataHasChanged, when dataHasChanged is false and changes are made to serviceCode.Data', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = false;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.Code = 'aa';
//             scope.$apply();
//             scope.serviceCode.Data.Code = 'bb';
//             scope.$apply();
//             expect(scope.data.DataHasChanged).toBe(true);
//         });

//         it('serviceCode.Data watch statement should reset dataHasChanged to false, when new value for serviceCode.Data is null', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.Code = 'aa';
//             scope.$apply();
//             scope.serviceCode.Data = null;
//             scope.$apply();
//             expect(scope.data.DataHasChanged).toBe(false);
//         });

//         it('serviceCode.Data watch should call ctrl.validateServiceCode', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Data.Code = 'aa';
//             scope.$apply();
//             scope.serviceCode.Data.Code = 'bb';
//             scope.$apply();
//             expect(ctrl.validateServiceCode).toHaveBeenCalledWith(scope.serviceCode.Data);
//         });
//     });

//     describe('watcher for serviceCode.Saving', function () {

//         beforeEach(function () {
//             spyOn(ctrl, 'validateServiceCode');
//         });
//         it('should call referenceDataService when nv is false and ov is true', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Saving = true;
//             scope.$digest();
//             scope.serviceCode.Saving = false;
//             scope.$digest();
//             expect(referenceDataService.forceEntityExecution).toHaveBeenCalled();
//         });

//         it('should not call referenceDataService when nv is true and ov is false', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Saving = false;
//             scope.$digest();
//             scope.serviceCode.Saving = true;
//             scope.$digest();
//             expect(referenceDataService.forceEntityExecution).not.toHaveBeenCalled();
//         });

//         it('should not call referenceDataService when nv is false and ov is false', function () {
//             scope.serviceCodeInitial = scope.data.ServiceCode;
//             scope.data.DataHasChanged = true;
//             scope.serviceCode = boundObjectFactory.Create();
//             scope.serviceCode.Data = angular.copy(scope.data.ServiceCode);
//             scope.serviceCode.Saving = false;
//             scope.$digest();
//             scope.serviceCode.Saving = false;
//             scope.$digest();
//             expect(referenceDataService.forceEntityExecution).not.toHaveBeenCalled();
//         });
//     });

//     //watcher over data.ServiceCode
//     describe('watcher for data.ServiceCode', function () {
//         it('should set editMode flag to true when user has clicked on edit service-code and data.ServiceCodeId is not null', function () {
//             scope.data.ServiceCode = { Id: 1 };
//             scope.data.ServiceCodeId = 1;
//             scope.$apply();

//             expect(scope.editMode).toEqual(true);
//         });

//         it('should set editMode flag to false when user has clicked on add service-code and data.ServiceCodeId is null', function () {
//             scope.data.ServiceCode = { Id: 1 };
//             scope.data.ServiceCodeId = null;
//             scope.$apply();

//             expect(scope.editMode).toEqual(false);
//         });

//         it('should call ctrl.notifyNotAuthorized to throw error when user is not authorized for edit action', function () {
//             scope.data.ServiceCode = { Id: 1 };
//             scope.data.ServiceCodeId = 1;
//             spyOn(ctrl, 'authEditServiceCodeAccess').and.returnValue(false);
//             spyOn(ctrl, 'notifyNotAuthorized');
//             scope.$apply();

//             expect(scope.editMode).toEqual(true);
//             expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
//         });

//         it('should call ctrl.notifyNotAuthorized to throw error when user is not authorized for edit action', function () {
//             scope.data.ServiceCode = { Id: 1 };
//             scope.data.ServiceCodeId = null;
//             spyOn(ctrl, 'authAddServiceCodeAccess').and.returnValue(false);
//             spyOn(ctrl, 'notifyNotAuthorized');
//             scope.$apply();

//             expect(scope.editMode).toEqual(false);
//             expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
//         });

//         it('should set serviceCode.Data.$$IconFileName to file name when serviceCode.Data.IconName is truthy', function () {
//             scope.data.ServiceCode.IconName = 'D1110_prophylaxis_adult';
//             scope.$apply();

//             expect(scope.serviceCode.Data.$$IconFileName).toBe('D1110_prophylaxis_adult.svg');
//         });

//         it('should set serviceCode.Data.$$IconFileName to default service code icon if IsSwiftPickCode is false', function () {
//             scope.data.ServiceCode.IconName = null;
//             scope.data.ServiceCode.IsSwiftPickCode = false;
//             scope.$apply();

//             expect(scope.serviceCode.Data.$$IconFileName).toBe('default_service_code.svg');
//         });

//         it('should set serviceCode.Data.$$IconFileName to default cdt code icon if IsSwiftPickCode is true', function () {
//             scope.data.ServiceCode.IconName = null;
//             scope.data.ServiceCode.IsSwiftPickCode = true;
//             scope.$apply();

//             expect(scope.serviceCode.Data.$$IconFileName).toBe('default_swift_code.svg');
//         });
//     });

//     //cancelOnClick
//     it('cancelOnClick should set confirmCancel flag to true and not call cancelChanges method', function () {
//         scope.data.DataHasChanged = true;
//         scope.confirmCancel = false;
//         spyOn(scope, 'cancelChanges');
//         scope.cancelOnClick();
//         expect(scope.cancelChanges).not.toHaveBeenCalled();
//     });

//     it('cancelOnClick should call cancelChanges method and not set confirmCancel flag', function () {
//         scope.data.DataHasChanged = false;
//         scope.confirmCancel = false;
//         spyOn(scope, 'cancelChanges');
//         scope.cancelOnClick();
//         expect(scope.cancelChanges).toHaveBeenCalled();
//     });

//     describe('search function ->', function () {
//         it('should return  without searching if search is in progress', function () {
//             scope.searchIsQueryingServer = true;
//             scope.search();
//             expect(cdtCodeService.search).not.toHaveBeenCalled();
//         });

//         it('should return  without searching if searchResults equal resultCount', function () {
//             scope.searchResults = mockCdtCodeResult;
//             scope.resultCount = 3;
//             scope.search();
//         });

//         it('should return without searching if searchString is empty', function () {
//             scope.searchString = '';
//             scope.search();
//         });

//         it('should return without searching if scope.searchResults.length == scope.resultCount', function () {
//             scope.searchString = 'searchMe';
//             spyOn(scope, 'search');
//             scope.searchResults = [{ res: 1 }];
//             scope.resultCount = 1;

//             scope.search();
//             expect(cdtCodeService.search).not.toHaveBeenCalled();
//         });

//         it('should set searchParams if search conditions are valid', function () {
//             scope.searchIsQueryingServer = false;
//             scope.searchString = 'mockSearch';
//             scope.searchResults = [];
//             scope.resultCount = 0;

//             scope.search();
//             expect(cdtCodeService.search).toHaveBeenCalled();
//         });

//         it('should call serviceCodesService search if valid search ', function () {
//             scope.searchString = 'Anything I want';
//             scope.search();
//             expect(cdtCodeService.search).toHaveBeenCalled();
//             scope.$apply();
//             expect(scope.searchIsQueryingServer).toBe(true);
//         });
//     });

//     describe('searchGetOnSuccess function ->', function () {
//         it('should set searchResults', function () {
//             scope.searchString = "keyword";

//             scope.searchGetOnSuccess(mockServiceReturnWrapper);
//             scope.$apply();
//             expect(scope.searchIsQueryingServer).toBe(false);
//         });

//         it('should set resultCount if gets results', function () {
//             scope.searchString = "keyword";

//             expect(scope.resultCount).toBe(0);
//             scope.searchGetOnSuccess(mockServiceReturnWrapper);
//             scope.$apply();
//             expect(scope.searchIsQueryingServer).toBe(false);
//             expect(scope.noSearchResults).toBe(false);
//             expect(scope.resultCount).toBe(0);
//         });

//         it('should set noSearchResults to false if gets results', function () {
//             scope.searchGetOnSuccess(mockServiceReturnWrapper);
//             scope.$apply();
//             expect(scope.noSearchResults).toBe(false);
//         });

//         it('should set noSearchResults to false if resultCount equals 0', function () {
//             scope.searchGetOnSuccess(mockServiceReturnWrapperNoCdtCodes);
//             scope.$apply();
//             expect(scope.noSearchResults).toBe(false);
//         });
//     });

//     describe('searchGetOnError function ->', function () {
//         it('should set scope variables ', function () {
//             scope.searchGetOnError();
//             expect(scope.searchIsQueryingServer).toBe(false);
//             expect(scope.resultCount).toBe(0);
//             expect(scope.searchResults).toEqual([]);
//             expect(scope.noSearchResults).toBe(true);
//         });

//         it('should call toastr error ', function () {
//             scope.searchGetOnError();
//             expect(toastrFactory.error).toHaveBeenCalled();
//         });
//     });

//     describe('activateSearch function ->', function () {
//         it('should not do search if user is not authorized for search ', function () {
//             scope.hasAuthenticated = false;
//             scope.hasSearchAccess = false;
//             spyOn(scope, 'search');
//             expect(scope.search).not.toHaveBeenCalled();
//         });

//         it('should set scope variables and call search if user is authorized for search ', function () {
//             spyOn(scope, 'search');
//             scope.searchTerm = 'mockTerm';
//             scope.activateSearch(scope.searchTerm);
//             expect(scope.searchString).toEqual(scope.searchTerm);
//             expect(scope.limit).toBe(15);
//             expect(scope.limitResults).toBe(true);
//             expect(scope.resultCount).toBe(0);
//             expect(scope.searchResults).toEqual([]);
//             expect(scope.search).toHaveBeenCalled();
//         });

//         it('should set scope variables and call search if user is authorized for search ', function () {
//             spyOn(scope, 'search');
//             scope.searchTerm = 'mockTerm';
//             scope.activateSearch(scope.searchTerm);
//             scope.serviceCode.IsCdtCodeUtilized = false;
//             expect(scope.searchString).toEqual(scope.searchTerm);
//             expect(scope.limit).toBe(15);
//             expect(scope.limitResults).toBe(true);
//             expect(scope.resultCount).toBe(0);
//             expect(scope.searchResults).toEqual([]);
//             expect(scope.search).toHaveBeenCalled();
//         });

//         it('should set noSearchResults to false if searchTerm is equal to searchString ', function () {
//             var searchTerm = 'mockTerm';
//             scope.searchString = 'mockTerm';
//             scope.activateSearch(searchTerm);
//             expect(scope.searchString).toEqual(searchTerm);
//             expect(scope.noSearchResults).toBe(false);
//         });

//         it('should set noSearchResults to false if searchTerm is equal to searchString ', function () {
//             var searchTerm = 'mockTerm';
//             scope.searchString = 'mockTerm';
//             scope.serviceCode.IsCdtCodeUtilized = true;
//             scope.activateSearch(searchTerm);
//             expect(scope.searchString).toEqual(searchTerm);
//             expect(scope.noSearchResults).toBe(false);
//         });
//     });

//     describe('checkServiceCodeUsage function ->', function () {
//         it('should call checkForServiceCodeUsage when it has valid service code id and cdt code id ', function () {
//             scope.serviceCode = { Data: { CdtCodeId: '123', ServiceCodeId: '123' } };
//             ctrl.checkServiceCodeUsage();
//             expect(serviceCodesFactory.checkForServiceCodeUsage).toHaveBeenCalledWith(scope.serviceCode.Data.ServiceCodeId);
//         });

//         it('should not call checkForServiceCodeUsage when service code id undefined', function () {
//             scope.serviceCode = { Data: { CdtCodeId: '123' } };
//             ctrl.checkServiceCodeUsage();
//             expect(serviceCodesFactory.checkForServiceCodeUsage).not.toHaveBeenCalled();
//         });

//         it('should not call checkForServiceCodeUsage when cdt code id undefined', function () {
//             scope.serviceCode = { Data: { ServiceCodeId: '123' } };
//             ctrl.checkServiceCodeUsage();
//             expect(serviceCodesFactory.checkForServiceCodeUsage).not.toHaveBeenCalled();
//         });
//     });

//     describe('selectResult function ->', function () {
//         it('should do nothing when selectedCdt is null or undefined ', function () {
//             var selectedCdt = null;

//             scope.selectResult(selectedCdt);
//             expect(scope.validCdtCodeServerMessage).toEqual("");
//         });

//         it('should set all scope variables when selectedCdt is not null and it has data for service-types, affected-area, taxable-service', function () {
//             var selectedCdt = {
//                 Code: "selectedCdtCode",
//                 CdtCodeId: "selectedCdtCodeId",
//                 ServiceTypeId: "ServiceTypeId",
//                 TaxableServiceTypeId: "TaxableServiceTypeId",
//                 Id: 1,
//                 Description: "Type1",
//                 DisplayAs: "Type1",
//                 AffectedAreaId: "AffectedAreaId"
//             };
//             var searchResultFromList = {
//                 Code: "selectedCdtCode",
//                 CdtCodeId: "selectedCdtCodeId",
//                 ServiceTypeId: "ServiceTypeId",
//                 Description: "Type1",
//                 Id: 1,
//                 Name: "sample"
//             };
//             scope.searchParams = { searchTerm: '' }
//             scope.serviceCode = { Data: { CdtCodeId: '', CdtCodeName: '' } };
//             scope.serviceTypes = [{ Description: 'Type1', ServiceTypeId: 1 }, { Description: 'Type2', ServiceTypeId: 2 }];
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(searchResultFromList);
//             scope.selectResult(selectedCdt);

//             expect(scope.selectedCdtCode).toEqual(selectedCdt);
//             expect(scope.searchParams.searchTerm).toEqual(selectedCdt.Code);
//             expect(scope.serviceCode.Data.CdtCodeId).toEqual(selectedCdt.CdtCodeId);
//             expect(scope.serviceCode.Data.CdtCodeName).toEqual(selectedCdt.Code);
//             expect(scope.serviceCode.Data.Description).toEqual(searchResultFromList.Description);
//             expect(scope.serviceCode.Data.TaxableServiceTypeName).toEqual(searchResultFromList.Name);
//             expect(scope.serviceCode.Data.TaxableServiceTypeId).toEqual(searchResultFromList.Id);
//             expect(scope.serviceCode.Data.AffectedAreaName).toEqual(searchResultFromList.Name);
//             expect(scope.serviceCode.Data.AffectedAreaId).toEqual(searchResultFromList.Id);
//         });

//         it('should set scope variables related to CDT code only when selectedCdt is not null and it does not have any data for service-types, affected-area, taxable-service', function () {
//             var selectedCdt = {
//                 Code: "selectedCdtCode",
//                 CdtCodeId: "selectedCdtCodeId",
//                 ServiceTypeId: "ServiceTypeId",
//                 TaxableServiceTypeId: "TaxableServiceTypeId",
//                 Id: 1,
//                 Description: "Type1",
//                 DisplayAs: "Type1",
//                 AffectedAreaId: "AffectedAreaId"
//             }
//             scope.searchParams = { searchTerm: '' }
//             scope.serviceCode = { Data: { CdtCodeId: '', CdtCodeName: '' } };
//             scope.serviceTypes = [{ Description: 'Type1', ServiceTypeId: 1 }, { Description: 'Type2', ServiceTypeId: 2 }];
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);
//             scope.selectResult(selectedCdt);

//             expect(scope.selectedCdtCode).toEqual(selectedCdt);
//             expect(scope.searchParams.searchTerm).toEqual(selectedCdt.Code);
//             expect(scope.serviceCode.Data.CdtCodeId).toEqual(selectedCdt.CdtCodeId);
//             expect(scope.serviceCode.Data.CdtCodeName).toEqual(selectedCdt.Code);
//         });
//     });

//     describe('watcher searchParams.searchTerm ->', function () {
//         beforeEach(function () {
//             // Watch the input
//             scope.$watch('searchParams.searchTerm', function (nv, ov) {
//                 if (nv && nv.length > 0 && nv != ov) {
//                     if (scope.searchTimeout) {
//                         timeout.cancel(scope.searchTimeout);
//                     }
//                     scope.searchTimeout = timeout(function () {
//                         scope.activateSearch(angular.copy(nv));
//                     }, 500);
//                 } else if (ov && ov.length > 0 && nv != ov) {
//                     if (scope.searchTimeout) {
//                         timeout.cancel(scope.searchTimeout);
//                     }
//                     scope.searchTimeout = timeout(function () {
//                         scope.activateSearch(angular.copy(nv));
//                     }, 500);
//                 }
//             });

//             spyOn(scope, 'activateSearch');
//         });

//         it('should call activateSearch function when searchTerm value is new and valid and searchTimeout is not defined', function () {
//             scope.searchParams = { searchTerm: 'abc' }
//             scope.$apply();
//             scope.searchParams = { searchTerm: 'abc1' }
//             scope.$apply();
//             timeout.flush(500);
//             expect(scope.activateSearch).toHaveBeenCalledWith(scope.searchParams.searchTerm);
//         });

//         //it('should call timeout.cancel function when searchTerm value is new and valid and searchTimeout is defined', function () {
//         //    scope.searchTimeout = true;
//         //    scope.searchParams = { searchTerm: 'abc' }
//         //    scope.$apply();
//         //    scope.searchParams = { searchTerm: 'abc1' }
//         //    scope.$apply();
//         //    timeout.flush(500);
//         //    expect(timeout.cancel).toHaveBeenCalledWith(true);
//         //});

//         it('should call activateSearch function when searchTerm value is new and valid and searchTimeout is not defined', function () {
//             scope.searchParams = { searchTerm: 'abc' }
//             scope.$apply();
//             scope.searchParams = { searchTerm: '' }
//             scope.$apply();
//             timeout.flush(500);
//             expect(scope.activateSearch).toHaveBeenCalledWith(scope.searchParams.searchTerm);
//         });

//         //it('should call timeout.cancel function when searchTerm value is new and valid and searchTimeout is defined', function () {
//         //    scope.searchTimeout = true;
//         //    scope.searchParams = { searchTerm: 'abc' }
//         //    scope.$apply();
//         //    scope.searchParams = { searchTerm: '' }
//         //    scope.$apply();
//         //    timeout.flush(500);
//         //    expect(timeout.cancel).toHaveBeenCalledWith(true);
//         //});
//     });

//     describe('showCdtCodePicker function ->', function () {
//         //select cdt codes from list
//         it('showCdtCodePicker should open modal for selecting cdt code from cdt code list', function () {
//             scope.showCdtCodePicker();
//         });
//     });

//     describe('authViewAccess ->', function () {
//         it('should call patSecurityService.IsAuthorizedByAbbreviation with \'soar-biz-bsvccd-view\' and return the result', function () {
//             var result = scope.authViewAccess();

//             expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith("soar-biz-bsvccd-view");
//             expect(result).toEqual(true);
//         });
//     });

//     describe('authAccess ->', function () {
//         beforeEach(function () {
//             scope.authViewAccess = jasmine.createSpy().and.returnValue(true);
//         });

//         it('should call authViewAccess', function () {
//             scope.authAccess();

//             expect(scope.authViewAccess).toHaveBeenCalled();
//         });

//         it('when authViewAccess returns true, should set hasViewAccess to true', function () {
//             scope.authAccess();

//             expect(scope.hasViewAccess).toEqual(true);
//         });

//         it('when authViewAccess returns false, show a message adnt redirect back to the home page', function () {
//             scope.authViewAccess = jasmine.createSpy().and.returnValue(false);

//             scope.authAccess();

//             expect(toastrFactory.error).toHaveBeenCalled();
//             expect(locationProvider.path).toHaveBeenCalledWith("/");
//         });
//     });

//     //notifyNotAuthorized
//     describe('notifyNotAuthorized function ->', function () {
//         it('should call toastrFactory.error service function', function () {
//             var authMessageKey = "Message Key";
//             scope.updateServiceCodeList = function () { };
//             spyOn(scope, 'updateServiceCodeList');

//             ctrl.notifyNotAuthorized(authMessageKey);
//             expect(toastrFactory.error).toHaveBeenCalled();
//             expect(scope.updateServiceCodeList).toHaveBeenCalled();
//             expect(patSecurityService.generateMessage).toHaveBeenCalledWith(authMessageKey);
//         });
//     });

//     describe('affectedAreaChange function ->', function () {
//         it('should set draw-type-id to null when affected area selection changes and current draw-type-id is not null but matching record for it is not found in updated filteredDrawTypes list', function () {
//             scope.drawTypes = [
//                 { AffectedAreaId: 'a', DrawTypeId: 1, Description: 'a data1' },
//                 { AffectedAreaId: 'a', DrawTypeId: 2, Description: 'a data2' },
//                 { AffectedAreaId: 'a', DrawTypeId: 3, Description: 'a data3' },
//                 { AffectedAreaId: 'b', DrawTypeId: 4, Description: 'b data4' },
//                 { AffectedAreaId: 'b', DrawTypeId: 5, Description: 'b data5' }
//             ];
//             scope.serviceCode = {
//                 Data: {
//                     DrawTypeId: 1,
//                     DrawTypeDescription: 'a data1'
//                 }
//             }
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);
//             scope.affectedAreaChange('c', true);

//             expect(scope.serviceCode.Data.DrawTypeDescription).toBeNull();
//             expect(scope.serviceCode.Data.DrawTypeId).toBeNull();
//         });

//         it('should not set draw-type-id to null when affected area selection changes and current draw-type-id is not null and matching record for it is found in updated filteredDrawTypes list', function () {
//             scope.drawTypes = [
//                 { AffectedAreaId: 'a', DrawTypeId: 1, Description: 'a data1' },
//                 { AffectedAreaId: 'a', DrawTypeId: 2, Description: 'a data2' },
//                 { AffectedAreaId: 'a', DrawTypeId: 3, Description: 'a data3' },
//                 { AffectedAreaId: 'b', DrawTypeId: 4, Description: 'b data4' },
//                 { AffectedAreaId: 'b', DrawTypeId: 5, Description: 'b data5' }
//             ];
//             scope.serviceCode = {
//                 Data: {
//                     DrawTypeId: 1,
//                     DrawTypeDescription: 'a data1'
//                 }
//             }
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({ AffectedAreaId: 'a', DrawTypeId: 1, Description: 'a data1' });
//             scope.affectedAreaChange('a', true);

//             expect(scope.serviceCode.Data.DrawTypeDescription).not.toBeNull();
//             expect(scope.serviceCode.Data.DrawTypeId).not.toBeNull();
//         });
//     });

//     //serviceCode.AfterSaveSuccess
//     describe('serviceCode.AfterSaveSuccess function', function () {
//         it('should call updateServiceCodeList to update the service-code list', function () {
//             scope.updateServiceCodeList = function () { };
//             spyOn(scope, 'updateServiceCodeList');
//             scope.$apply();
//             scope.data.ServiceCode = { AffectedAreaName: 'tp' };
//             scope.$apply();
//             scope.serviceCode.AfterSaveSuccess();

//             expect(scope.updateServiceCodeList).toHaveBeenCalled();
//         });
//     });

//     //serviceCode.AfterSaveError
//     describe('serviceCode.AfterSaveError function', function () {
//         beforeEach(function(){
//             spyOn(ctrl, 'validateServiceCode');
//             scope.serviceCode = {Data:{ServiceCode:'62140'}, AfterSaveError:jasmine.createSpy().and.callFake(function(){})};
//         });

//         it('should set ctrl.saveAttempted', function () {
//             scope.$apply();
//             scope.serviceCode.AfterSaveError();
//             expect(ctrl.saveAttempted).toBe(true);
//         });

//         it('should call updateServiceCodeList to update the service-code list', function () {
//             scope.$apply();
//             scope.serviceCode.AfterSaveError();
//             expect(ctrl.validateServiceCode).toHaveBeenCalledWith(scope.serviceCode.Data);
//         });
//     });

//     describe('removeServiceCodeFromSwiftCode', function () {
//         it('should remove found service code from list when more then 1 service code', function () {
//             scope.swiftCode.Data.SwiftPickServiceCodes = scope.swiftPickServiceCodesDummyList;
//             scope.editMode = true;
//             var targetServiceCode = scope.swiftCode.Data.SwiftPickServiceCodes[0];
//             var listCount = scope.swiftCode.Data.SwiftPickServiceCodes.length;
//             scope.removeServiceCodeFromSwiftCode(targetServiceCode);
//             expect(scope.swiftCode.Data.SwiftPickServiceCodes.length == (listCount - 1));
//         });
//         it('should make an empty list when only 1 service code', function () {
//             scope.swiftCode.Data.SwiftPickServiceCodes.push(scope.swiftPickServiceCodesDummyList[0]);
//             scope.editMode = true;
//             var targetServiceCode = scope.swiftCode.Data.SwiftPickServiceCodes[0];
//             var listCount = scope.swiftCode.Data.SwiftPickServiceCodes.length;
//             scope.removeServiceCodeFromSwiftCode(targetServiceCode);
//             expect(scope.swiftCode.Data.SwiftPickServiceCodes.length == 0);
//             expect(scope.swiftCode.Data.SwiftPickServiceCodes == []);
//         });
//         it('should do nothing if swift code is not active', function () {
//             scope.swiftCode.Data.SwiftPickServiceCodes = scope.swiftPickServiceCodesDummyList;
//             scope.editMode = true;
//             scope.swiftCode.Data.IsActive = false;
//             var targetServiceCode = scope.swiftCode.Data.SwiftPickServiceCodes[0];
//             var listCount = scope.swiftCode.Data.SwiftPickServiceCodes.length;
//             scope.removeServiceCodeFromSwiftCode(targetServiceCode);
//             expect(scope.swiftCode.Data.SwiftPickServiceCodes == scope.swiftPickServiceCodesDummyList);
//         });
//     });
//     describe('removePreventiveServiceCode', function () {
//         beforeEach(function () {
//             scope.reloadPreventiveServiceCodes = jasmine.createSpy();
//         });
//         it('should call RemovePreventiveServiceById when passed service code', function () {
//             var preventiveService = {
//                 PreventiveServiceTypeId: "00000000-0000-0000-0000-000000000001",
//                 PreventiveServiceId: "00000000-0000-0000-0000-000000000001"
//             }
//             scope.removePreventiveServiceCode(preventiveService);

//             expect(preventiveCareFactory.RemovePreventiveServiceById).toHaveBeenCalled();
//         });
//         it('should call RemovePreventiveServiceById when passed service code', function () {
//             var preventiveService = {
//             }
//             scope.removePreventiveServiceCode(preventiveService);

//             expect(preventiveCareFactory.RemovePreventiveServiceById).not.toHaveBeenCalled();
//         });
//     });

//     describe('reloadFavorites should call favorites factory to update data', function () {
//         it('should call GetAllFactoriesContainingServiceId when passed service code', function () {
//             scope.reloadFavorites();
//             expect(chartingFavoritesFactory.GetAllFavoritesContainingServiceId).toHaveBeenCalled();
//         });
//     });

//     describe('scope.validateSmartCodeSetup -> function', function () {
//         beforeEach(function () {
//             serviceCode.SmartCode1Id = 1;
//             serviceCode.SmartCode2Id = 2;
//             serviceCode.SmartCode3Id = 3;
//             serviceCode.SmartCode4Id = null;
//             serviceCode.SmartCode5Id = null;
//         })

//         it('should set the service code data when UseSmartCodes is true', function () {
//             scope.validateSmartCodeSetup(serviceCode);
//             expect(scope.serviceCode.Data).toBe(serviceCode);
//         });

//         it('should remove all smart code setup when UseSmartCodes is false', function () {
//             serviceCode.UseSmartCodes = false;
//             scope.validateSmartCodeSetup(serviceCode);
//             expect(scope.serviceCode.Data.SmartCode1Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode2Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode3Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode4Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode5Id).toBe(null);
//         });
//     });

//     describe('scope.validateSmartCodeSetup -> function', function () {
//         beforeEach(function () {
//             serviceCode.SmartCode1Id = 1;
//             serviceCode.SmartCode2Id = 2;
//             serviceCode.SmartCode3Id = 3;
//             serviceCode.SmartCode4Id = null;
//             serviceCode.SmartCode5Id = null;
//         })

//         it('should set the service code data when UseSmartCodes is true', function () {
//             serviceCode.UseSmartCodes = true;
//             scope.validateSmartCodeSetup(serviceCode);
//             expect(scope.serviceCode.Data).toBe(serviceCode);
//         });

//         it('should remove all smart code setup when UseSmartCodes is false', function () {
//             serviceCode.UseSmartCodes = false;
//             scope.validateSmartCodeSetup(serviceCode);
//             expect(scope.serviceCode.Data.SmartCode1Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode2Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode3Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode4Id).toBe(null);
//             expect(scope.serviceCode.Data.SmartCode5Id).toBe(null);
//         });
//     });

//     describe('scope.validateServiceCode -> function', function () {
//         let serviceCode={};
//         beforeEach(function () {
//             scope.serviceCodeError = false;
//             scope.serviceDescriptionError = false;
//             scope.serviceTypeIdError = false;
//             scope.affectedAreaIdError = false;
//             ctrl.saveAttempted=true;
//             serviceCode = {Code:1234, Description:'Description', ServiceTypeId:5678, AffectedAreaId: 91011};
//             });

//         it('should set scope.serviceCodeError to true if ctrl.saveAttempted is true and'+
//             'serviceCode.Code is null or undefined', function () {
//             serviceCode.Code=null;
//             ctrl.validateServiceCode(serviceCode);
//             expect(scope.serviceCodeError).toBe(true);
//             timeout.flush();
//             expect(angular.element('#inpServiceCode').focus).toHaveBeenCalled();

//         });

//         it('should set scope.serviceDescriptionError to true if ctrl.saveAttempted is true and'+
//             'serviceCode.Description is empty', function () {
//             serviceCode.Description='';
//             ctrl.validateServiceCode(serviceCode);
//             expect(scope.serviceDescriptionError).toBe(true);
//             timeout.flush();
//             expect(angular.element('#inpDescription').focus).toHaveBeenCalled();

//         });

//         it('should set scope.serviceTypeIdError to true if ctrl.saveAttempted is true and'+
//             'serviceCode.Description is empty', function () {
//             serviceCode.ServiceTypeId=null;
//             ctrl.validateServiceCode(serviceCode);

//             expect(scope.serviceTypeIdError).toBe(true);
//             timeout.flush();
//             expect(angular.element('#lblServiceType').focus).toHaveBeenCalled();

//         });

//         it('should set scope.affectedAreaIdError to true if ctrl.saveAttempted is true and serviceCode.AffectedAreaId is null', function () {
//             serviceCode.AffectedAreaId=null;
//             ctrl.validateServiceCode(serviceCode);

//             expect(scope.affectedAreaIdError).toBe(true);
//             timeout.flush();
//             expect(angular.element('#lblAffectedArea').focus).toHaveBeenCalled();

//         });

//         it('should not set properties if ctrl.saveAttempted is false ', function () {

//             scope.serviceCodeError = false;
//             scope.serviceDescriptionError = false;
//             scope.serviceTypeIdError = false;
//             scope.affectedAreaIdError = false;

//             serviceCode.AffectedAreaId=null;
//             serviceCode.ServiceTypeId=null;
//             ctrl.saveAttempted=false;
//             ctrl.validateServiceCode(serviceCode);

//             expect(scope.affectedAreaIdError).toBe(false);
//             expect(scope.serviceTypeIdError).toBe(false);
//             expect(scope.serviceDescriptionError).toBe(false);
//             expect(scope.affectedAreaIdError).toBe(false);

//         });
//     });

//     describe('scope.validateServiceTypeChange -> function', function () {

//         beforeEach(function () {
//             spyOn(ctrl, 'validateServiceCode');
//             scope.serviceTypes = [{ Description: 'option1', ServiceTypeId: 1111 }, { Description: 'option2', ServiceTypeId: 1234 }];
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(scope.serviceTypes[1]);
//         });

//         it('should set the serviceCode.ServiceTypeId based on the serviceType', function () {
//             scope.serviceCode.Data = {Code:1234, Description:'Description', ServiceTypeId:null, AffectedAreaId: 91011};
//             scope.validateServiceTypeChange('serviceType');
//             expect(scope.serviceCode.Data.ServiceTypeId).toBe(1234);
//             expect(ctrl.validateServiceCode).toHaveBeenCalledWith(scope.serviceCode.Data);
//         });
//     });

// });

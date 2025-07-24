// TODO : need to remove this later
// describe('Controller: ServiceCodeSearchController', function () {
//     var ctrl, scope, modalInstance, toastrFactory, localize, route, drawTypesService;
//     var modalFactory, serviceCodesFactory, actualOptions, deferred,  deferredTaxableServices;
//     var deferredAffectedAreas, drawTypes, deferredProviderTypes, staticData, q, listHelper, timeout, initialData, serviceCodes;
//     var patSecurityService, controller, reportsFactory, amfaInfo, preventiveCareFactory, chartingFavoritesFactory, referenceDataService;

//     function createController() {
//         scope.initialData = {
//           ServiceTypes: serviceTypes,
//           TaxableServices: { Value: taxableServices.Value },
//           AffectedAreas: { Value: affectedAreas.Value },
//           ProviderTypes: { Value: providerTypes.Value },
//           DrawTypes: drawTypes,
//           ServiceButtons: { Value: serviceButtons.Value },
//           TypeOrMaterials: { Value: typeOrMaterials.Value }
//         };

//         scope.serviceCodes = serviceCodes;

//         return controller('ServiceCodeSearchController', {
//             $scope: scope,
//             DrawTypesService: drawTypesService,
//             StaticData: staticData,
//             $uibModal: modalInstance,
//             toastrFactory: toastrFactory,
//             localize: localize,
//             ListHelper: listHelper,
//             ModalFactory: modalFactory,
//             patSecurityService: patSecurityService,
//             ReportsFactory: reportsFactory,
//             AmfaInfo: amfaInfo,
//             PreventiveCareFactory: preventiveCareFactory,
//             ChartingFavoritesFactory: chartingFavoritesFactory,
//             referenceDataService: referenceDataService
//         });
//     }

//     var serviceTypes = [
//         {
//             'ServiceTypeId': 'e928ed50-1c73-4836-8a07-11d4ac39e947',
//             'IsSystemType': true,
//             'Description': 'Adjunctive General Services',
//             'IsAssociatedWithServiceCode': false
//         },
//         {
//             'ServiceTypeId': 'c44c441e-d3c5-47ff-83b3-617e7c59804c',
//             'IsSystemType': false,
//             'Description': 'custom service type',
//             'IsAssociatedWithServiceCode': false
//         },
//         {
//             'ServiceTypeId': '9f8e66fa-350b-4970-8dfa-873a69e7f10f',
//             'IsSystemType': false,
//             'Description': 'custom service type 2',
//             'IsAssociatedWithServiceCode': false
//         },
//         {
//             'ServiceTypeId': 'cc08eb08-425d-43af-9d9d-ce976a208489',
//             'IsSystemType': true,
//             'Description': 'Diagnostic',
//             'IsAssociatedWithServiceCode': false
//         }
//     ];

//     //drawTypes data
//     drawTypes = [
//         {
//             DrawTypeId: 'edc35f12-ecb6-442c-99d3-ebb6ea163730',
//             Description: 'DrawTypeOne',
//             AffectedAreaId: 5,
//             DrawType: 'Static'
//         },
//         {
//             DrawTypeId: 'cdc35f12-ecb6-555c-99d3-ebb6ea163731',
//             Description: 'DrawTypeTwo',
//             AffectedAreaId: 4,
//             DrawType: 'Static'
//         },
//         {
//             DrawTypeId: '9dc35f12-ecb6-552c-99d3-ebb6ea163730',
//             Description: 'DrawTypeThree',
//             AffectedAreaId: 5,
//             DrawType: 'Static'
//         },
//         {
//             DrawTypeId: 'cdc35f12-ecb6-542c-99d3-ebb6ea163732',
//             Description: 'DrawTypeFour',
//             AffectedAreaId: 3,
//             DrawType: 'Static'
//         }
//     ];

//     var taxableServices = {
//         Value: [
//             { 'Id': 0, 'Name': 'Not A Taxable Service', 'Order': 1, 'IsVisible': false, 'IsActive': false },
//             { 'Id': 1, 'Name': 'Provider', 'Order': 2, 'IsVisible': false, 'IsActive': false },
//             { 'Id': 2, 'Name': 'Sales and Use', 'Order': 3, 'IsVisible': false, 'IsActive': false }
//         ]
//     };

//     var affectedAreas = {
//         Value: [
//             { 'Id': 0, 'Name': 'Mouth', 'Order': 1, 'IsVisible': false, 'IsActive': false },
//             { 'Id': 1, 'Name': 'Quadrant', 'Order': 2, 'IsVisible': false, 'IsActive': false },
//             { 'Id': 2, 'Name': 'Root', 'Order': 3, 'IsVisible': false, 'IsActive': false },
//             { 'Id': 3, 'Name': 'Surface', 'Order': 4, 'IsVisible': false, 'IsActive': false },
//             { 'Id': 4, 'Name': 'Tooth', 'Order': 5, 'IsVisible': false, 'IsActive': false }
//         ]
//     };

//     var providerTypes = {
//         Value: [
//             { 'ProviderTypeId': 4, 'Name': 'Not a Provider', 'Order': 1, IsAppointmentType: false },
//             { 'ProviderTypeId': 1, 'Name': 'Dentist', 'Order': 2, IsAppointmentType: true },
//             { 'ProviderTypeId': 2, 'Name': 'Hygienist', 'Order': 3, IsAppointmentType: true },
//             { 'ProviderTypeId': 3, 'Name': 'Assistant', 'Order': 4, IsAppointmentType: false },
//             { 'ProviderTypeId': 5, 'Name': 'Other', 'Order': 5, IsAppointmentType: false }
//         ]
//     };

//     var serviceButtons = {
//         Value: [
//             { 'ServiceButtonId': 1, 'Description': 'Service Button 1' },
//             { 'ServiceButtonId': 2, 'Description': 'Service Button 2' },
//             { 'ServiceButtonId': 3, 'Description': 'Service Button 3' }
//         ]
//     };

//     var typeOrMaterials = {
//         Value: [
//             { 'TypeOrMaterialId': 1, 'Description': 'Type or Material 1' },
//             { 'TypeOrMaterialId': 2, 'Description': 'Type or Material 2' },
//             { 'TypeOrMaterialId': 3, 'Description': 'Type or Material 3' }
//         ]
//     };

//     var reports = [
//         { Route: 'reports/ServiceCodeProductivity', ActionId: 2912, RequestBodyProperties: 'Location[]', Category: 3 }
//     ];

//     var emptyPromise = {
//         $$state: { status: 1 },
//         values: []
//     };

//     initialData = {
//         ServiceTypes: serviceTypes,
//         TaxableServices: { Value: taxableServices.Value },
//         AffectedAreas: { Value: affectedAreas.Value },
//         ProviderTypes: { Value: providerTypes.Value },
//         DrawTypes: drawTypes,
//         ServiceButtons: { Value: serviceButtons.Value },
//         TypeOrMaterials: { Value: typeOrMaterials.Value }
//     };

//     serviceCodes = [];

//     beforeEach(module('Soar.Common'));
//     beforeEach(module('common.factories'));
//     beforeEach(module('Soar.BusinessCenter'));

//     beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
//         scope = $rootScope.$new();
//         q = $q;

//         //mock staticData service
//         staticData = {
//             TaxableServices: function () {
//                 deferredTaxableServices = q.defer();
//                 return deferredTaxableServices.promise;
//             },
//             AffectedAreas: function () {
//                 deferredAffectedAreas = q.defer();
//                 return deferredAffectedAreas.promise;
//             },
//             ProviderTypes: function () {
//                 deferredProviderTypes = q.defer();
//                 return deferredProviderTypes.promise;
//             }
//         };

//         //mock for modal
//         modalInstance = {
//             open: jasmine.createSpy('modalInstance.open').and.callFake(function (options) {
//                 actualOptions = options;
//                 deferred = q.defer();
//                 deferred.resolve('some value in return');
//                 return { result: deferred.promise };
//             }),
//             close: jasmine.createSpy('modalInstance.close'),
//             dismiss: jasmine.createSpy('modalInstance.dismiss'),
//             result: {
//                 then: jasmine.createSpy('modalInstance.result.then')
//             }
//         };

//         modalFactory = {
//             Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function (options) {
//                 actualOptions = options;
//                 deferred = q.defer();
//                 deferred.resolve('some value in return');
//                 return { result: deferred.promise };
//             }),
//             CancelModal: jasmine.createSpy('modalFactory.CancelModal').and.callFake(function (options) {
//                 actualOptions = options;
//                 deferred = q.defer();
//                 deferred.resolve('some value in return');
//                 return {
//                     result: deferred.promise,
//                     then: function () { }
//                 };
//             })
//         };

//         reportsFactory = {
//             GetReportArray: jasmine.createSpy('reportsFactory.GetReportArray').and.callFake(function (options) {
//                 actualOptions = options;
//                 deferred = q.defer();
//                 deferred.resolve(reports);
//                 return { result: deferred.promise, then: function () { } };
//             })
//         };

//         serviceCodesFactory = $injector.get('ServiceCodesFactory');
//         serviceCodesFactory.GetSwiftCodesAttachedToServiceCode = jasmine.createSpy()
//             .and.returnValue(emptyPromise);
//         //mock for serviceTypesService that returns list of all service types

//         //mock for listHelper service
//         listHelper = {
//             findItemByFieldValue: jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(0),
//             findIndexByFieldValue: jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(0)
//         };

//         //mock for toaster functionality
//         toastrFactory = {
//             success: jasmine.createSpy(),
//             error: jasmine.createSpy()
//         };

//         localize = {
//             getLocalizedString: jasmine.createSpy().and.returnValue('some value')
//         };
//         preventiveCareFactory = {
//             accessForServiceCode: jasmine.createSpy(),
//             GetPreventiveServicesForServiceCode: jasmine.createSpy().and.returnValue(emptyPromise)
//         };
//         chartingFavoritesFactory = {
//             GetAllFavoritesContainingServiceId: jasmine.createSpy().and.returnValue(emptyPromise)
//         };
//         //mock for patSecurityService
//         patSecurityService = {
//             IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
//             generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
//         };

//         referenceDataService = {
//             get: jasmine.createSpy().and.callFake(function () {
//                 return [];
//             }),
//             setFeesByLocation: jasmine.createSpy().and.callFake(function () {
//                 return {};
//             }),
//             forceEntityExecution: jasmine.createSpy(),
//             entityNames: {
//                 serviceTypes: 'serviceTypes',
//                 preventiveServiceTypes: 'preventiveServiceTypes',
//                 serviceCodes: 'serviceCodes'
//             }
//         };

//         route = $injector.get('$route');
//         timeout = $injector.get('$timeout');
//         spyOn(route, 'reload');
//         controller = $controller;
//         ctrl = createController();
//     }));

//     it('ServiceCodeSearchController: should check if controller exists', function () {
//         spyOn(scope, 'initializeServiceCodeSearchData');
//         expect(ctrl).not.toBeNull();
//         expect(scope.dataForCrudOperation.ServiceTypes).not.toBe([]);
//         expect(scope.dataForCrudOperation.ServiceTypes).toEqual(initialData.ServiceTypes);
//         expect(scope.dataForCrudOperation.DrawTypes).not.toBe([]);
//         expect(scope.dataForCrudOperation.DrawTypes).toEqual(initialData.DrawTypes);
//         expect(scope.dataForCrudOperation.TaxableServices).not.toBe([]);
//         expect(scope.dataForCrudOperation.TaxableServices).toEqual(initialData.TaxableServices.Value);
//         expect(scope.dataForCrudOperation.AffectedAreas).not.toBe([]);
//         expect(scope.dataForCrudOperation.AffectedAreas).toEqual(initialData.AffectedAreas.Value);
//         expect(scope.dataForCrudOperation.UsuallyPerformedByProviderTypes).not.toBe([]);
//     });

//     //controller initialization
//     describe('controller initialization ->', function () {
//         it('should call notifyNotAuthorized when user is not authorized for view', function () {
//             patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
//             spyOn(ctrl, 'notifyNotAuthorized');
//             ctrl.authViewAccess();
//             expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
//         });
//     });

//     //toastrFactory
//     it('should check that toastrFactory is not null', function () {
//         expect(toastrFactory).not.toBe(null);
//     });

//     it('should check that toastrFactory is not undefined', function () {
//         expect(toastrFactory).not.toBeUndefined();
//     });

//     //authAddServiceCodeAccess
//     describe('authAddServiceCodeAccess function ->', function () {
//         it('should call patSecurityService.IsAuthorizedByAbbreviation service function with scope.addServiceCodeAmfa', function () {
//             ctrl.authAddServiceCodeAccess();
//             expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(scope.addServiceCodeAmfa);
//         });
//     });

//     //authEditServiceCodeAccess
//     describe('authEditServiceCodeAccess function ->', function () {
//         it('should call patSecurityService.IsAuthorizedByAbbreviation service function with scope.editServiceCodeAmfa', function () {
//             ctrl.authEditServiceCodeAccess();
//             expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(scope.editServiceCodeAmfa);
//         });
//     });

//     //authAddSwiftCodeAccess
//     describe('authAddSwiftCodeAccess function ->', function () {
//         it('should call patSecurityService.IsAuthorizedByAbbreviation service function with scope.addSwiftCodeAmfa', function () {
//             ctrl.authAddSwiftCodeAccess();
//             expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(scope.addSwiftCodeAmfa);
//         });
//     });

//     //authEditSwiftCodeAccess
//     describe('authEditSwiftCodeAccess function ->', function () {
//         it('should call patSecurityService.IsAuthorizedByAbbreviation service function with scope.editSwiftCodeAmfa', function () {
//             ctrl.authEditSwiftCodeAccess();
//             expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(scope.editSwiftCodeAmfa);
//         });
//     });

//     //notifyNotAuthorized
//     describe('notifyNotAuthorized function ->', function () {
//         it('should call toastrFactory.error service function', function () {
//             var authMessageKey = 'Message Key';
//             ctrl.notifyNotAuthorized(authMessageKey);
//             expect(toastrFactory.error).toHaveBeenCalled();
//             expect(patSecurityService.generateMessage).toHaveBeenCalledWith(authMessageKey);
//         });
//     });

//     //changePageState
//     describe('changePageState function ->', function () {
//         beforeEach(inject(function () {
//             spyOn(ctrl, 'changePath');
//      }));

//         it('should call modalFactory.CancelModal when dataForCrudOperation.DataHasChanged is true and scope.dataForCrudOperation.BreadCrumbs.length is greater than 2', function () {
//             var breadcrumb = 'Bread Crumb';
//             scope.dataForCrudOperation.DataHasChanged = true;
//             scope.dataForCrudOperation.BreadCrumbs = [{}, {}, {}];

//             scope.changePageState(breadcrumb);

//             expect(ctrl.currentBreadcrumb).toEqual(breadcrumb);
//             expect(modalFactory.CancelModal).toHaveBeenCalled();
//         });

//         it('should call ctrl.changePath when dataForCrudOperation.DataHasChanged is false', function () {
//             var breadcrumb = 'Bread Crumb';
//             scope.dataForCrudOperation.DataHasChanged = false;
//             scope.dataForCrudOperation.BreadCrumbs = [{}, {}, {}];

//             scope.changePageState(breadcrumb);

//             expect(ctrl.currentBreadcrumb).toEqual(breadcrumb);
//             expect(ctrl.changePath).toHaveBeenCalled();
//         });

//         it('should call ctrl.changePath when scope.dataForCrudOperation.BreadCrumbs.length is not greater than 2', function () {
//             var breadcrumb = 'Bread Crumb';
//             scope.dataForCrudOperation.DataHasChanged = true;
//             scope.dataForCrudOperation.BreadCrumbs = [{}, {}];

//             scope.changePageState(breadcrumb);

//             expect(ctrl.currentBreadcrumb).toEqual(breadcrumb);
//             expect(ctrl.changePath).toHaveBeenCalled();
//         });
//     });

//     //changePath
//     describe('changePath function ->', function () {
//         beforeEach(inject(function () {
//             localize.getLocalizedString = jasmine.createSpy().and.callFake(function (str) {
//                 return str;
//             });
//         }));

//         it('should call resetDataForCrud when currentBreadcrumb.name is set as \'Service & Swift Codes\'', function () {
//             ctrl.currentBreadcrumb = { name: 'Service & Swift Codes' };
//             spyOn(ctrl, 'resetDataForCrud');

//             ctrl.changePath();

//             expect(ctrl.resetDataForCrud).not.toHaveBeenCalled();
//             timeout.flush(1);
//             expect(ctrl.resetDataForCrud).toHaveBeenCalled();
//         });

//         it('should call location.url when currentBreadcrumb.name is not set as \'Service & Swift Codes\'', function () {
//             ctrl.currentBreadcrumb = { name: 'Test Code', path: 'test.url' };

//             ctrl.changePath();

//             expect(_$location_.url).toHaveBeenCalledWith(ctrl.currentBreadcrumb.path);
//         });
//     });

//     //initializeServiceCodeSearchData
//     it('initializeServiceCodeSearchData should set required data', function () {
//         scope.initializeServiceCodeSearchData();
//         expect(scope.orderBy).toBeDefined();
//         expect(scope.orderBy.asc).toEqual(true);
//         expect(scope.orderBy.field).toEqual('Code');
//     });

//     //changeSortingForGrid
//     describe('changeSortingForGrid function->', function () {
//         it('should order the table as per input column', function () {
//             scope.orderBy = { field: '', asc: false };
//             scope.changeSortingForGrid('column1');
//             expect(scope.orderBy.field).toEqual('column1');
//             expect(scope.orderBy.asc).toEqual(true);

//             scope.orderBy = { field: 'column1', asc: true };
//             scope.changeSortingForGrid('column1');
//             expect(scope.orderBy.field).toEqual('column1');
//             expect(scope.orderBy.asc).toEqual(false);
//         });

//         it('should order the table as per TimesUsed column', function () {
//             scope.orderBy = { field: 'column1', asc: true };
//             scope.changeSortingForGrid('TimesUsed');
//             expect(scope.orderBy.field).toEqual('TimesUsed');
//             expect(scope.orderBy.asc).toEqual(false);
//         });
//     });

//     //resetSorting
//     it('resetSorting  should reset sorting if swiftPickFilter is true and sorting is already applied on \'CdtCodeName\' or \'ServiceTypeDescription\'', function () {
//         scope.swiftPickFilter = true;
//         scope.orderBy = { field: 'CdtCodeName', asc: false };
//         scope.resetSorting();
//         timeout.flush(0);
//         expect(scope.orderBy.field).toEqual('');
//         expect(scope.orderBy.asc).toEqual(true);

//         scope.swiftPickFilter = true;
//         scope.orderBy = { field: 'ServiceTypeDescription', asc: false };
//         scope.resetSorting();
//         timeout.flush(0);
//         expect(scope.orderBy.field).toEqual('');
//         expect(scope.orderBy.asc).toEqual(true);
//     });

//     //serviceCodeCreated
//     it('serviceCodeCreated should add newly created service code into the service code list', function () {
//         scope.serviceCodes = [];
//         var newServiceCode = { Fee: 100 };

//         scope.serviceCodeCreated(newServiceCode);
//         expect(scope.serviceCodes.length).toEqual(1);
//     });

//     it('serviceCodeCreated should not add newly created service code into the service code list, when newly created service code does not exists', function () {
//         scope.serviceCodes = [];

//         scope.serviceCodeCreated(null);
//         expect(scope.serviceCodes.length).toEqual(0);
//     });

//     describe('serviceCodeUpdated function ->', function () {
//         it('serviceCodeUpdated should not replace the old service code with updated service code into the service code list, when updated service code is null', function () {
//             scope.serviceCodes = [{ ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947', Code: 1, Value: 'one' }, { ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e948', Code: 2, Value: 'two' }];

//             scope.serviceCodeUpdated(null);
//             expect(listHelper.findIndexByFieldValue).not.toHaveBeenCalled();
//             expect(scope.serviceCodes.length).toEqual(2);
//             expect(scope.serviceCodes[0].Value).toEqual('one');
//             expect(scope.serviceCodes[1].Value).toEqual('two');
//         });

//         it('serviceCodeUpdated should replace the old service code with updated service code into the service code list', function () {
//             scope.serviceCodes = [{ ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947', Code: 1, Value: 'one' }, { ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e948', Code: 2, Value: 'two' }];
//             var updatedServiceCode = { ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947', Code: 1, Value: 'updated_one', IsSwiftPickCode: false, Fee: 100 };

//             scope.serviceCodeUpdated(updatedServiceCode);
//             expect(scope.serviceCodes.length).toEqual(2);
//         });

//         it('serviceCodeUpdated should replace the old service code with updated service code into the service code list and should call updateSwiftPickCodeServiceCodes when serviceCode is swiftPickCode', function () {
//             scope.serviceCodes = [{ ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947', Code: 1, Value: 'one' }, { ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e948', Code: 2, Value: 'two' }];
//             var updatedServiceCode = { ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947', Code: 1, Value: 'updated_one', IsSwiftPickCode: true, Fee: 100 };

//             scope.serviceCodeUpdated(updatedServiceCode);
//             expect(scope.serviceCodes.length).toEqual(2);
//         });

//         it('serviceCodeUpdated should not replace the old service code with updated service code into the service code list, when the service code does not exists in the list', function () {
//             scope.serviceCodes = [{ ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947', Code: 1, Value: 'one' }, { ServiceCodeId: 'e928ed50-1c73-4836-8a07-11d4ac39e948', Code: 2, Value: 'two' }];
//             var updatedServiceCode = { ServiceCodeId: '12345678-1234-1234-1234-123456781234', Code: 1, Value: 'updated_one', IsSwiftPickCode: false, Fee: 100 };
//             listHelper.findIndexByFieldValue = jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(-1);

//             scope.serviceCodeUpdated(updatedServiceCode);
//             expect(scope.serviceCodes.length).toEqual(2);
//             expect(scope.serviceCodes[0].Value).toEqual('one');
//             expect(scope.serviceCodes[1].Value).toEqual('two');
//         });
//     });

//     //createServiceCode
//     it('createServiceCode should call notifyNotAuthorized when ctrl.authAddServiceCodeAccess returns false', function () {
//         spyOn(ctrl, 'authAddServiceCodeAccess').and.returnValue(false);
//         spyOn(ctrl, 'notifyNotAuthorized');

//         scope.createServiceCode();

//         expect(ctrl.authAddServiceCodeAccess).toHaveBeenCalled();
//         expect(ctrl.notifyNotAuthorized).toHaveBeenCalledWith(scope.addServiceCodeAmfa);
//     });

//     it('createServiceCode should not set flags for create service code operation when service types is null or undefined', function () {
//         scope.dataForCrudOperation.ServiceCode = null;
//         scope.dataForCrudOperation.IsCreateOperation = null;
//         scope.dataForCrudOperation.DataHasChanged = null;
//         scope.dataForCrudOperation.ShowServiceCodesList = true;
//         scope.dataForCrudOperation.ServiceTypes = null;

//         scope.createServiceCode();

//         expect(toastrFactory.error).toHaveBeenCalled();
//         expect(scope.dataForCrudOperation.ServiceCode).toBe(null);
//         expect(scope.dataForCrudOperation.IsCreateOperation).toBe(null);
//         expect(scope.dataForCrudOperation.DataHasChanged).toBe(null);
//         expect(scope.dataForCrudOperation.ShowServiceCodesList).toBe(true);
//         expect(scope.dataForCrudOperation.SwiftCodes).toEqual(emptyPromise.values);
//         expect(scope.dataForCrudOperation.PreventiveServices).toEqual(emptyPromise.values);
//         expect(scope.dataForCrudOperation.Favorites).toEqual(emptyPromise.values);
//     });

//     it('createServiceCode should set flags for create service code operation when service types, taxableServices and affectedAreas data is defined', function () {
//         var emptyServiceCode = {
//             ServiceCodeId: null,
//             CdtCodeId: null,
//             CdtCodeName: '',
//             Code: '',
//             Description: '',
//             ServiceTypeId: null,
//             ServiceTypeDescription: null,
//             DisplayAs: '',
//             Fee: '',
//             TaxableServiceTypeId: scope.dataForCrudOperation.TaxableServices ? scope.dataForCrudOperation.TaxableServices[0].Id : null,
//             TaxableServiceTypeName: scope.dataForCrudOperation.TaxableServices ? scope.dataForCrudOperation.TaxableServices[0].Name : null,
//             AffectedAreaId: scope.dataForCrudOperation.AffectedAreas ? scope.dataForCrudOperation.AffectedAreas[0].Id : null,
//             AffectedAreaName: scope.dataForCrudOperation.AffectedAreas ? scope.dataForCrudOperation.AffectedAreas[0].Name : null,
//             DrawTypeId: null,
//             DrawTypeDescription: null,
//             UsuallyPerformedByProviderTypeId: null,
//             UsuallyPerformedByProviderTypeName: null,
//             UseCodeForRangeOfTeeth: false,
//             IsActive: true,
//             IsEligibleForDiscount: false,
//             Notes: '',
//             SubmitOnInsurance: true,
//             IsSwiftPickCode: false,
//             UseSmartCodes: false,
//             SmartCode1Id: null,
//             SmartCode2Id: null,
//             SmartCode3Id: null,
//             SmartCode4Id: null,
//             SmartCode5Id: null,
//         };

//         scope.createServiceCode();

//         expect(scope.dataForCrudOperation.ServiceCode).toEqual(emptyServiceCode);
//         expect(scope.dataForCrudOperation.IsCreateOperation).toBe(true);
//         expect(scope.dataForCrudOperation.DataHasChanged).toBe(false);
//         expect(scope.dataForCrudOperation.ShowServiceCodesList).toBe(false);
//         expect(scope.dataForCrudOperation.ServiceCodeId).toBeNull();
//         expect(scope.dataForCrudOperation.SwiftCodes).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.PreventiveServices).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.Favorites).toEqual(emptyPromise);
//     });

//     it('createServiceCode should set flags for create service code operation when service types list is defined, and taxableServices and affectedAreas data does not exists', function () {
//         scope.dataForCrudOperation.TaxableServices = null;
//         scope.dataForCrudOperation.AffectedAreas = null;

//         var emptyServiceCode = {
//             ServiceCodeId: null,
//             CdtCodeId: null,
//             CdtCodeName: '',
//             Code: '',
//             Description: '',
//             ServiceTypeId: null,
//             ServiceTypeDescription: null,
//             DisplayAs: '',
//             Fee: '',
//             TaxableServiceTypeId: scope.dataForCrudOperation.TaxableServices ? scope.dataForCrudOperation.TaxableServices[0].Id : null,
//             TaxableServiceTypeName: scope.dataForCrudOperation.TaxableServices ? scope.dataForCrudOperation.TaxableServices[0].Name : null,
//             AffectedAreaId: scope.dataForCrudOperation.AffectedAreas ? scope.dataForCrudOperation.AffectedAreas[0].Id : null,
//             AffectedAreaName: scope.dataForCrudOperation.AffectedAreas ? scope.dataForCrudOperation.AffectedAreas[0].Name : null,
//             DrawTypeId: null,
//             DrawTypeDescription: null,
//             UsuallyPerformedByProviderTypeId: null,
//             UsuallyPerformedByProviderTypeName: null,
//             UseCodeForRangeOfTeeth: false,
//             IsActive: true,
//             IsEligibleForDiscount: false,
//             Notes: '',
//             SubmitOnInsurance: true,
//             IsSwiftPickCode: false,
//             UseSmartCodes: false,
//             SmartCode1Id: null,
//             SmartCode2Id: null,
//             SmartCode3Id: null,
//             SmartCode4Id: null,
//             SmartCode5Id: null,
//         };

//         scope.createServiceCode();

//         expect(scope.dataForCrudOperation.ServiceCode).toEqual(emptyServiceCode);
//         expect(scope.dataForCrudOperation.IsCreateOperation).toBe(true);
//         expect(scope.dataForCrudOperation.DataHasChanged).toBe(false);
//         expect(scope.dataForCrudOperation.ShowServiceCodesList).toBe(false);
//         expect(scope.dataForCrudOperation.ServiceCodeId).toBeNull();
//         expect(scope.dataForCrudOperation.SwiftCodes).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.PreventiveServices).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.Favorites).toEqual(emptyPromise);
//     });

//     //editServiceCode
//     it('editServiceCode should call notifyNotAuthorized when ctrl.authEditServiceCodeAccess returns false', function () {
//         spyOn(ctrl, 'authEditServiceCodeAccess').and.returnValue(false);
//         spyOn(ctrl, 'notifyNotAuthorized');

//         scope.editServiceCode();

//         expect(ctrl.authEditServiceCodeAccess).toHaveBeenCalled();
//         expect(ctrl.notifyNotAuthorized).toHaveBeenCalledWith(scope.editServiceCodeAmfa);
//     });

//     it('editServiceCode should not set flags for edit service code operation when passed service code object is null or undefined', function () {
//         scope.dataForCrudOperation.ServiceCode = null;
//         scope.dataForCrudOperation.ServiceCodeId = null;
//         scope.dataForCrudOperation.IsCreateOperation = null;
//         scope.dataForCrudOperation.DataHasChanged = null;
//         scope.dataForCrudOperation.ShowServiceCodesList = true;

//         scope.editServiceCode(null);

//         expect(toastrFactory.error).toHaveBeenCalled();
//         expect(scope.dataForCrudOperation.ServiceCode).toBeNull();
//         expect(scope.dataForCrudOperation.IsCreateOperation).toBeNull();
//         expect(scope.dataForCrudOperation.DataHasChanged).toBeNull();
//         expect(scope.dataForCrudOperation.ShowServiceCodesList).toBe(true);
//         expect(scope.dataForCrudOperation.ServiceCodeId).toBeNull();
//         expect(scope.dataForCrudOperation.SwiftCodes).toEqual(emptyPromise.values);
//         expect(scope.dataForCrudOperation.PreventiveServices).toEqual(emptyPromise.values);
//         expect(scope.dataForCrudOperation.Favorites).toEqual(emptyPromise.values);
//     });

//     it('editServiceCode should set flags for edit service code operation when default items for drop-down lists exists', function () {
//         scope.dataForCrudOperation.ServiceCode = null;
//         scope.dataForCrudOperation.ServiceCodeId = null;
//         scope.dataForCrudOperation.IsCreateOperation = null;
//         scope.dataForCrudOperation.DataHasChanged = null;
//         scope.dataForCrudOperation.ShowServiceCodesList = true;

//         var serviceCode = {
//             ServiceCodeId: 1234,
//             CdtCodeId: null,
//             Code: '',
//             Description: '',
//             ServiceTypeId: null,
//             DisplayAs: '',
//             Fee: 10.00,
//             TaxableServiceTypeId: 1,
//             AffectedAreaId: 1,
//             DrawTypeId: 1,
//             UsuallyPerformedByProviderTypeId: 1,
//             ServiceButtonId: 1,
//             TypeOrMaterialId: 1,
//             UseCodeForRangeOfTeeth: false,
//             IsActive: true,
//             IsEligibleForDiscount: false,
//             Notes: ''
//         };
//         listHelper.findItemByFieldValue = jasmine.createSpy().and.returnValue({});

//         scope.editServiceCode(serviceCode);

//         expect(scope.dataForCrudOperation.ServiceCode).toEqual(serviceCode);
//         expect(scope.dataForCrudOperation.IsCreateOperation).toEqual(false);
//         expect(scope.dataForCrudOperation.DataHasChanged).toEqual(false);
//         expect(scope.dataForCrudOperation.ShowServiceCodesList).toEqual(false);
//         expect(scope.dataForCrudOperation.ServiceCodeId).toEqual(serviceCode.ServiceCodeId);
//         expect(scope.dataForCrudOperation.SwiftCodes).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.PreventiveServices).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.Favorites).toEqual(emptyPromise);
//     });

//     it('editServiceCode should set flags for edit service code operation when default items for drop-down lists does not exists', function () {
//         scope.dataForCrudOperation.ServiceCode = null;
//         scope.dataForCrudOperation.ServiceCodeId = null;
//         scope.dataForCrudOperation.IsCreateOperation = null;
//         scope.dataForCrudOperation.DataHasChanged = null;
//         scope.dataForCrudOperation.ShowServiceCodesList = true;

//         var serviceCode = {
//             ServiceCodeId: 1234,
//             CdtCodeId: null,
//             Code: '',
//             Description: '',
//             ServiceTypeId: null,
//             DisplayAs: '',
//             Fee: 0.00,
//             TaxableServiceTypeId: 0,
//             AffectedAreaId: 0,
//             DrawTypeId: null,
//             UsuallyPerformedByProviderTypeId: null,
//             ServiceButtonId: 1,
//             TypeOrMaterialId: 1,
//             UseCodeForRangeOfTeeth: false,
//             IsActive: true,
//             IsEligibleForDiscount: false,
//             Notes: ''
//         };
//         listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);

//         scope.editServiceCode(serviceCode);

//         expect(scope.dataForCrudOperation.ServiceCode).toEqual(serviceCode);
//         expect(scope.dataForCrudOperation.IsCreateOperation).toEqual(false);
//         expect(scope.dataForCrudOperation.DataHasChanged).toEqual(false);
//         expect(scope.dataForCrudOperation.ShowServiceCodesList).toEqual(false);
//         expect(scope.dataForCrudOperation.ServiceCodeId).toEqual(serviceCode.ServiceCodeId);
//         expect(scope.dataForCrudOperation.SwiftCodes).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.PreventiveServices).toEqual(emptyPromise);
//         expect(scope.dataForCrudOperation.Favorites).toEqual(emptyPromise);
//     });

//     //createSwiftPickCode
//     it('createSwiftPickCode should open modal for adding new swift code', function () {
//         scope.taxableServices = [{ Id: 0, Name: 'TaxableService1' }];
//         scope.affectedAreas = [{ Id: 0, Name: 'AffectedArea1' }];

//         ctrl.emptyServiceCode = {
//             ServiceCodeId: null,
//             Code: '',
//             Description: '',
//             ServiceTypeDescription: 'Swift Code',
//             DisplayAs: '',
//             IsActive: true,
//             IsSwiftPickCode: true,
//             SwiftPickServiceCodes: []
//         };

//         // Add work-flow happens in a modal.
//         scope.createSwiftPickCode();
//         expect(modalFactory.Modal).toHaveBeenCalledWith({
//             templateUrl: 'App/BusinessCenter/service-code/swiftpick-code-crud/swiftpick-code-crud.html',
//             keyboard: false,
//             windowClass: 'modal-dialog-large',
//             backdrop: 'static',
//             controller: 'SwiftPickCodeCrudController',
//             amfa: 'soar-biz-bsvccd-aswift',
//             resolve: {
//                 ServiceCode: jasmine.any(Function)
//             }
//         });
//         expect(actualOptions.resolve.ServiceCode()).toEqual(ctrl.emptyServiceCode);
//     });

//     //editSwiftPickCode
//     it('editSwiftPickCode should fail to open modal for editing swift code when passed parameter is null or undefined', function () {
//         scope.editSwiftPickCode(null);
//         expect(modalFactory.Modal).not.toHaveBeenCalled();
//         expect(toastrFactory.error).toHaveBeenCalled();
//     });

//     it('editServiceCode should open modal for editing existing service code', function () {
//         var serviceCode = {
//             ServiceCodeId: null,
//             CdtCodeId: null,
//             Code: '',
//             Description: '',
//             ServiceTypeId: null,
//             DisplayAs: '',
//             Fee: 0.00,
//             TaxableServiceTypeId: 0,
//             AffectedAreaId: 0,
//             UsuallyPerformedByProviderTypeId: null,
//             UseCodeForRangeOfTeeth: false,
//             IsActive: true,
//             IsEligibleForDiscount: false,
//             Notes: ''
//         };

//         // Edit work-flow happens in a modal.
//         scope.editSwiftPickCode(serviceCode);
//         expect(modalFactory.Modal).toHaveBeenCalledWith({
//             templateUrl: 'App/BusinessCenter/service-code/swiftpick-code-crud/swiftpick-code-crud.html',
//             keyboard: false,
//             windowClass: 'modal-dialog-large',
//             backdrop: 'static',
//             controller: 'SwiftPickCodeCrudController',
//             amfa: 'soar-biz-bsvccd-eswift',
//             resolve: {
//                 ServiceCode: jasmine.any(Function)
//             }
//         });
//         expect(actualOptions.resolve.ServiceCode()).toEqual(serviceCode);
//     });

//     //updateSwiftPickCodeServiceCodes
//     describe('updateSwiftPickCodeServiceCodes  function ->', function () {
//         it('should updated only fee field of service code when it has no swift code in it', function () {
//             var serviceCode = { Fee: 10, SwiftPickServiceCodes: [] };
//             expect(serviceCode.Fee).toEqual(10);
//             ctrl.updateSwiftPickCodeServiceCodes(serviceCode);
//             expect(serviceCode.Fee).toEqual(0);
//         });

//         it('should updated fields of service code when it has swift code in it', function () {
//             var serviceCode = { Fee: 10, SwiftPickServiceCodes: [{ ServiceCodeId: 1, Code: '', Description: '', CdtCodeName: '', Fee: '' }] };
//             scope.serviceCodes = [{ ServiceCodeId: 1, Code: 1, Description: 'swift1', CdtCodeName: 'cdt1', Fee: 1 }, { ServiceCodeId: 2, Code: 2, Description: 'swift2', CdtCodeName: 'cdt2', Fee: 2 }];
//             expect(serviceCode.Fee).toEqual(10);
//             listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({ ServiceCodeId: 1, Code: 1, Description: 'swift1', CdtCodeName: 'cdt1', Fee: 1 });

//             ctrl.updateSwiftPickCodeServiceCodes(serviceCode);
//             expect(serviceCode.Fee).toEqual(1);
//         });
//     });

//     //watch statement on searchServiceCodesKeyword
//     it('watch on searchServiceCodesKeyword should set filteringServices to true, when new value exists', function () {
//         scope.filteringServices = false;
//         scope.searchServiceCodesKeyword = 'Abcd';
//         scope.$apply();
//         expect(scope.filteringServices).toEqual(true);
//     });

//     it('watch on searchServiceCodesKeyword should not set filteringServices to true, when new value does not exists', function () {
//         scope.filteringServices = false;
//         scope.searchServiceCodesKeyword = null;
//         scope.$apply();
//         expect(scope.filteringServices).toEqual(false);
//     });

//     //showFilters
//     describe('showFilters function ->', function () {
//         var angularElement;
//         beforeEach(function () {
//             angularElement = { addClass: jasmine.createSpy() };
//             spyOn(angular, 'element').and.returnValue(angularElement);
//         });

//         it('should show filter window by setting appropriate css style', function () {
//             scope.showFilters();

//             expect(angularElement.addClass).toHaveBeenCalledWith('open');
//         });
//     });

//     //resetDataForCrud
//     describe('resetDataForCrud function ->', function () {
//         it('should reset dataForCrudOperation properties', function () {
//             scope.dataForCrudOperation.BreadCrumbs = [{ value: 'A' }, { value: 'B' }];

//             ctrl.resetDataForCrud();

//             expect(scope.dataForCrudOperation.DataHasChanged).toEqual(false);
//             expect(scope.dataForCrudOperation.ShowServiceCodesList).toEqual(true);
//             expect(scope.dataForCrudOperation.ServiceCode).toBeNull();
//             expect(scope.dataForCrudOperation.BreadCrumbs.length).toEqual(1);
//             expect(scope.dataForCrudOperation.BreadCrumbs[0].value).toEqual('A');
//         });
//     });

//     describe('ctrl.assignCustomProperties function ->', function () {
//         var serviceCode={};
//         var previousServiceType={};
//         var updatedServiceType={};
//         beforeEach(function(){
//             scope.dataForCrudOperation={ServiceTypes:[]};
//             scope.dataForCrudOperation.ServiceTypes = _.cloneDeep(serviceTypes);
//             previousServiceType=_.cloneDeep(serviceTypes[0]);
//             updatedServiceType=_.cloneDeep(serviceTypes[3]);
//             serviceCode={$$Dirty:true, ServiceCodeId:'1234', ServiceTypeId:previousServiceType.ServiceTypeId, ServiceTypeDescription:previousServiceType.Description};
//         });

//         it('should reset serviceCode ServiceTypeDescriptiion after an update', function () {
//             serviceCode.ServiceTypeId = updatedServiceType.ServiceTypeId;
//             ctrl.assignCustomProperties(serviceCode);
//             expect(serviceCode.ServiceTypeDescription).toEqual(updatedServiceType.Description);
//         });
//     });
// });

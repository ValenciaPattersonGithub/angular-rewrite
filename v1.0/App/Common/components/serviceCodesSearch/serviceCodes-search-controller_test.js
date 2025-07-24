// TODO : need to remove this later
// describe('Controller: ServiceCodesSearchController', function () {
//     var scope, ctrl, rootScope, serviceCodesService, serviceCodesFactory;

//     beforeEach(module("Soar.Common"));
//     beforeEach(module("common.factories"));

//     beforeEach(inject(function($rootScope, $controller) {
//         scope = $rootScope.$new();
//         rootScope = $rootScope;

//         //mock for serviceCodesService
//         serviceCodesService = {
//             search: jasmine.createSpy('serviceCodesService.search').and.returnValue({})
//         };

//         //mock for serviceCodesFactory
//         serviceCodesFactory = {
//             ServiceCode: jasmine.createSpy().and.returnValue({ then: function () { } }),
//             SetFeesByLocation: jasmine.createSpy().and.returnValue({})
//         };

//         ctrl = $controller('ServiceCodesSearchController', {
//             $scope: scope,
//             $rootScope: rootScope,
//             ServiceCodesService: serviceCodesService,
//             ServiceCodesFactory: serviceCodesFactory
//         });

//         _referenceDataService_.setFeesByLocation = jasmine.createSpy();
//     }));

//     it('controller should exists', function() {
//         expect(ctrl).not.toBeNull();
//         expect(ctrl).not.toBeUndefined();
//     });

//     describe('searchGetOnSuccess function ->', function () {
//         beforeEach(inject(function () {
//             // As this function is defined in directive, so creating a spy here
//             scope.onSelect = jasmine.createSpy('scope.onSelect');
//         }));

//         it('should call onSelect function when success response value contains only one item', function () {
//             scope.searchResults = [];
//             scope.searchString = "";
//             scope.selectAutoFocus = undefined;
//             var successResponse = { Value: [{ "Id": 1 }], Count: 1 };

//             scope.searchGetOnSuccess(successResponse);

//             expect(scope.onSelect).toHaveBeenCalledWith(successResponse.Value[0]);
//             expect(scope.selectAutoFocus).toBeUndefined();
//         });

//         it('should set selectAutoFocus.value when selectAutoFocus is defined', function () {
//             scope.searchResults = [];
//             scope.searchString = "";
//             scope.selectAutoFocus = { value: true };
//             var successResponse = { Value: [{ "Id": 1 }, { "Id": 2 }], Count: 2 };

//             scope.searchGetOnSuccess(successResponse);

//             expect(scope.selectAutoFocus.value).toEqual(false);
//             expect(scope.onSelect).not.toHaveBeenCalled();
//         });
//     });

//     describe('searchGetOnError function ->', function () {
//         it('should set value of selectAutoFocus.value when selectAutoFocus is defined', function () {
//             scope.selectAutoFocus = { value: true };

//             scope.searchGetOnError();

//             expect(scope.selectAutoFocus.value).toEqual(false);
//         });

//         it('should not set value of selectAutoFocus.value when selectAutoFocus is undefined', function () {
//             scope.selectAutoFocus = undefined;

//             scope.searchGetOnError();

//             expect(scope.selectAutoFocus).toBeUndefined();
//         });
//     });

//     describe('displayFilterServiceCodes function ->', function() {
//         it('should call serviceCodesService.search function, when serviceButtonId exists, is not equal to serviceButtonIdOriginal, and typeOrMaterialId does not exists', function() {
//             scope.serviceButtonId = 1;
//             scope.serviceButtonIdOriginal = 2;
//             scope.typeOrMaterialId = null;
//             scope.typeOrMaterialIdOriginal = null;
//             scope.searchIsQueryingServer = null;
//             scope.showFilterServiceCodes = null;

//             scope.displayFilterServiceCodes();

//             expect(scope.serviceButtonIdOriginal).toEqual(1);
//             expect(serviceCodesService.search).toHaveBeenCalled();
//             expect(scope.searchIsQueryingServer).toEqual(true);
//             expect(scope.showFilterServiceCodes).toEqual(true);
//         });

//         it('should call serviceCodesService.search function, when typeOrMaterialId exists, is not equal to typeOrMaterialIdOriginal, and serviceButtonId does not exists', function () {
//             scope.serviceButtonId = null;
//             scope.serviceButtonIdOriginal = null;
//             scope.typeOrMaterialId = 1;
//             scope.typeOrMaterialIdOriginal = 2;
//             scope.searchIsQueryingServer = null;
//             scope.showFilterServiceCodes = null;

//             scope.displayFilterServiceCodes();

//             expect(scope.typeOrMaterialIdOriginal).toEqual(1);
//             expect(serviceCodesService.search).toHaveBeenCalled();
//             expect(scope.searchIsQueryingServer).toEqual(true);
//             expect(scope.showFilterServiceCodes).toEqual(true);
//         });

//         it('should not call serviceCodesService.search function, when typeOrMaterialId and serviceButtonId exists, and are equal to typeOrMaterialIdOriginal and serviceButtonIdOriginal respectively', function () {
//             scope.serviceButtonId = 1;
//             scope.serviceButtonIdOriginal = 1;
//             scope.typeOrMaterialId = 2;
//             scope.typeOrMaterialIdOriginal = 2;
//             scope.searchIsQueryingServer = null;
//             scope.showFilterServiceCodes = null;
//             scope.selectAutoFocus = { value: true };

//             scope.displayFilterServiceCodes();

//             expect(serviceCodesService.search).not.toHaveBeenCalled();
//             expect(scope.selectAutoFocus.value).toEqual(false);
//         });

//         it('should set selectAutoFocus.value when selectAutoFocus is defined, and typeOrMaterialId and serviceButtonId are equal to typeOrMaterialIdOriginal and serviceButtonIdOriginal respectively', function () {
//             scope.serviceButtonId = 1;
//             scope.serviceButtonIdOriginal = 1;
//             scope.typeOrMaterialId = 2;
//             scope.typeOrMaterialIdOriginal = 2;
//             scope.selectAutoFocus = { value: true };

//             scope.displayFilterServiceCodes();

//             expect(scope.selectAutoFocus.value).toEqual(false);
//         });

//         it('should not set selectAutoFocus.value when selectAutoFocus is undefined, and typeOrMaterialId and serviceButtonId are equal to typeOrMaterialIdOriginal and serviceButtonIdOriginal respectively', function () {
//             scope.serviceButtonId = 1;
//             scope.serviceButtonIdOriginal = 1;
//             scope.typeOrMaterialId = 2;
//             scope.typeOrMaterialIdOriginal = 2;
//             scope.selectAutoFocus = undefined;

//             scope.displayFilterServiceCodes();

//             expect(scope.selectAutoFocus).toBeUndefined();
//         });

//         it('should not call serviceCodesService.search function, when typeOrMaterialId and serviceButtonId does not exists', function () {
//             scope.serviceButtonId = null;
//             scope.serviceButtonIdOriginal = null;
//             scope.typeOrMaterialId = null;
//             scope.typeOrMaterialIdOriginal = null;
//             scope.searchIsQueryingServer = null;
//             scope.showFilterServiceCodes = null;

//             scope.displayFilterServiceCodes();

//             expect(serviceCodesService.search).not.toHaveBeenCalled();
//             expect(scope.searchIsQueryingServer).toEqual(false);
//             expect(scope.showFilterServiceCodes).toEqual(false);
//         });

//         it('should set selectAutoFocus.value when selectAutoFocus is defined, and typeOrMaterialId and serviceButtonId does not exists', function () {
//             scope.serviceButtonId = null;
//             scope.serviceButtonIdOriginal = null;
//             scope.typeOrMaterialId = null;
//             scope.typeOrMaterialIdOriginal = null;
//             scope.searchIsQueryingServer = null;
//             scope.showFilterServiceCodes = null;
//             scope.selectAutoFocus = { value: true };

//             scope.displayFilterServiceCodes();

//             expect(scope.selectAutoFocus.value).toEqual(false);
//         });

//         it('should not set selectAutoFocus.value when selectAutoFocus is undefined, and typeOrMaterialId and serviceButtonId does not exists', function () {
//             scope.serviceButtonId = null;
//             scope.serviceButtonIdOriginal = null;
//             scope.typeOrMaterialId = null;
//             scope.typeOrMaterialIdOriginal = null;
//             scope.searchIsQueryingServer = null;
//             scope.showFilterServiceCodes = null;
//             scope.selectAutoFocus = undefined;

//             scope.displayFilterServiceCodes();

//             expect(scope.selectAutoFocus).toBeUndefined();
//         });
//     });
// });

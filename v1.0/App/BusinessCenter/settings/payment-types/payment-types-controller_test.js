// To Do - Remove this file when doing cleanup of payment-types
// // top level test suite
// describe('PaymentTypesController ->', function () {
//   var scope,
//     deferred,
//     ctrl,
//     element,
//     timeout,
//     compile,
//     toastr,
//     staticData,
//     modalFactory,
//     modalFactoryDeferred,
//     q,
//     localize;

//   var mockPaymentTypesList = [
//     {
//       PaymentTypeId: '00000000-0000-0000-0000-000000000001',
//       IsSystemType: false,
//       Description: 'PaymentType1',
//     },
//     {
//       PaymentTypeId: '00000000-0000-0000-0000-000000000002',
//       IsSystemType: false,
//       Description: 'PaymentType2',
//     },
//   ];
//   var mockCurrencyTypesList = [
//     { Id: 1, Name: 'Check' },
//     { Id: 2, Name: 'Cash' },
//   ];

//   //#region before each
//   beforeEach(module('Soar.Common'));
//   beforeEach(module('common.factories'));

//   var paymentTypeService;
//   beforeEach(
//     module('Soar.BusinessCenter', function ($provide) {
//       staticData = {};
//       //mock for staticData.TransactionTypes
//       staticData.CurrencyTypes = jasmine.createSpy().and.callFake(function () {
//         deferred = q.defer();
//         deferred.resolve(mockCurrencyTypesList);
//         return deferred.promise;
//       });

//       $provide.value('StaticData', staticData);
//       paymentTypeService = {
//         get: jasmine
//           .createSpy()
//           .and.returnValue({ Value: mockPaymentTypesList }),
//         deletePaymentTypeById: jasmine.createSpy(),
//       };
//       $provide.value('PaymentTypesService', paymentTypeService);

//       localize = {
//         getLocalizedString: jasmine.createSpy(),
//       };
//     })
//   );
//   //#endregion

//   //controller test suite
//   describe('Payment type controller ->', function () {
//     //#region before each
//     beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
//       scope = $rootScope.$new();

//       q = $q;

//       //mock of ModalFactory
//       modalFactory = {
//         ConfirmModal: jasmine
//           .createSpy('modalFactory.ConfirmModal')
//           .and.callFake(function () {
//             modalFactoryDeferred = q.defer();
//             modalFactoryDeferred.resolve(1);
//             return {
//               result: modalFactoryDeferred.promise,
//               then: function () {},
//             };
//           }),
//       };

//       ctrl = $controller('PaymentTypesController', {
//         $scope: scope,
//         ModalFactory: modalFactory,
//       });

//       $rootScope.$apply();

//       toastr = $injector.get('toastrFactory');
//       timeout = $injector.get('$timeout');
//       element = {
//         focus: jasmine.createSpy(),
//       };
//       spyOn(angular, 'element').and.returnValue(element);
//       scope.currencyTypes = staticData.CurrencyTypes;
//     }));

//     //#endregion

//     //controller object should exists
//     it('should exist', function () {
//       expect(ctrl).not.toBeNull();
//     });

//     //initial values of scope should be set
//     it('should set default values', function () {});

//     //test suite for get payment types function
//     describe('getPaymentTypes function ->', function () {
//       // should call paymentTypeService.get function
//       it('should call paymentTypeService.get', function () {
//         ctrl.getPaymentTypes();
//         expect(paymentTypeService.get).toHaveBeenCalled();
//       });
//     });

//     describe('authViewAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the view amfa', function () {
//         var result = ctrl.authViewAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-bpmttp-view');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authCreateAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the add amfa', function () {
//         var result = ctrl.authCreateAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-bpmttp-add');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authEditAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the edit amfa', function () {
//         var result = ctrl.authEditAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-bpmttp-edit');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authDeleteAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the delete amfa', function () {
//         var result = ctrl.authDeleteAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-bpmttp-delete');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authAccess ->', function () {
//       beforeEach(function () {
//         ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);
//         ctrl.authCreateAccess = jasmine.createSpy().and.returnValue(true);
//         ctrl.authEditAccess = jasmine.createSpy().and.returnValue(true);
//         ctrl.authDeleteAccess = jasmine.createSpy().and.returnValue(true);
//       });

//       it('should navigate away from the page when the user is not authorized to be on this page', function () {
//         ctrl.authAccess();

//         expect(scope.hasViewAccess).toEqual(false);
//         expect(scope.hasCreateAccess).toEqual(true);
//         expect(scope.hasEditAccess).toEqual(true);
//         expect(scope.hasDeleteAccess).toEqual(true);

//         expect(_$location_.path).toHaveBeenCalledWith('/');
//       });
//     });
//   });
// });

// TODO : remove this later
// // top level test suite
// describe('AdjustmentTypesController ->', function () {
//   var scope,
//     ctrl,
//     element,
//     timeout,
//     toastrFactory,
//     adjustmentTypesService,
//     rootScope,
//     modalFactory,
//     actualOptions,
//     deferred,
//     routeParams,
//     q,
//     controller;
//   var mockAdjustmentTypesList = [
//     {
//       AdjustmentTypeId: 'e18dd181-9e6c-4707-8eb7-fa9cae6c653d',
//       Description: 'Billing Charge',
//       IsActive: true,
//       IsPositive: true,
//       IsSystemType: true,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:44:54.5397849+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A44%3A54.5397849Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:44:23Z',
//     },
//     {
//       AdjustmentTypeId: '2c1c5666-7a84-49e3-9f24-26927ed1f0db',
//       Description: 'Finance Charge',
//       IsActive: true,
//       IsPositive: true,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
//       IsDefaultTypeOnBenefitPlan: true,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:45:00.4851606+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A45%3A00.4851606Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:44:32Z',
//     },
//     {
//       AdjustmentTypeId: 'ecae78ec-4278-4287-8728-21b6e861066e',
//       Description: 'Negative Adjustment 1',
//       IsActive: true,
//       IsPositive: false,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: true,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:55:24.3365128+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A24.3365128Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:55:22.9189097Z',
//     },
//     {
//       AdjustmentTypeId: 'f5e5dc20-ce71-4a5c-8bb6-ada9fa053e60',
//       Description: 'Negative Adjustment 2',
//       IsActive: true,
//       IsPositive: false,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: true,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:55:31.5904456+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A31.5904456Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:55:30.4858203Z',
//     },
//     {
//       AdjustmentTypeId: '607093a1-2f1c-432f-aeac-b6e8fe67094d',
//       Description: 'Negative Adjustment 3',
//       IsActive: false,
//       IsPositive: false,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:55:48.1595729+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A48.1595729Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:55:46.8804392Z',
//     },
//     {
//       AdjustmentTypeId: '8d9f7bb2-7a63-4c84-afbc-5b7a7acea977',
//       Description: 'Negative Adjustment 4',
//       IsActive: true,
//       IsPositive: false,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:55:54.9014411+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A54.9014411Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:55:53.7132868Z',
//     },
//     {
//       AdjustmentTypeId: '3a0af9b3-4db7-4e22-bc40-8a776dca0bb3',
//       Description: 'Negative Adjustment 5',
//       IsActive: false,
//       IsPositive: false,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:56:08.2131486+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A56%3A08.2131486Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:56:07.0064726Z',
//     },
//     {
//       AdjustmentTypeId: 'cf6f778a-4032-45a0-a7c1-bfce7d000ea6',
//       Description: 'Positive Adjustment 1',
//       IsActive: true,
//       IsPositive: true,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:54:05.3623682+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A54%3A05.3623682Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:54:03.971992Z',
//     },
//     {
//       AdjustmentTypeId: '01afdfd9-d397-4ad1-8e28-934a31db42ff',
//       Description: 'Positive Adjustment 2',
//       IsActive: true,
//       IsPositive: true,
//       IsSystemType: false,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
//       DataTag:
//         '{"Timestamp":"2015-09-29T14:54:15.8437152+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A54%3A15.8437152Z\'\\""}',
//       UserModified: '00000000-0000-0000-0000-000000000000',
//       DateModified: '2015-09-29T14:54:14.6887081Z',
//     },
//   ];

//   function createController() {
//     ctrl = controller('AdjustmentTypesController', {
//       $scope: scope,
//       toastrFactory: toastrFactory,
//       AdjustmentTypesService: adjustmentTypesService,
//       $rootScope: rootScope,
//       ModalFactory: modalFactory,
//       $routeParams: routeParams,
//     });
//   }

//   //#region before each
//   beforeEach(module('Soar.Common'));
//   beforeEach(module('common.factories'));
//   beforeEach(module('Soar.BusinessCenter'));
//   //#endregion

//   //controller test suite
//   describe('AdjustmentTypesController controller ->', function () {
//     //#region before each
//     beforeEach(inject(function (
//       $rootScope,
//       $controller,
//       $q,
//       _$filter_,
//       $injector
//     ) {
//       scope = $rootScope.$new();
//       rootScope = $rootScope.$new();
//       controller = $controller;

//       q = $q;
//       adjustmentTypesService = {
//         GetAllAdjustmentTypesWithOutCheckTransactions: jasmine
//           .createSpy()
//           .and.returnValue({ Value: mockAdjustmentTypesList }),
//         deleteAdjustmentTypeById: jasmine.createSpy(),
//         GetAdjustmentTypeAssociatedWithTransactions: jasmine.createSpy(),
//       };

//       //modalFactory mock
//       modalFactory = {
//         Modal: jasmine
//           .createSpy('modalFactory.Modal')
//           .and.callFake(function (options) {
//             actualOptions = options;
//             deferred = q.defer();
//             deferred.resolve('some value in return');
//             return { result: deferred.promise };
//           }),
//         ConfirmModal: jasmine
//           .createSpy('modalFactory.ConfirmModal')
//           .and.callFake(function (options) {
//             actualOptions = options;
//             deferred = q.defer();
//             deferred.resolve('some value in return');
//             return {
//               result: deferred.promise,
//               then: function () {},
//             };
//           }),
//         LoadingModal: jasmine
//           .createSpy('modalFactory.LoadingModal')
//           .and.callFake(function () {
//             deferred = q.defer();
//             deferred.resolve(1);
//             return {
//               result: deferred.promise,
//               then: function () {},
//             };
//           }),
//       };
//       routeParams = {
//         subcategory: 'AdjustmentTypes',
//       };
//       //mock for toaster functionality
//       toastrFactory = {
//         success: jasmine.createSpy(),
//         error: jasmine.createSpy(),
//       };

//       createController();

//       $rootScope.$apply();

//       timeout = $injector.get('$timeout');
//       element = {
//         focus: jasmine.createSpy(),
//       };
//       spyOn(angular, 'element').and.returnValue(element);
//     }));

//     //#endregion

//     //controller object should exists
//     it('should exist', function () {
//       expect(ctrl).not.toBeNull();
//     });

//     //initial values of scope should be set
//     it('should set default values', function () {
//       expect(scope.editMode).toBe(false);
//       expect(scope.deletingType).toBe(false);
//       expect(scope.adjustmentTypes).toEqual([]);
//     });

//     // if 'AdjustmentTypes' string is provided in route parameter then showBackButton property should be set to true
//     it('should set showBackButton to true if subcategory route parameter is AdjustmentTypes', function () {
//       expect(scope.showBackButton).toBe(true);
//     });

//     // if 'AdjustmentTypes' string is not provided in route parameter then showBackButton property should be set to false
//     describe('showBackButton property ->', function () {
//       beforeEach(function () {
//         routeParams = {
//           subcategory: '',
//         };

//         createController();
//       });

//       // if 'AdjustmentTypes' string is not provided in route parameter then showBackButton property should be set to false
//       it('should set showBackButton to false if subcategory route parameter is not a "AdjustmentTypes"', function () {
//         expect(scope.showBackButton).toBe(false);
//       });
//     });

//     //test suite for controller to create a new adjustment type function
//     describe('createType function ->', function () {
//       // should set all scope properties after creating a new adjustment type
//       it('should set scope properties', function () {
//         scope.serviceTypeId = '00000000-0000-0000-0000-000000000001';
//         scope.editMode = false;
//         scope.createType();
//         expect(scope.adjustmentTypeId).toBe('');
//         expect(scope.editMode).toBe(true);
//         expect(angular.element('#inpDescription').focus).not.toHaveBeenCalled();
//         timeout.flush(100);
//         expect(angular.element('#inpDescription').focus).toHaveBeenCalled();
//       });
//     });

//     //test suite for controller to edit an existing adjustment type function
//     describe('editType function ->', function () {
//       // should set all scope properties after updating an existing adjustment type
//       it('should set scope properties', function () {
//         scope.editMode = false;
//         scope.editType({
//           AdjustmentTypeId: '00000000-0000-0000-0000-000000000001',
//           IsSystemType: false,
//           IsAssociatedWithServiceCode: false,
//           Description: 'Service1',
//         });
//         expect(scope.adjustmentTypeId).toBe(
//           '00000000-0000-0000-0000-000000000001'
//         );
//         expect(scope.editMode).toBe(true);
//       });
//     });

//     //test suite for go back to setting page
//     describe('goToSettings function ->', function () {
//       // should broadcast an event called "soar:go-back-options" after calling goToSettings function
//       it('should broadcast an event called "soar:go-back-options"', function () {
//         scope.$on('soar:go-back-options');
//         scope.goToSettings();
//       });
//     });

//     //test suite for get adjustment types success function
//     describe('adjustmentTypesGetSuccess function ->', function () {
//       // should set all adjustment types in scope
//       it('should set scope property', function () {
//         scope.loadingAdjustmentTypes = true;
//         scope.adjustmentTypes = [];
//         ctrl.adjustmentTypesGetSuccess({ Value: mockAdjustmentTypesList });
//         expect(scope.adjustmentTypes).toEqual(mockAdjustmentTypesList);
//       });
//     });

//     //test suite for get servadjustment types failure function
//     describe('adjustmentTypesGetFailure function ->', function () {
//       // should set scope properties after calling adjustment type get failure function
//       it('should set scope properties', function () {
//         scope.loadingAdjustmentTypes = true;
//         scope.adjustmentTypes = mockAdjustmentTypesList;
//         ctrl.adjustmentTypesGetFailure();
//         expect(scope.adjustmentTypes).toEqual([]);
//       });
//     });

//     //test suite for get adjustment types function
//     describe('getAdjustmentTypes function ->', function () {
//       // should call serviceTypeService.get function
//       it('should call adjustmentTypeService.get', function () {
//         ctrl.getAdjustmentTypes();
//         expect(
//           adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions
//         ).toHaveBeenCalled();
//       });
//     });

//     //test suite for validate edit function
//     describe('validateEdit function ->', function () {
//       // should set scope properties after calling validate edit function
//       it('should set scope properties', function () {
//         spyOn(scope, 'editType');
//         scope.validateEdit(mockAdjustmentTypesList[0]);
//         expect(
//           adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions
//         ).toHaveBeenCalled();
//       });
//     });
//     // test suite for validate delete function
//     describe('validateDelete function ->', function () {
//       // should set scope properties after calling validate delete function
//       it('should set scope properties', function () {
//         scope.validateDelete(mockAdjustmentTypesList[0]);
//         timeout.flush(300);

//         expect(scope.typeToDelete).toEqual(mockAdjustmentTypesList[0]);
//         expect(scope.deletingType).toBe(true);
//       });
//     });

//     //test suite for delete confirmation
//     describe('confirmDelete function -> ', function () {
//       it('should show confirmation modal if adjustment type is associated with any transaction', function () {
//         scope.typeToDelete = {
//           IsAdjustmentTypeAssociatedWithTransactions: true,
//         };
//         ctrl.confirmDelete(
//           scope.typeToDelete.IsAdjustmentTypeAssociatedWithTransactions
//         );

//         expect(modalFactory.ConfirmModal).toHaveBeenCalled();
//       });
//     });

//     // test suite for delete a adjustment type
//     describe('deleteType function -> ', function () {
//       // should call adjustmentTypesService.deleteAdjustmentTypeById
//       it('should call adjustmentTypesService.deleteAdjustmentTypeById ', function () {
//         scope.typeToDelete = angular.copy(mockAdjustmentTypesList[0]);
//         scope.deleteType();

//         expect(modalFactory.LoadingModal).toHaveBeenCalled();
//       });

//       // should set scope properties after calling delete adjustment type function
//       it('should set scope properties', function () {
//         scope.typeToDelete = angular.copy(mockAdjustmentTypesList[0]);
//         scope.deleteType();

//         expect(scope.deletingType).toBe(true);
//       });
//     });

//     describe('adjustmentTypeDeleteCallSetup  -> ', function () {
//       it('should return delete service instance', function () {
//         scope.typeToDelete = angular.copy(mockAdjustmentTypesList[0]);
//         var result = ctrl.adjustmentTypeDeleteCallSetup();
//         expect(result).not.toBe(null);
//       });
//     });

//     //  test suite for deleting a adjustment type
//     describe('deleteTypeSuccess function ->', function () {
//       // should remove deleted adjustment type from the list of adjustment types
//       it('should remove adjustment type from the list of adjustment types', function () {
//         scope.adjustmentTypes = angular.copy(mockAdjustmentTypesList);
//         scope.typeToDelete = mockAdjustmentTypesList[1];
//         ctrl.deleteTypeSuccess();

//         expect(scope.typeToDelete).toEqual({});
//         expect(scope.deletingType).toBe(false);
//       });

//       // should call toastrFactory.success after successful deletion
//       it('should call toastrFactory.success', function () {
//         scope.typeToDelete = mockAdjustmentTypesList[1];
//         ctrl.deleteTypeSuccess();

//         expect(toastrFactory.success).toHaveBeenCalled();
//       });
//     });

//     // test suite for delete service type failure function
//     describe('deleteTypeFailure function ->', function () {
//       // should call toastrFactory.error and set scope properties after delete failure
//       it('should call toastrFactory.error and set scope properties', function () {
//         scope.deletingType = true;
//         var responce = {
//           data: {
//             InvalidProperties: [
//               {
//                 ValidationMessage:
//                   'This entity cannot be deleted because it is being referenced by one or more',
//               },
//             ],
//           },
//         };
//         ctrl.deleteTypeFailure(responce);

//         expect(toastrFactory.error).toHaveBeenCalled();
//         expect(scope.deletingType).toBe(false);
//         expect(scope.typeToDelete).toEqual({});
//       });
//     });
//     //test suite for cancel of delete of service type
//     describe('cancelDelete function ->', function () {
//       // should set scope properties afetr cancel deletiing service type
//       it('should set scope properties', function () {
//         scope.cancelDelete();

//         expect(scope.typeToDelete).toEqual({});
//       });
//     });

//     describe('authViewAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the view amfa', function () {
//         var result = ctrl.authViewAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-badjtp-view');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authCreateAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the add amfa', function () {
//         var result = ctrl.authCreateAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-badjtp-add');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authEditAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the edit amfa', function () {
//         var result = ctrl.authEditAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-badjtp-edit');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authDeleteAccess ->', function () {
//       it('should call patSecurityService.IsAuthorizedByAbbreviation with the delete amfa', function () {
//         var result = ctrl.authDeleteAccess();

//         expect(
//           _authPatSecurityService_.isAmfaAuthorizedByName
//         ).toHaveBeenCalledWith('soar-biz-badjtp-delete');
//         expect(result).toEqual(true);
//       });
//     });

//     describe('authAccess ->', function () {
//       beforeEach(function () {
//         ctrl.authViewAccess = jasmine.createSpy().and.returnValue(true);
//         ctrl.authCreateAccess = jasmine.createSpy().and.returnValue(true);
//         ctrl.authEditAccess = jasmine.createSpy().and.returnValue(true);
//         ctrl.authDeleteAccess = jasmine.createSpy().and.returnValue(true);
//       });

//       it('should navigate away from the page when the user is not authorized to be on this page', function () {
//         ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);

//         ctrl.authAccess();

//         expect(scope.hasViewAccess).toEqual(false);
//         expect(scope.hasCreateAccess).toEqual(true);
//         expect(scope.hasEditAccess).toEqual(true);
//         expect(scope.hasDeleteAccess).toEqual(true);

//         expect(_$location_.path).toHaveBeenCalledWith('/');
//       });

//       it('should navigate away from the page when the user is not authorized to be on this page', function () {
//         ctrl.authCreateAccess = jasmine.createSpy().and.returnValue(false);
//         scope.editMode = false;

//         ctrl.authAccess();

//         expect(scope.hasViewAccess).toEqual(true);
//         expect(scope.hasCreateAccess).toEqual(false);
//         expect(scope.hasEditAccess).toEqual(true);
//         expect(scope.hasDeleteAccess).toEqual(true);

//         expect(_$location_.path).toHaveBeenCalledWith('/');
//       });

//       it('should navigate away from the page when the user is not authorized to be on this page', function () {
//         ctrl.authEditAccess = jasmine.createSpy().and.returnValue(false);
//         scope.editMode = true;

//         ctrl.authAccess();

//         expect(scope.hasViewAccess).toEqual(true);
//         expect(scope.hasCreateAccess).toEqual(true);
//         expect(scope.hasEditAccess).toEqual(false);
//         expect(scope.hasDeleteAccess).toEqual(true);

//         expect(_$location_.path).toHaveBeenCalledWith('/');
//       });

//       it('should navigate away from the page when the user is not authorized to be on this page', function () {
//         ctrl.authDeleteAccess = jasmine.createSpy().and.returnValue(false);
//         scope.deletingType = true;

//         ctrl.authAccess();

//         expect(scope.hasViewAccess).toEqual(true);
//         expect(scope.hasCreateAccess).toEqual(true);
//         expect(scope.hasEditAccess).toEqual(true);
//         expect(scope.hasDeleteAccess).toEqual(false);

//         expect(_$location_.path).toHaveBeenCalledWith('/');
//       });
//     });
//   });
// });

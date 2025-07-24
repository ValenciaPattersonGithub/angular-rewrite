// TODO : remove this later
// // top level test suite
// describe('AdjustmentTypeCrudController ->', function () {
//   var scope,
//     ctrl,
//     toastrFactory,
//     data,
//     element,
//     compile,
//     listHelper,
//     adjustmentTypesService,
//     modalFactory,
//     q,
//     actualOptions,
//     deferred,
//     staticData,
//     timeout,
//     controller;
//   var modalFactoryDeferred;
//   var mockAdjustmentType = {
//     AdjustmentTypeId: 'e18dd181-9e6c-4707-8eb7-fa9cae6c653d',
//     Description: 'Billing Charge',
//     IsActive: true,
//     IsPositive: true,
//     ImpactType: 3,
//     IsSystemType: true,
//     IsAdjustmentTypeAssociatedWithTransactions: false,
//     DataTag:
//       '{"Timestamp":"2015-09-29T14:44:54.5397849+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A44%3A54.5397849Z\'\\""}',
//     UserModified: '00000000-0000-0000-0000-000000000000',
//     DateModified: '2015-09-29T14:44:23Z',
//   };
//   var mockEmptyAdjustmentType = {
//     AdjustmentTypeId: null,
//     IsSystemType: false,
//     Description: '',
//     IsActive: true,
//     IsPositive: null,
//     ImpactType: 3,
//     IsAdjustmentTypeAssociatedWithTransactions: false,
//     IsDefaultTypeOnBenefitPlan: false,
//   };
//   var mockNewAdjustmentType = {
//     AdjustmentTypeId: null,
//     Description: 'Type New',
//     IsActive: false,
//     IsPositive: false,
//     IsSystemType: false,
//     IsAdjustmentTypeAssociatedWithTransactions: false,
//   };
//   var mockAdjustmentTypeList = [
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
//       IsSystemType: true,
//       IsAdjustmentTypeAssociatedWithTransactions: false,
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
//     ctrl = controller('AdjustmentTypeCrudController', {
//       $scope: scope,
//       toastrFactory: toastrFactory,
//       ListHelper: listHelper,
//       ModalFactory: modalFactory,
//       AdjustmentTypesService: adjustmentTypesService,
//       StaticData: staticData,
//     });
//   }

//   var loadHtml = function () {
//     element = angular.element(
//       '<form name="frmAdjustmentTypeCrud" role="form" novalidate>' +
//         '<div ng-class="{error:hasErrors && !frmAdjustmentTypeCrud.inpDescription.$error.uniqueDescription}">' +
//         '<input id="inpDescription" name="inpDescription" class="required valid master-list-input" set-focus ng-model="serviceType.Description" maxlength="64" required />' +
//         '</div>' +
//         '<label id="lblDescriptionRequired" class="help-text " ng-show="hasErrors && !frmAdjustmentTypeCrud.inpDescription.$valid && frmAdjustmentTypeCrud.$error.required">' +
//         "{{ 'This field is required.' | i18n }}" +
//         '</label>' +
//         '<label id="lblUniqueDescription" class="help-text " ng-show="hasErrors && frmAdjustmentTypeCrud.inpDescription.$error.uniqueDescription">' +
//         "{{ 'Service Type must be unique.' | i18n }}" +
//         '</label>' +
//         '</form>'
//     );

//     // use compile to render the html
//     compile(element)(scope);
//     scope = element.isolateScope() || element.scope();
//     scope.$digest();
//   };

//   //#region before each
//   beforeEach(module('Soar.Common'));
//   beforeEach(module('common.factories'));
//   beforeEach(module('Soar.BusinessCenter'));

//   //#endregion

//   //controller test suite when type is not set
//   describe('controller - >', function () {
//     //#region before each
//     beforeEach(inject(function (
//       $rootScope,
//       $injector,
//       $controller,
//       $location,
//       $compile,
//       $q
//     ) {
//       timeout = $injector.get('$timeout');
//       data = {
//         value: jasmine.createSpy(),
//         text: jasmine.createSpy(),
//         select: jasmine.createSpy(),
//         focus: jasmine.createSpy(),
//       };
//       element = {
//         data: jasmine.createSpy().and.returnValue(data),
//         focus: jasmine.createSpy(),
//         prop: jasmine.createSpy(),
//         isolateScope: jasmine.createSpy().and.returnValue(scope),
//         scope: jasmine.createSpy().and.returnValue(scope),
//       };
//       spyOn(angular, 'element').and.returnValue(element);

//       compile = $compile;
//       timeout = $injector.get('$timeout');
//       scope = $rootScope.$new();
//       controller = $controller;
//       q = $q;
//       //mock for toaster functionality
//       toastrFactory = {
//         success: jasmine.createSpy(),
//         error: jasmine.createSpy(),
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
//             modalFactoryDeferred = q.defer();
//             modalFactoryDeferred.resolve(1);
//             return {
//               result: modalFactoryDeferred.promise,
//               then: function () {},
//             };
//           }),
//         WarningModal: jasmine
//           .createSpy('modalFactory.WarningModal')
//           .and.callFake(function () {
//             modalFactoryDeferred = q.defer();
//             modalFactoryDeferred.resolve(1);
//             return {
//               result: modalFactoryDeferred.promise,
//               then: function () {},
//             };
//           }),
//       };
//       //mock for listHelper service
//       listHelper = {
//         findItemByFieldValue: jasmine
//           .createSpy('listHelper.findItemByFieldValue')
//           .and.returnValue(0),
//         findIndexByFieldValue: jasmine
//           .createSpy('listHelper.findIndexByFieldValue')
//           .and.returnValue(0),
//         findItemByFieldValueIgnoreCase: jasmine
//           .createSpy('listHelper.findItemByFieldValue')
//           .and.returnValue(0),
//       };
//       adjustmentTypesService = {
//         update: jasmine
//           .createSpy()
//           .and.returnValue({ Value: mockAdjustmentType }),
//         save: jasmine
//           .createSpy()
//           .and.returnValue({ Value: mockAdjustmentType }),
//       };
//       createController();
//     }));

//     //#endregion

//     //controller object should exists
//     it('should exist', function () {
//       expect(ctrl).not.toBeNull();
//       expect(ctrl).not.toBeUndefined();
//     });

//     //initial values of scope should be set
//     it('should set default values', function () {
//       expect(scope.typeId).toBeUndefined();
//       expect(scope.types).toBeUndefined();
//       expect(scope.hasErrors).toBe(false);
//       expect(scope.descriptionIsDuplicate).toBe(false);
//       expect(scope.editing).toBe(false);
//       expect(scope.formIsValid).toBe(true);
//     });

//     //controller test suite for resetVars
//     describe('controller with valid adjustment type', function () {
//       beforeEach(function () {
//         scope.adjustmentTypeId = 1;
//         scope.types = angular.copy(mockAdjustmentType);
//         scope.$apply();
//         spyOn(scope, 'initAdjustmentType');
//       });

//       //editing flag should be true when typeId is set
//       it('editing should be true', function () {
//         ctrl.resetVars();
//         expect(scope.typeId).toBeNull();
//         expect(scope.initAdjustmentType).toHaveBeenCalled();
//       });
//     });

//     //test suite for controller in edit mode with a valid type id
//     describe('in edit mode with a valid typeId', function () {
//       beforeEach(function () {
//         scope.typeId = 1;
//         scope.types = angular.copy(mockAdjustmentType);
//         scope.$apply();
//       });

//       //In edit mode with a valid typeId, should set editing flag to be true
//       it('editing should be true', function () {
//         expect(scope.editing).toBe(true);
//       });
//     });

//     //test suite for discardChanges method
//     describe('discardChanges  ->', function () {
//       //confirmingDiscard should be false
//       it('should assign null to confirmingDiscard', function () {
//         scope.discardChanges();
//         expect(scope.confirmingDiscard).toBeFalsy();
//       });
//     });

//     //test suite for initAdjustmentType method
//     describe('initAdjustmentType ->', function () {
//       //initAdjustmentType should assign a new adjustment type to adjustmentType
//       it('should assign a new adjustment type to adjustmentType', function () {
//         scope.initAdjustmentType();
//         expect(scope.adjustmentType).toEqual(mockEmptyAdjustmentType);
//       });
//     });

//     //test suite for resetVars method
//     describe('resetVars ->', function () {
//       beforeEach(function () {
//         spyOn(scope, 'initAdjustmentType');

//         ctrl.resetVars();
//       });

//       //resetVars should reset typeId, edit, and save flags
//       it('should reset initAdjustmentType, edit, and save flags', function () {
//         expect(scope.typeId).toBeNull();
//         expect(scope.editMode).toBe(false);
//         expect(scope.editing).toBe(false);
//         expect(scope.hasErrors).toBe(false);
//         expect(scope.descriptionIsDuplicate).toBe(false);
//       });

//       //resetVars should call initAdjustmentType method
//       it('should call initAdjustmentType', function () {
//         expect(scope.initAdjustmentType).toHaveBeenCalled();
//       });
//     });

//     //test suite for type id watch statement
//     describe('adjustmentTypeId watch statement ->', function () {
//       beforeEach(function () {
//         spyOn(ctrl, 'getAdjustmentTypes');

//         scope.typeId = 1;
//         scope.$apply();
//       });

//       //typeId watch statement should call getAdjustmentTypes when a new value is set
//       it('should call getAdjustmentTypes when a new value is set', function () {
//         expect(ctrl.getAdjustmentTypes).toHaveBeenCalled();
//       });
//     });

//     //test suite for getAdjustmentTypes method
//     describe('getAdjustmentTypes ->', function () {
//       beforeEach(function () {
//         scope.types = angular.copy(mockAdjustmentTypeList);
//         scope.typeId = 1;
//         scope.editing = false;
//         scope.adjustmentType = null;
//         ctrl.getAdjustmentTypes();
//       });

//       //getAdjustmentTypes should set editing to true
//       it('should set editing to true', function () {
//         expect(scope.editing).toBe(true);
//       });

//       //getAdjustmentTypes should set adjustment type
//       it('should set adjustment type', function () {
//         expect(scope.adjustmentType).not.toBeNull();
//       });

//       //getAdjustmentTypes should call toatr.error if adjustment type is not set
//       it('should call toatr.error if adjustment type is not set', function () {
//         scope.typeId = -1; // not in the list.
//         ctrl.getAdjustmentTypes();

//         expect(toastrFactory.error).toHaveBeenCalled();
//       });
//     });

//     //test suite for buildInstance method
//     describe('buildInstance ->', function () {
//       beforeEach(function () {
//         ctrl.buildInstance(mockAdjustmentType);
//       });

//       //buildInstance should assign a value to backupAdjustmentType
//       it('should assign a value to backupAdjustmentType', function () {
//         expect(scope.backupAdjustmentType).not.toBeNull();
//         expect(scope.backupAdjustmentType).not.toBeUndefined();
//       });

//       //buildInstance should not set backupAdjustmentType to the parameter instance
//       it('should NOT set backupAdjustmentType to the parameter instance', function () {
//         expect(scope.backupAdjustmentType).not.toBe(mockAdjustmentType);
//       });
//     });

//     //test suite for discardChanges method
//     describe('discardChanges ->', function () {
//       beforeEach(function () {
//         spyOn(ctrl, 'resetVars');

//         scope.types = mockAdjustmentTypeList;

//         scope.discardChanges();
//       });

//       //discardChanges should reset variables to their default state
//       it('should reset variables to their default state', function () {
//         expect(scope.confirmingDiscard).toBe(false);
//       });

//       //discardChanges should call resetVars method
//       it('should call resetVars', function () {
//         expect(ctrl.resetVars).toHaveBeenCalled();
//       });
//     });

//     //test suite for confirmDiscard method
//     describe('confirmDiscard function -> ', function () {
//       //confirmDiscard should set scope property
//       it('should set scope property', function () {
//         scope.confirmDiscard();

//         expect(scope.confirmingDiscard).toBe(true);
//       });
//     });

//     //test suite for cancelDiscard method
//     describe('cancelDiscard function -> ', function () {
//       //cancelDiscard should set scope property
//       it('should set scope property', function () {
//         scope.cancelDiscard();

//         expect(scope.confirmingDiscard).toBe(false);
//       });
//     });

//     //test suite for validateForm method
//     describe('validateForm ->', function () {
//       beforeEach(function () {
//         spyOn(scope, 'checkForDuplicates');
//       });

//       //test suite for validateForm if new value is not defined
//       describe('if new value is NOT defined,', function () {
//         beforeEach(function () {
//           ctrl.validateForm();
//         });

//         //validateForm should flag the form as invalid if new value is not defined
//         it('should flag the form as invalid', function () {
//           expect(scope.formIsValid).toBe(false);
//         });
//       });

//       //test suite for validateForm if new value is defined but matches the old value
//       describe('if currency type not selected for adjustment type,', function () {
//         beforeEach(function () {
//           scope.adjustmentType = {
//             Description: 'Test Desc',
//             CurrencyTypeId: null,
//           };
//           ctrl.validateForm();
//         });

//         //validateForm should flag the form as invalid if new value is already exists
//         it('should flag the form as invalid', function () {
//           expect(scope.formIsValid).toBe(false);
//           expect(scope.hasErrors).toBe(true);
//         });

//         //validateForm should flag the form as valid if new value is defined but matches the old value
//         it('should flag the form as valid', function () {
//           scope.adjustmentType = angular.copy(mockAdjustmentType);
//           ctrl.validateForm();
//           expect(scope.formIsValid).toBe(true);
//         });
//       });
//     });

//     //test suite for clearLocalStorage
//     describe('clearLocalStorage   ->', function () {
//       beforeEach(function () {
//         scope.adjustmentType = angular.copy(mockAdjustmentType);
//         scope.$apply();
//       });

//       //adjustmentType watch statement should call validateForm method when triggered
//       it('should call validateForm when triggered', function () {
//         localStorage.getItem = jasmine.createSpy().and.returnValue(1);
//         spyOn(localStorage, 'removeItem');
//         scope.clearLocalStorage();
//         expect(localStorage.getItem).toHaveBeenCalled();
//         expect(localStorage.removeItem).toHaveBeenCalled();
//       });
//     });

//     //test suite for saveType method
//     describe('saveType ->', function () {
//       //test suite for saveType if the form has errors
//       describe('if the form has errors,', function () {
//         beforeEach(function () {
//           scope.formIsValid = false;
//           spyOn(ctrl, 'validateForm');
//           scope.hasErrors = true;
//           scope.saveType();
//         });

//         //saveType should set the saving flag to false if the form has errors
//         it('should set the saving flag to false', function () {
//           timeout.flush(500);
//           expect(scope.savingType).toBe(false);
//         });
//       });

//       //test suite for saveType if the form does not have errors
//       describe('if the form does NOT have errors', function () {
//         beforeEach(function () {
//           scope.formIsValid = true;
//           scope.associatedAdjustment = {};
//           scope.associatedAdjustment.IsActive = true;
//           scope.associatedAdjustment.IsPositive = false;
//           scope.associatedAdjustment.Description = 'xyz';
//           scope.associatedAdjustment.ImpactType = 3;
//         });

//         //test suite for saveType if the form does not have errors and we are creating a new adjustment type
//         describe('and we are creating a new adjustment type,', function () {
//           beforeEach(function () {
//             scope.editing = true;
//             spyOn(ctrl, 'validateForm');
//             ctrl.existingAdjustmentType = angular.copy(scope.adjustmentType);
//             ctrl.existingAdjustmentType.IsUsedInCreditTransactions = false;
//             scope.saveType();
//           });

//           //saveType should call the save service function if the form does not have errors and we are creating a new adjustment type
//           it('should call the save service function', function () {
//             expect(modalFactory.LoadingModal).toHaveBeenCalled();
//           });
//         });

//         //test suite for saveType if the form does not have errors and we are editing an existing adjustment type
//         describe('and we are editing an existing adjustment type', function () {
//           beforeEach(function () {
//             scope.editing = true;
//             spyOn(ctrl, 'validateForm');
//           });

//           //saveType should set the saving flag to true if the form does not have errors and we are editing an existing adjustment type
//           it('should set the saving flag to true', function () {
//             ctrl.existingAdjustmentType = angular.copy(scope.adjustmentType);
//             scope.saveType();
//             expect(scope.savingType).toBe(true);
//           });

//           //saveType show model when soem changes made in already existing adjustment type
//           it('should set the saving flag to true', function () {
//             ctrl.existingAdjustmentType = angular.copy(scope.adjustmentType);
//             scope.adjustmentType = angular.copy(scope.adjustmentType);
//             scope.adjustmentType.Description = 'update desc';
//             scope.editing = true;
//             ctrl.existingAdjustmentType.IsUsedInCreditTransactions = true;
//             ctrl.existingAdjustmentType.Description = 'mnop';

//             scope.saveType();
//             expect(ctrl.reloadBackUpValues).not.toBeNull();
//           });

//           //test suite for saveType if the form does not have errors and we are editing an existing adjustment type and changes were made
//           describe('and changes were made', function () {
//             beforeEach(function () {
//               scope.editing = true;
//               ctrl.existingAdjustmentType = angular.copy(scope.adjustmentType);
//               scope.saveType();
//             });

//             //saveType should call the update service function if the form does not have errors and we are editing an existing adjustment type and changes were made
//             it('should call the update service function', function () {
//               expect(modalFactory.LoadingModal).toHaveBeenCalled();
//             });
//           });

//           //test suite for saveType if the form does not have errors and we are editing an existing adjustment type and changes were made
//           describe('and changes were made to ImpactType', function () {
//             beforeEach(function () {
//               scope.editing = true;
//               ctrl.existingAdjustmentType = angular.copy(scope.adjustmentType);
//               scope.saveType();
//             });

//             //saveType should call the update service function if the form does not have errors and we are editing an existing adjustment type and changes were made
//             it('should call the update service function', function () {
//               expect(modalFactory.LoadingModal).toHaveBeenCalled();
//             });

//             //saveType should call the update service function if the form does not have errors and we are editing an existing adjustment type and changes were made to ImpactType
//             it('should call the update service function', function () {
//               scope.adjustmentType.ImpactType = 1;
//               scope.saveType();
//               expect(modalFactory.ConfirmModal).toHaveBeenCalled();
//             });
//           });
//           //test suite for saveType if the form does not have errors and we are editing an existing adjustment type and changes were made
//           describe('and changes were made', function () {
//             beforeEach(function () {
//               scope.editing = false;
//               ctrl.existingAdjustmentType = angular.copy(scope.adjustmentType);
//               scope.saveType();
//             });

//             //saveType should call the update service function if the form does not have errors and we are editing an existing adjustment type and changes were made
//             it('should call the update service function', function () {
//               expect(modalFactory.LoadingModal).toHaveBeenCalled();
//             });
//           });

//           describe('adjustmentTypeUpdateCallSetup  -> ', function () {
//             it('should return update service instance', function () {
//               var result = ctrl.adjustmentTypeUpdateCallSetup();
//               expect(result).not.toBe(null);
//             });
//           });

//           describe('adjustmentTypeAddCallSetup  -> ', function () {
//             it('should return add service instance', function () {
//               var result = ctrl.adjustmentTypeAddCallSetup();
//               expect(result).not.toBe(null);
//             });
//           });

//           //test suite for adjustmentTypeIsActiveOnChange  method when scope.adjustmentType.IsActive is false
//           describe('adjustmentTypeIsActiveOnChange   -> ', function () {
//             beforeEach(function () {
//               scope.adjustmentType = angular.copy(mockAdjustmentType);
//               scope.adjustmentType.IsActive = false;
//               scope.$apply();
//             });

//             //adjustmentTypeIsActiveOnChange  should set the displayActiveStatusConfirmation to true
//             it('should set displayActiveStatusConfirmation  to true', function () {
//               scope.adjustmentTypeIsActiveOnChange();
//               timeout.flush(999);
//               expect(scope.displayActiveStatusConfirmation).toBe(true);
//             });
//           });

//           //test suite for adjustmentTypeIsActiveOnChange method when scope.adjustmentType.IsActive is true
//           describe('adjustmentTypeIsActiveOnChange   -> ', function () {
//             beforeEach(function () {
//               scope.adjustmentType = angular.copy(mockAdjustmentType);
//               scope.adjustmentType.IsActive = true;
//               scope.$apply();
//             });

//             //adjustmentTypeIsActiveOnChange  should set the displayActiveStatusConfirmation to false
//             it('should set displayActiveStatusConfirmation  to false', function () {
//               scope.adjustmentTypeIsActiveOnChange();
//               timeout.flush(999);
//               expect(scope.displayActiveStatusConfirmation).toBe(false);
//             });
//           });
//           //test suite for cancelStatusConfirmation
//           describe('cancelStatusConfirmation   ->', function () {
//             beforeEach(function () {
//               scope.adjustmentType = angular.copy(mockAdjustmentType);
//               scope.$apply();
//             });

//             //adjustmentType watch statement should call validateForm method when triggered
//             it('should set adjustmentType.IsActive to true', function () {
//               scope.cancelStatusConfirmation();
//               timeout.flush(999);
//               expect(scope.displayActiveStatusConfirmation).toBeFalsy();
//             });
//           });

//           //test suite for okStatusConfirmation method
//           describe('okStatusConfirmation  -> ', function () {
//             beforeEach(function () {
//               scope.types = angular.copy(mockAdjustmentTypeList);
//               // loadHtml();
//               scope.displayActiveStatusConfirmation = true;
//               scope.adjustmentType = angular.copy(mockAdjustmentType);
//               scope.adjustmentType.IsActive = false;
//               scope.$apply();
//             });

//             //okStatusConfirmation should set the adjustmentType.IsActive to false
//             it('should set the adjustmentType.IsActive to true and displayActiveStatusConfirmation  to false', function () {
//               scope.okStatusConfirmation();
//               timeout.flush(999);
//               expect(scope.adjustmentType.IsActive).toBe(false);
//               expect(scope.displayActiveStatusConfirmation).toBe(false);
//             });
//           });
//         });
//       });
//     });

//     //test suite for createTypeSuccessful method
//     describe('createTypeSuccessful -> ', function () {
//       beforeEach(function () {
//         scope.types = [];
//         spyOn(ctrl, 'resetVars');

//         ctrl.createTypeSuccessful({ Value: angular.copy(mockAdjustmentType) });
//       });

//       //createTypeSuccessful should call toastrFactory.success
//       it('should call toastrFactory.success', function () {
//         expect(toastrFactory.success).toHaveBeenCalled();
//       });

//       //createTypeSuccessful should add value to source list
//       it('should add value to source list', function () {
//         expect(scope.types.length).toBe(1);
//         var expectedVal = _.merge(mockAdjustmentType, {
//           Category: mockAdjustmentType.IsPositive
//             ? 'Positive (+)'
//             : 'Negative (-)',
//         });
//         expect(scope.types[0]).toEqual(expectedVal);
//       });

//       //createTypeSuccessful should set scope property
//       it('should set scope property', function () {
//         expect(scope.savingType).toBe(false);
//       });

//       //createTypeSuccessful should call resetVars
//       it('should call resetVars', function () {
//         expect(ctrl.resetVars).toHaveBeenCalled();
//       });
//     });

//     //test suite for createTypeFailed method
//     describe('createTypeFailed -> ', function () {
//       beforeEach(function () {
//         scope.savingType = true;

//         ctrl.createTypeFailed({ Message: 'An Error Occurred' });
//       });

//       //createTypeFailed should call toastrFactory.error
//       it('should call toastrFactory.error', function () {
//         expect(toastrFactory.error).toHaveBeenCalled();
//       });

//       //createTypeFailed should set the saving flag to false
//       it('should set the saving flag to false', function () {
//         expect(scope.savingType).toBe(false);
//       });
//     });

//     //test suite for updateTypeSuccessful method
//     describe('updateTypeSuccessful ->', function () {
//       beforeEach(function () {
//         var existingType = angular.copy(mockAdjustmentType);
//         existingType.Description = 'I am the original descritpion';

//         scope.types = [existingType];
//         spyOn(ctrl, 'resetVars');
//         ctrl.updateTypeSuccessful({ Value: angular.copy(mockAdjustmentType) });
//       });

//       //updateTypeSuccessful should call toastrFactory.success
//       it('should call toastrFactory.success', function () {
//         expect(toastrFactory.success).toHaveBeenCalled();
//       });

//       //updateTypeSuccessful should add value to source list
//       it('should add value to source list', function () {
//         expect(scope.types.length).toBe(1);
//         expect(scope.types[0]).toEqual(mockAdjustmentType);
//       });

//       //updateTypeSuccessful should set scope property
//       it('should set scope property', function () {
//         expect(scope.savingType).toBe(false);
//       });

//       //updateTypeSuccessful should call resetVars method
//       it('should call resetVars', function () {
//         expect(ctrl.resetVars).toHaveBeenCalled();
//       });
//     });

//     //test suite for updateTypeFailed method
//     describe('updateTypeFailed ->', function () {
//       beforeEach(function () {
//         scope.savingType = true;
//         ctrl.existingAdjustmentType = angular.copy(scope.adjustmentType);
//         modalFactory.ConfirmModal = jasmine
//           .createSpy('modalFactory.ConfirmModal')
//           .and.callFake(function () {
//             modalFactoryDeferred = q.defer();
//             modalFactoryDeferred.resolve(1);
//             return {
//               result: modalFactoryDeferred.promise,
//               then: function () {},
//             };
//           });
//       });

//       //updateTypeFailed should call toastrFactory.error
//       it('should call toastrFactory.error', function () {
//         ctrl.updateTypeFailed('An Error Occurred');

//         ctrl.existingAdjustmentType.Description = 'test desc';
//         ctrl.existingAdjustmentType.Prompt = 'prompt val';
//         ctrl.existingAdjustmentType.CurrencyTypeId = 3;
//         ctrl.existingAdjustmentType.IsUsedInCreditTransactions = true;
//         expect(ctrl.reloadBackUpValues).not.toBeNull();
//       });

//       //updateTypeFailed should set the saving flag to false
//       it('should set the saving flag to false', function () {
//         ctrl.updateTypeFailed('An Error Occurred');

//         ctrl.existingAdjustmentType.Description = 'test desc';
//         expect(scope.savingType).toBe(true);
//       });
//     });

//     //test suite for ctrl.reloadBackUpValues
//     describe('ctrl.reloadBackUpValues function ->', function () {
//       it('ctrl.reloadBackUpValues should set $scope.adjustmentType with the values in ctrl.existingAdjustmentType ', function () {
//         ctrl.existingAdjustmentType = angular.copy(mockNewAdjustmentType);
//         scope.adjustmentType = angular.copy(mockAdjustmentType);
//         ctrl.reloadBackUpValues();
//         expect(scope.savingType).toBe(false);
//         expect(scope.adjustmentType.Description).toBe(
//           ctrl.existingAdjustmentType.Description
//         );
//       });
//     });

//     ////test suite for checkForDuplicates method
//     //describe('checkForDuplicates ->', function () {
//     //    beforeEach(function () {
//     //        scope.types = angular.copy(mockAdjustmentTypeList);

//     //        createController();
//     //        loadHtml();

//     //        scope.frmAdjustmentTypeCrud = {
//     //            inpDescription: {
//     //                $setValidity: jasmine.createSpy()
//     //            }
//     //        };
//     //    });

//     //    //test suite for checkForDuplicates when a duplicate adjustment type does not exists
//     //    describe('when a duplicate does NOT exist,', function () {
//     //        beforeEach(function () {
//     //            listHelper.findItemByFieldValueIgnoreCase = jasmine.createSpy("listHelper.findItemByFieldValueIgnoreCase").and.returnValue(null);
//     //            scope.descriptionIsDuplicate = false;
//     //            scope.checkForDuplicates(angular.copy(mockNewAdjustmentType));
//     //        });

//     //        //checkForDuplicates should mark the description as uinque and valid when a duplicate adjustment type does not exists
//     //        it('should mark the description as uinque and valid', function () {
//     //            expect(scope.descriptionIsDuplicate).toBe(false);
//     //            expect(scope.duplicateDescrption).toBe(false);
//     //        });

//     //    });

//     //    //test suite for checkForDuplicates when a duplicate adjustment type exists
//     //    describe('when a duplicate exists', function () {

//     //        //test suite for checkForDuplicates when a duplicate adjustment type exists and changes were made to the current type
//     //        describe('and changes were made to the current type', function () {
//     //            beforeEach(function () {
//     //                listHelper.findItemByFieldValueIgnoreCase = jasmine.createSpy("listHelper.findItemByFieldValueIgnoreCase").and.returnValue({ AdjustmentTypeId: 1 });
//     //            });
//     //            //checkForDuplicates should mark the type as an invalid duplicate when a duplicate adjustment type exists and changes were made to the current type
//     //            it('should mark the type as an invalid duplicate', function () {
//     //                scope.types = angular.copy(mockAdjustmentTypeList);
//     //                var editedType = angular.copy(mockAdjustmentType);
//     //                editedType.Description = "Type2";

//     //                scope.checkForDuplicates(angular.copy(editedType));

//     //                expect(scope.frmAdjustmentTypeCrud.inpDescription.$setValidity)
//     //                    .toHaveBeenCalledWith('uniqueDescription', true);
//     //                expect(scope.descriptionIsDuplicate).toBe(true);
//     //                expect(scope.formIsValid).toBe(false);
//     //            });
//     //        });
//     //    });
//     //});

//     //test suite for adjustmentType watch statement
//     describe('adjustmentType watch statement ->', function () {
//       beforeEach(function () {
//         spyOn(scope, 'checkForDuplicates');
//         scope.adjustmentType = 1;
//         scope.$apply();
//         scope.adjustmentType = 2;
//         scope.$apply();
//       });

//       //adjustmentType watch statement should call checkForDuplicates when a new value is set
//       it('should call checkForDuplicates when a new value is set', function () {
//         expect(scope.checkForDuplicates).toHaveBeenCalled();
//       });
//     });
//   });

//   //controller test suite when type is set
//   describe('controller when typeId is set ->', function () {
//     //#region before each
//     beforeEach(module('Soar.BusinessCenter'));

//     beforeEach(inject(function ($rootScope) {
//       scope = $rootScope.$new();
//       scope.typeId = 1;
//       createController();
//     }));

//     //#endregion

//     //editing flag should be true when typeId is set
//     it('editing should be true', function () {
//       expect(scope.editing).toBe(true);
//     });
//   });
// });

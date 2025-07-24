import { of } from 'rsjs';

describe('FeeScheduleEditController tests -> ', function () {
  var ctrl,
    toastrFactory,
    saveStates,
    q,
    localize,
    timeout,
    rootScope,
    scope,
    referenceDataService,
    businessCenterServices,
    patSecurityService,
    location,
    modalFactoryDeferred,
    modalFactory,
    refServiceCodes,
    refFeeLists,
    featureFlagService,
    fuseFlag;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    q = $q;
    timeout = $injector.get('$timeout');

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    referenceDataService = {
      get: jasmine.createSpy(),
      forceEntityExecution: jasmine.createSpy(),
      setFeesByLocation: jasmine.createSpy(),
      entityNames: {
        serviceTypes: 'serviceTypes',
        serviceCodes: 'serviceCodes',
        feeLists: 'feeLists',
      },
    };
    //mock for businessCenterServices
    businessCenterServices = {
      FeeSchedule: {
        save: jasmine.createSpy(),
        checkDuplicateFeeScheduleName: jasmine.createSpy(),
        getById: jasmine.createSpy(),
        update: jasmine.createSpy(),
      },
    };

    //mock for location
    location = {
      path: jasmine.createSpy().and.returnValue(''),
    };

    //mock for patSecurityService
    patSecurityService = {
      generateMessage: jasmine.createSpy().and.returnValue(''),
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
    };

    featureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue(of(false)),
    };

    //mock for CancelModal
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      LoadingModal: jasmine
        .createSpy('modalFactory.LoadingModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    saveStates = {
      Add: 'Add',
      Update: 'Update',
      Delete: 'Delete',
      None: 'None',
    };

    refServiceCodes = [];
    refFeeLists = [];

    // create controller
    ctrl = $controller('FeeScheduleEditController', {
      $scope: scope,
      $rootScope: rootScope,
      toastrFactory: toastrFactory,
      localize: localize,
      $timeout: timeout,
      BusinessCenterServices: businessCenterServices,
      $location: location,
      patSecurityService: patSecurityService,
      ModalFactory: modalFactory,
      SaveStates: saveStates,
      referenceDataService: referenceDataService,
      serviceCodes: refServiceCodes,
      feeLists: refFeeLists,
      serviceTypesService: null,
      featureFlagService: featureFlagService,
      fuseFlag: fuseFlag
    });
  }));

  //controller
  it('FeeScheduleEditController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  //ctrl.authEditAccess function
  describe('authEditAccess function ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation', function () {
      ctrl.authEditAccess();
      expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });

  //ctrl.authAccess function
  describe('authAccess function ->', function () {
    it('should set scope.hasAddAccess to true', function () {
      ctrl.authAddAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.authAccess();
      expect(ctrl.hasAddAccess).toBe(true);
    });

    it('should set scope.hasEditAccess to true', function () {
      scope.editing = true;
      ctrl.authEditAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.authAccess();
      expect(ctrl.hasEditAccess).toBe(true);
    });

    it('should call  toastrFactory.error', function () {
      scope.editing = true;
      ctrl.authEditAccess = jasmine.createSpy().and.returnValue(false);
      ctrl.authAccess();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.setupPage function ->', function () {
    beforeEach(function () {
      ctrl.feeScheduleData = {
        DataTag: '1',
        DateModified: '1',
        UserModified: '3',
        FeeScheduleGroupDtos: [
          { FeeScheduleGroupId: 1, SortOrder: 1, FeeScheduleGroupDetails: [] },
          { FeeScheduleGroupId: 2, SortOrder: 2, FeeScheduleGroupDetails: [] },
        ],
      };
      var userLocation = '{"id": "111"}';
      sessionStorage.setItem('userLocation', userLocation);

      referenceDataService.setFeesByLocation = jasmine
        .createSpy('referenceDataService.setFeesByLocation')
        .and.callFake(function (service) {
          return { ...service, $$locationFee: service.Fee };
        });
    });

    it('should call referenceDataService.setFeesByLocation', function () {
      scope.IsCopy = true;
      ctrl.serviceCodesFiltered = [
        { ServiceCodeId: '123', ServiceGroupDetails: [] },
      ];
      ctrl.setupPage();

      expect(referenceDataService.setFeesByLocation).toHaveBeenCalled();
    });

    it('should not call referenceDataService.setFeesByLocation', function () {
      scope.editing = true;
      scope.userLocationId = 111;
      ctrl.serviceCodesFiltered = [
        {
          ServiceCodeId: '456',
          ServiceGroupDetails: [],
          LocationSpecificInfo: [{ LocationId: '111' }],
        },
      ];
      ctrl.setupPage();

      expect(referenceDataService.setFeesByLocation).not.toHaveBeenCalled();
    });
  });

  //ctrl.getFeeScheduleByIdSuccess function
  describe('ctrl.getFeeScheduleByIdSuccess function ->', function () {
    it('should call ctrl.serviceCodeGet', function () {
      var successResponse = {
        Value: {
          FeeScheduleName: 'Test Fee Schedule',
          FeeScheduleDetailDtos: [],
        },
      };
      ctrl.getFeeScheduleByIdSuccess(successResponse);
      expect(ctrl.feeScheduleData).toEqual(successResponse.Value);
    });
  });

  //ctrl.getFeeScheduleByIdFailure function
  describe('ctrl.getFeeScheduleByIdFailure function ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getFeeScheduleByIdFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  //scope.cancel function
  describe('cancel function ->', function () {
    it('should call location.path if no change is made ', function () {
      scope.FeeScheduleName = null;
      ctrl.initialData = scope.feeScheduleDataSource = {
        data: jasmine.createSpy().and.returnValue(''),
      };
      scope.cancel();
      expect(location.path).toHaveBeenCalled();
    });

    it('should call location.path if change is made on the screen', function () {
      scope.FeeScheduleName = null;
      ctrl.initialData = scope.feeScheduleDataSource = {
        data: jasmine.createSpy().and.returnValue(''),
      };
      scope.cancel();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  //ctrl.confirmCancel function
  describe('confirmCancel function ->', function () {
    it('should call location.path if no change is made ', function () {
      ctrl.confirmCancel();
      expect(location.path).toHaveBeenCalled();
    });
  });

  //ctrl.init function
  describe('init function ->', function () {
    it('should call modalFactory.LoadingModal ', function () {
      ctrl.init();
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });
  });

  describe('getPermittedLocationsSuccess function ->', function () {
    it('should set scope.permittedLocations', function () {
      ctrl.getPermittedLocationsSuccess({ Value: 'some text' });
      expect(scope.permittedLocations).toEqual('some text');
    });
  });

  //scope.save function
  describe('save function ->', function () {
    it('should call businessCenterServices.FeeSchedule.save', function () {
      ctrl.hasAddAccess = true;
      ctrl.validate = jasmine.createSpy().and.returnValue(true);
      spyOn(ctrl, 'scrollFeeScheduleInputIntoView');
      var gridData = [
        { ServiceCodeId: 1, AllowedAmount: '23' },
        { ServiceCodeId: 2, AllowedAmount: '24' },
      ];
      scope.serviceCodeGridDisplayData = gridData;
      scope.serviceCodeGridDisplayDataAll = gridData;
      scope.FeeScheduleName = 'FeeName';
      scope.duplicateFeeScheduleName = false;
      scope.save();
      expect(ctrl.validate).toHaveBeenCalled();
      expect(businessCenterServices.FeeSchedule.save).toHaveBeenCalled();
    });

    it('should call businessCenterServices.FeeSchedule.update', function () {
      ctrl.hasEditAccess = true;
      ctrl.feeScheduleData = {
        DataTag: '1',
        DateModified: '1',
        UserModified: '3',
      };
      scope.editing = true;
      ctrl.validate = jasmine.createSpy().and.returnValue(true);
      var gridData = [
        { ServiceCodeId: 1, AllowedAmount: '23' },
        { ServiceCodeId: 2, AllowedAmount: '24' },
      ];
      scope.serviceCodeGridDisplayData = gridData;
      scope.serviceCodeGridDisplayDataAll = gridData;
      scope.FeeScheduleName = 'FeeName';
      scope.duplicateFeeScheduleName = false;
      scope.save();
      expect(ctrl.validate).toHaveBeenCalled();
      expect(businessCenterServices.FeeSchedule.update).toHaveBeenCalled();
    });

    it('should call businessCenterServices.FeeSchedule.save', function () {
      ctrl.hasAddAccess = true;
      ctrl.validate = jasmine.createSpy().and.returnValue(true);
      spyOn(ctrl, 'scrollFeeScheduleInputIntoView');
      var gridData = [
        { ServiceCodeId: 1, AllowedAmount: '23' },
        { ServiceCodeId: 2, AllowedAmount: '24' },
      ];
      scope.serviceCodeGridDisplayData = gridData;
      scope.serviceCodeGridDisplayDataAll = gridData;
      scope.FeeScheduleName = 'FeeName';
      scope.duplicateFeeScheduleName = false;
      scope.save();
      expect(ctrl.validate).toHaveBeenCalled();
      expect(businessCenterServices.FeeSchedule.save).toHaveBeenCalled();
    });

    it('should call businessCenterServices.FeeSchedule.save', function () {
      ctrl.hasAddAccess = true;
      ctrl.validate = jasmine.createSpy().and.returnValue(true);
      spyOn(ctrl, 'scrollFeeScheduleInputIntoView');
      var gridData = [
        {
          ServiceGroupDetails: [
            { ServiceCodeId: 1, AllowedAmount: 23, SortOrder: 0 },
            { ServiceCodeId: 2, AllowedAmount: 0, SortOrder: 0 },
          ],
        },
      ];
      scope.serviceCodeGridDisplayData = gridData;
      scope.serviceCodeGridDisplayDataAll = gridData;
      scope.LocationGroups = [{ Locations: [{ LocationId: 3 }], SortOrder: 0 }];
      scope.FeeScheduleName = 'FeeName';
      scope.duplicateFeeScheduleName = false;
      scope.save();
      expect(ctrl.validate).toHaveBeenCalled();
      expect(businessCenterServices.FeeSchedule.save).toHaveBeenCalledWith(
        {
          FeeScheduleGroupDtos: [
            {
              ObjectState: 'Add',
              FeeScheduleId: undefined,
              LocationIds: [3],
              SortOrder: 0,
              FeeScheduleGroupDetails: [
                {
                  ObjectState: 'Add',
                  FeeScheduleGroupId: undefined,
                  ServiceCodeId: undefined,
                  AllowedAmount: 23,
                },
                {
                  ObjectState: 'Add',
                  FeeScheduleGroupId: undefined,
                  ServiceCodeId: undefined,
                  AllowedAmount: 0,
                },
              ],
            },
          ],
          FeeScheduleDetailDtos: [
            {
              ServiceCodeId: undefined,
              IsManagedCare: undefined,
              ObjectState: 'Add',
              FeeScheduleId: undefined,
            },
          ],
          FeeScheduleName: '',
        },
        ctrl.saveOnSuccess,
        ctrl.saveOnError
      );
    });

    it('should call toastrFactory.error', function () {
      ctrl.hasAddAccess = false;
      ctrl.hasEditAccess = false;
      scope.editing = true;
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should call toastrFactory.error', function () {
      ctrl.hasAddAccess = false;
      ctrl.hasEditAccess = false;
      scope.editing = false;
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  //ctrl.saveOnSuccess function
  describe('saveOnSuccess function ->', function () {
    it('should call toastrFactory.success', function () {
      scope.editing = true;
      ctrl.saveOnSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(location.path).toHaveBeenCalled();
    });

    it('should call toastrFactory.success', function () {
      scope.editing = false;
      ctrl.saveOnSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(location.path).toHaveBeenCalledWith(
        '/BusinessCenter/Insurance/FeeSchedule'
      );
    });
  });

  //ctrl.saveOnError function
  describe('saveOnError function ->', function () {
    it('should call toastrFactory.error', function () {
      scope.editing = true;
      spyOn(ctrl, 'scrollFeeScheduleInputIntoView');
      ctrl.saveOnError();
      expect(ctrl.scrollFeeScheduleInputIntoView).toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should call toastrFactory.error', function () {
      scope.editing = false;
      spyOn(ctrl, 'scrollFeeScheduleInputIntoView');
      ctrl.saveOnError();
      expect(ctrl.scrollFeeScheduleInputIntoView).toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  //scope.checkForDuplicates function
  describe('checkForDuplicates function ->', function () {
    it('should call businessCenterServices.FeeSchedule.checkDuplicateFeeScheduleName', function () {
      scope.FeeScheduleName = '';
      scope.checkForDuplicates();
      expect(scope.duplicateFeeScheduleName).toBe(false);
    });
  });

  //scope.checkForDuplicates function
  describe('checkForDuplicatesGetSuccess function ->', function () {
    it('should call businessCenterServices.FeeSchedule.checkDuplicateFeeScheduleName', function () {
      var successResponse = { Value: 'FeeName' };
      scope.FeeScheduleName = 'FeeName';
      scope.checkForDuplicatesGetSuccess(successResponse);
      expect(scope.duplicateFeeScheduleName).toEqual('FeeName');
      expect(localize.getLocalizedString).toHaveBeenCalledWith(
        'Fee Schedule name must be unique'
      );
    });
  });

  //scope.checkForDuplicates function
  describe('checkForDuplicatesGetFailure function ->', function () {
    it('should call businessCenterServices.FeeSchedule.checkDuplicateFeeScheduleName', function () {
      scope.checkForDuplicatesGetFailure();
      expect(scope.duplicateFeeScheduleName).toBe(true);
      expect(localize.getLocalizedString).toHaveBeenCalledWith(
        'Could not verify unique fee schedule name. Please try again'
      );
    });
  });
});

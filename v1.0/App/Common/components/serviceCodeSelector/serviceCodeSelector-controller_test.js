import { of } from 'rsjs';

describe('ServiceCodeSelectorController -> ', function () {
  var routeParams,
    scope,
    rootScope,
    ctrl,
    data,
    element,
    widget,
    timeout,
    controller;
  var referenceDataService,
    userServices,
    listHelper,
    serviceCodeData,
    serviceTypesData,
    toastrFactory,
    userData,
    usersFactory,
    featureFlagService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  function createController() {
    ctrl = controller('ServiceCodeSelectorController', {
      $scope: scope,
      $rootScope: rootScope,
      referenceDataService: referenceDataService,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
    });
  }
  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(1),
      };
      //mock for userServices service
      userServices = {
        Users: {
          get: jasmine.createSpy().and.returnValue(userData),
        },
      };
      $provide.value('UserServices', userServices);

      usersFactory = {
        Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
      };
      $provide.value('UsersFactory', usersFactory);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);

      userData = [
        {
          UserId: '271442d9-f22a-4441-9ba7-921a429ed0f6',
          FirstName: 'sample',
          MiddleName: null,
          LastName: 'user',
          PreferredName: null,
          DateOfBirth: null,
          UserName: 'username1',
          UserCode: 'USESA1',
          ImageFile: null,
          EmployeeStartDate: '2015-01-06T00:00:00Z',
          EmployeeEndDate: null,
          Email: 'username1@gmail.com',
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
          },
          DepartmentId: null,
          JobTitle: null,
          ProviderTypeId: 3,
          TaxId: null,
          FederalLicense: null,
          DeaNumber: null,
          NpiTypeOne: null,
          PrimaryTaxonomyId: null,
          SecondaryTaxonomyId: null,
          StateLicense: null,
          AnesthesiaId: null,
          IsActive: true,
          StatusChangeNote: null,
        },
      ];

      serviceCodeData = [
        {
          $$FeeString: '$50',
          $$locationFee: 50,
          $$locationTaxableServiceId: 3,
          $$serviceTransactionFee: 50,
          Surface: '',
          Tooth: '',
          CreationDate: '',
          ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
          CdtCodeId: '08e058d1-e313-4a56-8a46-b877dc9feebb',
          CdtCodeName: 'D9211',
          Code: 'scTest1',
          Description: 'scTest1 deswc',
          ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
          ServiceTypeDescription: 'Diagnostic',
          DisplayAs: 'scTest1',
          Fee: 57,
          TaxableServiceTypeId: 3,
          AffectedAreaId: 4,
          UsuallyPerformedByProviderTypeId: 2,
          UseCodeForRangeOfTeeth: false,
          IsActive: true,
          IsEligibleForDiscount: true,
          Notes: 'text',
          SubmitOnInsurance: true,
          IsSwiftPickCode: false,
          SwiftPickServiceCodes: null,
        },
        {
          $$FeeString: '$50',
          $$locationFee: 50,
          $$locationTaxableServiceId: 3,
          $$serviceTransactionFee: 50,
          Surface: '',
          Tooth: '',
          CreationDate: '',
          ServiceCodeId: 'c70100db-aae1-49df-94da-e727cd9afbe3',
          CdtCodeId: '00000000-0000-0000-0000-000000000000',
          CdtCodeName: '',
          Code: 'spcTest',
          Description: 'spcTest desc',
          ServiceTypeId: '00000000-0000-0000-0000-000000000000',
          ServiceTypeDescription: '',
          DisplayAs: 'spcTest',
          Fee: 114,
          TaxableServiceTypeId: 0,
          AffectedAreaId: 0,
          UsuallyPerformedByProviderTypeId: null,
          UseCodeForRangeOfTeeth: false,
          IsActive: true,
          IsEligibleForDiscount: false,
          Notes: null,
          SubmitOnInsurance: false,
          IsSwiftPickCode: true,
          SwiftPickServiceCodes: [
            {
              SwiftPickServiceCodeId: 'ebfc4ad6-7f97-43dc-80c8-090bf398899b',
              SwiftPickCodeId: 'c70100db-aae1-49df-94da-e727cd9afbe3',
              ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
              Code: 'scTest1',
              CdtCodeName: 'D9211',
              Description: 'scTest1 deswc',
              Fee: 57,
            },
            {
              SwiftPickServiceCodeId: '1bf3c75e-c52a-4c32-8d80-42a99bad0be5',
              SwiftPickCodeId: 'c70100db-aae1-49df-94da-e727cd9afbe3',
              ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
              Code: 'scTest1',
              CdtCodeName: 'D9211',
              Description: 'scTest1 deswc',
              Fee: 57,
            },
          ],
        },
      ];

      serviceTypesData = [
        {
          ServiceTypeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947',
          IsSystemType: true,
          Description: 'Adjunctive General Services',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
          IsSystemType: true,
          Description: 'Diagnostic',
          IsAssociatedWithServiceCode: true,
        },
        {
          ServiceTypeId: '46206c7f-e4df-4158-86d9-c442c1fa63b4',
          IsSystemType: true,
          Description: 'Endodontics',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: '3493fe28-4e23-4ef7-8ca2-9a5edcce883a',
          IsSystemType: true,
          Description: 'Implant Services',
          IsAssociatedWithServiceCode: false,
        },
      ];

      referenceDataService = {
        get: jasmine.createSpy().and.returnValue(serviceTypesData),
        entityNames: {
          serviceTypes: 'serviceTypes',
        },
      };
      //mock for toaster functionality
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };
    })
  );
  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams
  ) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    routeParams = $routeParams;
    scope.onAdd = function () {};
    controller = $controller;
    ctrl = $controller('ServiceCodeSelectorController', {
      $scope: scope,
      $rootScope: rootScope,
      referenceDataService: referenceDataService,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
    });
    timeout = $injector.get('$timeout');
    spyOn(timeout, 'cancel');
    scope.scheduler = null;
  }));

  it('should initialize controller', function () {
    expect(ctrl).not.toBeNull();
    expect(scope.filterItem).toEqual('');
    expect(scope.validateFlag).toEqual(false);
    expect(scope.selectedProviderId).toBeNull();
    expect(scope.activeIndex).toEqual(-1);
    expect(scope.plannedServicesInitial).toBeDefined();
    expect(scope.plannedServices).toBeDefined();
  });

  describe('getPracticeProviders function ->', function () {
    it('getPracticeProviders should call userServices get on user', function () {
      scope.getPracticeProviders();
      expect(scope.loading).toEqual(true);
      expect(usersFactory.Users).toHaveBeenCalled();
    });
  });

  describe('userServicesGetSuccess function ->', function () {
    it('userServicesGetSuccess should handle success flow for get call on user service', function () {
      var res = { Value: userData };
      scope.userServicesGetSuccess(res);
      expect(scope.loading).toEqual(false);
      expect(scope.providers.length).toBeGreaterThan(0);
    });

    it('userServicesGetSuccess should handle success flow for get call on user service', function () {
      //var userData = [{ "UserId": "271442d9-f22a-4441-9ba7-921a429ed0f6", "FirstName": "sample", "MiddleName": null, "LastName": "user", "PreferredName": null, "DateOfBirth": null, "SocialSecurityNumber": null, "UserName": "username1", "UserCode": "USESA1", "ImageFile": null, "EmployeeStartDate": "2015-01-06T00:00:00Z", "EmployeeEndDate": null, "Email": "username1@gmail.com", "Address": { "AddressLine1": null, "AddressLine2": null, "City": null, "State": null, "ZipCode": null }, "DepartmentId": null, "JobTitle": null, "ProviderTypeId": null, "TaxId": null, "FederalLicense": null, "DeaNumber": null, "NpiTypeOne": null, "PrimaryTaxonomyId": null, "SecondaryTaxonomyId": null, "StateLicense": null, "AnesthesiaId": null, "IsActive": true, "StatusChangeNote": null }];
      var userData = [
        {
          UserId: '271442d9-f22a-4441-9ba7-921a429ed0f6',
          FirstName: 'sample',
          MiddleName: null,
          LastName: 'user',
          PreferredName: null,
          DateOfBirth: null,
          UserName: 'username1',
          UserCode: 'USESA1',
          ImageFile: null,
          EmployeeStartDate: '2015-01-06T00:00:00Z',
          EmployeeEndDate: null,
          Email: 'username1@gmail.com',
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
          },
          DepartmentId: null,
          JobTitle: null,
          ProviderTypeId: null,
          TaxId: null,
          FederalLicense: null,
          DeaNumber: null,
          NpiTypeOne: null,
          PrimaryTaxonomyId: null,
          SecondaryTaxonomyId: null,
          StateLicense: null,
          AnesthesiaId: null,
          IsActive: true,
          StatusChangeNote: null,
        },
      ];

      var res = { Value: userData };
      scope.userServicesGetSuccess(res);
      expect(scope.loading).toEqual(false);
      expect(scope.providers.length).toEqual(0);
    });

    it('userServicesGetSuccess should handle success flow for get call on user service', function () {
      //var userData = [{ "UserId": "271442d9-f22a-4441-9ba7-921a429ed0f6", "FirstName": "sample", "MiddleName": null, "LastName": "user", "PreferredName": null, "DateOfBirth": null, "SocialSecurityNumber": null, "UserName": "username1", "UserCode": "USESA1", "ImageFile": null, "EmployeeStartDate": "2015-01-06T00:00:00Z", "EmployeeEndDate": null, "Email": "username1@gmail.com", "Address": { "AddressLine1": null, "AddressLine2": null, "City": null, "State": null, "ZipCode": null }, "DepartmentId": null, "JobTitle": null, "ProviderTypeId": 5, "TaxId": null, "FederalLicense": null, "DeaNumber": null, "NpiTypeOne": null, "PrimaryTaxonomyId": null, "SecondaryTaxonomyId": null, "StateLicense": null, "AnesthesiaId": null, "IsActive": true, "StatusChangeNote": null }];
      var userData = [
        {
          UserId: '271442d9-f22a-4441-9ba7-921a429ed0f6',
          FirstName: 'sample',
          MiddleName: null,
          LastName: 'user',
          PreferredName: null,
          DateOfBirth: null,
          UserName: 'username1',
          UserCode: 'USESA1',
          ImageFile: null,
          EmployeeStartDate: '2015-01-06T00:00:00Z',
          EmployeeEndDate: null,
          Email: 'username1@gmail.com',
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
          },
          DepartmentId: null,
          JobTitle: null,
          ProviderTypeId: 5,
          TaxId: null,
          FederalLicense: null,
          DeaNumber: null,
          NpiTypeOne: null,
          PrimaryTaxonomyId: null,
          SecondaryTaxonomyId: null,
          StateLicense: null,
          AnesthesiaId: null,
          IsActive: true,
          StatusChangeNote: null,
        },
      ];

      var res = { Value: userData };
      scope.userServicesGetSuccess(res);
      expect(scope.loading).toEqual(false);
      expect(scope.providers.length).toBeGreaterThan(0);
    });
  });

  describe('userServicesGetFailure function -> ', function () {
    it('should show toaster message to user about service failure', function () {
      scope.userServicesGetFailure();
      expect(scope.loading).toEqual(false);
      expect(scope.providers).not.toBeUndefined();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('serviceTypeFilter function ->', function () {
    it('should apply custom filter when filterItem is same as parameter', function () {
      var data = { ServiceTypeId: 1 };
      scope.filterItem = 1;
      scope.serviceTypeFilter(data);
    });

    it('should apply custom filter when filterItem is null', function () {
      var data = { ServiceTypeId: 1 };
      scope.filterItem = null;
      scope.serviceTypeFilter(data);
    });

    it('should not apply custom filter when filterItem is not equal to paramter', function () {
      var data = { ServiceTypeId: 1 };
      scope.filterItem = 2;
      scope.serviceTypeFilter(data);
    });
  });

  describe('onAddServices function ->', function () {
    it('should not call onAdd if plannedServices and is invalid', function () {
      spyOn(scope, 'onAdd');
      spyOn(scope, 'clearAndCloseSelectedRow');
      spyOn(ctrl, 'plannedServiceIsValid').and.returnValue(false);

      scope.plannedServices = [
        {
          CreationDate: '06/06/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 1,
          Selected: true,
        },
        {
          CreationDate: '06/05/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 2,
          Selected: true,
        },
      ];
      scope.onAddServices();
      expect(scope.validateFlag).toEqual(true);
      expect(scope.onAdd).not.toHaveBeenCalled();
      expect(scope.clearAndCloseSelectedRow).not.toHaveBeenCalled();
      expect(ctrl.plannedServiceIsValid).toHaveBeenCalled();
    });

    it('should call onAdd if plannedServices and is valid', function () {
      spyOn(scope, 'onAdd');
      spyOn(scope, 'clearAndCloseSelectedRow');
      spyOn(ctrl, 'plannedServiceIsValid').and.returnValue(true);
      scope.plannedServices = [
        {
          CreationDate: '06/06/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 1,
          Selected: true,
        },
        {
          CreationDate: '06/05/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 2,
          Selected: true,
        },
      ];
      scope.onAddServices();
      expect(scope.validateFlag).toEqual(true);
      expect(scope.onAdd).toHaveBeenCalled();
      expect(scope.onAdd).toHaveBeenCalledWith(scope.plannedServices);
      expect(scope.clearAndCloseSelectedRow).toHaveBeenCalled();
      expect(ctrl.plannedServiceIsValid).toHaveBeenCalled();
    });

    it('should not call onAdd if plannedServices is not selected', function () {
      ctrl.elementIndex = -1;
      spyOn(ctrl, 'plannedServiceIsValid').and.returnValue(true);
      scope.plannedServices = [
        {
          CreationDate: '06/06/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 1,
          Selected: false,
        },
      ];
      scope.onAddServices();
      expect(scope.validateFlag).toEqual(true);
      expect(ctrl.elementIndex).toEqual(0);
      expect(ctrl.plannedServiceIsValid).not.toHaveBeenCalled();
    });
  });

  describe('selectedCount function ->', function () {
    it('should return count  0 if plannedServices are not selected', function () {
      ctrl.count = 0;
      scope.plannedServices = [
        {
          CreationDate: '06/06/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 1,
          Selected: false,
        },
        {
          CreationDate: '06/05/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 2,
          Selected: false,
        },
      ];
      scope.selectedCount();
      expect(ctrl.count).toEqual(0);
    });

    it('should return count  0 if plannedServices are not selected', function () {
      ctrl.count = 0;
      scope.plannedServices = [
        {
          CreationDate: '06/06/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 1,
          Selected: true,
        },
        {
          CreationDate: '06/05/2015',
          ValidDate: true,
          AffectedAreaId: 0,
          Tooth: 'a',
          Surface: 'b',
          ProviderId: 'c',
          Fee: 2,
          Selected: true,
        },
      ];
      scope.selectedCount();
      expect(ctrl.count).toEqual(2);
    });
  });

  describe('editMode is true ->', function () {
    it('should call serviceCodesService.getServiceCodeById when Edit is true', function () {
      scope.editMode = true;
      createController();
    });
  });

  describe('activateRow function ->', function () {
    it('activateRow should show edit options for row with passed index when index is valid', function () {
      var index = 1;
      scope.filteredServiceCodes = serviceCodeData;
      scope.activeIndex = 2;
      spyOn(scope, 'loadPlannedServices');

      scope.activateRow(index);
      expect(scope.validateFlag).toEqual(false);
      expect(scope.activeIndex).toEqual(index);
      expect(scope.loadPlannedServices).toHaveBeenCalledWith(
        scope.filteredServiceCodes[index]
      );
    });

    it('activateRow should show edit options for row with passed index when index is invalid', function () {
      var index = -1;
      scope.filteredServiceCodes = serviceCodeData;
      scope.activeIndex = 2;
      spyOn(scope, 'loadPlannedServices');

      scope.activateRow(index);
      expect(scope.validateFlag).toEqual(false);
      expect(scope.activeIndex).toEqual(index);
      expect(scope.loadPlannedServices).toHaveBeenCalledWith(null);
    });
  });

  describe('loadPlannedServices function ->', function () {
    it('loadPlannedServices should add the passed serviceCode to the encounter list when serviceCode is swiftpickcode', function () {
      var serviceCodeObject = serviceCodeData[1];
      spyOn(scope, 'addToPlannedServices');
      scope.loadPlannedServices(serviceCodeObject);
      expect(scope.addToPlannedServices).toHaveBeenCalled();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
    });

    it('loadPlannedServices should add the passed serviceCode to the encounter list when serviceCode is not swiftpickcode', function () {
      var serviceCodeObject = serviceCodeData[0];
      spyOn(scope, 'addToPlannedServices');
      scope.loadPlannedServices(serviceCodeObject);
      expect(scope.addToPlannedServices).toHaveBeenCalled();
      expect(listHelper.findItemByFieldValue).not.toHaveBeenCalled();
    });
  });

  describe('addToPlannedServices function ->', function () {
    it('addToPlannedServices should add the passed serviceCode to the plannedServices', function () {
      var serviceCodeObject = serviceCodeData[1];

      scope.addToPlannedServices(serviceCodeObject);
      expect(scope.plannedServices.length).toEqual(1);
    });
  });

  describe('clearAndCloseSelectedRow function ->', function () {
    it('clearAndCloseSelectedRow should clear the activeIndex', function () {
      scope.clearAndCloseSelectedRow();
      expect(scope.activeIndex).toEqual(-1);
    });
  });

  describe('serviceTypeOnBlur function ->', function () {
    beforeEach(function () {
      data = {
        value: jasmine.createSpy().and.returnValue(1),
        text: jasmine.createSpy().and.returnValue('a'),
      };
      element = {
        data: jasmine.createSpy().and.returnValue(data),
      };
      spyOn(angular, 'element').and.returnValue(element);
    });

    it('serviceTypeOnBlur should handle Blur event for service type filter field when findItemByFieldValue returns item', function () {
      spyOn(scope, 'clearAndCloseSelectedRow');
      scope.serviceTypes = [];

      scope.serviceTypeOnBlur();
      expect(scope.filterItem).not.toBeNull();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      expect(scope.clearAndCloseSelectedRow).toHaveBeenCalled();
    });

    it('serviceTypeOnBlur should handle Blur event for service type filter field when findItemByFieldValue returns null', function () {
      spyOn(scope, 'clearAndCloseSelectedRow');
      scope.serviceTypes = [];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      scope.serviceTypeOnBlur();
      expect(scope.filterItem).toBeNull();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      expect(scope.clearAndCloseSelectedRow).toHaveBeenCalled();
    });

    it('serviceTypeOnBlur should do nothing when serviceTypes null', function () {
      spyOn(scope, 'clearAndCloseSelectedRow');
      scope.serviceTypes = null;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      scope.serviceTypeOnBlur();
      expect(listHelper.findItemByFieldValue).not.toHaveBeenCalled();
      expect(scope.clearAndCloseSelectedRow).not.toHaveBeenCalled();
    });
  });

  describe('serviceTypeOnChange function ->', function () {
    beforeEach(function () {
      data = {
        value: jasmine.createSpy().and.returnValue(1),
        text: jasmine.createSpy().and.returnValue('a'),
      };
      element = {
        data: jasmine.createSpy().and.returnValue(data),
      };
      spyOn(angular, 'element').and.returnValue(element);
    });

    it('serviceTypeOnChange should handle Change event for service type filter field when findItemByFieldValue returns item', function () {
      spyOn(scope, 'clearAndCloseSelectedRow');
      scope.serviceTypes = [];

      scope.serviceTypeOnChange();
      expect(scope.filterItem).not.toBeNull();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      expect(scope.clearAndCloseSelectedRow).toHaveBeenCalled();
    });

    it('serviceTypeOnChange should handle Change event for service type filter field when findItemByFieldValue returns null', function () {
      spyOn(scope, 'clearAndCloseSelectedRow');
      scope.serviceTypes = [];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      scope.serviceTypeOnChange();
      expect(scope.filterItem).toBeNull();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      expect(scope.clearAndCloseSelectedRow).toHaveBeenCalled();
    });

    it('serviceTypeOnChange should do nothing when serviceTypes is null', function () {
      spyOn(scope, 'clearAndCloseSelectedRow');
      scope.serviceTypes = null;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      scope.serviceTypeOnChange();
      expect(listHelper.findItemByFieldValue).not.toHaveBeenCalled();
      expect(scope.clearAndCloseSelectedRow).not.toHaveBeenCalled();
    });
  });

  describe('providerOnBlur function ->', function () {
    beforeEach(function () {
      data = {
        value: jasmine.createSpy().and.returnValue(1),
        text: jasmine.createSpy().and.returnValue('a'),
      };
      element = {
        data: jasmine.createSpy().and.returnValue(data),
      };
      spyOn(angular, 'element').and.returnValue(element);
    });

    it('providerOnBlur should handle Blur event for provider field when findItemByFieldValue returns item', function () {
      var e = {
        event: { target: '#lstProviderType' },
        plannedService: { ProviderId: 1 },
      };
      scope.providers = [{ Id: 1, Name: 'Provider1' }];

      scope.providerOnBlur(e);
      expect(e.plannedService.ProviderId).not.toBeNull();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
    });

    it('providerOnBlur should handle Blur event for provider field when findItemByFieldValue returns null', function () {
      var e = {
        event: { target: '#lstProviderType' },
        plannedService: { ProviderId: 1 },
      };
      scope.providers = [{ Id: 1, Name: 'Provider1' }];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      scope.providerOnBlur(e);
      expect(e.plannedService.ProviderId).toBeNull();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
    });

    it('providerOnBlur should do nothing when providers is null', function () {
      var e = {
        event: { target: '#lstProviderType' },
        plannedService: { ProviderId: 1 },
      };
      scope.providers = null;

      scope.providerOnBlur(e);
      expect(listHelper.findItemByFieldValue).not.toHaveBeenCalled();
    });
  });

  describe('PlannedService function ->', function () {
    it('PlannedService should create PlannedService object using passed serviceCode object when passed serviceCode is not null, serviceCode.Fee is zero and DisplayAs is defined', function () {
      var serviceCodeObject = serviceCodeData[0];
      serviceCodeObject.Fee = 0;

      var result = scope.PlannedService(serviceCodeObject);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.DisplayAs).not.toBe('');
      expect(result.Description).not.toBe('');
      expect(result.CdtCodeName).not.toBe('');
      expect(result.ServiceTypeDescription).not.toBe('');
      expect(result.ServiceCodeId).not.toBe('');
      expect(result.AffectedAreaId).not.toBeNull();
      expect(result.Fee).toBe(0.0);
      expect(result.Selected).toEqual(true);
    });

    it('PlannedService should create PlannedService object using passed serviceCode object when passed serviceCode is not null, serviceCode.Fee is non zero and DisplayAs is null', function () {
      var serviceCodeObject = serviceCodeData[0];
      serviceCodeObject.Fee = 10;
      serviceCodeObject.DisplayAs = null;

      var result = scope.PlannedService(serviceCodeObject);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.DisplayAs).not.toBe('');
      expect(result.Description).not.toBe('');
      expect(result.CdtCodeName).not.toBe('');
      expect(result.ServiceTypeDescription).not.toBe('');
      expect(result.ServiceCodeId).not.toBe('');
      expect(result.AffectedAreaId).not.toBeNull();
      expect(result.Fee).toBe(10);
      expect(result.Selected).toEqual(true);
    });

    it('PlannedService should create PlannedService object using passed serviceCode object when passed serviceCode is null', function () {
      var result = scope.PlannedService(null);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.DisplayAs).toBe('');
      expect(result.Description).toBe('');
      expect(result.CdtCodeName).toBe('');
      expect(result.ServiceTypeDescription).toBe('');
      expect(result.ServiceCodeId).toBe('');
      expect(result.AffectedAreaId).toBeNull();
      expect(result.Fee).toBe(0.0);
      expect(result.Selected).toEqual(true);
    });
  });

  describe('validateTooth function ->', function () {
    it('validateTooth should set ToothFirst to false when AffectedAreaId is not equal to 3 or 4', function () {
      var plannedService = { AffectedAreaId: 1, ToothFirst: true };

      expect(plannedService.ToothFirst).toEqual(true);
      scope.validateTooth(plannedService);
      expect(plannedService.ToothFirst).toBe(false);
    });

    it('validateTooth should set ToothFirst to false when Tooth is not defined, Surface is not defined and isSurface is false', function () {
      var plannedService = { AffectedAreaId: 3, ToothFirst: true };
      var isSurface = false;

      expect(plannedService.ToothFirst).toEqual(true);
      scope.validateTooth(plannedService, isSurface);
      expect(plannedService.ToothFirst).toBe(false);
    });

    it('validateTooth should set ToothFirst to false when Tooth defined and isSurface is false', function () {
      var plannedService = { AffectedAreaId: 3, ToothFirst: true, Tooth: 3 };
      var isSurface = false;

      expect(plannedService.ToothFirst).toEqual(true);
      scope.validateTooth(plannedService, isSurface);
      expect(plannedService.ToothFirst).toBe(false);
    });

    it('validateTooth should set ToothFirst to true and clear Surface when Tooth defined and isSurface is true', function () {
      var plannedService = { AffectedAreaId: 3, ToothFirst: true, Tooth: '' };
      var isSurface = true;

      expect(plannedService.ToothFirst).toEqual(true);
      scope.validateTooth(plannedService, isSurface);
      expect(plannedService.ToothFirst).toBe(true);
      expect(plannedService.Surface).toEqual('');
    });

    it('validateTooth should set ToothFirst to true and clear Surface when Surface defined and isSurface is true', function () {
      var plannedService = {
        AffectedAreaId: 3,
        ToothFirst: true,
        Surface: 'sur',
      };
      var isSurface = true;

      expect(plannedService.ToothFirst).toEqual(true);
      scope.validateTooth(plannedService, isSurface);
      expect(plannedService.ToothFirst).toBe(true);
      expect(plannedService.Surface).toEqual('');
    });
  });

  describe('Watch plannedServices ->', function () {
    beforeEach(function () {
      scope.hasDataChanged = false;

      scope.$watch(
        'plannedServices',
        function () {
          if (scope.hasDataChanged == false) {
            scope.plannedServices.forEach(function (service) {
              var nomatches = scope.plannedServicesInitial.filter(function (f) {
                return (
                  f.ProviderId == service.ProviderId &&
                  f.CreationDate.toLocaleDateString ==
                    service.CreationDate.toLocaleDateString &&
                  f.Tooth.toLowerCase() == service.Tooth.toLowerCase() &&
                  f.Surface.toLowerCase() == service.Surface.toLowerCase() &&
                  f.Fee == service.Fee
                );
              });
              scope.hasDataChanged = nomatches.length ? false : true;
            });
          }
        },
        true
      );
    });

    it('should set hasDataChanged to false if data has not changed', function () {
      scope.plannedServices = serviceCodeData;
      scope.plannedServicesInitial = serviceCodeData;
      scope.$digest();
      expect(scope.hasDataChanged).toEqual(false);
    });

    it('should set hasDataChanged to true if data has changed', function () {
      scope.plannedServices = serviceCodeData;
      scope.plannedServicesInitial = serviceCodeData;
      scope.$digest();
      scope.plannedServices[0].CreationDate = '5\5\2015';
      scope.plannedServices[1].CreationDate = '5\5\2015';
      scope.plannedServices[0].ProviderId = 5;
      scope.plannedServices[1].ProviderId = 6;
      scope.$digest();
      expect(scope.hasDataChanged).toEqual(false);
    });
  });

  describe('Watch defaultDate ->', function () {
    beforeEach(function () {
      scope.$watch('defaultDate', function (nv, ov) {
        if (nv && nv != ov) {
          if (!scope.editableDate) {
            angular.forEach(scope.plannedServices, function (item) {
              item.CreationDate = nv;
            });
          }
        }
      });
    });

    it('should not update CreationDate when defaultDate is not changed', function () {
      scope.plannedServices = [{ CreationDate: 2 }, { CreationDate: 3 }];
      scope.defaultDate = 1;
      scope.$digest();
      expect(scope.plannedServices[0].CreationDate).toEqual(2);
      expect(scope.plannedServices[1].CreationDate).toEqual(3);
    });

    it('should update CreationDate when defaultDate is changed', function () {
      scope.defaultDate = 1;
      scope.$digest();
      scope.plannedServices = [{ CreationDate: 2 }, { CreationDate: 3 }];
      scope.defaultDate = 5;
      scope.$digest();
      expect(scope.plannedServices[0].CreationDate).toEqual(5);
      expect(scope.plannedServices[1].CreationDate).toEqual(5);
    });
  });

  describe('On kendoWidgetCreated event ->', function () {
    beforeEach(function () {
      data = {
        indexOf: jasmine.createSpy().and.returnValue(1),
      };
      var elementmock = {
        attr: jasmine.createSpy().and.returnValue(data),
      };
      var widthmock = {
        width: jasmine.createSpy().and.returnValue(1),
      };
      widget = {
        element: jasmine.createSpy().and.returnValue(elementmock),
        list: jasmine.createSpy().and.returnValue(widthmock),
        ns: '.kendoComboBox',
      };
      scope.$emit('kendoWidgetCreated', 'event', widget);
      expect(widget.element).toHaveBeenCalled();
      expect(widget.element.attr.indexOf).toHaveBeenCalled();
    });
  });

  describe('initializePlannedServices  function ->', function () {
    it('should create copy of plannedservice if already exists', function () {
      scope.plannedServices = [{ Id: 1 }, { Id: 2 }];

      scope.initializePlannedServices();
      expect(scope.plannedServicesInitial).toEqual(scope.plannedServices);
      expect(scope.editMode).toBe(true);
      expect(scope.validateFlag).toBe(false);
    });

    it('should create blank array of plannedservice if not exists', function () {
      scope.initializePlannedServices();
      expect(scope.plannedServices).toBeDefined();
    });
  });

  describe('plannedServiceIsValid  function ->', function () {
    beforeEach(function () {
      var find = {
        focus: jasmine.createSpy(),
      };
      var data = {
        focus: jasmine.createSpy(),
      };
      element = {
        focus: jasmine.createSpy(),
        find: jasmine.createSpy().and.returnValue(find),
        data: jasmine.createSpy().and.returnValue(data),
      };
      spyOn(angular, 'element').and.returnValue(element);
    });

    it('should return false when CreationDate is not defined', function () {
      var plannedService = {};
      ctrl.elementIndex = 0;
      var result = ctrl.plannedServiceIsValid(plannedService);
      expect(
        angular.element('#inpServiceCodeDate' + ctrl.elementIndex).find('input')
          .focus
      ).not.toHaveBeenCalled();
      timeout.flush(0);
      expect(
        angular.element('#inpServiceCodeDate' + ctrl.elementIndex).find('input')
          .focus
      ).toHaveBeenCalled();
      expect(result).toEqual(false);
    });

    it('should return false when ValidDate is false', function () {
      var plannedService = { CreationDate: '06/06/2015', ValidDate: false };

      var result = ctrl.plannedServiceIsValid(plannedService);
      expect(
        angular.element('#inpServiceCodeDate' + ctrl.elementIndex).find('input')
          .focus
      ).not.toHaveBeenCalled();
      timeout.flush(0);
      expect(
        angular.element('#inpServiceCodeDate' + ctrl.elementIndex).find('input')
          .focus
      ).toHaveBeenCalled();
      expect(result).toEqual(false);
    });

    it('should return false when AffectedAreaId is not equal to 1 and Tooth  is blank', function () {
      var plannedService = {
        CreationDate: '06/06/2015',
        ValidDate: true,
        AffectedAreaId: 0,
        Tooth: '',
      };
      ctrl.elementIndex = 0;
      var result = ctrl.plannedServiceIsValid(plannedService);
      expect(
        angular.element('#inpTooth' + ctrl.elementIndex).focus
      ).not.toHaveBeenCalled();
      timeout.flush(0);
      expect(
        angular.element('#inpTooth' + ctrl.elementIndex).focus
      ).toHaveBeenCalled();
      expect(result).toEqual(false);
    });

    it('should return false when AffectedAreaId is  equal to 3 and Surface  is blank', function () {
      var plannedService = {
        CreationDate: '06/06/2015',
        ValidDate: true,
        AffectedAreaId: 3,
        Tooth: 'a',
        Surface: '',
      };
      ctrl.elementIndex = 0;
      var result = ctrl.plannedServiceIsValid(plannedService);
      expect(
        angular.element('#inpSurface' + ctrl.elementIndex).focus
      ).not.toHaveBeenCalled();
      timeout.flush(0);
      expect(
        angular.element('#inpSurface' + ctrl.elementIndex).focus
      ).toHaveBeenCalled();
      expect(result).toEqual(false);
    });

    it('should return false when ProviderId  is blank', function () {
      var plannedService = {
        CreationDate: '06/06/2015',
        ValidDate: true,
        AffectedAreaId: 0,
        Tooth: 'a',
        Surface: 'b',
        ProviderId: '',
      };
      ctrl.elementIndex = 0;
      var result = ctrl.plannedServiceIsValid(plannedService);
      expect(
        angular
          .element('#lstProvider' + ctrl.elementIndex)
          .data('kendoComboBox').focus
      ).not.toHaveBeenCalled();
      timeout.flush(0);
      expect(
        angular
          .element('#lstProvider' + ctrl.elementIndex)
          .data('kendoComboBox').focus
      ).toHaveBeenCalled();
      expect(result).toEqual(false);
    });

    it('should return false when Fee   is -1', function () {
      var plannedService = {
        CreationDate: '06/06/2015',
        ValidDate: true,
        AffectedAreaId: 0,
        Tooth: 'a',
        Surface: 'b',
        ProviderId: 'c',
        Fee: -1,
      };
      ctrl.elementIndex = 0;
      var result = ctrl.plannedServiceIsValid(plannedService);
      expect(
        angular.element('#inpFee' + ctrl.elementIndex).focus
      ).not.toHaveBeenCalled();
      timeout.flush(0);
      expect(
        angular.element('#inpFee' + ctrl.elementIndex).focus
      ).toHaveBeenCalled();
      expect(result).toEqual(false);
    });

    it('should return true when plannedService object is valid', function () {
      var plannedService = {
        CreationDate: '06/06/2015',
        ValidDate: true,
        AffectedAreaId: 0,
        Tooth: 'a',
        Surface: 'b',
        ProviderId: 'c',
        Fee: 1,
      };

      var result = ctrl.plannedServiceIsValid(plannedService);
      expect(result).toEqual(true);
    });
  });
});

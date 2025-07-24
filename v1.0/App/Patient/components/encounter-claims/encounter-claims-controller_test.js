import { of } from 'rsjs';

describe('EncounterClaimsController ->', function () {
  var ctrl,
    scope,
    rootScope,
    window,
    location,
    sce,
    q,
    filter,
    localize,
    listHelper,
    toastrFactory,
    timeZoneFactory,
    modalFactory,
    commonServices,
    patSecurityService,
    referenceDataService,
    adjustmentTypesService,
    locationServices;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function (
    $controller,
    $rootScope,
    $location,
    $sce,
    $q,
    $filter
  ) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    location = $location;
    sce = $sce;
    q = $q;
    filter = $filter;

    //mock for localize functionality
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.returnValue(''),
    };

    //mock for listHelper functionality
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(0),
    };

    //mock for toaster functionality
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock for timezone functionality
    timeZoneFactory = {
      ConvertDateToMomentTZ: jasmine
        .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
        .and.callFake(function (date) {
          return moment(date);
        }),
      ConvertDateTZString: jasmine
        .createSpy('timeZoneFactory.ConvertDateTZString')
        .and.returnValue(''),
    };

    //mock for modalFactory functionality
    modalFactory = {
      Modal: jasmine
        .createSpy()
        .and.returnValue({ result: { then: function () {} } }),
    };

    //mock for commonServices functionality
    commonServices = {
      Insurance: {
        ClaimPdf: jasmine
          .createSpy('commonServices.Insurance.ClaimPdf')
          .and.returnValue({ then: jasmine.createSpy() }),
      },
    };

    //mock for patSecurityService functionality
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine
        .createSpy('patSecurityService.generateMessage')
        .and.returnValue(''),
    };

    //mock for serviceTypesService functionality
    referenceDataService = {
      getData: jasmine.createSpy().and.callFake(function () {
        return $q.resolve([]);
      }),
      entityNames: {
        serviceTypes: 'serviceTypes',
      },
    };

    //mock for adjustmentTypesService functionality
    adjustmentTypesService = {
      get:jasmine.createSpy()
      .and.returnValue({
        then: function () {},            
      })
    };

    //mock for locationServices functionality
    locationServices = {
      get: jasmine
        .createSpy('locationServices.get')
        .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
    };

    window = {};

    ctrl = $controller('EncounterClaimsController', {
      $scope: scope,
      $rootScope: rootScope,
      $window: window,
      $location: location,
      $sce: sce,
      $q: q,
      $filter: filter,
      localize: localize,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
      TimeZoneFactory: timeZoneFactory,
      ModalFactory: modalFactory,
      CommonServices: commonServices,
      patSecurityService: patSecurityService,
      referenceDataService: referenceDataService,
      NewAdjustmentTypesService: adjustmentTypesService,
      LocationServices: locationServices
    });
  }));

  //controller
  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('previewPdf function ->', function () {
    beforeEach(function () {
      window.open = jasmine.createSpy().and.returnValue({
        document: { write: function () {} },
      });
    });

    it('should call commonServices.Insurance.ClaimPdf', function () {
      var claim = { Status: 1, Type: 1, ClaimId: 1, PatientName: 'Patient' };
      scope.previewPdf(claim);
      expect(commonServices.Insurance.ClaimPdf).toHaveBeenCalled();
    });
  });

  describe('getAdjustmentTypes function ->', function () {
    it('should call adjustmentTypesService.get with active=false', function () {
      ctrl.getAdjustmentTypes();
      expect(adjustmentTypesService.get).toHaveBeenCalled();
      expect(adjustmentTypesService.get.calls.count()).toEqual(1);
      expect(adjustmentTypesService.get.calls.first().args[0]).toEqual({
        active: false,
      });
    });
  });

  describe('getLocations function ->', function () {
    it('should call locationServices.get', function () {
      ctrl.getLocations();
      expect(locationServices.get).toHaveBeenCalled();
    });
  });

  describe('getUserLocation function ->', function () {
    it('should call listHelper.findItemByFieldValue', function () {
      sessionStorage.setItem(
        'userLocation',
        JSON.stringify({ userLocationId: { id: 1 } })
      );
      ctrl.getUserLocation();
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
    });
  });

  describe('getLocationNameLine1 function ->', function () {
    it('should call listHelper.findItemByFieldValue', function () {
      ctrl.getLocationNameLine1(1);
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
    });
  });

  describe('getNameForTheEnteredByUserId function ->', function () {
    it('should call listHelper.findItemByFieldValue', function () {
      ctrl.getNameForTheEnteredByUserId(1);
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
    });
  });

  describe('loadModal function ->', function () {
    beforeEach(function () {
      scope.serviceTransaction = { LocationId: 1 };
      scope.providers = [
        { Locations: { LocationId: 1 }, ProviderTypeId: 1 },
        { Locations: { LocationId: 2 }, ProviderTypeId: 2 },
      ];
      scope.encounter = { Date: '' };
      sessionStorage.setItem(
        'userLocation',
        JSON.stringify({ userLocationId: { id: 1 } })
      );
    });

    it('should authorize hasViewOrEditAccessToServiceTransaction by soarAuthSvcTrViewKey if transactiontype is 1', function () {
      var transaction = { TransactionTypeId: 1 };
      ctrl.loadModal(transaction);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(scope.soarAuthSvcTrViewKey);
      expect(ctrl.hasViewOrEditAccessToServiceTransaction).toEqual(true);
    });

    it('should authorize hasViewOrEditAccessToServiceTransaction by soarAuthEditTrViewKey if transactiontype is 5 or 6', function () {
      var transaction = { TransactionTypeId: 5 };
      ctrl.loadModal(transaction);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(scope.soarAuthEditTrViewKey);
      expect(ctrl.hasViewOrEditAccessToServiceTransaction).toEqual(true);
    });

    it('should not authorize hasViewOrEditAccessToServiceTransaction if transactiontype is not 1, 5 or 6', function () {
      var transaction = { TransactionTypeId: 2 };
      ctrl.loadModal(transaction);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).not.toHaveBeenCalled();
      expect(ctrl.hasViewOrEditAccessToServiceTransaction).toEqual(false);
    });

    it('should load modal if hasViewOrEditAccessToServiceTransaction is true', function () {
      var transaction = { TransactionTypeId: 1 };
      spyOn(Array.prototype, 'filter').and.callThrough();
      ctrl.loadModal(transaction);
      expect(Array.prototype.filter).toHaveBeenCalled();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should not load modal if hasViewOrEditAccessToServiceTransaction is false', function () {
      var transaction = { TransactionTypeId: 2 };
      spyOn(Array.prototype, 'filter').and.callThrough();
      ctrl.loadModal(transaction);
      expect(Array.prototype.filter).not.toHaveBeenCalled();
      expect(modalFactory.Modal).not.toHaveBeenCalled();
    });

    it('should call notifyNotAuthorized with soarAuthSvcTrViewKey if not authorized and transactiontype is 1', function () {
      var transaction = { TransactionTypeId: 1 };
      patSecurityService.IsAuthorizedByAbbreviation.and.returnValue(false);
      spyOn(ctrl, 'notifyNotAuthorized');
      ctrl.loadModal(transaction);
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalledWith(
        scope.soarAuthSvcTrViewKey
      );
    });

    it('should call notifyNotAuthorized with soarAuthEditTrViewKey if not authorized and transactiontype is 5 or 6', function () {
      var transaction = { TransactionTypeId: 6 };
      patSecurityService.IsAuthorizedByAbbreviation.and.returnValue(false);
      spyOn(ctrl, 'notifyNotAuthorized');
      ctrl.loadModal(transaction);
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalledWith(
        scope.soarAuthEditTrViewKey
      );
    });
  });

  describe('notifyNotAuthorized function ->', function () {
    it('should call toastrFactory.error and redirect location', function () {
      var authMessageKey = 'error';
      ctrl.notifyNotAuthorized(authMessageKey);
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(patSecurityService.generateMessage).toHaveBeenCalledWith(
        authMessageKey
      );
      expect(location.path).toHaveBeenCalledWith('/');
    });
  });
});

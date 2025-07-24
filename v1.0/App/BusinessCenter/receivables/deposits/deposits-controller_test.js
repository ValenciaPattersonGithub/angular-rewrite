describe('deposits-controller ->', function () {
  var scope,
    timeout,
    filter,
    modalFactory,
    depositGridFactory,
    locationServices,
    depositService,
    toastrFactory,
    localize,
    listHelper,
    q,
    deferred,
    ctrl;

  // #region Setup

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $filter,
    $controller,
    $q,
    _ListHelper_
  ) {
    scope = $rootScope.$new();

    filter = $filter;
    q = $q;
    deferred = q.defer();
    listHelper = _ListHelper_;

    modalFactory = {
      Modal: jasmine.createSpy(),
    };

    depositGridFactory = {
      getOptions: jasmine.createSpy().and.callFake(function () {
        return {
          updateOnInit: true,
          query: {},
          pageSize: 0,
          actions: {},
          successAction: jasmine.createSpy(),
          updateFilter: jasmine.createSpy(),
          failAction: jasmine.createSpy(),
          additionalFilters: [],
          columnDefinition: [
            {
              title: 'Date',
              field: 'DepositDate',
              fieldFrom: 'DepositDateFrom',
              fieldTo: 'DepositDateTo',
              filterable: true,
              sortable: true,
              type: 'date-range',
              size: '2',
              template: [null],
            },
            {
              title: 'Bank',
              field: 'BankAccount',
              filterable: true,
              sortable: true,
              size: '2',
              template: [null],
            },
            {
              title: 'Account Number',
              field: 'BankAccountNumber',
              filterable: true,
              sortable: true,
              disabled: false,
              template: [null],
              size: '1',
            },
            {
              title: 'Routing Number',
              field: 'RoutingNumber',
              filterable: true,
              sortable: true,
              tooltipmsg: '',
              template: [null],
              size: '2',
            },
            {
              title: 'Deposited By',
              field: 'DepositedBy',
              filterable: true,
              sortable: true,
              size: '2',
            },
            {
              title: 'Total',
              field: 'Total',
              fieldFrom: 'TotalFrom',
              fieldTo: 'TotalTo',
              filterable: true,
              sortable: true,
              type: 'number-range',
              size: '3',
              template: [null],
            },
          ],
          refresh: jasmine.createSpy(),
        };
      }),
    };

    locationServices = {
      getPermittedLocations: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    depositService = {
      getDepositDetails: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    var userLocation = JSON.stringify({
      id: 1,
      name: 'Location1Practice1_f',
      practiceid: 1,
      merchantid: '',
      description: '',
      timezone: 'Central Standard Time',
      deactivationTimeUtc: null,
    });
    sessionStorage.setItem('userLocation', userLocation);

    ctrl = $controller('DepositsController', {
      $scope: scope,
      $timeout: timeout,
      $filter: filter,
      ModalFactory: modalFactory,
      LocationServices: locationServices,
      DepositGridFactory: depositGridFactory,
      DepositService: depositService,
      toastrFactory: toastrFactory,
    });
  }));

  // #endregion

  // #region Tests

  describe('initial values ->', function () {
    it('DepositsController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });

    it('depositGridFactory : should call depositGridFactory.getOptions', function () {
      expect(depositGridFactory.getOptions).toHaveBeenCalled();
      expect(depositGridFactory.getOptions.calls.count()).toEqual(1);
      expect(depositGridFactory).not.toBeNull();
    });
    it('location variables: should set initial values', function () {
      expect(scope.locations.length).toEqual(0);
      expect(scope.selectedLocationId).toBeNull();
      expect(scope.selectedLocation).toBeNull();
      expect(scope.locationsLoading).toBeTruthy();
    });
  });

  describe('depositGridOptions ->', function () {
    it('depositGridOptions: should contain data', function () {
      var mockData = {
        dto: {
          Rows: [
            {
              BankAccount: 'Bank B',
              BankAccountNumber: '222222222222222',
              CreditTransactions: [],
              DepositDate: '2017-06-23T13:02:11.185',
              DepositId: 20,
              DepositedBy: 'Alonzo, Jenny',
              RoutingNumber: '333333333',
              Note: 'Test',
              Total: 100,
            },
          ],
        },
      };

      scope.depositGridOptions.successAction(mockData);
      expect(scope.depositGridOptions).not.toBeNull();
      expect(scope.depositRows).toEqual(mockData.dto.Rows);
    });
  });

  describe('ctrl.refreshDepositGrid  ->', function () {
    it('ctrl.refreshDepositGrid  : should refresh grid', function () {
      scope.selectedLocation = { LocationId: 1 };
      ctrl.refreshDepositGrid();
      expect(scope.depositGridOptions.refresh).toHaveBeenCalled();
    });
  });

  describe('ctrl.getLocations ->', function () {
    it('should get list of locations', function () {
      ctrl.getLocationSuccess = jasmine.createSpy();
      ctrl.getLocations();
      deferred.resolve({});
      scope.$apply();
      expect(locationServices.getPermittedLocations).toHaveBeenCalled();
      expect(ctrl.getLocationSuccess).toHaveBeenCalled();
    });
  });

  describe('scope.removeLocation ->', function () {
    it('should remove selected location', function () {
      scope.removeLocation();
      expect(scope.selectedLocationId).toEqual(0);
      expect(scope.selectedLocation).toBeNull();
    });
  });

  describe('scope.toggleIcon ->', function () {
    it('should call depositService.getDepositDetails', function () {
      var row = {};
      var e = {};
      scope.toggleIcon(e, row);
      expect(depositService.getDepositDetails).toHaveBeenCalled();
    });
  });
  //#endregion
});

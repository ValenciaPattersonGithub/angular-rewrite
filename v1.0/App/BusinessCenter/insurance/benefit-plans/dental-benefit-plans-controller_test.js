describe('BenefitPlansController tests -> ', function () {
  var ctrl,
    toastrFactory,
    filter,
    localize,
    rootScope,
    scope,
    businessCenterServices,
    patSecurityService,
    location,
    listHelper,
    $routeParams,
    patientServices,
    event,
    reportsFactory;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    rootScope = $rootScope;
    scope = $rootScope.$new();

    filter = $injector.get('$filter');

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };
    reportsFactory = {
      getReportArrayPromise: jasmine
        .createSpy('getReportArrayPromise')
        .and.callFake(function () {
          return {
            then: function () {},
          };
        }),
    };
    //mock for businessCenterServices
    businessCenterServices = {
      BenefitPlan: {
        get: jasmine.createSpy(),
        search: jasmine.createSpy(),
      },
      FeeSchedule: {
        save: jasmine.createSpy(),
        checkDuplicateFeeScheduleName: jasmine.createSpy(),
        get: jasmine.createSpy(),
      },
      Carrier: {
        get: jasmine.createSpy(),
      },
    };

    //mock for location
    location = {
      path: jasmine.createSpy().and.returnValue(''),
    };

    //mock for patSecurityService
    patSecurityService = {
      generateMessage: jasmine.createSpy().and.returnValue(''),
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    //event mock
    event = {
      preventDefault: jasmine.createSpy(),
    };

    // create controller
    ctrl = $controller('BenefitPlansController', {
      $scope: scope,
      $rootScope: rootScope,
      toastrFactory: toastrFactory,
      localize: localize,
      event: event,
      BusinessCenterServices: businessCenterServices,
      $location: location,
      patSecurityService: patSecurityService,
      PatientServices: {},
      ReportsFactory: reportsFactory,
    });
  }));

  //controller
  it('BenefitPlansController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  // sort criteria
  it('sortCriteria : Should check if Fee Schedule column sort criteria is in ascending/descending order', () => {
    let sortOrder = checkTableSorting('colFeeSchedule', 'FeeScheduleName');
    expect(sortOrder.ascending).toBe(1);
    expect(sortOrder.descending).toBe(2);
  });

  // Helper function - first changeSorting() call will sort in ascending order, second call will sort in descending order.
  const checkTableSorting = (elementIdName, fieldName) => {
    let sortedTable = {
      ascending: 0,
      descending: 0,
    };
    scope.changeSorting(elementIdName, fieldName);
    sortedTable.ascending = ctrl.sortCriteria[fieldName];

    scope.changeSorting(elementIdName, fieldName);
    sortedTable.descending = ctrl.sortCriteria[fieldName];

    return sortedTable;
  };
});

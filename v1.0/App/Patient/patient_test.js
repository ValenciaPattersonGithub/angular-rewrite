describe('Soar.Patient routeProvider -> ', function () {
  var route, scope, location, routeParams, $httpBackend, templateUrl;

  //#region Mocks
  var viewPatientMock = {
    Value: { patientId: 1, firstName: 'John', lastName: 'Doe' },
  };
  var patientPhonesMock = { Value: { phoneNumber: '1234567890' } };
  var createPatientMock = {
    Value: { patientId: null, firstName: null, lastName: null },
  };
  var amfaIds = {
    moduleIds: {
      patient: 'soar-per-perdem-view',
    },
    functionIds: {
      createPatient: 'soar-per-perdem-add', //'64303d1b-e955-46df-a47d-158552a49eb2',220
      editPatient: 'soar-per-perdem-modify', //'64303d1b-e955-46df-a47d-158552a49eb2',220
      viewPatient: 'soar-per-perdem-view', //'893951bf-6b20-4a99-ad8e-674aad7d4b7d',220
      searchPatients: 'soar-per-perdem-search', //'64303d1b-e955-46df-a47d-158552a49eb2'220
      patientDashboard: 'soar-per-perdem-view',
    },
    actionIds: {
      createPatient: 1001, //'e8f7442f-7b77-4e6e-9787-476b76d31781',1001
      editPatient: 1003, //'f9f048f2-4c74-452e-9285-a5de7d86ab3d',1003
      viewPatient: 1004, //'add0650f-912f-4ad3-ac66-63022352fbaa',1004
      searchPatients: 1005, //'93b2a2a5-6fa1-4111-96c3-c46e4fec6023'1005
      patientDashboard: 1000,
    },
  };
  //#endregion

  // access module where config is used
  beforeEach(module('Soar.Patient'));

  // inject $route
  beforeEach(inject(function (
    $route,
    $rootScope,
    $location,
    $routeParams,
    $injector,
    $templateCache
  ) {
    location = $location;
    route = $route;
    routeParams = $routeParams;
    scope = $rootScope;

    // allows location.path declared to find templateUrl in routeProvider
    templateUrl = $templateCache;

    $httpBackend = $injector.get('$httpBackend');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('/Patient/ route -> ', function () {
    var routeUrl = '/Patient/';
    var amfa = 'soar-per-perptm-view';

    it('should map route to templateUrl', function () {
      expect(route.routes[routeUrl].templateUrl).toEqual(
        'App/Patient/patient-landing/patient-landing-w.html'
      );
    });

    it('should set route access', function () {
      var dataMock = { amf: { modules: [amfaIds.moduleIds.patient] } };

      expect(route.routes[routeUrl].data.amf).toEqual(amfa);
    });
  });

  describe('/Patient/Search/:searchString route -> ', function () {
    var routeUrl = '/Patient/Search/:searchString';
    var amfa = 'soar-per-perdem-search';

    it('should map route to templateUrl', function () {
      expect(route.routes[routeUrl].templateUrl).toEqual(
        'App/Patient/patient-search/patient-search.html'
      );
    });

    it('should set controller', function () {
      expect(route.routes[routeUrl].controller).toEqual(
        'PatientSearchController'
      );
    });

    it('should set access', function () {
      expect(route.routes[routeUrl].data.amf).toEqual(amfa);
    });
  });

  describe('/Patient/Create/ route -> ', function () {
    var routeUrl = '/Patient/Create/';
    var amfa = 'soar-per-perdem-add';

    it('should map route to templateUrl', function () {
      expect(route.routes[routeUrl].templateUrl).toEqual(
        'App/Patient/patient-crud/patient-crud.html'
      );
    });

    it('should set controller', function () {
      expect(route.routes[routeUrl].controller).toEqual(
        'PatientCrudController'
      );
    });

    it('should set access', function () {
      expect(route.routes[routeUrl].data.amf).toEqual(amfa);
    });
  });

  describe('/Patient/:patientId/:Category/:panel? route -> ', function () {
    var routeUrl = '/Patient/:patientId/:Category/:panel?';

    it('should map route to templateUrl', function () {
      expect(route.routes[routeUrl].templateUrl).toEqual(
        'App/Patient/patient-profile/patient-overview/patient-dashboard-w.html'
      );
    });

    it('should set controller', function () {
      expect(route.routes[routeUrl].controller).toEqual(
        'PatientDashboardWrapperController'
      );
    });
  });

  describe('/Patient/:patientId/Clinical/MedicalHistoryForm/:formType route ->', function () {
    var routeUrl = '/Patient/:patientId/Clinical/MedicalHistoryForm/:formType';
    var amfa = 'soar-per-perhst-view';

    it('should map route to templateUrl', function () {
      expect(route.routes[routeUrl].templateUrl).toEqual(
        'App/Patient/patient-chart/health/medical-history/medical-history-print/medical-history-print.html'
      );
    });

    it('should set controller', function () {
      expect(route.routes[routeUrl].controller).toEqual(
        'MedicalHistoryPrintController'
      );
    });

    it('should set access', function () {
      expect(route.routes[routeUrl].data.amf).toEqual(amfa);
    });
  });
});

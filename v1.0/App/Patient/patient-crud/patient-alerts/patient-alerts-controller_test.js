// top level test suite
describe('PatientAlertsController ->', function () {
  var scope,
    ctrl,
    location,
    compile,
    localize,
    toastrFactory,
    timeout,
    element,
    $httpBackend;
  var _patientServices_, _masterAlertService_, mockStaticData;
  var routeParams, filter;

  //#region mocks
  var mockPatientAlert = {
    PatientAlertId: null,
    PatientId: null,
    MasterAlertId: null,
    Description: null,
    SymbolId: null,
    ExpirationDate: null,
  };

  var mockMasterAlertsList = [
    { MasterAlertId: 1, Description: 'AlertOne', SymbolId: 1 },
    { MasterAlertId: 2, Description: 'AlertTwo', SymbolId: 2 },
    { MasterAlertId: 3, Description: 'Alert3', SymbolId: 3 },
    { MasterAlertId: 4, Description: 'Alert4', SymbolId: 4 },
    { MasterAlertId: 5, Description: 'Alert5', SymbolId: 5 },
    { MasterAlertId: 6, Description: 'Alert6', SymbolId: 6 },
  ];

  var mockPatientAlertsList = [
    {
      PatientAlertId: 1,
      PatientId: 1,
      MasterAlertId: 2,
      Description: 'AlertTwo',
      SymbolId: 2,
      ExpirationDate: new Date('June 10, 2015'),
    },
    {
      PatientAlertId: 2,
      PatientId: 1,
      MasterAlertId: 3,
      Description: 'Alert3',
      SymbolId: 2,
      ExpirationDate: new Date('July 10, 2015'),
    },
    {
      PatientAlertId: 3,
      PatientId: 1,
      MasterAlertId: 4,
      Description: 'Alert4',
      SymbolId: 2,
      ExpirationDate: new Date('Aug 10, 2015'),
    },
    {
      PatientAlertId: 10,
      PatientId: 1,
      MasterAlertId: 5,
      Description: 'Alert5',
      SymbolId: 1,
      ExpirationDate: new Date('January 1, 2016'),
    },
    {
      PatientAlertId: 11,
      PatientId: 1,
      MasterAlertId: 6,
      Description: 'Alert6',
      SymbolId: 2,
      ExpirationDate: null,
    },
  ];

  var mockSymbolsList = [
    { SymbolId: 1, Class: 'fa-frowny-o' },
    { SymbolId: 2, Class: 'fa-smiley-o' },
    { SymbolId: 3, Class: 'fa-eyey' },
  ];

  mockSymbolsList.getClassById = jasmine
    .createSpy()
    .and.returnValue(mockSymbolsList[0].Class);

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('soar.templates'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      mockStaticData = {
        AlertIcons: jasmine.createSpy().and.returnValue(mockSymbolsList),
      };

      $provide.value('StaticData', mockStaticData);

      _masterAlertService_ = {
        get: jasmine
          .createSpy()
          .and.returnValue({ Value: mockMasterAlertsList }),
      };
      $provide.value('MasterAlertService', _masterAlertService_);

      _patientServices_ = {
        Alerts: {
          get: jasmine
            .createSpy()
            .and.returnValue({ Value: mockPatientAlertsList }),
          create: jasmine.createSpy().and.returnValue(''),
          update: jasmine.createSpy().and.returnValue(''),
          delete: jasmine.createSpy().and.returnValue(''),
        },
      };
      $provide.value('PatientServices', _patientServices_);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $injector,
    $controller,
    $location,
    $routeParams,
    $compile,
    $templateCache
  ) {
    location = $location;
    scope = $rootScope.$new();
    routeParams = $routeParams;
    localize = $injector.get('localize');
    localize.getLocalizedString = jasmine.createSpy().and.returnValue('');
    ctrl = $controller('PatientAlertsController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      localize: localize,
    });
    compile = $compile;
    // allows location.path declared to find templateUrl
    $templateCache.put(
      'App/Common/components/dateSelector/dateSelector.html',
      ''
    );

    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .whenGET(
        'App/Patient/patient-crud/patient-alerts/patient-alerts-dropdown.html'
      )
      .respond(200, '');
    $rootScope.$apply();
  }));

  // $scope.checkForDuplicates references html, so we need the following snippet to test that function.
  var loadHtml = function () {
    element = angular.element(
      '<div ng-form="patientAlertsFrm">' +
        '<div ng-class="{error: (valid == false) && !alert.Description}">' +
        '<textarea id="customAlertDescription" ng-model="alert.Description" class="alerts-textarea" maxlength="264"></textarea>' +
        ' <label id="lblCustomeAlertDescriptionRequired" class="help-text " ng-show="!formIsValid &&' +
        '!patientAlertsFrm.customAlertDescription.$valid && patientAlertsFrm.$error.required">' +
        '{{ "This field is required." | i18n }}</label>' +
        '<div class="col-xs-12 col-md-9">' +
        '</div></div>)'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
    var inpDescription = element.find('#inpDescription');
  };

  describe('when user is authorized - >', function () {
    //#endregion mocks

    // test specs below
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services and factories ', function () {
      expect(_masterAlertService_).not.toBeNull();
      expect(_patientServices_.Alerts).not.toBeNull();
      expect(mockStaticData).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.formIsValid).toBe(true);
      expect(scope.alertSaving).toBe(false);
      expect(scope.inputText).toBe('');
      expect(scope.retrievingAlertList).toEqual(true);
      expect(scope.hasMasterAlertError).toBe(false);
      expect(scope.maxNumberOfAlertsReached).toBe(false);
      expect(scope.patientAlerts).toEqual([]);
      expect(scope.masterAlerts).toEqual([]);
      expect(scope.alert).toEqual({
        PatientAlertId: null,
        MasterAlertId: null,
        Description: '',
        ExpirationDate: null,
        SymbolId: null,
      });
      expect(scope.minDate).toEqual(
        moment().add(1, 'days').startOf('day').toDate()
      );
      expect(scope.maxDate).toEqual(
        moment().add(100, 'years').startOf('day').toDate()
      );
      expect(scope.dropDownText).toBe('');
      expect(scope.symbolList).toEqual(mockSymbolsList);
      expect(localize.getLocalizedString).toHaveBeenCalledWith('Select {0}', [
        'Alert',
      ]);
    });

    describe('getList function ->', function () {
      it('should get a class by symbolid', function () {
        var symbols = mockStaticData.AlertIcons();
        expect(symbols[1].SymbolId).toEqual(mockSymbolsList[1].SymbolId);
      });
    });

    describe('getClass function ->', function () {
      it('should get a class by symbolid', function () {
        var symbolClass = scope.getClass(mockSymbolsList[0].SymbolId);
        expect(mockSymbolsList.getClassById).toHaveBeenCalled();
        expect(symbolClass).toBe(mockSymbolsList[0].Class);
      });
    });

    describe('getMasterAlerts function ->', function () {
      it('successful getMasterAlerts should call service', function () {
        scope.getMasterAlerts();
        expect(_masterAlertService_.get).toHaveBeenCalled();
      });

      it('masterAlertServiceGetSuccess should populate masterAlerts', function () {
        scope.loading = true;
        scope.masterAlertServiceGetSuccess({ Value: mockMasterAlertsList });
        expect(scope.masterAlerts).toEqual(mockMasterAlertsList);
      });

      it('masterAlertServiceGetFailure should set masterAlerts to empty array', function () {
        scope.loading = true;
        scope.masterAlertServiceGetFailure();
        expect(scope.masterAlerts).toEqual([]);
      });

      it('masterAlertServiceGetFailure should call toastr error', function () {
        scope.masterAlertServiceGetFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('getAlerts function ->', function () {
      it('patientAlertsServiceGetSuccess should populate patientAlerts', function () {
        scope.patientAlertsServiceGetSuccess({ Value: mockPatientAlertsList });
        expect(scope.patientAlerts).toEqual(mockPatientAlertsList);
      });

      it('patientAlertsServiceGetFailure should set patientAlerts to empty array', function () {
        scope.patientAlertsServiceGetFailure();
        expect(scope.patientAlerts).toEqual([]);
      });

      it('patientAlertsServiceGetFailure should call toastr error', function () {
        scope.patientAlertsServiceGetFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('$watch selectedId -> ', function () {
      it('should call selectAlert function', function () {
        spyOn(scope, 'selectAlert');
        scope.selectedId = '1234';
        scope.$apply();

        expect(scope.selectAlert).toHaveBeenCalled();
      });
    });

    describe('selectAlert function ->', function () {
      it('should set alertSaving to false if masterListAlertId is minus one', function () {
        var masterListAlert = { MasterListId: -1 };
        scope.selectAlert(masterListAlert);
        expect(scope.alertSaving).toBe(false);
      });

      it('should set inputText to masterListAlert Description if masterListAlertId not minus one', function () {
        var masterListAlert = { MasterAlertId: 2, Description: 'AlertTwo' };
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        scope.selectAlert(masterListAlert);
        expect(scope.inputText).toBe('AlertTwo');
      });

      it('should set hasMasterAlertError true if masterListAlertId is already in patientAlerts', function () {
        var masterListAlert = { MasterAlertId: 2, Description: 'AlertTwo' };
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        scope.selectAlert(masterListAlert);
        expect(scope.hasMasterAlertError).toBe(true);
      });

      it('should set hasMasterAlertError false if masterListAlertId is already in patientAlerts', function () {
        var masterListAlert = { MasterAlertId: 8, Description: 'Alert8' };
        spyOn(scope, 'save');
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        scope.selectAlert(masterListAlert);
        expect(scope.hasMasterAlertError).toBe(false);
        expect(scope.save).toHaveBeenCalledWith(masterListAlert);
      });
    });

    describe('clearAlert function ->', function () {
      it('should set alert to empty object', function () {
        spyOn(scope, 'clearAlert');
        scope.clearAlert();
        expect(scope.alert).toEqual({
          PatientAlertId: null,
          MasterAlertId: null,
          Description: '',
          ExpirationDate: null,
          SymbolId: null,
        });
      });
    });

    describe('save function ->', function () {
      it('should call validateForm if MasterAlertId is null ', function () {
        var masterListAlert = {
          MasterAlertId: null,
          Description: 'Alert5',
          SymbolId: 2,
        };
        routeParams.patientId = 1;
        spyOn(scope, 'validateForm');
        scope.save(masterListAlert);
        expect(scope.validateForm).toHaveBeenCalled();
      });

      it('should set hasErrors true if form is invalid', function () {
        var masterListAlert = {
          MasterAlertId: null,
          Description: '',
          SymbolId: 2,
        };
        routeParams.patientId = 1;
        scope.save(masterListAlert);
        expect(scope.formIsValid).toBe(false);
        expect(scope.hasErrors).toBe(true);
      });

      it('should set hasErrors false if form is valid', function () {
        var masterListAlert = {
          MasterAlertId: 1,
          Description: 'Alert5',
          SymbolId: 2,
        };
        routeParams.patientId = 1;
        scope.save(masterListAlert);
        expect(scope.formIsValid).toBe(true);
        expect(scope.hasErrors).toBe(false);
      });

      it('should call patientAlertService create if form is valid', function () {
        var masterListAlert = {
          MasterAlertId: 1,
          Description: 'Alert5',
          SymbolId: 2,
        };
        routeParams.patientId = 1;
        scope.save(masterListAlert);
        expect(_patientServices_.Alerts.create).toHaveBeenCalled();
      });
    });

    describe('patientAlertsServiceCreateSuccess function ->', function () {
      it('should add alert to patientAlerts ', function () {
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        expect(scope.patientAlerts.length).toBe(5);
        var patientAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: 'Alert5',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        scope.patientAlertsServiceCreateSuccess({ Value: patientAlert });
        expect(scope.patientAlerts.length).toBe(6);
      });

      it('should call reset properties ', function () {
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        var patientAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: 'Alert5',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        scope.patientAlertsServiceCreateSuccess({ Value: patientAlert });

        expect(scope.alertSaving).toBe(false);
        expect(scope.hasMasterAlertError).toBe(false);
      });

      it('should call clearAlert', function () {
        spyOn(scope, 'clearAlert');
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        var patientAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: 'Alert5',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        scope.patientAlertsServiceCreateSuccess({ Value: patientAlert });
        expect(scope.clearAlert).toHaveBeenCalled();
      });

      it('should call toastrFactory success', function () {
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        var patientAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: 'Alert5',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        scope.patientAlertsServiceCreateSuccess({ Value: patientAlert });
        expect(toastrFactory.success).toHaveBeenCalled();
      });
    });

    describe('patientAlertsServiceCreateFailure function ->', function () {
      it('should call toastrFactory failure', function () {
        scope.patientAlertsServiceCreateFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
        expect(scope.alertSaving).toBe(false);
      });
    });

    describe('delete function ->', function () {
      it('should call  ', function () {
        var params = { PatientId: 1, Id: 1 };
        scope.delete(alert);
        expect(_patientServices_.Alerts.delete).toHaveBeenCalledWith(
          jasmine.any(Function),
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });
    });

    describe('patientAlertsServiceDeleteSuccess function ->', function () {
      it('should remove deleted alert from patientAlerts ', function () {
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        expect(scope.patientAlerts.length).toBe(5);
        var alertToDelete = mockPatientAlertsList[0];
        scope.patientAlertsServiceDeleteSuccess(alertToDelete);
        expect(scope.patientAlerts.length).toBe(4);
      });

      it('should call toastrFactory success', function () {
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        var alertToDelete = mockPatientAlertsList[0];
        scope.patientAlertsServiceDeleteSuccess(alertToDelete);
        expect(toastrFactory.success).toHaveBeenCalled();
      });
    });

    describe('patientAlertsServiceDeleteFailure function ->', function () {
      it('should call toastrFactory failure', function () {
        scope.patientAlertsServiceDeleteFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
        expect(scope.alertSaving).toBe(false);
      });
    });

    describe('cancel function ->', function () {
      it('should call clearAlert and reset formIsValid', function () {
        spyOn(scope, 'clearAlert');
        scope.cancel();
        expect(scope.clearAlert).toHaveBeenCalled();
        expect(scope.formIsValid).toBe(true);
      });
    });

    describe('alert Description watch - >', function () {
      it('should call validateForm function with new and old values', function () {
        loadHtml();
        spyOn(scope, 'validateForm');
        scope.alert = { Description: 'Alert3' };
        scope.$apply();
        expect(scope.validateForm).toHaveBeenCalled();
      });
    });

    describe('validateForm function - >', function () {
      it('should set formIsValid to false if Description is blank', function () {
        loadHtml();
        scope.alert = {
          Description: '',
          ExpirationDate: new Date('June 10, 2016'),
        };
        scope.$apply();
        scope.validateForm();
        expect(scope.formIsValid).toBe(false);
      });

      it('should set formIsValid to true if ExpirationDate is valid and Description not null', function () {
        scope.alert = {
          Description: 'AlertOne',
          ExpirationDate: new Date('June 10, 2016'),
        };
        scope.validExpDate = true;
        scope.validateForm();
        expect(scope.formIsValid).toBe(true);
      });

      it('should set formIsValid to false if ExpirationDate is invalid', function () {
        loadHtml();
        scope.validExpDate = false;
        scope.alert = {
          Description: 'AlertOne',
          ExpirationDate: new Date('June 10, 2012'),
        };
        scope.$apply();

        scope.validateForm();
        expect(scope.formIsValid).toBe(false);
      });
    });

    describe('filterMasterAlerts function - >', function () {
      it('should set return true if masterAlert not in patientAlerts', function () {
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        scope.masterAlerts = angular.copy(mockMasterAlertsList);
        var alert = scope.masterAlerts[0];
        expect(scope.filterMasterAlerts(alert)).toBe(true);
      });

      it('should set return false if masterAlert in patientAlerts', function () {
        scope.patientAlerts = [];
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        scope.masterAlerts = angular.copy(mockMasterAlertsList);
        var alert = scope.masterAlerts[2];
        expect(scope.filterMasterAlerts(alert)).toBe(false);
      });
    });

    describe('patientAlerts length watch - >', function () {
      it('should call validateForm function with new and old values', function () {
        spyOn(scope, 'getAlertCollection');
        scope.patientAlerts.push({
          PatientAlertId: 1,
          PatientId: 1,
          MasterAlertId: 7,
          Description: 'AlertTwo',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        });
        scope.$apply();
        expect(scope.getAlertCollection).toHaveBeenCalled();
      });
    });

    describe('getAlertCollection function ->', function () {
      it('should set alertCarousel length to reflect number of pages in carousel based on size', function () {
        // set alertCarousel to 3 alerts per page
        var alertsPerPage = 3;
        scope.patientAlerts = angular.copy(mockPatientAlertsList);
        expect(scope.patientAlerts.length).toBe(5);
        scope.getAlertCollection(alertsPerPage);
        expect(scope.alertCarousel.length).toBe(2);

        scope.patientAlerts.push({
          PatientAlertId: 1,
          PatientId: 1,
          MasterAlertId: 2,
          Description: 'AlertTwo',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        });
        expect(scope.patientAlerts.length).toBe(6);
        scope.getAlertCollection(alertsPerPage);
        expect(scope.alertCarousel.length).toBe(2);

        scope.patientAlerts.push({
          PatientAlertId: 1,
          PatientId: 1,
          MasterAlertId: 2,
          Description: 'AlertTwo',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        });
        expect(scope.patientAlerts.length).toBe(7);
        scope.getAlertCollection(alertsPerPage);
        expect(scope.alertCarousel.length).toBe(3);
      });
    });

    describe('refreshCarousel function ->', function () {
      it('should ', function () {});
    });

    /*
         * // Allows carousel to be 'responsive'. Will adjust how many can be shown at a time based on window size 
            // Since we manually create the collections
            angular.element($window).bind('resize', function () {
                $scope.refreshCarousel();
                $scope.$digest();
            });

            // refresh carousel
            $scope.refreshCarousel = function () {
                var windowWidth = $window.innerWidth;
                var minMobileWidth = 320;
                // Fudge factor for better responsive layout
                var fudge = windowWidth < 900 ? 275 : 200;
                // Dividing by minimum mobile width + additional styling fudge
                var size = Math.round(windowWidth / (minMobileWidth + fudge));
                if ($scope.collectionSize != size) {
                    // desktop
                    $scope.collectionSize = size;
                    $scope.getAlertCollection($scope.collectionSize);
                }
            };

            
         */
  });
});

describe('patient-preferences-controller test ->', function () {
  var ctrl, scope, routeParams, toastrFactory, localize, referenceDataService;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
    })
  );

  var locationsMock, usersMock, patientUpdateMock, preferencesMock;
  //#region Mocks

  locationsMock = [{ LocationId: 1 }, { LocationId: 2 }, { LocationId: 3 }];

  // Adding Locations to mock
  usersMock = [
    {
      UserId: 1,
      ProviderTypeId: 1,
      IsActive: true,
      Locations: [
        { UserId: 1, LocationId: 1, ProviderTypeId: 1, IsActive: true },
        { UserId: 1, LocationId: 2, ProviderTypeId: 1, IsActive: true },
        { UserId: 1, LocationId: 3, ProviderTypeId: 1, IsActive: true },
      ],
    },
    {
      UserId: 2,
      ProviderTypeId: 1,
      IsActive: true,
      Locations: [
        { UserId: 2, LocationId: 1, ProviderTypeId: 1, IsActive: true },
        { UserId: 2, LocationId: 2, ProviderTypeId: 1, IsActive: true },
        { UserId: 2, LocationId: 3, ProviderTypeId: 1, IsActive: true },
      ],
    },
    {
      UserId: 3,
      ProviderTypeId: 1,
      IsActive: true,
      Locations: [
        { UserId: 3, LocationId: 1, ProviderTypeId: 2, IsActive: true },
        { UserId: 3, LocationId: 2, ProviderTypeId: 2, IsActive: true },
      ],
    },
    {
      UserId: 4,
      ProviderTypeId: 2,
      IsActive: true,
      Locations: [
        { UserId: 4, LocationId: 2, ProviderTypeId: 2, IsActive: true },
        { UserId: 4, LocationId: 3, ProviderTypeId: 2, IsActive: true },
      ],
    },
    {
      UserId: 5,
      ProviderTypeId: 2,
      IsActive: true,
      Locations: [
        { UserId: 5, LocationId: 1, ProviderTypeId: 1, IsActive: true },
        { UserId: 5, LocationId: 2, ProviderTypeId: 1, IsActive: true },
        { UserId: 5, LocationId: 3, ProviderTypeId: 1, IsActive: true },
      ],
    },
    {
      UserId: 6,
      ProviderTypeId: 2,
      IsActive: true,
      Locations: [
        { UserId: 6, LocationId: 1, ProviderTypeId: 1, IsActive: true },
        { UserId: 6, LocationId: 2, ProviderTypeId: 1, IsActive: true },
        { UserId: 6, LocationId: 3, ProviderTypeId: 1, IsActive: true },
      ],
    },
  ];

  patientUpdateMock = {
    PatientId: 1,
    PreferredLocationId: 1,
    PreferredDentist: 1,
    PreferredHygienist: 2,
  };

  preferencesMock = {
    PreferredLocation: 1,
    PreferredDentist: 1,
    PreferredHygienist: 2,
  };

  //#endregion

  var listHelper,
    locationServices,
    userServices,
    personServices,
    usersFactory,
    timeZoneFactory,
    saveStates,
    rolesFactory,
    locationService,
    modalFactory;

  //#region Spies

  listHelper = {
    findItemByFieldValue: function (array, string, value) {
      if (value == '') return null;
      else return value;
    },
  };

  var patCacheFactory;
  var patientOverviewCache = {};
  beforeEach(
    module('Soar.Common', function () {
      patCacheFactory = {
        ClearCache: jasmine.createSpy().and.callFake(function () {}),
        GetCache: jasmine.createSpy().and.callFake(function () {
          return patientOverviewCache;
        }),
      };
    })
  );

  beforeEach(
    module('Soar.BusinessCenter', function () {
      locationServices = {
        get: jasmine.createSpy().and.returnValue(locationsMock),
      };

      userServices = {
        Users: {
          get: jasmine.createSpy().and.returnValue(usersMock),
        },
      };
    })
  );

  //#endregion

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $routeParams,
    $q,
    $timeout,
    $filter
  ) {
    scope = $rootScope.$new();
    scope.preferences = preferencesMock;
    scope.tempPerson = { Profile: {} };

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (string) {
          return string;
        }),
    };

    personServices = {
      Persons: {
        get: jasmine.createSpy('personServices.get').and.returnValue({
          $promise: {
            then: jasmine.createSpy().and.returnValue({
              then: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy().and.returnValue({
                  then: jasmine.createSpy().and.returnValue({
                    then: jasmine.createSpy().and.returnValue({
                      then: jasmine.createSpy().and.returnValue({
                        then: jasmine.createSpy().and.callFake(function () {
                          scope.loading = false;
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          },
        }),
        update: jasmine.createSpy('personServices.update'),
      },
    };

    //mock for usersFactory
    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    timeZoneFactory = {
      GetTimeZoneAbbr: jasmine
        .createSpy('timeZoneFactory.GetTimeZoneAbbr')
        .and.returnValue(''),
    };

    saveStates = {
      Add: '',
      Delete: '',
      None: '',
      Update: '',
    };

    rolesFactory = {};

    locationService = {
      getCurrentPracticeLocations: jasmine
        .createSpy('locationService.getCurrentPracticeLocations')
        .and.returnValue({
          then: jasmine
            .createSpy()
            .and.returnValue({ catch: jasmine.createSpy() }),
        }),
    };

    modalFactory = {
      Modal: jasmine.createSpy().and.callFake(function () {}),
      ConfirmModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.callFake(function () {}),
      }),
    };

    routeParams = {
      patientId: 1,
    };

    ctrl = $controller('PatientPreferencesController', {
      $scope: scope,
      $routeParams: routeParams,
      $q: $q,
      toastrFactory: toastrFactory,
      localize: localize,
      LocationServices: locationServices,
      UserServices: userServices,
      PersonServices: personServices,
      ListHelper: listHelper,
      $timeout: $timeout,
      UsersFactory: usersFactory,
      TimeZoneFactory: timeZoneFactory,
      $filter: $filter,
      SaveStates: saveStates,
      RolesFactory: rolesFactory,
      locationService: locationService,
      ModalFactory: modalFactory,
      PatCacheFactory: patCacheFactory,
    });
  }));

  it('should init scope properties', function () {
    expect(scope.valid).toBe(true);
    expect(scope.currentPatientId).toBe(1);
    expect(scope.doneLoading).toBe(false);
    expect(scope.locationValueTemplate).not.toBeNull();
    expect(scope.dentistValueTemplate).not.toBeNull();
    expect(scope.hygienistValueTemplate).not.toBeNull();
  });

  describe('changedDentist function ->', function () {
    beforeEach(function () {
      ctrl.providerList = _.cloneDeep(usersMock);
      scope.tempPerson = {
        Profile: {
          PreferredDentist: null,
          PreferredLocation: 1234,
        },
      };
      scope.patient = {};
      spyOn(ctrl, 'isNotADentistThisLocation');
    });

    it('should call ctrl.isValidSelectionForDentistAtThisLocation with tempPerson.Profile.PreferredLocation if tempPerson and scope.preferredDentistIsProvider is true', function () {
      spyOn(ctrl, 'isValidProviderForThisLocation').and.returnValue(true);
      scope.tempPerson.Profile.PreferredDentist = ctrl.providerList[2].UserId;
      ctrl.providerList[2].Locations = [
        { LocationId: 1234, ProviderTypeId: 3 },
      ];
      scope.changedDentist();
      expect(ctrl.isNotADentistThisLocation).toHaveBeenCalledWith(
        scope.selectedDentist,
        scope.tempPerson.Profile.PreferredLocation
      );
    });

    it('should call ctrl.isNotADentistThisLocation with patient.PreferredLocation if tempPerson is null and scope.preferredDentistIsProvider is true', function () {
      spyOn(ctrl, 'isValidProviderForThisLocation').and.returnValue(true);
      scope.patient.PreferredDentist = ctrl.providerList[2].UserId;
      scope.patient.PreferredLocation = 2;
      ctrl.providerList[2].Locations = [{ LocationId: 2, ProviderTypeId: 3 }];
      scope.tempPerson = null;
      scope.changedDentist();
      expect(ctrl.isNotADentistThisLocation).toHaveBeenCalledWith(
        scope.selectedDentist,
        scope.patient.PreferredLocation
      );
    });

    it('should call ctrl.isValidProviderForThisLocation with tempPerson.Profile.PreferredLocation if tempPerson', function () {
      spyOn(ctrl, 'isValidProviderForThisLocation');
      scope.tempPerson.Profile.PreferredDentist = ctrl.providerList[3].UserId;
      ctrl.providerList[3].Locations = [
        { LocationId: 1234, ProviderTypeId: 3 },
      ];
      scope.changedDentist();
      expect(ctrl.isValidProviderForThisLocation).toHaveBeenCalledWith(
        scope.selectedDentist,
        scope.tempPerson.Profile.PreferredLocation
      );
    });

    it('should call ctrl.isValidProviderForThisLocation with patient.PreferredLocation if tempPerson is null', function () {
      spyOn(ctrl, 'isValidProviderForThisLocation');
      scope.tempPerson = null;
      scope.patient.PreferredDentist = ctrl.providerList[3].UserId;
      scope.changedDentist();
      expect(ctrl.isValidProviderForThisLocation).toHaveBeenCalledWith(
        scope.selectedDentist,
        scope.patient.PreferredLocation
      );
    });

    it(
      'should set scope.selectedDentist to provider whose UserId matches scope.tempPerson.Profile.PreferredDentist ' +
        'if scope.tempPerson.Profile ',
      function () {
        scope.tempPerson.Profile.PreferredDentist = ctrl.providerList[3].UserId;
        ctrl.providerList[3].Locations = [
          { LocationId: 1234, ProviderTypeId: 3 },
        ];
        scope.changedDentist();
        expect(scope.selectedDentist).toEqual(ctrl.providerList[3]);
      }
    );

    it(
      'should set scope.selectedDentist to provider whose UserId matches scope.patient.PreferredDentist ' +
        'if scope.patient and not tempPerson ',
      function () {
        scope.tempPerson.Profile = null;
        scope.patient = { PreferredDentist: ctrl.providerList[2].UserId };

        scope.changedDentist();
        expect(scope.selectedDentist).toEqual(ctrl.providerList[2]);
      }
    );

    it(
      'should set scope.selectedDentist to provider whose UserId matches scope.tempPerson.Profile.PreferredDentist ' +
        'if scope.tempPerson.Profile is null and patient.PreferredDentist is null ',
      function () {
        scope.tempPerson.Profile = null;
        scope.patient.PreferredDentist = null;
        scope.preferences.PreferredDentist = ctrl.providerList[3].UserId;
        scope.changedDentist();
        expect(scope.selectedDentist).toEqual(ctrl.providerList[3]);
      }
    );
  });

  /*
     ctrl.isValidSelectionForDentistAtThisLocation = function(selectedProvider, preferredLocation){
                    var isNotADentist = false;
                    if (selectedProvider && preferredLocation){
                        var userLocationSetup =_.find(selectedProvider.Locations, function(userLocation){
                            return parseInt(userLocation.LocationId) === parseInt(preferredLocation);
                        });
                        if (userLocationSetup){                        
                            isNotADentist = !(userLocationSetup.ProviderTypeId === 1 || userLocationSetup.ProviderTypeId === 5);  
                        }                                                          
                    }
                    return isNotADentist;                 
                };
    */
  describe('ctrl.isNotADentistThisLocation method->', function () {
    var selectedProvider = {};
    beforeEach(function () {
      selectedProvider = { Locations: [] };
      selectedProvider.Locations.push({
        LocationId: 1234,
        ProviderTypeId: 2,
        IsActive: true,
      });
      selectedProvider.Locations.push({
        LocationId: 1239,
        ProviderTypeId: 1,
        IsActive: true,
      });
    });

    it('should return true if the user is not a ProviderTypeId of 1 or 5  for the user location that matches the preferredLocation', function () {
      var preferredLocation = 1234;
      var returnedValue = ctrl.isNotADentistThisLocation(
        selectedProvider,
        preferredLocation
      );
      expect(returnedValue).toBe(true);
    });

    it('should return false if the user is a ProviderTypeId of 1 or 5 for the user location that matches the preferredLocation', function () {
      var preferredLocation = 1239;
      var returnedValue = ctrl.isNotADentistThisLocation(
        selectedProvider,
        preferredLocation
      );
      expect(returnedValue).toBe(false);
    });

    it('should convert preferredLocation to int before checking', function () {
      var preferredLocation = '1239';
      var returnedValue = ctrl.isValidProviderForThisLocation(
        selectedProvider,
        preferredLocation
      );
      expect(returnedValue).toBe(true);
    });
  });

  describe('ctrl.isValidProviderForThisLocation method->', function () {
    var selectedProvider = {};
    beforeEach(function () {
      selectedProvider = { Locations: [] };
      selectedProvider.Locations.push({
        LocationId: 1234,
        ProviderTypeId: 4,
        IsActive: true,
      });
      selectedProvider.Locations.push({
        LocationId: 1239,
        ProviderTypeId: 2,
        IsActive: true,
      });
    });

    it('should return false if the user is a ProviderTypeId = 4 for the user location that matches the preferredLocation', function () {
      var preferredLocation = 1234;
      var returnedValue = ctrl.isValidProviderForThisLocation(
        selectedProvider,
        preferredLocation
      );
      expect(returnedValue).toBe(false);
    });

    it('should return true if the user is a ProviderTypeId other than 4 for the user location that matches the preferredLocation', function () {
      var preferredLocation = 1239;
      var returnedValue = ctrl.isValidProviderForThisLocation(
        selectedProvider,
        preferredLocation
      );
      expect(returnedValue).toBe(true);
    });

    it('should convert preferredLocation to int before checking', function () {
      var preferredLocation = '1239';
      var returnedValue = ctrl.isValidProviderForThisLocation(
        selectedProvider,
        preferredLocation
      );
      expect(returnedValue).toBe(true);
    });
  });

  describe('changedHygienist function ->', function () {
    beforeEach(function () {
      ctrl.providerList = _.cloneDeep(usersMock);
      scope.tempPerson = {
        Profile: {
          PreferredHygienist: null,
          PreferredLocation: 1234,
        },
      };
      scope.patient = {};
      spyOn(ctrl, 'isValidProviderForThisLocation').and.returnValue(true);
    });

    it('should call ctrl.isValidProviderForThisLocation with tempPerson.Profile.PreferredLocation if tempPerson', function () {
      scope.tempPerson.Profile.PreferredHygienist = ctrl.providerList[3].UserId;
      scope.changedHygienist();
      expect(ctrl.isValidProviderForThisLocation).toHaveBeenCalledWith(
        scope.selectedHygienist,
        scope.tempPerson.Profile.PreferredLocation
      );
    });

    it('should call ctrl.isValidProviderForThisLocation with patient.PreferredLocation if tempPerson is null', function () {
      scope.tempPerson = null;
      scope.patient.PreferredHygienist = ctrl.providerList[3].UserId;
      scope.changedHygienist();
      expect(ctrl.isValidProviderForThisLocation).toHaveBeenCalledWith(
        scope.selectedHygienist,
        scope.patient.PreferredLocation
      );
    });

    it('should set scope.selectedHygienist to provider whose UserId matches scope.tempPerson.Profile.PreferredHygienist if scope.tempPerson.Profile ', function () {
      scope.tempPerson.Profile.PreferredHygienist = ctrl.providerList[3].UserId;
      scope.changedHygienist();
      expect(scope.selectedHygienist).toEqual(ctrl.providerList[3]);
    });

    it(
      'should set scope.selectedHygienist to provider whose UserId matches scope.patient.PreferredHygienist ' +
        'if scope.patient and not tempPerson ',
      function () {
        scope.tempPerson.Profile = null;
        scope.patient.PreferredHygienist = ctrl.providerList[2].UserId;
        scope.changedHygienist();
        expect(scope.selectedHygienist).toEqual(ctrl.providerList[2]);
      }
    );

    it(
      'should set scope.selectedHygienist to provider whose UserId matches scope.tempPerson.Profile.PreferredHygienist ' +
        'if scope.tempPerson.Profile is null and patient.PreferredHygienist is null ',
      function () {
        ctrl.providerList[3].IsActive = false;
        scope.tempPerson.Profile = {
          PreferredHygienist: ctrl.providerList[3].UserId,
          PreferredDentist: null,
          PreferredLocation: 1234,
        };
        scope.changedHygienist();
        expect(scope.selectedHygienist).toEqual(ctrl.providerList[3]);
      }
    );
  });

  describe('changedPreferences function ->', function () {
    it('should set selected properites', function () {
      var newValue = preferencesMock;
      var oldValue = {};

      spyOn(scope, '$emit');
      scope.editing = true;
      scope.tempPerson = 'tempPerson';

      var originalParent = scope.$parent;
      scope.$parent = {
        data: {
          saveData: null,
        },
      };

      ctrl.changedPreferences(newValue, oldValue);

      expect(scope.$parent.data.saveData).toEqual(scope.tempPerson);
      expect(scope.$emit).toHaveBeenCalledWith('preferences-changed', true);

      scope.$parent = originalParent;
    });
  });

  describe('lookupLocation function ->', function () {
    it('should return location object', function () {
      var obj = ctrl.lookupLocation(locationsMock[0]);

      expect(obj).toEqual(locationsMock[0]);
    });
  });

  describe('getLocations function ->', function () {
    it('should call Locations.getData service', function () {
      ctrl.getLocations();

      expect(referenceDataService.getData).toHaveBeenCalled();
    });
  });

  describe('locationServicesGetOnSuccess function ->', function () {
    var result = {
      Value: locationsMock,
    };

    it('should set loadingLocations to false', function () {
      ctrl.locationServicesGetOnSuccess(result);

      expect(ctrl.loadingLocations).toBe(false);
    });

    it('should set locations to res.Value', function () {
      ctrl.locationServicesGetOnSuccess(result);

      expect(scope.locations).toEqual(result.Value);
    });

    it('should set doneLoading to false', function () {
      spyOn(ctrl, 'isDoneLoading').and.callFake(function () {
        return false;
      });

      ctrl.locationServicesGetOnSuccess(result);

      expect(scope.doneLoading).toBe(false);
    });
  });

  // describe('getInactivePreferredProviders function ->', function () {
  //     beforeEach(function () {
  //         scope.providerList = [{ UserId: 1, IsActive: false }, { UserId: 2, IsActive: false }];
  //         scope.person = {
  //             Profile: {
  //                 PreferredDentist: null,
  //                 PreferredHygienist: null
  //             }
  //         };
  //     });

  //     it('should add an item to providersWithInactiveStatusButPreferred if preferred dentist is inactive', function () {
  //         scope.person.Profile.PreferredDentist = 1;
  //         scope.person.Profile.PreferredHygienist = 0;

  //         ctrl.getInactivePreferredProviders();

  //         expect(scope.providersWithInactiveStatusButPreferred.length).toBe(1);
  //     });

  //     it('should add an item to providersWithInactiveStatusButPreferred if preferred hygienist is inactive', function () {
  //         scope.person.Profile.PreferredDentist = 0;
  //         scope.person.Profile.PreferredHygienist = 2;

  //         ctrl.getInactivePreferredProviders();

  //         expect(scope.providersWithInactiveStatusButPreferred.length).toBe(1);
  //     });

  //     it('should add 2 items to providersWithInactiveStatusButPreferred if preferred dentist and hygienist are inactive', function () {
  //         scope.person.Profile.PreferredDentist = 1;
  //         scope.person.Profile.PreferredHygienist = 2;

  //         ctrl.getInactivePreferredProviders();

  //         expect(scope.providersWithInactiveStatusButPreferred.length).toBe(2);
  //     });
  // });

  describe('getProviders function ->', function () {
    beforeEach(function () {
      ctrl.getProviders();
      scope.$apply();
    });

    it('should set loadingProviders to false', function () {
      expect(ctrl.loadingProviders).toBe(false);
    });

    it('should call personServices.Persons.get service', function () {
      expect(personServices.Persons.get).toHaveBeenCalled();
    });
  });

  describe('saveFunction function ->', function () {
    beforeEach(function () {
      spyOn(scope, 'validate').and.callFake(function () {});
      spyOn(ctrl, 'checkPreferredProviders').and.callFake(function () {});
    });
    it('should validate and call update if dentist and hygienist are active', function () {
      var personToSave = { Profile: { PreferredDentist: '' } };
      scope.tempPerson = { Profile: { PreferredDentist: '' } };
      scope.validate = jasmine
        .createSpy('scope.validate')
        .and.returnValue(true);
      scope.preferredDentistIsProvider = false;
      scope.preferredHygienistIsProvider = false;
      scope.saveFunction(
        personToSave,
        function () {},
        function () {}
      );

      expect(scope.validate).toHaveBeenCalled();
      expect(personServices.Persons.update).toHaveBeenCalled();
    });

    it('should call ctrl.checkPreferredProviders', function () {
      scope.preferredDentistIsProvider = false;
      var person = { Profile: {} };
      scope.tempPerson.Profile.PreferredDentist = 1234;
      scope.saveFunction(
        person,
        function () {},
        function () {}
      );
      expect(ctrl.checkPreferredProviders).toHaveBeenCalled();
    });

    //if ($scope.preferredDentistValidForLocation===true && $scope.preferredHygienistValidForLocation===true) {
    it('should set PreferredDentist to null if scope.preferredDentistValidForLocation is false and scope.tempPerson', function () {
      scope.preferredDentistValidForLocation = false;
      var person = { Profile: {} };
      scope.tempPerson.Profile.PreferredDentist = 1234;
      scope.saveFunction(
        person,
        function () {},
        function () {}
      );
      expect(scope.tempPerson.Profile.PreferredDentist).toBe(null);
    });

    it('should set PreferredHygienist to null if scope.preferredHygienistValidForLocation is false and scope.tempPerson', function () {
      scope.preferredHygienistValidForLocation = false;
      var person = {
        Profile: { PreferredHygienist: null, PreferredDentist: null },
      };
      scope.tempPerson.Profile.PreferredHygienist = 1234;
      scope.saveFunction(
        person,
        function () {},
        function () {}
      );
      expect(scope.tempPerson.Profile.PreferredHygienist).toBe(null);
    });

    it('should validate and call update if dentist and/or hygienist are inactive but user has changed selection/s', function () {
      var personToSave = {
        Profile: {
          PreferredDentist: 'x',
          PreferredHygienist: 'x',
        },
      };
      scope.validate = jasmine
        .createSpy('scope.validate')
        .and.returnValue(true);
      scope.saveFunction(
        personToSave,
        function () {},
        function () {}
      );
      expect(scope.validate).toHaveBeenCalled();
      expect(personServices.Persons.update).toHaveBeenCalled();
    });
  });

  describe('validate function ->', function () {
    beforeEach(function () {
      scope.frmPatientPreferences = {
        inpLocation: {},
      };
    });

    it('should return true if patient preferences and location are valid', function () {
      scope.frmPatientPreferences.$valid = true;
      scope.frmPatientPreferences.inpLocation.$valid = true;
      var valid = scope.validate();
      expect(valid).toBeTruthy();
    });

    it('should return false if location is invalid', function () {
      scope.frmPatientPreferences.inpLocation.$valid = true;
      var valid = scope.validate();
      expect(valid).toEqual(true);
    });
  });

  describe('onSuccess function ->', function () {
    var originalParent;
    beforeEach(function () {
      spyOn(scope, '$emit');
      scope.preferences = 'preferenceData';
      scope.tempPerson = { PatientLocations: [], Profile: {} };

      originalParent = scope.$parent;
      scope.$parent = {
        $parent: {
          additionalData: null,
          $$listeners: {},
          data: {
            additionalData: null,
          },
        },
        data: {
          originalData: 'original data',
          saveData: 'non-preference data', // This is currently being set to the patient object, but the controller expect the preference object to be there.
        },
      };
      var result = {
        Value: {
          Profile: patientUpdateMock,
        },
      };
      scope.onSuccess(result);
    });

    afterEach(function () {
      scope.$parent = originalParent;
    });

    it('should call toastrFactory success', function () {
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should set patient obj to res.Value', function () {
      expect(scope.patient).toEqual(patientUpdateMock);
    });

    it('should set additionalData to patient', function () {
      expect(scope.$parent.$parent.additionalData).toEqual(scope.patient);
    });

    it('should set data.additionalData to patient', function () {
      expect(scope.$parent.$parent.data.additionalData).toEqual(scope.patient);
    });

    it('should call patCacheFactory.GetCache with patientOverviewCache', function () {
      expect(patCacheFactory.GetCache).toHaveBeenCalledWith(
        'patientOverviewCache'
      );
    });

    it('should reset the clear the cache for patientOverviewCache', function () {
      expect(patCacheFactory.ClearCache).toHaveBeenCalledWith(
        patientOverviewCache
      );
    });

    it("should set the parent's save data back to the original data", function () {
      expect(scope.$parent.data.saveData).toEqual(
        scope.$parent.data.originalData
      );
    });

    it('should call scope.resetPerson', function () {
      var result = { Value: { Profile: patientUpdateMock } };
      spyOn(scope, 'resetPerson');
      scope.onSuccess(result);
      expect(scope.resetPerson).toHaveBeenCalled();
    });
  });

  describe('scope.resetPerson function ->', function () {
    beforeEach(function () {
      spyOn(scope, 'setLocation').and.callFake(function () {});
      spyOn(scope, 'changedDentist').and.callFake(function () {});
      spyOn(scope, 'changedHygienist').and.callFake(function () {});
      scope.$parent = { data: { saveData: {} } };
      scope.$parent = { data: { originalData: {} } };
      scope.$root.$broadcast = jasmine.createSpy();
      spyOn(scope, '$emit');
    });

    it('should dependant methods', function () {
      scope.resetPerson();
      expect(scope.setLocation).toHaveBeenCalled();
      expect(scope.changedDentist).toHaveBeenCalled();
      expect(scope.changedHygienist).toHaveBeenCalled();
    });

    it('should broadcast patient-personal-info-changed', function () {
      scope.resetPerson();
      expect(scope.$emit).toHaveBeenCalledWith('preferences-changed', false);
      expect(scope.$root.$broadcast).toHaveBeenCalledWith(
        'patient-personal-info-changed'
      );
    });
  });

  describe('onError function ->', function () {
    it('should call toastrFactory.error', function () {
      scope.onError();

      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('isDoneLoading function ->', function () {
    it('should return false if loadingProviders is false and loadingLocations is true', function () {
      ctrl.loadingProviders = false;
      ctrl.loadingLocations = true;

      var bool = ctrl.isDoneLoading();

      expect(bool).toBe(false);
    });

    it('should return false if loadingProviders is true and loadingLocations is false', function () {
      ctrl.loadingProviders = true;
      ctrl.loadingLocations = false;

      var bool = ctrl.isDoneLoading();

      expect(bool).toBe(false);
    });

    it('should return true if loadingProviders is false and loadingLocations is false', function () {
      ctrl.loadingProviders = false;
      ctrl.loadingLocations = false;

      var bool = ctrl.isDoneLoading();

      expect(bool).toBe(true);
    });
  });

  describe('tempPerson.Profile.PreferredLocation watch - >', function () {
    it('should set $scope.preferredLocationId when existing value does not equal nv', function () {
      scope.preferredLocationId = 'oldvalue';
      scope.tempPerson.Profile.PreferredLocation = 'newvalue';
      scope.$apply();
      expect(scope.preferredLocationId).toBe('newvalue');
    });
  });

  describe('confirmInvalidProviders method ->', function () {
    beforeEach(function () {});

    it('should open confirmModal if scope.preferredDentistValidForLocation is false', function () {
      scope.preferredDentistValidForLocation = false;
      ctrl.confirmInvalidProviders();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should open confirmModal if scope.preferredHygienistValidForLocation is false', function () {
      scope.preferredDentistValidForLocation = false;
      ctrl.confirmInvalidProviders();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should not open confirmModal if scope.preferredHygienistValidForLocation and preferredDentistValidForLocation are both true', function () {
      scope.preferredDentistValidForLocation = true;
      scope.preferredDentistValidForLocation = true;
      ctrl.confirmInvalidProviders();
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
    });
  });

  describe('checkPreferredProviders method ->', function () {
    beforeEach(function () {
      scope.preferredHygienistValidForLocation = true;
      scope.preferredDentistValidForLocation = true;
      scope.selectedDentist = {};
      scope.selectedHygienist = {};
      scope.selectedLocation = { LocationId: '1234' };
      spyOn(ctrl, 'isValidProviderForThisLocation');
      spyOn(ctrl, 'isProviderDentistAtLocation');
    });

    it('should call ctrl.isProviderDentistAtLocation to set scope.preferredDentistValidForLocation if $scope.selectedDentist is not null ', function () {
      ctrl.checkPreferredProviders();
      expect(ctrl.isProviderDentistAtLocation).toHaveBeenCalledWith(
        scope.selectedDentist,
        scope.selectedLocation.LocationId
      );
    });

    it('should call ctrl.isValidProviderForThisLocation to set scope.preferredHygienistValidForLocation if $scope.selectedHygienist is not null ', function () {
      ctrl.checkPreferredProviders();
      expect(ctrl.isValidProviderForThisLocation).toHaveBeenCalledWith(
        scope.selectedHygienist,
        scope.selectedLocation.LocationId
      );
    });
  });

  describe('initializeData method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'confirmInvalidProviders');
    });

    it('should call confirmInvalidProviders if routeParams.tab equals Profile and Category equasl Summary and editing is false', function () {
      routeParams.tab = 'Profile';
      routeParams.Category = 'Summary';
      scope.editing = false;
      ctrl.initializeData();
      expect(ctrl.confirmInvalidProviders).toHaveBeenCalled();
    });

    it('should not call confirmInvalidProviders if routeParams.tab does not equal Profile or  Category does not equal Summary or editing is true ', function () {
      routeParams.tab = 'Account';
      routeParams.Category = 'Summary';
      scope.editing = false;
      ctrl.initializeData();
      expect(ctrl.confirmInvalidProviders).not.toHaveBeenCalled();

      routeParams.tab = 'Profile';
      routeParams.Category = 'Summary';
      scope.editing = true;
      ctrl.initializeData();
      expect(ctrl.confirmInvalidProviders).not.toHaveBeenCalled();

      routeParams.tab = 'Profile';
      routeParams.Category = 'Other';
      scope.editing = false;
      ctrl.initializeData();
      expect(ctrl.confirmInvalidProviders).not.toHaveBeenCalled();
    });
  });

  describe('isProviderDentistAtLocation method ->', function () {
    let preferredLocation, selectedProvider;
    beforeEach(function () {
      selectedProvider = {
        FirstName: 'Bob',
        Locations: [{ LocationId: '1234', ProviderTypeId: 1 }],
      };
      preferredLocation = '1234';
    });

    it('should return false if selectedProvider is null', function () {
      selectedProvider = null;
      expect(
        ctrl.isProviderDentistAtLocation(selectedProvider, preferredLocation)
      ).toBe(false);
    });

    it('should return false if preferredLocation is null', function () {
      preferredLocation = null;
      expect(
        ctrl.isProviderDentistAtLocation(selectedProvider, preferredLocation)
      ).toBe(false);
    });

    it('should return false if preferredLocation is not in providers locations', function () {
      preferredLocation = '1235';
      expect(
        ctrl.isProviderDentistAtLocation(selectedProvider, preferredLocation)
      ).toBe(false);
    });

    it('should return false if selectedProvider.ProviderTypeId is other than 1 or 5', function () {
      selectedProvider = {
        FirstName: 'Bob',
        Locations: [{ LocationId: '1234', ProviderTypeId: 3 }],
      };
      expect(
        ctrl.isProviderDentistAtLocation(selectedProvider, preferredLocation)
      ).toBe(false);
    });

    it('should return true if selectedProvider.ProviderTypeId is 1 or 5 and preferredLocation is in providers locations', function () {
      selectedProvider = {
        FirstName: 'Bob',
        Locations: [{ LocationId: '1234', ProviderTypeId: 1 }],
      };
      expect(
        ctrl.isProviderDentistAtLocation(selectedProvider, preferredLocation)
      ).toBe(true);
    });
  });
});

describe('patient-account-filter-bar ->', function () {
  var scope,
    ctrl,
    mockReferenceDataService,
    mockLocalize,
    mockPatientAccountFilterBarFactory,
    shareData,
    timeZoneFactoryMock;

  var $q;

  var filterObject = {
    dateRange: {
      start: '3/2/2020',
      end: '3/4/2020',
    },
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      // set up mocks
      mockReferenceDataService = {
        getData: jasmine.createSpy('mockReferenceDataService.getData'),
        entityNames: {
          locations: 'locations',
          users: 'users',
        },
      };

      mockLocalize = {
        getLocalizedString: jasmine
          .createSpy('localize.getLocalizedString')
          .and.callFake(function (text) {
            return text;
          }),
      };

      mockPatientAccountFilterBarFactory = {
        observeFilterBarStatus: jasmine.createSpy(),
        resetFilterBarObservers: jasmine.createSpy(),
      };

      timeZoneFactoryMock = {
        ConvertDateToMomentTZ: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
          .and.callFake(function (date) {
            return moment(date);
          }),
      };
      $provide.value('TimeZoneFactory', timeZoneFactoryMock);

      var userLocation = '{"id": 3, "timezone": "Central Standard Time"}';
      sessionStorage.setItem('userLocation', userLocation);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, _$q_) {
    $q = _$q_;

    scope = $rootScope.$new();
    scope.filterObject = {
      dateRange: {
        start: null,
        end: null,
      },
      transactionTypes: null,
      locations: null,
      members: [100],
      providers: null,
      Statuses: [1],
      IncludePaidTransactions: true,
      IncludeUnpaidTransactions: true,
      IncludeAppliedTransactions: true,
      IncludeUnappliedTransactions: true,
      IncludeAccountNotes: true,
      IncludeDocuments: true,
      Teeth: [],
    };
    shareData = {};
    shareData.accountMembersDetail = [
      {
        personId: 100,
        patientDetailedName: 'Test',
        isResponsiblePerson: true,
        isActivePatient: true,
      },
      {
        personId: 200,
        patientDetailedName: 'Test2',
        isResponsiblePerson: false,
        isActivePatient: false,
      },
    ];
    shareData.currentPatientId = 100;

    mockReferenceDataService.getData.and.callFake(function (entity) {
      switch (entity) {
        case 'locations':
          return $q.resolve([
            {
              LocationId: 3,
              Timezone: 'Central Standard Time',
              NameLine1: 'Big City',
              DeactivationTimeUtc: null,
            },
          ]);
        case 'users':
          return $q.resolve([
            {
              UserId: 'dd20b506-6a87-e711-bf16-204747fa7c7e',
              FirstName: 'Adam',
              MiddleName: null,
              LastName: 'Adams',
              PreferredName: null,
              ProfessionalDesignation: 'DDS',
              IsActive: true,
              ProviderTypeId: 1,
              Locations: [{ ProviderTypeId: 1 }],
            },
            {
              UserId: 'dd20b506-6a87-e711-bf16-204747fa7c7f',
              FirstName: 'Bill',
              MiddleName: null,
              LastName: 'Burns',
              PreferredName: null,
              ProfessionalDesignation: null,
              IsActive: false,
              ProviderTypeId: 1,
              Locations: [{ ProviderTypeId: 1 }],
            },
            {
              UserId: 'dd20b506-6a87-e711-bf16-204747fa7c7g',
              FirstName: 'Charlie',
              MiddleName: null,
              LastName: 'Coyle',
              PreferredName: null,
              ProfessionalDesignation: null,
              IsActive: true,
              ProviderTypeId: 4,
              Locations: [{ ProviderTypeId: 4 }],
            },
          ]);
      }
    });

    ctrl = $controller('PatientAccountFilterBarController', {
      $scope: scope,
      referenceDataService: mockReferenceDataService,
      localize: mockLocalize,
      PatientAccountFilterBarFactory: mockPatientAccountFilterBarFactory,
      ShareData: shareData,
      TimeZoneFactory: timeZoneFactoryMock,
    });

    scope.$apply();
  }));

  describe('controller ->', function () {
    it('should initialize the controller', function () {
      spyOn(ctrl, 'updateFilterBarStatus');
      expect(ctrl).not.toBeNull();
      expect(scope.disableApply).toBe(true);
      expect(scope.disableReset).toBe(true);
      expect(scope.errors.dateError.hasError).toBe(false);
      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(ctrl.hideRunningBalance).toBe(false);
      expect(
        mockPatientAccountFilterBarFactory.observeFilterBarStatus
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.init function ->', function () {
    it('should set the scope.disableApply variable to true', function () {
      spyOn(ctrl, 'initializeFilters').and.callThrough();
      spyOn(ctrl, 'setFilterBarProperties').and.callThrough();
      spyOn(ctrl, 'setMaxDateFromLocationTZ');
      ctrl.init();
      scope.$apply();
      expect(scope.filters.TransactionTypes.length).toBe(9);
      expect(scope.filters.TransactionStatus.length).toBe(5);
      expect(ctrl.initializeFilters).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
  });

  describe('ctrl.initializeProviderList ->', function () {
    var providers;
    beforeEach(function () {
      providers = [
        // Provider with no locations should not show in list
        { UserId: 1233, Locations: [] },
        // Providers with one or more locations where they are a provider should be in list
        {
          UserId: 1234,
          Locations: [
            { LocationId: 11, ProviderTypeId: 1 },
            { LocationId: 12, ProviderTypeId: 2 },
          ],
        },
        {
          UserId: 1235,
          Locations: [
            { LocationId: 11, ProviderTypeId: 2 },
            { LocationId: 12, ProviderTypeId: 2 },
          ],
        },
        {
          UserId: 1236,
          Locations: [
            { LocationId: 11, ProviderTypeId: 1 },
            { LocationId: 12, ProviderTypeId: 3 },
          ],
        },
        {
          UserId: 1237,
          Locations: [
            { LocationId: 11, ProviderTypeId: 2 },
            { LocationId: 12, ProviderTypeId: 5 },
          ],
        },
        // Provider at location 11 only should be in list
        {
          UserId: 1238,
          Locations: [
            { LocationId: 11, ProviderTypeId: 4 },
            { LocationId: 12, ProviderTypeId: 3 },
          ],
        },
        // Not a provider at any location should not be in list
        {
          UserId: 1239,
          Locations: [
            { LocationId: 11, ProviderTypeId: 4 },
            { LocationId: 12, ProviderTypeId: 4 },
          ],
        },
      ];
    });
    it('should return list of providers who have at least one location where they are a provider providerType', function () {
      var providerOptions = ctrl.initializeProviderList(providers);
      expect(providerOptions[0].Id).toEqual(providers[1].UserId);
      expect(providerOptions[1].Id).toEqual(providers[2].UserId);
      expect(providerOptions[2].Id).toEqual(providers[3].UserId);
      expect(providerOptions[3].Id).toEqual(providers[4].UserId);
      expect(providerOptions[4].Id).toEqual(providers[5].UserId);
      expect(providerOptions.length).toEqual(5);
    });
  });

  describe('ctrl.initializeFilters function ->', function () {
    var providers = [];
    beforeEach(function () {
      spyOn(ctrl, 'setPatientFilter');
      spyOn(ctrl, 'setMaxDateFromLocationTZ');

      var dateNow = moment().format('YYYY-MM-DD');
      var tomorrow = moment().add(1, 'days');
      mockReferenceDataService.getData.and.callFake(function (entity) {
        if (entity === 'locations') {
          return $q.resolve([
            {
              LocationId: 4,
              Timezone: 'Eastern Time',
              NameLine1: 'Medium City',
              DeactivationTimeUtc: dateNow,
            },
            {
              LocationId: 5,
              Timezone: 'Western Standard Time',
              NameLine1: 'small City',
              DeactivationTimeUtc: tomorrow,
            },
          ]);
        } else if (entity === 'users') {
          return $q.resolve(providers);
        }
      });
    });
    it('should populate the filter data', function () {
      ctrl.initializeFilters();
      scope.$apply();
      expect(scope.filters.Locations[0]).toEqual({
        Id: 0,
        Text: 'All Locations',
        Selected: true,
        IsAllOption: true,
        IsDefault: true,
        Status: 'All',
      });
      expect(scope.filters.Locations[1]).toEqual({
        Id: 3,
        Text: 'Big City',
        Selected: true,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: false,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Patients[1]).toEqual({
        Id: 100,
        Text: 'Test (RP)',
        Selected: true,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Patients[2]).toEqual({
        Id: 200,
        Text: 'Test2',
        Selected: false,
        IsAllOption: false,
        Status: 'Inactive',
      });
      expect(scope.filters.Providers[0]).toEqual({
        Id: 0,
        Text: 'All Providers',
        Selected: true,
        IsAllOption: true,
        IsDefault: true,
      });
      expect(scope.filters.Providers[1]).toEqual({
        Id: 'dd20b506-6a87-e711-bf16-204747fa7c7e',
        Text: 'Adam Adams, DDS',
        Selected: true,
        IsAllOption: false,
      });
      expect(scope.filters.TransactionStatus[0]).toEqual({
        Text: 'All Distribution Statuses',
        Selected: true,
        Id: 0,
        IsAllOption: true,
        IsDefault: true,
      });
      expect(ctrl.selectedStartDate).toBeNull();
      expect(ctrl.selectedEndDate).toBeNull();
      expect(ctrl.selectedFilters.Locations).toEqual(scope.filters.Locations);
      expect(ctrl.selectedFilters.TransactionTypes).toEqual(
        scope.filters.TransactionTypes
      );
      expect(ctrl.setPatientFilter).toHaveBeenCalled();
      expect(ctrl.setMaxDateFromLocationTZ).toHaveBeenCalled();
    });
    it('should populate the data with correct statuses', function () {
      ctrl.initializeFilters();
      scope.$apply();
      expect(scope.filters.Locations[0].Status).toEqual('All');
      expect(scope.filters.Locations[1]).toEqual({
        Id: 3,
        Text: 'Big City',
        Selected: true,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Locations[2]).toEqual({
        Id: 4,
        Text: 'Medium City',
        Selected: true,
        IsAllOption: false,
        Status: 'Inactive',
      });
      expect(scope.filters.Locations[3]).toEqual({
        Id: 5,
        Text: 'small City',
        Selected: true,
        IsAllOption: false,
        Status: 'Pending Inactive',
      });
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: false,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Providers[0]).toEqual({
        Id: 0,
        Text: 'All Providers',
        Selected: true,
        IsAllOption: true,
        IsDefault: true,
      });
      expect(scope.filters.Providers[1]).toEqual({
        Id: 'dd20b506-6a87-e711-bf16-204747fa7c7e',
        Text: 'Adam Adams, DDS',
        Selected: true,
        IsAllOption: false,
      });
      expect(scope.filters.Providers[2]).toEqual({
        Id: 'dd20b506-6a87-e711-bf16-204747fa7c7f',
        Text: 'Bill Burns',
        Selected: true,
        IsAllOption: false,
      });
      expect(scope.filters.TransactionStatus[0]).toEqual({
        Text: 'All Distribution Statuses',
        Selected: true,
        Id: 0,
        IsAllOption: true,
        IsDefault: true,
      });
      expect(ctrl.selectedStartDate).toBeNull();
      expect(ctrl.selectedEndDate).toBeNull();
      expect(ctrl.selectedFilters.Locations).toEqual(scope.filters.Locations);
      expect(ctrl.selectedFilters.TransactionTypes).toEqual(
        scope.filters.TransactionTypes
      );
      expect(ctrl.setPatientFilter).toHaveBeenCalled();
      expect(ctrl.setMaxDateFromLocationTZ).toHaveBeenCalled();
    });

    it('should call ctrl.initializeProviderList', function () {
      spyOn(ctrl, 'initializeProviderList');
      ctrl.initializeFilters();
      scope.$apply();
      expect(ctrl.initializeProviderList).toHaveBeenCalledWith(providers);
    });
  });

  describe('ctrl.setMaxDateFromLocationTZ function ->', () => {
    it('should set timezone to system default when cached location is null', () => {
      sessionStorage.clear();
      var locations = [{ LocationId: 3, timezone: '' }];
      var defaultTZDate = moment();

      ctrl.setMaxDateFromLocationTZ(locations);
      expect(scope.filterMaxDate).toBeDefined();
      expect(scope.filterMaxDate).toEqual(
        defaultTZDate.startOf('day').local(true)
      );
      expect(moment.isMoment(scope.filterMaxDate)).toEqual(true);
    });

    it('should set timezone to system default when location timezone is undefined', () => {
      var locations = [{ LocationId: 3, timezone: '' }];
      var defaultTZDate = moment();

      ctrl.setMaxDateFromLocationTZ(locations);
      expect(scope.filterMaxDate).toBeDefined();
      expect(scope.filterMaxDate).toEqual(
        defaultTZDate.startOf('day').local(true)
      );
      expect(moment.isMoment(scope.filterMaxDate)).toEqual(true);
      expect(scope.filterMaxDate.format('HH:mm:ss')).toEqual('00:00:00');
    });

    it('should set timezone to system default when locations array is empty', () => {
      var locations = [];
      var defaultTZDate = moment();

      ctrl.setMaxDateFromLocationTZ(locations);
      expect(scope.filterMaxDate).toBeDefined();
      expect(scope.filterMaxDate).toEqual(
        defaultTZDate.startOf('day').local(true)
      );
      expect(moment.isMoment(scope.filterMaxDate)).toEqual(true);
      expect(scope.filterMaxDate.format('HH:mm:ss')).toEqual('00:00:00');
    });

    it('scope.filterMaxDate should be less than one day in the future', () => {
      ctrl.setMaxDateFromLocationTZ(scope.filters.Locations);
      var maxDatePlusOne = moment(scope.filterMaxDate).add(1, 'days');
      expect(scope.filterMaxDate).toBeDefined();
      expect(scope.filterMaxDate).toBeLessThan(maxDatePlusOne);
      expect(moment.isMoment(scope.filterMaxDate)).toEqual(true);
      expect(scope.filterMaxDate.format('HH:mm:ss')).toEqual('00:00:00');
    });

    it('should convert local timezone to Asia/Shanghai timezone', () => {
      var userLocation = '{"id": 4, "timezone": "Central Standard Time"}';
      sessionStorage.setItem('userLocation', userLocation);
      var mockedDate = moment.tz('Asia/Shanghai');
      timeZoneFactoryMock.ConvertDateToMomentTZ.and.returnValue(mockedDate);

      ctrl.initializeFilters();
      scope.$apply();
      expect(scope.filterMaxDate).toEqual(mockedDate.startOf('day').local(true));
      expect(moment.isMoment(scope.filterMaxDate)).toEqual(true);
      expect(scope.filterMaxDate.format('HH:mm:ss')).toEqual('00:00:00');
    });
  });

  describe('$scope.applyFilters function ->', function () {
    beforeEach(function () {
      scope.filterObject = {
        dateRange: {
          start: '3/2/2020',
          end: '3/4/2020',
        },
        transactionTypes: [1, 2],
        IncludePaidTransactions: false,
        IncludeUnpaidTransactions: false,
        IncludeAppliedTransactions: false,
        IncludeUnappliedTransactions: false,
        IncludeAccountNotes: false,
        IncludeDocuments: false,
        locations: [3, 4],
        members: [5, 6],
        providers: [7, 8],
        Teeth: [],
      };
    });
    it('should set the filterObject variables to null when all options are selected', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      _.each(scope.filters.TransactionTypes, function (type) {
        type.Selected = true;
      });
      _.each(scope.filters.TransactionStatus, function (status) {
        status.Selected = true;
      });
      _.each(scope.filters.Locations, function (loc) {
        loc.Selected = true;
      });
      _.each(scope.filters.Patients, function (pat) {
        pat.Selected = true;
      });
      _.each(scope.filters.Providers, function (prov) {
        prov.Selected = true;
      });
      _.each(scope.filters.Statuses, function (stat) {
        stat.Selected = true;
      });
      scope.applyFilters();

      expect(applyFiltersSpy).toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toBeNull();
      expect(scope.filterObject.locations).toBeNull();
      expect(scope.filterObject.members).toBe('0');
      expect(scope.filterObject.providers).toBeNull();
      expect(scope.filterObject.IncludePaidTransactions).toEqual(true);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(true);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(true);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(true);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(true);
      expect(scope.filterObject.IncludeDocuments).toEqual(true);
      expect(scope.filterObject.Statuses).toBeNull();
    });
    it('should set the filterObject variables to list of selected ids when all options are not selected', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      _.each(scope.filters.TransactionStatus, function (status) {
        status.Selected = false;
      });
      _.each(scope.filters.Statuses, function (status) {
        status.Selected = false;
      });
      scope.filters.TransactionTypes[0].Selected = false;
      scope.filters.TransactionTypes[1].Selected = false;
      scope.filters.Locations[0].Selected = false;
      scope.filters.Patients[0].Selected = false;
      scope.filters.Providers[0].Selected = false;
      scope.filters.TransactionStatus[1].Selected = true;
      scope.filters.Statuses[1].Selected = true;
      scope.applyFilters();

      expect(applyFiltersSpy).toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toEqual([
        2,
        3,
        4,
        5,
        6,
        7,
        8,
      ]);
      expect(scope.filterObject.Statuses).toEqual([1]);
      expect(scope.filterObject.locations).toEqual([3]);
      expect(scope.filterObject.members).toEqual([100]);
      expect(scope.filterObject.providers).toEqual([
        'dd20b506-6a87-e711-bf16-204747fa7c7e',
        'dd20b506-6a87-e711-bf16-204747fa7c7f',
      ]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(true);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(true);
      expect(scope.filterObject.IncludeDocuments).toEqual(true);
    });
    it('should return if invalid date', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      scope.errors.dateError.hasError = true;
      scope.applyFilters();

      expect(applyFiltersSpy).not.toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toEqual([1, 2]);
      expect(scope.filterObject.locations).toEqual([3, 4]);
      expect(scope.filterObject.members).toEqual([5, 6]);
      expect(scope.filterObject.providers).toEqual([7, 8]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(false);
      expect(scope.filterObject.IncludeDocuments).toEqual(false);
    });
    it('should return if invalid location', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      scope.errors.locationError.hasError = true;
      scope.applyFilters();

      expect(applyFiltersSpy).not.toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toEqual([1, 2]);
      expect(scope.filterObject.locations).toEqual([3, 4]);
      expect(scope.filterObject.members).toEqual([5, 6]);
      expect(scope.filterObject.providers).toEqual([7, 8]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(false);
      expect(scope.filterObject.IncludeDocuments).toEqual(false);
    });
    it('should return if invalid account member', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      scope.errors.patientError.hasError = true;
      scope.applyFilters();

      expect(applyFiltersSpy).not.toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toEqual([1, 2]);
      expect(scope.filterObject.locations).toEqual([3, 4]);
      expect(scope.filterObject.members).toEqual([5, 6]);
      expect(scope.filterObject.providers).toEqual([7, 8]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(false);
      expect(scope.filterObject.IncludeDocuments).toEqual(false);
    });
    it('should return if invalid provider', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      scope.errors.providerError.hasError = true;
      scope.applyFilters();

      expect(applyFiltersSpy).not.toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toEqual([1, 2]);
      expect(scope.filterObject.locations).toEqual([3, 4]);
      expect(scope.filterObject.members).toEqual([5, 6]);
      expect(scope.filterObject.providers).toEqual([7, 8]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(false);
      expect(scope.filterObject.IncludeDocuments).toEqual(false);
    });
    it('should return if invalid transactionType', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      scope.errors.transactionTypeError.hasError = true;
      scope.applyFilters();

      expect(applyFiltersSpy).not.toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toEqual([1, 2]);
      expect(scope.filterObject.locations).toEqual([3, 4]);
      expect(scope.filterObject.members).toEqual([5, 6]);
      expect(scope.filterObject.providers).toEqual([7, 8]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(false);
      expect(scope.filterObject.IncludeDocuments).toEqual(false);
    });
    it('should return if invalid status', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      scope.errors.statusError.hasError = true;
      scope.applyFilters();

      expect(applyFiltersSpy).not.toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toEqual([1, 2]);
      expect(scope.filterObject.locations).toEqual([3, 4]);
      expect(scope.filterObject.members).toEqual([5, 6]);
      expect(scope.filterObject.providers).toEqual([7, 8]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(scope.filterObject.IncludeAccountNotes).toEqual(false);
      expect(scope.filterObject.IncludeDocuments).toEqual(false);
    });
    it('should set the IncludeAccopuntNotes property to true', function () {
      spyOn(ctrl, 'applyChanges');
      scope.filters.TransactionTypes[7].Selected = true;
      scope.filters.TransactionTypes[8].Selected = false;
      scope.applyFilters();

      expect(scope.filterObject.IncludeAccountNotes).toEqual(true);
      expect(scope.filterObject.IncludeDocuments).toEqual(false);
    });
    it('should set the IncludeDocuments property to true', function () {
      spyOn(ctrl, 'applyChanges');
      scope.filters.TransactionTypes[7].Selected = false;
      scope.filters.TransactionTypes[8].Selected = true;
      scope.applyFilters();

      expect(scope.filterObject.IncludeAccountNotes).toEqual(false);
      expect(scope.filterObject.IncludeDocuments).toEqual(true);
    });
  });

  describe('filterChanged ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setFilterBarProperties');
      scope.filters.Teeth = [{ USNumber: '1' }];
    });
    it('should set filter count when additional filters selected', function () {
      scope.filters.TransactionTypes[0].Selected = false;
      scope.filters.Providers[0].Selected = false;
      scope.filters.TransactionStatus[0].Selected = false;
      scope.filterChanged();
      expect(scope.filterCount).toBe(4);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set filter count to 0 when no additional filters selected', function () {
      scope.filters.TransactionTypes[0].Selected = true;
      scope.filters.Providers[0].Selected = true;
      scope.filters.TransactionStatus[0].Selected = true;
      scope.filters.Teeth = [];
      scope.filterChanged();
      expect(scope.filterCount).toBe(0);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
  });

  describe('ctrl.setPatientFilter ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setFilterBarProperties');
    });
    it('should not update filter if shareData.accountMembersDetail is undefined', function () {
      shareData.accountMembersDetail = undefined;
      ctrl.selectedFilters = null;
      ctrl.setPatientFilter();
      expect(scope.filters.Patients).toEqual([
        {
          Id: 0,
          Text: 'All Account Members',
          Selected: false,
          IsAllOption: true,
          IsDefault: false,
          Status: 'All',
        },
      ]);
      expect(ctrl.selectedFilters).toEqual(scope.filters);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set the currentPatientId filter Selected option to true', function () {
      shareData.selectedPatients = undefined;
      shareData.currentPatientId = 100;
      ctrl.selectedFilters = null;
      ctrl.setPatientFilter();
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: false,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Patients[1]).toEqual({
        Id: 100,
        Text: 'Test (RP)',
        Selected: true,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Patients[2]).toEqual({
        Id: 200,
        Text: 'Test2',
        Selected: false,
        IsAllOption: false,
        Status: 'Inactive',
      });
      expect(ctrl.selectedFilters).toEqual(scope.filters);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set the currentPatientId filter Selected option to true and All option if only on acct member', function () {
      shareData.accountMembersDetail = [
        {
          personId: 100,
          patientDetailedName: 'Test',
          isResponsiblePerson: true,
          isActivePatient: true,
        },
      ];
      shareData.selectedPatients = undefined;
      shareData.currentPatientId = 100;
      ctrl.selectedFilters = null;
      ctrl.setPatientFilter();
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: true,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Patients[1]).toEqual({
        Id: 100,
        Text: 'Test (RP)',
        Selected: true,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(ctrl.selectedFilters).toEqual(scope.filters);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set all filter Selected options to false if no currentPatientId', function () {
      shareData.selectedPatients = undefined;
      shareData.currentPatientId = undefined;
      ctrl.selectedFilters = null;
      ctrl.setPatientFilter();
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: false,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Patients[1]).toEqual({
        Id: 100,
        Text: 'Test (RP)',
        Selected: false,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Patients[2]).toEqual({
        Id: 200,
        Text: 'Test2',
        Selected: false,
        IsAllOption: false,
        Status: 'Inactive',
      });
      expect(ctrl.selectedFilters).toEqual(scope.filters);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set Selected options to true if in shareData.selectedPatients', function () {
      shareData.selectedPatients = [200];
      shareData.currentPatientId = 100;
      ctrl.selectedFilters = null;
      ctrl.setPatientFilter();
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: false,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Patients[1]).toEqual({
        Id: 100,
        Text: 'Test (RP)',
        Selected: false,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Patients[2]).toEqual({
        Id: 200,
        Text: 'Test2',
        Selected: true,
        IsAllOption: false,
        Status: 'Inactive',
      });
      expect(ctrl.selectedFilters).toEqual(scope.filters);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set Selected options to true if in shareData.selectedPatients and all option if all patients selected', function () {
      shareData.selectedPatients = [100, 200];
      shareData.currentPatientId = 100;
      ctrl.selectedFilters = null;
      ctrl.setPatientFilter();
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: true,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Patients[1]).toEqual({
        Id: 100,
        Text: 'Test (RP)',
        Selected: true,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Patients[2]).toEqual({
        Id: 200,
        Text: 'Test2',
        Selected: true,
        IsAllOption: false,
        Status: 'Inactive',
      });
      expect(ctrl.selectedFilters).toEqual(scope.filters);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set Selected options to true if all option in shareData.selectedPatients', function () {
      shareData.selectedPatients = '0';
      shareData.currentPatientId = 100;
      ctrl.selectedFilters = null;
      ctrl.setPatientFilter();
      expect(scope.filters.Patients[0]).toEqual({
        Id: 0,
        Text: 'All Account Members',
        Selected: true,
        IsAllOption: true,
        IsDefault: false,
        Status: 'All',
      });
      expect(scope.filters.Patients[1]).toEqual({
        Id: 100,
        Text: 'Test (RP)',
        Selected: true,
        IsAllOption: false,
        Status: 'Active',
      });
      expect(scope.filters.Patients[2]).toEqual({
        Id: 200,
        Text: 'Test2',
        Selected: true,
        IsAllOption: false,
        Status: 'Inactive',
      });
      expect(ctrl.selectedFilters).toEqual(scope.filters);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
  });

  describe('$scope.resetFilters function ->', function () {
    beforeEach(function () {
      scope.filterObject = {
        dateRange: {
          start: '3/2/2020',
          end: '3/4/2020',
        },
        transactionTypes: [1, 2],
        locations: [3, 4],
        members: [5, 6],
        provider: [7, 8],
        IncludePaidTransactions: false,
        IncludeUnpaidTransactions: false,
        IncludeAppliedTransactions: false,
        IncludeUnappliedTransactions: false,
      };
      spyOn(scope, '$broadcast');
    });
    it('should set the scope.disableReset variable to true', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      _.each(scope.filters.TransactionTypes, function (type) {
        type.Selected = false;
      });
      _.each(scope.filters.Locations, function (loc) {
        loc.Selected = false;
      });
      _.each(scope.filters.Patients, function (pat) {
        pat.Selected = false;
      });
      _.each(scope.filters.Providers, function (prov) {
        prov.Selected = false;
      });
      scope.resetFilters();

      expect(scope.$broadcast).toHaveBeenCalledWith('dateSelector.clear');
      expect(applyFiltersSpy).toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toBeNull();
      expect(scope.filterObject.locations).toBeNull();
      _.each(scope.filters.TransactionTypes, function (type) {
        expect(type.Selected).toBe(true);
      });
      _.each(scope.filters.Locations, function (loc) {
        expect(loc.Selected).toBe(true);
      });
      _.each(scope.filters.Providers, function (prov) {
        expect(prov.Selected).toBe(true);
      });
      _.each(scope.filters.TransactionStatus, function (status) {
        expect(status.Selected).toBe(true);
      });
      expect(scope.filters.Patients[0].Selected).toBe(false);
      expect(scope.filters.Patients[1].Selected).toBe(true);
      expect(scope.filterObject.members).toEqual([100]);
      expect(scope.filterObject.IncludePaidTransactions).toEqual(true);
      expect(scope.filterObject.IncludeUnpaidTransactions).toEqual(true);
      expect(scope.filterObject.IncludeUnappliedTransactions).toEqual(true);
      expect(scope.filterObject.IncludeAppliedTransactions).toEqual(true);
      expect(scope.errors.dateError.hasError).toBe(false);
      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
    });
    it('should set filter member object to 0 if all patients selected', function () {
      var applyFiltersSpy = spyOn(ctrl, 'applyChanges');
      _.each(scope.filters.TransactionTypes, function (type) {
        type.Selected = false;
      });
      _.each(scope.filters.Locations, function (loc) {
        loc.Selected = false;
      });
      scope.filters.Patients = [
        {
          Id: 0,
          Text: 'All Account Members',
          Selected: false,
          IsAllOption: true,
          IsDefault: false,
        },
        { Id: 100, Text: 'Test', Selected: false, IsAllOption: false },
      ];
      scope.resetFilters();

      expect(scope.$broadcast).toHaveBeenCalledWith('dateSelector.clear');
      expect(applyFiltersSpy).toHaveBeenCalled();
      expect(scope.filterObject.transactionTypes).toBeNull();
      expect(scope.filterObject.locations).toBeNull();
      _.each(scope.filters.TransactionTypes, function (type) {
        expect(type.Selected).toBe(true);
      });
      _.each(scope.filters.Locations, function (loc) {
        expect(loc.Selected).toBe(true);
      });
      _.each(scope.filters.Providers, function (prov) {
        expect(prov.Selected).toBe(true);
      });
      expect(scope.filters.Patients[0].Selected).toBe(true);
      expect(scope.filters.Patients[1].Selected).toBe(true);
      expect(scope.filterObject.members).toBe('0');
      expect(scope.errors.dateError.hasError).toBe(false);
      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
    });
  });

  describe('ctrl.applyChanges ->', function () {
    it('should call apply changes function', function () {
      scope.applyChangesFunction = function () {};
      ctrl.hideRunningBalance = true;
      spyOn(ctrl, 'setFilterBarProperties');
      spyOn(scope, 'applyChangesFunction');
      ctrl.applyChanges();
      expect(scope.applyChangesFunction).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
      expect(scope.showMoreFilters).toBe(false);
      expect(scope.hideRunningBalance).toBe(true);
    });
    it('should set the Teeth array on the filterObject', function () {
      scope.applyChangesFunction = function () {};
      spyOn(scope, 'applyChangesFunction');
      scope.filters.Teeth = ['1', '3', '6'];
      ctrl.applyChanges();

      expect(scope.filterObject.Teeth).toEqual(['1', '3', '6']);
      expect(scope.applyChangesFunction).toHaveBeenCalled();
    });
  });

  describe('ctrl.filterDatesAreValid function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setFilterBarProperties');
    });
    // All valid
    it('should set scope.dateError to false', function () {
      ctrl.filterDatesAreValid();

      expect(scope.errors.dateError.hasError).toBe(false);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    // Start date > end date
    it('should set scope.dateError to true', function () {
      scope.filterObject.dateRange.start = '3/09/2020';
      scope.filterObject.dateRange.end = '3/08/2020';
      ctrl.filterDatesAreValid();

      expect(scope.errors.dateError.hasError).toBe(true);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    // Start date or end date undefined
    it('should set scope.dateError to false', function () {
      scope.filterObject.dateRange.start = undefined;
      scope.filterObject.dateRange.end = '3/08/2020';
      ctrl.filterDatesAreValid();

      expect(scope.errors.dateError.hasError).toBe(false);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
  });

  describe('scope.listFilterIsValid function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setFilterBarProperties');
      spyOn(scope, 'filterChanged');
    });
    it('should set location error to false when changed selection', function () {
      scope.filters.Locations[0].Selected = false;
      scope.listFilterIsValid('Location');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).not.toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set location error to true when no locations selected', function () {
      _.each(scope.filters.Locations, function (loc) {
        loc.Selected = false;
      });
      scope.listFilterIsValid('Location');

      expect(scope.errors.locationError.hasError).toBe(true);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).not.toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set patient error to false when changed selection', function () {
      scope.filters.Patients[0].Selected = true;
      scope.listFilterIsValid('Patient');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).not.toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set patient error to true when no patients selected', function () {
      _.each(scope.filters.Patients, function (pat) {
        pat.Selected = false;
      });
      scope.listFilterIsValid('Patient');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(true);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).not.toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set provider error to true when no providers selected', function () {
      _.each(scope.filters.Providers, function (prov) {
        prov.Selected = false;
      });
      scope.listFilterIsValid('Provider');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(true);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set provider error to false when changed selection', function () {
      scope.filters.Providers[0].Selected = false;
      scope.filters.Providers[1].Selected = true;
      scope.listFilterIsValid('Provider');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set transactiontype error to true when no transactiontypes selected', function () {
      _.each(scope.filters.TransactionTypes, function (type) {
        type.Selected = false;
      });
      scope.listFilterIsValid('TransactionTypes');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(true);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set transactiontype error to false when changed selection', function () {
      scope.filters.TransactionTypes[0].Selected = false;
      scope.filters.TransactionTypes[1].Selected = true;
      scope.listFilterIsValid('TransactionTypes');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });

    it('should set transactiontype error to true when no statuses selected', function () {
      _.each(scope.filters.Statuses, function (type) {
        type.Selected = false;
      });
      scope.listFilterIsValid('TransactionStatus');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(true);
      expect(scope.filterChanged).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
    it('should set transactiontype error to false when changed selection', function () {
      scope.filters.Statuses[0].Selected = false;
      scope.filters.Statuses[1].Selected = true;
      scope.listFilterIsValid('TransactionStatus');

      expect(scope.errors.locationError.hasError).toBe(false);
      expect(scope.errors.patientError.hasError).toBe(false);
      expect(scope.errors.providerError.hasError).toBe(false);
      expect(scope.errors.transactionTypeError.hasError).toBe(false);
      expect(scope.errors.statusError.hasError).toBe(false);
      expect(scope.filterChanged).toHaveBeenCalled();
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
  });

  describe('ctrl.filtersAreNotValid function ->', function () {
    beforeEach(function () {
      scope.filterObject = filterObject;
    });
    it('should return false when no errors', function () {
      var result = ctrl.filtersAreNotValid();

      expect(result).toBe(false);
    });
    it('should return true when date error', function () {
      scope.errors.dateError.hasError = true;
      var result = ctrl.filtersAreNotValid();

      expect(result).toBe(true);
    });
    it('should return true when location error', function () {
      scope.errors.locationError.hasError = true;
      var result = ctrl.filtersAreNotValid();

      expect(result).toBe(true);
    });
    it('should return true when patient error', function () {
      scope.errors.patientError.hasError = true;
      var result = ctrl.filtersAreNotValid();

      expect(result).toBe(true);
    });
    it('should return true when provider error', function () {
      scope.errors.providerError.hasError = true;
      var result = ctrl.filtersAreNotValid();

      expect(result).toBe(true);
    });
    it('should return true when transactionType error', function () {
      scope.errors.transactionTypeError.hasError = true;
      var result = ctrl.filtersAreNotValid();

      expect(result).toBe(true);
    });
    it('should return true when statusError error', function () {
      scope.errors.statusError.hasError = true;
      var result = ctrl.filtersAreNotValid();

      expect(result).toBe(true);
    });
  });

  describe('ctrl.setFilterBarProperties function ->', function () {
    it('should disable buttons if default selection', function () {
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(true);
      expect(scope.disableApply).toBe(true);
      expect(ctrl.hideRunningBalance).toBe(false);
    });
    it('should not disable buttons if not default selection and filter has been changed without clicking apply', function () {
      scope.filters.Locations[0].Selected = false;
      scope.filterObject.locations = [3];
      ctrl.selectedFilters = _.cloneDeep(scope.filters);
      scope.filters.Locations[1].Selected = false;
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(false);
      expect(scope.disableApply).toBe(false);
      expect(ctrl.hideRunningBalance).toBe(true);
    });
    it('should disable apply button if invalid date', function () {
      scope.errors.dateError.hasError = true;
      scope.filters.Locations[0].Selected = false;
      scope.filterObject.locations = [3];
      ctrl.selectedFilters = _.cloneDeep(scope.filters);
      scope.filters.Locations[1].Selected = false;
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(false);
      expect(scope.disableApply).toBe(true);
      expect(ctrl.hideRunningBalance).toBe(true);
    });
    it('should disable apply button if invalid location', function () {
      scope.errors.locationError.hasError = true;
      scope.filters.Locations[0].Selected = false;
      scope.filterObject.locations = [3];
      ctrl.selectedFilters = _.cloneDeep(scope.filters);
      scope.filters.Locations[1].Selected = false;
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(false);
      expect(scope.disableApply).toBe(true);
      expect(ctrl.hideRunningBalance).toBe(true);
    });
    it('should disable reset button if default selection applied and enable apply if filter has been changed without clicking apply', function () {
      scope.filters.Locations[0].Selected = false;
      ctrl.selectedFilters = _.cloneDeep(scope.filters);
      scope.filters.Locations[1].Selected = false;
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(true);
      expect(scope.disableApply).toBe(false);
      expect(ctrl.hideRunningBalance).toBe(false);
    });
    it('should not hide running balance if only account member filter has changed', function () {
      scope.filters.Patients[2].Selected = true;
      ctrl.selectedFilters = _.cloneDeep(scope.filters);
      scope.filterObject.members = [100, 200];
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(false);
      expect(scope.disableApply).toBe(true);
      expect(ctrl.hideRunningBalance).toBe(false);
    });
    it('should not hide running balance if filter out account notes and documents', function () {
      scope.filters.TransactionTypes[7].Selected = scope.filters.TransactionTypes[8].Selected = false;
      ctrl.selectedFilters = _.cloneDeep(scope.filters);
      scope.filterObject.transactionTypes = [1, 2, 3, 4, 5, 6];
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(false);
      expect(scope.disableApply).toBe(true);
      expect(ctrl.hideRunningBalance).toBe(false);
    });
    it('should hide running balance if filter out transaction type besides account notes and documents', function () {
      scope.filters.TransactionTypes[4].Selected = false;
      ctrl.selectedFilters = _.cloneDeep(scope.filters);
      scope.filterObject.transactionTypes = [1, 2, 3, 5, 6, 7, 8];
      ctrl.setFilterBarProperties();

      expect(scope.disableReset).toBe(false);
      expect(scope.disableApply).toBe(true);
      expect(ctrl.hideRunningBalance).toBe(true);
    });
  });

  describe('ctrl.resetPatientFilter ->', function () {
    it('Should not change filter if currentPatientId is undefined', function () {
      _.each(scope.filters.Patients, function (pat) {
        pat.Selected = true;
      });
      shareData.currentPatientId = undefined;
      ctrl.resetPatientFilter();
      _.each(scope.filters.Patients, function (option) {
        expect(option.Selected).toBe(true);
      });
    });
    it('Should set the option with currentPatientId to true', function () {
      _.each(scope.filters.Patients, function (pat) {
        pat.Selected = true;
      });
      ctrl.resetPatientFilter();
      expect(scope.filters.Patients[0].Selected).toBe(false);
      expect(scope.filters.Patients[1].Selected).toBe(true);
      expect(scope.filters.Patients[2].Selected).toBe(false);
    });
    it('Should set all selected properties of options to false if currentPatientId is not found in option list', function () {
      _.each(scope.filters.Patients, function (pat) {
        pat.Selected = true;
      });
      shareData.currentPatientId = 600;
      ctrl.resetPatientFilter();
      _.each(scope.filters.Patients, function (option) {
        expect(option.Selected).toBe(false);
      });
    });
    it('Should set selected to true of all option if only one patient', function () {
      scope.filters.Patients = [
        {
          Id: 0,
          Text: 'All Account Members',
          Selected: false,
          IsAllOption: true,
          IsDefault: false,
        },
        { Id: 100, Text: 'Test', Selected: false, IsAllOption: false },
      ];
      ctrl.resetPatientFilter();
      expect(scope.filters.Patients[0].Selected).toBe(true);
      expect(scope.filters.Patients[1].Selected).toBe(true);
    });
  });

  describe('ctrl.updateFilterBarStatus function ->', function () {
    it('should set the scope.filterBarDisabled variable to true', function () {
      spyOn(ctrl, 'setFilterBarProperties');
      ctrl.updateFilterBarStatus(true);

      expect(scope.filterBarDisabled).toBe(true);
      expect(scope.showMoreFilters).toBe(false);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });

    it('should set the scope.filterBarDisabled variable to false', function () {
      spyOn(ctrl, 'setFilterBarProperties');
      ctrl.updateFilterBarStatus(false);

      expect(scope.filterBarDisabled).toBe(false);
      expect(scope.showMoreFilters).toBe(false);
      expect(ctrl.setFilterBarProperties).toHaveBeenCalled();
    });
  });
});

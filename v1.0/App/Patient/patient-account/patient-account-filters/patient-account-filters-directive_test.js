describe('patient-account-filters ->', function () {
  var localize, scope, ctrl, filter, q;

  var list1Mock = [{ Tooth: '22' }, {}];

  var list2Mock = [{}, {}];

  var filterObjectMock = {
    members: [],
    dateRange: {
      start: null,
      end: null,
    },
    teethNumbers: [],
    transactionTypes: [],
    providers: [],
  };

  var accountMembersMock = [
    { personId: 0, accountMemberId: 0 },
    { personId: 1, accountMemberId: 1 },
    { personId: 2, accountMemberId: 2 },
    { personId: 3, accountMemberId: 3 },
  ];

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $filter, $q) {
    q = $q;
    var usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        var userFactoryDeferred = q.defer();
        userFactoryDeferred.resolve(1);
        return {
          result: userFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };
    var staticData = {};
    staticData.TransactionTypes = jasmine.createSpy().and.callFake(function () {
      var deferred = q.defer();
      return deferred.promise;
    });
    filter = $injector.get('$filter');
    scope = $rootScope.$new();
    scope.list1 = angular.copy(list1Mock);
    scope.list2 = angular.copy(list2Mock);
    scope.filterObject = angular.copy(filterObjectMock);
    scope.accountMembers = angular.copy(accountMembersMock);
    ctrl = $controller('PatientAccountFiltersController', {
      $scope: scope,
      $filter: filter,
      UsersFactory: usersFactory,
      StaticData: staticData,
    });
  }));

  describe('controller ->', function () {
    it('should initialize the controller', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('initial setup ->', function () {
    it('should set initial values', function () {
      expect(scope.filterObject).toEqual(filterObjectMock);
      expect(ctrl.hasLoaded).toBe(false);
      expect(scope.data.accountMembers).toEqual(accountMembersMock);
      expect(scope.filterTemplate).toBe(
        'App/Patient/patient-account/patient-account-filters/patient-account-filters.html'
      );
    });
  });

  describe('currentPatientId watch ->', function () {
    it('should add one member to $scope.filterObject.members', function () {
      expect(scope.filterObject.members).toEqual([]);
      scope.currentPatientId = 2;
      scope.$apply();
      expect(scope.filterObject.members).toEqual([2]);
    });

    it('should add all members to $scope.filterObject.members', function () {
      expect(scope.filterObject.members).toEqual([]);
      scope.currentPatientId = 0;
      scope.$apply();
      expect(scope.filterObject.members).toEqual([0, 1, 2, 3]);
    });

    it('should set hasLoaded flag and make original copy of filterObject', function () {
      scope.currentPatientId = 3;
      scope.$apply();
      expect(ctrl.hasLoaded).toBe(true);
      expect(scope.originalFilterObject).toEqual(scope.filterObject);
    });
  });

  describe('addTeethToList function ->', function () {
    it('should add teeth numbers that exist in lists to $scope.data.activeTeeth', function () {
      ctrl.populateTeethAndUsersLists(scope.list1);
      expect(scope.data.activeTeeth[0]).toEqual('22');
    });
  });

  describe('filter function ->', function () {
    it('should add member to $scope.filterObject.members', function () {
      expect(scope.filterObject.members).toEqual([]);
      scope.data.filter('members', accountMembersMock[2].accountMemberId);
      expect(scope.filterObject.members[0]).toEqual(
        accountMembersMock[2].accountMemberId
      );
    });

    it('should remove member from $scope.filterObject.members', function () {
      scope.filterObject.members = [
        accountMembersMock[1].accountMemberId,
        accountMembersMock[2].accountMemberId,
      ];
      expect(scope.filterObject.members.length).toEqual(2);
      scope.data.filter('members', accountMembersMock[2].accountMemberId);
      expect(scope.filterObject.members.length).toEqual(1);
    });

    it('should add all members to $scope.filterObject.members', function () {
      expect(scope.filterObject.members).toEqual([]);
      scope.data.filter('members', accountMembersMock[0].accountMemberId);
      expect(scope.filterObject.members.length).toEqual(4);
    });

    it('should remove all member from $scope.filterObject.members', function () {
      expect(scope.filterObject.members).toEqual([]);
      scope.filterObject.members = [accountMembersMock[0].accountMemberId];
      scope.data.filter('members', accountMembersMock[0].accountMemberId);
      expect(scope.filterObject.members.length).toEqual(0);
    });
  });

  describe('filters function ->', function () {
    var item;

    beforeEach(inject(function () {
      var today = new Date('2019-11-11');
      scope.filterObject = {
        members: ['2'],
        dateRange: {
          start: today.getDate() - 14,
          end: today.getDate() + 1,
        },
        teethNumbers: ['10'],
      };
      item = {
        AccountMemberId: '2',
        DateEntered: today.getDate() - 12,
        Tooth: '10',
      };
    }));

    it('should return true if item contains a member in the filter object', function () {
      expect(ctrl.filters(item)).toBe(true);
    });

    it('should return false if item does not contain a member in the filter object', function () {
      scope.filterObject.members = ['1'];
      expect(ctrl.filters(item)).toBe(false);
    });

    it('should return true if item dates are in range of the filter object dates', function () {
      expect(ctrl.filters(item)).toBe(true);
    });

    it('should return true if item contains a tooth in the filter object', function () {
      expect(ctrl.filters(item)).toBe(true);
    });

    it('should return false if item does not contain a tooth in the filter object', function () {
      scope.filterObject.teethNumbers = ['13'];
      expect(ctrl.filters(item)).toBe(false);
    });
  });
});

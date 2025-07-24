import { of } from 'rsjs';

describe('ChartingControlsController tests ->', function () {
  var ctrl,
    scope,
    rootScope,
    chartButtonLayoutResponse,
    layoutItems,
    conditions,
    services;
  var chartingFavoritesFactory,
    referenceDataService,
    featureFlagService,
    patientOdontogramFactory,
    routeParams;
  var userServices, patSecurityService, modalFactory;

  chartButtonLayoutResponse = {
    ExtendedStatusCode: null,
    Value: {
      UserId: 'fff48edd-8a45-e611-9a6b-a4db3021bfa0',
      Pages: [
        {
          Favorites: [
            {
              Button: {
                Id: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
                TypeId: '2',
              },
            },
            {
              Button: {
                Id: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
                TypeId: '1',
              },
            },
            {
              Button: {
                Id: '9371c260-c84a-e611-8e06-8086f2269c78',
                TypeId: '3',
              },
            },
          ],
        },
      ],
      DataTag: "{'RowVersion':'AAAAAAACt2Y='}",
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2016-07-12T19:36:51.6764183',
    },
    Count: null,
    InvalidProperties: null,
  };

  layoutItems = [
    {
      Id: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
      Text: 'Internal Root Resorption',
      TypeId: 1,
      IconUrl: 'Images/ConditionIcons/default_condition.svg',
    },
    {
      Id: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
      Text: 'Crown3/4Resin',
      TypeId: 2,
      IconUrl: 'Images/ServiceIcons/default_service.svg',
    },
    {
      Id: '9371c260-c84a-e611-8e06-8086f2269c78',
      Text: 'Swift Code',
      TypeId: 3,
      IconUrl: 'Images/swftIcons/default_swft.svg',
    },
    {
      Id: '5485d845-y54r-e585-0t85-4019b639c78',
      Text: 'Group Code',
      TypeId: 4,
    },
    {
      Id: '00000000-0000-0000-0000-000000000000',
      Text: 'Bad',
      TypeId: 5,
    },
    {
      Id: null,
      Text: 'Group To Delete',
      TypeId: 1,
    },
  ];

  conditions = [
    {
      ConditionId: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
    },
    {
      ConditionId: '8db58108-8b45-e611-9a6b-a4db3021bfa0',
    },
  ];

  services = [
    {
      ServiceCodeId: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
      ServiceTypeId: '12',
      IsSwiftPickCode: false,
      IconName: 'randomIconName',
    },
    {
      ServiceCodeId: 'c5ac9626-8b45-e611-9a6b-a4db3021bfa0',
      ServiceTypeId: '13',
      IsSwiftPickCode: false,
      IconName: null,
    },
    {
      ServiceCodeId: '9371c260-c84a-e611-8e06-8086f2269c78',
      IsSwiftPickCode: true,
      IconName: null,
    },
  ];

  chartingFavoritesFactory = {
    SetSelectedChartingFavorites: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue(),
    }),
    SetChartingButtonLayout: jasmine.createSpy().and.returnValue(layoutItems),
  };
  patientOdontogramFactory = {};
  routeParams = { patientId: 'patientId' };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
          users: 'users',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      userServices = {};
      $provide.value('UserServices', userServices);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  var $q;

  beforeEach(inject(function ($rootScope, $controller, _$q_) {
    $q = _$q_;
    rootScope = $rootScope;
    scope = $rootScope.$new();

    patSecurityService = {};
    modalFactory = {};

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    ctrl = $controller('ChartingControlsController', {
      $scope: scope,
      ScheduleServices: {},
      ModalFactory: modalFactory,
      ChartingFavoritesFactory: chartingFavoritesFactory,
      $routeParams: routeParams,
      PatientOdontogramFactory: patientOdontogramFactory,
      patSecurityService: patSecurityService,
    });
    scope.layoutItems = [];
  }));

  describe('ctrl.$onInit function ->', function () {
    it('should set values and call functions', function () {
      scope.list = 'list';
      scope.selectedFavorite = 'favorite';
      scope.favoritesDropdownDisabled = false;
      scope.layoutItems = 'items';
      scope.conditions = 'conditions';
      scope.services = 'services';
      scope.personId = 'junk';
      scope.getPatient = jasmine.createSpy();
      ctrl.getTeethDefinitions = jasmine.createSpy();
      ctrl.getConditions = jasmine.createSpy().and.returnValue($q.resolve());
      ctrl.getServices = jasmine.createSpy().and.returnValue($q.resolve());
      patientOdontogramFactory.setSelectedTeeth = jasmine.createSpy();
      scope.SwiftCodesProgress = 'progress';
      scope.chartingButtonLayout = 'layout';
      scope.grouping = true;
      scope.groupView = true;
      scope.groupTitle = 'title';
      scope.newGroupTitle = 'new title';
      scope.favoritesBackup = 'backup';
      scope.sorting = true;
      scope.currentGroupIndex = 'index';
      scope.titleBackup = 'titlebackup';
      scope.editMode = true;
      scope.pageSelected = 100;
      scope.showCloseButton = true;
      scope.editTitle = true;
      scope.navigationEnabled = true;
      scope.currentPageCopy = 'copy';
      chartingFavoritesFactory.observeChartButtonLayout = jasmine.createSpy();
      chartingFavoritesFactory.observeCurrentPage = jasmine.createSpy();
      ctrl.propServPrebuilt = true;
      scope.disableImport = false;
      scope.disableImportMessage = 'message';
      ctrl.getUserListForImport = jasmine
        .createSpy()
        .and.returnValue($q.resolve());

      ctrl.$onInit();
      scope.$apply();
      expect(scope.list).toEqual([]);
      expect(scope.selectedFavorite).toEqual({});
      expect(scope.favoritesDropdownDisabled).toEqual(true);
      expect(scope.layoutItems).toEqual(null);
      expect(scope.conditions).toEqual([]);
      expect(scope.services).toEqual([]);
      expect(scope.personId).toEqual(routeParams.patientId);
      expect(scope.getPatient).toHaveBeenCalledWith(scope.personId);
      expect(ctrl.getTeethDefinitions).toHaveBeenCalled();
      expect(ctrl.getConditions).toHaveBeenCalled();
      expect(ctrl.getServices).toHaveBeenCalled();
      expect(patientOdontogramFactory.setSelectedTeeth).not.toHaveBeenCalled();
      expect(scope.SwiftCodesProgress).toEqual('');
      expect(scope.chartingButtonLayout).toEqual({});
      expect(scope.grouping).toEqual(false);
      expect(scope.groupView).toEqual(false);
      expect(scope.groupTitle).toEqual({ Title: '' });
      expect(scope.newGroupTitle).toEqual('');
      expect(scope.favoritesBackup).toEqual(null);
      expect(scope.sorting).toEqual(false);
      expect(scope.currentGroupIndex).toEqual(null);
      expect(scope.titleBackup).toEqual({});
      expect(scope.editMode).toEqual(false);
      expect(scope.pageSelected).toEqual(0);
      expect(scope.showCloseButton).toEqual(false);
      expect(scope.editTitle).toEqual(false);
      expect(scope.navigationEnabled).toEqual(false);
      expect(scope.currentPageCopy).toEqual(null);
      expect(
        chartingFavoritesFactory.observeChartButtonLayout
      ).toHaveBeenCalledWith(scope.updateChartingLayout);
      expect(chartingFavoritesFactory.observeCurrentPage).toHaveBeenCalledWith(
        scope.setCurrentPage
      );
      expect(ctrl.propServPrebuilt).toEqual(false);
      expect(scope.disableImport).toEqual(true);
      expect(scope.disableImportMessage).toEqual('Retrieving data');
      expect(ctrl.getUserListForImport).toHaveBeenCalled();
    });
  });

  describe('scope.openChartButtonLayoutCrud function ->', function () {
    beforeEach(function () {
      scope.viewSettings = {
        expandView: false,
        activeExpand: 1,
      };

      scope.toggleSorting = jasmine.createSpy();
      scope.addManageDnD = jasmine.createSpy();

      scope.layoutItems = 'layoutItems';
      scope.chartingButtonLayout = 'chartingButtonLayout';
      scope.pageSelected = 'pageSelected';
    });

    it('should set values and call methods', function () {
      scope.openChartButtonLayoutCrud();

      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(4);
      expect(scope.toggleSorting).toHaveBeenCalled();
      expect(scope.addManageDnD).toHaveBeenCalled();
      expect(
        chartingFavoritesFactory.SetSelectedChartingFavorites
      ).toHaveBeenCalledWith(
        scope.layoutItems,
        scope.chartingButtonLayout,
        false,
        scope.pageSelected
      );
    });
  });

  describe('scope.closeChartButtonLayoutCrud function ->', function () {
    beforeEach(function () {
      scope.viewSettings = {
        expandView: true,
        activeExpand: 1,
      };

      scope.toggleSorting = jasmine.createSpy();
    });

    it('should set values and call methods', function () {
      scope.closeChartButtonLayoutCrud();

      expect(scope.viewSettings.expandView).toBe(false);
      expect(scope.viewSettings.activeExpand).toBe(0);
      expect(scope.toggleSorting).toHaveBeenCalled();
    });
  });

  describe('ctrl.getUserListForImport function ->', function () {
    var processUsersResult;
    beforeEach(function () {
      processUsersResult = 'processUsersResult';
      userServices.ChartButtonLayout = {
        getAllUsersWithFavorites: jasmine
          .createSpy()
          .and.returnValue({ $promise: $q.resolve() }),
      };
      ctrl.processUsers = jasmine
        .createSpy()
        .and.returnValue($q.resolve(processUsersResult));
    });

    it('should call methods with correct parameters', function () {
      ctrl.getUserListForImport();
      scope.$apply();
      expect(
        userServices.ChartButtonLayout.getAllUsersWithFavorites
      ).toHaveBeenCalledWith(
        ctrl.getUserListForImportSuccess,
        ctrl.getUserListForImportFailure
      );
      expect(ctrl.processUsers).toHaveBeenCalled();
      expect(ctrl.usersDict).toBe(processUsersResult);
    });
  });

  describe('ctrl.getUserListForImportSuccess function ->', function () {
    beforeEach(function () {
      ctrl.getUserListForImportFailure = jasmine.createSpy();
      ctrl.processUserListForImport = jasmine.createSpy();
      ctrl.usersDict = 'usersDict';
    });

    it('should call ctrl.getUserListForImportFailure when res is undefined', function () {
      ctrl.getUserListForImportSuccess();

      expect(ctrl.getUserListForImportFailure).toHaveBeenCalled();
    });

    it('should call ctrl.getUserListForImportFailure when res.Value is undefined', function () {
      ctrl.getUserListForImportSuccess({});

      expect(ctrl.getUserListForImportFailure).toHaveBeenCalled();
    });

    it('should call ctrl.getUserListForImportFailure when res.Value.length is 0', function () {
      ctrl.getUserListForImportSuccess({ Value: [] });

      expect(ctrl.getUserListForImportFailure).toHaveBeenCalled();
    });

    it('should call ctrl.getUserListForImportFailure when ctrl.usersDict is undefined', function () {
      ctrl.usersDict = null;

      ctrl.getUserListForImportSuccess({ Value: [{}] });

      expect(ctrl.getUserListForImportFailure).toHaveBeenCalled();
    });

    it('should call ctrl.processUserListForImport when values are present', function () {
      var value = 'value';

      ctrl.getUserListForImportSuccess({ Value: value });

      expect(ctrl.processUserListForImport).toHaveBeenCalledWith(value);
    });
  });

  describe('ctrl.getUserListForImportFailure function ->', function () {
    var message;
    beforeEach(function () {
      message = 'oldmessage';
      scope.disableImport = false;
      scope.disableImportMessage = message;
    });

    it('should set values', function () {
      ctrl.getUserListForImportFailure();

      expect(scope.disableImport).toBe(true);
      expect(scope.disableImportMessage).not.toBe(message);
    });
  });

  describe('ctrl.processUsers function ->', function () {
    it('should call referenceDataService.get for users', function () {
      ctrl.processUsers();
      scope.$apply();
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.users
      );
    });

    it('should return null when users is undefined', function (done) {
      referenceDataService.getData.and.returnValue($q.resolve(undefined));
      ctrl.processUsers().then(function (result) {
        expect(result).toBeNull();
        done();
      });
      scope.$apply();
    });

    it('should return null when users.length is 0', function (done) {
      referenceDataService.getData.and.returnValue($q.resolve([]));
      ctrl.processUsers().then(function (result) {
        expect(result).toBeNull();
        done();
      });
      scope.$apply();
    });

    it('should return value when users exist', function (done) {
      var userId = 'userId';
      var user = { UserId: userId, Name: 'name' };
      referenceDataService.getData.and.returnValue($q.resolve([user]));
      ctrl.processUsers().then(function (result) {
        var resultObj = {};
        resultObj[userId] = user;
        expect(result).toEqual(resultObj);
        done();
      });
      scope.$apply();
    });
  });

  describe('ctrl.processUserListForImport function ->', function () {
    beforeEach(function () {
      ctrl.usersDict = {
        id1: {
          UserId: 'id1',
          FirstName: 'First1',
          LastName: 'Last1',
          ProfessionalDesignation: 'DDS',
        },
        id2: { UserId: 'id2', FirstName: 'First2', LastName: 'Last2' },
        id3: { UserId: 'id3', FirstName: 'First3', LastName: 'Last3' },
      };
      rootScope.patAuthContext = { userInfo: { userid: 'userid' } };
    });

    it('should only include users with ids specified', function () {
      ctrl.processUserListForImport(['id1', 'id2']);

      expect(ctrl.usersForImport.length).toBe(2);
      expect(ctrl.usersForImport[0].UserId).toBe('id1');
      expect(ctrl.usersForImport[0].Name).toBe('First1 Last1, DDS');
      expect(ctrl.usersForImport[1].UserId).toBe('id2');
      expect(ctrl.usersForImport[1].Name).toBe('First2 Last2');
    });

    it('should exclude current user', function () {
      rootScope.patAuthContext.userInfo.userid = 'id1';

      ctrl.processUserListForImport(['id1']);

      expect(ctrl.usersForImport.length).toBe(0);
    });

    it('should set values correctly when ctrl.usersForImport is empty', function () {
      scope.disableImport = false;
      scope.disableImportMessage = 'message';

      ctrl.processUserListForImport(['id']);

      expect(ctrl.usersForImport.length).toBe(0);
      expect(scope.disableImport).toBe(true);
      expect(scope.disableImportMessage).toBe(
        'No saved favorites available for import.'
      );
    });

    it('should set values correctly when ctrl.usersForImport is not empty', function () {
      scope.disableImport = true;
      scope.disableImportMessage = 'message';

      ctrl.processUserListForImport(['id1']);

      expect(ctrl.usersForImport.length).toBe(1);
      expect(scope.disableImport).toBe(false);
      expect(scope.disableImportMessage).toBe('');
    });
  });

  describe('scope.openChartButtonLayoutImport function ->', function () {
    var thenSpy;
    beforeEach(function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy();
      thenSpy = jasmine.createSpy();
      modalFactory.Modal = jasmine
        .createSpy()
        .and.returnValue({ result: { then: thenSpy } });
    });

    it('should call patSecurityService.IsAuthorizedByAbbreviation with the correct AMFA when scope.layoutItems is null', function () {
      scope.layoutItems = null;

      scope.openChartButtonLayoutImport();

      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-biz-bizusr-achbtn');
    });

    it('should call patSecurityService.IsAuthorizedByAbbreviation with the correct AMFA when scope.layoutItems is empty', function () {
      scope.layoutItems = [];

      scope.openChartButtonLayoutImport();

      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-biz-bizusr-achbtn');
    });

    it('should call patSecurityService.IsAuthorizedByAbbreviation with the correct AMFA when scope.layoutItems is not empty', function () {
      scope.layoutItems = [{}];

      scope.openChartButtonLayoutImport();

      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-biz-bizusr-echbtn');
    });

    describe('when user is not authorized ->', function () {
      beforeEach(function () {
        patSecurityService.IsAuthorizedByAbbreviation = function () {
          return false;
        };
      });

      it('should not call modalFactory.Modal when user is not authorized', function () {
        scope.openChartButtonLayoutImport();

        expect(modalFactory.Modal).not.toHaveBeenCalled();
      });
    });

    describe('when user is authorized ->', function () {
      beforeEach(function () {
        patSecurityService.IsAuthorizedByAbbreviation = function () {
          return true;
        };
      });

      it('should call modalFactory.Modal when user is authorized', function () {
        scope.openChartButtonLayoutImport();

        expect(modalFactory.Modal).toHaveBeenCalled();
      });

      it('should call result.then with function', function () {
        scope.openChartButtonLayoutImport();

        expect(thenSpy).toHaveBeenCalledWith(ctrl.handleImportSuccess);
      });
    });
  });

  describe('ctrl.handleImportSuccess function ->', function () {
    beforeEach(function () {
      ctrl.getChartButtonLayoutSuccess = jasmine.createSpy();
      scope.selectPage = jasmine.createSpy();
    });

    it('should call functions when parameter is defined', function () {
      var layout = 'layout';

      ctrl.handleImportSuccess(layout);

      expect(ctrl.getChartButtonLayoutSuccess).toHaveBeenCalledWith({
        Value: layout,
      });
      expect(scope.selectPage).toHaveBeenCalledWith(0);
    });

    it('should not call functions when parameter is undefined', function () {
      ctrl.handleImportSuccess();

      expect(ctrl.getChartButtonLayoutSuccess).not.toHaveBeenCalled();
      expect(scope.selectPage).not.toHaveBeenCalled();
    });
  });

  describe('selectPage function ->', function () {
    beforeEach(function () {
      scope.chartingButtonLayout = { Pages: [[]] };
      scope.editMode = false;

      scope.setFavoritesLayout = jasmine.createSpy();
      scope.endGrouping = jasmine.createSpy();
    });

    it('should call endGrouping when scope.grouping is true', function () {
      //var layout = 'layout';
      //ctrl.handleImportSuccess(layout);
      scope.grouping = true;
      scope.selectPage(0);

      expect(scope.endGrouping).toHaveBeenCalled();
    });

    it('should not call endGrouping when scope.grouping is false', function () {
      //ctrl.handleImportSuccess();
      scope.grouping = false;
      scope.selectPage(0);

      expect(scope.endGrouping).not.toHaveBeenCalled();
    });
  });

  describe('getButtonColorClass function -> ', function () {
    it('should return condition color class if layout item type id is 1', function () {
      expect(scope.getButtonColorClass(layoutItems[0])).toBe('condBtnColor');
    });

    it('should return service color class if layout item type id is 2', function () {
      expect(scope.getButtonColorClass(layoutItems[1])).toBe('svcBtnColor');
    });

    it('should return swift code color class if item type id is 3', function () {
      expect(scope.getButtonColorClass(layoutItems[2])).toBe(
        'swiftCodeBtnColor'
      );
    });

    it('should return group color class if item type id is 4', function () {
      expect(scope.getButtonColorClass(layoutItems[3])).toBe('groupColor');
    });

    it('should return empty string if layout item id is invalid', function () {
      expect(scope.getButtonColorClass(layoutItems[4])).toBe('');
    });
  });

  describe('getChartButtonLayoutSuccess function -> ', function () {
    beforeEach(function () {
      scope.conditions = angular.copy(conditions);
      scope.services = angular.copy(services);
      scope.pageSelected = 0;
    });

    it('should create button object for service', function () {
      expect(scope.layoutItems.length).toBe(0);
      ctrl.getChartButtonLayoutSuccess(chartButtonLayoutResponse);
      expect(scope.layoutItems[0][1]).toEqual({
        Id: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
        TypeId: 2,
        Text: 'Crown3/4Resin',
        IconUrl: 'Images/ServiceIcons/default_service.svg',
      });
    });

    it('should create button object for condition', function () {
      expect(scope.layoutItems.length).toBe(0);
      ctrl.getChartButtonLayoutSuccess(chartButtonLayoutResponse);
      expect(scope.layoutItems[0][0]).toEqual({
        Id: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
        TypeId: 1,
        Text: 'Internal Root Resorption',
        IconUrl: 'Images/ConditionIcons/default_condition.svg',
      });
    });

    it('should create button object for swift code', function () {
      expect(scope.layoutItems.length).toBe(0);
      ctrl.getChartButtonLayoutSuccess(chartButtonLayoutResponse);
      expect(scope.layoutItems[0][2]).toEqual({
        Id: '9371c260-c84a-e611-8e06-8086f2269c78',
        TypeId: 3,
        Text: 'Swift Code',
        IconUrl: 'Images/swftIcons/default_swft.svg',
      });
    });

    it('should call $scope.setFavoritesLayout', function () {
      spyOn(scope, 'setFavoritesLayout');
      ctrl.getChartButtonLayoutSuccess(chartButtonLayoutResponse);
      expect(scope.setFavoritesLayout).toHaveBeenCalled();
      expect(
        chartingFavoritesFactory.SetSelectedChartingFavorites
      ).toHaveBeenCalled();
    });
  });

  describe('setFavoritesLayout function -> ', function () {
    it('should create a Favorites object on each page', function () {
      scope.chartingButtonLayout = chartButtonLayoutResponse.Value;
      scope.pageSelected = 1;
      var layoutItems =
        scope.chartingButtonLayout.Pages[scope.pageSelected - 1].Favorites;

      expect(scope.chartingButtonLayout.Pages.length).toBe(1);
      scope.setFavoritesLayout();
      expect(scope.chartingButtonLayout.Pages.length).toBe(2);
      expect(scope.chartingButtonLayout.Pages[1]).toEqual({ Favorites: [] });
      expect(layoutItems[0].Button).toEqual({
        Id: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
        TypeId: '2',
      });
    });
  });

  describe('getButtonTooltip function -> ', function () {
    var layoutItem = { Text: 'ServiceName' };
    var tooltipForInactivePatient =
      'Cannot add services or conditions for an inactive patient';

    it('should create tooltip with layoutItem.Text if patient is active', function () {
      scope.patientInfo = { IsActive: true };
      expect(scope.getButtonTooltip(layoutItem)).toEqual(layoutItem.Text);
    });

    it("should create tooltip with 'Cannot add services or conditions for an inactive patient' if patient is inActive", function () {
      scope.patientInfo = { IsActive: false };
      expect(scope.getButtonTooltip(layoutItem)).toEqual(
        tooltipForInactivePatient
      );
    });
  });

  describe('ctrl.getServiceChartIconUrl method -> ', function () {
    beforeEach(function () {
      scope.selectedLayoutItems = angular.copy(layoutItems);
      scope.servicesBackup = [];
      scope.services = angular.copy(services);
      ctrl.layoutItemType = '2';
    });

    it('should add default IconUrl to each service where service IconName is null', function () {
      angular.forEach(scope.services, function (service) {
        if (service.IsSwiftPickCode === false && service.IconName === null) {
          expect(scope.getServiceChartIconUrl(service)).toEqual(
            'Images/ChartIcons/default_service_code.svg'
          );
        }
      });
    });

    it('should add IconUrl based on IconName to each service where IconName is not null', function () {
      angular.forEach(scope.services, function (service) {
        if (service.IsSwiftPickCode === false && service.IconName !== null) {
          expect(scope.getServiceChartIconUrl(service)).toEqual(
            'Images/ChartIcons/' + service.IconName + '.svg'
          );
        }
      });
    });

    it('should add default IconUrl to swift code', function () {
      angular.forEach(scope.services, function (service) {
        if (service.IsSwiftPickCode === true && service.IconName !== null) {
          expect(scope.getServiceChartIconUrl(service)).toEqual(
            'Images/ChartIcons/default_swift_code.svg'
          );
        }
      });
    });
  });

  describe('ctrl.getConditionChartIconUrl method -> ', function () {
    beforeEach(function () {
      scope.conditions = [];
      scope.conditionsBackup = [];
      scope.selectedLayoutItems = angular.copy(layoutItems);
      scope.conditions = angular.copy(conditions);
    });

    it('should return url for each condition', function () {
      angular.forEach(scope.conditions, function (cond) {
        expect(scope.getConditionChartIconUrl(cond)).toEqual(
          'Images/ConditionIcons/default_condition.svg'
        );
      });
    });
  });

  // This test is not mocked correctly, removing for now
  //describe('scope.deleteGroup method -> ', function () {
  //    beforeEach(function () {
  //        scope.groupTitle = {};
  //        scope.groupTitle.Title = '';
  //        scope.favoritesBackup = angular.copy(chartButtonLayoutResponse.Value);
  //        scope.currentGroupIndex = 5;
  //        scope.layoutItems = chartButtonLayoutResponse.Value;
  //    });

  //    it('should delete the current group from the layoutItems list', function () {
  //        expect(layoutItems.length).toBe(6);
  //        expect(scope.currentGroupIndex).toBe(5);
  //        console.log(scope.layoutItems);
  //        scope.deleteGroup();
  //        expect(scope.layoutItems.length).toBe(5);
  //        console.log(scope.layoutItems);
  //    });
  //});

  describe('$scope.remove method -> ', function () {
    it('should remove the passed in button object from layoutItems', function () {
      scope.layoutItems = angular.copy(layoutItems);
      scope.editMode = false;
      expect(scope.layoutItems.length).toBe(6);
      scope.remove(layoutItems[0]);
      expect(scope.layoutItems.length).toBe(5);
      expect(scope.layoutItems[0]).toEqual({
        Id: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
        Text: 'Crown3/4Resin',
        TypeId: 2,
        IconUrl: 'Images/ServiceIcons/default_service.svg',
      });
    });

    it('should remove the passed in button group from layoutItems', function () {
      spyOn(scope, 'updateGroup').and.returnValue();
      scope.layoutItems = [
        {
          Id: '00000000-0000-0000-0000-000000000000',
          Text: 'GroupName1',
          TypeId: 5,
        },
        {
          Id: '1',
          Text: 'GroupName2',
          TypeId: 5,
        },
      ];
      scope.editMode = true;
      expect(scope.layoutItems.length).toBe(2);
      scope.remove(scope.layoutItems[0]);
      expect(scope.layoutItems.length).toBe(1);
      expect(scope.layoutItems[0]).toEqual({
        Id: '1',
        Text: 'GroupName2',
        TypeId: 5,
      });
      expect(scope.updateGroup).toHaveBeenCalled();
    });
  });

  describe('scope.getNavigationStatus method -> ', function () {
    it('should set navigation to disabled when no charting favorites exist', function () {
      scope.chartingButtonLayout = { Pages: [] };
      scope.getNavigationStatus();
      expect(scope.navigationEnabled).toBe(false);
    });

    it('should set navigation to enabled when charting favorites exist on at least 1 page', function () {
      scope.chartingButtonLayout = chartButtonLayoutResponse.Value;
      scope.getNavigationStatus();
      expect(scope.navigationEnabled).toBe(true);
    });
  });

  describe('scope.openPropServCtrls method -> ', function () {
    beforeEach(function () {
      scope.updatedpropServCtrlsParams = {};
      scope.propServCtrls = {
        content: jasmine.createSpy(),
        setOptions: jasmine.createSpy(),
        center: jasmine.createSpy(),
        open: jasmine.createSpy(),
      };
    });

    it('should set scope.updatedpropServCtrlsParams if mode is Service and controls are instanced', function () {
      scope.chartingButtonLayout = { Pages: [] };
      ctrl.propServPrebuilt = true;
      scope.openPropServCtrls('Service', 'Title', false, true, true);
      expect(scope.updatedpropServCtrlsParams.isswiftcode).toBe(false);
      expect(scope.updatedpropServCtrlsParams.isfirstcode).toBe(true);
      expect(scope.updatedpropServCtrlsParams.islastcode).toBe(true);
      expect(scope.updatedpropServCtrlsParams.windowClosed).toBe(false);
    });

    it('should create controls if controls are not instanced', function () {
      ctrl.propServPrebuilt = false;
      scope.chartingButtonLayout = { Pages: [] };
      scope.openPropServCtrls('Service', 'Title', false, true, true);
      expect(scope.updatedpropServCtrlsParams).toEqual({});
    });
  });

  describe('scope.closeWindow method -> ', function () {
    beforeEach(function () {
      scope.updatedpropServCtrlsParams = {};
      scope.propServCtrls = {
        content: jasmine.createSpy(),
        setOptions: jasmine.createSpy(),
        center: jasmine.createSpy(),
        open: jasmine.createSpy(),
        close: jasmine.createSpy(),
      };
        scope.patientConditionCreateUpdate = {
            setOptions: jasmine.createSpy(),
            close: jasmine.createSpy()
        };
    });

    it('should call close methods on propServCtrls and patientConditionCreateUpdate', function () {
      ctrl.propServPrebuilt = true;
      scope.closeWindow();
      expect(scope.propServCtrls.close).toHaveBeenCalled();
      expect(scope.patientConditionCreateUpdate.setOptions).toHaveBeenCalled();
      expect(scope.patientConditionCreateUpdate.close).toHaveBeenCalled();
    });

    it('should set scope.updatedpropServCtrlsParams if mode is Service and controls are instanced', function () {
      scope.updatedpropServCtrlsParams = { windowClosed: false };
      ctrl.propServPrebuilt = true;
      scope.closeWindow();
      expect(scope.updatedpropServCtrlsParams.windowClosed).toBe(true);
    });

    it('should create controls if controls are not instanced', function () {
      ctrl.propServPrebuilt = false;
      scope.updatedpropServCtrlsParams = {};
      scope.closeWindow();
      expect(scope.updatedpropServCtrlsParams).toEqual({});
    });
  });

  describe('scope.createGroup method -> ', function () {
    beforeEach(function () {
      var thenSpy = jasmine.createSpy();
      modalFactory.Modal = jasmine
        .createSpy()
        .and.returnValue({ result: { then: thenSpy } });
    });

    it('should prompt to create group when two different items are dragged together', function () {
      var buttonObject = null;
      var e = {
        draggable: {
          currentTarget: [
            {
              'data-layoutitem': JSON.stringify({
                ItemId: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
                Text: 'Internal Root Resorption',
                TypeId: 1,
                IconUrl: 'Images/ConditionIcons/default_condition.svg',
              }),
            },
          ],
        },
        dropTarget: [
          {
            'data-layoutitem': JSON.stringify({
              ItemId: 'c3ac9626-8b45-e611-9a6b-a4db3021bfa0',
              Text: 'Crown3/4Resin',
              TypeId: 2,
              IconUrl: 'Images/ServiceIcons/default_service.svg',
            }),
          },
        ],
      };

      scope.createGroup(e);
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should not prompt to create group when both items are the same', function () {
      var e = {
        draggable: {
          currentTarget: [
            {
              'data-layoutitem': JSON.stringify({
                ItemId: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
                Text: 'Internal Root Resorption',
                TypeId: 1,
                IconUrl: 'Images/ConditionIcons/default_condition.svg',
              }),
            },
          ],
        },
        dropTarget: [
          {
            'data-layoutitem': JSON.stringify({
              ItemId: '9db58108-8b45-e611-9a6b-a4db3021bfa0',
              Text: 'Internal Root Resorption',
              TypeId: 1,
              IconUrl: 'Images/ConditionIcons/default_condition.svg',
            }),
          },
        ],
      };

      scope.createGroup(e);
      expect(modalFactory.Modal).not.toHaveBeenCalled();
    });
  });
});

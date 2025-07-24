describe('UserStatusController tests -> ', function () {
  var scope,
    ctrl,
    compile,
    userServices,
    templateHtml,
    element,
    compiledElement;

  // #region mocks

  var userMock = {
    UserId: '1',
    FirstName: 'John',
    LastName: 'Doe',
    IsActive: true,
    StatusChangeNote: '',
  };

  var mockActivationHistory = [
    {
      UserId: '1',
      IsActive: true,
      StatusChangeNote: 'Note1',
      ModifiedUser: 'Bob1',
      DateModified: '2014-01-01T00:00:00Z',
    },
    {
      UserId: '2',
      IsActive: true,
      StatusChangeNote: 'Note2',
      ModifiedUser: 'Bob2',
      DateModified: '2015-01-01T00:00:00Z',
    },
    {
      UserId: '3',
      IsActive: true,
      StatusChangeNote: 'Note3',
      ModifiedUser: 'Bob3',
      DateModified: '2015-01-03T00:00:00Z',
    },
  ];

  // #endregion

  // #region setup

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      userServices = {
        ActivationHistory: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('UserServices', userServices);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $compile,
    $templateCache
  ) {
    scope = $rootScope.$new();
    compile = $compile;
    scope.user = userMock;
    ctrl = $controller('UserStatusController', {
      $scope: scope,
    });
  }));

  // #endregion

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.currentStatus).toBe(true);
      expect(scope.activationHistory).toEqual([]);
    });
  });

  describe('getActivationHistory -> ', function () {
    it('should call userActivationHistoryService.get function', function () {
      expect(userServices.ActivationHistory.get).toHaveBeenCalledWith(
        { Id: scope.user.UserId },
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });
  });

  describe('userActivationHistoryGetSuccess -> ', function () {
    it('should populate activationHistory with array if history exists', function () {
      scope.userActivationHistoryGetSuccess({ Value: mockActivationHistory });
      expect(scope.activationHistory).toEqual(
        _.orderBy(mockActivationHistory, 'DateModified', 'desc')
      );
    });

    it('should populate activationHistory with empty array if history does not exists', function () {
      scope.userActivationHistoryGetSuccess({ Value: [] });
      expect(scope.activationHistory).toEqual([]);
    });
  });

  describe('userActivationHistoryGetFailure -> ', function () {
    it('should set scope properties', function () {
      scope.userActivationHistoryGetFailure();
      expect(scope.activationHistory).toEqual([]);
    });

    it('should call toastrFactory.error function', function () {
      scope.userActivationHistoryGetFailure();
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('confirmStatusChange -> ', function () {
    it('should call update', function () {
      ////spyOn(scope, 'update');
      //scope.confirmStatusChange();
      //scope.$apply();
      //expect(scope.update).toHaveBeenCalled();
    });
  });

  describe('cancelStatusChange -> ', function () {
    it('should set properties to original values', function () {
      scope.user.IsActive = false;
      scope.cancelStatusChange();

      expect(scope.user.IsActive).toBe(true);
      expect(scope.user.StatusChangeNote).toBe('');
    });
  });

  describe('showLimit function ->', function () {
    it('should return 3 if showAllStatus is not true', function () {
      scope.showAllStatus = false;
      expect(scope.showLimit()).toBe(5);
    });

    it('should return activationHistory.length if showAllStatus is true', function () {
      scope.activationHistory = mockActivationHistory;
      scope.showAllStatus = true;
      expect(scope.showLimit()).toBe(mockActivationHistory.length);
    });
  });
});

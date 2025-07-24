describe('claims-controller tests -> ', function () {
  var scope,
    parentScope,
    ctrl,
    patientServiceMock,
    claimsServiceMock,
    toastrFactoryMock;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      patientServiceMock = {
        GetClaimInformation: jasmine.createSpy().and.callFake(function () {
          return null;
        }),
      };
      $provide.value('PatientServices', patientServiceMock);

      claimsServiceMock = {
        search: jasmine.createSpy('claimsService.searchCount'),
      };
      toastrFactoryMock = {
        error: jasmine.createSpy('toastrFactory.error'),
      };
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    parentScope = $rootScope.$new();
    scope.$parent = parentScope;

    ctrl = $controller('ClaimsController', {
      $scope: scope,
      PatientServices: patientServiceMock,
      ClaimsService: claimsServiceMock,
      toastrFactory: toastrFactoryMock,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('patient service ->', function () {
    it('should not be null', function () {
      expect(patientServiceMock).not.toBeNull();
    });
  });

  describe('ctrl.init ->', function () {
    it('should initialize scope variables', function () {
      ctrl.init();

      expect(scope.unsubmittedCount).not.toBeNull();
      expect(scope.submittedCount).not.toBeNull();
      expect(scope.alertCount).not.toBeNull();
      expect(scope.allCount).not.toBeNull();
      expect(scope.unsubmittedFee).not.toBeNull();
      expect(scope.submittedFee).not.toBeNull();
      expect(scope.alertFee).not.toBeNull();
      expect(scope.activeTab).not.toBeNull();
    });
  });

  describe('scope.claimsApplyFilter ->', function () {
    it('should assign whats passed in', function () {
      scope.claimsApplyFilter(1);

      expect(scope.activeTab).toEqual(1);
    });
  });

  describe('scope.getTabCount -> ', function () {
    it('should call claimsservice', function () {
      scope.getTabCount();
      expect(claimsServiceMock.search).toHaveBeenCalled();
    });
  });

  describe('scope.getTabCountSuccess ->', function () {
    var result;
    beforeEach(function () {
      result = {
        Value: {
          TotalCount: 1,
          TotalFees: 2,
        },
      };
    });
    it('should set correct fields for unsubmitted', function () {
      ctrl.getTabCountSuccess('unsubmitted')(result);
      expect(scope.unsubmittedCount).toEqual(1);
      expect(scope.unsubmittedFee).toEqual(2);
    });
    it('should set correct fields for submitted', function () {
      ctrl.getTabCountSuccess('submitted')(result);
      expect(scope.submittedCount).toEqual(1);
      expect(scope.submittedFee).toEqual(2);
    });
    it('should set correct fields for alerts', function () {
      ctrl.getTabCountSuccess('alerts')(result);
      expect(scope.alertCount).toEqual(1);
      expect(scope.alertFee).toEqual(2);
    });
    it('should set correct fields for all', function () {
      ctrl.getTabCountSuccess('all')(result);
      expect(scope.allCount).toEqual(1);
    });
  });
  describe('ctrl.getTabCountFailure -> ', function () {
    it('should call toastr factory', function () {
      ctrl.getTabCountFailure();
      expect(toastrFactoryMock.error).toHaveBeenCalled();
    });
  });
});

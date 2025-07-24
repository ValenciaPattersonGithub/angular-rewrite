describe('PreventiveCareSelectorController -> ', function () {
  var rootScope,
    toastrFactory,
    scope,
    listHelper,
    patientPreventiveCareFactory,
    timeout;
  var ctrl;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function () {
      patientPreventiveCareFactory = {};
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(1),
      };
      //mock for toaster functionality
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };
    })
  );
  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    ctrl = $controller('PreventiveCareSelectorController', {
      $scope: scope,
      $rootScope: rootScope,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
      PatientPreventiveCareFactory: patientPreventiveCareFactory,
    });
    timeout = $injector.get('$timeout');
    spyOn(timeout, 'cancel');
  }));

  it('should initialize controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('on openPreventiveCareFlyout ->', function () {
    var sender = 'txplan';
    beforeEach(function () {
      spyOn(scope, 'showFilters');
      spyOn(scope, 'showMatchingFilters');
      sender = 'txplan';
    });

    it('should call showFilters if no sender is passed', function () {
      scope.$emit('openPreventiveCareFlyout');
      expect(scope.showFilters).toHaveBeenCalled();
    });

    it('should call not call showFilters if sender is passed', function () {
      scope.serviceFilter = 'txplan';
      scope.$emit('openPreventiveCareFlyout', sender);
      expect(scope.showFilters).not.toHaveBeenCalled();
    });

    it('should call showMatchingFilters if sender is passed', function () {
      scope.serviceFilter = 'txplan';
      scope.$emit('openPreventiveCareFlyout', sender);
      expect(scope.showMatchingFilters).toHaveBeenCalledWith(sender);
    });
  });

  describe('on closeFlyouts ->', function () {
    var sender = 'txplan';
    beforeEach(function () {
      spyOn(scope, 'hideFilters');
      spyOn(scope, 'hideMatchingFilters');
      sender = 'txplan';
    });

    it('should call hideFilters if no sender is passed', function () {
      scope.$emit('closeFlyouts');
      expect(scope.hideFilters).toHaveBeenCalled();
    });

    it('should call not call hideFilters if sender is passed', function () {
      scope.serviceFilter = 'txplan';
      scope.$emit('closeFlyouts', sender);
      expect(scope.hideFilters).not.toHaveBeenCalled();
    });

    it('should call hideMatchingFilters if sender is passed', function () {
      scope.serviceFilter = 'txplan';
      scope.$emit('closeFlyouts', sender);
      expect(scope.hideMatchingFilters).toHaveBeenCalledWith(sender);
    });
  });
});

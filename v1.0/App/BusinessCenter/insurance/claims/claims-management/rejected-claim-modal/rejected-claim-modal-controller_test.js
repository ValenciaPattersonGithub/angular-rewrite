describe('rejected-claim-modal', function () {
  var ctrl,
    scope,
    location,
    localize,
    mInstance,
    compile,
    claim,
    rejectionMessageDto;

  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter', function () {}));

  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    scope = $rootScope.$new();
    compile = $compile;

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for location
    location = {
      path: 'path/',
      $$path: {
        substr: jasmine.createSpy(),
        indexOf: jasmine.createSpy(),
      },
    };

    rejectionMessageDto = {};

    claim = {};

    //mock uibModalInstance
    mInstance = {
      close: jasmine.createSpy(),
      dismiss: jasmine.createSpy(),
    };

    //mock controller
    ctrl = $controller('RejectedClaimModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      $location: location,
      localize: localize,
      rejectionMessageDto: rejectionMessageDto,
      claim: claim,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('scope.cancel -> ', function () {
    it('mInstance.dismiss should be called', function () {
      scope.cancel();
      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('scope.getPatientName -> ', function () {
    it('should return concatinated name string', function () {
      var name = scope.getPatientName('First', 'M', 'Last', 'Jr');
      expect(name).toBe('First M. Last, Jr');
    });
  });

  describe('scope.getDate -> ', function () {
    it('should return first date string', function () {
      var date = scope.getDate('12/12/2016', '12/12/2016');
      expect(date).toBe('12/12/2016');
    });
    it('should return concatinated date string', function () {
      var date = scope.getDate('12/12/2016', '12/13/2016');
      expect(date).toBe('12/12/2016 - 12/13/2016');
    });
  });
});

import { of } from 'rsjs';

describe('service-code-exception-modal-controller tests -> ', function () {
  var scope,
    ctrl,
    q,
    listHelper,
    referenceDataService,
    modalInstance,
    serviceCodes,
    localize,
    featureFlagService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      listHelper = {
        findItemByFieldValue: jasmine.createSpy().and.returnValue({}),
        findIndexByFieldValue: jasmine.createSpy().and.returnValue(0),
      };
      $provide.value('ListHelper', listHelper);

      referenceDataService = {
        get: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };
      $provide.value('ModalInstance', modalInstance);

      serviceCodes = [
        {
          ServiceCodeId: '11111111-1111-1111-1111-111111111111',
        },
      ];
      $provide.value('serviceCodes', serviceCodes);

      localize = {
        getLocalizedString: jasmine.createSpy(),
      };

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $q, $controller) {
    scope = $rootScope.$new();
    q = $q;
    ctrl = $controller('ServiceCodeExceptionModalController', {
      $scope: scope,
      toastrFactory: _toastr_,
      $uibModalInstance: modalInstance,
      availableCodes: []
    });
  }));

  it('should initialize the controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('addException function ->', function () {
    it('should call $uibModalInstance.close', function () {
      var index = 0;
      scope.filteredServiceCodes = ['First Code', 'Second Code'];
      scope.addException(index);
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  describe('cancel function ->', function () {
    it('should call dismiss', function () {
      scope.cancel();
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });
  });
});

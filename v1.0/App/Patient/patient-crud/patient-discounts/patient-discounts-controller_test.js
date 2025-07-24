describe('patient-discounts ->', function () {
  //#region Variables
  var scope,
    ctrl,
    location,
    localize,
    toastr,
    element,
    compile,
    routeParams,
    listHelper;

  var discountTypesService;
  var mockDiscountType = { DiscountTypeId: '1', DiscountName: '1' };
  var mockDiscountTypes = [
    { DiscountTypeId: '1', DiscountName: '1' },
    { DiscountTypeId: '2', DiscountName: '2' },
    { DiscountTypeId: '3', DiscountName: '3' },
  ];

  //#endregion

  //#region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      discountTypesService = {
        get: jasmine.createSpy().and.callFake(function () {
          return { then: jasmine.createSpy() };
        }),
      };
      $provide.value('DiscountTypesService', discountTypesService);

      // toastr mock should be moved to test helpers
      toastr = {};
      toastr.error = jasmine.createSpy();
      toastr.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastr);

      listHelper = {};
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(mockDiscountType);
      $provide.value('ListHelper', listHelper);
    })
  );

  beforeEach(inject(function (
    $route,
    $rootScope,
    $location,
    $routeParams,
    $injector,
    $controller
  ) {
    localize = $injector.get('localize');
    location = $location;

    routeParams = $routeParams;

    scope = $rootScope.$new();

    ctrl = $controller('PatientDiscountsController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
    });

    toastr = $injector.get('toastrFactory');
    listHelper = $injector.get('ListHelper');
  }));

  //#endregion

  describe('controller ->', function () {
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have default values', function () {
      expect(scope.editMode).toBe(false);
      expect(scope.discountTypes).toEqual([]);
      expect(scope.patientDiscount).toBeUndefined();
      expect(scope.selectedDiscountType).toBeUndefined();
    });

    describe('in edit mode ->', function () {
      beforeEach(inject(function ($controller) {
        routeParams.patientId = 1;

        ctrl = $controller('PatientDiscountsController', {
          $scope: scope,
          patSecurityService: _authPatSecurityService_,
        });
      }));

      it('editMode should be true', function () {
        expect(scope.editMode).toBe(true);
      });
    });

    describe('LoadDiscountTypes function ->', function () {
      beforeEach(function () {
        scope.LoadDiscountTypes();
      });

      it('discountTypesService.get should be called', function () {
        expect(discountTypesService.get).toHaveBeenCalled();
      });
    });

    describe('LoadDiscountTypesSuccess function ->', function () {
      beforeEach(function () {
        spyOn(scope, 'SelectPatientDiscount');
        scope.LoadDiscountTypesSuccess({ Value: mockDiscountTypes });
      });

      it('should populate the discount types array', function () {
        expect(scope.discountTypes).toEqual(mockDiscountTypes);
      });

      it('should call SelectPatientDiscount', function () {
        expect(scope.SelectPatientDiscount).toHaveBeenCalled();
      });
    });

    describe('LoadDiscountTypesFail function ->', function () {
      beforeEach(function () {
        scope.LoadDiscountTypesFail();
      });

      it('should call toastr.error', function () {
        expect(toastr.error).toHaveBeenCalled();
      });
    });

    describe('SelectPatientDiscount function ->', function () {
      beforeEach(function () {
        scope.SelectPatientDiscount(mockDiscountType);
      });

      it('should call listHelper.findItemByFieldValue', function () {
        expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      });

      it('should assign a value to selectedDiscountType', function () {
        expect(scope.selectedDiscountType).toBe(mockDiscountType);
      });
    });
  });
});

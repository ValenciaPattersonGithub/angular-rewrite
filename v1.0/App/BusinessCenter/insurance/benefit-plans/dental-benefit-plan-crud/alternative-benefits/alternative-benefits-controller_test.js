describe('AlternativeBenefits controller ->', function () {
  var ctrl, scope, filter, timeout;

  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(inject(function ($rootScope, $controller, $filter, $timeout) {
    filter = $filter;
    scope = $rootScope.$new();
    timeout = $timeout;
    ctrl = $controller('AlternativeBenefitsController', {
      $scope: scope,
      $filter: filter,
      $timeout: timeout,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('ctrl.setupAltBenefits -> ', function () {
    it('should add parent code and child code fields to existing alternative benefits for display', function () {
      scope.alternativeBenefits = [
        {
          ParentServiceCodeId: 1,
          ChildServiceCodeId: 2,
        },
      ];

      scope.allServiceCodes = [
        { ServiceCodeId: 1, Fee: 100, Code: 'Code1' },
        { ServiceCodeId: 2, Fee: 200, Code: 'Code2' },
      ];

      ctrl.setupAltBenefits();
      expect(scope.alternativeBenefits[0].ParentCode).toEqual('Code1');
      expect(scope.alternativeBenefits[0].ChildCode).toEqual('Code2');
      expect(scope.alternativeBenefits[0].ParentCharge).toEqual(100);
      expect(scope.alternativeBenefits[0].ChildCharge).toEqual(200);
    });
  });

  describe('alternativeBenefitsWatch -> when new value is defined, alternativeBenefitsLoading is true and !allServiceCodesLoading', function () {
    it('should set alternativeBenefitsLoading to false and setup existing alternative benefits', function () {
      scope.alternativeBenefits = [{ Test: 'Test' }];
      scope.allServiceCodesLoading = false;
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'setupAltBenefits');
      spyOn(ctrl, 'refreshGrid');

      scope.$apply();
      expect(scope.alternativeBenefitsLoading).toEqual(false);
      expect(ctrl.filterAllCodes).toHaveBeenCalled();
      expect(ctrl.setupAltBenefits).toHaveBeenCalled();
      expect(ctrl.refreshGrid).toHaveBeenCalled();
    });
  });

  describe('alternativeBenefitsWatch -> when service codes are still loading', function () {
    it('should not set setup existing alternative benefits', function () {
      scope.alternativeBenefits = [{ Test: 'Test' }];
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'setupAltBenefits');
      spyOn(ctrl, 'refreshGrid');

      scope.$apply();
      expect(scope.alternativeBenefitsLoading).toEqual(false);
      expect(ctrl.filterAllCodes).not.toHaveBeenCalled();
      expect(ctrl.setupAltBenefits).not.toHaveBeenCalled();
      expect(ctrl.refreshGrid).not.toHaveBeenCalled();
    });
  });
  describe('alternativeBenefitsWatch -> when alternative benefits are changed after original load', function () {
    it('should not set setup existing alternative benefits again', function () {
      scope.alternativeBenefits = [{ Test: 'Test' }];
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'setupAltBenefits');
      spyOn(ctrl, 'refreshGrid');
      scope.allServiceCodesLoading = false;

      scope.$apply();
      scope.alternativeBenefits = [{ Test: 'Test' }, { Test2: 'Test2' }];
      scope.$apply();
      expect(scope.alternativeBenefitsLoading).toEqual(false);
      expect(ctrl.filterAllCodes.calls.count()).toBe(1);
      expect(ctrl.setupAltBenefits.calls.count()).toBe(1);
      expect(ctrl.refreshGrid.calls.count()).toBe(1);
    });
  });

  describe('allServiceCodesWatch -> when new value is defined, allServiceCodesLoading is true and !alternativeBenefitsLoading', function () {
    it('should set allServiceCodesLoading to false and setup existing alternative benefits', function () {
      scope.allServiceCodes = [{ Test: 'Test' }];
      scope.alternativeBenefitsLoading = false;
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'setupAltBenefits');
      spyOn(ctrl, 'refreshGrid');

      scope.$apply();
      expect(scope.allServiceCodesLoading).toEqual(false);
      expect(ctrl.filterAllCodes).toHaveBeenCalled();
      expect(ctrl.setupAltBenefits).toHaveBeenCalled();
      expect(ctrl.refreshGrid).toHaveBeenCalled();
    });
  });

  describe('alternativeBenefitsWatch -> when alternative benefits are still loading', function () {
    it('should not set setup existing alternative benefits', function () {
      scope.allServiceCodes = [{ Test: 'Test' }];
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'setupAltBenefits');
      spyOn(ctrl, 'refreshGrid');

      scope.$apply();
      expect(scope.allServiceCodesLoading).toEqual(false);
      expect(ctrl.filterAllCodes).not.toHaveBeenCalled();
      expect(ctrl.setupAltBenefits).not.toHaveBeenCalled();
      expect(ctrl.refreshGrid).not.toHaveBeenCalled();
    });
  });
  describe('alternativeBenefitsWatch -> when service codes are changed after original load', function () {
    it('should not set setup existing alternative benefits again', function () {
      scope.allServiceCodes = [{ Test: 'Test' }];
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'setupAltBenefits');
      spyOn(ctrl, 'refreshGrid');
      scope.alternativeBenefitsLoading = false;

      scope.$apply();
      scope.allServiceCodes = [{ Test: 'Test' }, { Test2: 'Test2' }];
      scope.$apply();
      expect(scope.allServiceCodesLoading).toEqual(false);
      expect(ctrl.filterAllCodes.calls.count()).toBe(1);
      expect(ctrl.setupAltBenefits.calls.count()).toBe(1);
      expect(ctrl.refreshGrid.calls.count()).toBe(1);
    });
  });

  describe('serviceCodeExceptionsWatch -> When is first time change', function () {
    it('should set serviceCodeExceptionsLoading to false, and not refresh service codes', function () {
      scope.serviceCodeExceptions = [{}];
      spyOn(ctrl, 'filterAllCodes');
      spyOn(scope, 'cancelChild');
      spyOn(scope, 'cancelParent');

      scope.$apply();
      expect(scope.serviceCodeExceptionsLoading).toEqual(false);
      expect(ctrl.filterAllCodes).not.toHaveBeenCalled();
      expect(scope.cancelChild).not.toHaveBeenCalled();
      expect(scope.cancelParent).not.toHaveBeenCalled();
    });
  });

  describe('serviceCodeExceptionsWatch -> When is second time change', function () {
    it('should refresh service codes and reset code search fields', function () {
      scope.serviceCodeExceptions = [{}];
      spyOn(ctrl, 'filterAllCodes');
      spyOn(scope, 'cancelChild');
      spyOn(scope, 'cancelParent');

      scope.$apply();
      scope.serviceCodeExceptions = [{}, {}];
      scope.$apply();

      expect(scope.serviceCodeExceptionsLoading).toEqual(false);
      expect(ctrl.filterAllCodes.calls.count()).toBe(1);
      expect(scope.cancelChild.calls.count()).toBe(1);
      expect(scope.cancelParent.calls.count()).toBe(1);
    });
  });

  describe('ctrl.filterAllCodes', function () {
    it('should filter out child codes, exception codes, codes w/o CDT Code, codes marked do not submit, and swift pick codes', function () {
      var code = {
        ServiceCodeId: 1,
        CdtCodeId: 1,
        SubmitOnInsurance: true,
        IsSwiftPickCode: false,
      };
      var code6 = {
        ServiceCodeId: 6,
        CdtCodeId: 1,
        SubmitOnInsurance: true,
        IsSwiftPickCode: false,
      };
      scope.allServiceCodes = [
        code,
        {
          ServiceCodeId: 2,
          CdtCodeId: null,
          SubmitOnInsurance: true,
          IsSwiftPickCode: false,
        },
        {
          ServiceCodeId: 3,
          CdtCodeId: 1,
          SubmitOnInsurance: false,
          IsSwiftPickCode: false,
        },
        {
          ServiceCodeId: 4,
          CdtCodeId: 1,
          SubmitOnInsurance: true,
          IsSwiftPickCode: true,
        },
        {
          ServiceCodeId: 5,
          CdtCodeId: 1,
          SubmitOnInsurance: true,
          IsSwiftPickCode: false,
        },
        code6,
      ];
      scope.alternativeBenefits = [{ ChildServiceCodeId: 5 }];
      scope.serviceCodeExceptions = [{ ServiceCodeId: 6 }];

      ctrl.filterAllCodes();
      expect(scope.filteredChildCodes).toEqual([code]);
      expect(scope.filteredParentCodes).toEqual([code, code6]);
    });
  });

  describe('$scope.selectChild', function () {
    it('should set child search fields', function () {
      var code = { Code: 'Code1' };
      scope.selectChild(code);
      expect(scope.currentChild).toEqual(code);
      expect(scope.childSearch).toEqual(code.Code);
    });
  });

  describe('$scope.selectParent', function () {
    it('should set parent search fields', function () {
      var code = { Code: 'Code1' };
      scope.selectParent(code);
      expect(scope.currentParent).toEqual(code);
      expect(scope.parentSearch).toEqual(code.Code);
    });
  });

  describe('$scope.$watch.childServiceCodes when there is only one in the list', function () {
    it('should call setParent', function () {
      spyOn(scope, 'selectParent');
      scope.parentServiceCodes = [];
      scope.$apply();
      scope.parentServiceCodes = [{ Code: 'Code1' }];
      scope.$apply();
      scope.parentServiceCodes = [{ Code: 'Code1' }, { Code: 'Code1' }];
      scope.$apply();
      expect(scope.selectParent.calls.count()).toBe(1);
    });
  });

  describe('$scope.$watch.parentServiceCodes when there is only one in the list', function () {
    it('should call setChild', function () {
      spyOn(scope, 'selectChild');
      scope.childServiceCodes = [];
      scope.$apply();
      scope.childServiceCodes = [{ Code: 'Code1' }];
      scope.$apply();
      scope.childServiceCodes = [{ Code: 'Code1' }, { Code: 'Code1' }];
      scope.$apply();
      expect(scope.selectChild.calls.count()).toBe(1);
    });
  });

  describe('$scope.searchForParentCodes -> when search term is empty', function () {
    it('should empty search results and set fetchingParentData to false', function () {
      scope.fetchingParentData = true;
      scope.parentServiceCodes = [{}, {}];
      scope.searchForParentCodes('');
      expect(scope.fetchingParentData).toEqual(false);
      expect(scope.parentServiceCodes).toEqual([]);
    });
  });

  describe('$scope.searchForParentCodes -> when search term has value', function () {
    it('should filter out current child code, and match other codes with search term', function () {
      scope.fetchingParentData = true;
      var code1 = {
        Code: '',
        CdtCodeName: '',
        Description: '',
        ServiceCodeId: 1,
      };
      var code2 = {
        Code: 'd',
        CdtCodeName: '',
        Description: '',
        ServiceCodeId: 2,
      };
      var code3 = {
        Code: '',
        CdtCodeName: 'd',
        Description: '',
        ServiceCodeId: 3,
      };
      var code4 = {
        Code: '',
        CdtCodeName: '',
        Description: 'd',
        ServiceCodeId: 4,
      };
      var code5 = {
        Code: '',
        CdtCodeName: '',
        Description: '',
        ServiceCodeId: 5,
      };
      scope.currentChild = code5;
      scope.filteredParentCodes = [code1, code2, code3, code4, code5];

      scope.searchForParentCodes('d');
      timeout.flush();
      expect(scope.fetchingParentData).toEqual(false);
      expect(scope.parentServiceCodes).toEqual([code2, code3, code4]);
    });
  });

  describe('$scope.searchForChildCodes -> when search term is empty', function () {
    it('should empty search results and set fetchingParentData to false', function () {
      scope.childServiceCodes = [{}, {}];
      scope.searchForChildCodes('');
      expect(scope.fetchingChildData).toEqual(false);
      expect(scope.childServiceCodes).toEqual([]);
    });
  });

  describe('$scope.searchForChildCodes -> when search term has value', function () {
    it('should filter out current child code, and match other codes with search term', function () {
      var code1 = {
        Code: '',
        CdtCodeName: '',
        Description: '',
        ServiceCodeId: 1,
      };
      var code2 = {
        Code: 'd',
        CdtCodeName: '',
        Description: '',
        ServiceCodeId: 2,
      };
      var code3 = {
        Code: '',
        CdtCodeName: 'd',
        Description: '',
        ServiceCodeId: 3,
      };
      var code4 = {
        Code: '',
        CdtCodeName: '',
        Description: 'd',
        ServiceCodeId: 4,
      };
      var code5 = {
        Code: '',
        CdtCodeName: '',
        Description: '',
        ServiceCodeId: 5,
      };
      var code6 = {
        Code: '',
        CdtCodeName: '',
        Description: '',
        ServiceCodeId: 6,
      };
      scope.currentChild = code5;
      scope.filteredChildCodes = [code1, code2, code3, code4, code5, code6];
      scope.alternativeBenefits = [{ ParentServiceCodeId: 6 }];

      scope.searchForChildCodes('d');
      timeout.flush();
      expect(scope.fetchingChildData).toEqual(false);
      expect(scope.childServiceCodes).toEqual([code2, code3, code4]);
    });
  });

  describe('$scope.filterGrid -> when search is empty', function () {
    it('should refresh grid and display full list', function () {
      scope.filteredAlternativeBenefits = [];
      scope.altBenSearch = '';
      spyOn(ctrl, 'refreshGrid');

      scope.filterGrid();

      expect(ctrl.refreshGrid).toHaveBeenCalledWith();
      expect(scope.filteredAlternativeBenefits).toEqual([]);
    });
  });

  describe('$scope.filterGrid -> when search is empty', function () {
    it('should refresh grid and display full list', function () {
      scope.altBenSearch = '2';
      var code1 = { ParentCode: '1', ChildCode: '2' };
      var code2 = { ParentCode: '2', ChildCode: '3' };
      var code3 = { ParentCode: '4', ChildCode: '5' };
      scope.alternativeBenefits = [code1, code2, code3];

      spyOn(ctrl, 'refreshGrid');
      scope.filterGrid('2');
      expect(ctrl.refreshGrid).toHaveBeenCalledWith([code1, code2]);
    });
  });

  describe('$scope.cancelChild', function () {
    it('should reset child search fields', function () {
      scope.childSearch = '1';
      scope.childServiceCodes = [{}];
      scope.currentChild = {};

      scope.cancelChild();

      expect(scope.childSearch).toEqual(''); // clear the search criteria
      expect(scope.childServiceCodes).toEqual([]);
      expect(scope.currentChild).toEqual(null);
    });

    it('should set fetchingChildData to false and cancel searchTimeout if it exists', function () {
      scope.fetchingChildData = true;
      scope.searchTimeout = {
        cancel: jasmine.createSpy('searchTimeout.cancel'),
      };

      scope.cancelChild();

      expect(scope.fetchingChildData).toEqual(false); // clear the search criteria
      expect(scope.searchTimeout.cancel).toHaveBeenCalled();
    });
  });

  describe('$scope.cancelParent', function () {
    it('should reset parent search fields', function () {
      scope.parentSearch = '1';
      scope.parentServiceCodes = [{}];
      scope.currentParent = {};

      scope.cancelParent();

      expect(scope.parentSearch).toEqual(''); // clear the search criteria
      expect(scope.parentServiceCodes).toEqual([]);
      expect(scope.currentParent).toEqual(null);
    });

    it('should set fetchingParentData to false and cancel searchTimeout if it exists', function () {
      scope.fetchingParentData = true;
      scope.searchTimeout = {
        cancel: jasmine.createSpy('searchTimeout.cancel'),
      };

      scope.cancelParent();

      expect(scope.fetchingParentData).toEqual(false); // clear the search criteria
      expect(scope.searchTimeout.cancel).toHaveBeenCalled();
    });
  });

  describe('scope.addAlternativeBenefit -> when $scope.currentParent $scope.currentChild are not null', function () {
    it('should create an alternative benefit and add it to $scope.alternativeBenefits and reset search fields', function () {
      scope.currentParent = {};
      scope.currentChild = {};
      scope.alternativeBenefits = [];
      spyOn(ctrl, 'createAlternativeBenefit').and.returnValue({});
      spyOn(scope, 'cancelParent');
      spyOn(scope, 'cancelChild');
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'refreshGrid');

      scope.addAlternativeBenefit();

      expect(scope.cancelParent).toHaveBeenCalled();
      expect(scope.cancelChild).toHaveBeenCalled();
      expect(ctrl.filterAllCodes).toHaveBeenCalled();
      expect(ctrl.refreshGrid).toHaveBeenCalled();
      expect(scope.alternativeBenefits).toEqual([{}]);
    });

    it('should do nothing when current child or curren parent is not available', function () {
      scope.currentChild = {};
      scope.alternativeBenefits = [];
      spyOn(ctrl, 'createAlternativeBenefit').and.returnValue({});
      spyOn(scope, 'cancelParent');
      spyOn(scope, 'cancelChild');
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'refreshGrid');

      scope.addAlternativeBenefit();

      expect(scope.cancelParent).not.toHaveBeenCalled();
      expect(scope.cancelChild).not.toHaveBeenCalled();
      expect(ctrl.filterAllCodes).not.toHaveBeenCalled();
      expect(ctrl.refreshGrid).not.toHaveBeenCalled();
      expect(scope.alternativeBenefits).toEqual([]);
    });
  });

  describe('scope.deleteAlternativeBenefit', function () {
    it('should reset search fields and remove benefit from alternative benefits list', function () {
      var code1 = { ParentServiceCodeId: 1, ChildServiceCodeId: 2 };
      var code2 = { ParentServiceCodeId: 3, ChildServiceCodeId: 4 };
      scope.alternativeBenefits = [code1, code2];
      spyOn(ctrl, 'createAlternativeBenefit').and.returnValue({});
      spyOn(scope, 'cancelParent');
      spyOn(scope, 'cancelChild');
      spyOn(ctrl, 'filterAllCodes');
      spyOn(ctrl, 'refreshGrid');

      scope.deleteAlternativeBenefit(code1);

      expect(scope.cancelParent).toHaveBeenCalled();
      expect(scope.cancelChild).toHaveBeenCalled();
      expect(ctrl.filterAllCodes).toHaveBeenCalled();
      expect(ctrl.refreshGrid).toHaveBeenCalled();
      expect(scope.alternativeBenefits).toEqual([code2]);
    });
  });

  describe('ctrl.createAlternativeBenefit ', function () {
    it('should return a new alternative benefit from the given values', function () {
      var parent = { ServiceCodeId: 1, Code: '1', Fee: 1 };
      var child = { ServiceCodeId: 2, Code: '2', Fee: 2 };

      var result = ctrl.createAlternativeBenefit(parent, child);
      expect(result.BenefitPlanId).toEqual('');
      expect(result.ParentServiceCodeId).toEqual(1);
      expect(result.ParentCode).toEqual('1');
      expect(result.ParentCharge).toEqual(1);
      expect(result.ChildServiceCodeId).toEqual(2);
      expect(result.ChildCode).toEqual('2');
      expect(result.ChildCharge).toEqual(2);
      expect(result.ObjectState).toEqual('Add');
    });
  });
});

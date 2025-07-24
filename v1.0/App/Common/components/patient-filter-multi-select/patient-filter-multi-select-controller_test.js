describe('patient-filter-mulit-select-controller->', function () {
  var ctrl, scope, filter;

  filter = jasmine
    .createSpy('multiSelectLabel')
    .and.returnValue(function (options, valueField, textField, dropDownLabel) {
      return dropDownLabel;
    });

  beforeEach(inject(function ($rootScope, $filter, $controller) {
    scope = $rootScope.$new();
    scope.maxVisibleOptions = 3;
    scope.textField = 'Text';
    scope.valueField = 'Selected';
    scope.dropDownLabel = 'Transaction Types';
    scope.options = [
      {
        Text: 'All Transaction Types',
        Selected: true,
        Id: 0,
        IsAllOption: true,
        IsDefault: true,
      },
      { Text: 'Services', Selected: true, Id: 1 },
      { Text: 'Account Payments', Selected: true, Id: 2 },
      { Text: 'Insurance Payments', Selected: true, Id: 3 },
      { Text: '- Adjustments', Selected: true, Id: 4 },
      { Text: '+ Adjustments', Selected: true, Id: 5 },
      { Text: 'Finance Charges', Selected: true, Id: 6 },
    ];
    ctrl = $controller('PatientFilterMultiSelectController', {
      $scope: scope,
      $filter: filter,
    });
  }));

  describe('init', function () {
    it('ctrl should exist with defaults', function () {
      expect(ctrl).not.toBeNull();
      expect(scope.dropDownStyle).not.toBeUndefined();
      expect(scope.showStatus).toBe(false);
    });
  });

  describe('ctrl.init ->', function () {
    it('ctrl.init should set showStatus to true if Status property is present in option list', function () {
      _.each(scope.options, function (option) {
        option.Status = 'test';
      });
      ctrl.init();
      expect(scope.showStatus).toBe(true);
    });
    it('ctrl.init should set showStatus to false if Status property is not present in option list', function () {
      ctrl.init();
      expect(scope.showStatus).toBe(false);
    });
  });

  describe('scope.click', function () {
    var event;
    beforeEach(function () {
      event = {
        target: { classList: [] },
        stopPropagation: jasmine.createSpy('$event.stopPropagation'),
      };
    });
    it('should not update option if event was checkbox click', function () {
      scope.click(scope.options[0], event);
      expect(scope.options[0].Selected).toEqual(true);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
    it('should update option if event was not checkbox click', function () {
      event.target.classList.push('option');
      scope.click(scope.options[0], event);
      expect(scope.options[0].Selected).toEqual(false);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
    it('should change all other options if option is an All option', function () {
      scope.options[0].Selected = false;
      scope.click(scope.options[0], event);
      _.each(scope.options, x => {
        expect(x.Selected).toEqual(false);
      });
    });
    it('should change All options to match if all other options have same selection', function () {
      scope.options[0].Selected = false;
      scope.click(scope.options[1], event);
      _.each(scope.options, x => {
        expect(x.Selected).toEqual(true);
      });
    });
    it("should change All options to false if other options don't have matching selection", function () {
      scope.options[1].Selected = false;
      scope.click(scope.options[1], event);
      expect(scope.options[0].Selected).toEqual(false);
    });
    it('should call change event if specified', function () {
      scope.changeEvent = jasmine.createSpy('changeEvent');
      scope.click(scope.options[0], event);
      expect(scope.changeEvent).toHaveBeenCalled();
    });
  });

  describe('scope.hasStatus ->', function () {
    it('should return true if options in list with given status', function () {
      var options = [{ Status: 'test' }, { Status: 'fail' }];
      var result = scope.hasStatus(options, 'test');
      expect(result).toBe(true);
    });
    it('should return false if no options in list with given status', function () {
      var options = [{ Status: 'test' }, { Status: 'fail' }];
      var result = scope.hasStatus(options, 'true');
      expect(result).toBe(false);
    });
    it('should return false if options list is null', function () {
      var result = scope.hasStatus(null, 'true');
      expect(result).toBe(false);
    });
  });
});

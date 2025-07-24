describe('dateSelector ->', function () {
  describe('directive ->', function () {
    var element;
    var compile;
    var rootScope;
    var scope;

    beforeEach(module('common.factories'));
    beforeEach(module('common.controllers'));
    beforeEach(module('common.directives'));
    beforeEach(module('soar.templates'));

    beforeEach(inject(function ($compile, $rootScope) {
      compile = $compile;
      rootScope = $rootScope;
      scope = rootScope.$new();
    }));

    it('should inject template when compiled', function () {
      element = angular.element(
        "<date-selector date-var='dateVar' valid='valid'></date-selector>"
      );
      compile(element)(scope);
      rootScope.$digest();
      var p = angular.element('.input-group', element);

      expect(p.length).toBe(1);
      expect(p.attr('ng-form')).toBe('dateForm');
    });
  });

  describe('controller ->', function () {
    var ctrl;
    var scope;
    var timeout;
    var today = moment('2018-06-14').toDate();

    beforeEach(module('common.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $timeout) {
      scope = $rootScope.$new();
      timeout = $timeout;
      ctrl = $controller('DateSelectorCtrl', {
        $scope: scope,
        $timeout: timeout,
      });
      scope.dateForm = {
        datePicker: {
          $valid: true,
          $viewValue: new Date('May 10, 2000'),
          $setValidity: jasmine.createSpy().and.callFake(function (key, value) {
            this.$valid = value;
          }),
        },
      };
      jasmine.clock().mockDate(today);
    }));

    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.valid).toBe(true);
      expect(scope.mode).toBe('year');
      expect(scope.disableModeSwitch).toBe(false);
      expect(scope.dateVar).toEqual(today);
      expect(scope.tempDate).toEqual(today);
      expect(scope.dateOptions).toEqual({
        format: 'MM/dd/yyyy',
        maxDate: scope.maxDate,
        minDate: new Date('January 1, 1900'),
        showWeeks: false,
      });
    });

    describe('setInitialDate function ->', function () {
      it('should set tempDate to formatted date if dateVar is not null', function () {
        scope.dateVar = new Date();
        scope.tempDate = 'temp';
        scope.setInitialDate();
        expect(scope.tempDate).toEqual(moment(scope.dateVar).local().toDate());
      });
    });

    describe('dateVar watch function ->', function () {
      beforeEach(function () {
        spyOn(scope, 'setInitialDate');
      });

      it('should set mode to "day" if new value is not null', function () {
        scope.mode = 'year';
        scope.dateVar = new Date();
        scope.$digest();
        expect(scope.mode).toBe('day');
        expect(scope.setInitialDate).toHaveBeenCalled();
      });

      it('should set mode to "year" if new value is null', function () {
        scope.mode = 'day';
        scope.dateVar = null;
        scope.$digest();
        expect(scope.mode).toBe('year');
        expect(scope.setInitialDate).toHaveBeenCalled();
      });
    });

    describe('tempDate watch function ->', function () {
      beforeEach(function () {
        scope.tempDate = 'initial';
        spyOn(scope, 'validate');
        spyOn(scope, 'setInitialDate').and.callFake(function () {});
      });

      it('should call validate if value has changed', function () {
        scope.$digest();
        scope.tempDate = 'modified';
        scope.$digest();
        expect(scope.validate).toHaveBeenCalled();
      });

      it('should not call validate if value has not changed', function () {
        scope.$digest();
        expect(scope.validate).not.toHaveBeenCalled();
      });
    });

    describe('validate function ->', () => {
      beforeEach(() => {
        spyOn(timeout, 'cancel');
        spyOn(scope, 'validateTimeoutFunction');
      });

      it('should call timeout and set validateTimeout if it is null', () => {
        scope.validateTimeout = null;
        scope.validate();
        timeout.flush(0);
        expect(scope.validateTimeout).not.toBeNull();
        expect(timeout.cancel).not.toHaveBeenCalled();
        expect(scope.validateTimeoutFunction).toHaveBeenCalled();
      });

      it('should cancel timeout request if validateTimeout is not null', () => {
        scope.validateTimeout = timeout(123, 0);
        scope.validate();
        timeout.flush(0);
        expect(scope.validateTimeout).not.toBeNull();
        expect(timeout.cancel).toHaveBeenCalled();
        expect(scope.validateTimeoutFunction).toHaveBeenCalled();
      });
    });

    describe('validateTimeoutFunction function ->', function () {
      beforeEach(function () {
        scope.minDate = new Date('January 1, 2000');
        scope.maxDate = new Date('December 31, 2001');
        scope.dateOptions.maxDate = scope.maxDate;
        scope.dateOptions.minDate = scope.minDate;
        scope.tempDate = new Date('05/10/2000');
      });

      it('should set valid to false if $viewValue is invalid', function () {
        scope.isValid = true;
        scope.dateForm.datePicker.$viewValue = 'invalid';
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(false);
        expect(scope.valid).toBe(false);
      });

      // If JS date parsing goes wrong, it'll return 1954 instead expected of 0054
      it('should set valid to false if $viewValue year is less than 100', () => {
        const inputDate = '11/22/0054';
        scope.isValid = true;
        scope.dateForm.datePicker.$viewValue = inputDate;
        scope.tempDate = new Date(inputDate);
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(false);
        expect(scope.valid).toBe(false);
      });

      it('should set valid to false if viewValue and tempDate years are not equal', () => {
        scope.isValid = true;
        scope.dateForm.datePicker.$viewValue = '11/22/2000';
        scope.tempDate = new Date('11/22/2001');
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(false);
        expect(scope.valid).toBe(false);
      });

      it('should set valid to false if $viewValue and tempDate are less than default min', function () {
        const inputDate = '12/31/1899';
        scope.minDate = new Date('January 1, 1900');
        scope.dateOptions.minDate = scope.minDate;

        scope.isValid = true;
        scope.dateForm.datePicker.$viewValue = inputDate;
        scope.tempDate = new Date(inputDate);
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(false);
        expect(scope.valid).toBe(false);
      });

      it('should set valid to false if $viewValue is less than min', function () {
        const inputDate = '12/31/1999';
        scope.isValid = true;
        scope.dateForm.datePicker.$viewValue = inputDate;
        scope.tempDate = new Date(inputDate);
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(false);
        expect(scope.valid).toBe(false);
      });

      it('should set valid to false if $viewValue is greater than max', function () {
        const inputDate = '01/01/2002';
        scope.isValid = true;
        scope.dateForm.datePicker.$viewValue = inputDate;
        scope.tempDate = new Date(inputDate);
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(false);
        expect(scope.valid).toBe(false);
      });

      it('should set valid to false if $viewValue is less than 10 characters', function () {
        scope.isValid = true;
        scope.dateForm.datePicker.$viewValue = '1/1/01';
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(false);
        expect(scope.valid).toBe(false);
      });

      it('should set valid to true if $viewValue is valid, has 10 characters, and is between min and max', function () {
        scope.isValid = false;
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(true);
        expect(scope.valid).toBe(true);
      });

      it('should set valid to true if $viewValue is a Date object', function () {
        scope.isValid = false;
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(true);
        expect(scope.valid).toBe(true);
      });

      it('should set dateVar to the formatted date if valid is true', function () {
        scope.valid = false;
        scope.dateVar = '';
        scope.validateTimeoutFunction();
        expect(scope.dateVar).toEqual(moment.utc(scope.tempDate).toDate());
        expect(scope.valid).toBe(true);
      });

      it('should set dateVar to null if valid is false', function () {
        const inputDate = '12/31/19999';
        scope.isValid = true;
        scope.dateVar = '05/10/2000';
        scope.dateForm.datePicker.$viewValue = inputDate;
        scope.tempDate = new Date(inputDate);
        scope.validateTimeoutFunction();
        expect(scope.dateVar).toBeNull();
      });

      it('should set valid to true and dateVar to undefined if tempDate and $viewValue are null', function () {
        scope.isValid = false;
        scope.dateVar = 'temp';
        scope.dateForm.datePicker.$viewValue = scope.tempDate = null;
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(true);
        expect(scope.valid).toBe(true);
        expect(scope.dateVar).toBeNull();
      });

      it('should set valid to true and dateVar to undefined if tempDate is null and $viewValue is empty string', function () {
        scope.isValid = false;
        scope.dateVar = 'temp';
        scope.dateForm.datePicker.$viewValue = '';
        scope.tempDate = null;
        scope.validateTimeoutFunction();
        expect(scope.isValid).toBe(true);
        expect(scope.valid).toBe(true);
        expect(scope.dateVar).toBeNull();
      });
    });

    describe('open function ->', function () {
      var event;

      beforeEach(function () {
        event = {
          preventDefault: function () {},
          stopPropagation: function () {},
        };
        spyOn(event, 'preventDefault').and.callFake(function () {});
        spyOn(event, 'stopPropagation').and.callFake(function () {});
        scope.opened = false;
      });

      it('should call preventDefault and stopPropagation and set opened to true', function () {
        scope.open(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(scope.opened).toBe(true);
      });
    });
  });
});

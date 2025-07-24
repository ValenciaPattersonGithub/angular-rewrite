describe('PatientEmailItemController ->', function () {
  //#region Variables
  var scope, ctrl, controller; //timeout, toastrFactory, depositService;

  //#endregion
  function createController() {
    ctrl = controller('PatientEmailItemController', { $scope: scope });
  }
  //#region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    controller = $controller;
    scope.editingMode = jasmine.createSpy('scope.editingMode');
    scope.email = jasmine.createSpy('scope.email');

    scope.email.Email = jasmine.createSpy('scope.email.Email');
    scope.originalEmail = jasmine.createSpy('scope.originalEmail');
    scope.originalEmail.Email = jasmine.createSpy('scope.originalEmail.Email');
    scope.removeFunction = jasmine.createSpy('scope.removeFunction');
  }));

  //#endregion

  describe('controller ->', function () {
    beforeEach(function () {
      createController();
    });

    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    //expandEncounter
    describe('disableEdit ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should set editingMode to false', function () {
        scope.email.invalidEmail = false;
        scope.emailString = 'test';

        scope.disableEdit(true);
        expect(scope.editingMode).toBe(false);
        expect(scope.email.Email).toBe('test');
      });

      it('should set email.Email to emailString when invalidEmail is false and isSave is true', function () {
        scope.disableEdit(false);
        expect(scope.editingMode).toBe(false);
        expect(scope.removeFunction).toHaveBeenCalled();
      });

      it('should call removeFunction when email.Email is null, empty, or undefined and originalEmail.Email has a value', function () {
        scope.email.Email = '';
        scope.originalEmail.Email = 'originalEmail';

        scope.email = 'testEmail';
        scope.disableEdit(false);
        expect(scope.editingMode).toBe(false);
        expect(scope.removeFunction).toHaveBeenCalledWith(scope.email);
      });

      it('should call removeFunction when email.Email has a value and originalEmail.Email is null, empty, or undefined', function () {
        scope.email.Email = 'testEmail';
        scope.originalEmail.Email = '';

        scope.email = 'testEmail';
        scope.disableEdit(false);
        expect(scope.editingMode).toBe(false);
        expect(scope.removeFunction).toHaveBeenCalledWith(scope.email);
      });

      it('should set scope.email to scope.originalEmail when none of the above is true', function () {
        scope.email.Email = 'testEmail';
        scope.originalEmail.Email = 'originalEmail';

        scope.disableEdit(false);
        expect(scope.editingMode).toBe(false);
        expect(scope.removeFunction).not.toHaveBeenCalled();
        expect(scope.email).toBe(scope.originalEmail);
      });
    });
  });
});

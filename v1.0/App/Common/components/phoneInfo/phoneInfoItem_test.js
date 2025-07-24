describe('phoneInfoItem-directive -> ', function () {
  var scope, controller, compile, html, timeout, patientServices;

  beforeEach(module('soar.templates'));
  beforeEach(module('kendo.directives'));
  beforeEach(module('common.directives'));
  beforeEach(module('common.filters'));
  beforeEach(
    module('Soar.Common', function ($provide) {
      //#region mocks for factories
      patientServices = {};
      $provide.value('PatientServices', patientServices);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $compile, $timeout) {
    compile = $compile;
    timeout = $timeout;
    scope = $rootScope.$new();

    scope.phone = {
      ContactId: null,
      PhoneNumber: null,
      Type: null,
      Notes: null,
      TextOk: null,
      ObjectState: 1,
    };

    scope.phoneTypes = new kendo.data.ObservableArray([
      { Name: 'Mobile', Value: 'Mobile', canEdit: false },
      { Name: 'Home', Value: 'Home', canEdit: false },
      { Name: 'Work', Value: 'Work', canEdit: false },
      { Name: 'Custom', Value: 'Custom' },
    ]);

    scope.removeFunction = function () {};

    // append to body so kendo.template can find id
    html = '<div id="template" type="text/x-kendo-template"></div>';
    angular.element(document.body).append(html);

    controller = $controller('PhoneInfoItemController', {
      $scope: scope,
    });

    controller.ddl = {
      options: {},
      refresh: jasmine.createSpy(),
      select: jasmine.createSpy(),
    };
  }));

  it('should set scope properties', function () {
    expect(scope.customPhoneTypes.length).toBe(0);
    expect(scope.noteCollapsed).toBe(true);
    expect(scope.editing).toBe(false);
    expect(scope.showRemoveMsg).toBe(false);
    expect(scope.addOptionValue).toEqual('Custom');
    expect(scope.editCustomLabel).toEqual('');
  });

  describe('editCustomPhoneType function -> ', function () {
    it('should set scope properties', function () {
      scope.editCustomPhoneType('custom');

      expect(scope.editing).toBe(true);
      expect(scope.editMode).toBe(true);
      expect(scope.editCustomLabel).toBe('custom');
      expect(scope.showRemoveMsg).toBe(false);
    });
  });

  describe('cancelCustomPhoneType function -> ', function () {
    it('should set scope properties', function () {
      scope.cancelCustomPhoneType();

      expect(scope.editing).toBe(false);
      expect(scope.editMode).toBe(false);
      expect(scope.addingCustomPhoneType).toBe(false);
      expect(scope.showRemoveMsg).toBe(false);
    });
  });

  describe('phoneTypeChanged function -> ', function () {
    it('should do nothing when phone.Type is null', function () {
      scope.phoneTypeChanged();

      expect(scope.phone.Type).toBeNull();
    });

    it('should set phone.Type to null when phone.Type is "Custom"', function () {
      scope.phone.Type = 'Custom';
      scope.phoneTypeChanged();

      expect(scope.phone.Type).toBeNull();
      expect(scope.addingCustomPhoneType).toBe(true);
    });
  });

  describe('addCustomPhoneType function -> ', function () {
    it('should add a custom phone type when not editing', function () {
      scope.phone.Type = 'custom';
      scope.addCustomPhoneType();

      expect(scope.phoneTypes.length).toBe(4);
      expect(scope.editing).toBe(false);
      expect(scope.editMode).toBe(false);
      expect(scope.addingCustomPhoneType).toBe(false);
      expect(scope.showRemoveMsg).toBe(false);
    });

    //it('should edit a custom phone type when editing an existing one', function () {
    //    scope.phone.Type = 'custom';
    //    scope.addCustomPhoneType();

    //    scope.editing = true;
    //    scope.editCustomLabel = 'Custom';
    //    scope.phone.Type = 'Customs';
    //    scope.addCustomPhoneType();

    //    expect(scope.phoneTypes.length).toBe(4);
    //    expect(scope.phoneTypes[3].Value).toEqual('Customs');
    //    expect(scope.editing).toBe(false);
    //    expect(scope.editMode).toBe(false);
    //    expect(scope.addingCustomPhoneType).toBe(false);
    //    expect(scope.showRemoveMsg).toBe(false);
    //});
  });

  describe('$watch showRemoveOption -> ', function () {
    it('should set showRemoveMsg to false when ov is false and nv is true', function () {
      scope.showRemoveOption = false;
      scope.$apply();
      scope.showRemoveOption = true;
      scope.$apply();

      expect(scope.showRemoveMsg).toBe(false);
    });
  });

  describe('removePrompt function -> ', function () {
    it('should set showRemoveMsg to true when a field has something entered', function () {
      scope.phone.PhoneNumber = '12345647890';
      scope.removePrompt();

      expect(scope.editing).toBe(false);
      expect(scope.editMode).toBe(false);
      expect(scope.addingCustomPhoneType).toBe(false);
      expect(scope.showRemoveMsg).toBe(true);
    });

    it('should set showRemoveMsg to false and call removeFunction when a field has nothing entered', function () {
      spyOn(scope, 'removeFunction');

      scope.phone = {
        Id: '',
        PhoneNumber: null,
        Type: null,
        Notes: null,
        TextOk: null,
        Primary: false,
        ObjectState: 1,
      };
      scope.removePrompt();
      expect(scope.showRemoveMsg).toBe(false);
      expect(scope.removeFunction).toHaveBeenCalled();

      scope.phone = {
        Id: '',
        PhoneNumber: '',
        Type: '',
        Notes: '',
        TextOk: false,
        Primary: false,
        ObjectState: 1,
      };
      scope.removePrompt();
      expect(scope.showRemoveMsg).toBe(false);
      expect(scope.removeFunction).toHaveBeenCalled();
    });
  });

  describe('confirmRemove function -> ', function () {
    it('should call removeFunction and set showRemoveMsg to false', function () {
      spyOn(scope, 'removeFunction');
      scope.confirmRemove();

      expect(scope.removeFunction).toHaveBeenCalled();
      expect(scope.showRemoveMsg).toBe(false);
    });
  });

  describe('confirmRemove function -> ', function () {
    it('should set showRemoveMsg to false', function () {
      scope.confirmRemove();

      expect(scope.showRemoveMsg).toBe(false);
    });
  });

  describe('$watch phone.PhoneNumber', function () {
    it('should call hasBeenEdited function when nv does not equal ov', function () {
      spyOn(scope, 'hasBeenEdited');
      scope.phone.PhoneNumber = null;
      scope.$apply();
      scope.phone.PhoneNumber = '5553332222';
      scope.$apply();
      timeout.flush();
      expect(scope.hasBeenEdited).toHaveBeenCalled();
    });

    it('should set hasErrors to true when saveState is Update and phoneNumber is null or empty string', function () {
      scope.phone.ContactId = '1';
      scope.phone.ObjectState = 'Update';
      scope.originalPhone.Type = 'Home';
      scope.phone.Type = 'Home';
      scope.phone.PhoneNumber = '5553332222';
      scope.$apply();
      scope.phone.ObjectState = 'Update';
      scope.phone.PhoneNumber = 'null';
      scope.$apply();
      timeout.flush();
      expect(scope.phone.hasErrors).toBe(true);
    });

    it('should set hasErrors to false when saveState is Update and phoneNumber is valid', function () {
      scope.phone.ContactId = '1';
      scope.phone.ObjectState = 'Update';
      //we set phone.Type to originalPhone's type on load. need to set it for test
      scope.originalPhone.Type = 'Home';
      scope.phone.Type = 'Home';
      scope.phone.PhoneNumber = '5553332222';
      scope.$apply();
      scope.phone.PhoneNumber = '9998884444';
      scope.$apply();
      timeout.flush();
      expect(scope.phone.hasErrors).toBe(false);
    });
  });

  describe('$watch phone.Type', function () {
    it('should call hasBeenEdited function when nv does not equal ov', function () {
      spyOn(scope, 'hasBeenEdited');
      scope.phone.Type = null;
      scope.$apply();
      scope.phone.Type = 'custom';
      scope.$apply();

      expect(scope.hasBeenEdited).toHaveBeenCalled();
    });
  });

  describe('$watch phone.PhoneNotes', function () {
    it('should call hasBeenEdited function when nv does not equal ov', function () {
      spyOn(scope, 'hasBeenEdited');
      scope.phone.Notes = null;
      scope.$apply();
      scope.phone.Notes = 'asdf';
      scope.$apply();

      expect(scope.hasBeenEdited).toHaveBeenCalled();
    });
  });

  describe('$watch phone.TextOk', function () {
    it('should call hasBeenEdited function when nv does not equal ov', function () {
      spyOn(scope, 'hasBeenEdited');
      scope.phone.TextOk = null;
      scope.$apply();
      scope.phone.TextOk = true;
      scope.$apply();
      expect(scope.hasBeenEdited).toHaveBeenCalled();
    });
  });

  describe('$watch phone.duplicateNumber', function () {
    it('should call hasBeenEdited function on change', function () {
      spyOn(scope, 'hasBeenEdited');
      scope.phone.duplicateNumber = true;
      scope.$apply();
      scope.phone.duplicateNumber = false;
      scope.$apply();
      timeout.flush();
      expect(scope.hasBeenEdited).toHaveBeenCalled();
    });

    it('should call scope.validatePhone on change', function () {
      spyOn(scope, 'validatePhone');
      scope.phone.duplicateNumber = true;
      scope.$apply();
      scope.phone.duplicateNumber = false;
      scope.$apply();
      timeout.flush();
      expect(scope.validatePhone).toHaveBeenCalled();
    });
  });

  describe('hasBeenEdited function -> ', function () {
    it('should set state to Update when phoneNumber does not match original value', function () {
      scope.phone.ContactId = '1';
      scope.phone.PhoneNumber = '5552223333';
      scope.hasBeenEdited();

      expect(scope.phone.ObjectState).toBe('Update');
    });

    it('should set state to Update when PhoneType does not match original value', function () {
      scope.phone.ContactId = '1';
      scope.phone.Type = 'Custom';
      scope.hasBeenEdited();

      expect(scope.phone.ObjectState).toBe('Update');
    });

    it('should set state to Update when PhoneNotes does not match original value', function () {
      scope.phone.ContactId = '1';
      scope.phone.Notes = 'asdf';
      scope.hasBeenEdited();

      expect(scope.phone.ObjectState).toBe('Update');
    });

    it('should set state to Update when TextOk does not match original value', function () {
      scope.phone.ContactId = '1';
      scope.phone.TextOk = true;
      scope.hasBeenEdited();
      expect(scope.phone.ObjectState).toBe('Update');
    });

    it('should set state to None when TextOk matches original value', function () {
      scope.phone = angular.copy(scope.originalPhone);
      scope.phone.PhoneNumber = '5552221234';
      scope.hasBeenEdited();

      expect(scope.phone.ObjectState).toBe('Add');
    });
  });
});

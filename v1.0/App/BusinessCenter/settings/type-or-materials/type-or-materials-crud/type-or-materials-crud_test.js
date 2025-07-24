describe('type-or-materials-crud test ->', function () {
  var scope,
    q,
    ctrl,
    modalInstance,
    modalFactory,
    listHelper,
    toastrFactory,
    localize,
    compile,
    element;
  var typeOrMaterialsService, modalFactoryDeferred;

  var mockTypeOrMaterial = { TypeOrMaterialId: 1, Description: 'Type1' };

  var mockTypeOrMaterials = [
    { TypeOrMaterialId: 5, Description: 'Type5' },
    { TypeOrMaterialId: 2, Description: 'Type2' },
    { TypeOrMaterialId: 3, Description: 'Type3' },
  ];

  var loadHtml = function () {
    element = angular.element(
      '<form name="frmTypeOrMaterialCrud" role="form" novalidate>' +
        ' <div ng-class="{error: !formIsValid && frmTypeOrMaterialCrud.inpDescription.$error.duplicate}">' +
        '<input id="inpDescription" class="form-input required valid" ng-model="typeOrMaterial.Description" name="inpDescription" maxlength="50"type="text" set-focus required ng-minlength="1" ng-maxlength="50" minlength="1" alpha-numeric />' +
        '<label id="lblDescriptionDuplicate" class="help-text " ng-show="!formIsValid && frmTypeOrMaterialCrud.inpDescription.$error.duplicate">' +
        "{{ 'Duplicate Description' | i18n }}" +
        '</label>' +
        '</div>' +
        '</form>'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
  };

  //#region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $compile
  ) {
    q = $q;
    scope = $rootScope.$new();
    compile = $compile;

    //mock of ModalInstance
    modalInstance = {
      close: jasmine.createSpy(),
      dismiss: jasmine.createSpy(),
    };

    //mock of ModalFactory
    //mock for modalFactory
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    //mock for typeOrMaterialsService
    typeOrMaterialsService = {
      get: jasmine.createSpy('typeOrMaterialsService.get').and.returnValue(''),
      save: jasmine.createSpy().and.returnValue(''),
      update: jasmine.createSpy().and.returnValue(''),
    };

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(0),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
      findItemByFieldValueIgnoreCase: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(0),
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (value) {
          return value;
        }),
    };

    //mock for toastrFactory
    toastrFactory = {
      error: jasmine.createSpy(),
      success: jasmine.createSpy(),
    };

    //creating controller
    ctrl = $controller('TypeOrMaterialsCrudController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      ModalFactory: modalFactory,
      TypeOrMaterials: mockTypeOrMaterials,
      ListHelper: listHelper,
      TypeOrMaterial: mockTypeOrMaterial,
      TypeOrMaterialsService: typeOrMaterialsService,
      toastrFactory: toastrFactory,
      localize: localize,
      $q: q,
    });
  }));
  //#endRegion

  //controller
  it('TypeOrMaterialsCrudController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  //Validating the form
  describe('ValidateForm function ->', function () {
    beforeEach(function () {
      loadHtml();
    });

    it('Should be invalid when description field is empty', function () {
      scope.frmTypeOrMaterialCrud.inpDescription.$error.required = true;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('Should be invalid when description field is not empty but duplicate', function () {
      scope.frmTypeOrMaterialCrud.inpDescription.$error.required = false;
      scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = true;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('Should be valid when description field is neither empty nor duplicate', function () {
      scope.frmTypeOrMaterialCrud.inpDescription.$error.required = false;
      scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = false;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(true);
    });
  });

  // listening for description required error to disabled/enable the button2 accordingly
  describe('frmTypeOrMaterialCrud.inpDescription.$error.required watch -> ', function () {
    beforeEach(function () {
      loadHtml();
    });

    it('should set $scope.requiredFieldError flag to true if there is an error', function () {
      scope.frmTypeOrMaterialCrud.inpDescription.$error.required = true;
      scope.$apply();
      expect(scope.requiredFieldError).toBe(true);
    });

    it('should set $scope.requiredFieldError flag to false if there is no error', function () {
      scope.frmTypeOrMaterialCrud.inpDescription.$error.required = false;
      scope.$apply();
      expect(scope.requiredFieldError).toBe(false);
    });
  });

  // checking to see if the new description is already in the existing type or material list
  describe('typeOrMaterial.Description watch -> ', function () {
    beforeEach(function () {
      loadHtml();
    });

    it('should set $scope.frmConditionCrud.inpDescription.$error.duplicate to true if we find a duplicate', function () {
      scope.typeOrMaterial.Description = 'Type2';
      listHelper.findItemByFieldValueIgnoreCase = jasmine
        .createSpy()
        .and.returnValue('test');
      scope.$apply();
      expect(scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate).toBe(
        true
      );
    });
  });

  describe('typeOrMaterial.Description watch -> ', function () {
    beforeEach(function () {
      loadHtml();
    });

    it('should set scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate to false if we dont find a duplicate', function () {
      scope.typeOrMaterial.Description = null;
      scope.$apply();
      expect(scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate).toBe(
        false
      );
    });
  });

  describe('save function ->', function () {
    beforeEach(function () {
      loadHtml();
    });

    it('should validate the form', function () {
      spyOn(ctrl, 'validateForm');
      scope.save();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should not call either api if form is invalid', function () {
      scope.save();
      expect(scope.formIsValid).toBe(false);
      expect(typeOrMaterialsService.update).not.toHaveBeenCalled();
      expect(typeOrMaterialsService.save).not.toHaveBeenCalled();
    });

    it('should call update if we are in edit mode and form is valid', function () {
      scope.frmTypeOrMaterialCrud.inpDescription.$error.required = false;
      scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = false;
      scope.save();
      expect(scope.formIsValid).toBe(true);
      expect(typeOrMaterialsService.update).toHaveBeenCalled();
    });

    it('should call save if we are not in edit mode and form is valid', function () {
      scope.editMode = false;
      scope.frmTypeOrMaterialCrud.inpDescription.$error.required = false;
      scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = false;
      scope.save();
      expect(scope.formIsValid).toBe(true);
      expect(typeOrMaterialsService.save).toHaveBeenCalled();
    });
  });

  // type or material add/update success handler
  describe('typeOrMaterialAddUpdateSuccess function ->', function () {
    it('should call toastr success', function () {
      ctrl.typeOrMaterialAddUpdateSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should set currently saving flag to false', function () {
      ctrl.typeOrMaterialAddUpdateSuccess();
      expect(scope.currentlySaving).toBe(false);
    });

    it('should close modal', function () {
      ctrl.typeOrMaterialAddUpdateSuccess();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  // type or material add/update error handler
  describe('typeOrMaterialAddUpdateFailure function ->', function () {
    it('should call toastr error', function () {
      ctrl.typeOrMaterialAddUpdateFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should set currently saving flag to false', function () {
      ctrl.typeOrMaterialAddUpdateFailure();
      expect(scope.currentlySaving).toBe(false);
    });
  });

  // cancel button handler
  describe('cancel function ->', function () {
    it('should close modal if there are no changes', function () {
      scope.cancel();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  // process cancel confirmation
  describe('confirmCancel function -> ', function () {
    it('should close modal', function () {
      ctrl.confirmCancel();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });
});

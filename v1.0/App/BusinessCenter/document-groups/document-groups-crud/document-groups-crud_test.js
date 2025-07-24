describe('DocumentGroupsCrudController ->', function () {
  var scope, toastrFactory, localize, modalFactory, documentGroupsFactory;
  var ctrl, timeout, element;

  //#region mocks

  var documentGroups = [];
  documentGroups.push({ Description: 'Medical History', DocumentGroupId: 1 });
  documentGroups.push({ Description: 'Insurance', DocumentGroupId: 2 });
  documentGroups.push({ Description: 'Consent', DocumentGroupId: 3 });
  documentGroups.push({ Description: 'Account', DocumentGroupId: 4 });
  documentGroups.push({ Description: 'Other Clinical', DocumentGroupId: 5 });
  documentGroups.push({ Description: 'Lab', DocumentGroupId: 6 });
  documentGroups.push({ Description: 'EOD', DocumentGroupId: 7 });
  documentGroups.push({ Description: 'Treatment Plans', DocumentGroupId: 8 });
  documentGroups.push({ Description: 'Specialist', DocumentGroupId: 11 });

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

      documentGroupsFactory = {
        DocumentGroups: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        SaveDocumentGroup: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        Actions: {
          Create: 'create',
          Update: 'update',
        },
      };
      $provide.value('DocumentGroupsFactory', documentGroupsFactory);

      modalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Modal: jasmine.createSpy().and.returnValue({
          result: {
            then: function (fn) {
              fn();
            },
          },
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $timeout) {
    timeout = $timeout;

    scope = $rootScope.$new();
    timeout = $timeout;
    element = {
      focus: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);

    ctrl = $controller('DocumentGroupsCrudController', {
      $scope: scope,
      ModalFactory: modalFactory,
      toastrFactory: toastrFactory,
      localize: localize,
    });
    // directive properties
    scope.cancel = function () {};
    scope.savedDocumentGroup = function () {};
    scope.documentGroups = {};
    scope.documentGroupDto = {};

    var frmDocumentGroupCrud = {
      $valid: true,
      inpDocumentGroupDescription: {
        $valid: true,
      },
    };
    scope.frmDocumentGroupCrud = frmDocumentGroupCrud;
  }));

  //#endregion

  it('should exist', function () {
    expect(ctrl).toBeDefined();
  });

  describe('ctrl.$onInit function ->', function () {
    var description;
    beforeEach(function () {
      description = 'description';
      scope.documentGroupDto = { Description: description };
    });

    it('should set values', function () {
      scope.formIsValid = false;
      scope.saving = true;
      scope.dataHasChanged = true;
      scope.pageTitle = '';
      scope.actionText = '';
      scope.originalDescription = '';

      ctrl.$onInit();

      expect(scope.formIsValid).toBe(true);
      expect(scope.saving).toBe(false);
      expect(scope.dataHasChanged).toBe(false);
      expect(scope.pageTitle).toBe('Document Group Name');
      expect(scope.actionText).not.toBe('');
      expect(scope.originalDescription).toBe(description);
    });

    describe('authAccess ->', function () {
      var accessValue = {};
      beforeEach(function () {
        documentGroupsFactory.access = jasmine
          .createSpy()
          .and.callFake(function () {
            return accessValue;
          });
      });

      it('should call documentGroupsFactory.access and set scope.authAccess', function () {
        accessValue.View = true;
        scope.authAccess = null;

        ctrl.$onInit();

        expect(documentGroupsFactory.access).toHaveBeenCalled();
        expect(scope.authAccess).toBe(accessValue);
      });

      it('should not call toastrFactory when scope.authAccess.View is true', function () {
        accessValue.View = true;

        ctrl.$onInit();

        expect(toastrFactory.error).not.toHaveBeenCalled();
      });

      it('should call toastrFactory.error and $location.path when scope.authAccess.View is false', function () {
        accessValue.View = false;

        ctrl.$onInit();

        expect(toastrFactory.error).toHaveBeenCalled();
        expect(_$location_.path).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('cancelChanges function -> ', function () {
    it('should call parent cancel method if exists ', function () {
      scope.documentGroupDto.Description = 'old';
      var description = 'new';
      scope.originalDescription = description;
      scope.dataHasChanged = true;
      spyOn(scope, 'cancel');

      scope.cancelChanges();

      expect(scope.dataHasChanged).toBe(false);
      expect(scope.cancel).toHaveBeenCalled();
      expect(scope.documentGroupDto.Description).toBe(description);
    });
  });

  describe('cancelListChanges function -> ', function () {
    it('should call CancelModal if dataHasChanged is true', function () {
      scope.cancelListChanges();
      scope.dataHasChanged = true;
      scope.cancelListChanges();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call cancel if dataHasChanged is false', function () {
      spyOn(scope, 'cancelChanges');
      scope.dataHasChanged = false;
      scope.cancelListChanges();
      expect(scope.cancelChanges).toHaveBeenCalled();
    });
  });

  describe('validateForm function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setFocusOnElement').and.callFake(function () {});
      scope.documentGroups = _.cloneDeep(documentGroups);
    });

    it('should return false if scope.documentGroupDto.Description is null or empty', function () {
      scope.documentGroupDto.Description = null;
      expect(ctrl.validateForm()).toEqual(false);
      expect(scope.formIsValid).toBe(false);
    });

    it('should return false if scope.documentGroupDto.Description is duplicate', function () {
      scope.documentGroupDto.Description = 'Medical History';
      expect(ctrl.validateForm()).toEqual(false);
      expect(scope.formIsValid).toBe(false);
    });

    it('should return true if scope.documentGroupDto.Description is unique', function () {
      scope.documentGroupDto.Description = 'Medical History Other';
      expect(ctrl.validateForm()).toEqual(true);
      expect(scope.formIsValid).toBe(true);
    });

    it('should return true if scope.documentGroupDto.Description is matches existing value', function () {
      var description = 'description';
      var id = 'id';
      scope.documentGroups = [
        { Description: description, DocumentGroupId: id },
      ];
      scope.documentGroupDto = {
        Description: description,
        DocumentGroupId: id,
      };

      expect(ctrl.validateForm()).toEqual(true);
      expect(scope.formIsValid).toBe(true);
    });
  });

  describe('setFocusOnElement function -> ', function () {
    beforeEach(function () {
      scope.validateInfo = jasmine.createSpy();
    });

    it('should set focus on invalid input ', function () {
      scope.frmDocumentGroupCrud.inpDocumentGroupDescription.$valid = false;
      ctrl.setFocusOnElement();
      timeout.flush();
      expect(
        angular.element('#inpDocumentGroupDescription').focus
      ).toHaveBeenCalled();
    });
  });

  describe('handleErrorOnSave function -> ', function () {
    var duplicateErrorMessage = {};
    beforeEach(function () {
      duplicateErrorMessage = {
        data: {
          InvalidProperties: [
            {
              PropertyName:
                'DocumentGroup.DocumentGroup_PracticeId_Description_Unique',
            },
          ],
        },
      };
    });

    it('should set scope.duplicateNameError to true if InvalidProperties containsDocumentGroup.DocumentGroup_PracticeId_Description_Unique', function () {
      scope.duplicateNameError = false;
      ctrl.handleErrorOnSave(duplicateErrorMessage);
      expect(scope.duplicateNameError).toBe(true);
    });

    it('should set scope.duplicateNameError to false if InvalidProperties does not contain DocumentGroup.DocumentGroup_PracticeId_Description_Unique', function () {
      scope.duplicateNameError = false;
      duplicateErrorMessage.data.InvalidProperties[0].PropertyName =
        'something else';
      ctrl.handleErrorOnSave(duplicateErrorMessage);
      expect(scope.duplicateNameError).toBe(false);
    });
  });

  describe('scope.saveDocumentGroup function ->', function () {
    var documentGroup;
    var validateResult;
    beforeEach(function () {
      documentGroup = {};
      ctrl.validateForm = jasmine.createSpy().and.callFake(function () {
        return validateResult;
      });
      scope.authAccess = { Create: true, Edit: true };
      scope.savedDocumentGroup = jasmine.createSpy();
    });

    describe('when documentGroupDto.DocumentGroupId is null ->', function () {
      beforeEach(function () {
        documentGroup.DocumentGroupId = null;
        scope.authAccess = { Create: true, Edit: true };
      });

      describe('when user does not have create access ->', function () {
        beforeEach(function () {
          scope.authAccess.Create = false;
        });

        it('should not call ctrl.validateForm', function () {
          scope.saveDocumentGroup(documentGroup);

          expect(ctrl.validateForm).not.toHaveBeenCalled();
        });
      });

      describe('when user has create access ->', function () {
        beforeEach(function () {
          scope.authAccess.Create = true;
        });

        it('should call ctrl.validateForm', function () {
          scope.saveDocumentGroup(documentGroup);

          expect(ctrl.validateForm).toHaveBeenCalled();
        });
      });
    });

    describe('when documentGroupDto.DocumentGroupId is not null ->', function () {
      beforeEach(function () {
        documentGroup.DocumentGroupId = 'docId';
      });

      describe('when user does not have create access ->', function () {
        beforeEach(function () {
          scope.authAccess.Edit = false;
        });

        it('should not call ctrl.validateForm', function () {
          scope.saveDocumentGroup(documentGroup);

          expect(ctrl.validateForm).not.toHaveBeenCalled();
        });
      });

      describe('when user has create access ->', function () {
        beforeEach(function () {
          scope.authAccess.Edit = true;
        });

        it('should call ctrl.validateForm', function () {
          scope.saveDocumentGroup(documentGroup);

          expect(ctrl.validateForm).toHaveBeenCalled();
        });
      });
    });

    describe('when ctrl.validateForm is false ->', function () {
      beforeEach(function () {
        validateResult = false;
      });

      it('should not call documentGroupsFactory.SaveDocumentGroup', function () {
        scope.saveDocumentGroup(documentGroup);

        expect(documentGroupsFactory.SaveDocumentGroup).not.toHaveBeenCalled();
      });
    });

    describe('when ctrl.validateForm is true ->', function () {
      beforeEach(function () {
        validateResult = true;
      });

      it('should call documentGroupsFactory.SaveDocumentGroup', function () {
        scope.saveDocumentGroup(documentGroup);

        expect(documentGroupsFactory.SaveDocumentGroup).toHaveBeenCalledWith(
          documentGroup
        );
      });
    });

    describe('documentGroupsFactory.SaveDocumentGroup success callback ->', function () {
      var result;
      beforeEach(function () {
        result = { Value: 'result.Value' };
        validateResult = true;
        documentGroupsFactory.SaveDocumentGroup = function () {
          return {
            then: function (success) {
              success(result);
            },
          };
        };
      });

      it('should set scope.saving to false', function () {
        scope.saving = true;

        scope.saveDocumentGroup(documentGroup);

        expect(scope.saving).toBe(false);
      });

      it('should call scope.savedDocumentGroup with correct parameters when creating', function () {
        documentGroup.DocumentGroupId = null;

        scope.saveDocumentGroup(documentGroup);

        expect(scope.savedDocumentGroup).toHaveBeenCalledWith(
          result.Value,
          documentGroupsFactory.Actions.Create
        );
      });

      it('should call scope.savedDocumentGroup with correct parameters when editing', function () {
        documentGroup.DocumentGroupId = 'groupId';

        scope.saveDocumentGroup(documentGroup);

        expect(scope.savedDocumentGroup).toHaveBeenCalledWith(
          result.Value,
          documentGroupsFactory.Actions.Update
        );
      });
    });

    describe('documentGroupsFactory.SavedDocumentGroup failure callback ->', function () {
      var message;
      beforeEach(function () {
        message = 'failure message';
        validateResult = true;
        documentGroupsFactory.SaveDocumentGroup = function () {
          return {
            then: function (success, failure) {
              failure(message);
            },
          };
        };
      });

      it('should call ctrl.handleErrorOnSave and set scope.saving to false', function () {
        ctrl.handleErrorOnSave = jasmine.createSpy();
        scope.saving = true;

        scope.saveDocumentGroup(documentGroup);

        expect(ctrl.handleErrorOnSave).toHaveBeenCalledWith(message);
        expect(scope.saving).toBe(false);
      });
    });
  });
});

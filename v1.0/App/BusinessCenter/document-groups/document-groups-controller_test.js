describe('DocumentGroupsController ->', function () {
  var scope, modalFactory, uibModalInstance, documentGroupsFactory;
  var ctrl, documentGroups, documentGroupsCallback;

  //#region mocks

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      documentGroupsFactory = {
        DeleteDocumentGroup: jasmine.createSpy().and.returnValue({
          then: function () {
            return { catch: angular.noop };
          },
        }),
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        Actions: {
          Create: 'create',
          Update: 'update',
        },
      };
      $provide.value('DocumentGroupsFactory', documentGroupsFactory);

      modalFactory = {
        ConfirmModal: jasmine.createSpy(),
      };
      $provide.value('ModalFactory', modalFactory);

      uibModalInstance = {};
      $provide.value('$uibModalInstance', uibModalInstance);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    documentGroups = [];
    documentGroups.push({ Description: 'Medical History', DocumentGroupId: 1 });
    documentGroups.push({ Description: 'Insurance', DocumentGroupId: 2 });
    documentGroups.push({ Description: 'Consent', DocumentGroupId: 3 });
    documentGroups.push({ Description: 'Account', DocumentGroupId: 4 });
    documentGroups.push({ Description: 'Other Clinical', DocumentGroupId: 5 });
    documentGroups.push({ Description: 'Lab', DocumentGroupId: 6 });
    documentGroups.push({ Description: 'EOD', DocumentGroupId: 7 });
    documentGroups.push({ Description: 'Treatment Plans', DocumentGroupId: 8 });
    documentGroups.push({ Description: 'Specialist', DocumentGroupId: 11 });

    documentGroupsCallback = jasmine.createSpy();

    scope = $rootScope.$new();

    ctrl = $controller('DocumentGroupsController', {
      $scope: scope,
      ModalFactory: modalFactory,
      documentGroups: documentGroups,
      documentGroupsCallback: documentGroupsCallback,
    });
  }));

  //#endregion

  it('should exist', function () {
    expect(ctrl).toBeDefined();
  });

  describe('ctrl.$onInit function ->', function () {
    it('should set values', function () {
      scope.documentGroupsTitle = '';
      scope.mode = '';
      scope.documentGroups = null;

      ctrl.$onInit();

      expect(scope.documentGroupsTitle).toBe('Document Groups');
      expect(scope.mode).toBe('manageDocumentGroups');
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

        expect(_toastr_.error).not.toHaveBeenCalled();
      });

      it('should call toastrFactory.error and $location.path when scope.authAccess.View is false', function () {
        accessValue.View = false;

        ctrl.$onInit();

        expect(_toastr_.error).toHaveBeenCalled();
        expect(_$location_.path).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('scope.close function ->', function () {
    beforeEach(function () {
      uibModalInstance.close = jasmine.createSpy();
    });

    it('should call $uibModalInstance.close', function () {
      scope.close();

      expect(uibModalInstance.close).toHaveBeenCalled();
    });
  });

  describe('scope.createDocumentGroup function ->', function () {
    it('should set scope.mode and scope.documentGroupForEdit correctly', function () {
      scope.mode = '';
      scope.documentGroupForEdit = null;

      scope.createDocumentGroup();

      expect(scope.mode).toBe('editDocumentGroup');
      expect(scope.documentGroupForEdit).toEqual({
        Description: '',
        DocumentGroupId: null,
        IsSystemDocumentGroup: false,
      });
    });
  });

  describe('scope.editDocumentGroup function ->', function () {
    it('should set scope.mode and scope.documentGroupForEdit correctly when group is not a system document group', function () {
      scope.mode = '';
      scope.documentGroupForEdit = null;

      var documentGroup = {
        Description: 'documentGroup',
        IsSystemDocumentGroup: false,
      };

      scope.editDocumentGroup(documentGroup);

      expect(scope.mode).toBe('editDocumentGroup');
      expect(scope.documentGroupForEdit).toBe(documentGroup);
    });

    it('should not set scope.mode and scope.documentGroupForEdit when group is a system document group', function () {
      scope.mode = '';
      scope.documentGroupForEdit = null;

      var documentGroup = {
        Description: 'documentGroup',
        IsSystemDocumentGroup: true,
      };

      scope.editDocumentGroup(documentGroup);

      expect(scope.mode).toBe('');
      expect(scope.documentGroupForEdit).toBe(null);
    });
  });

  describe('scope.deleteDocumentGroup function ->', function () {
    var documentGroup;
    beforeEach(function () {
      scope.authAccess = { Delete: true };
      documentGroup = {
        DocumentGroupId: 'groupId',
        IsSystemDocumentGroup: false,
      };
    });

    it('should not call documentGroupsFactory.DeleteDocumentGroup when authAccess.Delete is false', function () {
      scope.authAccess.Delete = false;

      scope.deleteDocumentGroup(documentGroup);

      expect(documentGroupsFactory.DeleteDocumentGroup).not.toHaveBeenCalled();
    });

    it('should not call documentGroupsFactory.DeleteDocumentGroup when documentGroup.IsSystemDocumentGroup is true', function () {
      documentGroup.IsSystemDocumentGroup = true;

      scope.deleteDocumentGroup(documentGroup);

      expect(documentGroupsFactory.DeleteDocumentGroup).not.toHaveBeenCalled();
    });

    describe('when authAccess.Delete is true and documentGroup.IsSystemDocumentGroup is false ->', function () {
      it('should call documentGroupsFactory.DeleteDocumentGroup with documentGroup.DocumentGroupId', function () {
        scope.deleteDocumentGroup(documentGroup);

        expect(documentGroupsFactory.DeleteDocumentGroup).toHaveBeenCalledWith(
          documentGroup.DocumentGroupId
        );
      });
    });

    describe('documentGroupsFactory.DeleteDocumentGroup success callback', function () {
      beforeEach(function () {
        documentGroupsFactory.DeleteDocumentGroup = function () {
          return {
            then: function (success) {
              success();

              return {
                catch: angular.noop,
              };
            },
          };
        };
      });

      it('should remove delete group from scope.documentGroups if found', function () {
        scope.documentGroups = [
          { DocumentGroupId: documentGroup.DocumentGroupId },
        ];

        scope.deleteDocumentGroup(documentGroup);

        expect(scope.documentGroups.length).toBe(0);
      });

      it('should not alter scope.documentGroups if id not found', function () {
        scope.documentGroups = [
          { DocumentGroupId: documentGroup.DocumentGroupId + 'x' },
        ];

        scope.deleteDocumentGroup(documentGroup);

        expect(scope.documentGroups.length).toBe(1);
      });
    });

    describe('documentGroupsFactory.DeleteDocumentGroup failure callback', function () {
      var result;
      beforeEach(function () {
        documentGroupsFactory.DeleteDocumentGroup = function () {
          return {
            then: function () {
              return {
                catch: function (failure) {
                  failure(result);
                },
              };
            },
          };
        };
      });

      it('should call toastrFactory.error', function () {
        scope.deleteDocumentGroup(documentGroup);

        expect(_toastr_.error).toHaveBeenCalled();
      });

      it('should not call modalFactory.ConfirmModal when res is null', function () {
        result = null;

        scope.deleteDocumentGroup(documentGroup);

        expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      });

      it('should not call modalFactory.ConfirmModal when res.data is null', function () {
        result = {};

        scope.deleteDocumentGroup(documentGroup);

        expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      });

      it('should not call modalFactory.ConfirmModal when res.data.InvalidProperties is null', function () {
        result = { data: {} };

        scope.deleteDocumentGroup(documentGroup);

        expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      });

      it('should not call modalFactory.ConfirmModal when res.data.InvalidProperties does not contain attached documents error', function () {
        result = {
          data: {
            InvalidProperties: [
              {
                PropertyName: 'OtherProperty',
                ValidationMessage: 'message with attached documents in it',
              },
              {
                PropertyName: 'DocumentGroupId',
                ValidationMessage: 'other message',
              },
            ],
          },
        };

        scope.deleteDocumentGroup(documentGroup);

        expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      });

      it('should call modalFactory.ConfirmModal when res.data.InvalidProperties contains attached documents error', function () {
        result = {
          data: {
            InvalidProperties: [
              {
                PropertyName: 'DocumentGroupId',
                ValidationMessage: 'message with attached documents in it',
              },
            ],
          },
        };

        scope.deleteDocumentGroup(documentGroup);

        expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
          'Attached Files',
          jasmine.any(String),
          'OK'
        );
      });
    });
  });

  describe('scope.documentGroupSaved function ->', function () {
    var group;
    beforeEach(function () {
      group = {};
    });

    it('should set scope.mode and call documentGroupsCallback', function () {
      scope.mode = '';

      scope.documentGroupSaved(group);

      expect(scope.mode).toBe('manageDocumentGroups');
      expect(documentGroupsCallback).toHaveBeenCalledWith(group);
    });

    describe('when action is create ->', function () {
      it('should add new documentGroup to scope.documentGroups', function () {
        scope.documentGroups = [];

        scope.documentGroupSaved(group, documentGroupsFactory.Actions.Create);

        expect(scope.documentGroups.length).toBe(1);
        expect(scope.documentGroups[0]).toBe(group);
      });
    });

    describe('when action is Update', function () {
      var id, description;
      beforeEach(function () {
        id = 'groupId';
        description = 'description';
        group.DocumentGroupId = id;
        group.Description = description;
      });

      it('should replace original in scope.documentGroups if id found', function () {
        scope.documentGroups = [{ DocumentGroupId: id, Description: 'old' }];

        scope.documentGroupSaved(group, documentGroupsFactory.Actions.Update);

        expect(scope.documentGroups.length).toBe(1);
        expect(scope.documentGroups[0]).toBe(group);
      });

      it('should not modify scope.documentGroups if id not found', function () {
        scope.documentGroups = [
          { DocumentGroupId: 'otherId', Description: 'otherDescription' },
        ];

        scope.documentGroupSaved(group, documentGroupsFactory.Actions.Update);

        expect(scope.documentGroups[0].DocumentGroupId).not.toBe(id);
      });
    });
  });

  describe('scope.cancel function ->', function () {
    it('should set scope.mode', function () {
      scope.mode = '';

      scope.cancel();

      expect(scope.mode).toBe('manageDocumentGroups');
    });
  });
});

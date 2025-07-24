describe('NoteTemplatesController ->', function () {
  //#region mockTemplate

  var mockTemplate1 = {
    Template: {
      TemplateId: null,
      TemplateName: 'Breakfast',
      CategoryId: '8866f327-3b34-4323-9b54-568044b5bdbe',
      TemplateBodyFormId: null,
    },
    TemplateBodyCustomForm: {
      FormId: '00000000-0000-0000-0000-000000000000',
      VersionNumber: 1,
      SourceFormId: '00000000-0000-0000-0000-000000000000',
      FormName: 'Breakfast_880510_CNT',
      Description: '',
      IsActive: true,
      IsVisible: true,
      IsPublished: false,
      IsDefault: false,
      FormSections: [
        {
          FormSectionId: '00000000-0000-0000-0000-000000000000',
          Title: 'SS2',
          FormId: '00000000-0000-0000-0000-000000000000',
          SequenceNumber: -1,
          ShowTitle: true,
          ShowBorder: true,
          IsVisible: true,
          FormSectionItems: [
            {
              FormSectionId: '00000000-0000-0000-0000-000000000000',
              SectionItemId: -1,
              BankItemId: null,
              FormBankItem: null,
              IsRequired: false,
              MultiSelectAllow: false,
              IsVisible: true,
              SequenceNumber: 1,
              BankItemDemographicId: null,
              FormBankItemDemographic: null,
              BankItemEmergencyContactId: null,
              FormBankItemEmergencyContact: {},
              ItemOptions: [],
              FormItemTypeName: 'Ad-Lib',
              FormItemType: 9,
              FormBankItemPromptTexts: [
                {
                  Answer: null,
                  ItemText: 'i like eggs',
                  FormItemTypeName: '',
                  Description: '',
                  CommonlyUsed: '',
                  IsVisible: true,
                  UseDefaultValue: false,
                  DefaultValue: '',
                  ItemSequenceNumber: 1,
                },
                {
                  Answer: null,
                  ItemText: 'w bacon',
                  FormItemTypeName: '',
                  Description: '',
                  CommonlyUsed: '',
                  IsVisible: true,
                  UseDefaultValue: false,
                  DefaultValue: '',
                  ItemSequenceNumber: 2,
                },
              ],
              ItemPromptTextsOptions: [
                [
                  {
                    SectionItemId: '00000000-0000-0000-0000-000000000000',
                    SectionItemOptionId: '00000000-0000-0000-0000-000000000000',
                    BankItemId: '00000000-0000-0000-0000-000000000000',
                    BankItemOptionId: '00000000-0000-0000-0000-000000000000',
                    BankItemOption: {
                      BankItemOptionId: '00000000-0000-0000-0000-000000000000',
                      OptionIndex: 1,
                      OptionText: 'over easy',
                      OptionValue: '',
                      IsSelected: '',
                      IsVisible: '',
                      SequenceNumber: 1,
                    },
                    IsSelected: true,
                    IsVisible: true,
                    SequenceNumber: 1,
                  },
                  {
                    SectionItemId: '00000000-0000-0000-0000-000000000000',
                    SectionItemOptionId: '00000000-0000-0000-0000-000000000000',
                    BankItemId: '00000000-0000-0000-0000-000000000000',
                    BankItemOptionId: '00000000-0000-0000-0000-000000000000',
                    BankItemOption: {
                      BankItemOptionId: '00000000-0000-0000-0000-000000000000',
                      OptionIndex: 2,
                      OptionText: 'over medium',
                      OptionValue: '',
                      IsSelected: '',
                      IsVisible: '',
                      SequenceNumber: 1,
                    },
                    IsSelected: true,
                    IsVisible: true,
                    SequenceNumber: 1,
                  },
                  {
                    SectionItemId: '00000000-0000-0000-0000-000000000000',
                    SectionItemOptionId: '00000000-0000-0000-0000-000000000000',
                    BankItemId: '00000000-0000-0000-0000-000000000000',
                    BankItemOptionId: '00000000-0000-0000-0000-000000000000',
                    BankItemOption: {
                      BankItemOptionId: '00000000-0000-0000-0000-000000000000',
                      OptionIndex: 3,
                      OptionText: 'over well',
                      OptionValue: '',
                      IsSelected: '',
                      IsVisible: '',
                      SequenceNumber: 1,
                    },
                    IsSelected: true,
                    IsVisible: true,
                    SequenceNumber: 1,
                  },
                ],
              ],
            },
          ],
        },
      ],
      IndexOfSectionInEditMode: 0,
      SectionValidationFlag: false,
      SectionCopyValidationFlag: -1,
      TemplateMode: 1,
    },
  };
  //#endregion

  var scope,
    ctrl,
    noteTemplatesHttpService,
    modal,
    modalInstance,
    modalFactory,
    modalFactoryDeferred,
    q,
    toastrFactory;

  var mockCategories = [
    {
      CategoryId: 1,
      CategoryName: 'Cat 1',
    },
    { CategoryId: 2, CategoryName: 'Cat 3' },
    {
      CategoryId: 3,
      CategoryName: 'Cat 5',
    },
    {
      CategoryId: 4,
      CategoryName: 'Cat 2',
    },
    {
      CategoryId: 5,
      CategoryName: 'Cat 4',
    },
  ];

  var mockCategory = {
    CategoryId: 1,
    CategoryName: 'New Category',
  };

  var mockNoteTemplate = {
    CategoryId: 1,
    TemplateId: 2,
    TemplateBody: 'Some Text',
  };

  var mockTemplate = {
    Template: {
      CategoryId: '3d8bec8a-0eb7-44b2-9628-ac175eecb9f3',
      DateModified: '2016-02-29T15:48:39.2312878Z',
      TemplateBody: '<p>gsdfgsdf</p><p>fbf</p>',
      TemplateId: 'b6c5193a-4394-4a69-8bd9-8c4e713f3277',
      TemplateName: '',
    },
    TemplateBodyCustomForm: {
      FormSections: [],
    },
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      noteTemplatesHttpService = {
        ActiveTemplateCategory: jasmine.createSpy().and.returnValue({}),
        ActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        SetActiveNoteTemplate: jasmine
          .createSpy()
          .and.callFake(function (temp) {
            this.ActiveNoteTemplate = temp;
          }),
        SetActiveTemplateCategory: jasmine
          .createSpy()
          .and.callFake(function (category) {
            this.ActiveTemplateCategory = category;
          }),
        SetCurrentOperation: jasmine.createSpy().and.callFake(function (temp) {
          this.CurrentOperation = temp;
        }),
        validateTemplate: jasmine.createSpy().and.returnValue({}),
        saveNoteTemplates: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        saveNoteTemplateForms: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        createNoteTemplate: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ValidateTemplateBodyCustomForm: jasmine.createSpy().and.returnValue({}),
        SetItemOptions: jasmine.createSpy().and.returnValue({}),
        updateNoteTemplateForm: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('NoteTemplatesHttpService', noteTemplatesHttpService);
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $location) {
    scope = $rootScope.$new();
    scope.template = angular.copy(mockNoteTemplate);
    modalFactory = {
      ConfirmLockModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
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
    ctrl = $controller('NoteTemplatesController', {
      $scope: scope,
      ModalFactory: modalFactory,
      NoteTemplatesHttpService: noteTemplatesHttpService,
      Editor: jasmine.createSpy().and.callFake(function () {}),
    });

    scope.authAccess = {
      create: true,
      delete: true,
      update: true,
      view: true,
    };
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('active category should be empty', function () {
      expect(scope.activeCategory).toBe(undefined);
    });

    it('Template ellipsis should be disabled', function () {
      expect(scope.editMode).toBe(false);
    });

    it('Template editor should be hidden', function () {
      expect(scope.existingTemplateActive).toBe(false);
    });

    it('selectedTemplate should be empty', function () {
      expect(scope.selectedTemplate).toBe(undefined);
    });
  });

  describe('activeTemplate watch  -> ', function () {
    it('should set selectedTemplate and activeTemplate', function () {
      noteTemplatesHttpService.SetActiveNoteTemplate({
        CategoryId: 1,
        TemplateId: 2,
        TemplateBody: 'Some Text',
      });
      expect(noteTemplatesHttpService.SetActiveNoteTemplate).toHaveBeenCalled();
      scope.$digest();
      expect(scope.existingTemplateActive).toBe(true);
      expect(scope.selectedTemplate).toEqual(scope.template);
      expect(scope.editMode).toBe(false);
    });

    it(' should set selectedTemplate to null when activeTemplate is null ', function () {
      noteTemplatesHttpService.SetActiveNoteTemplate({
        CategoryId: null,
        TemplateId: null,
        TemplateBody: '',
      });
      expect(noteTemplatesHttpService.SetActiveNoteTemplate).toHaveBeenCalled();
      scope.$digest();
      expect(scope.selectedTemplate).toEqual({
        CategoryId: null,
        TemplateId: null,
        TemplateBody: '',
      });
      expect(scope.editMode).toBe(false);
    });
  });

  describe('Save Template function when editing -> ', function () {
    beforeEach(function () {
      scope.selectedTemplate = angular.copy(mockTemplate1);
      scope.selectedTemplate.Template.TemplateId = '123';
      noteTemplatesHttpService.CurrentOperation = 'edit';
    });

    it('should not call save if isValidCustomFormCheck returns false if editing template ', function () {
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(false);
      spyOn(ctrl, 'updateTemplateForm');
      scope.saveTemplate();
      expect(ctrl.updateTemplateForm).not.toHaveBeenCalled();
      expect(scope.isSaving).toBe(true);
    });

    it('should call ctrl.updateTemplateForm if isValidCustomFormCheck returns true', function () {
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(true);
      spyOn(ctrl, 'updateTemplateForm');
      scope.saveTemplate();
      expect(ctrl.updateTemplateForm).toHaveBeenCalled();
      expect(noteTemplatesHttpService.CurrentOperation).toBe('');
      expect(scope.isSaving).toBe(true);
    });

    it('should not call ctrl.updateTemplateForm if scope.isSaving is true', function () {
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(true);
      scope.isSaving = true;
      spyOn(ctrl, 'updateTemplateForm');
      scope.saveTemplate();
      expect(ctrl.updateTemplateForm).not.toHaveBeenCalled();
      expect(noteTemplatesHttpService.CurrentOperation).toBe('edit');
    });
  });

  describe('Save Template function when creating new template -> ', function () {
    beforeEach(function () {
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.selectedTemplate = angular.copy(mockTemplate1);
      scope.selectedTemplate.Template.TemplateId = null;
      scope.authAccess.create = true;
    });

    it('should not call noteTemplatesHttpService.createNoteTemplate if isValidCustomFormCheck returns false', function () {
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(false);
      spyOn(ctrl, 'updateTemplateForm');
      scope.saveTemplate();
      expect(
        noteTemplatesHttpService.createNoteTemplate
      ).not.toHaveBeenCalled();
      expect(scope.isSaving).toBe(true);
    });

    it('should call noteTemplatesHttpService.createNoteTemplate if isValidCustomFormCheck returns true', function () {
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(true);
      spyOn(ctrl, 'updateTemplateForm');
      scope.saveTemplate();
      expect(noteTemplatesHttpService.createNoteTemplate).toHaveBeenCalled();
      expect(scope.isSaving).toBe(true);
    });

    it('should call noteTemplatesHttpService.createNoteTemplate if isValidCustomFormCheck returns true', function () {
      scope.isSaving = true;
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(true);
      spyOn(ctrl, 'updateTemplateForm');
      scope.saveTemplate();
      expect(
        noteTemplatesHttpService.createNoteTemplate
      ).not.toHaveBeenCalled();
      expect(scope.isSaving).toBe(true);
    });
  });

  describe('Save Template function when copying  template -> ', function () {
    beforeEach(function () {
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.selectedTemplate = angular.copy(mockTemplate1);
      scope.selectedTemplate.Template.TemplateId = null;
      noteTemplatesHttpService.CurrentOperation = 'copy';
    });
    it('should call ctrl.copyData if noteTemplatesHttpService.CurrentOperation is copy', function () {
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(true);
      scope.saveTemplate();
      spyOn(ctrl, 'copyData');
      expect(noteTemplatesHttpService.createNoteTemplate).toHaveBeenCalled();
      expect(noteTemplatesHttpService.CurrentOperation).toBe('');
      expect(scope.isSaving).toBe(true);
    });

    it('should call ctrl.copyData if noteTemplatesHttpService.CurrentOperation is copy', function () {
      scope.isSaving = true;
      spyOn(scope, 'isValidCustomFormCheck').and.returnValue(true);
      scope.saveTemplate();
      spyOn(ctrl, 'copyData');
      expect(
        noteTemplatesHttpService.createNoteTemplate
      ).not.toHaveBeenCalled();
      expect(noteTemplatesHttpService.CurrentOperation).toBe('copy');
      expect(scope.isSaving).toBe(true);
    });
  });
  describe('ctrl.copyData -> ', function () {
    var templateMock = {
      Template: {
        CategoryId: '77026b51-05f2-49cb-b49f-9d3c19b49e9c',
        TemplateBodyFormId: '24027f50-ae0e-4c30-b640-82e48f98028e',
        TemplateId: '80ca273f-0fd7-4078-a95b-516e48852760',
      },
      TemplateBodyCustomForm: {
        FormId: '24027f50-ae0e-4c30-b640-82e48f98028e',
        FormSections: [
          {
            FormId: '24027f50-ae0e-4c30-b640-82e48f98028e',
            FormSectionId: '744df1ba-3c88-4ae9-8c92-627fc9c1d26c',
            FormSectionItems: [
              {
                BankItemId: null,
                FormBankItem: null,
                FormItemType: 11,
                FormSectionId: '744df1ba-3c88-4ae9-8c92-627fc9c1d26c',
                SectionItemId: '9674dfbd-ddd4-47ec-b2b8-f68d52d27306',
                SequenceNumber: 1,
                UserModified: '6627795b-5c98-e911-87fa',
              },
            ],
          },
        ],
        FormTypeId: 2,
      },
    };
    var templateMock1 = {
      Template: {
        CategoryId: '77026b51-05f2-49cb-b49f-9d3c19b49e9c',
        TemplateBodyFormId: null,
        TemplateId: null,
      },
      TemplateBodyCustomForm: {
        Description: '',
        FormId: '00000000-0000-0000-0000-000000000000',
        FormSections: [
          {
            FormId: '00000000-0000-0000-0000-000000000000',
            FormSectionId: '00000000-0000-0000-0000-000000000000',
            FormSectionItems: [
              {
                BankItemId: null,
                FormBankItem: null,
                FormItemType: 11,
                FormSectionId: '00000000-0000-0000-0000-000000000000',
                SectionItemId: '00000000-0000-0000-0000-000000000000',
                UserModified: '6627795b-5c98-e911-87fa',
              },
            ],
          },
        ],
        FormTypeId: 2,
      },
    };
    it('should replace the data ', function () {
      var formSection = templateMock.TemplateBodyCustomForm.FormSections;
      var formSection1 = templateMock1.TemplateBodyCustomForm.FormSections;
      spyOn(ctrl, 'copyData');
      ctrl.copyData();
      expect(formSection.FormId).toBe(formSection1.FormId);
      expect(formSection.FormSectionId).toBe(formSection1.FormSectionId);
      expect(formSection[0].FormSectionItems.FormSectionId).toBe(
        formSection1[0].FormSectionItems.FormSectionId
      );
      expect(formSection[0].FormSectionItems.SectionItemId).toBe(
        formSection1[0].FormSectionItems.SectionItemId
      );
      expect(formSection[0].FormSectionItems.BankItemId).toBe(
        formSection1[0].FormSectionItems.BankItemId
      );
      expect(formSection[0].FormSectionItems.FormBankItem).toBe(
        formSection1[0].FormSectionItems.FormBankItem
      );
    });

    it('should replace the BankItemId with null if FormItemType is 11 or 9 ', function () {
      var formSection =
        templateMock.TemplateBodyCustomForm.FormSections[0].FormSectionItems;
      spyOn(ctrl, 'copyData');
      ctrl.copyData();
      expect(formSection[0].BankItemId).toBe(null);
    });
  });

  describe('isValidCustomFormCheck function  -> ', function () {
    beforeEach(function () {
      scope.selectedTemplate = angular.copy(mockTemplate1);
    });

    it('should call noteTemplatesHttpService.ValidateTemplateBodyCustomForm', function () {
      scope.isValidCustomFormCheck(false);
      expect(
        noteTemplatesHttpService.ValidateTemplateBodyCustomForm
      ).toHaveBeenCalled();
    });

    it('should call noteTemplatesHttpService.SetItemOptions if cleanupOptions parameter is true', function () {
      scope.isValidCustomFormCheck(true);
      expect(noteTemplatesHttpService.SetItemOptions).toHaveBeenCalled();
    });

    it('should not call noteTemplatesHttpService.SetItemOptions if cleanupOptions parameter is false', function () {
      scope.isValidCustomFormCheck(false);
      expect(noteTemplatesHttpService.SetItemOptions).not.toHaveBeenCalled();
    });
  });
  describe(' ctrl.getTemplateFormById function  ->  ', function () {
    beforeEach(function () {
      noteTemplatesHttpService.CurrentOperation = 'copy';
    });
    it('it should set TemplateId to Null if current operation is copy', function () {
      spyOn(ctrl, 'getTemplateFormById').and.callFake(function () {});
      ctrl.getTemplateFormById();
      scope.selectedTemplateBackup = {
        Template: {
          TemplateId: '9d5668d1-8e25-4e9e-a9d3-3410c3570a40',
        },
      };
      expect(scope.selectedTemplateBackup.Template.TemplateId).toBeNull;
    });

    it('it should not set TemplateId to Null if current operation is edit', function () {
      noteTemplatesHttpService.CurrentOperation = 'edit';
      scope.selectedTemplateBackup = {
        Template: {
          TemplateId: '9d5668d1-8e25-4e9e-a9d3-3410c3570a40',
        },
      };
      expect(scope.selectedTemplateBackup.Template.TemplateId).toBe(
        '9d5668d1-8e25-4e9e-a9d3-3410c3570a40'
      );
    });
    it('it should  set CatogeryId to Null ', function () {
      scope.selectedTemplate = {
        Template: {
          CategoryId: '9d5668d1-8e25-4e9e-a9d3-3410c3570a40',
        },
      };
      spyOn(ctrl, 'getTemplateFormById').and.callFake(function () {});
      ctrl.getTemplateFormById();
      scope.selectedTemplateCategoryId =
        scope.selectedTemplate.Template.CategoryId;
      scope.selectedTemplate.Template.CategoryId = null;
      expect(scope.selectedTemplateCategoryId).toBe(
        '9d5668d1-8e25-4e9e-a9d3-3410c3570a40'
      );
      expect(scope.selectedTemplate.Template.CategoryId).toBe(null);
    });
  });
  describe('scope.hasChanges function  -> ', function () {
    var TemplateChanged = false;

    beforeEach(function () {
      scope.selectedTemplate = {
        Template: {
          $$CategoryName: 'NOt Null',
          CategoryId: 'ecce5ff6-5edb-4c1d-a02a-9680a1695a27',
          DataTag: 'AAAAAAABvL8=',
          DateModified: '2019-08-05T20:31:21.3032038',
          TemplateBodyFormId: '14dc4a7c-a78b-447d-a2e4-1df82dfc9632',
          TemplateId: '9d5668d1-8e25-4e9e-a9d3-3410c3570a40',
          TemplateName: '112',
          UserModified: '6627795b-5c98-e911-87fa-4851b7bfd307',
        },
      };
      scope.selectedTemplateBackup = {
        Template: {
          $$CategoryName: 'NOt Null',
          CategoryId: 'ecce5ff6-5edb-4c1d-a02a-9680a1695a27',
          DataTag: 'AAAAAAABvL8=',
          DateModified: '2019-08-05T20:31:21.3032038',
          TemplateBodyFormId: '14dc4a7c-a78b-447d-a2e4-1df82dfc9632',
          TemplateId: null,
          TemplateName: '112',
          UserModified: '6627795b-5c98-e911-87fa-4851b7bfd307',
        },
      };
    });
    it('it should return true when TemplateId is different', function () {
      if (
        scope.selectedTemplateBackup.Template.TemplateId !==
        scope.selectedTemplate.Template.TemplateId
      ) {
        TemplateChanged = true;
      }
      expect(TemplateChanged).toBe(true);
    });
  });
});

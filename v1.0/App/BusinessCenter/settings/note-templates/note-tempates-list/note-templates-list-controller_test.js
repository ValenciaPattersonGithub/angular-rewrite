describe('NoteTemplatesListController ->', function () {
  var scope,
    ctrl,
    noteTemplatesHttpService,
    modalFactory,
    modalFactoryDeferred,
    q,
    toastrFactory,
    localize;

  var mockCategory = { CategoryName: 'Cat3', CategoryId: 4 };

  var mockCategories = [
    {
      CategoryName: 'Cat1',
      CategoryId: 1,
      addingNewTemplate: false,
      ntExpand: true,
    },
    {
      CategoryName: 'Cat2',
      CategoryId: 2,
      addingNewTemplate: false,
      ntExpand: true,
    },
    {
      CategoryName: 'Cat3',
      CategoryId: 3,
      addingNewTemplate: false,
      ntExpand: true,
    },
    {
      CategoryName: 'Cat3',
      CategoryId: 4,
      addingNewTemplate: false,
      ntExpand: true,
    },
  ];

  var mockNoteTemplates = [
    { TemplateName: 'Temp 1', CategoryId: 1, TemplateId: 1 },
    { TemplateName: 'Temp 2', CategoryId: 1, TemplateId: 2 },
    { TemplateName: 'Temp 3', CategoryId: 3, TemplateId: 3 },
  ];

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      noteTemplatesHttpService = {
        $scope: scope,
        ActiveTemplateCategory: jasmine.createSpy().and.returnValue({}),
        ActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
        access: jasmine
          .createSpy()
          .and.returnValue({ view: true, create: true, update: true }),
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
        setTemplateDataChanged: jasmine.createSpy().and.returnValue({}),
        ShowTemplateHeader: jasmine.createSpy().and.returnValue({}),
        CloseTemplateHeader: jasmine.createSpy().and.returnValue({}),
        validateTemplate: jasmine.createSpy().and.returnValue({}),
        saveNoteTemplates: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        saveCategory: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        observeTemplates: jasmine.createSpy().and.returnValue({}),
        observeCategories: jasmine.createSpy().and.returnValue({}),
        categories: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            return callback(mockCategories);
          },
        }),
        CategoriesWithTemplates: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getTemplates: jasmine.createSpy().and.returnValue({
          then: function (callback) {
            callback = {
              Value: [
                { TemplateName: 'Temp 1', CategoryId: 1, TemplateId: 1 },
                { TemplateName: 'Temp 2', CategoryId: 1, TemplateId: 2 },
              ],
            };
            scope.noteTemplates = scope.noteTemplates.concat(callback.Value);
            return callback;
          },
        }),
        ExpandOrCollapseCategory: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      $provide.value('NoteTemplatesHttpService', noteTemplatesHttpService);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
      localize = {
        getLocalizedString: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('localize', localize);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $location,
    $q
  ) {
    q = $q;
    scope = $rootScope.$new();
    scope.noteCategories = mockCategories;
    scope.noteTemplates = mockNoteTemplates;
    modalFactory = {
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
    ctrl = $controller('NoteTemplatesListController', {
      $scope: scope,
      ModalFactory: modalFactory,
      NoteTemplatesHttpService: noteTemplatesHttpService,
    });
    ctrl.$onInit();
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('active category should be empty', function () {
      expect(scope.activeCategory).toBe(undefined);
    });
    it('selectedTemplate should be empty', function () {
      expect(scope.selectedTemplate).toBe(undefined);
    });
  });

  describe('delete category -> ', function () {
    it('opens confirmation popup and delete the category after confirm', function () {
      scope.editMode = false;
      mockCategory.$$Loaded = true;
      scope.deleteCategory(mockCategory);
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
    });
  });

  describe('get categories', function () {
    it('check if all the categories are retrieved', function () {
      ctrl.getNoteTemplateCategories();
      expect(noteTemplatesHttpService.categories).toHaveBeenCalled();
      expect(scope.loadingCategories).toBeFalsy();
    });
  });

  describe('get noteTemplates', function () {
    it('check if all the templates are retrieved', function () {
      scope.getNoteTemplatesForCategory({ CategoryId: 1, $$Loaded: false });
      expect(noteTemplatesHttpService.getTemplates).toHaveBeenCalledWith(1);
      expect(scope.noteTemplates).toEqual([
        { TemplateName: 'Temp 1', CategoryId: 1, TemplateId: 1 },
        { TemplateName: 'Temp 2', CategoryId: 1, TemplateId: 2 },
      ]);
    });
  });

  describe('Add noteTemplates', function () {
    it('check if the category in which template is to be added is active', function () {
      scope.editMode = false;
      scope.existingTemplateActive = true;
      scope.addTemplate();
      expect(noteTemplatesHttpService.SetActiveNoteTemplate).toHaveBeenCalled();
      expect(scope.editMode).toBe(true);
      expect(scope.existingTemplateActive).toBe(false);
    });

    it(' check if the new Template is selected', function () {
      scope.addTemplate(mockCategories[0]);
      expect(scope.selectedTemplate).toEqual({
        Template: Object({
          TemplateId: null,
          TemplateName: '',
          CategoryId: null,
          TemplateBodyFormId: null,
        }),
        TemplateBodyCustomForm: Object({
          FormId: '00000000-0000-0000-0000-000000000000',
          VersionNumber: 1,
          SourceFormId: '00000000-0000-0000-0000-000000000000',
          FormName: null,
          Description: '',
          IsActive: true,
          IsVisible: true,
          IsPublished: false,
          IsDefault: false,
          FormSections: [],
          IndexOfSectionInEditMode: -1,
          SectionValidationFlag: false,
          SectionCopyValidationFlag: -1,
          TemplateMode: 1,
        }),
      });
    });
  });

  describe('scope.editNoteTemplate', function () {
    beforeEach(function () {
      scope.editMode === false;
      scope.existingTemplateActive = false;
    });
    it('it should set existingTemplateActive to true', function () {
      spyOn(scope, 'loadNoteTemplate').and.callFake(function () {});
      scope.editNoteTemplate();
      expect(scope.existingTemplateActive).toBeTruthy;
    });
  });

  describe('load NoteTemplates ', function () {
    it('check if the selected template is loaded', function () {
      scope.activeCategory = mockCategories[0];
      scope.activeCategory.addingNewTemplate = true;
      noteTemplatesHttpService.SetActiveTemplateCategory(mockCategories[0]);
      scope.$digest();
      scope.loadNoteTemplate(mockNoteTemplates[0]);
      expect(scope.selectedTemplate).toEqual({
        Template: Object({
          TemplateName: 'Temp 1',
          CategoryId: 1,
          TemplateId: 1,
        }),
      });
      expect(noteTemplatesHttpService.CloseTemplateHeader).toHaveBeenCalled();
      expect(noteTemplatesHttpService.SetCurrentOperation).toHaveBeenCalled();
    });
  });

  describe('toggle add category', function () {
    it('check if add category is toggling', function () {
      scope.isAddCategory = true;
      scope.addCategory();
      noteTemplatesHttpService.access();
      expect(scope.isAddCategory).toBeTruthy();

      scope.isAddCategory = false;
      scope.addCategory();
      noteTemplatesHttpService.access();
      expect(scope.isAddCategory).toBeFalsy();
    });
  });

  describe('Validate and Save for adding note category', function () {
    it(' should check if the Category name field is empty ', function () {
      scope.newCategoryName = '';
      scope.addCategory();
      noteTemplatesHttpService.access();
      expect(scope.duplicateNoteCategory).toBeFalsy();
      expect(scope.formIsValid).toBeFalsy();
    });

    it(' should check if the Category name field exists already ', function () {
      scope.NewCategory.newCategoryName = 'Cat1';
      scope.noteCategories = mockCategories;
      scope.addCategory();
      noteTemplatesHttpService.access();
      expect(scope.duplicateNoteCategory).toBeTruthy();
    });

    it(' should Save if the Category name field is not empty and do not exist  ', function () {
      scope.NewCategory.newCategoryName = 'Cat1';
      scope.noteCategories = mockCategories;
      scope.isAddCategory = true;
      scope.addCategory();
      noteTemplatesHttpService.access();
      expect(scope.isAddCategory).toBeTruthy();
      noteTemplatesHttpService.saveCategory({
        CategoryName: scope.NewCategory.newCategoryName,
      });
      expect(scope.NewCategory.newCategoryName).toEqual('Cat1');
    });
  });

  describe('Expands the selected category and collapse the rest ', function () {
    it(' should check if the selected category is expanded', function () {
      scope.expandCategory(mockCategories[1]);
      expect(
        noteTemplatesHttpService.ExpandOrCollapseCategory
      ).toHaveBeenCalledWith(mockCategories[1]);
    });

    it(' should should collapse rest of the categories', function () {
      scope.noteCategories = mockCategories;
      expect(mockCategories[1].ntExpand).toBeTruthy();
      ctrl.collapseAll(mockCategories[0]);
      expect(mockCategories[1].ntExpand).toBeFalsy();
    });
  });

  describe('click handler for Rename Category ', function () {
    it('if a user has unsaved changes in the inline edit field, resetting the name to the original', function () {
      scope.toggleCategoryEdit(mockCategories[0]);
      expect(mockCategories[0].duplicateNoteCategory).toBeFalsy();
      mockCategories[0].categoryNameBackup = 'Cat1';
      scope.toggleCategoryEdit({
        CategoryName: '',
        CategoryId: 1,
        addingNewTemplate: false,
        ntExpand: true,
        categoryNameBackup: 'Cat1',
      });
      expect(mockCategories[0].CategoryName).toEqual(
        mockCategories[0].categoryNameBackup
      );
    });
  });

  describe(' update note category ', function () {
    it('should check the duplicate name when updating', function () {
      scope.noteCategories = mockCategories;
      scope.updateCategory(mockCategories[0]);
      expect(mockCategories[0].duplicateNoteCategory).toBeFalsy();
      // check if duplicateNoteCategory becomes true if duplicate value is updating.
      mockCategories[0].CategoryName = 'Cat2';
      scope.updateCategory(mockCategories[0]);
      expect(mockCategories[0].duplicateNoteCategory).toBeTruthy();
    });

    it('should make the update call if the name was updated', function () {
      scope.noteCategories = mockCategories;
      scope.updateCategory({
        CategoryName: 'Cat0',
        CategoryId: 1,
        addingNewTemplate: false,
        ntExpand: true,
        editing: true,
        categoryNameBackup: '',
      });
      expect(noteTemplatesHttpService.saveCategory).toHaveBeenCalledWith({
        CategoryName: 'Cat0',
        CategoryId: 1,
        addingNewTemplate: false,
        ntExpand: true,
        editing: true,
        categoryNameBackup: '',
        duplicateNoteCategory: false,
      });
      expect(noteTemplatesHttpService.observeCategories).toHaveBeenCalled();
    });
  });

  describe('ctrl.loadCategoriesAndTemplates method ', function () {
    var categories = [];
    beforeEach(function () {
      scope.noteTemplates = [];
      categories = [
        { CategoryName: 'Category 1', Templates: [{}, {}] },
        { CategoryName: 'Category 2', Templates: [{}, {}] },
        { CategoryName: 'Category 3', Templates: [{}] },
      ];
    });

    it('it should add categories to ctrl.noteCategories if category.$$Loaded equals false', function () {
      scope.noteCategories = [];
      ctrl.loadCategoriesAndTemplates(categories);
      expect(scope.noteCategories.length).toEqual(3);
      scope.noteCategories = [];
      scope.noteTemplates = [];
    });

    it('it should add categories to scope.noteCategories', function () {
      ctrl.loadCategoriesAndTemplates(categories);
      expect(scope.noteCategories.length).toEqual(3);
    });

    it('it should add templates to ctrl.noteTemplates', function () {
      ctrl.loadCategoriesAndTemplates(categories);
      expect(scope.noteTemplates.length).toEqual(5);
    });

    it('it should call ctrl.updateCategoryVisibleFlags(true) to set $$Visible ', function () {
      spyOn(ctrl, 'updateCategoryVisibleFlags').and.returnValue(true);
      ctrl.loadCategoriesAndTemplates(categories);
      expect(ctrl.updateCategoryVisibleFlags).toHaveBeenCalledWith(true);
    });

    it('it should create a backup of noteTemplates ', function () {
      ctrl.loadCategoriesAndTemplates(categories);
      expect(ctrl.noteTemplatesBackup).toEqual(scope.noteTemplates);
      expect(scope.loadingCategories).toEqual(false);
      expect(scope.loadingTemplates).toEqual(false);
    });

    it('it should add CategoryName to template if loading', function () {
      ctrl.loadCategoriesAndTemplates(categories);
      expect(scope.noteTemplates[0].$$CategoryName).toEqual(
        categories[0].CategoryName
      );
      expect(scope.noteTemplates[1].$$CategoryName).toEqual(
        categories[0].CategoryName
      );
      expect(scope.noteTemplates[2].$$CategoryName).toEqual(
        categories[1].CategoryName
      );
      expect(scope.noteTemplates[3].$$CategoryName).toEqual(
        categories[1].CategoryName
      );
    });
  });

  describe('getTemplateCategoriesWithTemplates method ', function () {
    it('it should call noteTemplatesHttpService.CategoriesWithTemplates', function () {
      ctrl.getTemplateCategoriesWithTemplates();
      expect(
        noteTemplatesHttpService.CategoriesWithTemplates
      ).toHaveBeenCalled();
    });
  });

  describe('$init method ', function () {
    it('it should call ctrl.getTemplateCategoriesWithTemplates', function () {
      ctrl.$onInit();
      expect(
        noteTemplatesHttpService.CategoriesWithTemplates
      ).toHaveBeenCalled();
    });
  });

  describe('scope.copyNoteTemplete', function () {
    beforeEach(function () {
      scope.editMode === false;
      scope.existingTemplateActive = false;
    });
    it('it should set existingTemplateActive to true', function () {
      spyOn(scope, 'loadNoteTemplate').and.callFake(function () {});
      scope.copyNoteTemplete();
      expect(scope.existingTemplateActive).toBeTruthy;
      toastrFactory.success(
        localize.getLocalizedString('Template Copied'),
        localize.getLocalizedString('Success')
      );
    });
  });
});

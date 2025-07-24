describe('Controller: CustomFormsController', function () {
  var ctrl,
    scope,
    customFormsService,
    uniqueCustomFormNameService,
    toastrFactory,
    modalInstance,
    localize,
    element,
    timeout,
    animate;
  var mockModalOpenObject, customFormsPublishService, customFormsFactory;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    mockModalOpenObject = {
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    modalInstance = {
      // Create a mock object using spies
      open: jasmine
        .createSpy('modalInstance.open')
        .and.returnValue(mockModalOpenObject),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };
    customFormsService = {
      update: jasmine.createSpy().and.returnValue(''),
      getFormsByPublishedStatus: jasmine.createSpy().and.returnValue(''),
      getFormById: jasmine.createSpy().and.returnValue(''),
      create: jasmine.createSpy().and.returnValue(''),
      activeOrInactiveFormById: jasmine.createSpy().and.returnValue(''),
      deleteFormById: jasmine.createSpy().and.returnValue(''),
    };

    customFormsPublishService = {
      publishFormById: jasmine.createSpy().and.returnValue(''),
    };

    uniqueCustomFormNameService = {
      checkUniqueFormName: jasmine.createSpy().and.returnValue(''),
    };

    customFormsFactory = {
      LoadFormItemTypeNames: jasmine.createSpy(),
      ValidateForm: jasmine.createSpy().and.returnValue(true),
    };

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    ctrl = $controller('CustomFormsController', {
      $scope: scope,
      CustomFormsService: customFormsService,
      UniqueCustomFormNameService: uniqueCustomFormNameService,
      toastrFactory: toastrFactory,
      $uibModal: modalInstance,
      CustomFormsPublishService: customFormsPublishService,
      CustomFormsFactory: customFormsFactory,
    });
    animate = $injector.get('$animate');
    timeout = $injector.get('$timeout');

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    element = {
      focus: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);
  }));

  //controller
  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();

    scope.customForm = [{ Id: 1 }];
    scope.customFormActual = [{ Id: -1 }];

    scope.$watch('customForm', function (newValue) {
      scope.dataHasChanged = angular.equals(
        scope.customForm,
        scope.customFormActual
      );
    });
    scope.$digest();
    expect(scope.dataHasChanged).toBe(false);

    spyOn(animate, 'enabled');

    scope.customForm = { FormSections: [] };
    scope.$watchCollection(
      'customForm.FormSections.length',
      function (newLength, oldLength) {
        if (newLength == 1 && oldLength == 0) {
          animate.enabled(false);
        } else {
          animate.enabled(true);
        }
      }
    );
    scope.$digest();
    expect(animate.enabled).toHaveBeenCalledWith(true);

    scope.customForm = { FormSections: [{ Id: 1 }] };
    scope.$digest();
    expect(animate.enabled).toHaveBeenCalledWith(false);
  });

  //toastrFactory
  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  //initializeForm
  it('initialize form should initialize a custom form object with default values which is not null / is not undefined', function () {
    scope.customForm = null;
    scope.initializeForm();
    expect(scope.customForm).not.toBe(null);
    expect(scope.customForm).not.toBeUndefined();

    //FormId
    expect(scope.customForm.FormId).not.toBe(null);
    expect(scope.customForm.FormId).not.toBeUndefined();
    expect(scope.customForm.FormId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //Version Number
    expect(scope.customForm.VersionNumber).not.toBe(null);
    expect(scope.customForm.VersionNumber).not.toBeUndefined();
    expect(scope.customForm.VersionNumber).toEqual(1);

    //SourceFormId
    expect(scope.customForm.SourceFormId).not.toBe(null);
    expect(scope.customForm.SourceFormId).not.toBeUndefined();
    expect(scope.customForm.SourceFormId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //FormName
    expect(scope.customForm.FormName).not.toBe(null);
    expect(scope.customForm.FormName).not.toBeUndefined();
    expect(scope.customForm.FormName).toEqual('');

    //Description
    expect(scope.customForm.Description).not.toBe(null);
    expect(scope.customForm.Description).not.toBeUndefined();
    expect(scope.customForm.Description).toEqual('');

    //IsActive
    expect(scope.customForm.IsActive).not.toBe(null);
    expect(scope.customForm.IsActive).not.toBeUndefined();
    expect(scope.customForm.IsActive).toEqual(true);

    //IsVisible
    expect(scope.customForm.IsVisible).not.toBe(null);
    expect(scope.customForm.IsVisible).not.toBeUndefined();
    expect(scope.customForm.IsVisible).toEqual(true);

    //IsPublished
    expect(scope.customForm.IsPublished).not.toBe(null);
    expect(scope.customForm.IsPublished).not.toBeUndefined();
    expect(scope.customForm.IsPublished).toEqual(false);

    //IsDefault
    expect(scope.customForm.IsDefault).not.toBe(null);
    expect(scope.customForm.IsDefault).not.toBeUndefined();
    expect(scope.customForm.IsDefault).toEqual(false);

    //FormSections
    expect(scope.customForm.FormSections).not.toBe(null);
    expect(scope.customForm.FormSections).not.toBeUndefined();
    expect(scope.customForm.FormSections.length).toEqual(0);

    //IndexOfSectionInEditMode
    expect(scope.customForm.IndexOfSectionInEditMode).not.toBe(null);
    expect(scope.customForm.IndexOfSectionInEditMode).not.toBeUndefined();
    expect(scope.customForm.IndexOfSectionInEditMode).toEqual(-1);

    //SectionValidationFlag
    expect(scope.customForm.SectionValidationFlag).not.toBe(null);
    expect(scope.customForm.SectionValidationFlag).not.toBeUndefined();
    expect(scope.customForm.SectionValidationFlag).toEqual(false);

    //SectionCopyValidationFlag
    expect(scope.customForm.SectionCopyValidationFlag).not.toBe(null);
    expect(scope.customForm.SectionCopyValidationFlag).not.toBeUndefined();
    expect(scope.customForm.SectionCopyValidationFlag).toEqual(-1);

    //TemplateMode
    expect(scope.customForm.TemplateMode).not.toBe(null);
    expect(scope.customForm.TemplateMode).not.toBeUndefined();
    expect(scope.customForm.TemplateMode).toEqual(1);

    //customFormActual
    expect(scope.customFormActual).not.toBe(null);
    expect(scope.customFormActual).not.toBeUndefined();
    expect(scope.customFormActual).toEqual(scope.customForm);

    //initialComparison
    expect(scope.initialComparison).not.toBe(null);
    expect(scope.initialComparison).not.toBeUndefined();
    expect(scope.initialComparison).toEqual(true);

    //dataHasChanged
    expect(scope.dataHasChanged).not.toBe(null);
    expect(scope.dataHasChanged).not.toBeUndefined();
    expect(scope.dataHasChanged).toEqual(true);
  });

  //initializeSection
  it('initialized section should return a form section which is not null /  is not defined / and with default values', function () {
    var result = scope.initializeSection(-1);
    expect(result).not.toBe(null);
    expect(result).not.toBeUndefined();

    //FormSectionId
    expect(result.FormSectionId).not.toBe(null);
    expect(result.FormSectionId).not.toBeUndefined();
    expect(result.FormSectionId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //Title
    expect(result.Title).not.toBe(null);
    expect(result.Title).not.toBeUndefined();
    expect(result.Title).toEqual('');

    //FormId
    expect(result.FormId).not.toBe(null);
    expect(result.FormId).not.toBeUndefined();
    expect(result.FormId).toEqual('00000000-0000-0000-0000-000000000000');

    //SequenceNumber
    expect(result.SequenceNumber).not.toBe(null);
    expect(result.SequenceNumber).not.toBeUndefined();
    expect(result.SequenceNumber).toEqual(-1);

    //ShowTitle
    expect(result.ShowTitle).not.toBe(null);
    expect(result.ShowTitle).not.toBeUndefined();
    expect(result.ShowTitle).toEqual(true);

    //ShowBorder
    expect(result.ShowBorder).not.toBe(null);
    expect(result.ShowBorder).not.toBeUndefined();
    expect(result.ShowBorder).toEqual(true);

    //IsVisible
    expect(result.IsVisible).not.toBe(null);
    expect(result.IsVisible).not.toBeUndefined();
    expect(result.IsVisible).toEqual(true);

    //SectionItemTypes
    expect(result.SectionItemTypes).not.toBe(null);
    expect(result.SectionItemTypes).toBeUndefined();
  });

  //addBlankTemplate
  it('addBlankTemplate should initialize customForm and add a section, if it is does not exists', function () {
    scope.customForm = { id: 1, FormSections: [] };
    spyOn(scope, 'toggleSidebarHeader');
    spyOn(scope, 'initializeForm');
    spyOn(scope, 'addSection');

    scope.addBlankTemplate();
    expect(scope.toggleSidebarHeader).toHaveBeenCalledWith(true);
    expect(scope.showTemplate).toEqual(true);
    expect(scope.initializeForm).toHaveBeenCalled();
    expect(scope.customForm.FormSections.length).toBe(0);
    expect(scope.addSection).toHaveBeenCalled();

    // expect(angular.element('#customFormName').focus).not.toHaveBeenCalled();
    // timeout.flush(1);
    // expect(angular.element('#customFormName').focus).toHaveBeenCalled();

    //customFormActual
    expect(scope.customFormActual).not.toBe(null);
    expect(scope.customFormActual).not.toBeUndefined();
    expect(scope.customFormActual).toEqual(scope.customForm);

    //initialComparison
    expect(scope.initialComparison).not.toBe(null);
    expect(scope.initialComparison).not.toBeUndefined();
    expect(scope.initialComparison).toEqual(true);

    //dataHasChanged
    expect(scope.dataHasChanged).not.toBe(null);
    expect(scope.dataHasChanged).not.toBeUndefined();
    expect(scope.dataHasChanged).toEqual(true);
  });

  it('addBlankTemplate should not add Form Section to a custom form having a section', function () {
    scope.customForm = { id: 1, FormSections: [{ name: 'section1' }] };
    spyOn(scope, 'toggleSidebarHeader');
    spyOn(scope, 'initializeForm');
    spyOn(scope, 'addSection');
    //var element = { focus: jasmine.createSpy() };
    //spyOn(angular, 'element').and.returnValue(element);

    scope.addBlankTemplate();
    expect(scope.toggleSidebarHeader).toHaveBeenCalledWith(true);
    expect(scope.showTemplate).toEqual(true);
    expect(scope.initializeForm).toHaveBeenCalled();
    expect(scope.customForm.FormSections.length).toBe(1);
    expect(scope.addSection).not.toHaveBeenCalled();

    // expect(angular.element('#customFormName').focus).not.toHaveBeenCalled();
    //timeout.flush(100);
    //expect(angular.element('#customFormName').focus).toHaveBeenCalled();

    //customFormActual
    expect(scope.customFormActual).not.toBe(null);
    expect(scope.customFormActual).not.toBeUndefined();
    expect(scope.customFormActual).toEqual(scope.customForm);

    //initialComparison
    expect(scope.initialComparison).not.toBe(null);
    expect(scope.initialComparison).not.toBeUndefined();
    expect(scope.initialComparison).toEqual(true);

    //dataHasChanged
    expect(scope.dataHasChanged).not.toBe(null);
    expect(scope.dataHasChanged).not.toBeUndefined();
    expect(scope.dataHasChanged).toEqual(true);
  });

  //addSection with if condition as true.
  it('addSection should add a Form Section to custom form in edit mode, when all sections are in preview mode', function () {
    scope.customForm = {
      FormSections: [{ Title: 'Section1' }],
      IndexOfSectionInEditMode: -1,
    };
    var newSection = { Title: '' };
    spyOn(scope, 'initializeSection').and.returnValue(newSection);

    expect(scope.customForm.IndexOfSectionInEditMode).toEqual(-1);
    scope.addSection();
    expect(scope.initializeSection).toHaveBeenCalled();
    expect(scope.customForm.FormSections.length).toEqual(2);
  });

  it('addSection should add a Form Section to custom form in preview mode, when any other section is in edit mode', function () {
    scope.customForm = {
      FormSections: [{ Title: 'Section1' }],
      IndexOfSectionInEditMode: 0,
    };
    var newSection = { Title: '' };
    spyOn(scope, 'initializeSection').and.returnValue(newSection);

    expect(scope.customForm.IndexOfSectionInEditMode).toEqual(0);
    scope.addSection();
    expect(scope.initializeSection).toHaveBeenCalled();
    expect(scope.customForm.FormSections.length).toEqual(2);
  });

  //editCustomForm
  it('editCustomForm should call another function to get form by Id', function () {
    spyOn(scope, 'getFormById');

    scope.editCustomForm(1);
    expect(scope.getFormById).toHaveBeenCalledWith(1);
  });

  //getFormById
  it('getFormById should call service to get form by Id', function () {
    scope.getFormById(1);
    expect(customFormsService.getFormById).toHaveBeenCalledWith(
      { formId: 1 },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //customFormsServiceGetFormByIdSuccess
  it('customFormsServiceGetFormByIdSuccess should assign non-published form to scope variables', function () {
    spyOn(scope, 'toggleSidebarHeader');
    var successResponse = { Value: { formId: 1, IsPublished: false } };

    scope.customFormsServiceGetFormByIdSuccess(successResponse);

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(-1);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.customForm.TemplateMode).toBe(3);
    expect(scope.toggleSidebarHeader).toHaveBeenCalledWith(true);
    expect(scope.showTemplate).toBe(true);

    //customFormActual
    expect(scope.customFormActual).not.toBe(null);
    expect(scope.customFormActual).not.toBeUndefined();
    expect(scope.customFormActual).toEqual(scope.customForm);

    //initialComparison
    expect(scope.initialComparison).not.toBe(null);
    expect(scope.initialComparison).not.toBeUndefined();
    expect(scope.initialComparison).toEqual(true);

    //dataHasChanged
    expect(scope.dataHasChanged).not.toBe(null);
    expect(scope.dataHasChanged).not.toBeUndefined();
    expect(scope.dataHasChanged).toEqual(true);
  });

  it('customFormsServiceGetFormByIdSuccess should assign published form to scope variables', function () {
    spyOn(scope, 'toggleSidebarHeader');
    var successResponse = { Value: { FormId: 1, IsPublished: true } };
    var FormId = 1;

    scope.customFormsServiceGetFormByIdSuccess(successResponse);

    expect(scope.customForm.SourceFormId).toBe(FormId);
    expect(scope.customForm.FormName).toBe('');
    expect(scope.customForm.Description).toBe('');
    expect(scope.customForm.FormId).toBe(
      '00000000-0000-0000-0000-000000000000'
    );
    expect(scope.customForm.VersionNumber).toBe(1);
    expect(scope.customForm.IsPublished).toBe(false);

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(-1);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.customForm.TemplateMode).toBe(2);

    expect(scope.toggleSidebarHeader).toHaveBeenCalledWith(true);
    expect(scope.showTemplate).toBe(true);

    //customFormActual
    expect(scope.customFormActual).not.toBe(null);
    expect(scope.customFormActual).not.toBeUndefined();
    expect(scope.customFormActual).toEqual(scope.customForm);

    //initialComparison
    expect(scope.initialComparison).not.toBe(null);
    expect(scope.initialComparison).not.toBeUndefined();
    expect(scope.initialComparison).toEqual(true);

    //dataHasChanged
    expect(scope.dataHasChanged).not.toBe(null);
    expect(scope.dataHasChanged).not.toBeUndefined();
    expect(scope.dataHasChanged).toEqual(true);
  });

  //customFormsServiceGetFormByIdFailure
  it('customFormsServiceGetFormByIdFailure should show the failure message to user', function () {
    scope.customFormsServiceGetFormByIdFailure('i am error');
    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //deleteCustomForm
  it('deleteCustomForm should open modal popup asking user permission to DELETE unpublished form', function () {
    var formId = 1;
    var formName = 'sampleForm';

    scope.deleteCustomForm(formId, formName);
  });

  //customFormsServiceDeleteResultThenYes
  it('customFormsServiceDeleteResultThenYes should call function to delete the form using Id', function () {
    spyOn(scope, 'deleteFormById');
    scope.customFormsServiceDeleteResultThenYes(1, 'sample');
    expect(scope.deleteFormById).toHaveBeenCalledWith(1);
    expect(scope.showTemplate).toBe(false);
  });

  //deleteFormById
  it('deleteFormById should call service to delete form by Id', function () {
    scope.deleteFormById(1);
    expect(customFormsService.deleteFormById).toHaveBeenCalledWith(
      { formId: 1 },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //customFormsServiceDeleteSuccess
  it('customFormsServiceDeleteSuccess should execute when form is deleted', function () {
    spyOn(scope, 'getFormsByStatus');

    scope.customFormsServiceDeleteSuccess('success');
    expect(scope.getFormsByStatus).toHaveBeenCalledWith(false);
  });

  //customFormsServiceDeleteFailure
  it('customFormsServiceDeleteFailure should show the failure message to user', function () {
    scope.customFormsServiceDeleteFailure('i am error');
    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //activeOrInactiveCustomForm
  it('activeOrInactiveCustomForm should call a function to find out if form is active or not', function () {
    spyOn(scope, 'activeOrInactiveFormById');

    scope.activeOrInactiveCustomForm(1, 'active');
    expect(scope.activeOrInactiveFormById).toHaveBeenCalledWith(1, 'active');
  });

  //activeOrInactiveFormById
  it('activeOrInactiveFormById should call service to delete form by Id', function () {
    scope.activeOrInactiveCustomForm(1, 'active');
    expect(customFormsService.activeOrInactiveFormById).toHaveBeenCalledWith(
      { formId: 1, isActive: 'active' },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //customFormsServiceActiveOrInactiveSuccess
  it('customFormsServiceActiveOrInactiveSuccess should call a function on success of service', function () {
    spyOn(scope, 'getFormsByStatus');
    scope.customFormsServiceActiveOrInactiveSuccess('success');
    expect(scope.getFormsByStatus).toHaveBeenCalledWith(true);
  });

  //customFormsServiceActiveOrInactiveFailure
  it('customFormsServiceActiveOrInactiveFailure should show the failure message to user', function () {
    scope.customFormsServiceActiveOrInactiveFailure('i am error');
    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //publishFormById
  it('publishFormById should call service to publish form by Id', function () {
    scope.publishFormById(1);
    expect(customFormsPublishService.publishFormById).toHaveBeenCalledWith(
      { formId: 1 },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //customFormsServicePublishedSuccess
  it('customFormsServicePublishedSuccess should call a function on success of service', function () {
    spyOn(scope, 'toggleSidebarHeader');
    spyOn(scope, 'loadSavedTemplates');
    scope.UniqueCustomFormName = 'sample';
    scope.customTemplateForm = { formTitle: { $dirty: true } };
    scope.customForm = { FormName: 'sample' };

    scope.customFormsServicePublishedSuccess(true);

    expect(scope.customSidebarCollapse).toBe(true);
    expect(scope.zIndexClass).toBe('');
    expect(scope.showTemplate).toBe(false);
    //customFormActual
    expect(scope.customFormActual).not.toBe(null);
    expect(scope.customFormActual).not.toBeUndefined();
    expect(scope.customFormActual).toEqual(scope.customForm);

    //initialComparison
    expect(scope.initialComparison).not.toBe(null);
    expect(scope.initialComparison).not.toBeUndefined();
    expect(scope.initialComparison).toEqual(true);

    //dataHasChanged
    expect(scope.dataHasChanged).not.toBe(null);
    expect(scope.dataHasChanged).not.toBeUndefined();
    expect(scope.dataHasChanged).toEqual(true);
    expect(scope.toggleSidebarHeader).toHaveBeenCalledWith(false);

    expect(scope.customTemplateForm.formTitle.$dirty).toBe(false);
    expect(scope.loadSavedTemplates).toHaveBeenCalledWith(true);

    expect(toastrFactory.success).toHaveBeenCalled();

    scope.customFormsServicePublishedSuccess(false);
    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //customFormsServicePublishedFailure
  it('customFormsServicePublishedFailure should show the failure message to user', function () {
    scope.customFormsServicePublishedFailure('i am error');
    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //getFromsByStatus
  it('getFormsByStatus should call service to get published-status of the form', function () {
    scope.getFormsByStatus(0);
    expect(customFormsService.getFormsByPublishedStatus).toHaveBeenCalledWith(
      { isPublished: 0 },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //customFormsServiceGetFormsByPublishedSuccess
  it('customFormsServiceGetFormsByPublishedSuccess should execute on success of service', function () {
    var successResponse = { Value: { Id: 1 } };

    scope.customFormsServiceGetFormsByPublishedSuccess(successResponse);
    expect(scope.savedTemplates).toBe(successResponse.Value);
  });

  //customFormsServiceGetFormsByPublishedFailure
  it('customFormsServiceGetFormsByPublishedFailure should show the failure message to user', function () {
    scope.customFormsServiceGetFormsByPublishedFailure('i am error');
    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //loadSavedTemplates
  it('loadSavedTemplates should show the failure message to user', function () {
    spyOn(scope, 'getFormsByStatus');
    var isPublished = true;
    scope.loadSavedTemplates(isPublished);
    expect(scope.getFormsByStatus).toHaveBeenCalledWith(true);

    isPublished = false;
    scope.loadSavedTemplates(isPublished);
    expect(scope.getFormsByStatus).toHaveBeenCalledWith(false);
  });

  //saveCustomForm
  it('saveCustomForm should check invalidName property when FormName is blank', function () {
    scope.customForm = { FormName: '' };
    scope.saveCustomForm();
    expect(scope.invalidName).toEqual(true);
  });

  it('saveCustomForm should call create service method for valid form (new form)', function () {
    scope.customForm = {
      SectionValidationFlag: false,
      TemplateMode: 1,
      FormName: 'Form 1',
      FormSections: [
        {
          SequenceNumber: -1,
          FormSectionItems: [
            {
              SequenceNumber: -1,
              ItemOptions: [
                { SequenceNumber: -1, BankItemOption: { SequenceNumber: -1 } },
              ],
            },
          ],
        },
      ],
    };

    customFormsFactory.ValidateForm = jasmine.createSpy().and.returnValue(true);
    ctrl.setItemOptions = jasmine.createSpy();
    scope.saveCustomForm();
    expect(customFormsFactory.ValidateForm).toHaveBeenCalled();
    expect(ctrl.setItemOptions).toHaveBeenCalled();
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.zIndexClass).toEqual('zero-zindex');
    expect(scope.invalidName).toEqual(false);
    expect(scope.alreadyClicked).toEqual(true);

    expect(customFormsService.create).toHaveBeenCalledWith(
      scope.customForm,
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  it('saveCustomForm should call create service method for valid form (edit form)', function () {
    scope.customForm = {
      SectionValidationFlag: false,
      TemplateMode: 3,
      FormName: 'Form 1',
      FormSections: [
        {
          SequenceNumber: -1,
          FormSectionItems: [
            {
              SequenceNumber: -1,
              ItemOptions: [
                { SequenceNumber: -1, BankItemOption: { SequenceNumber: -1 } },
              ],
            },
          ],
        },
      ],
    };

    customFormsFactory.ValidateForm = jasmine.createSpy().and.returnValue(true);
    ctrl.setItemOptions = jasmine.createSpy();
    scope.saveCustomForm();
    expect(customFormsFactory.ValidateForm).toHaveBeenCalled();
    expect(ctrl.setItemOptions).toHaveBeenCalled();
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.zIndexClass).toEqual('zero-zindex');
    expect(scope.invalidName).toEqual(false);
    expect(scope.alreadyClicked).toEqual(true);

    expect(customFormsService.update).toHaveBeenCalledWith(
      scope.customForm,
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  it('saveCustomForm should not call create service method when the form is invalid', function () {
    scope.customForm = {
      SectionValidationFlag: false,
      TemplateMode: 3,
      FormName: 'Form 1',
      FormSections: [
        {
          SequenceNumber: -1,
          FormSectionItems: [
            {
              SequenceNumber: -1,
              ItemOptions: [
                { SequenceNumber: -1, BankItemOption: { SequenceNumber: -1 } },
              ],
            },
          ],
        },
      ],
    };

    customFormsFactory.ValidateForm = jasmine
      .createSpy()
      .and.returnValue(false);
    scope.saveCustomForm();
    expect(customFormsService.create).not.toHaveBeenCalledWith(
      scope.customForm,
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //customFormsServiceCreateGetSuccess
  it('customFormsServiceCreateGetSuccess should Handle OK button actions of dialog', function () {
    scope.saveAndDoPublish = true;
    var successResponse = {
      Value: { FormId: 1 },
    };
    spyOn(scope, 'cleanUpFormAndLoadSideBar');
    spyOn(scope, 'reloadSavedFormAndUpdateUnpublishedTemplates');
    scope.customForm = { FormName: 'myForm' };
    //if
    scope.customFormsServiceCreateGetSuccess(successResponse);
    expect(toastrFactory.success).toHaveBeenCalled();
    expect(scope.saveAndDoPublish).toEqual(false);
    expect(scope.cleanUpFormAndLoadSideBar).toHaveBeenCalledWith(true);

    scope.saveAndDoPublish = false;
    scope.saveAndDoNotPublish = true;
    //else if
    scope.customFormsServiceCreateGetSuccess(successResponse);
    expect(toastrFactory.success).toHaveBeenCalled();
    expect(scope.saveAndDoPublish).toEqual(false);
    expect(
      scope.reloadSavedFormAndUpdateUnpublishedTemplates
    ).toHaveBeenCalledWith(successResponse.Value.FormId);

    scope.saveAndDoPublish = false;
    scope.saveAndDoNotPublish = false;
    //else
    scope.customFormsServiceCreateGetSuccess(successResponse);
    expect(modalInstance.open).toHaveBeenCalled();
  });

  it('customFormsServiceCreateGetSuccess should Handle Cancel button actions of dialog', function () {
    var successResponse = { Value: false };
    scope.customFormsServiceCreateGetSuccess(successResponse);
    //expect(modalInstance.close).toHaveBeenCalledWith(false);
  });

  //customFormsServiceCreateGetSuccessModelResultThenOk
  it('customFormsServiceCreateGetSuccessModelResultThenOk should Handle Ok button actions of dialog', function () {
    spyOn(scope, 'publishFormById');
    spyOn(scope, 'reloadSavedFormAndUpdateUnpublishedTemplates');
    var modalResponse = { doPublish: true, formId: 1 };

    scope.customFormsServiceCreateGetSuccessModelResultThenOk(modalResponse);
    expect(scope.publishFormById).toHaveBeenCalledWith(modalResponse.formId);

    modalResponse = { doPublish: false, formId: 1 };
    scope.customForm = { FormName: 'sampleForm' };

    scope.customFormsServiceCreateGetSuccessModelResultThenOk(modalResponse);

    expect(toastrFactory.success).toHaveBeenCalled();
    expect(
      scope.reloadSavedFormAndUpdateUnpublishedTemplates
    ).toHaveBeenCalledWith(modalResponse.formId);
  });

  //reloadSavedFormAndUpdateUnpublishedTemplates
  it('reloadSavedFormAndUpdateUnpublishedTemplates should Open form in edit mode and update unpublished tempaltes list', function () {
    spyOn(scope, 'getFormById');
    spyOn(scope, 'loadSavedTemplates');
    var formId = 1;

    scope.reloadSavedFormAndUpdateUnpublishedTemplates(formId);
    expect(scope.getFormById).toHaveBeenCalledWith(1);
    expect(scope.loadSavedTemplates).toHaveBeenCalledWith(false);
  });

  //cleanUpFormAndLoadSideBar
  it('cleanUpFormAndLoadSideBar  should clean the form and load the sidebar', function () {
    spyOn(scope, 'toggleSidebarHeader');
    spyOn(scope, 'loadSavedTemplates');
    spyOn(scope, 'initializeForm');
    scope.customTemplateForm = { formTitle: { $dirty: true } };
    scope.cleanUpFormAndLoadSideBar(true);
    expect(scope.customSidebarCollapse).toBe(true);
    expect(scope.zIndexClass).toEqual('');
    expect(scope.showTemplate).toBe(false);
    expect(scope.toggleSidebarHeader).toHaveBeenCalledWith(false);
    expect(scope.customTemplateForm.formTitle.$dirty).toBe(false);
    expect(scope.loadSavedTemplates).toHaveBeenCalledWith(true);
  });

  //customFormsServiceUpdateGetSuccess
  it('customFormsServiceUpdateGetSuccess  should handle Success callback after form is updated on server', function () {
    scope.saveAndDoPublish = true;
    var successResponse = {
      Value: { FormId: 1 },
    };
    spyOn(scope, 'cleanUpFormAndLoadSideBar');
    spyOn(scope, 'loadSavedTemplates');
    spyOn(scope, 'reloadSavedFormAndUpdateUnpublishedTemplates');
    scope.customForm = { FormName: 'myForm' };
    //if
    scope.customFormsServiceUpdateGetSuccess(successResponse);
    expect(toastrFactory.success).toHaveBeenCalled();
    expect(scope.saveAndDoPublish).toEqual(false);
    expect(scope.cleanUpFormAndLoadSideBar).toHaveBeenCalledWith(true);

    scope.saveAndDoPublish = false;
    scope.saveAndDoNotPublish = true;
    //else if
    scope.customFormsServiceUpdateGetSuccess(successResponse);
    expect(toastrFactory.success).toHaveBeenCalled();
    expect(scope.saveAndDoPublish).toEqual(false);
    expect(
      scope.reloadSavedFormAndUpdateUnpublishedTemplates
    ).toHaveBeenCalledWith(successResponse.Value.FormId);

    scope.saveAndDoPublish = false;
    scope.saveAndDoNotPublish = false;
    //else
    scope.customFormsServiceUpdateGetSuccess(successResponse);
    expect(modalInstance.open).toHaveBeenCalled();
  });

  //customFormsServiceUpdateGetSuccessModelResultThenOk
  it('customFormsServiceUpdateGetSuccessModelResultThenOk should Handle Ok button actions of dialog', function () {
    spyOn(scope, 'publishFormById');
    spyOn(scope, 'reloadSavedFormAndUpdateUnpublishedTemplates');
    var modalResponse = { doPublish: true, formId: 1 };

    scope.customFormsServiceUpdateGetSuccessModelResultThenOk(modalResponse);
    expect(scope.publishFormById).toHaveBeenCalledWith(modalResponse.formId);

    modalResponse = { doPublish: false, formId: 1 };
    scope.customForm = { FormName: 'sampleForm' };

    scope.customFormsServiceUpdateGetSuccessModelResultThenOk(modalResponse);
    expect(toastrFactory.success).toHaveBeenCalled();
    expect(
      scope.reloadSavedFormAndUpdateUnpublishedTemplates
    ).toHaveBeenCalledWith(modalResponse.formId);
  });

  //customFormsServiceUpdateGetFailure
  it('customFormsServiceUpdateGetFailure should Handle server exception and user notification', function () {
    var errorResponse = { data: { Value: 1, InvalidProperties: true } };
    scope.customFormsServiceUpdateGetFailure(errorResponse);
    expect(scope.zindexclass).toBe('');
    expect(scope.invalidName).toBe(false);
    expect(scope.uniqueTitleServerMessage).not.toBe(null);

    errorResponse = {};

    scope.customFormsServiceUpdateGetFailure(errorResponse);
    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //publishCustomForm
  it('publishCustomForm  should Publish custom form object', function () {
    scope.dataHasChanged = true;

    scope.publishCustomForm(1);
    expect(scope.showPublishConfirmation).toEqual(true);

    scope.dataHasChanged = false;

    scope.publishCustomForm(1);
    expect(scope.zIndexClass).toEqual('zero-zindex');
    expect(modalInstance.open).toHaveBeenCalled();
  });

  //customFormsSavePublishModalResultOk
  it('customFormsSavePublishModalResultOk should Publish custom form ', function () {
    spyOn(scope, 'saveCustomForm');
    var dialogReturnValues = { canPublish: true };
    scope.customForm = {
      IsPublished: false,
    };
    scope.customFormsSavePublishModalResultOk(dialogReturnValues);
    expect(scope.customForm.IsPublished).toBe(true);
    expect(scope.saveAndDoPublish).toBe(true);

    dialogReturnValues = { canPublish: false };
    scope.customForm = {
      IsPublished: false,
    };
    scope.customFormsSavePublishModalResultOk(dialogReturnValues);
    expect(scope.customForm.IsPublished).toBe(false);
    expect(scope.saveAndDoNotPublish).toBe(true);
  });

  //discardCustomForm
  it('discardCustomForm should Discard changes made to a form', function () {
    scope.discardCustomForm();
    expect(scope.zIndexClass).toEqual('zero-zindex');
    expect(modalInstance.open).toHaveBeenCalled();
  });

  //customFormsDiscardModalResultOk
  it('customFormsDiscardModalResultOk should handle Ok action from custom form ', function () {
    spyOn(scope, 'cleanUpFormAndLoadSideBar');
    scope.customFormActual = 'tester';

    scope.customFormsDiscardModalResultOk();
    expect(scope.customForm).toEqual(scope.customFormActual);
    expect(scope.cleanUpFormAndLoadSideBar).toHaveBeenCalledWith(false);
    expect(toastrFactory.success).toHaveBeenCalled();
  });

  //checkUniqueFormName
  it('checkUniqueFormName should not call checkUniqueFormName service method, when FormName does not exists', function () {
    scope.customForm = { FormName: null, FormId: 1 };
    spyOn(scope, 'cleanUpFormAndLoadSideBar');
    scope.editMode = 2;
    scope.checkUniqueFormName();
    expect(
      uniqueCustomFormNameService.checkUniqueFormName
    ).not.toHaveBeenCalledWith(
      {
        formName: scope.customForm.FormName,
        formId: scope.customForm.FormId,
        isEditExistingTemplate: scope.editMode,
      },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  it('checkUniqueFormName should call checkUniqueFormName service method, when FormName exists', function () {
    spyOn(scope, 'cleanUpFormAndLoadSideBar');
    scope.customForm = { FormName: 'form1', FormId: 1 };
    scope.editMode = 2;
    scope.checkUniqueFormName();
    expect(uniqueCustomFormNameService.checkUniqueFormName).toHaveBeenCalled();
  });

  //checkUniqueFormNameGetSuccess
  it('checkUniqueFormNameGetSuccess should set doesFormTitleExists= false', function () {
    var successResponse = { Value: false };
    scope.checkUniqueFormNameGetSuccess(successResponse);
    expect(scope.doesFormTitleExists).toEqual(false);
  });

  //checkUniqueFormNameGetFailure
  it('checkUniqueFormNameGetFailure should set doesFormTitleExists= true', function () {
    var errorResponse = { data: [] };
    scope.checkUniqueFormNameGetFailure(errorResponse);
    expect(scope.doesFormTitleExists).toEqual(true);
  });

  it('checkUniqueFormNameGetFailure should set uniqueTitleServerMessage = Could not verify unique form title. Please try again', function () {
    var errorResponse = { data: { InvalidProperties: [] } };
    scope.checkUniqueFormNameGetFailure(errorResponse);
    expect(scope.uniqueTitleServerMessage).not.toBe(null);
  });

  it('uniqueTitleServerMessage should be undefined if errorResponse.data is null', function () {
    var errorResponse = { data: null };
    scope.checkUniqueFormNameGetFailure(errorResponse);
    expect(scope.uniqueTitleServerMessage).toBeUndefined();
  });

  //toggleSidebarHeader
  it('toggleSidebarHeader should set scope.showElement to showdiv when true is passed', function () {
    scope.toggleSidebarHeader(true);
    expect(scope.showCustomSidebar).toEqual('showdiv');
    expect(scope.customSidebarCollapse).toEqual(false);
  });

  it('toggleSidebarHeader should set scope.showElement to hidediv when false is passed', function () {
    //scope.dataHasChanged is true
    scope.dataHasChanged = true;

    scope.toggleSidebarHeader(false);
    expect(scope.showCustomSidebar).toEqual('hidediv');
    expect(scope.customSidebarCollapse).toEqual(true);

    //scope.dataHasChanged is true
    scope.dataHasChanged = false;
    spyOn(scope, 'discardCustomForm');

    scope.toggleSidebarHeader(false);
    expect(scope.discardCustomForm).toHaveBeenCalled();
  });

  //customFormsServiceCreateGetFailure
  it('customFormsServiceCreateGetFailure should set uniqueTitleServerMessage, when error response data exists', function () {
    var errorResponse = { data: { Value: [], InvalidProperties: [] } };
    scope.customFormsServiceCreateGetFailure(errorResponse);

    expect(scope.zindexclass).toBe('');
    expect(scope.invalidName).toBe(false);
    expect(scope.uniqueTitleServerMessage).not.toBe(null);
  });

  it('customFormsServiceCreateGetFailure should display toastrFactory error, when error response data does not exists', function () {
    var errorResponse = { data: null };
    scope.customFormsServiceCreateGetFailure(errorResponse);

    expect(toastrFactory.error).toHaveBeenCalled();
  });

  describe('authViewAccess ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the view amfa', function () {
      var result = ctrl.authViewAccess();

      expect(
        _authPatSecurityService_.isAmfaAuthorizedByName
      ).toHaveBeenCalledWith('soar-biz-bcform-view');
      expect(result).toEqual(true);
    });
  });

  describe('authCreateAccess ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the add amfa', function () {
      var result = ctrl.authCreateAccess();

      expect(
        _authPatSecurityService_.isAmfaAuthorizedByName
      ).toHaveBeenCalledWith('soar-biz-bcform-add');
      expect(result).toEqual(true);
    });
  });

  describe('authEditAccess ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the edit amfa', function () {
      var result = ctrl.authEditAccess();

      expect(
        _authPatSecurityService_.isAmfaAuthorizedByName
      ).toHaveBeenCalledWith('soar-biz-bcform-edit');
      expect(result).toEqual(true);
    });
  });

  describe('authAccess ->', function () {
    beforeEach(function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.authCreateAccess = jasmine.createSpy().and.returnValue(true);
      ctrl.authEditAccess = jasmine.createSpy().and.returnValue(true);
    });

    it('should navigate away from the page when the user is not authorized to be on this page', function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);

      ctrl.authAccess();

      expect(scope.hasViewAccess).toEqual(false);
      expect(scope.hasCreateAccess).toEqual(true);
      expect(scope.hasEditAccess).toEqual(true);

      expect(_$location_.path).toHaveBeenCalledWith('/');
    });

    it('should navigate away from the page when the user is not authorized to be on this page', function () {
      ctrl.authCreateAccess = jasmine.createSpy().and.returnValue(false);

      ctrl.authAccess();

      expect(scope.hasViewAccess).toEqual(true);
      expect(scope.hasCreateAccess).toEqual(false);
      expect(scope.hasEditAccess).toEqual(true);

      expect(_$location_.path).toHaveBeenCalledWith('/');
    });

    it('should navigate away from the page when the user is not authorized to be on this page', function () {
      ctrl.authEditAccess = jasmine.createSpy().and.returnValue(false);

      ctrl.authAccess();

      expect(scope.hasViewAccess).toEqual(true);
      expect(scope.hasCreateAccess).toEqual(true);
      expect(scope.hasEditAccess).toEqual(false);

      expect(_$location_.path).toHaveBeenCalledWith('/');
    });
  });
});

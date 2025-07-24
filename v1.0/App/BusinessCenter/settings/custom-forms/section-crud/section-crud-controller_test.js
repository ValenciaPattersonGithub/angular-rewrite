describe('Controller: SectionCrudController', function () {
  var ctrl, scope, toastrFactory, localize, timeout;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    ctrl = $controller('SectionCrudController', {
      $scope: scope,
      toastrFactory: toastrFactory,
    });

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    timeout = $injector.get('$timeout');
  }));

  //controller
  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  //toastrFactory
  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  //editSection
  it('editSection should set the given section edit mode, if all sections are in preview mode', function () {
    scope.allowSectionOpen = false;
    scope.customForm = {
      FormSections: [{ SectionName: 'Section1' }, { SectionName: 'Section2' }],
      IndexOfSectionInEditMode: -1,
    };
    var section = scope.customForm.FormSections[0];

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(-1);

    var result = scope.editSection(0);

    expect(result).not.toBe(null);
    expect(result).not.toBeUndefined();
    expect(result).toBe(true);
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(0);
    expect(scope.allowSectionOpen).toBe(true);
  });

  it('editSection should display toastrFactory error message, if any other section is in edit mode', function () {
    scope.allowSectionOpen = true;
    scope.customForm = {
      FormSections: [{ SectionName: 'Section1' }, { SectionName: 'Section2' }],
      IndexOfSectionInEditMode: 1,
    };
    var section = scope.customForm.FormSections[0];

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(1);

    var result = scope.editSection(0);

    expect(result).not.toBe(null);
    expect(result).not.toBeUndefined();
    expect(result).toBe(false);
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(1);
    expect(toastrFactory.error).toHaveBeenCalled();
    expect(scope.allowSectionOpen).toBe(false);
  });

  //deleteSection
  it('deleteSection should delete a selected section', function () {
    scope.customForm = {
      FormSections: [{ SectionName: 'Section1' }, { SectionName: 'Section2' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];
    expect(scope.customForm.FormSections.length).toEqual(2);
    scope.deleteSection();
    expect(scope.customForm.FormSections.length).toEqual(1);
    expect(scope.customForm.FormSections[0].SectionName).toEqual('Section2');
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(-1);
    expect(scope.deleteSectionIndex).toBe(-1);
  });

  //cancelDeleteSection
  it('cancelDeleteSection should set deleteSectionIndex to -1', function () {
    scope.cancelDeleteSection();
    expect(scope.deleteSectionIndex).toBe(-1);
  });

  //confirmDeleteSection
  it('confirmDeleteSection should set deleteSectionIndex to the index of section being deleted', function () {
    scope.customForm = {
      FormSections: [{ SectionName: 'Section1' }, { SectionName: 'Section2' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];
    scope.confirmDeleteSection(1);
    expect(scope.deleteSectionIndex).toBe(1);
  });
});

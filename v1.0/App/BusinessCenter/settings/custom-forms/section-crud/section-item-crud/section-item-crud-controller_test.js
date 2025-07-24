describe('Controller: SectionItemController', function () {
  var ctrl, scope, toastrFactory, localize, timeout, element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();

    scope.sectionItem = { FormItemType: 1 };

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    ctrl = $controller('SectionItemController', {
      $scope: scope,
      toastrFactory: toastrFactory,
    });
    localize = $injector.get('localize');
    timeout = $injector.get('$timeout');

    element = {
      focus: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);
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

  //copySectionItem
  it('copySectionItem should copy a section item, when the copied section item is yesno-true-false and is valid', function () {
    scope.customForm = {
      SectionCopyValidationFlag: -1,
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 2 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    spyOn(scope, 'isSectionItemValid').and.returnValue(true);

    scope.copySectionItem(1, 1);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(1);
    expect(scope.isSectionItemValid).toHaveBeenCalled();
    expect(scope.customForm.FormSections[0].FormSectionItems.length).toBe(3);
    expect(
      angular.element('#questionYesNoTrueFalseText' + 1).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionYesNoTrueFalseText' + 1).focus
    ).toHaveBeenCalled();
  });

  it('copySectionItem should copy a section item, when the copied section item is multiple choice and is valid', function () {
    scope.customForm = {
      SectionCopyValidationFlag: -1,
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 3 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    spyOn(scope, 'isSectionItemValid').and.returnValue(true);

    scope.copySectionItem(1, 1);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(1);
    expect(scope.isSectionItemValid).toHaveBeenCalled();
    expect(scope.customForm.FormSections[0].FormSectionItems.length).toBe(3);
    expect(
      angular.element('#questionMultipleChoiceText' + 1).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionMultipleChoiceText' + 1).focus
    ).toHaveBeenCalled();
  });

  it('copySectionItem should copy a section item, when the copied section item is comment-essay and is valid', function () {
    scope.customForm = {
      SectionCopyValidationFlag: -1,
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 7 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    spyOn(scope, 'isSectionItemValid').and.returnValue(true);

    scope.copySectionItem(1, 1);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(1);
    expect(scope.isSectionItemValid).toHaveBeenCalled();
    expect(scope.customForm.FormSections[0].FormSectionItems.length).toBe(3);
    expect(
      angular.element('#questionCommentEssayText' + 1).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionCommentEssayText' + 1).focus
    ).toHaveBeenCalled();
  });

  it('copySectionItem should copy a section item, when the copied section item is other than yesno-truefalse,multiple choice,comment-essay and is valid', function () {
    scope.customForm = {
      SectionCopyValidationFlag: -1,
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 6 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    spyOn(scope, 'isSectionItemValid').and.returnValue(true);

    scope.copySectionItem(1, 1);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(1);
    expect(scope.isSectionItemValid).toHaveBeenCalled();
    expect(scope.customForm.FormSections[0].FormSectionItems.length).toBe(3);
  });

  it('copySectionItem should not copy a section item, when the copied section item is invalid', function () {
    scope.customForm = {
      SectionCopyValidationFlag: -1,
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 6 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    spyOn(scope, 'isSectionItemValid').and.returnValue(true);

    scope.copySectionItem(1, 1);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(1);
    expect(scope.isSectionItemValid).toHaveBeenCalled();
  });

  //moveSectionItemUp
  it('moveSectionItemUp should move the section item up', function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 2 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[1];
    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);

    expect(scope.customForm.FormSections[0].FormSectionItems[0].ItemText).toBe(
      'Item2'
    );
    expect(
      scope.customForm.FormSections[0].FormSectionItems[0].FormItemType
    ).toBe(3);
    expect(scope.customForm.FormSections[0].FormSectionItems[1].ItemText).toBe(
      'Item1'
    );
    expect(
      scope.customForm.FormSections[0].FormSectionItems[1].FormItemType
    ).toBe(2);
  });

  it("moveSectionItemUp should should set focus on the moved section item's quetion text, for FormItemType = 2", function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 2 },
            { ItemText: 'Item2', FormItemType: 2 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[1];

    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);
    expect(
      angular.element('#questionYesNoTrueFalseText' + (sectionItemIndex - 1))
        .focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionYesNoTrueFalseText' + (sectionItemIndex - 1))
        .focus
    ).toHaveBeenCalled();
  });

  it("moveSectionItemUp should should set focus on the moved section item's quetion text, for FormItemType = 3", function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 2 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[1];
    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);

    expect(
      angular.element('#questionMultipleChoiceText' + (sectionItemIndex - 1))
        .focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionMultipleChoiceText' + (sectionItemIndex - 1))
        .focus
    ).toHaveBeenCalled();
  });

  it("moveSectionItemUp should should set focus on the moved section item's quetion text, for FormItemType = 7", function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 2 },
            { ItemText: 'Item2', FormItemType: 7 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[1];
    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);

    expect(
      angular.element('#questionCommentEssayText' + (sectionItemIndex - 1))
        .focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionCommentEssayText' + (sectionItemIndex - 1))
        .focus
    ).toHaveBeenCalled();
  });

  //moveSectionItemDown
  it('moveSectionItemDown should move the section item down', function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 2 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);

    expect(scope.customForm.FormSections[0].FormSectionItems[0].ItemText).toBe(
      'Item2'
    );
    expect(
      scope.customForm.FormSections[0].FormSectionItems[0].FormItemType
    ).toBe(3);
    expect(scope.customForm.FormSections[0].FormSectionItems[1].ItemText).toBe(
      'Item1'
    );
    expect(
      scope.customForm.FormSections[0].FormSectionItems[1].FormItemType
    ).toBe(2);
  });

  it("moveSectionItemDown should should set focus on the moved section item's quetion text, for FormItemType = 2", function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 2 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);

    expect(
      angular.element('#questionYesNoTrueFalseText' + (sectionItemIndex - 1))
        .focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionYesNoTrueFalseText' + (sectionItemIndex - 1))
        .focus
    ).toHaveBeenCalled();
  });

  it("moveSectionItemDown should should set focus on the moved section item's quetion text, for FormItemType = 3", function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 3 },
            { ItemText: 'Item2', FormItemFormItemTypeTypeID: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);

    expect(
      angular.element('#questionMultipleChoiceText' + (sectionItemIndex - 1))
        .focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionMultipleChoiceText' + (sectionItemIndex - 1))
        .focus
    ).toHaveBeenCalled();
  });

  it("moveSectionItemDown should should set focus on the moved section item's quetion text, for FormItemType = 7", function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            { ItemText: 'Item1', FormItemType: 7 },
            { ItemText: 'Item2', FormItemType: 3 },
          ],
        },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    var sectionIndex = 1;
    var sectionItemIndex = 1;
    scope.moveSectionItemUp(sectionIndex, sectionItemIndex);

    expect(
      angular.element('#questionCommentEssayText' + (sectionItemIndex - 1))
        .focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionCommentEssayText' + (sectionItemIndex - 1))
        .focus
    ).toHaveBeenCalled();
  });

  //addNewMultipleChoiceOption
  it('addNewMultipleChoiceOption should add a new option to the section item', function () {
    scope.customForm = {
      FormSections: [{ FormSectionItems: [{ ItemOptions: [] }] }],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    var sectionIndex = 0,
      sectionItemIndex = 0;
    scope.$index = 0;

    expect(
      scope.customForm.FormSections[sectionIndex].FormSectionItems[
        sectionItemIndex
      ].ItemOptions.length
    ).toBe(0);

    scope.addNewMultipleChoiceOption();

    expect(
      scope.customForm.FormSections[sectionIndex].FormSectionItems[
        sectionItemIndex
      ].ItemOptions.length
    ).toBe(1);
    expect(
      angular.element('#questionMultipleChoiceSelectValue0 input:last').focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#questionMultipleChoiceSelectValue0 input:last').focus
    ).toHaveBeenCalled();
  });

  //deleteSectionItem
  it('deleteSectionItem should delete the given section item', function () {
    scope.customForm = {
      FormSections: [
        { FormSectionItems: [{ ItemText: 'Item1' }, { ItemText: 'Item2' }] },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    scope.deleteSectionItemIndex = 0;

    scope.deleteSectionItem();

    expect(scope.customForm.FormSections[0].FormSectionItems.length).toBe(1);
    expect(scope.customForm.FormSections[0].FormSectionItems[0].ItemText).toBe(
      'Item2'
    );
  });

  //confirmDeleteSectionItem
  it('confirmDeleteSectionItem should set deleteSectionItemIndex to the index of section item', function () {
    scope.customForm = {
      FormSections: [
        { FormSectionItems: [{ ItemText: 'Item1' }, { ItemText: 'Item2' }] },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    scope.deleteSectionItemIndex = -1;
    var sectionItemIndex = 1;
    scope.confirmDeleteSectionItem(sectionItemIndex);

    expect(scope.deleteSectionItemIndex).toBe(sectionItemIndex);
  });

  //cancelDeleteSectionItemConfirmBox
  it('cancelDeleteSectionItemConfirmBox should set deleteSectionItemIndex to -1', function () {
    scope.customForm = {
      FormSections: [
        { FormSectionItems: [{ ItemText: 'Item1' }, { ItemText: 'Item2' }] },
      ],
    };
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    scope.deleteSectionItemIndex = 0;

    scope.cancelDeleteSectionItemConfirmBox();

    expect(scope.deleteSectionItemIndex).toBe(-1);
  });

  //removeMultipleChoiceOption
  it('removeMultipleChoiceOption should remove given option from the section item', function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            {
              ItemOptions: [
                { optionId: 1, optionText: 'Option1' },
                { optionId: 2, optionText: 'Option2' },
              ],
            },
          ],
        },
      ],
    };
    scope.resequenceFormItemOptions = jasmine.createSpy();

    var sectionIndex = 0,
      sectionItemIndex = 0;
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    scope.confirmOptionRemoveIndex = 0;

    expect(
      scope.customForm.FormSections[sectionIndex].FormSectionItems[
        sectionItemIndex
      ].ItemOptions.length
    ).toBe(2);

    scope.removeMultipleChoiceOption(0, 0);

    expect(
      scope.customForm.FormSections[sectionIndex].FormSectionItems[
        sectionItemIndex
      ].ItemOptions.length
    ).toBe(1);
    expect(
      scope.customForm.FormSections[sectionIndex].FormSectionItems[
        sectionItemIndex
      ].ItemOptions[0].optionId
    ).toBe(2);
    expect(
      scope.customForm.FormSections[sectionIndex].FormSectionItems[
        sectionItemIndex
      ].ItemOptions[0].optionText
    ).toBe('Option2');
    expect(scope.confirmOptionRemoveIndex).toBe(-1);
    expect(scope.resequenceFormItemOptions).toHaveBeenCalledWith(
      scope.customForm.FormSections[0].FormSectionItems[0].ItemOptions
    );
  });

  //cancelRemoveMultipleChoiceOption
  it('cancelRemoveMultipleChoiceOption should set confirmOptionRemoveIndex to -1', function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            {
              SectionItemMultipleChoiceOptions: [
                { optionId: 1, optionText: 'Option1' },
                { optionId: 2, optionText: 'Option2' },
              ],
            },
          ],
        },
      ],
    };
    var sectionIndex = 0,
      sectionItemIndex = 0;
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    scope.confirmOptionRemoveIndex = 0;

    scope.cancelRemoveMultipleChoiceOption();

    expect(scope.confirmOptionRemoveIndex).toBe(-1);
  });

  //confirmRemoveMultipleChoiceOption
  it('confirmRemoveMultipleChoiceOption should set confirmOptionRemoveIndex to the index of option to be deleted', function () {
    scope.customForm = {
      FormSections: [
        {
          FormSectionItems: [
            {
              SectionItemMultipleChoiceOptions: [
                { optionId: 1, optionText: 'Option1' },
                { optionId: 2, optionText: 'Option2' },
              ],
            },
          ],
        },
      ],
    };
    var sectionIndex = 0,
      sectionItemIndex = 0;
    scope.section = scope.customForm.FormSections[0];
    scope.sectionItem = scope.section.FormSectionItems[0];
    var sectionItemOption =
      scope.sectionItem.SectionItemMultipleChoiceOptions[0];
    var sectionItemOptionIndex = 0;
    scope.confirmOptionRemoveIndex = -1;

    scope.confirmRemoveMultipleChoiceOption(
      sectionItemOption,
      sectionItemOptionIndex
    );

    expect(scope.confirmOptionRemoveIndex).toBe(0);
  });

  //isSectionItemValid
  it('isSectionItemValid should return true if section is valid for yesno question', function () {
    scope.sectionItem = {
      FormItemType: 2,
      FormBankItem: { ItemText: 'sampleText' },
    };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(true);
  });
  it('isSectionItemValid should return true if section is valid for truefalse question', function () {
    scope.sectionItem = {
      FormItemType: 8,
      FormBankItem: { ItemText: 'sampleText' },
    };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(true);
  });
  it('isSectionItemValid should return true if section is valid for multiple choice question', function () {
    scope.sectionItem = {
      FormItemType: 3,
      FormBankItem: { ItemText: 'sampleText' },
    };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(true);
  });
  it('isSectionItemValid should return true if section is valid for comment-essay question', function () {
    scope.sectionItem = {
      FormItemType: 7,
      FormBankItem: { ItemText: 'sampleText' },
    };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(true);
  });

  it('isSectionItemValid should return true if section is valid for emergency and demographic question', function () {
    scope.sectionItem = { FormItemType: 6 };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(true);

    scope.sectionItem = { FormItemType: 1 };

    result = scope.isSectionItemValid();
    expect(result).toEqual(true);
  });

  it('isSectionItemValid should return false if section is invalid for yesno question', function () {
    scope.sectionItem = { FormItemType: 2, FormBankItem: { ItemText: '' } };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(false);
  });
  it('isSectionItemValid should return false if section is invalid for truefalse question', function () {
    scope.sectionItem = { FormItemType: 8, FormBankItem: { ItemText: '' } };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(false);
  });
  it('isSectionItemValid should return false if section is invalid for multiple choice question', function () {
    scope.sectionItem = { FormItemType: 3, FormBankItem: { ItemText: '' } };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(false);
  });
  it('isSectionItemValid should return false if section is invalid for comment-essay question', function () {
    scope.sectionItem = { FormItemType: 7, FormBankItem: { ItemText: '' } };

    var result = scope.isSectionItemValid();
    expect(result).toEqual(false);
  });
});

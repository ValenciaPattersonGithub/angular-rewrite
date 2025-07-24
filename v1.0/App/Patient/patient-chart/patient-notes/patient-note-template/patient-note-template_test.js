describe('PatientNoteTemplateController ->', function () {
  var scope, ctrl;
  var noteTemplatesHttpService, modalFactory, mockExistingNote;

  mockExistingNote = { Note: '', NoteTitle: '' };
  var trueFalseValue = false;
  //#region mock templates

  var mockTemplate = {
    TemplateId: 'd3796bf1-d0f9-4569-bdd3-d7877d4027fa',
    TemplateName: 'MockTemplate',
    TemplateBodyCustomForm: {
      FormName: 'MockTemplate',
      VersionNumber: 1,
      FormSections: [
        {
          Title: 'Section 1',
          SequenceNumber: 1,
          FormSectionItems: [
            {
              IsRequired: true,
              FormItemTypeId: '3',
              MultiSelectAllow: true,
              FormBankItem: {
                ItemText: 'Any Pain or Swelling',
                FormItemTypeId: '3',
                Description: 'Any Pain or Swelling',
                Answer: null,
                IsRequired: true,
                MultiSelectAllow: true,
                SequenceNumber: 1,
              },
              ItemOptions: [
                {
                  SequenceNumber: 1,
                  Answer: false,
                  BankItemOption: {
                    OptionIndex: 1,
                    OptionText: 'Very little',
                    OptionValue: 'Very little',
                  },
                },
                {
                  SequenceNumber: 2,
                  Answer: false,
                  BankItemOption: {
                    OptionIndex: 1,
                    OptionText: 'Moderate',
                    OptionValue: 'Moderate',
                  },
                },
                {
                  SequenceNumber: 3,
                  Answer: true,
                  BankItemOption: {
                    OptionIndex: 3,
                    OptionText: 'Severe',
                    OptionValue: 'Severe',
                  },
                },
              ],
            },
          ],
        },
        {
          Title: 'Section 2',
          SequenceNumber: 2,
          FormSectionItems: [
            {
              IsRequired: true,
              FormItemTypeId: '3',
              MultiSelectAllow: false,
              FormBankItem: {
                ItemText: 'Are you ever coming back?',
                FormItemTypeId: '3',
                Description: 'Are you ever coming back?',
                Answer: 'Probably not',
                IsRequired: true,
                MultiSelectAllow: false,
                SequenceNumber: 1,
              },
              ItemOptions: [
                {
                  SectionItemId: 'c450fc0f-42e1-441e-8ffb-27a1dea13f15',
                  SequenceNumber: 1,
                  BankItemOption: {
                    BankItemId: '3a606416-27d4-4be9-bea3-1d62d08ed79c',
                    OptionIndex: 1,
                    OptionText: 'Probably not',
                    OptionValue: 'Probably not',
                    Answer: 'Probably not',
                  },
                },
                {
                  SectionItemId: 'c450fc0f-42e1-441e-8ffb-27a1dea13f15',
                  SequenceNumber: 2,
                  BankItemOption: {
                    BankItemId: '3a606416-27d4-4be9-bea3-1d62d08ed79c',
                    OptionIndex: 1,
                    OptionText: 'Maybe',
                    OptionValue: 'Maybe',
                    Answer: 'Probably not',
                  },
                },
                {
                  SectionItemId: 'c450fc0f-42e1-441e-8ffb-27a1dea13f15',
                  SequenceNumber: 3,
                  BankItemOption: {
                    BankItemId: '3a606416-27d4-4be9-bea3-1d62d08ed79c',
                    OptionIndex: 3,
                    OptionText: 'Doubt it',
                    OptionValue: 'Doubt it',
                    Answer: 'Probably not',
                  },
                },
              ],
            },
          ],
        },

        {
          Title: 'Section 3',
          SequenceNumber: 3,
          FormSectionItems: [
            {
              IsRequired: true,
              FormItemTypeId: '2',
              MultiSelectAllow: false,
              FormBankItem: {
                ItemText: 'Was this painful?',
                FormItemTypeId: '2',
                Description: 'Was this painful?',
                Answer: 'Yes',
                IsRequired: true,
                MultiSelectAllow: false,
                SequenceNumber: 1,
              },
              ItemOptions: [],
            },
          ],
        },
      ],
    },
  };
  //#endregion

  beforeEach(
    module('Soar.Patient', function ($provide) {
      var localize = {
        getLocalizedString: jasmine
          .createSpy()
          .and.returnValue('- Performed By -'),
      };
      $provide.value('localize', localize);

      noteTemplatesHttpService = {
        ActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
        SetActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
        LoadTemplateBodyCustomForm: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        ValidateTemplateAnswers: jasmine
          .createSpy()
          .and.returnValue(trueFalseValue),
        ConvertTemplateToText: jasmine.createSpy().and.returnValue(''),
      };
      $provide.value('NoteTemplatesHttpService', noteTemplatesHttpService);
      $provide.value('PatientNotesFactory', {});
    })
  );

  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $timeout,
    $q,
    _$uibModal_
  ) {
    scope = $rootScope.$new();

    var $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    //mock for modalFactory
    modalFactory = {
      ConfirmLockModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          var modalFactoryDeferred = $q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          var modalFactoryDeferred = $q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    ctrl = $controller('PatientNoteTemplateController', {
      $scope: scope,
      ModalFactory: modalFactory,
      timeout: $timeout,
    });
  }));

  describe('$watch selectedTemplate ->', function () {
    it('should call ctrl.loadTemplateBody when selectedTemplate changes', function () {
      spyOn(ctrl, 'loadTemplateBody');

      var selectedTemplate = { TemplateId: null };
      scope.selectedTemplate = selectedTemplate;
      scope.$digest();

      scope.selectedTemplate = { TemplateId: '123456789' };
      scope.$digest();

      expect(ctrl.loadTemplateBody).toHaveBeenCalled();
    });
  });

  describe('addTemplateToNote function ->', function () {
    it('should add template content to empty note', function () {
      var templateContent = 'This is the content from the template';
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.currentNote = angular.copy(mockExistingNote);
      ctrl.addTemplateToNote(templateContent);
      expect(scope.currentNote.Note).toEqual(templateContent);
    });

    it('should add template content to note existing note', function () {
      var templateContent = 'This is the content from the template';
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.currentNote = angular.copy(mockExistingNote);
      scope.currentNote.Note = 'Existing Note Text';
      ctrl.addTemplateToNote(templateContent);
      expect(scope.currentNote.Note).not.toEqual(templateContent);
      expect(scope.currentNote.Note).toContain(templateContent);
    });

    it('should set note title to template title if no note title', function () {
      var templateContent = 'This is the content from the template';
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.currentNote = angular.copy(mockExistingNote);
      scope.currentNote.Note = 'Existing Note Text';
      scope.currentNote.NoteTitle = 'Existing Note Title';
      ctrl.addTemplateToNote(templateContent);
      expect(scope.currentNote.NoteTitle).toEqual('Existing Note Title');
    });

    it('should not set note title to template title if note title exists', function () {
      var templateContent = 'This is the content from the template';
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.currentNote = angular.copy(mockExistingNote);
      scope.currentNote.Note = '';
      ctrl.addTemplateToNote(templateContent);
      expect(scope.currentNote.NoteTitle).toEqual(mockTemplate.TemplateName);
    });
  });

  describe('validateForm function ->', function () {
    beforeEach(function () {
      scope.selectedTemplate = angular.copy(mockTemplate);
    });
    it('should call noteTemplatesHttpService.ValidateTemplateAnswers', function () {
      trueFalseValue = true;
      ctrl.validateForm();
      expect(
        noteTemplatesHttpService.ValidateTemplateAnswers
      ).toHaveBeenCalled();
    });

    it('should call setFocusOnFirstError if noteTemplatesHttpService.ValidateTemplateAnswers returns false', function () {
      spyOn(ctrl, 'setFocusOnFirstError');
      trueFalseValue = false;
      ctrl.validateForm();
      expect(ctrl.setFocusOnFirstError).toHaveBeenCalled();
    });
  });

  describe('finishTemplate function ->', function () {
    it('should call validateForm', function () {
      spyOn(ctrl, 'validateForm').and.returnValue(false);
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.currentNote = angular.copy(mockExistingNote);
      scope.currentNote.Note = '';
      scope.finishTemplate();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should call addTemplateToNote', function () {
      spyOn(ctrl, 'validateForm').and.returnValue(false);
      spyOn(ctrl, 'addTemplateToNote');
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.currentNote = angular.copy(mockExistingNote);
      scope.currentNote.Note = '';
      scope.finishTemplate();
      expect(ctrl.addTemplateToNote).toHaveBeenCalled();
    });

    it('should call addTemplateToNote', function () {
      spyOn(ctrl, 'closeForm');
      spyOn(ctrl, 'validateForm').and.returnValue(false);
      scope.selectedTemplate = angular.copy(mockTemplate);
      scope.currentNote = angular.copy(mockExistingNote);
      scope.currentNote.Note = '';
      scope.finishTemplate();
      expect(ctrl.closeForm).toHaveBeenCalled();
    });
  });
});

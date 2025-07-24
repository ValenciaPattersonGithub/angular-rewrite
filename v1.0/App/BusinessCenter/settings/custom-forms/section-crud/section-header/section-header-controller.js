'use strict';

angular.module('Soar.BusinessCenter').controller('SectionHeaderController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  '$window',
  'StaticData',
  'CustomFormsFactory',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    $window,
    staticData,
    customFormsFactory
  ) {
    var ctrl = this;

    $scope.sectionSelected = null;

    $scope.addPromptChanged = function (value) {
      $scope.sectionSelected = value;
    };

    $scope.sections = [
      { Text: localize.getLocalizedString('Multiple Choice'), Value: 1 },
      { Text: localize.getLocalizedString('Yes/No True/False'), Value: 2 },
      { Text: localize.getLocalizedString('Ad-Lib'), Value: 3 },
      { Text: localize.getLocalizedString('Link Tooth'), Value: 4 },
      { Text: localize.getLocalizedString('Note Text'), Value: 5 },
    ];

    $scope.addSectionClick = function (sectionIndex, value) {
      switch (value) {
        case '1':
          $scope.addSectionItem(sectionIndex, 3);
          $scope.openAccordion();
          break;
        case '2':
          $scope.addSectionItem(sectionIndex, 2);
          $scope.openAccordion();
          break;
        case '3':
          $scope.addSectionItem(sectionIndex, 9);
          $scope.openAccordion();
          break;
        case '4':
          $scope.addSectionItem(sectionIndex, 10);
          $scope.openAccordion();
          break;
        case '5':
          $scope.addSectionItem(sectionIndex, 11);
          $scope.openAccordion();
          break;
      }
      $timeout(function () {
        $scope.addPromptChanged(0);
      }, 1000);
    };

    $scope.$watch('sectionSelected', function (nv, ov) {
      $timeout(function () {
        var index = $scope.section.FormSectionItems.length + 1;
        $scope.addSectionClick(index, nv);
      }, 0);
    });

    // Initialize section item object
    $scope.initializeSectionItem = function (sectionIndex, value) {
      var formSectionItem = {
        FormSectionId: '00000000-0000-0000-0000-000000000000',
        SectionItemId: value,
        BankItemId: '00000000-0000-0000-0000-000000000000',
        FormBankItem: {
          ItemText: '',
          FormItemTypeName: '',
          Description: '',
          CommonlyUsed: '',
          IsVisible: true,
          UseDefaultValue: false,
          DefaultValue: '',
        },
        IsRequired: false,
        MultiSelectAllow: false,
        IsVisible: true,
        SequenceNumber: sectionIndex,
        BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
        FormBankItemDemographic: {},
        BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
        FormBankItemEmergencyContact: {},
        ItemOptions: [],
        FormItemType: null,
        // FormItemTypeName will be used for UI purpose only.
        FormItemTypeName: '',
      };
      return formSectionItem;
    };

    $scope.initializeSectionItemOption = function (sectionIndex) {
      var formSectionItemOption = {
        SectionItemId: '00000000-0000-0000-0000-000000000000',
        SectionItemOptionId: '00000000-0000-0000-0000-000000000000',
        BankItemId: '00000000-0000-0000-0000-000000000000',
        BankItemOptionId: '00000000-0000-0000-0000-000000000000',
        BankItemOption: {
          BankItemOptionId: '00000000-0000-0000-0000-000000000000',
          OptionIndex: 1,
          OptionText: '',
          OptionValue: '',
          IsSelected: '',
          IsVisible: '',
          SequenceNumber: sectionIndex,
        },
        IsSelected: true,
        IsVisible: true,
        SequenceNumber: sectionIndex,
      };
      return formSectionItemOption;
    };
    //Add new section item
    $scope.addSectionItem = function (sectionIndex, value) {
      var newField = $scope.initializeSectionItem(sectionIndex, value);

      $scope.customForm.SectionValidationFlag = false;
      $scope.customForm.SectionCopyValidationFlag = -1;
      switch (value) {
        case 1:
          newField.FormItemTypeName = 'Demographic Question';
          newField.FormItemType = 1;
          newField.FormBankItemDemographic.BankItemDemographicId =
            '00000000-0000-0000-0000-000000000001';
          newField.FormBankItemDemographic.FirstNameFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredFirstName = true;
          newField.FormBankItemDemographic.LastNameFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredLastName = true;
          newField.FormBankItemDemographic.PreferredNameFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredPreferredName = false;
          newField.FormBankItemDemographic.AddressLine1FormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredAddressLine1 = false;
          newField.FormBankItemDemographic.AddressLine2FormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredAddressLine2 = false;
          newField.FormBankItemDemographic.CityFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredCity = false;
          newField.FormBankItemDemographic.StateFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredState = false;
          newField.FormBankItemDemographic.ZipFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredZip = false;
          newField.FormBankItemDemographic.EmailAddressFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredEmailAddress = false;
          newField.FormBankItemDemographic.PrimaryNumberFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredPrimaryNumber = false;
          newField.FormBankItemDemographic.SecondaryNumberFormItemTypeId = 0;
          newField.FormBankItemDemographic.IsRequiredSecondaryNumber = false;

          newField.BankItemEmergencyContactId = null;
          newField.FormBankItemEmergencyContact = null;
          newField.BankItemId = null;
          newField.FormBankItem = null;
          break;
        case 2:
          newField.FormBankItem.FormItemTypeName = 'Yes/No or True/False';
          newField.FormItemType = 2;
          newField.FormItemTypeName = 'Yes/No or True/False';

          newField.BankItemDemographicId = null;
          newField.FormBankItemDemographic = null;
          newField.BankItemEmergencyContactId = null;
          newField.FormBankItemEmergencyContact = null;

          break;
        case 3:
          newField.FormBankItem.FormItemTypeName = 'Multiple Choice';
          newField.FormItemTypeName = 'Multiple Choice';
          newField.FormItemType = 3;

          // add 2 itemOptions
          var itemOption = $scope.initializeSectionItemOption();
          itemOption.BankItemOption.OptionIndex = 1;
          itemOption.SequenceNumber = 1;
          newField.ItemOptions.push(itemOption);

          itemOption = $scope.initializeSectionItemOption();
          itemOption.BankItemOption.OptionIndex = 2;
          itemOption.SequenceNumber = 2;
          newField.ItemOptions.push(itemOption);

          newField.BankItemDemographicId = null;
          newField.FormBankItemDemographic = null;
          newField.BankItemEmergencyContactId = null;
          newField.FormBankItemEmergencyContact = null;
          break;
        case 4:
          newField.FormBankItem.FormItemTypeName = 'Signature Box';
          newField.FormBankItem.Description = 'Signature Box';
          newField.FormBankItem.ItemText = 'Signature Box';
          newField.FormItemTypeName = 'Signature Box';
          newField.FormItemType = 4;

          newField.BankItemDemographicId = null;
          newField.FormBankItemDemographic = null;
          newField.BankItemEmergencyContactId = null;
          newField.FormBankItemEmergencyContact = null;
          break;
        case 5:
          newField.FormBankItem.FormItemTypeName = 'Date of Completion';
          newField.FormBankItem.Description = 'Date of Completion';
          newField.FormBankItem.ItemText = 'Date of Completion';
          newField.FormItemTypeName = 'Date of Completion';
          newField.FormItemType = 5;
          newField.BankItemDemographicId = null;
          newField.FormBankItemDemographic = null;
          newField.BankItemEmergencyContactId = null;
          newField.FormBankItemEmergencyContact = null;
          break;
        case 6:
          newField.FormItemTypeName = 'Emergency Contact';
          newField.FormItemType = 6;
          newField.FormBankItemEmergencyContact.ContactFormItemTypeId = 0;
          newField.FormBankItemEmergencyContact.IsRequiredContact = false;
          newField.FormBankItemEmergencyContact.PhoneFormItemTypeId = 0;
          newField.FormBankItemEmergencyContact.IsRequiredPhone = false;
          newField.FormBankItemEmergencyContact.ContactRelationshipFormItemTypeId = 0;
          newField.FormBankItemEmergencyContact.IsRequiredContactRelationship = false;

          newField.BankItemDemographicId = null;
          newField.FormBankItemDemographic = null;
          newField.BankItemId = null;
          newField.FormBankItem = null;

          break;
        case 7:
          newField.FormBankItem.FormItemTypeName = 'Comment/Essay';
          newField.FormItemTypeName = 'Comment/Essay';
          newField.FormItemType = 7;

          newField.BankItemDemographicId = null;
          newField.FormBankItemDemographic = null;
          newField.BankItemEmergencyContactId = null;
          newField.FormBankItemEmergencyContact = null;
          break;
        case 9:
          var numberOfPrompts = 2;
          newField = ctrl.addAdlibItem(numberOfPrompts, sectionIndex);
          break;
        case 10:
          newField = ctrl.addLinkToothItem(sectionIndex);
          break;
        case 11:
          newField = ctrl.addTextFieldItem(sectionIndex);
          break;
      }

      // put newField into fields array
      $scope.section.FormSectionItems.push(newField);

      if (newField.FormItemType == 2 || newField.FormItemType == 8) {
        $timeout(function () {
          angular
            .element(
              '#questionYesNoTrueFalseText' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 3) {
        $timeout(function () {
          angular
            .element(
              '#questionMultipleChoiceText' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 7) {
        $timeout(function () {
          angular
            .element(
              '#questionCommentEssayText' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 6) {
        $timeout(function () {
          angular
            .element(
              '#questionEmergencyContactNameCKB' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 1) {
        $timeout(function () {
          angular
            .element(
              '#questionDemographicPreferredNameCKB' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 5) {
        $timeout(function () {
          angular
            .element(
              '#lblDateOfCompletion' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 4) {
        $timeout(function () {
          angular
            .element(
              '#questionSignatureBoxCKB' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 9) {
        $timeout(function () {
          angular
            .element(
              '#questionAdlib1Text' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 10) {
        $timeout(function () {
          angular
            .element(
              '#questionLinkToothText' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      } else if (newField.FormItemType == 11) {
        $timeout(function () {
          angular
            .element(
              '#questionTextFieldText' +
                sectionIndex +
                '_' +
                ($scope.section.FormSectionItems.length - 1)
            )
            .focus();
        }, 0);
      }

      // making sure newly added FormItemTypeId is visible by scrolling page to the bottom
      $timeout(function () {
        if ($scope.section.FormSectionItems.length === sectionIndex) {
          $window.scrollTo(0, document.body.scrollHeight);
        }
      }, 0);

      return true;
    };
    //Copy the section
    $scope.copySection = function (index) {
      // Copy section only if section is Valid.
      if ($scope.isSectionValid()) {
        $scope.customForm.SectionValidationFlag = false;
        var newSection = angular.copy($scope.section);
        newSection.Title = '';
        $scope.customForm.FormSections.splice(index + 1, 0, newSection);
        $scope.customForm.FormSections[index + 1].SequenceNumber = index + 1;
        $scope.previewSection();
        $scope.editSection(index + 1);
        $timeout(function () {
          if ($scope.customForm.IndexOfSectionInEditMode != -1) {
            angular
              .element(
                '#inpSectionTitle_' + $scope.customForm.IndexOfSectionInEditMode
              )
              .focus();
          }
        }, 0);
      } else {
        $scope.customForm.SectionValidationFlag = true;
      }
    };

    var moveSection = function (origin, destination) {
      var temp = $scope.customForm.FormSections[destination];
      $scope.customForm.FormSections[destination] =
        $scope.customForm.FormSections[origin];
      $scope.customForm.FormSections[origin] = temp;
    };

    // Move complete section above
    $scope.moveSectionUp = function (index) {
      moveSection(index, index - 1);
      $scope.customForm.IndexOfSectionInEditMode = index - 1;
      $timeout(function () {
        if ($scope.customForm.IndexOfSectionInEditMode != -1) {
          angular
            .element(
              '#inpSectionTitle_' + $scope.customForm.IndexOfSectionInEditMode
            )
            .focus();
        }
      }, 0);
    };

    // Move Section
    $scope.moveSectionDown = function (index) {
      moveSection(index, index + 1);
      $scope.customForm.IndexOfSectionInEditMode = index + 1;
      $timeout(function () {
        if ($scope.customForm.IndexOfSectionInEditMode != -1) {
          angular
            .element(
              '#inpSectionTitle_' + $scope.customForm.IndexOfSectionInEditMode
            )
            .focus();
        }
      }, 0);
    };
    // Preview section
    $scope.previewSection = function () {
      if ($scope.isSectionValid()) {
        $scope.customForm.SectionValidationFlag = false;
        $scope.customForm.SectionCopyValidationFlag = -1;
        $scope.customForm.IndexOfSectionInEditMode = -1;
      } else {
        $scope.customForm.SectionValidationFlag = true;
      }
    };

    // section validation
    $scope.isSectionValid = function () {
      var isValid = true;
      for (
        var index = 0;
        index < $scope.section.FormSectionItems.length;
        index++
      ) {
        if (
          !customFormsFactory.ValidateFormSectionItem(
            $scope.section.FormSectionItems[index]
          )
        ) {
          isValid = false;
        }
      }
      return isValid;
    };

    //#region Ad-Lib

    ctrl.initializeAdlibFormBankItem = function (sequenceNumber, optionIndex) {
      var formBankItem = {
        Answer: null,
        ItemText: null,
        FormItemType: '00000000-0000-0000-0000-000000000009',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
        ItemSequenceNumber: optionIndex,
      };
      return formBankItem;
    };

    ctrl.addAdlibItem = function (numberOfPrompts, sectionIndex) {
      var formSectionItem = $scope.initializeSectionItem(sectionIndex, 0);

      // null out these
      formSectionItem.BankItemDemographicId = null;
      formSectionItem.FormBankItemDemographic = null;
      formSectionItem.BankItemEmergencyContactId = null;
      formSectionItem.FormBankItemEmergencyContact = null;
      formSectionItem.BankItemDemographicId = null;
      formSectionItem.BankItemDemographicId = null;
      formSectionItem.FormBankItemDemographic = null;
      formSectionItem.BankItemId = null;
      formSectionItem.FormBankItem = null;

      formSectionItem.FormItemTypeName = 'Ad-Lib';
      formSectionItem.FormItemType = 9;
      formSectionItem.FormBankItemPromptTexts = [];
      formSectionItem.ItemPromptTextsOptions = [[]];
      formSectionItem.SequenceNumber = sectionIndex;

      // NOTE this will need to be refactored when we add more than 2 prompts
      // add 2 FormBankItems
      for (var i = 1; i <= numberOfPrompts; i++) {
        var formBankItem = ctrl.initializeAdlibFormBankItem(1, i);
        formSectionItem.FormBankItemPromptTexts.push(formBankItem);
      }

      // add 3 ItemOptions to ItemPromptTextsOptions[0]
      var itemOptions = [];
      for (var i = 1; i <= 2; i++) {
        // create a list of ItemOptions
        var itemOption = $scope.initializeSectionItemOption();
        itemOption.BankItemOption.OptionIndex = i;
        itemOption.SequenceNumber = i;
        formSectionItem.ItemPromptTextsOptions[0].push(itemOption);
      }
      return formSectionItem;
    };
    //#endregion

    //#region link tooth type
    ctrl.addLinkToothItem = function (sectionIndex) {
      var formSectionItem = $scope.initializeSectionItem(sectionIndex, 0);

      // null out these
      formSectionItem.BankItemDemographicId = null;
      formSectionItem.FormBankItemDemographic = null;
      formSectionItem.BankItemEmergencyContactId = null;
      formSectionItem.FormBankItemEmergencyContact = null;

      formSectionItem.FormBankItem.FormItemTypeName = 'Link Tooth';
      formSectionItem.FormBankItem.Description = 'Link Tooth';
      formSectionItem.FormItemTypeName = 'Link Tooth';
      formSectionItem.FormItemType = 10;
      formSectionItem.SequenceNumber = sectionIndex;
      return formSectionItem;
    };

    //#endregion

    //#region Text Field Item

    ctrl.addTextFieldItem = function (sectionIndex) {
      var formSectionItem = $scope.initializeSectionItem(sectionIndex, 0);

      formSectionItem.FormItemTextField = {};
      formSectionItem.FormItemTextField.NoteText = null;
      formSectionItem.FormItemTextField.IsRequiredNoteText = true;
      formSectionItem.FormItemTextField.TextFieldItemTypeId = '11';
      formSectionItem.FormItemTextField.ItemTextFieldId =
        '00000000-0000-0000-0000-000000000000';
      formSectionItem.ItemTextFieldId = '00000000-0000-0000-0000-000000000000';

      formSectionItem.FormItemTypeName = 'Note Text';
      formSectionItem.FormItemType = 11;

      formSectionItem.FormBankItem = null;
      formSectionItem.BankItemDemographicId = null;
      formSectionItem.FormBankItemDemographic = null;
      formSectionItem.BankItemEmergencyContactId = null;
      formSectionItem.FormBankItemEmergencyContact = null;
      formSectionItem.FormBankItemDemographic = null;
      formSectionItem.BankItemId = null;
      formSectionItem.SequenceNumber = sectionIndex;

      return formSectionItem;
    };

    //#endregion
  },
]);

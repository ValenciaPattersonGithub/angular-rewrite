'use strict';

angular.module('Soar.BusinessCenter').controller('SectionItemController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  'StaticData',
  function ($scope, $timeout, toastrFactory, localize, staticData) {
    //Copy the sectionItem BELOW the sectionItem which needs to be copied, 'sectionItemIndex' is current index of the sectionItem
    $scope.copySectionItem = function (sectionIndex, sectionItemIndex) {
      $scope.customForm.SectionCopyValidationFlag = sectionItemIndex;
      // Copy sectionItem only if form is Valid.
      if ($scope.isSectionItemValid()) {
        var newSectionItem = angular.copy($scope.sectionItem);
        newSectionItem.SequenceNumber = sectionItemIndex + 1;
        $scope.section.FormSectionItems.splice(
          sectionItemIndex + 1,
          0,
          newSectionItem
        );
        if (newSectionItem.FormItemType === 2) {
          $timeout(function () {
            angular
              .element(
                '#questionYesNoTrueFalseText' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 3) {
          $timeout(function () {
            angular
              .element(
                '#questionMultipleChoiceText' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 7) {
          $timeout(function () {
            angular
              .element(
                '#questionCommentEssayText' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 6) {
          $timeout(function () {
            angular
              .element(
                '#questionEmergencyContactNameCKB' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 1) {
          $timeout(function () {
            angular
              .element(
                '#questionDemographicPreferredNameCKB' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 5) {
          $timeout(function () {
            angular
              .element(
                '#lblDateOfCompletion' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 4) {
          $timeout(function () {
            angular
              .element(
                '#questionSignatureBoxCKB' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 9) {
          $timeout(function () {
            angular
              .element(
                '#questionAdlib1Text' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 10) {
          $timeout(function () {
            angular
              .element(
                '#questionLinkToothText' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        } else if (newSectionItem.FormItemType === 11) {
          $timeout(function () {
            angular
              .element(
                '#questionTextFieldText' +
                  sectionIndex +
                  '_' +
                  (sectionItemIndex + 1)
              )
              .focus();
          }, 0);
        }
        $scope.resequenceFormItems($scope.section.FormSectionItems);
      }
    };

    //Move sectionitem Up.

    var moveSectionItem = function (origin, destination) {
      var temp = $scope.section.FormSectionItems[destination];
      $scope.section.FormSectionItems[destination] =
        $scope.section.FormSectionItems[origin];
      $scope.section.FormSectionItems[origin] = temp;
    };

    $scope.moveSectionItemUp = function (sectionIndex, sectionItemIndex) {
      moveSectionItem(sectionItemIndex, sectionItemIndex - 1);

      if ($scope.sectionItem.FormItemType === 2) {
        $timeout(function () {
          angular
            .element(
              '#questionYesNoTrueFalseText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 3) {
        $timeout(function () {
          angular
            .element(
              '#questionMultipleChoiceText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 7) {
        $timeout(function () {
          angular
            .element(
              '#questionCommentEssayText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 6) {
        $timeout(function () {
          angular
            .element(
              '#questionEmergencyContactNameCKB' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 1) {
        $timeout(function () {
          angular
            .element(
              '#questionDemographicPreferredNameCKB' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 5) {
        $timeout(function () {
          angular
            .element(
              '#lblDateOfCompletion' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 4) {
        $timeout(function () {
          angular
            .element(
              '#questionSignatureBoxCKB' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 9) {
        $timeout(function () {
          angular
            .element(
              '#questionAdlib1Text' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 10) {
        $timeout(function () {
          angular
            .element(
              '#questionLinkToothText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 11) {
        $timeout(function () {
          angular
            .element(
              '#questionTextFieldText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      }
    };

    //Move sectionitem Down.
    $scope.moveSectionItemDown = function (sectionIndex, sectionItemIndex) {
      moveSectionItem(sectionItemIndex, sectionItemIndex + 1);

      if ($scope.sectionItem.FormItemType === 2) {
        $timeout(function () {
          angular
            .element(
              '#questionYesNoTrueFalseText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 3) {
        $timeout(function () {
          angular
            .element(
              '#questionMultipleChoiceText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 7) {
        $timeout(function () {
          angular
            .element(
              '#questionCommentEssayText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 6) {
        $timeout(function () {
          angular
            .element(
              '#questionEmergencyContactNameCKB' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 1) {
        $timeout(function () {
          angular
            .element(
              '#questionDemographicPreferredNameCKB' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 5) {
        $timeout(function () {
          angular
            .element(
              '#lblDateOfCompletion' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 4) {
        $timeout(function () {
          angular
            .element(
              '#questionSignatureBoxCKB' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 9) {
        $timeout(function () {
          angular
            .element(
              '#questionAdlib1Text' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 10) {
        $timeout(function () {
          angular
            .element(
              '#questionLinkToothText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      } else if ($scope.sectionItem.FormItemType === 11) {
        $timeout(function () {
          angular
            .element(
              '#questionTextFieldText' +
                sectionIndex +
                '_' +
                (sectionItemIndex + 1)
            )
            .focus();
        }, 0);
      }
    };

    $scope.initializeSectionItemOption = function (sequenceNumber) {
      var formSectionItemOption = {
        SectionItemId: '',
        SectionItemOptionId: '',
        BankItemId: '',
        BankItemOptionId: '',
        BankItemOption: {
          BankItemOptionId: '',
          OptionIndex: sequenceNumber + 1,
          OptionText: '',
          OptionValue: '',
          IsSelected: '',
          IsVisible: '',
          SequenceNumber: sequenceNumber,
        },
        IsSelected: true,
        IsVisible: true,
        SequenceNumber: sequenceNumber,
      };
      return formSectionItemOption;
    };

    // Function to add new options for MultipleChoice question.
    $scope.addNewMultipleChoiceOption = function (
      sectionIndex,
      sectionItemIndex
    ) {
      var newOptionId = $scope.sectionItem.ItemOptions.length + 1;
      var newOptionObject = $scope.initializeSectionItemOption();
      newOptionObject.BankItemOption.OptionIndex = newOptionId;
      newOptionObject.SequenceNumber = newOptionId;
      newOptionObject.BankItemOption.OptionText = '';
      $scope.sectionItem.ItemOptions.push(newOptionObject);

      // Set focus on latest input field.
      $timeout(function () {
        var elementName =
          '#questionAdlibRpesonses' +
          sectionIndex +
          '_' +
          sectionItemIndex +
          '_' +
          ($scope.sectionItem.ItemOptions.length - 1);
        angular.element(elementName).focus();
      }, 0);
      $scope.resequenceFormItemOptions($scope.sectionItem.ItemOptions);
    };

    //Delete section item
    $scope.deleteSectionItem = function () {
      $scope.section.FormSectionItems.splice($scope.deleteSectionItemIndex, 1);
    };

    // resequence the form items after one is deleted to avoid duplicates
    $scope.resequenceFormItems = function (section) {
      var i = 0;
      angular.forEach(section, function (res) {
        res.SequenceNumber = i;
        i++;
      });
    };

    // resequence the form items after one is deleted to avoid duplicates
    $scope.resequenceFormItemOptions = function (section) {
      var i = 0;
      angular.forEach(section, function (res) {
        res.BankItemOption.OptionIndex = i;
        i++;
      });
    };

    // Function to perform sectionitem Delete action.
    $scope.confirmDeleteSectionItem = function (sectionItemIndex) {
      $scope.deleteSectionItemIndex = sectionItemIndex;
      $scope.resequenceFormItems($scope.section.FormSectionItems);
    };

    // Function to hide delete confirmation box for section item
    $scope.cancelDeleteSectionItemConfirmBox = function () {
      $scope.deleteSectionItemIndex = -1;
    };

    // Function to remove new options for MultipleChoice question.
    $scope.removeAdlibMultipleChoiceOption = function (
      sectionIndex,
      sectionItemIndex
    ) {
      $scope.sectionItem.ItemPromptTextsOptions[0].splice(
        $scope.confirmOptionRemoveIndex,
        1
      );
      $timeout(function () {
        var elementName =
          '#questionAdlibRpesonses' +
          sectionIndex +
          '_' +
          sectionItemIndex +
          '_' +
          ($scope.sectionItem.ItemOptions.length - 1);
        angular.element(elementName).focus();
      }, 0);
      $scope.confirmOptionRemoveIndex = -1;
    };

    // Function to remove new options for MultipleChoice question.
    $scope.removeMultipleChoiceOption = function (
      sectionIndex,
      sectionItemIndex
    ) {
      $scope.sectionItem.ItemOptions.splice($scope.confirmOptionRemoveIndex, 1);
      $timeout(function () {
        var elementName =
          '#questionMultipleChoiceOptionText' +
          sectionIndex +
          '_' +
          sectionItemIndex +
          '_' +
          ($scope.sectionItem.ItemOptions.length - 1);
        angular.element(elementName).focus();
      }, 0);
      $scope.confirmOptionRemoveIndex = -1;
      $scope.resequenceFormItemOptions($scope.sectionItem.ItemOptions);
    };

    // Function to cancel remove new options operation for MultipleChoice question.
    $scope.cancelRemoveMultipleChoiceOption = function () {
      $scope.confirmOptionRemoveIndex = -1;
    };

    // Function to cancel remove new options operation for MultipleChoice question.
    $scope.confirmRemoveMultipleChoiceOption = function (optionObject, index) {
      $scope.confirmOptionRemoveIndex = index;
      $scope.resequenceFormItems($scope.sectionItem.ItemOptions);
    };

    // Validate section item
    $scope.isSectionItemValid = function () {
      var isValid = true;

      if (
        $scope.sectionItem.FormItemType === 2 ||
        $scope.sectionItem.FormItemType === 8
      ) {
        if (!$scope.sectionItem.FormBankItem.ItemText) {
          isValid = false;
        }
      }
      if ($scope.sectionItem.FormItemType === 3) {
        if (!$scope.sectionItem.FormBankItem.ItemText) {
          isValid = false;
        }
      }
      if ($scope.sectionItem.FormItemType === 7) {
        if (!$scope.sectionItem.FormBankItem.ItemText) {
          isValid = false;
        }
      }
      // validation
      if ($scope.sectionItem.FormItemType === 9) {
        angular.forEach(
          $scope.sectionItem.FormBankItemPromptTexts,
          function (formBankItemPromptText) {
            if (!formBankItemPromptText.ItemText) {
              isValid = false;
            }
          }
        );
      }
      if ($scope.sectionItem.FormItemType === 10) {
        if (!$scope.sectionItem.FormBankItem.ItemText) {
          isValid = false;
        }
      }
      if ($scope.sectionItem.FormItemType === 11) {
        // TODO verify field
        if (!$scope.sectionItem.FormItemTextField.NoteText) {
          isValid = false;
        }
      }
      return isValid;
    };

    $scope.initializeAdlibSectionItemOption = function (
      sequenceNumber,
      optionIndex
    ) {
      var formSectionItemOption =
        $scope.initializeSectionItemOption(sequenceNumber);
      formSectionItemOption.BankItemOption.OptionIndex = optionIndex;
      formSectionItemOption.BankItemOption.SequenceNumber = sequenceNumber;
      return formSectionItemOption;
    };

    // Function to add new options for Adlib question.
    $scope.addNewAdlibResponse = function (sectionIndex, sectionItemIndex) {
      // get next available optionIndex
      var optionIndex = $scope.sectionItem.ItemPromptTextsOptions[0].length + 1;
      // until we allow 3 or more prompts this is always 1
      var sequenceNumber = 1;
      var newResponse = $scope.initializeAdlibSectionItemOption(
        sequenceNumber,
        optionIndex
      );
      $scope.sectionItem.ItemPromptTextsOptions[0].push(newResponse);

      // Set focus on latest input field.
      $timeout(function () {
        var elementName =
          '#questionAdlibOptionText' +
          sectionIndex +
          '_' +
          sectionItemIndex +
          '_' +
          ($scope.sectionItem.ItemPromptTextsOptions[0].length - 1);
        angular.element(elementName).focus();
      }, 0);
    };

    //#region Link Tooth

    var ctrl = this;
    // we only need to load the select options if this is a Link Tooth type
    ctrl.loadTeethSelectOptions = function (sectionItem) {
      if (sectionItem.FormItemType === 10) {
        staticData.TeethDefinitions().then(function (res) {
          var teethDefinitions = res.Value;
          var patTeeth = new kendo.data.DataSource({
            data: teethDefinitions.Teeth,
          });
          // localize placeholder text
          var placeholderText = localize.getLocalizedString('Select teeth...');

          var teethSelectOptions = {
            placeholder: placeholderText,
            dataSource: patTeeth,
            dataTextField: 'USNumber',
            dataValueField: 'USNumber',
            valuePrimitive: true,
            autoBind: false,
          };
          sectionItem.$$activeTeeth = [];
          sectionItem.$$TeethSelectOptions = {};
          sectionItem.$$TeethSelectOptions = teethSelectOptions;
        });
      }
    };
    ctrl.loadTeethSelectOptions($scope.sectionItem);

    //#endregion

    $scope.yesNoTrueFalseOptions = [
      { label: localize.getLocalizedString('yes or no'), value: 2 },
      { label: localize.getLocalizedString('true or false'), value: 8 },
    ];
  },
]);

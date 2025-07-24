'use strict';

angular.module('Soar.BusinessCenter').controller('SectionCrudController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  function ($scope, $timeout, toastrFactory, localize) {
    // Edit Section
    $scope.editSection = function (sectionIndex) {
      if ($scope.customForm.IndexOfSectionInEditMode == -1) {
        $scope.customForm.IndexOfSectionInEditMode = sectionIndex;
        $scope.allowSectionOpen = true;
        return true;
      } else {
        toastrFactory.error(
          localize.getLocalizedString(
            'You may only edit one section at a time. Please close open section.'
          ),
          localize.getLocalizedString('Error')
        );
        $scope.allowSectionOpen = false;
        return false;
      }
    };

    // resequence the form items after one is deleted to avoid duplicates
    $scope.resequenceFormItems = function () {
      var i = 0;
      angular.forEach($scope.customForm.FormSections, function (res) {
        res.SequenceNumber = i;
        i++;
      });
    };

    //Delete section
    $scope.deleteSection = function (sectionIndex) {
      $scope.customForm.FormSections.splice(sectionIndex, 1);
      $scope.customForm.IndexOfSectionInEditMode = -1;
      $scope.deleteSectionIndex = -1;
    };

    // Function to perform section Cancel Delete action.
    $scope.cancelDeleteSection = function () {
      $scope.deleteSectionIndex = -1;
    };

    // Function to perform section Execute Delete action.
    $scope.confirmDeleteSection = function (sectionIndex) {
      $scope.deleteSectionIndex = sectionIndex;
      $scope.resequenceFormItems();
    };
  },
]);

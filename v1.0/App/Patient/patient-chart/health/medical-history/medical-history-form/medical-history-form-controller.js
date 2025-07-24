'use strict';

angular.module('Soar.Patient').controller('MedicalHistoryFormController', [
  '$scope',
  function controllerConstructor($scope) {
    $scope.$watch(
      'medicalHistoryFormSections',
      function setThreeColumnSections(newSections, oldSections) {
        if (
          !angular.equals(newSections, oldSections) &&
          newSections &&
          newSections.length
        ) {
          newSections = newSections.map(function (section) {
            if (section.Title === 'Present Conditions') {
              section.$$threeColumn = true;

              section.FormSectionItems = section.FormSectionItems.map(
                function (sectionItem) {
                  sectionItem.$$threeColumn = true;
                  return sectionItem;
                }
              );
            }

            return section;
          });
        }
      }
    );
  },
]);

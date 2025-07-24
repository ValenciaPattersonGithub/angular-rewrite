'use strict';
angular
  .module('Soar.BusinessCenter')
  .controller('NoteTemplatesListController', [
    '$scope',
    '$routeParams',
    'localize',
    '$location',
    'ListHelper',
    'toastrFactory',
    '$filter',
    'soarAnimation',
    'NoteTemplatesHttpService',
    'ModalFactory',
    '$timeout',
    'patSecurityService',
    function (
      $scope,
      $routeParams,
      localize,
      $location,
      listHelper,
      toastrFactory,
      $filter,
      soarAnimation,
      noteTemplatesHttpService,
      modalFactory,
      $timeout,
      patSecurityService
    ) {
      var ctrl = this;

      // init
      ctrl.$onInit = function () {
        ctrl.getTemplateCategoriesWithTemplates();
        $scope.searchTerm = { value: '' };
        $scope.showClearButton = false;
        $scope.searchTimeout = null;
        $scope.searchMode = false;
        $scope.noteTemplates = [];
        ctrl.noteTemplatesBackup = [];
        $scope.noteCategories = [];
        $scope.loadingMessageNoCategoryResults =
          '<i class="fa fa-2x fa-minus-circle"></i> ' +
          localize.getLocalizedString('There are no template categories.');
        $scope.loadingMessageNoTemplateResults =
          '<i class="fa fa-2x fa-minus-circle"></i> ' +
          localize.getLocalizedString('There are no templates.');
        $scope.NewCategory = {
          newCategoryName: '',
        };
        $scope.authAccess = noteTemplatesHttpService.access();
        if (!$scope.authAccess.view) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-clin-nottmp-view'),
            'Not Authorized'
          );
          event.preventDefault();
          $location.path(_.escape('/'));
        }
        $scope.newActions = [];
      };

      //#region watches

      // sorting
      noteTemplatesHttpService.observeCategories(function (noteCategories) {
        ctrl.noteCategories = noteCategories;
        if ($scope.searchMode) {
          $scope.search($scope.searchTerm.value);
        }
        $scope.noteCategories = noteTemplatesHttpService.naturalSort(
          ctrl.noteCategories,
          'CategoryName'
        );
        ctrl.updateCategoryVisibleFlags(true);
      });

      // watches the change in active category
      $scope.$watch(
        function () {
          return noteTemplatesHttpService.ActiveTemplateCategory;
        },
        function (nv) {
          $scope.activeCategory = nv;
        }
      );

      // watches the change in active template
      $scope.$watch(
        function () {
          return noteTemplatesHttpService.ActiveNoteTemplate;
        },
        function (nv) {
          $scope.activeTemplate = nv;
        }
      );

      // listening for changes to collapseAll, closing all the categories
      $scope.$watch('collapseAll', function (nv, ov) {
        angular.forEach($scope.noteCategories, function (category) {
          category.show = false;
          category.ntExpand = false;
        });
        $scope.collapseAll = false;
        $scope.selectedTemplate = {};
      });

      // listening for changes to collapseAll, setting dirty flag accordingly
      $scope.$watch('NewCategory.newCategoryName', function (nv) {
        $scope.NewCategory.newCategoryName = angular.isUndefined(nv) ? '' : nv;
        $scope.newCategoryName = nv;
        if (nv !== '') {
          noteTemplatesHttpService.setTemplateDataChanged(true);
        } else {
          noteTemplatesHttpService.setTemplateDataChanged(false);
        }
      });

      //#endregion

      //#region broadcast listeners

      // broadcast by the parent to keep items in the list updated
      $scope.$on(
        'soar:update-template-in-list',
        function (e, template, editing) {
          var category = listHelper.findItemByFieldValue(
            $scope.noteCategories,
            'CategoryId',
            template.CategoryId
          );
          if (category) {
            category.$$hasTemplates = true;
            if (category.$$Loaded || editing) {
              var index = listHelper.findIndexByFieldValue(
                $scope.noteTemplates,
                'TemplateId',
                template.TemplateId
              );
              if (index > -1) {
                var staleNoteTemplate = listHelper.findItemByFieldValue(
                  $scope.noteTemplates,
                  'TemplateId',
                  template.TemplateId
                );
                var categoryDidChange =
                  staleNoteTemplate.CategoryId !== category.CategoryId;
                if (categoryDidChange) {
                  var noteTemplatesWithCategory =
                    listHelper.findItemsByFieldValue(
                      $scope.noteTemplates,
                      'CategoryId',
                      staleNoteTemplate.CategoryId
                    );
                  var isLastTemplateInCategory =
                    !!noteTemplatesWithCategory &&
                    noteTemplatesWithCategory.length === 1;
                  // if note template was moved to a new category and the category it is leaving will no longer have any templates we need to set $$hasTemplates = false
                  if (isLastTemplateInCategory) {
                    var oldCategory = listHelper.findItemByFieldValue(
                      $scope.noteCategories,
                      'CategoryId',
                      staleNoteTemplate.CategoryId
                    );
                    oldCategory.$$hasTemplates = false;
                  }
                }
                $scope.noteTemplates.splice(index, 1, template);
              } else if (category.$$Loaded) {
                $scope.noteTemplates.push(template);
              }
              $scope.noteTemplates = noteTemplatesHttpService.naturalSort(
                $scope.noteTemplates,
                'TemplateName'
              );
              ctrl.noteTemplatesBackup = angular.copy($scope.noteTemplates);
            }

            $scope.getNoteTemplatesForCategory(category, false);
          }
        }
      );

      // broadcast by the parent to allow the category to be deleted
      $scope.$on(
        'soar:last-template-in-category-deleted',
        function (e, categoryId) {
          var category = listHelper.findItemByFieldValue(
            $scope.noteCategories,
            'CategoryId',
            categoryId
          );
          category.$$hasTemplates = false;
        }
      );

      //#endregion

      //#region search

      //
      $scope.$watch(
        'unloadedCategoriesCount',
        function (nv, ov) {
          if (nv === 0 && ov === 1 && $scope.searchMode === true) {
            $scope.search($scope.searchTerm.value);
          }
        },
        true
      );

      // perform the search
      $scope.search = function (term) {
        $scope.searchMode = true;
        // when filtering for the first time or after a new category has been added, we need to make sure all the templates have been loaded
        var unloadedCategories = listHelper.findItemsByFieldValue(
          $scope.noteCategories,
          '$$Loaded',
          false
        );
        $scope.unloadedCategoriesCount =
          unloadedCategories !== null ? unloadedCategories.length : 0;
        if ($scope.unloadedCategoriesCount > 0) {
          angular.forEach($scope.noteCategories, function (cat) {
            if (!cat.$$Loaded) {
              $scope.getNoteTemplatesForCategory(cat, false);
            }
          });
        } else {
          $timeout(function () {
            if ($scope.activeCategory) {
              $scope.activeCategory.ntExpand = false;
            }
            if (term === '') {
              $scope.clearNoteTemplatesSearch();
              return;
            }
            if (!angular.isUndefined(term)) {
              $scope.showClearButton = true;
              $scope.noteTemplates = angular.copy(ctrl.noteTemplatesBackup);
              $scope.noteTemplates = $filter('filter')($scope.noteTemplates, {
                TemplateName: _.toLower(term),
              });
              ctrl.updateCategoryVisibleFlags(false);
              angular.forEach($scope.noteTemplates, function (nt) {
                var category = listHelper.findItemByFieldValue(
                  $scope.noteCategories,
                  'CategoryId',
                  nt.CategoryId
                );
                if (category) {
                  category.$$Visible = true;
                }
              });
            }
          }, 100);
        }
      };

      // clear the search and reset the categories and templates
      $scope.clearNoteTemplatesSearch = function () {
        $scope.searchTerm = { value: '' };
        $scope.selectedTemplate = {};
        $scope.showClearButton = false;
        $scope.searchMode = false;
        $scope.noteTemplates = angular.copy(ctrl.noteTemplatesBackup);
        ctrl.updateCategoryVisibleFlags(true);
      };

      //#endregion

      //#region getting data

      // get note template categories
      ctrl.getNoteTemplateCategories = function () {
        $scope.loadingCategories = true;
        noteTemplatesHttpService.categories().then(
          function (res) {
            $scope.noteCategories = res.Value;
            angular.forEach($scope.noteCategories, function (cat) {
              $scope.getNoteTemplatesForCategory(cat, false);
              cat.$$Loaded = false;
            });
            ctrl.updateCategoryVisibleFlags(true);
            $scope.loadingCategories = false;
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again.',
                ['Clinical Note Templates']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      };

      // load categories to scope
      ctrl.loadCategoriesAndTemplates = function (categories) {
        ctrl.noteTemplates = [];
        _.forEach(categories, function (category) {
          _.forEach(category.Templates, function (template) {
            template.$$CategoryName = category.CategoryName;
          });
          ctrl.noteTemplates = _.concat(ctrl.noteTemplates, category.Templates);
        });
        // load scope objects
        $scope.noteCategories = _.cloneDeep(categories);
        // mark visible
        ctrl.updateCategoryVisibleFlags(true);
        $scope.noteTemplates = _.cloneDeep(ctrl.noteTemplates);

        // backup templates
        ctrl.noteTemplatesBackup = angular.copy(ctrl.noteTemplates);
        // indicators
        $scope.loadingCategories = false;
        $scope.loadingTemplates = false;
      };

      // get note template categories
      // NOTE the new api will deliver categories with templates
      ctrl.getTemplateCategoriesWithTemplates = function () {
        $scope.loadingCategories = true;
        $scope.loadingTemplates = true;
        noteTemplatesHttpService.CategoriesWithTemplates().then(
          function (res) {
            ctrl.loadCategoriesAndTemplates(res.Value);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again.',
                ['Clinical Note Templates']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      };

      // get note templates
      $scope.getNoteTemplatesForCategory = function (
        category,
        attemptingToDeleteCategory
      ) {
        if (!category.$$Loaded) {
          $scope.loadingTemplates = true;
          noteTemplatesHttpService.getTemplates(category.CategoryId).then(
            function (res) {
              angular.forEach(res.Value, function (nt) {
                var index = listHelper.findIndexByFieldValue(
                  $scope.noteTemplates,
                  'TemplateId',
                  nt.TemplateId
                );
                // if template is already in list it must have been moved from a category that was already loaded, just remove it
                if (index !== -1) {
                  $scope.noteTemplates.splice(index, 1);
                }
                // for display when in view mode
                nt.$$CategoryName = category.CategoryName;
              });
              $scope.noteTemplates = $scope.noteTemplates.concat(res.Value);
              ctrl.noteTemplatesBackup = angular.copy($scope.noteTemplates);
              // if there are no templates assigned to category, allow delete
              category.$$hasTemplates =
                res && res.Value.length === 0 ? false : true;
              $scope.loadingTemplates = false;
              category.$$Loaded = true;
              $scope.unloadedCategoriesCount =
                $scope.unloadedCategoriesCount > 0
                  ? $scope.unloadedCategoriesCount - 1
                  : 0;
              if (attemptingToDeleteCategory && !category.$$hasTemplates) {
                // if attemptingToDeleteCategory is true this was called by the user clicking the delete icon,
                // going ahead and calling deleteCategory if there are no templates
                $scope.deleteCategory(category);
              }
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again.',
                  ['Clinical Note Templates']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
      };

      //#endregion

      //#region selecting note template

      //#region for copy
      $scope.copyNoteTemplete = function (template) {
        if ($scope.editMode === false) {
          $scope.loadNoteTemplate(template, true, 'copy');
          $scope.existingTemplateActive = true;
          toastrFactory.success(
            localize.getLocalizedString('Template Copied'),
            localize.getLocalizedString('Success')
          );
        }
      };

      // loads existing note templates in the crud area
      $scope.loadNoteTemplate = function (template, editMode, operation) {
        $scope.editMode = editMode;
        $scope.selectedTemplate = { Template: template };
        if (
          $scope.searchMode == false &&
          $scope.activeCategory &&
          $scope.activeCategory.addingNewTemplate == true
        ) {
          noteTemplatesHttpService.CloseTemplateHeader($scope.activeCategory);
        }
        noteTemplatesHttpService.SetActiveNoteTemplate($scope.selectedTemplate);
        noteTemplatesHttpService.SetCurrentOperation(operation);
      };

      // indicate current note type
      $scope.isSelectedNoteTemplate = function (template) {
        if (
          $scope.selectedTemplate &&
          $scope.selectedTemplate.Template &&
          $scope.selectedTemplate.Template.TemplateId
        ) {
          return (
            $scope.selectedTemplate.Template.TemplateId === template.TemplateId
          );
        }
        return false;
      };

      //#endregion

      //#region add template

      // add template button handler
      $scope.addTemplate = function () {
        $scope.selectedTemplate = {
          Template: {
            TemplateId: null,
            TemplateName: '',
            CategoryId: $scope.activeCategory
              ? $scope.activeCategory.CategoryId
              : null,
            TemplateBodyFormId: null,
          },
          TemplateBodyCustomForm: {
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
          },
        };
        noteTemplatesHttpService.SetActiveNoteTemplate($scope.selectedTemplate);
        $scope.editMode = true;
        $scope.existingTemplateActive = false;
      };

      //#endregion

      //#region category crud helpers

      // modal launcher
      $scope.launchWarningModal = function () {
        modalFactory.WarningModal().then(function (result) {
          if (result === true) {
            ctrl.clearNoteCategory();
          } else if (result === false) {
          }
        });
      };

      // cancel button handler, launch modal or clear changes
      $scope.cancelNoteCategory = function () {
        if ($scope.NewCategory.newCategoryName != '') {
          $scope.launchWarningModal();
        } else {
          ctrl.clearNoteCategory();
        }
      };

      // clean up unwanted category
      ctrl.clearNoteCategory = function () {
        $scope.isAddCategory = false;
        $scope.NewCategory.newCategoryName = '';
        noteTemplatesHttpService.setTemplateDataChanged(false);
      };

      // expands the category and collapse the rest
      $scope.expandCategory = function (category) {
        $scope.getNoteTemplatesForCategory(category, false);
        $scope.isAddCategory = false;
        noteTemplatesHttpService.ExpandOrCollapseCategory(category);
        ctrl.collapseAll(category);
      };

      // collapsing all other categories
      ctrl.collapseAll = function (category) {
        angular.forEach($scope.noteCategories, function (cat) {
          if (cat.CategoryId !== category.CategoryId) {
            cat.ntExpand = false;
            cat.addingNewTemplate = false;
          }
        });
      };

      // update visible flag
      ctrl.updateCategoryVisibleFlags = function (value) {
        angular.forEach($scope.noteCategories, function (cat) {
          cat.$$Visible = value;
        });
      };

      //#endregion

      //#region add category

      // creates crud for creating category
      $scope.createEmptyCategory = function () {
        if ($scope.authAccess.update) {
          $scope.isAddCategory = !$scope.isAddCategory;
          $scope.formIsValid = true;
          angular.forEach($scope.noteCategories, function (cat) {
            cat.ntExpand = false;
            cat.addingNewTemplate = false;
          });
          noteTemplatesHttpService.SetActiveNoteTemplate(
            noteTemplatesHttpService.NewTemplate
          );
        }
      };

      // adds new category
      $scope.addCategory = function () {
        if ($scope.authAccess.create) {
          $scope.formIsValid = true;
          // checks empty field
          if (
            !$scope.NewCategory.newCategoryName ||
            $scope.NewCategory.newCategoryName.length == 0
          ) {
            $scope.duplicateNoteCategory = false;
            $scope.formIsValid = false;
          }
          // checks if the category name already exists
          else if (
            $scope.noteCategories.filter(function (item) {
              return (
                item.CategoryName.toLowerCase() ==
                $scope.NewCategory.newCategoryName.toLowerCase()
              );
            }).length > 0
          ) {
            $scope.duplicateNoteCategory = true;
            $scope.formIsValid = false;
          }
          if ($scope.formIsValid) {
            $scope.isAddCategory = !$scope.isAddCategory;
            noteTemplatesHttpService
              .saveCategory({
                CategoryName: $scope.NewCategory.newCategoryName,
              })
              .then(
                function (res) {
                  toastrFactory.success(
                    localize.getLocalizedString('Your {0} has been created.', [
                      'Clinical Note Template Category',
                    ]),
                    localize.getLocalizedString('Success')
                  );
                },
                function () {
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Save was unsuccessful. Please retry your save.'
                    ),
                    localize.getLocalizedString('Server Error')
                  );
                }
              );
            $scope.NewCategory.newCategoryName = '';
          }
        }
      };

      //#endregion

      //#region update category

      // click handler for 'Rename Category'
      $scope.toggleCategoryEdit = function (category) {
        if ($scope.editMode === false) {
          category.duplicateNoteCategory = false;
          // making a backup of CategoryName for cancel, etc.
          category.categoryNameBackup = angular.copy(category.CategoryName);
          // if they add new category open, close it
          $scope.isAddCategory = false;
          angular.forEach($scope.noteCategories, function (cat) {
            // making sure that only one can be edited at a time
            cat.$$editing =
              cat.CategoryId !== category.CategoryId ? false : !cat.$$editing;
          });
          $scope.editCategory = category.$$editing;
        }
      };

      // update note category
      $scope.updateCategory = function (category) {
        category.duplicateNoteCategory =
          $scope.noteCategories.filter(function (item) {
            return (
              item.CategoryName.toLowerCase() ===
              category.CategoryName.toLowerCase()
            );
          }).length > 1;
        if (!category.duplicateNoteCategory && category) {
          // only make the call if the name was updated
          if (
            !angular.equals(category.CategoryName, category.categoryNameBackup)
          ) {
            noteTemplatesHttpService.saveCategory(category).then(
              function (result) {
                toastrFactory.success(
                  localize.getLocalizedString('Your {0} has been updated.', [
                    'Clinical Note Template Category',
                  ]),
                  localize.getLocalizedString('Success')
                );
                category.$$editing = false;
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Update was unsuccessful. Please retry your update.'
                  ),
                  localize.getLocalizedString('Server Error')
                );
              }
            );
          } else {
            category.$$editing = false;
          }
          $scope.editCategory = false;
        }
      };

      // cancelling category update
      $scope.cancelUpdateCategory = function (category) {
        category.CategoryName = angular.copy(category.categoryNameBackup);
        category.$$editing = false;
        $scope.editCategory = false;
      };

      //#endregion

      //#region delete category

      // delete category link handler
      $scope.deleteCategory = function (category) {
        if (!category.$$Loaded) {
          // if this category hasn't loaded yet, we need to check for templates assigned to it before we can delete
          $scope.getNoteTemplatesForCategory(category, true);
        } else if ($scope.editMode === false && !category.$$hasTemplates) {
          modalFactory
            .DeleteModal('note category ', category.CategoryName, true)
            .then(function () {
              ctrl.confirmDeleteNoteCategory(category);
            });
        }
      };

      // calling delete category api
      ctrl.confirmDeleteNoteCategory = function (category) {
        noteTemplatesHttpService
          .deleteNoteCategory(category.CategoryId)
          .then(function (result) {
            var index = listHelper.findIndexByFieldValue(
              $scope.noteCategories,
              'CategoryId',
              category.CategoryId
            );
            if (index !== -1) {
              $scope.noteCategories.splice(index, 1);
            }
          });
      };

      //#endregion

      //#region edit

      // edit note link handler, puts page in edit mode
      $scope.editNoteTemplate = function (template) {
        if ($scope.editMode === false) {
          $scope.loadNoteTemplate(template, true, 'edit');
          $scope.existingTemplateActive = true;
        }
      };

      //#endregion

      //#region delete

      // instantiate delete modal, etc.
      $scope.deleteNoteTemplate = function (template) {
        if (template.TemplateName && $scope.editMode === false) {
          modalFactory
            .DeleteModal('note template ', template.TemplateName, true)
            .then(function () {
              ctrl.confirmDeleteNoteTemplate(template);
            });
        }
      };

      // calling delete api and handling success
      ctrl.confirmDeleteNoteTemplate = function (template) {
        noteTemplatesHttpService.deleteNoteTemplate(template.TemplateId).then(
          function (result) {
            toastrFactory.success(
              localize.getLocalizedString('Your {0} has been deleted.', [
                'Clinical Note Template',
              ]),
              localize.getLocalizedString('Success')
            );
            var index = listHelper.findIndexByFieldValue(
              $scope.noteTemplates,
              'TemplateId',
              template.TemplateId
            );
            // removing the deleted template from the list
            if (index !== -1) {
              $scope.noteTemplates.splice(index, 1);
            }
            ctrl.noteTemplatesBackup = angular.copy($scope.noteTemplates);
            var noteTemplates = listHelper.findItemsByFieldValue(
              $scope.noteTemplates,
              'CategoryId',
              template.CategoryId
            );
            if (!noteTemplates) {
              var CategoryId = template.CategoryId;
              $scope.$broadcast(
                'soar:last-template-in-category-deleted',
                CategoryId
              );
            }
            noteTemplatesHttpService.SetActiveNoteTemplate({});
            $scope.editMode = false;
            $scope.existingTemplateActive = false;
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Delete was unsuccessful. Please refresh the page and retry your delete.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      };

      //#endregion
    },
  ]);

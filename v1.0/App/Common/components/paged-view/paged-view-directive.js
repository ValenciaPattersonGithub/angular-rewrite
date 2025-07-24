'use strict';

angular.module('common.directives').directive('pagedView', [
  '$compile',
  function ($compile) {
    //Note: due to issues with inner transcludes, the template for this must be kept in the same file.
    var template =
      '<div class="paged-view">' +
      '<div class="paged-view-items ">' +
      '<div class="inner-transclude items-container-classes" ng-repeat="{{childScopeName}} in itemsOnPage">' +
      '</div>' +
      '</div>' +
      '<br/>' +
      '<div class="pagen-navigation pull-left">' +
      '<span ng-show="currentPage !== 1 && itemsOnPage && itemsOnPage.length > 1" ng-click="previousPage()" class="pagen-prev pull-left">&lt; Prev</span>' +
      '<div class="pull-left" ng-repeat="pageItem in pageList">' +
      '<span ng-if="pageItem.selectable" class="pagen pagen-selectable" ng-click="goToPage(pageItem.page)" ng-bind-html="pageItem.text" ng-class="{\'pagen-current\' : pageItem.page === currentPage}"></span>' +
      '<span ng-if="!pageItem.selectable" class="pagen" ng-class="{\'pagen-current\' : pageItem.page === currentPage}">{{pageItem.text}}</span>' +
      '</div>' +
      '<span ng-show="currentPage !== maxPage && itemsOnPage && itemsOnPage.length > 1" ng-click="nextPage()" class="pagen-next pull-left">Next &gt;</span>' +
      '</div>' +
      '</div>';
    return {
      restrict: 'E',
      scope: {
        items: '=',
        childScopeName: '@',
        itemsPerPage: '=?',
        itemsContainerClasses: '@',
      },
      compile: function (element) {
        var transclude = element.html();
        element.html('');
        return function (scope, elem, attrs, ctrl) {
          var identifiedTemplate = template.replace(
            '{{childScopeName}}',
            scope.childScopeName || 'item'
          );
          identifiedTemplate = identifiedTemplate.replace(
            'items-container-classes',
            scope.itemsContainerClasses || ''
          );
          var templateElement = angular.element(identifiedTemplate);
          angular
            .element(
              templateElement[0].getElementsByClassName('inner-transclude')
            )
            .append(transclude);

          $compile(templateElement)(scope);
          elem.append(templateElement);

          scope.maxPage = 1;
          scope.currentPage = 1;
          scope.pageList = [1];
          scope.itemsOnPage = [];
          scope.showItems = false;
          scope.controller = scope.$parent;

          if (!scope.itemsPerPage || isNaN(scope.itemsPerPage)) {
            scope.itemsPerPage = 10;
          } else if (scope.itemsPerPage < 1 || scope.itemsPerPage > 100) {
            if (scope.itemsPerPage < 1 || scope.itemsPerPage > 100) {
              console.warn(
                'paged-view: itemsPerPage must be between 1 and 100. Reset value to 10.'
              );
            }
            scope.itemsPerPage = 10;
          }

          function loadItemsForCurrentPage() {
            if (scope.items && scope.items.length) {
              var startIndex = (scope.currentPage - 1) * scope.itemsPerPage;

              var endIndex = startIndex;
              if (
                scope.currentPage === scope.maxPage &&
                scope.items.length % scope.itemsPerPage
              ) {
                endIndex =
                  startIndex + (scope.items.length % scope.itemsPerPage);
              } else {
                endIndex = scope.currentPage * scope.itemsPerPage;
              }
              scope.itemsOnPage = scope.items.slice(startIndex, endIndex);
            } else {
              scope.itemsOnPage = [];
            }
          }

          function setupPageList() {
            scope.pageList = [];
            if (scope.maxPage > 1) {
              if (scope.maxPage > 5) {
                if (scope.currentPage <= 3) {
                  for (var i = 1; i < 5; i++) {
                    scope.pageList.push({
                      text: i.toString(),
                      selectable: scope.currentPage !== i,
                      page: i,
                    });
                  }
                  scope.pageList.push({ text: '...', selectable: false });
                  scope.pageList.push({
                    text: scope.maxPage.toString(),
                    selectable: scope.currentPage !== scope.maxPage,
                    page: scope.maxPage,
                  });
                } else if (scope.currentPage >= scope.maxPage - 2) {
                  scope.pageList.push({
                    text: '1',
                    selectable: scope.currentPage !== 1,
                    page: 1,
                  });
                  scope.pageList.push({ text: '...', selectable: false });
                  for (var i = scope.maxPage - 3; i <= scope.maxPage; i++) {
                    scope.pageList.push({
                      text: i.toString(),
                      selectable: scope.currentPage !== i,
                      page: i,
                    });
                  }
                } else {
                  scope.pageList.push({
                    text: '1',
                    selectable: scope.currentPage !== 1,
                    page: 1,
                  });
                  scope.pageList.push({ text: '...', selectable: false });
                  for (
                    var i = scope.currentPage - 1;
                    i <= scope.currentPage + 1;
                    i++
                  ) {
                    scope.pageList.push({
                      text: i.toString(),
                      selectable: scope.currentPage !== i,
                      page: i,
                    });
                  }
                  scope.pageList.push({ text: '...', selectable: false });
                  scope.pageList.push({
                    text: scope.maxPage.toString(),
                    selectable: scope.currentPage !== scope.maxPage,
                    page: scope.maxPage,
                  });
                }
              } else {
                for (var i = 1; i <= scope.maxPage; i++) {
                  scope.pageList.push({
                    text: i.toString(),
                    selectable: scope.currentPage !== i,
                    page: i,
                  });
                }
              }
            } else {
              scope.pageList = [{ text: '1', selectable: false, page: 1 }];
            }
          }

          function setupPaging() {
            if (scope.items && scope.items.length) {
              scope.maxPage = Math.floor(
                scope.items.length / scope.itemsPerPage
              );
              if (scope.items.length % scope.itemsPerPage) {
                scope.maxPage++;
              }

              if (scope.currentPage > scope.maxPage) {
                scope.currentPage = scope.maxPage;
              }

              setupPageList();
              loadItemsForCurrentPage();
            } else {
              scope.itemsOnPage = [];
              scope.currentPage = 1;
            }
          }

          setupPaging();

          scope.$watchCollection('items', function itemsChanged(nv, ov) {
            setupPaging();
          });

          scope.goToPage = function goToPage(pageNumber) {
            if (pageNumber > 0 && pageNumber <= scope.maxPage) {
              scope.currentPage = pageNumber;
              setupPaging();
            }
          };

          scope.previousPage = function previousPage() {
            scope.goToPage(scope.currentPage - 1);
          };

          scope.nextPage = function nextPage() {
            scope.goToPage(scope.currentPage + 1);
          };

          scope.$on('$destroy', function () {
            for (var scopeItem in scope) {
              if (
                scopeItem &&
                scope.hasOwnProperty(scopeItem) &&
                !scopeItem.startsWith('$')
              ) {
                scope[scopeItem] = null;
              }
            }

            if (scope.$$watchers && scope.$$watchers.length) {
              for (var i = 0; i < scope.$$watchers.length; i++) {
                scope.$$watchers[i].fn = null;
              }
            }

            scope.$$watchers = [];
            scope.$$listeners.$destroy = null;
            scope.$$listeners.kendoWidgetCreated = null;
            scope.$$listeners = {};
          });
        };
      },
    };
  },
]);

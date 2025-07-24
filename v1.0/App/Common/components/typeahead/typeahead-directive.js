'use strict';

/*
 * TYPEAHEAD HOW-TO
 *
 *
 * Basic Use:
 *
 * <typeahead class="soar-typeahead" placeholder="Search for User..." items="users" loading="fetchingData" term="searchCriteria" search="searchUsers(term)" cancel="cancel()" select="selectUser(item)">
 *      <ul ng-show="users.length > 0">
 *          <li typeahead-item="user" ng-repeat="user in users" class="results">
 *              DISPLAY LAYOUT HERE
 *          </li>
 *      </ul>
 *      <div ng-show="users.length == 0">
 *          EMPTY MESSAGE HERE
 *      </div>
 * </typeahead>
 *
 *
 * Important things to note:
 *
 * (1) Make sure to keep the variable 'term' inside the search function and 'item' inside the select function.
 *      You can name the term="" variable whatever you want.
 * (2) Make sure to use the child directive 'typeahead-item' and pass the single object you are displaying.
 * (3) Make sure to wrap your search function inside a timeout to avoid taxing the servers, give 300-500ms timeout for user input.
 *
 *
 * How your methods should look-ish:
 *
 * (1) search="searchUsers(term)"
 *          var searchCall;
 *          $scope.searchUsers = function (term) {
 *              if (!searchCall) {
 *                  $scope.fetchingData = true; // mark loading as true
 *                  $scope.users = []; // empty out the display array
 *                  searchCall = $timeout(CALL TO GET DATA, 400); // disable loading on success/error, null out searchCall
 *              }
 *          }
 *
 * (2) cancel="cancel()"
 *          $scope.cancel = function () {
 *              if (searchCall) {
 *                  $scope.fetchingData = false; // disable loading
 *                  $scope.searchCriteria = ''; // clear the search criteria
 *                  searchCall.cancel(); // cancel the timeout
 *              }
 *          }
 *
 * (3) select="selectUser(item)"
 *            $scope.selectUser = function (item) {
 *                  $scope.selectedUser = item; // set the selected user
 *                  $scope.searchCriteria = item.FirstName + ' ' + item.LastName; // change the display value based on what is selected
 *            }
 *
 *
 * Things to watch out for:
 *
 * (1) If the searchCriteria isn't getting set, you most likely have some funcky inner scope issues. Beware of ng-switch and other directives that create that inner scope.
 */

angular
  .module('common.directives')
  .directive('typeahead', [
    '$timeout',
    'patSecurityService',
    'PatientValidationFactory',
    function ($timeout, patSecurityService, patientValidationFactory) {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'App/Common/components/typeahead/typeahead.html',
        scope: {
          authZ: '@?',
          id: '@', // ID of the input for the typeahead
          bFocus: '=',
          cancel: '&', // Cancel action for when searches take a long time
          search: '&', // Search action that is called as the user types into the box (wrap with timeout!)
          select: '&', // Select action that is called as the user selects an option
          items: '=', // List of items to be displayed, the collection of search results
          term: '=', // The search term, use this to set the display value on selection
          loading: '=', // Boolean to display the loading animation or not
          placeholder: '@', // Placeholder text for the input
          disableInput: '=', // Var to disable input,
          tabIndex: '=?',
          appearance: '@',
          clearContent: '&?', // clear the selection
          scrollView: '=?', // Boolean to enable scroll into view
          showClearButton: '=?', // Boolean to display/enable clear button
          showSearchButton: '=?', // Boolean to display search button
          clickFunction: '&?', // optional function triggered by click event
          enterFunction: '&?', // optional function triggered by keypress enter
          selectAutoFocus: '=?', // Optional object. Contains a boolean property 'value' - if value is true auto-select item in typeahead when there is a single item, else auto-focus the typeahead control and display list of items
          focused: '=?', // optional object. used to identify blur
          readOnly: '=',
          maxlength: '@?',
        },
        controller: [
          '$scope',
          function ($scope) {
            var ctrl = this;

            $scope.showClearButton = angular.isDefined($scope.showClearButton)
              ? $scope.showClearButton
              : true;

            $scope.checkIfAuthorized = function (amfa) {
              return (
                !(amfa > '') ||
                patSecurityService.IsAuthorizedByAbbreviation(amfa)
              );
            };

            // Allow the initial hide to be overridden by document
            $scope.hide = false;

            $scope.focus = $scope.bFocus ? $scope.bFocus : false;

            // var to disable mouseenter while key up or key down
            $scope.enableMouseEnter = false;
            // indicate that recents are being displayed
            $scope.showList = false;

            this.activate = function (item) {
              /** clear content needs to refocus on input */
              if (item == null) {
                $scope.focused = true;
              }
              $scope.active = item;
            };

            this.clickFunction = function () {
              if (
                $scope.id == 'PhoneTypeahead' ||
                $scope.id == 'EmailTypeahead'
              ) {
                if ($scope.term == '') {
                  $scope.showList = true;
                  $scope.hide = false;
                  $scope.focused = true;
                  if ($scope.clickFunction != null) {
                    $scope.clickFunction();
                  }
                  $scope.term = null;
                } else {
                  $scope.showList = false;
                  $scope.term = '';
                }
              } else {
                if ($scope.term == null || $scope.term == '') {
                  $scope.showList = true;
                  $scope.hide = false;
                  $scope.focused = true;
                  if ($scope.clickFunction != null) {
                    $scope.clickFunction();
                  }
                } else {
                  $scope.showList = false;
                }
              }
            };

            this.enterFunction = function () {
              if ($scope.enterFunction) $scope.enterFunction();
            };

            this.activateNextItem = function () {
              var index = $scope.items.indexOf($scope.active);
              this.activate($scope.items[(index + 1) % $scope.items.length]);
            };

            this.activatePreviousItem = function () {
              var index = $scope.items.indexOf($scope.active);
              this.activate(
                $scope.items[index === 0 ? $scope.items.length - 1 : index - 1]
              );
            };

            this.isActive = function (item) {
              return $scope.active === item;
            };

            this.scrollIntoView = function () {
              if (angular.isDefined($scope.scrollView) && $scope.scrollView) {
                return $scope.scrollView;
              }
              return false;
            };

            this.selectActive = function () {
              this.select($scope.active);
            };

            this.select = function (item) {
              $scope.disable = true;
              $scope.focused = true;
              $scope.hide = true;
              $scope.select({ item: item });
            };

            this.clearContent = function () {
              $scope.focused = true;
              $scope.hide = false;
              $scope.clearContent();
            };

            this.cancel = function () {
              $scope.hide = true;
              $scope.cancel();
            };

            $scope.isVisible = function () {
              return !$scope.hide && ($scope.focused || $scope.mousedOver);
            };

            $scope.query = function () {
              $scope.hide = false;
              $scope.disable = false;
              $scope.search({ term: $scope.term });
            };

            $scope.authorized = $scope.checkIfAuthorized($scope.authZ);
            $scope.$watch('authZ', function () {
              $scope.authorized = $scope.checkIfAuthorized($scope.authZ);
            });
          },
        ],
        link: function (scope, element, attrs, controller) {
          var $input = element.find('form > input');
          var $list = element.find('> div');
          var $control = element.find('form > div');

          $input.bind('focus', function () {
            $timeout(function () {
              scope.$apply(function () {
                scope.focused = true;
              });
            });
          });

          $input.bind('blur', function () {
            $timeout(function () {
              scope.$apply(function () {
                scope.focused = false;
              });
            });
          });

          $list.bind('mouseover', function () {
            $timeout(function () {
              scope.$apply(function () {
                scope.mousedOver = true;
              });
            });
          });

          $list.bind('mouseleave', function () {
            $timeout(function () {
              scope.$apply(function () {
                scope.mousedOver = false;
              });
            });
          });

          $input.bind('click', function (e) {
            scope.$apply(function () {
              controller.clickFunction();
            });
          });

          $control.bind('click', function (e) {
            if (e.originalEvent.target.id === 'cancelClear') {
              scope.active = '';
            }
            scope.$apply(function () {
              controller.clickFunction();
            });
          });

          $input.bind('keyup', function (e) {
            if (e.keyCode === 13) {
              scope.$apply(function () {
                controller.selectActive();
              });
            }

            if (e.keyCode === 27) {
              scope.$apply(function () {
                scope.hide = true;
              });
            }
          });

          $input.bind('keydown', function (e) {
            scope.enableMouseEnter = true;
            if (e.keyCode === 13 || e.keyCode === 27) {
              e.preventDefault();
            }

            if (e.keyCode === 13 && controller.enterFunction) {
              scope.$apply(function () {
                controller.enterFunction();
              });
            }

            if (e.keyCode === 40) {
              scope.enableMouseEnter = false;
              e.preventDefault();
              scope.$apply(function () {
                controller.activateNextItem();
              });
            }

            if (e.keyCode === 38) {
              e.preventDefault();
              scope.enableMouseEnter = false;
              scope.$apply(function () {
                controller.activatePreviousItem();
              });
            }
          });

          scope.$watch('items', function (items) {
            if (items && scope.selectMode == true) {
              controller.activate(items.length ? items[0] : null);
            }
          });

          scope.$watch(
            'selectAutoFocus',
            function (nv) {
              // If selectAutoFocus value is changed to true, perform click operation
              if (
                scope.selectAutoFocus &&
                scope.selectAutoFocus.value === true
              ) {
                $timeout(function () {
                  controller.clickFunction();
                }, 0);
              }
            },
            true
          );

          scope.$watch('focused', function (focused) {
            if (focused) {
              $timeout(
                function () {
                  $input.focus();
                },
                0,
                false
              );
            }
          });

          // listen for the setfocus event
          scope.$on('setFocus', function (event, data) {
            scope.focused = true;
          });

          scope.$watch('isVisible()', function (visible) {
            if (visible) {
              var pos = $input.position();

              $list.css({
                left: pos.left,
                'min-width': $input.prop('offsetWidth'),
                display: 'block',
              });
            } else {
              $list.css('display', 'none');
            }
          });

          attrs.id = attrs.id + 'Input';
        },
      };
    },
  ])
  .directive('typeaheadItem', [
    '$timeout',
    function ($timeout) {
      return {
        require: '^typeahead',
        link: function (scope, element, attrs, controller) {
          var item = scope.$eval(attrs.typeaheadItem);

          scope.$watch(
            function () {
              return controller.isActive(item);
            },
            function (active) {
              if (active) {
                element.addClass('active');
                if (!controller.scrollIntoView) {
                  element[0].scrollIntoView(controller.scrollIntoView);
                }
              } else {
                element.removeClass('active');
              }
            }
          );

          element.bind('mousemove', function (e) {
            $timeout(function () {
              scope.$apply(function () {
                scope.enableMouseEnter = true;
              });
            });
          });

          element.bind('mouseenter', function (e) {
            $timeout(function () {
              scope.$apply(function () {
                if (scope.enableMouseEnter == true) {
                  controller.activate(item);
                }
              });
            });
          });

          element.bind('click', function (e) {
            $timeout(function () {
              scope.$apply(function () {
                controller.select(item);
              });
            });
          });
        },
      };
    },
  ]);

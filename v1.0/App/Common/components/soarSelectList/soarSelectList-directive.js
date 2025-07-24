'use strict';

angular.module('common.directives').directive('soarSelectList', function () {
  return {
    restrict: 'E',
    templateUrl: 'App/Common/components/soarSelectList/soarSelectList.html',
    require: 'ngModel',
    scope: {
      textField: '@',
      valueField: '@',
      optionList: '=',
      ngModel: '=',
      disableInput: '=?',
      id: '@?',
      name: '@?',
      className: '@?',
      sbTab: '@?',
      placeholder: '@?',
      valueTemplate: '=?',
      listTemplate: '=?',
      sbRequired: '@?',
      sbChange: '=?',
      sbBlur: '=?',
      sbSetFocusIf: '@?',
      objTrans: '=?',
      sbSelect: '=?',
      noDataText: '@?',
      delaySelect: '@?',
    },
    compile: function () {
      return {
        pre: function (scope, elem, attrs) {
          scope.strGroupTemplate =
            "#: data == 1 ? 'Active' : (data == 2 ? 'Pending Inactive' : 'Inactive') #";
          scope.selectOptions = {};
          if (scope.noDataText) {
            scope.selectOptions.noDataTemplate = scope.noDataText;
          }
          // Set default value template if it is not defined by user
          if (typeof attrs.valueTemplate == 'undefined') {
            scope.valueTemplate =
              '<div id="valueTemplate" type="text/x-kendo-template">' +
              '<span id="lblSelectedName" class="value-template-input k-state-default">#: ' +
              _.escape(scope.textField) +
              ' #</span>' +
              '</div>';
          }

          // Set default list template if it is not defined by user
          if (typeof attrs.listTemplate == 'undefined') {
            scope.listTemplate =
              '<div id="listTemplate" type="text/x-kendo-template">' +
              '<span id="lblSelectedName" class="value-template-input k-state-default">#: ' +
              _.escape(scope.textField) +
              ' #</span>' +
              '</div>';
          }

          // Set default disable flag to false if it is not defined by user
          if (
            typeof attrs.disableInput == 'undefined' ||
            attrs.disableInput === undefined
          ) {
            scope.disableInput = false;
          }

          if (
            typeof attrs.sbSelect === 'undefined' ||
            attrs.sbSelect === undefined
          ) {
            scope.sbSelect = function (e) {};
          }

          scope.$on('kendoWidgetCreated', function (event, widget) {
            if (
              widget.ns === '.kendoDropDownList' &&
              !_.isNil(scope.id) &&
              scope.id.length > 0
            ) {
              if (!_.isNil(widget.element)) {
                widget.element.attr('id', scope.id);
              }

              if (!_.isNil(widget.popup) && !_.isNil(widget.popup.element)) {
                widget.popup.element.attr('id', `${scope.id}-list`);
              }

              if (!_.isNil(widget.wrapper)) {
                widget.wrapper.attr('aria-owns', `${scope.id}_listbox`);
              }

              if (
                !_.isNil(widget.listView) &&
                !_.isNil(widget.listView.element)
              ) {
                widget.listView.element.attr('id', `${scope.id}_listbox`);
              }
            }
          });
        },

        post: function (scope, elem, attr, modelCtrl) {
          scope.handleKeydownEvent = function (e) {
            if ($.inArray(e.keyCode, [9]) !== -1) {
              e.keyCode = 13;
              scope.handleKeydownEvent(e);
            }

            if ($.inArray(e.keyCode, [13]) !== -1) {
              return;
            }
          };

          if (scope.sbRequired) {
            scope.$watch('ngModel', function () {
              if (scope.sbRequired) {
                modelCtrl.$setValidity(
                  'required',
                  scope.ngModel ? true : false
                );
              }
            });
          }

          $(elem).keydown(function (e) {
            scope.handleKeydownEvent(e);
          });

          elem.on('$destroy', function () {
            scope.$destroy();
          });

          scope.kendoWidgets = [];

          scope.$on('kendoWidgetCreated', function (event, widget) {
            scope.kendoWidgets.push(widget);

            if (widget.ns === '.kendoDropDownList') {
              /** dropdownlist needs to be created before you can set tabindex */
              if (scope.sbTab) {
                angular
                  .element(elem)
                  .find('span.k-dropdown')
                  .attr('tabindex', scope.sbTab);
              }

              widget.wrapper.on('keydown', function (e) {
                e.stopImmediatePropagation();
                scope.$apply();
              });
            }
          });

          // need to destroy widgets for modal. only gets destroyed if web page unloads.
          scope.$on('$destroy', function () {
            angular.forEach(scope.kendoWidgets, function (widget) {
              if (widget) {
                try {
                  widget.destroy();
                  for (var widgetItem in widget) {
                    if (widgetItem && widget.hasOwnProperty(widgetItem)) {
                      widget[widgetItem] = null;
                    }
                  }
                } catch (err) {
                  var test = err;
                }
              }
            });

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

          // if delaySelect is true, we delay until after option list is loaded
          scope.$watchCollection('optionList', function (nv) {
            scope.delay = nv && scope.delaySelect ? true : scope.delay;
            if (scope.kendoWidgets.length > 0) {
              scope.kendoWidgets[0].dataSource.read();
            }
          });

          scope.delay = scope.delaySelect ? false : true;
        },
      };
    },
  };
});

var uiBootstrapAppend = angular.module('ui.bootstrap');

angular.module('ui.bootstrap.tpls', [
  'uib/template/slidepanel/window.html',
  'uib/template/accordion/accordion-group.html',
  'uib/template/accordion/accordion.html',
  'uib/template/alert/alert.html',
  'uib/template/carousel/carousel.html',
  'uib/template/carousel/slide.html',
  'uib/template/datepicker/datepicker.html',
  'uib/template/datepicker/day.html',
  'uib/template/datepicker/month.html',
  'uib/template/datepickerPopup/popup.html',
  'uib/template/datepicker/year.html',
  'uib/template/modal/window.html',
  'uib/template/pager/pager.html',
  'uib/template/pagination/pagination.html',
  'uib/template/tooltip/tooltip-html-popup.html',
  'uib/template/tooltip/tooltip-popup.html',
  'uib/template/tooltip/tooltip-template-popup.html',
  'uib/template/popover/popover-html.html',
  'uib/template/popover/popover-template.html',
  'uib/template/popover/popover.html',
  'uib/template/progressbar/bar.html',
  'uib/template/progressbar/progress.html',
  'uib/template/progressbar/progressbar.html',
  'uib/template/rating/rating.html',
  'uib/template/tabs/tab.html',
  'uib/template/tabs/tabset.html',
  'uib/template/timepicker/timepicker.html',
  'uib/template/typeahead/typeahead-match.html',
  'uib/template/typeahead/typeahead-popup.html',
]);

/**
 * A helper directive for the $slidepanel service. It creates a backdrop element.
 */

uiBootstrapAppend.directive('uibSlidepanelWindow', [
  '$uibSlidepanelStack',
  '$q',
  '$animateCss',
  '$document',
  function ($slidepanelStack, $q, $animateCss, $document) {
    return {
      scope: {
        index: '@',
      },
      replace: true,
      transclude: true,
      templateUrl: function (tElement, tAttrs) {
        return tAttrs.templateUrl || 'uib/template/slidepanel/window.html';
      },
      link: function (scope, element, attrs) {
        element.addClass(attrs.windowClass || '');
        element.addClass(attrs.windowTopClass || '');
        scope.size = attrs.size;

        scope.close = function (evt) {
          var slidepanel = $slidepanelStack.getTop();
          if (
            slidepanel &&
            slidepanel.value.backdrop &&
            slidepanel.value.backdrop !== 'static' &&
            evt.target === evt.currentTarget
          ) {
            evt.preventDefault();
            evt.stopPropagation();
            $slidepanelStack.dismiss(slidepanel.key, 'backdrop click');
          }
        };

        // moved from template to fix issue #2280
        element.on('click', scope.close);

        // This property is only added to the scope for the purpose of detecting when this directive is rendered.
        // We can detect that by using this property in the template associated with this directive and then use
        // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
        scope.$isRendered = true;

        // Deferred object that will be resolved when this slidepanel is render.
        var slidepanelRenderDeferObj = $q.defer();
        // Observe function will be called on next digest cycle after compilation, ensuring that the DOM is ready.
        // In order to use this way of finding whether DOM is ready, we need to observe a scope property used in slidepanel's template.
        attrs.$observe('slidepanelRender', function (value) {
          if (value === 'true') {
            slidepanelRenderDeferObj.resolve();
          }
        });

        slidepanelRenderDeferObj.promise.then(function () {
          var animationPromise = null;

          if (attrs.slidepanelInClass) {
            animationPromise = $animateCss(element, {
              addClass: attrs.slidepanelInClass,
            }).start();

            scope.$on(
              $slidepanelStack.NOW_CLOSING_EVENT,
              function (e, setIsAsync) {
                var done = setIsAsync();
                $animateCss(element, {
                  removeClass: attrs.slidepanelInClass,
                })
                  .start()
                  .then(done);
              }
            );
          }

          $q.when(animationPromise).then(function () {
            // Notify {@link $slidepanelStack} that slidepanel is rendered.
            var slidepanel = $slidepanelStack.getTop();
            if (slidepanel) {
              $slidepanelStack.slidepanelRendered(slidepanel.key);
            }

            /**
             * If something within the freshly-opened slidepanel already has focus (perhaps via a
             * directive that causes focus). then no need to try and focus anything.
             */
            if (
              !(
                $document[0].activeElement &&
                element[0].contains($document[0].activeElement)
              )
            ) {
              var inputWithAutofocus = element[0].querySelector('[autofocus]');
              /**
               * Auto-focusing of a freshly-opened slidepanel element causes any child elements
               * with the autofocus attribute to lose focus. This is an issue on touch
               * based devices which will show and then hide the onscreen keyboard.
               * Attempts to refocus the autofocus element via JavaScript will not reopen
               * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
               * the slidepanel element if the slidepanel does not contain an autofocus element.
               */
              if (inputWithAutofocus) {
                inputWithAutofocus.focus();
              } else {
                element[0].focus();
              }
            }
          });
        });
      },
    };
  },
]);

uiBootstrapAppend.directive('uibSlidepanelAnimationClass', function () {
  return {
    compile: function (tElement, tAttrs) {
      if (tAttrs.slidepanelAnimation) {
        tElement.addClass(tAttrs.uibSlidepanelAnimationClass);
      }
    },
  };
});

uiBootstrapAppend.directive('uibSlidepanelTransclude', function () {
  return {
    link: function (scope, element, attrs, controller, transclude) {
      transclude(scope.$parent, function (clone) {
        element.empty();
        element.append(clone);
      });
    },
  };
});

uiBootstrapAppend.factory('$uibSlidepanelStack', [
  '$animate',
  '$animateCss',
  '$document',
  '$compile',
  '$rootScope',
  '$q',
  '$$multiMap',
  '$$stackedMap',
  function (
    $animate,
    $animateCss,
    $document,
    $compile,
    $rootScope,
    $q,
    $$multiMap,
    $$stackedMap
  ) {
    var OPENED_MODAL_CLASS = '';

    var backdropDomEl, backdropScope;
    var openedWindows = $$stackedMap.createNew();
    var openedClasses = $$multiMap.createNew();
    var $slidepanelStack = {
      NOW_CLOSING_EVENT: 'slidepanel.stack.now-closing',
    };

    //Slidepanel focus behavior
    var tabableSelector =
      'a[href], area[href], input:not([disabled]), ' +
      'button:not([disabled]),select:not([disabled]), textarea:not([disabled]), ' +
      'iframe, object, embed, *[tabindex], *[contenteditable=true]';

    function isVisible(element) {
      return !!(
        element.offsetWidth ||
        element.offsetHeight ||
        element.getClientRects().length
      );
    }

    function backdropIndex() {
      var topBackdropIndex = -1;
      var opened = openedWindows.keys();
      for (var i = 0; i < opened.length; i++) {
        if (openedWindows.get(opened[i]).value.backdrop) {
          topBackdropIndex = i;
        }
      }
      return topBackdropIndex;
    }

    $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
      if (backdropScope) {
        backdropScope.index = newBackdropIndex;
      }
    });

    function removeSlidepanelWindow(slidepanelInstance, elementToReceiveFocus) {
      var slidepanelWindow = openedWindows.get(slidepanelInstance).value;
      var appendToElement = slidepanelWindow.appendTo;

      //clean up the stack
      openedWindows.remove(slidepanelInstance);

      removeAfterAnimate(
        slidepanelWindow.slidepanelDomEl,
        slidepanelWindow.slidepanelScope,
        function () {
          var slidepanelBodyClass =
            slidepanelWindow.openedClass || OPENED_MODAL_CLASS;
          openedClasses.remove(slidepanelBodyClass, slidepanelInstance);
          appendToElement.toggleClass(
            slidepanelBodyClass,
            openedClasses.hasKey(slidepanelBodyClass)
          );
          toggleTopWindowClass(true);
        },
        slidepanelWindow.closedDeferred
      );
      checkRemoveBackdrop();

      //move focus to specified element if available, or else to body
      if (elementToReceiveFocus && elementToReceiveFocus.focus) {
        elementToReceiveFocus.focus();
      } else if (appendToElement.focus) {
        appendToElement.focus();
      }
    }

    // Add or remove "windowTopClass" from the top window in the stack
    function toggleTopWindowClass(toggleSwitch) {
      var slidepanelWindow;

      if (openedWindows.length() > 0) {
        slidepanelWindow = openedWindows.top().value;
        slidepanelWindow.slidepanelDomEl.toggleClass(
          slidepanelWindow.windowTopClass || '',
          toggleSwitch
        );
      }
    }

    function checkRemoveBackdrop() {
      //remove backdrop if no longer needed
      if (backdropDomEl && backdropIndex() === -1) {
        var backdropScopeRef = backdropScope;
        removeAfterAnimate(backdropDomEl, backdropScope, function () {
          backdropScopeRef = null;
        });
        backdropDomEl = undefined;
        backdropScope = undefined;
      }
    }

    function removeAfterAnimate(domEl, scope, done, closedDeferred) {
      var asyncDeferred;
      var asyncPromise = null;
      var setIsAsync = function () {
        if (!asyncDeferred) {
          asyncDeferred = $q.defer();
          asyncPromise = asyncDeferred.promise;
        }

        return function asyncDone() {
          asyncDeferred.resolve();
        };
      };
      scope.$broadcast($slidepanelStack.NOW_CLOSING_EVENT, setIsAsync);

      // Note that it's intentional that asyncPromise might be null.
      // That's when setIsAsync has not been called during the
      // NOW_CLOSING_EVENT broadcast.
      return $q.when(asyncPromise).then(afterAnimating);

      function afterAnimating() {
        if (afterAnimating.done) {
          return;
        }
        afterAnimating.done = true;

        $animate.leave(domEl).then(function () {
          domEl.remove();
          if (closedDeferred) {
            closedDeferred.resolve();
          }
        });

        scope.$destroy();
        if (done) {
          done();
        }
      }
    }

    $document.on('keydown', keydownListener);

    $rootScope.$on('$destroy', function () {
      $document.off('keydown', keydownListener);
    });

    function keydownListener(evt) {
      if (evt.isDefaultPrevented()) {
        return evt;
      }

      var slidepanel = openedWindows.top();
      if (slidepanel) {
        switch (evt.which) {
          case 27: {
            if (slidepanel.value.keyboard) {
              evt.preventDefault();
              $rootScope.$apply(function () {
                $slidepanelStack.dismiss(slidepanel.key, 'escape key press');
              });
            }
            break;
          }
          case 9: {
            var list = $slidepanelStack.loadFocusElementList(slidepanel);
            var focusChanged = false;
            if (evt.shiftKey) {
              if (
                $slidepanelStack.isFocusInFirstItem(evt, list) ||
                $slidepanelStack.isSlidepanelFocused(evt, slidepanel)
              ) {
                focusChanged = $slidepanelStack.focusLastFocusableElement(list);
              }
            } else {
              if ($slidepanelStack.isFocusInLastItem(evt, list)) {
                focusChanged =
                  $slidepanelStack.focusFirstFocusableElement(list);
              }
            }

            if (focusChanged) {
              evt.preventDefault();
              evt.stopPropagation();
            }

            break;
          }
        }
      }
    }

    $slidepanelStack.open = function (slidepanelInstance, slidepanel) {
      var slidepanelOpener = $document[0].activeElement,
        slidepanelBodyClass = slidepanel.openedClass || OPENED_MODAL_CLASS;

      toggleTopWindowClass(false);

      openedWindows.add(slidepanelInstance, {
        deferred: slidepanel.deferred,
        renderDeferred: slidepanel.renderDeferred,
        closedDeferred: slidepanel.closedDeferred,
        slidepanelScope: slidepanel.scope,
        backdrop: slidepanel.backdrop,
        keyboard: slidepanel.keyboard,
        openedClass: slidepanel.openedClass,
        windowTopClass: slidepanel.windowTopClass,
        animation: slidepanel.animation,
        appendTo: slidepanel.appendTo,
      });

      openedClasses.put(slidepanelBodyClass, slidepanelInstance);

      var appendToElement = slidepanel.appendTo,
        currBackdropIndex = backdropIndex();

      if (!appendToElement.length) {
        throw new Error(
          'appendTo element not found. Make sure that the element passed is in DOM.'
        );
      }

      if (currBackdropIndex >= 0 && !backdropDomEl) {
        backdropScope = $rootScope.$new(true);
        backdropScope.slidepanelOptions = slidepanel;
        backdropScope.index = currBackdropIndex;
        backdropDomEl = angular.element(
          '<div uib-slidepanel-backdrop="slidepanel-backdrop"></div>'
        );
        backdropDomEl.attr('backdrop-class', slidepanel.backdropClass);
        if (slidepanel.animation) {
          backdropDomEl.attr('slidepanel-animation', 'true');
        }
        $compile(backdropDomEl)(backdropScope);
        $animate.enter(backdropDomEl, appendToElement);
      }

      var angularDomEl = angular.element(
        '<div uib-slidepanel-window="slidepanel-window"></div>'
      );
      angularDomEl
        .attr({
          'template-url': slidepanel.windowTemplateUrl,
          'window-class': slidepanel.windowClass,
          'window-top-class': slidepanel.windowTopClass,
          size: slidepanel.size,
          index: openedWindows.length() - 1,
          animate: 'animate',
        })
        .html(slidepanel.content);
      if (slidepanel.animation) {
        angularDomEl.attr('slidepanel-animation', 'true');
      }

      $animate
        .enter($compile(angularDomEl)(slidepanel.scope), appendToElement)
        .then(function () {
          if (!slidepanel.scope.$$uibDestructionScheduled) {
            $animate.addClass(appendToElement, slidepanelBodyClass);
          }
        });

      openedWindows.top().value.slidepanelDomEl = angularDomEl;
      openedWindows.top().value.slidepanelOpener = slidepanelOpener;
    };

    function broadcastClosing(slidepanelWindow, resultOrReason, closing) {
      return !slidepanelWindow.value.slidepanelScope.$broadcast(
        'slidepanel.closing',
        resultOrReason,
        closing
      ).defaultPrevented;
    }

    $slidepanelStack.close = function (slidepanelInstance, result) {
      var slidepanelWindow = openedWindows.get(slidepanelInstance);
      if (
        slidepanelWindow &&
        broadcastClosing(slidepanelWindow, result, true)
      ) {
        slidepanelWindow.value.slidepanelScope.$$uibDestructionScheduled = true;
        slidepanelWindow.value.deferred.resolve(result);
        removeSlidepanelWindow(
          slidepanelInstance,
          slidepanelWindow.value.slidepanelOpener
        );
        return true;
      }
      return !slidepanelWindow;
    };

    $slidepanelStack.dismiss = function (slidepanelInstance, reason) {
      var slidepanelWindow = openedWindows.get(slidepanelInstance);
      if (
        slidepanelWindow &&
        broadcastClosing(slidepanelWindow, reason, false)
      ) {
        slidepanelWindow.value.slidepanelScope.$$uibDestructionScheduled = true;
        slidepanelWindow.value.deferred.reject(reason);
        removeSlidepanelWindow(
          slidepanelInstance,
          slidepanelWindow.value.slidepanelOpener
        );
        return true;
      }
      return !slidepanelWindow;
    };

    $slidepanelStack.dismissAll = function (reason) {
      var topSlidepanel = this.getTop();
      while (topSlidepanel && this.dismiss(topSlidepanel.key, reason)) {
        topSlidepanel = this.getTop();
      }
    };

    $slidepanelStack.getTop = function () {
      return openedWindows.top();
    };

    $slidepanelStack.slidepanelRendered = function (slidepanelInstance) {
      var slidepanelWindow = openedWindows.get(slidepanelInstance);
      if (slidepanelWindow) {
        slidepanelWindow.value.renderDeferred.resolve();
      }
    };

    $slidepanelStack.focusFirstFocusableElement = function (list) {
      if (list.length > 0) {
        list[0].focus();
        return true;
      }
      return false;
    };

    $slidepanelStack.focusLastFocusableElement = function (list) {
      if (list.length > 0) {
        list[list.length - 1].focus();
        return true;
      }
      return false;
    };

    $slidepanelStack.isSlidepanelFocused = function (evt, slidepanelWindow) {
      if (evt && slidepanelWindow) {
        var slidepanelDomEl = slidepanelWindow.value.slidepanelDomEl;
        if (slidepanelDomEl && slidepanelDomEl.length) {
          return (evt.target || evt.srcElement) === slidepanelDomEl[0];
        }
      }
      return false;
    };

    $slidepanelStack.isFocusInFirstItem = function (evt, list) {
      if (list.length > 0) {
        return (evt.target || evt.srcElement) === list[0];
      }
      return false;
    };

    $slidepanelStack.isFocusInLastItem = function (evt, list) {
      if (list.length > 0) {
        return (evt.target || evt.srcElement) === list[list.length - 1];
      }
      return false;
    };

    $slidepanelStack.loadFocusElementList = function (slidepanelWindow) {
      if (slidepanelWindow) {
        var slidepanelDomE1 = slidepanelWindow.value.slidepanelDomEl;
        if (slidepanelDomE1 && slidepanelDomE1.length) {
          var elements = slidepanelDomE1[0].querySelectorAll(tabableSelector);
          return elements
            ? Array.prototype.filter.call(elements, function (element) {
                return isVisible(element);
              })
            : elements;
        }
      }
    };

    return $slidepanelStack;
  },
]);

uiBootstrapAppend.provider('$uibSlidepanel', function () {
  var $slidepanelProvider = {
    options: {
      animation: true,
      backdrop: true, //can also be false or 'static'
      keyboard: true,
    },
    $get: [
      '$rootScope',
      '$q',
      '$document',
      '$templateRequest',
      '$controller',
      '$uibResolve',
      '$uibSlidepanelStack',
      function (
        $rootScope,
        $q,
        $document,
        $templateRequest,
        $controller,
        $uibResolve,
        $slidepanelStack
      ) {
        var $slidepanel = {};

        function getTemplatePromise(options) {
          return options.template
            ? $q.when(options.template)
            : $templateRequest(
                angular.isFunction(options.templateUrl)
                  ? options.templateUrl()
                  : options.templateUrl
              );
        }

        var promiseChain = null;
        $slidepanel.getPromiseChain = function () {
          return promiseChain;
        };

        $slidepanel.open = function (slidepanelOptions) {
          var slidepanelResultDeferred = $q.defer();
          var slidepanelOpenedDeferred = $q.defer();
          var slidepanelClosedDeferred = $q.defer();
          var slidepanelRenderDeferred = $q.defer();

          //prepare an instance of a slidepanel to be injected into controllers and returned to a caller
          var slidepanelInstance = {
            result: slidepanelResultDeferred.promise,
            opened: slidepanelOpenedDeferred.promise,
            closed: slidepanelClosedDeferred.promise,
            rendered: slidepanelRenderDeferred.promise,
            close: function (result) {
              return $slidepanelStack.close(slidepanelInstance, result);
            },
            dismiss: function (reason) {
              return $slidepanelStack.dismiss(slidepanelInstance, reason);
            },
          };

          //merge and clean up options
          slidepanelOptions = angular.extend(
            {},
            $slidepanelProvider.options,
            slidepanelOptions
          );
          slidepanelOptions.resolve = slidepanelOptions.resolve || {};
          slidepanelOptions.appendTo =
            slidepanelOptions.appendTo || $document.find('body').eq(0);

          //verify options
          if (!slidepanelOptions.template && !slidepanelOptions.templateUrl) {
            throw new Error(
              'One of template or templateUrl options is required.'
            );
          }

          var templateAndResolvePromise = $q.all([
            getTemplatePromise(slidepanelOptions),
            $uibResolve.resolve(slidepanelOptions.resolve, {}, null, null),
          ]);

          function resolveWithTemplate() {
            return templateAndResolvePromise;
          }

          // Wait for the resolution of the existing promise chain.
          // Then switch to our own combined promise dependency (regardless of how the previous slidepanel fared).
          // Then add to $slidepanelStack and resolve opened.
          // Finally clean up the chain variable if no subsequent slidepanel has overwritten it.
          var samePromise;
          samePromise = promiseChain = $q
            .all([promiseChain])
            .then(resolveWithTemplate, resolveWithTemplate)
            .then(
              function resolveSuccess(tplAndVars) {
                var providedScope = slidepanelOptions.scope || $rootScope;

                var slidepanelScope = providedScope.$new();
                slidepanelScope.$close = slidepanelInstance.close;
                slidepanelScope.$dismiss = slidepanelInstance.dismiss;

                slidepanelScope.$on('$destroy', function () {
                  if (!slidepanelScope.$$uibDestructionScheduled) {
                    slidepanelScope.$dismiss('$uibUnscheduledDestruction');
                  }
                });

                var ctrlInstance,
                  ctrlInstantiate,
                  ctrlLocals = {};

                //controllers
                if (slidepanelOptions.controller) {
                  ctrlLocals.$scope = slidepanelScope;
                  ctrlLocals.$uibSlidepanelInstance = slidepanelInstance;
                  angular.forEach(tplAndVars[1], function (value, key) {
                    ctrlLocals[key] = value;
                  });

                  // the third param will make the controller instantiate later,private api
                  // @see https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L126
                  ctrlInstantiate = $controller(
                    slidepanelOptions.controller,
                    ctrlLocals,
                    true
                  );
                  if (slidepanelOptions.controllerAs) {
                    ctrlInstance = ctrlInstantiate.instance;

                    if (slidepanelOptions.bindToController) {
                      ctrlInstance.$close = slidepanelScope.$close;
                      ctrlInstance.$dismiss = slidepanelScope.$dismiss;
                      angular.extend(ctrlInstance, providedScope);
                    }

                    ctrlInstance = ctrlInstantiate();

                    slidepanelScope[slidepanelOptions.controllerAs] =
                      ctrlInstance;
                  } else {
                    ctrlInstance = ctrlInstantiate();
                  }

                  if (angular.isFunction(ctrlInstance.$onInit)) {
                    ctrlInstance.$onInit();
                  }
                }

                $slidepanelStack.open(slidepanelInstance, {
                  scope: slidepanelScope,
                  deferred: slidepanelResultDeferred,
                  renderDeferred: slidepanelRenderDeferred,
                  closedDeferred: slidepanelClosedDeferred,
                  content: tplAndVars[0],
                  animation: slidepanelOptions.animation,
                  backdrop: slidepanelOptions.backdrop,
                  keyboard: slidepanelOptions.keyboard,
                  backdropClass: slidepanelOptions.backdropClass,
                  windowTopClass: slidepanelOptions.windowTopClass,
                  windowClass: slidepanelOptions.windowClass,
                  windowTemplateUrl: slidepanelOptions.windowTemplateUrl,
                  size: slidepanelOptions.size,
                  openedClass: slidepanelOptions.openedClass,
                  appendTo: slidepanelOptions.appendTo,
                });
                slidepanelOpenedDeferred.resolve(true);
              },
              function resolveError(reason) {
                slidepanelOpenedDeferred.reject(reason);
                slidepanelResultDeferred.reject(reason);
              }
            )
            ['finally'](function () {
              if (promiseChain === samePromise) {
                promiseChain = null;
              }
            });

          return slidepanelInstance;
        };

        return $slidepanel;
      },
    ],
  };

  return $slidepanelProvider;
});

angular.module('uib/template/slidepanel/window.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put(
      'uib/template/slidepanel/window.html',
      '<div slidepanel-render="{{$isRendered}}" tabindex="-1" role="dialog" class="uibSlidepanel {{size ? size : \'\'}}"\n' +
        '    slidepanel-in-class="slide"\n' +
        "    ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\">\n" +
        '    <div class="uibSlidepanel__primary">\n' +
        '        <div class="uibSlidepanel__content" uib-slidepanel-transclude></div>\n' +
        '    </div>\n' +
        '</div>\n' +
        ''
    );
  },
]);

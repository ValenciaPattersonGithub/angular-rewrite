'use strict';

angular.module('Soar.BusinessCenter').directive('sectionItemPreviewDirective', [
  '$http',
  '$compile',
  function ($http, $compile) {
    var templates = {};
    var templateUrls = {
      1: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/demographic-question.html',
      2: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/yes-no-true-false.html',
      8: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/yes-no-true-false.html',
      3: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/list-question.html',
      4: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/signature-box.html',
      5: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/date-stamp.html',
      6: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/emergency-contact.html',
      7: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/comment-essay.html',
      9: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/adlib.html',
      10: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/link-tooth.html',
      11: 'App/BusinessCenter/settings/custom-forms/section-preview/section-item-preview/custom-text-field.html',
    };

    var linker = (function prepareRequestQueue() {
      var queue = {};
      var onLoad = function () {};

      function buildOnLoad(scope) {
        var callback = scope.onRender || function () {};

        return function onLoad() {
          if (!Object.keys(queue).length) {
            callback();
          }
        };
      }

      function buildCompileMethod(scope, element) {
        return function compileItem(template) {
          element.html(template);
          $compile(element.contents())(scope);
        };
      }

      function resolveQueuedCompileMethods(formType) {
        // Compile all elements awaiting received template
        return function handleResolution(res) {
          templates[formType] = res.data;

          queue[formType].map(function (compileItemMethod) {
            compileItemMethod(res.data);
          });

          delete queue[formType];
          onLoad();
        };
      }

      function requestTemplate(formType) {
        $http
          .get(templateUrls[formType])
          .then(resolveQueuedCompileMethods(formType));
      }

      return function linker(scope, element) {
        onLoad = buildOnLoad(scope);
        var formType = scope.sectionItem.FormItemType;

        // Immediately compile section item if we have the template
        if (templates[formType]) {
          buildCompileMethod(scope, element)(templates[formType]);

          // Awaiting response or need to request template ->
          // build new queue for form type, or use existing, and enqueue compile method for this element
        } else {
          if (queue[formType]) {
            queue[formType].push(buildCompileMethod(scope, element));
          } else {
            queue[formType] = [];
            queue[formType].push(buildCompileMethod(scope, element));
            requestTemplate(formType);
          }
        }

        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      };
    })();

    return {
      restrict: 'E',
      scope: true,
      link: linker,
    };
  },
]);

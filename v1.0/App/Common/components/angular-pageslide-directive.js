'use strict';

angular.module('common.directives').directive('pageslide', function ($filter) {
  return {
    restrict: 'EA',
    replace: false,
    transclude: false,
    scope: {
      psOpen: '=?',
      psAutoClose: '=?',
    },
    link: function ($scope, el, attrs) {
      /* Parameters */
      var param = {};
      param.side = attrs.psSide || 'right';
      param.speed = attrs.psSpeed || '0.5';
      param.size = attrs.psSize || '300px';
      param.zindex = attrs.psZindex || 1000;
      param.className = attrs.psClass || 'ng-pageslide';

      /* DOM manipulation */
      var content = null;
      var slider = null;

      if (!attrs.href && el.children() && el.children().length) {
        content = el.children()[0];
      } else {
        var targetId = (attrs.href || attrs.psTarget).substr(1);
        content = document.getElementById(targetId);
        slider = document.getElementById('pageslide-target-' + targetId);

        if (!slider) {
          slider = document.createElement('div');
          slider.id = 'pageslide-target-' + targetId;
        }
      }

      // Check for content
      if (!content)
        throw new Error(
          'You have to elements inside the <pageslide> or you have not specified a target href'
        );

      slider = slider || document.createElement('div');
      slider.className = param.className;

      /* Style setup */
      slider.style.transitionDuration = param.speed + 's';
      slider.style.webkitTransitionDuration = param.speed + 's';
      slider.style.zIndex = param.zindex;
      slider.style.position = 'fixed';
      slider.style.width = 0;
      slider.style.height = 0;
      slider.style.transitionProperty = 'width, height';

      switch (param.side) {
        case 'right':
          slider.style.height = attrs.psCustomHeight || '100%';
          slider.style.top = attrs.psCustomTop || '0px';
          slider.style.bottom = attrs.psCustomBottom || '0px';
          slider.style.right = attrs.psCustomRight || '0px';
          break;
        case 'left':
          slider.style.height = attrs.psCustomHeight || '100%';
          slider.style.top = attrs.psCustomTop || '0px';
          slider.style.bottom = attrs.psCustomBottom || '0px';
          slider.style.left = attrs.psCustomLeft || '0px';
          break;
        case 'top':
          slider.style.width = attrs.psCustomWidth || '100%';
          slider.style.left = attrs.psCustomLeft || '0px';
          slider.style.top = attrs.psCustomTop || '0px';
          slider.style.right = attrs.psCustomRight || '0px';
          break;
        case 'bottom':
          slider.style.width = attrs.psCustomWidth || '100%';
          slider.style.bottom = attrs.psCustomBottom || '0px';
          slider.style.left = attrs.psCustomLeft || '0px';
          slider.style.right = attrs.psCustomRight || '0px';
          break;
      }

      /* Append */
      document.body.appendChild(slider);
      slider.appendChild(content);

      /* Closed */
      function psClose(slider, param) {
        if (slider && slider.style.width !== 0 && slider.style.width !== 0) {
          content.style.display = 'none';
          slidePageContent('closing');
          switch (param.side) {
            case 'right':
              slider.style.width = '0px';
              break;
            case 'left':
              slider.style.width = '0px';
              break;
            case 'top':
              slider.style.height = '0px';
              break;
            case 'bottom':
              slider.style.height = '0px';
              break;
          }
        }
        $scope.psOpen = false;
      }

      /* Open */
      function psOpen(slider, param) {
        if (slider.style.width !== 0 && slider.style.width !== 0) {
          switch (param.side) {
            case 'right':
              slider.style.width = param.size;
              break;
            case 'left':
              slider.style.width = param.size;
              break;
            case 'top':
              slider.style.height = param.size;
              break;
            case 'bottom':
              slider.style.height = param.size;
              break;
          }
          setTimeout(function () {
            content.style.display = 'block';
            slidePageContent('opening');
          }, param.speed * 1000);
        }
      }

      function isFunction(functionToCheck) {
        var getType = {};
        return (
          functionToCheck &&
          getType.toString.call(functionToCheck) === '[object Function]'
        );
      }

      /* Moves the page content left/right to react to the nav slide */
      function slidePageContent(action) {
        var size = '0px';
        var hdrLogo = document.getElementById('hdr-logo');
        var hdrSearchIcon = document.getElementById('hdr-search-icon');
        if (action === 'opening' && hdrLogo && hdrSearchIcon) {
          hdrLogo.style.display = 'none';
          hdrSearchIcon.style.display = 'none';
          size = param.size;
        } else if (action === 'closing' && hdrLogo && hdrSearchIcon) {
          hdrLogo.style.display = 'block';
          hdrSearchIcon.style.display = 'block';
        }
        var topHeader = document.getElementById('top-header');
        var viewContainer =
          document.getElementsByClassName('view-container')[0];
        if (topHeader && viewContainer) {
          topHeader.style.left = size;
          viewContainer.style.left = size;
        }
      }

      /*
       * Watchers
       * */

      if (attrs.psSize) {
        $scope.$watch(
          function () {
            return attrs.psSize;
          },
          function (newVal, oldVal) {
            param.size = newVal;
            if ($scope.psOpen) {
              psOpen(slider, param);
            }
          }
        );
      }

      $scope.$watch('psOpen', function (value) {
        if (!!value) {
          // Open
          psOpen(slider, param);
        } else {
          // Close
          psClose(slider, param);
        }
      });

      // Close panel on location change
      if ($scope.psAutoClose) {
        $scope.$on('$locationChangeStart', function () {
          psClose(slider, param);
          if (isFunction($scope.psAutoClose)) {
            $scope.psAutoClose();
          }
        });
        $scope.$on('$stateChangeStart', function () {
          psClose(slider, param);
          if (isFunction($scope.psAutoClose)) {
            $scope.psAutoClose();
          }
        });
      }

      /*
       * Events
       * */

      $scope.$on('$destroy', function () {
        document.body.removeChild(slider);
      });

      var close_handler = attrs.href
        ? document.getElementById(attrs.href.substr(1) + '-close')
        : null;
      if (el[0].addEventListener) {
        el[0].addEventListener('click', function (e) {
          e.preventDefault();
          psOpen(slider, param);
        });

        if (close_handler) {
          close_handler.addEventListener('click', function (e) {
            e.preventDefault();
            psClose(slider, param);
          });
        }
      } else {
        // IE8 Fallback code
        el[0].attachEvent('onclick', function (e) {
          e.returnValue = false;
          psOpen(slider, param);
        });

        if (close_handler) {
          close_handler.attachEvent('onclick', function (e) {
            e.returnValue = false;
            psClose(slider, param);
          });
        }
      }
    },
  };
});

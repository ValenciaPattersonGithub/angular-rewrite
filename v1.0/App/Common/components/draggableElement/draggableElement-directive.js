angular
  .module('common.directives')
  .directive('draggableElement', [
    '$document',
    '$window',
    '$timeout',
    function ($document, $window, $timeout) {
      return {
        scope: {
          isOpen: '=',
        },
        template:
          '<button id="btnClose" class="btn-link pull-right" ng-click="close()"><span class="fa fa-times"></span></button>',
        controller: [
          '$scope',
          function ($scope) {
            $scope.close = function () {
              $scope.isOpen = !$scope.isOpen;

              return $scope.isOpen;
            };
          },
        ],
        link: function (scope, element, attr) {
          var startX = 0,
            startY = 0,
            x = 0,
            y = 0;

          scope.parentElement = angular.element(element[0].parentElement);

          element.addClass('draggable-header');

          element.on('mousedown', function (event) {
            /** prevent moving if clicking close */
            if (
              angular.element(event.toElement).hasClass('btn-link') ||
              angular.element(event.toElement).hasClass('fa-times')
            )
              return;
            startX = event.offsetX;
            startY = event.offsetY + 50;
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
          });

          function mousemove(event) {
            y = event.pageY - startY;
            x = event.pageX - startX;

            if (
              x < 0 ||
              y < 0 ||
              x + element.innerWidth() > $window.innerWidth ||
              y + element.innerHeight() > $window.innerHeight
            )
              return;

            scope.parentElement.css({
              top: y + 'px',
              left: x + 'px',
            });
          }

          function mouseup() {
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
          }
        },
      };
    },
  ])
  // Drag and drop test
  .directive('draggable', function () {
    return function (scope, element) {
      // this gives us the native JS object
      var el = element[0];

      el.draggable = true;

      el.addEventListener(
        'dragstart',
        function (e) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('Text', this.id);
          this.classList.add('drag');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragend',
        function (e) {
          this.classList.remove('drag');
          return false;
        },
        false
      );
    };
  })
  .directive('droppable', function () {
    return {
      scope: {
        drop: '&',
        bin: '=',
      },
      link: function (scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
          'dragover',
          function (e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragenter',
          function (e) {
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragleave',
          function (e) {
            this.classList.remove('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'drop',
          function (e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();
            this.classList.remove('over');

            var binId = this.id;
            var item = document.getElementById(e.dataTransfer.getData('Text'));
            //this.appendChild(item);
            // call the passed drop function
            scope.$apply(function (scope) {
              var fn = scope.drop();
              if ('undefined' !== typeof fn) {
                fn(item.id, binId);
              }
            });

            return false;
          },
          false
        );
      },
    };
  });

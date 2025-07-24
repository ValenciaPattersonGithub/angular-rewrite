angular.module('common.directives').directive('draggableModal', [
  '$document',
  function ($document) {
    return {
      link: function link(scope, element) {
        var startX = 0,
          startY = 0,
          x = 0,
          y = 0;

        var windowHeight = window.screen.availHeight;
        var windowWidth = window.screen.availWidth;
        element = angular.element(
          document.getElementsByClassName('modal-dialog')
        );
        function mousemove(event) {
          x = event.screenX - startX;
          y = event.screenY - startY;
          //prevents the position of the initial mousedown from being dragged off screen allowing the window to always be dragged back on screen
          if (event.screenX < 100) {
            x = 100 - startX;
          }
          if (event.screenX > windowWidth - 60) {
            x = windowWidth - 60 - startX;
          }
          if (event.screenY < 170) {
            y = 170 - startY;
          }
          if (event.screenY > windowHeight - 60) {
            y = windowHeight - 60 - startY;
          }
          element.css({
            top: y + 'px',
            left: x + 'px',
          });
        }

        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }

        element.on('mousedown', function (event) {
          //condition to allow drag only on modal header with id = "modalScroll"
          if (event.target.id == 'modalScroll') {
            // Prevent default dragging of selected content
            event.preventDefault();
            startX = event.screenX - x;
            startY = event.screenY - y;
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
          }
        });
      },
    };
  },
]);

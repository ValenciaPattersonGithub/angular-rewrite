'use strict';

angular.module('common.directives').directive('imageUpload', function () {
  return {
    scope: {
      file: '=',
      previewContainer: '@',
      buttonText: '@',
      maxSize: '@',
    },
    restrict: 'E',
    template:
      '<span class="btn btn-primary btn-file">{{buttonText}}' +
      '<input type="file" id="imageUpload" accept="image/png, image/jpeg, image/bmp, image/jpg" />' +
      '</span>',
    link: function (scope, elem, attrs) {
      scope.validFileType = false;
      var maxThreshold = scope.maxSize ? parseInt(scope.maxSize) : 150;

      // Listen to the change event of the file input
      elem.bind('change', function (changeEvent) {
        if (changeEvent.target.files.length > 0) {
          var reader = scope.processFile(changeEvent);
          if (scope.validFileType) {
            // Read the file
            reader.readAsDataURL(scope.file);
          } else {
            scope.showInvalidFileTypeError();
          }
        }
      });

      scope.processFile = function (changeEvent) {
        var file = changeEvent.target.files[0];
        var fileName = _.toLower(file.name);
        var matches = fileName.match('[a-zA-Z0-9]*.(?=bmp|jpg|jpeg|png)');
        if (matches && matches.length > 0) {
          scope.validFileType = true;
          // Set the variables from the file
          scope.file.name = file.name;
          scope.file.initialSize = file.size;
          // Create the file reader
          var reader = new FileReader();
          reader.onload = function (loadEvent) {
            // Create the image and resize it if needed
            var image = new Image();
            image.onload = function () {
              // Grab the canvas
              var canvas = document.getElementById(scope.previewContainer);
              // Resize the image if it is bigger then 150 height
              if (image.height > maxThreshold) {
                image.width *= maxThreshold / image.height;
                image.height = maxThreshold;
              }
              // Get the context and draw the image
              var ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              canvas.width = image.width;
              canvas.height = image.height;
              ctx.drawImage(image, 0, 0, image.width, image.height);
              // Set the dataURL from the new canvas (save this to the DB)
              scope.$apply(function () {
                scope.file.src = canvas.toDataURL();
                // Putting the original, unaltered src into the file to be used
                scope.file.originalSrc = loadEvent.target.result;
              });
            };
            // Set the image src to the original data URL for preview
            image.src = loadEvent.target.result;
            // Clear the value from the file input
            changeEvent.target.value = '';
          };
          return reader;
        }
      };
    },
    controller: [
      '$scope',
      'localize',
      'toastrFactory',
      function ($scope, localize, toastrFactory) {
        $scope.showInvalidFileTypeError = function () {
          toastrFactory.error(
            localize.getLocalizedString('The selected file type is invalid.'),
            localize.getLocalizedString('Error')
          );
        };
      },
    ],
  };
});

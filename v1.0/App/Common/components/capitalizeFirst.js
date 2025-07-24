angular
  .module('common.directives')
  .directive('capitalizeFirst', [
    '$parse',
    function ($parse) {
      return {
        restrict: 'E',
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
          var capitalize = function (inputValue) {
            if (inputValue === undefined || inputValue == null) {
              inputValue = '';
            }
            var capitalized =
              inputValue.charAt(0).toUpperCase() + inputValue.substring(1);
            if (capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }
            return capitalized;
          };
          modelCtrl.$parsers.push(capitalize);
          capitalize($parse(attrs.ngModel)(scope));
        },
      };
    },
  ])
  .directive('capitalizeFirstWithOverride', [
    '$parse',
    '$timeout',
    function ($parse, $timeout) {
      return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
          // defaults to capitalized on
          scope.capitalizationOn = true;
          // backspace to turn capitalization off
          element.bind('keyup', function (e) {
            if (e.keyCode == '8') {
              $timeout(function () {
                if (scope.capitalizationOn === true) {
                  scope.capitalizationOn = false;
                }
              });
            }
          });
          // reset on blur
          element.bind('blur', function () {
            $timeout(function () {
              if (scope.capitalizationOn === false) {
                scope.capitalizationOn = true;
              }
            });
          });
          // capitalizing the first letter of the first word if capitalizationOn = true
          var capitalize = function (inputValue) {
            if (
              scope.capitalizationOn &&
              inputValue &&
              inputValue.length === 1 &&
              inputValue.charAt(0) !== inputValue.charAt(0).toUpperCase()
            ) {
              var capitalized =
                inputValue.charAt(0).toUpperCase() + inputValue.substring(1);
              if (capitalized !== inputValue) {
                modelCtrl.$setViewValue(capitalized);
                modelCtrl.$render();
              }
              inputValue = capitalized;
            }
            return inputValue;
          };
          //
          modelCtrl.$parsers.push(capitalize);
          capitalize($parse(attrs.ngModel)(scope));
        },
      };
    },
  ]);
/*
    .directive('capitalizeWords', [
        '$parse', function ($parse) {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, modelCtrl) {
                    scope.capitalizationOn = true;
                    // reset on blur
                    element.bind('blur', function () {
                        scope.$apply(function () {
                            scope.capitalizationOn = true;
                        });
                    });
                    // set false on click so that user can override previously entered text
                    //element.on('click', function() {
                    //    scope.capitalizationOn = false;
                    //});
                    element.bind('keyup', function (e) {
                        // backspace to turn capitalization off
                        if (e.keyCode == '8') {
                            scope.$apply(function () {
                                scope.capitalizationOn = false;
                            });
                        }


                        // space bar turns capitalization on
                        // if (e.keyCode == '32') {
                        //   scope.$apply(function() {
                        //       scope.capitalizationOn = true;
                        //   });
                        // }
                    });
                    var capitalize = function (inputValue) {
                        if (inputValue === undefined || inputValue == null) {
                            scope.capitalizationOn = true;
                            inputValue = '';
                        }
                        if (scope.capitalizationOn) {
                            var allWords = inputValue.split(" ");
                            var allWordsCapitalized = [];

                            // only capitalize the last entered word
                            var lastWord = allWords.slice(-1)[0];
                            if (lastWord.length == 1) {
                                lastWord = lastWord.toLowerCase();
                                lastWord = lastWord.charAt(0).toUpperCase() + lastWord.substring(1);
                            }
                            var otherWords = allWords.slice(0, -1);

                            angular.forEach(otherWords, function (eachWord) {
                                allWordsCapitalized.push(eachWord);
                            });
                            allWordsCapitalized.push(lastWord);
                            //if (eachWord.length == 1) {
                            //    eachWord = eachWord.toLowerCase();
                            //    eachWord = eachWord.charAt(0).toUpperCase() + eachWord.substring(1);
                            //    allWordsCapitalized.push(eachWord);
                            //} else {
                            //    eachWord = eachWord;
                            //    allWordsCapitalized.push(eachWord);
                            //}
                            //});
                            var capitalizedAll = allWordsCapitalized.join(" ");
                            if (capitalizedAll !== inputValue) {
                                modelCtrl.$setViewValue(capitalizedAll);
                                modelCtrl.$render();
                            }
                            return capitalizedAll;
                        } else {
                            return inputValue;
                        }
                    }
                    modelCtrl.$parsers.push(capitalize);
                    capitalize($parse(attrs.ngModel)(scope));
                }
            };
        }
    ]);
    */

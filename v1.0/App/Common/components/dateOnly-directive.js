'use strict';

angular.module('common.directives').directive('dateOnly', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr, ctrl) {
      $(elem).keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter
        if (
          $.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
          // Allow: Ctrl+A
          (e.keyCode === 65 && e.ctrlKey === true) ||
          // Allow: home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39)
        ) {
          // let it happen, don't do anything
          return;
        }

        // Ensure that it is a number and stop the keypress
        if (
          (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
          (e.keyCode < 96 || e.keyCode > 105)
        ) {
          e.preventDefault();
        }

        // If "Divide" and "Forward Slash" do some special processing
        if (e.keyCode === 111 || e.keyCode === 191) {
          var dateParts = e.target.value.split('/');
          var rebuild = false;

          if (
            typeof dateParts[0] !== 'undefined' &&
            dateParts[0].length === 1
          ) {
            var month = parseInt(dateParts[0]);
            if (month > 0 && month < 10) {
              dateParts[0] = '0' + month;
              rebuild = true;
            }
          }

          if (
            typeof dateParts[1] !== 'undefined' &&
            dateParts[1].length === 1
          ) {
            var day = parseInt(dateParts[1]);
            if (day > 0 && day < 10) {
              dateParts[1] = '0' + day;
              rebuild = true;
            }
          }

          if (rebuild) {
            e.target.value = '';
            for (var i = 0; i < dateParts.length; i++) {
              e.target.value = e.target.value + dateParts[i];
              if (i < 2) {
                e.target.value += '/';
              }
            }
          }
        }

        // Automatically place the /'s
        if (
          (e.target.value.length === 2 &&
            e.target.value.split('/').length === 1) ||
          (e.target.value.length === 5 &&
            e.target.value.split('/').length === 2)
        ) {
          e.target.value += '/';
        }
      });
    },
  };
});
